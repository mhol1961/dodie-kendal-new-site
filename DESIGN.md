---
project: dodiekendall.com
spec_version: 1.0
spec_format: google-design-md
updated: 2026-05-17
color_system: oklch
tokens:
  color:
    background:
      base:          "oklch(0.97 0.008 85)"       # warm cream (slightly cooler than sand)
      raised:        "oklch(0.99 0.005 85)"       # near-paper, slight warm tint
      sunken:        "oklch(0.93 0.012 80)"       # deeper cream for footers
      gradient-from: "oklch(0.95 0.020 80)"       # cream top
      gradient-to:   "oklch(0.91 0.030 65)"       # cream → peach bottom
      inverse:       "oklch(0.18 0.018 240)"      # deep night — dark hero/closing
      inverse-deeper:"oklch(0.10 0.020 240)"      # darker night for vignette anchors
    surface:
      card:          "oklch(0.99 0.005 85)"
      overlay:       "oklch(0.12 0.02 240 / 0.55)"  # dark photo overlay
    ink:
      primary:       "oklch(0.22 0.02 60)"        # deep warm umber (body)
      secondary:     "oklch(0.42 0.025 55)"       # softer warm gray (subtext)
      muted:         "oklch(0.50 0.02 50)"        # captions/meta — AA on bg-base + bg-sunken
      inverse:       "oklch(0.97 0.008 85)"       # cream text on dark surface
      inverse-muted: "oklch(0.82 0.020 80)"       # softened cream on dark for subtext
    brand:
      primary:       "oklch(0.62 0.16 22)"        # coral-pink — matches Dodie's existing wordmark
      primary-hover: "oklch(0.55 0.17 20)"        # deeper coral
      teal:          "oklch(0.42 0.10 195)"       # jewel teal (jewel accent)
      teal-glow:     "oklch(0.78 0.13 195)"       # aurora cyan glow (highlights only)
      accent:        "oklch(0.72 0.08 95)"        # honey-gold (rare)
      sage:          "oklch(0.68 0.05 145)"       # grounding sage (rare)
    semantic:
      success:       "oklch(0.65 0.10 145)"
      warning:       "oklch(0.78 0.13 80)"
      error:         "oklch(0.55 0.18 25)"
      info:          "oklch(0.60 0.08 230)"
    border:
      subtle:        "oklch(0.88 0.01 70)"
      strong:        "oklch(0.75 0.02 65)"
  typography:
    display:
      family:        "'Fraunces', 'Cormorant Garamond', Georgia, serif"
      weight:        "500"                        # default; variable face supports 100–900
      tracking:      "-0.02em"
      leading:       "1.05"
      opsz-display:  "144"                        # optical size for giant display
    display-italic:
      family:        "'Fraunces', 'Cormorant Garamond', Georgia, serif"
      weight:        "500"
      style:         "italic"
      tracking:      "-0.015em"
    serif-text:
      family:        "'Cormorant Garamond', 'Cormorant', Georgia, serif"  # editorial body-display
      weight:        "500"
      leading:       "1.2"
    body:
      family:        "'Inter Variable', 'Inter', system-ui, sans-serif"   # body only, NEVER display
      weight:        "400"
      tracking:      "0"
      leading:       "1.65"
    mono:
      family:        "'JetBrains Mono', ui-monospace, monospace"
    scale:           # px equivalents at root 16
      xs:    "0.75rem"
      sm:    "0.875rem"
      base:  "1rem"
      lg:    "1.125rem"
      xl:    "1.25rem"
      "2xl": "1.5rem"
      "3xl": "1.875rem"
      "4xl": "2.5rem"
      "5xl": "3.5rem"
      "6xl": "5rem"
      "7xl": "6.5rem"
  spacing:
    section-y:  "6rem"           # vertical rhythm between sections
    prose-y:    "1.25rem"        # paragraph rhythm
    grid-gap:   "2rem"
  radii:
    sm:  "0.375rem"
    md:  "0.75rem"
    lg:  "1.25rem"
    xl:  "2rem"
    pill: "4rem"                  # for organic-shape CTAs and photo masks
    full: "9999px"
  elevation:
    none: "none"
    sm:   "0 1px 2px 0 oklch(0.25 0.02 60 / 0.05)"
    md:   "0 4px 12px -2px oklch(0.25 0.02 60 / 0.08)"
    lg:   "0 12px 32px -6px oklch(0.25 0.02 60 / 0.12)"
    glow: "0 0 0 1px oklch(0.62 0.13 35 / 0.2), 0 8px 24px -8px oklch(0.62 0.13 35 / 0.25)"
  motion:
    duration-fast:  "150ms"
    duration-base:  "250ms"
    duration-slow:  "450ms"
    easing-standard:  "cubic-bezier(0.2, 0.0, 0.0, 1.0)"
    easing-decelerate: "cubic-bezier(0.0, 0.0, 0.2, 1.0)"
  breakpoints:
    sm:  "640px"
    md:  "768px"
    lg:  "1024px"
    xl:  "1280px"
    "2xl": "1536px"
