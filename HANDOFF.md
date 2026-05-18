# HANDOFF — dodiekendall.com

> Client handoff doc — used at transition from build to retainer, or to a future agency.
> Status: **STUB — fill at launch.**

---

## 1. What you have

A complete website at `https://dodiekendall.com` consisting of:

- 7 primary pages (Home, About, QHHT, Book, Contact, FAQ, Insights index)
- N blog posts under `/insights/[slug]`
- Privacy Policy and Terms & Conditions pages
- A booking flow that uses your existing GoHighLevel calendar
- A lead-magnet email gate that delivers your pre-session prep guide
- A contact form that creates contacts in your GHL subaccount

The site is built with Astro (a modern static-site framework), hosted on Cloudflare Pages.

## 2. What you own

- **Your domain** (`dodiekendall.com`) — registered in your name.
- **Your GHL subaccount** — contains all contacts, automations, and the calendar that powers booking.
- **The website code** — this repository.
- **All content** — copy, images, blog posts, the prep guide PDF.
- **Your analytics data** — Plausible account.
- **All third-party accounts** (Google Search Console, Bing Webmaster, etc.) under your email.

## 3. What IntellaGrow holds (operational)

- The deployment pipeline (Cloudflare Pages project bound to the GitHub repo).
- The GitHub repository (you have admin access; we maintain).
- The fallback transactional email account (Resend or Postmark) — your domain, our agency-managed account; transferable on request.

## 4. Access keys / credentials

> ⚠️ **TODO:** fill at launch.

| Service | Account | Who has it |
| --- | --- | --- |
| GoHighLevel | Dodie's subaccount | Dodie (primary); IntellaGrow (delegated user with limited scope) |
| Cloudflare Pages | dodiekendall-com project | IntellaGrow (operations); Dodie (read access via shared org) |
| Cloudflare DNS | dodiekendall.com zone | Dodie (registrant); IntellaGrow (admin user) |
| GitHub repo | IntellaGrow org | IntellaGrow (maintainer); Dodie (admin invite) |
| Plausible | dodiekendall.com property | Dodie + IntellaGrow |
| Google Search Console | dodiekendall.com property | Dodie (owner) + IntellaGrow (delegated) |
| Bing Webmaster | dodiekendall.com property | Dodie (owner) + IntellaGrow (delegated) |
| Resend / Postmark | TBD | IntellaGrow (managed) |

## 5. Operating instructions

### To publish a new blog post (with IntellaGrow on retainer)

You write the rough idea or a few notes; send to Mark. We draft per `BRAND-VOICE.md`, run the self-critique trio, and ship.

### To publish a new blog post (after retainer ends, optional Phase 2 path)

If you've opted into the headless CMS layer, log in at `cms.dodiekendall.com`, click "New post," type the post, click "Publish." (Setup required — Phase 2 candidate.)

### To update a static page (About, FAQ, etc.)

With retainer: send Mark the change.
Without retainer: requires a developer or the CMS layer above.

### To check site health

- Status: Cloudflare Pages dashboard.
- Traffic: Plausible dashboard.
- Search: Google Search Console + Bing Webmaster.

### To rotate the GHL token

(Per `ENV.md`.) Generate a new Private Integration Token in GHL → update in Cloudflare Pages env vars → redeploy. Document in `CHANGELOG.md`.

## 6. Recurring obligations

| Task | Cadence | Owner | Why |
| --- | --- | --- | --- |
| Cloudflare Pages hosting | Free tier (current usage) | Dodie/IntellaGrow | Hosting |
| Domain renewal | Annually | Dodie | Don't let this lapse. |
| SSL renewal | Auto (Cloudflare) | Cloudflare | No action. |
| Plausible subscription | Monthly | Dodie/IntellaGrow | Analytics. |
| Resend/Postmark | As-used | IntellaGrow | Fallback email. |
| Counsel review of legal docs | Annually | Dodie + counsel | Compliance. |
| GHL subscription | Monthly | Dodie | CRM. |

## 7. Where to find documentation

Every aspect of the site is documented in this repo:

- Vision/business: `PRD.md`
- Technical: `TECH-SPEC.md`, `CLAUDE.md`, `ADR/`, `ENV.md`
- Visual: `DESIGN.md`
- Voice: `BRAND-VOICE.md`, `COPY-DECK.md`
- SEO: `SEO-PLAN.md`, `KEYWORDS.md`, `SCHEMA.md`
- Integrations: `GHL-INTEGRATION.md`
- Compliance: `COMPLIANCE.md`, `LEGAL-DISCLAIMERS.md`, `INTAKE-FORMS.md`, `PRIVACY-NOTES.md`
- Operations: `MAINTENANCE-GUIDE.md`, `POST-LAUNCH-PLAN.md`, `QA-CHECKLIST.md`, `LAUNCH-CHECKLIST.md`
- History: `CHANGELOG.md`, `ROADMAP.md`, `BACKLOG.md`

If anyone — any future developer, any future agency, you yourself — needs to make a change, they should be able to read the relevant doc and proceed without needing to interview the original team.

## 8. Contact for build-related questions

Mark Holland · IntellaGrow · mhollandanalyst@gmail.com

---

*Last updated: 2026-05-17 — STUB. Fill at launch with actual credentials and current state.*
