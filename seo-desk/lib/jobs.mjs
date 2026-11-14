// Confirmed runs: judge, citations, competitors, site check, keyword check, and the desk's own
// "check every page on Google now".
//
// Script jobs run with child_process.spawn and no shell, from the repo root, one at a time, each
// with a 15 minute cap. The index job runs inside the desk (it repeats the index checks source).
// Starting one returns at once; the page polls the list for progress and the last 80 lines of
// output. The spawner and the index runner are injected so tests never run a script or a pull.

import { spawn as realSpawn } from 'node:child_process';
import path from 'node:path';
import { readJson, writeJson } from './store.mjs';
import { DEFAULT_REPO_ROOT } from './sources/local.mjs';
import { refreshAll } from './refresh.mjs';
import { plain, plainError } from './text.mjs';
import { runAuditJob, registerAuditStarter } from './audit/run.mjs';

export const JOB_TIMEOUT_MS = 15 * 60 * 1000;
export const TAIL_LINES = 80;
// The site check's last step (the hygiene report) is kept whole so the page can read it.
const OUTPUT_LINES = 4000;
const STATE_FILE = 'state/jobs.json';

export const JOBS = [
  {
    key: 'judge-preview',
    label: 'Judge now, preview',
    description: 'Works out the verdicts that are ready and shows them. Nothing is saved.',
    commands: [['node', 'scripts/change-log.mjs', 'judge', '--pull', '--dry-run']],
    writes: [],
    cost: null,
  },
  {
    key: 'judge',
    label: 'Judge now, save the verdicts',
    description: 'Judges every edit that has finished its 28 day wait and saves the verdicts.',
    commands: [['node', 'scripts/change-log.mjs', 'judge', '--pull']],
    writes: ['docs/seo/change-log-verdicts.jsonl'],
    cost: null,
  },
  {
    key: 'citations',
    label: 'Run the AI citation check',
    description: 'Asks the AI assistants about the money keywords and records who they name and cite.',
    commands: [['node', 'scripts/llm-citation-check.mjs']],
    writes: ['docs/seo/aeo-trend.jsonl'],
    cost: 'about $0.62',
  },
  {
    key: 'competitors',
    label: 'Check competitors now',
    description: 'Compares competitor sitemaps and watched pages with the last check.',
    commands: [
      ['node', 'scripts/competitor-sitemap-diff.mjs'],
      ['node', 'scripts/competitor-page-watch.mjs'],
    ],
    writes: ['docs/seo/sitemap-snapshots/', 'docs/seo/competitor-snapshots/'],
    cost: null,
  },
  {
    key: 'keyword-check',
    label: 'Check your keyword file',
    description: 'Checks that every keyword in your keyword file is well formed and points at a real page.',
    commands: [['node', 'scripts/check-keyword-registry.mjs']],
    writes: [],
    cost: null,
  },
  {
    key: 'site-check',
    label: 'Run the site check',
    description:
      'Builds the site, then looks for broken links, missing titles and descriptions and orphan pages. It takes a few minutes.',
    commands: [
      ['npm', 'run', 'build'],
      ['node', 'scripts/site-hygiene.mjs'],
    ],
    writes: ['dist/'],
    cost: null,
    keepOutput: true,
  },
  {
    key: 'index-all',
    label: 'Check every page on Google now',
    description:
      'Asks Search Console about every live page, 40 at a time, until each one has a fresh answer. It writes nothing in the repo and costs nothing. It can take half an hour or more.',
    inProcess: true,
    writes: [],
    cost: null,
    timeoutMs: 2 * 60 * 60 * 1000,
  },
  {
    key: 'audit',
    label: 'Run the technical audit',
    description:
      'Reads every live page from the public site, one at a time, and checks titles, descriptions, headings, links, structured data, security and page weight. It costs nothing and writes no file in the repo. It takes a few minutes.',
    inProcess: true,
    writes: [],
    cost: null,
    timeoutMs: 30 * 60 * 1000,
  },
];

