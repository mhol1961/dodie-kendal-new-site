// Run: npm run test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { screeningState } from '../src/lib/booking-screening.ts';

test('screening: the calendar opens only on three "no" answers plus the policy box', () => {
  assert.equal(screeningState(['no', 'no', 'no'], true), 'open');
  assert.equal(screeningState(['no', 'no', 'no'], false), 'wait');
  assert.equal(screeningState(['no', undefined, 'no'], true), 'wait');
  assert.equal(screeningState([undefined, undefined, undefined], true), 'wait');
});

test('screening: any "yes" means talk first, even with the box ticked', () => {
  assert.equal(screeningState(['yes', 'no', 'no'], true), 'talk');
  assert.equal(screeningState(['no', 'yes', 'no'], true), 'talk');
  assert.equal(screeningState([undefined, undefined, 'yes'], false), 'talk');
});
