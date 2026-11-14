// Topics and the keyword map. A topic is a set of searches that share words; it is a rough
// grouping on purpose (no search volume data, no model), good enough to show which searches
// are really one demand and whether two pages are fighting for it. Pure functions only.

import crypto from 'node:crypto';
import { isBrand } from '../../scripts/lib/gsc-diagnose-core.mjs';

export const BRAND_LABEL = 'Searches for a brand name';
export const TOPICS_NOTE = 'Topics are searches grouped by the words they share. The grouping is approximate.';

const MIN_SHARED = 2;
const SOLO_MIN_IMPRESSIONS = 30; // a lone word or an odd search needs this many views to be a topic
const COMPETING_SHARE = 0.2; // a page holding this share of a topic's views counts as competing
// Below these, a share or a "pages compete" mark would rest on a handful of views: the topic needs
// this many views before its pages get shares, and each competing page needs COMPETING_PAGE_MIN.
export const COMPETING_MIN_VIEWS = 30;
export const COMPETING_PAGE_MIN = 10;
// The hover line of the "Pages compete" mark, from the same numbers the rule uses.
export const COMPETING_NOTE = `Two or more pages each get ${COMPETING_SHARE === 0.2 ? 'a fifth' : `${Math.round(COMPETING_SHARE * 100)}%`} or more of its views (shown only once the topic has ${COMPETING_MIN_VIEWS} views and each page ${COMPETING_PAGE_MIN}).`;

// A compact English list: articles, prepositions, auxiliaries, question words. Nothing about the
// business, so "nurse", "schedule" and the like stay real words.
export const STOP_WORDS = new Set(
  [
    'a',
    'an',
    'the',
    'and',
    'or',
    'but',
    'of',
    'in',
    'on',
    'at',
    'to',
    'for',
    'from',
    'by',
    'with',
    'about',
    'as',
    'into',
    'than',
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'am',
    'do',
    'does',
    'did',
    'has',
    'have',
    'had',
    'can',
    'could',
    'will',
    'would',
    'should',
    'what',
    'which',
    'who',
    'whom',
    'whose',
    'when',
    'where',
    'why',
    'how',
    'that',
    'this',
    'these',
    'those',
    'it',
    'its',
    'you',
    'your',
    'my',
    'me',
    'we',
    'our',
    'there',
    'not',
    'vs',
  ].map((w) => w.toLowerCase())
);

// ---------------------------------------------------------------- words

// Light plural trimming: boxes -> box, classes -> class, policies -> policy, nurses -> nurse.
// Words ending in ss, us or is (class, status, analysis) are left alone.
export function stem(word) {
  const w = String(word);
  if (w.length <= 3 || /(?:ss|us|is)$/.test(w)) return w;
  if (/(?:ches|shes|xes|zes|sses)$/.test(w)) return w.slice(0, -2);
  if (/[^aeiou]ies$/.test(w) && w.length > 4) return `${w.slice(0, -3)}y`;
  if (w.endsWith('s')) return w.slice(0, -1);
  return w;
}

// The words of a text, in order: lower case, punctuation gone, stop words and one letter words
// dropped, plurals trimmed, each word once. Any script works (a run of letters is a word).
export function wordsOf(text) {
  return String(text ?? '')
    .toLowerCase()
    .split(/[^\p{L}\p{N}\p{M}]+/u)
    .filter(Boolean);
}

export function tokens(query) {
  const out = [];
  for (const w of wordsOf(query)) {
    if (STOP_WORDS.has(w)) continue;
    if ([...w].length < 2) continue;
    const t = stem(w);
    if (!out.includes(t)) out.push(t);
  }
  return out;
}

// ---------------------------------------------------------------- helpers

const round = (n, places) => {
  const f = 10 ** places;
  return Math.round(n * f) / f;
};
const norm = (s) =>
  String(s ?? '')
    .trim()
    .toLowerCase();
const sha = (s) => crypto.createHash('sha1').update(String(s)).digest('hex').slice(0, 12);
const byImpressionsThen = (key) => (a, b) =>
  b.impressions - a.impressions || String(a[key]).localeCompare(String(b[key]));

