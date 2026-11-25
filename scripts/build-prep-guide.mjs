// Builds the guide PDFs from their HTML sources (assets/prep-guide, assets/session-guide).
//
//   npx -y -p playwright@1 node scripts/build-prep-guide.mjs <out.pdf> [source.html]   (no install needed)
//   npx playwright install chromium                              (first time only)
//
// Playwright is resolved from the current directory OR this repo, so it also runs
// from any folder that has it installed. Read the PRINT-SAFE RULES at the top of
// guide.html before editing: Chrome effects (shadows, blur, transparency) turn into
// solid boxes in Apple's PDF viewer.
import { createRequire } from 'node:module';
import { basename, join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// public/dodie-kendall-prep-guide.pdf is Dodie's own file (since 2026-11-25), not built here.
// No default output, and that file name is refused, so this script can never overwrite it.
const out = process.argv[2];
if (!out || basename(out).toLowerCase() === 'dodie-kendall-prep-guide.pdf') {
  console.error("Give an output path other than dodie-kendall-prep-guide.pdf (Dodie's own guide, not built by this script).");
  process.exit(1);
}

const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
const load = (from) => { try { return createRequire(join(from, 'x.js'))('playwright'); } catch { return null; } };
const pw = load(process.cwd()) ?? load(repo) ?? (await import('playwright').catch(() => null));
if (!pw) throw new Error('playwright not found: run with `npx -y -p playwright@1 node scripts/build-prep-guide.mjs <out.pdf>`');

// Source defaults to the old free guide. The session guide:
//   node scripts/build-prep-guide.mjs public/dodie/qhht-pre-session-prep-guide.pdf assets/session-guide/guide.html
const src = process.argv[3] ? resolve(process.argv[3]) : join(repo, 'assets', 'prep-guide', 'guide.html');
const browser = await pw.chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(src).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: out, preferCSSPageSize: true, printBackground: true, tagged: true });
await browser.close();
console.log('wrote', out);
