// POST /api/contact — receives the /contact form (ContactForm.astro), posts to GHL, falls back to email.
// The form copies Dodie's GHL "QHHT Quiz" form, so its leads get the same tags that form's
// leads carried (qhht-lead, qhht-quiz-complete) and the answer in contact.quiz_goal.
// See TECH-SPEC.md §5, GHL-INTEGRATION.md §4, ADR-003 (fallback email).

import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';
import { z } from 'zod';
import { upsertContact, applyTag, addNote, consentRecord, triggerWorkflow, GhlError } from '@lib/ghl';
import { sendFallbackEmail } from '@lib/notify';
import { verifyRequest } from '@lib/turnstile';
import { visitorStatus } from '@lib/guide-limits';
import { attributionSchema, attributionFields, attributionLine, isFacebookOrInstagram, FB_IG_TAG } from '@lib/attribution';
import { CONTACT_GOALS } from '@lib/quiz';

export const prerender = false;

const payloadSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().max(80).optional(),
  phone: z.string().trim().min(7).max(40),
  email: z.string().trim().email().max(254).transform((s) => s.toLowerCase()),
  quizGoal: z.enum(CONTACT_GOALS),
  consentTransactional: z.boolean().default(false),
  consentMarketing: z.boolean().default(false),
  'cf-turnstile-response': z.string().max(2048).optional(),
  attribution: attributionSchema,
});

const honeypotKey = 'website';

// Exact checkbox wording from ContactForm.astro, stored with each consent answer.
const TRANSACTIONAL_TEXT =
  'By checking this box, I consent to receive non-marketing text messages from Dodie Kendall QHHT about appointment confirmations, session reminders, and after-care. Message frequency varies, message & data rates may apply. Text HELP for assistance, reply STOP to opt out.';
const MARKETING_TEXT =
  'By checking this box, I consent to receive marketing and promotional messages including special offers, discounts, new product updates among others, from Dodie Kendall QHHT at the phone number provided. Frequency may vary. Message & data rates may apply. Text HELP for assistance, reply STOP to opt out.';

