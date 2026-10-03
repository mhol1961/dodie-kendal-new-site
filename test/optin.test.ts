// Run: npm run test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { optinToken, verifyOptinToken, confirmUrl } from '../src/lib/optin.ts';

const SECRET = 'test-secret';

test('a link signed for this contact + email verifies (email case/space-insensitive)', async () => {
  const t = await optinToken(SECRET, 'abc123XYZ0', 'A@B.co');
  assert.match(t, /^[0-9a-f]{64}$/);
  assert.equal(await verifyOptinToken(SECRET, 'abc123XYZ0', ' a@b.co ', t), true);
});

test('it cannot be reused for another contact or email, or forged', async () => {
  const t = await optinToken(SECRET, 'abc123XYZ0', 'a@b.co');
  assert.equal(await verifyOptinToken(SECRET, 'other12345', 'a@b.co', t), false);
  assert.equal(await verifyOptinToken(SECRET, 'abc123XYZ0', 'x@b.co', t), false);
  assert.equal(await verifyOptinToken('wrong-secret', 'abc123XYZ0', 'a@b.co', t), false);
  assert.equal(await verifyOptinToken(SECRET, 'abc123XYZ0', 'a@b.co', t.slice(0, -1) + (t.endsWith('0') ? '1' : '0')), false);
  assert.equal(await verifyOptinToken(SECRET, 'abc123XYZ0', 'a@b.co', 'not-a-token'), false);
  assert.equal(await verifyOptinToken(undefined, 'abc123XYZ0', 'a@b.co', t), false, 'no secret = never valid');
});

test('confirm URL is absolute and carries id + token', () => {
  assert.equal(
    confirmUrl('https://dodiekendall.com', 'abc123XYZ0', 'f'.repeat(64)),
    `https://dodiekendall.com/api/confirm-optin?c=abc123XYZ0&t=${'f'.repeat(64)}`
  );
});
