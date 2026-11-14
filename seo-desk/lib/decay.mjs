// One source for a Decay item's kind of drop, its recommendation and its test. The Decay rule
// (rules.mjs detectSlipping) builds its card from it, so All opportunities, the copyable brief, the
// Decay page, the week's worry and the Ask digest all say the same. Pure functions.

import { classify } from '../../scripts/lib/change-log-core.mjs';
import { pct } from './api/fmt.mjs';

export const DROP_KINDS = ['lost-rankings', 'lost-demand', 'lost-clicks', 'unclear'];
const DROP_LABEL = {
  'lost-rankings': 'Lost rankings (a hypothesis)',
  'lost-demand': 'Lost demand (a hypothesis)',
  'lost-clicks': 'Lost clicks at the same place (a hypothesis)',
  unclear: 'Cause unclear (a hypothesis)',
};
const DROP_RECOMMENDATION = {
  'lost-rankings':
    'Hypothesis: the page may have slipped down the results, so it may help to strengthen it and link to it from related pages.',
  'lost-demand':
    'Hypothesis: fewer people may be searching for this, so there may be nothing to fix. Leave it and check again later.',
  'lost-clicks':
    'Hypothesis: the page holds its place and its views but fewer people click, so look at the title and at what now sits above you.',
  unclear:
    'Hypothesis: the numbers do not point one way, so look at the page in Search Console before changing anything.',
};
// How each recommendation would be tested.
const DROP_TEST = {
  'lost-rankings': 'Judged by the 28-day before and after verdict on the page, about 30 days after the edit.',
  'lost-demand':
    'Look at the page again after the next 28 days. If its place still holds while its views stay low, that fits lower demand, and an edit may not help.',
  'lost-clicks': 'Judged by the 28-day before and after verdict on the page, about 30 days after the edit.',
  unclear:
    'Judged by the 28-day before and after verdict, if the look in Search Console leads to an edit; with no edit, look again after the next 28 days.',
};
// A page's own numbers before and after: {clicks, impressions, position}. The thresholds: the place
// worse by 2 or more (lost rankings); the place within 1 and views down 30 percent or more (lost
// demand); place and views within 15 percent but clicks down 30 percent or more, with 20 clicks
// before (lost clicks); anything else is unclear. A change under 20 views before is never read.
// The place and views changes come from classify in scripts/lib/change-log-core.mjs.
export function dropKindOf(before, after) {
  const mk = (b) => ({ ...b, ctr: b.impressions ? (b.clicks || 0) / b.impressions : 0, position: b.position ?? 0 });
  const b = mk(before);
  const a = mk(after);
  const { posDelta } = classify(b, a); // before minus after: negative is a worse place
  const views = pct(a.impressions, b.impressions);
  const clicks = pct(a.clicks || 0, b.clicks || 0);
  const place = (w) => (Number.isFinite(w) ? String(Math.round(w * 10) / 10) : 'unknown');
  const placeText = `Its average place went from ${place(b.position)} to ${place(a.position)}`;
  const viewsText =
    views === null ? '' : views <= -1 ? `fell ${Math.abs(views)}%` : views >= 1 ? `rose ${views}%` : 'held';
  let kind = 'unclear';
  let why = 'The place, the views and the clicks did not move in a way that points to one cause. It may be a mix.';
  if (views === null) {
    why = 'There were too few views before to read a cause from the numbers, so any guess may be wrong.';
  } else if (posDelta !== null && posDelta <= -2) {
    kind = 'lost-rankings';
    why = `${placeText} while its views ${viewsText}, so the page may have lost ground in the results.`;
  } else if (posDelta !== null && Math.abs(posDelta) <= 1 && views <= -30) {
    kind = 'lost-demand';
    why = `Views fell ${Math.abs(views)}% while the place held (${place(b.position)} to ${place(a.position)}), so demand may have dropped.`;
  } else if (
    posDelta !== null &&
    b.position > 0 &&
    Math.abs(posDelta) / b.position <= 0.15 &&
    Math.abs(views) <= 15 &&
    (before.clicks || 0) >= 20 &&
    clicks !== null &&
    clicks <= -30
  ) {
    kind = 'lost-clicks';
    why = `Clicks fell ${Math.abs(clicks)}% while the place and the views held, so something may have changed in how the page looks in results.`;
  }
  return { kind, label: DROP_LABEL[kind], why, recommendation: DROP_RECOMMENDATION[kind], test: DROP_TEST[kind] };
}

// The recommendation without its "Hypothesis:" label, first letter capital: the card's action. The
// card is labelled a hypothesis already.
export function dropAction(d) {
  const t = String(d?.recommendation ?? '')
    .replace(/^\s*Hypothesis:\s*/i, '')
    .trim();
  return t ? t[0].toUpperCase() + t.slice(1) : t;
}
