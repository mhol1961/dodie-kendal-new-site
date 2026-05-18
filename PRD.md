# PRD — dodiekendall.com

> Product Requirements Document for the Dodie Kendall QHHT practice site rebuild.
> Audience: agency team, client (Dodie Kendall), and AI agents executing the build.

---

## 1. Background

Dodie Kendall is an active QHHT (Quantum Healing Hypnosis Technique) practitioner based in Palm Beach County, Florida. Her current site (`dodiekendall.com`) is hosted on GoHighLevel and reads as a templated brochure: hero text, single portrait, three testimonials, a GHL calendar embed, and a contact form. It does not build the level of trust required to convert a cold visitor into a $300 / 5-hour session client.

This rebuild is the **first of two sister-site rebuilds** for the same client. The other site, guidingwinds-unplug.com (sailing/adventure brand), is a separate engagement in a separate repo. Visual identity is intentionally distinct between the two; they share only an agency operating standard.

## 2. Goals

### Primary

1. **Increase qualified booking conversions** on the existing GHL calendar by raising the perceived legitimacy, warmth, and safety of the practice.
2. **Move hosting off GoHighLevel** to a modern static stack the agency can iterate on quickly.
3. **Establish a content layer (blog/Insights)** that compounds organic visibility for QHHT-related queries over time.

### Secondary

4. Tighten the brand voice from generic-spiritual to **specifically Dodie** (ex-Catholic, ex-Pentecostal, "Sacred Technology," "I am the invitation, not the insistence").
5. Reduce wall-of-text density throughout the site; bring text walls into modular, scannable sections.
6. Add a compliant intake / consent flow appropriate for a hypnosis modality.

### Non-goals (this engagement)

