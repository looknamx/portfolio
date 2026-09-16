import type { Repository } from '../types/github';
export interface Filters {
  query: string;
  language: string;
  category: 'all' | 'featured' | 'demo';
  sort: 'updated' | 'stars' | 'name';
}
export const defaultFilters: Filters = {
  query: '',
  language: 'all',
  category: 'all',
  sort: 'updated',
};
export function safeUrl(value: string | null | undefined): string | undefined {
  if (!value) return;
  try {
    const url = new URL(value);
    if (['https:', 'http:'].includes(url.protocol)) return url.href;
  } catch {
    /* Invalid links are not rendered. */
  }
}
export function selectProjects(
  repos: Repository[],
  filters: Filters,
  settings: {
    pinnedRepos: string[];
    hiddenRepos: string[];
    showForks: boolean;
    showArchived: boolean;
  },
) {
  const pinned = (r: Repository) => settings.pinnedRepos.includes(r.name);
  return repos
    .filter(
      (r) =>
        !settings.hiddenRepos.includes(r.name) &&
        (settings.showForks || !r.fork) &&
        (settings.showArchived || !r.archived),
    )
    .filter((r) =>
      `${r.name} ${r.description ?? ''} ${(r.topics ?? []).join(' ')}`
        .toLowerCase()
        .includes(filters.query.trim().toLowerCase()),
    )
    .filter(
      (r) => filters.language === 'all' || r.language === filters.language,
    )
    .filter(
      (r) =>
        filters.category === 'all' ||
        (filters.category === 'featured' ? pinned(r) : !!safeUrl(r.homepage)),
    )
    .sort(
      (a, b) =>
        Number(pinned(b)) - Number(pinned(a)) ||
        (filters.sort === 'stars'
          ? b.stargazers_count - a.stargazers_count
          : filters.sort === 'name'
            ? a.name.localeCompare(b.name)
            : Date.parse(b.updated_at) - Date.parse(a.updated_at)) ||
        a.name.localeCompare(b.name),
    );
}
export function languageColor(language: string) {
  let hash = 0;
  for (const char of language) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return `hsl(${Math.abs(hash) % 360} 48% 46%)`;
}
