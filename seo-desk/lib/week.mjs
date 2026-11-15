// The week: the five card proposal, worries, waiting, and the locked weekly plan.
// Everything except lockWeek, getWeek, setTop5 and weeks is pure given its inputs: no
// files, and no clock unless `today` is left out of worries or waiting (then today's
// date is read). lockWeek reads the clock only when no lockedAt is passed.

import crypto from 'node:crypto';
import { readJson, writeJson } from './store.mjs';
import { addDays, daysBetween, mondayOf, todayIso } from './dates.mjs';
import { SITE } from '../../scripts/lib/change-log-core.mjs';
import { eligibility, editThisWeek, recentEditText } from './lifecycle.mjs';
import { longDate, longRange, plain } from './text.mjs';
import { groupChanges, competitorWorries } from './competitor-changes.mjs';
import { readChanges, isBatchVerdict } from './changes.mjs';
import { LINKED_ENOUGH } from './inbound.mjs';

const OK_ELIGIBILITY = { eligible: true, from: null };

// How many cards the weekly proposal fills: 3 or 5 (the default), from state/settings.json.
export const PLAN_SIZES = [3, 5];
export const DEFAULT_PLAN_SIZE = 5;
export const planSizeOf = () => {
  const v = readJson('state/settings.json', null)?.planSize;
  return PLAN_SIZES.includes(v) ? v : DEFAULT_PLAN_SIZE;
};
const VERDICT_RECENT_DAYS = 28;
const DEFAULT_TEST = 'Judged by the 28 day before and after verdict, about 30 days after the edit.';

const SOURCE_NAME = {
  gsc: 'Search Console',
  bing: 'Bing Webmaster Tools',
  ga4: 'Google Analytics',
  clarity: 'Clarity',
  local: 'The repo files',
  dfs: 'DataForSEO',
};

const hash = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);
const count = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// The path for a change-log slug: a path stays a path, a registry row names its page, and a
// slug that is live only as an article is an article. Anything else is a blog post.
export function pageForSlug(slug, { registry = [], livePages = [] } = {}) {
  const s = String(slug ?? '');
  if (s.startsWith('/')) return s;
  const reg = registry.find((r) => r?.slug === s && r.url);
  if (reg) return reg.url;
  const live = new Set(livePages.map((p) => (typeof p === 'string' ? p : p?.page)));
  if (!live.has(`/blog/${s}`) && live.has(`/articles/${s}`)) return `/articles/${s}`;
  return `/blog/${s}`;
}
const pathOf = (fullUrl) => {
  const p = String(fullUrl).replace(SITE, '').split('#')[0];
  return p === '' ? '/' : p;
};

// ---------------------------------------------------------------- worries

// Most serious first. Used to order worries and to pick the one for the week.
const SERIOUS = [
  'dropped-from-index',
  'slipping-page',
  'verdict-worse',
  'crawl-issue',
  'registry-fail',
  'source-failed',
  'competitor-change',
];

// The index table: the index checks snapshot, or the one older Search Console snapshots carried.
const indexTable = (snaps) => snaps?.index?.data?.pages ?? snaps?.gsc?.data?.index ?? [];

function droppedFromIndex(snaps, prevSnaps) {
  const prev = new Map(indexTable(prevSnaps).map((r) => [r.page, r.verdict]));
  const through = snaps?.gsc?.through;
  return indexTable(snaps)
    .filter((r) => r.verdict === 'not-indexed' && prev.get(r.page) === 'indexed')
    .map((r) => ({
      id: `dropped-from-index:${r.page}`,
      kind: 'dropped-from-index',
      page: r.page,
      isPageEdit: false,
      title: `${r.page} dropped off Google`,
      measured: `Search Console said this page was on Google at the last check and now says it is not${
        r.reason ? ` (${plain(r.reason)})` : ''
      }. ${r.checkedAt ? `Checked on ${longDate(todayIso(new Date(r.checkedAt)))}` : `Checked through ${longDate(through)}`}.`,
      fix: 'Open the page in Search Console, run the URL inspection, make sure it still loads and still has links pointing to it, then request indexing.',
    }));
}

// The edit that holds a page back from a new change: a deliberate edit (the freeze) or a git edit of
// 15 or more lines in one commit the freeze does not know (recent, from lifecycle recentEdits). {since, until} or null.
export function holdOf(page, frozen, recent, today) {
  const f = page ? frozen?.get(page) : null;
  if (f && f.until > today) return { since: f.since, until: f.until, found: 'freeze' };
  const r = page ? recent?.get(page)?.edit : null;
  if (r && r.until > today) return { since: r.date, until: r.until, found: 'git', lines: r.lines };
  return null;
}

// The one sentence a worry on a page that was just edited says instead of a fix: never edit or undo
// now, it is too early to judge, and when to look again.
const holdFix = (h) =>
  `This page was edited on ${longDate(h.since)}${h.found === 'git' ? ' (found in git)' : ''}, so it is too early to judge. Leave it alone and look again on ${longDate(h.until)}.`;
const holdTest = (h) =>
  `Look again on ${longDate(h.until)}, when the 28 days after the ${longDate(h.since)} edit are over.`;

