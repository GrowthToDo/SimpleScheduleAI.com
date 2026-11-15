// View models for the working pages: This week, Opportunities, Two pages competing and
// Did it work. Pure reads of the shared model; the only files touched are the ones the
// week module already owns (weeks.json) and the annotations list.

import { readJson } from '../store.mjs';
import { WINDOW_DAYS, GSC_LAG_DAYS, isDueDate, windowsFor } from '../../../scripts/lib/change-log-core.mjs';
import { judgePage } from '../verdicts.mjs';
import { changeIdsOf, readChanges, isBatchVerdict } from '../changes.mjs';
import { addDays, mondayOf } from '../dates.mjs';
import { deliberateEdits as lifecycleEdits, eligibility, withEligibilityText, recentEditText } from '../lifecycle.mjs';
import {
  proposeTop5,
  worries as buildWorries,
  waiting as buildWaiting,
  blockedOnYou,
  getWeek,
  weeks,
  oppCard,
  worryCard,
  openWorkCard,
  pageForSlug,
  planSizeOf,
  dueCounts,
  splitDue,
  editStatusOf,
  verdictStateOf,
  indexRequestLines,
} from '../week.mjs';
import { brief } from '../brief.mjs';
import { competitorBrief } from '../competitor-changes.mjs';
import { staleUpdatesNote } from '../google-updates.mjs';
import { longDate, longRange, plain } from '../text.mjs';
import {
  termOf,
  cardExplain,
  OPEN_STATUSES,
  leftAloneIds,
  readChoices,
  shouldWinOf,
  CHOICES,
  LEAVE_ALONE,
} from '../insights.mjs';
import { opportunityId, splitSearches } from '../rules.mjs';
import { matchKey } from '../targets.mjs';
import {
  POST_PAGE_RE,
  TYPE_LABEL,
  typeLabelOf,
  envelope,
  memo,
  sourcesOf,
  itemState,
  itemOf,
  decorateOpp,
  goneOpps,
  linksFor,
  pagePath,
  slugOf,
  loadSettings,
  withCountsWarning,
  leaveItOf,
  pageEdits,
  editNoteIn,
  workableFirst,
  heldOf,
} from './model.mjs';
import { listAudits, loadAudit } from '../audit/run.mjs';
import { CHECKS, severityOf, sortIssues } from '../audit/checks.mjs';
import { n0, pct, sumRange } from './fmt.mjs';
import { ownership, decayItems } from './ext/insights.mjs';

const count = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// Said on the week when the local snapshot has no list of git edits yet (one pulled before the desk read
// git): a page edited lately could be proposed.
export const GIT_NOT_READ_YET = 'Recent edits from git have not been read yet. Refresh to read them.';

// ---------------------------------------------------------------- annotations

export const ANNOTATIONS_FILE = 'state/annotations.json';
// Notes saved before they had a title, an end date, a category and a detail get those filled in.
const noteShape = (a) => ({
  ...a,
  title: a.title ?? a.text ?? '',
  text: a.text ?? a.title ?? '',
  endDate: a.endDate ?? null,
  category: a.category ?? 'other',
  detail: a.detail ?? '',
});
export const loadAnnotations = () => {
  const v = readJson(ANNOTATIONS_FILE, []);
  return Array.isArray(v) ? v.map(noteShape) : [];
};

// ---------------------------------------------------------------- Google ranking updates

const rankingUpdates = (model) =>
  (model.data.local?.googleUpdates ?? []).filter((u) => u?.kind === 'ranking' && u.start);

// Google's ranking updates that touch start..end (either may be left out), as chart markers:
// {date, endDate, label, kind: 'google-update'}. An update still rolling out has no end date and
// counts up to today. Empty when the founder has turned them off in settings.
export function googleUpdateMarkers(model, { start = null, end = null } = {}) {
  if (!loadSettings().showGoogleUpdates) return [];
  return rankingUpdates(model)
    .filter((u) => (!start || (u.end ?? model.today) >= start) && (!end || u.start <= end))
    .map((u) => ({ date: u.start, endDate: u.end ?? null, label: plain(u.title), kind: 'google-update' }))
    .sort((a, b) => a.date.localeCompare(b.date) || a.label.localeCompare(b.label));
}

// Ranking updates inside the 28 days before a change or the 28 days after it, the judge's own
// windows (windowsFor; the change day itself is in neither), whatever the markers setting says:
// this is a caution about a verdict, not a decoration.
export function updatesNear(model, changeDate) {
  if (!changeDate) return [];
  const { before, after } = windowsFor(changeDate);
  const windows = [before, after];
  return rankingUpdates(model)
    .filter((u) => windows.some((w) => u.start <= w.end && (u.end ?? model.today) >= w.start))
    .sort((a, b) => a.start.localeCompare(b.start))
    .map((u) => ({ label: plain(u.title), date: u.start }));
}

export const NEAR_UPDATE_NOTE = 'A Google ranking update fell inside this period, so read this verdict with care.';

// Ranking updates that touch start..end, whatever the markers setting says (a caution, not a marker).
const updatesIn = (model, start, end) =>
  rankingUpdates(model)
    .filter((u) => u.start <= end && (u.end ?? model.today) >= start)
    .sort((a, b) => a.start.localeCompare(b.start))
    .map((u) => ({ label: plain(u.title), date: u.start }));

// ---------------------------------------------------------------- cautions for the worries

// A one week spike in the 28 days before a change: the busiest 7 days in a row hold more than half
// of the window's times shown (with at least 20 shown). {week: {start, end}, shown, total} or null.
// pages: the page paths the verdict covers (a batch covers several).
export function beforeSpike(model, pages, changeDate) {
  const rows = model.data.gsc?.pageDaily;
  if (!Array.isArray(rows) || !changeDate) return null;
  const { before } = windowsFor(changeDate);
  const want = new Set(pages);
  const byDay = new Map();
  for (const r of rows) {
    if (!want.has(r.page) || r.date < before.start || r.date > before.end) continue;
    byDay.set(r.date, (byDay.get(r.date) ?? 0) + (Number(r.impressions) || 0));
  }
  const total = [...byDay.values()].reduce((a, b) => a + b, 0);
  if (total < 20) return null;
  let best = null;
  for (let start = before.start; addDays(start, 6) <= before.end; start = addDays(start, 1)) {
    let shown = 0;
    for (let i = 0; i < 7; i++) shown += byDay.get(addDays(start, i)) ?? 0;
    if (!best || shown > best.shown) best = { week: { start, end: addDays(start, 6) }, shown };
  }
  return best && best.shown * 2 > total ? { ...best, total } : null;
}

// The cautions Did it work shows beside a verdict, as sentences for the worry: how the typical page
// moved, a Google ranking update inside its dates, and a one week spike in the before window.
// v: a row of change-log-verdicts.jsonl.
export function verdictCautions(model, v) {
  const local = model.data.local ?? {};
  const out = [];
  if (typeof v.siteImpPct === 'number') {
    const p = Math.round(v.siteImpPct * 100);
    out.push(
      `A typical page on the site ${p === 0 ? 'stayed flat' : `moved ${p > 0 ? '+' : ''}${p}%`} over the same dates.`
    );
  }
  const near = updatesNear(model, v.changeDate);
  if (near.length) {
    const names = near.map((u) => `${u.label} (from ${longDate(u.date)})`).join(' and ');
    out.push(`Google's ${names} fell inside these dates, so read this with care.`);
  }
  const batch = v.kind === 'batch' || (Array.isArray(v.pages) && !v.url);
  const pages = batch ? (v.pages ?? []).map((slug) => pageForSlug(slug, local)) : [v.url ?? pageForSlug(v.slug, local)];
  const spike = beforeSpike(model, pages, v.changeDate);
  if (spike) {
    out.push(
      `One week, ${longRange(spike.week.start, spike.week.end)}, held ${n0(spike.shown)} of the ${n0(spike.total)} times shown in the 28 days before, so the before number may be a one week spike.`
    );
  }
  return out;
}

