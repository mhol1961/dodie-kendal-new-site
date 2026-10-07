// Builds the drive map for each local-area page: public/areas/<slug>-map.{webp,png}.
// Light, branded, no street address and no studio pin: just the real driving route
// from the town center to central Stuart, with faint dots for the neighboring towns.
//
//   node scripts/build-area-maps.mjs          # draw from the cached routes
//   node scripts/build-area-maps.mjs --fetch  # re-route via the public OSRM server first
//
// Routes are cached in scripts/area-routes.json so redrawing needs no network.
// Town centers are the OpenStreetMap place/boundary centers from Nominatim (2026-10-06).
// Stuart is the Stuart city center, never the studio address.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';

const sharp = createRequire(import.meta.url)('sharp');
const root = new URL('../', import.meta.url);
const CACHE = new URL('scripts/area-routes.json', root);
const FONTS = new URL('assets/prep-guide/fonts/', root).pathname;
const OUT = new URL('public/areas/', root).pathname;

const STUART = { name: 'Stuart', lat: 27.197983, lon: -80.2519175 };
const PLACES = {
  'port-st-lucie': { name: 'Port St. Lucie', lat: 27.2939333, lon: -80.3503283 },
  tradition: { name: 'Tradition', lat: 27.2678616, lon: -80.4327545 },
  jupiter: { name: 'Jupiter', lat: 26.9342246, lon: -80.0942087 },
  'palm-city': { name: 'Palm City', lat: 27.1713925, lon: -80.2842217 },
  'jensen-beach': { name: 'Jensen Beach', lat: 27.2379528, lon: -80.2389899 },
  'hobe-sound': { name: 'Hobe Sound', lat: 27.059498, lon: -80.1364323 },
};
// One map per page. `also` draws an extra route (Tradition is part of Port St. Lucie).
const MAPS = [
  { slug: 'port-st-lucie', also: ['tradition'] },
  { slug: 'jupiter' },
  { slug: 'palm-city' },
  { slug: 'jensen-beach' },
  { slug: 'hobe-sound' },
];

const C = { bg: '#f6ede0', ink: '#221811', muted: '#8a7d74', faint: '#cdbfb2', coral: '#d55759', teal: '#005d5e', water: '#e3ecea' };
const W = 1200;
const H = 800;
const PAD = 90;

