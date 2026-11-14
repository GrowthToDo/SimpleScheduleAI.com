// Google Analytics 4 pulls and normalisers.
//
// Only run_report is used (the Admin API is disabled for this project). The server
// returns an object {dimension_headers, metric_headers, rows:[{dimension_values:[{value}],
// metric_values:[{value}]}], row_count}; dates come as 'YYYYMMDD'.

import { openServer, McpError } from '../mcp-client.mjs';
import { windows } from '../dates.mjs';
import { GA4_PROPERTY } from '../config.mjs';
import { pathOf } from '../../../scripts/lib/gsc-diagnose-core.mjs';

export const EVENT_RE = /template|calculator|roi|contact|generate_lead|form/i;
// An interest event is a completed action. Starting a form is not one, so names ending in _start
// (form_start and the like) are left out. One test for the Visitors signals and the ranking signal.
export const isInterestEvent = (name) => EVENT_RE.test(String(name ?? '')) && !/_start$/i.test(String(name ?? ''));
export const AI_CHANNEL = 'AI Assistant';
const ROW_LIMIT = 10000;

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// '20261102' or '2026-11-02' to '2026-11-02'; the input unchanged when it is neither.
export function isoDate(v) {
  const s = String(v ?? '');
  return /^\d{8}$/.test(s) ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}` : s;
}

// A run_report response to [{dims: [string], metrics: [number]}] in the order the
// dimensions and metrics were requested. Anything that is not a report gives [].
export function normGa4(report) {
  const rows = Array.isArray(report) ? report : report?.rows;
  if (!Array.isArray(rows)) return [];
  return rows.map((r) => ({
    dims: (r.dimension_values || []).map((d) => String(d?.value ?? '')),
    metrics: (r.metric_values || []).map((m) => num(m?.value)),
  }));
}

// GA4 landing pages are paths, sometimes with a query string (?utm_source=...). Fold the query
// string and a trailing slash away and use '/' for the home page.
const pagePath = (p) => pathOf(String(p ?? '').split('?')[0]) || '/';

export function toChannelsDaily(report) {
  return normGa4(report).map(({ dims, metrics }) => ({
    date: isoDate(dims[0]),
    channel: dims[1],
    sessions: metrics[0],
  }));
}

// Landing rows from the current and previous windows, joined by page.
export function toLanding(curReport, prevReport) {
  const byPage = new Map();
  const slot = (page) => {
    if (!byPage.has(page)) byPage.set(page, { page, sessions: 0, prevSessions: 0, engagedSessions: 0 });
    return byPage.get(page);
  };
  for (const { dims, metrics } of normGa4(curReport)) {
    if (!dims[0] || dims[0] === '(not set)') continue;
    const row = slot(pagePath(dims[0]));
    row.sessions += metrics[0] || 0;
    row.engagedSessions += metrics[1] || 0;
  }
  for (const { dims, metrics } of normGa4(prevReport)) {
    if (!dims[0] || dims[0] === '(not set)') continue;
    slot(pagePath(dims[0])).prevSessions += metrics[0] || 0;
  }
  return [...byPage.values()].sort((a, b) => b.sessions - a.sessions || a.page.localeCompare(b.page));
}

// Event counts from both windows, keeping only the events the desk cares about.
export function toEvents(curReport, prevReport) {
  const byName = new Map();
  const slot = (name) => {
    if (!byName.has(name)) byName.set(name, { name, count: 0, prevCount: 0 });
    return byName.get(name);
  };
  for (const { dims, metrics } of normGa4(curReport))
    if (isInterestEvent(dims[0])) slot(dims[0]).count += metrics[0] || 0;
  for (const { dims, metrics } of normGa4(prevReport))
    if (isInterestEvent(dims[0])) slot(dims[0]).prevCount += metrics[0] || 0;
  return [...byName.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

// Interest events per landing page, with that page's visits: [{page, events, sessions}]. `eventsReport`
// is landingPage x eventName event counts; only the interest events (isInterestEvent) are
// counted. `landingReport` is the current window's landing page sessions. Biggest events first.
export function toOutcomes(eventsReport, landingReport) {
  const byPage = new Map();
  const slot = (page) => {
    if (!byPage.has(page)) byPage.set(page, { page, events: 0, sessions: 0 });
    return byPage.get(page);
  };
  for (const { dims, metrics } of normGa4(landingReport)) {
    if (!dims[0] || dims[0] === '(not set)') continue;
    slot(pagePath(dims[0])).sessions += metrics[0] || 0;
  }
  for (const { dims, metrics } of normGa4(eventsReport)) {
    if (!dims[0] || dims[0] === '(not set)' || !isInterestEvent(dims[1])) continue;
    slot(pagePath(dims[0])).events += metrics[0] || 0;
  }
  return [...byPage.values()]
    .filter((r) => r.events > 0 || r.sessions > 0)
    .sort((a, b) => b.events - a.events || b.sessions - a.sessions || a.page.localeCompare(b.page));
}

const BREAKDOWN_LIMIT = 50;

// Sessions by one dimension (source and medium, country, device) from both windows:
// [{name, sessions, prevSessions}], biggest first.
export function toBreakdown(curReport, prevReport) {
  const byName = new Map();
  const slot = (name) => {
    if (!byName.has(name)) byName.set(name, { name, sessions: 0, prevSessions: 0 });
    return byName.get(name);
  };
  for (const { dims, metrics } of normGa4(curReport)) if (dims[0]) slot(dims[0]).sessions += metrics[0] || 0;
  for (const { dims, metrics } of normGa4(prevReport)) if (dims[0]) slot(dims[0]).prevSessions += metrics[0] || 0;
  return [...byName.values()]
    .sort((a, b) => b.sessions - a.sessions || b.prevSessions - a.prevSessions || a.name.localeCompare(b.name))
    .slice(0, BREAKDOWN_LIMIT);
}

export function toAi(report) {
  return normGa4(report).map(({ dims, metrics }) => ({
    date: isoDate(dims[0]),
    source: dims[1],
    sessions: metrics[0],
  }));
}

async function report(session, { range, dimensions, metrics, filter }) {
  const args = {
    property_id: GA4_PROPERTY,
    date_ranges: [{ start_date: range.start, end_date: range.end }],
    dimensions,
    metrics,
    limit: ROW_LIMIT,
  };
  if (filter) args.dimension_filter = filter;
  const res = await session.call('run_report', args);
  if (!res || typeof res !== 'object' || !Array.isArray(res.rows))
    throw new McpError(`GA4 run_report (${dimensions}) returned no rows array.`);
  return res;
}

const aiFilter = {
  filter: { field_name: 'sessionDefaultChannelGroup', string_filter: { match_type: 'EXACT', value: AI_CHANNEL } },
};

// Only events whose name matches EVENT_RE are asked for (isInterestEvent is applied again on the way in).
const interestFilter = {
  filter: {
    field_name: 'eventName',
    string_filter: { match_type: 'PARTIAL_REGEXP', value: EVENT_RE.source, case_sensitive: false },
  },
};

// {today, session?} -> snapshot. An McpError propagates. A session passed in is left
// open for the caller; otherwise one is opened and closed here.
export async function pullGa4({ today, session, signal, open = openServer } = {}) {
  const own = !session;
  const s = session || (await open('google-analytics', { signal }));
  try {
    const w = windows(today);
    const channels = await report(s, {
      range: w.d90,
      dimensions: ['date', 'sessionDefaultChannelGroup'],
      metrics: ['sessions'],
    });
    const landingMetrics = ['sessions', 'engagedSessions'];
    const landingCur = await report(s, { range: w.cur, dimensions: ['landingPage'], metrics: landingMetrics });
    const landingPrev = await report(s, { range: w.prev, dimensions: ['landingPage'], metrics: landingMetrics });
    const eventsCur = await report(s, { range: w.cur, dimensions: ['eventName'], metrics: ['eventCount'] });
    const eventsPrev = await report(s, { range: w.prev, dimensions: ['eventName'], metrics: ['eventCount'] });
    const ai = await report(s, {
      range: w.d90,
      dimensions: ['date', 'sessionSource'],
      metrics: ['sessions'],
      filter: aiFilter,
    });
    // Interest events per landing page (current window only), and sessions by source, country and device.
    const outcomeEvents = await report(s, {
      range: w.cur,
      dimensions: ['landingPage', 'eventName'],
      metrics: ['eventCount'],
      filter: interestFilter,
    });
    const breakdowns = {};
    for (const [key, dimension] of [
      ['sourceMedium', 'sessionSourceMedium'],
      ['countries', 'country'],
      ['devices', 'deviceCategory'],
    ]) {
      const cur = await report(s, { range: w.cur, dimensions: [dimension], metrics: ['sessions'] });
      const prev = await report(s, { range: w.prev, dimensions: [dimension], metrics: ['sessions'] });
      breakdowns[key] = toBreakdown(cur, prev);
    }
    return {
      source: 'ga4',
      ok: true,
      status: 'fresh',
      pulledAt: new Date().toISOString(),
      through: w.cur.end,
      error: null,
      data: {
        channelsDaily: toChannelsDaily(channels),
        landing: toLanding(landingCur, landingPrev),
        events: toEvents(eventsCur, eventsPrev),
        ai: toAi(ai),
        outcomes: toOutcomes(outcomeEvents, landingCur),
        ...breakdowns,
      },
    };
  } finally {
    if (own) s.close();
  }
}
