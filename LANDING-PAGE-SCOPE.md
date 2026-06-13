# LANDING-PAGE-SCOPE.md — Paid-social landing pages

> Dedicated Facebook/Instagram ad landing pages for Dodie Kendall QHHT.
> Status: **v1 built** (2026-06-13) — pending content gaps + deploy + review.

---

## Goal

Give Dodie's FB/IG ads a purpose-built destination (not the homepage) that
converts cold social traffic into either:
1. a captured email lead (top-of-funnel), or
2. a booked $300 / 5-hour session.

Cold social traffic is curious-but-skeptical and won't commit to a 5-hour
session on first click — so at least one variant leads with low-friction email
capture, and one leads with a low-commitment call.

## The three variants (structurally different — true A/B, not cosmetic)

| Route | Angle | Hero | Primary CTA | Funnel stage |
| --- | --- | --- | --- | --- |
| `/landing-page-1` | **The Experience** — demystify the session | Video (doorway-opens) | Take the QHHT quiz (email capture) | Coldest |
| `/landing-page-2` | **The Outcome** — lead with transformation | Text-led, oversized type | Book a Session (`/book`) | Warmer / retargeting |
| `/landing-page-3` | **The Practitioner** — trust Dodie first | Split (portrait + credibility) | Free 15-min call (`/contact`) | Skeptics |

All three: warm-cream + coral/teal palette, Fraunces display, no carousels, no
purple-pink gradients, no medical/therapeutic claims, mobile-first with a sticky
bottom CTA, `noindex` (paid pages shouldn't compete with the canonical site in
organic search).

## Architecture

- **`src/layouts/LandingLayout.astro`** — stripped chrome: minimal logo-only top
  bar (+ phone), compliance-only footer, **no primary nav** (no escape routes).
  Keeps the Meta Pixel (essential for FB/IG conversion tracking + retargeting)
  and Plausible. Drops the ChatWidget.
- Pages reuse existing components: `Hero`, `TrustStrip`, `TestimonialGrid`,
  `ClosingCTA`, plus inline sections.

## Lead magnet decision (2026-06-13)

**Chosen: quiz now, audio later.** `/landing-page-1` uses Dodie's existing GHL
"QHHT Quiz" (the same embed as `/contact`) as the interim capture — real and
working today. **Planned swap:** a free 10–15 min guided audio meditation in
Dodie's voice, once she records it (closest no-risk taste of the modality; her
voice does the trust-building). When ready, repoint variant 1's capture to it.

> Note: the homepage `LeadMagnetGate` promises a "12-page guide … in your inbox
> in minutes" with no confirmed deliverable behind it (the auto-send doc + PDF
> were reverted). The landing pages deliberately do **not** reuse that promise.
> Resolve the homepage gap before driving any traffic near it.

## Open gaps before ads run

1. **Testimonials — #1 gap.** The `testimonials` content collection is empty, so
   the `TestimonialGrid` slot renders nothing. We did not fabricate quotes
   (dishonest + a liability for a hypnosis practice). Add 2–3 real, approved
   testimonials to `src/content/testimonials/` and all three pages light up.
2. **Audio meditation** — record + wire as the variant-1 magnet (replaces quiz).
3. **Deploy** — there is **no GitHub→Cloudflare auto-build** (no CI; `wrangler.toml`
   = manual `wrangler deploy` of `dist/`). A commit alone does not publish. Run a
   build + deploy to push these live.
4. **Domain** — `dodiekendall.com` is not cut over yet, so until launch these are
   visible at the `*.workers.dev` preview URL (e.g. `…workers.dev/landing-page-1`),
   not `dodiekendall.com/landing-page-1`.
5. **Pixel + analytics env** — set `PUBLIC_FB_PIXEL_ID` and `PUBLIC_PLAUSIBLE_DOMAIN`
   in the production environment so conversion tracking fires.

## Next step (when ready)

Run `landing-page-factory-pipeline` to expand/iterate variants and feed
`ab-test-pipeline`, or hand-tune the winning variant after Dodie's review.
