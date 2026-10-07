// Town-page hero photos: crop + compress a downloaded original into
// public/areas/<slug>-hero-1600.webp (2:1, computers) and -hero-900.webp (9:5 band, phones).
// Only freely licensed photos; record each in docs/areas-photo-credits.md.
//   node scripts/build-area-heroes.mjs <slug> <original.jpg> [position] [phoneFocusY]
// position: sharp crop position for the computer version (centre|east|...).
// phoneFocusY: 0..1, how far down the original the phone band is centred (default 0.5).
import { createRequire } from 'node:module';
import { statSync } from 'node:fs';
const sharp = createRequire(import.meta.url)('sharp');

const [slug, src, position = 'centre', fy = '0.5'] = process.argv.slice(2);
if (!slug || !src) throw new Error('usage: build-area-heroes.mjs <slug> <original> [position] [phoneFocusY]');

// Budgets are small on purpose: the phone version is the page's LCP image.
async function write(out, pipeline, max) {
  for (let q = 72; q >= 24; q -= 6) {
    await pipeline().webp({ quality: q, effort: 6 }).toFile(out);
    if (statSync(out).size <= max) break;
  }
  console.log(out, Math.round(statSync(out).size / 1024), 'KB');
}

await write(`public/areas/${slug}-hero-1600.webp`, () => sharp(src).rotate().resize(1600, 800, { fit: 'cover', position }), 120_000);

// Phone band: take a 9:5 window centred at phoneFocusY so the subject sits mid-band.
const { width: sw, height: sh } = await sharp(src).rotate().toBuffer({ resolveWithObject: true }).then((r) => r.info);
const ch = Math.min(sh, Math.round(sw / 1.8));
const cw = Math.round(ch * 1.8);
const top = Math.round(Math.min(Math.max(+fy * sh - ch / 2, 0), sh - ch));
const left = position === 'east' ? sw - cw : Math.round((sw - cw) / 2);
await write(`public/areas/${slug}-hero-900.webp`, () => sharp(src).rotate().extract({ left, top, width: cw, height: ch }).resize(900, 500), 40_000);
