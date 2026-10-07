// Every local-area page, and which ones are live.
//
// RELEASE PLAN (rankings protection): towns go live one at a time, about one a week,
// in this order: port-st-lucie, jupiter, palm-city, jensen-beach, hobe-sound.
// To release a town, add its slug to RELEASED and deploy. Unreleased towns are not
// built, so they are absent from the site, sitemap, links and "Areas I serve" lists.
// A build with PUBLIC_SITE_PREVIEW=1 builds all five (noindexed) for Dodie's preview.
import type { LocalArea } from './types';
import portStLucie from './port-st-lucie.ts';
import jupiter from './jupiter.ts';
import palmCity from './palm-city.ts';
import jensenBeach from './jensen-beach.ts';
import hobeSound from './hobe-sound.ts';

export const RELEASED: string[] = [];

export const AREAS: LocalArea[] = [portStLucie, jupiter, palmCity, jensenBeach, hobeSound];

// `?.` so the unit tests can import this under plain Node (no import.meta.env there).
export const PREVIEW = import.meta.env?.PUBLIC_SITE_PREVIEW === '1';

/** Towns built in this build: released ones, or all of them in preview. */
export function builtAreas(preview = PREVIEW, released = RELEASED): LocalArea[] {
  return preview ? AREAS : AREAS.filter((a) => released.includes(a.slug));
}

/** The area's neighbors that are built in this build, in the order listed. */
export function nearbyAreas(area: LocalArea, built = builtAreas()): LocalArea[] {
  return area.nearby.flatMap((slug) => built.filter((a) => a.slug === slug));
}
