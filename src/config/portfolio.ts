export const config = {
  githubUsername: 'looknamx',
  // Leave name, bio and avatar empty to use your live GitHub profile.
  name: 'Aniruth',
  role: 'Developer & creative problem solver',
  bio: '',
  avatar: '',
  githubUrl: '',
  linkedinUrl: '',
  email: '',
  about:
    'I enjoy turning thoughtful ideas into useful digital experiences. This is my little corner of the internet — a collection of things I build, explore, and share along the way.',
  skills: [
    'React',
    'TypeScript',
    'JavaScript',
    'Tailwind CSS',
    'Git',
    'UI / UX',
  ],
  pinnedRepos: [] as string[],
  hiddenRepos: [] as string[],
  showForks: false,
  showArchived: false,
  accentColor: '#176b50',
  // Absolute production URL, including the repository path. Auto-detected in Actions if empty.
  canonicalUrl: '',
  cacheMinutes: 15,
};
export const isConfigured =
  config.githubUsername !== 'YOUR_GITHUB_USERNAME' &&
  !!config.githubUsername.trim();
export const githubUrl =
  config.githubUrl ||
  (isConfigured ? `https://github.com/${config.githubUsername}` : '');
