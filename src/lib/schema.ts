// JSON-LD helpers. See SCHEMA.md for the authoritative shapes.

const SITE_URL = import.meta.env.SITE_URL || 'https://dodiekendall.com';

export function localBusiness() {
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'HealthAndBeautyBusiness'],
    '@id': `${SITE_URL}/#business`,
    name: 'Dodie Kendall QHHT',
    alternateName: 'Dodie Kendall Quantum Healing Hypnosis',
    url: SITE_URL,
    telephone: '+1-561-201-6918',
    email: 'dodiekendall@gmail.com',
    image: `${SITE_URL}/og-image.jpg`,
    logo: `${SITE_URL}/dodie-kendall-five-clear-stars-transparent.png`,
    priceRange: '$$',
    founder: { '@id': `${SITE_URL}/#person` },
    areaServed: [
      { '@type': 'City', name: 'Stuart, Florida' },
      { '@type': 'AdministrativeArea', name: 'Martin County, Florida' },
      { '@type': 'AdministrativeArea', name: 'Treasure Coast, Florida' },
      { '@type': 'State', name: 'Florida' },
      { '@type': 'Country', name: 'United States' },
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Stuart',
      addressRegion: 'FL',
      addressCountry: 'US',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
  };
}

export function person() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: 'Dodie Kendall',
    givenName: 'Dodie',
    familyName: 'Kendall',
    jobTitle: 'QHHT Practitioner',
    description:
      'Dodie Kendall is a Quantum Healing Hypnosis Technique (QHHT) practitioner based in Stuart, Florida, trained in the Dolores Cannon lineage. She offers 5-hour in-person and remote QHHT sessions.',
    url: `${SITE_URL}/about`,
    image: `${SITE_URL}/dodie-portrait.jpg`,
    telephone: '+1-561-201-6918',
    email: 'dodiekendall@gmail.com',
    knowsAbout: [
      'Quantum Healing Hypnosis Technique',
      'Hypnosis',
      'Past-Life Regression',
      'Higher Self Connection',
    ],
    worksFor: { '@id': `${SITE_URL}/#business` },
  };
}

export function qhhtService() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${SITE_URL}/#service-qhht`,
    name: 'Quantum Healing Hypnosis Technique (QHHT) Session',
    description:
      'A 5-hour Quantum Healing Hypnosis Technique session with Dodie Kendall, conducted in person in Stuart, Florida, or remotely via Zoom.',
    provider: { '@id': `${SITE_URL}/#person` },
    serviceType: 'Quantum Healing Hypnosis',
    areaServed: [
      { '@type': 'City', name: 'Stuart, Florida' },
      { '@type': 'AdministrativeArea', name: 'Martin County, Florida' },
      { '@type': 'AdministrativeArea', name: 'Treasure Coast, Florida' },
      { '@type': 'State', name: 'Florida' },
      { '@type': 'Country', name: 'United States' },
    ],
    offers: {
      '@type': 'Offer',
      price: '300.00',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/book`,
    },
  };
}

export function breadcrumb(items: Array<{ name: string; href?: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
    })),
  };
}

export function faqPage(items: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function blogPosting(opts: {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified: string;
  canonical: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: opts.title,
    description: opts.description,
    image: opts.image,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
    author: { '@id': `${SITE_URL}/#person` },
    publisher: { '@id': `${SITE_URL}/#business` },
    mainEntityOfPage: opts.canonical,
    url: opts.canonical,
  };
}