- The Guiding Winds Unplug rebuild (separate repo, separate brand).
- A full headless CMS migration (an Astro content collection covers blog needs day one; CMS layer is a Phase 2 option).
- Custom logo redesign (existing coral/pink wordmark stays; minor refinements only).
- Migrating historical GHL contacts (Dodie's GHL retains her data; we only redirect new form submissions to it).

## 3. Success metrics

| Metric | Baseline (current GHL site) | 90-day target | Measurement |
| --- | --- | --- | --- |
| Booking-page → calendar-form-start rate | unknown (no GA on current site) | ≥ 35% | Plausible event |
| Calendar-form-start → completed-booking rate | unknown | ≥ 55% | GHL booking confirmation |
| Bounce rate on homepage | unknown | ≤ 50% | Plausible |
| Avg. time on About page | unknown | ≥ 1:30 (vs. assumed sub-30s for current wall-of-text) | Plausible |
| Lead-magnet email opt-in rate | n/a (no opt-in today) | ≥ 4% of homepage sessions | GHL contact created with `source=lead_magnet` |
| Organic clicks (Google + Bing) | low (no SEO baseline) | +200% by Day 90 from launch | Search Console |
| Indexed AI mentions for "QHHT Palm Beach" / "QHHT Florida" | unknown | brand surfaces in ≥ 2 of ChatGPT/Perplexity/Gemini answers | manual AI-visibility audit |
| Lighthouse: Performance / SEO / A11y / Best Practices | n/a | ≥ 95 / 100 / 100 / 100 | Lighthouse mobile run |

## 4. Audience

### Primary persona — "Sarah, 47, the seeker who's tried everything"
- Female, 35–65 (skews 40–60).
- Has done therapy, journaling, meditation apps, possibly Reiki or other modalities.
- Curious about past-life work but cautious — wants to know the practitioner is "real."
- Decision triggers: testimonials with specifics (physical pain that lifted, clarity gained), grounded practitioner voice (not "woo"), clear understanding of what happens in a session.
- Decision blockers: vague claims, mystical aesthetic, fear of being scammed or manipulated.

### Secondary persona — "Linda, 58, the believer with a specific question"
- Female, 50–70.
- Already convinced QHHT is real; wants to find a practitioner she trusts in or near Florida.
- Decision triggers: certification, lineage to Dolores Cannon's work, ease of booking.
- Decision blockers: site that feels like a directory; lack of personal voice.

### Tertiary persona — "Mike, 39, the curious skeptic"
- Male, 30–55, often a partner of someone in the primary persona.
- Reads carefully; needs the science-adjacent framing ("Sacred Technology," "guided meditation," "subconscious" rather than "channeling").
- Decision triggers: clear FAQ, no overclaiming, transparent pricing.

## 5. Conversion funnel

```
Home / Blog / Search →
  Hero hook ("Access Your Higher Wisdom...") →
    Pull quote (interrupt) →
      "What is QHHT" section (3-step) →
        Founder Spotlight + bio CTA →
          Lead-magnet gate ("Pre-Session Prep Guide") →
            Testimonial grid →
              Closing CTA →
                /book →
                  Pre-embed reassurance →
                    GHL calendar embed →
                      Booking confirmed → GHL workflow
```

**Two-stage capture:**
- Soft conversion: lead-magnet email opt-in (low commitment, builds list, GHL nurture sequence).
- Hard conversion: direct booking with $50 deposit (current Dodie flow, preserved as-is).

Discovery call CTA exists as a secondary path on `/contact` but is **not** the primary CTA anywhere on the home page.

## 6. Site map

- `/` — Home
- `/about` — Dodie's story
- `/qhht` — What QHHT is + What to expect in a session
- `/book` — Booking (GHL calendar embed)
- `/contact` — Contact form + discovery-call CTA
- `/faq` — FAQ accordion (with `FAQPage` schema)
- `/insights` — Blog index
- `/insights/[slug]` — Blog post
- `/privacy` — Privacy policy
- `/terms` — Terms & conditions
- `/intake` *(optional Phase 2)* — Pre-session intake form / consent

## 7. Page hierarchy & content responsibilities

| Page | Primary job | Key sections | Schema |
| --- | --- | --- | --- |
| `/` | Earn trust + funnel to /book | Hero, Pull Quote, What is QHHT (3-step), Founder Spotlight, Lead Magnet, Testimonials, Closing CTA | `LocalBusiness`, `Person`, `WebSite` |
| `/about` | Establish Dodie's credibility + voice | Hero, story chapters (4–6), pull quotes, credentials, closing CTA | `Person`, `AboutPage` |
| `/qhht` | Educate + de-mystify | What is QHHT, What to expect timeline, FAQ accordion, CTA | `Service`, `FAQPage` |
| `/book` | Close the booking | Reassurance copy, GHL calendar embed, what-happens-next 3-step, privacy note | `Service`, `Reservation` |
| `/contact` | Capture inquiries | Brief intro, form, phone/email fallback, hours | `ContactPage` |
| `/faq` | Answer pre-call objections | Categorized accordion (Sessions / Logistics / Practice) | `FAQPage` |
| `/insights` | Compound SEO over time | Card grid index | `Blog` |
| `/insights/[slug]` | Rank for QHHT long-tail queries | Title, byline, hero image, prose, pull quotes, related posts | `BlogPosting` |

## 8. Content inventory (existing vs. needed)

See [CONTENT-INVENTORY.md](./CONTENT-INVENTORY.md) for the running checklist. Summary:

- ✅ Bio / personal story — exists, needs structural rewrite.
- ✅ Headshot — single portrait exists.
- ✅ Testimonials — 3 exist, need 3–7 more.
- ✅ Hero copy — exists, needs tighten.
- ❌ Pre-session prep guide (lead magnet) — needs creation.
- ❌ FAQ content — needs creation (10–20 Q/A).
- ❌ Blog posts — first 4 posts to draft pre-launch via `ultimate-seo-writer`.
- ❌ Lifestyle photography — need 4–6 secondary shots (Dodie in space, hands, ambient).
- ❌ Intake / consent forms — see `INTAKE-FORMS.md`.

## 9. Integrations

- **GHL (CRM + calendar):** Dodie's existing subaccount. Forms → contacts; tag `source=site_{form_name}`; booking workflow unchanged. Full mapping in `GHL-INTEGRATION.md`.
- **Plausible (analytics):** event tracking for conversion funnel.
- **Google Search Console + Bing Webmaster:** verification and sitemap submission per `LAUNCH-CHECKLIST.md`.
- **Cloudflare (hosting + DNS):** Pages for hosting; DNS managed in Cloudflare zone.
- **Email delivery (lead magnet):** GHL workflow sends the prep guide PDF as an email asset.

## 10. Compliance & legal

QHHT is a hypnosis-adjacent modality. The site cannot:

- Claim to diagnose, treat, cure, or prevent any disease.
- Claim medical efficacy.
- Use the title "therapist" or "psychotherapist" (unless Dodie holds an applicable license — she does not).
- Replace medical or psychological care.

The site **must:**

- Include a "Not medical advice" disclaimer on every page where outcomes are referenced (footer + booking + about pages at minimum).
- Surface informed-consent language before booking (in the booking-page reassurance copy and the intake form).
- Comply with Florida state regulations on alternative healing modalities (see `COMPLIANCE.md`).

Full requirements in `COMPLIANCE.md`, `LEGAL-DISCLAIMERS.md`, `INTAKE-FORMS.md`, `PRIVACY-NOTES.md`.

## 11. Constraints

- **Brand identity:** existing coral/pink wordmark stays; secondary brand expressions follow `DESIGN.md`.
- **Sister-site distinctness:** must read as visually distinct from guidingwinds-unplug.com.
- **Booking flow:** preserve existing GHL calendar (5-hour, $300, $50 deposit) — don't break Dodie's automation.
- **No GHL hosting / no GHL page builder.**
- **No purple-pink, no Inter as display, no carousel sliders.**
- **WCAG 2.1 AA** baseline; AAA where reachable.

## 12. Out of scope

- Multi-language i18n (could be added in Phase 2 if Dodie expands).
- Online intake e-signature (DocuSign-style) — Phase 2; intake delivered as PDF + GHL form for now.
- Membership / paid digital products (Phase 2 candidate).

## 13. Phased delivery

- **Phase 0 — Discovery + Doc Suite** (this kickoff session). ✅ in progress.
- **Phase 1 — Build & Content** (target: 2 weeks). All pages, copy, blog seed (4 posts), integrations live on a staging URL.
- **Phase 2 — Pre-Launch QA** (target: 3 days). Full QA pass per `QA-CHECKLIST.md`; self-critique trio; client review.
- **Phase 3 — Launch** (target: 1 day). DNS cutover, post-launch verification per `LAUNCH-CHECKLIST.md`.
- **Phase 4 — Post-Launch / Retainer** (ongoing). Per `POST-LAUNCH-PLAN.md` and `MAINTENANCE-GUIDE.md`.

---

*Last updated: 2026-05-17.*
