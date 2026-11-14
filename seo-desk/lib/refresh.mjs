// Refresh engine: runs the source pullers one at a time, writes their snapshots,
// reports how fresh each source is, and runs once a day on a schedule.
//
// A puller returns a snapshot {source, ok, status, pulledAt, through, error, data}
// and does not write it; this module writes data/snap/<source>.json. A puller that
// throws leaves the previous snapshot's data in place and marks it failed. A failed pull is
// tried again 20 minutes later, at most three times a local day (index checks once, Clarity never;
// see the retry section below), never during a run and never while the desk is paused: Clarity is
// rate limited and the others are slow, so there is no tighter loop than that.

import { pullLocal } from './sources/local.mjs';
import { pullGsc } from './sources/gsc.mjs';
import { pullBing } from './sources/bing.mjs';
import { pullGa4 } from './sources/ga4.mjs';
import { pullClarity } from './sources/clarity.mjs';
import { pullIndex } from './sources/index.mjs';
import { readJson, writeJson, dataDir } from './store.mjs';
import { todayIso } from './dates.mjs';
import { plainError } from './text.mjs';
import { planTickKey, undatedPlanTicks } from './lifecycle.mjs';
import { STALE_HOURS, DAILY_HOUR } from './config.mjs';
import { maybeRunWeeklyAudit } from './audit/run.mjs';

// One MCP process at a time, local first (index checks need its live page list). Index checks
// run last, so a slow inspection never holds up the other sources.
export const ORDER = ['local', 'gsc', 'bing', 'ga4', 'clarity', 'index'];
// Reported by sourceStatus() but with no puller of its own.
export const STATUS_SOURCES = [...ORDER, 'dfs'];

// How long a source may take before the engine stops it and kills its connection.
export const PULL_TIMEOUT_MS = 10 * 60 * 1000;
export const SOURCE_TIMEOUT_MS = { index: 15 * 60 * 1000 };
export const SCHEDULE_CHECK_MS = 10 * 60 * 1000;
// The local pull reads files and one sitemap, so a page load may redo it often.
export const LOCAL_MAX_AGE_MIN = 2;
// A failed local pull is retried no sooner than this, so a broken page load is not redone each time.
export const LOCAL_RETRY_MIN = 10;
// DataForSEO citation checks run about monthly, so a week-old line is not stale.
export const DFS_STALE_DAYS = 35;

// A failed pull is tried again this long after it failed, up to this many times a local day.
export const RETRY_AFTER_MS = 20 * 60 * 1000;
export const MAX_RETRIES_PER_DAY = 3;
// Clarity is rate limited, so a failed pull is never retried; index checks are bound by a daily
// quota, so they get one retry a day. Every other source gets MAX_RETRIES_PER_DAY.
export const RETRY_CAPS = { clarity: 0, index: 1 };
export const retryCap = (source) => RETRY_CAPS[source] ?? MAX_RETRIES_PER_DAY;
// A schedule tick that fires this much later than it should means the Mac was asleep.
export const WAKE_LATE_MS = 20 * 60 * 1000;

const HOUR_MS = 3600000;
const STATE_FILE = 'state/refresh.json';

// Every puller gets {today, livePages, prev, signal}: prev is its own last snapshot, and signal
// is aborted when the engine gives up on it, which closes its connection and kills the process.
export const DEFAULT_PULLERS = {
  local: ({ today }) => pullLocal({ today }),
  gsc: ({ today, signal }) => pullGsc({ today, signal }),
  bing: ({ today, signal }) => pullBing({ today, signal }),
  ga4: ({ today, signal }) => pullGa4({ today, signal }),
  clarity: ({ today, signal }) => pullClarity({ today, signal }),
  index: ({ today, livePages, prev, signal }) => {
    // The first run starts from the table the Search Console pull used to keep.
    const old = prev ? null : readJson(snapFile('gsc'), null);
    return pullIndex({
      today,
      livePages,
      prev,
      signal,
      seed: old?.data?.index ?? null,
      seedCheckedAt: old?.pulledAt ?? null,
    });
  },
};

