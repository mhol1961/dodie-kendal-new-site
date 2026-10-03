# ENV — dodiekendall.com

> Environment variable inventory: names and purposes ONLY. No values, no secrets.
> Actual values live in `wrangler.toml` `[vars]` (non-secret runtime), Cloudflare Worker Secrets (secret runtime), the build shell (build-time `SITE_URL` / `PUBLIC_*`), and developer `.dev.vars` files (never committed).
>
> Deploy procedure: see `HANDOFF.md` section 4.

---

## 1. Required (production)

| Variable | Type | Purpose | Owner |
| --- | --- | --- | --- |
| `GHL_PRIVATE_INTEGRATION_TOKEN` | secret | Dodie's GHL Private Integration Token. Used by `src/lib/ghl.ts` for all GHL API calls. Set as a Worker Secret. | Dodie (issued from her GHL subaccount). |
| `GHL_LOCATION_ID` | non-secret | Dodie's GHL location/subaccount ID. Required by some GHL endpoints. | Dodie. |
| `GHL_CALENDAR_ID` | non-secret | ID of Dodie's 5-hour QHHT booking calendar. Used in the `/book` iframe URL. | Dodie. |
| `LEAD_DB` | D1 binding (in `wrangler.toml`; schema in `migrations/`) | Free-guide abuse limits: one guide email per address per day, 5 sign-ups per IP per hour. Missing binding = no guide emails sent (logged). Apply schema: `npx wrangler d1 migrations apply dodie-lead-limits --remote`. | Agency. |
| `OPTIN_SECRET` | secret | Signs the free-guide double opt-in confirm links (`src/lib/optin.ts`). Rotating it invalidates unclicked confirm links (they still open the guide). Set as a Worker Secret. | Agency. |
| `TURNSTILE_SECRET_KEY` | secret | Cloudflare Turnstile secret for the free-guide sign-up. `/api/lead-magnet` rejects every sign-up without it. Set as a Worker Secret. | Agency (Cloudflare widget "Dodie Kendall QHHT - free guide sign-up"). |
| `PUBLIC_TURNSTILE_SITE_KEY` | non-secret, **build-time** | Turnstile site key (`0x4AAAAAAFM2euvUYEivwvlo`), inlined by `TurnstileWidget.astro`. Lives in the gitignored `.env.production` on the build machine; the production build fails without it. | Agency. |
| `GHL_WORKFLOW_CONTACT_AUTORESPONDER_ID` | non-secret | Workflow ID for the contact-form auto-responder. | Dodie. |
| `SITE_URL` | non-secret | Canonical site URL (e.g., `https://dodiekendall.com`). Used in canonicals, OG tags, schema. | Agency. |
| `PUBLIC_PLAUSIBLE_DOMAIN` | non-secret | Plausible domain (e.g., `dodiekendall.com`). Used by analytics tag in `Base.astro`. | Agency. |

## 2. Required for fallback email

Decided in ADR-003 (forthcoming). One of:

| Variable | Type | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | secret | Resend API key for fallback email (if Resend is chosen). |
| `POSTMARK_SERVER_TOKEN` | secret | Postmark server token (if Postmark is chosen). |
| `FALLBACK_EMAIL_TO` | non-secret | Recipient for fallback emails when GHL fails. Default: `dodiekendall@gmail.com`. |
| `FALLBACK_EMAIL_FROM` | non-secret | "From" address — must be a verified domain on the chosen provider. Default: `no-reply@dodiekendall.com`. |

## 3. Optional / future

| Variable | Type | Purpose |
| --- | --- | --- |
| `SENTRY_DSN` | secret | Error monitoring (if added Phase 2). |
| `LOGFLARE_API_KEY` | secret | Log shipping (if added Phase 2). |
| `BOOKING_CALENDAR_FALLBACK_URL` | non-secret | Direct GHL calendar URL surfaced if the iframe fails to load. |

## 4. Development conventions

- **Local development:** copy `.dev.vars.example` to `.dev.vars`, fill values, never commit. The Cloudflare platform proxy reads `.dev.vars`, so `/api/*` sees the same variables it gets in production.
- **Sandbox values:** use Dodie's sandbox/staging subaccount values during build. Swap to production at launch per `LAUNCH-CHECKLIST.md`.
- **Production — non-secret runtime:** `wrangler.toml` `[vars]`. These must live in the toml, not the dashboard: every `wrangler deploy` resets dashboard-set plain-text variables (Secrets are preserved).
- **Production — secrets:** Cloudflare Worker Secrets, set with `wrangler secret put` or the dashboard. Never in `wrangler.toml`.
- **Production — build-time:** `SITE_URL`, `PUBLIC_PLAUSIBLE_DOMAIN`, `PUBLIC_FB_PIXEL_ID` and `PUBLIC_TURNSTILE_SITE_KEY` are inlined by Astro during `npm run build` and must be present in the build shell. Neither `wrangler.toml` nor Worker Secrets can supply them; a build without them ships with no analytics and no ad attribution.
- **`PUBLIC_` prefix:** inlined into the client bundle. Never put anything sensitive behind it.

## 5. Rotation policy

| Variable | Cadence | Trigger |
| --- | --- | --- |
| `GHL_PRIVATE_INTEGRATION_TOKEN` | every 6 months | Or on any agency-staff change. |
| `RESEND_API_KEY` / `POSTMARK_SERVER_TOKEN` | every 12 months | Or on any compromise indicator. |
| `SENTRY_DSN` | as needed | Project-level secret; rotate if the DSN is exposed publicly. |

## 6. Never commit

- `.dev.vars`, `.env`, `.env.local`, `.env.*.local` are git-ignored (`.gitignore` covers this).
- No secrets in commit history. If a secret is accidentally committed, rotate it immediately and force-push a scrubbed history; document the incident in `CHANGELOG.md`.

---

*Last updated: 2026-05-17.*
