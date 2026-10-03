// Builds public/dodie-kendall-prep-guide.pdf from assets/prep-guide/guide.html.
//
//   npx -y -p playwright@1 node scripts/build-prep-guide.mjs     (no install needed)
//   npx playwright install chromium                              (first time only)
//
// Playwright is resolved from the current directory OR this repo, so it also runs
// from any folder that has it installed. Read the PRINT-SAFE RULES at the top of
// guide.html before editing: Chrome effects (shadows, blur, transparency) turn into
// solid boxes in Apple's PDF viewer.
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
const load = (from) => { try { return createRequire(join(from, 'x.js'))('playwright'); } catch { return null; } };
const pw = load(process.cwd()) ?? load(repo) ?? (await import('playwright').catch(() => null));
if (!pw) throw new Error('playwright not found: run with `npx -y -p playwright@1 node scripts/build-prep-guide.mjs`');

const out = process.argv[2] ?? join(repo, 'public', 'dodie-kendall-prep-guide.pdf');
const browser = await pw.chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(join(repo, 'assets', 'prep-guide', 'guide.html')).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: out, preferCSSPageSize: true, printBackground: true, tagged: true });
await browser.close();
console.log('wrote', out);
