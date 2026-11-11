// Run: npm run test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';
// The entry imports the built Astro worker; test only the pure path function.
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../worker-entry.mjs', import.meta.url), 'utf8').replace(/^import \{ handle \}.*$/m, "const handle = () => { throw new Error('app reached'); };");
const { canonicalPath, redirectTarget, parseRange, SECURITY_HEADERS, default: worker } = await import('data:text/javascript,' + encodeURIComponent(src));

test('trailing slash is dropped (301 target), root stays', () => {
  assert.equal(canonicalPath('/about/'), '/about');
  assert.equal(canonicalPath('/insights/what-happens-in-a-qhht-session/'), '/insights/what-happens-in-a-qhht-session');
  assert.equal(canonicalPath('/book//'), '/book');
  assert.equal(canonicalPath('/'), null);
});

test('.html and index.html addresses collapse to the clean URL', () => {
  assert.equal(canonicalPath('/about.html'), '/about');
  assert.equal(canonicalPath('/index.html'), '/');
  assert.equal(canonicalPath('/insights/index.html'), '/insights');
});

test('clean URLs, assets and APIs are left alone; legacy guide link redirects', () => {
  for (const p of ['/about', '/book', '/insights/x', '/dodie-kendall-prep-guide.pdf', '/api/lead-magnet', '/_astro/a.js']) {
    assert.equal(canonicalPath(p), null, p);
  }
  assert.equal(canonicalPath('/QHHT-Subject-Preparation-Guide-1.pdf'), '/dodie/qhht-pre-session-prep-guide.pdf');
});

test('http is always sent to https, in one hop with the canonical path', () => {
  assert.equal(redirectTarget('http://dodiekendall.com/'), 'https://dodiekendall.com/');
  assert.equal(redirectTarget('http://dodiekendall.com/about'), 'https://dodiekendall.com/about');
  assert.equal(redirectTarget('http://dodiekendall.com/about/?utm_source=fb'), 'https://dodiekendall.com/about?utm_source=fb');
  assert.equal(redirectTarget('https://dodiekendall.com/about'), null);
  assert.equal(redirectTarget('https://dodiekendall.com/book/'), 'https://dodiekendall.com/book');
  assert.equal(redirectTarget('http://localhost:8787/about'), null, 'local dev stays on http');
});

test('HSTS never covers subdomains (GHL email links use them) and is not preloaded', () => {
  const hsts = SECURITY_HEADERS['Strict-Transport-Security'];
  assert.match(hsts, /max-age=\d+/);
  assert.equal(/includeSubDomains|preload/i.test(hsts), false);
});

test('preview Worker: noindex everywhere, robots blocks all, API never reaches the app', async () => {
  const env = { SITE_PREVIEW: '1' };
  const api = await worker.fetch(new Request('https://p.example/api/quiz', { method: 'POST', body: '{}' }), env, {});
  assert.equal(api.status, 200);
  assert.equal((await api.json()).reason, 'preview');
  assert.equal(api.headers.get('X-Robots-Tag'), 'noindex, nofollow');
  const robots = await worker.fetch(new Request('https://p.example/robots.txt'), env, {});
  assert.match(await robots.text(), /Disallow: \//);
  const redirect = await worker.fetch(new Request('https://p.example/about/'), env, {});
  assert.equal(redirect.status, 301);
  assert.equal(redirect.headers.get('X-Robots-Tag'), 'noindex, nofollow');
});

test('preview Worker: encoded, doubled-slash and non-read requests never reach the app', async () => {
  const env = { SITE_PREVIEW: '1' };
  const paths = ['/%61pi/quiz', '/%2561pi/quiz', '//api/quiz', '/API/contact', '/api', '/api/', '/%5Capi/quiz', '/%E0%A4%A'];
  for (const p of paths) {
    const r = await worker.fetch(new Request('https://p.example' + p), env, {});
    assert.equal((await r.json()).reason, 'preview', p);
  }
  for (const method of ['POST', 'PUT', 'DELETE']) {
    const r = await worker.fetch(new Request('https://p.example/about', { method, body: method === 'DELETE' ? null : 'x' }), env, {});
    assert.equal((await r.json()).reason, 'preview', method);
  }
  const head = await worker.fetch(new Request('https://p.example/api/videos.json', { method: 'HEAD' }), env, {});
  assert.equal(head.headers.get('X-Robots-Tag'), 'noindex, nofollow');
});

test('videos answer byte ranges with 206 (iPhone Safari will not play without it)', async () => {
  assert.deepEqual(parseRange('bytes=0-1', 10), [0, 1]);
  assert.deepEqual(parseRange('bytes=4-', 10), [4, 9]);
  assert.deepEqual(parseRange('bytes=-3', 10), [7, 9]);
  assert.deepEqual(parseRange('bytes=2-99', 10), [2, 9]);
  assert.equal(parseRange('bytes=10-', 10), 'invalid');
  assert.equal(parseRange('bytes=5-2', 10), 'invalid');
  assert.equal(parseRange(null, 10), null);
  assert.equal(parseRange('bytes=0-1,4-5', 10), null);

  let conditional: string | null = null;
  const env = { ASSETS: { fetch: async (r: Request) => {
    conditional = r.headers.get('If-None-Match') ?? conditional;
    assert.equal(r.headers.get('Range'), null);
    return new Response('0123456789', { headers: { 'Content-Type': 'video/mp4', ETag: '"v2"' } });
  } } };
  const get = (h: Record<string, string> = {}, method = 'GET') => worker.fetch(new Request('https://dodiekendall.com/video/a.mp4', { method, headers: h }), env, {});
  const part = await get({ Range: 'bytes=2-5' });
  assert.equal(part.status, 206);
  assert.equal(part.headers.get('Content-Range'), 'bytes 2-5/10');
  assert.equal(part.headers.get('Content-Type'), 'video/mp4');
  assert.equal(await part.text(), '2345');
  assert.equal(await (await get({ Range: 'bytes=-3' })).text(), '789');
  const whole = await get();
  assert.equal(whole.status, 200);
  assert.equal(whole.headers.get('Accept-Ranges'), 'bytes');
  assert.equal(await whole.text(), '0123456789');
  assert.equal((await get({ Range: 'bytes=50-' })).status, 416);
  const head = await get({ Range: 'bytes=0-3' }, 'HEAD');
  assert.equal(head.status, 206);
  assert.equal(head.headers.get('Content-Length'), '4');
  assert.equal(await head.text(), '');
  // If-Range: same file resumes; a replaced file is sent whole, never stitched.
  assert.equal((await get({ Range: 'bytes=2-5', 'If-Range': '"v2"' })).status, 206);
  const stale = await get({ Range: 'bytes=2-5', 'If-Range': '"v1"' });
  assert.equal(stale.status, 200);
  assert.equal(await stale.text(), '0123456789');
  await get({ 'If-None-Match': '"v2"' });
  assert.equal(conditional, '"v2"', 'cache validators still reach the asset store');
});
