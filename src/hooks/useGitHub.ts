import { useEffect, useState } from 'react';
import { config, isConfigured } from '../config/portfolio';
import { fetchPortfolio, readCache, writeCache } from '../services/github';
import type { PortfolioData } from '../types/github';
import snapshot from '../data/github-snapshot.json';
const savedSnapshot: PortfolioData | null =
  snapshot.data.profile.login === config.githubUsername ? snapshot.data : null;
export function useGitHub() {
  const [data, setData] = useState<PortfolioData | null>(savedSnapshot);
  const [loading, setLoading] = useState(isConfigured);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!isConfigured) return;
    const controller = new AbortController();
    const cached = readCache(config.githubUsername);
    if (cached) setData(cached.data);
    if (cached && cached.expires > Date.now() && attempt === 0) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    fetchPortfolio(config.githubUsername, controller.signal)
      .then((result) => {
        setData(result);
        writeCache(config.githubUsername, result, config.cacheMinutes);
      })
      .catch((e: unknown) => {
        if (!controller.signal.aborted)
          setError(
            `${e instanceof Error ? e.message : 'Unable to connect to GitHub.'}${cached ? ' Showing your saved data.' : savedSnapshot ? ` Showing public repositories imported on ${new Date(snapshot.capturedAt).toLocaleDateString()}.` : ''}`,
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [attempt]);
  return { data, loading, error, retry: () => setAttempt((n) => n + 1) };
}
