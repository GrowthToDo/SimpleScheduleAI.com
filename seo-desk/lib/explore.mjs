// The Explorer: filtered and custom range pulls from Search Console, the ranking distribution
// and the detail of one search. Pure logic plus a small cache; the live call is injected
// (`call(tool, args)`), so nothing here opens a server. The routes in lib/api/ext/explore.mjs
// supply the real call.
//
// Click rate: never for searches (Google hides some clicks on rare searches); for pages only
// when the page has at least the click rate gate's impressions (settings LOW_CTR_MIN_IMP).

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { dataDir, readJson, writeJson } from './store.mjs';
import { addDays, daysBetween, END_LAG_DAYS } from './dates.mjs';
import { longRange } from './text.mjs';
import { THRESHOLDS, SITE } from './config.mjs';
import { GSC_SITE_URL, normGscRows } from './sources/gsc.mjs';
import { bad } from './api/kit.mjs';
import { movementOf } from './api/search.mjs';
import { coversFrom, pct } from './api/fmt.mjs';
import { groupByQuery } from '../../scripts/lib/gsc-diagnose-core.mjs';

const TOOL = 'get_advanced_search_analytics';
const MAX_ROWS = 25000;
const MAX_SPAN_DAYS = 480;
// Search Console keeps about 16 months; an earlier period starting before this is not there.
const HISTORY_DAYS = 485;
const TTL_MS = 12 * 3600 * 1000;
const KEEP_MS = 7 * 86400 * 1000;
export const MAX_ENTRIES = 200;
const CACHE_DIR = 'cache/explore';

const round2 = (n) => Math.round(n * 100) / 100;
const round3 = (n) => Math.round(n * 1000) / 1000;
const low = (s) => String(s ?? '').toLowerCase();
const nowMs = (now) => (now instanceof Date ? now.getTime() : Number.isFinite(Number(now)) ? Number(now) : Date.now());

// A search needs this many views before its pages get a share of it.
export const SHARE_MIN_VIEWS = 30;

// The change in times shown against the earlier period, null under the minimum base (pct) or
// when there is no earlier period. The pages never work a percentage out themselves.
const withChange = (rows, comparable) =>
  rows.map((r) => ({ ...r, change: comparable && r.prev ? pct(r.impressions, r.prev.impressions) : null }));

// Each page's share of one search's views, null for every page when the search has too few.
const withShares = (pages) => {
  const total = pages.reduce((s, r) => s + (Number(r.impressions) || 0), 0);
  return pages.map((r) => ({ ...r, share: total >= SHARE_MIN_VIEWS ? round3(r.impressions / total) : null }));
};

// ---------------------------------------------------------------- ranges

export const RANGE_OPTIONS = [
  { value: '7', label: 'Last 7 days' },
  { value: '14', label: 'Last 14 days' },
  { value: '28', label: 'Last 28 days' },
  { value: '90', label: 'Last 90 days' },
  { value: '480', label: 'Last 16 months' },
  { value: 'this-month', label: 'This month' },
  { value: 'last-month', label: 'Last month' },
  { value: 'last-quarter', label: 'Last quarter' },
  { value: 'custom', label: 'Custom range' },
];
const RANGE_SPECS = RANGE_OPTIONS.map((o) => o.value);
const LABEL_OF = Object.fromEntries(RANGE_OPTIONS.map((o) => [o.value, o.label]));

const validIso = (s) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(s))) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};
const firstOf = (y, m0) => new Date(Date.UTC(y, m0, 1)).toISOString().slice(0, 10);

