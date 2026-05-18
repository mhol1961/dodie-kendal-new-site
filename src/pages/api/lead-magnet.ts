// POST /api/lead-magnet — receives the lead-magnet email and triggers the prep guide workflow.
// See TECH-SPEC.md §5, GHL-INTEGRATION.md §4.

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { upsertContact, applyTag, triggerWorkflow, GhlError } from '@lib/ghl';

export const prerender = false;

const payloadSchema = z.object({
  firstName: z.string().min(1).max(80),
  email: z.string().email().transform((s) => s.toLowerCase()),
  consentMarketing: z.literal(true),
  website: z.string().max(0).optional(),
});

export const POST: APIRoute = async ({ request, locals }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: 'Validation failed', issues: parsed.error.issues }),
      { status: 422 }
    );
  }

  if (parsed.data.website && parsed.data.website.length > 0) {
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  const data = parsed.data;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = ((locals as any)?.runtime?.env ?? process.env) as Record<string, string | undefined>;
  const token = env.GHL_PRIVATE_INTEGRATION_TOKEN;
  const locationId = env.GHL_LOCATION_ID;
  if (!token || !locationId) {
    console.error('lead-magnet POST: GHL env vars missing (GHL_PRIVATE_INTEGRATION_TOKEN, GHL_LOCATION_ID)');
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
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
      await triggerWorkflow(id, env.GHL_WORKFLOW_LEAD_MAGNET_ID, {
        GHL_PRIVATE_INTEGRATION_TOKEN: token,
      });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('lead-magnet POST failed', err);
    if (err instanceof GhlError) {
      return new Response(JSON.stringify({ error: 'CRM unavailable; please email dodiekendall@gmail.com directly.' }), {
        status: 502,
      });
    }
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
