# ADR-004 — Environment Resolution Strategy: Build-Time vs Runtime in Hybrid Output

- **Status:** Proposed (decision required before Phase 7)
- **Date:** 2026-05-18
- **Deciders:** Mark Holland (IntellaGrow)
- **Triggered by:** Codex adversarial review of Phase 1 baseline (task `beviv97rn`, 2026-05-18). Finding "Prerendered pages bake GHL/SEO env at build time, so Cloudflare runtime swaps will not take effect."

## Context

The Astro config sets `output: 'hybrid'`. By default in hybrid mode, every page is **prerendered at build time** unless it explicitly opts out via `export const prerender = false`. Currently only the API endpoints opt out; every page route (including `/book`) is prerendered.

Several scaffolded components read `import.meta.env.*` directly in their frontmatter:

| File | Env var | Used for |
| --- | --- | --- |
| `src/components/BookingEmbed.astro:3` | `GHL_CALENDAR_ID` | The booking iframe URL |
| `src/components/BookingEmbed.astro:7` | `BOOKING_CALENDAR_FALLBACK_URL` | Fallback link when calendar is unset |
| `src/lib/seo.ts:20` | `SITE_URL` | Canonical URLs, OG URLs, every page's `og:url` |
| `src/lib/schema.ts:3` | `SITE_URL` | JSON-LD `@id`, `url`, image URLs |
| `src/layouts/Base.astro:15` | `PUBLIC_PLAUSIBLE_DOMAIN` | Analytics enablement |

These reads happen at **build time** because the pages they belong to are prerendered. The values are baked into the static HTML. Once deployed, changing the env on Cloudflare Pages does not change the rendered output — only a fresh build does.

`LAUNCH-CHECKLIST.md` and `GHL-INTEGRATION.md` assume "envs swap at launch." That assumption is wrong as-built: a DNS cutover from sandbox to production GHL would require a production rebuild with the new env values, not just a Cloudflare env-var swap.

## Decision (proposed; pick one)

### Option A — Make env-dependent pages SSR (`prerender = false`)

Add `export const prerender = false` to any page that consumes env vars at runtime. Refactor those pages to read from `Astro.locals.runtime.env` instead of `import.meta.env`. Affected routes today: `/book` (booking embed). Affected layout: `Base.astro` (Plausible domain). Affected libs: `seo.ts`, `schema.ts` (must be called from within an SSR context, not prerendered).

**Pros:** True runtime resolution. CF env swaps take effect immediately. Matches what most LAUNCH-CHECKLIST steps imply.
**Cons:** Every SSR page costs a Workers invocation per request (CF Pages free tier still cheap, but no longer "static at the edge"). Loses some prerender benefits (CDN cache, edge-served HTML). Forces a code refactor for `seo.ts` + `schema.ts` to accept env at call time rather than module-load time.

### Option B — Keep prerender; require a build for env changes

Document that "every env change requires a production rebuild." DNS cutover ritual becomes: (1) point env vars at production GHL, (2) trigger a rebuild, (3) cut DNS. Update `LAUNCH-CHECKLIST.md` and `GHL-INTEGRATION.md` to reflect this. No code changes.

**Pros:** Static at the edge — fastest possible delivery. Zero Workers invocations on the marketing surface. Operationally simple if rebuild is automated.
**Cons:** Slower env iteration during dev. Any env-change scenario (rotate API keys, swap GHL subaccount, change Plausible domain) requires a fresh deploy. Easy to forget.

### Option C — Hybrid: prerender + injected runtime variables for the booking iframe only

`/book` SSR-renders just the iframe URL via a server endpoint; everything else stays prerendered. `SITE_URL` and `PUBLIC_PLAUSIBLE_DOMAIN` stay build-time (they shouldn't change between deploys anyway). `GHL_CALENDAR_ID` becomes runtime-read.

**Pros:** Pinpoint fix for the one value that's plausibly volatile (the calendar ID could change if Dodie re-creates her calendar). Static delivery preserved for the marketing surface.
**Cons:** Architectural inconsistency: some values build-time, others runtime. Easy to slip into wrong-assumption later.

## Recommendation

**Option B** is the simplest and matches Astro's static-first ethos best. `SITE_URL` shouldn't change after launch; `PUBLIC_PLAUSIBLE_DOMAIN` shouldn't change after launch; `GHL_CALENDAR_ID` shouldn't change unless Dodie recreates her calendar, which is rare and a planned event anyway. A documented "rebuild on env change" ritual is acceptable for an asset surface like this.

If you anticipate frequent env churn (e.g., rotating GHL tokens, multi-environment previews per PR), pick **Option A** instead.

## Consequences (per option)

### If Option A
- Touched files: `src/pages/book.astro` (add `prerender = false`), `src/lib/seo.ts` (accept env in `getSeo()`), `src/lib/schema.ts` (accept env in each helper), `src/layouts/Base.astro` (read Plausible domain from runtime).
- `/book` cost shifts from static to Workers-invocation per request. Negligible at this volume.
- Phase 7 (book page build) must include the SSR refactor.

### If Option B
- Touched files: `LAUNCH-CHECKLIST.md` (update cutover step), `GHL-INTEGRATION.md` (update "env swap at launch"), `BUILD-PROMPTS.md` Phase 13 (add explicit "rebuild after env change" step).
- Cloudflare Pages deployment must be configured to rebuild on env change, OR the rebuild step must be explicit in the cutover ritual.

### If Option C
- Touched files: `src/components/BookingEmbed.astro` (move to SSR island or a fetch from a new `/api/booking-config` endpoint), `LAUNCH-CHECKLIST.md` (partial update).

## Follow-ups

- Decide Option A / B / C before Phase 7 (book page).
- Update affected docs based on the decision.
- Verify the chosen path against a real Cloudflare Pages deployment with separate dev / prod environments.

---

*Linked: ADR-001 (stack), ADR-002 (CRM pattern), ADR-003 (email fallback), `TECH-SPEC.md`, `LAUNCH-CHECKLIST.md`, `GHL-INTEGRATION.md`, `BACKLOG.md` Phase 1 Codex findings.*
