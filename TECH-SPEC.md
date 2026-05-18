# TECH-SPEC — dodiekendall.com

> Technical specification for the Astro + Tailwind + shadcn/ui rebuild.
> Pair with `PRD.md` (what) and `BUILD-PROMPTS.md` (how, sequenced).

---

## 1. Stack summary

| Layer | Choice | Rationale |
| --- | --- | --- |
| Framework | **Astro 4.x** | Static-first, zero-JS by default, content-collection-aware, easy to add SSR islands for forms. Beats Next.js for a 7-page brochure + blog. |
| Renderer / islands | Astro components; Solid or Preact islands only where interactive | Keeps payload under ~30KB JS for most pages. |
| Styling | **Tailwind CSS 3.x** | Token-driven, fast to iterate, aligns with `DESIGN.md` token system. |
| Components | Hand-curated subset of **shadcn/ui** (ported to Astro) | Quality primitives without dragging in a full UI library. |
| Type checking | TypeScript (strict) | Catches schema mismatches between form payloads and GHL API contracts. |
| Content | Astro Content Collections (Markdown/MDX) | Blog + testimonials + FAQ live in `src/content/`. Type-safe. |
| Forms | Astro server endpoints in `/src/pages/api/` | Server-side POST handlers; no client SDK leaked. |
| Booking | GHL calendar iframe wrapped in `BookingEmbed.astro` | Preserves Dodie's existing 5-hour / $300 / $50-deposit flow. |
| Hosting | **Cloudflare Pages** (primary) | Free tier; great DX; native edge functions if needed. (Vercel is the documented fallback in ADR-001.) |
| DNS | Cloudflare | Owns the zone; CNAME flattening for apex. |
| Analytics | Plausible (cloud) | Privacy-first; no cookie banner needed. |
| Search + monitoring | Google Search Console, Bing Webmaster, Lighthouse CI | Standard SEO baseline. |
| Email delivery | GHL workflow (lead magnet PDF + booking confirmations) | Client owns this. |

## 2. Directory layout

See `CLAUDE.md` §4 for the full tree. Highlights:

- `src/pages/` — file-based routing.
- `src/pages/api/contact.ts`, `src/pages/api/lead-magnet.ts` — server endpoints.
- `src/components/` — Astro components, including `ui/` shadcn-style primitives.
- `src/content/` — content collections (`insights/`, `testimonials/`).
- `src/lib/ghl.ts` — GHL API client (server-only).
- `src/lib/schema.ts` — JSON-LD helpers.
- `src/lib/seo.ts` — per-page SEO defaults.
- `src/styles/global.css` — Tailwind layer + custom CSS variables synced from `DESIGN.md`.

## 3. Routing

| Route | Type | Notes |
| --- | --- | --- |
| `/` | static | prerendered |
| `/about` | static | prerendered |
| `/qhht` | static | prerendered |
| `/book` | static | iframe embed of GHL calendar; no SSR needed |
| `/contact` | static page + `/api/contact` endpoint (SSR) | Form action posts to `/api/contact` |
| `/faq` | static | sourced from `src/content/faq.md` or `src/content/faq/` collection |
| `/insights` | static | content-collection-driven |
| `/insights/[slug]` | static | one page per markdown file |
| `/privacy` | static | |
| `/terms` | static | |
| `/sitemap.xml` | static (Astro integration) | auto-generated from routes |
| `/rss.xml` | static (Astro RSS integration) | for `/insights` |
| `/api/contact` | server endpoint | POST → GHL Contact API |
| `/api/lead-magnet` | server endpoint | POST → GHL + trigger workflow |
| `/api/health` | server endpoint | uptime ping |

## 4. Content collections

Schema in `src/content/config.ts`:

```ts
import { defineCollection, z } from 'astro:content';

const insights = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string().max(160),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    heroImage: image().optional(),
    heroAlt: z.string().optional(),
    tags: z.array(z.string()).default([]),
    canonical: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
});

const testimonials = defineCollection({
  type: 'data',
  schema: ({ image }) => z.object({
    quote: z.string(),
    author: z.string(),
    location: z.string().optional(),
    role: z.string().optional(),
    avatar: image().optional(),
    order: z.number().default(0),
    featured: z.boolean().default(false),
  }),
});

const faq = defineCollection({
  type: 'data',
  schema: z.object({
    category: z.enum(['sessions', 'logistics', 'practice', 'aftercare']),
    question: z.string(),
    answer: z.string(),
    order: z.number().default(0),
  }),
});

export const collections = { insights, testimonials, faq };
```

## 5. Form schemas

### Contact form (`/api/contact`)

