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

test('first release (Port St. Lucie alone) shows no "also serving" links', () => {
  const built = builtAreas(false, ['port-st-lucie']);
  const psl = AREAS.find((a) => a.slug === 'port-st-lucie')!;
  assert.deepEqual(nearbyAreas(psl, built), []);
  // Each later release only ever links towns already released.
  const order = ['port-st-lucie', 'jupiter', 'palm-city', 'jensen-beach', 'hobe-sound'];
  for (let i = 1; i <= order.length; i++) {
    const live = order.slice(0, i);
    for (const a of builtAreas(false, live)) {
      for (const n of nearbyAreas(a, builtAreas(false, live))) assert.ok(live.includes(n.slug), `${a.slug} -> ${n.slug}`);
    }
  }
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

test('every hero photo named in the data exists in both sizes, with alt text and a credit', async () => {
  const { existsSync } = await import('node:fs');
  for (const a of AREAS) {
    if (!a.hero) continue;
    for (const w of [900, 1600]) assert.ok(existsSync(`public/areas/${a.slug}-hero-${w}.webp`), `${a.slug} ${w}`);
    assert.match(a.hero.alt, new RegExp(a.name.replace('.', '\\.')), `${a.slug} alt names the town`);
    assert.ok(a.hero.credit && a.hero.creditUrl, `${a.slug} credit`);
  }
});

test('every area has its OpenStreetMap drive map in both sizes', async () => {
  const { existsSync } = await import('node:fs');
  for (const a of AREAS) {
    for (const w of ['800', '1600', 'phone']) assert.ok(existsSync(`public/areas/${a.slug}-map-${w}.webp`), `${a.slug} map ${w}`);
  }
});
