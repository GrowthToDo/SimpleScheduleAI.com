// Bing Webmaster pulls and normalisers.
//
// The Bing server returns list results as one row object per content item, with
// the rows array in structuredContent.result. session.call must hand back that
// array; a single object means the MCP client dropped the rest, and the pull
// fails loudly instead of quietly keeping one row.

import { openServer, McpError } from '../mcp-client.mjs';
import { mergeDaily } from '../store.mjs';
import { windows } from '../dates.mjs';
import { longRange } from '../text.mjs';
import { pathOf } from '../../../scripts/lib/gsc-diagnose-core.mjs';

export const BING_SITE_URL = 'https://simplescheduleai.com/';
const PAGE_SIZE = 500;
const MAX_PAGES = 50;
const round2 = (n) => Math.round(n * 100) / 100;

// '/Date(1730419200000)/' (also with a '+0000' offset) or an ISO string to
// 'YYYY-MM-DD'. Null when it is neither.
export function parseBingDate(v) {
  const s = String(v ?? '').trim();
  const ms = /^\/Date\((-?\d+)(?:[+-]\d{4})?\)\/$/.exec(s);
  if (ms) return new Date(Number(ms[1])).toISOString().slice(0, 10);
  const iso = /^(\d{4}-\d{2}-\d{2})/.exec(s);
  return iso ? iso[1] : null;
}

const rowsIn = (raw) => (Array.isArray(raw) ? raw : raw && typeof raw === 'object' ? [raw] : []);

