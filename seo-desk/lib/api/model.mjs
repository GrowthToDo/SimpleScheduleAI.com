// The shared model every API route reads from. One build loads the snapshots and the
// desk state, runs the opportunity rules, scores them, applies the lifecycle and the
// 28 day freeze, and is kept until a snapshot or a state file changes. Routes never
// parse a snapshot themselves, so a 2.5 MB Search Console file is read once, not once
// per route.

import fs from 'node:fs';
import path from 'node:path';
import { readJson, writeJson, dataDir } from '../store.mjs';
import { SITE, THRESHOLDS, PRESETS, DEFAULT_MONEY_PAGES } from '../config.mjs';
import { detectAll, RETIRED_TYPES } from '../rules.mjs';
import { rank } from '../score.mjs';
import {
  reconcile,
  loadItems,
  frozenPages,
  touchedOn,
  eligibility,
  recentEdits,
  withEligibilityText,
  deliberateEdits as lifecycleDeliberate,
  editWhenText,
  RECENT_EDIT_MIN_LINES,
  AFTER_PUBLISH_DAYS,
} from '../lifecycle.mjs';
import { windows, todayIso, addDays } from '../dates.mjs';
import { sourceStatus } from '../refresh.mjs';
import { DEFAULT_REPO_ROOT, readJsonl, pageOfNote } from '../sources/local.mjs';
import { capSnapshot } from '../sources/gsc.mjs';
import { COUNTS_MISSING_NOTE, countsMissingIn } from '../query-counts.mjs';
import { brief } from '../brief.mjs';
import { loadTargets, allTargets, applySignals } from '../targets.mjs';
import { longDate, longRange, plain } from '../text.mjs';
import { TERMS, termOf } from '../insights.mjs';

// news: the feeds the Newsroom page reads (lib/sources/news.mjs). It never sets a page's "Data through".
export const SOURCES = ['gsc', 'bing', 'ga4', 'clarity', 'local', 'index', 'news'];
export const POST_PAGE_RE = /^\/(blog|articles)\/[^/]+$/;
const STATE_FILES = [
  'items',
  'settings',
  'weeks',
  'annotations',
  'visit',
  'index-prev',
  'jobs',
  'ai-imports',
  'plan-ticks',
  'targets',
  'link-suggestions',
  'insight-choices',
  'news-pasted',
].map((n) => `state/${n}.json`);

// The label for one item. The standard terms live in insights.mjs. Callers may still pass the item's
// source; no type reads it since the Google and Bing cards were retired (rules.mjs).
export function typeLabelOf(type) {
  return TYPE_LABEL[type] ?? type;
}

// type -> the standard term (the tab label).
export const TYPE_LABEL = Object.fromEntries(Object.entries(TERMS).map(([type, t]) => [type, t.term]));

// ---------------------------------------------------------------- paths and the clock

export const repoRoot = () => process.env.SEO_DESK_REPO || DEFAULT_REPO_ROOT;
export const notesFile = () => path.join(repoRoot(), 'docs/seo/change-log-notes.jsonl');
const brandFile = () => path.join(repoRoot(), 'docs/seo/brand-terms.json');
// Tests pin the date with SEO_DESK_TODAY; otherwise it is today (UTC).
export const deskToday = () => process.env.SEO_DESK_TODAY || todayIso();

export const pagePath = (p) => {
  const s = String(p ?? '')
    .replace(SITE, '')
    .split('#')[0]
    .split('?')[0]
    .replace(/\/+$/, '');
  return s === '' ? '/' : s;
};
export const slugOf = (page) => String(page).split('/').pop();

// ---------------------------------------------------------------- settings

const SETTINGS_FILE = 'state/settings.json';
const SIGNALS = ['demand', 'distance', 'importance', 'confidence', 'effort', 'ai', 'outcome'];

