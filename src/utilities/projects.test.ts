import { describe, it, expect } from 'vitest';
import {
  selectProjects,
  defaultFilters,
  safeUrl,
  languageColor,
} from './projects';
import type { Repository } from '../types/github';
const make = (name: string, changes: Partial<Repository> = {}): Repository => ({
  id: name.length,
  name,
  description: null,
  html_url: 'https://github.com/test/' + name,
  homepage: null,
  language: null,
  topics: null,
  stargazers_count: 0,
  forks_count: 0,
  updated_at: '2025-01-01',
  fork: false,
  archived: false,
  license: null,
  ...changes,
});
const settings = {
  pinnedRepos: ['alpha'],
  hiddenRepos: ['hidden'],
  showForks: false,
  showArchived: false,
};
const repos = [
  make('zeta', {
    description: 'Useful tools',
    language: 'Rust',
    stargazers_count: 20,
    updated_at: '2026-02-01',
  }),
  make('alpha', { topics: ['design'], homepage: 'https://example.com' }),
  make('beta', { language: 'Rust', updated_at: '2026-03-01' }),
  make('fork', { fork: true }),
  make('archive', { archived: true }),
  make('hidden'),
];
describe('project selection', () => {
  it('searches names, descriptions and topics case-insensitively', () => {
    for (const [query, name] of [
      ['ZETA', 'zeta'],
      [' useful ', 'zeta'],
      ['design', 'alpha'],
    ])
      expect(
        selectProjects(repos, { ...defaultFilters, query }, settings).map(
          (r) => r.name,
        ),
      ).toEqual([name]);
  });
  it('keeps pinned first, then sorts by update date', () =>
    expect(
      selectProjects(repos, defaultFilters, settings).map((r) => r.name),
    ).toEqual(['alpha', 'beta', 'zeta']));
  it('sorts stars and name without mutating the source', () => {
    expect(
      selectProjects(repos, { ...defaultFilters, sort: 'stars' }, settings).map(
        (r) => r.name,
      ),
    ).toEqual(['alpha', 'zeta', 'beta']);
    expect(
      selectProjects(repos, { ...defaultFilters, sort: 'name' }, settings).map(
        (r) => r.name,
      ),
    ).toEqual(['alpha', 'beta', 'zeta']);
    expect(repos[0].name).toBe('zeta');
  });
  it('filters by language, featured and valid demo', () => {
    expect(
      selectProjects(repos, { ...defaultFilters, language: 'Rust' }, settings),
    ).toHaveLength(2);
    for (const category of ['featured', 'demo'] as const)
      expect(
        selectProjects(repos, { ...defaultFilters, category }, settings).map(
          (r) => r.name,
        ),
      ).toEqual(['alpha']);
  });
  it('supports empty results and null fields', () =>
    expect(
      selectProjects(repos, { ...defaultFilters, query: 'missing' }, settings),
    ).toEqual([]));
  it('respects fork, archive and hidden settings', () =>
    expect(
      selectProjects(repos, defaultFilters, {
        ...settings,
        showForks: true,
        showArchived: true,
      }),
    ).toHaveLength(5));
  it('rejects unsafe links and colors every language', () => {
    expect(safeUrl('javascript:alert(1)')).toBeUndefined();
    expect(safeUrl('not a URL')).toBeUndefined();
    expect(languageColor('UnusualLanguage')).toMatch(/^hsl/);
  });
});
