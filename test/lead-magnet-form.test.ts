// Run: npm run test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { outcomeFor } from '../src/lib/lead-magnet-form.ts';

test('only claims an inbox copy when the server says the email was sent', () => {
  assert.equal(outcomeFor(200, { captured: true, emailed: true }), 'emailed');
  for (const reason of ['send-failed', 'opted-out', 'limit-unavailable']) {
    assert.equal(outcomeFor(200, { captured: true, emailed: false, reason }), 'ready', reason);
  }
});

test('a repeat sign-up looks identical to a fresh one (no sign-up enumeration)', () => {
  assert.equal(outcomeFor(200, { captured: true, emailed: false, reason: 'recent' }), 'emailed');
});

test('errors the visitor can fix are not shown as success', () => {
  assert.equal(outcomeFor(422, null), 'invalid-email');
  assert.equal(outcomeFor(400, null), 'retry-check');
  assert.equal(outcomeFor(429, null), 'rate-limited');
});

test('nothing saved (5xx, bad reply, network) is never shown as success', () => {
  assert.equal(outcomeFor(502, { captured: false }), 'not-captured');
  assert.equal(outcomeFor(500, null), 'not-captured');
  assert.equal(outcomeFor(200, null), 'not-captured', 'malformed 200 body');
  assert.equal(outcomeFor(null, null), 'not-captured');
});

test('fallback (details emailed to Dodie) still hands over the guide', () => {
  assert.equal(outcomeFor(202, { captured: false, fallback: true } as never), 'ready');
});