export function loadSettings() {
  const s = readJson(SETTINGS_FILE, {}) || {};
  const preset = Object.hasOwn(PRESETS, s.preset) ? s.preset : s.weights ? 'custom' : 'balanced';
  // Custom weights saved before the visitor interest signal existed give it 0, so they still sum to 1.
  const weights = preset === 'custom' ? { ...PRESETS.balanced, outcome: 0, ...s.weights } : { ...PRESETS[preset] };
  return {
    preset,
    weights,
    moneyPages:
      Array.isArray(s.moneyPages) && s.moneyPages.length ? s.moneyPages.map(String) : [...DEFAULT_MONEY_PAGES],
    thresholds: s.thresholds && typeof s.thresholds === 'object' ? s.thresholds : {},
    strategicKeywords: Array.isArray(s.strategicKeywords)
      ? s.strategicKeywords.filter((k) => typeof k === 'string' && k.trim()).map((k) => k.trim())
      : [],
    paused: s.paused === true,
    weeklyAudit: s.weeklyAudit === true,
    showGoogleUpdates: s.showGoogleUpdates !== false,
    planSize: [3, 5].includes(s.planSize) ? s.planSize : 5,
  };
}

export function saveSettings(settings) {
  writeJson(SETTINGS_FILE, settings);
  invalidate();
}

export { SIGNALS };

// Thresholds the rules read from the settings. The others come straight from
// scripts/lib/gsc-diagnose-core.mjs so the desk and the monthly diagnose script judge alike;
// they are shown but fixed here.
// The click rate gate as the founder has set it (settings first, then the default).
export const lowCtrMin = (model) => model.settings.thresholds.LOW_CTR_MIN_IMP ?? THRESHOLDS.LOW_CTR_MIN_IMP;

export const ADJUSTABLE_THRESHOLDS = ['LOW_CTR_MIN_IMP', 'SLIP_MIN_PREV_IMP', 'SLIP_DROP', 'NEEDS_LINKS_MIN'];

// ---------------------------------------------------------------- the cache

let cache = null;
export function invalidate() {
  cache = null;
}

function stamp(file) {
  try {
    const s = fs.statSync(file);
    return `${s.mtimeMs}:${s.size}`;
  } catch {
    return '-';
  }
}

function keyOf(today) {
  const dir = dataDir();
  const parts = [dir, today, repoRoot()];
  for (const s of SOURCES) parts.push(stamp(path.join(dir, 'snap', `${s}.json`)));
  for (const f of STATE_FILES) parts.push(stamp(path.join(dir, f)));
  parts.push(stamp(notesFile()), stamp(brandFile()));
  return parts.join('|');
}

// The sentence every page shows when the repo's git history could not be read for the edits the
// desk does not know about.
export const GIT_UNREAD =
  "The repo's git history could not be read, so pages edited outside the desk are not flagged as recently edited.";

// ---------------------------------------------------------------- the index table

// Whether each live page is on Google: the index checks snapshot, or (until the first index
// check has run) the table the Search Console snapshot used to carry, dated with that pull.
// {rows: [{page, verdict, reason, lastCrawl, checkedAt}] | null, checked, live, legacy}.
function indexOf(snapObjs, local) {
  const own = snapObjs.index?.data?.pages;
  const old = snapObjs.gsc?.data?.index;
  const rows = Array.isArray(own)
    ? own
    : Array.isArray(old)
      ? old.map((r) => ({ ...r, checkedAt: r.checkedAt ?? snapObjs.gsc?.pulledAt ?? null }))
      : null;
  const live = (local?.livePages ?? []).length || snapObjs.index?.data?.live || null;
  return {
    rows,
    checked: rows ? rows.filter((r) => r.checkedAt).length : 0,
    live,
    legacy: !Array.isArray(own) && Array.isArray(old),
  };
}

