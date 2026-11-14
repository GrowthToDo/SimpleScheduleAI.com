// The technical audit: reads every live page from the public site, runs the checks, scores the
// result, keeps the last 26 runs and compares a run with the one before it.
//
// Nothing here writes to the repo. A run is saved under audits/<startedAt>.json in the data folder,
// with a small index in state/audits.json. The job runner and the weekly option both go through
// runAuditJob, which allows only one audit at a time.

import fs from 'node:fs';
import path from 'node:path';
import { readJson, writeJson, dataDir } from '../store.mjs';
import { todayIso, windows, addDays } from '../dates.mjs';
import { plain, plainError } from '../text.mjs';
import { fetchPage, checkLink, SITE_ORIGIN, HTTP_HOME, pathOfUrl } from './crawl.mjs';
import { GROUPS, buildPage, buildSite, evaluate, scoreOf, normPath, severityOf } from './checks.mjs';

export const HISTORY_LIMIT = 26;
export const MAX_LINK_TARGETS = 600;
const INDEX_FILE = 'state/audits.json';
const RUN_TIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

export const isRunTime = (s) => RUN_TIME_RE.test(String(s ?? ''));

// ---------------------------------------------------------------- the run

const emptyFetch = (url, error) => ({
  url,
  status: 0,
  finalUrl: url,
  redirects: [],
  headers: {},
  html: '',
  ms: 0,
  bytes: 0,
  error,
});

// pages: paths (or {page}) of the live pages. clicksByPage: {path: clicks} or a Map. The run never
// throws: a page that fails is an issue, and a stop request ends it early with stopped: true.
export async function runAudit({
  pages,
  fetchImpl = fetch,
  onProgress = () => {},
  clicksByPage = {},
  signal,
  pauseMs,
  timeoutMs,
  sleep,
  now = () => new Date(),
} = {}) {
  const startedAt = now().toISOString();
  const opts = {
    fetchImpl,
    ...(pauseMs !== undefined ? { pauseMs } : {}),
    ...(timeoutMs !== undefined ? { timeoutMs } : {}),
    ...(sleep ? { sleep } : {}),
  };
  const progress = (p) => {
    try {
      onProgress(p);
    } catch {
      // progress is only a courtesy
    }
  };
  const clicksOf = (p) => (clicksByPage instanceof Map ? clicksByPage.get(p) : clicksByPage?.[p]) ?? 0;
  const paths = [
    ...new Set(
      (pages ?? []).map((p) => normPath(typeof p === 'string' ? p : p?.page)).filter((p) => p.startsWith('/'))
    ),
  ];
  const built = [];
  let stopped = false;
  for (let i = 0; i < paths.length; i++) {
    if (signal?.aborted) {
      stopped = true;
      break;
    }
    const url = `${SITE_ORIGIN}${paths[i]}`;
    let fetched;
    try {
      fetched = await fetchPage(url, opts);
    } catch (e) {
      fetched = emptyFetch(url, plainError(e));
    }
    try {
      built.push(buildPage(fetched, paths[i]));
    } catch {
      built.push(buildPage(emptyFetch(url, 'The page could not be read.'), paths[i]));
    }
    progress({ phase: 'pages', done: i + 1, total: paths.length, page: paths[i] });
  }

  // Link answers. A page already read has one (its first answer, before any redirect); every other
  // internal target is asked about with HEAD, most linked first, at most MAX_LINK_TARGETS. A check
  // that gets no answer is asked once more; a second failure stays "no answer" (never "broken").
  const linkStatus = new Map();
  for (const p of built) {
    if (!p.status) continue;
    const first = p.redirects[0];
    linkStatus.set(p.path, { status: first ? first.status : p.status, location: first ? first.to : null });
  }
  const counts = new Map();
  for (const p of built) for (const t of p.internalTargets) counts.set(t, (counts.get(t) ?? 0) + 1);
  const wanted = [...counts.entries()]
    .filter(([t]) => !linkStatus.has(t))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([t]) => t);
  const targets = wanted.slice(0, MAX_LINK_TARGETS);
  let linkTargetsChecked = 0;
  for (let i = 0; i < targets.length && !stopped; i++) {
    if (signal?.aborted) {
      stopped = true;
      break;
    }
    const url = `${SITE_ORIGIN}${targets[i]}`;
    let r = await checkLink(url, opts);
    if (r.status === 0 && !signal?.aborted) r = await checkLink(url, opts);
    linkStatus.set(targets[i], { status: r.status, location: r.location });
    linkTargetsChecked++;
    progress({ phase: 'links', done: i + 1, total: targets.length, page: targets[i] });
  }

  // The plain http address: one request.
  let httpHome = null;
  if (!stopped && !signal?.aborted) {
    progress({ phase: 'http', done: 0, total: 1 });
    httpHome = await checkLink(HTTP_HOME, opts);
    progress({ phase: 'http', done: 1, total: 1 });
  } else stopped = true;

  const finish = (extra) => ({
    startedAt,
    finishedAt: now().toISOString(),
    pagesChecked: built.length,
    pagesPlanned: paths.length,
    auditedPages: built.map((p) => p.path),
    linkTargetsChecked,
    linkTargetsSkipped: Math.max(0, wanted.length - targets.length),
    stopped,
    stoppedEarly: stopped,
    ...extra,
  });
  if (!built.length) return finish({ score: stopped ? null : 100, groups: [], issues: [] });

  // A run that was stopped has not read every page or checked every link, so the checks that need
  // the whole picture (which pages nothing links to) are left out.
  const site = buildSite({ pages: built, sitemap: new Set(paths), linkStatus, httpHome, complete: !stopped });
  const issues = evaluate({ pages: built, site, clicksOf });
  progress({ phase: 'checks', done: 1, total: 1 });
  const audited = new Set(built.map((p) => p.path));
  return finish({
    score: scoreOf(issues, built.length, null, audited),
    groups: GROUPS.map((g) => ({
      group: g.group,
      label: g.label,
      score: scoreOf(issues, built.length, g.group, audited),
    })),
    issues,
  });
}

