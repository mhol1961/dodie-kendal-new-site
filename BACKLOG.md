# BACKLOG — dodiekendall.com

> Known future work, ideas, and deferred items.
> Promote items to `ROADMAP.md` when prioritized.

---

## Format

Each item: `[Priority] [Category] One-line description — context / why deferred / acceptance.`

Priority: P0 (urgent) / P1 (next phase) / P2 (someday) / P3 (idea, low confidence)
Category: build / content / brand / seo / integration / compliance / ops / nice-to-have

---

## Open items (as of 2026-05-17)

### P0 — Phase 1 follow-ups (added 2026-05-17)

- [P0][brand] Replace `/public/logo.svg` placeholder with Dodie's actual coral/pink wordmark mark. Current file is a flat coral circle with a "D" glyph — works in dev but is not the brand mark.
- [P0][content] Replace `/public/dodie-portrait.jpg` placeholder with Dodie's real portrait (800×800 minimum, square or pill-mask-friendly). Currently a solid sand-color fill.
- [P0][content] Replace `/public/og-image.jpg` placeholder with a real branded 1200×630 OG image. Currently a solid sand fill — social previews will look like an empty card.
- [P0][build] Replace `/public/apple-touch-icon.png` placeholder with a real branded icon (180×180). Currently a solid terracotta fill.
- [P0][build] Self-hosted fonts ship only the **latin subset** (`CormorantGaramond-Medium.woff2` 23 KB, `InterVariable.woff2` 48 KB) — sufficient for English copy but no accented glyphs beyond Latin-1 Supplement. If Dodie's copy ever uses Spanish/French specialty characters, add the latin-ext subset.
- [P0][build] `@astrojs/sitemap` pinned to `~3.4.2` because 3.5+ depends on Astro 5's `astro:routes:resolved` hook (project is on Astro 4.16). Re-evaluate when Astro is bumped to v5 (see also next item).
- [P0][build] `npm audit` reports 14 vulns (3 high, 11 moderate) — all transitive through `@astrojs/cloudflare` and `astro@4.x`. Fixing requires `astro@6.x` + adapter bump, a breaking change vs. ADR-001. Decide: stay on Astro 4 and accept the audit findings, or schedule an Astro-5/6 migration (would also unlock sitemap >= 3.5).
- [P0][build] claude-mem hook auto-injects empty `CLAUDE.md` stubs into `src/**` at SessionStart. Astro routes any `.md` under `src/pages/` — deleted the leftover stubs and added `src/**/CLAUDE.md` to `.gitignore`. If new ones appear in `src/pages/*` they'll re-break the build — consider configuring claude-mem to skip `src/pages/`.
- [P0][brand] Color tokens recalibrated in Phase 1 to hit WCAG AA: `brand.primary` L 0.62 → 0.55, `brand.primary-hover` L 0.56 → 0.48, `ink-muted` L 0.62 → 0.50. Visual register holds (still warm-terracotta + warm gray) but slightly deeper. DESIGN.md, global.css, and tailwind.config.mjs (glow shadow) are in sync. Consider promoting this to an ADR if you want a formal record; otherwise the BACKLOG entry is enough.

### Codex adversarial review findings (Phase 1, 2026-05-18) — addressed inline or scoped

