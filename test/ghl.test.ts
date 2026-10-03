// Run: npm run test:unit
import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { enrichmentPatch, emailOptedOut, consentRecord, upsertContact, FIELD_IDS } from '../src/lib/ghl.ts';

const ENV = { GHL_PRIVATE_INTEGRATION_TOKEN: 'tok', GHL_LOCATION_ID: 'loc1' };

test('enrichment fills blanks only: identity trimmed, whitespace dropped', () => {
  assert.deepEqual(enrichmentPatch({ email: 'a@b.co', firstName: '  Ann ', phone: '555', source: 'web' }, { id: 'c' }), {
    firstName: 'Ann',
    phone: '555',
    source: 'web',
  });
  assert.deepEqual(
    enrichmentPatch(
      { email: 'a@b.co', firstName: 'Mallory', lastName: 'Smith', phone: '999', source: 'web' },
      { id: 'c', firstName: 'Ann', phone: '555', source: 'booking' }
    ),
    { lastName: 'Smith' }
  );
  assert.deepEqual(enrichmentPatch({ email: 'a@b.co', firstName: '   ', phone: '', source: '' }, { id: 'c' }), {});
});

test('existing consent/message can never be overwritten by a public submission', () => {
  const existing = {
    id: 'c',
    customFields: [{ id: FIELD_IDS.consent_marketing, value: 'Yes | original' }],
  };
  const patch = enrichmentPatch(
    { email: 'a@b.co', source: 'web', customField: { consent_marketing: 'Yes | forged', your_message: 'hi' } },
    existing
  );
  assert.deepEqual(patch.customFields, [{ id: FIELD_IDS.your_message, field_value: 'hi' }]);
});

test('email opt-out detection', () => {
  assert.equal(emailOptedOut({ id: 'c', dndSettings: { Email: { status: 'active' } } }), true);
  assert.equal(emailOptedOut({ id: 'c', dnd: true }), true);
  assert.equal(emailOptedOut({ id: 'c', dndSettings: { Email: { status: 'inactive' } } }), false);
});

test('consentRecord captures answer, form, time and wording', () => {
  const at = new Date('2026-10-03T12:00:00Z');
  assert.equal(consentRecord(true, 'quiz', 'I agree.', at), 'Yes | quiz | 2026-10-03T12:00:00.000Z | "I agree."');
  assert.match(consentRecord(false, 'x', 'y'), /^No \| x \| /);
  assert.match(consentRecord('pending', 'x', 'y'), /^Pending email confirmation \| x \| /);
});

type Call = { method: string; url: string; body: Record<string, unknown> | null };
function stubGhl(
  t: { after: (fn: () => void) => void },
  { upsert, get, putStatus = 200 }: { upsert: object; get: object | number; putStatus?: number }
) {
  const calls: Call[] = [];
  const fetch = mock.method(globalThis, 'fetch', async (url: string, init?: RequestInit) => {
    assert.ok(init?.signal instanceof AbortSignal, 'every GHL call must be time-bounded');
    const method = init?.method ?? 'GET';
    calls.push({ method, url, body: init?.body ? JSON.parse(String(init.body)) : null });
    if (url.endsWith('/contacts/upsert')) return Response.json(upsert);
    if (method === 'GET') return typeof get === 'number' ? new Response('err', { status: get }) : Response.json({ contact: get });
    return new Response(putStatus === 200 ? '{}' : 'dup phone', { status: putStatus });
  });
  t.after(() => fetch.mock.restore());
  return calls;
}

test('matching uses the email only: name/phone never reach the upsert', async (t) => {
  const calls = stubGhl(t, { upsert: { new: true, contact: { id: 'n1' } }, get: { id: 'n1' } });
  await upsertContact({ email: ' Eve@X.co ', phone: '+15550001111', firstName: 'Eve', source: 'web' }, ENV);
  assert.deepEqual(calls[0].body, { locationId: 'loc1', email: 'eve@x.co' });
  const put = calls.find((c) => c.method === 'PUT')!;
  assert.match(put.url, /\/contacts\/n1$/);
  assert.deepEqual(put.body, { firstName: 'Eve', phone: '+15550001111', source: 'web' });
});

test('a sparse upsert reply is ignored: decisions come from the full GET record', async (t) => {
  const calls = stubGhl(t, {
    upsert: { new: false, contact: { id: 'c1' } }, // omits name, source, dnd
    get: { id: 'c1', firstName: 'Ann', source: 'booking', dndSettings: { Email: { status: 'active' } } },
  });
  const out = await upsertContact({ email: 'a@b.co', firstName: 'Mallory', source: 'web' }, ENV);
  assert.deepEqual(out, { id: 'c1', isNew: false, emailDnd: true, tags: [] });
  assert.equal(calls.filter((c) => c.method === 'PUT').length, 0, 'nothing may be overwritten');
});

test('if the full record cannot be read, email status is unknown (null) and nothing is written', async (t) => {
  const calls = stubGhl(t, { upsert: { new: false, contact: { id: 'c1' } }, get: 404 });
  const out = await upsertContact({ email: 'a@b.co', firstName: 'Ann', source: 'web' }, ENV);
  assert.deepEqual(out, { id: 'c1', isNew: false, emailDnd: null, tags: [] });
  assert.equal(calls.filter((c) => c.method === 'PUT').length, 0);
});

test('enrichment failure never loses the capture; a rejected phone is retried without it', async (t) => {
  const calls = stubGhl(t, { upsert: { new: true, contact: { id: 'c2' } }, get: { id: 'c2' }, putStatus: 400 });
  const out = await upsertContact({ email: 'a@b.co', firstName: 'Ann', phone: '555', source: 'web' }, ENV);
  assert.equal(out.id, 'c2');
  const puts = calls.filter((c) => c.method === 'PUT');
  assert.equal(puts.length, 2);
  assert.deepEqual(puts[1].body, { firstName: 'Ann', source: 'web' });
});
