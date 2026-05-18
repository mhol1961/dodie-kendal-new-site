# CLAUDE.md — dodiekendall.com

> Project context, conventions, and skill invocations for AI agents working on this codebase.
> If you're an AI assistant opening this repo: **read this file first**, then `DESIGN.md`, then `PRD.md`.

---

## 1. Project at a glance

| Field | Value |
| --- | --- |
| Project | dodiekendall.com — Dodie Kendall's QHHT practice site |
| Client | Dodie Kendall (sole practitioner; QHHT — Quantum Healing Hypnosis Technique) |
| Agency | IntellaGrow (Mark Holland) |
| Status | New build / replacement for existing GHL-hosted site |
| Sister site | guidingwinds-unplug.com — same client, distinct brand (sailing/adventure). Mirror structure, **not** visuals. |
| Reference site | shiftedsouls.com — Mark's prior QHHT build for Dana Motley (Next.js). Mirror IA + register. |
| Repository root | `C:\dodiekendall-website-redo\` |
| Current owner of CRM | Dodie (her own GHL subaccount — **never** route through IntellaGrow's agency subaccount) |

---

## 2. Stack

- **Framework:** Astro 4.x (static-first + SSR islands where needed for forms)
- **Styling:** Tailwind CSS 3.x + a tightly curated subset of **shadcn/ui** primitives, adapted to Astro (e.g., via `astro-shadcn` or hand-ported components)
- **Type checking:** TypeScript (strict)
- **Content:** Astro Content Collections for the blog ("Insights"); Markdown/MDX
- **Forms:** Astro server endpoints (`/src/pages/api/`) posting to GHL public API
- **Calendar/booking:** GHL native calendar embed (iframe wrapped in Astro component) — Dodie's existing 5-hour / $300 / $50-deposit calendar stays as-is
- **Hosting:** **Cloudflare Pages** (primary) or **Vercel** (backup) — final decision in `ADR/ADR-001-stack-selection.md`
- **Domain/DNS:** Cloudflare DNS; the existing `dodiekendall.com` domain cuts over from GHL at launch (LAUNCH-CHECKLIST.md captures the cutover)
- **Analytics:** Plausible (privacy-first; GA4 alt if Dodie insists)
- **Search Console:** Google Search Console + Bing Webmaster (LAUNCH-CHECKLIST step)

**Hard "no" on stack:**
- ❌ No hosting on GoHighLevel.
- ❌ No GHL page builder for any page.
- ❌ No Next.js for this project (sister site Guiding Winds may diverge in its own repo — out of scope here).
- ❌ No agency-owned GHL subaccount for Dodie's lead capture — she owns her data.

---

## 3. Skills to invoke

When working in Claude Code on this repo, invoke skills **by exact verbatim name**. (Skill library lives at `C:\Users\mholl\.claude\skills\` — host-only.)

**Always-on guardrails:**
- `ui-ux-cro-master` — design guardrail; enforces banned/required rules (see §6 Hard Rules). Run before any visual page is declared complete.
- `design-md` — generates/updates `DESIGN.md` per Google spec format with YAML token frontmatter + canonical section order.
- `design-critique` + `brand-review` + `accessibility-review` — **self-critique trio**. Run all three on any visual deliverable before signoff. No exceptions.

**Build phase:**
- `astro-builder` — scaffolding, component generation, Astro idioms, routing.
- `project-kickoff` (already partially applied — produced this doc set).

**SEO suite (every SEO doc generated/updated must invoke the relevant skill):**
- `searchfit-seo:seo-audit` — site-level health check.
- `searchfit-seo:keyword-clustering` — for `KEYWORDS.md`.
- `searchfit-seo:content-strategy` — for `SEO-PLAN.md` topical roadmap.
- `searchfit-seo:on-page-seo` — per-page optimization passes.
- `searchfit-seo:schema-markup` — for `SCHEMA.md` (LocalBusiness, Person, Service, FAQPage, BlogPosting).
- `searchfit-seo:internal-linking` — link graph design.
- `searchfit-seo:ai-visibility` — AEO/GEO for ChatGPT/Perplexity/Claude/Gemini visibility.
- `searchfit-seo:technical-seo` — Core Web Vitals, crawlability, sitemap.
- `ultimate-seo-writer` — for any blog post written (Answer Capsule + source-backed claims + internal links).
- `searchfit-seo:content-brief` — before drafting any blog post.

**Integrations:**
- `ghl-api` — every GHL touchpoint (form post, contact upsert, calendar lookup, workflow trigger). Target Dodie's subaccount only.

**Media / future phases (not day-one):**
- `seedance-prompt` — for any AI-generated hero/background imagery prompts.
- `remotion` — for any video assets (intro reel, About-page motion sequence).

**Standalone, run AFTER build scope is locked — do not run in-thread:**
- `proposal-generator-pipeline` — runs from IntellaGrow entity; produces the client proposal as a separate artifact. Never write the proposal by hand.

**Cowork-side equivalents (if working in Cowork instead of Claude Code):**
- `design:design-critique`, `design:accessibility-review`, `marketing:brand-review` for the self-critique trio.
- `searchfit-seo:*` skills mirror the personal-skill names above.
- `anthropic-skills:docx` / `anthropic-skills:pptx` for client-facing exports.
- `canvas-design` / `anthropic-skills:canvas-design` for any standalone visual artifact.

---

## 4. Folder structure

```
C:\dodiekendall-website-redo\
├── CLAUDE.md                  ← you are here
├── DESIGN.md                  ← Google-spec design tokens + system
├── README.md                  ← human-facing project overview
├── PRD.md                     ← product requirements
├── TECH-SPEC.md               ← technical spec
├── BUILD-PROMPTS.md           ← phase-by-phase build prompts
├── ADR/
│   ├── ADR-001-stack-selection.md
│   └── ADR-002-crm-integration-pattern.md
├── BRAND-VOICE.md
├── COPY-DECK.md
├── CONTENT-INVENTORY.md
├── SEO-PLAN.md
├── KEYWORDS.md
├── SCHEMA.md
├── GHL-INTEGRATION.md
├── ENV.md
├── COMPLIANCE.md              ← Tier 2; QHHT-specific scope-of-practice
├── LEGAL-DISCLAIMERS.md       ← Tier 2
├── INTAKE-FORMS.md            ← Tier 2; informed consent for hypnosis
├── PRIVACY-NOTES.md           ← Tier 2
├── QA-CHECKLIST.md            ← Tier 2
├── LAUNCH-CHECKLIST.md        ← Tier 2
├── POST-LAUNCH-PLAN.md        ← Tier 2
├── MAINTENANCE-GUIDE.md       ← Tier 2
├── ROADMAP.md                 ← Tier 2
├── BACKLOG.md                 ← Tier 2
├── CHANGELOG.md               ← Tier 2
├── HANDOFF.md                 ← Tier 2
│
├── package.json
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── .env.example
├── .gitignore
│
├── public/
│   ├── favicon.svg
│   └── og-image.jpg
│
└── src/
    ├── content/
    │   ├── config.ts
    │   ├── insights/          ← blog markdown
    │   └── testimonials/      ← structured testimonial data
    ├── layouts/
    │   └── Base.astro
    ├── pages/
    │   ├── index.astro
    │   ├── about.astro
    │   ├── qhht.astro
    │   ├── book.astro
    │   ├── contact.astro
    │   ├── faq.astro
    │   ├── insights/
    │   │   ├── index.astro
    │   │   └── [slug].astro
    │   ├── privacy.astro
    │   ├── terms.astro
    │   └── api/
    │       ├── contact.ts     ← POST → GHL Contact API
    │       └── lead-magnet.ts ← POST → GHL + email trigger
    ├── components/
    │   ├── Header.astro
    │   ├── Footer.astro
    │   ├── Hero.astro
    │   ├── PullQuote.astro
    │   ├── FounderSpotlight.astro
    │   ├── TestimonialGrid.astro
    │   ├── ServiceCard.astro
    │   ├── LeadMagnetGate.astro
    │   ├── BookingEmbed.astro ← GHL calendar iframe wrapper
    │   ├── ContactForm.astro
    │   └── ui/                ← shadcn-style primitives
    ├── lib/
    │   ├── ghl.ts             ← GHL API client (server-side only)
    │   ├── schema.ts          ← JSON-LD helpers
    │   └── seo.ts             ← per-page SEO defaults
    └── styles/
        └── global.css         ← Tailwind layer + design tokens
