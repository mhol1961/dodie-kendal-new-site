// Postbuild: Astro turns any .md under src/pages into a public page, and the
// claude-mem plugin keeps dropping CLAUDE.md files there (they were live as
// /CLAUDE). Source is never touched: this removes those pages from the disposable
// build output only. (The sitemap filter in astro.config.mjs drops them too.)
// Cross-platform: no shell commands.
import { readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// Removes every CLAUDE/ page folder and CLAUDE.html under dist. Returns what it removed.
export function strip(dist) {
  const removed = [];
  for (const entry of readdirSync(dist, { withFileTypes: true, recursive: true })) {
    if (entry.name !== 'CLAUDE' && entry.name !== 'CLAUDE.html') continue;
    const path = join(entry.parentPath ?? entry.path, entry.name);
    if (path.includes('_worker.js')) continue; // server bundle, not pages
    rmSync(path, { recursive: true, force: true });
    removed.push(path);
  }
  return removed;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const removed = strip('dist/client');
  if (removed.length) console.log(`[postbuild] removed ${removed.length} CLAUDE page(s) from dist/client`);
}
