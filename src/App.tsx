import { useState } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  Code2,
  Github,
  Linkedin,
  Mail,
  Menu,
  Moon,
  Sun,
  X,
  Terminal,
  Heart,
  ArrowRight,
} from 'lucide-react';
import { config, githubUrl, isConfigured } from './config/portfolio';
import { useGitHub } from './hooks/useGitHub';
import { useTheme } from './hooks/useTheme';
import { Projects } from './components/Projects';
import { safeUrl, selectProjects, defaultFilters } from './utilities/projects';
export default function App() {
  const { data, loading, error, retry } = useGitHub();
  const { dark, toggle } = useTheme();
  const [menu, setMenu] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const name =
    config.name || data?.profile.name || data?.profile.login || 'Your name';
  const bio =
    config.bio ||
    data?.profile.bio ||
    'Thoughtful interfaces. Useful tools. A little curiosity in every line of code.';
  const avatar = safeUrl(config.avatar || data?.profile.avatar_url);
  const repos = data?.repos ?? [];
  const publicProjects = selectProjects(repos, defaultFilters, config);
  const links = [
    {
      label: 'Email',
      url: config.email ? `mailto:${config.email}` : undefined,
      icon: Mail,
    },
    { label: 'GitHub', url: safeUrl(githubUrl), icon: Github },
    { label: 'LinkedIn', url: safeUrl(config.linkedinUrl), icon: Linkedin },
  ];
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="header">
        <div className="container nav">
          <a href="#home" className="brand">
            <span className="brand-icon">
              <Code2 size={21} />
            </span>
            {config.name || data?.profile.login || 'Portfolio'}
            <span className="brand-period">.</span>
          </a>
          <nav
            aria-label="Main navigation"
            className={menu ? 'nav-links open' : 'nav-links'}
          >
            {['Home', 'Projects', 'About', 'Contact'].map((item) => (
              <a
                href={`#${item.toLowerCase()}`}
                key={item}
                onClick={() => setMenu(false)}
              >
                {item}
              </a>
            ))}
          </nav>
          <div className="nav-actions">
            <button
              className="icon-button"
              onClick={toggle}
              aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}
            >
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            {githubUrl && (
              <a
                className="button github-nav"
                href={safeUrl(githubUrl)}
                target="_blank"
                rel="noreferrer"
              >
                <Github size={16} /> GitHub <ArrowUpRight size={14} />
              </a>
            )}
            <button
              className="icon-button mobile-menu"
              aria-label={menu ? 'Close navigation' : 'Open navigation'}
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      <main id="main">
        <section id="home" className="hero">
          <div className="container hero-layout">
            <div className="hero-copy">
              <p className="eyebrow">
                <span className="short-line" /> A DEVELOPER'S CORNER OF THE
                INTERNET
              </p>
              <div className="hello">
                Hello, I’m {name} <span aria-hidden="true">↗</span>
              </div>
              <h1>
                Building things
                <br />
                that <em>make a difference.</em>
              </h1>
              <p className="hero-bio">{bio}</p>
              <div className="hero-buttons">
                <a href="#projects" className="button primary">
                  Explore my work <ArrowDown size={17} />
                </a>
                {githubUrl && (
                  <a
                    href={safeUrl(githubUrl)}
                    className="button"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Github size={17} /> View GitHub <ArrowUpRight size={15} />
                  </a>
                )}
              </div>
              <div className="hero-footnote">
                <span className="status-dot" /> Always learning. Always
                building.
              </div>
            </div>
            <div className="profile-wrap">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <span className="float-code code-one">{'{ }'}</span>
              <span className="float-code code-two">{'</>'}</span>
              <div className="profile-card">
                <div className="profile-card-top">
                  <span className="dots">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span>developer.profile</span>
                  <Terminal size={14} />
                </div>
                <div className="profile-content">
                  <div className="avatar">
                    {avatar && !avatarFailed ? (
                      <img
                        src={avatar}
                        width="88"
                        height="88"
                        alt={`${name}'s GitHub avatar`}
                        onError={() => setAvatarFailed(true)}
                      />
                    ) : (
                      <Code2 size={39} />
                    )}
                    <span className="avatar-status" />
                  </div>
                  <h2>{name}</h2>
                  <p className="username">
                    {isConfigured
                      ? `@${config.githubUsername}`
                      : 'Your GitHub, beautifully connected.'}
                  </p>
                  <span className="role-label">{config.role}</span>
                  <div className="profile-stats">
                    {[
                      ['Repositories', data?.profile.public_repos],
                      ['Followers', data?.profile.followers],
                      ['Following', data?.profile.following],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <strong className={loading ? 'loading-number' : ''}>
                          {value ?? '—'}
                        </strong>
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="profile-bottom">
                    <span className="status-dot" />
                    {data
                      ? 'Public GitHub projects'
                      : isConfigured
                        ? 'Connecting to GitHub'
                        : 'Ready to connect'}
                    <Code2 size={15} />
                  </div>
                </div>
              </div>
              <span className="little-note">
                a work in progress, just like me.
              </span>
            </div>
          </div>
        </section>
        <div className="stack-strip">
          <div className="container stack-inner">
            <span>MY EVERYDAY TOOLKIT</span>
            <div>
              {config.skills.map((skill) => (
                <span key={skill}>
                  <Code2 size={15} />
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
        <Projects repos={repos} loading={loading} error={error} retry={retry} />
        <section id="about" className="about section">
          <div className="container about-grid">
            <div>
              <p className="eyebrow">BEHIND THE CODE</p>
              <h2>
                Curiosity is my
                <br />
                favorite tool<span>.</span>
              </h2>
            </div>
            <div>
              <p className="about-copy">{config.about}</p>
              <div className="skills">
                {config.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
              <div className="about-stats">
                <div>
                  <strong>{data ? publicProjects.length : '—'}</strong>
                  <span>Projects shared</span>
                </div>
                <div>
                  <strong>
                    {data
                      ? publicProjects.reduce(
                          (sum, r) => sum + (r.stargazers_count ?? 0),
                          0,
                        )
                      : '—'}
                  </strong>
                  <span>Stars earned</span>
                </div>
                <div>
                  <strong>
                    {data
                      ? new Set(
                          publicProjects.map((r) => r.language).filter(Boolean),
                        ).size
                      : '—'}
                  </strong>
                  <span>Languages explored</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="contact" className="container section">
          <div className="contact-panel">
            <div>
              <p className="eyebrow">LET’S CONNECT</p>
              <h2>
                Good things start
                <br />
                with a conversation<span>.</span>
              </h2>
              <p>Have an idea, a question, or just want to say hello?</p>
            </div>
            <div className="contact-actions">
              {config.email ? (
                <a className="button primary" href={`mailto:${config.email}`}>
                  Say hello <ArrowUpRight size={18} />
                </a>
              ) : (
                <a
                  className="button primary"
                  href={safeUrl(githubUrl) || '#projects'}
                >
                  {githubUrl ? 'Meet me on GitHub' : 'Explore my projects'}{' '}
                  <ArrowRight size={18} />
                </a>
              )}
              <div className="social-links">
                {links
                  .filter((link) => link.url)
                  .map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      aria-label={link.label}
                      target={link.label === 'Email' ? undefined : '_blank'}
                      rel="noreferrer"
                    >
                      <link.icon size={20} />
                    </a>
                  ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="container footer">
        <span>
          © {new Date().getFullYear()}{' '}
          {config.name || data?.profile.login || 'Portfolio'}
        </span>
        <span>
          Built with curiosity <Heart size={12} /> & a little code.
        </span>
        <a href="#home">Back to top ↑</a>
      </footer>
    </>
  );
}