// The change on `page` that Did it work has not judged yet and judges last: {changeDate, judgeFrom} with
// judgeFrom after today, or null. pending: Map<page, [{changeDate, judgeFrom}]> or Map<page, one entry>.
function pendingOf(page, pending, today) {
  const v = page ? pending?.get(page) : null;
  const list = (Array.isArray(v) ? v : v ? [v] : []).filter((x) => x?.judgeFrom > today && x.changeDate);
  return list.sort((a, b) => a.judgeFrom.localeCompare(b.judgeFrom)).pop() ?? null;
}
const pendingFix = (p) =>
  `This page changed on ${longDate(p.changeDate)} and that change is judged from ${longDate(p.judgeFrom)}. Leave it alone until then.`;
const pendingTest = (p) =>
  `Look again on ${longDate(p.judgeFrom)}, when the verdict on the ${longDate(p.changeDate)} change can be read.`;

// The recommendation without its leading "Hypothesis:" label.
const unlabelled = (s) => {
  const t = plain(s).replace(/^Hypothesis:\s*/i, '');
  return t ? t[0].toUpperCase() + t.slice(1) : t;
};

// "Google's August core update (from 10 November) fell inside these dates" for a list of updates.
const updatesText = (list) => {
  const names = list.map((u) => `${plain(u.label)} (from ${longDate(u.date)})`);
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0];
};

// Built from the ranked opportunities, so there is one slipping rule (in rules.mjs).
// The worry carries oppId so it and the opportunity card are one and the same card. The first three
// the founder has not finished, ignored or snoozed are taken, so a Done clears the worry and the
// next one moves up. decay: Map<oppId, {dropKindLabel, dropKindWhy, recommendation, updates, lastEdit}>
// from the Decay page (the same kind of drop and recommendation its card shows, the Google ranking
// updates inside the compared dates and the page's last edit inside them).
//
// A worry is something that needs a look this week. A slipping page whose own advice is to leave it
// (it was just edited, or fewer people are searching and there may be nothing to fix) is not one: it
// is marked watch, with the reason in plain words, and the week shows it under "Watching". The first
// three that need a look are the worries; up to WATCH_MAX others are watched.
const WATCH_MAX = 5;
//
// A page with a change that Did it work has not judged yet (pending: Map<page, {changeDate, judgeFrom}>,
// the latest such change) is watched too: the repo's own records already answer it, because a new
// edit before that verdict would muddy it. So is a page the plan already has an open improvement for
// (plan.improve): the plan decides what happens to it, and it comes up as the week's page edit in turn.
function slippingPages(opps, { frozen, recent, today, items, decay, pending, plan }) {
  const planned = new Map((plan?.improve ?? []).filter((r) => !r.done && r.page).map((r) => [r.page, r]));
  let need = 0;
  let watched = 0;
  return (opps ?? [])
    .filter((o) => o.type === 'slipping' && available(o.id, items, today))
    .map((o) => {
      const d = decay?.get(o.id) ?? null;
      const hold = holdOf(o.page, frozen, recent, today);
      const p = !hold ? pendingOf(o.page, pending, today) : null;
      const row = !hold && !p ? planned.get(o.page) : null;
      const watch = hold
        ? `Edited on ${longDate(hold.since)}, so it is too early to judge. Look again on ${longDate(hold.until)}.`
        : p
          ? `Changed on ${longDate(p.changeDate)}, and Did it work judges that change from ${longDate(p.judgeFrom)}. A new edit before then would muddy that verdict, so look again on ${longDate(p.judgeFrom)}.`
          : row
            ? `Your plan already lists a change for this page${plain(row.todo) ? ` (${plain(row.todo).replace(/[.\s]+$/, '')})` : ''}, so it comes up as the week's page edit in its turn.`
            : d?.dropKind === 'lost-demand'
              ? 'Its place held while its views fell, so fewer people may be searching for this. There may be nothing to fix.'
              : null;
      if (watch ? watched >= WATCH_MAX : need >= 3) return null;
      if (watch) watched += 1;
      else need += 1;
      const notes = [];
      if (d?.dropKindLabel) notes.push(`Kind of drop: ${plain(d.dropKindLabel)}. ${plain(d.dropKindWhy)}`.trim());
      if (d?.lastEdit) notes.push(`The page was last edited on ${longDate(d.lastEdit)}, inside these dates.`);
      if (d?.updates?.length)
        notes.push(
          `Google's ${updatesText(d.updates)} fell inside these dates, so read this drop with care. That does not show the update caused it.`
        );
      return {
        id: `slipping-page:${o.page}`,
        kind: 'slipping-page',
        page: o.page,
        oppId: o.id,
        isPageEdit: true,
        title: plain(o.title),
        measured: [plain(o.measured), ...notes].join(' '),
        fix: hold
          ? holdFix(hold)
          : p
            ? pendingFix(p)
            : row
              ? 'Leave it to the plan: its improvement for this page is the page edit to make.'
              : unlabelled(d?.recommendation) || plain(o.action),
        // The test is the Decay card's own, so the worry and the card ask for the same check.
        ...(hold
          ? { test: holdTest(hold), waitUntil: hold.until }
          : p
            ? { test: pendingTest(p), waitUntil: p.judgeFrom }
            : plain(d?.test) || plain(o.test)
              ? { test: plain(d?.test) || plain(o.test) }
              : {}),
        ...(watch ? { watch } : {}),
      };
    })
    .filter(Boolean);
}

