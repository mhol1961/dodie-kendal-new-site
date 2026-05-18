# ADR-001 — Stack Selection: Astro + Tailwind + shadcn/ui on Cloudflare Pages

- **Status:** Accepted
- **Date:** 2026-05-17
- **Deciders:** Mark Holland (IntellaGrow)
- **Consulted:** Reference: shiftedsouls.com architecture; reference: Guiding Winds Unplug build pattern

## Context

dodiekendall.com is a rebuild of an existing GoHighLevel-hosted brochure site. The site is small (≤ 10 routes), content-heavy, and has one moderately interactive surface (forms posting to GHL) plus an embedded calendar iframe. It does not have a JS-heavy SPA-style user experience and is unlikely to grow into one.

Three credible options were considered:

1. **Astro + Tailwind + shadcn/ui** (chosen)
2. **Next.js + Tailwind + shadcn/ui** (the sister-reference site shiftedsouls.com pattern; matches Gemini's external suggestion)
3. **Headless WordPress + custom frontend** (Mark's prior assumption about shiftedsouls.com)

## Decision

Adopt **Astro 4.x + Tailwind CSS + a hand-curated subset of shadcn/ui, deployed to Cloudflare Pages**, with Vercel as a documented backup.

## Rationale

**Why Astro over Next.js**
- Astro ships ~0KB of JS by default. Next.js ships a hydration runtime even for static content. For a 7-page brochure + blog, that runtime is overhead with no payoff.
- Astro Content Collections give type-safe Markdown/MDX without bolting on a CMS layer. Next.js' equivalents (Contentlayer, MDX-bundler) are more moving parts.
- Astro Islands let us add interactivity (form validation, mobile menu, accordion) precisely where needed, with the framework of our choice (Solid, Preact). No commitment to React's bundle size.
- IntellaGrow's default stack is already Astro. Staying on it preserves agency consistency and skill reuse.

**Why not headless WordPress**
- A WordPress backend adds a managed VM/service to maintain. Astro Content Collections already give Dodie a low-overhead path to manage the blog by editing markdown via a future CMS layer (Decap, Sanity, or Tina) if she wants. Phase 2.
- WordPress's footprint, plugin maintenance, and security surface are larger than this project needs.

**Why Tailwind + shadcn/ui (subset)**
- Tailwind matches the token-driven DESIGN.md approach 1:1.
- shadcn provides high-quality primitives we own (copy-into-repo, not npm-installed). Adapting them to Astro keeps the JS payload minimal while preserving design quality.
- Avoids the alternative of building from scratch or pulling in a heavyweight component library (MUI, Mantine) that fights our brand register.

**Why Cloudflare Pages over Vercel**
- Free tier covers our usage comfortably.
- Native edge support if we need it later.
- CF DNS already hosts the zone — keeps the operational surface unified.
- Vercel is comparable; we'd choose it if image-handling needs grew beyond what Astro's built-in pipeline provides. Documented as fallback.

**Why not stay on GoHighLevel**
- Hard rule: no GHL hosting, no GHL page builder (see `CLAUDE.md` §6).
- GHL's builder produces output that's hard to version, hard to SEO, hard to migrate, and ties the website's fate to the CRM contract.

## Consequences

**Positive:**
- Minimal JS shipped to users → great Core Web Vitals out of the box.
- Type-safe content with no CMS backend to maintain.
- Cheap to host (CF Pages free tier).
- The agency's existing Astro patterns apply directly.

**Negative / trade-offs:**
- shadcn primitives ported by hand cost some up-front work vs. using them directly in a React app.
- If Dodie later wants in-place visual editing (true WYSIWYG), we'd need to bolt on a headless CMS layer (Phase 2 decision).
- Some animation libraries (Framer Motion) require Astro islands or a Solid/Preact equivalent — slight indirection cost.

## Alternatives reconsidered

Next.js remains a defensible choice and is what shiftedsouls.com runs on. If the sister-site Guiding Winds Unplug rebuild discovers a need that Astro can't meet (e.g., complex client-side state, real-time features), we can diverge that project to Next while keeping this one on Astro.

## Follow-ups

- ADR-002 — CRM integration pattern (GHL via public API)
- ADR-003 (future) — email fallback service selection (Resend vs. Postmark vs. GHL native)
- ADR-004 (future, optional) — headless CMS layer for the blog if Dodie requests in-place editing.

---

*Linked: `CLAUDE.md`, `TECH-SPEC.md`, `BUILD-PROMPTS.md`.*