// "12 of 149 live pages checked" (the rotation checks a few each morning).
// The one sentence every index count carries: how many live pages have an answer from Search Console
// and how old the oldest answer is (Site health and the Search tile say the same).
export function indexAnswersText(model) {
  const { checked, live } = model.index;
  const oldest = (model.index.rows ?? [])
    .map((r) => (r.checkedAt ? todayIso(new Date(r.checkedAt)) : null))
    .filter(Boolean)
    .sort()[0];
  if (!checked) return 'No page has an answer from Search Console yet.';
  const who = live ? `${checked} of ${live} live pages` : `${checked} ${checked === 1 ? 'page' : 'pages'}`;
  const verb = checked === 1 && !live ? 'has' : 'have';
  return `${who} ${verb} an answer from Search Console${oldest ? `, the oldest from ${longDate(oldest)}` : ''}.`;
}

// ---------------------------------------------------------------- the build

export function buildModel() {
  const today = deskToday();
  if (cache && cache.key === keyOf(today)) return cache.model;

  const snapObjs = Object.fromEntries(SOURCES.map((s) => [s, readJson(`snap/${s}.json`, null)]));
  // The Search Console end date is never later than the newest day its daily rows hold.
  snapObjs.gsc = capSnapshot(snapObjs.gsc);
  const data = Object.fromEntries(SOURCES.map((s) => [s, snapObjs[s]?.data ?? null]));
  const settings = loadSettings();
  const brands = (() => {
    try {
      const v = JSON.parse(fs.readFileSync(brandFile(), 'utf8'));
      return Array.isArray(v) ? v.map(String) : [];
    } catch {
      return [];
    }
  })();
  const warnings = [];
  // Target priorities, strategic keywords and the interest from visitors adjust each opportunity's
  // signals before it is scored. The targets (the keyword file and the adopted ones) also tell the
  // gap rule which page a search already belongs to (rules.mjs unservedSplit).
  const targetState = loadTargets();
  const targets = allTargets({ registry: data.local?.registry ?? [], state: targetState });
  const cfg = {
    thresholds: settings.thresholds,
    moneyPages: settings.moneyPages,
    brands,
    today,
    targets: targets.map((t) => ({ keyword: t.keyword, page: t.page })),
  };

  // The rules read the index table from wherever it lives today (see indexOf).
  const index = indexOf(snapObjs, data.local);
  let detected = [];
  try {
    detected = detectAll({ ...data, index: index.rows ? { ...(data.index ?? {}), pages: index.rows } : null }, cfg);
  } catch (e) {
    warnings.push(`The opportunity rules failed: ${String(e?.message ?? e).slice(0, 120)}`);
  }
  const opps = rank(
    applySignals(detected, {
      targets,
      strategic: settings.strategicKeywords,
      outcomes: data.ga4?.outcomes ?? [],
    }),
    settings.weights
  );
  const items = reconcile(
    loadItems(),
    detected.map((o) => o.id),
    today
  );

  const local = data.local ?? {};
  const live = new Set((local.livePages ?? []).map((p) => p.page));
  // The notes file is read here, live, so a note written a moment ago counts at once. The local
  // snapshot carries the same notes from its last pull, so its manual rows are left out.
  // A bare name is resolved to the page that really exists (a blog post or an article); a name that
  // is neither is left out rather than pointed at a /blog/ page that does not exist.
  const noteEdits = readJsonl(notesFile())
    .filter((n) => n?.date && n?.slug)
    .map((n) => ({
      page: pageOfNote(n.slug, { live, registry: local.registry ?? [], repoRoot: repoRoot() }),
      date: n.date,
      kind: 'manual',
      subject: String(n.text ?? ''),
    }))
    .filter((e) => e.page);
  const edits = [...(local.edits ?? []).filter((e) => e.kind !== 'manual'), ...noteEdits].sort(
    (a, b) => b.date.localeCompare(a.date) || a.page.localeCompare(b.page)
  );
  const planTicks = readJson('state/plan-ticks.json', {}) || {};
  const planSeenOn = snapObjs.local?.pulledAt ? todayIso(new Date(snapObjs.local.pulledAt)) : null;
  const frozen = frozenPages({ items, opps, plan: local.plan ?? null, edits, planTicks, planSeenOn, today });
  // Content edits git shows that the freeze does not know. A snapshot from before the desk read them
  // has no list; a failed read says so on every page.
  // The commits that published each page: an edit within two days after one is part of publishing it.
  const published = new Map();
  for (const e of edits) if (e.kind === 'publish') published.set(e.page, [...(published.get(e.page) ?? []), e.date]);
  const recent = recentEdits({ contentEdits: local.contentEdits ?? [], frozen, today, published });
  if (local.contentEditsError) warnings.push(GIT_UNREAD);

  const prevIndex = readJson('state/index-prev.json', null)?.index ?? null;
  const gscCur = data.gsc?.windows?.cur ?? windows(today).cur;

  const model = {
    today,
    snapObjs,
    data,
    empty: SOURCES.every((s) => !snapObjs[s]),
    settings,
    targetState,
    targets,
    brands,
    cfg,
    opps,
    oppById: new Map(opps.map((o) => [o.id, o])),
    items,
    edits,
    frozen,
    recent,
    planTicks,
    planSeenOn,
    prevIndex,
    index,
    warnings,
    range: { start: gscCur.start, end: gscCur.end, text: longRange(gscCur.start, gscCur.end) },
    memo: new Map(),
  };
  cache = { key: keyOf(today), model };
  return model;
}