// spec: '7' | 7 | '28' ... | 'this-month' | 'last-month' | 'last-quarter' | 'custom', or an object
// {range: 'custom', start, end}. Returns {start, end, prevStart, prevEnd, label, prevAvailable}.
// Every end is at most today minus 3 (Search Console runs behind). The period before is the same
// number of days directly before the start. prevAvailable is false when that period reaches back
// past the 16 months Search Console keeps.
export function resolveRange(spec, today) {
  const obj = spec && typeof spec === 'object' ? spec : { range: spec };
  const name = String(obj.range ?? obj.spec ?? '28').trim() || '28';
  if (!RANGE_SPECS.includes(name))
    throw bad(
      'Pick a range of 7, 14, 28 or 90 days, 16 months, this month, last month, last quarter, or a custom range.'
    );
  const latest = addDays(today, -END_LAG_DAYS);
  const y = Number(today.slice(0, 4));
  const m0 = Number(today.slice(5, 7)) - 1;
  let start;
  let end;
  let label = LABEL_OF[name];

  if (['7', '14', '28', '90', '480'].includes(name)) {
    end = latest;
    start = addDays(end, -(Number(name) - 1));
  } else if (name === 'this-month') {
    start = firstOf(y, m0);
    end = latest;
    if (end < start)
      throw bad('This month has no finished Search Console days yet. Pick last month or a number of days.');
  } else if (name === 'last-month') {
    start = firstOf(y, m0 - 1);
    end = addDays(firstOf(y, m0), -1);
  } else if (name === 'last-quarter') {
    const qStart = Math.floor(m0 / 3) * 3;
    start = firstOf(y, qStart - 3);
    end = addDays(firstOf(y, qStart), -1);
  } else {
    start = String(obj.start ?? '');
    end = String(obj.end ?? '');
    if (!validIso(start) || !validIso(end))
      throw bad('Give the start and end dates as year-month-day, for example 2026-10-01.');
    if (start > end) throw bad('The start date must be on or before the end date.');
    if (end > latest)
      throw bad(
        `The end date must be on or before ${longRange(latest, latest)}, because Search Console runs a few days behind.`
      );
    if (daysBetween(start, end) + 1 > MAX_SPAN_DAYS)
      throw bad(`That range is longer than ${MAX_SPAN_DAYS} days (about 16 months). Pick a shorter one.`);
    label = longRange(start, end);
  }
  if (end > latest) end = latest;
  const len = daysBetween(start, end) + 1;
  const prevEnd = addDays(start, -1);
  const prevStart = addDays(start, -len);
  return { start, end, prevStart, prevEnd, label, prevAvailable: prevStart >= addDays(today, -HISTORY_DAYS) };
}

// ---------------------------------------------------------------- names

// Three-letter codes (what Search Console returns) to two-letter codes for Intl.DisplayNames.
// Codes not in this table are shown upper-cased.
const ALPHA3 = (
  'usa:US can:CA phl:PH gbr:GB ind:IN sau:SA mys:MY sgp:SG cyp:CY esp:ES pak:PK tha:TH arg:AR aus:AU bel:BE bra:BR ' +
  'col:CO deu:DE egy:EG hrv:HR irl:IE jor:JO kaz:KZ kwt:KW nzl:NZ per:PE png:PG rou:RO slv:SV tto:TT zaf:ZA are:AE ' +
  'bgd:BD che:CH chl:CL chn:CN cze:CZ dnk:DK fra:FR grc:GR hkg:HK idn:ID isr:IL ita:IT jpn:JP ken:KE kor:KR mex:MX ' +
  'nga:NG nld:NL nor:NO pol:PL prt:PT qat:QA rus:RU swe:SE tur:TR twn:TW ukr:UA vnm:VN fin:FI aut:AT hun:HU lka:LK ' +
  'npl:NP gha:GH uga:UG tza:TZ zwe:ZW zmb:ZM mar:MA dza:DZ tun:TN irq:IQ omn:OM bhr:BH lbn:LB nam:NA bwa:BW ecu:EC ' +
  'ven:VE ury:UY pry:PY bol:BO cri:CR pan:PA gtm:GT dom:DO jam:JM pri:PR nic:NI hnd:HN est:EE ltu:LT lva:LV svk:SK ' +
  'svn:SI srb:RS bgr:BG isl:IS lux:LU mlt:MT mmr:MM khm:KH lao:LA mng:MN uzb:UZ geo:GE arm:AM aze:AZ blr:BY mda:MD ' +
  'alb:AL mkd:MK bih:BA irn:IR syr:SY yem:YE sdn:SD eth:ET som:SO ago:AO cmr:CM civ:CI sle:SL tjk:TJ kgz:KG xkk:XK'
)
  .split(' ')
  .map((p) => p.split(':'));
const A2 = new Map(ALPHA3);

let regionNames = null;
export function countryName(code) {
  const c = low(code);
  const two = A2.get(c);
  if (!two) return String(code ?? '').toUpperCase();
  try {
    regionNames ??= new Intl.DisplayNames(['en'], { type: 'region' });
    const n = regionNames.of(two);
    return n && n !== two ? n : String(code).toUpperCase();
  } catch {
    return String(code).toUpperCase();
  }
}

const DEVICE_NAMES = { DESKTOP: 'Computer', MOBILE: 'Phone', TABLET: 'Tablet' };
export const deviceName = (code) => DEVICE_NAMES[String(code ?? '').toUpperCase()] ?? String(code ?? '');

