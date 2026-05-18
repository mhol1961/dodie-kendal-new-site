# BUILD-PROMPTS — dodiekendall.com

> Sequential prompts that drive the build, phase by phase. Each prompt is self-contained and references the canonical doc for context.
> Run these from Claude Code (host) or Cowork, invoking the named skills.

---

## How to use this file

- Run prompts **in order**. Each phase depends on the prior phase being complete.
- Before running, ensure the repo is at a clean state on `main` (no uncommitted work).
- After each prompt, commit with a Conventional Commits message (`feat(phase-1): scaffold Astro project`).
- After any phase that produces visuals, run the **self-critique trio**: `design-critique` → `brand-review` → `accessibility-review`.

---

## Phase 0 — Doc suite scaffold ✅ (done in kickoff)

Already executed in the kickoff session. Tier 1 docs have full content; Tier 2 docs are stubbed.

---

## Phase 1 — Astro project scaffold

**Prompt:**

> Read `CLAUDE.md` and `TECH-SPEC.md`. Initialize an Astro 4 project at the repo root with TypeScript (strict), Tailwind, and the Cloudflare Pages adapter. Add the directory layout exactly as documented in `CLAUDE.md` §4 — including empty placeholder files for every component and page route listed. Wire `astro.config.mjs` with the sitemap and RSS integrations. Wire `tailwind.config.mjs` to read tokens from `DESIGN.md` (color scale via oklch, fonts, radii, spacing rhythm, breakpoints). Self-host both font families (Cormorant Garamond display, Inter Variable body) under `/public/fonts/` with `font-display: swap`. Confirm the dev server runs locally and the homepage renders a blank `<Base />`-wrapped page.

**Acceptance:** `npm run dev` serves on `:4321`; `npm run build` produces a `dist/` with no errors; Lighthouse on the empty page hits 100s.

---

## Phase 2 — Design system (tokens + primitives)

**Prompt:**

> Invoke `ui-ux-cro-master` and `design-md`. Convert `DESIGN.md` token frontmatter into:
> 1. CSS custom properties in `src/styles/global.css` under `:root`.
> 2. Tailwind `theme.extend` entries in `tailwind.config.mjs` referencing those custom properties.
>
> Build the shadcn-style primitives in `src/components/ui/`: `Button.astro` (variants: primary, secondary, ghost), `Input.astro`, `Card.astro`, `Badge.astro`, `Accordion.astro`. Each primitive must:
> - Pass WCAG 2.1 AA contrast against the documented color tokens.
> - Have a focus-visible ring using `--brand-primary` at 0.2 alpha.
> - Respect `prefers-reduced-motion`.
>
> Build a `/design` route (gated by `import.meta.env.DEV`) that renders every primitive in every state. Run `design-critique` and `accessibility-review` on the rendered `/design` page before declaring this phase done.

**Acceptance:** `/design` route shows every primitive; self-critique trio (in dev mode) returns no AA failures.

---

## Phase 3 — Layout primitives (Header, Footer, Base)

**Prompt:**

> Build `Base.astro` layout in `src/layouts/`: SEO defaults from `src/lib/seo.ts`, font preloads, schema.org defaults from `src/lib/schema.ts`, Plausible analytics tag (gated on a config flag).
>
> Build `Header.astro`: logo lockup (image + wordmark) on the left, nav (Home / About / QHHT / FAQ / Insights / Contact) center-right, primary CTA "Book a Session" on the right. Sticky with `backdrop-blur-md bg-base/80` once `scrollY > 12px`. Mobile = hamburger → full-screen overlay menu.
>
> Build `Footer.astro` per `DESIGN.md` §Layout: 4 columns on `md+`, 1 column on mobile. Include Privacy + Terms links and the "Not medical advice" footnote.
>
> Run the self-critique trio. Test the mobile menu with keyboard only.

**Acceptance:** every page wraps in `Base`; header scroll behavior verified on a 100vh test page; mobile menu keyboard-traversable.

---

## Phase 4 — Home page

**Prompt:**

