// GHL API client. Server-side only — never bundled to the client.
// See GHL-INTEGRATION.md for endpoint and field mapping reference.

import type { AttributionKey } from './attribution';

const GHL_BASE = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';
// The conversations/messages endpoint is versioned differently from contacts.
const GHL_CONVERSATIONS_VERSION = '2021-04-15';
// Bound every GHL call so a degraded API can't hang a form submission.
const GHL_TIMEOUT_MS = 10_000;

/**
 * Custom fields the site writes, with their ids in Dodie's location. Typed keys:
 * GHL silently DROPS unknown custom-field keys (200, no error), so a field must be
 * added here (after creating it in GHL) before any code can write it.
 * ponytail: ids are Dodie's location (GHL_LOCATION_ID); re-map if that ever changes.
 */
export const FIELD_IDS = {
  your_message: 'BHzkahhWrkjczqaFRsFr',
  consent_marketing: 'arAprh8QemGfEipfFocR',
  consent_transactional: 'f6861b3ryLqcmAO9cF9k',
} as const;
export type FieldKey = keyof typeof FIELD_IDS;

export interface ContactPayload {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  source: string;
  /** Only written where the contact has no value yet (see enrichmentPatch). */
  customField?: Partial<Record<FieldKey, string>>;
  /** Ad attribution (utm_* / fbclid). Written to same-named GHL custom fields if they
   *  exist, looked up by key at runtime; first touch wins (blank fields only). */
  attribution?: Partial<Record<AttributionKey, string>>;
}

export class GhlError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'GhlError';
  }
}

function authHeaders(token: string, version: string = GHL_API_VERSION) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Version: version,
  };
}

/**
 * Retry only operations that GHL documents as idempotent.
 * - upsertContact: idempotent on email (GHL upserts on email/phone match)
 * - applyTag: idempotent (tags are a set; reapplying is a no-op)
 * - triggerWorkflow: NOT idempotent — replaying re-enrolls the contact in the workflow.
 *
 * See Codex finding "Automatic retry replays non-idempotent GHL writes" (2026-05-18).
 */
async function withIdempotentRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof GhlError && err.status >= 500) {
      await new Promise((r) => setTimeout(r, 500));
      return await fn();
    }
    throw err;
  }
}

/**
 * Auditable consent value for the `consent_marketing` / `consent_transactional`
 * custom fields: answer, which form, when, and the exact wording shown.
 */
export function consentRecord(granted: boolean | 'pending', form: string, text: string, at = new Date()): string {
  const answer = granted === 'pending' ? 'Pending email confirmation' : granted ? 'Yes' : 'No';
  return `${answer} | ${form} | ${at.toISOString()} | "${text}"`;
}

type Identity = Partial<Pick<ContactPayload, 'firstName' | 'lastName' | 'phone' | 'source'>>;
const IDENTITY_KEYS = ['firstName', 'lastName', 'phone', 'source'] as const;

/** A contact as GET /contacts/{id} returns it (empty fields are omitted). */
export type FullContact = Identity & {
  id: string;
  email?: string;
  tags?: string[];
  dnd?: boolean;
  dndSettings?: { Email?: { status?: string } };
  customFields?: { id: string; value?: unknown }[];
};

/**
 * What to write onto an email-matched contact: ONLY fields it doesn't have yet.
 * Anyone can submit someone else's email, so a public form must never rename,
 * re-attribute, or replace consent/messages on an existing contact (every
 * submission is also kept as an append-only note by the callers). Pure; tested.
 */
export function enrichmentPatch(
  payload: ContactPayload,
  existing: FullContact,
  /** fieldKey (without "contact.") -> id, for attribution fields that exist in GHL */
  attributionFieldIds: Record<string, string> = {}
): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  for (const key of IDENTITY_KEYS) {
    const value = payload[key]?.trim();
    if (value && !existing[key]?.trim()) patch[key] = value;
  }
  const has = new Set((existing.customFields ?? []).filter((f) => String(f.value ?? '').trim()).map((f) => f.id));
  const wanted: [string | undefined, string | undefined][] = [
    ...Object.entries(payload.customField ?? {}).map(([k, v]) => [FIELD_IDS[k as FieldKey], v] as [string, string | undefined]),
    ...Object.entries(payload.attribution ?? {}).map(([k, v]) => [attributionFieldIds[k], v] as [string | undefined, string | undefined]),
  ];
  const fields = wanted
    .filter(([id, value]) => id && value?.trim() && !has.has(id))
    .map(([id, value]) => ({ id: id as string, field_value: value as string }));
  if (fields.length) patch.customFields = fields;
  return patch;
}

// ponytail: per-isolate cache; fields created later in GHL are picked up on the next
// cold start (minutes). Fetch every time if that ever matters.
let fieldIdCache: Record<string, string> | null = null;

