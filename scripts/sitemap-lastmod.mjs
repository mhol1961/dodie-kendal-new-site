// Sitemap <lastmod> for each URL, used by the sitemap `serialize` option in
// astro.config.mjs. Posts: frontmatter updatedDate ?? pubDate. Other pages: the
// last git commit date of their source file. Fallback: the build date.
// Tested in test/sitemap-lastmod.test.ts.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Source file (relative to the repo root) that builds a URL path, or null. */
export function sourceFor(pathname, root = process.cwd()) {
  const p = pathname.replace(/\/+$/, '');
  const post = /^\/insights\/([^/]+)$/.exec(p);
  if (post) {
    const md = `src/content/insights/${post[1]}.md`;
    if (existsSync(join(root, md))) return md;
  }
  for (const f of [`src/pages${p || '/index'}.astro`, `src/pages${p}/index.astro`]) {
    if (existsSync(join(root, f))) return f;
  }
  return null;
}

/** updatedDate ?? pubDate from a post's frontmatter, as a Date, or null. */
export function postDate(markdown) {
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(markdown)?.[1] ?? '';
  const get = (key) => new RegExp(`^${key}:\\s*["']?([^"'\\s#]+)`, 'm').exec(fm)?.[1];
  const raw = get('updatedDate') ?? get('pubDate');
  const d = raw ? new Date(raw) : null;
  return d && !isNaN(d.valueOf()) ? d : null;
}

// A shallow checkout (CI clones can be) only has the newest commit, which would date
// every page "today". Fetch the full history once before reading any dates.
let unshallowed = false;
function ensureHistory(root) {
  if (unshallowed) return;
  unshallowed = true;
  try {
    const shallow = execFileSync('git', ['rev-parse', '--is-shallow-repository'], { cwd: root, encoding: 'utf8' }).trim();
    if (shallow === 'true') execFileSync('git', ['fetch', '--unshallow', '--quiet'], { cwd: root, stdio: 'inherit' });
  } catch (err) {
    console.warn('[sitemap-lastmod] could not fetch full git history; lastmod may show the build date', err.message);
  }
}

function gitDate(file, root) {
  ensureHistory(root);
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', file], { cwd: root, encoding: 'utf8' }).trim();
    return out ? new Date(out) : null;
  } catch {
    return null;
  }
}

/** ISO lastmod for a full page URL. */
export function lastmodFor(url, { root = process.cwd(), buildDate = new Date() } = {}) {
  const file = sourceFor(new URL(url).pathname, root);
  const date = !file
    ? null
    : file.endsWith('.md')
      ? postDate(readFileSync(join(root, file), 'utf8'))
      : gitDate(file, root);
  return (date ?? buildDate).toISOString();
}
