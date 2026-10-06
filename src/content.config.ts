// Astro content collections. See TECH-SPEC.md §4.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const insights = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/insights' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().max(160),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
      heroAlt: z.string().optional(),
      // Share image (og:image / twitter:image / BlogPosting.image): a path under
      // public/ ("/photos/x.jpg") or an absolute https URL. 1200x630 JPG/PNG.
      // Omit it and /og/<slug>.png is generated at build time.
      ogImage: z.string().regex(/^(\/[^/]|https:\/\/)/, 'use /path-under-public or https://').optional(),
      tags: z.array(z.string()).default([]),
      canonical: z.url().optional(),
      draft: z.boolean().default(false),
      answerCapsule: z.string().max(500).optional(),
    }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/testimonials' }),
  schema: ({ image }) =>
    z.object({
      quote: z.string(),
      author: z.string(),
      location: z.string().optional(),
      role: z.string().optional(),
      avatar: image().optional(),
      order: z.number().default(0),
      featured: z.boolean().default(false),
    }),
});

const faq = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/faq' }),
  schema: z.object({
    category: z.enum(['sessions', 'logistics', 'practice', 'aftercare']),
    question: z.string(),
    answer: z.string(),
    order: z.number().default(0),
  }),
});

export const collections = { insights, testimonials, faq };
