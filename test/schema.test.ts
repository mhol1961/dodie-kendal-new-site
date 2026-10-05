// Run: npm run test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { faqPage, blogPosting } from '../src/lib/schema.ts';

test('faqPage keeps every question/answer verbatim and in order (real FAQ data)', () => {
  const dir = new URL('../src/content/faq/', import.meta.url);
  const items = readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(readFileSync(new URL(f, dir), 'utf8')) as { question: string; answer: string });
  assert.ok(items.length > 0);
  const node = faqPage(items);
  assert.equal(node['@type'], 'FAQPage');
  assert.equal(node.mainEntity.length, items.length);
  node.mainEntity.forEach((q, i) => {
    assert.equal(q['@type'], 'Question');
    assert.equal(q.name, items[i].question);
    assert.equal(q.acceptedAnswer['@type'], 'Answer');
    assert.equal(q.acceptedAnswer.text, items[i].answer);
  });
});

test('blogPosting has the required fields; dateModified falls back to pubDate', () => {
  const base = {
    title: 'T',
    description: 'D',
    image: 'https://dodiekendall.com/og/t.png',
    pubDate: new Date('2026-05-18T00:00:00Z'),
    canonical: 'https://dodiekendall.com/insights/t',
  };
  const node = blogPosting(base);
  assert.equal(node['@type'], 'BlogPosting');
  assert.equal(node.headline, 'T');
  assert.equal(node.description, 'D');
  assert.equal(node.image, base.image);
  assert.equal(node.datePublished, '2026-05-18T00:00:00.000Z');
  assert.equal(node.dateModified, '2026-05-18T00:00:00.000Z');
  assert.deepEqual(node.author, {
    '@type': 'Person',
    '@id': 'https://dodiekendall.com/#person',
    name: 'Dodie Kendall',
    url: 'https://dodiekendall.com/about',
  });
  assert.equal(node.publisher['@id'], 'https://dodiekendall.com/#business');
  assert.deepEqual(node.mainEntityOfPage, { '@type': 'WebPage', '@id': base.canonical });
  assert.ok(!node.url.endsWith('/'));

  const updated = blogPosting({ ...base, updatedDate: new Date('2026-06-01T00:00:00Z') });
  assert.equal(updated.datePublished, '2026-05-18T00:00:00.000Z');
  assert.equal(updated.dateModified, '2026-06-01T00:00:00.000Z');
});
