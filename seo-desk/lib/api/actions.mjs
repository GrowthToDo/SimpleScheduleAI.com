// The routes that change something: item actions, the weekly plan, annotations, settings,
// the visit marker, the Generative AI import, the manual edit note and the backup. Every
// write goes to a small file under the data directory, except the edit note, which appends
// one line to docs/seo/change-log-notes.jsonl. Errors are plain sentences with a status.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { readJson, writeJson, dataDir } from '../store.mjs';
import { PRESETS, THRESHOLDS } from '../config.mjs';
import { transition, loadItems, saveItems, FREEZE_DAYS } from '../lifecycle.mjs';
import { setTop5, lockWeek, editThisWeek, PLAN_SIZES } from '../week.mjs';
import { addDays, mondayOf } from '../dates.mjs';
import { longDate, plain } from '../text.mjs';
import {
  buildModel,
  invalidate,
  saveSettings,
  loadSettings,
  notesFile,
  POST_PAGE_RE,
  SIGNALS,
  ADJUSTABLE_THRESHOLDS,
  pagePath,
  envelope,
  itemState,
  itemOf,
} from './model.mjs';
import {
  weekModel,
  weekView,
  currentTop5,
  itemKey,
  loadAnnotations,
  ANNOTATIONS_FILE,
  visitSummary,
  splitEdit,
} from './work.mjs';
import { AI_IMPORTS_FILE, loadAiImports } from './panels.mjs';
import { parseCsv } from './csv.mjs';

const fail = (status, message) => Object.assign(new Error(message), { status });
const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s)) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));

// ---------------------------------------------------------------- the one edit a week rule

// The two things that hold back a new live page edit, from the lifecycle freeze (model.frozen)
// and the this-week check in week.mjs (editThisWeek), never worked out here:
//   frozen         the page itself is inside the 28 days of an earlier deliberate edit
//   secondThisWeek a deliberate page edit is already dated this week (on any page)
// Null when neither holds. `page` is the page about to be edited, or a list when one Done edits
// several: every frozen one is in `frozenPages`, and `frozen` is the first of them.
export function editGuards(model, page) {
  const out = {};
  const pages = (Array.isArray(page) ? page : [page]).filter(Boolean);
  const frozenPages = [];
  for (const p of pages) {
    const f = model.frozen.get(p);
    if (f)
      frozenPages.push({
        page: p,
        since: f.since,
        until: f.until,
        sinceText: longDate(f.since),
        untilText: longDate(f.until),
      });
  }
  if (frozenPages.length) {
    out.frozen = frozenPages[0];
    out.frozenPages = frozenPages;
  }
  const w = editThisWeek(model.frozen, model.today);
  if (w) out.secondThisWeek = { page: w.page, date: w.since, dateText: longDate(w.since) };
  return Object.keys(out).length ? out : null;
}

// The 409 for a held back edit, with every reason in plain words and in `extra` for the page.
export function editRefused(g, what) {
  const parts = [];
  for (const f of g.frozenPages ?? (g.frozen ? [g.frozen] : []))
    parts.push(
      `${f.page} was edited on ${f.sinceText} and is frozen until ${f.untilText}. ${what} restarts the 28 days.`
    );
  if (g.secondThisWeek)
    parts.push(
      `You already made this week's page edit on ${g.secondThisWeek.dateText} (${g.secondThisWeek.page}). The rule is one a week.`
    );
  return Object.assign(fail(409, `${parts.join(' ')} Send override to do it anyway.`), { extra: g });
}

// ---------------------------------------------------------------- item actions

