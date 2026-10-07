// Port St. Lucie, including Tradition and the west side (Tradition is part of the city).
// Drive facts: OSRM routes from the city center and from Tradition Square to central
// Stuart (scripts/area-routes.json); county and river names from OpenStreetMap/Wikipedia.
import type { LocalArea } from './types';

const area: LocalArea = {
  slug: 'port-st-lucie',
  name: 'Port St. Lucie',
  areaType: 'City',
  seo: {
    title: 'QHHT near Port St. Lucie, FL',
    description:
      'QHHT for Port St. Lucie and Tradition, about 20 to 35 minutes south at Dodie Kendall’s private studio in Stuart, FL. In person, recording included.',
  },
  heading: 'QHHT for Port St. Lucie, a short drive south',
  intro: [
    'If you live in Port St. Lucie, your session is about 20 to 35 minutes south at my private studio in Stuart, depending on which side of the city you start from. Close enough to come for the day, and just far enough from your everyday routine that it feels like stepping away.',
    'You bring the questions you’ve been carrying. I guide you somewhere quiet enough to hear the answers.',
    'That goes for Tradition and the west side too. Life out there can run on a tight schedule. A QHHT session is one of the few appointments where nothing is expected of you except showing up and listening inward.',
  ],
  drive: {
    time: 'About 20 to 35 minutes',
    miles: 10.8,
    routeSummary: 'Port St. Lucie Boulevard to US 1, then south over the Roosevelt Bridge',
    steps: [
      'From the middle of the city, take Port St. Lucie Boulevard (SR 716) southeast. It crosses the North Fork of the St. Lucie River on the way.',
      'Turn right onto US 1 and head south. You leave St. Lucie County and enter Martin County along this stretch.',
      'Cross the Roosevelt Bridge over the St. Lucie River into Stuart. From the city center that’s about 11 miles.',
      'From Tradition, follow Tradition Parkway into Gatlin Boulevard and take it east to Port St. Lucie Boulevard, then use the same route. It’s about 16 miles, so allow 30 to 40 minutes.',
    ],
  },
  mapAlt:
    'Map of the drive from Port St. Lucie south to Stuart, about 10.8 miles, with the longer route from Tradition shown as a dotted line.',
  localNote: {
    heading: 'Give yourself a soft landing',
    body: 'Sessions go deep, and many clients prefer to keep the rest of the day open. From Port St. Lucie you can be home and resting soon after we finish.',
  },
  faq: [
    {
      question: 'Do you hold sessions in Port St. Lucie?',
      answer:
        'Sessions take place in person at my private studio in Stuart, in neighboring Martin County. You’ll receive the exact address with your booking confirmation.',
    },
    {
      question: 'I live in Tradition. How far is the studio?',
      answer:
        'About 16 miles. The quickest way is usually Gatlin Boulevard to Port St. Lucie Boulevard, then US 1 south into Stuart. Give yourself 30 to 40 minutes.',
    },
    {
      question: 'Can I bring a list of questions?',
      answer:
        'Please do. It helps to jot them down in the days before your session, and some clients add to the list right up until they leave the house. We’ll go through it together in our pre-session conversation, and the free prep guide can help you shape it.',
    },
    {
      question: 'Can I ask a question before I book?',
      answer:
        'Of course. Call me at 772-247-5534 or reach out through the contact page, and I’ll answer what I can before you decide.',
    },
  ],
  nearby: ['jensen-beach', 'palm-city'],
};

export default area;
