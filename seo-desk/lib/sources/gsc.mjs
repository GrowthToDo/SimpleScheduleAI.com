// Search Console pulls and normalisers. Pure normalisers first, then the pull.
//
// The server returns rows either as flat named fields ({query, page, date, ...})
// or as {keys: [...]}; normGscRows accepts both. Pages fold the same way the
// monthly diagnose script folds them (#heading and trailing slash dropped, site
// prefix removed), so /blog/x, /blog/x/ and /blog/x#h are one page.

import { openServer, McpError } from '../mcp-client.mjs';
import { mergeDaily } from '../store.mjs';
import { windows } from '../dates.mjs';
import { pathOf } from '../../../scripts/lib/gsc-diagnose-core.mjs';

export const GSC_SITE_URL = 'https://simplescheduleai.com/';

const round2 = (n) => Math.round(n * 100) / 100;

function dimsOf(dims) {
  return (Array.isArray(dims) ? dims : String(dims).split(',')).map((d) => d.trim()).filter(Boolean);
}

// Raw rows to one row per distinct dimension combination. Clicks and impressions
// sum; position is the impression-weighted mean. Output keys: the dimensions,
// then clicks, impressions, position.
export function normGscRows(rows, dims) {
  const dimList = dimsOf(dims);
  const map = new Map();
  for (const r of rows || []) {
    const vals = {};
    let skip = false;
    dimList.forEach((d, i) => {
      let v = r[d] !== undefined ? r[d] : r.keys?.[i];
      if (d === 'page') v = pathOf(v);
      if (v === undefined || v === null || v === '') skip = true;
      vals[d] = v;
    });
    if (skip) continue;
    const key = dimList.map((d) => vals[d]).join('\u0000');
    if (!map.has(key)) map.set(key, { vals, clicks: 0, impressions: 0, posWeighted: 0 });
    const acc = map.get(key);
    const imp = Number(r.impressions) || 0;
    acc.clicks += Number(r.clicks) || 0;
    acc.impressions += imp;
    acc.posWeighted += (Number(r.position) || 0) * imp;
  }
  return [...map.values()].map(({ vals, clicks, impressions, posWeighted }) => ({
    ...vals,
    clicks,
    impressions,
    position: impressions ? round2(posWeighted / impressions) : 0,
  }));
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

// {today, session?, signal?} -> snapshot of the performance numbers only; index checks are
// their own source (sources/index.mjs). An McpError propagates. A session passed in is left
// open for the caller; otherwise one is opened here, closed at the end, and killed if the
// refresh engine aborts the signal.
export async function pullGsc({ today, session, signal, open = openServer } = {}) {
  const own = !session;
  const s = session || (await open('google-search-console', { signal }));
  try {
    const w = windows(today);
    const pull = (dimensions, range, rowLimit) =>
      rowsFor(s, { dimensions, start: range.start, end: range.end, rowLimit });

    const siteDaily = await pull('date', w.d480, 1000);
    const pageDaily = await pull('page,date', w.d120, 25000);
    const qpCur = await pull('query,page', w.cur, 5000);
    const qpPrev = await pull('query,page', w.prev, 5000);
    const qp90 = await pull('query,page', w.d90, 5000);
    const queryCur = await pull('query', w.cur, 5000);
    const queryPrev = await pull('query', w.prev, 5000);
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
        countries,
        devices,
        windows: { cur: w.cur, prev: w.prev, d90: w.d90 },
      },
    };
  } finally {
    if (own) s.close();
  }
}
