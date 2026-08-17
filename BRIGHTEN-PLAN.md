# Kendall Sites: "Make It Brighter" Plan + Prompts

Prepared for Mark, 2026-06-17. Covers both Astro sites (Guiding Winds Unplug and DodieKendall.com QHHT), Dodie's brightness feedback, Clint's title changes, and the brown-dress photo edit. Nothing has been changed in code yet. This is the plan and the paste-ready prompts so you can run it bit by bit with client sign-off.

---

## 1. What Dodie actually means by "too dark"

She is right, and it is not a dark-mode problem. Both sites are built in light mode, but they use a deliberate "dark editorial drama" device: big near-black and deep-night section bands, and heavy dark gradient scrims laid over the hero photos. So even with sunshine imagery, the dominant impression is dark and heavy.

Here is where the darkness actually comes from, in the real code:

**Guiding Winds Unplug**
- The core text/ink color `--color-primary` is `#0F0F0F` (near black), and it is reused as a hero overlay. Example, `src/pages/lp-1.astro`: a full-screen scrim `bg-gradient-to-t from-primary via-primary/55 to-primary/35` sits on top of the hero photo.
- `lp-1` literally uses a night photo: `/img/source/hero/05-caribbean-night-moonlit.jpg`.
- Deep-teal and near-black bands: `--color-teal-shadow #0E3F47`, `--color-surface-warm #1F1B17`, `--color-warm-mid #3A2F25` are used for full-width section panels (aboard, about, voyages, experiences, calendar).
- The home hero section is `bg-primary text-bone` (near-black base) behind the video reels.

**DodieKendall.com (QHHT)**
- The home hero is a deep-night panel: `src/components/HomeHero.astro` is `bg-bg-inverse-deeper text-inverse min-h-[100vh]`, where `--bg-inverse-deeper` is oklch `0.10 0.020 240` (almost black blue).
- Same deep-night treatment on `ClosingCTA.astro`, `TestimonialGrid.astro`, and `landing-page-3.astro`.
- The `.bg-aurora` helper is a dark-night base with a teal/coral wash. Dramatic, but dark.

The good news: the bright palette Dodie is asking for already exists in both themes. It is just used as small accents on top of dark instead of leading. GW already has sun gold `#E8A340`, soft teal `--color-teal-soft / --color-teal-mist`, sage, paper off-whites. DK already has teal-glow, coral-pink (`--brand-primary`), a gold accent (`--brand-accent`), sage, and a ready-made light `.bg-sunrise` gradient.

So "brighter, more aqua and white and pinks and gold, sun-light bright and happy" translates cleanly to three moves:
1. Flip the dominant section surfaces from dark to light and airy (paper/white, teal-mist, sunrise).
2. Lighten or remove the dark hero scrims, and swap night/dusk photos for bright daytime turquoise shots.
3. Promote the aqua, gold, and pink that are already in the palette so they lead instead of sitting on black.

---

## 2. Yes, do it bit by bit. Here is the recommended cadence.

Doing this in one big pass is the wrong move. If they do not love the direction, you have redone 20 pages for nothing. Pilot one screen per site first, get a thumbs up, then roll the same tokens and pattern across everything.

**Stage 0, pilot (do this first, ~1 screen per site).** Rework only the home hero on each site to the bright direction. Push to the cloud, send Dodie the two links, ask "is this the feeling you and Clint want?" One yes here de-risks the entire job.

**Stage 1, global tokens + section bands.** Once approved, lighten the recurring dark section panels site-wide by editing a small number of tokens and swapping the heavy band classes. This is where 80% of the "dark" feeling disappears for the least effort.

**Stage 2, hero imagery + scrims.** Replace night/dusk photos with bright daytime ones and soften remaining overlays.

**Stage 3, cleanup.** Footers, testimonial sections, closing CTAs, and any one-off dark panels.

**Stage 4, titles + photo.** Apply Clint's approved taglines and drop in the brightened dress photo.

Verification gate after every stage: you push to cloud, Dodie refreshes the link, she confirms before you move on. That matches exactly what you told her in the texts.

---

## 3. The brightness levers, mapped to real files

### Guiding Winds Unplug
Token file: `guidingwinds-unplug/src/styles/theme.css` (auto-generated, see note) and the extra `@theme` block in `src/styles/global.css`.

Note: `theme.css` is regenerated from `DESIGN.md` by `scripts/design-export.mjs`. Do not hand-edit `theme.css`. Change the value in `DESIGN.md` then run `npm run design:export`, or change it in the `global.css` `@theme` block which Tailwind v4 merges on top.

