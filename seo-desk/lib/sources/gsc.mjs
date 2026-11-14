// Search Console pulls and normalisers. Pure normalisers first, then the pull.
//
// The server returns rows either as flat named fields ({query, page, date, ...})
// or as {keys: [...]}; normGscRows accepts both. Pages fold the same way the
// monthly diagnose script folds them (#heading and trailing slash dropped, site
// prefix removed), so /blog/x, /blog/x/ and /blog/x#h are one page.

import { openServer, McpError } from '../mcp-client.mjs';
import { mergeDaily } from '../store.mjs';
import { windows, windowsEnding } from '../dates.mjs';
import { pathOf } from '../../../scripts/lib/gsc-diagnose-core.mjs';

export const GSC_SITE_URL = 'https://simplescheduleai.com/';

const round2 = (n) => Math.round(n * 100) / 100;

function dimsOf(dims) {
  return (Array.isArray(dims) ? dims : String(dims).split(',')).map((d) => d.trim()).filter(Boolean);
}

// Raw rows to one row per distinct dimension combination. Output keys: the dimensions, then
// clicks, impressions, position.
//
// Rows that are the same apart from the address form of one page (/blog/x, /blog/x/, /blog/x#part)
// fold into one. Without a search among the dimensions their clicks and impressions add up and the
// position is the impression-weighted mean. With a search, one showing of that search can list
// several forms of the page at once, so adding them would count it more than once: the folded row
// takes the LARGEST impressions among the forms, adds the clicks (a click lands on one address),
// and takes the position of the form with the most impressions.
export function normGscRows(rows, dims) {
  const dimList = dimsOf(dims);
  const perSearch = dimList.includes('query') && dimList.includes('page');
  const map = new Map();
  for (const r of rows || []) {
    const vals = {};
    let skip = false;
    let raw = '';
    dimList.forEach((d, i) => {
      let v = r[d] !== undefined ? r[d] : r.keys?.[i];
      if (d === 'page') {
        raw = String(v ?? '');
        v = pathOf(v);
      }
      if (v === undefined || v === null || v === '') skip = true;
      vals[d] = v;
    });
    if (skip) continue;
    const key = dimList.map((d) => vals[d]).join('\u0000');
    if (!map.has(key)) map.set(key, { vals, forms: new Map() });
    const forms = map.get(key).forms;
    const formKey = perSearch ? raw : '';
    if (!forms.has(formKey)) forms.set(formKey, { clicks: 0, impressions: 0, posWeighted: 0 });
    const acc = forms.get(formKey);
    const imp = Number(r.impressions) || 0;
    acc.clicks += Number(r.clicks) || 0;
    acc.impressions += imp;
    acc.posWeighted += (Number(r.position) || 0) * imp;
  }
  return [...map.values()].map(({ vals, forms }) => {
    const list = [...forms.values()];
    const top = list.reduce((a, b) => (b.impressions > a.impressions ? b : a));
    const clicks = list.reduce((s, f) => s + f.clicks, 0);
    return {
      ...vals,
      clicks,
      impressions: top.impressions,
      position: top.impressions ? round2(top.posWeighted / top.impressions) : 0,
    };
  });
}

// "2026-11-09 02:17" or ISO to 'YYYY-MM-DD'; null when there is no real date.
function crawlDate(v) {
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(String(v ?? ''));
  return m && !m[1].startsWith('1970') ? m[1] : null;
}

// One inspection result to {page, verdict, reason, lastCrawl}. verdict is
// 'indexed', 'not-indexed' (reason = Google's coverage state) or 'unknown'.
export function normIndex(raw) {
  const page = pathOf(raw?.url ?? raw?.page_url ?? raw?.page ?? '');
  const lastCrawl = crawlDate(raw?.last_crawled ?? raw?.lastCrawl);
  const coverage = String(raw?.coverage_state ?? raw?.coverage ?? '').trim();
  const verdict = String(raw?.verdict ?? '').toUpperCase();
  const base = { page, lastCrawl };
  if (raw?.error) return { ...base, verdict: 'unknown', reason: String(raw.error).slice(0, 200) };
  if (/\bnot indexed\b|unknown to google/i.test(coverage)) return { ...base, verdict: 'not-indexed', reason: coverage };
  if (/\bindexed\b/i.test(coverage) || (!coverage && verdict === 'PASS'))
    return { ...base, verdict: 'indexed', reason: '' };
  if (coverage) return { ...base, verdict: 'not-indexed', reason: coverage };
  return { ...base, verdict: 'unknown', reason: verdict ? `Verdict ${verdict}, no coverage state` : 'No result' };
}

