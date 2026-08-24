// YouTube channel feed — parsing helpers for /api/videos.json.
//
// The channel's public Atom feed is the only data source: no API key, no
// quota, no cost. Its shape is fixed and small, so regex extraction beats
// pulling an XML parser into the Worker bundle.

export const CHANNEL_ID = 'UCFZFf1GKH-rnbCreit4YLOg';
export const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
export const CHANNEL_URL = 'https://www.youtube.com/@dodiekendallQHHT';

export interface Video {
  id: string;
  title: string;
  published: string;
}

/**
 * Decode XML text content. CDATA is unwrapped first, then entities are decoded
 * in a single pass so an escaped entity (`&amp;amp;`) resolves to `&amp;` and
 * not to `&` — a second pass would double-decode it.
 */
function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&(#\d+|#x[0-9a-f]+|quot|apos|lt|gt|amp);/gi, (match, ref: string) => {
      const r = ref.toLowerCase();
      if (r.startsWith('#x')) return String.fromCodePoint(parseInt(r.slice(2), 16));
      if (r.startsWith('#')) return String.fromCodePoint(Number(r.slice(1)));
      return { quot: '"', apos: "'", lt: '<', gt: '>', amp: '&' }[r] ?? match;
    })
    .trim();
}

/** Extract videos from the channel Atom feed, newest first. Junk in → empty array out. */
export function parseFeed(xml: string): Video[] {
  const videos: Video[] = [];
  for (const match of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const entry = match[1];
    if (!entry) continue;
    // Video ids are YouTube's 11-char base64url slugs; the bound keeps a
    // malformed feed from ever putting arbitrary text into a URL.
    const id = entry.match(/<yt:videoId>([\w-]{6,20})<\/yt:videoId>/)?.[1];
    const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1];
    const published = entry.match(/<published>([\s\S]*?)<\/published>/)?.[1];
    if (!id || !title || !published) continue;
    const decoded = decode(title);
    if (decoded) videos.push({ id, title: decoded, published: published.trim() });
  }
  return videos;
}
