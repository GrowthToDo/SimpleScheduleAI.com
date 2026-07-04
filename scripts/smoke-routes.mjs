#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listPosts } from './lib/publish-shared.mjs';

const KEY_ROUTES = [
  '',
  'how-it-works',
  'pricing',
  'nurse-scheduling-software',
  'critical-access-hospital-scheduling',
  'ai-nurse-scheduling',
  'articles',
];

export function smokeRoutes(root = process.cwd(), dist = path.join(root, 'dist')) {
  const problems = [];
  const live = listPosts(root).filter((p) => p.data.draft !== true);

  for (const p of live) {
    const base = p.collection === 'article' ? 'articles' : 'blog';
    const page = path.join(dist, base, p.slug, 'index.html');
    if (!fs.existsSync(page)) problems.push(`missing page: ${base}/${p.slug}/index.html`);
  }

  for (const dbl of [path.join(dist, 'blog', 'blog'), path.join(dist, 'articles', 'articles')]) {
    if (fs.existsSync(dbl))
      problems.push(`double-prefix directory exists: ${path.relative(dist, dbl).replace(/\\/g, '/')}`);
  }

  const sitemapText = fs
    .readdirSync(dist)
    .filter((f) => /^sitemap.*\.xml$/.test(f))
    .map((f) => fs.readFileSync(path.join(dist, f), 'utf8'))
    .join('\n');
  for (const p of live) {
    const base = p.collection === 'article' ? 'articles' : 'blog';
    const url = `https://simplescheduleai.com/${base}/${p.slug}`;
    const n = (sitemapText.match(new RegExp(`<loc>${url}</loc>`, 'g')) || []).length;
    if (n !== 1) problems.push(`sitemap has ${n} entries for ${url} (want 1)`);
  }

  for (const p of live) {
    const base = p.collection === 'article' ? 'articles' : 'blog';
    const page = path.join(dist, base, p.slug, 'index.html');
    if (fs.existsSync(page) && fs.readFileSync(page, 'utf8').includes('&lt;div')) {
      problems.push(`escaped &lt;div leakage in ${base}/${p.slug}`);
    }
  }

  for (const r of KEY_ROUTES) {
    if (!fs.existsSync(path.join(dist, r, 'index.html'))) problems.push(`missing key route: /${r}`);
  }

  problems.push(...checkRedirects(root, dist));
  problems.push(...checkPageMeta(dist));
  problems.push(...checkRobots(root));

  return { ok: problems.length === 0, problems };
}

export function checkRedirects(root = process.cwd(), dist = path.join(root, 'dist')) {
  const problems = [];
  const tomlPath = path.join(root, 'netlify.toml');
  if (!fs.existsSync(tomlPath)) return problems;
  const toml = fs.readFileSync(tomlPath, 'utf8');
  // ASSUMPTION (zero-dep regex, not a TOML parser): `to = "..."` keys appear ONLY
  // inside [[redirects]] blocks in this repo's netlify.toml. If a future edit adds
  // a `to` key under any other table, scope this parse to [[redirects]] sections.
  for (const m of toml.matchAll(/to\s*=\s*"([^"]+)"/g)) {
    const to = m[1];
    if (!to.startsWith('/')) continue; // external target
    if (to.includes(':splat') || to === '/404') continue;
    const clean = to.replace(/\/$/, '');
    const target = clean === '' ? path.join(dist, 'index.html') : path.join(dist, clean, 'index.html');
    if (!fs.existsSync(target)) problems.push(`redirect target missing in dist: ${to}`);
  }
  return problems;
}

function* walkHtml(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walkHtml(p);
    else if (entry.name === 'index.html') yield p;
  }
}

// Non-content utility pages excluded from meta checks: static third-party admin
// tools and internal noindex pitch-deck/preview pages, not indexable SEO content.
// (Most noindex pages — e.g. /ask, /blog/2, /tag/* — DO carry valid canonical/
// description/h1 and stay checked; this list is intentionally narrow.)
const META_EXCLUDE = [
  'decapcms/index.html',
  'slide1/index.html',
  'slide2/index.html',
  'slides/index.html',
  'slides-preview/index.html',
];

export function checkPageMeta(dist) {
  const problems = [];
  for (const page of walkHtml(dist)) {
    const rel = path.relative(dist, page).replace(/\\/g, '/');
    if (rel.startsWith('404')) continue;
    if (META_EXCLUDE.includes(rel)) continue;
    const html = fs.readFileSync(page, 'utf8');
    const count = (re) => (html.match(re) || []).length;
    if (count(/<title[\s>]/g) !== 1) problems.push(`${rel}: expected exactly 1 <title>, got ${count(/<title[\s>]/g)}`);
    if (count(/<link[^>]+rel="canonical"/g) !== 1)
      problems.push(`${rel}: expected exactly 1 canonical, got ${count(/<link[^>]+rel="canonical"/g)}`);
    if (count(/<meta[^>]+name="description"/g) < 1) problems.push(`${rel}: missing meta description`);
    if (count(/<h1[\s>]/g) !== 1) problems.push(`${rel}: expected exactly 1 h1, got ${count(/<h1[\s>]/g)}`);
  }
  return problems;
}

export function checkRobots(root = process.cwd()) {
  const problems = [];
  const p = path.join(root, 'public', 'robots.txt');
  if (!fs.existsSync(p)) return ['public/robots.txt missing'];
  const txt = fs.readFileSync(p, 'utf8');
  if (/^Disallow:\s*\/\s*$/m.test(txt)) problems.push('robots.txt has a blanket Disallow: /');
  for (const agent of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended']) {
    const re = new RegExp(`User-agent:\\s*${agent}[\\s\\S]{0,80}?Disallow:\\s*\\/\\s*$`, 'mi');
    if (re.test(txt)) problems.push(`robots.txt blocks AI crawler ${agent}`);
  }
  return problems;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const { ok, problems } = smokeRoutes();
  for (const p of problems) console.log(`SMOKE FAIL: ${p}`);
  console.log(ok ? 'smoke-routes: all pass' : `smoke-routes: ${problems.length} problem(s)`);
  process.exit(ok ? 0 : 1);
}
