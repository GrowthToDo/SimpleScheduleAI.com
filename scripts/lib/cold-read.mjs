/**
 * ICP cold-read scoring.
 *
 * The cold read (publish-pipeline.md phase 7) asks one question the other gates
 * cannot: can our reader USE this? It has always returned an essay, which means
 * no two posts were comparable and nothing could be tracked. This module turns
 * the reader's OBSERVATIONS into numbers.
 *
 * The split matters. The agent reports only what it observed (which sentences it
 * reread, which terms went undefined, which headings failed to answer their own
 * question, where it quit, what it would actually do on Monday). This module does
 * the arithmetic. An agent asked to self-report "82/100" invents a number; an
 * agent asked to list the sentences it reread is reporting an observation.
 *
 * Status: ADVISORY. Never blocks a commit. Constants below are a first
 * calibration and are expected to move once 6 to 7 posts have been scored.
 * See docs/seo/content-scoring.md.
 */

export const COLD_READ_VERSION = 1;

/** Friction points (rereads + undefined terms) per section that scores zero. */
export const COMPREHENSION_BUDGET = 6;

/**
 * Weights by what the post is FOR. A piece meant to make someone act on Monday
 * is not the same artifact as one meant to be trusted and forwarded, and it
 * should not be scored as if it were. Set `intent` in the cold-read record.
 */
export const INTENT_WEIGHTS = {
  act: { actionability: 0.4, comprehension: 0.25, headings: 0.2, attention: 0.15 },
  trust: { comprehension: 0.3, headings: 0.25, attention: 0.25, actionability: 0.2 },
  both: { comprehension: 0.28, actionability: 0.28, headings: 0.22, attention: 0.22 },
};

export const INTENTS = Object.keys(INTENT_WEIGHTS);

const clamp = (n) => Math.max(0, Math.min(100, n));
const round = (n) => Math.round(n * 10) / 10;

/**
 * Validate a raw cold-read record. Returns { ok, errors }.
 * Kept strict on shape and lenient on extra keys, so the agent can add colour
 * (quotes, notes) without failing validation.
 */
export function validateColdRead(raw) {
  const errors = [];
  if (!raw || typeof raw !== 'object') return { ok: false, errors: ['record is not an object'] };

  if (!INTENTS.includes(raw.intent)) {
    errors.push(`intent must be one of ${INTENTS.join(', ')} (got ${JSON.stringify(raw.intent)})`);
  }
  if (typeof raw.icp !== 'string' || !raw.icp.trim()) {
    errors.push('icp must be a non-empty string describing who read it');
  }
  if (!Array.isArray(raw.sections) || raw.sections.length === 0) {
    errors.push('sections must be a non-empty array');
  } else {
    raw.sections.forEach((s, i) => {
      if (typeof s.heading !== 'string' || !s.heading.trim()) errors.push(`sections[${i}].heading missing`);
      if (typeof s.answeredItsQuestion !== 'boolean') errors.push(`sections[${i}].answeredItsQuestion must be boolean`);
      if (typeof s.quitHere !== 'boolean') errors.push(`sections[${i}].quitHere must be boolean`);
      if (!Number.isInteger(s.rereadCount) || s.rereadCount < 0) {
        errors.push(`sections[${i}].rereadCount must be a non-negative integer`);
      }
    });
  }
  for (const k of ['undefinedTerms', 'mondayActions', 'blockedActions']) {
    if (!Array.isArray(raw[k])) errors.push(`${k} must be an array (use [] if none)`);
  }
  return { ok: errors.length === 0, errors };
}

/**
 * Derive scores from observations. Pure. No judgment lives here.
 */
export function scoreColdRead(raw) {
  const { ok, errors } = validateColdRead(raw);
  if (!ok) throw new Error(`invalid cold-read record:\n  - ${errors.join('\n  - ')}`);

  const sections = raw.sections;
  const n = sections.length;

  const rereads = sections.reduce((a, s) => a + s.rereadCount, 0);
  const friction = rereads + raw.undefinedTerms.length;
  const comprehension = clamp(100 * (1 - Math.min(1, friction / (COMPREHENSION_BUDGET * n))));

  const answered = sections.filter((s) => s.answeredItsQuestion).length;
  const headings = clamp((100 * answered) / n);

  const acted = raw.mondayActions.length;
  const blocked = raw.blockedActions.length;
  const actionability = acted + blocked === 0 ? 0 : clamp((100 * acted) / (acted + blocked));

  const quit = sections.filter((s) => s.quitHere).length;
  const attention = clamp(100 * (1 - quit / n));

  const parts = { comprehension, headings, actionability, attention };
  const w = INTENT_WEIGHTS[raw.intent];
  const overall = Object.entries(w).reduce((a, [k, weight]) => a + parts[k] * weight, 0);

  return {
    version: COLD_READ_VERSION,
    intent: raw.intent,
    parts: Object.fromEntries(Object.entries(parts).map(([k, v]) => [k, round(v)])),
    overall: round(overall),
    counts: {
      sections: n,
      rereads,
      undefinedTerms: raw.undefinedTerms.length,
      headingsAnswered: answered,
      mondayActions: acted,
      blockedActions: blocked,
      quitPoints: quit,
    },
  };
}
