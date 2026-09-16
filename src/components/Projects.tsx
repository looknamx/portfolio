import { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  RotateCcw,
  FolderOpen,
  AlertCircle,
} from 'lucide-react';
import { config, isConfigured, githubUrl } from '../config/portfolio';
import type { Repository } from '../types/github';
import {
  defaultFilters,
  selectProjects,
  type Filters,
} from '../utilities/projects';
import { ProjectCard } from './ProjectCard';
export function Projects({
  repos,
  loading,
  error,
  retry,
}: {
  repos: Repository[];
  loading: boolean;
  error: string;
  retry: () => void;
}) {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [page, setPage] = useState(1);
  function updateFilters(next: Filters) {
    setFilters(next);
    setPage(1);
  }
  const visible = selectProjects(repos, filters, config);
  const pageCount = Math.max(1, Math.ceil(visible.length / 6));
  const currentPage = Math.min(page, pageCount);
  const pageProjects = visible.slice((currentPage - 1) * 6, currentPage * 6);
  const languages = [
    ...new Set(
      selectProjects(repos, defaultFilters, config)
        .map((r) => r.language)
        .filter((s): s is string => !!s),
    ),
  ].sort();
  const changed = JSON.stringify(filters) !== JSON.stringify(defaultFilters);
  return (
    <section id="projects" className="section container">
      <div className="section-heading">
        <div>
          <p className="eyebrow">THE WORK</p>
          <h2>
            Ideas, turned into code<span>.</span>
          </h2>
          <p>
            A collection of projects, experiments, and open-source
            contributions.
          </p>
        </div>
        {githubUrl && (
          <a
            className="text-link"
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
          >
            All on GitHub <ArrowUpRight size={17} />
          </a>
        )}
      </div>
      <div className="filter-panel">
        <div className="search-row">
          <label className="search-field">
            <Search size={18} />
            <input
              aria-label="Search projects"
              placeholder="Search projects, technologies, or ideas…"
              value={filters.query}
              onChange={(e) =>
                updateFilters({ ...filters, query: e.target.value })
              }
            />
          </label>
          <label className="select-label">
            <SlidersHorizontal size={16} />
            <select
              aria-label="Filter by language"
              value={filters.language}
              onChange={(e) =>
                updateFilters({ ...filters, language: e.target.value })
              }
            >
              <option value="all">All languages</option>
              {languages.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="filter-row">
          <div className="filter-tabs">
            {(['all', 'featured', 'demo'] as const).map((category) => (
              <button
                key={category}
                aria-pressed={filters.category === category}
                className={filters.category === category ? 'selected' : ''}
                onClick={() => updateFilters({ ...filters, category })}
              >
                {category === 'all'
                  ? 'All projects'
                  : category === 'featured'
                    ? 'Featured'
                    : 'Has demo'}
              </button>
            ))}
          </div>
          <select
            aria-label="Sort projects"
            value={filters.sort}
            onChange={(e) =>
              updateFilters({
                ...filters,
                sort: e.target.value as Filters['sort'],
              })
            }
          >
            <option value="updated">Last updated</option>
            <option value="stars">Most stars</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>
      </div>
      <div className="results">
        <span aria-live="polite">
          {loading && !repos.length
            ? 'Loading projects…'
            : visible.length
              ? `${(currentPage - 1) * 6 + 1}–${Math.min(currentPage * 6, visible.length)} of ${visible.length} projects`
              : '0 projects'}
        </span>
        {changed && (
          <button onClick={() => updateFilters(defaultFilters)}>
            <RotateCcw size={13} /> Clear filters
          </button>
        )}
        <span className="source">
          <span className="status-dot" /> Powered by GitHub
        </span>
      </div>
      {error && (
        <div className="notice error" role="alert">
          <AlertCircle size={20} />
          <p>{error}</p>
          <button onClick={retry} disabled={loading}>
            Retry
          </button>
        </div>
      )}
      {loading && !repos.length ? (
        <div
          className="project-grid"
          aria-label="Loading repositories"
          aria-busy="true"
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="project-card skeleton">
              <div />
              <div />
              <div />
              <div />
            </div>
          ))}
        </div>
      ) : visible.length ? (
        <div className="project-grid">
          {pageProjects.map((repo) => (
            <ProjectCard
              key={repo.id}
              repo={repo}
              featured={config.pinnedRepos.includes(repo.name)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon">
            <FolderOpen size={28} />
          </span>
          <h3>
            {!isConfigured
              ? 'Your next chapter starts here.'
              : error
                ? 'Projects are temporarily unavailable.'
                : 'No projects found.'}
          </h3>
          <p>
            {!isConfigured
              ? 'Connect your GitHub username in the portfolio config to bring your work into view.'
              : error
                ? 'You can try loading your projects again using Retry above.'
                : changed
                  ? 'Try a different search or clear your filters.'
                  : 'Public projects will appear here when they are available.'}
          </p>
          {changed && (
            <button
              className="button"
              onClick={() => updateFilters(defaultFilters)}
            >
              Clear filters
            </button>
          )}
          {!isConfigured && <code>src/config/portfolio.ts</code>}
        </div>
      )}
      {pageCount > 1 && (
        <nav className="project-pagination" aria-label="Project pages">
          <button
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          >
            ← Previous
          </button>
          <div className="page-numbers">
            {Array.from({ length: pageCount }, (_, index) => index + 1).map(
              (number) => (
                <button
                  key={number}
                  aria-label={`Page ${number}`}
                  aria-current={number === currentPage ? 'page' : undefined}
                  onClick={() => setPage(number)}
                >
                  {number}
                </button>
              ),
            )}
          </div>
          <button
            disabled={currentPage === pageCount}
            onClick={() => setPage(currentPage + 1)}
          >
            Next →
          </button>
        </nav>
      )}
    </section>
  );
}
