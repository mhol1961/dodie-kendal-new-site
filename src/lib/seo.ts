// SEO defaults and per-page overrides. See SEO-PLAN.md.
//
// Usage in a page:
//   ---
//   import Base from '@layouts/Base.astro';
//   import { getSeo } from '@lib/seo';
//   const seo = getSeo({ path: '/about', title: 'About Dodie Kendall' });
//   ---
//   <Base seo={seo}>...</Base>

export interface PageSeo {
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
  ogType: 'website' | 'article';
  noIndex?: boolean;
}

const SITE_URL = import.meta.env.SITE_URL || 'https://dodiekendall.com';
const BRAND = 'Dodie Kendall QHHT';
const DEFAULT_DESCRIPTION =
  'A 5-hour, deeply respectful conversation with your Subconscious. Quantum Healing Hypnosis Technique sessions with Dodie Kendall in Stuart, Florida.';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

interface SeoOptions {
  path: string;
  title?: string;
  description?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noIndex?: boolean;
}

export function getSeo(opts: SeoOptions): PageSeo {
  const fullTitle = opts.title
    ? `${opts.title} · ${BRAND}`
    : `${BRAND} · Quantum Healing Hypnosis in Stuart, FL`;
  return {
    title: fullTitle.length > 60 ? fullTitle.slice(0, 57) + '…' : fullTitle,
    description: (opts.description ?? DEFAULT_DESCRIPTION).slice(0, 155),
    canonical: `${SITE_URL}${opts.path}`,
    ogImage: opts.ogImage ?? DEFAULT_OG_IMAGE,
    ogType: opts.ogType ?? 'website',
    noIndex: opts.noIndex,
  };
}
