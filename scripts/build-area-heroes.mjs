// Town-page hero photos: crop + compress a downloaded original into
//   public/areas/<slug>-hero-1600.webp  2:1, laptops: subject placed in the clear right half
//   public/areas/<slug>-hero-900.webp   900x780, phones/tablets banner: subject centred
// Only freely licensed photos; record each in docs/areas-photo-credits.md.
//   node scripts/build-area-heroes.mjs <slug> <original> <subjectX> <subjectY>
// subjectX/Y: where the main subject sits in the original, as 0..1 fractions.
import { createRequire } from 'node:module';
import { statSync } from 'node:fs';
const sharp = createRequire(import.meta.url)('sharp');

const [slug, src, sx = '0.5', sy = '0.5'] = process.argv.slice(2);
if (!slug || !src) throw new Error('usage: build-area-heroes.mjs <slug> <original> <subjectX> <subjectY>');
const { width: SW, height: SH } = (await sharp(src).rotate().toBuffer({ resolveWithObject: true })).info;
const [X, Y] = [+sx * SW, +sy * SH];

// Largest window of aspect `a` (w/h) that puts the subject at (tx, ty) inside it,
// but never narrower than `minW` (then the subject lands as close as the edges allow).
function windowFor(a, tx, ty, minW) {
  let w = Math.min(SW, SH * a, X / tx, (SW - X) / (1 - tx), (Y / ty) * a, ((SH - Y) / (1 - ty)) * a);
  w = Math.round(Math.min(Math.max(w, minW), SW, SH * a));
  const h = Math.round(w / a);
  const clamp = (v, max) => Math.round(Math.min(Math.max(v, 0), max));
  return { left: clamp(X - tx * w, SW - w), top: clamp(Y - ty * h, SH - h), width: w, height: h };
}

// Budgets are small on purpose: these are the page's LCP image.
async function write(out, box, w, h, max) {
  for (let q = 72; q >= 24; q -= 6) {
    await sharp(src).rotate().extract(box).resize(w, h).webp({ quality: q, effort: 6 }).toFile(out);
    if (statSync(out).size <= max) break;
  }
  const subjX = ((X - box.left) / box.width).toFixed(2);
  console.log(out, Math.round(statSync(out).size / 1024), 'KB, crop', `${box.width}x${box.height}`, 'subject at x', subjX);
}

await write(`public/areas/${slug}-hero-1600.webp`, windowFor(2, 0.72, 0.5, 1600), 1600, 800, 120_000);
await write(`public/areas/${slug}-hero-900.webp`, windowFor(900 / 780, 0.5, 0.5, 900), 900, 780, 45_000);
