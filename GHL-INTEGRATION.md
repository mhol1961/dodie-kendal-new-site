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

All writes go through `upsertContact` in `src/lib/ghl.ts`, in three steps:

1. `POST /contacts/upsert` with the **email only**. Name and phone never take part in
   matching: GHL can also deduplicate on phone, so an untrusted phone could merge a new
   email into someone else's contact.
2. `GET /contacts/{id}` for the full record. The upsert reply isn't guaranteed to include
   every field; an omitted field is treated as unknown, never blank. If this read fails,
   email opt-out status is unknown and **no guide email is sent**.
3. `PUT /contacts/{id}` with **only the fields the contact doesn't have yet**: identity
   (`firstName`, `lastName`, `phone`, `source`) and custom fields. Anyone can type someone
   else's email, so a public form never renames, re-attributes, or replaces an existing
   consent or message. Best-effort; a phone GHL rejects is retried without it.

Every submission is also stored as an **append-only contact note** (message + consent
records), so the full history survives even though fields are first-write-only.

Custom fields are written by id from `FIELD_IDS` in `src/lib/ghl.ts` (typed keys).
GHL **silently drops unknown custom-field keys** with a 200, so a new field must be
created in GHL and added to `FIELD_IDS` first. Fields in use: `your_message`
(pre-existing "Your Message"), `consent_marketing`, `consent_transactional` (created
via API 2026-10-03, large text).

**Free guide = double opt-in** (2026-10-03). Sign-up records `consent_marketing` as
`Pending email confirmation | ...` and tags `optin_pending`. The guide email's button is a
signed confirm link (`/api/confirm-optin`) that writes `Yes | ... confirmed by email link`,
tags `optin_confirmed`, removes `optin_pending`, and opens the guide. GHL marketing
workflows must skip contacts tagged `optin_pending` (workflow filters are GHL-UI only).
The quiz and contact forms stay single opt-in (explicit checkbox).

Consent fields hold an auditable record: `Yes | <form> | <ISO time> | "<exact wording shown>"`.

### Contact form → GHL contact

| Form field | GHL field | Notes |
| --- | --- | --- |
| Full Name | `firstName` + `lastName` | Trimmed, split on first whitespace. |
| Email | `email` | Required; lowercased server-side. |
| Phone (optional) | `phone` | As entered. |
| Message | `your_message` + a contact **note** | Field holds the latest message; the note keeps every one. |
| Consent: marketing | `consent_marketing` | Consent record (Yes/No). |
| Consent: transactional | `consent_transactional` | Consent record. Required. |
| Source | `source` | `"website_contact_form"`. |
| Tags | applied via secondary call | `["site_contact", "site_v2"]`. |

### Lead-magnet (free guide) form → GHL contact

| Form field | GHL field | Notes |
| --- | --- | --- |
| Email | `email` | Required; trimmed + lowercased. No name is asked. |
| Consent: marketing | `consent_marketing` | Consent record naming the form (`gate` or `free-guide`) and its wording. |
| Source | `source` | `"website_lead_magnet"` (only if the contact had none). |
| Tags | applied via secondary call | `["site_lead_magnet", "site_v2"]`. |

Guide email: sent by the endpoint itself, at most once per address per 24h, skipped for
contacts who opted out of email. Per-IP cap: 5 sign-ups/hour (counted after Turnstile).
Both limits live in the `LEAD_DB` D1 database (`src/lib/guide-limits.ts`, schema in
`migrations/`), each as one atomic SQLite upsert. If D1 is down the IP cap fails open and
the guide email is not sent (the page still shows the link). Tags are best-effort: only
a failed upsert counts as a lost lead.

### Ad attribution (all three forms)

`AttributionCapture.astro` stores `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`,
`utm_term` and `fbclid` from the landing URL for the visit; every form sends them.
- Written to GHL custom fields with **exactly those keys** (Text fields), looked up by key
  at runtime, first touch wins (blank fields only). **None exist yet**: until they are
  created in GHL, the values are only in the contact's note ("Ad source: ...").
- Tag `source_facebook_instagram` when there's an fbclid or utm_source names
  Facebook/Instagram.
- Successful submissions fire Meta `Lead` (no-op until `PUBLIC_FB_PIXEL_ID` is set).

### QHHT quiz → GHL contact

`consent_marketing` holds the quiz's consent record; everything else is in `src/pages/api/quiz.ts`.

## 5. Workflows (provisioned in GHL, referenced by ID)

| Workflow | Trigger | What it does | Env var |
| --- | --- | --- | --- |
| Contact-form auto-responder | Site → `/api/contact` | Sends Dodie an internal email with the message; sends sender a "I'll write back within 24–48 hours" confirmation. | `GHL_WORKFLOW_CONTACT_AUTORESPONDER_ID` |
| Lead-magnet delivery | Site → `/api/lead-magnet` | Not a workflow: the endpoint upserts the contact, tags `site_lead_magnet` + `site_v2`, then emails the guide link itself via the GHL conversations API (subject "Your free QHHT prep guide is here"), on every sign-up including returning contacts. | n/a |
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
- Third-party scripts: Cloudflare Turnstile (spam check), Cloudflare Web Analytics and the Meta Pixel (each only when its build variable is set), and the GHL chat widget.

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