async function rowsFor(session, { dimensions, start, end, rowLimit }) {
  const data = await session.call('get_advanced_search_analytics', {
    site_url: GSC_SITE_URL,
    start_date: start,
    end_date: end,
    dimensions,
    search_type: 'WEB',
    row_limit: rowLimit,
    sort_by: 'impressions',
    sort_direction: 'descending',
    data_state: 'final',
  });
  const rows = Array.isArray(data) ? data : data?.rows;
  if (!Array.isArray(rows)) throw new McpError(`Search Console pull (${dimensions}) returned no rows array.`);
  return normGscRows(rows, dimensions);
}

// ---------------------------------------------------------------- the end date

// The newest date that has a row, never later than `max`; null when no row qualifies.
export function newestDate(rows, max = null) {
  let out = null;
  for (const r of rows || []) {
    const d = r?.date;
    if (!d || (max && d > max)) continue;
    if (out === null || d > out) out = d;
  }
  return out;
}

// The last day the stored Search Console numbers really reach: `through`, held back to the newest
// day the site's daily rows hold. A snapshot pulled before the pull checked this can say a day
// that Search Console had not finished yet; the windows built from it would then count an empty
// day. With no daily rows, `through` stands.
export function gscEnd(gsc, through) {
  const newest = newestDate(gsc?.siteDaily, through ?? null);
  if (!through) return newest;
  return newest && newest < through ? newest : through;
}

// A Search Console snapshot read from disk, with `through` and the ends of the stored windows held
// to gscEnd. The stored aggregates of an older snapshot were pulled up to the old end; the day cut
// off has no daily row, so it held nothing and the shorter label is the true one.
export function capSnapshot(snap) {
  const data = snap?.data;
  if (!data || !snap.through) return snap;
  const end = gscEnd(data, snap.through);
  if (!end || end >= snap.through) return snap;
  const cap = (w) => (w?.end && w.end > end && w.start <= end ? { ...w, end } : w);
  const win = data.windows;
  return {
    ...snap,
    through: end,
    data: { ...data, ...(win ? { windows: { ...win, cur: cap(win.cur), d90: cap(win.d90) } } : {}) },
  };
}

// {today, session?, signal?} -> snapshot of the performance numbers only; index checks are
// their own source (sources/index.mjs). An McpError propagates. A session passed in is left
// open for the caller; otherwise one is opened here, closed at the end, and killed if the
// refresh engine aborts the signal.
//
// The site's daily rows are pulled first. Only finished days come back, and "today minus 3" on
// this machine can be a day Search Console has not finished, so the end of everything is the newest
// day with a row. Every other pull asks for windows built from that day, so a date label and the
// numbers under it always cover the same days.
export async function pullGsc({ today, session, signal, open = openServer } = {}) {
  const own = !session;
  const s = session || (await open('google-search-console', { signal }));
  try {
    const asked = windows(today);
    const pull = (dimensions, range, rowLimit) =>
      rowsFor(s, { dimensions, start: range.start, end: range.end, rowLimit });

    const siteDaily = await pull('date', asked.d480, 1000);
    const w = windowsEnding(newestDate(siteDaily, asked.cur.end) ?? asked.cur.end);
    const pageDaily = await pull('page,date', w.d120, 25000);
    const qpCur = await pull('query,page', w.cur, 5000);
    const qpPrev = await pull('query,page', w.prev, 5000);
    const qp90 = await pull('query,page', w.d90, 5000);
    const queryCur = await pull('query', w.cur, 5000);
    const queryPrev = await pull('query', w.prev, 5000);
    // Searches alone over 90 days: the real number of times each search showed the site. The query
    // and page rows count a search once for every page it showed, so their sum is not that number.
    const query90 = await pull('query', w.d90, 5000);
    const countries = (await pull('country', w.cur, 250)).map(({ country, clicks, impressions }) => ({
      country,
      clicks,
      impressions,
    }));
    const devices = (await pull('device', w.cur, 10)).map(({ device, clicks, impressions }) => ({
      device,
      clicks,
      impressions,
    }));

    const mergedSite = mergeDaily('history/gsc-site.json', siteDaily, (r) => r.date);
    mergeDaily('history/gsc-page.json', pageDaily, (r) => `${r.date}|${r.page}`);

    return {
      source: 'gsc',
      ok: true,
      status: 'fresh',
      pulledAt: new Date().toISOString(),
      through: w.cur.end,
      error: null,
      data: {
        siteDaily: mergedSite,
        pageDaily,
        qpCur,
        qpPrev,
        qp90,
        queryCur,
        queryPrev,
        query90,
        countries,
        devices,
        windows: { cur: w.cur, prev: w.prev, d90: w.d90 },
      },
    };
  } finally {
    if (own) s.close();
  }
}
