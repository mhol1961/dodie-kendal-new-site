// Run: npm run test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bookingUrl } from '../src/lib/booking-url.ts';
import { ATTRIBUTION_KEYS } from '../src/lib/attribution.ts';

const base = 'https://api.leadconnectorhq.com/widget/booking/abc123';

test('booking URL: ad details appended, landing_page and junk left off', () => {
  const url = new URL(bookingUrl(base, { utm_source: 'facebook', utm_campaign: 'fall & winter', fbclid: 'IwAR1', landing_page: '/landing-page-2' }));
  assert.equal(url.origin + url.pathname, base);
  assert.equal(url.searchParams.get('utm_source'), 'facebook');
  assert.equal(url.searchParams.get('utm_campaign'), 'fall & winter');
  assert.equal(url.searchParams.get('fbclid'), 'IwAR1');
  assert.equal(url.searchParams.has('landing_page'), false);
  assert.equal(bookingUrl(base, JSON.parse('{"evil":"x","utm_term":5}')), base);
});

test('booking URL: unchanged with nothing stored', () => {
  assert.equal(bookingUrl(base, undefined), base);
  assert.equal(bookingUrl(base, {}), base);
});

test('booking URL passes every key the forms capture', () => {
  const all = Object.fromEntries(ATTRIBUTION_KEYS.map((k) => [k, 'v']));
  const url = new URL(bookingUrl(base, all));
  for (const k of ATTRIBUTION_KEYS) assert.equal(url.searchParams.get(k), 'v', k);
});
