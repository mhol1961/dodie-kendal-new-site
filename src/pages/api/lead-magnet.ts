// POST /api/lead-magnet — captures the free-guide sign-up in Dodie's GHL and
// emails the guide link straight from the site (through her GHL sender).
// No GHL workflow is involved: a workflow trigger can silently skip people who
// are already contacts, and none existed for this. See TECH-SPEC.md §5, ADR-003.
//
// Response contract (read by src/lib/lead-magnet-form.ts):
//   200 { captured: true, emailed: true }                         guide email sent
//   200 { captured: true, emailed: false, reason }                 reason: recent | opted-out |
//                                                                  send-failed | limit-unavailable | status-unknown
//   202 { captured: false, fallback: true }  CRM down, details emailed to Dodie instead
//   400 turnstile · 422 validation · 429 rate-limited · 502 { captured: false } nothing saved
//   303 → the PDF for native (no-JS) form posts, which can't carry a Turnstile token

import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';
import { z } from 'zod';
import { upsertContact, applyTag, addNote, sendContactEmail, consentRecord, removeFromWorkflow, getContact, GhlError } from '@lib/ghl';
import { sendFallbackEmail } from '@lib/notify';
import { verifyRequest } from '@lib/turnstile';
import { attributionSchema, attributionFields, attributionLine, isFacebookOrInstagram, FB_IG_TAG } from '@lib/attribution';
import { optinToken, confirmUrl } from '@lib/optin';
import { allowIp, claimGuideEmail, releaseGuideEmail, type D1Like } from '@lib/guide-limits';

export const prerender = false;

const GUIDE_PATH = '/dodie-kendall-prep-guide.pdf';
const GUIDE_URL = `https://dodiekendall.com${GUIDE_PATH}`;
const GUIDE_SUBJECT = 'Your free QHHT prep guide is here';
// Exact wording shown under each form (button + note), stored with the consent.
const CONSENT_TEXT = {
  gate: "Send me the guide. We'll never share your address. Unsubscribe any time.",
  'free-guide':
    'Send me the guide. No cost, no session required. We will never share your address, and you can unsubscribe any time.',
} as const;

const payloadSchema = z.object({
  // Optional: the forms no longer ask for a name. "Friend" is the old placeholder.
  firstName: z.string().trim().max(80).optional(),
  email: z.string().trim().email().max(254).transform((s) => s.toLowerCase()),
  consentMarketing: z.literal(true),
  form: z.enum(['gate', 'free-guide']).default('gate'),
  'cf-turnstile-response': z.string().max(2048).optional(),
  attribution: attributionSchema,
});