const snapFile = (source) => `snap/${source}.json`;

function withTimeout(promise, ms, source, onTimeout) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      onTimeout?.();
      const mins = ms >= 60000 ? `${Math.round(ms / 60000)} minutes` : `${ms} ms`;
      reject(Object.assign(new Error(`The ${source} pull timed out after ${mins}.`), { timedOut: true }));
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// ------------------------------------------------------------------ single flight

let flight = null;
let progress = { startedAt: null, finishedAt: null, current: null, queue: [], completed: {} };

// What GET /api/refresh reports: whether a run is going, which source is running now,
// and how the others finished. `last` is the previous finished run (kept across restarts).
export function refreshProgress() {
  return {
    running: flight !== null,
    startedAt: progress.startedAt,
    finishedAt: progress.finishedAt,
    current: progress.current,
    queue: progress.queue,
    completed: progress.completed,
    last: readJson(STATE_FILE, null),
  };
}

// Writes a failed snapshot that keeps the previous good data, pulledAt and through.
function writeFailure(source, prev, status, error) {
  try {
    writeJson(snapFile(source), {
      source,
      ok: false,
      status,
      pulledAt: prev?.pulledAt ?? null,
      through: prev?.through ?? null,
      error,
      failedAt: new Date().toISOString(),
      data: prev?.data ?? {},
    });
  } catch {
    // Disk trouble: the status returned to the caller still tells the screen what happened.
  }
  return status;
}

// Before a new index snapshot replaces the old one, keep the old table (and when it was pulled)
// so the health page and the worries can say what changed between two refreshes. The first
// index run compares with the table the Search Console snapshot used to carry. Nothing is kept
// when either side has no rows.
const indexRows = (snap) => (Array.isArray(snap?.data?.pages) ? snap.data.pages : snap?.data?.index);
function saveOutgoingIndex(prev, next) {
  const from = prev ?? readJson(snapFile('gsc'), null);
  const outgoing = indexRows(from);
  const incoming = indexRows(next);
  if (!Array.isArray(outgoing) || !outgoing.length || !Array.isArray(incoming) || !incoming.length) return;
  if (!from.pulledAt || from.pulledAt === next.pulledAt) return;
  try {
    writeJson('state/index-prev.json', {
      pulledAt: from.pulledAt,
      index: outgoing.map(({ page, verdict }) => ({ page, verdict })),
    });
  } catch {
    // Only the comparison is lost; the refresh itself goes on.
  }
}

// A plan row ticked with no date freezes its page from the day the desk first saw it ticked.
// That day is kept in state/plan-ticks.json the first time a local pull shows it. When the
// outgoing snapshot already showed the row ticked, the desk saw it on that snapshot's day.
function recordPlanTicks(prev, next, today) {
  const rows = undatedPlanTicks(next?.data?.plan);
  if (!rows.length) return;
  try {
    const ticks = readJson('state/plan-ticks.json', {}) || {};
    const file = next.data.plan.file;
    const before = new Set(undatedPlanTicks(prev?.data?.plan).map((r) => planTickKey(prev.data.plan.file, r.page)));
    const prevDay = prev?.pulledAt ? todayIso(new Date(prev.pulledAt)) : null;
    let changed = false;
    for (const r of rows) {
      const key = planTickKey(file, r.page);
      if (ticks[key]) continue;
      ticks[key] = before.has(key) && prevDay ? prevDay : today;
      changed = true;
    }
    if (changed) writeJson('state/plan-ticks.json', ticks);
  } catch {
    // The row is still dated from the snapshot day when the model reads it.
  }
}