// ---------------------------------------------------------------- filters

const MODES = { contains: 'contains', exact: 'equals', excludes: 'notContains' };
const MODE_TEXT = { contains: 'contains', exact: 'is exactly', excludes: 'does not contain' };
const MAX_TEXT = 200;

function textFilter(dimension, label, value, modeIn, pageMode) {
  const v = String(value ?? '').trim();
  if (!v) return null;
  const mode = String(modeIn || 'contains').toLowerCase();
  if (!Object.hasOwn(MODES, mode)) throw bad(`The ${label} filter must be "contains", "exact" or "excludes".`);
  if (v.length > MAX_TEXT) throw bad(`The ${label} filter is too long. Keep it under ${MAX_TEXT} characters.`);
  let expression = v;
  if (pageMode && mode === 'exact') {
    if (/^https?:\/\//i.test(v)) expression = v;
    else if (v.startsWith('/')) expression = `${SITE}${v}`;
    else throw bad('For an exact page, type the full address or a path that starts with a slash, such as /pricing.');
  }
  return { mode, filter: { dimension, operator: MODES[mode], expression } };
}

function parseFilters({ q, qmode, page, pmode, country, device } = {}) {
  const out = [];
  const s = textFilter('query', 'search', q, qmode, false);
  if (s)
    out.push({ key: 'q', ...s, text: `Search ${MODE_TEXT[s.mode]} "${String(q).trim()}"`, params: ['q', 'qmode'] });
  const p = textFilter('page', 'page', page, pmode, true);
  if (p)
    out.push({
      key: 'page',
      ...p,
      text: `Page ${MODE_TEXT[p.mode]} "${String(page).trim()}"`,
      params: ['page', 'pmode'],
    });
  const c = String(country ?? '')
    .trim()
    .toLowerCase();
  if (c) {
    if (!/^[a-z]{3}$/.test(c)) throw bad('The country filter must be a three-letter code such as usa.');
    out.push({
      key: 'country',
      filter: { dimension: 'country', operator: 'equals', expression: c },
      text: `Country is ${countryName(c)}`,
      params: ['country'],
    });
  }
  const d = String(device ?? '')
    .trim()
    .toUpperCase();
  if (d) {
    if (!Object.hasOwn(DEVICE_NAMES, d))
      throw bad('The device filter must be computer (DESKTOP), phone (MOBILE) or TABLET.');
    out.push({
      key: 'device',
      filter: { dimension: 'device', operator: 'equals', expression: d },
      text: `Device is ${deviceName(d)}`,
      params: ['device'],
    });
  }
  return out;
}

// The filters for the Search Console tool: [{dimension, operator, expression}].
export const buildFilters = (params) => parseFilters(params).map((f) => f.filter);

// The removable chips for the screen: [{key, text, params}], params being the query string
// names that go when the chip is removed.
export const filterChips = (params) =>
  parseFilters(params).map(({ key, text, params: p }) => ({ key, text, params: p }));

// ---------------------------------------------------------------- errors

// One plain sentence for a failed pull. The error carries status 502.
export function pullFailure(e) {
  const msg = String(e?.message ?? e ?? '');
  let text = 'Search Console could not be reached just now, so this view could not be loaded.';
  if (/timed out|took too long/i.test(msg))
    text = 'Search Console took too long to answer, so this view could not be loaded.';
  else if (e?.kind === 'needs-sign-in')
    text = 'Search Console needs you to sign in again, so this view could not be loaded.';
  else if (e?.unreadable)
    text = 'Search Console sent back an answer the desk could not read, so this view could not be loaded.';
  return Object.assign(new Error(text), { status: 502, extra: { loadFailed: true } });
}

// ---------------------------------------------------------------- the cache

const keyOf = (params) => crypto.createHash('sha1').update(JSON.stringify(params)).digest('hex');

function cacheRead(key, now) {
  const e = readJson(`${CACHE_DIR}/${key}.json`, null);
  if (!e || typeof e.fetchedAt !== 'string' || !e.result) return null;
  const age = now - Date.parse(e.fetchedAt);
  return age >= 0 && age < TTL_MS ? e : null;
}

function cacheWrite(key, result, now) {
  const fetchedAt = new Date(now).toISOString();
  const file = `${key}.json`;
  writeJson(`${CACHE_DIR}/${file}`, { fetchedAt, result });
  // Pruned by file stats only (no file is opened): anything over 7 days old goes, and at most the
  // newest MAX_ENTRIES stay (the entry just written always stays).
  const dir = path.join(dataDir(), CACHE_DIR);
  try {
    const entries = [];
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.json') || f === file) continue;
      const full = path.join(dir, f);
      let mtime;
      try {
        mtime = fs.statSync(full).mtimeMs;
      } catch {
        continue; // deleted while this pass was running
      }
      if (now - mtime > KEEP_MS) fs.rmSync(full, { force: true });
      else entries.push({ full, mtime });
    }
    entries.sort((a, b) => b.mtime - a.mtime);
    for (const e of entries.slice(MAX_ENTRIES - 1)) fs.rmSync(e.full, { force: true });
  } catch {
    // the cache is only a speed-up
  }
  return fetchedAt;
}

