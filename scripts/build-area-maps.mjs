// Builds the drive map for each local-area page: public/areas/<slug>-map-{800,1600}.webp.
// Real OpenStreetMap tiles (streets, water, place names), lightened to the site's
// palette, with the real driving route from the town center to central Stuart drawn
// on top. Two markers only: the town and "Stuart" (the Stuart city center, NEVER the
// studio address). "© OpenStreetMap contributors" is printed on every map.
//
//   node scripts/build-area-maps.mjs          # draw from the cached routes
//   node scripts/build-area-maps.mjs --fetch  # re-route via the public OSRM server first
//
// Routes are cached in scripts/area-routes.json; tiles in node_modules/.cache/osm-tiles,
// so redrawing needs no network. Tiles come from tile.openstreetmap.org: a few dozen per
// run, cached, with an identifying User-Agent, per the OSM tile usage policy.
// Town centers are the OpenStreetMap place/boundary centers from Nominatim (2026-10-06).
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';

const sharp = createRequire(import.meta.url)('sharp');
const root = new URL('../', import.meta.url);
const CACHE = new URL('scripts/area-routes.json', root);
const TILES = new URL('node_modules/.cache/osm-tiles/', root).pathname;
const FONTS = new URL('assets/prep-guide/fonts/', root).pathname;
const OUT = new URL('public/areas/', root).pathname;
const UA = 'dodiekendall.com area-map build (static images, cached; contact: dodiekendall@gmail.com)';

const STUART = { name: 'Stuart', lat: 27.197983, lon: -80.2519175 };
const PLACES = {
  'port-st-lucie': { name: 'Port St. Lucie', lat: 27.2939333, lon: -80.3503283 },
  tradition: { name: 'Tradition', lat: 27.2678616, lon: -80.4327545 },
  jupiter: { name: 'Jupiter', lat: 26.9342246, lon: -80.0942087 },
  'palm-city': { name: 'Palm City', lat: 27.1713925, lon: -80.2842217 },
  'jensen-beach': { name: 'Jensen Beach', lat: 27.2379528, lon: -80.2389899 },
  'hobe-sound': { name: 'Hobe Sound', lat: 27.059498, lon: -80.1364323 },
};
const MAPS = ['port-st-lucie', 'jupiter', 'palm-city', 'jensen-beach', 'hobe-sound'];

const C = { ink: '#221811', coral: '#d55759', teal: '#005d5e', cream: '#f7f3ec' };
// Frames (CSS size, drawn at each scale): computers get 800x500 at 1x and 2x; phones a
// squarer 400x320 frame drawn at 2x, so its labels stay full size on a small screen.
const FRAMES = [
  { W: 800, H: 500, PAD: 70, out: [[1, '800'], [2, '1600']] },
  { W: 400, H: 320, PAD: 44, out: [[2, 'phone']] },
];

