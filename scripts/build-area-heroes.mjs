// Town-page hero photos: crop + compress a downloaded original into
// public/areas/<slug>-hero-1600.webp (2:1, computers) and -hero-900.webp (6:5, phones).
// Only freely licensed photos; record each in docs/areas-photo-credits.md.
//   node scripts/build-area-heroes.mjs <slug> <original.jpg> [sharp position, e.g. centre|top|west]
import { createRequire } from 'node:module';
import { statSync } from 'node:fs';
const sharp = createRequire(import.meta.url)('sharp');

const [slug, src, position = 'centre'] = process.argv.slice(2);
if (!slug || !src) throw new Error('usage: build-area-heroes.mjs <slug> <original> [position]');
// Budgets are small on purpose: the page shows the photo under an ~80% light overlay,
// where heavier compression is invisible, and the phone version is the page's LCP.
for (const [w, h, max] of [[1600, 800, 120_000], [900, 750, 36_000]]) {
  const out = `public/areas/${slug}-hero-${w}.webp`;
  // Step quality down until the file is under its budget.
  for (let q = 72; q >= 24; q -= 6) {
    await sharp(src).rotate().resize(w, h, { fit: 'cover', position }).webp({ quality: q, effort: 6 }).toFile(out);
    if (statSync(out).size <= max) break;
  }
  console.log(out, Math.round(statSync(out).size / 1024), 'KB');
}