// Computes once per model.
export function memo(model, key, fn) {
  if (!model.memo.has(key)) model.memo.set(key, fn());
  return model.memo.get(key);
}

// ---------------------------------------------------------------- shared helpers

export function sourcesOf(model) {
  return sourceStatus({ snapshots: model.snapObjs });
}

// The top level of every GET reply: through, range, sources, empty. `need` lists the sources
// the page lives on; the reply is empty only when none of them has ever been pulled.
export function envelope(model, { need = [], range = null, ...extra } = {}) {
  const through =
    model.snapObjs.gsc?.through ??
    SOURCES.filter((s) => s !== 'news')
      .map((s) => model.snapObjs[s]?.through)
      .filter(Boolean)
      .sort()
      .pop() ??
    null;
  const empty = need.length ? need.every((s) => !model.snapObjs[s]) : model.empty;
  return {
    through,
    range: range ?? model.range,
    sources: sourcesOf(model),
    empty,
    ...(model.warnings.length ? { warnings: model.warnings } : {}),
    ...extra,
  };
}

// An envelope with the one warning every reply whose lists need the per-search counts carries when
// the query-only pull is missing or empty (lib/query-counts.mjs).
export const withCountsWarning = (model, env) =>
  countsMissingIn(model.data.gsc) ? { ...env, warnings: [...(env.warnings ?? []), COUNTS_MISSING_NOTE] } : env;

export const rangeOf = (r) => (r ? { start: r.start, end: r.end, text: longRange(r.start, r.end) } : null);

const SC_RESOURCE = encodeURIComponent(`${SITE}/`);
export function linksFor(page) {
  const base = `https://search.google.com/search-console/performance/search-analytics?resource_id=${SC_RESOURCE}`;
  if (!page) return { live: null, searchConsole: base };
  return { live: `${SITE}${page}`, searchConsole: `${base}&page=!${encodeURIComponent(`${SITE}${page}`)}` };
}

const ITEM_FIELDS = ['status', 'since', 'snoozeUntil', 'reason', 'doneAt', 'notes', 'pinnedWeek'];
// The saved state of one item, by its own key only (an id such as "constructor" is not an item).
export const itemOf = (model, id) => (Object.hasOwn(model.items, id) ? model.items[id] : undefined);

