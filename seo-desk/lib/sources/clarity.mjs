// Microsoft Clarity pulls and normalisers.
//
// The Clarity tool answers one simple free-text question per call and only for the
// last three days, and it is rate limited. A refresh asks at most six questions, each
// for "last 1 day" (yesterday), once, with no retries. A question that fails leaves its
// key null; the snapshot still succeeds. Days are kept in history/clarity.json so a
// trend builds up over time.

import { openServer, McpError } from '../mcp-client.mjs';
import { readJson, writeJson } from '../store.mjs';
import { addDays } from '../dates.mjs';

const HISTORY = 'history/clarity.json';
const KEEP_DAYS = 120;
const DAY = 'last 1 day';

// key -> the question. Order is the order asked.
export const QUESTIONS = [
  ['sessions', `Total number of sessions for the ${DAY}`],
  ['rage', `Top URLs by rage clicks for the ${DAY}`],
  ['dead', `Top URLs by dead clicks for the ${DAY}`],
  ['quickBack', `Top URLs by quick backs for the ${DAY}`],
  ['scroll', `Average scroll depth by URL for the ${DAY}`],
  ['jsErrors', `Top JavaScript errors for the ${DAY}`],
];

const num = (v) => {
  const n = Number(String(v ?? '').replace(/[,%\s]/g, ''));
  return Number.isFinite(n) ? n : null;
};

// Rows of one answer. Clarity answers {query, data:[row, ...], dataErrorType}; each row
// is a flat object such as {VisitedUrl, AvgScrollDepthPercent}. An empty data array is a
// real "nothing happened" and gives []. Anything that is not such an answer, or that
// reports a data error, gives null.
function rowsOf(raw) {
  let v = raw;
  if (typeof v === 'string') {
    try {
      v = JSON.parse(v);
    } catch {
      return null;
    }
  }
  if (Array.isArray(v)) return v.filter((r) => r && typeof r === 'object');
  if (!v || typeof v !== 'object' || !Array.isArray(v.data)) return null;
  if (v.dataErrorType) return null;
  return v.data.filter((r) => r && typeof r === 'object');
}

const urlField = (row) => {
  for (const [k, v] of Object.entries(row)) if (typeof v === 'string' && /url|page/i.test(k)) return v;
  return undefined;
};

// First numeric field whose name does not look like a url or page.
const numField = (row) => {
  for (const [k, v] of Object.entries(row)) if (!/url|page/i.test(k) && num(v) !== null) return num(v);
  return null;
};

// "https://simplescheduleai.com/blog/x/?a=1" to "/blog/x"; other strings unchanged.
export function clarityPage(url) {
  const s = String(url ?? '').trim();
  if (!s) return '';
  try {
    const u = new URL(s);
    return u.pathname.replace(/\/$/, '') || '/';
  } catch {
    return s.split(/[?#]/)[0].replace(/\/$/, '') || '/';
  }
}

export function normSessions(raw) {
  const rows = rowsOf(raw);
  if (rows === null) return null;
  return rows.length ? numField(rows[0]) : 0;
}

// [{page, count}] for rage clicks, dead clicks and quick backs, highest first.
export function normCountByPage(raw) {
  const rows = rowsOf(raw);
  if (rows === null) return null;
  const out = [];
  for (const r of rows) {
    const page = urlField(r);
    const count = numField(r);
    if (page && count !== null) out.push({ page: clarityPage(page), count });
  }
  return out.sort((a, b) => b.count - a.count);
}

// [{page, depth}] where depth is a percentage, 0 to 100.
export function normScroll(raw) {
  const rows = rowsOf(raw);
  if (rows === null) return null;
  const out = [];
  for (const r of rows) {
    const page = urlField(r);
    const depth = numField(r);
    if (page && depth !== null) out.push({ page: clarityPage(page), depth });
  }
  return out;
}

// [{message, count}], highest first.
export function normJsErrors(raw) {
  const rows = rowsOf(raw);
  if (rows === null) return null;
  const out = [];
  for (const r of rows) {
    const entry = Object.entries(r).find(([, v]) => typeof v === 'string' && v.trim());
    if (entry) out.push({ message: entry[1].slice(0, 300), count: numField(r) ?? 0 });
  }
  return out.sort((a, b) => b.count - a.count);
}

const NORMALISERS = {
  sessions: normSessions,
  rage: normCountByPage,
  dead: normCountByPage,
  quickBack: normCountByPage,
  scroll: normScroll,
  jsErrors: normJsErrors,
};

// One day record from the raw answers {key: answer|null}. A missing answer, or one
// that does not parse, leaves its key null; an empty answer is an empty list (or 0).
export function buildDay(answers) {
  const day = {};
  for (const [key] of QUESTIONS) {
    const raw = answers?.[key];
    day[key] = raw === undefined || raw === null ? null : NORMALISERS[key](raw);
  }
  return day;
}

// Ask each question once, in order. A question that throws gets null; a sign-in
// error stops the run and propagates, since the rest would fail the same way.
export async function askAll(session) {
  const answers = {};
  for (const [key, question] of QUESTIONS) {
    try {
      answers[key] = await session.call('query-analytics-dashboard', { query: question });
    } catch (e) {
      if (e instanceof McpError && e.kind === 'needs-sign-in') throw e;
      answers[key] = null;
    }
  }
  return answers;
}

// A stored day counts only when at least one question got an answer.
const hasData = (day) => Boolean(day) && Object.values(day).some((v) => v !== null && v !== undefined);

function snapshot(days, through) {
  const keys = Object.keys(days).sort();
  const kept = Object.fromEntries(keys.slice(-KEEP_DAYS).map((d) => [d, days[d]]));
  return {
    source: 'clarity',
    ok: true,
    status: 'fresh',
    pulledAt: new Date().toISOString(),
    through,
    error: null,
    data: { days: kept },
  };
}

// Store one day into history/clarity.json and return the merged days.
export function saveDay(date, day) {
  const days = { ...(readJson(HISTORY, { days: {} }).days || {}), [date]: day };
  const kept = Object.fromEntries(
    Object.keys(days)
      .sort()
      .slice(-KEEP_DAYS)
      .map((d) => [d, days[d]])
  );
  writeJson(HISTORY, { days: kept });
  return kept;
}

// {today, session?} -> snapshot. Skips the six questions when yesterday is already
// stored. A session passed in is left open for the caller.
export async function pullClarity({ today, session, signal, open = openServer } = {}) {
  const yesterday = addDays(today, -1);
  const stored = readJson(HISTORY, { days: {} }).days || {};
  if (hasData(stored[yesterday])) return snapshot(stored, yesterday);

  const own = !session;
  const s = session || (await open('microsoft-clarity', { signal }));
  try {
    const day = buildDay(await askAll(s));
    if (!hasData(day)) {
      // Every question failed: store nothing, so the next refresh asks again.
      return {
        ...snapshot(stored, yesterday),
        ok: false,
        status: 'failed',
        error: 'Clarity answered none of the questions.',
      };
    }
    return snapshot(saveDay(yesterday, day), yesterday);
  } finally {
    if (own) s.close();
  }
}