// What the Decay page says about each open decaying page, for its worry: the kind of drop and its
// recommendation (the same the Decay card shows), the Google ranking updates inside the two compared
// windows (a caution, never the cause) and the page's edits inside them, in the words of the one
// function for a page's edits (model.mjs pageEdits, editNoteIn): "last edited" only for a deliberate
// edit, "a small change" for a smaller one.
// Map<oppId, {dropKind, dropKindLabel, dropKindWhy, recommendation, test, updates, editNote}>.
function decayNotes(model) {
  const out = new Map();
  let items = [];
  try {
    items = decayItems(model);
  } catch {
    items = [];
  }
  const byId = new Map(items.map((d) => [d.id, d]));
  for (const o of model.opps) {
    if (o.type !== 'slipping') continue;
    const d = byId.get(o.id);
    const start = o.range?.start ?? null;
    const end = o.range?.end ?? null;
    out.set(o.id, {
      dropKind: d?.dropKind ?? null,
      dropKindLabel: d?.dropKindLabel ?? null,
      dropKindWhy: d?.dropKindWhy ?? null,
      recommendation: d?.recommendation ?? null,
      test: d?.test ?? o.test ?? null,
      updates: start && end ? updatesIn(model, start, end) : [],
      editNote: editNoteIn(pageEdits(model, o.page), start, end),
    });
  }
  return out;
}

// ---------------------------------------------------------------- the timeline