async function pullOne(source, puller, timeoutMs, today) {
  const prev = readJson(snapFile(source), null);
  const ctrl = new AbortController();
  try {
    // Index checks need the live page list from the local snapshot written just before.
    const livePages = readJson(snapFile('local'), null)?.data?.livePages ?? [];
    const snap = await withTimeout(
      Promise.resolve().then(() => puller({ today, livePages, prev, signal: ctrl.signal })),
      timeoutMs,
      source,
      () => ctrl.abort()
    );
    if (!snap || typeof snap !== 'object') throw new Error(`The ${source} pull returned nothing.`);
    // A puller may report failure by returning ok:false instead of throwing (Clarity does
    // when every question fails). Same treatment: keep the old data, record why.
    if (snap.ok === false) {
      const status = snap.status === 'needs-sign-in' ? 'needs-sign-in' : 'failed';
      return { status: writeFailure(source, prev, status, plainError(snap.error || `The ${source} pull failed.`)) };
    }
    if (source === 'index') saveOutgoingIndex(prev, snap);
    // Until the first index snapshot exists, the old index table rides along on the Search
    // Console snapshot, so nothing that reads it goes blank in between.
    if (source === 'gsc' && !readJson(snapFile('index'), null) && Array.isArray(prev?.data?.index)) {
      snap.data = { ...snap.data, index: prev.data.index };
    }
    writeJson(snapFile(source), { ...snap, source, error: snap.error ? plainError(snap.error) : null });
    if (source === 'local') recordPlanTicks(prev, snap, today);
    return { status: snap.status || 'fresh' };
  } catch (e) {
    ctrl.abort();
    const status = e?.kind === 'needs-sign-in' ? 'needs-sign-in' : 'failed';
    return { status: writeFailure(source, prev, status, plainError(e)), timedOut: e?.timedOut === true };
  }
}

// `full` is true when no `only` list was given. Only a full run that tried every source counts
// as "today's run". A source that times out has its connection killed by the abort, so the run
// goes on with the next one.
async function run(names, pullers, timeoutMs, full, afterFull, now) {
  const startedAt = new Date().toISOString();
  const began = now();
  const today = todayIso();
  progress = { startedAt, finishedAt: null, current: null, queue: names, completed: {} };
  const results = {};
  for (const name of names) {
    progress.current = name;
    const ms = timeoutMs ?? SOURCE_TIMEOUT_MS[name] ?? PULL_TIMEOUT_MS;
    const { status } = await pullOne(name, pullers[name], ms, today);
    results[name] = status;
    progress.completed[name] = status;
  }
  const finishedAt = new Date().toISOString();
  progress = { ...progress, finishedAt, current: null };
  const complete = full && names.every((n) => results[n] !== undefined && results[n] !== 'skipped');
  // The retry book is kept in memory first, so a state file that cannot be written never makes a
  // retry come round again every tick; the file is a copy.
  const retries = nextRetries(retryBook(), results, now(), began);
  keepBook(retries, (all) => ({
    ...all,
    startedAt,
    finishedAt,
    full,
    results,
    // The run's own clock (injectable), so "today's run" is judged on the same clock as the schedule.
    lastFullRunAt: complete ? began.toISOString() : (all?.lastFullRunAt ?? null),
    retries,
  }));
  const out = { startedAt, finishedAt, results };
  // Whatever keeps a copy of something the pulls change (the lessons' saved statuses) brings it up
  // to date now; a listener never breaks a refresh.
  for (const fn of runListeners) {
    try {
      Promise.resolve(fn(out)).catch(() => {});
    } catch {
      // ignored
    }
  }
  // Any completed full refresh (the morning schedule or Refresh now) gives the weekly audit its
  // turn: it starts only on a Monday, with the switch on, when no audit has started that day.
  if (complete) {
    try {
      Promise.resolve(afterFull(out)).catch(() => {});
    } catch {
      // the audit hook never breaks a refresh
    }
  }
  return out;
}