const honeypotKey = 'website';

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  // Without JavaScript the form posts natively and no Turnstile token can exist,
  // so there is nothing safe to capture: hand over the (public) guide instead.
  if (!(request.headers.get('content-type') ?? '').includes('application/json')) {
    return redirect(GUIDE_PATH, 303);
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json(400, { error: 'Invalid JSON' });
  }

  // Honeypot FIRST — before zod. Any non-empty value silently 200s.
  const trap = body[honeypotKey];
  if (typeof trap === 'string' && trap.length > 0) {
    return json(200, { ok: true, captured: true, emailed: false });
  }

  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return json(422, { error: 'Validation failed', issues: parsed.error.issues });
  }

  const data = parsed.data;
  // Never write the old "Friend" placeholder: it would show up as a name in GHL.
  const firstName = data.firstName && data.firstName !== 'Friend' ? data.firstName : undefined;

  const env = workerEnv as unknown as Record<string, string | undefined> & {
    LEAD_DB?: D1Like;
  };
  const ip = request.headers.get('CF-Connecting-IP');
  const db = env.LEAD_DB;
  if (!db) console.error('[lead-magnet] LEAD_DB not bound — abuse limits are OFF, guide emails NOT sent');

  const human = await verifyRequest(request, env, data['cf-turnstile-response']);
  if (!human) {
    return json(400, { error: 'turnstile', message: 'Please complete the security check and try again.' });
  }

  // Counted after Turnstile so failed checks don't eat a shared connection's budget.
  // Storage failure here fails OPEN (Turnstile still guards); it never blocks capture.
  if (db && ip) {
    let allowed = true;
    try {
      allowed = await allowIp(db, ip);
    } catch (err) {
      console.error('[lead-magnet] IP limit check failed — allowing', err);
    }
    if (!allowed) return json(429, { error: 'rate-limited' });
  }

  const token = env.GHL_PRIVATE_INTEGRATION_TOKEN;
  const locationId = env.GHL_LOCATION_ID;
  const submittedAt = new Date();

  const formPayload = {
    firstName: firstName ?? '',
    email: data.email,
    consentMarketing: data.consentMarketing,
    submittedAt: submittedAt.toISOString(),
  };

  if (!token || !locationId) {
    console.error('[lead-magnet] GHL env missing — using fallback email path');
    const sent = await sendFallbackEmail(
      { formName: 'Lead-magnet opt-in', payload: formPayload, context: ['GHL env not configured at request time.'] },
      env as { RESEND_API_KEY: string }
    );
    return json(sent ? 202 : 502, {
      ok: sent,
      captured: false,
      emailed: false,
      ...(sent ? {} : { error: 'Configuration error; please email dodiekendall@gmail.com directly.' }),
    });
  }

  // Step 1 — capture. Only a failure HERE means the lead is lost (→ fallback).
  // Double opt-in: recorded as pending until the emailed confirm link is clicked
  // (/api/confirm-optin). First-write-only, so an existing record is never replaced.
  const consent = consentRecord('pending', `free-guide sign-up (${data.form})`, CONSENT_TEXT[data.form], submittedAt);
  let contactId: string;
  let emailDnd: boolean | null;
  let tags: string[];
  let isNew: boolean;
  try {
    ({ id: contactId, emailDnd, tags, isNew } = await upsertContact(
      {
        firstName,
        email: data.email,
        source: 'website_lead_magnet',
        attribution: attributionFields(data.attribution),
        // Only set if the contact has no consent record yet; every sign-up is
        // also kept below as an append-only note.
        customField: { consent_marketing: consent },
      },
      { GHL_PRIVATE_INTEGRATION_TOKEN: token, GHL_LOCATION_ID: locationId }
    ));
  } catch (err) {
    console.error('[lead-magnet] GHL upsert failed — lead NOT captured', err);
    const sent = await sendFallbackEmail(
      {
        formName: 'Lead-magnet opt-in',
        payload: formPayload,
        context: [
          'GHL upsert failed — lead NOT in CRM; see Cloudflare logs.',
          err instanceof GhlError ? `GHL status: ${err.status}` : `Error: ${String(err)}`,
        ],
      },
      env as { RESEND_API_KEY: string }
    );
    if (sent) return json(202, { ok: true, captured: false, emailed: false, fallback: true });
    return json(502, {
      captured: false,
      error: 'CRM and fallback email both unavailable; please email dodiekendall@gmail.com directly.',
    });
  }

  // Step 2 — tags are best-effort enrichment (as in quiz.ts): the lead is captured,
  // so a tag failure must not skip the guide email or trigger the fallback.
  const confirmed = tags.includes('optin_confirmed');
  const extraTags = [...(confirmed ? [] : ['optin_pending']), ...(isFacebookOrInstagram(data.attribution) ? [FB_IG_TAG] : [])];
  for (const tag of ['site_lead_magnet', 'site_v2', ...extraTags]) {
    await applyTag(contactId, tag, { GHL_PRIVATE_INTEGRATION_TOKEN: token }).catch((err) =>
      console.error(`[lead-magnet] applyTag ${tag} failed (contact ${contactId} captured)`, err)
    );
  }

  // Double opt-in: Dodie's Long-Term Nurture workflow enrolls every NEW contact and
  // sends marketing (held for its sending window, hours later). A brand-new,
  // unconfirmed sign-up is taken back out and marked; /api/confirm-optin re-enrolls
  // them on confirm. Existing contacts keep whatever they already had.
  const nurtureId = env.GHL_WORKFLOW_LONG_TERM_NURTURE_ID;
  if (isNew && !confirmed && nurtureId) {
    const auth = { GHL_PRIVATE_INTEGRATION_TOKEN: token };
    const hold = () => removeFromWorkflow(contactId, nurtureId, auth);
    // Mark first, so confirm-optin always re-enrolls them even if a hold below fails.
    await applyTag(contactId, 'optin_nurture_held', auth).catch((err) =>
      console.error('[lead-magnet] optin_nurture_held tag failed', contactId, err)
    );
    await hold().catch((err) => console.error('[lead-magnet] nurture hold failed', contactId, err));
    // GHL enrolls new contacts a second or two after creation, possibly after the
    // call above; repeat it after the response (Workers allow ~30 s of waitUntil).
    // ponytail: timed retries; a GHL-side "skip optin_pending" filter is the full fix.
    const ctx = locals.cfContext as { waitUntil?: (p: Promise<unknown>) => void } | undefined;
    // Skip if they confirmed in the meantime: confirm-optin has re-enrolled them.
    const later = (ms: number) =>
      new Promise((r) => setTimeout(r, ms))
        .then(() => getContact(contactId, auth))
        .then((c) => (c.tags?.includes('optin_confirmed') ? undefined : hold()));
    ctx?.waitUntil?.(
      Promise.allSettled([later(10_000), later(25_000)]).then((rs) =>
        rs.forEach((r) => r.status === 'rejected' && console.error('[lead-magnet] delayed nurture hold failed', contactId, r.reason))
      )
    );
  }

  await addNote(contactId, `Free-guide sign-up${confirmed ? ' (email already confirmed)' : ''}. Consent: ${consent}${attributionLine(data.attribution) ? `\n${attributionLine(data.attribution)}` : ''}`, {
    GHL_PRIVATE_INTEGRATION_TOKEN: token,
  }).catch((err) => console.error('[lead-magnet] consent note failed (contact captured)', err));

  // Step 3 — the guide email. Respect an email opt-out (unknown status = don't send);
  // at most one per address per day.
  if (emailDnd === null) return json(200, { ok: true, captured: true, emailed: false, reason: 'status-unknown' });
  if (emailDnd) return json(200, { ok: true, captured: true, emailed: false, reason: 'opted-out' });
  if (!db) return json(200, { ok: true, captured: true, emailed: false, reason: 'limit-unavailable' });

  let claim: number | null;
  try {
    claim = await claimGuideEmail(db, data.email);
  } catch (err) {
    // Fail CLOSED for sending: without the claim we can't stop inbox flooding.
    console.error('[lead-magnet] guide-email claim failed — not sending', err);
    return json(200, { ok: true, captured: true, emailed: false, reason: 'limit-unavailable' });
  }
  if (claim === null) return json(200, { ok: true, captured: true, emailed: false, reason: 'recent' });

  // Unconfirmed: the button is the signed confirm link, which records consent and
  // then opens the guide. Already confirmed (or no secret configured): straight to it.
  let buttonUrl = GUIDE_URL;
  if (!confirmed && env.OPTIN_SECRET) {
    buttonUrl = confirmUrl('https://dodiekendall.com', contactId, await optinToken(env.OPTIN_SECRET, contactId, data.email));
  } else if (!confirmed) {
    console.error('[lead-magnet] OPTIN_SECRET missing — sending the guide without a confirm link');
  }

  // NOT retried (a replay would duplicate the email). The page still offers the link.
  try {
    await sendContactEmail(
      contactId,
      { subject: GUIDE_SUBJECT, html: guideEmailHtml(firstName, buttonUrl, !confirmed && buttonUrl !== GUIDE_URL) },
      { GHL_PRIVATE_INTEGRATION_TOKEN: token }
    );
  } catch (err) {
    console.error('[lead-magnet] guide email failed (contact captured)', contactId, err);
    // Release only when GHL definitely refused (4xx). A timeout or 5xx may have been
    // accepted and delivered, so keep the claim rather than risk a duplicate.
    if (err instanceof GhlError && err.status < 500) {
      await releaseGuideEmail(db, data.email, claim).catch((e) =>
        console.error('[lead-magnet] claim release failed', e)
      );
    }
    return json(200, { ok: true, captured: true, emailed: false, reason: 'send-failed' });
  }

  return json(200, { ok: true, captured: true, emailed: true });
};

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function guideEmailHtml(firstName: string | undefined, buttonUrl: string, needsConfirm: boolean): string {
  const button = needsConfirm ? 'Confirm &amp; open your guide' : 'Open your free prep guide';
  const confirmLine = needsConfirm
    ? `<p style="font-size:14px;color:#5b5760;">Tapping the button confirms your email address, so Dodie can send you an occasional note. You can unsubscribe any time.</p>`
    : '';
  return `<div style="font-family:Georgia,serif;font-size:16px;line-height:1.6;color:#3a2f28;max-width:560px;">
    <p>Hi ${firstName ? esc(firstName) : 'there'},</p>
    <p>Thank you for asking for the guide. Here it is:</p>
    <p><a href="${buttonUrl}" style="display:inline-block;background:#c2604f;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:999px;font-family:system-ui,sans-serif;font-size:15px;">${button}</a></p>
    ${confirmLine}
    <p>It walks through what the deeply relaxed state feels like, how to shape the three questions you bring, what to eat, wear and bring on the day, and what tends to unfold in the week after.</p>
    <p>Read it at your own pace. If questions come up, you can simply reply to this email. And when it feels right, you can book a session at
      <a href="https://dodiekendall.com/book" style="color:#c2604f;">dodiekendall.com/book</a>.</p>
    <p>With warmth,<br/>Dodie Kendall<br/>QHHT Practitioner · Stuart, FL</p>
    <p style="font-size:13px;color:#7a6e66;">If the button does not work, copy this link into your browser: ${buttonUrl}</p>
  </div>`;
}