// Publishes, deliberate edits logged by hand, grouped git edits and the founder's own
// annotations, oldest first. Used for the markers on every chart.
export function timelineEvents(model, { page = null, start = null, end = null } = {}) {
  const inRange = (d) => (!start || d >= start) && (!end || d <= end);
  const out = [];
  const seen = new Set();
  const push = (e) => {
    const key = `${e.kind}|${e.date}|${e.page ?? ''}|${e.label}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(e);
    }
  };
  const groups = new Map();
  for (const e of model.edits) {
    if ((page && e.page !== page) || !inRange(e.date)) continue;
    if (e.kind === 'manual') push({ date: e.date, kind: 'note', label: plain(e.subject), page: e.page });
    else if (e.kind === 'publish') push({ date: e.date, kind: 'publish', label: `Published ${e.page}`, page: e.page });
    else {
      const key = `${e.date}|${e.subject}`;
      if (!groups.has(key)) groups.set(key, { date: e.date, subject: e.subject, pages: [] });
      groups.get(key).pages.push(e.page);
    }
  }
  for (const g of groups.values()) {
    push({
      date: g.date,
      kind: 'edit',
      label: plain(g.subject),
      page: g.pages.length === 1 ? g.pages[0] : null,
      pages: g.pages.slice(0, 5),
      count: g.pages.length,
    });
  }
  for (const a of loadAnnotations()) {
    if (a.archived || !inRange(a.date)) continue;
    push({
      date: a.date,
      endDate: a.endDate ?? null,
      kind: 'annotation',
      label: plain(a.title),
      page: null,
      id: a.id,
      category: a.category,
    });
  }
  // Site wide, so a single page chart shows them too.
  for (const m of googleUpdateMarkers(model, { start, end })) push(m);
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.label.localeCompare(b.label));
}

// ---------------------------------------------------------------- deliberate edits and verdicts

// page -> the dates it was deliberately improved, newest first. The rule for what counts lives
// in lifecycle.mjs (the freeze uses the same list), so the two can never disagree.
export function deliberateEdits(model) {
  return memo(model, 'deliberate', () => {
    const map = new Map();
    const list = lifecycleEdits({
      items: model.items,
      opps: model.opps,
      plan: model.data.local?.plan ?? null,
      edits: model.edits,
      planTicks: model.planTicks,
      planSeenOn: model.planSeenOn,
    });
    for (const { page, date } of list) {
      map.set(page, [...new Set([...(map.get(page) ?? []), date])].sort().reverse());
    }
    return map;
  });
}

const VERDICT_TEXT = {
  better: 'Better',
  worse: 'Worse',
  mixed: 'Mixed',
  flat: 'No real change',
  'insufficient-data': 'Too small to tell',
  'too-early': 'Too early',
};

function verdictSentence({ verdict, changeDate, subject, before, after, controlPct }) {
  const label = VERDICT_TEXT[verdict] ?? verdict;
  const place = (m) => (m?.position ? ` at an average place of ${m.position}` : '');
  let s = `${label}. In the ${WINDOW_DAYS} days before the ${longDate(changeDate)} change, ${subject} was shown ${n0(before?.impressions)} times${place(before)}. In the ${WINDOW_DAYS} days after, ${n0(after?.impressions)} times${place(after)}.`;
  if (typeof controlPct === 'number') {
    const p = Math.round(controlPct * 100);
    s += ` The typical page ${p === 0 ? 'stayed flat' : `moved ${p > 0 ? '+' : ''}${p}%`} over the same dates.`;
  }
  return s;
}

// The sentence Did it work shows on a verdict another change overlaps.
export const OVERLAP_NOTE = 'Other edits landed in the same window, so this cannot be read.';

// One id per distinct change (lib/changes.mjs), kept here for the readers that import it from work.
export { changeIdsOf };

const COUNT_WORDS = [
  ['better', 'better'],
  ['worse', 'worse'],
  ['mixed', 'mixed'],
  ['flat', 'no real change'],
  ['insufficient-data', 'too small to tell'],
  ['unreadable', 'cannot be read'],
];

// The verdicts so far, counted by distinct change (a batch commit and its pages are one; a money page
// verdict is its own), with "too early" left out because it is not a verdict. Each change is read
// once, by readChanges (lib/changes.mjs): its batch verdict when no other change overlaps the batch,
// else its page rows no other change overlaps (one word when they agree, mixed when they do not), and
// "cannot be read" when none can be read. The list and the week's worries use the same reading.
// {changes, pageResults, byWord, text}.
export function verdictCounts(model) {
  const raw = model.data.local?.verdicts ?? [];
  const words = readChanges(raw).changes.map((c) => c.word);
  const money = moneyPageVerdicts(model).filter((m) => m.status === 'judged');
  for (const m of money) words.push(m.verdict);
  const byWord = Object.fromEntries(COUNT_WORDS.map(([k]) => [k, words.filter((w) => w === k).length]));
  const text = COUNT_WORDS.filter(([k]) => byWord[k])
    .map(([k, word]) => `${byWord[k]} ${word}`)
    .join(', ');
  return { changes: words.length, pageResults: raw.length + money.length, byWord, text: text || null };
}

// The sentence a row of a change with more than one row carries, so the list says how the whole
// change reads (the same reading the Verdicts so far tile counts). null for a change of one row.
function changeNoteOf(change, raw) {
  if (change.rows.length < 2) return null;
  if (change.word === 'unreadable')
    return 'No page of this change can be read on its own, because other edits landed in the same window, so the change cannot be read.';
  const label = VERDICT_TEXT[change.word] ?? change.word;
  const first = raw[change.used[0]];
  if (change.used.length === 1 && isBatchVerdict(first))
    return `This change reads as ${label}, from its pages judged together.`;
  const n = change.used.length;
  const words = COUNT_WORDS.map(([k, word]) => [word, change.used.filter((i) => raw[i].verdict === k).length])
    .filter(([, c]) => c)
    .map(([word, c]) => `${c} ${word}`);
  const which = n === 1 ? 'its 1 page that no other edit overlaps' : `its ${n} pages that no other edit overlaps`;
  return `This change reads as ${label}, from ${which}${change.word === 'mixed' ? ` (${words.join(', ')})` : ''}.`;
}

// docs/seo/change-log-verdicts.jsonl, shaped for the page. A batch is several pages judged as one.
// changeId names the distinct change a row belongs to (rows that share a commit share it). A row
// another change overlaps cannot be read: readNote says so and its summary starts with it.
export function verdictRows(model) {
  const local = model.data.local ?? {};
  const raw = local.verdicts ?? [];
  const { ids, changes } = readChanges(raw);
  const changeOf = new Map(changes.map((c) => [c.id, c]));
  return raw.map((v, i) => {
    const change = changeOf.get(ids[i]);
    const batch = isBatchVerdict(v);
    const near = updatesNear(model, v.changeDate);
    const pages = batch ? (v.pages ?? []).map((slug) => pageForSlug(slug, local)) : [];
    return {
      id: `${v.slug}|${v.changeDate}`,
      slug: v.slug,
      page: batch ? null : (v.url ?? pageForSlug(v.slug, local)),
      batch,
      pages,
      changeDate: v.changeDate,
      judgedOn: v.judgedOn ?? null,
      verdict: v.verdict,
      verdictText: VERDICT_TEXT[v.verdict] ?? v.verdict,
      before: v.before ?? null,
      after: v.after ?? null,
      // The page's own change in times shown, null under the minimum base.
      impChange: v.before && v.after ? pct(v.after.impressions, v.before.impressions) : null,
      control: { impPct: v.siteImpPct ?? null },
      relImpPct: v.relImpPct ?? null,
      posDelta: v.posDelta ?? null,
      nearUpdates: near,
      nearUpdatesNote: near.length ? NEAR_UPDATE_NOTE : null,
      overlapping: Boolean(v.overlapping),
      changeId: ids[i],
      // How the whole change this row belongs to reads (the word the Verdicts so far tile counts).
      changeVerdict: change.word,
      changeVerdictText: change.word === 'unreadable' ? 'Cannot be read' : (VERDICT_TEXT[change.word] ?? change.word),
      changeNote: changeNoteOf(change, raw),
      readable: !v.overlapping,
      readNote: v.overlapping ? OVERLAP_NOTE : null,
      clicksTooSmall: Boolean(v.clicksTooSmall),
      dropType: v.dropType ?? null,
      signals: v.signals ?? [],
      summary: `${v.overlapping ? `${OVERLAP_NOTE} On the numbers alone: ` : ''}${verdictSentence({
        verdict: v.verdict,
        changeDate: v.changeDate,
        subject: batch ? `the ${pages.length} pages together` : 'the page',
        before: v.before,
        after: v.after,
        controlPct: v.siteImpPct,
      })}`,
    };
  });
}

// Edits change-log would judge that are not ready yet: content pages edited fewer than 30 days ago.
export function pendingEdits(model) {
  return memo(model, 'pending', () => {
    const verdicts = model.data.local?.verdicts ?? [];
    const judged = (slug, date) =>
      verdicts.some((v) => (v.slug === slug || v.pages?.includes(slug)) && v.changeDate === date);
    const seen = new Set();
    const out = [];
    for (const e of model.edits) {
      if (e.kind === 'publish' || !POST_PAGE_RE.test(e.page) || isDueDate(e.date, model.today)) continue;
      const key = `${e.page}|${e.date}`;
      if (seen.has(key) || judged(slugOf(e.page), e.date)) continue;
      seen.add(key);
      const judgeFrom = addDays(e.date, WINDOW_DAYS + GSC_LAG_DAYS);
      out.push({
        page: e.page,
        changeDate: e.date,
        judgeFrom,
        judgeFromText: longDate(judgeFrom),
        kind: e.kind,
        subject: plain(e.subject),
      });
    }
    // A routine commit often touches many pages at once; the page can fold rows that share a change.
    const same = new Map();
    for (const r of out) same.set(`${r.changeDate}|${r.subject}`, (same.get(`${r.changeDate}|${r.subject}`) ?? 0) + 1);
    for (const r of out) r.sameChangeCount = same.get(`${r.changeDate}|${r.subject}`);
    return out.sort((a, b) => a.judgeFrom.localeCompare(b.judgeFrom) || a.page.localeCompare(b.page));
  });
}

// The edits whose verdict is not ready yet, as [{page, judgeFrom}]: the content pages Did it work lists
// as Still waiting, and the money pages that are too early to judge. The week's Next verdict tile and
// its verdict card read their date from this list (with the frozen pages and the plan).
export function verdictsWaiting(model) {
  return [
    ...pendingEdits(model).map((p) => ({ page: p.page, judgeFrom: p.judgeFrom })),
    ...moneyPageVerdicts(model)
      .filter((m) => m.status === 'too-early')
      .map((m) => ({ page: m.page, judgeFrom: m.judgeFrom })),
  ];
}

// Edits finished their wait and not judged yet (what change-log calls due).
export function dueEdits(model) {
  const local = model.data.local ?? {};
  const through = model.snapObjs.gsc?.through ?? null;
  return (local.due ?? []).map((d) => {
    // Ready only when the Search Console data covers the 28 days after the change.
    const needs = addDays(d.date, WINDOW_DAYS);
    const dataReady = !through || needs <= through;
    return {
      page: d.url ?? pageForSlug(d.slug, local),
      changeDate: d.date,
      judgeFrom: addDays(d.date, WINDOW_DAYS + GSC_LAG_DAYS),
      kind: d.kind,
      subject: plain(d.commits?.[0]?.subject ?? d.notes?.[0] ?? ''),
      overlapping: Boolean(d.overlapping),
      dataReady,
      dataThrough: needs,
      waitingText: dataReady ? null : `Waiting for data through ${longDate(needs)}`,
    };
  });
}

// Money pages and other pages outside src/data cannot be judged by change-log, so the desk
// runs the same before and after check on its own daily pulls.
export function moneyPageVerdicts(model) {
  return memo(model, 'moneyVerdicts', () => {
    const pageDaily = model.data.gsc?.pageDaily;
    if (!Array.isArray(pageDaily)) return [];
    const out = [];
    for (const [page, dates] of deliberateEdits(model)) {
      if (POST_PAGE_RE.test(page)) continue;
      const changeDate = dates[0];
      if (!(changeDate >= addDays(model.today, -120))) continue;
      const r = judgePage({ page, changeDate, pageDaily, today: model.today });
      // The same Google update caution as the other verdicts (their own 28 days before and after).
      const near = updatesNear(model, changeDate);
      out.push({
        page,
        changeDate,
        status: r.status,
        judgeFrom: r.judgeFrom,
        judgeFromText: longDate(r.judgeFrom),
        verdict: r.verdict,
        verdictText: VERDICT_TEXT[r.verdict ?? 'too-early'],
        before: r.before,
        after: r.after,
        impChange: r.before && r.after ? pct(r.after.impressions, r.before.impressions) : null,
        control: r.control ? { impPct: r.control.impPct, pages: r.control.pages } : null,
        partial: Boolean(r.partial),
        nearUpdates: near,
        nearUpdatesNote: near.length ? NEAR_UPDATE_NOTE : null,
        summary:
          r.status === 'judged'
            ? verdictSentence({
                verdict: r.verdict,
                changeDate,
                subject: 'the page',
                before: r.before,
                after: r.after,
                controlPct: r.control?.impPct,
              }) +
              (r.partial ? ' The desk has less than 28 days of its own data on one side, so treat this as rough.' : '')
            : `Too early. The ${longDate(changeDate)} change can be judged from ${longDate(r.judgeFrom)}.`,
      });
    }
    return out.sort((a, b) => b.changeDate.localeCompare(a.changeDate));
  });
}

export function resultsView(model) {
  const frozen = [...model.frozen].map(([page, f]) => ({
    page,
    since: f.since,
    until: f.until,
    untilText: longDate(f.until),
    why: f.why,
  }));
  frozen.sort((a, b) => a.until.localeCompare(b.until) || a.page.localeCompare(b.page));
  return {
    ...envelope(model, { need: ['local'] }),
    verdicts: verdictRows(model).sort((a, b) => String(b.judgedOn).localeCompare(String(a.judgedOn))),
    verdictCounts: verdictCounts(model),
    due: dueEdits(model),
    // The changes due for a verdict, from the one reading (verdictState): how many can be read, how many
    // are due but cannot be read (another edit overlaps them), how many wait for Search Console data, and
    // what pressing Judge now will do today. ready = readable + unreadable.
    dueReady: (() => {
      const s = verdictState(model);
      return {
        ready: s.readable + s.unreadable,
        readable: s.readable,
        unreadable: s.unreadable,
        waiting: s.waitingForData,
        waitThrough: s.waitThrough,
        waitingText: s.waitingForData
          ? `${s.waitingForData === 1 ? '1 more waits' : `${s.waitingForData} more wait`} for Search Console data through ${longDate(s.waitThrough)}.`
          : null,
        unreadableText: s.unreadableText,
        judgeText: s.judgeText,
      };
    })(),
    pending: pendingEdits(model),
    // The deliberate edits on record (each freezes its page for 28 days); the full list of pages to
    // leave alone, with the edits found in git and the splits kept, is leaveAlone.
    frozen,
    leaveAlone: leaveAloneList(model),
    leaveAloneSummary: summaryOut(model),
    moneyPageVerdicts: moneyPageVerdicts(model),
    annotations: loadAnnotations().filter((a) => !a.archived),
    timeline: timelineEvents(model, { start: addDays(model.today, -120) }),
    // One plain line when Google's update list has not been read for more than 3 days.
    googleUpdatesNote: staleUpdatesNote(
      {
        fetchedAt: model.data.local?.googleUpdatesFetchedAt ?? null,
        triedAt: model.data.local?.googleUpdatesTriedAt ?? null,
      },
      model.today
    ),
    judgeNow: { preview: 'judge-preview', run: 'judge' },
  };
}

// ---------------------------------------------------------------- since you last looked

export function visitSummary(model) {
  const gsc = model.data.gsc;
  const cur = gsc?.windows?.cur;
  const index = model.index.rows ?? [];
  return {
    through: model.snapObjs.gsc?.through ?? null,
    impressions: cur && gsc?.siteDaily ? sumRange(gsc.siteDaily, cur.start, cur.end, 'impressions') : null,
    indexed: model.index.rows ? index.filter((r) => r.verdict === 'indexed').length : null,
    checked: model.index.checked,
    oppIds: model.opps.map((o) => o.id),
    verdictKeys: (model.data.local?.verdicts ?? []).map((v) => `${v.slug}|${v.changeDate}`),
  };
}

function sinceLastVisit(model, last) {
  if (!last?.summary) {
    return [
      'This is the first visit the desk has on record, so it has nothing to compare against yet. Changes show here from your next visit.',
    ];
  }
  const was = last.summary;
  const now = visitSummary(model);
  const out = [];
  const newVerdicts = (model.data.local?.verdicts ?? []).filter(
    (v) => !(was.verdictKeys ?? []).includes(`${v.slug}|${v.changeDate}`)
  );
  if (newVerdicts.length) {
    const worse = newVerdicts.filter((v) => v.verdict === 'worse').length;
    out.push(
      `${newVerdicts.length} new ${newVerdicts.length === 1 ? 'verdict is' : 'verdicts are'} in on Did it work${worse ? `, ${worse} of them worse` : ''}.`
    );
  }
  if (now.indexed !== null && was.indexed !== null && now.indexed !== was.indexed && now.checked === was.checked) {
    out.push(`Pages on Google went from ${was.indexed} to ${now.indexed} of the ${now.checked} checked.`);
  }
  const change = now.impressions !== null && was.impressions !== null ? pct(now.impressions, was.impressions) : null;
  if (change !== null && Math.abs(change) >= 5) {
    out.push(
      `Google impressions for the last 28 days ${change > 0 ? 'rose' : 'fell'} ${Math.abs(change)}% since you last looked, from ${n0(was.impressions)} to ${n0(now.impressions)} (${model.range.text}).`
    );
  }
  const wasIds = new Set(was.oppIds ?? []);
  const fresh = model.opps.filter((o) => !wasIds.has(o.id));
  if (fresh.length) {
    out.push(
      `${fresh.length} new ${fresh.length === 1 ? 'opportunity' : 'opportunities'} appeared. The highest ranked is: ${plain(fresh[0].title)}.`
    );
  }
  if (!out.length && now.through && was.through && now.through !== was.through) {
    out.push(
      `Search Console data now runs through ${longDate(now.through)}, up from ${longDate(was.through)}. Nothing else moved enough to mention.`
    );
  }
  if (!out.length)
    out.push(`Nothing has changed since you last looked on ${longDate(last.day ?? String(last.at).slice(0, 10))}.`);
  return out.slice(0, 3);
}

// ---------------------------------------------------------------- cards

const keyOfCard = (id) => (String(id).startsWith('opp:') ? String(id).slice(4) : String(id));
export const itemKey = keyOfCard;

// Plain names for the cards that are not opportunities, by the id they are built with.
const WORRY_LABEL = {
  'dropped-from-index': 'Dropped off Google',
  'slipping-page': 'Decay',
  'verdict-worse': 'A change made things worse',
  'crawl-issue': 'Bing crawl problem',
  'registry-fail': 'Keyword file problem',
  'source-failed': 'A data source did not refresh',
  'competitor-change': 'Competitor change',
};
const SLOT_LABEL = {
  'new-post': 'New post',
  'page-edit': 'Live page improvement',
  verdict: 'Verdict',
  other: 'Open work',
};
// The label of a card that is neither an opportunity nor a worry, by where it came from.
const SOURCE_LABEL = { audit: 'Technical audit', index: 'Not indexed' };

// The plain label of what a card is: the opportunity type when it came from one, else its kind.
function cardLabel(model, card) {
  const opp = card.oppId ? model.oppById.get(card.oppId) : null;
  if (opp) return typeLabelOf(opp.type, opp.source);
  if (card.source === 'worry') return WORRY_LABEL[String(card.id).split(':')[0]] ?? 'Worry';
  return SOURCE_LABEL[card.source] ?? SLOT_LABEL[card.slot] ?? 'Task';
}

// The standard term and its one sentence for a card: an opportunity's from its type, any other card's
// from its label.
function termFields(model, card) {
  const opp = card.oppId ? model.oppById.get(card.oppId) : null;
  if (opp) return termOf(opp.type, opp.source);
  const label = cardLabel(model, card);
  return { term: label, explain: cardExplain(label) };
}

// The pages a Done on a split search edits, for the card's confirm (only for split searches).
const editPagesOf = (model, oppId) => {
  const id = oppId ? keyOfCard(oppId) : null;
  const split = id && model.oppById.get(id)?.type === 'competing-pages' ? splitEdit(model, id) : null;
  return split ? { editPages: split.pages } : {};
};

function cardOut(model, card) {
  // A competitor card is not a hypothesis and not an edit of ours: no eligibility, no Search Console.
  if (card.competitor) {
    return {
      ...card,
      typeLabel: cardLabel(model, card),
      ...termFields(model, card),
      score: null,
      state: itemState(model, keyOfCard(card.id)),
      brief: competitorBrief(card),
      links: { live: null, searchConsole: null },
    };
  }
  // A card that only reports (a verdict) carries no eligibility at all.
  return {
    ...card,
    ...editPagesOf(model, card.oppId),
    typeLabel: cardLabel(model, card),
    ...termFields(model, card),
    score: (card.oppId ? model.oppById.get(card.oppId)?.score : null) ?? null,
    eligibility:
      card.eligibility === null ? null : withEligibilityText(card.eligibility ?? { eligible: true, from: null }),
    state: itemState(model, keyOfCard(card.id)),
    brief: brief(card, {
      frozen: model.frozen,
      hold: card.eligibility === null ? null : withEligibilityText(card.eligibility ?? { eligible: true, from: null }),
    }),
    links: linksFor(card.page),
  };
}

// The worries, minus any the founder has finished, ignored or snoozed. A competitor change marked
// Seen is already left out by week.mjs: its id carries the events it covered, so a new event is a new
// card. (The Decay worries are filtered in week.mjs before the top three are taken.)
function visibleWorries(model, all) {
  return all.filter((w) => {
    const it = itemOf(model, w.oppId ?? w.id);
    if (!it) return true;
    if (it.status === 'ignored' || it.status === 'done') return false;
    if (it.status === 'snoozed' && it.snoozeUntil > model.today) return false;
    return true;
  });
}

// The changes Did it work has not judged yet, by page: Map<page, [{changeDate, judgeFrom}]>. A slipping
// page with one is watched until that verdict can be read (week.mjs slippingPages).
function pendingByPage(model) {
  const out = new Map();
  const add = (page, changeDate, judgeFrom) => {
    if (!page || !changeDate || !judgeFrom) return;
    out.set(page, [...(out.get(page) ?? []), { changeDate, judgeFrom }]);
  };
  for (const p of pendingEdits(model)) add(p.page, p.changeDate, p.judgeFrom);
  for (const m of moneyPageVerdicts(model)) if (m.status === 'too-early') add(m.page, m.changeDate, m.judgeFrom);
  return out;
}

// The latest technical audit for the five: {startedAt, issues: [{id, name, severity, setup, pages}]},
// worst first, each at its level as the checks read today. Null before any audit, or when it cannot be
// read.
function auditSummary() {
  try {
    const first = listAudits()[0];
    const run = first ? loadAudit(first.startedAt) : null;
    if (!run) return null;
    const setup = new Map(CHECKS.map((c) => [c.id, c.setup === true]));
    return {
      startedAt: run.startedAt,
      issues: sortIssues(run.issues ?? []).map((i) => ({
        id: i.id,
        name: plain(i.name ?? i.what ?? i.id),
        severity: severityOf(i.id, i.severity),
        setup: setup.get(i.id) ?? false,
        pages: (i.pages ?? []).length,
      })),
    };
  } catch {
    return null;
  }
}

// The pages the founder has already asked Google to index, from his own notes in the change log (a
// note that says he requested indexing): Map<page, the latest date>.
const INDEX_REQUEST_NOTE = /request(ed|ing)?\s+(google\s+)?(to\s+)?index|index(ing)?\s+request/i;
export function indexRequestsOf(model) {
  const out = new Map();
  for (const e of model.edits ?? []) {
    if (e.kind !== 'manual' || !e.page || !e.date || !INDEX_REQUEST_NOTE.test(String(e.subject ?? ''))) continue;
    if (!out.has(e.page) || out.get(e.page) < e.date) out.set(e.page, e.date);
  }
  return out;
}

// Everything the week page can show as a card, by id: the proposal, every opportunity,
// every worry and the open work rows. The founder's chosen five come from here.
export function weekModel(model) {
  return memo(model, 'week', () => {
    const { today, items, frozen } = model;
    const recent = model.recent ?? new Map();
    const local = model.data.local ?? {};
    const weekOf = mondayOf(today);
    const sources = sourcesOf(model);
    const allWorries = buildWorries({
      snaps: {
        gsc: model.snapObjs.gsc,
        bing: model.snapObjs.bing,
        local: model.snapObjs.local,
        index: { data: { pages: model.index.rows ?? [] } },
      },
      prevSnaps: { gsc: { data: { index: model.prevIndex ?? [] } } },
      sources,
      frozen,
      recent,
      opps: model.opps,
      items,
      decay: decayNotes(model),
      cautionsOf: (v) => verdictCautions(model, v),
      pending: pendingByPage(model),
      plan: local.plan ?? null,
      today,
    });
    // A worry needs a look this week. One whose own advice is to leave the page (watch) is shown
    // under "Watching" and is never counted or proposed as a worry.
    const visible = visibleWorries(model, allWorries);
    const worryList = visible.filter((w) => !w.watch);
    const watching = visible.filter((w) => w.watch);
    // A split search the founder chose to leave alone is not proposed for the week.
    const proposed = proposeTop5({
      plan: local.plan ?? null,
      ranked: activeOpps(model),
      due: local.due ?? [],
      worries: worryList,
      openWork: local.openWork ?? [],
      frozen,
      recent,
      items,
      today,
      size: planSizeOf(),
      indexRequests: indexRequestsOf(model),
      // A due edit is ready only when the Search Console data covers its 28 days after.
      through: model.snapObjs.gsc?.through ?? null,
      audit: auditSummary(),
    });
    const opts = { recent };
    const pool = new Map();
    for (const w of allWorries) {
      const c = worryCard(w, frozen, today, opts);
      pool.set(c.id, c);
    }
    for (const w of local.openWork ?? []) pool.set(openWorkCard(w).id, openWorkCard(w));
    for (const o of model.opps) pool.set(`opp:${o.id}`, oppCard(o, 'other', frozen, today, opts));
    for (const c of proposed) pool.set(c.id, c);
    return { weekOf, proposed, pool, worries: worryList, watching, allWorries };
  });
}

// A chosen or locked page edit card, brought up to date: the freeze, a git edit the freeze does not
// know and the this-week check are worked out again from the current data (lifecycle eligibility, the
// same function every list uses), so a week edit dated by another route (a plan row, an edit note,
// another card) shows on it. A card whose own item is the week's edit is not held back by the week
// rule, and a card that edits no live page is left as it is.
function freshen(model, card) {
  // A card that only reports (a verdict) has no chip, even one locked before.
  if (card.source === 'verdict') return { ...card, eligibility: null, hypothesis: false };
  if (!card.isPageEdit || !card.page) return card;
  const own = itemOf(model, keyOfCard(card.id))?.status === 'done';
  const e = eligibility({ isPageEdit: true, page: card.page }, model.frozen, model.today, {
    recent: model.recent,
    week: !own,
  });
  const w = e.weekEdit;
  return {
    ...card,
    eligibility: e,
    weekEditDone: w ? { page: w.page, date: w.date, dateText: longDate(w.date) } : null,
  };
}

// The five cards the week page shows: the locked plan, else the founder's chosen five, else
// the proposal. Raw cards (no state, brief or links). Stored cards are freshened first.
// The old "This week's page edit is done" card (retired 2026-11-15: the week says so in editStatus) is
// left out of a week saved or locked with it, without an error.
const RETIRED_CARD = /^page-edit-done-/;
const CHOSEN_WHY = 'You chose it for this week.';

export function currentTop5(model) {
  const { weekOf, proposed, pool } = weekModel(model);
  const stored = getWeek(weekOf);
  const kept = (c) => !RETIRED_CARD.test(String(c?.id ?? ''));
  // A card the founder chose or locked keeps its own why when it has one, else says it was chosen.
  const why = (c) => (c.why ? c : { ...c, why: CHOSEN_WHY });
  if (stored?.locked && stored.cards?.filter(kept).length)
    return { cards: stored.cards.filter(kept).map((c) => why(freshen(model, c))), source: 'locked', stored };
  if (stored?.top5?.length) {
    return {
      cards: stored.top5
        .filter((id) => !RETIRED_CARD.test(String(id)))
        .map((id) => pool.get(id))
        .filter(Boolean)
        .map((c) => why(freshen(model, c))),
      source: 'chosen',
      stored,
    };
  }
  return { cards: proposed, source: 'proposed', stored };
}

// What not to touch this week: pages inside their 28 days (the lifecycle freeze, so no new edit
// restarts the measuring) and the pages of split searches the founder chose to leave alone.
// [{page, reason, until}]; until is null for a choice, which has no end date.
// A page git shows edited by 15 or more lines in one commit in the last 28 days, that the freeze does not know, is
// listed too, with the same words as its chip.
// This is the one function that says which pages to leave alone: the week's "Pages to leave alone",
// the Pages tile and its "Free to edit" filter, and Did it work all read it (or leaveAloneSummary).
// kind: 'logged' (a deliberate edit the desk has on record: a Done, a plan row, an "Edit:" note),
// 'git' (an edit of 15 or more lines found in git) or 'split' (a split the founder chose to keep).
// A page left alone for two reasons is listed once, under the first that applies.
export function leaveAloneList(model) {
  return memo(model, 'leave-alone', () => {
    const frozen = [...model.frozen]
      .filter(([, f]) => f.until > model.today)
      .map(([page, f]) => ({
        page,
        reason: `Edited on ${longDate(f.since)}, being measured until ${longDate(f.until)}.`,
        until: f.until,
        kind: 'logged',
      }));
    for (const [page, r] of model.recent ?? []) {
      if (r.edit && r.edit.until > model.today && !model.frozen.has(page))
        frozen.push({ page, reason: `${recentEditText(r.edit)}.`, until: r.edit.until, foundInGit: true, kind: 'git' });
    }
    frozen.sort((a, b) => a.until.localeCompare(b.until) || a.page.localeCompare(b.page));
    const seen = new Set(frozen.map((x) => x.page));
    const chosen = [];
    for (const c of leftAloneSplits(model))
      for (const page of c.pages) {
        if (seen.has(page)) continue;
        seen.add(page);
        chosen.push({
          page,
          reason: `You marked the split over "${c.query}" as leave alone.`,
          until: null,
          kind: 'split',
        });
      }
    return [...frozen, ...chosen];
  });
}

// The pages to leave alone in numbers, with the same name everywhere: {count, logged, git, split,
// pages, text}. text says which kinds make up the count ("2 with a logged edit, 33 found in git").
export const LEAVE_ALONE_NAME = 'Pages to leave alone';
// The summary as a reply carries it (no page list: the reply has the list itself).
const summaryOut = (model) => {
  const s = leaveAloneSummary(model);
  return { name: LEAVE_ALONE_NAME, count: s.count, logged: s.logged, git: s.git, split: s.split, text: s.text };
};
export function leaveAloneSummary(model) {
  const list = leaveAloneList(model);
  const n = (k) => list.filter((x) => x.kind === k).length;
  const logged = n('logged');
  const git = n('git');
  const split = n('split');
  const parts = [
    logged ? `${logged} with a logged edit` : null,
    git ? `${git} found in git` : null,
    split ? `${split} from a split you chose to keep` : null,
  ].filter(Boolean);
  return { count: list.length, logged, git, split, pages: list.map((x) => x.page), text: parts.join(', ') || null };
}

export function weekView(model) {
  const wm = weekModel(model);
  const { weekOf } = wm;
  const local = model.data.local ?? {};
  const { cards, source: top5Source, stored } = currentTop5(model);
  const inFive = new Set(cards.map((c) => c.oppId).filter(Boolean));
  const open = (o) => OPEN_STATUSES.includes(itemOf(model, o.id)?.status ?? 'new');
  // The next ten by score not in this week's priorities, the ones that can be worked on now first: an item
  // on a page that may not be edited now is never pushed (no Swap in), so it comes after them.
  const topTen = workableFirst(
    activeOpps(model)
      .filter((o) => !inFive.has(o.id) && open(o))
      .map((o) => decorateOpp(model, o))
  ).slice(0, 10);
  const last = readJson('state/visit.json', null);
  const waitingList = foldVerdictDays(
    buildWaiting({
      verdictsDue: verdictsWaiting(model),
      frozen: model.frozen,
      plan: local.plan ?? null,
      today: model.today,
    }).filter((w) => w.date >= model.today)
  ).map((w) => ({ ...w, dateText: longDate(w.date) }));
  // One worry as the page reads it: the same card the five would show for it, so brief and test read
  // like an opportunity's, and the same id (a slipping page is its opportunity, opp:<id>), so every
  // button works.
  const worryOut = (w) => {
    const c = worryCard(w, model.frozen, model.today, { recent: model.recent, week: true });
    if (c.competitor) {
      return {
        ...w,
        ...termFields(model, c),
        id: c.id,
        hypothesis: false,
        brief: competitorBrief(c),
        links: { live: null, searchConsole: null },
        state: itemState(model, keyOfCard(c.id)),
      };
    }
    // When the page may be edited, in the words the page's own detail uses (pageEdits editWhen). A watched
    // card's advice is to leave the page, so it carries no eligibility chip ("Eligible", "Next page
    // edit"), and its line is only the date its own edit holds it until.
    const when = w.page && w.isPageEdit ? pageEdits(model, w.page).editWhen : null;
    return {
      ...w,
      ...termFields(model, c),
      id: c.id,
      test: c.test,
      eligibility: w.watch ? null : withEligibilityText(c.eligibility),
      // A worry on a page that may not be edited now is not offered for the week (no Add to this week).
      ...heldOf(Boolean(w.isPageEdit) && !w.watch, c.eligibility),
      editWhen: w.watch ? (/^Leave it until/.test(when ?? '') ? when : null) : when,
      ...(w.waitUntil ? { waitUntilText: longDate(w.waitUntil) } : {}),
      // A watched card's own advice is to leave the page alone: Leave it snoozes it until the date to
      // look again (or 28 days) and records no page edit and no freeze.
      ...(w.watch ? { leaveIt: leaveItOf(model, w.waitUntil ?? null) } : {}),
      brief: brief(c, { frozen: model.frozen, hold: withEligibilityText(c.eligibility) }),
      links: linksFor(w.page),
      state: itemState(model, keyOfCard(c.id)),
    };
  };
  // The cards that need the per-search counts are missing when the counts are, and a local snapshot
  // from before the desk read git holds no recent edits, so the week says both.
  const env = withCountsWarning(model, envelope(model));
  const localSnap = model.snapObjs.local?.data;
  const gitUnread = Boolean(localSnap) && !Array.isArray(localSnap.contentEdits) && !localSnap.contentEditsError;
  const warnings = [...(env.warnings ?? []), ...(gitUnread ? [GIT_NOT_READ_YET] : [])];
  return {
    ...env,
    ...(warnings.length ? { warnings } : {}),
    weekOf,
    weekLabel: `Week of ${longDate(weekOf)}`,
    // Once this week's page edit is used, one line says so (and when the next can go in) instead of a card.
    editStatus: editStatusOf(model.frozen, model.today),
    // Things already handled or with nothing to learn, said once in plain words instead of as cards:
    // changes due for a verdict that cannot be read, and pages Google was already asked to index.
    statusLines: [
      verdictState(model).statusLine,
      ...indexRequestLines(
        model.opps.filter((o) => o.type === 'not-indexed').map((o) => o.page),
        indexRequestsOf(model),
        model.today
      ),
    ].filter(Boolean),
    standingLine:
      'Rankings, impressions and visits are not sales. Customers come through personal contacts. This page tracks how easy we are to find.',
    sinceLastVisit: sinceLastVisit(model, last),
    lastVisit: last?.at ?? null,
    top5: cards.map((c) => cardOut(model, c)),
    top5Source,
    opportunities: topTen,
    counts: {
      openOpportunities: activeOpps(model).filter(open).length,
      // A worry needs a look this week, so total and needLook are the same number. Pages whose own
      // advice is to leave them are under watching, never counted as worries.
      worries: { total: wm.worries.length, needLook: wm.worries.length, waiting: 0 },
      watching: wm.watching.length,
    },
    worries: wm.worries.map(worryOut),
    // Slipped or read worse, but nothing to do this week: each says why in watch.
    watching: wm.watching.map(worryOut),
    waiting: waitingList,
    nextVerdict: nextVerdictOf(model),
    planSize: planSizeOf(),
    leaveAlone: leaveAloneList(model),
    // The same count under the same name as the Pages tile and Did it work, and what it is made of.
    leaveAloneSummary: summaryOut(model),
    blockedOnYou: blockedOnYou(local.openWork ?? []),
    locked: Boolean(stored?.locked),
    lockedAt: stored?.lockedAt ?? null,
    pastWeeks: weeks()
      .filter((w) => w.weekOf !== weekOf)
      .map((w) => {
        const list = (w.cards?.length ? w.cards : (w.top5 ?? []).map((id) => ({ id, title: id }))).map((c) => ({
          id: c.id,
          title: plain(c.title),
          status: itemOf(model, keyOfCard(c.id))?.status ?? 'new',
        }));
        return {
          weekOf: w.weekOf,
          weekLabel: `Week of ${longDate(w.weekOf)}`,
          locked: Boolean(w.locked),
          lockedAt: w.lockedAt ?? null,
          cards: list,
          doneCount: list.filter((c) => c.status === 'done').length,
        };
      }),
  };
}

// The waiting list with the verdicts of one day folded into one row ("Verdicts on 4 page changes",
// with the pages), so a commit that touched many pages is one line. Frozen pages stay one row each.
export function foldVerdictDays(list) {
  const out = [];
  const byDate = new Map();
  for (const w of list) {
    if (w.kind !== 'verdict') {
      out.push(w);
      continue;
    }
    const page = w.title.replace(/^Verdict on /, '');
    const row = byDate.get(w.date);
    if (row) {
      row.pages.push(page);
      row.count = row.pages.length;
      row.title = `Verdicts on ${row.count} page changes`;
    } else {
      const fresh = { ...w, pages: [page], count: 1 };
      byDate.set(w.date, fresh);
      out.push(fresh);
    }
  }
  return out;
}

// The one reading of the changes waiting for a verdict (week.mjs verdictStateOf), once per model: the
// week, the Next verdict tile, Did it work and the Ask digest all read it.
export function verdictState(model) {
  return memo(model, 'verdict-state', () =>
    verdictStateOf({
      due: model.data.local?.due ?? [],
      through: model.snapObjs.gsc?.through ?? null,
      pending: [
        ...pendingEdits(model).map((p) => ({ page: p.page, changeDate: p.changeDate, judgeFrom: p.judgeFrom })),
        ...moneyPageVerdicts(model)
          .filter((m) => m.status === 'too-early')
          .map((m) => ({ page: m.page, changeDate: m.changeDate, judgeFrom: m.judgeFrom })),
      ],
      edits: model.edits,
      today: model.today,
    })
  );
}

// The Next verdict tile: the next date a verdict can actually be READ (verdictState): today when a due
// change can be read, else the day the data covers a due change no other edit overlaps, else the
// earliest waiting change no other edit overlaps so far, else "None in sight". The note says, when due
// changes overlap other edits, that they cannot be read. {ready, date, dateText, note}.
function nextVerdictOf(model) {
  const s = verdictState(model);
  const all = model.data.local?.due ?? [];
  const { ready } = splitDue(all, model.snapObjs.gsc?.through ?? null);
  const parts = [];
  let head;
  if (s.next?.kind === 'now') {
    const c = dueCounts(ready.filter((d) => !d.overlapping));
    const from = c.commits ? ` from ${c.commits} ${c.commits === 1 ? 'commit' : 'commits'}` : '';
    head = { ready: true, date: model.today, dateText: 'Ready now' };
    parts.push(`${c.changes} ${c.changes === 1 ? 'page change' : 'page changes'}${from} can be read`);
  } else if (s.next?.kind === 'data') {
    head = { ready: false, date: s.next.date, dateText: `Waiting for data through ${longDate(s.next.date)}` };
    parts.push(
      `${count(s.next.pages.length || 1, 'page change has', 'page changes have')} finished the 28 day wait; Search Console data does not cover the 28 days after yet`
    );
  } else if (s.next?.kind === 'pending') {
    const n = s.next.pages.length;
    head = { ready: false, date: s.next.date, dateText: longDate(s.next.date) };
    parts.push(n > 1 ? `${n} page changes can be read then` : `${s.next.pages[0]} can be read then`);
  } else {
    if (!s.unreadable && !s.waitingForData && !verdictsWaiting(model).length) return null;
    head = { ready: false, date: null, dateText: 'None in sight' };
    parts.push('every change waiting for a verdict overlaps another edit so far');
  }
  if (s.waitingForData && s.next?.kind === 'now')
    parts.push(
      `${s.waitingForData === 1 ? '1 more waits' : `${s.waitingForData} more wait`} for data through ${longDate(s.waitThrough)}`
    );
  if (s.unreadableText) parts.push(s.unreadableText);
  return { ...head, note: parts.join('; ') };
}

// ---------------------------------------------------------------- opportunities

export const STATUSES = ['new', 'in-progress', 'snoozed', 'done', 'ignored', 'came-back'];

// status: one of STATUSES, 'open' (new, in progress or came back: the one definition of open the
// sidebar and the insight pages use), 'attention' (new only, an older address) or 'all'.
export function opportunitiesList(model, { type = '', status = '', page = '' } = {}) {
  const wantStatus = status === 'attention' ? 'new' : status;
  const wantPage = page ? pagePath(page) : '';
  const all = [
    ...activeOpps(model).map((o) => ({ ...decorateOpp(model, o), ...editPagesOf(model, o.id) })),
    ...goneOpps(model),
  ];
  // Workable first: an item on a page that may not be edited now comes after the others.
  const byPage = workableFirst(all.filter((o) => !wantPage || o.page === wantPage));
  const matchType = (o) => !type || type === 'all' || o.type === type;
  const matchStatus = (o) =>
    !wantStatus ||
    wantStatus === 'all' ||
    (wantStatus === 'open' ? OPEN_STATUSES.includes(o.status) : o.status === wantStatus);
  const byType = Object.fromEntries(Object.keys(TYPE_LABEL).map((t) => [t, 0]));
  const byStatus = Object.fromEntries([...STATUSES, 'open'].map((s) => [s, 0]));
  for (const o of byPage) {
    if (matchStatus(o)) byType[o.type] = (byType[o.type] ?? 0) + 1;
    if (matchType(o)) {
      byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
      if (OPEN_STATUSES.includes(o.status)) byStatus.open += 1;
    }
  }
  return {
    byPage,
    items: byPage.filter((o) => matchType(o) && matchStatus(o)),
    counts: { byType, byStatus },
  };
}

// The open opportunities: the sidebar's All opportunities count, and the Open view's All tab.
export const openOpportunityCount = (model) => opportunitiesList(model, { status: 'open' }).items.length;

// The opportunity types that have an insight page of their own, with the sidebar count (in that
// page's own unit) and the unit one row of All opportunities is. Internal links is left out: its
// page counts link suggestions (for runner-up pages too), which the Internal links tab on All
// opportunities shows with that same count.
export const INSIGHT_OF_TYPE = {
  'near-page-one': { route: 'runner-up', count: 'runnerUp', unit: ['search', 'searches'], row: ['search', 'searches'] },
  'competing-pages': {
    route: 'cannibalization',
    count: 'cannibalization',
    unit: ['search', 'searches'],
    row: ['search', 'searches'],
  },
  unserved: { route: 'content-gaps', count: 'contentGaps', unit: ['gap', 'gaps'], row: ['search', 'searches'] },
  slipping: { route: 'decay', count: 'decay', unit: ['page', 'pages'], row: ['page', 'pages'] },
};

const plural = (n, [one, many]) => `${n0(n)} ${n === 1 ? one : many}`;

// insightCounts: the /api/nav counts (the route passes them), so each type tab on the Open view
// shows the same number, in the same unit, as the sidebar and the insight page. `openRows` is how
// many rows of this list the type has in the Open view, and `countNote` says how the two meet when
// the units differ (a content gap is several searches).
export function opportunitiesView(model, filters, { insightCounts = null } = {}) {
  const { items, counts } = opportunitiesList(model, filters);
  const openRows = opportunitiesList(model, { status: 'open', page: filters?.page ?? '' }).counts.byType;
  return {
    // Searches that need the per-search counts are missing from the list when the counts are.
    ...withCountsWarning(model, envelope(model, { need: ['gsc', 'bing', 'local'] })),
    types: Object.entries(TYPE_LABEL).map(([type, label]) => {
      const ins = INSIGHT_OF_TYPE[type];
      const count = ins && insightCounts ? (insightCounts[ins.count] ?? null) : null;
      const rows = openRows[type] ?? 0;
      return {
        type,
        label,
        ...termOf(type),
        route: ins?.route ?? null,
        // The insight page's own count (open, in its unit), or null when the type has no page of its own.
        insightCount: count,
        unit: ins?.unit ?? ['opportunity', 'opportunities'],
        openRows: rows,
        countNote:
          count !== null && (count !== rows || ins.unit[0] !== ins.row[0])
            ? `${plural(count, ins.unit)} on the ${label} page, listed here as ${plural(rows, ins.row)}.`
            : null,
      };
    }),
    statuses: STATUSES,
    counts,
    items,
    // What the "Free to edit" filter (on by default) hides from these items: items on pages to leave
    // alone, and items held only because this week's one page edit is used. {page, week, text}.
    held: heldNoteOf(model, items),
  };
}

// The line under the Free to edit filter: "34 more are on pages to leave alone, and 20 more wait for
// next week's page edit, from 23 November." null when nothing is held.
export function heldNoteOf(model, items) {
  const page = items.filter((o) => o.held && o.heldKind === 'page').length;
  const week = items.filter((o) => o.held && o.heldKind === 'week').length;
  const parts = [
    page ? `${count(page, 'more is', 'more are')} on pages to leave alone` : null,
    week
      ? `${count(week, 'more waits', 'more wait')} for next week's page edit, from ${longDate(addDays(mondayOf(model.today), 7))}`
      : null,
  ].filter(Boolean);
  return { page, week, text: parts.length ? `${parts.join(', and ')}.` : null };
}