// ---------------------------------------------------------------- history

// Issues per severity: {critical, high, medium, low}. A saved run's old names count as medium and low.
export const countsOf = (issues) => {
  const out = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const i of issues) out[severityOf(i.id, i.severity)]++;
  return out;
};

// Counts saved in the index before the four levels existed ({critical, warning, notice}).
const readCounts = (c) =>
  c && Object.hasOwn(c, 'warning')
    ? { critical: c.critical ?? 0, high: 0, medium: c.warning ?? 0, low: c.notice ?? 0 }
    : c;

// "2 critical, 1 high, 3 medium and 4 low priority" for the job's result line.
export const countsSentence = (c) =>
  `${c.critical} critical, ${c.high} high, ${c.medium} medium and ${c.low} low priority`;

export function summaryOf(run) {
  return {
    startedAt: run.startedAt,
    finishedAt: run.finishedAt ?? null,
    pagesChecked: run.pagesChecked ?? 0,
    pagesPlanned: run.pagesPlanned ?? null,
    score: run.score ?? null,
    counts: countsOf(run.issues ?? []),
    stoppedEarly: run.stoppedEarly === true,
  };
}

export const listAudits = () => {
  const runs = readJson(INDEX_FILE, null)?.runs;
  return Array.isArray(runs) ? runs.map((r) => (r?.counts ? { ...r, counts: readCounts(r.counts) } : r)) : [];
};

export function loadAudit(startedAt) {
  if (!isRunTime(startedAt)) return null;
  const run = readJson(`audits/${startedAt}.json`, null);
  if (!run || !Array.isArray(run.issues)) return run;
  // A saved run takes its levels from the checks as they are today; an id that is no longer a check
  // keeps its saved level, with warning and notice read as medium and low.
  return { ...run, issues: run.issues.map((i) => ({ ...i, severity: severityOf(i.id, i.severity) })) };
}

