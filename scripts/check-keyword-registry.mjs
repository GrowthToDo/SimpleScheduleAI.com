#!/usr/bin/env node
/**
 * check-keyword-registry.mjs — cannibalization guard over docs/seo/keyword-registry.json.
 *
 * Default mode: validate the registry against disk.
 *   - every live (non-draft) post/article has exactly one registry entry
 *   - every registry post/article entry maps to a live file
 *   - no two entries share a primaryKeyword (exact dupe = FAIL)
 *   - containment overlaps (one keyword inside another) = WARN, listed for judgment
 *
 * Keyword mode: `node scripts/check-keyword-registry.mjs "proposed keyword"`
 *   Run BEFORE writing any new piece (publish-pipeline Phase 1).
 *   - exact match with an existing entry = FAIL (pick a different primary keyword
 *     or consciously update the existing piece instead)
 *   - containment / heavy word-overlap = WARN with the nearest entries, so the
 *     brief can differentiate intent explicitly
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const registry = JSON.parse(readFileSync(join(ROOT, 'docs', 'seo', 'keyword-registry.json'), 'utf8'));

const liveSlugs = (dir) =>
  readdirSync(join(ROOT, 'src', 'data', dir))
    .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
    .filter((f) => !/^draft:\s*true/m.test(readFileSync(join(ROOT, 'src', 'data', dir, f), 'utf8')))
    .map((f) => f.replace(/\.mdx?$/, ''));

const words = (s) => new Set(s.toLowerCase().split(/\s+/).filter(Boolean));
const overlap = (a, b) => {
  const wa = words(a);
  const wb = words(b);
  const inter = [...wa].filter((w) => wb.has(w)).length;
  return inter / Math.min(wa.size, wb.size);
};

let fails = 0;
let warns = 0;
const fail = (m) => (console.log(`✗ ${m}`), fails++);
const warn = (m) => (console.log(`⚠ ${m}`), warns++);

const proposed = process.argv[2];

if (proposed) {
  const kw = proposed.toLowerCase().trim();
  console.log(`Checking proposed primary keyword: "${kw}"\n`);
  for (const e of registry) {
    const existing = e.primaryKeyword.toLowerCase();
    if (existing === kw) {
      fail(
        `EXACT collision with ${e.url} ("${e.primaryKeyword}") — do not write a new piece for this keyword; update that one or pick a different primary.`
      );
    } else if (existing.includes(kw) || kw.includes(existing)) {
      warn(`containment overlap with ${e.url} ("${e.primaryKeyword}") — differentiate intent explicitly in the brief.`);
    } else if (overlap(kw, existing) >= 0.75) {
      warn(`heavy word-overlap with ${e.url} ("${e.primaryKeyword}") — check SERP overlap before writing.`);
    }
  }
  if (!fails && !warns)
    console.log('✓ no collisions — clear to brief. Add the entry to the registry when the piece goes live.');
  process.exit(fails ? 1 : 0);
}

// Validate mode
const posts = liveSlugs('post');
const articles = liveSlugs('article');
const regPosts = registry.filter((e) => e.type === 'post').map((e) => e.slug);
const regArticles = registry.filter((e) => e.type === 'article').map((e) => e.slug);

for (const s of posts) if (!regPosts.includes(s)) fail(`live post missing from registry: ${s}`);
for (const s of articles) if (!regArticles.includes(s)) fail(`live article missing from registry: ${s}`);
for (const s of regPosts) if (!posts.includes(s)) fail(`registry post has no live file (draft or deleted?): ${s}`);
for (const s of regArticles) if (!articles.includes(s)) fail(`registry article has no live file: ${s}`);

const seen = new Map();
for (const e of registry) {
  const kw = e.primaryKeyword.toLowerCase();
  if (seen.has(kw)) fail(`duplicate primaryKeyword "${kw}": ${seen.get(kw)} and ${e.url}`);
  seen.set(kw, e.url);
}

const entries = registry.map((e) => ({ url: e.url, kw: e.primaryKeyword.toLowerCase(), pillar: e.pillar }));
for (let i = 0; i < entries.length; i++) {
  for (let j = i + 1; j < entries.length; j++) {
    const a = entries[i];
    const b = entries[j];
    if (a.kw.includes(b.kw) || b.kw.includes(a.kw)) {
      // A spoke's keyword containing its own pillar's keyword is hub-and-spoke
      // by design, not cannibalization — skip those pairs.
      if (a.pillar === b.url || b.pillar === a.url) continue;
      warn(`containment: "${a.kw}" (${a.url}) ~ "${b.kw}" (${b.url})`);
    }
  }
}

console.log(`\n${registry.length} entries · ${fails} fail(s) · ${warns} warn(s)`);
process.exit(fails ? 1 : 0);
