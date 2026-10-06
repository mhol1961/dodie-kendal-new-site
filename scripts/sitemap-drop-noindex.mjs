// Postbuild: remove every page that carries <meta name="robots" content="noindex...">
// from dist/client/sitemap-*.xml, so a noindex page can never be "Submitted URL marked
// noindex" in Search Console, whatever the sitemap filter in astro.config.mjs says.
// Works with build.format 'file' (about.html -> /about). Tested in test/sitemap-drop-noindex.test.ts.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const NOINDEX = /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i;

/** URL paths (no trailing slash) of every built page marked noindex. */
export function noindexPaths(dist) {
  const out = [];
  for (const e of readdirSync(dist, { withFileTypes: true, recursive: true })) {
    if (!e.isFile() || !e.name.endsWith('.html')) continue;
    const file = join(e.parentPath ?? e.path, e.name);
    if (file.includes(`${sep}_worker.js${sep}`)) continue;
    if (!NOINDEX.test(readFileSync(file, 'utf8'))) continue;
    const rel = '/' + relative(dist, file).split(sep).join('/').replace(/(\/?index)?\.html$/, '');
    out.push(rel === '/' ? '/' : rel.replace(/\/$/, ''));
  }
  return out;
}

/** Sitemap XML with the <url> entries for `paths` removed. */
export function dropFromSitemap(xml, paths) {
  const drop = new Set(paths.map((p) => p.replace(/\/$/, '') || '/'));
  return xml.replace(/<url>([\s\S]*?)<\/url>/g, (block, inner) => {
    const loc = /<loc>([^<]+)<\/loc>/.exec(inner)?.[1];
    if (!loc) return block;
    const p = new URL(loc).pathname.replace(/\/$/, '') || '/';
    return drop.has(p) ? '' : block;
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dist = 'dist/client';
  const paths = noindexPaths(dist);
  for (const f of readdirSync(dist).filter((n) => /^sitemap-\d+\.xml$/.test(n))) {
    const before = readFileSync(join(dist, f), 'utf8');
    const after = dropFromSitemap(before, paths);
    if (after !== before) writeFileSync(join(dist, f), after);
  }
  console.log(`[postbuild] sitemap: excluded ${paths.length} noindex page(s): ${paths.join(', ')}`);
}
