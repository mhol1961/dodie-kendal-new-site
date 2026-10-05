// Worker entry (wrangler.toml `main`): canonical-URL redirects and security
// headers, then the Astro app.
//
// Why here: run_worker_first sends every request through the Worker, and the Astro
// adapter serves static pages via ASSETS.fetch, which follows _redirects internally
// (the browser saw 200, never a 301). So permanent redirects must be issued before
// handing off to Astro. Site rules: https only, one URL per page, NO trailing slash.
import astro from './dist/_worker.js/index.js';

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

function withSecurityHeaders(response) {
  const res = new Response(response.body, response); // responses from ASSETS are immutable
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    if (!res.headers.has(k)) res.headers.set(k, v);
  }
  return res;
}

export default {
  async fetch(request, env, ctx) {
    const isRead = request.method === 'GET' || request.method === 'HEAD';
    const to = redirectTarget(request.url);
    // http -> https applies to every method's URL, but only reads are redirected
    // (a 301 on a POST would drop the body); http POSTs are refused instead.
    if (to && isRead) return withSecurityHeaders(Response.redirect(to, 301));
    if (to && new URL(request.url).protocol === 'http:') {
      return new Response('Please use https://dodiekendall.com', { status: 403 });
    }
    return withSecurityHeaders(await astro.fetch(request, env, ctx));
  },
};