export function itemState(model, id) {
  const it = itemOf(model, id);
  if (!it)
    return { status: 'new', since: null, snoozeUntil: null, reason: null, doneAt: null, notes: [], pinnedWeek: null };
  return Object.fromEntries(ITEM_FIELDS.map((k) => [k, it[k] ?? (k === 'notes' ? [] : null)]));
}

// The eligibility every list beside the five shows (lifecycle eligibility, the one function): the
// freeze, a git edit the freeze does not know, and this week's page edit already made.
export function eligibilityOf(model, opp) {
  return withEligibilityText(eligibility(opp, model.frozen, model.today, { recent: model.recent ?? null, week: true }));
}

// The same function for one page edit on `page`, with its words. week: false for a routine change
// (a link added, a file address swapped) that does not use the week's one page edit; the freeze and a
// git edit still hold it, because a change inside those 28 days blurs that page's verdict.
export const pageHold = (model, page, { week = true } = {}) =>
  withEligibilityText(
    eligibility({ isPageEdit: true, page }, model.frozen, model.today, { recent: model.recent ?? null, week })
  );

// The fields a list row carries for a page that may not be changed yet, from pageHold: frozenUntil
// (the date the freeze or a git edit lets go), frozenUntilText, and holdText (the function's own
// words, which say which of the two it is). All null for a page that is free.
export function holdFields(model, page, { week = false } = {}) {
  const e = page ? pageHold(model, page, { week }) : null;
  const until = e && !e.eligible ? e.from : null;
  return { frozenUntil: until, frozenUntilText: until ? longDate(until) : null, holdText: until ? e.text : null };
}

// ---------------------------------------------------------------- a page's edits

// When a page may be edited (lifecycle editWhenText, the words every chip uses), re-exported here.
export { editWhenText };

const lineWord = (n) => `${n} ${n === 1 ? 'line' : 'lines'}`;
// "a small change on 3 November (1 line)"
export const smallChangeText = (s) => `a small change on ${longDate(s.date)} (${lineWord(s.lines)})`;

// The one function for a page's edits as the desk understands them. Every sentence about when a page
// was edited reads it, so "last edited" is only ever said of a deliberate edit:
//   deliberate  [{date, kind, why, lines}] newest first: a desk Done, a plan row, an "Edit:" note
//               (kind 'logged'), or a git commit of RECENT_EDIT_MIN_LINES changed lines or more
//               (kind 'git', with the day's lines added up)
//   small       [{date, lines}] newest first: git changes under that size (a link added, a count fixed)
//   last        the newest deliberate edit's date, or null
//   editWhen    when the page may be edited (editWhenText)
// Git is read from the local snapshot's content edits (the page's own source file, the last 35 days);
// an edit within AFTER_PUBLISH_DAYS after the page was published is part of publishing it.
export function pageEdits(model, page) {
  const all = memo(model, 'page-edits', () => {
    const byPage = new Map();
    const get = (p) => {
      if (!byPage.has(p)) byPage.set(p, { logged: [], git: new Map() });
      return byPage.get(p);
    };
    const list = lifecycleDeliberate({
      items: model.items,
      opps: model.opps,
      plan: model.data.local?.plan ?? null,
      edits: model.edits,
      planTicks: model.planTicks,
      planSeenOn: model.planSeenOn,
    });
    for (const d of list) if (d.page && d.date) get(d.page).logged.push(d);
    const published = new Map();
    for (const e of model.edits ?? [])
      if (e.kind === 'publish') published.set(e.page, [...(published.get(e.page) ?? []), e.date]);
    for (const e of model.data.local?.contentEdits ?? []) {
      if (!e?.page || !e.date || e.date > model.today) continue;
      const pub = published.get(e.page) ?? [];
      if (pub.some((p) => p <= e.date && e.date <= addDays(p, AFTER_PUBLISH_DAYS))) continue;
      const day = get(e.page).git.get(e.date) ?? { date: e.date, lines: 0, big: false };
      const n = Number(e.lines) || 0;
      day.lines += n;
      if (n >= RECENT_EDIT_MIN_LINES) day.big = true;
      get(e.page).git.set(e.date, day);
    }
    return byPage;
  });
  const own = all.get(page) ?? { logged: [], git: new Map() };
  const loggedDates = new Set(own.logged.map((d) => d.date));
  const deliberate = [
    ...own.logged.map((d) => ({ date: d.date, kind: 'logged', why: d.why, lines: null })),
    ...[...own.git.values()]
      .filter((g) => g.big && !loggedDates.has(g.date))
      .map((g) => ({
        date: g.date,
        kind: 'git',
        why: `An edit of ${lineWord(g.lines)} was found in git on ${longDate(g.date)}.`,
        lines: g.lines,
      })),
  ];
  // One row per day, newest first; a logged edit wins over git on the same day.
  const byDay = new Map();
  for (const d of deliberate) if (!byDay.has(d.date) || d.kind === 'logged') byDay.set(d.date, d);
  const sorted = [...byDay.values()].sort((a, b) => b.date.localeCompare(a.date));
  const small = [...own.git.values()]
    .filter((g) => !g.big && !byDay.has(g.date))
    .map((g) => ({ date: g.date, lines: g.lines }))
    .sort((a, b) => b.date.localeCompare(a.date));
  return {
    deliberate: sorted,
    small,
    last: sorted[0]?.date ?? null,
    lastSmall: small[0] ?? null,
    editWhen: page ? editWhenText(pageHold(model, page)) : null,
  };
}

