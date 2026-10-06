// Build-time share image for each Insights post that doesn't set its own
// frontmatter ogImage. Prerendered, so it costs nothing at runtime.
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { renderShareImage } from '@lib/og-image';

export const prerender = true;

export const getStaticPaths = (async () => {
  const posts = await getCollection('insights', ({ data }) => !data.draft && !data.ogImage);
  return posts.map((post) => ({ params: { slug: post.id }, props: { title: post.data.title } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) =>
  new Response(new Uint8Array(await renderShareImage(props.title as string)), { headers: { 'Content-Type': 'image/png' } });
