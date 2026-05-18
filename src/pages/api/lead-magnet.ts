// POST /api/lead-magnet — receives the lead-magnet email and triggers the prep guide workflow.
// See TECH-SPEC.md §5, GHL-INTEGRATION.md §4, ADR-003 (fallback email).

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { upsertContact, applyTag, triggerWorkflow, GhlError } from '@lib/ghl';
import { sendFallbackEmail } from '@lib/notify';

export const prerender = false;

const payloadSchema = z.object({
  firstName: z.string().min(1).max(80),
  email: z.string().email().transform((s) => s.toLowerCase()),
  consentMarketing: z.literal(true),
});

const honeypotKey = 'website';

export const POST: APIRoute = async ({ request, locals }) => {
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  // Honeypot FIRST — before zod. Any non-empty value silently 200s.
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = ((locals as any)?.runtime?.env ?? process.env) as Record<string, string | undefined>;
  const token = env.GHL_PRIVATE_INTEGRATION_TOKEN;
  const locationId = env.GHL_LOCATION_ID;

  const formPayload = {
    firstName: data.firstName,
    email: data.email,
    consentMarketing: data.consentMarketing,
    submittedAt: new Date().toISOString(),
  };

  if (!token || !locationId) {
    console.error('[lead-magnet] GHL env missing — using fallback email path');
    const sent = await sendFallbackEmail(
      { formName: 'Lead-magnet opt-in', payload: formPayload, context: ['GHL env not configured at request time.'] },
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
        email: data.email,
        source: 'website_lead_magnet',
        customField: {
          consent_marketing: data.consentMarketing,
        },
      },
      { GHL_PRIVATE_INTEGRATION_TOKEN: token, GHL_LOCATION_ID: locationId }
    );

    await applyTag(id, 'site_lead_magnet', { GHL_PRIVATE_INTEGRATION_TOKEN: token });
    await applyTag(id, 'site_v2', { GHL_PRIVATE_INTEGRATION_TOKEN: token });

    if (env.GHL_WORKFLOW_LEAD_MAGNET_ID) {
      try {
        await triggerWorkflow(id, env.GHL_WORKFLOW_LEAD_MAGNET_ID, {
          GHL_PRIVATE_INTEGRATION_TOKEN: token,
        });
      } catch (err) {
        console.error('[lead-magnet] workflow trigger failed (contact still captured)', err);
      }
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('[lead-magnet] GHL upsert/tag failed', err);
    const sent = await sendFallbackEmail(
      {
        formName: 'Lead-magnet opt-in',
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
