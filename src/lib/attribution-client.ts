// Browser half of ad attribution (see attribution.ts). No imports: this ships to
// every page that has a form.
import type { Attribution } from './attribution';

/** What AttributionCapture.astro stored for this visit (or undefined). */
export function readAttribution(): Attribution | undefined {
  try {
    const raw = sessionStorage.getItem('dk_attr');
    return raw ? (JSON.parse(raw) as Attribution) : undefined;
  } catch {
    return undefined;
  }
}

/** Report a successful form submission to Meta. A no-op until the pixel is switched
 *  on (MetaPixel.astro defines fbq only when PUBLIC_FB_PIXEL_ID is set). */
export function trackLead(): void {
  const fbq = (window as { fbq?: (...args: unknown[]) => void }).fbq;
  if (typeof fbq === 'function') fbq('track', 'Lead');
}