/** All contact custom fields in the location, fieldKey (without "contact.") -> id. */
async function locationFieldIds(env: { GHL_PRIVATE_INTEGRATION_TOKEN: string; GHL_LOCATION_ID: string }): Promise<Record<string, string>> {
  if (fieldIdCache) return fieldIdCache;
  const res = await fetch(`${GHL_BASE}/locations/${env.GHL_LOCATION_ID}/customFields`, {
    signal: AbortSignal.timeout(GHL_TIMEOUT_MS),
    headers: authHeaders(env.GHL_PRIVATE_INTEGRATION_TOKEN),
  });
  if (!res.ok) throw new GhlError(res.status, `customFields failed: ${await res.text()}`);
  const json = (await res.json()) as { customFields?: { id: string; fieldKey: string }[] };
  fieldIdCache = Object.fromEntries((json.customFields ?? []).map((f) => [f.fieldKey.replace(/^contact\./, ''), f.id]));
  return fieldIdCache;
}

export function emailOptedOut(contact: FullContact): boolean {
  return contact.dnd === true || contact.dndSettings?.Email?.status === 'active';
}

export async function getContact(contactId: string, env: { GHL_PRIVATE_INTEGRATION_TOKEN: string }): Promise<FullContact> {
  return withIdempotentRetry(async () => {
    const res = await fetch(`${GHL_BASE}/contacts/${contactId}`, {
      signal: AbortSignal.timeout(GHL_TIMEOUT_MS),
      headers: authHeaders(env.GHL_PRIVATE_INTEGRATION_TOKEN),
    });
    if (!res.ok) throw new GhlError(res.status, `getContact failed: ${await res.text()}`);
    const json = (await res.json()) as { contact?: FullContact };
    if (!json.contact?.id) throw new GhlError(500, 'getContact: no contact returned');
    return json.contact;
  });
}

export async function updateContact(
  contactId: string,
  patch: Record<string, unknown>,
  env: { GHL_PRIVATE_INTEGRATION_TOKEN: string }
): Promise<void> {
  // PUT by id is idempotent and can only ever touch this one contact.
  await withIdempotentRetry(async () => {
    const res = await fetch(`${GHL_BASE}/contacts/${contactId}`, {
      method: 'PUT',
      signal: AbortSignal.timeout(GHL_TIMEOUT_MS),
      headers: authHeaders(env.GHL_PRIVATE_INTEGRATION_TOKEN),
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      throw new GhlError(res.status, `updateContact failed: ${await res.text()}`);
    }
  });
}

/**
 * Capture by email, then enrich that same contact:
 *  1. POST /contacts/upsert with the email ONLY. Name/phone never take part in
 *     matching (GHL can dedupe on phone, which would let a new email merge into
 *     someone else's contact). Plain create (/contacts/) rejects existing emails.
 *  2. GET the full contact by id: the upsert reply isn't guaranteed to include every
 *     field, and an omitted field must be treated as unknown, never as blank.
 *  3. PUT only the fields it doesn't have yet (enrichmentPatch). Best-effort.
 * `emailDnd` is null when step 2 failed: callers must treat unknown as "don't email".
 */
export async function upsertContact(payload: ContactPayload, env: {
  GHL_PRIVATE_INTEGRATION_TOKEN: string;
  GHL_LOCATION_ID: string;
}): Promise<{ id: string; isNew: boolean; emailDnd: boolean | null; tags: string[] }> {
  const email = payload.email.trim().toLowerCase();
  const { id, isNew } = await withIdempotentRetry(async () => {
    const res = await fetch(`${GHL_BASE}/contacts/upsert`, {
      method: 'POST',
      signal: AbortSignal.timeout(GHL_TIMEOUT_MS),
      headers: authHeaders(env.GHL_PRIVATE_INTEGRATION_TOKEN),
      body: JSON.stringify({ locationId: env.GHL_LOCATION_ID, email }),
    });
    if (!res.ok) {
      throw new GhlError(res.status, `upsertContact failed: ${await res.text()}`);
    }
    const json = (await res.json()) as { new?: boolean; contact?: { id?: string } };
    if (!json.contact?.id) throw new GhlError(500, 'upsertContact: no id returned');
    return { id: json.contact.id, isNew: json.new === true };
  });

  let contact: FullContact;
  try {
    contact = await getContact(id, env);
  } catch (err) {
    console.error('[ghl] getContact failed — enrichment skipped, email status unknown', id, err);
    return { id, isNew, emailDnd: null, tags: [] };
  }

  const hasAttribution = Object.values(payload.attribution ?? {}).some(Boolean);
  const attributionIds = hasAttribution
    ? await locationFieldIds(env).catch((err) => {
        console.error('[ghl] custom-field lookup failed; attribution kept in the note only', err);
        return {};
      })
    : {};
  const patch = enrichmentPatch(payload, contact, attributionIds);
  if (Object.keys(patch).length) {
    try {
      await updateContact(id, patch, env);
    } catch (err) {
      console.error('[ghl] enrichment failed (contact captured)', id, err);
      // A phone already on another contact can be rejected; keep the rest.
      if ('phone' in patch && err instanceof GhlError && err.status < 500) {
        const { phone: _phone, ...rest } = patch;
        if (Object.keys(rest).length) await updateContact(id, rest, env).catch(() => {});
      }
    }
  }

  return { id, isNew, emailDnd: emailOptedOut(contact), tags: contact.tags ?? [] };
}

/** Add a note to a contact (keeps every contact-form message, not just the latest). */
export async function addNote(
  contactId: string,
  body: string,
  env: { GHL_PRIVATE_INTEGRATION_TOKEN: string }
): Promise<void> {
  // NOT retried: a replay would duplicate the note.
  const res = await fetch(`${GHL_BASE}/contacts/${contactId}/notes`, {
    method: 'POST',
    signal: AbortSignal.timeout(GHL_TIMEOUT_MS),
    headers: authHeaders(env.GHL_PRIVATE_INTEGRATION_TOKEN),
    body: JSON.stringify({ body }),
  });
  if (!res.ok) {
    throw new GhlError(res.status, `addNote failed: ${await res.text()}`);
  }
}

export async function applyTag(
  contactId: string,
  tag: string,
  env: { GHL_PRIVATE_INTEGRATION_TOKEN: string }
): Promise<void> {
  await withIdempotentRetry(async () => {
    const res = await fetch(`${GHL_BASE}/contacts/${contactId}/tags`, {
      method: 'POST',
      signal: AbortSignal.timeout(GHL_TIMEOUT_MS),
      headers: authHeaders(env.GHL_PRIVATE_INTEGRATION_TOKEN),
      body: JSON.stringify({ tags: [tag] }),
    });
    if (!res.ok) {
      throw new GhlError(res.status, `applyTag failed: ${await res.text()}`);
    }
  });
}

export async function removeTag(
  contactId: string,
  tag: string,
  env: { GHL_PRIVATE_INTEGRATION_TOKEN: string }
): Promise<void> {
  await withIdempotentRetry(async () => {
    const res = await fetch(`${GHL_BASE}/contacts/${contactId}/tags`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(GHL_TIMEOUT_MS),
      headers: authHeaders(env.GHL_PRIVATE_INTEGRATION_TOKEN),
      body: JSON.stringify({ tags: [tag] }),
    });
    if (!res.ok) {
      throw new GhlError(res.status, `removeTag failed: ${await res.text()}`);
    }
  });
}

