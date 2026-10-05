// Run: npm run test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { noindexPaths, dropFromSitemap } from '../scripts/sitemap-drop-noindex.mjs';

test('finds noindex pages in a file-format build and drops only those from the sitemap', () => {
  const dist = mkdtempSync(join(tmpdir(), 'dist-'));
  mkdirSync(join(dist, 'insights'));
  const noindex = '<meta name="robots" content="noindex, nofollow">';
  writeFileSync(join(dist, 'index.html'), '<html></html>');
  writeFileSync(join(dist, 'about.html'), '<html></html>');
  writeFileSync(join(dist, 'design.html'), `<html><head>${noindex}</head></html>`);
  writeFileSync(join(dist, 'insights', 'secret.html'), `<html><head>${noindex}</head></html>`);
  const paths = noindexPaths(dist).sort();
  assert.deepEqual(paths, ['/design', '/insights/secret']);

  const xml = ['/', '/about', '/design', '/insights/secret', '/design-ideas']
    .map((p) => `<url><loc>https://dodiekendall.com${p === '/' ? '' : p}</loc></url>`).join('');
  const out = dropFromSitemap(`<urlset>${xml}</urlset>`, paths);
  assert.equal(out.includes('/design<'), false);
  assert.equal(out.includes('/insights/secret'), false);
  for (const keep of ['https://dodiekendall.com<', '/about<', '/design-ideas<']) assert.ok(out.includes(keep), keep);
});