// ---------------------------------------------------------------- two pages competing

// Every search that shows two or more of our pages, from the same rule the opportunities use
// (rules.mjs splitSearches), as {split, together, noRank, missing}: the real splits (cannibalization),
// the searches where our pages are shown together in the same results (never cannibalization, no
// action), how many have no page ranking yet (left out), and whether the per-search counts are
// missing (then every list is empty). The keyword file's page for a search is found by matchKey.
export function splitGroups(model) {
  return memo(model, 'split-groups', () => {
    const all = model.data.gsc ? splitSearches({ gsc: model.data.gsc }, model.cfg) : [];
    if (!all) return { split: [], together: [], noRank: 0, missing: true };
    const registry = model.data.local?.registry ?? [];
    const byKey = new Map();
    for (const r of registry)
      if (r.primaryKeyword && matchKey(r.primaryKeyword) && !byKey.has(matchKey(r.primaryKeyword)))
        byKey.set(matchKey(r.primaryKeyword), r.url);
    const oppFor = new Map(model.opps.filter((o) => o.type === 'competing-pages').map((o) => [o.query, o.id]));
    const shape = (q) => {
      const registryPage = byKey.get(matchKey(q.query)) ?? null;
      const winner = registryPage ? q.pages[0].page === registryPage : null;
      return {
        query: q.query,
        impressions: q.impressions,
        pageViews: q.pageViews,
        ratio: q.ratio,
        kind: q.kind,
        topShare: Math.round(q.topShare * 100) / 100,
        registryPage,
        registryWins: winner,
        pages: q.pages.map((p) => ({
          page: p.page,
          share: Math.round(p.share * 100) / 100,
          impressions: p.impressions,
          position: p.position,
          isRegistryPage: registryPage ? p.page === registryPage : false,
        })),
        note: registryPage
          ? winner
            ? 'The page your keyword file names is already the top one. A split is fine if the pages answer different needs.'
            : `Your keyword file names ${registryPage} for this search, but another page is showing more. A split is fine if the pages answer different needs.`
          : 'No page in your keyword file targets this search. A split is fine if the pages answer different needs.',
        oppId: oppFor.get(q.query) ?? null,
      };
    };
    return {
      split: all.filter((q) => q.kind === 'split').map(shape),
      together: all.filter((q) => q.kind === 'together').map(shape),
      noRank: all.filter((q) => q.kind === 'no-rank').length,
      missing: false,
    };
  });
}

