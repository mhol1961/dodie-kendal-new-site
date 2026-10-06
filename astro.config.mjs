// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import { lastmodFor } from './scripts/sitemap-lastmod.mjs';

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL || 'https://dodiekendall.com',
  // Static by default; routes with `export const prerender = false` (/book, /404,
  // /api/*) render on demand in the Worker.
  // One URL per page, no trailing slash (SEO audit 2026-10-05). Pages build as
  // about.html, served at /about; worker-entry.mjs 301s /about/ -> /about.
  trailingSlash: 'never',
  adapter: cloudflare({
    // The /og/* share images use sharp + fonts on disk at build time (Node only).
    prerenderEnvironment: 'node',
    // No astro:assets images; 'passthrough' also avoids an auto-added IMAGES binding.
    imageService: 'passthrough',
  }),
  // No Astro sessions; without this the adapter adds (and deploy provisions) a SESSION KV namespace.
  session: false,
  // Tailwind runs through PostCSS (postcss.config.mjs); base styles live in src/styles/global.css.
  integrations: [
    sitemap({
      // Match on the pathname: sitemap URLs end in a slash, so endsWith('/design')
      // never matched. Keeps API, admin, the design page and the noindex
      // paid-traffic landing pages (incl. /free-guide) out of the sitemap.
      // CLAUDE: plugin note files that land in src/pages (also stripped from dist).
      filter: (page) => {
        const path = new URL(page).pathname;
        return !/^\/(api|admin|design|free-guide|landing-page-[^/]+)(\/|$)/.test(path) && !/(^|\/)CLAUDE(\/|$)/.test(path);
      },
      // lastmod: post updatedDate ?? pubDate, else the page file's last commit.
      serialize: (item) => ({ ...item, lastmod: lastmodFor(item.url) }),
    }),
  ],
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
    format: 'file',
  },
  vite: {
    ssr: {
      noExternal: ['@astrojs/*'],
    },
  },
});