// The index-all job: runs the index checks source again and again (40 pages a round, oldest
// check first) until every live page was checked after the job started. Stops on a failed
// round, on a quota message, on the stop signal, or after maxRounds.
export async function runIndexAll({
  log,
  signal,
  refresh = (opts) => refreshAll(opts),
  readSnap = () => readJson('snap/index.json', null),
  maxRounds = 12,
}) {
  const startedAt = new Date().toISOString();
  for (let round = 1; round <= maxRounds; round++) {
    if (signal?.aborted) {
      return { ok: false, note: 'Stopped before every page was checked. The rest are checked over the next mornings.' };
    }
    const run = await refresh({ only: ['index'] });
    const status = run?.results?.index;
    if (status === undefined) {
      log(`Round ${round}: another refresh was running, so this round waited for it.`);
      continue;
    }
    const snap = readSnap();
    const pages = snap?.data?.pages ?? [];
    const done = pages.filter((r) => r.checkedAt && r.checkedAt >= startedAt).length;
    log(`Round ${round}: ${done} of ${pages.length} pages checked since this started.`);
    if (status !== 'fresh') {
      return {
        ok: false,
        note: `The check stopped: ${snap?.error ? plainError(snap.error) : 'Search Console did not answer.'}`,
      };
    }
    if (pages.length && done >= pages.length) return { ok: true, note: 'Every live page has a fresh answer.' };
    if (/quota/i.test(snap?.error ?? '')) return { ok: false, note: plain(snap.error) };
  }
  return {
    ok: false,
    note: `Stopped after ${maxRounds} rounds. The pages not reached are checked over the next mornings.`,
  };
}

// Not run through POST /api/jobs: it has its own route, shown here so the page can say what it writes.
export const EDIT_NOTE_JOB = {
  key: 'edit-note',
  label: 'Log a manual edit note',
  description:
    'Adds one line to the change log notes. The "Edit:" at the start of the line is what freezes the page for 28 days.',
  writes: ['docs/seo/change-log-notes.jsonl'],
  cost: null,
  runnable: false,
};

// What the confirm step should say before anything starts.
export function confirmText(def) {
  const parts = [];
  if (def.cost) parts.push(`it costs ${def.cost}`);
  parts.push(def.writes.length ? `it writes ${def.writes.join(' and ')}` : 'it writes nothing');
  return `Confirm first: ${def.label} runs a script, ${parts.join(' and ')}. Send {"confirm": true} to start it.`;
}

