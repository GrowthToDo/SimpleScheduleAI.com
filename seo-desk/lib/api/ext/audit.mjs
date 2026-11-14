// Routes for the technical audit: the latest run with its comparison against the run before,
// older runs, the CSV, and the weekly switch. The audit itself runs as the "audit" job
// (POST /api/jobs/audit), not here.

import { listAudits, loadAudit, compareAudits, countsOf, isRunTime, nextWeeklyAuditDate } from '../../audit/run.mjs';
import {
  GROUPS,
  GROUP_NOTE,
  SCORE_NOTE,
  SEVERITY_LABEL,
  normSeverity,
  severityOf,
  sortIssues,
  editsPageOf,
  guideOf,
} from '../../audit/checks.mjs';
import { todayIso, daysBetween } from '../../dates.mjs';
import { longDate, longRange } from '../../text.mjs';
import { changeSettings } from '../actions.mjs';
import { buildModel, envelope } from '../model.mjs';
import { toCsv } from '../csv.mjs';
import { bad, get, post, bodyOf, sendText } from '../kit.mjs';

const GROUP_TEXT = Object.fromEntries(GROUPS.map((g) => [g.group, g.label]));

const dayText = (iso) => longDate(todayIso(new Date(iso)));
const notFound = (message) => Object.assign(new Error(message), { status: 404 });

// The run saved just before this one, from the index (newest first).
function previousOf(startedAt) {
  const idx = listAudits();
  const i = idx.findIndex((r) => r.startedAt === startedAt);
  const next = i >= 0 ? idx[i + 1] : null;
  return next ? loadAudit(next.startedAt) : null;
}

// The standing line beside the audit: a fix that edits a live page uses up the week's one edit.
export const RULE_LINE =
  "Fixing a title or the text of a page counts as that week's one page edit. Site-wide and server fixes do not.";

// "This run was stopped early. 40 of 152 pages were checked." Null for a run that finished.
// pagesPlanned is missing on runs saved before it was recorded; the live page count stands in.
function stoppedNote(run, livePages) {
  if (run?.stoppedEarly !== true) return null;
  const planned = run.pagesPlanned ?? livePages ?? null;
  const n = run.pagesChecked ?? 0;
  return planned
    ? `This run was stopped early. ${n} of ${planned} pages were checked.`
    : `This run was stopped early. Only ${n} ${n === 1 ? 'page was' : 'pages were'} checked.`;
}

// A page row with the freeze from the lifecycle module (model.frozen), never worked out here.
const withFreeze = (model, p) => {
  const f = model.frozen.get(p.page);
  return { ...p, frozenUntil: f?.until ?? null, frozenUntilText: f ? longDate(f.until) : null };
};

// An issue as the page reads it: whether its fix edits a live page, and each page's freeze.
const marked = (model, i) => ({
  ...i,
  severity: severityOf(i.id, i.severity),
  editsPage: editsPageOf(i.id),
  // The effort, impact and steps come from the check as it reads today; a run saved before they
  // existed has none of its own.
  effort: i.effort ?? null,
  impact: i.impact ?? null,
  steps: i.steps ?? [],
  ...(guideOf(i.id) ?? {}),
  pages: i.pages.map((p) => withFreeze(model, p)),
});

const liveCount = (model) => (model.data.local?.livePages ?? []).length || null;

// One run as the page reads it: issues worst first, each page marked new or not since the run before.
// A group with what its score covers (GROUP_NOTE), for runs saved before the note existed too.
const withNote = (g) => ({ ...g, note: GROUP_NOTE[g.group] ?? null });

// A score reads 100 only when nothing is open. Runs saved before scoreOf held to that can carry a
// 100 next to an open low finding, so the cap is applied here too.
const capped = (score, open) => (open && score === 100 ? 99 : score);