async function fetchRoutes() {
  const out = {};
  for (const [slug, p] of Object.entries(PLACES)) {
    const url = `https://router.project-osrm.org/route/v1/driving/${p.lon},${p.lat};${STUART.lon},${STUART.lat}?overview=full&geometries=geojson&steps=true`;
    const r = await (await fetch(url, { headers: { 'User-Agent': UA } })).json();
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

// Web Mercator pixel coordinates at zoom z (256px tiles).
const project = ([lon, lat], z) => {
  const s = 256 * 2 ** z;
  const r = (lat * Math.PI) / 180;
  return [((lon + 180) / 360) * s, ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * s];
};

async function tile(z, x, y) {
  const f = `${TILES}${z}-${x}-${y}.png`;
  if (existsSync(f)) return readFileSync(f);
  const res = await fetch(`https://tile.openstreetmap.org/${z}/${x}/${y}.png`, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`tile ${z}/${x}/${y}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(f, buf);
  await new Promise((r) => setTimeout(r, 250));
  return buf;
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
async function label(str, font, file, color) {
  const { data, info } = await sharp({ text: { text: `<span foreground="${color}">${esc(str)}</span>`, font, fontfile: FONTS + file, rgba: true } })
    .png()
    .toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

async function draw(slug, routes, { W, H, PAD, out: outputs }) {
  const town = PLACES[slug];
  const line = routes[slug].coords;
  const pts = [...line, [town.lon, town.lat], [STUART.lon, STUART.lat]];
  // Highest zoom (max 14) at which the route fits inside the padded frame.
  let z = 14;
  for (; z > 8; z--) {
    const xy = pts.map((p) => project(p, z));
    const w = Math.max(...xy.map((p) => p[0])) - Math.min(...xy.map((p) => p[0]));
    const h = Math.max(...xy.map((p) => p[1])) - Math.min(...xy.map((p) => p[1]));
    if (w <= W - 2 * PAD && h <= H - 2 * PAD) break;
  }
  const xy = pts.map((p) => project(p, z));
  const ox = Math.round((Math.min(...xy.map((p) => p[0])) + Math.max(...xy.map((p) => p[0]))) / 2 - W / 2);
  const oy = Math.round((Math.min(...xy.map((p) => p[1])) + Math.max(...xy.map((p) => p[1]))) / 2 - H / 2);

  // Base: the OSM tiles under the frame, desaturated and washed toward the site cream.
  const layers = [];
  for (let tx = Math.floor(ox / 256); tx <= Math.floor((ox + W - 1) / 256); tx++) {
    for (let ty = Math.floor(oy / 256); ty <= Math.floor((oy + H - 1) / 256); ty++) {
      layers.push({ input: await tile(z, tx, ty), left: tx * 256 - ox + 256, top: ty * 256 - oy + 256 });
    }
  }
  // Two steps: sharp crops before it composites, whatever the call order.
  const mosaic = await sharp({ create: { width: W + 512, height: H + 512, channels: 3, background: C.cream } })
    .composite(layers)
    .png()
    .toBuffer();
  const raw = await sharp(mosaic).extract({ left: 256, top: 256, width: W, height: H }).png().toBuffer();
  const base1 = await sharp(raw)
    .modulate({ saturation: 0.55, brightness: 1.03 })
    .composite([{ input: Buffer.from(`<svg width="${W}" height="${H}"><rect width="100%" height="100%" fill="${C.cream}" fill-opacity="0.22"/></svg>`) }])
    .png()
    .toBuffer();

  for (const [s, suffix] of outputs) {
    const P = (p) => project(p, z).map((v, i) => (v - (i ? oy : ox)) * s);
    const route = line.map((p) => P(p).map((v) => v.toFixed(1)).join(',')).join(' ');
    const [tx, ty] = P([town.lon, town.lat]);
    const [sx, sy] = P([STUART.lon, STUART.lat]);
    const dot = (x, y, fill) => `<circle cx="${x}" cy="${y}" r="${8 * s}" fill="${fill}" stroke="#fff" stroke-width="${3 * s}"/>`;
    const svg = `<svg width="${W * s}" height="${H * s}" xmlns="http://www.w3.org/2000/svg">
      <polyline points="${route}" fill="none" stroke="#fff" stroke-width="${10 * s}" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="0.9"/>
      <polyline points="${route}" fill="none" stroke="${C.coral}" stroke-width="${5 * s}" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
    const over = [];

    // Labels in white pills, on the side of each marker away from the route. Each pill
    // also runs under its marker, hiding the tile's own copy of that place name.
    const pill = async (text, color, x, y, preferLeft) => {
      const l = await label(text, `Inter SemiBold ${15 * s}`, 'Inter-SemiBold.ttf', color);
      const pw = l.w + 16 * s;
      const ph = l.h + 8 * s;
      let left = preferLeft ? x - 14 * s - pw : x + 14 * s;
      if (left < 6 * s || left + pw > W * s - 6 * s) left = preferLeft ? x + 14 * s : x - 14 * s - pw;
      left = Math.round(Math.min(Math.max(left, 6 * s), W * s - pw - 6 * s));
      const top = Math.round(Math.min(Math.max(y - ph / 2, 6 * s), H * s - ph - 34 * s));
      const bx = Math.round(Math.max(Math.min(left, x - 64 * s), 0));
      const bw = Math.round(Math.min(Math.max(left + pw, x + 64 * s), W * s) - bx);
      over.push({ input: Buffer.from(`<svg width="${bw}" height="${ph}"><rect width="100%" height="100%" rx="${ph / 2}" fill="#fff"/></svg>`), left: bx, top });
      over.push({ input: l.data, left: left + 8 * s, top: top + 4 * s });
    };
    const awayLeft = (from, toward) => P(toward)[0] > from[0];
    await pill(town.name, C.ink, tx, ty, awayLeft([tx, ty], line[Math.min(15, line.length - 1)]));
    await pill('Stuart', C.teal, sx, sy, awayLeft([sx, sy], line[Math.max(0, line.length - 16)]));
    // Route above the pills (labels sit on the side away from it), markers on top.
    over.push({ input: Buffer.from(svg) });
    over.push({ input: Buffer.from(`<svg width="${W * s}" height="${H * s}" xmlns="http://www.w3.org/2000/svg">${dot(tx, ty, C.coral)}${dot(sx, sy, C.teal)}</svg>`) });

    const attr = await label('© OpenStreetMap contributors', `Inter Medium ${11 * s}`, 'Inter-Medium.ttf', '#4a3f38');
    const aw = attr.w + 12 * s;
    const ah = attr.h + 6 * s;
    over.push({ input: Buffer.from(`<svg width="${aw}" height="${ah}"><rect width="100%" height="100%" fill="#fff" fill-opacity="0.85"/></svg>`), left: W * s - aw, top: H * s - ah });
    over.push({ input: attr.data, left: W * s - aw + 6 * s, top: H * s - ah + 3 * s });

    const base = s === 1 ? base1 : await sharp(base1).resize(W * 2, H * 2, { kernel: 'lanczos3' }).sharpen({ sigma: 0.6 }).toBuffer();
    const out = `${OUT}${slug}-map-${suffix}.webp`;
    await sharp(base).composite(over).webp({ quality: 80, effort: 6 }).toFile(out);
    console.log(out, `z${z}`, Math.round(readFileSync(out).length / 1024), 'KB');
  }
  for (const old of ['webp', 'png']) rmSync(`${OUT}${slug}-map.${old}`, { force: true });
}

mkdirSync(TILES, { recursive: true });
mkdirSync(OUT, { recursive: true });
const routes = process.argv.includes('--fetch') ? await fetchRoutes() : JSON.parse(readFileSync(CACHE, 'utf8'));
for (const slug of MAPS) for (const f of FRAMES) await draw(slug, routes, f);
for (const slug of MAPS) {
  const r = routes[slug];
  console.log(`${slug}: ${r.minutes} min, ${r.miles} mi via ${r.roads.join(' > ')}`);
}
