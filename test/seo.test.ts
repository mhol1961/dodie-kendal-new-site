// Run: npm run test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getSeo, pageTitle } from '../src/lib/seo.ts';

test('titles: brand suffix when it fits in 60, bare title when not, never cut', () => {
  assert.equal(pageTitle('About Dodie Kendall'), 'About Dodie Kendall · Dodie Kendall QHHT');
  const long = 'How to Prepare for Your First Quantum Healing Session';
  assert.equal(pageTitle(long), long);
  const huge = 'A very long title that runs well past sixty characters and keeps going';
  assert.equal(pageTitle(huge), huge);
  assert.ok(pageTitle().includes('Dodie Kendall QHHT'));
  for (const t of [long, huge]) assert.ok(!getSeo({ path: '/x', title: t }).title.includes('…'));
});

test('descriptions are never sliced; over 160 chars throws', () => {
  const ok = 'x'.repeat(160);
  assert.equal(getSeo({ path: '/x', description: ok }).description, ok);
  assert.throws(() => getSeo({ path: '/long', description: 'y'.repeat(161) }), /\/long.*161/);
  const d = getSeo({ path: '/x' }).description;
  assert.ok(d.length <= 160 && !/[–—]/.test(d), 'default description');
});
