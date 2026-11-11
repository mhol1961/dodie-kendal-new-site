// Worker entry (wrangler.toml `main`, bundled by the adapter's Vite build into
// dist/server): canonical-URL redirects and security headers, then the Astro app.
//
// Why here: run_worker_first sends every request through the Worker, and the Astro
// adapter serves static pages via ASSETS.fetch, which follows _redirects internally
// (the browser saw 200, never a 301). So permanent redirects must be issued before
// handing off to Astro. Site rules: https only, one URL per page, NO trailing slash.
import { handle } from '@astrojs/cloudflare/handler';

// Old URLs linked from emails already sent (was public/_redirects).
const LEGACY = {
  '/QHHT-Subject-Preparation-Guide-1.pdf': '/dodie/qhht-pre-session-prep-guide.pdf',
  '/sitemap.xml': '/sitemap-index.xml',
  // Old default share image (blank); social sites cached this URL.
  '/og-image.jpg': '/og/default.jpg',
};

// Standard hardening that can't break the third-party embeds (GHL calendars/forms/
// chat, Turnstile, YouTube, Cloudflare analytics). A full script/frame allowlist CSP
// is deliberately NOT enforced: GHL widgets load from many hosts and change them.
// HSTS has no includeSubDomains/preload: GHL uses subdomains of this domain
// (email link tracking) that must not be forced onto https by us.
export const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=15552000',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), geolocation=(), usb=(), interest-cohort=()',
  'Content-Security-Policy': "frame-ancestors 'self'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests",
};

/** Path to 301 to, or null. Pure; tested in test/worker-entry.test.ts. */
export function canonicalPath(pathname) {
  if (LEGACY[pathname]) return LEGACY[pathname];
  let p = pathname;
  if (p.endsWith('/index.html')) p = p.slice(0, -'index.html'.length);
  else if (p.endsWith('.html')) p = p.slice(0, -'.html'.length);
  if (p.length > 1 && p.endsWith('/')) p = p.replace(/\/+$/, '') || '/';
  return p === pathname ? null : p;
}

/** The https/canonical URL to 301 to, or null. Pure; tested. */
export function redirectTarget(href) {
  const url = new URL(href);
  const isHttp = url.protocol === 'http:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1';
  const path = canonicalPath(url.pathname);
  if (!isHttp && !path) return null;
  if (isHttp) url.protocol = 'https:';
  if (path) url.pathname = path;
  return url.toString();
}

/** [start, end] (inclusive) for a single `bytes=` range, 'invalid' when it can't be
 *  satisfied, or null when there is no usable Range header. Pure; tested. */
export function parseRange(header, size) {
  const m = /^bytes=(\d*)-(\d*)$/.exec(header ?? '');
  if (!m || (!m[1] && !m[2])) return null;
  let start = m[1] ? Number(m[1]) : Math.max(0, size - Number(m[2]));
  let end = m[1] && m[2] ? Math.min(Number(m[2]), size - 1) : size - 1;
  if (!m[1] && Number(m[2]) === 0) return 'invalid';
  return start > end || start >= size ? 'invalid' : [start, end];
}

// Byte ranges for /video/*. iPhone Safari will not play (or seek) a video unless the
// server answers Range requests with 206, and neither the Astro handler (it fetches
// assets by URL, dropping the header) nor the ASSETS binding does that.
// ponytail: buffers the whole file per range request (fine up to the 25 MiB asset
// limit); move videos to R2 or Cloudflare Stream if they get bigger or busier.
async function serveVideo(request, env) {
  const asset = await env.ASSETS.fetch(new Request(request.url));
  if (asset.status !== 200) return asset;
  const headers = new Headers(asset.headers);
  headers.set('Accept-Ranges', 'bytes');
  const wanted = request.headers.get('Range');
  if (!wanted) return new Response(asset.body, { status: 200, headers });
  // The binding gives no Content-Length inside the Worker, so measure the file.
  const file = await asset.arrayBuffer();
  const size = file.byteLength;
  const range = parseRange(wanted, size);
  if (!range) return new Response(file, { status: 200, headers });
  if (range === 'invalid') {
    headers.set('Content-Range', `bytes */${size}`);
    headers.delete('Content-Length');
    return new Response(null, { status: 416, headers });
  }
  const [start, end] = range;
  headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
  headers.set('Content-Length', String(end - start + 1));
  return new Response(request.method === 'HEAD' ? null : file.slice(start, end + 1), { status: 206, headers });
}

function withSecurityHeaders(response) {
  const res = new Response(response.body, response); // responses from ASSETS are immutable
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    if (!res.headers.has(k)) res.headers.set(k, v);
  }
  return res;
}

// Private preview Worker only (SITE_PREVIEW=1, set by scripts/deploy-preview.sh):
// nothing indexed, and no form or API call reaches GHL. Forms get a harmless
// "saved" reply so the thank-you screens can be reviewed.
// Fails closed: every non-read, and any path that decodes (however many times) to
// /api, gets the stub, so encoded or doubled-slash paths can't reach the app's API.
function previewOnly(request) {
  const stub = () => Response.json({ ok: true, captured: true, emailed: false, reason: 'preview' });
  let p = new URL(request.url).pathname;
  for (let i = 0; ; i++) {
    let d;
    try { d = decodeURIComponent(p); } catch { return stub(); }
    if (d === p) break;
    if (i === 5) return stub();
    p = d;
  }
  p = p.replace(/[\\/]+/g, '/').toLowerCase();
  if (p === '/robots.txt') return new Response('User-agent: *\nDisallow: /\n');
  const isRead = request.method === 'GET' || request.method === 'HEAD';
  if (!isRead || p === '/api' || p.startsWith('/api/')) return stub();
  return null;
}

export default {
  async fetch(request, env, ctx) {
    if (env.SITE_PREVIEW !== '1') return route(request, env, ctx);
    const res = previewOnly(request);
    const out = res ? withSecurityHeaders(res) : await route(request, env, ctx);
    out.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return out;
  },
};

async function route(request, env, ctx) {
  const isRead = request.method === 'GET' || request.method === 'HEAD';
  const to = redirectTarget(request.url);
  // http -> https applies to every method's URL, but only reads are redirected
  // (a 301 on a POST would drop the body); http POSTs are refused instead.
  if (to && isRead) return withSecurityHeaders(Response.redirect(to, 301));
  if (to && new URL(request.url).protocol === 'http:') {
    return withSecurityHeaders(new Response('Please use https://dodiekendall.com', { status: 403 }));
  }
  if (isRead && new URL(request.url).pathname.startsWith('/video/')) {
    return withSecurityHeaders(await serveVideo(request, env));
  }
  return withSecurityHeaders(await handle(request, env, ctx));
}
