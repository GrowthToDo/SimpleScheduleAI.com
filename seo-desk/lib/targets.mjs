// Target keywords the founder manages in the desk: the registry's own keywords plus the ones he
// adopts, with a priority, a "search group" and a verdict on whether the right page ranks. Also the
// ranking inputs that come from them (priority, strategic keywords) and from visitors (interest
// signals per landing page). Pure functions except loadTargets and saveTargets.

import { groupByQuery, isBrand } from '../../scripts/lib/gsc-diagnose-core.mjs';
import { readJson, writeJson } from './store.mjs';
import { SITE } from './config.mjs';
import { readCsv } from './csv-read.mjs';

export const TARGETS_FILE = 'state/targets.json';
export const PRIORITIES = ['high', 'medium', 'low'];
// How much a priority scales the "page importance" signal (never above 1). Medium and unset are neutral.
export const PRIORITY_FACTOR = { high: 1.25, medium: 1, low: 0.5 };
export const MAX_KEYWORD_LENGTH = 120;
export const MAX_CSV_ROWS = 5000;
export const MIN_DISCOVERED_IMPRESSIONS = 20;
export const PARTIAL_EVIDENCE_BELOW = 10;
// A page needs this many visits in the period before its interest signal counts.
export const OUTCOME_MIN_SESSIONS = 30;
// This many form, calculator or template events in the period give a page the full signal.
export const OUTCOME_FULL_EVENTS = 5;

// ---------------------------------------------------------------- small helpers

// Keywords are compared lower-cased and trimmed.
export const norm = (s) =>
  String(s ?? '')
    .trim()
    .toLowerCase();

// A page as a path: no site name, no query string or heading, no trailing slash; the home page is '/'.
export function foldPage(p) {
  const s = String(p ?? '')
    .trim()
    .replace(SITE, '')
    .split('#')[0]
    .split('?')[0]
    .replace(/\/+$/, '');
  return s === '' ? '/' : s;
}

const isPriority = (p) => PRIORITIES.includes(p);

// ---------------------------------------------------------------- the saved state

export const MAX_SECONDARY = 2000;
export const emptyState = () => ({ adopted: [], ignored: [], priorities: {}, secondary: [] });

// Whatever is on disk, as a state object with every part present and well formed.
export function cleanState(raw) {
  const s = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const seen = new Set();
  const adopted = [];
  for (const a of Array.isArray(s.adopted) ? s.adopted : []) {
    const keyword = norm(a?.keyword);
    if (!keyword || seen.has(keyword)) continue;
    seen.add(keyword);
    adopted.push({
      keyword,
      page: a.page ? foldPage(a.page) : null,
      priority: isPriority(a.priority) ? a.priority : null,
      intentGroup: String(a.intentGroup ?? '').trim() || null,
      source: a.source === 'import' ? 'import' : 'discovered',
      // Monthly searches, kept only when an import supplied them. Keyword difficulty is never kept.
      volume: Number.isFinite(a.volume) && a.volume >= 0 ? a.volume : null,
      addedOn: a.addedOn ?? null,
    });
  }
  const ignored = [...new Set((Array.isArray(s.ignored) ? s.ignored : []).map(norm).filter(Boolean))];
  const priorities = {};
  for (const [k, v] of Object.entries(s.priorities && typeof s.priorities === 'object' ? s.priorities : {}))
    if (isPriority(v) && norm(k)) priorities[norm(k)] = v;
  // Searches a page already shows for that the founder chose to work into it. They are never targets:
  // they do not count in the like for like position and the opportunity rules do not read them.
  const secondary = [];
  const seenSecondary = new Set();
  for (const x of Array.isArray(s.secondary) ? s.secondary : []) {
    const keyword = norm(x?.keyword);
    const page = x?.page ? foldPage(x.page) : null;
    const key = `${page}|${keyword}`;
    if (!keyword || !page || seenSecondary.has(key)) continue;
    seenSecondary.add(key);
    secondary.push({ keyword, page, addedOn: x.addedOn ?? null });
  }
  return { adopted, ignored, priorities, secondary };
}

export const loadTargets = () => cleanState(readJson(TARGETS_FILE, null));
export const saveTargets = (state) => writeJson(TARGETS_FILE, cleanState(state));

// ---------------------------------------------------------------- the target list