// The real splits: cannibalization.
export const competingList = (model) => splitGroups(model).split;

// The id of a split search: its opportunity's id, else the id the rules would give it. The founder's
// cannibalization choices are saved under it.
export const competingId = (c) => c.oppId ?? opportunityId('competing-pages', '', c.query);

// The pages a Done on a split search edits, by the founder's choice for it:
//   no choice       the page that should win (the recommendation strengthens it)
//   consolidate     the page that should win and every page folded into it
//   differentiate   the page whose angle was changed, when one is named; else none
//   leave alone     none
// {id, query, choice, shouldWin, pages, splitPages}, or null when `id` is not a split search the desk
// lists. A named page that is not part of the split is refused (400). One place decides this, so the
// Done guards, the freeze, the card's confirm and its eligibility all name the same pages.
export function splitEdit(model, id, page = null) {
  const c = competingList(model).find((x) => competingId(x) === id);
  if (!c) return null;
  const saved = readChoices()[id]?.choice;
  const choice = CHOICES.includes(saved) ? saved : null;
  const shouldWin = shouldWinOf(c.registryPage, c.pages);
  const splitPages = c.pages.map((p) => p.page);
  const named = page ? pagePath(page) : null;
  if (named && !splitPages.includes(named))
    throw Object.assign(new Error(`${named} is not one of the pages split over "${c.query}".`), { status: 400 });
  const others = splitPages.filter((p) => p !== shouldWin);
  const pages =
    choice === LEAVE_ALONE
      ? []
      : choice === 'consolidate'
        ? [shouldWin, ...others]
        : choice === 'differentiate'
          ? named
            ? [named]
            : []
          : [shouldWin];
  return { id, query: c.query, choice, shouldWin, pages: pages.filter(Boolean), splitPages };
}