> Build `src/pages/index.astro`. Sections (from `PRD.md` §7):
> 1. **Hero** (`Hero.astro` variant `home`) — split asymmetric. Left = display headline + subhead + primary CTA "Book a Session" + secondary CTA "Read Dodie's Story." Right = portrait of Dodie inside a pill-shaped mask. Sunrise gradient background.
> 2. **Pull Quote** — "I am the invitation, not the insistence." Display serif, `brand.accent` quote glyph.
> 3. **What is QHHT** — 3-step modular section (Set Intentions → Enter the Theta State → Receive Insight). Each step = small icon + h3 + 1-paragraph body. Sage-green icons.
> 4. **Founder Spotlight** — `FounderSpotlight.astro`. Photo (organic mask) + "Founder, Dodie Kendall QHHT" + display h2 "Guided by intuition, grounded in love." + 2-paragraph bio + 2 credential lines + "Read My Full Story" CTA linking `/about`.
> 5. **Lead Magnet Gate** — `LeadMagnetGate.astro`. "Begin with a free pre-session prep guide." Single email field + submit.
> 6. **Testimonial Grid** — `TestimonialGrid.astro`. 3 testimonials (pull from `src/content/testimonials/`). Grid layout. NO carousel.
> 7. **Closing CTA** — sunrise gradient section. "Ready to listen?" + "Book a Session" CTA.
>
> Pull copy from `COPY-DECK.md` §Home. Pull SEO from `src/lib/seo.ts` (home defaults). Inject `WebSite` + `LocalBusiness` JSON-LD from `src/lib/schema.ts`. Run the self-critique trio.

**Acceptance:** Lighthouse mobile 95+ on home; trio finds zero AA fails and the brand voice review confirms no off-tone copy.

---

## Phase 5 — About page

**Prompt:**

> Build `src/pages/about.astro`. Use a vertical chapter layout (4–6 chapters as documented in `COPY-DECK.md` §About): Early Years → Search for Something More → The Lesson → The Shift → Discovering QHHT → The Invitation. Each chapter:
> - small caption label ("Chapter 02")
> - display h2
> - 1–3 paragraphs of body
> - inline pull quote between every 2 chapters
>
> Constrain prose to `max-w-prose mx-auto`. Add `prefers-reduced-motion`–respecting fade-in via Intersection Observer (gated; no JS for users with reduced motion).
>
> Inject `Person` + `AboutPage` JSON-LD. Run self-critique trio.

**Acceptance:** mobile reading width is comfortable; pull quotes act as visual breaks; no chapter exceeds 4 paragraphs.

---

## Phase 6 — QHHT page

**Prompt:**

> Build `src/pages/qhht.astro`. Sections:
> 1. Hero (`Hero.astro` variant `qhht`) — explanatory headline + 2-paragraph subhead.
> 2. "What is QHHT" deep section — origin (Dolores Cannon), modality summary, what makes it different from regression hypnosis.
> 3. "What to expect" timeline — 4-step (Pre-session call → Day-of intake → The session itself → Post-session integration). Each step = small numeral + h3 + 2-paragraph body.
> 4. Accordion FAQ (`Accordion.astro`) — pull from `src/content/faq/` collection, filtered to `category in ['sessions', 'practice']`.
> 5. Closing CTA.
>
> Inject `Service` + `FAQPage` JSON-LD. Run self-critique trio.

**Acceptance:** FAQ collapses/expands accessibly (real `<details>/<summary>` or aria-correct custom); FAQPage schema validates in Rich Results Test.

---

## Phase 7 — Book page (booking embed)

**Prompt:**

> Build `src/pages/book.astro`. Sections:
> 1. Pre-embed reassurance copy — 2 short paragraphs about confidentiality, what a 5-hour session involves, the $50 deposit.
> 2. `BookingEmbed.astro` — wrap Dodie's GHL calendar iframe in a card with our tokens. Add a friendly heading "Select a time that feels right." Above the iframe, surface the price ("$300 total, $50 deposit at booking") to remove pricing surprise.
> 3. "What happens next" 3-step — Confirmation email → Pre-session prep guide → Day-of check-in.
> 4. Privacy reassurance — link to `/privacy`.
>
> Verify the iframe loads on slow 3G under 4 seconds. Run self-critique trio.

**Acceptance:** real booking goes through to Dodie's existing GHL calendar; deposit confirmation arrives at her end.

---

## Phase 8 — Contact, FAQ, Privacy, Terms

**Prompt:**

> Build `src/pages/contact.astro` with `ContactForm.astro` posting to `/api/contact`. Include Full Name, Email, Phone (optional), Message, two consent checkboxes (marketing + transactional), and a honeypot. Display phone + email as fallback below the form.
>
> Build `src/pages/faq.astro` — categorized accordion (Sessions / Logistics / Practice / Aftercare).
>
> Build `src/pages/privacy.astro` and `src/pages/terms.astro` from boilerplate in `LEGAL-DISCLAIMERS.md` and `PRIVACY-NOTES.md`. These get refined by counsel review later.
>
> Run self-critique trio on all four pages.