// The registry's keywords first, then the adopted ones. The registry wins on a duplicate keyword.
// priority is null when the founder has not set one.
export function allTargets({ registry = [], state = emptyState() } = {}) {
  const out = [];
  const seen = new Set();
  for (const r of registry) {
    const keyword = String(r?.primaryKeyword ?? '').trim();
    if (!keyword) continue;
    seen.add(norm(keyword));
    out.push({
      keyword,
      page: r.url ?? null,
      priority: state.priorities?.[norm(keyword)] ?? null,
      intentGroup: null,
      origin: 'registry',
    });
  }
  for (const a of state.adopted ?? []) {
    const k = norm(a.keyword);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push({
      keyword: String(a.keyword).trim(),
      page: a.page ?? null,
      priority: a.priority ?? null,
      intentGroup: a.intentGroup ?? null,
      origin: 'adopted',
    });
  }
  return out;
}

// Searches the site appears for that nobody has claimed: not a target, not ignored, not a brand
// search, and with enough impressions. Biggest first.
export function discovered({
  qpCur = [],
  targets = [],
  ignored = [],
  brands = [],
  minImpressions = MIN_DISCOVERED_IMPRESSIONS,
} = {}) {
  const taken = new Set([...targets.map((t) => norm(t.keyword)), ...ignored.map(norm)]);
  return groupByQuery(qpCur)
    .filter((q) => q.impressions >= minImpressions && !taken.has(norm(q.query)) && !isBrand(q.query, brands))
    .map((q) => ({
      query: q.query,
      impressions: q.impressions,
      position: q.position,
      rankingPage: q.pages[0] ? foldPage(q.pages[0].page) : null,
    }))
    .sort((a, b) => b.impressions - a.impressions || a.query.localeCompare(b.query));
}

// Does the search come back, and does the page we chose rank for it? Fewer than 10 impressions is
// too little to say where it ranks.
export function labelTarget(target, qpCur = []) {
  const key = norm(target.keyword);
  const byPage = new Map();
  let total = 0;
  for (const r of qpCur) {
    if (norm(r.query) !== key) continue;
    const page = foldPage(r.page);
    byPage.set(page, (byPage.get(page) ?? 0) + (r.impressions || 0));
    total += r.impressions || 0;
  }
  if (!byPage.size) return 'not returned';
  if (total < PARTIAL_EVIDENCE_BELOW) return 'partial evidence';
  const top = [...byPage.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
  return top === foldPage(target.page) ? 'right page' : 'ranks elsewhere';
}

// Searches that share a search group but point at different pages.
export function intentConflicts(targets = []) {
  const groups = new Map();
  for (const t of targets) {
    const key = norm(t.intentGroup);
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, { intentGroup: String(t.intentGroup).trim(), keywords: [], pages: [] });
    const g = groups.get(key);
    g.keywords.push(t.keyword);
    const page = foldPage(t.page);
    if (!g.pages.includes(page)) g.pages.push(page);
  }
  return [...groups.values()].filter((g) => g.pages.length > 1);
}

// ---------------------------------------------------------------- the CSV import

