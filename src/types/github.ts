export interface GitHubProfile {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  html_url: string;
  public_repos: number | null;
  followers: number | null;
  following: number | null;
}
export interface Repository {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics: string[] | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  fork: boolean;
  archived: boolean;
  license: { name: string; spdx_id: string | null } | null;
}
export interface PortfolioData {
  profile: GitHubProfile;
  repos: Repository[];
}