export function itemAction(id, body) {
  const model = buildModel();
  const key = itemKey(id);
  const opp = model.oppById.get(key);
  const pool = weekModel(model).pool;
  const card = pool.get(id) ?? pool.get(`opp:${key}`) ?? null;
  if (!opp && !card && !itemOf(model, key)) throw fail(404, 'The desk does not know that item. Refresh the page.');

  let page = opp?.page ?? card?.page ?? itemOf(model, key)?.page ?? null;
  let isPageEdit = opp ? opp.isPageEdit : card ? card.isPageEdit : undefined;
  // A split search (cannibalization) edits the pages its chosen action names, not only the top page:
  // every one of them is checked, and every one is frozen by Done. A choice that edits no page
  // (leave alone, or differentiate with no page named) records no page edit.
  const split = body.action === 'done' ? splitEdit(model, key, body.page ?? null) : null;
  const pages = split ? split.pages : page ? [page] : [];
  if (split) {
    page = pages[0] ?? null;
    isPageEdit = pages.length > 0;
  }
  if (body.action === 'snooze' && body.until !== undefined && !isDate(body.until)) {
    throw fail(400, 'Snooze needs a date such as 2026-12-01.');
  }
  let next;
  try {
    next = transition(itemOf(model, key), body.action, {
      today: model.today,
      until: body.until,
      reason: body.reason,
      text: body.text,
      page,
      ...(split ? { pages } : {}),
      isPageEdit,
    });
  } catch (e) {
    if (e.message === 'conflict') {
      throw fail(409, 'That item is finished or ignored, so that action is not allowed. Press Reopen first.');
    }
    throw fail(400, e.message.startsWith('unknown action') ? 'That is not an action the desk knows.' : e.message);
  }
  // Done on a page that is still frozen would restart its 28 days and spoil the verdict that is
  // running, and a second page edit in one week breaks the one a week rule, so either needs an
  // explicit override. A second Done on a finished item changes nothing, and an ignored item is
  // refused above with its own plain reason (press Reopen first) before these are asked.
  if (
    body.action === 'done' &&
    isPageEdit &&
    pages.length &&
    itemOf(model, key)?.status !== 'done' &&
    body.override !== true
  ) {
    const g = editGuards(model, pages);
    if (g) throw editRefused(g, 'Marking this done');
  }
  // Keep the few facts needed to list the item after the rules stop finding it.
  next = {
    ...next,
    meta: opp
      ? {
          kind: 'opportunity',
          type: opp.type,
          source: opp.source,
          page: opp.page,
          query: opp.query ?? null,
          title: plain(opp.title),
          isPageEdit: split ? isPageEdit : opp.isPageEdit,
        }
      : { kind: 'card', title: plain(card?.title ?? next.meta?.title ?? key), isPageEdit: Boolean(isPageEdit) },
  };
  saveItems({ ...loadItems(), [key]: next });
  invalidate();

  const out = { id, key, item: itemState(buildModel(), key) };
  if (body.action === 'done' && next.status === 'done' && next.isPageEdit && next.page) {
    const until = addDays(next.doneAt, FREEZE_DAYS);
    // freeze is the first page; freezes lists every page the Done froze (one, or several for a split).
    out.freezes = (next.pages ?? [next.page]).map((p) => ({ page: p, until, untilText: longDate(until) }));
    out.freeze = out.freezes[0];
  }
  if (body.action === 'done' && card?.source === 'plan') {
    out.reminder = `In ${model.data.local?.plan?.file ?? 'the plan file in docs/seo'}, write "Done YYYY-MM-DD" in the row's last cell and tick it. The desk never edits that file.`;
  }
  return out;
}

// ---------------------------------------------------------------- the weekly plan