// ---------------------------------------------------------------- pulls

async function pull(call, { dimensions, start, end, filters, rowLimit }) {
  let data;
  try {
    data = await call(TOOL, {
      site_url: GSC_SITE_URL,
      start_date: start,
      end_date: end,
      dimensions,
      search_type: 'WEB',
      row_limit: rowLimit,
      sort_by: 'impressions',
      sort_direction: 'descending',
      data_state: 'final',
      ...(filters?.length ? { filters: JSON.stringify(filters) } : {}),
    });
  } catch (e) {
    // A busy desk (status 429) already has its own plain sentence.
    throw e?.status === 429 ? e : pullFailure(e);
  }
  // The tool answers a filter that matches nothing with a sentence, not an empty list.
  if (typeof data === 'string' && /^No search analytics data found/i.test(data.trim())) return [];
  const rows = Array.isArray(data) ? data : data?.rows;
  if (!Array.isArray(rows)) throw pullFailure(Object.assign(new Error('unreadable'), { unreadable: true }));
  return normGscRows(rows, dimensions);
}

const checkLimit = (limit) => {
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_ROWS)
    throw bad(`The row limit must be a whole number from 1 to ${MAX_ROWS}.`);
};

// ---------------------------------------------------------------- explorer rows

const keyText = (dim, r) => String(r[dim]);
const matchKey = (dim, k) => (dim === 'query' ? low(k).trim() : k);

// Current and earlier rows (normalised, one per query or page) to the explorer's rows and totals.
// comparable false: no earlier period to hold them against, so there is no movement.
// truncated: the current rows were cut at the row limit, so an earlier row missing from them is
// not necessarily gone.
export function assemble({ dim, cur, prev, comparable, truncated, limit, ctrMin }) {
  const prevMap = new Map();
  if (comparable) for (const r of prev) prevMap.set(matchKey(dim, r[dim]), r);
  const seen = new Set();
  const prevOf = (p) => ({ clicks: p.clicks, impressions: p.impressions, position: p.impressions ? p.position : null });
  const ctrOf = (r) =>
    dim === 'page' ? { ctr: r.impressions >= ctrMin ? round3(r.clicks / r.impressions) : null } : {};

  const rows = cur.map((r) => {
    const k = matchKey(dim, r[dim]);
    seen.add(k);
    const p = prevMap.get(k) ?? null;
    return {
      key: keyText(dim, r),
      clicks: r.clicks,
      impressions: r.impressions,
      position: r.impressions ? r.position : null,
      ...ctrOf(r),
      prev: p ? prevOf(p) : null,
      movement: movementOf(r.impressions, p?.impressions ?? 0, comparable),
    };
  });
  if (comparable && !truncated) {
    for (const p of prev) {
      if (seen.has(matchKey(dim, p[dim])) || !(p.impressions > 0)) continue;
      rows.push({
        key: keyText(dim, p),
        clicks: 0,
        impressions: 0,
        position: null,
        ...(dim === 'page' ? { ctr: null } : {}),
        prev: prevOf(p),
        movement: 'gone',
      });
    }
  }
  rows.sort((a, b) => b.impressions - a.impressions || a.key.localeCompare(b.key));
  const sum = (list, f) => list.reduce((s, r) => s + (Number(r[f]) || 0), 0);
  return {
    rows: withChange(rows.slice(0, limit), comparable),
    totals: {
      count: cur.length,
      clicks: sum(cur, 'clicks'),
      impressions: sum(cur, 'impressions'),
      prev: comparable
        ? { count: prev.length, clicks: sum(prev, 'clicks'), impressions: sum(prev, 'impressions') }
        : null,
    },
    comparable,
    truncated: Boolean(truncated),
  };
}

