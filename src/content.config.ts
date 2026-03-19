import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const tracks = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/tracks' }),
  schema: z.object({
    title: z.string(),
    titleZh: z.string().optional(),
    artist: z.string().optional(),
    duration: z.number(),
    coverColor: z.string(),
    audioFile: z.string(),
    releaseDate: z.string(),
    featured: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    order: z.number().optional(),
  }),
});

const timeline = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/timeline' }),
  schema: z.object({
    date: z.string(),
    title: z.string(),
    titleZh: z.string().optional(),
    description: z.string().optional(),
    linkedTrack: z.string().optional(),
    icon: z.string().default('star'),
  }),
});

const stories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/stories' }),
  schema: z.object({
    title: z.string(),
    titleZh: z.string().optional(),
    date: z.string(),
    description: z.string().optional(),
  }),
});

export const collections = { tracks, timeline, stories };
