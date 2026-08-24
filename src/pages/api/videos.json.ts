// GET /api/videos.json — latest uploads from Dodie's YouTube channel.
//
// The feed MUST be read here rather than in the browser: YouTube sends no CORS
// headers, so a client-side fetch of videos.xml is blocked.
//
// Freshness: Cloudflare caches a *successful* feed fetch for an hour
// (`cf.cacheTtlByStatus` — a plain `cacheTtl` would happily cache a 403 or an
// error page for the same hour and silently blank the section), and the JSON
// response carries `s-maxage=3600` so the edge serves it from cache too. New
// uploads therefore appear within ~1 hour.
import type { APIRoute } from 'astro';
import { FEED_URL, parseFeed, type Video } from '@lib/youtube';

export const prerender = false;

const CACHE_SECONDS = 3600;

export const GET: APIRoute = async () => {
  let videos: Video[] = [];
  try {
    const res = await fetch(FEED_URL, {
      cf: {
        cacheEverything: true,
        // Only a good feed is worth keeping; failures must be retried promptly.
        cacheTtlByStatus: { '200-299': CACHE_SECONDS, '300-399': 0, '400-599': 0 },
      },
      headers: { 'User-Agent': 'dodiekendall.com feed reader' },
    } as RequestInit);
    if (res.ok) videos = parseFeed(await res.text());
  } catch {
    // Swallow — an empty list makes the section hide itself on the page.
  }

  return new Response(JSON.stringify({ videos }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      // Don't let a failed fetch stick around at the edge for an hour.
      'Cache-Control': videos.length
        ? `public, max-age=600, s-maxage=${CACHE_SECONDS}`
        : 'public, max-age=0, s-maxage=60',
    },
  });
};
