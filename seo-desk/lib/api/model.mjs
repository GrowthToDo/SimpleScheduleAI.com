// The shared model every API route reads from. One build loads the snapshots and the
// desk state, runs the opportunity rules, scores them, applies the lifecycle and the
// 28 day freeze, and is kept until a snapshot or a state file changes. Routes never
// parse a snapshot themselves, so a 2.5 MB Search Console file is read once, not once
// per route.

import fs from 'node:fs';
import path from 'node:path';
import { readJson, writeJson, dataDir } from '../store.mjs';
import { SITE, THRESHOLDS, PRESETS, DEFAULT_MONEY_PAGES } from '../config.mjs';
import { detectAll } from '../rules.mjs';
import { rank } from '../score.mjs';
import { reconcile, loadItems, frozenPages, touchedOn, eligibility } from '../lifecycle.mjs';
import { windows, todayIso } from '../dates.mjs';
import { sourceStatus } from '../refresh.mjs';
import { DEFAULT_REPO_ROOT, readJsonl } from '../sources/local.mjs';
import { brief } from '../brief.mjs';
import { loadTargets, allTargets, applySignals } from '../targets.mjs';
import { longDate, longRange, plain } from '../text.mjs';
import { TERMS, termOf } from '../insights.mjs';

export const SOURCES = ['gsc', 'bing', 'ga4', 'clarity', 'local', 'index'];
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
].map((n) => `state/${n}.json`);

// The label for one item. The standard terms live in insights.mjs. An engine gap runs one of two
// ways, and the rules mark which with the source that holds the numbers: 'bing' means Bing shows us
// and Google does not; its label says which way round it is, while its term stays the neutral one.
export function typeLabelOf(type, source) {
  if (type === 'engine-gap' && source === 'bing') return 'On Bing, not on Google';
  if (type === 'engine-gap' && source === 'gsc') return 'On Google, not on Bing';
  return TYPE_LABEL[type] ?? type;
}

// type -> the standard term (the tab label); the neutral name for an engine gap.
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

// A note's page: a path stays a path, a bare name is a blog post unless only an article has it.
function notePage(slug, live) {
  if (String(slug).startsWith('/')) return slug;
  if (live.has(`/blog/${slug}`)) return `/blog/${slug}`;
  if (live.has(`/articles/${slug}`)) return `/articles/${slug}`;
  return `/blog/${slug}`;
}

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
export function checkedText(model) {
  const { checked, live } = model.index;
  return live ? `${checked} of ${live} live pages checked` : `${checked} pages checked`;
}

// ---------------------------------------------------------------- the build

export function buildModel() {
  const today = deskToday();
  if (cache && cache.key === keyOf(today)) return cache.model;

  const snapObjs = Object.fromEntries(SOURCES.map((s) => [s, readJson(`snap/${s}.json`, null)]));
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
  const cfg = { thresholds: settings.thresholds, moneyPages: settings.moneyPages, brands, today };

  // The rules read the index table from wherever it lives today (see indexOf).
  const index = indexOf(snapObjs, data.local);
  let detected = [];
  try {
    detected = detectAll({ ...data, index: index.rows ? { ...(data.index ?? {}), pages: index.rows } : null }, cfg);
  } catch (e) {
    warnings.push(`The opportunity rules failed: ${String(e?.message ?? e).slice(0, 120)}`);
  }
  // Target priorities, strategic keywords and the interest from visitors adjust each opportunity's
  // signals before it is scored.
  const targetState = loadTargets();
  const targets = allTargets({ registry: data.local?.registry ?? [], state: targetState });
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
  const noteEdits = readJsonl(notesFile())
    .filter((n) => n?.date && n?.slug)
    .map((n) => ({ page: notePage(n.slug, live), date: n.date, kind: 'manual', subject: String(n.text ?? '') }));
  const edits = [...(local.edits ?? []).filter((e) => e.kind !== 'manual'), ...noteEdits].sort(
    (a, b) => b.date.localeCompare(a.date) || a.page.localeCompare(b.page)
  );
  const planTicks = readJson('state/plan-ticks.json', {}) || {};
  const planSeenOn = snapObjs.local?.pulledAt ? todayIso(new Date(snapObjs.local.pulledAt)) : null;
  const frozen = frozenPages({ items, opps, plan: local.plan ?? null, edits, planTicks, planSeenOn, today });

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
    SOURCES.map((s) => model.snapObjs[s]?.through)
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

export function eligibilityOf(model, opp) {
  const e = eligibility(opp, model.frozen, model.today);
  return { ...e, text: e.eligible ? 'Eligible now' : `Eligible from ${longDate(e.from)}` };
}

// An opportunity as the pages see it: plain text, score, lifecycle state, freeze, brief, links.
export function decorateOpp(model, o) {
  const state = itemState(model, o.id);
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
    eligibility: eligibilityOf(model, o),
    touchedOn: o.page ? touchedOn(o.page, model.edits) : [],
    links: linksFor(o.page),
    brief: brief(clean, { frozen: model.frozen }),
    detected: true,
  };
}

// Items the founder marked that the rules no longer find (done pages, old ignores). They keep
// the few facts saved when they were marked, so the Done and Ignored tabs stay complete.
export function goneOpps(model) {
  return Object.entries(model.items)
    .filter(([id, it]) => !model.oppById.has(id) && it.meta?.kind === 'opportunity')
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
      eligibility: { eligible: true, from: null, text: 'Eligible now' },
      touchedOn: [],
      links: linksFor(it.meta.page ?? null),
      brief: '',
      detected: false,
    }));
}
