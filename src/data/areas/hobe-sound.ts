// Hobe Sound (southern Martin County). Drive facts: OSRM route from the town center to
// central Stuart (scripts/area-routes.json); county facts from OpenStreetMap/Wikipedia.
import type { LocalArea } from './types';

const area: LocalArea = {
  slug: 'hobe-sound',
  name: 'Hobe Sound',
  areaType: 'City',
  seo: {
    title: 'QHHT near Hobe Sound, FL',
    description:
      'QHHT for Hobe Sound and southern Martin County, about 20 to 30 minutes north on US 1 in Stuart, FL. Gentle, in-person sessions with Dodie Kendall.',
  },
  heading: 'QHHT for Hobe Sound, straight up US 1',
  intro: [
    'For clients in Hobe Sound and southern Martin County, my Stuart studio is about 20 to 30 minutes north on US 1. It’s an easy drive, and a good chance to unwind before you arrive.',
    'Some people come with one clear question. Others just know something is ready to shift. Either way is a fine place to start.',
  ],
  drive: {
    time: 'About 20 to 30 minutes',
    miles: 12.3,
    routeSummary: 'US 1 (Federal Highway) north nearly the whole way',
    steps: [
      'Get on US 1, called Federal Highway through here, and head north.',
      'Follow it for close to 12 miles. The whole trip stays inside Martin County.',
      'US 1 brings you into Stuart from the south.',
    ],
  },
  mapAlt: 'Map of the drive from Hobe Sound north to Stuart on US 1, about 12.3 miles.',
  localNote: {
    heading: 'Use the drive',
    body: 'Some clients like to keep the radio off on the way in and let their questions settle. On the way home, the quiet gives the session room to keep unfolding.',
  },
  faq: [
    {
      question: 'Do you see clients from Hobe Sound?',
      answer:
        'Yes. Sessions are held in person at my private studio in Stuart, about 12 miles north. The exact address comes with your booking confirmation.',
    },
    {
      question: 'Is QHHT a medical treatment?',
      answer:
        'No. QHHT is a hypnosis modality for self-discovery and personal growth. It is not a substitute for medical or psychological care.',
    },
    {
      question: 'How do I reserve a time?',
      answer: 'Book online. $300 per session. A $50 deposit reserves your time. Your booking is confirmed instantly by email.',
    },
    {
      question: 'Will I remember the session?',
      answer:
        'Most people remember some or all of it, but memories can fade the way dreams do. That’s why every session is recorded and the audio is yours to keep.',
    },
  ],
  nearby: ['palm-city', 'jupiter'],
};

export default area;
