// Internal link suggestions: for a page that needs links, which other live pages already say
// its keyword in plain text without linking to it, and the words to use as the link text.
// Reads the site's own source files (never changes them).

import fs from 'node:fs';
import path from 'node:path';
import { pageOfFile, countInbound } from './sources/local.mjs';
import { tokens, wordsOf, stem } from './topics.mjs';
import { plain } from './text.mjs';

const MAX_CONTEXT = 160;
const SOURCE_DIRS = [
  ['src/data/post', /\.(?:md|mdx)$/i],
  ['src/data/article', /\.(?:md|mdx)$/i],
  ['src/pages', /\.(?:astro|md|mdx)$/i],
];

export const suggestionKey = (to, from) => `${to}|${from}`;

// ---------------------------------------------------------------- reading the site's files

const FRONT_RE = /^\uFEFF?---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;
const ENTITIES = { '&amp;': '&', '&nbsp;': ' ', '&quot;': '"', '&#39;': "'", '&apos;': "'", '&lt;': '<', '&gt;': '>' };

// An .astro page as plain text: the code fence, scripts, styles, comments, {expressions} and
// tags are removed, so what is left is the words a visitor reads.
function astroText(src) {
  return src
    .replace(FRONT_RE, '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/\{[^{}]*\}/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:amp|nbsp|quot|#39|apos|lt|gt);/g, (e) => ENTITIES[e])
    .replace(/[ \t]+/g, ' ');
}

function walk(dir, ext, out = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, ext, out);
    else if (ext.test(e.name)) out.push(full);
  }
  return out;
}

const fileCache = new Map(); // absolute path -> {key, entry}

// One file to {page, text, raw}, or null for a draft or a file that is not a page.
function readPost(repoRoot, full) {
  const rel = path.relative(repoRoot, full).replace(/\\/g, '/');
  const page = pageOfFile(rel);
  if (!page) return null;
  let src;
  try {
    src = fs.readFileSync(full, 'utf8');
  } catch {
    return null;
  }
  const astro = /\.astro$/i.test(full);
  let title = null;
  if (!astro) {
    const front = FRONT_RE.exec(src);
    if (front && /^draft:\s*(?:true|yes)\s*$/im.test(front[1])) return null;
    title = titleOf(front?.[1]);
  }
  const text = astro ? astroText(src) : src.replace(FRONT_RE, '');
  return { page, text, raw: src, title };
}

