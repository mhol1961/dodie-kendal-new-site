// Run: npm run test:unit
// Release gate for the /qhht/<town> pages: unreleased towns must not be built or linked
// outside a PUBLIC_SITE_PREVIEW=1 build. Also checks the FAQ schema mirrors the data.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AREAS, RELEASED, builtAreas, nearbyAreas } from '../src/data/areas/index.ts';
import { faqPage } from '../src/lib/schema.ts';

const ALL = ['port-st-lucie', 'jupiter', 'palm-city', 'jensen-beach', 'hobe-sound'];

test('preview builds all five towns', () => {
  assert.deepEqual(builtAreas(true).map((a) => a.slug), ALL);
});

test('a live build builds only released towns (none yet)', () => {
  assert.deepEqual(RELEASED, []);
  assert.deepEqual(builtAreas(false), []);
  // Plain Node has no import.meta.env, so the default is the live (non-preview) build.
  assert.deepEqual(builtAreas(), []);
});

test('releasing one town builds and links only that town', () => {
  const built = builtAreas(false, ['jupiter']);
  assert.deepEqual(built.map((a) => a.slug), ['jupiter']);
  for (const a of AREAS) {
    for (const n of nearbyAreas(a, built)) assert.equal(n.slug, 'jupiter');
  }
  const hobe = AREAS.find((a) => a.slug === 'hobe-sound')!;
  assert.deepEqual(nearbyAreas(hobe, built).map((a) => a.slug), ['jupiter']);
  assert.deepEqual(nearbyAreas(hobe, builtAreas(false, [])), []);
});

test('nearby slugs all point at real towns, never at themselves', () => {
  for (const a of AREAS) {
    for (const s of a.nearby) {
      assert.ok(ALL.includes(s), `${a.slug} -> ${s}`);
      assert.notEqual(s, a.slug);
    }
  }
});

test('FAQPage JSON-LD is built from the same text the page shows', () => {
  for (const a of AREAS) {
    const node = faqPage(a.faq);
    assert.deepEqual(
      node.mainEntity.map((q) => [q.name, q.acceptedAnswer.text]),
      a.faq.map((f) => [f.question, f.answer]),
    );
  }
});
