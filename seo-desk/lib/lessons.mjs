// The lessons ledger: short things the founder learned from edits, each one linked to the verdicts
// (the before and after results on Did it work) that back it up. A lesson starts as a trial, becomes
// proven when three linked verdicts read the same way, and is dropped when its linked verdicts split.
// The founder can set the status by hand, and then it stays as he set it until he hands it back.
// Pure functions except loadLessons and saveLessons, which touch state/lessons.json.

import crypto from 'node:crypto';
import { readJson, writeJson } from './store.mjs';

export const LESSONS_FILE = 'state/lessons.json';
export const MAX_LESSONS = 200;
export const MAX_TEXT = 300;
export const MAX_VERDICTS = 50; // links on one lesson
export const STATUSES = ['trial', 'proven', 'dropped'];
// The verdict words that say what happened. "Too early" and "too small to tell" say nothing yet, so
// they are not counted either way.
export const READINGS = ['better', 'worse', 'mixed', 'flat'];
// Only these two can prove a lesson: three that all say it helped, or three that all say it hurt.
export const DECISIVE = ['better', 'worse'];
export const PROVEN_DIRECTION = { better: 'helps', worse: 'hurts' };
export const AGREE_TO_PROVE = 3;

const fail = (status, message) => Object.assign(new Error(message), { status });

// 'dropped' when the linked verdicts that say something read two or more different ways; 'proven' when
// at least three read the same way and that way is better or worse (a lesson can be proven to help or
// proven to hurt, but three "no real change" or three "mixed" prove nothing); else 'trial'. `words` are the
// plain verdict words of the linked verdicts (null or an unknown word for one the desk no longer has).
export function statusFromReadings(words) {
  const read = (words ?? []).filter((w) => READINGS.includes(w));
  const kinds = new Set(read);
  if (kinds.size >= 2) return 'dropped';
  if (read.length >= AGREE_TO_PROVE && DECISIVE.includes(read[0])) return 'proven';
  return 'trial';
}

// 'helps' or 'hurts' when every linked verdict that says something reads better (or worse) and there are
// at least three; else null.
export function provenDirectionOf(words) {
  const read = (words ?? []).filter((w) => READINGS.includes(w));
  if (read.length >= AGREE_TO_PROVE && new Set(read).size === 1) return PROVEN_DIRECTION[read[0]] ?? null;
  return null;
}

// One plain sentence on why a lesson has its status, for the page.
export function statusNote(lesson, words) {
  const read = (words ?? []).filter((w) => READINGS.includes(w));
  const kinds = new Set(read);
  const n = read.length;
  const auto = lesson.manual ? 'You set this status by hand. ' : '';
  if (kinds.size >= 2) return `${auto}The linked results do not agree, so this lesson is dropped until they do.`;
  if (n >= AGREE_TO_PROVE && !DECISIVE.includes(read[0]))
    return `${auto}${n} linked results read the same way, but they say nothing for or against, so this stays a trial.`;
  if (n >= AGREE_TO_PROVE) return `${auto}${n} linked results read the same way.`;
  if (n === 0) return `${auto}No result is linked yet. Three that all read better, or all read worse, prove it.`;
  return `${auto}${n} linked ${n === 1 ? 'result reads' : 'results read'} one way so far. Three that all read better, or all read worse, prove it.`;
}

export function cleanText(value) {
  const text = String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) throw fail(400, 'A lesson needs some text.');
  if ([...text].length > MAX_TEXT) throw fail(400, `A lesson can be ${MAX_TEXT} characters at most.`);
  return text;
}

// Whatever is on disk, as a clean list.
export function cleanLessons(raw) {
  const out = [];
  const seen = new Set();
  for (const l of Array.isArray(raw) ? raw : []) {
    const id = typeof l?.id === 'string' ? l.id : '';
    const text = String(l?.text ?? '').trim();
    if (!id || !text || seen.has(id)) continue;
    seen.add(id);
    const manual = l.manual === true;
    out.push({
      id,
      text: [...text].slice(0, MAX_TEXT).join(''),
      status: STATUSES.includes(l.status) ? l.status : 'trial',
      verdictIds: [...new Set((Array.isArray(l.verdictIds) ? l.verdictIds : []).filter((v) => typeof v === 'string'))],
      createdOn: l.createdOn ?? null,
      updatedOn: l.updatedOn ?? l.createdOn ?? null,
      manual,
    });
  }
  return out.slice(0, MAX_LESSONS);
}

export const loadLessons = () => cleanLessons(readJson(LESSONS_FILE, []));
export const saveLessons = (list) => writeJson(LESSONS_FILE, cleanLessons(list));

// The lesson with its status brought up to date from the verdicts it links to, unless the founder set
// the status by hand. wordOf(id) is the plain verdict word of a linked verdict, or null.
export const settle = (lesson, wordOf) =>
  lesson.manual ? lesson : { ...lesson, status: statusFromReadings(lesson.verdictIds.map(wordOf)) };

export function createLesson({ text, verdictId = null, today, wordOf = () => null }) {
  const lesson = {
    id: crypto.randomUUID().slice(0, 8),
    text: cleanText(text),
    status: 'trial',
    verdictIds: verdictId ? [String(verdictId)] : [],
    createdOn: today,
    updatedOn: today,
    manual: false,
  };
  return settle(lesson, wordOf);
}

// body: {text?, status?, addVerdictId?, removeVerdictId?}. status is trial, proven or dropped (set by
// hand), or 'auto' to hand the decision back to the linked verdicts.
export function updateLesson(lesson, body, { today, wordOf = () => null, knows = () => true } = {}) {
  let next = { ...lesson, verdictIds: [...lesson.verdictIds] };
  const touched = ['text', 'status', 'addVerdictId', 'removeVerdictId'].some((k) => body[k] !== undefined);
  if (!touched) throw fail(400, 'There is nothing to change. Send text, status, addVerdictId or removeVerdictId.');
  if (body.text !== undefined) next.text = cleanText(body.text);
  if (body.addVerdictId !== undefined) {
    const id = String(body.addVerdictId ?? '');
    if (!id || !knows(id)) throw fail(400, 'The desk has no verdict with that id. Pick one from Did it work.');
    if (!next.verdictIds.includes(id)) {
      if (next.verdictIds.length >= MAX_VERDICTS)
        throw fail(400, `A lesson can link ${MAX_VERDICTS} verdicts at most.`);
      next.verdictIds.push(id);
    }
  }
  if (body.removeVerdictId !== undefined) {
    next.verdictIds = next.verdictIds.filter((v) => v !== String(body.removeVerdictId));
  }
  if (body.status !== undefined) {
    if (body.status === 'auto') next.manual = false;
    else if (STATUSES.includes(body.status)) {
      next.status = body.status;
      next.manual = true;
    } else throw fail(400, `status must be one of: ${STATUSES.join(', ')}, or auto to follow the linked verdicts.`);
  }
  next = settle(next, wordOf);
  next.updatedOn = today;
  return next;
}