// Every deliberate edit dated inside [start, end], across all pages, from pageEdits (the definition
// "last edited" uses): [{page, date, kind, why, lines}], newest first. gitFrom: the first day git is
// read for (the local snapshot carries the last 35 days of content edits), or null when it carries
// none; an edit found in git before that day cannot be on the list, so the reader says so.
export function deliberateEditsIn(model, start, end) {
  const pages = new Set();
  for (const d of lifecycleDeliberate({
    items: model.items,
    opps: model.opps,
    plan: model.data.local?.plan ?? null,
    edits: model.edits,
    planTicks: model.planTicks,
    planSeenOn: model.planSeenOn,
  }))
    if (d.page) pages.add(d.page);
  let gitFrom = null;
  for (const e of model.data.local?.contentEdits ?? []) {
    if (e?.page) pages.add(e.page);
    if (e?.date && (gitFrom === null || e.date < gitFrom)) gitFrom = e.date;
  }
  const list = [];
  for (const page of pages)
    for (const d of pageEdits(model, page).deliberate) if (d.date >= start && d.date <= end) list.push({ page, ...d });
  list.sort((a, b) => b.date.localeCompare(a.date) || a.page.localeCompare(b.page));
  return { list, gitFrom };
}

// The sentence a worry says about the page's edits inside its compared dates (start..end), or null:
// "The page was last edited on 9 November, inside these dates." for a deliberate edit, and
// "The page had a small change on 3 November (1 line), inside these dates." for a smaller one.
export function editNoteIn(pe, start, end) {
  const inside = (d) => d && (!start || d >= start) && (!end || d <= end);
  const big = pe?.deliberate?.find((d) => inside(d.date)) ?? null;
  const small = pe?.small?.find((s) => inside(s.date) && (!big || s.date > big.date)) ?? null;
  if (big && small)
    return `The page was last edited on ${longDate(big.date)}, and had ${smallChangeText(small)}, inside these dates.`;
  if (big) return `The page was last edited on ${longDate(big.date)}, inside these dates.`;
  if (small) return `The page had ${smallChangeText(small)}, inside these dates.`;
  return null;
}

