// CSV export for the lists. A header row first; any cell with a comma, quote or line break
// is quoted with doubled quotes; text that a spreadsheet could read as a formula gets a
// leading apostrophe so a search phrase can never run as one.

import { longRange } from '../text.mjs';
import { readCsv } from '../csv-read.mjs';
import { opportunitiesList, competingList, verdictRows } from './work.mjs';
import { pageRows, queriesTable, targetsView, RANGES } from './search.mjs';
import { healthView } from './panels.mjs';

export const LISTS = ['opportunities', 'competing', 'pages', 'queries', 'targets', 'verdicts', 'health'];

const NUMBER = /^-?\d+(\.\d+)?$/;

function cell(v) {
  if (v === null || v === undefined) return '';
  let s = typeof v === 'boolean' ? (v ? 'yes' : 'no') : String(v);
  if (typeof v === 'string' && /^[=+\-@\t\r]/.test(s) && !NUMBER.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(columns, rows) {
  const head = columns.map(([name]) => cell(name)).join(',');
  const body = rows.map((r) => columns.map(([, get]) => cell(get(r))).join(','));
  return `${[head, ...body].join('\r\n')}\r\n`;
}

// The CSV reader for the Generative AI import: an array of rows (arrays of strings).
export const parseCsv = (text) => readCsv(text).map((r) => r.cells);

const rangeText = (r) => (r ? (r.text ?? longRange(r.start, r.end)) : '');

// Returns {name, text} for a list, or null when the list is unknown.
export function csvFor(model, list, params = {}) {
  switch (list) {
    case 'opportunities': {
      const { items } = opportunitiesList(model, params);
      return toCsv(
        [
          ['type', (o) => o.typeLabel],
          ['page', (o) => o.page],
          ['search', (o) => o.query],
          ['title', (o) => o.title],
          ['status', (o) => o.status],
          ['score', (o) => o.score?.total],
          ['eligible', (o) => o.eligibility.eligible],
          ['eligible_from', (o) => o.eligibility.from],
          ['measured', (o) => o.measured],
          ['suggested_action_hypothesis', (o) => o.action],
          ['date_range', (o) => rangeText(o.range)],
        ],
        items
      );
    }
    case 'competing': {
      const rows = competingList(model).flatMap((q) => q.pages.map((p) => ({ q, p })));
      return toCsv(
        [
          ['search', (r) => r.q.query],
          ['search_impressions', (r) => r.q.impressions],
          ['registry_page', (r) => r.q.registryPage],
          ['page', (r) => r.p.page],
          ['page_share', (r) => r.p.share],
          ['page_impressions', (r) => r.p.impressions],
          ['page_position', (r) => r.p.position],
          ['date_range', () => rangeText(model.range)],
        ],
        rows
      );
    }
    case 'pages':
      return toCsv(
        [
          ['page', (r) => r.page],
          ['target_keyword', (r) => r.keyword],
          ['target_position', (r) => r.position],
          ['impressions', (r) => r.impressions],
          ['clicks', (r) => r.clicks],
          ['change_percent', (r) => r.change],
          ['searches', (r) => r.queryCount],
          ['inbound_links', (r) => r.inbound],
          ['last_deliberate_edit', (r) => r.lastEdit],
          ['frozen_until', (r) => r.frozenUntil],
          ['google_index', (r) => r.index],
          ['bing_impressions', (r) => r.bingImpressions],
          ['date_range', () => rangeText(model.range)],
        ],
        pageRows(model)
      );
    case 'queries': {
      const days = RANGES.includes(Number(params.range)) ? Number(params.range) : 28;
      const t = queriesTable(model, days);
      return toCsv(
        [
          ['search', (r) => r.query],
          ['impressions', (r) => r.impressions],
          ['clicks', (r) => r.clicks],
          ['position', (r) => r.position],
          ['change_percent', (r) => r.change],
          ['movement', (r) => r.movement],
          ['brand', (r) => r.brand],
          ['top_page', (r) => r.topPage],
          ['bing_impressions', (r) => r.bingImpressions],
          ['date_range', () => (t.range ? longRange(t.range.start, t.range.end) : '')],
        ],
        t.rows
      );
    }
    case 'targets':
      return toCsv(
        [
          ['target_keyword', (r) => r.keyword],
          ['target_page', (r) => r.page],
          ['position', (r) => r.position],
          ['previous_position', (r) => r.prevPosition],
          ['impressions', (r) => r.impressions],
          ['page_that_ranks', (r) => r.rankingPage],
          ['alignment', (r) => r.alignment],
          ['date_range', () => rangeText(model.range)],
        ],
        targetsView(model).rows
      );
    case 'verdicts':
      return toCsv(
        [
          ['page', (v) => (v.batch ? v.pages.join(' ') : v.page)],
          ['change_date', (v) => v.changeDate],
          ['judged_on', (v) => v.judgedOn],
          ['verdict', (v) => v.verdictText],
          ['before_impressions', (v) => v.before?.impressions],
          ['after_impressions', (v) => v.after?.impressions],
          ['before_position', (v) => v.before?.position],
          ['after_position', (v) => v.after?.position],
          ['typical_page_change', (v) => v.control?.impPct],
          ['summary', (v) => v.summary],
        ],
        verdictRows(model)
      );
    case 'health':
      return toCsv(
        [
          ['page', (r) => r.page],
          ['google_status', (r) => r.verdict],
          ['reason', (r) => r.reason],
          ['last_crawl', (r) => r.lastCrawl],
          ['clicks', (r) => r.clicks],
          ['changed_since_last_check', (r) => r.changedSinceLast],
        ],
        healthView(model).index
      );
    default:
      return null;
  }
}
