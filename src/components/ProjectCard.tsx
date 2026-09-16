import { ArrowUpRight, BookOpen, GitFork, Star, Pin } from 'lucide-react';
import type { Repository } from '../types/github';
import { languageColor, safeUrl } from '../utilities/projects';
export function ProjectCard({
  repo,
  featured,
}: {
  repo: Repository;
  featured: boolean;
}) {
  const demo = safeUrl(repo.homepage);
  const date = new Date(repo.updated_at);
  return (
    <article className={`project-card ${featured ? 'featured' : ''}`}>
      <div className="card-top">
        <span className="repo-icon">
          <BookOpen size={21} />
        </span>
        {featured && (
          <span className="featured-label">
            <Pin size={12} /> Featured
          </span>
        )}
        <a
          href={safeUrl(repo.html_url)}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${repo.name} on GitHub`}
          className="card-arrow"
        >
          <ArrowUpRight size={22} />
        </a>
      </div>
      <h3>
        <a href={safeUrl(repo.html_url)} target="_blank" rel="noreferrer">
          {repo.name}
        </a>
      </h3>
      <p className="description">
        {repo.description ||
          'An open-source project. Explore the repository for code and documentation.'}
      </p>
      <div className="topics">
        {(repo.topics ?? []).slice(0, 4).map((topic) => (
          <span key={topic}>{topic}</span>
        ))}
      </div>
      <div className="repo-stats">
        <span>
          <i style={{ background: languageColor(repo.language || 'Other') }} />
          {repo.language || 'Other'}
        </span>
        <span>
          <Star size={14} />
          {repo.stargazers_count ?? 0}
        </span>
        <span>
          <GitFork size={14} />
          {repo.forks_count ?? 0}
        </span>
      </div>
      <div className="card-bottom">
        <span>
          {!isNaN(date.getTime())
            ? `Updated ${date.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}`
            : 'Update date unavailable'}
        </span>
        {demo ? (
          <a href={demo} target="_blank" rel="noreferrer">
            Live demo <ArrowUpRight size={13} />
          </a>
        ) : (
          <span>No live demo</span>
        )}
      </div>
      {repo.license && (
        <small className="license">
          {repo.license.spdx_id && repo.license.spdx_id !== 'NOASSERTION'
            ? repo.license.spdx_id
            : repo.license.name}{' '}
          license
        </small>
      )}
    </article>
  );
}
