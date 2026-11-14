// Scoring for opportunities. Every point is explained, so the page can show
// why one item sits above another. Pure functions, no clock, no files.

export const SIGNAL_ORDER = ['demand', 'distance', 'importance', 'confidence', 'effort', 'ai', 'outcome'];

export const LABEL = {
  demand: 'Demand',
  distance: 'Room to improve',
  importance: 'Page importance',
  confidence: 'Confidence in the numbers',
  effort: 'Ease of the work',
  ai: 'AI answer value',
  outcome: 'Interest from visitors',
};

export const MEANING = {
  demand: 'how many people see this in search (log scale)',
  distance: 'how far the numbers are from where they should be',
  importance: 'how much the page matters to the business',
  confidence: 'how much data backs the number',
  effort: 'how cheap the fix is (higher is cheaper)',
  ai: 'whether it helps us show up in AI answers',
  outcome:
    'how many visitors used a form, calculator or template after landing on the page; an interest signal, not a sale',
};

const round1 = (n) => Math.round(n * 10) / 10;

// opp.signals values are 0..1 or null. A null signal contributes 0 points. opp.signalNotes
// (optional, {signal: sentence}) adds one plain sentence to that signal's reason.
// Parts are rounded to one decimal each and the total is their sum, so the
// numbers on the page always add up.
export function score(opp, weights) {
  const signals = opp.signals || {};
  const parts = SIGNAL_ORDER.map((signal) => {
    const weight = weights?.[signal] ?? 0;
    const raw = signals[signal];
    const note = opp.signalNotes?.[signal] ? ` ${opp.signalNotes[signal]}` : '';
    const value = Number.isFinite(raw) ? Math.max(0, Math.min(1, raw)) : null;
    if (value === null) {
      return {
        signal,
        weight,
        value: null,
        points: 0,
        why: `${LABEL[signal]}: not enough data yet, so it adds 0 points.`,
      };
    }
    const points = round1(weight * value * 100);
    return {
      signal,
      weight,
      value,
      points,
      why: `${LABEL[signal]}: ${value.toFixed(2)} out of 1 (${MEANING[signal]}), weight ${Math.round(weight * 100)}%, adds ${points.toFixed(1)} points.${note}`,
    };
  });
  const total = Math.min(100, Math.max(0, round1(parts.reduce((t, p) => t + p.points, 0))));
  return { total, parts };
}

// Highest total first; ties break on id so the order never shuffles between runs.
export function rank(opps, weights) {
  return opps
    .map((o) => ({ ...o, score: score(o, weights) }))
    .sort((a, b) => b.score.total - a.score.total || String(a.id).localeCompare(String(b.id)));
}
