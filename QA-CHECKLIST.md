# QA-CHECKLIST — dodiekendall.com

> Pre-launch quality assurance grid.
> Walk top to bottom before the launch checklist.

---

## 1. Content

- [ ] Every page has a unique `<title>` (≤ 60 chars).
- [ ] Every page has a unique `<meta name="description">` (≤ 155 chars).
- [ ] Every page has a `<h1>` and only one `<h1>`.
- [ ] Heading hierarchy is correct (no `<h3>` before `<h2>`, etc.).
- [ ] No placeholder text remains anywhere (lorem ipsum, "TODO", "XXX").
- [ ] Phone number is correct on every page: **1-561-201-6918**.
- [ ] Email is correct on every page: **dodiekendall@gmail.com**.
- [ ] Pricing is correct on every page: **$300 total, $50 deposit, 5-hour session**.
- [ ] Studio location is correct on every page: **Palm Beach County, FL**.
- [ ] All testimonials have explicit client permission to publish with name/city.
- [ ] All blog posts pass `ultimate-seo-writer` final check.

## 2. Brand voice

- [ ] No banned phrases (`BRAND-VOICE.md` §3 "Don't use" list).
- [ ] No medical-claim language anywhere.
- [ ] Pull quotes match Dodie's actual phrasing.
- [ ] `marketing:brand-review` pass returns no severity-high findings.

## 3. Visual design

- [ ] No Inter as display anywhere.
- [ ] No purple-pink gradients anywhere.
- [ ] No carousel sliders anywhere.
- [ ] Colors match `DESIGN.md` tokens (oklch values).
- [ ] All buttons are pill-shaped per `radii.pill`.
- [ ] All photos use organic-mask / pill shapes (no hard rectangles for portraits).
- [ ] `design:design-critique` pass returns no severity-high findings.
- [ ] `theme-factory` review confirms tokens render correctly.

## 4. Accessibility (WCAG 2.1 AA minimum)

- [ ] All images have meaningful `alt` text (or `alt=""` if decorative).
- [ ] Color contrast ≥ 4.5:1 for body text, ≥ 3:1 for large text — verified for every documented color combo.
- [ ] Focus-visible ring on every interactive element.
- [ ] Keyboard-traversable navigation, forms, and accordion.
- [ ] `prefers-reduced-motion: reduce` honored on every animation.
- [ ] Form errors are announced to screen readers (aria-live).
- [ ] Skip-to-content link in `Header.astro`.
- [ ] `design:accessibility-review` pass returns no AA failures.

## 5. Forms

- [ ] Contact form submits successfully to a GHL sandbox contact.
- [ ] Lead-magnet form submits successfully and triggers the lead-magnet workflow.
- [ ] Honeypot field rejects automated submissions silently.
- [ ] Form validation errors display inline and accessibly.
- [ ] Success states show appropriate microcopy.
- [ ] Failure states surface a fallback (email + phone) so the user is never stuck.
- [ ] Required consent checkboxes block submission when unchecked.

## 6. Booking embed

- [ ] `/book` iframe loads on slow 3G in under 4 seconds.
- [ ] Test booking goes through to Dodie's GHL calendar.
- [ ] $50 deposit charge processes correctly in GHL.
- [ ] Booking confirmation email arrives to the test user.

## 7. SEO

- [ ] Every page has a canonical URL.
- [ ] Open Graph + Twitter Card tags present and unique per page.
- [ ] `og:image` is 1200×630 and renders correctly when previewed.
- [ ] `sitemap.xml` includes every canonical URL.
- [ ] `rss.xml` includes the Insights feed.
- [ ] `robots.txt` allows all and points to sitemap.
- [ ] JSON-LD validates in Google Rich Results Test for each page type.
- [ ] `searchfit-seo:seo-audit` returns no errors.
- [ ] `searchfit-seo:broken-links` returns zero broken links.
- [ ] Internal linking plan from `SEO-PLAN.md` §4 is in place.

## 8. Performance

- [ ] Lighthouse mobile: Performance ≥ 95.
- [ ] Lighthouse mobile: SEO = 100.
- [ ] Lighthouse mobile: Accessibility = 100.
- [ ] Lighthouse mobile: Best Practices = 100.
- [ ] LCP ≤ 2.0s on Moto G Power 4G.
- [ ] CLS ≤ 0.05 on all pages.
- [ ] Total JS gzipped ≤ 30KB on most pages (≤ 80KB on form pages).
- [ ] Hero images are WebP/AVIF and ≤ 100KB.
- [ ] Fonts self-hosted with `font-display: swap`.

## 9. Cross-browser

- [ ] Chrome (latest, latest-1) on desktop + Android.
- [ ] Safari (latest, latest-1) on macOS + iOS.
- [ ] Edge (latest).
- [ ] Firefox (latest).
- [ ] iOS Safari 15+ (graceful degradation acceptable).

## 10. Responsive

- [ ] 320px wide (smallest current mobile).
- [ ] 375px (iPhone SE).
- [ ] 768px (tablet).
- [ ] 1024px (small desktop).
- [ ] 1440px+ (desktop).
- [ ] No horizontal scroll on any breakpoint.
- [ ] Hamburger menu works on mobile.

## 11. Legal / compliance

- [ ] Footer disclaimer present on every page.
- [ ] Booking-page acknowledgment renders above the iframe.
- [ ] About-page credentials line present.
- [ ] Blog-post disclaimer renders on every post.
- [ ] Privacy Policy at `/privacy` is current and counsel-reviewed.
- [ ] Terms & Conditions at `/terms` is current and counsel-reviewed.
- [ ] All claim language passes `COMPLIANCE.md` rules.

## 12. Analytics

- [ ] Plausible script loads on production only.
- [ ] Key events fire: `cta_book_clicked`, `lead_magnet_submitted`, `contact_form_submitted`, `booking_iframe_loaded`.
- [ ] Goals configured in Plausible dashboard.

## 13. Security

- [ ] `Strict-Transport-Security`, `Content-Security-Policy`, `Referrer-Policy`, `Permissions-Policy` headers configured.
- [ ] No secrets in client-side bundles (grep for known token names).
- [ ] `.env*` files git-ignored.
- [ ] Cloudflare rate-limiting rules applied.

## 14. Sign-off

- [ ] Mark (IntellaGrow): all-pass sign-off.
- [ ] Dodie: copy + visual sign-off.
- [ ] Counsel: legal/compliance sign-off.

---

*Last updated: 2026-05-17 — STUB. Run end-to-end before each launch attempt.*