// Output without colour codes, one entry per line, each cut at 300 characters.
// eslint-disable-next-line no-control-regex
const clean = (s) => s.replace(/\u001B\[[0-9;]*[A-Za-z]/g, '').replace(/\r/g, '');

export function createJobs({
  spawn = realSpawn,
  repoRoot = DEFAULT_REPO_ROOT,
  timeoutMs = JOB_TIMEOUT_MS,
  afterJob = () => refreshAll({ only: ['local'] }),
  now = () => Date.now(),
  indexAll = runIndexAll,
  auditRun = runAuditJob,
} = {}) {
  let current = null;
  const lastOf = () => readJson(STATE_FILE, {})?.last ?? {};

  function list() {
    const last = lastOf();
    const jobs = JOBS.map((j) => ({
      key: j.key,
      label: j.label,
      description: j.description,
      writes: j.writes,
      cost: j.cost,
      runnable: true,
      running: current?.key === j.key,
      progress:
        current?.key === j.key
          ? {
              step: current.step,
              of: j.commands?.length ?? 1,
              startedAt: new Date(current.startedAt).toISOString(),
              elapsedSec: Math.round((now() - current.startedAt) / 1000),
              // The desk's own jobs write plain lines, so the latest one is the progress summary.
              summary: j.inProcess ? (current.lines.at(-1) ?? null) : null,
              tail: current.lines.slice(-TAIL_LINES),
            }
          : null,
      last: last[j.key] ?? null,
    }));
    jobs.push({ ...EDIT_NOTE_JOB, running: false, progress: null, last: null });
    return jobs;
  }

  const runningKey = () => current?.key ?? null;

  function start(key) {
    const def = JOBS.find((j) => j.key === key);
    if (!def) throw Object.assign(new Error('There is no job with that name.'), { status: 404 });
    if (current) {
      const busy = JOBS.find((j) => j.key === current.key);
      throw Object.assign(new Error(`${busy.label} is still running. Wait for it to finish.`), { status: 409 });
    }
    const job = {
      key,
      startedAt: now(),
      step: 1,
      lines: [],
      output: [],
      partial: '',
      child: null,
      done: false,
      timedOut: null,
    };
    let killTimer = null;
    current = job;

    const lastStep = (def.commands?.length ?? 1) - 1;
    const keep = (line) => {
      job.lines.push(line.slice(0, 300));
      if (def.keepOutput && job.step - 1 === lastStep && job.output.length < OUTPUT_LINES) {
        job.output.push(line.slice(0, 300));
      }
    };
    const push = (chunk) => {
      const text = job.partial + clean(String(chunk));
      const parts = text.split('\n');
      job.partial = parts.pop();
      for (const line of parts) keep(line);
      if (job.lines.length > TAIL_LINES * 4) job.lines.splice(0, job.lines.length - TAIL_LINES * 2);
    };

    const lengthText = (sec) => (sec >= 90 ? `${Math.round(sec / 60)} minutes` : `${sec} seconds`);
    // summary: one plain line for the page; the raw lines go under "Details from the script".
    const finish = (ok, exitCode, note, summary) => {
      if (job.done) return;
      job.done = true;
      clearTimeout(timer);
      clearTimeout(killTimer);
      if (job.partial) keep(job.partial);
      if (note) job.lines.push(note);
      const durationSec = Math.round((now() - job.startedAt) / 1000);
      const record = {
        at: new Date(now()).toISOString(),
        ok,
        exitCode: exitCode ?? null,
        durationSec,
        summary: summary ?? (ok ? `Finished in ${lengthText(durationSec)}.` : 'It did not finish cleanly.'),
        tail: job.lines.slice(-TAIL_LINES),
        ...(def.keepOutput ? { output: job.output } : {}),
      };
      try {
        const state = readJson(STATE_FILE, {}) || {};
        writeJson(STATE_FILE, { ...state, last: { ...(state.last ?? {}), [key]: record } });
      } catch {
        // The result is still on screen; only the saved copy is lost.
      }
      current = null;
      Promise.resolve()
        .then(() => afterJob(key, ok))
        .catch(() => {});
    };

    // At the cap the child is asked to stop, then forced to. The single job slot is released
    // only when the child has really exited (its close event), never before. An in-process job
    // is told to stop through its signal and releases the slot when it returns.
    const cap = def.timeoutMs ?? timeoutMs;
    const stop = new AbortController();
    const timer = setTimeout(() => {
      job.timedOut = `Stopped after ${cap >= 60000 ? `${Math.round(cap / 60000)} minutes` : `${cap} ms`}.`;
      stop.abort();
      try {
        job.child?.kill('SIGTERM');
        killTimer = setTimeout(() => job.child?.kill('SIGKILL'), 5000);
        killTimer.unref?.();
      } catch {
        // already gone
      }
    }, cap);
    timer.unref?.();

    if (def.inProcess) {
      const runner = key === 'audit' ? auditRun : indexAll;
      Promise.resolve()
        .then(() => runner({ log: (line) => keep(plain(line)), signal: stop.signal }))
        .then(
          (r) => finish(Boolean(r?.ok), null, null, r?.note ? plain(r.note) : undefined),
          (e) => finish(false, null, null, `It stopped on an error: ${plainError(e)}`)
        );
      return { started: true, key };
    }

    const runStep = (i) => {
      job.step = i + 1;
      const [cmd, ...args] = def.commands[i];
      const exe = cmd === 'node' ? process.execPath : cmd;
      let child;
      try {
        child = spawn(exe, args, {
          cwd: repoRoot,
          shell: false,
          stdio: ['ignore', 'pipe', 'pipe'],
          env: { ...process.env, PATH: `${path.dirname(process.execPath)}${path.delimiter}${process.env.PATH ?? ''}` },
        });
      } catch (e) {
        return finish(false, null, `Could not start: ${String(e?.message ?? e).slice(0, 160)}`, 'It could not start.');
      }
      job.child = child;
      child.stdout?.on('data', push);
      child.stderr?.on('data', push);
      child.on('error', (e) => {
        // A failed kill is not a failed start; the close event will still come.
        if (!job.timedOut) {
          finish(false, null, `Could not start: ${String(e?.message ?? e).slice(0, 160)}`, 'It could not start.');
        }
      });
      child.on('close', (code) => {
        if (job.done) return;
        if (job.timedOut) return finish(false, code, job.timedOut, job.timedOut);
        if (code !== 0) return finish(false, code, `It stopped with exit code ${code}.`);
        if (i + 1 < def.commands.length) return runStep(i + 1);
        finish(true, 0);
      });
    };
    runStep(0);
    return { started: true, key };
  }

  const api = { list, start, runningKey, def: (key) => JOBS.find((j) => j.key === key) };
  // The weekly audit starts through this same slot (the latest runner made is the desk's).
  registerAuditStarter(() => start('audit'));
  return api;
}