// The split searches the founder chose to leave alone, that are still listed and still open:
// [{id, query, oppId, pages: [page]}].
export function leftAloneSplits(model) {
  const ids = leftAloneIds();
  if (!ids.size) return [];
  return competingList(model)
    .map((c) => ({ id: competingId(c), query: c.query, oppId: c.oppId, pages: c.pages.map((p) => p.page) }))
    .filter((c) => ids.has(c.id) && (!c.oppId || OPEN_STATUSES.includes(itemOf(model, c.oppId)?.status ?? 'new')));
}

// The ranked opportunities without the split searches the founder chose to leave alone. One place
// decides this, so the week, the Opportunities list, the proposal and the sidebar count agree. The
// left alone ones stay reachable through the cannibalization route's leftAlone list.
// It also leaves out an opportunity whose search another list owns (ext/insights.mjs ownership: one
// owner per search, so no search carries two cards).
export const activeOpps = (model) =>
  memo(model, 'active-opps', () => {
    const left = new Set(leftAloneSplits(model).map((c) => c.oppId));
    const { drop } = ownership(model);
    return left.size || drop.size ? model.opps.filter((o) => !left.has(o.id) && !drop.has(o.id)) : model.opps;
  });

export function competingView(model) {
  return {
    ...envelope(model, { need: ['gsc'] }),
    note: 'A search shared by two pages is only a problem when both pages answer the same need.',
    items: competingList(model),
  };
}
