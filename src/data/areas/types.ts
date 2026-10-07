// Data shape for local-area landing pages rendered by src/layouts/LocalAreaLayout.astro
// at /qhht/<slug>. The required fields are what keeps a town page from being thin: its
// own intro (drive time in the first paragraph), real directions, a drive map and at
// least 3 local FAQs. The tuple types make the compiler enforce the minimum counts;
// the layout re-checks at build. Release is gated separately (see ./index.ts).

export interface AreaFaq {
  question: string;
  /** Plain text. Blank-line-free; use '\n' between paragraphs (Accordion splits on it). */
  answer: string;
}

export interface LocalArea {
  /** URL slug: the page lives at /qhht/<slug> (no trailing slash). */
  slug: string;
  /** Display name, e.g. 'Port St. Lucie'. Used in headings and schema areaServed. */
  name: string;
  /** schema.org areaServed type. Use 'City' for a single town, 'AdministrativeArea' for a pair/region. */
  areaType: 'City' | 'AdministrativeArea';
  seo: {
    /** Unique <title> (BRAND suffix is added by getSeo). */
    title: string;
    /** Unique meta description, 155 chars max. */
    description: string;
  };
  /** Page H1. Write it for this town; do not template it. */
  heading: string;
  /** Intro paragraphs written for this town. The FIRST must contain drive.time (lowercase ok). */
  intro: [string, ...string[]];
  drive: {
    /** Honest range from real routing, no dashes: 'About 20 to 30 minutes'. */
    time: string;
    /** Road distance from the town center to central Stuart (scripts/area-routes.json). */
    miles: number;
    /** One line, e.g. 'US 1 (Federal Highway) north the whole way'. */
    routeSummary: string;
    /** Directions from the town center. Only roads the real route uses. */
    steps: [string, ...string[]];
  };
  /** Alt text for /areas/<slug>-map.{webp,png} (built by scripts/build-area-maps.mjs). */
  mapAlt: string;
  /**
   * Optional hero photo of a real place in this town, behind the heading:
   * /areas/<slug>-hero-{900,1600}.webp (scripts/build-area-heroes.mjs). Only freely
   * licensed photos; source, photographer and license go in docs/areas-photo-credits.md.
   */
  hero?: {
    /** Describes the place and the town. */
    alt: string;
    /** CSS object-position for the crop, e.g. 'center 40%'. */
    position?: string;
    /** Shown small under the hero when the license requires attribution. */
    credit?: string;
    /** The photo's source page (with its license), linked from the credit. */
    creditUrl?: string;
  };
  /** Optional short note in the "Getting here" section. */
  localNote?: { heading: string; body: string };
  /** ONLY a real testimonial from a client in or near this town, used with permission. Omit otherwise. */
  testimonial?: {
    quote: string;
    /** First name + last initial only, e.g. 'Maria K.' */
    name: string;
    town: string;
  };
  /** Local questions, at least 3. Also emitted as FAQPage JSON-LD. */
  faq: [AreaFaq, AreaFaq, AreaFaq, ...AreaFaq[]];
  /** Slugs of neighboring town pages. Only the ones built in this build are linked. */
  nearby: string[];
}
