// Build-time default share image (see DEFAULT_OG_IMAGE in src/lib/seo.ts).
import type { APIRoute } from 'astro';
import { renderDefaultShareImage } from '@lib/og-image';

export const prerender = true;

export const GET: APIRoute = async () =>
  new Response(new Uint8Array(await renderDefaultShareImage()), { headers: { 'Content-Type': 'image/jpeg' } });
