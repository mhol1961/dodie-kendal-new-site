// Data shape for local-area landing pages rendered by src/layouts/LocalAreaLayout.astro.
// Every field is required on purpose: a city page without its own intro, directions,
// parking notes, local testimonial and at least 3 local FAQs is a thin page. The tuple
// types below make the compiler enforce the minimum counts; the layout re-checks at build.

export interface AreaFaq {
  question: string;
  /** Plain text. Blank-line-free; use '\n' between paragraphs (Accordion splits on it). */
  answer: string;
}

export interface LocalArea {
  /** URL slug: the page lives at /areas/<slug> (no trailing slash). */
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
  /** Intro paragraphs, at least one, written for this town specifically. */
  intro: [string, ...string[]];
  drive: {
    /** Typical one-way drive time to the Stuart studio, in minutes. */
    minutes: number;
    /** One line, e.g. 'South on I-95 to Kanner Hwy (SR-76)'. */
    routeSummary: string;
    /** Turn-by-turn steps from a well-known local starting point. */
    steps: [string, ...string[]];
  };
  /** Parking notes for the studio, phrased for someone driving in from this town. */
  parking: string;
  /** A real testimonial from a client in or near this town, used with permission. */
  testimonial: {
    quote: string;
    /** First name + last initial only, e.g. 'Maria K.' */
    name: string;
    town: string;
  };
  /** Local questions, at least 3. Also emitted as FAQPage JSON-LD. */
  faq: [AreaFaq, AreaFaq, AreaFaq, ...AreaFaq[]];
}