// RankAndTrafficStats rows to [{date, clicks, impressions}], one per day.
export function normBingDaily(raw) {
  const byDate = new Map();
  for (const r of rowsIn(raw)) {
    const date = parseBingDate(r.Date);
    if (!date) continue;
    const acc = byDate.get(date) || { date, clicks: 0, impressions: 0 };
    acc.clicks += Number(r.Clicks) || 0;
    acc.impressions += Number(r.Impressions) || 0;
    byDate.set(date, acc);
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

// True when the row's date falls inside range {start, end}. Without a range every row counts.
const inRange = (r, range) => {
  if (!range) return true;
  const d = parseBingDate(r.Date);
  return Boolean(d) && d >= range.start && d <= range.end;
};

// Rows keyed by a text field, summed across the dates inside `range` (all dates when no range
// is given). Position is the impression-weighted mean of AvgImpressionPosition; a row without
// a usable position adds nothing to the weighting.
function foldBy(raw, field, keyOf = (v) => v, range = null) {
  const map = new Map();
  for (const r of rowsIn(raw)) {
    if (!inRange(r, range)) continue;
    const key = keyOf(r[field]);
    if (!key) continue;
    const acc = map.get(key) || { clicks: 0, impressions: 0, posWeighted: 0, posImp: 0 };
    const imp = Number(r.Impressions) || 0;
    acc.clicks += Number(r.Clicks) || 0;
    acc.impressions += imp;
    const pos = Number(r.AvgImpressionPosition);
    if (Number.isFinite(pos) && pos > 0) {
      acc.posWeighted += pos * imp;
      acc.posImp += imp;
    }
    map.set(key, acc);
  }
  return [...map.entries()].map(([key, a]) => ({
    key,
    ...a,
    position: a.posImp ? round2(a.posWeighted / a.posImp) : 0,
  }));
}

// QueryStats rows to [{query, clicks, impressions, position}], summed over `range` when given.
export function normBingQueries(raw, range = null) {
  return foldBy(raw, 'Query', (v) => v, range).map(({ key, clicks, impressions, position }) => ({
    query: key,
    clicks,
    impressions,
    position,
  }));
}

// Page stats rows (the page URL arrives in the Query field) to [{page, clicks, impressions}],
// summed over `range` when given.
export function normBingPages(raw, range = null) {
  return foldBy(raw, 'Query', (v) => pathOf(v), range).map(({ key, clicks, impressions }) => ({
    page: key,
    clicks,
    impressions,
  }));
}

// Crawl issue rows to [{url, issue}]. Field names vary, so this reads what is there.
export function normBingCrawlIssues(raw) {
  return rowsIn(raw)
    .map((r) => ({
      url: pathOf(r.Url ?? r.url ?? ''),
      issue: String(r.Issues ?? r.Issue ?? r.issue ?? (r.HttpCode ? `HTTP ${r.HttpCode}` : 'Unknown')),
    }))
    .filter((r) => r.url);
}

// Links: total inbound links across the listed pages.
export function normBingLinkTotal(raw) {
  const links = Array.isArray(raw?.Links) ? raw.Links : [];
  return links.reduce((n, l) => n + (Number(l.Count) || 0), 0);
}

// All pages of a list tool, offset by offset, until an empty page or a page that adds no row
// the earlier pages did not already have (a server that ignores the offset repeats itself).
async function listAll(session, tool) {
  const all = [];
  const seen = new Set();
  for (let page = 0; page < MAX_PAGES; page++) {
    const res = await session.call(tool, { site_url: BING_SITE_URL, offset: all.length, limit: PAGE_SIZE });
    if (!Array.isArray(res)) {
      if (typeof res === 'string' && /Showing 0 of/.test(res)) break;
      throw new McpError(`Bing ${tool} did not return a rows array; the MCP client dropped the list rows.`);
    }
    const added = res.filter((r) => {
      const key = JSON.stringify(r);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if (!added.length) break;
    all.push(...added);
  }
  return all;
}

// Which period the per search and per page numbers cover, in words for the page.
function periodNote(queryRows, pageRows, cur) {
  const dated = (rows) => rows.length > 0 && rows.every((r) => parseBingDate(r.Date));
  const range = longRange(cur.start, cur.end);
  if (dated(queryRows) && dated(pageRows)) {
    return `Bing's numbers per search and per page cover ${range}, the same 28 days as Google's. Bing groups them by week, so the edges can be a few days off.`;
  }
  return `Bing gave no dates on its search or page lists, so those numbers cover everything in Bing's report, which runs back further than Google's ${range}.`;
}

// {today, session?, signal?} -> snapshot. An McpError propagates. Per search and per page numbers
// are summed over the same 28 days as Google's (dates on each row decide), so they can sit beside
// Google's numbers and feed the engine gap rule. A row with no date is kept only when the whole
// list has none, and the period note says so.
export async function pullBing({ today, session, signal, open = openServer } = {}) {
  const own = !session;
  const s = session || (await open('bing-webmaster', { signal }));
  try {
    const w = windows(today);
    const window = (rows) => (rows.some((r) => parseBingDate(r.Date)) ? w.cur : null);
    const daily = normBingDaily(await listAll(s, 'get_rank_and_traffic_stats'));
    const queryRows = await listAll(s, 'get_query_stats');
    const pageRows = await listAll(s, 'get_page_stats');
    const queries = normBingQueries(queryRows, window(queryRows));
    const pages = normBingPages(pageRows, window(pageRows));
    const crawlIssues = normBingCrawlIssues(await listAll(s, 'get_crawl_issues'));
    const total = normBingLinkTotal(await s.call('get_link_counts', { site_url: BING_SITE_URL }));

    const siteDaily = mergeDaily('history/bing-site.json', daily, (r) => r.date);
    const history = mergeDaily('history/bing-links.json', [{ date: today, total }], (r) => r.date);

    return {
      source: 'bing',
      ok: true,
      status: 'fresh',
      pulledAt: new Date().toISOString(),
      through: siteDaily.length ? siteDaily[siteDaily.length - 1].date : today,
      error: null,
      data: {
        siteDaily,
        queries,
        pages,
        windows: { cur: w.cur, prev: w.prev },
        periodNote: periodNote(rowsIn(queryRows), rowsIn(pageRows), w.cur),
        crawlIssues,
        links: { total, history },
      },
    };
  } finally {
    if (own) s.close();
  }
}
