// Before and after verdict for any page, from the desk's own daily Search Console
// pulls. Uses the same functions as scripts/change-log.mjs so a verdict here means
// the same thing as one there. Pure: no files, no clock.

import {
  SITE,
  WINDOW_DAYS,
  GSC_LAG_DAYS,
  windowsFor,
  rowsForWindow,
  metricsFor,
  controlFor,
  classify,
  dailySpan,
} from '../../scripts/lib/change-log-core.mjs';
import { addDays, daysBetween } from './dates.mjs';

// The desk stores pages as paths; the change-log functions expect full addresses.
function asFullUrls(pageDaily) {
  return pageDaily.map((r) => ({ ...r, page: `${SITE}${r.page}` }));
}

export function judgePage({ page, changeDate, pageDaily, today }) {
  const judgeFrom = addDays(changeDate, WINDOW_DAYS + GSC_LAG_DAYS);
  if (daysBetween(changeDate, today) < WINDOW_DAYS + GSC_LAG_DAYS) {
    return {
      status: 'too-early',
      judgeFrom,
      before: null,
      after: null,
      control: null,
      verdict: null,
      clicksTooSmall: null,
    };
  }

  const rows = asFullUrls(pageDaily || []);
  const { before: bw, after: aw } = windowsFor(changeDate);
  const beforeRows = rowsForWindow(rows, bw.start, bw.end);
  const afterRows = rowsForWindow(rows, aw.start, aw.end);
  const before = metricsFor(beforeRows, page);
  const after = metricsFor(afterRows, page);
  const control = controlFor(beforeRows, afterRows);
  const result = classify(before, after, control);

  // The desk keeps about 120 days of pulls. Say so when a window is not fully covered.
  const span = dailySpan(rows);
  return {
    status: 'judged',
    judgeFrom,
    windows: { before: bw, after: aw },
    before,
    after,
    control,
    verdict: result.verdict,
    clicksTooSmall: result.clicksTooSmall,
    signals: result.signals,
    dropType: result.dropType,
    partial: !span.min || span.min > bw.start || span.max < aw.end,
  };
}
