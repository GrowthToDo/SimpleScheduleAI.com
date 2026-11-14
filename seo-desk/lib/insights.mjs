// The standard insight names and the small pure helpers behind the Overview, the insight lists,
// the keyword map table and the content gaps. Nothing here reads the model, and the only thing read
// from disk is the founder's saved cannibalization choices (readChoices), so it can be imported from
// anywhere (model.mjs takes the terms from here).

import { classify } from '../../scripts/lib/change-log-core.mjs';
import { groupTopics } from './topics.mjs';
import { norm } from './targets.mjs';
import { readJson } from './store.mjs';
import { pct } from './api/fmt.mjs';

// ---------------------------------------------------------------- the standard names

// One entry per opportunity type: the term the founder sees and one plain sentence saying what it
// means. The rule texts in rules.mjs (titles, measured lines) are untouched; only the label is here.
export const TERMS = {
  'near-page-one': { term: 'Runner-up keywords', explain: 'Searches where you sit just off page one.' },
  'low-click-rate': {
    term: 'Low click rate',
    explain: 'Pages that show up in search but get fewer clicks than their place would suggest.',
  },
  'competing-pages': {
    term: 'Cannibalization',
    explain: 'Two of your pages are competing for the same search.',
  },
  slipping: { term: 'Decay', explain: 'Pages that are being shown less than before.' },
  'wrong-page': {
    term: 'Wrong page ranking',
    explain: 'Searches where a different page from the one you wrote for it is the one showing.',
  },
  unserved: { term: 'Content gaps', explain: 'Searches you already appear for that no page is written for.' },
  question: {
    term: 'Unanswered questions',
    explain: 'Questions people search for that none of your pages answers well.',
  },
  'needs-links': { term: 'Internal links', explain: 'Pages that few of your other pages link to.' },
  'ai-gap': {
    term: 'AI names competitors, not us',
    explain: 'AI tools name other companies for this search and do not name you.',
  },
  // The tab is neutral; each item says which way round it is (see termOf and typeLabelOf).
  'engine-gap': {
    term: 'Google and Bing differ',
    explain: 'A search or page shows on one of Google and Bing and not on the other.',
  },
  'not-indexed': { term: 'Not indexed', explain: 'Pages Google has not added to its search results.' },
};

// The one standard name that is not an opportunity type: searches a page already shows for.
export const SECONDARY = {
  term: 'Secondary keywords',
  explain: 'Searches a page already appears for but does not target.',
};

// {term, explain} for one item. An engine gap runs one of two ways, and the rules mark which with
// the source that holds the numbers: 'bing' means Bing shows us and Google does not.
export function termOf(type, source = null) {
  const base = TERMS[type] ?? { term: String(type ?? ''), explain: '' };
  if (type === 'engine-gap' && source === 'bing')
    return { term: base.term, explain: 'Bing shows this search or page and Google does not.' };
  if (type === 'engine-gap' && source === 'gsc')
    return { term: base.term, explain: 'Google shows this search or page and Bing does not.' };
  return { ...base };
}

// One plain sentence for each card that is not an opportunity, by its label.
const CARD_EXPLAIN = {
  'Dropped off Google': 'A page that Google had in its results at the last check and now does not.',
  'A change made things worse': 'A page was changed and then did worse in the 28 days that followed.',
  'Bing crawl problem': 'Bing could not read one of your pages.',
  'Keyword file problem': 'The list of keywords your pages are written for has a mistake in it.',
  'A data source did not refresh': 'One of the desk data sources failed the last time it was pulled.',
  'Competitor change': 'A competitor page has changed since the last look.',
  'New post': 'A post from your plan that is not written yet.',
  'Live page improvement': 'A change to a page that is already live.',
  Verdict: 'The before and after result for a change you made.',
  'Open work': 'Something from your open work list.',
};
export const cardExplain = (label) => CARD_EXPLAIN[label] ?? 'Something that needs your attention.';

// The statuses the insight lists treat as still open (the same set the week page counts).
export const OPEN_STATUSES = ['new', 'in-progress', 'came-back'];

// ---------------------------------------------------------------- click rate

// The whole-site click rate is shown only with this many impressions behind it.
export const CLICK_RATE_MIN_IMPRESSIONS = 500;

// Clicks over impressions from the site totals (never from search rows), to three decimals, or null
// when there are too few impressions to say.
export function clickRateOf(clicks, impressions) {
  const c = Number(clicks);
  const i = Number(impressions);
  if (!Number.isFinite(c) || !Number.isFinite(i) || i < CLICK_RATE_MIN_IMPRESSIONS) return null;
  return Math.round((c / i) * 1000) / 1000;
}

// ---------------------------------------------------------------- content gaps

const QUESTION_START =
  /^(?:what|how|why|when|where|who|which|can|could|does|do|did|is|are|was|were|should|will|would)\b/i;

