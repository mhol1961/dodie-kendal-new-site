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
      filter: (page) =>
        !page.includes('/api/') &&
        !page.includes('/admin/') &&
        !page.endsWith('/design') &&
        // noindex paid-traffic landing pages — keep them out of the sitemap
        !page.includes('/landing-page-'),
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
