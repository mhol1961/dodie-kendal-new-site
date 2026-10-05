// Run: npm run test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sourceFor, postDate, lastmodFor } from '../scripts/sitemap-lastmod.mjs';
import { dropFromSitemap } from '../scripts/sitemap-drop-noindex.mjs';

test('maps URLs to their source files', () => {
  assert.equal(sourceFor('/'), 'src/pages/index.astro');
  assert.equal(sourceFor('/about'), 'src/pages/about.astro');
  assert.equal(sourceFor('/about/'), 'src/pages/about.astro');
  assert.equal(sourceFor('/insights'), 'src/pages/insights/index.astro');
  assert.equal(sourceFor('/insights/past-life-regression-vs-qhht'), 'src/content/insights/past-life-regression-vs-qhht.md');
  assert.equal(sourceFor('/nope'), null);
});

test('post date: updatedDate wins over pubDate', () => {
  assert.equal(postDate('---\ntitle: "T"\npubDate: 2026-05-18\n---\nbody')?.toISOString(), '2026-05-18T00:00:00.000Z');
  assert.equal(postDate('---\npubDate: 2026-05-18\nupdatedDate: "2026-06-01"\n---\n')?.toISOString(), '2026-06-01T00:00:00.000Z');
  assert.equal(postDate('no frontmatter'), null);
});

test('lastmod falls back to the build date for unknown pages', () => {
  const buildDate = new Date('2026-10-05T12:00:00Z');
  assert.equal(lastmodFor('https://dodiekendall.com/nope', { buildDate }), buildDate.toISOString());
  assert.match(lastmodFor('https://dodiekendall.com/about', { buildDate }), /^\d{4}-\d\d-\d\dT/);
});

test('noindex drop still works with lastmod present', () => {
  const xml = '<urlset><url><loc>https://dodiekendall.com/a</loc><lastmod>2026-05-18T00:00:00.000Z</lastmod></url><url><loc>https://dodiekendall.com/b</loc><lastmod>2026-05-18T00:00:00.000Z</lastmod></url></urlset>';
  const out = dropFromSitemap(xml, ['/a']);
  assert.ok(!out.includes('/a<') && out.includes('/b</loc><lastmod>'));
});