// Saves a run, adds it to the index, and keeps the newest HISTORY_LIMIT (older files are removed).
export function saveAudit(run) {
  if (!isRunTime(run?.startedAt)) throw new Error('The audit has no valid start time.');
  writeJson(`audits/${run.startedAt}.json`, run);
  const all = [summaryOf(run), ...listAudits().filter((r) => r.startedAt !== run.startedAt)].sort((a, b) =>
    b.startedAt.localeCompare(a.startedAt)
  );
  const keep = all.slice(0, HISTORY_LIMIT);
  writeJson(INDEX_FILE, { runs: keep });
  for (const old of all.slice(HISTORY_LIMIT)) {
    if (isRunTime(old.startedAt)) fs.rmSync(path.join(dataDir(), 'audits', `${old.startedAt}.json`), { force: true });
  }
  return keep;
}

// What changed between two runs, by issue and page: {added, fixed, unchanged}. Null without a previous run.
export function compareAudits(prev, cur) {
  if (!prev || !cur) return null;
  const pagesOf = (run) => new Map((run.issues ?? []).map((i) => [i.id, new Map(i.pages.map((p) => [p.page, p]))]));
  const before = pagesOf(prev);
  const after = pagesOf(cur);
  // A run that stopped early only knows about the pages it read: a page it never reached is neither
  // new nor fixed in it.
  const reads = (run) => {
    const set = run.stoppedEarly && Array.isArray(run.auditedPages) ? new Set(run.auditedPages) : null;
    return (page) => !set || set.has(page);
  };
  const pick = (run, other, knownByOther) =>
    (run.issues ?? [])
      .map((i) => ({ ...i, pages: i.pages.filter((p) => !other.get(i.id)?.has(p.page) && knownByOther(p.page)) }))
      .filter((i) => i.pages.length);
  let unchanged = 0;
  for (const [id, pages] of after) for (const page of pages.keys()) if (before.get(id)?.has(page)) unchanged++;
  return { added: pick(cur, before, reads(prev)), fixed: pick(prev, after, reads(cur)), unchanged };
}

// ---------------------------------------------------------------- the job and the weekly option

// Clicks per page over the desk's current 28 day window, from the Search Console snapshot.
export function clicksFromGsc(snap, today = process.env.SEO_DESK_TODAY || todayIso()) {
  const rows = snap?.data?.pageDaily;
  if (!Array.isArray(rows)) return {};
  const { start, end } = snap?.data?.windows?.cur ?? windows(today).cur;
  const out = {};
  for (const r of rows) {
    if (!r?.page || r.date < start || r.date > end) continue;
    const key = normPath(pathOfUrl(r.page.startsWith('/') ? `${SITE_ORIGIN}${r.page}` : r.page));
    out[key] = (out[key] ?? 0) + (r.clicks || 0);
  }
  return out;
}

const lengthText = (sec) => (sec >= 90 ? `${Math.round(sec / 60)} minutes` : `${sec} seconds`);
export const AUDIT_LIMIT_MS = 20 * 60 * 1000;
let running = false;