```

---

## 5. Conventions

- **File naming:** kebab-case for routes, PascalCase for components.
- **Component style:** Astro components by default. Add a Solid/Preact island only when interactivity is unavoidable (e.g., form validation).
- **No client-side framework runtime** unless an island demands it. Keep JS payload near zero.
- **Color tokens:** **oklch** in `DESIGN.md` and `tailwind.config.mjs`. No hex in component code — pull from token classes.
- **Spacing scale:** Tailwind default + custom `space-prose` for body-text rhythm.
- **Forms:** progressive enhancement — must work without JS (action-attribute form posting to server endpoint).
- **Image strategy:** Astro `<Image />` with `loading="lazy"` for everything below the fold; eager + `fetchpriority="high"` for above-the-fold hero only.
- **Commit style:** Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`).
- **Branch model:** `main` is deployable; feature branches off main; PRs squash-merge.

---

## 6. Hard rules (do not violate)

1. ❌ **No Inter as display font.** Body sans is fine elsewhere; display = a soft serif (see `DESIGN.md` for the exact choice).
2. ❌ **No purple-pink gradients** anywhere. The palette is warm earth + chalky pastels.
3. ❌ **No carousel sliders.** Testimonials, services, anything — use a static grid or vertical list. Carousels hide content from screen readers and harm CRO.
4. ❌ **No hosting on GHL. No building in GHL's page builder.** GHL is integration-layer only.
5. ❌ **No agency-subaccount GHL routing.** Dodie's GHL subaccount only. API credentials live in her env, documented by name in `ENV.md`.
6. ❌ **No medical/therapeutic claims.** QHHT is hypnosis — site uses scope-of-practice-safe language per `COMPLIANCE.md` and `LEGAL-DISCLAIMERS.md`. "Not medical advice" disclaimer present on every relevant page.
7. ❌ **No proposal written by hand.** That runs through `proposal-generator-pipeline` separately.
8. ✅ **Self-critique trio before any visual signoff:** `design-critique` → `brand-review` → `accessibility-review`. Findings resolved or explicitly deferred with rationale. No exceptions.
9. ✅ **All new structural decisions captured as ADRs** in `ADR/`.
10. ✅ **Memory persistence:** when scope changes, brand tokens shift, or compliance requirements update, save to Cowork memory at the spaces path so the next session has it.

