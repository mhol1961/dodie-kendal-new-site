// Ad attribution: utm_* + fbclid captured from the landing URL (AttributionCapture.astro
// stores them in sessionStorage for the visit), sent with every form, and written to
// GHL. Server-side helpers; the browser half is attribution-client.ts (kept
// separate so zod never ships to the browser).
// Tested in test/attribution.test.ts.

import { z } from 'zod';

export const ATTRIBUTION_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'] as const;
export type AttributionKey = (typeof ATTRIBUTION_KEYS)[number];
export type Attribution = Partial<Record<AttributionKey | 'landing_page', string>>;

/** GHL tag for contacts who arrived from Facebook or Instagram. */
export const FB_IG_TAG = 'source_facebook_instagram';

const value = z.string().trim().max(300).optional();
export const attributionSchema = z
  .object(Object.fromEntries([...ATTRIBUTION_KEYS, 'landing_page'].map((k) => [k, value])))
  .partial()
  .optional()
  .catch(undefined); // malformed attribution never blocks a sign-up

/** Facebook/Instagram traffic: an fbclid, or a utm_source naming either platform. */
export function isFacebookOrInstagram(a: Attribution | undefined): boolean {
  if (!a) return false;
  if (a.fbclid) return true;
  return /facebook|instagram|^fb$|^ig$|^meta$/i.test(a.utm_source ?? '');
}

/** One line for the contact's append-only note ('' when there is nothing). */
export function attributionLine(a: Attribution | undefined): string {
  if (!a) return '';
  const parts = [...ATTRIBUTION_KEYS, 'landing_page' as const].filter((k) => a[k]).map((k) => `${k}=${a[k]}`);
  return parts.length ? `Ad source: ${parts.join(', ')}` : '';
}

/** Only the GHL custom-field values (no landing_page), empty ones dropped. */
export function attributionFields(a: Attribution | undefined): Partial<Record<AttributionKey, string>> {
  const out: Partial<Record<AttributionKey, string>> = {};
  for (const k of ATTRIBUTION_KEYS) if (a?.[k]) out[k] = a[k];
  return out;
}

