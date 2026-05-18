# PRIVACY-NOTES — dodiekendall.com

> Data flow, retention, and Privacy Policy notes for the site.
> Status: **STUB — outline ready, full Privacy Policy text needs counsel/template review before launch.**

---

## 1. Data we collect

| Data | Where | Why | Where it ends up |
| --- | --- | --- | --- |
| Form submissions (name, email, phone, message, consents) | `/contact`, `/lead-magnet` | Respond to inquiry; deliver lead magnet | Dodie's GHL subaccount |
| Booking data (name, email, phone, deposit) | GHL calendar iframe on `/book` | Schedule the session | Dodie's GHL subaccount (GHL handles this directly) |
| Analytics events (page views, button clicks, form submits) | All pages | Improve the site | Plausible (anonymized, no cookies, no cross-site tracking) |
| Server logs (IP, user agent, request path, timestamp) | Cloudflare Pages | Operational | Cloudflare logs (default retention) |

## 2. Data we do NOT collect

- No cookies (other than what Cloudflare's edge sets for security; no tracking cookies).
- No third-party advertising pixels (no Facebook Pixel, no Google Ads tag).
- No session recording (no Hotjar, FullStory, etc.).
- No reverse-sync from GHL — the site never reads contact data back out.

## 3. Third parties with data access

| Service | Data | Purpose | Privacy posture |
| --- | --- | --- | --- |
| GoHighLevel | Contact form data, lead-magnet emails, booking data | CRM, calendar, automation | Dodie's account; GHL is the data processor; Dodie is the controller |
| Plausible Analytics | Anonymized event data | Site analytics | GDPR-friendly, EU-hosted, no PII, no cookies |
| Cloudflare | Edge traffic, security logs | Hosting, DNS, edge | Standard hosting agreement |
| Resend / Postmark (TBD) | Fallback email recipient + payload | Send email when GHL fails | Transactional email only |

## 4. Cookies

- The site sets no first-party cookies for tracking.
- Cloudflare may set a `__cf_bm` cookie for bot mitigation (security; not consent-required in most jurisdictions but disclosed).
- No cookie banner needed for current configuration (Plausible is cookie-less).

## 5. User rights (GDPR / CCPA / state-level)

- Right to access: contact Dodie via `/contact`; she can export the relevant GHL record.
- Right to deletion: contact Dodie; she deletes the GHL contact.
- Right to opt out of marketing: every marketing email includes an unsubscribe link.
- California users: see CCPA addendum in `/privacy` (drafted at template-review time).

## 6. Retention

| Data | Retention |
| --- | --- |
| GHL contacts | Indefinite, per Dodie's GHL settings (client-controlled). |
| Server logs | Cloudflare default (typically 7 days for free tier). |
| Plausible analytics | 12 months by default. |
| Session recordings | Per `INTAKE-FORMS.md` — TBD with counsel. Default suggestion: 7 years (FL recordkeeping). |
| Lead-magnet email list | Until unsubscribed. |

## 7. Children's data

- The site is not directed at children under 18.
- No fields ask for age; if a user under 18 attempts to book, Dodie's intake will catch and decline.

## 8. Security

- Forms submit over HTTPS only.
- GHL API tokens never touch the client; only server-side endpoints know them.
- No PII in client-side JavaScript.
- Edge rate-limiting on all form endpoints (10 req/min/IP).

## 9. Data breach plan

> ⚠️ **TODO:** formalize at launch. Outline:
>
> 1. Detect (Cloudflare alerts, GHL anomalies).
> 2. Contain (rotate tokens, disable affected endpoints).
> 3. Assess scope (which records, what fields).
> 4. Notify (Dodie immediately; users per Florida breach-notification law and CCPA if applicable).
> 5. Document in `CHANGELOG.md` (sanitized) and a separate incident report.

## 10. Privacy Policy text

> ⚠️ **TODO:** Generate full Privacy Policy text via a vetted template service (e.g., Termly, iubenda) or counsel. The above notes inform the text; they are not the policy itself. Render at `/privacy`.

---

*Last updated: 2026-05-17 — STUB. Counsel/template review required before launch.*