```ts
const contactPayloadSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(7).max(20).optional(),
  message: z.string().min(10).max(2000),
  consentMarketing: z.boolean().default(false),
  consentTransactional: z.literal(true),  // required for booking-related comms
  // Honeypot
  website: z.string().max(0).optional(),
  // Submitted at (server-fills)
});
```

### Lead-magnet (`/api/lead-magnet`)

```ts
const leadMagnetPayloadSchema = z.object({
  firstName: z.string().min(1).max(80),
  email: z.string().email(),
  consentMarketing: z.literal(true),
  website: z.string().max(0).optional(),  // honeypot
});
```

### Validation behavior
- All inputs validated server-side with `zod`.
- Client-side validation duplicates rules for UX but is never trusted.
- On validation failure: HTTP 422, JSON `{ errors: [...] }`.
- On GHL failure: HTTP 502 + a fallback email to `dodiekendall@gmail.com` (via Resend or similar — TBD per `ENV.md`).

## 6. GHL integration

Full detail in `GHL-INTEGRATION.md`. Summary:

- **Auth:** Dodie's private integration token, stored as `GHL_PRIVATE_INTEGRATION_TOKEN` env var (her credentials, not the agency's).
- **Endpoints used:**
  - `POST /contacts/` — create or upsert.
  - `POST /contacts/{contactId}/tags` — apply source tag.
  - `POST /contacts/{contactId}/workflow/{workflowId}` — kick the lead-magnet nurture or the contact-form auto-responder.
- **Calendar:** the existing calendar is embedded via iframe; we do not call calendar APIs from the build.
- **Rate limits & retries:** server endpoints retry once on 5xx with 500ms backoff; fail open to the fallback email if both attempts fail.

## 7. SEO baseline

See `SEO-PLAN.md`, `KEYWORDS.md`, `SCHEMA.md` for full strategy. Tech-spec essentials:

- Every page has `<title>`, `<meta name="description">`, canonical, Open Graph + Twitter Card.
- Schema.org JSON-LD per page type (`Person`, `LocalBusiness`, `Service`, `FAQPage`, `BlogPosting`).
- `sitemap.xml` and `rss.xml` auto-generated.
- `robots.txt` allows all, points to sitemap.
- Image alt text required (Astro Content Collections enforce via schema).
- `prefers-reduced-motion` respected in any motion component.
- AI-visibility: every key page has an "Answer Capsule" — a 2–4 sentence direct-answer block near the top that LLMs can lift.

## 8. Hosting & DNS plan

- Apex `dodiekendall.com` → Cloudflare Pages project.
- `www.dodiekendall.com` → 301 redirect to apex.
- SSL: Cloudflare Universal SSL (Full strict).
- Caching: Cloudflare default for static assets; HTML revalidation on deploy.
- DNS cutover ritual in `LAUNCH-CHECKLIST.md`.

## 9. Performance budget

| Metric | Budget |
| --- | --- |
| LCP | ≤ 2.0s on Moto G Power 4G |
| INP | ≤ 100ms |
| CLS | ≤ 0.05 |
| Total JS (gzipped) | ≤ 30KB on most pages, ≤ 80KB on form pages |
| Hero image | WebP/AVIF, ≤ 100KB |
| Above-the-fold render | no blocking third-party scripts |

## 10. Security & privacy

- No third-party scripts above the fold.
- Form endpoints rate-limited at the CF edge (10 req/min/IP).
- Honeypot field on every form.
- `Content-Security-Policy`, `Strict-Transport-Security`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` headers configured.
- No third-party fonts CDN (self-host both display and body faces).
- See `PRIVACY-NOTES.md` for data-flow notes.

## 11. Browser support

- Last 2 versions of Chrome, Edge, Safari, Firefox.
- iOS Safari 15+.
- Graceful degradation on older browsers (the static HTML still works without modern CSS).

## 12. Testing

- Lighthouse CI on PR (Performance ≥ 95, SEO/A11y/BP = 100).
- Manual a11y pass with NVDA (Windows) + VoiceOver (macOS) on `/`, `/about`, `/book`, `/contact`, `/faq` before launch.
- Form smoke tests against a GHL sandbox subaccount before pointing at production.

## 13. Open technical decisions

- **Email fallback service** (Resend vs. Postmark vs. GHL's own email): see `ENV.md` and the upcoming ADR-003.
- **shadcn-to-Astro porting strategy:** custom port vs. `astro-shadcn` package — to be decided in build phase.
- **Image pipeline:** Astro's `<Image />` is fine; consider adding `astro-imagetools` if responsive art-direction is needed.

---

*Last updated: 2026-05-17.*