export function chooseTop5(input) {
  let ids = input;
  const model = buildModel();
  const { weekOf, pool } = weekModel(model);
  if (!Array.isArray(ids) || ids.some((i) => typeof i !== 'string')) throw fail(400, 'ids must be a list of card ids.');
  if (ids.length > 5) throw fail(400, 'A week holds five cards at most.');
  // An opportunity may be sent by its own id or as its card id, opp:<id>.
  ids = ids.map((i) => (!pool.has(i) && pool.has(`opp:${i}`) ? `opp:${i}` : i));
  if (new Set(ids).size !== ids.length) throw fail(400, 'A card can be in the week only once.');
  const missing = ids.filter((i) => !pool.has(i));
  if (missing.length) throw fail(400, `The desk does not know these cards: ${missing.join(', ')}.`);
  const edits = ids.filter((i) => pool.get(i)?.isPageEdit).length;
  if (edits > 1) {
    throw fail(
      400,
      `That plan has ${edits} live page edits. The rule is one live page edit a week, so keep one and move the others to a later week.`
    );
  }
  // The 28 day rule. A page edit card that is itself done is the edit that froze its page, so it may stay.
  const done = editThisWeek(model.frozen, model.today);
  for (const id of ids) {
    const card = pool.get(id);
    if (!card?.isPageEdit || itemOf(model, itemKey(id))?.status === 'done') continue;
    const f = card.page ? model.frozen.get(card.page) : null;
    if (f && f.until > model.today) {
      throw fail(
        400,
        `${card.page} was edited on ${longDate(f.since)} and is frozen until ${longDate(f.until)}, so it cannot be this week's page edit.`
      );
    }
    if (done) {
      throw fail(
        400,
        `This week's live page edit is already done (${done.page} on ${longDate(done.since)}). The next one can go in from ${longDate(addDays(mondayOf(model.today), 7))}.`
      );
    }
  }
  if (currentTop5(model).stored?.locked)
    throw fail(409, "This week's plan is locked. Unlock it before changing the five.");
  setTop5(weekOf, ids);
  invalidate();
  return weekView(buildModel());
}

export function lockCurrentWeek() {
  const model = buildModel();
  const { cards } = currentTop5(model);
  if (!cards.length) throw fail(400, 'There are no cards to lock yet.');
  lockWeek(weekModel(model).weekOf, cards);
  invalidate();
  return weekView(buildModel());
}

export function unlockWeek() {
  const model = buildModel();
  const { weekOf } = weekModel(model);
  const all = readJson('state/weeks.json', {});
  if (!all[weekOf]?.locked) throw fail(409, 'This week is not locked.');
  writeJson('state/weeks.json', { ...all, [weekOf]: { ...all[weekOf], locked: false } });
  invalidate();
  return weekView(buildModel());
}

// ---------------------------------------------------------------- annotations

// A note has a title (the label on the charts), a date, an optional end date for something that
// ran over several days, a category and a longer detail. `text` mirrors the title for older readers.
export const NOTE_CATEGORIES = [
  { key: 'content', label: 'Content change' },
  { key: 'technical', label: 'Technical change' },
  { key: 'links', label: 'Links' },
  { key: 'promotion', label: 'Promotion or outreach' },
  { key: 'google', label: 'Google update' },
  { key: 'other', label: 'Something else' },
];

const cleanTitle = (t) => {
  const s = String(t ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!s) throw fail(400, 'An annotation needs a title.');
  if (s.length > 300) throw fail(400, 'An annotation title can be 300 characters at most.');
  return s;
};

const cleanDetail = (t) => {
  const s = String(t ?? '').trim();
  if (s.length > 1000) throw fail(400, 'The detail can be 1000 characters at most.');
  return s;
};

const cleanCategory = (c) => {
  const key = c === undefined || c === null || c === '' ? 'other' : String(c);
  if (!NOTE_CATEGORIES.some((x) => x.key === key)) throw fail(400, 'Pick a category from the list.');
  return key;
};

const cleanEnd = (v) => {
  if (v === undefined || v === null || v === '') return null;
  if (!isDate(v)) throw fail(400, 'The end date must look like 2026-11-10.');
  return String(v);
};

const checkOrder = (date, endDate) => {
  if (endDate && endDate < date) throw fail(400, 'The end date cannot be before the start date.');
};

// archived: false lists the live notes, true lists only the archived ones.
export function annotationsView(model, { archived = false } = {}) {
  const items = loadAnnotations().filter((a) => Boolean(a.archived) === Boolean(archived));
  return {
    ...envelope(model),
    archived: Boolean(archived),
    categories: NOTE_CATEGORIES,
    items,
  };
}

function writeAnnotations(list) {
  writeJson(ANNOTATIONS_FILE, list);
  invalidate();
}

