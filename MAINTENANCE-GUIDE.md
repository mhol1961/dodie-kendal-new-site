# MAINTENANCE-GUIDE — dodiekendall.com

> Retainer-phase operating manual. What gets done weekly, monthly, quarterly.
> Covers the $250–$500/month maintenance retainer scope (final pricing decided in the separate `proposal-generator-pipeline` output).

---

## 1. Retainer scope at a glance

| Cadence | Activity |
| --- | --- |
| Weekly (when posting) | Publish 1 blog post + social cross-post if Dodie wants. |
| Monthly | Performance + SEO + analytics review; report to Dodie. |
| Quarterly | Brand-voice review, keyword-cluster refresh, AI-visibility audit. |
| Annually | Counsel review; design-token refresh; competitive landscape update. |
| As needed | Bug fixes, copy updates, image refreshes, integration troubleshooting. |

## 2. Weekly tasks

- [ ] Publish 0–1 blog post per Dodie's content plan (drafted using `searchfit-seo:content-brief` → `ultimate-seo-writer`).
- [ ] Schedule social cross-posts if Dodie's social channels are connected (Facebook is her primary).
- [ ] Spot-check uptime (Cloudflare Pages status + an external uptime check like UptimeRobot).
- [ ] Quick scan of GHL for any failed contacts / form errors.

## 3. Monthly tasks

- [ ] Run `searchfit-seo:seo-audit` against the live site.
- [ ] Run `searchfit-seo:broken-links` and fix any new breaks.
- [ ] Lighthouse run on home + book + a blog post; ensure no regression.
- [ ] Review Plausible: traffic, top pages, conversion funnel.
- [ ] Review GSC: top queries, impressions, click-through rate; harvest new long-tails.
- [ ] Review Bing Webmaster: indexing health.
- [ ] Send Dodie a 1-page monthly report (template: `MONTHLY-REPORT.md` to be created in `templates/` Phase 2).

## 4. Quarterly tasks

- [ ] `marketing:brand-review` pass on all live copy + any blog posts shipped.
- [ ] `searchfit-seo:keyword-clustering` refresh; update `KEYWORDS.md`.
- [ ] `searchfit-seo:ai-visibility` audit: query the four major LLMs on the test set; log results.
- [ ] Review competitor sites (`qhhtflorida.com`, `quantumhealingmiami.com`, etc.) for differentiation opportunities.
- [ ] Update testimonials if Dodie has new ones.
- [ ] Review session-photography needs (lifestyle shots, room shots).

## 5. Annual tasks

- [ ] Counsel review of `COMPLIANCE.md`, `LEGAL-DISCLAIMERS.md`, `INTAKE-FORMS.md`, `PRIVACY-NOTES.md`.
- [ ] Rotate `GHL_PRIVATE_INTEGRATION_TOKEN` (per `ENV.md` §5).
- [ ] Refresh `og-image.jpg` if branding has shifted.
- [ ] Major design-token review — does the palette still feel right? Any drift?
- [ ] Annual contract review with Dodie.

## 6. Incident response

For anything customer-impacting (booking down, contact form broken, site outage):

1. **Triage** within 1 business hour.
2. **Contain** — disable the broken surface if it's misleading users.
3. **Fix** — patch and deploy.
4. **Communicate** — message Dodie with cause + resolution.
5. **Document** — `CHANGELOG.md` entry; if user data was affected, treat per `PRIVACY-NOTES.md` §9.

## 7. Adding new content

### A new blog post

1. `searchfit-seo:content-brief` to outline.
2. `ultimate-seo-writer` to draft.
3. Self-critique trio.
4. Drop into `src/content/insights/` as `<slug>.md` with required frontmatter.
5. PR → `main`; auto-deploy.

### A new page (e.g., a workshop landing page)

1. Update `PRD.md` §6 site map.
2. Add a new ADR if architecture shifts.
3. Add the route in `src/pages/`.
4. Update internal linking (`SEO-PLAN.md` §4).
5. Run QA checklist subset (content + SEO + a11y).

### A new testimonial

1. Confirm written permission from the client.
2. Add to `src/content/testimonials/` as a data file.
3. Crop avatar to circular orb.
4. Deploy.

## 8. Performance budget enforcement

If Lighthouse Performance drops below **90** in a monthly review:

1. Identify the heaviest recent change (image, third-party script, font).
2. Optimize or remove.
3. Re-test.

Hard ceilings (from `TECH-SPEC.md` §9):

- LCP ≤ 2.0s
- CLS ≤ 0.05
- INP ≤ 100ms
- Total JS gzipped ≤ 80KB on any page

## 9. Communication norms with Dodie

- **Weekly Friday note** (1 paragraph) summarizing the week's site activity.
- **Monthly 1-page report** (the report template).
- **Quarterly strategy call** (30 minutes) to plan the next quarter.
- **Ad hoc:** anything urgent or strategy-shifting.

## 10. Out of scope for retainer

- Major redesigns / rebranding.
- New service-line landing pages beyond the existing site map.
- Migration to a different CMS or platform.
- Paid-ads campaign creative / management.
- Video production.

*(Any of these can be a separate engagement with its own scope and proposal.)*

---

*Last updated: 2026-05-17 — STUB. Refine after first 90 days of retainer experience.*