// Query page rows to one entry per search: views added, position weighted by views, the page
// with the most views named, and the rows kept for the page breakdown.
function groupSearches(rows) {
  const map = new Map();
  for (const r of Array.isArray(rows) ? rows : []) {
    if (!r || typeof r.query !== 'string') continue;
    const key = norm(r.query);
    if (!key) continue;
    const impressions = Number(r.impressions);
    if (!Number.isFinite(impressions) || impressions < 0) continue;
    const position = Number.isFinite(Number(r.position)) ? Number(r.position) : 0;
    let g = map.get(key);
    if (!g) map.set(key, (g = { key, forms: new Map(), impressions: 0, weighted: 0, positions: [], pages: new Map() }));
    g.forms.set(r.query.trim(), (g.forms.get(r.query.trim()) ?? 0) + impressions);
    g.impressions += impressions;
    g.weighted += position * impressions;
    g.positions.push(position);
    if (r.page) g.pages.set(r.page, (g.pages.get(r.page) ?? 0) + impressions);
  }
  return [...map.values()].map((g) => {
    const pages = [...g.pages].map(([page, impressions]) => ({ page, impressions })).sort(byImpressionsThen('page'));
    const form = [...g.forms].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
    const position = g.impressions
      ? g.weighted / g.impressions
      : g.positions.reduce((a, b) => a + b, 0) / g.positions.length;
    return {
      key: g.key,
      query: form,
      impressions: g.impressions,
      position: round(position, 2),
      page: pages[0]?.page ?? null,
      pages,
      tokens: tokens(form),
    };
  });
}

function finishTopic(id, label, members) {
  members.sort(byImpressionsThen('query'));
  const impressions = members.reduce((a, m) => a + m.impressions, 0);
  const pageViews = new Map();
  for (const m of members) for (const p of m.pages) pageViews.set(p.page, (pageViews.get(p.page) ?? 0) + p.impressions);
  const enough = impressions >= COMPETING_MIN_VIEWS;
  const pages = [...pageViews]
    .map(([page, views]) => ({ page, impressions: views, share: enough ? round(views / impressions, 3) : null }))
    .sort(byImpressionsThen('page'));
  const competing =
    enough &&
    pages.filter((p) => p.impressions >= COMPETING_PAGE_MIN && p.impressions >= impressions * COMPETING_SHARE).length >=
      2;
  return {
    id,
    label,
    queries: members.map((m) => ({
      query: m.query,
      impressions: m.impressions,
      position: m.position,
      page: m.page,
    })),
    impressions,
    pages,
    competing,
    targeted: false,
    targetPage: null,
    targetKeyword: null,
    targets: [], // every target keyword that fell in this topic: [{keyword, page}]
  };
}

// ---------------------------------------------------------------- topics

// Whether `shared` words are enough for a search of `own` words to belong with a core of `core`
// words: at least minShared, and at least half of each side. Without the half tests a long seed
// with common words would pull in every search that shares two of them.
const covers = (shared, own, core, minShared) => shared >= minShared && shared * 2 >= own && shared * 2 >= core;

// topicsOf(queryRows, {brands, minShared, targets}) -> topics, busiest first.
export function topicsOf(queryRows, opts) {
  return groupTopics(queryRows, opts).topics;
}

// groupTopics(...) -> {topics, ungrouped: {searches, impressions}}.
// queryRows are {query, page, impressions, position}; targets are {keyword, page} (registry and
// adopted keywords). The busiest search seeds a topic and fixes its core (the seed's words); a
// later search joins the topic whose core it shares enough words with (see covers; the most
// shared wins, the busier topic on a tie), so one common word never chains everything together.
// ungrouped counts the rare one-word searches (under 30 views) that join nothing.
export function groupTopics(queryRows, { brands = [], minShared = MIN_SHARED, targets = [] } = {}) {
  const searches = groupSearches(queryRows).sort(byImpressionsThen('query'));

  const topics = []; // {seed, core:Set, members}
  const index = new Map(); // word -> topic positions
  const brandMembers = [];
  const ungrouped = { searches: 0, impressions: 0 };
  const open = (s) => {
    const core = new Set(s.tokens);
    const t = { seed: s, core, members: [s] };
    topics.push(t);
    for (const w of core) {
      if (!index.has(w)) index.set(w, []);
      index.get(w).push(topics.length - 1);
    }
  };

  for (const s of searches) {
    if (isBrand(s.query, brands)) {
      brandMembers.push(s);
      continue;
    }
    if (s.tokens.length < 2) {
      if (s.impressions >= SOLO_MIN_IMPRESSIONS) open(s);
      else {
        ungrouped.searches++;
        ungrouped.impressions += s.impressions;
      }
      continue;
    }
    const shared = new Map();
    for (const w of s.tokens) for (const i of index.get(w) ?? []) shared.set(i, (shared.get(i) ?? 0) + 1);
    let best = -1;
    let bestShared = 0;
    for (const [i, n] of shared) {
      if (!covers(n, s.tokens.length, topics[i].core.size, minShared)) continue;
      if (n > bestShared || (n === bestShared && i < best)) [best, bestShared] = [i, n];
    }
    if (best >= 0) topics[best].members.push(s);
    else open(s);
  }

  const out = topics.map((t) => finishTopic(sha(t.seed.query), t.seed.query, t.members));
  const byIdSeed = new Map(topics.map((t, i) => [i, out[i]]));
  if (brandMembers.length) out.push(finishTopic(sha(BRAND_LABEL), BRAND_LABEL, brandMembers));

  markTargets(out, topics, byIdSeed, brandMembers.length ? out[out.length - 1] : null, targets, minShared);

  out.sort(byImpressionsThen('label'));
  return { topics: out, ungrouped };
}

