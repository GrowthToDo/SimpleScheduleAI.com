// Routes for topics, the keyword map and internal link suggestions.

import { get, post, q, bad, bodyOf, sendText } from '../kit.mjs';
import {
  buildModel,
  envelope,
  rangeOf,
  pagePath,
  repoRoot,
  deskToday,
  TYPE_LABEL,
  memo,
  invalidate,
} from '../model.mjs';
import { readJson, writeJson } from '../../store.mjs';
import { longDate } from '../../text.mjs';
import { toCsv } from '../csv.mjs';
import { isBrand } from '../../../../scripts/lib/gsc-diagnose-core.mjs';
import { groupTopics, keywordMap, TOPICS_NOTE, COMPETING_NOTE } from '../../topics.mjs';
import { linkSuggestions, loadPosts, suggestionKey } from '../../links.mjs';

const RANGES = [28, 90];
const NEEDY = ['needs-links', 'near-page-one'];
const STATE = 'state/link-suggestions.json';
const STATUSES = ['done', 'dismissed', 'open'];
const MAX_SHOWN = 5;
const MAX_KEYWORDS_TRIED = 3;

const readStatuses = () => {
  const v = readJson(STATE, {});
  return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
};

// ---------------------------------------------------------------- shared reading

function daysOf(ctx) {
  const raw = q(ctx, 'range');
  const days = raw === '' ? 28 : Number(raw);
  if (!RANGES.includes(days)) throw bad(`range must be one of: ${RANGES.join(', ')}.`);
  return days;
}

// The search and page rows of one range, and the dates they cover.
function rowsFor(model, days) {
  const gsc = model.data.gsc;
  if (!gsc) return { rows: [], range: null };
  return days === 28
    ? { rows: gsc.qpCur ?? [], range: model.range }
    : { rows: gsc.qp90 ?? [], range: rangeOf(gsc.windows?.d90) };
}

// Registry keywords first, then the ones the founder adopted in the desk.
function targetsOf(model) {
  const own = (model.data.local?.registry ?? [])
    .filter((r) => r?.primaryKeyword)
    .map((r) => ({ keyword: r.primaryKeyword, page: r.url ? pagePath(r.url) : null, source: 'registry' }));
  const adopted = readJson('state/targets.json', { adopted: [], ignored: [], priorities: {} })?.adopted;
  const mine = (Array.isArray(adopted) ? adopted : [])
    .filter((a) => a?.keyword)
    .map((a) => ({ keyword: a.keyword, page: a.page ? pagePath(a.page) : null, source: 'adopted' }));
  return [...own, ...mine];
}

// ---------------------------------------------------------------- topics

const DEFAULT_LIMIT = 200;
const MAX_SAVED = 2000;

// Topics for one range. `minSearches` keeps topics with at least that many searches; `limit`
// (busiest first) cuts the list, null for no cut. `total` is the count before the cut.
function topicsView(model, days, { limit = DEFAULT_LIMIT, minSearches = 1 } = {}) {
  const { rows, range } = rowsFor(model, days);
  const { topics: all, ungrouped } = groupTopics(rows, { brands: model.brands, targets: targetsOf(model) });
  const matching = all.filter((t) => t.queries.length >= minSearches);
  const topics = limit == null ? matching : matching.slice(0, limit);
  const n = ungrouped.searches;
  return {
    ...envelope(model, { need: ['gsc'], range }),
    days,
    note: TOPICS_NOTE,
    competingNote: COMPETING_NOTE,
    total: matching.length,
    shown: topics.length,
    minSearches,
    ungrouped,
    ungroupedNote: n ? `${n} rare one-word ${n === 1 ? 'search is' : 'searches are'} not grouped.` : null,
    topics,
  };
}

// ?minSearches= (a whole number, 1 or more) and ?all=1 (no cut) from the query string.
function topicOptions(ctx) {
  const raw = q(ctx, 'minSearches');
  const minSearches = raw === '' ? 1 : Number(raw);
  if (!Number.isInteger(minSearches) || minSearches < 1) throw bad('minSearches must be a whole number, 1 or more.');
  const lim = q(ctx, 'limit');
  const limit = Number(lim);
  if (lim !== '' && (!Number.isInteger(limit) || limit < 1)) throw bad('limit must be a whole number, 1 or more.');
  return { limit: q(ctx, 'all') === '1' ? null : lim === '' ? DEFAULT_LIMIT : limit, minSearches };
}

function topicsCsv(model, days, minSearches) {
  const { topics } = topicsView(model, days, { limit: null, minSearches });
  return toCsv(
    [
      ['topic', (t) => t.label],
      ['searches', (t) => t.queries.length],
      ['impressions', (t) => t.impressions],
      ['main_page', (t) => t.pages[0]?.page ?? ''],
      ['pages_competing', (t) => t.competing],
      ['targeted', (t) => t.targeted],
      ['target_page', (t) => t.targetPage ?? ''],
      [
        'top_searches',
        (t) =>
          t.queries
            .slice(0, 10)
            .map((x) => x.query)
            .join('; '),
      ],
    ],
    topics
  );
}