---

# DESIGN.md — dodiekendall.com

## Overview

dodiekendall.com is the digital front door for Dodie Kendall's Quantum Healing Hypnosis Technique (QHHT) practice. The design's job is to do three things at first glance:

1. **Earn trust quickly** — visitors are considering an intimate 5-hour hypnosis session. Visual register must read as safe, grounded, professional, and warm.
2. **Reduce cognitive load** — the current site overwhelms with text walls. New design uses generous whitespace, single-column reading widths for prose, and modular story sections instead of slabs.
3. **Channel toward one CTA** — direct booking via GHL calendar. Every page funnels there.

**Aesthetic register:** *warm-feminine + serene-grounded*. Think morning light on sand, soft pottery, linen, the inside of a sun-warmed seashell. **Not** clinical white. **Not** mystical-purple. **Not** corporate.

**Inspiration anchors:**
- shiftedsouls.com (Mark's prior QHHT build for Dana Motley) — IA and register
- Editorial wellness publications (Goop without the cynicism, mindbodygreen without the noise)
- Small-batch ceramic studios — soft, intentional, hand-touched

---

## Colors

The palette is built in **oklch** for perceptual uniformity and wide-gamut output. Tokens above are the source of truth.

**Roles:**
- `background.base` — warm off-white sand. Default page background. Replaces stark white.
- `background.raised` — cards, modals. Slightly lighter than base.
- `background.sunken` — footer and quote sections. Slightly deeper.
- `background.gradient-from` → `background.gradient-to` — the **sunrise gradient** used only in the hero and the closing CTA section. Never elsewhere.
- `ink.primary` — body text and most headings. Deep warm umber, not pure black.
- `brand.primary` — terracotta-coral. Anchors the existing logo. Used for primary CTAs and accent type.
- `brand.accent` — honey-gold. Used sparingly for hover states and small accent elements.
- `brand.sage` — grounding sage green. Used for icons and inline accents that need a "natural" counterweight.

**Contrast targets:** all text/background pairings ≥ WCAG 2.1 **AA** (4.5:1 for body, 3:1 for large text). Primary CTA button text on `brand.primary` background passes AA. Tested combos documented in `accessibility-review` output.

**Hard "no":** purple-pink gradients (banned globally); cool grays (out of register); pure black on pure white (creates a clinical feel that fights the brand).

---

## Typography

Two families. That's it.

- **Display:** *Cormorant Garamond* — a soft, elegant transitional serif. Used for h1, h2, pull quotes, and the brand wordmark companion line. Medium weight (500), slight negative tracking, tight leading (1.1) for big sizes.
- **Body:** *Inter Variable* — clean, neutral, highly legible. **Used only for body, UI labels, navigation, and small headings (h4+).** Never used as a display face. (See Hard Rule §1 in `CLAUDE.md`.)

**Type scale** — tokens above; minor third (1.2) for body cascade, major fourth (1.333) jumps for display.

**Reading widths:**
- Body prose: `max-w-prose` (~65ch). Never full-width body text.
- Hero copy: `max-w-2xl` for headline, `max-w-prose` for subhead.

**Specimens (default sizes at desktop):**

```
h1 (display)  → 4.5rem, weight 500, leading 1.05, tracking -0.015em
h2 (display)  → 3rem,   weight 500, leading 1.1,  tracking -0.01em
h3 (display)  → 2rem,   weight 500, leading 1.15
h4 (body)     → 1.25rem, weight 600, leading 1.3
body          → 1.0625rem, weight 400, leading 1.65
body-lg       → 1.1875rem, weight 400, leading 1.65
caption       → 0.875rem, weight 500, leading 1.4, tracking 0.02em, uppercase
```

---

## Layout

**Grid:** 12-column, max content width `1200px` for typical sections, `1440px` for hero-bleed image sections, `720px` for prose-only routes (blog posts, single-doc pages).

**Vertical rhythm:** `section-y = 6rem` between major sections (desktop); collapse to `4rem` at `sm`. Inside a section, headline → first paragraph = `2rem`; paragraph → paragraph = `1.25rem`.

**Page templates:**

1. **Home** — Hero (split-asymmetric) → Pull Quote → "What is QHHT" (modular 3-step) → Founder Spotlight → Lead-magnet email gate → Testimonial Grid → Closing CTA.
2. **About** — Hero (portrait-led) → Vertical scroll-triggered story sections (4–6 chapters) → Pull Quotes between every 2 chapters → Closing CTA.
3. **QHHT** — Hero (explanatory) → "What is QHHT" deep section → "What to expect" timeline → FAQ accordion → Closing CTA.
4. **Book** — Pre-embed reassurance copy → GHL calendar embed (wrapped in a card with our tokens) → "What happens next" 3-step → Privacy reassurance.
5. **Contact** — Brief intro → Form (Astro-handled, posts to GHL) → Phone + email fallback → Hours.
6. **FAQ** — Categorized accordion + JSON-LD `FAQPage` schema.
7. **Insights** (blog) — Card grid index → Single-post prose layout with pull quotes and related-posts strip.

**Header:** sticky, semi-transparent on scroll (`backdrop-blur-md bg-base/80`), logo lockup left, nav center-right, primary CTA right. Mobile = hamburger → full-screen menu overlay.

**Footer:** 4-column on desktop (Brand block, Site nav, Contact, Legal) → 1-column on mobile. Sunken background (`background.sunken`). Includes Privacy + Terms + Copyright + small social row.

---

## Elevation & Depth

Depth is **earned, not decorative**. Most surfaces sit flat on the page. Use elevation to mark genuine separation: a card lifted off the page, a primary CTA, a focus ring.

- `elevation.none` — default for inline blocks and prose containers.
- `elevation.sm` — text-input borders, subtle dividers when the design demands separation.
- `elevation.md` — testimonial cards, service cards, founder spotlight image.
- `elevation.lg` — modals, the booking embed card (gives weight to the conversion moment).
- `elevation.glow` — primary CTA on hover/focus only. Uses the terracotta hue at low alpha.

**No:** dark UI mode floating elements with heavy drop shadows. No neumorphism. No glassmorphism beyond the header's subtle backdrop blur.

---

## Shapes

Soft, organic, hand-touched.

- **Cards and primary containers:** `radii.lg` (1.25rem) — large enough to read as soft, not so large as to read as bubble.
- **Buttons:** `radii.pill` (4rem) — pill-shaped CTAs reinforce the inviting register.
- **Featured photos (founder spotlight, hero portrait):** SVG-masked organic blob OR `radii.pill` rounded-rectangle, never a hard rectangle. (Sister site Guiding Winds uses full-bleed rectangles; we do not.)
- **Pull-quote frames:** open quotation mark glyph in `brand.accent`, no box around the quote — quote text floats on background.
- **Section dividers:** thin (`1px`) `border.subtle` lines, used sparingly — usually a subtle horizontal rule below a section caption.

**No:** harsh rectangular cards with sharp corners. No squircle/iOS-app shapes. No isometric or 3D objects.

---

## Components

Components live in `src/components/`. Each has an Astro file + (where reasonable) a docs comment block at the top.

### Core layout
- `Header.astro` — Logo lockup + nav + CTA. Sticky with backdrop blur on scroll.
- `Footer.astro` — 4-col footer with Brand/Site/Contact/Legal columns.
- `Base.astro` (layout) — wraps every page, includes default SEO, schema.org defaults, fonts preload, analytics.

### Marketing primitives
- `Hero.astro` — variants: `home`, `about`, `qhht`, `service`. Split-asymmetric layout on home; portrait-led on About.
- `PullQuote.astro` — single quote, attribution optional. Used as section divider.
- `FounderSpotlight.astro` — image (organic-masked) + role + h2 + bio paragraphs + credentials + CTA.
- `ServiceCard.astro` — image + h3 + 2-line description + text-link CTA. (Used in a 1-up "single-service" arrangement for Dodie, vs. 3-up for shiftedsouls.)
- `TestimonialGrid.astro` — **static grid** (not carousel) of 3 or 6 testimonials. Each card has quote + name + city/role + circular orb avatar.
- `LeadMagnetGate.astro` — email-only inline form posting to `/api/lead-magnet`. Returns Dodie's pre-session prep PDF.
- `BookingEmbed.astro` — wraps Dodie's GHL calendar iframe inside our card styling so it doesn't read as a transplant.
- `ContactForm.astro` — Full Name + Email + Phone (optional) + Message + consent checkboxes (marketing + transactional). Posts to `/api/contact`.

### UI primitives (shadcn-style, hand-ported to Astro)
- `ui/Button.astro` — variants: `primary` (terracotta), `secondary` (outlined sand), `ghost` (text-only).
- `ui/Input.astro` — text/email/tel/textarea.
- `ui/Card.astro`
- `ui/Badge.astro`
- `ui/Accordion.astro` — for FAQ.

### Stateful islands (use sparingly)
- Only when interactivity demands it (FAQ accordion, mobile menu, form validation feedback). Default = `client:visible` to defer.

---

## Do's and Don'ts

### Do
- ✅ Use the sunrise gradient (`gradient-from → gradient-to`) **only** in the hero and the closing-CTA section. Anywhere else, use a flat token.
- ✅ Mask portrait photography with organic SVG blobs or pill shapes (Dodie hero, Founder Spotlight, About-page chapter images).
- ✅ Use pull quotes as section dividers in About and long blog posts. Cormorant display face, no box, big quote glyph in `brand.accent`.
- ✅ Lead with whitespace. If a section feels "too empty," it's probably correct.
- ✅ Single primary CTA per page. Secondary CTAs may exist but never compete visually.
- ✅ Run `design-critique` + `brand-review` + `accessibility-review` before declaring any visual page done.
- ✅ Test color contrast at every component. AA minimum, AAA where reachable.
- ✅ Reduced-motion: respect `prefers-reduced-motion: reduce` on every scroll-triggered animation.

### Don't
- ❌ Inter as display. Period.
- ❌ Purple-pink gradients. Anywhere. Ever.
- ❌ Carousel sliders. Use static grids or vertical lists. Carousels hide content from screen readers and depress CRO.
- ❌ Heavy drop shadows or neumorphism. We do soft, hand-touched, not floating-glass.
- ❌ Pure black (`#000`) text on pure white (`#FFF`) background. Use `ink.primary` on `background.base`.
- ❌ Stock photography of generic "spiritual" iconography (cosmic galaxies, third-eye crystal balls, glowing chakras). Use natural light, soft textures, Dodie's actual portraits.
- ❌ All-caps body text or all-caps subheads. Caption-style (`text-xs uppercase tracking-wide`) is fine for *small* labels only.
- ❌ More than 3 type sizes visible in any single section. Cap the visual density.

---

*Tokens above are source-of-truth. When tokens change, update them here first, then propagate to `tailwind.config.mjs`. Use `design-md` skill to keep the format consistent. Run `design-critique` on any change.*
