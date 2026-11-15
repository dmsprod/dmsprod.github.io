import { getCollection, type CollectionEntry } from 'astro:content';

export type NewsEntry = CollectionEntry<'news'>;

/** Les articles publiés (les brouillons ne sont visibles qu'en local), du plus récent au plus ancien. */
export async function getPublishedNews(): Promise<NewsEntry[]> {
  const entries = await getCollection('news', ({ data }) => import.meta.env.DEV || !data.draft);
  return entries.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** "2026-10-03-sed-posuere" => "sed-posuere" : la date du nom de fichier ne sert qu'au tri dans le dossier. */
export function newsSlug(entry: NewsEntry): string {
  return entry.id.replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

export function newsUrl(entry: NewsEntry): string {
  return `/actualites/${newsSlug(entry)}/`;
}

/** "vie-associative" => "vie-associative", "adhésion" => "adhesion" (URL sans accent). */
export function tagSlug(tag: string): string {
  return tag.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

/** "vie-associative" => "Vie associative". */
export function tagLabel(tag: string): string {
  const text = tag.replace(/-/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function tagUrl(tag: string): string {
  return `/actualites/tag/${tagSlug(tag)}/`;
}

/** Tous les tags, avec leur nombre d'articles, les plus utilisés d'abord. */
export function countTags(entries: NewsEntry[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const entry of entries) for (const tag of entry.data.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'fr'));
}

const dateFormat = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export function formatDate(date: Date): string {
  return dateFormat.format(date);
}
