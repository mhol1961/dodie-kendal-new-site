# ASSETS-BRIEF — dodiekendall.com

> Image and video assets the site needs. Copy-paste prompts below into Codex,
> Midjourney, fal.ai Seedance, or Higgsfield. All current placeholders are
> hand-authored SVGs that work today; replacing them with photography or
> generated stills/clips is a P0 polish pass before launch.
>
> **Status legend:**
> - ✅ already in repo (placeholder authored SVG / scraped photo)
> - 🟡 placeholder OK for now, real asset improves it
> - 🔴 needed before launch
>
> When real assets land, drop them into `/public/` with the filenames noted,
> overwriting the placeholders. No code changes needed.

---

## 1. HOME — hero background (🔴 needed)

**Where it shows:** Behind the home hero, behind the closing CTA, behind the
chat-widget panel header. Currently a pure-CSS aurora composition.

**Target deliverable:** one 16:9 1920×1080 still (`/public/hero-aurora.jpg`)
AND/OR one 8-second loopable mp4/webm (`/public/hero-aurora.mp4`, ≤2 MB
compressed). The CSS aurora stays as a fallback for `prefers-reduced-motion`
and pre-load.

**Prompt (image):**

```
Cinematic editorial wide-aspect hero background, 16:9 aspect ratio.

Composition: deep midnight indigo sky meeting a vast warm-golden horizon at
sunrise. Soft cream and coral cloud diffusion in the lower third. Faint
particles of golden light drift slowly. The mood is contemplative, serene,
sacred — the threshold between dream and waking.

Color palette: deep navy #0e1117 dominant, with jewel teal #1a8d8e and warm
coral-pink #c25c4c as light accents. NO purple, NO pink-gradient cliche.

Style: long-exposure photography, subtle film grain, premium editorial.
Absolutely no people, no recognizable objects, no text, no symbols.
The image must work as a background with text overlaid in the upper-left
third — keep that area uncluttered.

Negative: stock wellness imagery, lotus poses, crystals, chakras, third eye,
mandala, smiling models, purple gradients.
```

**Prompt (video, 8s loop):**

```
8-second loopable video, 16:9 1920×1080, designed to sit BEHIND text without
distracting. Very slow, contemplative motion — barely-perceptible breathing
rhythm.

Scene: a deep midnight indigo nebula with soft teal and warm coral aurora
light pulsing gently from the upper-left and lower-right corners. Tiny
golden particles drift like dust in a sunbeam.

Motion: the aurora drifts in a 24-second cycle (use the middle 8s).
Particles drift downward at varying speeds. No camera movement, no zoom,
no swooping shots.

Audio: none — video is muted on web.

Color: same palette as the image brief above.
```

Codex one-liner to fire fal.ai Seedance 2.0:

```bash
fal run seedance-2-0 \
  --prompt "<paste prompt above>" \
  --aspect-ratio 16:9 \
  --duration 8 \
  --output public/hero-aurora.mp4
```

---

## 2. HOME — alternative hero portrait treatment (🟡 ok now, improves with real)

**Where:** Right-hand column of the home hero. Currently uses Dodie's
existing professional portrait from her current site.

**Target:** A second portrait that's more cinematic — Dodie in a warm
sunlit interior, soft natural light, looking into the camera with quiet
confidence. Vertical 4:5 crop, `/public/dodie-portrait-cinematic.jpg`.

**Prompt (photography brief for a real shoot):**

```
Portrait of Dodie — a woman in her 50s with long blonde hair, in a
warm-toned interior (cream linens, soft natural light through gauze
curtains, no clutter). Composition: 4:5 vertical, head-and-upper-torso,
slightly off-center, soft eye contact with the camera. Mood: serene,
warm, confident, NOT smiling-stock. Wardrobe: cream or warm-earth tones,
natural fabrics. Avoid black, avoid pure white. Background: out-of-focus
warm interior — no mystical symbols, no crystals, no books-of-spirits.
```

---

## 3. ABOUT — chapter photography (🔴 needed for launch polish)

**Where:** Currently the About page has ONE mid-page photo break (Dodie's
hero portrait). It would benefit from 2–3 more visual moments.

**Target deliverables:**

- `/public/about/florida-light.jpg` — 16:9, warm-Florida-morning palm light
  (no people, no beach cliche)
- `/public/about/hands-clasped.jpg` — 4:3, hands in soft prayer / receiving
  position, warm light, no face shown
- `/public/about/studio-corner.jpg` — 3:4, a corner of Dodie's session room
  (recliner, soft throw, side table, no spiritual paraphernalia)

**Prompts:**

```
Florida-light:
Editorial photograph. Warm morning light filtering through palm fronds onto
a cream-colored linen surface. Soft golden-hour color cast. Subtle motion
blur in the fronds. No people, no beach, no ocean. 16:9.

Hands-clasped:
Editorial photograph. A pair of hands in a soft receiving posture (palms
upward, fingers gently relaxed), resting on warm-cream linen. Skin tone:
warm. Lighting: soft window light from the left. No face visible, no
jewelry, no symbols. 4:3.

Studio-corner:
Editorial photograph. A quiet corner of a wellness practice room: a soft
cream recliner with a warm-coral throw, a small wooden side table with a
single white pillar candle (unlit), warm afternoon light. NO crystals,
NO mandalas, NO Buddha statues, NO mystical iconography. The room should
read as a "professional but warm therapist's office," not a "spiritual
shop." 3:4.
```

