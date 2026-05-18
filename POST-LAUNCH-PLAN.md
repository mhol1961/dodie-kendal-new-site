# POST-LAUNCH-PLAN — dodiekendall.com

> Week 1, Week 4, Week 12 checkpoints after launch.
> Pair with `MAINTENANCE-GUIDE.md` for ongoing retainer work.

---

## Day 1

- [ ] Verify no broken links via `searchfit-seo:broken-links`.
- [ ] Verify Plausible analytics is receiving events.
- [ ] Verify GHL production is receiving contacts from the new forms.
- [ ] Tag any Day-0 bugs in `BACKLOG.md`.

## Day 3

- [ ] Lighthouse re-run on production (real-user, not preview).
- [ ] Submit URL Inspector requests in Search Console for each top-level page.

## Week 1

- [ ] Review Plausible: top pages, top entry points, bounce rate by page.
- [ ] Review GHL: form submissions, booking conversions, lead-magnet opt-ins.
- [ ] Review Google Search Console: any crawl errors? Index coverage?
- [ ] Confirm with Dodie that booking deposits are landing correctly.
- [ ] Triage any client feedback she's received.
- [ ] Self-critique trio (`design-critique`, `brand-review`, `accessibility-review`) on the live site for any items missed in pre-launch.

## Week 4

- [ ] Full SEO audit (`searchfit-seo:seo-audit`) against the live site.
- [ ] Review Search Console queries: which keywords are appearing? Any quick-win opportunities?
- [ ] Refresh keyword cluster map in `KEYWORDS.md` based on real queries.
- [ ] Schedule next blog post(s) based on keyword opportunities.
- [ ] AI-visibility audit: ask each of ChatGPT / Perplexity / Claude / Gemini the 5 test queries from `SEO-PLAN.md` §6. Log results.
- [ ] First retainer report to Dodie (see `MAINTENANCE-GUIDE.md`).

## Week 12 (90-day review)

- [ ] Compare to `PRD.md` §3 success metrics:
  - Booking-page → calendar-form-start rate
  - Calendar-form-start → completed-booking rate
  - Homepage bounce rate
  - About-page time on page
  - Lead-magnet opt-in rate
  - Organic clicks (GSC + Bing)
  - AI-visibility hit rate
  - Lighthouse scores
- [ ] Identify gaps; promote to roadmap (`ROADMAP.md`) or backlog (`BACKLOG.md`).
- [ ] Decide Phase 2 scope (headless CMS for blog? second batch of blog posts? video assets?).
- [ ] 90-day review session with Dodie.

## Ongoing checkpoints

- [ ] Monthly: spot-check top pages for content drift, broken links, voice consistency.
- [ ] Quarterly: `searchfit-seo:keyword-clustering` re-run; refresh `KEYWORDS.md`.
- [ ] Quarterly: `marketing:brand-review` pass on all live copy.
- [ ] Annually: full counsel review of `COMPLIANCE.md`, `LEGAL-DISCLAIMERS.md`, `INTAKE-FORMS.md`, `PRIVACY-NOTES.md`.

## What we're watching for (warning signs)

- Bounce rate creep above 60% on the homepage → diagnose hero or above-the-fold.
- Calendar-form-start drop below 30% → diagnose `/book` reassurance copy and embed performance.
- Zero AI-visibility hits at Week 12 → escalate AEO/GEO work.
- GHL form failures > 1% → investigate API issues / increase fallback robustness.
- Lighthouse Performance drift below 90 → audit recently added content (heavy images, embedded scripts).

---

*Last updated: 2026-05-17 — STUB. Reviewed at each checkpoint.*
