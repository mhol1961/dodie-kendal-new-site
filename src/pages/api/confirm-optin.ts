// GET /api/confirm-optin?c=<contactId>&t=<hmac> — the "Confirm & open your guide"
// button in the free-guide email (double opt-in). A valid link records confirmed
// marketing consent, swaps tag optin_pending -> optin_confirmed, and logs a note.
// Every outcome ends on the (public) guide, so a bad or repeated link never strands
// anyone. See src/lib/optin.ts.
//
// ponytail: GET confirms, so a corporate link-scanner that pre-opens email links can
// confirm on the reader's behalf. Upgrade to a confirm page with a POST button if
// that shows up in the notes.

import type { APIRoute } from 'astro';
import { getContact, updateContact, applyTag, removeTag, addNote, consentRecord, triggerWorkflow, FIELD_IDS } from '@lib/ghl';
import { verifyOptinToken } from '@lib/optin';

export const prerender = false;

// Exact wording next to the button in the email (lead-magnet.ts guideEmailHtml).
const CONFIRM_TEXT =
  'Tapping the button confirms your email address, so Dodie can send you an occasional note. You can unsubscribe any time.';

export const GET: APIRoute = async ({ url, locals, redirect }) => {
  const done = () => redirect('/dodie-kendall-prep-guide.pdf', 303);
  const contactId = url.searchParams.get('c') ?? '';
  const sig = url.searchParams.get('t') ?? '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = ((locals as any)?.runtime?.env ?? process.env) as Record<string, string | undefined>;
  const token = env.GHL_PRIVATE_INTEGRATION_TOKEN;
  if (!token || !/^[A-Za-z0-9]{10,40}$/.test(contactId) || !sig) return done();
  const auth = { GHL_PRIVATE_INTEGRATION_TOKEN: token };

  try {
    const contact = await getContact(contactId, auth);
    if (!(await verifyOptinToken(env.OPTIN_SECRET, contactId, contact.email ?? '', sig))) {
      console.warn('[confirm-optin] invalid link', contactId);
      return done();
    }
    if (contact.tags?.includes('optin_confirmed')) return done(); // already confirmed

    const record = consentRecord(true, 'free-guide sign-up, confirmed by email link', CONFIRM_TEXT);
    // The signed link proves mailbox ownership, so this one write MAY replace the
    // pending record (public forms never can; see enrichmentPatch).
    await updateContact(contactId, { customFields: [{ id: FIELD_IDS.consent_marketing, field_value: record }] }, auth);
    await applyTag(contactId, 'optin_confirmed', auth);
    await removeTag(contactId, 'optin_pending', auth).catch((err) =>
      console.error('[confirm-optin] removeTag optin_pending failed', contactId, err)
    );
    // Sign-ups held out of the nurture workflow until now (lead-magnet.ts) go back in.
    if (contact.tags?.includes('optin_nurture_held') && env.GHL_WORKFLOW_LONG_TERM_NURTURE_ID) {
      await triggerWorkflow(contactId, env.GHL_WORKFLOW_LONG_TERM_NURTURE_ID, auth)
        .then(() => removeTag(contactId, 'optin_nurture_held', auth))
        .catch((err) => console.error('[confirm-optin] nurture re-enroll failed', contactId, err));
    }
    await addNote(contactId, `Marketing consent confirmed by email link. Consent: ${record}`, auth).catch((err) =>
      console.error('[confirm-optin] note failed', contactId, err)
    );
  } catch (err) {
    console.error('[confirm-optin] confirm failed', contactId, err);
  }
  return done();
};
