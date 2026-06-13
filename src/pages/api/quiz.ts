// POST /api/quiz — receives the "Is QHHT right for you?" quiz answers, upserts
// the contact into Dodie's GHL sub-account, and applies one tag per answer so
// her workflows can segment + follow up. Mirrors /api/lead-magnet.ts, including
// the fallback-email safety net when GHL is unreachable.
//
// Answers are stored as GHL TAGS (not custom fields) on purpose: tags
// auto-create on apply, so there is zero GHL UI setup. See src/lib/quiz.ts.

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { upsertContact, applyTag, GhlError } from '@lib/ghl';
import { sendFallbackEmail } from '@lib/notify';
import { QUIZ_VALUES, answersToTags } from '@lib/quiz';

export const prerender = false;

// Build the answers schema from the single source of truth. Every question is
// required and must be one of its declared option values.
const answersSchema = z.object(
  Object.fromEntries(
    Object.entries(QUIZ_VALUES).map(([id, values]) => [
      id,
      z.enum(values as [string, ...string[]]),
    ])
  )
);

const payloadSchema = z.object({
  firstName: z.string().min(1).max(80),
  email: z.string().email().transform((s) => s.toLowerCase()),
  phone: z.string().max(40).optional(),
  consentMarketing: z.literal(true),
  answers: answersSchema,
});

const honeypotKey = 'website';

/** Accept JSON (enhanced submit) or form-encoded (no-JS fallback). */
async function readBody(request: Request): Promise<Record<string, unknown>> {
  const ct = request.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) {
    return (await request.json()) as Record<string, unknown>;
  }
  // Form-encoded fallback: answer fields are flat (draw, experience, …);
  // re-nest them under `answers` to match the schema.
  const form = await request.formData();
  const flat: Record<string, unknown> = {};
  for (const [k, v] of form.entries()) flat[k] = v;
  const answers: Record<string, unknown> = {};
  for (const id of Object.keys(QUIZ_VALUES)) {
    if (id in flat) {
      answers[id] = flat[id];
      delete flat[id];
    }
  }
  return {
    ...flat,
    consentMarketing: flat.consentMarketing === 'true' || flat.consentMarketing === 'on' || flat.consentMarketing === true,
    answers,
  };
}

export const POST: APIRoute = async ({ request, locals }) => {
  let body: Record<string, unknown> = {};
  try {
    body = await readBody(request);
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 });
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

  const tags = answersToTags(data.answers);
  const formPayload = {
    firstName: data.firstName,
    email: data.email,
    phone: data.phone,
    answers: data.answers,
    tags,
    submittedAt: new Date().toISOString(),
  };

  if (!token || !locationId) {
    console.error('[quiz] GHL env missing — using fallback email path');
    const sent = await sendFallbackEmail(
      { formName: 'QHHT quiz', payload: formPayload, context: ['GHL env not configured at request time.'] },
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
        phone: data.phone,
        source: 'website_qhht_quiz',
      },
      { GHL_PRIVATE_INTEGRATION_TOKEN: token, GHL_LOCATION_ID: locationId }
    );

    // One tag per answer + the completion marker. applyTag is idempotent.
    for (const tag of tags) {
      await applyTag(id, tag, { GHL_PRIVATE_INTEGRATION_TOKEN: token });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('[quiz] GHL upsert/tag failed', err);
    const sent = await sendFallbackEmail(
      {
        formName: 'QHHT quiz',
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
