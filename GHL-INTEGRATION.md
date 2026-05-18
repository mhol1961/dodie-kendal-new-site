# GHL-INTEGRATION — dodiekendall.com

> How the site integrates with Dodie's GoHighLevel subaccount.
> Pair with `ADR-002-crm-integration-pattern.md` (the decision) and `ENV.md` (variables).

---

## 1. Ownership & boundaries

**Subaccount owner:** Dodie Kendall.
**Subaccount holder of record:** Dodie's own GHL account — NOT the IntellaGrow agency subaccount. (Hard rule.)

**What lives in GHL:**
- The contacts database (all leads + booked clients)
- The 5-hour QHHT session calendar with $50 deposit / $300 total
- Email + SMS automation workflows
- Tagging conventions

**What the website (this repo) does:**
- POSTs new contacts to GHL via the public API
- Triggers a small set of named workflows (lead magnet, contact-form auto-responder)
- Embeds the existing GHL calendar iframe on `/book`
- Never reads contact data back out of GHL (no reverse sync)

## 2. Authentication

- **Method:** Private Integration Token (issued from Dodie's GHL subaccount Settings → My Staff → API Keys / Private Integrations).
- **Storage:** `GHL_PRIVATE_INTEGRATION_TOKEN` env var, set in Cloudflare Pages environment (production + preview).
- **Scope:** least-privilege — only the scopes we actually call (contacts.write, workflows.execute).
- **Rotation:** rotate every 6 months or on any agency-staff change.

## 3. Endpoints used

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/contacts/` | Upsert contact (idempotent by email). |
| POST | `/contacts/{contactId}/tags` | Apply source tag(s). |
| POST | `/contacts/{contactId}/workflow/{workflowId}` | Enroll contact in a workflow. |

Base URL: `https://services.leadconnectorhq.com` (current at 2026-05-17 — verify in Dodie's GHL API docs at integration time).

Headers on every request:
```
Authorization: Bearer ${GHL_PRIVATE_INTEGRATION_TOKEN}
Content-Type: application/json
Version: 2021-07-28  /* lock to a known API version; bump deliberately */
```

## 4. Field mappings

### Contact form → GHL contact

| Form field | GHL field | Notes |
| --- | --- | --- |
| Full Name | `firstName` + `lastName` | Split on first whitespace. |
| Email | `email` | Required; lowercased server-side. |
| Phone (optional) | `phone` | E.164 normalization if supplied. |
| Message | `customField.contact_message` | Custom field; provision in GHL UI before launch. |
| Consent: marketing | `customField.consent_marketing` | Boolean. |
| Consent: transactional | `customField.consent_transactional` | Boolean. Required. |
| Source | `source` | `"website_contact_form"`. |
| Tags | applied via secondary call | `["site_contact", "site_v2"]`. |

### Lead-magnet form → GHL contact

| Form field | GHL field | Notes |
| --- | --- | --- |
| First Name | `firstName` | Required. |
| Email | `email` | Required; lowercased. |
| Consent: marketing | `customField.consent_marketing` | Required: `true`. |
| Source | `source` | `"website_lead_magnet"`. |
| Tags | applied via secondary call | `["site_lead_magnet", "site_v2"]`. |

## 5. Workflows (provisioned in GHL, referenced by ID)

| Workflow | Trigger | What it does | Env var |
| --- | --- | --- | --- |
| Contact-form auto-responder | Site → `/api/contact` | Sends Dodie an internal email with the message; sends sender a "I'll write back within 24–48 hours" confirmation. | `GHL_WORKFLOW_CONTACT_AUTORESPONDER_ID` |
| Lead-magnet delivery | Site → `/api/lead-magnet` | Sends sender the pre-session prep guide PDF; enrolls in 14-day, 4-touch nurture sequence. | `GHL_WORKFLOW_LEAD_MAGNET_ID` |
| Booking confirmation (existing) | GHL calendar booking | Dodie's existing workflow; we don't change it. | n/a (managed in GHL) |

## 6. Tag taxonomy

- `site_v2` — anyone captured by the new (this) site. Always applied.
- `site_contact` — captured via the contact form.
- `site_lead_magnet` — captured via the lead-magnet gate.
- `site_booking` — applied by GHL when they complete a booking (existing tag).
- `consent_marketing_true` / `consent_marketing_false` — denormalized for filtering.

## 7. API client behavior (`src/lib/ghl.ts`)

```ts
// pseudo-shape — actual implementation in src/lib/ghl.ts
export interface GhlClient {
  upsertContact(payload: ContactPayload): Promise<{ id: string }>;
  applyTag(contactId: string, tag: string): Promise<void>;
  triggerWorkflow(contactId: string, workflowId: string): Promise<void>;
}

// Retry policy: 1 retry on 5xx, 500ms backoff.
// On final failure, the calling endpoint posts a fallback email
// to dodiekendall@gmail.com via the configured transactional service.
```

## 8. Calendar embed

- The `/book` page embeds Dodie's existing GHL calendar via iframe inside `BookingEmbed.astro`.
- iframe URL: `https://api.leadconnectorhq.com/widget/booking/<DODIES_CALENDAR_ID>` (or the embed URL GHL provides in the calendar's "Embed" tab).
- Calendar ID stored as `GHL_CALENDAR_ID` env var (not secret — but kept in env for consistency).
- iframe is `loading="lazy"`, `referrerpolicy="strict-origin-when-cross-origin"`.
- We surround the iframe with our reassurance copy and pricing summary (per `COPY-DECK.md`); we don't modify the iframe contents.

## 9. Data we do NOT collect or store on our side

- The website never persists contact data anywhere except by sending it to GHL.
- No website-side database, no localStorage of PII, no third-party form services.
- Plausible analytics is the only third-party script — and it sees only anonymized event data.

## 10. Sandbox / staging

- A separate sandbox subaccount (Dodie's own staging subaccount OR a free trial) is used during build to verify the integration without polluting her production contacts.
- Env vars `GHL_PRIVATE_INTEGRATION_TOKEN`, `GHL_WORKFLOW_*`, `GHL_CALENDAR_ID` are set to sandbox values during build and swapped at launch per `LAUNCH-CHECKLIST.md`.

## 11. Failure modes & mitigations

| Failure | Behavior |
| --- | --- |
| GHL API 5xx | Retry once with 500ms backoff. On second failure, send fallback email to `dodiekendall@gmail.com` via Resend/Postmark (per ADR-003), return 502 to caller. |
| GHL API 4xx (e.g., invalid token) | Log to monitoring, send fallback email, return 502 to caller. |
| Calendar iframe blocked | Surface a friendly fallback message with phone + email + a direct calendar URL. |
| Network timeout from CF edge | 30s timeout; fall back to email. |

---

*Last updated: 2026-05-17. Verify endpoint URLs in Dodie's GHL API docs at integration time — GHL has been migrating endpoints.*
