// POST /api/quiz — receives the "Is QHHT right for you?" quiz answers, upserts
// the contact into Dodie's GHL sub-account, and applies one tag per answer so
// her workflows can segment + follow up. Mirrors /api/lead-magnet.ts, including
// the fallback-email safety net when GHL is unreachable.
//
// Answers are stored as GHL TAGS (not custom fields) on purpose: tags
// auto-create on apply, so there is zero GHL UI setup. See src/lib/quiz.ts.
//
// Two clients: the enhanced quiz posts JSON (→ JSON responses); a no-JS browser
// posts a plain form (→ branded HTML responses so the user never lands on raw
// JSON). The `isFormPost` flag below drives which representation we return.

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

// --- Response helpers ------------------------------------------------------
// For JSON clients we return JSON; for no-JS form posts we return a small,
// self-contained branded HTML page so the user gets a real confirmation/error
// instead of raw JSON. Copy is plain text only (no user input echoed → no XSS).

function jsonResponse(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function htmlPage(
  status: number,
  opts: { heading: string; message: string; primary?: { href: string; label: string } }
): Response {
  const primary = opts.primary
    ? `<a class="btn" href="${opts.primary.href}">${opts.primary.label}</a>`
    : '';
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" /><title>${opts.heading}</title>
<style>
:root{color-scheme:light}
body{margin:0;min-height:100dvh;display:grid;place-items:center;padding:2rem;
  font-family:Georgia,'Times New Roman',serif;background:#f6f1e7;color:#3a2f28}
.card{max-width:34rem;text-align:center;background:#fffdf8;border:1px solid #e7ded0;
  border-radius:14px;padding:2.5rem 2rem;box-shadow:0 20px 50px -30px rgba(60,47,40,.5)}
h1{font-size:1.8rem;margin:0 0 .75rem;color:#b65a4a}
p{font-size:1.05rem;line-height:1.6;margin:0 auto 1.5rem;max-width:28rem;color:#5a4c42}
.btn{display:inline-block;background:#c2604f;color:#fff;text-decoration:none;
  padding:.85rem 1.6rem;border-radius:999px;font-family:system-ui,sans-serif;font-weight:600}
.link{display:block;margin-top:1.25rem;font-family:system-ui,sans-serif;font-size:.9rem;color:#8a7a6c}
</style></head><body><div class="card">
<h1>${opts.heading}</h1><p>${opts.message}</p>${primary}
<a class="link" href="/landing-page-1#quiz">← Back to the quiz</a>
</div></body></html>`;
  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

/** Success representation for whichever client submitted. */
function successResponse(isFormPost: boolean, status: number, extra: Record<string, unknown> = {}): Response {
  if (isFormPost) {
    return htmlPage(status, {
      heading: "Thank you — it's on its way.",
      message:
        "I've got your answers and I'll be in touch personally with your next step. If you already know you're ready, you can book now.",
      primary: { href: '/book', label: 'Book a session' },
    });
  }
  return jsonResponse(status, { ok: true, ...extra });
}

export const POST: APIRoute = async ({ request, locals }) => {
  const contentType = request.headers.get('content-type') ?? '';
  const isFormPost = !contentType.includes('application/json');

  let body: Record<string, unknown> = {};
  try {
    body = await readBody(request);
  } catch {
    return isFormPost
      ? htmlPage(400, { heading: 'Hmm — that didn’t go through.', message: 'Please go back and try again, or email dodiekendall@gmail.com.' })
      : jsonResponse(400, { error: 'Invalid request body' });
  }

  // Honeypot FIRST — before zod. Any non-empty value silently succeeds.
  const trap = body[honeypotKey];
  if (typeof trap === 'string' && trap.length > 0) {
    return successResponse(isFormPost, 200);
  }

  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return isFormPost
      ? htmlPage(422, { heading: 'Almost there', message: 'A couple of answers were missing. Please go back, complete every question, and submit again.', primary: { href: '/landing-page-1#quiz', label: 'Return to the quiz' } })
      : jsonResponse(422, { error: 'Validation failed', issues: parsed.error.issues });
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

  // --- No GHL configured: capture via fallback email instead of losing the lead.
  if (!token || !locationId) {
    console.error('[quiz] GHL env missing — using fallback email path');
    const sent = await sendFallbackEmail(
      { formName: 'QHHT quiz', payload: formPayload, context: ['GHL env not configured at request time.'] },
      env as { RESEND_API_KEY: string }
    );
    if (sent) return successResponse(isFormPost, 202, { fallback: true });
    return isFormPost
      ? htmlPage(502, { heading: 'We couldn’t save that just now', message: 'Please try again shortly, or email dodiekendall@gmail.com directly.' })
      : jsonResponse(502, { error: 'Configuration error; please email dodiekendall@gmail.com directly.' });
  }

  // --- Step 1: create/upsert the contact. THIS is the lead capture. If it fails,
  //     the lead is genuinely not captured → fall back to email.
  let contactId: string;
  try {
    ({ id: contactId } = await upsertContact(
      {
        firstName: data.firstName,
        email: data.email,
        phone: data.phone,
        source: 'website_qhht_quiz',
      },
      { GHL_PRIVATE_INTEGRATION_TOKEN: token, GHL_LOCATION_ID: locationId }
    ));
  } catch (err) {
    console.error('[quiz] GHL upsertContact failed', err);
    const sent = await sendFallbackEmail(
      {
        formName: 'QHHT quiz',
        payload: formPayload,
        context: [
          'GHL upsertContact failed — lead NOT in CRM; see Cloudflare logs.',
          err instanceof GhlError ? `GHL status: ${err.status}` : `Error: ${String(err)}`,
        ],
      },
      env as { RESEND_API_KEY: string }
    );
    if (sent) return successResponse(isFormPost, 202, { fallback: true });
    return isFormPost
      ? htmlPage(502, { heading: 'We couldn’t save that just now', message: 'Please try again shortly, or email dodiekendall@gmail.com directly.' })
      : jsonResponse(502, { error: 'CRM and fallback email both unavailable; please email dodiekendall@gmail.com directly.' });
  }

  // --- Step 2: tagging is best-effort enrichment. The lead is ALREADY captured,
  //     so a tag failure must NOT trigger the lost-lead fallback or report
  //     failure to the client. Log partial failures for follow-up instead.
  const failedTags: string[] = [];
  for (const tag of tags) {
    try {
      await applyTag(contactId, tag, { GHL_PRIVATE_INTEGRATION_TOKEN: token });
    } catch (err) {
      failedTags.push(tag);
      console.error(`[quiz] applyTag failed (contact ${contactId} already captured)`, tag, err);
    }
  }
  if (failedTags.length) {
    console.error('[quiz] partial tag failure — contact captured, some tags missing', {
      contactId,
      failedTags,
    });
  }

  return successResponse(isFormPost, 200);
};
