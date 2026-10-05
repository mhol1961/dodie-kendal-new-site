// Worker entry (wrangler.toml `main`): canonical-URL redirects, then the Astro app.
//
// Why here: run_worker_first sends every request through the Worker, and the Astro
// adapter serves static pages via ASSETS.fetch, which follows _redirects internally
// (the browser saw 200, never a 301). So permanent redirects must be issued before
// handing off to Astro. Site rule: one URL per page, NO trailing slash.
import astro from './dist/_worker.js/index.js';

// Old URLs linked from emails already sent (was public/_redirects).
const LEGACY = {
  '/QHHT-Subject-Preparation-Guide-1.pdf': '/dodie/qhht-pre-session-prep-guide.pdf',
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

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'GET' || request.method === 'HEAD') {
      const url = new URL(request.url);
      const to = canonicalPath(url.pathname);
      if (to) {
        url.pathname = to;
        return Response.redirect(url.toString(), 301);
      }
    }
    return astro.fetch(request, env, ctx);
  },
};
