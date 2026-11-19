// Run: npm run test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sendFallbackEmail } from '../src/lib/notify.ts';

test('backup email still sends when an optional answer (phone) is blank', async () => {
  const realFetch = globalThis.fetch;
  let sent = '';
  globalThis.fetch = (async (_url: unknown, init?: RequestInit) => {
    sent = String(init?.body);
    return new Response('{}', { status: 200 });
  }) as typeof fetch;
  try {
    const ok = await sendFallbackEmail(
      { formName: 'QHHT quiz', payload: { firstName: 'Ann', phone: undefined, tags: ['a'] } },
      { RESEND_API_KEY: 'k' }
    );
    assert.equal(ok, true);
    assert.match(sent, /Ann/);
  } finally {
    globalThis.fetch = realFetch;
  }
});