// A keyword falls in the topic that holds that exact search, or a search made of the same
// words, or else the topic whose core it shares the most words with (with the same coverage test
// a search must pass to join a topic, so a loose overlap does not mark a topic targeted).
function markTargets(out, topics, byPosition, brandTopic, targets, minShared) {
  const byQuery = new Map();
  const byWords = new Map();
  for (const t of out) {
    for (const q of t.queries) {
      byQuery.set(norm(q.query), t);
      const key = tokens(q.query).join(' ');
      if (key && !byWords.has(key)) byWords.set(key, t);
    }
  }
  for (const target of Array.isArray(targets) ? targets : []) {
    const keyword = norm(target?.keyword);
    if (!keyword) continue;
    const kt = tokens(keyword);
    let hit = byQuery.get(keyword) ?? byWords.get(kt.join(' '));
    if (!hit && kt.length >= minShared) {
      let bestShared = 0;
      topics.forEach((t, i) => {
        const n = kt.filter((w) => t.core.has(w)).length;
        const candidate = byPosition.get(i);
        if (
          covers(n, kt.length, t.core.size, minShared) &&
          (n > bestShared || (n === bestShared && candidate.impressions > hit.impressions))
        ) {
          hit = candidate;
          bestShared = n;
        }
      });
    }
    if (!hit || hit === brandTopic) continue;
    hit.targeted = true;
    hit.targets.push({ keyword: target.keyword, page: target.page ?? null });
    if (!hit.targetPage && target.page) {
      hit.targetPage = target.page;
      hit.targetKeyword = target.keyword; // the keyword that claimed the topic, for a cluster conflict
    }
  }
}

// ---------------------------------------------------------------- keyword map

// The same rows by page: [{page, queries: [{query, impressions, position}], impressions}].
export function keywordMap(queryPageRows) {
  const pages = new Map();
  for (const r of Array.isArray(queryPageRows) ? queryPageRows : []) {
    if (!r || !r.page || typeof r.query !== 'string' || !norm(r.query)) continue;
    const impressions = Number(r.impressions);
    if (!Number.isFinite(impressions)) continue;
    const position = Number.isFinite(Number(r.position)) ? Number(r.position) : 0;
    if (!pages.has(r.page)) pages.set(r.page, new Map());
    const m = pages.get(r.page);
    const key = norm(r.query);
    const e = m.get(key) ?? { query: r.query.trim(), impressions: 0, weighted: 0, positions: [] };
    e.impressions += impressions;
    e.weighted += position * impressions;
    e.positions.push(position);
    m.set(key, e);
  }
  return [...pages]
    .map(([page, m]) => {
      const queries = [...m.values()]
        .map((e) => ({
          query: e.query,
          impressions: e.impressions,
          position: round(
            e.impressions ? e.weighted / e.impressions : e.positions.reduce((a, b) => a + b, 0) / e.positions.length,
            2
          ),
        }))
        .sort(byImpressionsThen('query'));
      return { page, queries, impressions: queries.reduce((a, q) => a + q.impressions, 0) };
    })
    .sort(byImpressionsThen('page'));
}