**Acceptance:** form posts successfully to `/api/contact`; FAQ accordion is keyboard-accessible; Privacy and Terms are readable on mobile.

---

## Phase 9 — Server endpoints

**Prompt:**

> Invoke `ghl-api`. Build `src/lib/ghl.ts` — a server-side GHL API client with:
> - `upsertContact(payload)`
> - `applyTag(contactId, tag)`
> - `triggerWorkflow(contactId, workflowId)`
> - retry once on 5xx with 500ms backoff
> - fail open to a fallback email service (configured via env)
>
> Build `src/pages/api/contact.ts` and `src/pages/api/lead-magnet.ts` per the schemas in `TECH-SPEC.md` §5. Add zod validation, honeypot rejection, rate-limit headers.
>
> Add `src/pages/api/health.ts` for uptime monitoring.
>
> Write a test that hits the endpoints against a GHL sandbox subaccount (per `ENV.md`).

**Acceptance:** contact form creates a tagged contact in GHL sandbox; lead-magnet triggers the configured workflow ID; honeypot 200s silently; rate-limited requests return 429.

---

## Phase 10 — Insights (blog)

**Prompt:**

> Invoke `searchfit-seo:content-strategy`, `searchfit-seo:keyword-clustering`, `ultimate-seo-writer`. Build `src/pages/insights/index.astro` (card grid of all posts) and `src/pages/insights/[slug].astro` (prose layout with hero image, byline, pull quotes, related posts strip).
>
> Draft the 4 launch-day blog posts listed in `SEO-PLAN.md` §Launch Cluster:
> 1. "What Actually Happens in a QHHT Session"
> 2. "Past-Life Regression vs. QHHT: What's the Difference?"
> 3. "How to Prepare for Your First Quantum Healing Session"
> 4. "Choosing a QHHT Practitioner: 7 Things to Look For"
>
> Each post uses the Answer Capsule technique, includes ≥ 2 source-backed claims, and uses strategic internal linking to `/qhht`, `/about`, and `/book`.
>
> Inject `BlogPosting` JSON-LD. Run self-critique trio.

**Acceptance:** all 4 posts pass `ultimate-seo-writer` checks; `searchfit-seo:seo-audit` returns no blockers.

---

## Phase 11 — SEO, schema, sitemap, robots

**Prompt:**

> Invoke `searchfit-seo:schema-markup`, `searchfit-seo:on-page-seo`, `searchfit-seo:technical-seo`.
> Ensure every page has:
> - title (≤ 60 chars), meta description (≤ 155 chars)
> - canonical
> - Open Graph + Twitter Card with the right `og:image` per page
> - JSON-LD per the table in `PRD.md` §7
>
> Generate `sitemap.xml` (Astro integration) and `rss.xml` (for `/insights`). Generate `robots.txt`.
>
> Validate schema in Google Rich Results Test for every page type. Submit to Search Console and Bing Webmaster (in `LAUNCH-CHECKLIST.md`).

**Acceptance:** `searchfit-seo:seo-audit` final pass = no errors.

---

## Phase 12 — Pre-launch QA

**Prompt:**

> Walk `QA-CHECKLIST.md` end to end. Run `searchfit-seo:technical-seo` and `searchfit-seo:broken-links`. Run the self-critique trio on every page that has visuals (home, about, qhht, book, contact, faq, insights index, one insight post). Capture any deferred findings as items in `BACKLOG.md`.

**Acceptance:** the checklist is fully checked or items deferred with rationale.

---

## Phase 13 — Launch

**Prompt:**

> Walk `LAUNCH-CHECKLIST.md`. Cutover DNS from GHL to Cloudflare Pages. Verify 301s for any legacy URLs documented in the checklist. Verify analytics is firing. Verify the booking form creates contacts in production GHL. Send the launch confirmation to Dodie.

**Acceptance:** the production site loads on `https://dodiekendall.com`; first real booking comes through successfully.

---

## Phase 14 — Post-launch

**Prompt:**

> Run the Day 1, Day 7, Day 30, Day 90 checkpoints in `POST-LAUNCH-PLAN.md`. Open the maintenance retainer per `MAINTENANCE-GUIDE.md`. Move outstanding ideas into `BACKLOG.md`. Update `CHANGELOG.md`.

**Acceptance:** retainer engaged; first month review delivered to Dodie.

---

*Last updated: 2026-05-17.*
