# ADR-002 — CRM Integration Pattern: GoHighLevel via Public API, Client-Owned Subaccount

- **Status:** Accepted
- **Date:** 2026-05-17
- **Deciders:** Mark Holland (IntellaGrow)

## Context

Dodie Kendall has an active GoHighLevel subaccount that owns her calendar (5-hour QHHT session, $300 total, $50 deposit), her contact database, her email/SMS automation, and her booking workflow. Migrating off GHL is not in scope — GHL is the right CRM for her practice. The question is **how the new website integrates with it**.

Three patterns were considered:

1. **GHL hosts the site (current state).** Site lives entirely in GHL's page builder. ❌ Hard rule: not allowed.
2. **GHL via public API + iframe calendar (chosen).** Site is independent (Astro on Cloudflare Pages); forms POST to GHL via its public API; the existing GHL calendar is embedded as an iframe.
3. **Webhooks + custom contact store on our side.** Site stores contacts in our own database; webhooks sync to GHL one-way. ❌ Overkill, adds an attack surface, doesn't add value over option 2.

A second axis: **whose GHL subaccount owns the contacts.**

- **Mark's agency subaccount (IntellaGrow).** Contacts pile up under IntellaGrow's account; Dodie has indirect access. ❌ Violates client-data ownership boundary; hard rule.
- **Dodie's own subaccount (chosen).** Dodie owns her contacts, automations, billing, and pipeline outright.

## Decision

**The new website integrates with Dodie's own GHL subaccount via the GoHighLevel public API. The existing GHL calendar is embedded as an iframe; new forms POST through Astro server endpoints to GHL's contact and workflow APIs. All credentials are Dodie-owned and live in her environment.**

## How it works

1. **Forms** (contact, lead-magnet) submit to `/src/pages/api/*.ts` Astro server endpoints.
2. Server endpoint validates with `zod`, applies honeypot rejection, then calls `src/lib/ghl.ts` to:
   - Upsert the contact under Dodie's subaccount.
   - Apply a `source=site_<form_name>` tag.
   - Trigger the relevant workflow (lead-magnet PDF delivery, or contact-form auto-responder).
3. Server endpoint returns success/failure to the client.
4. **Calendar** (`/book`) embeds Dodie's existing GHL calendar iframe. We do not call calendar APIs from the build — the iframe handles the booking flow native to GHL, including the $50 deposit.
5. **Auth:** a Private Integration Token issued from Dodie's GHL subaccount, stored as `GHL_PRIVATE_INTEGRATION_TOKEN` in the Cloudflare Pages environment.
6. **Fallback:** if the GHL API fails twice in a row (500ms backoff retry), the server endpoint sends a fallback email to `dodiekendall@gmail.com` via a transactional email service (decided in ADR-003) so the lead is never lost.

## Rationale

**Why GHL public API (not webhooks)**
- Forms are low-volume and low-frequency. Synchronous POST is simpler and gives the user immediate feedback.
- Webhooks would require us to host an intermediate state — that violates ADR-001's "no extra services" posture.

**Why Dodie owns the subaccount**
- Clean ownership boundary: she owns her contacts and her data. If the agency engagement ends, her business continues uninterrupted.
- Avoids cross-client contamination in a shared agency subaccount.
- Cleaner billing posture for her — GHL bill paid by her, not pass-through from the agency.
- Hard rule in `feedback_client_owns_ghl.md` memory.

**Why iframe the calendar (not custom-build it)**
- GHL's native calendar handles deposit collection, confirmation emails, reminders, calendar invites, and the booking workflow Dodie already has tuned. Rebuilding that surface would be expensive and we'd own the maintenance forever.
- The iframe is wrapped inside our `BookingEmbed.astro` component with our tokens — visually it reads as part of the site, not an obvious embed.

## Consequences

**Positive:**
- No data lock-in: Dodie owns her contacts at the CRM layer.
- Minimal moving parts: Astro forms → GHL API → Dodie's existing automation.
- The booking flow Dodie has invested in (deposit, reminders, workflows) is preserved.

**Negative / trade-offs:**
- The iframe calendar has limited visual customization. We mitigate by surrounding it with our own reassurance copy and card framing.
- GHL public API has rate limits (documented in `GHL-INTEGRATION.md`). For our volume this is not an issue; we add light retry/backoff to be safe.
- We depend on GHL's API uptime. The fallback-email path mitigates outage risk for the lead-capture flow (booking itself is GHL-native; if GHL is down, the calendar embed is also down — there's no separate fallback for that).

## Security & privacy notes

- Private Integration Token never touches the client. All GHL calls happen server-side in Astro endpoints.
- Honeypot field on every form.
- Edge-rate-limited (CF) at 10 requests/minute/IP.
- Logs scrubbed of email/phone before any persistence (we don't persist anyway — the only data store is GHL).
- See `PRIVACY-NOTES.md` for the full data flow diagram.

## Follow-ups

- ADR-003 — Email fallback service (Resend vs. Postmark vs. GHL transactional)
- `GHL-INTEGRATION.md` — endpoint table, workflow IDs, field mappings.
- `ENV.md` — env var names and purpose (no values).

---

*Linked: `CLAUDE.md` §6 hard rules, `GHL-INTEGRATION.md`, `ENV.md`, memory files `feedback_no_ghl_hosting.md` and `feedback_client_owns_ghl.md`.*