// Runs the audit against the live site's own pages and saves it. Returns {ok, note} for the job runner.
// It stops after limitMs (20 minutes) or when the signal says so, and then saves what it has,
// marked as stopped early.
export async function runAuditJob({
  log = () => {},
  signal,
  fetchImpl = fetch,
  limitMs = AUDIT_LIMIT_MS,
  pauseMs,
  timeoutMs,
} = {}) {
  if (running) return { ok: false, note: 'The technical audit is already running.' };
  running = true;
  try {
    const live = readJson('snap/local.json', null)?.data?.livePages ?? [];
    if (!live.length) {
      return {
        ok: false,
        note: 'The desk has no list of live pages yet. Refresh the desk first, then run the audit again.',
      };
    }
    const started = Date.now();
    const limit = AbortSignal.timeout(limitMs);
    const stop = signal ? AbortSignal.any([signal, limit]) : limit;
    log(`Reading ${live.length} pages from the live site, one at a time. This takes a few minutes.`);
    const steps = { pages: 10, links: 50 };
    const result = await runAudit({
      pages: live.map((p) => p.page),
      fetchImpl,
      clicksByPage: clicksFromGsc(readJson('snap/gsc.json', null)),
      signal: stop,
      ...(pauseMs !== undefined ? { pauseMs } : {}),
      ...(timeoutMs !== undefined ? { timeoutMs } : {}),
      onProgress: ({ phase, done, total }) => {
        if (phase === 'http') return;
        const every = steps[phase];
        if (every && done % every === 0) {
          log(phase === 'pages' ? `Read ${done} of ${total} pages.` : `Checked ${done} of ${total} links.`);
        } else if (phase === 'checks') log('Running the checks.');
      },
    });
    const sec = Math.round((Date.now() - started) / 1000);
    if (result.stopped) {
      const why = limit.aborted ? `the ${Math.round(limitMs / 60000)} minute limit` : 'a stop request';
      if (!result.pagesChecked)
        return { ok: false, note: `Stopped by ${why} before any page was read. Nothing was saved.` };
      saveAudit(result);
      return {
        ok: false,
        note: plain(
          `Stopped early by ${why} after ${lengthText(sec)}. Saved what it had: ${result.pagesChecked} of ${live.length} pages.`
        ),
      };
    }
    saveAudit(result);
    const c = countsOf(result.issues);
    return {
      ok: true,
      note: plain(
        `Checked ${result.pagesChecked} pages in ${lengthText(sec)}. Score ${result.score} out of 100. Found ${countsSentence(c)} problems.`
      ),
    };
  } catch (e) {
    return { ok: false, note: `The audit stopped on an error: ${plainError(e)}` };
  } finally {
    running = false;
  }
}

// The desk's job runner registers itself here, so the weekly audit goes through the same single job
// slot as the manual one: it shows in the jobs list, cannot overlap another job, and is stopped by
// the slot's signal.
let jobStarter = null;
export function registerAuditStarter(fn) {
  jobStarter = typeof fn === 'function' ? fn : null;
}

// True on a Monday when the weekly option is on and no audit has started yet today. today is
// 'YYYY-MM-DD' (the desk's day); lastAuditAt is the start time of the newest saved audit.
export function shouldRunWeeklyAudit({ settings, today, lastAuditAt = null } = {}) {
  if (settings?.weeklyAudit !== true) return false;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(today ?? ''));
  if (!m) return false;
  if (new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))).getUTCDay() !== 1) return false;
  const last = Date.parse(lastAuditAt ?? '');
  if (Number.isFinite(last) && todayIso(new Date(last)) === today) return false;
  return true;
}

// The day the next weekly audit is due, 'YYYY-MM-DD', or null when the weekly option is off. It is the
// next Monday; a Monday that has no audit yet counts as today, because the morning refresh starts it.
export function nextWeeklyAuditDate({ settings, today, lastAuditAt = null } = {}) {
  if (settings?.weeklyAudit !== true) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(today ?? ''));
  if (!m) return null;
  const dow = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))).getUTCDay(); // 0 = Sunday
  const ahead = (8 - dow) % 7; // days until a Monday, 0 on a Monday
  const last = Date.parse(lastAuditAt ?? '');
  const doneToday = Number.isFinite(last) && todayIso(new Date(last)) === today;
  return addDays(today, ahead === 0 && doneToday ? 7 : ahead);
}

// The hook the morning refresh calls when its sources are done. Never throws, starts nothing unless due.
export async function maybeRunWeeklyAudit({
  now = new Date(),
  readSettings = () => readJson('state/settings.json', {}) || {},
  lastAudit = () => listAudits()[0]?.startedAt ?? null,
  start = () => (jobStarter ? jobStarter() : null),
} = {}) {
  try {
    if (!shouldRunWeeklyAudit({ settings: readSettings(), today: todayIso(now), lastAuditAt: lastAudit() }))
      return null;
    return await start();
  } catch {
    return null;
  }
}
