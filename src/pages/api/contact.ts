// POST /api/contact — receives the contact form, posts to GHL, falls back to email.
// See TECH-SPEC.md §5, GHL-INTEGRATION.md §4, ADR-003 (fallback email).

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { upsertContact, applyTag, triggerWorkflow, GhlError } from '@lib/ghl';
import { sendFallbackEmail } from '@lib/notify';

export const prerender = false;

const payloadSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email().transform((s) => s.toLowerCase()),
  phone: z.string().min(7).max(20).optional(),
  message: z.string().min(10).max(2000),
  consentMarketing: z.boolean().default(false),
  consentTransactional: z.literal(true),
});

const honeypotKey = 'website';

export const POST: APIRoute = async ({ request, locals }) => {
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
  const [firstName, ...rest] = data.fullName.split(/\s+/);
  const lastName = rest.join(' ') || undefined;

  // Env from Cloudflare runtime — `locals.runtime.env` on CF, fallback to process.env in dev
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = ((locals as any)?.runtime?.env ?? process.env) as Record<string, string | undefined>;
  const token = env.GHL_PRIVATE_INTEGRATION_TOKEN;
  const locationId = env.GHL_LOCATION_ID;

  // Build the validated payload once — reused for GHL and the fallback email
  const formPayload = {
    fullName: data.fullName,
    email: data.email,
    phone: data.phone ?? '',
    message: data.message,
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
        firstName: firstName ?? 'Friend',
        lastName,
        email: data.email,
        phone: data.phone,
        source: 'website_contact_form',
        customField: {
          contact_message: data.message,
          consent_marketing: data.consentMarketing,
          consent_transactional: data.consentTransactional,
        },
      },
      { GHL_PRIVATE_INTEGRATION_TOKEN: token, GHL_LOCATION_ID: locationId }
    );

    await applyTag(id, 'site_contact', { GHL_PRIVATE_INTEGRATION_TOKEN: token });
    await applyTag(id, 'site_v2', { GHL_PRIVATE_INTEGRATION_TOKEN: token });

    if (env.GHL_WORKFLOW_CONTACT_AUTORESPONDER_ID) {
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
    console.error('[contact] GHL upsert/tag failed', err);
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
