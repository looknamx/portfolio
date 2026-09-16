import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { config } from './src/config/portfolio.ts';
const repository = process.env.GITHUB_REPOSITORY?.split('/');
const base =
  process.env.PAGES_BASE_PATH ||
  (repository &&
  repository[1].toLowerCase() !== `${repository[0].toLowerCase()}.github.io`
    ? `/${repository[1]}/`
    : '/');
const canonical =
  config.canonicalUrl ||
  process.env.PAGES_URL ||
  (repository ? `https://${repository[0]}.github.io${base}` : '');
const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!,
  );
const title = `${config.name || 'Developer'} — Portfolio`;
const description = config.bio || config.about;
export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'portfolio-seo',
      transformIndexHtml(html) {
        return html.replace(
          '<!--seo-->',
          `<title>${escape(title)}</title><meta name="description" content="${escape(description)}"/><meta property="og:title" content="${escape(title)}"/><meta property="og:description" content="${escape(description)}"/><meta property="og:type" content="website"/><meta name="twitter:card" content="summary"/><meta name="twitter:title" content="${escape(title)}"/><meta name="twitter:description" content="${escape(description)}"/>${config.avatar && /^https?:/.test(config.avatar) ? `<meta property="og:image" content="${escape(config.avatar)}"/><meta name="twitter:image" content="${escape(config.avatar)}"/>` : ''}${canonical ? `<link rel="canonical" href="${escape(canonical)}"/><meta property="og:url" content="${escape(canonical)}"/><script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': [{ '@type': 'WebSite', name: title, url: canonical }, ...(config.name ? [{ '@type': 'Person', name: config.name, url: canonical }] : [])] }).replace(/</g, '\\u003c')}</script>` : ''}`,
        );
      },
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'robots.txt',
          source: `User-agent: *\nAllow: /\n${canonical ? `Sitemap: ${new URL('sitemap.xml', canonical.endsWith('/') ? canonical : `${canonical}/`).href}\n` : ''}`,
        });
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${canonical ? `<url><loc>${escape(canonical)}</loc></url>` : ''}</urlset>`,
        });
      },
    },
  ],
});
