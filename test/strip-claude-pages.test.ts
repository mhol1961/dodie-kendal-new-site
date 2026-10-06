// Run: npm run test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { strip } from '../scripts/strip-claude-pages.mjs';

function fakeDist(root: string) {
  const dist = join(root, 'dist', 'client'); // the adapter's static output
  for (const d of ['CLAUDE', 'insights/CLAUDE', 'about', '_worker.js/CLAUDE']) mkdirSync(join(dist, d), { recursive: true });
  for (const f of ['CLAUDE/index.html', 'insights/CLAUDE/index.html', 'about/index.html', '_worker.js/CLAUDE/x.mjs', 'CLAUDE.html']) {
    writeFileSync(join(dist, f), 'x');
  }
  return dist;
}

test('removes CLAUDE pages from dist only; real pages and the server bundle stay', () => {
  const dist = fakeDist(mkdtempSync(join(tmpdir(), 'dist-')));
  strip(dist);
  assert.equal(existsSync(join(dist, 'CLAUDE')), false);
  assert.equal(existsSync(join(dist, 'insights/CLAUDE')), false);
  assert.equal(existsSync(join(dist, 'CLAUDE.html')), false);
  assert.equal(existsSync(join(dist, 'about/index.html')), true);
  assert.equal(existsSync(join(dist, '_worker.js/CLAUDE/x.mjs')), true);
});

test('runs as a CLI from a path containing a space', () => {
  const root = mkdtempSync(join(tmpdir(), 'repo with space-'));
  const dist = fakeDist(root);
  mkdirSync(join(root, 'scripts'));
  copyFileSync('scripts/strip-claude-pages.mjs', join(root, 'scripts', 'strip-claude-pages.mjs'));
  const run = spawnSync(process.execPath, ['scripts/strip-claude-pages.mjs'], { cwd: root, encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  assert.equal(existsSync(join(dist, 'CLAUDE')), false);
});
