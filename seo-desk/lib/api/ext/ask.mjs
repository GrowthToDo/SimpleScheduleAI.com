// The Ask box routes. GET says whether Claude can be asked, offers five questions and returns the
// last 20 answers; POST asks one question (one at a time for the whole desk); DELETE clears the
// history. The answer is plain text from Claude, stored and sent as text; the page shows it with
// text nodes only. See lib/ask.mjs for why Claude runs with no tools.

import crypto from 'node:crypto';
import { get, post, del, bad, bodyOf } from '../kit.mjs';
import { buildModel, envelope } from '../model.mjs';
import { longDate } from '../../text.mjs';
import {
  buildDeskBrief,
  askPrompt,
  runClaude,
  findClaude,
  suggestionsFor,
  loadHistory,
  saveHistory,
  NOT_FOUND,
  QUESTION_MIN,
  QUESTION_MAX,
  HISTORY_MAX,
} from '../../ask.mjs';

export const QUESTION_RULE = `Type a question of ${QUESTION_MIN} to ${QUESTION_MAX} characters.`;
export const BUSY = 'Claude is still answering the last question. Wait for that answer, then ask again.';

const shown = (e) => ({
  id: e.id,
  question: e.question,
  answer: e.answer,
  askedAt: e.askedAt,
  through: e.through ?? null,
  throughText: e.through ? longDate(e.through) : null,
});

// run, find and now are injected by the tests (no real Claude there).
export function makeAskRoutes({ run = runClaude, find = findClaude, now = () => Date.now() } = {}) {
  let busy = false;
  return [
    get('/api/ask', () => {
      const model = buildModel();
      const available = Boolean(find());
      return {
        through: envelope(model).through,
        available,
        reason: available ? null : NOT_FOUND,
        suggestions: suggestionsFor(model),
        history: loadHistory().slice(0, HISTORY_MAX).map(shown),
      };
    }),
    post('/api/ask', async (ctx) => {
      const body = await bodyOf(ctx);
      const question = typeof body.question === 'string' ? body.question.trim() : '';
      if (question.length < QUESTION_MIN || question.length > QUESTION_MAX) throw bad(QUESTION_RULE);
      if (busy) throw Object.assign(new Error(BUSY), { status: 429 });
      busy = true;
      const started = now();
      try {
        const model = buildModel();
        const brief = buildDeskBrief(model, question);
        const { text } = await run(askPrompt({ question, brief: brief.text, today: model.today }));
        const through = envelope(model).through ?? null;
        const entry = {
          id: crypto.randomBytes(6).toString('hex'),
          question,
          answer: String(text),
          askedAt: new Date(started).toISOString(),
          tookMs: Math.max(0, now() - started),
          included: brief.included,
          through,
        };
        saveHistory([entry, ...loadHistory()]);
        return { ...shown(entry), tookMs: entry.tookMs, included: entry.included };
      } catch (e) {
        // Claude's own failures carry one plain sentence for the page.
        if (e?.askError) throw Object.assign(new Error(e.message), { status: 502 });
        throw e;
      } finally {
        busy = false;
      }
    }),
    del('/api/ask', () => {
      const cleared = loadHistory().length;
      saveHistory([]);
      return { ok: true, cleared };
    }),
  ];
}

export const routes = makeAskRoutes();