export function addAnnotation(body) {
  const model = buildModel();
  const date = body.date ?? model.today;
  if (!isDate(date)) throw fail(400, 'The date must look like 2026-11-10.');
  const title = cleanTitle(body.title ?? body.text);
  const endDate = cleanEnd(body.endDate);
  checkOrder(date, endDate);
  const a = {
    id: crypto.randomUUID().slice(0, 8),
    date,
    endDate,
    title,
    text: title,
    category: cleanCategory(body.category),
    detail: cleanDetail(body.detail),
    createdAt: new Date().toISOString(),
    archived: false,
  };
  writeAnnotations([...loadAnnotations(), a]);
  return a;
}

export function updateAnnotation(id, body) {
  const list = loadAnnotations();
  const i = list.findIndex((a) => a.id === id);
  if (i < 0) throw fail(404, 'There is no annotation with that id.');
  const next = { ...list[i] };
  if (body.date !== undefined) {
    if (!isDate(body.date)) throw fail(400, 'The date must look like 2026-11-10.');
    next.date = body.date;
  }
  if (body.endDate !== undefined) next.endDate = cleanEnd(body.endDate);
  checkOrder(next.date, next.endDate);
  if (body.title !== undefined || body.text !== undefined) {
    next.title = cleanTitle(body.title ?? body.text);
    next.text = next.title;
  }
  if (body.category !== undefined) next.category = cleanCategory(body.category);
  if (body.detail !== undefined) next.detail = cleanDetail(body.detail);
  if (body.archived !== undefined) {
    next.archived = Boolean(body.archived);
    next.archivedAt = next.archived ? new Date().toISOString() : null;
  }
  list[i] = next;
  writeAnnotations(list);
  return next;
}

// Archives a live annotation; permanently removes one that is already archived. The answer says
// which of the two happened.
export function deleteAnnotation(id) {
  const list = loadAnnotations();
  const a = list.find((x) => x.id === id);
  if (!a) throw fail(404, 'There is no annotation with that id.');
  if (!a.archived) {
    return {
      archived: true,
      message: 'Moved to the archive. You can restore it from there, or delete it for good.',
      annotation: updateAnnotation(id, { archived: true }),
    };
  }
  writeAnnotations(list.filter((x) => x.id !== id));
  return { deleted: true, id, message: 'Deleted for good.' };
}

// Brings an archived note back. A note that is not archived is left as it is.
export function restoreAnnotation(id) {
  const a = loadAnnotations().find((x) => x.id === id);
  if (!a) throw fail(404, 'There is no annotation with that id.');
  if (!a.archived) return { restored: false, message: 'That note was not archived.', annotation: a };
  return { restored: true, message: 'Restored.', annotation: updateAnnotation(id, { archived: false }) };
}

// ---------------------------------------------------------------- settings