// Functions to call after every run (full or not), with {startedAt, finishedAt, results}.
const runListeners = new Set();
export function onRunFinished(fn) {
  runListeners.add(fn);
  return () => runListeners.delete(fn);
}

// Runs the sources in order, one at a time. A second call during a run returns the
// same promise (its `only` is ignored). Passing `pullers` runs only the sources that
// map has. The promise never rejects: a failing source becomes a failed snapshot.
// timeoutMs, when given, is the limit for every source (tests); otherwise each source has its own.
// afterFull runs after a completed full run (tests inject it); by default it is the weekly audit hook.
// now (tests inject it) is the clock the retry schedule is worked out from.
export function refreshAll({
  only,
  pullers,
  timeoutMs,
  afterFull = () => maybeRunWeeklyAudit(),
  now = () => new Date(),
} = {}) {
  if (flight) return flight;
  const map = pullers ?? DEFAULT_PULLERS;
  const names = ORDER.filter((n) => (!only || only.includes(n)) && typeof map[n] === 'function');
  flight = run(names, map, timeoutMs, !only, afterFull, now).finally(() => {
    flight = null;
  });
  return flight;
}

// True while a refresh is going (the index-all job waits its turn).
export const refreshRunning = () => flight !== null;

// ------------------------------------------------------------------ freshness

const ageHoursOf = (iso, now) => {
  const t = Date.parse(iso ?? '');
  return Number.isFinite(t) ? Math.round(((now - t) / HOUR_MS) * 10) / 10 : null;
};

// One entry per source: {source, status, pulledAt, through, error, ageHours, paused}.
// status: fresh | stale | failed | needs-sign-in | never. A fresh snapshot becomes
// stale once it is older than STALE_HOURS.
// `snapshots` ({source: snapshot}) lets a caller that already holds them avoid reading the files again.
export function sourceStatus({ now = Date.now(), snapshots } = {}) {
  const read = (source) => (snapshots ? (snapshots[source] ?? null) : readJson(snapFile(source), null));
  const out = ORDER.map((source) => {
    const snap = read(source);
    if (!snap) return { source, status: 'never', pulledAt: null, through: null, error: null, ageHours: null };
    const ageHours = ageHoursOf(snap.pulledAt, now);
    let status = snap.status || (snap.ok === false ? 'failed' : 'fresh');
    if (status === 'fresh' && (ageHours === null || ageHours > STALE_HOURS)) status = 'stale';
    return {
      source,
      status,
      pulledAt: snap.pulledAt ?? null,
      through: snap.through ?? null,
      // Older snapshots may hold a raw error with a stack or a stderr tail: one plain sentence.
      error: snap.error ? plainError(snap.error) : null,
      ageHours,
      ...(snap.failedAt ? { failedAt: snap.failedAt } : {}),
    };
  });

  // DataForSEO has no puller here; its freshness is the date of the last citation-check line.
  const aeo = read('local')?.data?.aeo ?? [];
  const date = aeo.length ? String(aeo[aeo.length - 1]?.date ?? '') : '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const pulledAt = `${date}T00:00:00.000Z`;
    const ageHours = ageHoursOf(pulledAt, now);
    out.push({
      source: 'dfs',
      status: ageHours !== null && ageHours > DFS_STALE_DAYS * 24 ? 'stale' : 'fresh',
      pulledAt,
      through: date,
      error: null,
      ageHours,
    });
  } else {
    out.push({ source: 'dfs', status: 'never', pulledAt: null, through: null, error: null, ageHours: null });
  }
  // Every row says whether the desk is paused (the switch in Settings), so any page can show it,
  // and when a failed pull will be tried again (null when none is waiting or the desk is paused).
  const paused = isPaused();
  const retries = retryBook();
  return out.map((r) => ({
    ...r,
    paused,
    retryAt: !paused && r.status === 'failed' ? (retries[r.source]?.nextAt ?? null) : null,
  }));
}