const HEADERS = {
  keyword: ['keyword', 'query', 'search'],
  page: ['url', 'page', 'current url'],
  priority: ['priority'],
  volume: ['volume', 'search volume'],
};
const headerName = (c) =>
  String(c ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

// A keyword export (Search Console, Ahrefs, Semrush, a spreadsheet) as {rows, skipped}. Columns are
// found by header name; difficulty and any other column is ignored.
export function parseKeywordCsv(text) {
  const records = readCsv(text);
  if (!records.length) return { rows: [], skipped: [{ line: 1, why: 'The file is empty.' }] };
  const head = records[0].cells.map(headerName);
  const col = Object.fromEntries(
    Object.entries(HEADERS).map(([k, names]) => [k, head.findIndex((h) => names.includes(h))])
  );
  if (col.keyword < 0)
    return {
      rows: [],
      skipped: [{ line: records[0].line, why: 'No column is named keyword, query or search, so nothing was read.' }],
    };
  const rows = [];
  const skipped = [];
  const seen = new Set();
  const data = records.slice(1);
  for (const [i, rec] of data.entries()) {
    if (i >= MAX_CSV_ROWS) {
      skipped.push({ line: rec.line, why: `Only the first ${MAX_CSV_ROWS.toLocaleString('en-US')} rows are read.` });
      break;
    }
    const cell = (c) => (c >= 0 ? String(rec.cells[c] ?? '').trim() : '');
    const keyword = cell(col.keyword);
    if (!keyword) {
      skipped.push({ line: rec.line, why: 'There is no keyword on this row.' });
      continue;
    }
    if (keyword.length > MAX_KEYWORD_LENGTH) {
      skipped.push({ line: rec.line, why: `The keyword is longer than ${MAX_KEYWORD_LENGTH} characters.` });
      continue;
    }
    if (seen.has(norm(keyword))) {
      skipped.push({ line: rec.line, why: 'That keyword is already earlier in the file.' });
      continue;
    }
    seen.add(norm(keyword));
    const page = cell(col.page);
    const priority = cell(col.priority).toLowerCase();
    const volume = Number(cell(col.volume).replace(/[,\s]/g, ''));
    rows.push({
      keyword,
      page: page ? foldPage(page) : null,
      priority: isPriority(priority) ? priority : null,
      volume: cell(col.volume) !== '' && Number.isFinite(volume) ? volume : null,
    });
  }
  return { rows, skipped };
}

// ---------------------------------------------------------------- ranking inputs

// Interest from visitors for one page: form, calculator and template events in the period, as a
// share of 5 (5 or more is the full signal). Null when the page had fewer than 30 visits, because a
// handful of visits says nothing, and null when the desk has no visitor data for the page.
export function outcomeDetail(page, outcomes) {
  if (!page || !Array.isArray(outcomes)) return null;
  const row = outcomes.find((o) => foldPage(o.page) === foldPage(page));
  if (!row || !(row.sessions >= OUTCOME_MIN_SESSIONS)) return null;
  return {
    value: Math.min(1, (row.events || 0) / OUTCOME_FULL_EVENTS),
    events: row.events || 0,
    sessions: row.sessions,
  };
}

export const outcomeSignal = (page, outcomes) => outcomeDetail(page, outcomes)?.value ?? null;

const PRIORITY_NOTE = {
  high: 'High priority: counts a quarter more.',
  medium: 'Medium priority: counts as usual.',
  low: 'Low priority: counts half.',
};

const round3 = (n) => Math.round(n * 1000) / 1000;

// The opportunities with their signals adjusted by what the founder said and what visitors did:
//  - importance scales with the priority of a matching target (high a quarter more, medium as usual,
//    low half, never above 1), where a target matches by its page or by its keyword being the opportunity's search;
//  - importance is 1 for a search (or a matching target's keyword) in the strategic list;
//  - outcome is the interest from visitors on the opportunity's page.
// Each changed signal gets a plain sentence in signalNotes for the "why this rank" lines.
export function applySignals(opps, { targets = [], strategic = [], outcomes = [] } = {}) {
  const byPage = new Map();
  const byKeyword = new Map();
  for (const t of targets) {
    if (t.page) {
      const k = foldPage(t.page);
      byPage.set(k, [...(byPage.get(k) ?? []), t]);
    }
    byKeyword.set(norm(t.keyword), t);
  }
  const strategicSet = new Set(strategic.map(norm).filter(Boolean));
  return opps.map((o) => {
    const matches = [];
    if (o.page) matches.push(...(byPage.get(foldPage(o.page)) ?? []));
    const byKw = o.query ? byKeyword.get(norm(o.query)) : null;
    if (byKw && !matches.includes(byKw)) matches.push(byKw);

    const signals = { ...o.signals };
    const signalNotes = { ...o.signalNotes };
    const prioritised = matches.filter((t) => isPriority(t.priority));
    if (prioritised.length && Number.isFinite(signals.importance)) {
      const best = prioritised.reduce((a, b) => (PRIORITY_FACTOR[b.priority] > PRIORITY_FACTOR[a.priority] ? b : a));
      const factor = PRIORITY_FACTOR[best.priority];
      signals.importance = Math.min(1, round3(signals.importance * factor));
      signalNotes.importance = `You set the priority of "${best.keyword}" to ${best.priority}. ${PRIORITY_NOTE[best.priority]}`;
    }
    const strategicHit =
      (o.query && strategicSet.has(norm(o.query))) || matches.find((t) => strategicSet.has(norm(t.keyword)));
    if (strategicHit) {
      const name = typeof strategicHit === 'object' ? strategicHit.keyword : o.query;
      signals.importance = 1;
      signalNotes.importance = `You marked "${name}" as a strategic keyword, so page importance is set to the maximum.`;
    }
    const detail = outcomeDetail(o.page, outcomes);
    signals.outcome = detail ? detail.value : null;
    if (detail)
      signalNotes.outcome = `${detail.events} form, calculator or template uses from ${detail.sessions} visits in the last 28 days. These are interest signals, not sales.`;
    return { ...o, signals, signalNotes };
  });
}