// ---------------------------------------------------------------- keyword map

function mapView(model, days) {
  const { rows, range } = rowsFor(model, days);
  const pages = keywordMap(rows);
  return { ...envelope(model, { need: ['gsc'], range }), days, total: pages.length, pages };
}

// ---------------------------------------------------------------- link suggestions

// The pages that need links, each with the opportunity types that say so, in the ranked order.
function needyPages(model) {
  const byPage = new Map();
  for (const o of model.opps) {
    if (!o.page || !NEEDY.includes(o.type)) continue;
    if (!byPage.has(o.page)) byPage.set(o.page, { opps: [] });
    byPage.get(o.page).opps.push(o);
  }
  return byPage;
}

// The keywords to try for one page, best first: the registry keyword, an adopted one, the search
// an opportunity names, then the page's busiest search that is not a brand name.
function keywordsFor(model, page, opps, rows, targets) {
  const out = [];
  const add = (keyword, source) => {
    const k = String(keyword ?? '').trim();
    if (k && !out.some((x) => x.keyword.toLowerCase() === k.toLowerCase())) out.push({ keyword: k, source });
  };
  for (const t of targets) if (t.page === page && t.source === 'registry') add(t.keyword, 'registry');
  for (const t of targets) if (t.page === page && t.source === 'adopted') add(t.keyword, 'adopted');
  for (const o of opps) if (o.query) add(o.query, 'opportunity');
  const top = rows
    .filter((r) => r.page === page && !isBrand(r.query, model.brands))
    .sort((a, b) => b.impressions - a.impressions)[0];
  if (top) add(top.query, 'top search');
  return out.slice(0, MAX_KEYWORDS_TRIED);
}

// The freeze on the page a link would be added on, from the lifecycle module (model.frozen).
// Editing it inside its 28 days makes its verdict overlap with this change.
function frozenFrom(model, from) {
  const f = model.frozen.get(from);
  return { fromFrozenUntil: f?.until ?? null, fromFrozenUntilText: f ? longDate(f.until) : null };
}

// The suggestions still to do: the ones listed (dismissed ones are never listed) that are not marked
// done. The sidebar's Internal links count and the page's first number are this.
export const openSuggestions = (pages) =>
  (pages ?? []).reduce((n, p) => n + p.suggestions.filter((x) => x.status !== 'done').length, 0);

// The Internal links count for /api/nav: the open suggestions on the Internal links page, or null
// before the repo files have been read.
export function openLinkSuggestions(model) {
  if (!model.snapObjs.local?.pulledAt) return null;
  return suggestionsView(model, { page: '' }).open;
}

// A page's title for the cards: the post's front matter title, else null (the page shows the path).
// The audit saves no titles, so the post files are the only source the desk has.
const titlesOf = (posts) => new Map(posts.filter((p) => p.title).map((p) => [p.page, p.title]));

export function suggestionsView(model, { page }) {
  // The whole list is worked out once per model (the sidebar asks for its count after every change);
  // marking a suggestion invalidates the model.
  return memo(model, `links:view:${page}`, () => buildSuggestions(model, { page }));
}

function buildSuggestions(model, { page }) {
  const gsc = model.data.gsc;
  const empty = !gsc && !model.data.local;
  const base = { ...envelope(model, { need: ['gsc', 'local'] }), pages: [], total: 0, open: 0 };
  if (empty) return base;

  const rows = gsc?.qp90 ?? gsc?.qpCur ?? [];
  const views = new Map();
  for (const r of rows) views.set(r.page, (views.get(r.page) ?? 0) + (r.impressions || 0));
  const liveList = model.data.local?.livePages ?? [];
  const live = new Set(liveList.map((p) => p.page));
  const posts = loadPosts(repoRoot()).filter((p) => !live.size || live.has(p.page));
  const titles = titlesOf(posts);
  const inbound = model.data.local?.inbound ?? {};
  const targets = targetsOf(model);
  const statuses = readStatuses();
  const needy = needyPages(model);
  const wanted = page ? [page] : [...needy.keys()];

  const pages = wanted.map((target) => {
    const opps = needy.get(target)?.opps ?? [];
    const candidates = keywordsFor(model, target, opps, rows, targets);
    let used = candidates[0] ?? null;
    let open = [];
    let dismissed = 0;
    for (let i = 0; i < candidates.length; i++) {
      const c = candidates[i];
      const all = linkSuggestions({
        targetPage: target,
        keyword: c.keyword,
        posts,
        inbound,
        max: 1000,
        impressions: views,
      })
        .map((s) => ({
          ...s,
          toTitle: titles.get(s.to) ?? null,
          fromTitle: titles.get(s.from) ?? null,
          status: statuses[suggestionKey(s.to, s.from)]?.status ?? 'open',
          ...frozenFrom(model, s.from),
        }))
        // A page being measured is the page the link is added on, so it goes last (stable order).
        .sort((a, b) => Number(Boolean(a.fromFrozenUntil)) - Number(Boolean(b.fromFrozenUntil)));
      const shown = all.filter((s) => s.status !== 'dismissed');
      // The first keyword that finds something wins; with nothing found the first one is reported.
      if (i === 0) dismissed = all.length - shown.length;
      if (shown.length) {
        used = c;
        open = shown;
        dismissed = all.length - shown.length;
        break;
      }
    }
    const types = [...new Set(opps.map((o) => TYPE_LABEL[o.type] ?? o.type))];
    return {
      page: target,
      title: titles.get(target) ?? null,
      keyword: used?.keyword ?? null,
      keywordSource: used?.source ?? null,
      reasons: types,
      suggestions: open.slice(0, MAX_SHOWN),
      dismissed,
    };
  });
  return {
    ...base,
    pages,
    total: pages.reduce((a, p) => a + p.suggestions.length, 0),
    open: openSuggestions(pages),
  };
}

