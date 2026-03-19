import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const stories = await getCollection('stories');
  const tracks = await getCollection('tracks');

  return rss({
    title: 'titi.work',
    description: 'Music, stories, and the adventures of two cats navigating love and code.',
    site: context.site!.toString(),
    items: [
      ...stories.map(s => ({
        title: s.data.title,
        pubDate: new Date(s.data.date),
        description: s.data.description || '',
        link: `/stories/${s.id}`,
      })),
      ...tracks.map(t => ({
        title: `[Track] ${t.data.title}`,
        pubDate: new Date(t.data.releaseDate),
        description: `New track: ${t.data.title}`,
        link: `/#${t.id}`,
      })),
    ],
    customData: '<language>en-us</language>',
  });
}
