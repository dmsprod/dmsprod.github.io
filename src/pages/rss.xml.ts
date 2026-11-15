import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import site from '../data/site.json';
import { getPublishedNews, newsUrl } from '../lib/news';

export async function GET(context: APIContext) {
  const entries = await getPublishedNews();
  return rss({
    title: `Actualités ${site.name}`,
    description: site.description,
    site: context.site!,
    items: entries.map((entry) => ({
      title: entry.data.title,
      pubDate: entry.data.date,
      description: entry.data.summary,
      link: newsUrl(entry),
      categories: entry.data.tags,
    })),
    customData: '<language>fr-fr</language>',
  });
}
