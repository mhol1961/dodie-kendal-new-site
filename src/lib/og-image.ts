// Build-time share image (1200x630 PNG) for Insights posts without their own
// frontmatter ogImage. Only used by the prerendered /og/[slug].png route, so it
// runs in Node at build time. The Cloudflare adapter still bundles that route
// for the Worker (and refuses Node built-ins), so sharp (already installed via
// astro) is loaded through createRequire, invisible to the
// bundler. Colors are the light tokens from global.css converted to hex.
const nodeRequire = () => process.getBuiltinModule('node:module').createRequire(`${process.cwd()}/`);
const sharp = () => nodeRequire()('sharp') as typeof import('sharp').default;
const fontFile = (file: string) => `${process.cwd()}/assets/prep-guide/fonts/${file}`;

const W = 1200;
const H = 630;
const PAD = 96;

const C = {
  bgFrom: '#f6ede0',
  bgTo: '#f0decd',
  ink: '#221811',
  muted: '#6d6059',
  coral: '#d55759',
  teal: '#005d5e',
  tealGlow: '#1ad1d1',
};

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function text(markup: string, font: string, file: string, width: number, height?: number) {
  return sharp()({
    // With a height, sharp autofits the size to the box (used as a last resort).
    text: { text: markup, font, fontfile: fontFile(file), width, height, rgba: true, wrap: 'word', spacing: 6 },
  })
    .png()
    .toBuffer({ resolveWithObject: true });
}

const background = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${C.bgFrom}"/><stop offset="1" stop-color="${C.bgTo}"/>
    </linearGradient>
    <radialGradient id="teal" cx="0.92" cy="0.08" r="0.55">
      <stop offset="0" stop-color="${C.tealGlow}" stop-opacity="0.22"/><stop offset="1" stop-color="${C.tealGlow}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="coral" cx="0.05" cy="1" r="0.6">
      <stop offset="0" stop-color="${C.coral}" stop-opacity="0.18"/><stop offset="1" stop-color="${C.coral}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#teal)"/>
  <rect width="${W}" height="${H}" fill="url(#coral)"/>
  <rect x="0" y="0" width="${W}" height="10" fill="${C.coral}"/>
  <rect x="${PAD}" y="${H - PAD - 46}" width="64" height="3" rx="1.5" fill="${C.coral}"/>
</svg>`;

export async function renderShareImage(title: string): Promise<Buffer> {
  const titleWidth = W - PAD * 2;
  const maxTitleHeight = H - PAD * 2 - 140;
  // Step the size down until a long title fits its box.
  let rendered = await text(`<span foreground="${C.ink}">${escape(title)}</span>`, 'Fraunces SemiBold 72', 'Fraunces-SemiBold.ttf', titleWidth);
  for (const size of [62, 54, 46, 0]) {
    if (rendered.info.height <= maxTitleHeight) break;
    rendered = await text(`<span foreground="${C.ink}">${escape(title)}</span>`, `Fraunces SemiBold ${size || 46}`, 'Fraunces-SemiBold.ttf', titleWidth, size ? undefined : maxTitleHeight);
  }
  const eyebrow = await text(`<span foreground="${C.teal}" letter_spacing="4096">INSIGHTS</span>`, 'Inter SemiBold 22', 'Inter-SemiBold.ttf', titleWidth);
  const byline = await text(`<span foreground="${C.muted}">Dodie Kendall · QHHT · Stuart, FL</span>`, 'Inter Medium 26', 'Inter-Medium.ttf', titleWidth);

  const titleTop = Math.round(PAD + 56 + (maxTitleHeight - Math.min(rendered.info.height, maxTitleHeight)) / 2);
  return sharp()(Buffer.from(background))
    .composite([
      { input: eyebrow.data, left: PAD, top: PAD },
      { input: rendered.data, left: PAD, top: titleTop },
      { input: byline.data, left: PAD, top: H - PAD - 26 },
    ])
    .png()
    .toBuffer();
}

// Default share image for every page without its own (home, /qhht, /book...)
// and the LocalBusiness schema image. Served at /og/default.jpg.
const PHOTO_W = 460;
export async function renderDefaultShareImage(): Promise<Buffer> {
  const colW = W - PHOTO_W - PAD - 48;
  // Upper body from Dodie's cream-dress portrait (1400x1750), face in the top third.
  const photo = await sharp()(`${process.cwd()}/public/dodie-portrait.jpg`)
    .extract({ left: 220, top: 40, width: 1040, height: 1402 })
    .resize(PHOTO_W, H - 10)
    .toBuffer();
  const eyebrow = await text(`<span foreground="${C.teal}" letter_spacing="3072">QUANTUM HEALING HYPNOSIS</span>`, 'Inter SemiBold 20', 'Inter-SemiBold.ttf', colW);
  const name = await text(`<span foreground="${C.ink}">Dodie Kendall</span>`, 'Fraunces SemiBold 84', 'Fraunces-SemiBold.ttf', colW);
  const line = await text(`<span foreground="${C.coral}">QHHT in Stuart, FL</span>`, 'Fraunces SemiBold Italic 46', 'Fraunces-SemiBoldItalic.ttf', colW);
  const byline = await text(`<span foreground="${C.muted}">In-person sessions · dodiekendall.com</span>`, 'Inter Medium 26', 'Inter-Medium.ttf', colW);

  const nameTop = 226;
  return sharp()(Buffer.from(background))
    .composite([
      { input: photo, left: W - PHOTO_W, top: 10 },
      { input: eyebrow.data, left: PAD, top: PAD + 56 },
      { input: name.data, left: PAD, top: nameTop },
      { input: line.data, left: PAD, top: nameTop + name.info.height + 18 },
      { input: byline.data, left: PAD, top: H - PAD - 26 },
    ])
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer();
}