function failedSources(sources) {
  return (sources ?? [])
    .filter((s) => s.status === 'failed' || s.status === 'needs-sign-in')
    .map((s) => {
      const name = SOURCE_NAME[s.source] ?? s.source;
      const signIn = s.status === 'needs-sign-in';
      return {
        id: `source-failed:${s.source}`,
        kind: 'source-failed',
        page: null,
        isPageEdit: false,
        title: signIn ? `${name} needs you to sign in again` : `${name} did not refresh`,
        measured: plain(s.error) || (signIn ? 'The sign in has expired.' : 'The last pull failed.'),
        fix: signIn
          ? `Sign in to ${name} again, then press Refresh now.`
          : 'Press Refresh now. If it fails again, the Settings page shows the error.',
      };
    });
}

function crawlIssues(snaps) {
  return (snaps?.bing?.data?.crawlIssues ?? []).map((c) => {
    const page = pathOf(c.url);
    return {
      id: `crawl-issue:${c.url}|${c.issue}`,
      kind: 'crawl-issue',
      page,
      isPageEdit: false,
      title: `Bing reports a crawl problem on ${page}`,
      measured: `Bing Webmaster Tools says: ${plain(c.issue)}.`,
      fix: 'Open the page in Bing Webmaster Tools, fix what it names (usually a block, a redirect or an error), then ask Bing to crawl it again.',
    };
  });
}

// One worry per competitor that made a change worth reading (a price, a headline, a title, a
// description, a button, a pricing page that appeared) that the founder has not marked Seen and the
// competitor dossier does not already note for that host.
// Lists that repeat on several pages, small text changes and pricing sentinels answering 404 are
// not worries; they show on the Competitors page only (see lib/competitor-changes.mjs).
function competitorChanges(snaps, today, items) {
  const c = snaps?.local?.data?.competitors;
  const snapshots = c?.snapshots ? new Set(c.snapshots.map((s) => s.url)) : null;
  return competitorWorries(groupChanges(c?.watch ?? [], snapshots), {
    items,
    today,
    dossierLog: c?.dossierLog ?? [],
  });
}

function registryFailures(snaps) {
  const data = snaps?.local?.data;
  const out = [];
  for (const w of data?.warnings ?? []) {
    if (/^registry/i.test(w)) {
      out.push({
        id: `registry-fail:${hash(w)}`,
        kind: 'registry-fail',
        page: null,
        isPageEdit: false,
        title: 'Your keyword file could not be read',
        measured: plain(w),
        fix: 'Open docs/seo/keyword-registry.json and fix the file, then press Refresh now.',
      });
    }
  }
  const live = new Set((data?.livePages ?? []).map((p) => p.page));
  if (live.size) {
    for (const r of data?.registry ?? []) {
      if (r.url && !live.has(r.url)) {
        out.push({
          id: `registry-fail:${r.url}`,
          kind: 'registry-fail',
          page: r.url,
          isPageEdit: false,
          title: `Your keyword file names ${r.url}, which is not live`,
          measured: `Target keyword "${plain(r.primaryKeyword)}" points at a page that is not in the live sitemap.`,
          fix: 'Check whether the page was renamed, still a draft or deleted, then fix its row in the keyword file or publish the page.',
        });
      }
    }
  }
  return out;
}

const isBatch = isBatchVerdict;

// A worse verdict that is clean (no other change landed in its 28 days): an observation, never "made
// things worse", with the cautions Did it work shows. Each change is read once, the way Did it work
// reads it (lib/changes.mjs readChanges): only a change that reads worse is a worry, through the rows
// its reading came from. A change that reads mixed, or cannot be read, raises none. cautionsOf(v)
// gives the caution sentences for one verdict row (the control, a Google ranking update inside its
// dates, a one week spike in the before window).
function worseVerdicts(snaps, { frozen, recent, today, cautionsOf }) {
  const local = snaps?.local?.data ?? {};
  const rows = local.verdicts ?? [];
  const used = readChanges(rows)
    .changes.filter((c) => c.word === 'worse')
    .flatMap((c) => c.used.map((i) => rows[i]));
  return used
    .filter((v) => v.judgedOn && daysBetween(v.judgedOn, today) <= VERDICT_RECENT_DAYS)
    .map((v) => {
      const numbers = (who, were) =>
        `In the 28 days before the change ${who} ${were} shown ${v.before?.impressions ?? 0} times at an average place of ${
          v.before?.position ?? 'unknown'
        }. In the 28 days after, ${v.after?.impressions ?? 0} times at ${v.after?.position ?? 'unknown'}. Judged on ${longDate(v.judgedOn)}.`;
      const cautions = (cautionsOf?.(v) ?? []).map(plain).filter(Boolean);
      const caution = cautions.length ? ` ${cautions.join(' ')}` : '';
      if (isBatch(v)) {
        const pages = (v.pages ?? []).map(String);
        const named = pages.slice(0, 3).join(', ');
        const more = pages.length > 3 ? ` and ${pages.length - 3} more` : '';
        return {
          id: `verdict-worse:${v.slug}|${v.changeDate}`,
          kind: 'verdict-worse',
          page: null,
          isPageEdit: false,
          title: `After the ${longDate(v.changeDate)} change these ${count(pages.length, 'page', 'pages')} read worse`,
          measured: `${numbers('the pages together', 'were')} The pages: ${named}${more}.${caution}`,
          fix: 'Open Did it work and look at each page in the batch before touching any of them again. The numbers show the pages read worse after the change; they do not show the change caused it.',
          test: 'A new verdict can be read about 30 days after the next change to one of these pages.',
        };
      }
      const page = v.url ?? pageForSlug(v.slug, local);
      const hold = holdOf(page, frozen, recent, today);
      return {
        id: `verdict-worse:${v.slug}|${v.changeDate}`,
        kind: 'verdict-worse',
        page,
        isPageEdit: true,
        title: `After the ${longDate(v.changeDate)} change ${page} reads worse`,
        measured: `${numbers('the page', 'was')}${caution}`,
        fix: hold
          ? holdFix(hold)
          : 'Compare the old and new versions of the page, and undo a part only if it plainly hurt. The numbers show the page reads worse after the change; they do not show the change caused it.',
        test: hold
          ? `The next verdict on this page can be read on ${longDate(addDays(hold.since, 30))}.`
          : 'A new verdict on this page can be read about 30 days after its next change.',
        ...(hold
          ? {
              waitUntil: hold.until,
              // Nothing to do this week: the week shows it under "Watching", not as a worry.
              watch: `Edited on ${longDate(hold.since)}, so it is too early to judge. Look again on ${longDate(hold.until)}.`,
            }
          : {}),
      };
    });
}