async function fetchRoutes() {
  const out = {};
  for (const [slug, p] of Object.entries(PLACES)) {
    const url = `https://router.project-osrm.org/route/v1/driving/${p.lon},${p.lat};${STUART.lon},${STUART.lat}?overview=full&geometries=geojson&steps=true`;
    const r = await (await fetch(url, { headers: { 'User-Agent': 'dodiekendall-site-build/1.0' } })).json();
    if (r.code !== 'Ok') throw new Error(`OSRM ${slug}: ${r.code}`);
    const rt = r.routes[0];
    out[slug] = {
      minutes: Math.round(rt.duration / 6) / 10,
      miles: Math.round(rt.distance / 160.934) / 10,
      roads: [...new Set(rt.legs[0].steps.filter((s) => s.distance > 300).map((s) => s.ref || s.name).filter(Boolean))],
      coords: rt.geometry.coordinates.map(([lon, lat]) => [+lon.toFixed(5), +lat.toFixed(5)]),
    };
    await new Promise((res) => setTimeout(res, 1500)); // public server: stay well under 1 req/sec
  }
  writeFileSync(CACHE, JSON.stringify(out) + '\n');
  return out;
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
async function label(str, font, file, color) {
  const { data, info } = await sharp({ text: { text: `<span foreground="${color}">${esc(str)}</span>`, font, fontfile: FONTS + file, rgba: true } })
    .png()
    .toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

async function draw(map, routes) {
  const town = PLACES[map.slug];
  const lines = [map.slug, ...(map.also ?? [])].map((s) => routes[s].coords);
  // Fit the routes, at least ~0.09 deg tall so the short drives still show their neighbors.
  const pts = lines.flat().concat([[STUART.lon, STUART.lat]]);
  const k = Math.cos((town.lat * Math.PI) / 180);
  let [x0, x1] = [Math.min(...pts.map((p) => p[0] * k)), Math.max(...pts.map((p) => p[0] * k))];
  let [y0, y1] = [Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[1]))];
  const span = Math.max(x1 - x0, ((y1 - y0) * (W - 2 * PAD)) / (H - 2 * PAD - 80), 0.09 * ((W - 2 * PAD) / (H - 2 * PAD - 80)));
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const scale = (W - 2 * PAD) / span; // px per (deg * cos lat)
  const px = (lon, lat) => [W / 2 + (lon * k - cx) * scale, (H - 80) / 2 + (cy - lat) * scale];
  const inside = ([x, y]) => x > 40 && x < W - 40 && y > 40 && y < H - 120;

  const path = (c) => c.map(([lon, lat], i) => `${i ? 'L' : 'M'}${px(lon, lat).map((v) => v.toFixed(1)).join(' ')}`).join('');
  const [tx, ty] = px(town.lon, town.lat);
  const [sx, sy] = px(STUART.lon, STUART.lat);
  // Scale bar: the largest of 1, 2 or 5 miles that fits in ~180px.
  const pxPerMile = scale / 69.05 / 1; // 1 deg latitude ~ 69.05 mi; x is cos-corrected
  const miles = [10, 5, 2, 1, 0.5].find((m) => m * pxPerMile <= 200) ?? 0.5;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  <rect x="0" y="0" width="${W}" height="8" fill="${C.coral}"/>
  ${lines.slice(1).map((c) => `<path d="${path(c)}" fill="none" stroke="${C.teal}" stroke-opacity="0.45" stroke-width="5" stroke-dasharray="2 12" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}
  <path d="${path(lines[0])}" fill="none" stroke="#ffffff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${path(lines[0])}" fill="none" stroke="${C.teal}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
  ${(map.also ?? []).map((s) => { const [x, y] = px(PLACES[s].lon, PLACES[s].lat); return `<circle cx="${x}" cy="${y}" r="9" fill="${C.bg}" stroke="${C.teal}" stroke-width="4"/>`; }).join('')}
  <circle cx="${tx}" cy="${ty}" r="15" fill="${C.coral}" stroke="#ffffff" stroke-width="5"/>
  <circle cx="${sx}" cy="${sy}" r="13" fill="${C.teal}" stroke="#ffffff" stroke-width="5"/>
  <g transform="translate(${W - 70} 70)"><path d="M0 -26 L10 4 L0 -2 L-10 4 Z" fill="${C.ink}" fill-opacity="0.7"/></g>
  <rect x="${PAD}" y="${H - 150}" width="${miles * pxPerMile}" height="4" fill="${C.ink}" fill-opacity="0.6"/>
  <rect x="0" y="${H - 104}" width="${W}" height="104" fill="#ffffff" fill-opacity="0.55"/>
</svg>`;

  const r = routes[map.slug];
  const big = (s, col) => label(s, 'Fraunces SemiBold 40', 'Fraunces-SemiBold.ttf', col);
  const small = (s, col = C.muted) => label(s, 'Inter Medium 22', 'Inter-Medium.ttf', col);
  const layers = [];
  const place = (lbl, x, y, side) => {
    // A label that would run off the right edge goes left of its dot instead of over it.
    if (side === 'right' && x + 26 + lbl.w > W - 16) side = 'left';
    const left = Math.round(Math.min(Math.max(side === 'left' ? x - lbl.w - 26 : x + 26, 16), W - lbl.w - 16));
    layers.push({ input: lbl.data, left, top: Math.round(Math.min(Math.max(y - lbl.h / 2, 20), H - 130 - lbl.h)) });
  };
  // Put each end label on the side the route line does not leave from.
  const main = lines[0];
  const away = ([lon, lat], x) => (px(lon, lat)[0] > x ? 'left' : 'right');
  place(await big(town.name, C.ink), tx, ty, away(main[Math.min(12, main.length - 1)], tx));
  place(await big('Stuart', C.teal), sx, sy, away(main[Math.max(0, main.length - 13)], sx));
  for (const s of map.also ?? []) { const [x, y] = px(PLACES[s].lon, PLACES[s].lat); place(await small(PLACES[s].name, C.teal), x, y, 'right'); }
  const n = await label('N', 'Inter SemiBold 20', 'Inter-SemiBold.ttf', C.ink);
  layers.push({ input: n.data, left: W - 70 - Math.round(n.w / 2), top: 82 });
  const sc = await small(`${miles} mile${miles === 1 ? '' : 's'}`);
  layers.push({ input: sc.data, left: PAD, top: H - 140 });
  const cap = await label(`About ${r.miles} miles by car, ${town.name} to Stuart`, 'Inter SemiBold 26', 'Inter-SemiBold.ttf', C.ink);
  layers.push({ input: cap.data, left: PAD, top: H - 82 });
  const credit = await label('Route: OSRM · Map data © OpenStreetMap contributors', 'Inter Regular 16', 'Inter-Regular.ttf', C.muted);
  layers.push({ input: credit.data, left: PAD, top: H - 38 });

  const img = sharp(Buffer.from(svg)).composite(layers);
  mkdirSync(OUT, { recursive: true });
  // Flat colors: a palette PNG, then lossless WebP from it, is ~10 KB (smaller than lossy WebP).
  const png = await img.png({ palette: true, quality: 90 }).toBuffer();
  writeFileSync(`${OUT}${map.slug}-map.png`, png);
  await sharp(png).webp({ lossless: true }).toFile(`${OUT}${map.slug}-map.webp`);
  console.log(`${map.slug}: ${r.minutes} min, ${r.miles} mi via ${r.roads.join(' > ')}`);
}

const routes = process.argv.includes('--fetch') || !existsSync(CACHE) ? await fetchRoutes() : JSON.parse(readFileSync(CACHE, 'utf8'));
for (const m of MAPS) await draw(m, routes);
