// Jensen Beach (Martin County). Drive facts: OSRM route from the town center to central
// Stuart (scripts/area-routes.json); Roosevelt Bridge facts from Wikipedia.
import type { LocalArea } from './types';

const area: LocalArea = {
  slug: 'jensen-beach',
  name: 'Jensen Beach',
  areaType: 'City',
  seo: {
    title: 'QHHT near Jensen Beach, FL',
    description:
      'In-person QHHT near Jensen Beach, FL, about 10 to 20 minutes south in Stuart. Dodie Kendall, trained in the Dolores Cannon lineage. Recording included.',
  },
  heading: 'QHHT near Jensen Beach, over the Roosevelt Bridge',
  intro: [
    'If you’re in Jensen Beach, my studio is about 10 to 20 minutes south in Stuart, just over the Roosevelt Bridge, so it’s easy to fit a session into your week.',
    'You already know how the water can slow everything down. A QHHT session works in a similar way. It gives your busy mind a place to rest so a deeper part of you can speak.',
  ],
  drive: {
    time: 'About 10 to 20 minutes',
    miles: 4.8,
    routeSummary: 'Savannah Road and Dixie Highway, then US 1 over the Roosevelt Bridge',
    steps: [
      'Head south on Savannah Road (CR 723), which turns into Dixie Highway (CR 707).',
      'Near the river, Wright Boulevard links you over to US 1. Turn south.',
      'Cross the Roosevelt Bridge, about a mile long, over the St. Lucie River and into Stuart.',
    ],
  },
  mapAlt: 'Map of the drive from Jensen Beach south to Stuart, about 4.8 miles, ending on US 1 over the Roosevelt Bridge.',
  faq: [
    {
      question: 'Where do Jensen Beach clients go for their session?',
      answer:
        'To my private studio in Stuart, about 5 miles south on the other side of the St. Lucie River. The exact address comes with your booking confirmation.',
    },
    {
      question: 'What kinds of questions can I bring?',
      answer:
        'Anything that’s been waiting for an answer, like physical discomfort you can’t explain, a decision you’re stuck on, or a relationship pattern that keeps repeating. There are no wrong questions.',
    },
    {
      question: 'How do I prepare?',
      answer: 'Start with the free prep guide. It walks you through what to expect and how to shape your questions.',
    },
  ],
  nearby: ['port-st-lucie', 'hobe-sound'],
};

export default area;
