# LAUNCH-CHECKLIST — dodiekendall.com

> Day-of launch sequence: DNS, SSL, analytics, search consoles, smoke tests.
> Run after `QA-CHECKLIST.md` is all green.

---

## T-7 days

- [ ] All QA checks (`QA-CHECKLIST.md`) green.
- [ ] Dodie's final content + brand sign-off recorded.
- [ ] Counsel sign-off on Privacy Policy, Terms, intake forms, scope-of-practice language.
- [ ] All production env vars set in Cloudflare Pages (production environment).
- [ ] DNS plan reviewed (current vs. target).
- [ ] Backup of current GHL-hosted site captured (HTML scrape + screenshots) for archive.

## T-3 days

- [ ] GHL sandbox swapped to production credentials in CF Pages production env.
- [ ] Test booking on production env (in private mode, using a real email) succeeds end-to-end.
- [ ] All blog posts indexed by Google in staging? (Submit URL Inspector tool after cutover.)
- [ ] OG previews look correct on LinkedIn, X/Twitter, Facebook (use respective preview tools).

## T-1 day

- [ ] Final smoke pass: home, about, qhht, book, contact, faq, insights index, one insight post.
- [ ] Lighthouse run on production-env preview deploy: ≥ 95 / 100 / 100 / 100.
- [ ] Plausible script verified firing.
- [ ] Confirm Cloudflare Pages production branch is `main` and auto-deploy is on.

## T-0 (launch)

### Pre-cutover

- [ ] Current `dodiekendall.com` GHL site verified backed up.
- [ ] Cloudflare Pages production deploy is green on `main`.
- [ ] Target DNS records prepared in Cloudflare DNS:
  - `dodiekendall.com` → CNAME → `<cf-pages-target>.pages.dev`
  - `www.dodiekendall.com` → CNAME → `dodiekendall.com` (or redirect rule)

### Cutover (estimated 15 minutes)

- [ ] Update DNS in Cloudflare zone — apex CNAME flatten + www redirect.
- [ ] Wait for DNS propagation (typically < 5 min on Cloudflare).
- [ ] Verify Cloudflare Universal SSL is active for `dodiekendall.com` and `www.dodiekendall.com` (Full strict).
- [ ] Verify Cloudflare Pages production domain is correctly bound.

### Post-cutover smoke (within 1 hour)

- [ ] `https://dodiekendall.com` loads and shows the new site.
- [ ] `https://www.dodiekendall.com` 301-redirects to apex.
- [ ] All 7 primary pages load (`/`, `/about`, `/qhht`, `/book`, `/contact`, `/faq`, `/insights`).
- [ ] All blog posts load.
- [ ] `/privacy` and `/terms` load.
- [ ] Booking iframe loads and a real booking goes through.
- [ ] Contact form submits successfully (test it).
- [ ] Lead-magnet form submits successfully (test it).
- [ ] Plausible shows the test traffic.
- [ ] GSC: submit `https://dodiekendall.com/sitemap.xml`.
- [ ] Bing Webmaster: submit sitemap.
- [ ] Google Rich Results Test on home + a blog post: validate.

### Communications

- [ ] Email Dodie: "You're live. Here are next-day, next-week, next-month expectations."
- [ ] Post launch announcement on Dodie's Facebook (Dodie-owned channel).
- [ ] Internal: log launch in `CHANGELOG.md`; tag the commit as `v1.0.0`.

## Day-1 follow-up

- [ ] Verify booking calendar conversions are arriving in GHL production.
- [ ] Verify lead-magnet email is being delivered (test with a real inbox).
- [ ] Watch Plausible for any unexpected 404s; fix immediately.
- [ ] Run `searchfit-seo:broken-links` one more time on production.

## Rollback plan

If anything breaks catastrophically:

1. Revert the DNS records in Cloudflare to the previous GHL targets.
2. Wait for DNS propagation (~5 minutes).
3. Confirm the old GHL site is reachable.
4. Diagnose the issue on the CF Pages deploy without time pressure.
5. Document in `CHANGELOG.md` as a rollback event.

---

*Last updated: 2026-05-17 — STUB. Refine as we learn launch-specific quirks.*