function present(model, run, prev) {
  const comparison = compareAudits(prev, run);
  const added = new Map((comparison?.added ?? []).map((i) => [i.id, new Set(i.pages.map((p) => p.page))]));
  const byNewCheck = new Set((comparison?.byNewCheck ?? []).map((i) => i.id));
  // isNew: a new problem found by a check that also ran last time. newCheck: found by a check the
  // last audit did not have, so it cannot be called new.
  const issues = sortIssues(run.issues ?? []).map((i) =>
    marked(model, {
      ...i,
      clicks: i.pages.reduce((s, p) => s + (p.clicks || 0), 0),
      pages: i.pages.map((p) => ({
        ...p,
        isNew: comparison ? added.get(i.id)?.has(p.page) === true : true,
        newCheck: byNewCheck.has(i.id),
      })),
    })
  );
  const clicks = run.clicksRange?.start && run.clicksRange?.end ? run.clicksRange : null;
  return {
    audit: {
      startedAt: run.startedAt,
      startedText: dayText(run.startedAt),
      finishedAt: run.finishedAt ?? null,
      pagesChecked: run.pagesChecked ?? 0,
      score: capped(run.score ?? null, issues.length > 0),
      scoreNote: SCORE_NOTE,
      stoppedEarly: run.stoppedEarly === true,
      pagesPlanned: run.pagesPlanned ?? null,
      stoppedNote: stoppedNote(run, liveCount(model)),
      counts: countsOf(issues),
      groups: (run.groups?.length ? run.groups : GROUPS.map((g) => ({ ...g, score: null }))).map((g) =>
        withNote({
          ...g,
          score: capped(
            g.score,
            issues.some((i) => i.group === g.group)
          ),
        })
      ),
      issues,
      // The Search Console days each page's clicks cover; null for a run saved before it was kept.
      clicksRange: clicks ? { ...clicks, text: longRange(clicks.start, clicks.end) } : null,
      clicksNote: clicks
        ? `Clicks on each page are Google clicks from Search Console, ${longRange(clicks.start, clicks.end)}.`
        : 'Clicks on each page are Google clicks from Search Console over the 28 days the desk had when the audit ran.',
      linkTargetsChecked: run.linkTargetsChecked ?? 0,
      linkTargetsSkipped: run.linkTargetsSkipped ?? 0,
    },
    comparison: comparison
      ? {
          since: prev.startedAt,
          sinceText: dayText(prev.startedAt),
          added: comparison.added.map((i) => marked(model, i)),
          fixed: comparison.fixed.map((i) => marked(model, i)),
          byNewCheck: comparison.byNewCheck.map((i) => marked(model, i)),
          byNewCheckText: 'Found by a check added since the last audit',
          unchanged: comparison.unchanged,
        }
      : null,
  };
}

const historyOf = (model) =>
  listAudits().map((r) => ({
    startedAt: r.startedAt,
    text: dayText(r.startedAt),
    score: r.score,
    pagesChecked: r.pagesChecked,
    counts: r.counts,
    stoppedEarly: r.stoppedEarly === true,
    stoppedNote: stoppedNote(r, liveCount(model)),
  }));

// The one-glance summary of the latest run for the page's top strip and the Overview.
function healthOf(model, run, audit) {
  const weekly = model.settings.weeklyAudit === true;
  const next = nextWeeklyAuditDate({
    settings: { weeklyAudit: weekly },
    today: model.today,
    lastAuditAt: run?.startedAt ?? null,
  });
  return {
    pagesAudited: run?.pagesChecked ?? 0,
    pagesKnown: liveCount(model) ?? run?.pagesPlanned ?? null,
    openIssues: audit?.issues.length ?? 0,
    bySeverity: audit?.counts ?? countsOf([]),
    // The open issues to fix first (critical and high): the sidebar's Technical audit number.
    toFix: toFixOf(audit?.counts),
    lastAuditAt: run?.startedAt ?? null,
    lastAuditText: run ? dayText(run.startedAt) : null,
    nextAuditAt: next,
    nextAuditText: next ? longDate(next) : null,
    score: audit?.score ?? run?.score ?? null,
  };
}