// Starts a background refresh of whatever needs one and returns at once with the
// source names it asked for (an empty list when nothing needed it or a run is going).
// Local is redone when it is a couple of minutes old. The others only when stale or
// never pulled; one that failed is retried only after STALE_HOURS, so opening the page
// never hammers a rate limited or signed-out source.
export function ensureFresh({ pullers, now = Date.now() } = {}) {
  if (flight || isPaused()) return [];
  const names = [];
  for (const s of sourceStatus({ now })) {
    if (s.source === 'dfs') continue;
    const retryAge = ageHoursOf(s.failedAt, now);
    const failed = s.status === 'failed' || s.status === 'needs-sign-in';
    if (s.source === 'local') {
      if (failed) {
        const sinceFail = now - Date.parse(s.failedAt ?? '');
        if (!(sinceFail <= LOCAL_RETRY_MIN * 60000)) names.push('local');
      } else {
        const ageMs = now - Date.parse(s.pulledAt ?? '');
        if (s.status !== 'fresh' || !(ageMs <= LOCAL_MAX_AGE_MIN * 60000)) names.push('local');
      }
    } else if (s.status === 'never' || s.status === 'stale') {
      names.push(s.source);
    } else if (failed && (retryAge === null || retryAge > STALE_HOURS)) {
      names.push(s.source);
    }
  }
  if (!names.length) return [];
  refreshAll({ only: names, pullers }).catch(() => {});
  return names;
}

// ------------------------------------------------------------------ pause switch

// The desk is paused when the founder turned the switch on in Settings. A paused desk starts no
// refresh by itself (the morning schedule and the stale check on a page load); "Refresh now" still works.
export const isPaused = () => readJson('state/settings.json', null)?.paused === true;

// ------------------------------------------------------------------ retries

const localDay = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// The retry book, kept in memory as the truth and written to state/refresh.json as a copy. The copy
// is read again only when it holds something other than what the desk last read or wrote there (it
// was changed from outside, or another data folder is in use), so a write that failed is never undone
// by reading the old file back.
let mem = null; // {dir, synced: the file's retries as text when last in step, retries}

function retryBook() {
  const fromFile = readJson(STATE_FILE, null)?.retries;
  const retries = fromFile && typeof fromFile === 'object' && !Array.isArray(fromFile) ? fromFile : {};
  const text = JSON.stringify(retries);
  if (!mem || mem.dir !== dataDir() || mem.synced !== text) mem = { dir: dataDir(), synced: text, retries };
  return mem.retries;
}

// Keeps `retries` as the book, then writes the state file through `build(previousState)`. A failed
// write leaves the book in memory, ahead of the file.
function keepBook(retries, build) {
  retryBook();
  mem.retries = retries;
  try {
    writeJson(STATE_FILE, build(readJson(STATE_FILE, null) ?? {}));
    mem.synced = JSON.stringify(retries);
  } catch {
    // The book in memory still holds the count, so the retry does not come round again.
  }
}

// The retry book after a run: state/refresh.json keeps retries: {source: {day, count, nextAt}}, where
// count is how many retries that source has had on `day` (a local day) and nextAt is when the next
// one is due (null when none is waiting). A failed pull waits RETRY_AFTER_MS for its next try, while
// the day's count is under the source's cap (retryCap). A source that pulled fine (or needs the founder to
// sign in, which waiting does not fix) loses its entry; a source the run did not pull keeps its own.
//
// `began` is when the run started: the attempt counts for that day even when it fails after midnight,
// so a retry that starts before midnight never earns an extra one. nextAt is counted from `now`, the end.
export function nextRetries(prev, results, now = new Date(), began = now) {
  const out = { ...(prev && typeof prev === 'object' && !Array.isArray(prev) ? prev : {}) };
  const day = localDay(began);
  for (const [source, status] of Object.entries(results ?? {})) {
    if (status !== 'failed' || retryCap(source) === 0) {
      delete out[source];
      continue;
    }
    const had = out[source];
    const count = had?.day === day ? Number(had.count) || 0 : 0;
    out[source] = {
      day,
      count,
      nextAt: count < retryCap(source) ? new Date(now.getTime() + RETRY_AFTER_MS).toISOString() : null,
    };
  }
  return out;
}