export const POST: APIRoute = async ({ request }) => {
  // The form needs JavaScript (Turnstile), so a native form post can't be verified.
  if (!(request.headers.get('content-type') ?? '').includes('application/json')) {
    return new Response(JSON.stringify({ error: 'JSON only' }), { status: 415 });
  }
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  // Honeypot FIRST — before zod. Any non-empty value silently 200s so bots can't
  // tell what tripped the filter. (See Codex finding "honeypot silent-200 dead code".)
  const trap = body[honeypotKey];
  if (typeof trap === 'string' && trap.length > 0) {
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: 'Validation failed', issues: parsed.error.issues }),
      { status: 422 }
    );
  }

  const data = parsed.data;
  const consentSource = `contact form, phone ${data.phone}`;

  // Worker vars + secrets (wrangler.toml [vars], dashboard secrets, .dev.vars locally).
  const env = workerEnv as unknown as Record<string, string | undefined>;

  // Spam check before anything reaches GHL.
  if (!(await verifyRequest(request, env, data['cf-turnstile-response']))) {
    return new Response(JSON.stringify({ error: 'turnstile' }), { status: 400 });
  }
  // Never blocks capture; over the cap the autoresponder workflow is skipped.
  const visitor = await visitorStatus(env, request, 'contact');

  const token = env.GHL_PRIVATE_INTEGRATION_TOKEN;
  const locationId = env.GHL_LOCATION_ID;

  // Build the validated payload once — reused for GHL and the fallback email
  const formPayload = {
    firstName: data.firstName,
    lastName: data.lastName ?? '',
    email: data.email,
    phone: data.phone,
    quizGoal: data.quizGoal,
    consentMarketing: data.consentMarketing,
    consentTransactional: data.consentTransactional,
    submittedAt: new Date().toISOString(),
  };

  // If GHL is mis-configured at the runtime, fall through to the email fallback so the
  // lead is still captured. Don't 500 — that drops the lead.
  if (!token || !locationId) {
    console.error('[contact] GHL env missing — using fallback email path');
    const sent = await sendFallbackEmail(
      { formName: 'Contact form', payload: formPayload, context: ['GHL env not configured at request time.'] },
      env as { RESEND_API_KEY: string }
    );
    return new Response(
      JSON.stringify({ ok: sent, ...(sent ? {} : { error: 'Configuration error; please email dodiekendall@gmail.com directly.' }) }),
      { status: sent ? 202 : 502 }
    );
  }

  try {
    const { id } = await upsertContact(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        source: 'website_contact_form',
        attribution: attributionFields(data.attribution),
        // Only fills fields the contact doesn't have yet (see enrichmentPatch);
        // the note below keeps every message + consent as an append-only record.
        customField: {
          quiz_goal: data.quizGoal,
          // Only record grants: an unticked optional box must not overwrite a
          // "Yes" given elsewhere (revoking is done by unsubscribing).
          ...(data.consentMarketing && {
            consent_marketing: consentRecord(true, consentSource, MARKETING_TEXT),
          }),
          ...(data.consentTransactional && {
            consent_transactional: consentRecord(true, consentSource, TRANSACTIONAL_TEXT),
          }),
        },
      },
      { GHL_PRIVATE_INTEGRATION_TOKEN: token, GHL_LOCATION_ID: locationId }
    );

    // Tags are best-effort enrichment: the contact is captured, so a tag failure
    // must not send this lead down the lost-lead fallback path.
    for (const tag of ['qhht-lead', 'qhht-quiz-complete', 'site_contact', 'site_v2', ...(isFacebookOrInstagram(data.attribution) ? [FB_IG_TAG] : [])]) {
      await applyTag(id, tag, { GHL_PRIVATE_INTEGRATION_TOKEN: token }).catch((err) =>
        console.error(`[contact] applyTag ${tag} failed (contact ${id} captured)`, err)
      );
    }

    // The note is the full submission: the upsert only fills blank fields (an existing
    // contact keeps its old name, phone and quiz_goal) and can stop at email-only on a GHL error.
    try {
      const consentLines = [
        consentRecord(data.consentTransactional, consentSource, TRANSACTIONAL_TEXT),
        consentRecord(data.consentMarketing, consentSource, MARKETING_TEXT),
      ].join('\n');
      await addNote(id, `Website contact form (${formPayload.submittedAt}):\n\nName: ${data.firstName}${data.lastName ? ` ${data.lastName}` : ''}\nPhone: ${data.phone}\nEmail: ${data.email}\nWhat's drawing you to QHHT? ${data.quizGoal}\n\nConsent:\n${consentLines}${attributionLine(data.attribution) ? `\n${attributionLine(data.attribution)}` : ''}`, {
        GHL_PRIVATE_INTEGRATION_TOKEN: token,
      });
    } catch (err) {
      console.error('[contact] addNote failed (contact captured)', err);
    }

    // The workflow texts the lead, so it needs the texting box ticked (TCPA). Also skipped
    // over the per-visitor cap; a limiter outage ('unknown') still enrolls.
    if (env.GHL_WORKFLOW_CONTACT_AUTORESPONDER_ID && data.consentTransactional && visitor !== 'over') {
      try {
        await triggerWorkflow(id, env.GHL_WORKFLOW_CONTACT_AUTORESPONDER_ID, {
          GHL_PRIVATE_INTEGRATION_TOKEN: token,
        });
      } catch (err) {
        // Workflow trigger is non-idempotent — we deliberately don't retry. A miss
        // here means the autoresponder didn't fire; the lead itself is captured.
        console.error('[contact] workflow trigger failed (lead still captured)', err);
      }
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('[contact] GHL upsert failed — lead NOT captured', err);
    const sent = await sendFallbackEmail(
      {
        formName: 'Contact form',
        payload: formPayload,
        context: [
          'GHL upsert/tag failed — see Cloudflare logs for the exact error.',
          err instanceof GhlError ? `GHL status: ${err.status}` : `Error: ${String(err)}`,
        ],
      },
      env as { RESEND_API_KEY: string }
    );
    if (sent) {
      return new Response(JSON.stringify({ ok: true, fallback: true }), { status: 202 });
    }
    return new Response(
      JSON.stringify({ error: 'CRM and fallback email both unavailable; please email dodiekendall@gmail.com directly.' }),
      { status: 502 }
    );
  }
};