export function view(model, run) {
  const body = run ? present(model, run, previousOf(run.startedAt)) : { audit: null, comparison: null };
  return {
    ...envelope(model, { empty: !run }),
    health: healthOf(model, run, body.audit),
    weeklyAudit: model.settings.weeklyAudit === true,
    scoreNote: SCORE_NOTE,
    ruleLine: RULE_LINE,
    ...body,
    groups: body.audit?.groups ?? GROUPS.map((g) => withNote({ ...g, score: null })),
    history: historyOf(model),
  };
}

export const latestRun = () => {
  const first = listAudits()[0];
  return first ? loadAudit(first.startedAt) : null;
};

const toFixOf = (counts) => (counts ? (counts.critical ?? 0) + (counts.high ?? 0) : 0);

// After this many days the sidebar no longer shows a tick for "nothing to fix".
export const AUDIT_OLD_DAYS = 14;

// The latest audit's open issues for the sidebar, counted the way the page counts them (each issue at
// its level as the checks read today): {open, toFix, bySeverity, score, at, stoppedEarly, old}, or
// null before any audit. A stopped or old audit cannot vouch for "nothing to fix".
export function latestAuditCounts(today = process.env.SEO_DESK_TODAY || todayIso()) {
  const run = latestRun();
  if (!run) return null;
  const bySeverity = countsOf((run.issues ?? []).map((i) => ({ ...i, severity: severityOf(i.id, i.severity) })));
  const day = isRunTime(run.startedAt) ? todayIso(new Date(run.startedAt)) : null;
  const age = day ? daysBetween(day, today) : null;
  return {
    open: (run.issues ?? []).length,
    toFix: toFixOf(bySeverity),
    bySeverity,
    score: capped(run.score ?? null, (run.issues ?? []).length > 0),
    at: run.startedAt ?? null,
    stoppedEarly: run.stoppedEarly === true,
    old: age === null || age > AUDIT_OLD_DAYS,
  };
}

const COLUMNS = [
  ['Severity', (r) => SEVERITY_LABEL[normSeverity(r.severity)]],
  ['Check', (r) => r.name],
  ['Group', (r) => GROUP_TEXT[r.group] ?? r.group],
  ['Page', (r) => r.page],
  ['Detail', (r) => r.detail],
  ['Clicks', (r) => r.clicks],
  ['Status', (r) => r.status],
  ['Effort', (r) => r.effort],
  ['Impact', (r) => r.impact],
];

export function csvOf(model, run) {
  if (!run) return toCsv(COLUMNS, []);
  const { audit } = present(model, run, previousOf(run.startedAt));
  const rows = audit.issues.flatMap((i) =>
    i.pages.map((p) => ({
      severity: i.severity,
      name: i.name ?? i.what,
      group: i.group,
      page: p.page,
      detail: p.detail,
      clicks: p.clicks,
      status: p.isNew ? 'new' : p.newCheck ? 'new-check' : 'unchanged',
      effort: i.effort,
      impact: i.impact,
    }))
  );
  return toCsv(COLUMNS, rows);
}

const sendCsv = (ctx) => {
  const run = latestRun();
  sendText(
    ctx,
    'text/csv; charset=utf-8',
    csvOf(buildModel(), run),
    `seo-desk-audit-${run ? run.startedAt.slice(0, 10) : 'none'}.csv`
  );
};

export const routes = [
  get('/api/audit', () => view(buildModel(), latestRun())),
  get('/api/audit/:startedAt', (ctx) => {
    const at = ctx.params.startedAt;
    if (!isRunTime(at)) throw bad('The audit time must look like 2026-11-08T12:00:00.000Z.');
    const run = loadAudit(at);
    if (!run) throw notFound('There is no saved audit from that time.');
    return view(buildModel(), run);
  }),
  // Extension routes are matched before the core /api/export/<list>.csv pattern (see lib/api.mjs),
  // so this address reaches the audit CSV.
  get('/api/export/audit.csv', sendCsv),
  post('/api/audit/settings', async (ctx) => {
    const body = await bodyOf(ctx);
    if (typeof body.weeklyAudit !== 'boolean') throw bad('weeklyAudit must be true or false.');
    changeSettings({ weeklyAudit: body.weeklyAudit });
    return { ok: true, weeklyAudit: body.weeklyAudit };
  }),
];
