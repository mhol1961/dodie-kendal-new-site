// Palm City (Martin County). Drive facts: OSRM route from the town center to central
// Stuart (scripts/area-routes.json); river crossing from OpenStreetMap (Overpass).
import type { LocalArea } from './types';

const area: LocalArea = {
  slug: 'palm-city',
  name: 'Palm City',
  areaType: 'City',
  seo: {
    title: 'QHHT near Palm City, FL',
    description:
      'Quantum Healing Hypnosis Technique for Palm City, about 10 to 15 minutes away in Stuart, FL. In-person QHHT with Dodie Kendall, audio recording included.',
  },
  heading: 'QHHT for Palm City, just across the river',
  intro: [
    'Palm City is practically next door. Your QHHT session is about 10 to 15 minutes away, in a quiet, private room in Stuart.',
    'There’s no travel day to plan and no hotel to book. Just you, the questions you’ve been sitting with, and whatever is ready to come through.',
  ],
  drive: {
    time: 'About 10 to 15 minutes',
    miles: 3.6,
    routeSummary: 'Martin Downs Boulevard over the South Fork, then Kanner Highway',
    steps: [
      'Head east on Martin Downs Boulevard (SR 714). It crosses the South Fork of the St. Lucie River and becomes Monterey Road.',
      'Turn left onto Kanner Highway (SR 76) and go about a mile north into Stuart.',
      'That’s the whole trip, about 3.6 miles, and you never leave Martin County.',
    ],
  },
  mapAlt: 'Map of the short drive from Palm City east across the river to Stuart, about 3.6 miles.',
  localNote: {
    heading: 'Easy to come back to',
    body: 'Being this close makes it simple to follow up afterward, whether you have a question about your recording or want to talk through what surfaced.',
  },
  faq: [
    {
      question: 'How far is your studio from Palm City?',
      answer:
        'Just a few minutes across the South Fork of the St. Lucie River, about 3.6 miles by car. The exact address comes with your booking confirmation.',
    },
    {
      question: 'Do I need any experience with hypnosis?',
      answer:
        'None at all. I explain everything during our pre-session conversation, and you stay aware and in charge the whole time.',
    },
    {
      question: 'Will I get a recording?',
      answer: 'Yes. Every session is recorded, and the audio is yours to keep.',
    },
  ],
  nearby: ['port-st-lucie', 'hobe-sound'],
};

export default area;