export async function triggerWorkflow(
  contactId: string,
  workflowId: string,
  env: { GHL_PRIVATE_INTEGRATION_TOKEN: string }
): Promise<void> {
  // No retry — workflow triggers are NOT idempotent. A replay double-enrolls
  // the contact and fires duplicate automations. If this fails, the caller
  // logs and surfaces; the lead is still safely captured by upsertContact.
  const res = await fetch(
    `${GHL_BASE}/contacts/${contactId}/workflow/${workflowId}`,
    {
      method: 'POST',
      signal: AbortSignal.timeout(GHL_TIMEOUT_MS),
      headers: authHeaders(env.GHL_PRIVATE_INTEGRATION_TOKEN),
    }
  );
  if (!res.ok) {
    throw new GhlError(res.status, `triggerWorkflow failed: ${await res.text()}`);
  }
}

/**
 * Send an email to a contact through GHL (uses the location's configured sender).
 * NOT retried — sending is non-idempotent and a replay would duplicate the email.
 * Callers treat this as best-effort and must not fail the request on error.
 */
export async function sendContactEmail(
  contactId: string,
  opts: { subject: string; html: string },
  env: { GHL_PRIVATE_INTEGRATION_TOKEN: string }
): Promise<void> {
  const res = await fetch(`${GHL_BASE}/conversations/messages`, {
    method: 'POST',
    signal: AbortSignal.timeout(GHL_TIMEOUT_MS),
    headers: authHeaders(env.GHL_PRIVATE_INTEGRATION_TOKEN, GHL_CONVERSATIONS_VERSION),
    body: JSON.stringify({ type: 'Email', contactId, subject: opts.subject, html: opts.html }),
  });
  if (!res.ok) {
    throw new GhlError(res.status, `sendContactEmail failed: ${await res.text()}`);
  }
}

/**
 * Send an SMS to a contact through GHL. Requires a connected phone number in the
 * sub-account; otherwise GHL returns an error (caught by the best-effort caller).
 * NOT retried — non-idempotent.
 */
export async function sendContactSms(
  contactId: string,
  message: string,
  env: { GHL_PRIVATE_INTEGRATION_TOKEN: string }
): Promise<void> {
  const res = await fetch(`${GHL_BASE}/conversations/messages`, {
    method: 'POST',
    signal: AbortSignal.timeout(GHL_TIMEOUT_MS),
    headers: authHeaders(env.GHL_PRIVATE_INTEGRATION_TOKEN, GHL_CONVERSATIONS_VERSION),
    body: JSON.stringify({ type: 'SMS', contactId, message }),
  });
  if (!res.ok) {
    throw new GhlError(res.status, `sendContactSms failed: ${await res.text()}`);
  }
}
