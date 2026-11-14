// The week: the five card proposal, worries, waiting, and the locked weekly plan.
// Everything except lockWeek, getWeek, setTop5 and weeks is pure given its inputs: no
// files, and no clock unless `today` is left out of worries or waiting (then today's
// date is read). lockWeek reads the clock only when no lockedAt is passed.

import crypto from 'node:crypto';
import { readJson, writeJson } from './store.mjs';
import { addDays, daysBetween, mondayOf, todayIso } from './dates.mjs';
import { SITE } from '../../scripts/lib/change-log-core.mjs';
import { eligibility } from './lifecycle.mjs';
import { longDate, longRange, plain } from './text.mjs';
import { groupChanges, competitorWorries } from './competitor-changes.mjs';

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

// Built from the ranked opportunities, so there is one slipping rule (in rules.mjs).
// The worry carries oppId so it and the opportunity card are one and the same card.
function slippingPages(opps, frozen, today) {
  return (opps ?? [])
    .filter((o) => o.type === 'slipping')
    .slice(0, 3)
    .map((o) => {
      const f = frozen?.get(o.page);
      return {
        id: `slipping-page:${o.page}`,
        kind: 'slipping-page',
        page: o.page,
        oppId: o.id,
        isPageEdit: true,
        title: plain(o.title),
        measured: plain(o.measured),
        fix:
          f && f.until > today
            ? `This page was changed recently, so leave it alone until ${longDate(f.until)} and let the verdict decide. Then refresh it if it is still down.`
            : plain(o.action),
      };
    });
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

const isBatch = (v) => v.kind === 'batch' || (Array.isArray(v.pages) && !v.url);

function worseVerdicts(snaps, frozen, today) {
  const local = snaps?.local?.data ?? {};
  return (local.verdicts ?? [])
    .filter((v) => v.verdict === 'worse' && v.judgedOn && daysBetween(v.judgedOn, today) <= VERDICT_RECENT_DAYS)
    .map((v) => {
      const numbers = (who, were) =>
        `In the 28 days before the change ${who} ${were} shown ${v.before?.impressions ?? 0} times at an average place of ${
          v.before?.position ?? 'unknown'
        }. In the 28 days after, ${v.after?.impressions ?? 0} times at ${v.after?.position ?? 'unknown'}. Judged on ${longDate(v.judgedOn)}.`;
      if (isBatch(v)) {
        const pages = (v.pages ?? []).map(String);
        const named = pages.slice(0, 3).join(', ');
        const more = pages.length > 3 ? ` and ${pages.length - 3} more` : '';
        return {
          id: `verdict-worse:${v.slug}|${v.changeDate}`,
          kind: 'verdict-worse',
          page: null,
          isPageEdit: false,
          title: `The ${longDate(v.changeDate)} change to ${count(pages.length, 'page', 'pages')} made things worse`,
          measured: `${numbers('the pages together', 'were')} The pages: ${named}${more}.`,
          fix: 'Open Did it work, look at each page in the batch, and decide which part of the change to undo before touching any of them again.',
        };
      }
      const page = v.url ?? pageForSlug(v.slug, local);
      const f = frozen?.get(page);
      return {
        id: `verdict-worse:${v.slug}|${v.changeDate}`,
        kind: 'verdict-worse',
        page,
        isPageEdit: true,
        title: `The ${longDate(v.changeDate)} change to ${page} made things worse`,
        measured: numbers('the page', 'was'),
        fix:
          f && f.until > today
            ? `The page was touched again recently, so wait until ${longDate(f.until)} before changing it, then compare the old and new versions.`
            : 'Compare the old and new versions of the page and decide whether to undo the part that hurt.',
      };
    });
}

// snaps and prevSnaps: {gsc, bing, local, ...} snapshot objects (the shape in data/snap).
// sources: the list from sourceStatus(). opps: the ranked opportunities, best first
// (the slipping worries are its first three of type slipping). Missing inputs are fine.
export function worries({
  snaps = {},
  prevSnaps = {},
  sources = [],
  frozen = new Map(),
  opps = [],
  items = {},
  today = todayIso(),
} = {}) {
  const all = [
    ...droppedFromIndex(snaps, prevSnaps),
    ...slippingPages(opps, frozen, today),
    ...worseVerdicts(snaps, frozen, today),
    ...crawlIssues(snaps),
    ...registryFailures(snaps),
    ...failedSources(sources),
    ...competitorChanges(snaps, today, items),
  ];
  return all.sort((a, b) => SERIOUS.indexOf(a.kind) - SERIOUS.indexOf(b.kind));
}

// ---------------------------------------------------------------- waiting

// Verdicts still pending and pages frozen, soonest first. Nothing here needs action.
// verdictsDue: [{page|url|slug, date}] for edits whose verdict is not ready yet.
export function waiting({ verdictsDue = [], frozen = new Map(), plan = null, today = todayIso() } = {}) {
  const out = [];
  const seen = new Set();
  const addVerdict = (page, date) => {
    if (!page || !date || seen.has(page)) return;
    seen.add(page);
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

export function oppCard(o, slot, frozen, today) {
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
    eligibility: eligibility(o, frozen, today),
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

function improveCard(row, frozen, today) {
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
    eligibility: eligibility({ isPageEdit: true, page: row.page }, frozen, today),
  };
}

function verdictCard(due, frozen, plan, today) {
  if (due?.length) {
    const dates = due
      .map((d) => d.date ?? d.changeDate)
      .filter(Boolean)
      .sort();
    const n = due.length;
    return {
      id: 'verdict-due',
      slot: 'verdict',
      title: n === 1 ? 'Check whether one past edit worked' : `Check whether ${n} past edits worked`,
      measured: `${n === 1 ? 'One edit' : `${n} edits`} made ${longRange(dates[0], dates[dates.length - 1])} ${
        n === 1 ? 'has' : 'have'
      } finished the 28 day wait and ${n === 1 ? 'has' : 'have'} no verdict yet.`,
      action: 'Open Did it work and press Judge now. It shows the result before anything is saved.',
      test: 'Each verdict compares the 28 days before and after the edit, against how the typical page moved.',
      page: null,
      isPageEdit: false,
      source: 'verdict',
      oppId: null,
      eligibility: OK_ELIGIBILITY,
    };
  }
  const next = waiting({ verdictsDue: [], frozen, plan, today })
    .filter((w) => w.kind === 'verdict' && w.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  if (!next) return null;
  return {
    id: `verdict-next-${next.date}`,
    slot: 'verdict',
    title: `The next verdict is ready on ${longDate(next.date)}`,
    measured: `Nothing is ready to judge yet. ${next.title} is the next one, ready on ${longDate(next.date)}.`,
    action: 'Nothing to do now. Leave the changed pages alone until then.',
    test: 'The verdict compares the 28 days before and after the edit, against how the typical page moved.',
    page: null,
    isPageEdit: false,
    source: 'verdict',
    oppId: null,
    eligibility: OK_ELIGIBILITY,
  };
}

export function worryCard(w, frozen, today) {
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
    test: 'Check the same number again after the next daily refresh.',
    page: w.page ?? null,
    isPageEdit: Boolean(w.isPageEdit),
    source: 'worry',
    oppId: w.oppId ?? null,
    eligibility: w.isPageEdit ? eligibility({ isPageEdit: true, page: w.page }, frozen, today) : OK_ELIGIBILITY,
  };
}

// The deliberate page edit dated inside the week of `today` (Monday to Sunday), or null.
// frozen: Map<page, {since, until}>; since is the date of the page's latest deliberate edit.
export function editThisWeek(frozen, today) {
  const monday = mondayOf(today);
  const sunday = addDays(monday, 6);
  let found = null;
  for (const [page, f] of frozen ?? []) {
    if (f.since >= monday && f.since <= sunday && (!found || f.since > found.since)) found = { page, ...f };
  }
  return found;
}

// The page edit slot once this week's edit is done: a plain card with no buttons.
function editDoneCard(edit, today) {
  const nextMonday = addDays(mondayOf(today), 7);
  return {
    id: `page-edit-done-${mondayOf(today)}`,
    slot: 'page-edit',
    title: "This week's page edit is done",
    measured: `${edit.page} was changed on ${longDate(edit.since)}. The rule is one live page edit a week.`,
    action: `Nothing to do here. The next page edit can go in from ${longDate(nextMonday)}, and ${edit.page} stays untouched until ${longDate(edit.until)}.`,
    test: `Judged by the 28 day before and after verdict, ready about ${longDate(addDays(edit.since, 30))}.`,
    page: edit.page,
    isPageEdit: false,
    source: 'rule',
    oppId: null,
    eligibility: OK_ELIGIBILITY,
    readOnly: true,
  };
}

const openWorkId = (w) => `open-${hash(w.text)}`;
const openWorkTitle = (w) =>
  plain(w.text)
    .split(/(?<=[.:])\s/)[0]
    .slice(0, 120);

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

// Five cards (or `size`, 3 or 5), by the founder's recipe. A slot with nothing in it is skipped and the
// list is topped up from the best remaining opportunities that are not live page
// edits. At most one card edits a live page (one a week).
// ranked: opportunities with .score, best first. due: change-log entries ready to judge.
export function proposeTop5({
  plan,
  ranked = [],
  due = [],
  worries: worryList = [],
  openWork = [],
  frozen = new Map(),
  items = {},
  today,
  size = DEFAULT_PLAN_SIZE,
}) {
  const cards = [];
  const week = mondayOf(today);
  const pinned = (o) => items?.[o.id]?.pinnedWeek === week;
  const ordered = [...ranked.filter(pinned), ...ranked.filter((o) => !pinned(o))].filter((o) =>
    available(o.id, items, today)
  );
  const used = new Set();
  // A deliberate edit dated this week uses up the week's one live page edit.
  const doneThisWeek = editThisWeek(frozen, today);
  const pageEditTaken = () => Boolean(doneThisWeek) || cards.some((c) => c.isPageEdit);

  // 1. This week's new post.
  const post = (plan?.posts ?? []).find((p) => !p.done);
  if (post) cards.push(postCard(post));

  // 2. The one live page improvement. When this week's edit is already done, the slot says
  //    so and offers nothing else. Otherwise a page edit the founder pinned for this week
  //    wins when it can be edited, then the plan's first open row that is not frozen, else
  //    the best eligible page edit opportunity. A pinned edit that is frozen leaves a note on
  //    whichever card takes the slot.
  const pinnedEdits = ordered.filter((o) => o.isPageEdit && pinned(o));
  const pinnedOk = pinnedEdits.find((o) => eligibility(o, frozen, today).eligible);
  const pinnedBlocked = pinnedEdits.find((o) => !eligibility(o, frozen, today).eligible);
  const row = (plan?.improve ?? []).find(
    (r) => !r.done && eligibility({ isPageEdit: true, page: r.page }, frozen, today).eligible
  );
  let editCard = null;
  if (doneThisWeek) {
    cards.push(editDoneCard(doneThisWeek, today));
  } else if (pinnedOk) {
    used.add(pinnedOk.id);
    editCard = oppCard(pinnedOk, 'page-edit', frozen, today);
  } else if (row) {
    editCard = improveCard(row, frozen, today);
  } else {
    const best = ordered.find((o) => o.isPageEdit && eligibility(o, frozen, today).eligible);
    if (best) {
      used.add(best.id);
      editCard = oppCard(best, 'page-edit', frozen, today);
    }
  }
  if (editCard) {
    if (!pinnedOk && pinnedBlocked) {
      editCard.note = `Pinned item is frozen until ${longDate(eligibility(pinnedBlocked, frozen, today).from)}`;
    }
    cards.push(editCard);
  }

  // 3. A verdict that is due, or the next verdict date.
  const v = verdictCard(due, frozen, plan, today);
  if (v) cards.push(v);

  // 4. The most serious worry that has a fix and respects the one edit a week rule.
  const w = worryList.find((x) => {
    if (!x.fix) return false;
    if (x.oppId && !available(x.oppId, items, today)) return false;
    if (!x.isPageEdit) return true;
    return !pageEditTaken() && eligibility({ isPageEdit: true, page: x.page }, frozen, today).eligible;
  });
  if (w) cards.push(worryCard(w, frozen, today));

  // 5, then top up: the best remaining items that are not live page edits. Open work
  //    is a fallback after the opportunities, and rows waiting on the founder are
  //    left out because the page lists them separately (blockedOnYou).
  const rest = ordered.filter((o) => !o.isPageEdit && !used.has(o.id));
  const extras = [
    ...rest.map((o) => oppCard(o, 'other', frozen, today)),
    ...openWork.filter((w) => !w.blockedOnFounder).map(openWorkCard),
  ];
  const seen = new Set(cards.map((c) => c.id));
  for (const c of extras) {
    if (cards.length >= size) break;
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    cards.push(c);
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
