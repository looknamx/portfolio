import type { PortfolioData, GitHubProfile, Repository } from '../types/github';
export class GitHubError extends Error {}
export async function request<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    signal: signal
      ? AbortSignal.any([signal, AbortSignal.timeout(12000)])
      : AbortSignal.timeout(12000),
    headers: { Accept: 'application/vnd.github+json' },
  });
  if (!response.ok) {
    const reset = Number(response.headers.get('x-ratelimit-reset'));
    const retry = response.headers.get('retry-after');
    if (
      response.status === 429 ||
      (response.status === 403 &&
        (response.headers.get('x-ratelimit-remaining') === '0' || retry))
    ) {
      const time = retry
        ? new Date(Date.now() + Number(retry) * 1000)
        : reset
          ? new Date(reset * 1000)
          : null;
      throw new GitHubError(
        `GitHub's request limit has been reached. ${time && !isNaN(time.getTime()) ? `Try again after ${time.toLocaleString()}.` : 'Please wait a few minutes before trying again.'}`,
      );
    }
    throw new GitHubError(
      response.status === 404
        ? 'This GitHub account could not be found. Check the username in your portfolio configuration.'
        : `GitHub is unavailable right now (HTTP ${response.status}). Please try again shortly.`,
    );
  }
  return response.json() as Promise<T>;
}
export async function fetchPortfolio(
  username: string,
  signal?: AbortSignal,
): Promise<PortfolioData> {
  const user = encodeURIComponent(username);
  const profile = await request<GitHubProfile>(`/users/${user}`, signal);
  const repos: Repository[] = [];
  for (let page = 1; ; page++) {
    const batch = await request<Repository[]>(
      `/users/${user}/repos?per_page=100&sort=updated&direction=desc&page=${page}`,
      signal,
    );
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  return { profile, repos };
}
export function readCache(
  username: string,
): { data: PortfolioData; expires: number } | null {
  try {
    const value = JSON.parse(
      localStorage.getItem(`portfolio:v1:${username}`) ?? 'null',
    );
    return value &&
      Number.isFinite(value.expires) &&
      typeof value.data?.profile?.login === 'string' &&
      Array.isArray(value.data?.repos) &&
      value.data.repos.every(
        (r: Repository) =>
          r && typeof r.name === 'string' && typeof r.id === 'number',
      )
      ? value
      : null;
  } catch {
    return null;
  }
}
export function writeCache(
  username: string,
  data: PortfolioData,
  minutes: number,
) {
  try {
    localStorage.setItem(
      `portfolio:v1:${username}`,
      JSON.stringify({ data, expires: Date.now() + minutes * 60_000 }),
    );
  } catch {
    /* Storage may be unavailable or full. */
  }
}