// snaps and prevSnaps: {gsc, bing, local, ...} snapshot objects (the shape in data/snap).
// sources: the list from sourceStatus(). opps: the ranked opportunities, best first
// (the slipping worries are its first three of type slipping). Missing inputs are fine.
// recent: the git edits the freeze does not know (lifecycle recentEdits); a worry on such a page, or
// on a frozen one, says to leave it alone until a date (waitUntil) instead of a fix. decay and
// cautionsOf: see slippingPages and worseVerdicts. pending: the changes Did it work has not judged yet,
// by page, and plan: the plan file (its open improve rows); see slippingPages.
export function worries({
  snaps = {},
  prevSnaps = {},
  sources = [],
  frozen = new Map(),
  recent = new Map(),
  opps = [],
  items = {},
  decay = new Map(),
  cautionsOf = () => [],
  pending = new Map(),
  plan = null,
  today = todayIso(),
} = {}) {
  const all = [
    ...droppedFromIndex(snaps, prevSnaps),
    ...slippingPages(opps, { frozen, recent, today, items, decay, pending, plan }),
    ...worseVerdicts(snaps, { frozen, recent, today, cautionsOf }),
    ...crawlIssues(snaps),
    ...registryFailures(snaps),
    ...failedSources(sources),
    ...competitorChanges(snaps, today, items),
  ];
  return all.sort((a, b) => SERIOUS.indexOf(a.kind) - SERIOUS.indexOf(b.kind));
}

// ---------------------------------------------------------------- waiting