---

## 4. QHHT — symbolic / illustrative art (🟡 SVG ok, could be photography)

The QHHT page currently uses an authored SVG "threshold doorway" composition.
That's working but a real cinematic alternative would be stronger.

**Target (if upgrading):** A single hero photograph of a doorway or arched
threshold with light pouring through. `/public/qhht/threshold.jpg`.

**Prompt:**

```
Editorial photograph of an arched doorway in a warm-cream interior. Light
pours through from the room beyond — bright, teal-gold, slightly diffused.
The frame is empty (no person crossing). Composition: 3:4 vertical, the
doorway centered, the threshold prominent in the lower half. Mood:
threshold, invitation, calm. No symbols, no signage, no clutter.
```

---

## 5. INSIGHTS — per-post hero art (🟡 SVG ok, photography ideal)

Currently each blog post has an authored SVG composition (clock for "What
Happens", Venn for "Regression vs QHHT", thread-and-stones for "Prepare",
compass for "Choosing a Practitioner"). These work and are on-brand.

If you want to upgrade to photography, target 8:5 aspect, 1600×1000:

- `/public/insights/what-happens-photo.jpg` — A single warm-lit clock face,
  hands at a contemplative angle, no numbers visible. Cream surface,
  off-center composition.
- `/public/insights/regression-vs-qhht-photo.jpg` — Two overlapping circles
  of light on a warm-cream surface, like sun through a window.
- `/public/insights/prepare-photo.jpg` — A small notebook with a single line
  of handwriting visible (use lorem ipsum or "what do you want to know?"),
  warm light from the left.
- `/public/insights/practitioner-photo.jpg` — A brass compass on a warm wood
  surface, dramatic side lighting, the needle pointing toward the viewer.

---

## 6. FAVICON + LOGO (🔴 P0 — current is placeholder coral circle)

The current `/public/logo.svg` and `/public/favicon.svg` are placeholder
coral circles with a "D" glyph. Dodie's existing brand has a portrait
cutout + "DODIE KENDALL" wordmark in coral-pink caps.

**Target deliverables:**

- `/public/logo.svg` — clean wordmark, "Dodie Kendall" in display caps,
  coral-pink, with optional sigil mark (small ornamental element). Should
  read at 40px height in the header.
- `/public/favicon.svg` — single-glyph sigil, square, scales down to 16px.
- `/public/apple-touch-icon.png` — same sigil at 180×180.

**Prompt (logo design brief):**

```
Logo wordmark for Dodie Kendall QHHT — a Quantum Healing Hypnosis
practitioner. The mark should read as: editorial, warm, sacred, confident,
NOT mystical-cliche.

Type: a refined serif (think Fraunces or Canela) for "Dodie Kendall" with
optional smaller sans subtitle "QHHT Practitioner" or "Quantum Healing
Hypnosis". Color: coral-pink #c25c4c (matches existing brand wordmark).

Sigil (optional, small): a single hand-drawn element — a sun rising over
a horizon line, OR three concentric circles, OR a stylized seed shape.
Must be simple enough to work at 16×16 favicon size.

Avoid: third-eye iconography, lotus flowers, mandalas, geometric
overcomplication.

Deliverable: SVG, on transparent background, also rendered as 180×180 PNG
for apple-touch-icon.
```

---

## 7. CHAT WIDGET AVATAR (🟡 nice-to-have)

The chat widget currently has no avatar in the header — just the greeting.
A small circular portrait (40×40) of Dodie would warm it up.

**Target:** `/public/chat-avatar.jpg`, 80×80 (2x for retina), Dodie head-shot
crop with soft warm background, face friendly + open.

---

## 8. OG IMAGES — per-page social cards (🟡 default OK, custom is better)

Currently every page uses `/public/og-image.jpg` (a sand-fill placeholder).

**Target:** A single rich OG card for the homepage at 1200×630, plus
per-page variants for the four blog posts.

**Prompt template for og-image:**

```
Social card, 1200×630. Composition: dark midnight-aurora background (same
palette as home hero), Dodie's portrait on the right one-third, text on the
left two-thirds. Text: "Dodie Kendall QHHT" in display serif white, then
"Access your higher wisdom." in italic Fraunces below. Subtle coral glow
behind the portrait. No URL, no emoji.
```

---

## Where to put generated files

```
public/
├── hero-aurora.jpg        — section 1
├── hero-aurora.mp4        — section 1 (optional)
├── dodie-portrait-cinematic.jpg — section 2 (optional)
├── about/
│   ├── florida-light.jpg
│   ├── hands-clasped.jpg
│   └── studio-corner.jpg
├── qhht/
│   └── threshold.jpg      — optional upgrade
├── insights/
│   ├── what-happens-photo.jpg     (optional)
│   ├── regression-vs-qhht-photo.jpg (optional)
│   ├── prepare-photo.jpg          (optional)
│   └── practitioner-photo.jpg     (optional)
├── logo.svg               — section 6 (P0)
├── favicon.svg            — section 6 (P0)
├── apple-touch-icon.png   — section 6 (P0)
├── chat-avatar.jpg        — section 7 (optional)
└── og-image.jpg           — section 8 (P1 — replace placeholder)
```

When the real files land, drop them in at these paths and the site picks
them up automatically (most are wired by filename already; image upgrades
that need code changes are noted in the section text above).

---

*Last updated: 2026-05-18.*