function pageParam(ctx) {
  const page = q(ctx, 'page');
  if (page && !page.startsWith('/')) throw bad('page must be a page path that starts with a slash, such as /pricing.');
  return page ? pagePath(page) : '';
}

function suggestionsCsv(model, page) {
  const { pages } = suggestionsView(model, { page });
  const rows = pages.flatMap((p) => p.suggestions.map((s) => ({ ...s, keyword: p.keyword })));
  return toCsv(
    [
      ['page_to_link_to', (r) => r.to],
      ['page_to_add_the_link_on', (r) => r.from],
      ['link_text', (r) => r.anchor],
      ['sentence', (r) => r.context],
      ['search_it_may_help_with', (r) => r.keyword],
      ['page_to_edit_frozen_until', (r) => r.fromFrozenUntil ?? ''],
      ['status', (r) => r.status],
    ],
    rows
  );
}

// ---------------------------------------------------------------- the routes

export const routes = [
  get('/api/topics', (ctx) => topicsView(buildModel(), daysOf(ctx), topicOptions(ctx))),
  get('/api/keyword-map', (ctx) => mapView(buildModel(), daysOf(ctx))),
  get('/api/link-suggestions', (ctx) => suggestionsView(buildModel(), { page: pageParam(ctx) })),
  post('/api/link-suggestions', async (ctx) => {
    const b = await bodyOf(ctx);
    const isPage = (v) => typeof v === 'string' && v.startsWith('/');
    if (!isPage(b.to) || !isPage(b.from)) throw bad('to and from must be page paths that start with a slash.');
    if (!STATUSES.includes(b.status)) throw bad(`status must be one of: ${STATUSES.join(', ')}.`);
    const to = pagePath(b.to);
    const from = pagePath(b.from);
    const live = new Set((buildModel().data.local?.livePages ?? []).map((p) => p.page));
    for (const p of [to, from]) if (!live.has(p)) throw bad(`${p} is not a live page the desk knows about.`);
    const key = suggestionKey(to, from);
    const all = readStatuses();
    if (b.status === 'open') delete all[key];
    else {
      delete all[key]; // re-marking moves it to the newest end
      all[key] = { status: b.status, at: new Date().toISOString() };
    }
    const keys = Object.keys(all);
    if (keys.length > MAX_SAVED) {
      // Keep the newest MAX_SAVED marks; ties keep insertion order (oldest first), so the oldest go.
      const oldest = keys
        .map((k, i) => ({ k, i, at: String(all[k]?.at ?? '') }))
        .sort((x, y) => x.at.localeCompare(y.at) || x.i - y.i)
        .slice(0, keys.length - MAX_SAVED);
      for (const { k } of oldest) delete all[k];
    }
    writeJson(STATE, all);
    invalidate(); // the list and the sidebar count read the marks
    return { ok: true, to, from, status: b.status };
  }),
  get('/api/export/topics.csv', (ctx) => {
    const model = buildModel();
    sendText(
      ctx,
      'text/csv; charset=utf-8',
      topicsCsv(model, daysOf(ctx), topicOptions(ctx).minSearches),
      `seo-desk-topics-${deskToday()}.csv`
    );
  }),
  get('/api/export/link-suggestions.csv', (ctx) => {
    const model = buildModel();
    sendText(
      ctx,
      'text/csv; charset=utf-8',
      suggestionsCsv(model, pageParam(ctx)),
      `seo-desk-link-suggestions-${deskToday()}.csv`
    );
  }),
];
