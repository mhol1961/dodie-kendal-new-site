// POST /api/contact — receives the contact form, posts to GHL.
// See TECH-SPEC.md §5, GHL-INTEGRATION.md §4.

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { upsertContact, applyTag, triggerWorkflow, GhlError } from '@lib/ghl';

export const prerender = false;

const payloadSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email().transform((s) => s.toLowerCase()),
  phone: z.string().min(7).max(20).optional(),
  message: z.string().min(10).max(2000),
  consentMarketing: z.boolean().default(false),
  consentTransactional: z.literal(true),
  website: z.string().max(0).optional(), // honeypot — must be empty
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

  // Honeypot — silently 200 to confuse bots
  if (parsed.data.website && parsed.data.website.length > 0) {
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  const data = parsed.data;
  const [firstName, ...rest] = data.fullName.split(/\s+/);
  const lastName = rest.join(' ') || undefined;

  // Env from Cloudflare runtime — `locals.runtime.env` on CF, fallback to process.env in dev
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = ((locals as any)?.runtime?.env ?? process.env) as Record<string, string | undefined>;
  const token = env.GHL_PRIVATE_INTEGRATION_TOKEN;
  const locationId = env.GHL_LOCATION_ID;
  if (!token || !locationId) {
    console.error('contact POST: GHL env vars missing (GHL_PRIVATE_INTEGRATION_TOKEN, GHL_LOCATION_ID)');
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
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
      await triggerWorkflow(id, env.GHL_WORKFLOW_CONTACT_AUTORESPONDER_ID, {
        GHL_PRIVATE_INTEGRATION_TOKEN: token,
      });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('contact POST failed', err);
    // TODO Phase 9: fallback email via Resend/Postmark (ADR-003).
    if (err instanceof GhlError) {
      return new Response(JSON.stringify({ error: 'CRM unavailable; please email dodiekendall@gmail.com directly.' }), {
        status: 502,
      });
    }
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
