// Routes for the lessons ledger. A lesson is a short note the founder keeps about what an edit taught
// him, linked to the verdicts on Did it work that back it up. The status (trial, proven, dropped) follows
// the linked verdicts unless he sets it by hand; see lib/lessons.mjs.

import { get, post, put, del, bad, bodyOf } from '../kit.mjs';
import { buildModel, envelope } from '../model.mjs';
import { verdictRows } from '../work.mjs';
import { onRunFinished } from '../../refresh.mjs';
import {
  MAX_LESSONS,
  MAX_TEXT,
  AGREE_TO_PROVE,
  STATUSES,
  loadLessons,
  saveLessons,
  createLesson,
  updateLesson,
  settle,
  statusNote,
  provenDirectionOf,
  cleanText,
} from '../../lessons.mjs';

const TERM = 'Lessons';
const NUMBER_WORD = { 2: 'two', 3: 'three', 4: 'four', 5: 'five' };
const agree = NUMBER_WORD[AGREE_TO_PROVE] ?? String(AGREE_TO_PROVE);
// How a lesson becomes proven or dropped, in plain words, from the rule's own number.
const RULE_NOTE = `A lesson is a trial until ${agree} results all read better, or all read worse (then it is proven); results that disagree drop it.`;
const PROVEN_WHEN = `It becomes proven when ${agree} results all read better, or all read worse.`;
const EXPLAIN = 'Things you learned from edits, and whether the results keep saying the same thing.';

const notFound = (message) => Object.assign(new Error(message), { status: 404 });

// What the desk knows about each verdict, by the id /api/results gives it.
function verdictIndex(model) {
  const byId = new Map(verdictRows(model).map((v) => [v.id, v]));
  return {
    knows: (id) => byId.has(id),
    wordOf: (id) => byId.get(id)?.verdict ?? null,
    row: (id) => byId.get(id) ?? null,
  };
}

// A lesson as the page reads it: the saved fields, the status brought up to date, the linked verdicts
// in plain words and one sentence on why it has its status.
function present(lesson, index) {
  const live = settle(lesson, index.wordOf);
  const words = live.verdictIds.map(index.wordOf);
  return {
    id: live.id,
    text: live.text,
    status: live.status,
    manual: live.manual,
    statusNote: statusNote(live, words),
    provenDirection: live.status === 'proven' ? provenDirectionOf(words) : null,
    verdictIds: live.verdictIds,
    verdicts: live.verdictIds.map((id) => {
      const v = index.row(id);
      return v
        ? {
            id,
            known: true,
            page: v.page,
            changeDate: v.changeDate,
            verdict: v.verdict,
            verdictText: v.verdictText,
            judgedOn: v.judgedOn,
          }
        : { id, known: false, page: null, changeDate: null, verdict: null, verdictText: null, judgedOn: null };
    }),
    createdOn: live.createdOn,
    updatedOn: live.updatedOn,
  };
}

const newestFirst = (a, b) =>
  String(b.updatedOn).localeCompare(String(a.updatedOn)) ||
  String(b.createdOn).localeCompare(String(a.createdOn)) ||
  a.id.localeCompare(b.id);

// Every saved lesson with its status brought up to date. Reading never writes: the derived status is
// saved by the write routes (saveSettled) and after each refresh (settleSavedLessons).
const settledList = (index) => loadLessons().map((l) => settle(l, index.wordOf));
const saveSettled = (list, index) => saveLessons(list.map((l) => settle(l, index.wordOf)));

// After a refresh (a verdict may have been judged or gone missing), saves each lesson whose status
// follows its verdicts when that status changed.
export function settleSavedLessons() {
  const index = verdictIndex(buildModel());
  const stored = loadLessons();
  const settled = stored.map((l) => settle(l, index.wordOf));
  if (settled.some((l, i) => l.status !== stored[i].status)) saveLessons(settled);
}
onRunFinished(() => {
  try {
    settleSavedLessons();
  } catch {
    // a lesson file that cannot be settled never breaks a refresh
  }
});

export function listView(model) {
  const index = verdictIndex(model);
  const items = settledList(index)
    .map((l) => present(l, index))
    .sort(newestFirst);
  const counts = Object.fromEntries(STATUSES.map((s) => [s, items.filter((i) => i.status === s).length]));
  return {
    ...envelope(model, { need: ['local'] }),
    term: TERM,
    explain: EXPLAIN,
    counts: { ...counts, all: items.length },
    limits: { max: MAX_LESSONS, maxText: MAX_TEXT },
    ruleNote: RULE_NOTE,
    provenWhen: PROVEN_WHEN,
    items,
  };
}

function addLesson(body) {
  const model = buildModel();
  const index = verdictIndex(model);
  const list = loadLessons();
  if (list.length >= MAX_LESSONS) throw bad(`The desk keeps ${MAX_LESSONS} lessons at most. Delete some first.`);
  const text = cleanText(body.text);
  const verdictId = body.verdictId === undefined || body.verdictId === null ? null : String(body.verdictId);
  if (verdictId && !index.knows(verdictId))
    throw bad('The desk has no verdict with that id. Pick one from Did it work.');
  const lesson = createLesson({ text, verdictId, today: model.today, wordOf: index.wordOf });
  saveSettled([...list, lesson], index);
  return { ok: true, lesson: present(lesson, index) };
}

function changeLesson(id, body) {
  const model = buildModel();
  const index = verdictIndex(model);
  const list = loadLessons();
  const at = list.findIndex((l) => l.id === id);
  if (at < 0) throw notFound('There is no lesson with that id.');
  const next = updateLesson(list[at], body, { today: model.today, wordOf: index.wordOf, knows: index.knows });
  list[at] = next;
  saveSettled(list, index);
  return { ok: true, lesson: present(next, index) };
}

function removeLesson(id) {
  const list = loadLessons();
  if (!list.some((l) => l.id === id)) throw notFound('There is no lesson with that id.');
  saveSettled(
    list.filter((l) => l.id !== id),
    verdictIndex(buildModel())
  );
  return { ok: true, id };
}

export const routes = [
  get('/api/lessons', () => listView(buildModel())),
  post('/api/lessons', async (ctx) => addLesson(await bodyOf(ctx))),
  put('/api/lessons/:id', async (ctx) => changeLesson(ctx.params.id, await bodyOf(ctx))),
  del('/api/lessons/:id', (ctx) => removeLesson(ctx.params.id)),
];