- [P0][build] **withRetry replays non-idempotent GHL POSTs** — `src/lib/ghl.ts:31-95`. All three exported helpers (`upsertContact`, `applyTag`, `triggerWorkflow`) wrap POSTs in a retry that fires on any 5xx. Risk: double-enrolled contacts, duplicate workflows, duplicate tag application if GHL commits the write then 5xx's. **Fix in Phase 9:** drop retry on side-effecting POSTs, OR add an idempotency-key strategy (GHL contact upsert keys on email/phone — verify before relying on it).
- [P0][build] **Honeypot silent-200 path is unreachable in current zod schemas** — `src/pages/api/contact.ts:17-39` and `src/pages/api/lead-magnet.ts` mirror. `website: z.string().max(0).optional()` rejects non-empty values via `safeParse` and returns 422 before the silent-200 branch ever runs. Bots get a machine-readable retry signal instead of the intended honeytrap. **Fix in Phase 9:** parse honeypot field BEFORE zod validation, OR relax the schema to `z.string().optional()` and length-check in the if-branch.
- [P0][build] **Form submissions dropped on GHL failure with no durable fallback** — `src/pages/api/contact.ts:82-90` and lead-magnet mirror. On 5xx after retry exhaustion, endpoint 502s and the lead is gone. ADR-003 captures the fallback-email decision; do not enable production endpoints before resolving it.
- [P0][build] **Env-dependent prerendered pages bake build-time values, not runtime** — `src/components/BookingEmbed.astro:3-7`, plus `src/lib/seo.ts` `SITE_URL` reference and `src/layouts/Base.astro` Plausible domain reference. `/book` is prerendered (no `prerender = false`), so the GHL calendar ID resolves at build time on the build server, not from `Astro.locals.runtime.env` at request time. `LAUNCH-CHECKLIST.md`'s "DNS cutover with env swap" assumption is wrong as-built. ADR-004 captures the decision. Fix in Phase 7 (book page) and Phase 11 (technical SEO sweep).
- [P0][build] **Focus ring contrast — FIXED in Phase 1**. Original ring at `oklch(0.62 0.13 35 / 0.25)` failed 3:1 for non-text focus; my Phase 1 recalibration to `oklch(0.55 0.14 32 / 0.3)` also failed (~1.5:1 alpha-blended). Now: two-layer ring (`bg-base` halo inset + opaque `brand-primary` outer) clears 3:1 on every documented surface. Phase 2 design-critique should re-verify on dark/raised cards.

### P1

- [P1][build] Headless CMS layer (Decap / Sanity / Tina) for Dodie to edit blog and FAQ in-place — defer until Phase 2 after Dodie has lived with the blog workflow.
- [P1][content] Source 3–7 additional testimonials from past clients — needed for full 6-card testimonial grid.
- [P1][content] Lifestyle / session-room photography — need 4–6 secondary shots beyond the single existing portrait.
- [P1][compliance] Counsel review of `COMPLIANCE.md`, `LEGAL-DISCLAIMERS.md`, `INTAKE-FORMS.md`, `PRIVACY-NOTES.md` before launch.
- [P1][integration] ADR-003 — decide fallback email provider (Resend vs. Postmark vs. GHL native).

### P2

- [P2][build] Video intro reel for `/about` (Dodie speaking to camera, 30–60s).
- [P2][content] Spanish localization — only if Dodie's clientele moves that direction.
- [P2][seo] Outreach to FL wellness directories for backlinks.
- [P2][seo] Podcast appearance pitch list — Dodie's voice is podcast-friendly.
- [P2][build] Online intake e-signature integration (DocuSign-style).
- [P2][nice-to-have] Custom logo refinement (current coral/pink wordmark works; refinement is polish).
- [P2][build] Member portal for recurring clients (session recordings, follow-up materials).
- [P2][seo] Second blog cluster (4 more posts) targeting longer-tail queries.

### P3 (ideas, low confidence)

- [P3][build] Workshop / group-session landing pages if Dodie ever offers them.
- [P3][build] Booking gift cards via GHL (if Dodie wants to offer these).
- [P3][nice-to-have] Newsletter (separate from the lead-magnet nurture).
- [P3][nice-to-have] Booking confirmation page upsell — "while you wait, here are 3 posts that prepare you."
- [P3][build] A small companion store for any of Dodie's recommended books or audio (low priority).

---

## Done items

*(Move items here when completed; keep last ~20 for history.)*

- (none yet — kickoff just complete)

---

*Last updated: 2026-05-17. Review at every weekly check-in and every monthly retainer report.*