// A readable working title from the lead search, in plain words: dashes become spaces, the first
// letter is a capital, and a trailing question mark goes unless the search is a question. It never
// adds a claim of its own.
export function gapTitle(query) {
  let s = String(query ?? '')
    .replace(/[-–—]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!QUESTION_START.test(s)) s = s.replace(/\?+$/, '').trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

// 'high', 'medium' or 'low' for each value by terciles of the values (the busiest third is high).
// Equal values share a band. The result lines up with the input.
export function priorityBands(values) {
  const n = values.length;
  if (!n) return [];
  const sorted = [...values].sort((a, b) => b - a);
  const high = sorted[Math.ceil(n / 3) - 1];
  const medium = sorted[Math.ceil((2 * n) / 3) - 1];
  return values.map((v) => (v >= high ? 'high' : v >= medium ? 'medium' : 'low'));
}

// Searches with no page written for them, grouped by the words they share (the topic grouping the
// Topics page uses). rows are {query, page, impressions, position}. A rare one-word search the
// grouping would drop still gets a group of its own, so no search disappears.
// Returns [{topic, impressions, searches: [{query, impressions, position}]}], busiest first, each
// group's searches busiest first (the first is the lead search).
export function gapGroups(rows) {
  const { topics } = groupTopics(rows, {});
  const placed = new Set();
  const groups = topics.map((t) => {
    for (const q of t.queries) placed.add(norm(q.query));
    return {
      topic: t.label,
      impressions: t.impressions,
      searches: t.queries.map((q) => ({ query: q.query, impressions: q.impressions, position: q.position })),
    };
  });
  for (const r of rows) {
    if (placed.has(norm(r.query))) continue;
    placed.add(norm(r.query));
    groups.push({
      topic: r.query,
      impressions: r.impressions,
      searches: [{ query: r.query, impressions: r.impressions, position: r.position }],
    });
  }
  return groups.sort((a, b) => b.impressions - a.impressions || a.topic.localeCompare(b.topic));
}

// ---------------------------------------------------------------- cannibalization

export const CHOICES = ['consolidate', 'differentiate', 'leave-alone'];
export const LEAVE_ALONE = 'leave-alone';
export const CHOICES_FILE = 'state/insight-choices.json';

// The founder's saved choices for split searches, by the search's id: {<id>: {choice, query, at}}.
export function readChoices() {
  const saved = readJson(CHOICES_FILE, null)?.cannibalization;
  return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
}

// The ids of the split searches the founder chose to leave alone.
export const leftAloneIds = () =>
  new Set(
    Object.entries(readChoices())
      .filter(([, v]) => v?.choice === LEAVE_ALONE)
      .map(([id]) => id)
  );

// The page that should win a split search: the registry's page for it when there is one, else the
// page showing most.
export const shouldWinOf = (registryPage, pages) => registryPage ?? pages[0]?.page ?? null;

// A recommendation, always a hypothesis and never a stated cause. It follows the founder's choice.
export function recommendationOf({ choice, shouldWin, others }) {
  const rest = others.length ? others.join(' and ') : 'the other page';
  if (choice === LEAVE_ALONE)
    return `Hypothesis: if ${rest} and ${shouldWin} answer different needs, the split may be harmless, so leaving both as they are may cost nothing.`;
  if (choice === 'consolidate')
    return `Hypothesis: folding ${rest} into ${shouldWin} and linking to it from there may stop the split, so one page holds the views for this search.`;
  if (choice === 'differentiate')
    return `Hypothesis: giving ${rest} a clearly different angle from ${shouldWin} may let each page rank for its own search instead of sharing this one.`;
  return `Hypothesis: if both pages answer the same need, folding ${rest} into ${shouldWin} may stop the split; if they answer different needs, changing their angles may let each rank for its own search.`;
}

export const cannibalizationTest = (query) =>
  `Wait 28 days after the change, then check in Search Console whether one page now holds most of the views for "${query}".`;

// Whether a split search is probably not a real problem: a pillar page and one of its own posts (they
// are meant to cover the same ground). pages are the page paths in the split; registry rows are
// {url, pillar}. A likely false alarm, never a certain one. (Searches for the site's own name never
// reach the split list, so they need no rule here.)
export function falseAlarmOf({ pages = [], registry = [] }) {
  const pillarOf = new Map(registry.filter((r) => r?.url).map((r) => [r.url, r.pillar ?? null]));
  for (const a of pages)
    for (const b of pages)
      if (a !== b && pillarOf.get(a) === b)
        return {
          likelyFalseAlarm: true,
          falseAlarmReason: `${b} is the pillar page and ${a} is one of its own posts, so they likely cover the same ground on purpose.`,
        };
  return { likelyFalseAlarm: false, falseAlarmReason: null };
}

// ---------------------------------------------------------------- decay: what kind of drop

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
  return { kind, label: DROP_LABEL[kind], why, recommendation: DROP_RECOMMENDATION[kind] };
}

// Whether a page lost views lately: the last 14 days (ending on `through`) are 30 percent or more
// below the 14 days before, with at least 50 views in each half. rows are {date, impressions} for one page.
const RECENT_DROP_PCT = 30;
const RECENT_MIN_VIEWS = 50;
// The hover line for the Recent drop chip, from the same numbers the rule uses.
export const RECENT_DROP_NOTE = `The last 14 days are ${RECENT_DROP_PCT}% or more below the 14 days before, with at least ${RECENT_MIN_VIEWS} views in each.`;
export function recentDropOf(rows, through) {
  const day = (iso, n) => {
    const d = new Date(`${iso}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  };
  if (!through) return false;
  const lastFrom = day(through, -13);
  const priorFrom = day(through, -27);
  let last = 0;
  let prior = 0;
  for (const r of rows ?? []) {
    if (r.date >= lastFrom && r.date <= through) last += Number(r.impressions) || 0;
    else if (r.date >= priorFrom && r.date < lastFrom) prior += Number(r.impressions) || 0;
  }
  if (last < RECENT_MIN_VIEWS || prior < RECENT_MIN_VIEWS) return false;
  const change = pct(last, prior);
  return change !== null && change <= -RECENT_DROP_PCT;
}
