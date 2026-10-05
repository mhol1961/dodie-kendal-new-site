// ============================================================================
// EXAMPLE FIXTURE ONLY. NOT ROUTED. NOT REAL COPY.
// No page imports this file, so it is never published. It exists to show the
// shape of a city data file. Every string contains the token [EXAMPLE], and
// LocalAreaLayout refuses to build (production) any page whose data still
// contains it, so copying this file without rewriting every field fails loudly.
// ============================================================================
import type { LocalArea } from './types';

const area: LocalArea = {
  slug: 'example-town',
  name: '[EXAMPLE] Town',
  areaType: 'City',
  seo: {
    title: '[EXAMPLE] QHHT near Example Town',
    description: '[EXAMPLE] Unique meta description for this town.',
  },
  heading: '[EXAMPLE] H1 written for this town',
  intro: [
    '[EXAMPLE] First intro paragraph. Say something only true of this town and its people.',
    '[EXAMPLE] Optional second paragraph.',
  ],
  drive: {
    minutes: 30,
    routeSummary: '[EXAMPLE] Highway A south to Road B',
    steps: [
      '[EXAMPLE] Start at a landmark locals know.',
      '[EXAMPLE] Take Highway A south.',
      '[EXAMPLE] Exit at Road B toward Stuart.',
    ],
  },
  parking: '[EXAMPLE] Parking notes for the studio.',
  testimonial: {
    quote: '[EXAMPLE] A real client quote, used with permission.',
    name: '[EXAMPLE] First L.',
    town: '[EXAMPLE] Town',
  },
  faq: [
    { question: '[EXAMPLE] Local question one?', answer: '[EXAMPLE] Answer one.' },
    { question: '[EXAMPLE] Local question two?', answer: '[EXAMPLE] Answer two.' },
    { question: '[EXAMPLE] Local question three?', answer: '[EXAMPLE] Answer three.' },
  ],
};

export default area;