// The sources whose retry is due at `now` and still allowed today.
export function dueRetries({ now = new Date(), pullers } = {}) {
  const book = retryBook();
  const day = localDay(now);
  const map = pullers ?? DEFAULT_PULLERS;
  return ORDER.filter((source) => {
    const r = book[source];
    if (!r?.nextAt || typeof map[source] !== 'function') return false;
    if (!(Date.parse(r.nextAt) <= now.getTime())) return false;
    return (r.day === day ? Number(r.count) || 0 : 0) < retryCap(source);
  });
}

// Starts the retries that are due (one background run for all of them) and returns their names.
// Nothing starts while a run is going or while the desk is paused. The attempt is counted before it
// starts, so a crash cannot make it free.
export function retryFailed({ pullers, now = () => new Date() } = {}) {
  if (flight || isPaused()) return [];
  const t = now();
  const names = dueRetries({ now: t, pullers });
  if (!names.length) return [];
  const retries = { ...retryBook() };
  const day = localDay(t);
  for (const source of names) {
    const r = retries[source];
    retries[source] = { day, count: (r?.day === day ? Number(r.count) || 0 : 0) + 1, nextAt: null };
  }
  // Counted in memory even when the file cannot be written, so a crash or a full disk never makes
  // the same retry due again.
  keepBook(retries, (state) => ({ ...state, retries }));
  refreshAll({ only: names, pullers, now }).catch(() => {});
  return names;
}

// ------------------------------------------------------------------ daily schedule

// True at the first check at or after the daily hour (local time) when no full run has
// completed today, so a Mac asleep at 06:00 still runs when it wakes.
export function shouldRunDaily(now, lastFullRunAt) {
  if (now.getHours() < DAILY_HOUR) return false;
  if (!lastFullRunAt) return true;
  const last = new Date(lastFullRunAt);
  return Number.isNaN(last.getTime()) || localDay(last) !== localDay(now);
}

// A tick that fires more than WAKE_LATE_MS later than its interval means the Mac was asleep.
export const wokeUp = (lastMs, nowMs, intervalMs) => nowMs - lastMs > intervalMs + WAKE_LATE_MS;

// One check of the schedule. The morning run goes first; otherwise a tick that woke the Mac brings
// stale sources up to date (ensureFresh), and a due retry runs. Nothing starts during a run or
// while the desk is paused. `now` is injectable, so tests need no real time.
export function makeTick({ pullers, intervalMs = SCHEDULE_CHECK_MS, now = () => new Date() } = {}) {
  let lastAt = now().getTime();
  return () => {
    const t = now();
    const woke = wokeUp(lastAt, t.getTime(), intervalMs);
    lastAt = t.getTime();
    if (flight || isPaused()) return;
    const last = readJson(STATE_FILE, null)?.lastFullRunAt ?? null;
    // The weekly audit follows any completed full refresh (see run), this one included.
    if (shouldRunDaily(t, last)) {
      refreshAll({ pullers, now }).catch(() => {});
      return;
    }
    if (woke && ensureFresh({ pullers, now: t.getTime() }).length) return;
    retryFailed({ pullers, now });
  };
}

// Checks every ten minutes (and once straight away). Returns a function that stops it.
export function startSchedule({ pullers, intervalMs = SCHEDULE_CHECK_MS, now = () => new Date() } = {}) {
  const tick = makeTick({ pullers, intervalMs, now });
  tick();
  const timer = setInterval(tick, intervalMs);
  timer.unref();
  return () => clearInterval(timer);
}
