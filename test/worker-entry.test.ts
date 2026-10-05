// Run: npm run test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';
// The entry imports the built Astro worker; test only the pure path function.
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../worker-entry.mjs', import.meta.url), 'utf8').replace(/^import astro.*$/m, 'const astro = {};');
const { canonicalPath } = await import('data:text/javascript,' + encodeURIComponent(src));

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