---

## 7. Common tasks → which doc / skill

| Task | Read first | Skill to invoke |
| --- | --- | --- |
| Add a new page | `PRD.md`, `DESIGN.md` | `astro-builder` + `ui-ux-cro-master` |
| Update copy | `BRAND-VOICE.md`, `COPY-DECK.md` | (brand-review for final) |
| Write a blog post | `SEO-PLAN.md`, `KEYWORDS.md`, `SCHEMA.md` | `searchfit-seo:content-brief` → `ultimate-seo-writer` |
| Add structured data | `SCHEMA.md` | `searchfit-seo:schema-markup` |
| Change a brand token | `DESIGN.md` | `design-md` + `design-critique` |
| Wire a new form | `GHL-INTEGRATION.md`, `ENV.md` | `ghl-api` |
| Pre-launch check | `QA-CHECKLIST.md`, `LAUNCH-CHECKLIST.md` | `searchfit-seo:technical-seo` |
| Generate the proposal | (after scope lock) | `proposal-generator-pipeline` (separately, from IntellaGrow context) |

---

## 8. Out of scope for this build

- The proposal itself — runs separately through `proposal-generator-pipeline`.
- Guiding Winds Unplug rebuild — separate repo, distinct brand.
- Migration of historical contact data from existing GHL-hosted site (Dodie's GHL keeps her data; we're just redirecting form posts to it).
- Custom logo redesign — keep existing coral/pink wordmark unless Dodie requests refresh.

---

*Last updated: 2026-05-17 (kickoff).*


<claude-mem-context>

</claude-mem-context>