// Verdicts still pending and pages frozen, soonest first. Nothing here needs action.
// verdictsDue: [{page|url|slug, date|judgeFrom}] for edits whose verdict is not ready yet (the
// pending edits on Did it work). One page can wait on two verdicts (two edits on two days), so a
// verdict is one page on one date.
export function waiting({ verdictsDue = [], frozen = new Map(), plan = null, today = todayIso() } = {}) {
  const out = [];
  const seen = new Set();
  const addVerdict = (page, date) => {
    if (!page || !date || seen.has(`${page}|${date}`)) return;
    seen.add(`${page}|${date}`);
    out.push({ title: `Verdict on ${page}`, date, kind: 'verdict' });
  };
  for (const v of verdictsDue)
    addVerdict(v.page ?? v.url ?? (v.slug ? `/blog/${v.slug}` : null), v.date ?? v.judgeFrom);
  for (const [page, f] of frozen) {
    addVerdict(page, addDays(f.until, 2));
    out.push({ title: `${page} can be edited again`, date: f.until, kind: 'frozen' });
  }
  for (const row of plan?.improve ?? []) {
    if (row.done && row.judgeFrom && row.judgeFrom >= today) addVerdict(row.page, row.judgeFrom);
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}

// ---------------------------------------------------------------- the five

// An opportunity is on offer unless the founder finished, ignored or snoozed it.
function available(id, items, today) {
  const item = items?.[id];
  if (!item) return true;
  if (item.status === 'done' || item.status === 'ignored') return false;
  if (item.status === 'snoozed' && item.snoozeUntil && item.snoozeUntil > today) return false;
  return true;
}

// opts: {recent, week} for eligibility (lifecycle.mjs): the git edits the freeze does not know, and
// whether this week's used page edit holds the card back.
export function oppCard(o, slot, frozen, today, opts = {}) {
  return {
    id: `opp:${o.id}`,
    slot,
    title: plain(o.title),
    measured: plain(o.measured),
    action: plain(o.action),
    test: plain(o.test) || DEFAULT_TEST,
    page: o.page ?? null,
    isPageEdit: Boolean(o.isPageEdit),
    source: 'opportunity',
    oppId: o.id,
    eligibility: eligibility(o, frozen, today, opts),
  };
}

function postCard(post) {
  return {
    id: `plan-post-${post.n}`,
    slot: 'new-post',
    title: plain(post.title),
    measured: `Post ${post.n} of the plan, the first one not yet written. Target search: "${plain(post.keyword)}".`,
    action: `Write this post with the blog pipeline, aimed at "${plain(post.keyword)}".`,
    test: 'Check in Search Console about four weeks after it goes live whether the post shows up for that search.',
    page: null,
    isPageEdit: false,
    source: 'plan',
    oppId: null,
    eligibility: OK_ELIGIBILITY,
  };
}

function improveCard(row, frozen, today, opts = {}) {
  return {
    id: `plan-improve-${row.page}`,
    slot: 'page-edit',
    title: `Improve ${row.page}`,
    measured: `The plan notes: ${plain(row.search)}.`.replace(/\.\.$/, '.'),
    action: plain(row.todo) || 'Improve the page as the plan describes.',
    test: DEFAULT_TEST,
    page: row.page,
    isPageEdit: true,
    source: 'plan',
    oppId: null,
    eligibility: eligibility({ isPageEdit: true, page: row.page }, frozen, today, opts),
  };
}

// The due entries split by whether Search Console data covers each one's 28 days after the change: an
// entry is ready to judge only when `through` (the last day the data reaches) is on or after the last
// of those days. {ready, waiting, waitThrough}: waitThrough is the latest day the waiting ones need.
// Without `through` every entry is ready.
export function splitDue(due = [], through = null) {
  const endOf = (d) => addDays(d.date ?? d.changeDate, 28);
  const ready = [];
  const waiting = [];
  for (const d of due ?? []) (!through || endOf(d) <= through ? ready : waiting).push(d);
  const waitThrough = waiting.map(endOf).sort().pop() ?? null;
  return { ready, waiting, waitThrough };
}

// What the due entries are: page changes, how many commits made them (a commit that touched several
// pages is one), how many were logged by hand, and how many other edits overlap.
// due: change-log entries ({date, commits: [{hash}], notes, overlapping}).
export function dueCounts(due = []) {
  const commits = new Set();
  let byHand = 0;
  for (const d of due) {
    const hashes = (d.commits ?? []).map((c) => c?.hash).filter(Boolean);
    if (!hashes.length) byHand += 1;
    for (const h of hashes) commits.add(h);
  }
  return { changes: due.length, commits: commits.size, byHand, overlapping: due.filter((d) => d.overlapping).length };
}

// The sentence for the due entries: "12 page changes from 6 commits, made 2 to 15 October, have
// finished the 28 day wait and have no verdict yet. All 12 overlap another change, ..."
export function dueSentence(due = []) {
  const c = dueCounts(due);
  const n = c.changes;
  const dates = due
    .map((d) => d.date ?? d.changeDate)
    .filter(Boolean)
    .sort();
  const from = [
    c.commits ? `from ${count(c.commits, 'commit', 'commits')}` : '',
    c.byHand ? `${c.commits ? 'and ' : ''}${c.byHand} logged by hand` : '',
  ]
    .filter(Boolean)
    .join(' ');
  const made = dates.length ? `, made ${longRange(dates[0], dates[dates.length - 1])},` : '';
  const head = `${count(n, 'page change', 'page changes')}${from ? ` ${from}` : ''}${made} ${n === 1 ? 'has' : 'have'} finished the 28 day wait and ${n === 1 ? 'has' : 'have'} no verdict yet.`;
  if (!c.overlapping) return head;
  const which =
    c.overlapping === n ? (n === 1 ? 'It overlaps' : `All ${n} overlap`) : `${c.overlapping} of them overlap`;
  return `${head} ${which} another change in the same 28 days, so ${c.overlapping === 1 ? 'that verdict' : 'those verdicts'} cannot be read as the result of one edit.`;
}

// The verdict card: only when at least one page change is ready to judge now (Search Console data
// covers its 28 days after). How many page changes from how many commits, and how many more wait for
// data. Otherwise null: the Next verdict tile carries the date. A verdict card reports, so it has no
// eligibility chip and no Hypothesis chip.
function verdictCard(due, through = null) {
  const { ready, waiting: short, waitThrough } = splitDue(due, through);
  if (!ready.length) return null;
  const waitLine = short.length
    ? `${short.length === 1 ? '1 more is' : `${short.length} more are`} waiting for Search Console data through ${longDate(waitThrough)}.`
    : '';
  const n = ready.length;
  return {
    id: 'verdict-due',
    slot: 'verdict',
    title: n === 1 ? 'Check whether one past page change worked' : `Check whether ${n} past page changes worked`,
    measured: [dueSentence(ready), waitLine].filter(Boolean).join(' '),
    action: 'Open Did it work and press Judge now. It shows the result before anything is saved.',
    test: 'Each verdict compares the 28 days before and after the edit, against how the typical page moved.',
    page: null,
    isPageEdit: false,
    source: 'verdict',
    oppId: null,
    eligibility: null,
    hypothesis: false,
  };
}

// opts: {recent, week} for the eligibility of a worry on a page (see oppCard).
export function worryCard(w, frozen, today, opts = {}) {
  // A competitor change is not a hypothesis: reading a page is the whole job. It has no test, no
  // eligibility chip and no page of ours, and it carries the pages to open.
  if (w.kind === 'competitor-change') {
    return {
      id: w.id,
      slot: 'worry',
      title: plain(w.title),
      measured: plain(w.measured),
      action: plain(w.fix),
      page: null,
      isPageEdit: false,
      source: 'worry',
      oppId: null,
      eligibility: null,
      hypothesis: false,
      competitor: w.competitor,
    };
  }
  return {
    id: w.oppId ? `opp:${w.oppId}` : w.id,
    slot: 'worry',
    title: plain(w.title),
    measured: plain(w.measured),
    action: plain(w.fix),
    test: plain(w.test) || 'Check the same number again after the next daily refresh.',
    page: w.page ?? null,
    isPageEdit: Boolean(w.isPageEdit),
    source: 'worry',
    oppId: w.oppId ?? null,
    eligibility: w.isPageEdit ? eligibility({ isPageEdit: true, page: w.page }, frozen, today, opts) : OK_ELIGIBILITY,
    ...(w.waitUntil ? { waitUntil: w.waitUntil } : {}),
  };
}

// The deliberate page edit dated inside the week of `today` lives in lifecycle.mjs with the rest of
// the freeze rule; it is exported here too for the modules that import it from this one.
export { editThisWeek };

// The one line the week shows above the five once this week's page edit is used, instead of a card:
// "This week's page edit is used (/page, 9 November). The next one can go in from 16 November." Null
// while the week's edit is still unused.
export function editStatusOf(frozen, today) {
  const edit = editThisWeek(frozen, today);
  if (!edit) return null;
  return `This week's page edit is used (${edit.page}, ${longDate(edit.since)}). The next one can go in from ${longDate(addDays(mondayOf(today), 7))}.`;
}

const openWorkId = (w) => `open-${hash(w.text)}`;
const openWorkTitle = (w) =>
  plain(w.text)
    .split(/(?<=[.:])\s/)[0]
    .slice(0, 120);

// Words that mark an open work row as not a task for this week: it is held, settled, deferred, left
// alone on purpose, blocked until something else happens, or a known gap nothing depends on.
const NOT_NOW =
  /\b(stays? held|is held|held until|on hold|settled|deferred|leave (it|for now)|left alone|until|do not run early|no live copy depends)\b/i;
const SCHEDULED = /scheduled|do not run early/i;
// Sections that hold notes rather than tasks: known gaps in the strategy files and housekeeping notes.
const NOTES = /known gaps|housekeeping/i;
// A row about posts or drafts: the plan file decides which posts are written, so it is never a task
// for the week.
const POSTS = /content pipeline/i;
const DRAFTS = /\bdrafts?\b/i;

// Whether an open work row is a real task for the week of `today`: not waiting on the founder, not
// marked held, settled, deferred, left alone or blocked until something else, not a question (a
// question mark before its first full stop), not a note (a known gaps or housekeeping section), not
// about posts or drafts (the plan decides those), and, in a "Scheduled" section, dated inside this
// week (a row there is due only in its own week).
export function isOpenWorkTask(row, today) {
  const text = plain(row?.text);
  const section = plain(row?.section);
  if (!text || row.blockedOnFounder) return false;
  if (NOT_NOW.test(text)) return false;
  if (/^[^.:]*\?/.test(text)) return false;
  if (NOTES.test(section) || POSTS.test(section) || DRAFTS.test(text)) return false;
  if (SCHEDULED.test(section)) {
    const date = text.match(/\d{4}-\d{2}-\d{2}/)?.[0];
    const monday = mondayOf(today);
    return Boolean(date) && date >= monday && date <= addDays(monday, 6);
  }
  return true;
}

// Open work rows that wait on the founder, for the page's "Waiting on you" list.
export function blockedOnYou(openWork = []) {
  return openWork
    .filter((w) => w.blockedOnFounder)
    .map((w) => ({ id: openWorkId(w), title: openWorkTitle(w), section: plain(w.section) }));
}

export function openWorkCard(w) {
  return {
    id: openWorkId(w),
    slot: 'other',
    title: openWorkTitle(w),
    measured: `From docs/seo/OPEN-WORK.md, section "${plain(w.section)}".`,
    action: plain(w.text),
    test: 'Done when the item is closed in OPEN-WORK.md.',
    page: null,
    isPageEdit: false,
    source: 'open-work',
    oppId: null,
    eligibility: OK_ELIGIBILITY,
  };
}

// The worry kinds that mean something is broken: they come first in the five.
export const BROKEN_KINDS = [
  'dropped-from-index',
  'source-failed',
  'registry-fail',
  'crawl-issue',
  'competitor-change',
];
const BROKEN_MAX = 2;
const AUDIT_URGENT = ['critical', 'high'];
const AUDIT_SETUP = ['critical', 'high', 'medium'];
const SEVERITY_WORD = { critical: 'critical', high: 'high', medium: 'medium', low: 'low' };

// The first sentence of a card's evidence, for its "why".
const firstSentence = (s) => plain(s).split(/(?<=[.!?])\s/)[0] ?? '';

export const WHY = {
  broken: 'It is broken, so it comes first.',
  post: 'It is the next post in your plan.',
  pinned: 'You pinned it for this week, and its page can be edited now.',
  planRow: 'It is the first open page improvement in your plan, and its page can be edited now.',
  bestEdit: (measured) => `It is the best page edit that can go in this week: ${firstSentence(measured)}`,
  verdict: (n) => `${n === 1 ? 'A past change is' : `${n} past changes are`} ready to judge now.`,
  index: (n) =>
    `${n === 1 ? 'This page already has' : 'These pages already have'} enough links, so asking Google is the step left, and it is not a page edit.`,
  links: "It is the best ranked page that needs links, and adding a link does not count as this week's page edit.",
  openWork:
    'It is an open item in docs/seo/OPEN-WORK.md that is not held, settled, scheduled for later or waiting on you.',
  auditSetup: "It is a setup fix from the technical audit, so it does not count as this week's page edit.",
};

const listOf = (items) =>
  items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}` : (items[0] ?? '');

// One card for the pages Google left out that already have LINKED_ENOUGH links or more from our own
// page text (the not-indexed cards whose advice is to ask Google): asking is the step left.
function askIndexCard(opps) {
  const pages = opps.map((o) => o.page);
  const named = opps.map((o) => `${o.page} (${count(o.inbound, 'page links', 'pages link')} to it)`);
  return {
    id: `ask-to-index:${hash(pages.join('|'))}`,
    slot: 'other',
    title: pages.length === 1 ? `Ask Google to index ${pages[0]}` : `Ask Google to index ${pages.length} pages`,
    measured: `Search Console says ${pages.length === 1 ? 'this page is' : 'these pages are'} not indexed, and ${pages.length === 1 ? 'it already has' : 'each already has'} ${LINKED_ENOUGH} or more links from the text of our own pages: ${listOf(named)}. Menu and footer links are not counted.`,
    action: `In Search Console, run the URL inspection on ${listOf(pages)}, then press Request indexing.`,
    test: 'Judged by whether Search Console reports each page as indexed within 14 days.',
    page: pages.length === 1 ? pages[0] : null,
    isPageEdit: false,
    source: 'index',
    oppId: null,
    eligibility: OK_ELIGIBILITY,
  };
}

// One card for the technical audit findings at critical or high: how many, and the worst one.
// audit: {startedAt, issues: [{id, name, severity, setup, pages (a count)}]}, worst first.
function auditUrgentCard(audit) {
  const urgent = (audit?.issues ?? []).filter((i) => AUDIT_URGENT.includes(i.severity));
  if (!urgent.length) return null;
  const worst = urgent[0];
  const n = urgent.length;
  return {
    id: `audit-urgent:${audit.startedAt}`,
    slot: 'broken',
    title: `${n} technical audit ${n === 1 ? 'finding needs' : 'findings need'} fixing first`,
    measured: `The technical audit of ${longDate(todayIso(new Date(audit.startedAt)))} found ${count(n, 'finding', 'findings')} at critical or high. The worst is "${plain(worst.name)}" (${SEVERITY_WORD[worst.severity]}), on ${count(worst.pages, 'page', 'pages')}.`,
    action:
      "Open Technical audit and fix the worst one first. A fix that edits a page's title or text counts as that week's one page edit; site-wide and server fixes do not.",
    test: 'Judged by the next technical audit run.',
    page: null,
    isPageEdit: false,
    source: 'audit',
    oppId: null,
    eligibility: OK_ELIGIBILITY,
  };
}

// One card per technical audit setup finding at medium or above (a change to the site's setup, never a
// page edit).
function auditSetupCards(audit) {
  return (audit?.issues ?? [])
    .filter((i) => i.setup && AUDIT_SETUP.includes(i.severity))
    .map((i) => ({
      id: `audit-setup:${i.id}`,
      slot: 'other',
      title: `Setup fix: ${plain(i.name)}`,
      measured: `The technical audit of ${longDate(todayIso(new Date(audit.startedAt)))} found this at ${SEVERITY_WORD[i.severity]}, on ${count(i.pages, 'page', 'pages')}.`,
      action: "Open Technical audit and follow its steps. It is a change to the site's setup, not to a page.",
      test: 'Judged by the next technical audit run.',
      page: null,
      isPageEdit: false,
      source: 'audit',
      oppId: null,
      eligibility: OK_ELIGIBILITY,
    }));
}

// The week's priorities, at most `size` (3 or 5, a ceiling and never a target: the list is never
// padded). Every card passes three tests: the founder can act on it this week, its evidence holds, and
// the repo's own records do not already answer it. Most important first:
//   1. broken things (BROKEN_KINDS worries, and one card for the technical audit's critical and high
//      findings), two at most;
//   2. the plan's next unwritten post;
//   3. the week's one live page edit, only while it is unused: a pinned one, else the plan's first open
//      improve row, else the best eligible page edit opportunity. A slipping page qualifies only when it
//      is a real worry (in `worries`, which holds no watched page). When the week's edit is used there
//      is no card: editStatusOf gives the line the page prints instead;
//   4. a verdict card, only when a change is ready to judge now;
//   5. tasks that are not page edits: one card asking Google to index the pages not on Google that have
//      enough links, the best page that needs links, open work rows that are real tasks this week, and
//      technical audit setup findings at medium or above.
// "Write a post" ideas (content gaps, questions, AI answers) are never proposed: the plan file decides
// which posts get written. Each card carries `why`, one plain sentence on why it is in this week's list.
// ranked: opportunities with .score, best first. due: change-log entries ready to judge. recent: the git
// edits the freeze does not know (lifecycle recentEdits): such a page is not offered. audit: the latest
// technical audit ({startedAt, issues: [{id, name, severity, setup, pages}]}, worst first) or null.
// pending is kept for the callers that still pass it; the next verdict date lives on the tile.
export function proposeTop5({
  plan,
  ranked = [],
  due = [],
  worries: worryList = [],
  openWork = [],
  frozen = new Map(),
  recent = new Map(),
  items = {},
  today,
  size = DEFAULT_PLAN_SIZE,
  through = null,
  audit = null,
}) {
  const opts = { recent };
  const ok = (o) => eligibility(o, frozen, today, opts).eligible;
  const open = (id) => available(id, items, today);
  const cards = [];
  const add = (card, why) => cards.push({ ...card, why });
  const week = mondayOf(today);
  const pinned = (o) => items?.[o.id]?.pinnedWeek === week;
  const ordered = [...ranked.filter(pinned), ...ranked.filter((o) => !pinned(o))].filter((o) => open(o.id));

  // 1. Broken things, two at most.
  const brokenCards = [
    ...worryList
      .filter((w) => BROKEN_KINDS.includes(w.kind) && w.fix && !w.watch && open(w.oppId ?? w.id))
      .map((w) => ({ ...worryCard(w, frozen, today, opts), slot: 'broken' })),
    ...[auditUrgentCard(audit)].filter((c) => c && open(c.id)),
  ];
  for (const c of brokenCards.slice(0, BROKEN_MAX)) add(c, WHY.broken);

  // 2. The plan's next unwritten post.
  const post = (plan?.posts ?? []).find((p) => !p.done);
  if (post && open(`plan-post-${post.n}`)) add(postCard(post), WHY.post);

  // 3. The week's one live page edit, only while it is unused. A slipping page qualifies only when it
  //    is a real worry; it then comes as that worry's card (the same id as its opportunity).
  const slipWorry = new Map(
    worryList.filter((w) => w.kind === 'slipping-page' && w.oppId && !w.watch).map((w) => [w.oppId, w])
  );
  const qualifies = (o) => o.type !== 'slipping' || slipWorry.has(o.id);
  if (!editThisWeek(frozen, today)) {
    const pinnedEdits = ordered.filter((o) => o.isPageEdit && pinned(o) && qualifies(o));
    const pinnedOk = pinnedEdits.find(ok);
    const pinnedBlocked = pinnedEdits.find((o) => !ok(o));
    const row = (plan?.improve ?? []).find(
      (r) => !r.done && open(`plan-improve-${r.page}`) && ok({ isPageEdit: true, page: r.page })
    );
    const asCard = (o) => {
      const w = slipWorry.get(o.id);
      return w
        ? { ...worryCard(w, frozen, today, opts), slot: 'page-edit' }
        : oppCard(o, 'page-edit', frozen, today, opts);
    };
    let editCard = null;
    let why = null;
    if (pinnedOk) {
      editCard = asCard(pinnedOk);
      why = WHY.pinned;
    } else if (row) {
      editCard = improveCard(row, frozen, today, opts);
      why = WHY.planRow;
    } else {
      const best = ordered.find((o) => o.isPageEdit && qualifies(o) && ok(o));
      if (best) {
        editCard = asCard(best);
        why = WHY.bestEdit(editCard.measured);
      }
    }
    if (editCard) {
      if (!pinnedOk && pinnedBlocked) {
        const e = eligibility(pinnedBlocked, frozen, today, opts);
        editCard.note = e.recentEdit
          ? `Pinned item: ${recentEditText(e.recentEdit)}`
          : `Pinned item is frozen until ${longDate(e.from)}`;
      }
      add(editCard, why);
    }
  }

  // 4. A verdict card, only when a change is ready to judge now.
  const v = verdictCard(due, through);
  if (v && open(v.id)) add(v, WHY.verdict(splitDue(due, through).ready.length));

  // 5. Tasks that are not page edits, best first.
  const tasks = [];
  const linked = ordered.filter(
    (o) => o.type === 'not-indexed' && o.adviceGroup === 'not-indexed-linked' && (o.inbound ?? 0) >= LINKED_ENOUGH
  );
  if (linked.length) tasks.push([askIndexCard(linked), WHY.index(linked.length)]);
  const links = ordered.find((o) => o.type === 'needs-links' && !o.isPageEdit);
  if (links) tasks.push([oppCard(links, 'other', frozen, today, opts), WHY.links]);
  for (const x of openWork.filter((r) => isOpenWorkTask(r, today))) tasks.push([openWorkCard(x), WHY.openWork]);
  for (const c of auditSetupCards(audit)) tasks.push([c, WHY.auditSetup]);
  const sameTask = (c) => `${c.page ?? ''}\u0000${plain(c.action)}`;
  const seen = new Set(cards.map((c) => c.id));
  const done = new Set(cards.filter((c) => c.action).map(sameTask));
  for (const [c, why] of tasks) {
    if (cards.length >= size) break;
    if (seen.has(c.id) || !open(c.id)) continue;
    if (c.action && done.has(sameTask(c))) continue;
    seen.add(c.id);
    if (c.action) done.add(sameTask(c));
    add(c, why);
  }
  return cards.slice(0, size);
}

// ---------------------------------------------------------------- weekly plan

const WEEKS_FILE = 'state/weeks.json';
const readWeeks = () => readJson(WEEKS_FILE, {});

export function getWeek(weekOf) {
  return readWeeks()[weekOf] ?? null;
}

// Saves the five as the plan of record for the week.
export function lockWeek(weekOf, cards, { lockedAt = new Date().toISOString() } = {}) {
  const all = readWeeks();
  all[weekOf] = { weekOf, locked: true, lockedAt, cards, top5: cards.map((c) => c.id) };
  writeJson(WEEKS_FILE, all);
  return all[weekOf];
}

// The founder's chosen order and selection, by card id.
export function setTop5(weekOf, ids) {
  if (!Array.isArray(ids) || ids.length > 5) throw new Error('A week holds five cards at most.');
  const all = readWeeks();
  all[weekOf] = { weekOf, locked: false, cards: [], ...(all[weekOf] ?? {}), top5: ids };
  writeJson(WEEKS_FILE, all);
  return all[weekOf];
}

// Newest week first.
export function weeks() {
  return Object.values(readWeeks()).sort((a, b) => b.weekOf.localeCompare(a.weekOf));
}
