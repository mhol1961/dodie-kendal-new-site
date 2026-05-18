# ADR-003 — Form-Endpoint Lead Durability via Transactional Email Fallback

- **Status:** Proposed
- **Date:** 2026-05-18
- **Deciders:** Mark Holland (IntellaGrow)
- **Triggered by:** Codex adversarial review of Phase 1 baseline (task `beviv97rn`, 2026-05-18). Finding "Accepted form submissions are dropped on GHL failure with no durable fallback."

## Context

The site's two form endpoints (`/api/contact`, `/api/lead-magnet`) post to Dodie's GHL subaccount via the GHL public API (per ADR-002). The endpoints validate input, upsert a contact, apply a tag, and optionally trigger a workflow.

Today, when the GHL API fails after retry exhaustion, the endpoint returns HTTP 502 and the submitted payload is discarded. There is no queue, no temp store, and no fallback email — the lead is lost irreversibly. Because the site stores nothing locally, the loss is also undetectable: no log line, no alert, no replay path.

Phase 9 must close this gap before the endpoints go live. Three credible patterns:

1. **Transactional email fallback (chosen pattern).** On GHL failure, send the validated payload to `dodiekendall@gmail.com` via a transactional email service. Dodie acts on the lead manually until GHL is healthy again. Simple, decoupled, no extra infrastructure.
2. **Durable queue (Cloudflare Queues, Upstash Redis, etc.).** On GHL failure, enqueue the payload and retry asynchronously. More resilient, but adds a new service to maintain and a new failure mode (queue backed-up).
3. **Local persistence (Cloudflare D1, KV, R2).** Store payloads in a CF binding; replay manually or via cron. Same trade-off as queue but with a different ops surface.

The IntellaGrow operating principle for Dodie's site is "minimal moving parts" (ADR-001). Pattern 1 fits that constraint best.

## Decision (proposed; selection pending)

Adopt pattern 1: **on GHL failure, send a fallback email to Dodie via a transactional email service.** Pick one of:

| Provider | Pros | Cons | Pricing posture |
| --- | --- | --- | --- |
| **Resend** | Excellent DX, great deliverability, simple API, react-email integration, free tier covers our volume | Newer (less battle-tested at scale) | 3k emails/mo free, then $20/mo for 50k |
| **Postmark** | Industry-standard for transactional email, excellent deliverability, mature | More expensive than Resend at low volume | $15/mo for 10k |
| **GHL native (Mailgun-backed)** | Already in Dodie's billing surface; one fewer vendor | Less control; ties fallback to the same vendor as the primary path (defeats fallback intent) | Bundled in Dodie's GHL plan |

**Selection pending.** Recommend **Resend** unless deliverability concerns or pricing escalates.

## How it works

1. Server endpoint validates with zod (no change).
2. Server endpoint calls `src/lib/ghl.ts` (no change).
3. If GHL fails after retry exhaustion: catch the `GhlError`, format the validated payload as a fallback email body, send via the chosen provider's API, and return HTTP 202 ("Accepted — we'll be in touch shortly").
4. Email subject prefix: `[FALLBACK – CRM unavailable]`. Body includes: name, email, phone (if present), message, consent flags, submitted-at timestamp.
5. Provider credentials live in env vars per `ENV.md`. Same per-request env-from-runtime pattern documented in ADR-004.
6. Test the fallback in Phase 9 by simulating a 502 from the GHL helper.

## Consequences

**Positive:**
- Leads never silently disappear, even during multi-minute GHL outages.
- Fallback path is independent of the primary path — different vendor, different DNS, different infrastructure.
- Operational simplicity: no new long-lived state to manage.

**Negative / trade-offs:**
- Adds a vendor + a monthly bill (small).
- Fallback email lands in Dodie's inbox unstructured — she has to manually triage and add the contact to GHL when service is restored. Acceptable at the practice's volume (lead frequency ≪ daily).
- Doesn't solve double-write on retry (that's a separate concern; see Phase 9 BACKLOG entry on `withRetry`).

## Follow-ups

- Pick the provider (Resend recommended). Update `ENV.md` with credential names.
- Add the fallback path to `src/lib/ghl.ts` (or a sibling `src/lib/notify.ts`) and wire into `src/pages/api/contact.ts` and `src/pages/api/lead-magnet.ts` in Phase 9.
- Document the fallback behavior in `GHL-INTEGRATION.md`.
- Add a smoke test that exercises the fallback path against the provider's sandbox.

---

*Linked: ADR-001 (stack), ADR-002 (CRM pattern), ADR-004 (env runtime strategy), `TECH-SPEC.md §5`, `GHL-INTEGRATION.md`, `BACKLOG.md` Phase 1 Codex findings.*
