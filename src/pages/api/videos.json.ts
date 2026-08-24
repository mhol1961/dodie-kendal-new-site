// GET /api/videos.json — latest uploads from Dodie's YouTube channel.
//
// Source of truth is the public channel RSS feed (no API key, no quota, free).
// The feed MUST be fetched here rather than in the browser: YouTube sends no
// CORS headers, so a client-side fetch of videos.xml is blocked.
//
// Freshness: Cloudflare caches the outbound feed fetch for an hour
// (`cf.cacheTtl`), and the JSON response carries `s-maxage=3600` so the edge
// serves it from cache too. New uploads therefore appear within ~1 hour.
import type { APIRoute } from 'astro';

export const prerender = false;

const CHANNEL_ID = 'UCFZFf1GKH-rnbCreit4YLOg';
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const CACHE_SECONDS = 3600;

export interface Video {
  id: string;
  title: string;
  published: string;
}

const decode = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();

/** Minimal Atom parse — the feed shape is fixed, so regex beats an XML parser here. */
export function parseFeed(xml: string): Video[] {
  const videos: Video[] = [];
  for (const [entry] of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const id = entry.match(/<yt:videoId>([\w-]{5,})<\/yt:videoId>/)?.[1];
    const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1];
    const published = entry.match(/<published>([\s\S]*?)<\/published>/)?.[1];
    if (id && title && published) {
      videos.push({ id, title: decode(title), published: published.trim() });
    }
  }
  return videos;
}

export const GET: APIRoute = async () => {
  let videos: Video[] = [];
  try {
    const res = await fetch(FEED_URL, {
      cf: { cacheTtl: CACHE_SECONDS, cacheEverything: true },
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