// How long Leave it puts a card away when its advice gives no date of its own.
export const LEAVE_IT_DAYS = 28;
// {until, untilText} for a card whose own advice is to leave its page alone: Leave it snoozes it until
// then and records no page edit and no freeze. `until` defaults to 28 days from today.
export const leaveItOf = (model, until = null) => {
  const day = until ?? addDays(model.today, LEAVE_IT_DAYS);
  return { until: day, untilText: longDate(day) };
};
// A Decay card of the lost demand kind advises leaving the page alone, so it offers Leave it.
export const leaveItFor = (model, o, dropKind = o?.dropKind) =>
  o?.type === 'slipping' && dropKind === 'lost-demand' ? { leaveIt: leaveItOf(model) } : {};

// Whether an item is held: it edits a live page that may not be edited now (the page's own edit holds
// it, or this week's one page edit is used). A held item is never pushed: no Swap in, no green Start,
// no priority, and it sorts after the items that can be worked on now. heldKind: 'page' (the freeze or
// an edit found in git: a page to leave alone) or 'week' (only this week's edit is used). From the
// eligibility the item already carries (the one eligibility function).
export const heldOf = (isPageEdit, e) =>
  isPageEdit && e && !e.eligible
    ? { held: true, heldKind: e.weekEdit ? 'week' : 'page' }
    : { held: false, heldKind: null };

// Workable items first, held ones after, each group in its own order (a stable sort).
export const workableFirst = (items) => [...items.filter((x) => !x.held), ...items.filter((x) => x.held)];

// An opportunity as the pages see it: plain text, score, lifecycle state, freeze, brief, links.
export function decorateOpp(model, o) {
  const state = itemState(model, o.id);
  const elig = eligibilityOf(model, o);
  const clean = {
    ...o,
    title: plain(o.title),
    measured: plain(o.measured),
    action: plain(o.action),
    test: plain(o.test),
  };
  return {
    id: o.id,
    type: o.type,
    typeLabel: typeLabelOf(o.type, o.source),
    ...termOf(o.type, o.source),
    page: o.page,
    query: o.query || null,
    title: clean.title,
    measured: clean.measured,
    action: clean.action,
    test: clean.test,
    isPageEdit: Boolean(o.isPageEdit),
    range: rangeOf(o.range),
    source: o.source,
    evidence: o.evidence ?? [],
    signals: o.signals,
    score: o.score ?? null,
    status: state.status,
    item: state,
    eligibility: elig,
    ...heldOf(Boolean(o.isPageEdit), elig),
    touchedOn: o.page ? touchedOn(o.page, model.edits) : [],
    links: linksFor(o.page),
    brief: brief(clean, { frozen: model.frozen, hold: elig }),
    detected: true,
    ...leaveItFor(model, o),
  };
}

// Items the founder marked that the rules no longer find (done pages, old ignores). They keep
// the few facts saved when they were marked, so the Done and Ignored tabs stay complete.
export function goneOpps(model) {
  return (
    Object.entries(model.items)
      // A retired type (rules.mjs RETIRED_TYPES) keeps its saved state but is never shown.
      .filter(
        ([id, it]) =>
          !model.oppById.has(id) && it.meta?.kind === 'opportunity' && !RETIRED_TYPES.includes(it.meta?.type)
      )
      .map(([id, it]) => ({
        id,
        type: it.meta.type,
        typeLabel: typeLabelOf(it.meta.type, it.meta.source),
        ...termOf(it.meta.type, it.meta.source),
        page: it.meta.page ?? null,
        query: it.meta.query ?? null,
        title: plain(it.meta.title),
        measured: '',
        action: '',
        test: '',
        isPageEdit: Boolean(it.meta.isPageEdit),
        range: null,
        source: null,
        evidence: [],
        signals: null,
        score: null,
        status: it.status,
        item: itemState(model, id),
        eligibility: eligibilityOf(model, { isPageEdit: Boolean(it.meta.isPageEdit), page: it.meta.page ?? null }),
        touchedOn: [],
        links: linksFor(it.meta.page ?? null),
        brief: '',
        detected: false,
      }))
  );
}
