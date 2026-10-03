// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL || 'https://dodiekendall.com',
  output: 'hybrid', // static by default; SSR for the /api/* endpoints
  adapter: cloudflare({
    platformProxy: { enabled: true },
  }),
  integrations: [
    tailwind({ applyBaseStyles: false }), // we manage base styles in src/styles/global.css
    sitemap({
      // Match on the pathname: sitemap URLs end in a slash, so endsWith('/design')
      // never matched. Keeps API, admin, the design page and the noindex
      // paid-traffic landing pages (incl. /free-guide) out of the sitemap.
      // CLAUDE: plugin note files that land in src/pages (also stripped from dist).
      filter: (page) => {
        const path = new URL(page).pathname;
        return !/^\/(api|admin|design|free-guide|landing-page-[^/]+)(\/|$)/.test(path) && !/(^|\/)CLAUDE(\/|$)/.test(path);
      },
      changefreq: 'weekly',
      priority: 0.7,
    }),
  ],
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    ssr: {
      noExternal: ['@astrojs/*'],
    },
  },
});
