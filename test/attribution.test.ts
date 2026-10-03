// Run: npm run test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { attributionSchema, attributionFields, attributionLine, isFacebookOrInstagram } from '../src/lib/attribution.ts';
import { enrichmentPatch } from '../src/lib/ghl.ts';

test('Facebook/Instagram detection: fbclid or a utm_source naming either', () => {
  assert.equal(isFacebookOrInstagram({ fbclid: 'IwAR1' }), true);
  for (const s of ['facebook', 'Instagram', 'fb', 'IG', 'meta', 'facebook_ads']) assert.equal(isFacebookOrInstagram({ utm_source: s }), true, s);
  for (const s of ['google', 'newsletter', 'figma']) assert.equal(isFacebookOrInstagram({ utm_source: s }), false, s);
  assert.equal(isFacebookOrInstagram(undefined), false);
});

test('schema keeps known keys, trims, and never blocks a sign-up on bad input', () => {
  assert.deepEqual(attributionSchema.parse({ utm_source: ' facebook ', evil: 'x' }), { utm_source: 'facebook' });
  assert.equal(attributionSchema.parse('garbage'), undefined);
  assert.equal(attributionSchema.parse({ utm_source: 'x'.repeat(400) }), undefined);
  assert.equal(attributionSchema.parse(undefined), undefined);
});

test('fields exclude landing_page; note line lists what is present', () => {
  const a = { utm_source: 'facebook', utm_campaign: 'fall', landing_page: '/free-guide' };
  assert.deepEqual(attributionFields(a), { utm_source: 'facebook', utm_campaign: 'fall' });
  assert.equal(attributionLine(a), 'Ad source: utm_source=facebook, utm_campaign=fall, landing_page=/free-guide');
  assert.equal(attributionLine({}), '');
});

test('GHL: attribution fills only fields that exist and are blank (first touch wins)', () => {
  const ids = { utm_source: 'F1', utm_campaign: 'F2' }; // utm_medium has no field in GHL
  const patch = enrichmentPatch(
    { email: 'a@b.co', source: 'web', attribution: { utm_source: 'facebook', utm_campaign: 'fall', utm_medium: 'paid' } },
    { id: 'c', customFields: [{ id: 'F2', value: 'spring' }] },
    ids
  );
  assert.deepEqual(patch.customFields, [{ id: 'F1', field_value: 'facebook' }]);
});
