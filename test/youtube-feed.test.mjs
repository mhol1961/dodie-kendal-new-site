// Parser check for the YouTube channel feed.
//   npm run test:feed
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFeed } from '../src/lib/youtube.ts';

const entry = (inner) => `<feed><entry>${inner}</entry></feed>`;
const full = entry(
  `<yt:videoId>fiDchBNQ9Ig</yt:videoId><title>Critical Thinking</title><published>2026-08-07T18:07:39+00:00</published>`
);

test('parses a well-formed entry', () => {
  assert.deepEqual(parseFeed(full), [
    { id: 'fiDchBNQ9Ig', title: 'Critical Thinking', published: '2026-08-07T18:07:39+00:00' },
  ]);
});

test('decodes entities once, not twice', () => {
  const xml = entry(
    `<yt:videoId>abcdefghijk</yt:videoId><title>Trauma &amp;amp; Healing &#39;26 &lt;b&gt;</title><published>2026-01-01T00:00:00+00:00</published>`
  );
  assert.equal(parseFeed(xml)[0].title, "Trauma &amp; Healing '26 <b>");
});

test('unwraps CDATA', () => {
  const xml = entry(
    `<yt:videoId>abcdefghijk</yt:videoId><title><![CDATA[Raw & Unfiltered]]></title><published>2026-01-01T00:00:00+00:00</published>`
  );
  assert.equal(parseFeed(xml)[0].title, 'Raw & Unfiltered');
});

test('skips entries missing a field or carrying an unusable id', () => {
  for (const inner of [
    `<title>No id</title><published>2026-01-01T00:00:00+00:00</published>`,
    `<yt:videoId>abcdefghijk</yt:videoId><published>2026-01-01T00:00:00+00:00</published>`,
    `<yt:videoId>abcdefghijk</yt:videoId><title>No date</title>`,
    `<yt:videoId>../../evil?x=1</yt:videoId><title>Injected</title><published>2026-01-01T00:00:00+00:00</published>`,
    `<yt:videoId>abc</yt:videoId><title>Too short</title><published>2026-01-01T00:00:00+00:00</published>`,
  ]) {
    assert.deepEqual(parseFeed(entry(inner)), [], inner);
  }
});

test('returns an empty list for junk, not a throw', () => {
  for (const junk of ['', '<feed></feed>', '<html><body>429 Too Many Requests</body></html>', full.slice(0, 40)]) {
    assert.deepEqual(parseFeed(junk), []);
  }
});

test('keeps feed order across many entries', () => {
  const xml = `<feed>${['aaaaaaaaaaa', 'bbbbbbbbbbb', 'ccccccccccc']
    .map((id, i) => `<entry><yt:videoId>${id}</yt:videoId><title>T${i}</title><published>2026-0${i + 1}-01T00:00:00+00:00</published></entry>`)
    .join('')}</feed>`;
  assert.deepEqual(parseFeed(xml).map((v) => v.id), ['aaaaaaaaaaa', 'bbbbbbbbbbb', 'ccccccccccc']);
});
