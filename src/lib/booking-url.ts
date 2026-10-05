// GHL booking widget URL with the visit's ad details (utm_*, fbclid) appended, so a
// booking carries the same attribution into GHL as the site forms do.
// Ships to the browser (BookingEmbed.astro), so no value imports from attribution.ts
// (that pulls in zod). Tested in test/booking-url.test.ts.
import type { Attribution } from './attribution';

const KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'] as const;

export function bookingUrl(base: string, attr: Attribution | undefined): string {
  const url = new URL(base);
  for (const k of KEYS) {
    const v = attr?.[k];
    if (typeof v === 'string' && v) url.searchParams.set(k, v);
  }
  return url.toString();
}