export function changeSettings(body) {
  const cur = loadSettings();
  const next = {
    preset: cur.preset,
    weights: cur.weights,
    moneyPages: cur.moneyPages,
    thresholds: cur.thresholds,
    strategicKeywords: cur.strategicKeywords,
    paused: cur.paused,
    weeklyAudit: cur.weeklyAudit,
    showGoogleUpdates: cur.showGoogleUpdates,
    planSize: cur.planSize,
  };

  if (body.preset !== undefined) {
    if (!Object.hasOwn(PRESETS, body.preset) && body.preset !== 'custom')
      throw fail(400, `preset must be one of: ${[...Object.keys(PRESETS), 'custom'].join(', ')}.`);
    next.preset = body.preset;
    if (Object.hasOwn(PRESETS, body.preset)) next.weights = { ...PRESETS[body.preset] };
  }
  if (body.weights !== undefined) {
    const w = body.weights;
    if (!w || typeof w !== 'object' || Array.isArray(w))
      throw fail(400, 'weights must be an object with one number per signal.');
    const merged = { ...next.weights };
    for (const [k, v] of Object.entries(w)) {
      if (!SIGNALS.includes(k)) throw fail(400, `${k} is not a ranking signal. Use: ${SIGNALS.join(', ')}.`);
      if (!Number.isFinite(v) || v < 0 || v > 1) throw fail(400, `The weight for ${k} must be a number from 0 to 1.`);
      merged[k] = v;
    }
    const sum = SIGNALS.reduce((s, k) => s + merged[k], 0);
    if (!(sum > 0)) throw fail(400, 'At least one weight must be above zero.');
    next.weights = Object.fromEntries(SIGNALS.map((k) => [k, Math.round((merged[k] / sum) * 1000) / 1000]));
    const same = (name) => SIGNALS.every((k) => Math.abs(PRESETS[name][k] - next.weights[k]) < 0.002);
    next.preset =
      body.preset && Object.hasOwn(PRESETS, body.preset) && same(body.preset)
        ? body.preset
        : (Object.keys(PRESETS).find(same) ?? 'custom');
  }
  if (body.moneyPages !== undefined) {
    const list = body.moneyPages;
    if (!Array.isArray(list) || list.some((p) => typeof p !== 'string' || !p.startsWith('/'))) {
      throw fail(400, 'moneyPages must be a list of page paths that start with a slash.');
    }
    next.moneyPages = [...new Set(list.map(pagePath))];
  }
  if (body.thresholds !== undefined) {
    const t = body.thresholds;
    if (!t || typeof t !== 'object' || Array.isArray(t)) throw fail(400, 'thresholds must be an object.');
    const out = { ...next.thresholds };
    for (const [k, v] of Object.entries(t)) {
      if (!(k in THRESHOLDS)) throw fail(400, `${k} is not a threshold the desk has.`);
      if (!ADJUSTABLE_THRESHOLDS.includes(k)) {
        throw fail(
          400,
          `${k} is shared with the monthly diagnose script, so it cannot be changed here. You can change: ${ADJUSTABLE_THRESHOLDS.join(', ')}.`
        );
      }
      if (v === null) delete out[k];
      else if (!Number.isFinite(v) || v < 0) throw fail(400, `The threshold ${k} must be a number, zero or more.`);
      else out[k] = v;
    }
    next.thresholds = out;
  }
  if (body.strategicKeywords !== undefined) {
    const list = body.strategicKeywords;
    if (!Array.isArray(list) || list.some((k) => typeof k !== 'string'))
      throw fail(400, 'strategicKeywords must be a list of search phrases.');
    if (list.length > 200) throw fail(400, 'strategicKeywords can hold at most 200 keywords.');
    const trimmed = list.map((k) => k.trim()).filter(Boolean);
    if (trimmed.some((k) => k.length > 120)) throw fail(400, 'Each strategic keyword can be at most 120 characters.');
    next.strategicKeywords = trimmed;
  }
  for (const key of ['paused', 'weeklyAudit', 'showGoogleUpdates']) {
    if (body[key] === undefined) continue;
    if (typeof body[key] !== 'boolean') throw fail(400, `${key} must be true or false.`);
    next[key] = body[key];
  }
  if (body.planSize !== undefined) {
    if (!PLAN_SIZES.includes(body.planSize)) throw fail(400, 'planSize must be 3 or 5.');
    next.planSize = body.planSize;
  }
  saveSettings(next);
  return { ...buildModel().settings, planSize: next.planSize };
}

// ---------------------------------------------------------------- visit marker

export function recordVisit() {
  const model = buildModel();
  const at = new Date().toISOString();
  writeJson('state/visit.json', { at, day: model.today, summary: visitSummary(model) });
  invalidate();
  return { at };
}

// ---------------------------------------------------------------- Generative AI import

const NUM = /^-?[\d,]*\.?\d+%?$/;
const SKIP_TOTAL = /ctr|rate|position|percent|share/i;