// The title line of a post's front matter, without its quotes, or null.
export function titleOf(front) {
  const m = /^title:[ \t]*(.+?)[ \t]*$/m.exec(String(front ?? ''));
  if (!m) return null;
  const t = m[1].replace(/^(['"])(.*)\1$/, '$2').trim();
  return t || null;
}

// Every live-able post, article and page as [{page, text, raw}]: text is what a reader sees (front
// matter off), raw is the whole file (used only to find links). Drafts are skipped. Each file is read
// again only when its modified time or size changed.
export function loadPosts(repoRoot) {
  const out = [];
  for (const [dir, ext] of SOURCE_DIRS) {
    for (const full of walk(path.join(repoRoot, dir), ext)) {
      let stat;
      try {
        stat = fs.statSync(full);
      } catch {
        continue;
      }
      const key = `${stat.mtimeMs}:${stat.size}`;
      let hit = fileCache.get(full);
      if (!hit || hit.key !== key) {
        hit = { key, entry: readPost(repoRoot, full) };
        fileCache.set(full, hit);
      }
      if (hit.entry) out.push(hit.entry);
    }
  }
  return out;
}

// ---------------------------------------------------------------- finding the phrase

// The same-length text with everything a reader would not take as plain prose blanked out:
// code, existing links (a phrase that is already link text is not offered again), tags, bare
// web addresses, import lines. Line breaks stay, so sentence ends stay.
const NOT_PROSE = new RegExp(
  [
    '```[\\s\\S]*?```',
    '~~~[\\s\\S]*?~~~',
    '<!--[\\s\\S]*?-->',
    '<a\\b[^>]*>[\\s\\S]*?<\\/a>',
    '!?\\[[^\\]]*\\]\\([^)]*\\)',
    '\\[[^\\]]*\\]\\[[^\\]]*\\]',
    '^[ \\t]*\\[[^\\]]+\\]:[ \\t]*\\S+.*$',
    '`[^`\\n]*`',
    '<[^>\\n]+>',
    'https?:\\/\\/[^\\s)>\\]]+',
    '^(?:import|export)\\s.*$',
  ].join('|'),
  'gm'
);
const blank = (s) => s.replace(NOT_PROSE, (m) => m.replace(/[^\n]/g, ' '));

// The prose of each file and the pages it links to, worked out once per file. loadPosts hands back
// the same entry while a file's modified time and size are unchanged, so keying on the entry (and
// its text, in case a caller changes it) is a cache by file modified time.
const proseCache = new WeakMap(); // post -> {text, prose, links: Map(target -> bool)}
export const proseStats = { computed: 0 };

function cached(post) {
  let c = proseCache.get(post);
  if (!c || c.text !== post.text || c.raw !== post.raw) {
    proseStats.computed += 1;
    c = { text: post.text, raw: post.raw, prose: blank(post.text), links: new Map() };
    proseCache.set(post, c);
  }
  return c;
}

// True when the post's file already links to target (its raw text, so links in tags count).
function linksTo(post, target) {
  const c = cached(post);
  if (!c.links.has(target)) {
    c.links.set(
      target,
      Boolean(countInbound([{ path: post.page, text: post.raw ?? post.text }], [target])[target]?.length)
    );
  }
  return c.links.get(target);
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// One word, matching its plural or singular form.
function wordPattern(word) {
  const s = stem(word);
  if (/[^aeiou]y$/.test(s) && s.length > 3) return `${escapeRe(s.slice(0, -1))}(?:y|ies)`;
  return `${escapeRe(s)}(?:e?s)?`;
}

// A phrase as a regular expression: the words in order, a space or a hyphen between them,
// whole words only, case ignored.
function phraseRe(words) {
  if (!words.length) return null;
  const body = words.map(wordPattern).join('[\\s\\-]+');
  return new RegExp(`(?<![\\p{L}\\p{N}\\p{M}])${body}(?![\\p{L}\\p{N}\\p{M}])`, 'iu');
}

function cleanSentence(s) {
  return plain(
    s
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\*\*|__|`/g, '')
      .replace(/\*(\S[^*\n]*?)\*/g, '$1')
      .replace(/^\s*(?:#{1,6}|>|[-*+])\s+/gm, '')
      .replace(/\s+/g, ' ')
  );
}

// The sentence around the match, at most MAX_CONTEXT characters, cut at word breaks with "..."
// where text is left out.
function contextOf(text, index, length) {
  const isEnd = (i) => text[i] === '\n' || (/[.!?]/.test(text[i]) && (i + 1 >= text.length || /\s/.test(text[i + 1])));
  let start = index;
  while (start > 0 && text[start - 1] !== '\n' && !(/[.!?]/.test(text[start - 2] ?? '') && /\s/.test(text[start - 1])))
    start--;
  let end = index + length;
  while (end < text.length && !isEnd(end)) end++;
  if (end < text.length && text[end] !== '\n') end++; // keep the full stop
  const anchor = text.slice(index, index + length);
  const sentence = cleanSentence(text.slice(start, end));
  if (sentence.length <= MAX_CONTEXT) return sentence;
  const window = MAX_CONTEXT - 6; // room for "..." at both ends
  const at = Math.max(0, sentence.toLowerCase().indexOf(cleanSentence(anchor).toLowerCase()));
  let from = Math.max(0, at - Math.floor((window - anchor.length) / 2));
  if (from + window > sentence.length) from = Math.max(0, sentence.length - window);
  let to = Math.min(sentence.length, from + window);
  if (from > 0) {
    const sp = sentence.indexOf(' ', from);
    if (sp !== -1 && sp < at) from = sp + 1;
  }
  if (to < sentence.length) {
    const sp = sentence.lastIndexOf(' ', to);
    if (sp > at) to = sp;
  }
  return `${from > 0 ? '...' : ''}${sentence.slice(from, to).trim()}${to < sentence.length ? '...' : ''}`;
}

const impressionsOf = (map, page) => Number((map instanceof Map ? map.get(page) : map?.[page]) ?? 0) || 0;

// linkSuggestions({targetPage, keyword, posts, inbound, max, impressions}) ->
// [{to, from, anchor, context}]. A page qualifies when its plain text says the keyword (or the
// two or more words that carry it) and neither its text nor the inbound table shows a link to the
// target. The busiest page (by `impressions`, a page to views map) comes first.
export function linkSuggestions({ targetPage, keyword, posts, inbound = {}, max = 5, impressions = {} } = {}) {
  if (typeof targetPage !== 'string' || !targetPage.startsWith('/')) return [];
  const words = wordsOf(keyword);
  if (!words.length) return [];
  const full = phraseRe(words);
  const core = tokens(keyword);
  const coreRe = core.length >= 2 && core.join(' ') !== words.map(stem).join(' ') ? phraseRe(core) : null;
  const known = new Set(inbound?.[targetPage] ?? []);

  const found = [];
  for (const post of Array.isArray(posts) ? posts : []) {
    if (!post?.page || post.page === targetPage || typeof post.text !== 'string') continue;
    if (known.has(post.page)) continue;
    if (linksTo(post, targetPage)) continue;
    const { prose } = cached(post);
    const m = full.exec(prose) ?? coreRe?.exec(prose);
    if (!m) continue;
    found.push({
      to: targetPage,
      from: post.page,
      anchor: post.text.slice(m.index, m.index + m[0].length),
      context: contextOf(post.text, m.index, m[0].length),
    });
  }
  found.sort(
    (a, b) => impressionsOf(impressions, b.from) - impressionsOf(impressions, a.from) || a.from.localeCompare(b.from)
  );
  return found.slice(0, Math.max(0, max));
}
