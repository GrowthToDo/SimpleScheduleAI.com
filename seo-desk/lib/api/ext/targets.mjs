// Routes for keyword management: the targeted, discovered and ignored lists, adopting, ignoring,
// editing, the CSV import and export.

import { groupByQuery } from '../../../../scripts/lib/gsc-diagnose-core.mjs';
import {
  PRIORITIES,
  MAX_KEYWORD_LENGTH,
  MIN_DISCOVERED_IMPRESSIONS,
  discovered,
  labelTarget,
  intentConflicts,
  parseKeywordCsv,
  loadTargets,
  saveTargets,
  norm,
  foldPage,
} from '../../targets.mjs';
import { buildModel, envelope, invalidate, linksFor } from '../model.mjs';
import { toCsv } from '../csv.mjs';
import { bad, get, post, put, del, q, bodyOf, sendText } from '../kit.mjs';

export const TABS = ['targeted', 'discovered', 'ignored'];
export const IMPORT_MAX_BYTES = 2 * 1024 * 1024;
const MAX_ITEMS = 200;
const MAX_GROUP = 60;
export const MAX_ADOPTED = 2000;
export const MAX_IGNORED = 5000;
const MAX_WHY = 160;

// A reason shown to the person: kept to one short line however long the keyword in it was.
const why = (text) => (text.length > MAX_WHY ? `${text.slice(0, MAX_WHY - 3)}...` : text);
const skip = (keyword, text) => ({ keyword, why: why(text) });

// ---------------------------------------------------------------- reading the data

const round1 = (n) => Math.round(n * 10) / 10;

// Position and impressions for a search: the Search Console query table first (as the Search page
// does), then the query and page rows.
function statsMap(gsc) {
  const m = new Map();
  for (const r of gsc?.queryCur ?? [])
    m.set(norm(r.query), { position: round1(r.position), impressions: r.impressions });
  for (const g of groupByQuery(gsc?.qpCur ?? []))
    if (!m.has(norm(g.query))) m.set(norm(g.query), { position: round1(g.position), impressions: g.impressions });
  return m;
}

