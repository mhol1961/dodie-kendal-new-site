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

// `?.` so the unit tests can import this under plain Node (no import.meta.env there).
const SITE_URL = import.meta.env?.SITE_URL || 'https://dodiekendall.com';
const BRAND = 'Dodie Kendall QHHT';
const DEFAULT_DESCRIPTION =
  'A deeply respectful conversation with your Subconscious. Quantum Healing Hypnosis (QHHT) with Dodie Kendall, in person at her studio in Stuart, FL.';
// Built at build time by src/pages/og/default.jpg.ts (photo, name, location).
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og/default.jpg`;
const MAX_TITLE = 60;
const MAX_DESCRIPTION = 160;

interface SeoOptions {
  path: string;
  title?: string;
  /** Use this exact <title> (no brand suffix, no truncation). For titles written
   *  deliberately for search, e.g. from an SEO audit. */
  exactTitle?: string;
  description?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noIndex?: boolean;
}

/** `title · BRAND` when it fits in 60 characters, else the bare title. Never cuts words. */
export function pageTitle(title?: string): string {
  if (!title) return `${BRAND} · Quantum Healing Hypnosis in Stuart, FL`;
  const full = `${title} · ${BRAND}`;
  return full.length > MAX_TITLE ? title : full;
}

export function getSeo(opts: SeoOptions): PageSeo {
  const description = opts.description ?? DEFAULT_DESCRIPTION;
  if (description.length > MAX_DESCRIPTION) {
    const msg = `[seo] ${opts.path}: description is ${description.length} chars (max ${MAX_DESCRIPTION}). Rewrite it; it is never truncated.`;
    // Fail the build (prerendered pages) and dev. On the live Worker (SSR pages
    // like /book) log instead, so a long description can't 500 the page.
    if (globalThis.navigator?.userAgent === 'Cloudflare-Workers') console.error(msg);
    else throw new Error(msg);
  }
  return {
    title: opts.exactTitle ?? pageTitle(opts.title),
    description,
    canonical: `${SITE_URL}${opts.path}`,
    ogImage: opts.ogImage ?? DEFAULT_OG_IMAGE,
    ogType: opts.ogType ?? 'website',
    noIndex: opts.noIndex,
  };
}