export function importAiCsv(text) {
  const rows = parseCsv(text);
  if (rows.length < 2)
    throw fail(
      400,
      'That file has no data rows. Export the Generative AI report from Search Console as CSV and try again.'
    );
  const columns = rows[0].map((c) => c.trim());
  if (columns.length < 2 || columns.some((c) => !c)) throw fail(400, 'The first row must be column names.');
  const body = rows.slice(1, 5001).map((r) => Object.fromEntries(columns.map((c, i) => [c, (r[i] ?? '').trim()])));
  const totals = {};
  for (const c of columns) {
    if (SKIP_TOTAL.test(c)) continue;
    const vals = body.map((r) => r[c]).filter((v) => v !== '');
    if (vals.length && vals.every((v) => NUM.test(v)))
      totals[c] = vals.reduce((s, v) => s + Number(v.replace(/[,%]/g, '')), 0);
  }
  const model = buildModel();
  const entry = {
    date: model.today,
    importedAt: new Date().toISOString(),
    columns,
    rowCount: body.length,
    totals,
    rows: body,
  };
  writeJson(
    AI_IMPORTS_FILE,
    [...loadAiImports().filter((i) => i.date !== entry.date), entry].sort((a, b) => a.date.localeCompare(b.date))
  );
  invalidate();
  return { ok: true, date: entry.date, rowCount: entry.rowCount, columns, totals };
}

// ---------------------------------------------------------------- manual edit note

// Appends one line to docs/seo/change-log-notes.jsonl. The "Edit:" prefix is what freezes the page.
export function addEditNote(body) {
  if (body.confirm !== true) {
    throw fail(
      400,
      'Confirm first: this adds one line to docs/seo/change-log-notes.jsonl and freezes the page for 28 days. Send {"confirm": true}.'
    );
  }
  const page = pagePath(body.page);
  if (!String(body.page ?? '').startsWith('/'))
    throw fail(400, 'page must be a path that starts with a slash, such as /pricing.');
  const local = buildModel().data.local;
  const known = new Set([...(local?.livePages ?? []).map((p) => p.page), ...(local?.registry ?? []).map((r) => r.url)]);
  if (![...known].some((p) => p && pagePath(p) === page)) {
    throw fail(
      400,
      `${page} is not a live page or a page in your keyword file, so the note was not written. Check the spelling of the address.`
    );
  }
  // Line breaks become spaces, so a note is always one line in the file.
  const text = String(body.text ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) throw fail(400, 'The note needs some text saying what changed.');
  if (text.length > 500) throw fail(400, 'The note can be 500 characters at most.');
  // The same two guards as marking a page edit done: a frozen page, or a second edit this week.
  const model = buildModel();
  if (body.override !== true) {
    const g = editGuards(model, page);
    if (g) throw editRefused(g, 'Logging this edit');
  }
  const slug = POST_PAGE_RE.test(page) ? page.split('/').pop() : page;
  const line = { date: model.today, slug, text: `Edit: ${text}`, source: 'manual' };
  const file = notesFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  let lead = '';
  try {
    const s = fs.readFileSync(file, 'utf8');
    if (s && !s.endsWith('\n')) lead = '\n';
  } catch {
    // a new file
  }
  fs.appendFileSync(file, `${lead}${JSON.stringify(line)}\n`);
  invalidate();
  return {
    ok: true,
    wrote: 'docs/seo/change-log-notes.jsonl',
    line,
    frozenUntil: addDays(line.date, FREEZE_DAYS),
    frozenUntilText: longDate(addDays(line.date, FREEZE_DAYS)),
  };
}

// ---------------------------------------------------------------- backup

// Everything the desk keeps that cannot be pulled again: state files and daily history.
export function backup() {
  const out = { createdAt: new Date().toISOString(), state: {}, history: {} };
  for (const [folder, target] of [
    ['state', out.state],
    ['history', out.history],
  ]) {
    let names = [];
    try {
      names = fs.readdirSync(path.join(dataDir(), folder)).filter((n) => n.endsWith('.json'));
    } catch {
      // nothing saved yet
    }
    for (const n of names) target[n.replace(/\.json$/, '')] = readJson(`${folder}/${n}`, null);
  }
  return out;
}
