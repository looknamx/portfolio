import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const configPath = resolve(root, 'src/config/portfolio.ts');
const snapshotPath = resolve(root, 'src/data/github-snapshot.json');

// Extract githubUsername from the TypeScript config file.
const configText = readFileSync(configPath, 'utf-8');
const match = configText.match(/githubUsername:\s*['"]([^'"]+)['"]/);
if (!match || match[1] === 'YOUR_GITHUB_USERNAME') {
  console.log('⏭  No GitHub username configured. Skipping snapshot update.');
  process.exit(0);
}
const username = match[1];

async function request(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: { Accept: 'application/vnd.github+json' },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${path}`);
  return res.json();
}

console.log(`📡 Fetching GitHub data for @${username}…`);

const profile = await request(`/users/${encodeURIComponent(username)}`);

const repos = [];
for (let page = 1; ; page++) {
  const batch = await request(
    `/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated&direction=desc&page=${page}`,
  );
  repos.push(...batch);
  if (batch.length < 100) break;
}

// Keep only the fields that match our TypeScript interfaces.
const cleanProfile = {
  login: profile.login,
  name: profile.name ?? null,
  bio: profile.bio ?? null,
  avatar_url: profile.avatar_url,
  html_url: profile.html_url,
  public_repos: profile.public_repos ?? null,
  followers: profile.followers ?? null,
  following: profile.following ?? null,
};

const cleanRepos = repos.map((r) => ({
  id: r.id,
  name: r.name,
  description: r.description ?? null,
  html_url: r.html_url,
  homepage: r.homepage ?? null,
  language: r.language ?? null,
  topics: r.topics ?? [],
  stargazers_count: r.stargazers_count ?? 0,
  forks_count: r.forks_count ?? 0,
  updated_at: r.updated_at,
  fork: r.fork ?? false,
  archived: r.archived ?? false,
  license: r.license
    ? { name: r.license.name, spdx_id: r.license.spdx_id ?? null }
    : null,
}));

const snapshot = {
  capturedAt: new Date().toISOString(),
  data: { profile: cleanProfile, repos: cleanRepos },
};

writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2) + '\n');
console.log(
  `✅ Snapshot updated: ${cleanRepos.length} repos captured at ${snapshot.capturedAt}`,
);