// params: {dim: 'query'|'page', range (from resolveRange), filters (from buildFilters), limit}.
// deps: {call(tool, args), now, ctrMin}. Two live pulls (this period and the one before), cached
// for 12 hours by the whole request. A failed pull throws one plain sentence (status 502) and
// caches nothing.
export async function explore({ dim = 'query', range, filters = [], limit = 1000 } = {}, { call, now, ctrMin } = {}) {
  if (dim !== 'query' && dim !== 'page') throw bad('The list must be by search (query) or by page.');
  checkLimit(limit);
  if (!range?.start || !range?.end) throw bad('A date range is needed.');
  const gate = ctrMin ?? THRESHOLDS.LOW_CTR_MIN_IMP;
  const at = nowMs(now);
  const key = keyOf({
    k: 'explore',
    dim,
    start: range.start,
    end: range.end,
    prevStart: range.prevStart,
    prevEnd: range.prevEnd,
    filters,
    limit,
    gate,
  });
  const hit = cacheRead(key, at);
  // An entry saved by older code may lack the gated change, so it is worked out again here.
  if (hit)
    return {
      ...hit.result,
      rows: withChange(hit.result.rows ?? [], hit.result.comparable),
      cached: true,
      fetchedAt: hit.fetchedAt,
    };

  const withPrev = range.prevAvailable !== false;
  const [cur, prev] = await Promise.all([
    pull(call, { dimensions: dim, start: range.start, end: range.end, filters, rowLimit: limit }),
    withPrev
      ? pull(call, { dimensions: dim, start: range.prevStart, end: range.prevEnd, filters, rowLimit: MAX_ROWS })
      : Promise.resolve([]),
  ]);
  const result = {
    dim,
    range,
    filters,
    ...assemble({
      dim,
      cur,
      prev,
      comparable: withPrev,
      truncated: cur.length >= limit,
      limit,
      ctrMin: gate,
    }),
  };
  const fetchedAt = cacheWrite(key, result, at);
  return { ...result, cached: false, fetchedAt };
}

// ---------------------------------------------------------------- stored pulls

const STORED_LABEL = { 7: 'Last 7 days', 14: 'Last 14 days', 28: 'Last 28 days', 90: 'Last 90 days' };

function pagesFromDaily(pageDaily, start, end) {
  const map = new Map();
  for (const r of pageDaily) {
    if (r.date < start || r.date > end) continue;
    const a = map.get(r.page) ?? { page: r.page, clicks: 0, impressions: 0, w: 0 };
    a.clicks += r.clicks || 0;
    a.impressions += r.impressions || 0;
    a.w += (r.position || 0) * (r.impressions || 0);
    map.set(r.page, a);
  }
  return [...map.values()].map(({ page, clicks, impressions, w }) => ({
    page,
    clicks,
    impressions,
    position: impressions ? round2(w / impressions) : 0,
  }));
}

// The same result as explore() from the stored Search Console pulls, with no live call. Only for
// views with no filters: searches for the last 28 or 90 days, pages for the last 7, 14, 28 or 90
// days. Null when the stored data cannot answer. The range is the stored period, so its dates
// are the pull's, not necessarily "today minus 3".
export function storedExplore(gsc, { through, dim, days, limit = 1000, ctrMin } = {}) {
  if (!gsc || !STORED_LABEL[days]) return null;
  const gate = ctrMin ?? THRESHOLDS.LOW_CTR_MIN_IMP;
  const label = STORED_LABEL[days];
  const w = gsc.windows;
  let cur;
  let prev = [];
  let range;
  let comparable = false;
  if (dim === 'query' && days === 28 && w?.cur && Array.isArray(gsc.queryCur)) {
    cur = gsc.queryCur;
    prev = gsc.queryPrev ?? [];
    comparable = Array.isArray(gsc.queryPrev);
    range = { start: w.cur.start, end: w.cur.end, prevStart: w.prev.start, prevEnd: w.prev.end };
  } else if (dim === 'query' && days === 90 && w?.d90 && Array.isArray(gsc.qp90)) {
    cur = groupByQuery(gsc.qp90).map((q) => ({
      query: q.query,
      clicks: q.clicks,
      impressions: q.impressions,
      position: q.position,
    }));
    range = { start: w.d90.start, end: w.d90.end, prevStart: null, prevEnd: null };
  } else if (dim === 'page' && Array.isArray(gsc.pageDaily) && gsc.pageDaily.length && through) {
    const start = addDays(through, -(days - 1));
    const prevStart = addDays(start, -days);
    const prevEnd = addDays(start, -1);
    cur = pagesFromDaily(gsc.pageDaily, start, through);
    comparable = coversFrom(gsc.pageDaily, prevStart);
    prev = comparable ? pagesFromDaily(gsc.pageDaily, prevStart, prevEnd) : [];
    range = { start, end: through, prevStart: comparable ? prevStart : null, prevEnd: comparable ? prevEnd : null };
  } else {
    return null;
  }
  const truncated = cur.length > limit;
  return {
    dim,
    range: { ...range, label, prevAvailable: comparable },
    filters: [],
    ...assemble({ dim, cur, prev, comparable, truncated, limit, ctrMin: gate }),
    cached: false,
  };
}

