// Jupiter (Palm Beach County). Drive facts: OSRM route from the town center to central
// Stuart (scripts/area-routes.json); county facts from OpenStreetMap/Wikipedia.
import type { LocalArea } from './types';

const area: LocalArea = {
  slug: 'jupiter',
  name: 'Jupiter',
  areaType: 'City',
  seo: {
    title: 'QHHT near Jupiter, FL',
    description:
      'QHHT for Jupiter, FL clients at Dodie Kendall’s private studio in Stuart, about 35 to 45 minutes north on I-95. In person, with your audio recording.',
  },
  heading: 'Coming up from Jupiter for your QHHT session',
  intro: [
    'If you’re coming up from Jupiter, my Stuart studio is about 35 to 45 minutes north, most of it on I-95. Close enough for a day that belongs entirely to you.',
    'Many people tell me they’ve been circling the same question for years. A QHHT session is a chance to stop circling and ask the part of you that already knows.',
  ],
  drive: {
    time: 'About 35 to 45 minutes',
    miles: 23.9,
    routeSummary: 'Indiantown Road to I-95 north, then Kanner Highway into Stuart',
    steps: [
      'Take Indiantown Road (SR 706) west for about 3 miles to I-95.',
      'Go north on I-95 for about 13 miles. Along the way you leave Palm Beach County and enter Martin County.',
      'Exit onto Kanner Highway (SR 76) and follow it about 6 miles into Stuart.',
    ],
  },
  mapAlt:
    'Map of the drive from Jupiter north to Stuart, about 23.9 miles, mostly on I-95 and then Kanner Highway.',
  localNote: {
    heading: 'Make a day of it',
    body: 'Plan to arrive a little early so you’re not rushing in. Once the session is over, let the drive home be quiet time to sit with what came through.',
  },
  hero: {
    alt: 'The red Jupiter Inlet Lighthouse rising above green shoreline and calm blue water on a clear day in Jupiter, Florida',
    position: 'right 25%',
    credit: 'Photo: Lea Shanley, CC BY-SA 3.0, via Wikimedia Commons, cropped',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Jupiter_Inlet_Lighthouse_and_Museum_-_waterfront_view.jpg',
  },
  faq: [
    {
      question: 'Do you offer QHHT sessions in Jupiter?',
      answer:
        'My sessions are held in person at my private studio in Stuart, about 24 miles north of Jupiter by car. You’ll receive the exact address with your booking confirmation.',
    },
    {
      question: 'What if nothing comes through?',
      answer:
        'Everyone’s experience is different. Some people see vivid images, and others notice feelings or simply know something. I’ll guide you gently, and you’ll have the recording to revisit afterward.',
    },
    {
      question: 'Is the drive worth it for one session?',
      answer:
        'QHHT is designed as a single, in-depth session, so you don’t need to plan repeat trips. You leave with your recording and can come back to it anytime.',
    },
  ],
  nearby: ['hobe-sound', 'palm-city'],
};

export default area;