Lighten or retire on big panels:
- `bg-surface-warm` (#1F1B17) and `bg-warm-mid` (#3A2F25): swap section usages to `bg-paper`, `bg-teal-mist`, or `bg-sage`.
- `bg-teal-shadow` (#0E3F47) full-width bands: switch to `bg-teal-soft` (#B9CFD3) or `bg-teal-mist` (#DCE7E9).
- Hero scrims `from-primary via-primary/55`: reduce to `from-primary/30 via-transparent` or a white-bottom gradient so the photo stays bright.

Highest-impact files (most dark usage): `pages/voyages/index.astro`, `pages/about.astro`, `pages/voyages/[slug].astro`, `pages/experiences.astro`, `pages/aboard.astro`, `components/shared/SectionInterrupt.astro`, `pages/calendar.astro`, `components/home/TestimonialRow.astro`.

### DodieKendall.com (QHHT)
Token file: `src/styles/global.css` `:root` block (oklch), mirrored in `tailwind.config.mjs`.

Lighten or retire:
- Home hero `HomeHero.astro`: change `bg-bg-inverse-deeper text-inverse` to a light treatment, either `bg-sunrise` (existing warm light gradient) or `bg-base` with a soft `bg-aurora`-style teal-glow wash. Switch `text-inverse` to `text-ink`.
- `ClosingCTA.astro`, `TestimonialGrid.astro`, `landing-page-3.astro` hero, and the `py-24` `bg-bg-inverse-deeper` band: same flip to light, or to a bright teal-glow tint.
- If you want to keep one dramatic dark moment for contrast, keep it only on the closing CTA and make everything above it bright.

Highest-impact files: `components/HomeHero.astro`, `components/TestimonialGrid.astro`, `components/ClosingCTA.astro`, `pages/landing-page-3.astro`, `pages/about.astro`, `pages/faq.astro`, `pages/qhht.astro`, `components/ThreeAct.astro`.

---

## 4. Paste-ready prompts (run one stage at a time)

These are written to hand to your coding assistant against each repo. They reference the real files and tokens above.

### Prompt A, Stage 0 pilot, Guiding Winds home hero
```
Repo: guidingwinds-unplug. Goal: make the HOME hero feel sun-bright and happy
(aqua, white, gold) without a full redesign. Only touch the home hero.

1. In src/components/home/Hero.astro, change the section base from
   `bg-primary text-bone` to a light treatment: `bg-bone text-primary`, and
   make the photo/video overlay a soft light scrim instead of near-black.
   Replace any `from-primary` overlay with
   `bg-gradient-to-t from-bone/70 via-transparent to-transparent` so the
   daytime image reads bright.
2. Keep the gold (`text-sun`) star rating and use `text-accent` sparingly.
3. For the first poster scene, prefer a bright daytime turquoise shot over a
   sunset/dusk one if available in /public/img.
Do not change any other page. Build and report the diff.
```

### Prompt B, Stage 0 pilot, DodieKendall home hero
```
Repo: dodiekendall-website-redo. Goal: make the HOME hero bright, airy, and
welcoming (aqua/teal-glow, white, soft pink, gold), not deep-night.
Only touch the home hero.

1. In src/components/HomeHero.astro, change the section from
   `bg-bg-inverse-deeper text-inverse` to a light treatment. Use the existing
   `.bg-sunrise` gradient (warm light) OR `bg-bg-base` with a subtle teal-glow
   radial wash. Change `text-inverse` to `text-ink` and any inverse-muted text
   to `text-ink-secondary`.
2. Keep coral-pink (`brand`) and gold (`accent`) as accents, add a touch of
   `teal-glow` so it feels aqua and happy.
3. Ensure contrast still passes AA on the lighter background.
Do not change any other component or page. Build and report the diff.
```

### Prompt C, Stage 1, Guiding Winds section bands (after pilot approved)
```
Repo: guidingwinds-unplug. Lighten the recurring dark section bands site-wide.
- Replace full-width `bg-surface-warm` and `bg-warm-mid` section panels with
  `bg-paper` or `bg-teal-mist`; switch their text back to `text-primary`.
- Replace `bg-teal-shadow` full-width bands with `bg-teal-soft` (or `bg-teal-mist`
  for editorial breaks); adjust text to `text-primary`.
- Keep `text-accent` and `text-sun` as accents.
Files to cover first: pages/voyages/index.astro, pages/about.astro,
pages/voyages/[slug].astro, pages/experiences.astro, pages/aboard.astro,
components/shared/SectionInterrupt.astro, pages/calendar.astro,
components/home/TestimonialRow.astro.
Leave the "In the price" card animation intact. Build and report the diff.
```

### Prompt D, Stage 1, DodieKendall dark sections
```
Repo: dodiekendall-website-redo. Flip the deep-night section bands to bright.
- In TestimonialGrid.astro, ClosingCTA.astro, and the bg-bg-inverse-deeper bands
  in landing-page-3.astro, about.astro, faq.astro, qhht.astro, ThreeAct.astro:
  change `bg-bg-inverse-deeper` / `bg-aurora` to `bg-bg-base` or `bg-sunrise`,
  and `text-inverse*` to `text-ink*`.
- You may keep ONE dark dramatic moment on the final ClosingCTA only; make
  everything above it bright. Confirm with me which one to keep.
- Use teal-glow + brand (coral-pink) + accent (gold) as the new accents.
Build and report the diff.
```

### Prompt E, Stage 2, hero imagery + scrims
```
Both repos. Replace night/dusk hero photos with bright daytime turquoise shots,
and reduce any remaining dark gradient scrims to <=30% opacity at the bottom
edge only. Specifically in guidingwinds: lp-1.astro currently uses
/img/source/hero/05-caribbean-night-moonlit.jpg with a
`from-primary via-primary/55 to-primary/35` scrim. Swap to a daytime image and
reduce the scrim. List every hero image you changed.
```

Run E only after Stage 1 lands, because once the bands are light, you will see exactly which photos still drag the mood down.

---

## 5. Clint's title changes

The five lines Clint sent are all sailing-themed, so they belong to Guiding Winds, not the QHHT site. Dodie said she likes all of them and especially "What If One Week Could Change Everything?"

Current Guiding Winds headlines, with file and line so a swap is a one-line edit:
- Home hero (`pages/index.astro`, lines 52 to 54): "Where guests become crew... the path back to presence."
- `lp-1.astro` (h1 around line 29): "You don't need another vacation. You need a week off the grid."
- `lp-2.astro` (h1 around line 35): ends in emphasis "rest."
- `lp-3.astro` (h1 around line 34): ends in emphasis "one of six."

Suggested mapping (for Clint to confirm, not final):
- "What If One Week Could Change Everything?" -> `lp-1` hero (her favorite, highest-intent page).
- "More Than a Vacation. A Complete Reset." -> home hero eyebrow/headline.
- "A Floating Retreat for the Adventurous Soul." -> `lp-2` or `lp-3`.
- "Escape the Ordinary. Sail the Extraordinary." and "Not All Treasure Is Gold. Sometimes It's Peace of Mind." -> hold as alternates / section interrupts.

One thing to nail down with Clint before editing: which existing title each new line replaces, and on which page. Once he says "use this one here," each is a literal text swap in the file above. Note the headlines use a two-part structure (a plain prefix plus an italic accent span in `text-accent`), so for a line like "What If One Week Could Change Everything?" decide which words get the italic gold/accent treatment, for example italicizing "Change Everything?".

The QHHT site titles are not in Clint's five lines. If he wants those changed too, ask him to send QHHT-specific ones and I will map them the same way.

---

## 6. Brown dress to white, brightened, AI image prompt (prompt only, per your call)

Use this in an image editor that does identity-preserving edits (Photoshop with Firefly generative fill, Google nano-banana / Gemini image, or GPT image edit). Upload the highest-resolution original you have. If your tool supports masking, mask just the dress for the recolor step and do the brightening as a second pass on the whole image.

Primary prompt:
```
Edit this photograph of the same woman, same face, same hairstyle, same pose,
same camera angle and background. Change only her brown dress into an elegant
flowing white/ivory dress in a similar style and fit, with natural fabric folds
and soft, realistic lighting that matches the scene. Then brighten the overall
image: lift the shadows, increase exposure slightly, add a warm sunlit glow and
gentle airy highlights so it feels bright, happy, and luminous. Keep skin tones
natural and true to life. Photorealistic, high detail, no change to her facial
features or identity.
```

Guardrails / negative prompt (if your tool has a negative field):
```
do not change her face, do not alter her body shape, no plastic or waxy skin,
no extra people, no warped hands, no oversaturation, no harsh HDR halos,
keep the background unchanged
```

Tips: generate 3 to 4 variations and pick the most natural fabric. If the white blows out, run a second pass: "recover highlight detail in the white dress, keep it bright but not clipped." Keep the original on file so you can redo if Dodie wants a warmer ivory vs pure white.

---

## 7. A short note you can send Dodie

> Got it, thank you both. I know exactly what you mean about the sites feeling dark even though they are in light mode. There are some heavy dark panels and shadowed photos pulling the mood down, and I am going to lighten those and bring up the aqua, white, gold, and soft pink so it feels sun-bright and happy. I will start with just the top of each site as a sample, push it to the cloud, and send you the two links. Take a look, and if that is the feeling you and Clint want, I will roll it across both whole sites. Send Clint's title picks whenever you have them and I will drop them in.

---

## Open items before code changes
1. Stage 0 pilot approval from Dodie/Clint on the two home heroes.
2. Clint to confirm which title replaces which page (Guiding Winds), and whether he wants QHHT titles changed too.
3. Whether to keep one intentional dark "drama" moment on the DodieKendall closing CTA, or go fully bright.
4. The source dress photo (when you are ready to run the image edit).
