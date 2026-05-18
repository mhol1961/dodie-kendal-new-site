// Astro content collections. See TECH-SPEC.md §4.
import { defineCollection, z } from 'astro:content';

const insights = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().max(160),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
      heroAlt: z.string().optional(),
      tags: z.array(z.string()).default([]),
      canonical: z.string().url().optional(),
      draft: z.boolean().default(false),
      answerCapsule: z.string().max(500).optional(),
    }),
});

const testimonials = defineCollection({
  type: 'data',
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
  type: 'data',
  schema: z.object({
    category: z.enum(['sessions', 'logistics', 'practice', 'aftercare']),
    question: z.string(),
    answer: z.string(),
    order: z.number().default(0),
  }),
});

export const collections = { insights, testimonials, faq };