// ---------------------------------------------------------------- ranking distribution

export const BUCKETS = ['1 to 3', '4 to 10', '11 to 20', '21 to 50', '51 and beyond'];

const bucketOf = (pos) => (pos <= 3 ? 0 : pos <= 10 ? 1 : pos <= 20 ? 2 : pos <= 50 ? 3 : 4);

// Counts of searches by the place they appear in, this period against the period before. A search
// counts once, at its impression weighted place (rows sharing a key are merged that way). The
// earlier counts are null when no earlier period was pulled (comparable false; without that
// option, when no row carries one), and 0 when it was pulled and held no searches. Positions are used as given, so 3.01
// is place 4 to 10 and 3.0 is place 1 to 3.
export function distribution(rows, { comparable } = {}) {
  const merge = (pick) => {
    const map = new Map();
    for (const r of rows ?? []) {
      const v = pick(r);
      if (!v || !(v.impressions > 0) || !(v.position > 0)) continue;
      const k = low(r.key).trim();
      const a = map.get(k) ?? { imp: 0, w: 0 };
      a.imp += v.impressions;
      a.w += v.position * v.impressions;
      map.set(k, a);
    }
    return [...map.values()].map((a) => a.w / a.imp);
  };
  const count = (positions) => {
    const out = [0, 0, 0, 0, 0];
    for (const p of positions) out[bucketOf(p)] += 1;
    return out;
  };
  const now = count(merge((r) => r));
  // comparable says whether an earlier period was pulled at all; when it did and found nothing the
  // earlier counts are 0, not null.
  const hasPrev = typeof comparable === 'boolean' ? comparable : (rows ?? []).some((r) => r.prev);
  const before = count(merge((r) => r.prev));
  return BUCKETS.map((bucket, i) => ({ bucket, count: now[i], prevCount: hasPrev ? before[i] : null }));
}

// ---------------------------------------------------------------- one search

// The daily numbers and the pages that serve one exact search: two live pulls (by date, by page),
// both held to that search. Cached like explore().
export async function searchDetail(query, range, { call, now } = {}) {
  const text = String(query ?? '').trim();
  if (!text) throw bad('Give the search to look at.');
  if (text.length > 300) throw bad('That search is too long.');
  if (!range?.start || !range?.end) throw bad('A date range is needed.');
  const at = nowMs(now);
  const key = keyOf({ k: 'detail', query: low(text), start: range.start, end: range.end });
  const hit = cacheRead(key, at);
  // Shares are worked out again on a cached answer, so one saved by older code is gated too.
  if (hit) return { ...hit.result, pages: withShares(hit.result.pages ?? []), cached: true, fetchedAt: hit.fetchedAt };

  const filters = [{ dimension: 'query', operator: 'equals', expression: low(text) }];
  const [days, pages] = await Promise.all([
    pull(call, { dimensions: 'date', start: range.start, end: range.end, filters, rowLimit: 1000 }),
    pull(call, { dimensions: 'page', start: range.start, end: range.end, filters, rowLimit: 1000 }),
  ]);
  const result = {
    query: text,
    range,
    series: days
      .map((r) => ({
        date: r.date,
        impressions: r.impressions,
        clicks: r.clicks,
        position: r.impressions ? r.position : null,
      }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    pages: withShares(
      pages.map((r) => ({
        page: r.page,
        impressions: r.impressions,
        clicks: r.clicks,
        position: r.impressions ? r.position : null,
      }))
    ).sort((a, b) => b.impressions - a.impressions || a.page.localeCompare(b.page)),
  };
  const fetchedAt = cacheWrite(key, result, at);
  return { ...result, cached: false, fetchedAt };
}