function rankingPageOf(keyword, qpCur) {
  const byPage = new Map();
  for (const r of qpCur) {
    if (norm(r.query) !== norm(keyword)) continue;
    const p = foldPage(r.page);
    byPage.set(p, (byPage.get(p) ?? 0) + (r.impressions || 0));
  }
  const top = [...byPage.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
  return top ? top[0] : null;
}

const liveSet = (model) => new Set((model.data.local?.livePages ?? []).map((p) => foldPage(p.page)));

function rowOf(t, { stats, qpCur, label = true }) {
  const s = stats.get(norm(t.keyword));
  return {
    keyword: t.keyword,
    page: t.page ?? null,
    priority: t.priority ?? null,
    intentGroup: t.intentGroup ?? null,
    origin: t.origin,
    position: s?.position ?? null,
    impressions: s?.impressions ?? 0,
    rankingPage: rankingPageOf(t.keyword, qpCur),
    label: label ? labelTarget(t, qpCur) : null,
    ...(t.addedOn ? { addedOn: t.addedOn } : {}),
    ...(t.source ? { source: t.source } : {}),
    links: linksFor(t.page ? foldPage(t.page) : null),
  };
}

export function targetRows(model) {
  const gsc = model.data.gsc;
  const qpCur = gsc?.qpCur ?? [];
  const stats = statsMap(gsc);
  const state = model.targetState;
  const byKeyword = new Map(state.adopted.map((a) => [norm(a.keyword), a]));
  const rows = model.targets.map((t) => {
    const extra = byKeyword.get(norm(t.keyword));
    return rowOf(t.origin === 'adopted' && extra ? { ...t, addedOn: extra.addedOn, source: extra.source } : t, {
      stats,
      qpCur,
    });
  });
  return { rows, stats, qpCur };
}

export function discoveredList(model) {
  return discovered({
    qpCur: model.data.gsc?.qpCur ?? [],
    targets: model.targets,
    ignored: model.targetState.ignored,
    brands: model.brands,
  });
}

// ---------------------------------------------------------------- writing

function mutate(fn) {
  const state = loadTargets();
  const result = fn(state);
  saveTargets(state);
  invalidate();
  return result;
}

const keywordList = (v, what) => {
  if (!Array.isArray(v) || v.length < 1 || v.length > MAX_ITEMS)
    throw bad(`${what} must be a list of 1 to ${MAX_ITEMS} search phrases.`);
  const out = v.map((k) => (typeof k === 'string' ? k.trim() : ''));
  if (out.some((k) => !k || k.length > MAX_KEYWORD_LENGTH))
    throw bad(`Each search phrase must be 1 to ${MAX_KEYWORD_LENGTH} characters.`);
  return out;
};

// undefined when the field is absent, null to clear it, otherwise high, medium or low.
function priorityOf(v) {
  if (v === undefined) return undefined;
  if (v === null || v === '') return null;
  if (!PRIORITIES.includes(v)) throw bad(`priority must be one of: ${PRIORITIES.join(', ')}.`);
  return v;
}

function groupOf(v) {
  if (v === undefined) return undefined;
  if (v === null) return null;
  if (typeof v !== 'string' || v.trim().length > MAX_GROUP)
    throw bad(`intentGroup must be text of at most ${MAX_GROUP} characters.`);
  return v.trim() || null;
}

function livePageOf(model, page) {
  if (typeof page !== 'string' || !page.trim()) throw bad('Each keyword needs a page.');
  const p = foldPage(page);
  if (!liveSet(model).has(p)) throw bad(`${p} is not a live page on the site, so it cannot be a target page.`);
  return p;
}

const LABEL_TEXT = {
  'right page': 'Right page ranks',
  'ranks elsewhere': 'Another page ranks',
  'not returned': 'Not returned by Google',
  'partial evidence': 'Too few impressions to say',
};
const ORIGIN_TEXT = { registry: 'Your keyword file', adopted: 'Added in the desk' };

// ---------------------------------------------------------------- routes

export const routes = [
  get('/api/targets', (ctx) => {
    const tab = q(ctx, 'tab') || 'targeted';
    if (!TABS.includes(tab)) throw bad(`tab must be one of: ${TABS.join(', ')}.`);
    const model = buildModel();
    const { rows: targeted, stats, qpCur } = targetRows(model);
    const found = discoveredList(model);
    const ignored = model.targetState.ignored;
    let rows;
    if (tab === 'targeted') rows = targeted;
    else if (tab === 'discovered')
      rows = found.map((d) => ({
        keyword: d.query,
        page: d.rankingPage,
        priority: null,
        intentGroup: null,
        origin: 'discovered',
        position: d.position,
        impressions: d.impressions,
        rankingPage: d.rankingPage,
        label: null,
        links: linksFor(d.rankingPage),
      }));
    else
      rows = ignored.map((k) =>
        rowOf(
          { keyword: k, page: null, priority: null, intentGroup: null, origin: 'ignored' },
          { stats, qpCur, label: false }
        )
      );
    return {
      ...envelope(model, { need: ['gsc'] }),
      tab,
      rows,
      counts: {
        targeted: targeted.length,
        discovered: found.length,
        ignored: ignored.length,
        secondary: model.targetState.secondary.length,
      },
      // Searches adopted as secondary keywords of a page (from the Secondary keywords page), newest
      // first, so they can be seen and removed here.
      secondary: [...model.targetState.secondary].sort(
        (a, b) => String(b.addedOn ?? '').localeCompare(String(a.addedOn ?? '')) || a.keyword.localeCompare(b.keyword)
      ),
      conflicts: intentConflicts(model.targets),
      priorities: PRIORITIES,
      minImpressions: MIN_DISCOVERED_IMPRESSIONS,
    };
  }),

  post('/api/targets/adopt', async (ctx) => {
    const body = await bodyOf(ctx);
    const items = body.items;
    if (!Array.isArray(items) || items.length < 1 || items.length > MAX_ITEMS)
      throw bad(`items must be a list of 1 to ${MAX_ITEMS} keywords to adopt.`);
    const model = buildModel();
    // Check every item first, so a bad one changes nothing.
    const clean = items.map((it) => {
      if (!it || typeof it !== 'object') throw bad('Each item must have a keyword and a page.');
      const keyword = typeof it.keyword === 'string' ? it.keyword.trim() : '';
      if (!keyword || keyword.length > MAX_KEYWORD_LENGTH)
        throw bad(`Each keyword must be 1 to ${MAX_KEYWORD_LENGTH} characters.`);
      return {
        keyword: norm(keyword),
        page: livePageOf(model, it.page),
        priority: priorityOf(it.priority) ?? null,
        intentGroup: groupOf(it.intentGroup) ?? null,
      };
    });
    return mutate((state) => {
      const have = new Set(model.targets.map((t) => norm(t.keyword)));
      const skipped = [];
      let adopted = 0;
      for (const c of clean) {
        if (have.has(c.keyword)) {
          skipped.push(skip(c.keyword, 'That keyword is already a target.'));
          continue;
        }
        have.add(c.keyword);
        if (state.adopted.length >= MAX_ADOPTED)
          throw bad(`The desk keeps at most ${MAX_ADOPTED.toLocaleString('en-US')} added keywords. Remove some first.`);
        state.adopted.push({ ...c, source: 'discovered', addedOn: model.today });
        state.ignored = state.ignored.filter((k) => k !== c.keyword);
        adopted++;
      }
      return { adopted, skipped };
    });
  }),

  post('/api/targets/ignore', async (ctx) => {
    const keywords = keywordList((await bodyOf(ctx)).keywords, 'keywords').map(norm);
    return mutate((state) => {
      const next = [...new Set([...state.ignored, ...keywords])];
      if (next.length > MAX_IGNORED)
        throw bad(
          `The desk keeps at most ${MAX_IGNORED.toLocaleString('en-US')} ignored keywords. Restore some first.`
        );
      state.ignored = next;
      return { ignored: state.ignored.length };
    });
  }),

  post('/api/targets/restore', async (ctx) => {
    const keywords = new Set(keywordList((await bodyOf(ctx)).keywords, 'keywords').map(norm));
    return mutate((state) => {
      state.ignored = state.ignored.filter((k) => !keywords.has(k));
      return { ignored: state.ignored.length };
    });
  }),

  put('/api/targets', async (ctx) => {
    const body = await bodyOf(ctx);
    const keyword = typeof body.keyword === 'string' ? norm(body.keyword) : '';
    if (!keyword) throw bad('keyword is required.');
    const priority = priorityOf(body.priority);
    const group = groupOf(body.intentGroup);
    if (priority === undefined && body.page === undefined && group === undefined)
      throw bad('There is nothing to change. Send a priority, a page or a search group.');
    const model = buildModel();
    const target = model.targets.find((t) => norm(t.keyword) === keyword);
    if (!target) throw Object.assign(new Error('That keyword is not a target.'), { status: 404 });
    if (target.origin === 'registry') {
      if (body.page !== undefined && foldPage(body.page) !== foldPage(target.page))
        throw bad('A keyword from your keyword file keeps its page. Only its priority can change here.');
      if (group !== undefined && group !== null)
        throw bad('A keyword from your keyword file has no search group here. Only its priority can change.');
      return mutate((state) => {
        if (priority === undefined) return { keyword: target.keyword, priority: target.priority };
        if (priority === null) delete state.priorities[keyword];
        else state.priorities[keyword] = priority;
        return { keyword: target.keyword, priority };
      });
    }
    const page = body.page === undefined ? undefined : livePageOf(model, body.page);
    return mutate((state) => {
      const row = state.adopted.find((a) => norm(a.keyword) === keyword);
      if (page !== undefined) row.page = page;
      if (priority !== undefined) row.priority = priority;
      if (group !== undefined) row.intentGroup = group;
      return { keyword: row.keyword, page: row.page, priority: row.priority, intentGroup: row.intentGroup };
    });
  }),

  del('/api/targets', async (ctx) => {
    const body = await bodyOf(ctx);
    const keyword = typeof body.keyword === 'string' ? norm(body.keyword) : '';
    if (!keyword) throw bad('keyword is required.');
    const target = buildModel().targets.find((t) => norm(t.keyword) === keyword);
    if (!target) throw Object.assign(new Error('That keyword is not a target.'), { status: 404 });
    if (target.origin === 'registry')
      throw bad(
        'A keyword from your keyword file cannot be removed here. Change it in docs/seo/keyword-registry.json.'
      );
    return mutate((state) => {
      state.adopted = state.adopted.filter((a) => norm(a.keyword) !== keyword);
      return { removed: target.keyword };
    });
  }),

  // Removes one secondary keyword (a search adopted as secondary on one page). Nothing else changes.
  del('/api/targets/secondary', async (ctx) => {
    const body = await bodyOf(ctx);
    const keyword = typeof body.keyword === 'string' ? norm(body.keyword) : '';
    const page = typeof body.page === 'string' && body.page.startsWith('/') ? foldPage(body.page) : '';
    if (!keyword || !page) throw bad('keyword and page are required.');
    const have = buildModel().targetState.secondary.some((x) => norm(x.keyword) === keyword && x.page === page);
    if (!have) throw Object.assign(new Error('That is not a secondary keyword of that page.'), { status: 404 });
    return mutate((state) => {
      state.secondary = state.secondary.filter((x) => !(norm(x.keyword) === keyword && x.page === page));
      return { removed: keyword, page, secondary: state.secondary.length };
    });
  }),

  post('/api/targets/import', async (ctx) => {
    const text = await ctx.rawBody(IMPORT_MAX_BYTES);
    const parsed = parseKeywordCsv(text);
    const model = buildModel();
    const live = liveSet(model);
    const qpCur = model.data.gsc?.qpCur ?? [];
    const have = new Set(model.targets.map((t) => norm(t.keyword)));
    const skipped = parsed.skipped.map((x) => ({ ...x, why: why(x.why) }));
    const take = [];
    for (const r of parsed.rows) {
      const k = norm(r.keyword);
      if (have.has(k)) {
        skipped.push(skip(r.keyword, 'That keyword is already a target.'));
        continue;
      }
      const page = r.page ?? rankingPageOf(r.keyword, qpCur);
      if (!page) {
        skipped.push(skip(r.keyword, 'No page was given and the search does not rank on any page yet.'));
        continue;
      }
      if (!live.has(foldPage(page))) {
        skipped.push(skip(r.keyword, `${foldPage(page)} is not a live page on the site.`));
        continue;
      }
      have.add(k);
      take.push({
        keyword: k,
        page: foldPage(page),
        priority: r.priority,
        intentGroup: null,
        source: 'import',
        volume: r.volume,
        addedOn: model.today,
      });
    }
    return mutate((state) => {
      if (state.adopted.length + take.length > MAX_ADOPTED)
        throw bad(
          `This would take the desk past ${MAX_ADOPTED.toLocaleString('en-US')} added keywords. Remove some first or import fewer.`
        );
      const taken = new Set(take.map((t) => t.keyword));
      state.adopted.push(...take);
      state.ignored = state.ignored.filter((k) => !taken.has(k));
      return { imported: take.length, skipped };
    });
  }),

  get('/api/export/targets-all.csv', (ctx) => {
    const model = buildModel();
    const { rows } = targetRows(model);
    sendText(
      ctx,
      'text/csv; charset=utf-8',
      toCsv(
        [
          ['Keyword', (r) => r.keyword],
          ['Page', (r) => r.page],
          ['Priority', (r) => r.priority],
          ['Search group', (r) => r.intentGroup],
          ['Where it came from', (r) => ORIGIN_TEXT[r.origin] ?? r.origin],
          ['Position', (r) => r.position],
          ['Impressions', (r) => r.impressions],
          ['Page that ranks', (r) => r.rankingPage],
          ['Verdict', (r) => LABEL_TEXT[r.label] ?? r.label],
        ],
        rows
      ),
      `seo-desk-targets-all-${model.today}.csv`
    );
  }),
];
