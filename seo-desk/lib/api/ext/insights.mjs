// Routes for the insight pages: Cannibalization, Runner-up keywords, Content gaps, Decay and the
// keyword map table. Each list is built from what the model already holds (the ranked opportunities
// and their saved state, the split searches, the targets), so nothing is worked out twice. The
// counts at the bottom feed /api/nav.

import crypto from 'node:crypto';
import { get, post, bad, bodyOf, sendText } from '../kit.mjs';
import {
  buildModel,
  envelope,
  memo,
  itemState,
  itemOf,
  decorateOpp,
  repoRoot,
  deskToday,
  rangeOf,
  invalidate,
  pageHold,
  holdFields,
  leaveItFor,
} from '../model.mjs';
import { competingList, competingId, splitEdit, splitGroups, activeOpps } from '../work.mjs';
import { itemAction, editGuards, editRefused } from '../actions.mjs';
import { windowsFor, pagesTable, queriesTable, QUERY_WAIT_NOTE, queryPeriodsEven } from '../search.mjs';
import { n0, round1 } from '../fmt.mjs';
import { toCsv } from '../csv.mjs';
import { targetRows, discoveredList } from './targets.mjs';
import { readJson, writeJson } from '../../store.mjs';
import { transition, loadItems, saveItems, FREEZE_DAYS } from '../../lifecycle.mjs';
import { addDays } from '../../dates.mjs';
import { longDate, longRange, plain } from '../../text.mjs';
import { brief } from '../../brief.mjs';
import { loadPosts, linkSuggestions } from '../../links.mjs';
import {
  norm,
  matchKey,
  foldPage,
  loadTargets,
  saveTargets,
  MAX_SECONDARY,
  MIN_DISCOVERED_IMPRESSIONS,
} from '../../targets.mjs';
import { opportunityId, busyWeekPages, unservedSplit } from '../../rules.mjs';
import { groupTopics, tokens } from '../../topics.mjs';
import { isBrand } from '../../../../scripts/lib/gsc-diagnose-core.mjs';
import { COUNTS_MISSING_NOTE, countsMissingIn } from '../../query-counts.mjs';
import {
  TERMS,
  SECONDARY,
  OPEN_STATUSES,
  CHOICES,
  CHOICES_FILE,
  LEAVE_ALONE,
  readChoices,
  gapGroups,
  gapTitle,
  priorityBands,
  shouldWinOf,
  recommendationOf,
  cannibalizationTest,
  falseAlarmOf,
  dropKindOf,
  recentDropOf,
  RECENT_DROP_NOTE,
} from '../../insights.mjs';

const DECAY_DAYS = 28;
const DECAY_ROWS = 50;
const LINK_FROM_MAX = 5;
const GAP_PAGE = '/__content-gap__'; // a page that does not exist, so no live page is skipped as the target

const notFound = (message) => Object.assign(new Error(message), { status: 404 });
// Whether a page may be changed yet, from the one eligibility function (model.mjs holdFields: the
// freeze and a git edit; a routine change such as a link does not use the week's edit).
const freezeOf = (model, page) => holdFields(model, page);

// Whether editing every one of `pages` is allowed today, from the one eligibility function (the
// freeze, a git edit, and this week's page edit already made): the item is eligible only when all
// are, and otherwise it carries the latest date, the page that date belongs to and the function's own
// words for that page.
function eligibilityOfPages(model, pages) {
  let worst = null;
  for (const page of pages) {
    const e = pageHold(model, page);
    if (!e.eligible && (!worst || e.from > worst.e.from)) worst = { e, page };
  }
  if (!worst) {
    const first = pages.length ? pageHold(model, pages[0]) : null;
    return {
      eligible: true,
      from: null,
      page: null,
      text: 'Eligible now',
      ...(first?.touchedText ? { touchedText: first.touchedText } : {}),
    };
  }
  return {
    ...worst.e,
    page: worst.page,
    text: pages.length > 1 && !worst.e.weekEdit ? `${worst.page}: ${worst.e.text}` : worst.e.text,
  };
}

const heading = (type) => ({ term: TERMS[type].term, explain: TERMS[type].explain });

// A Search Console snapshot without the query-only pull has no real per-search counts, so every list
// that needs a minimum number of searches is empty. The envelope then says so in its warnings.
export const COUNTS_MISSING = COUNTS_MISSING_NOTE;
// An empty query-only list beside query and page rows is a pull that failed, not a site no one searched.
export const countsMissing = (model) => countsMissingIn(model.data.gsc);
function insightEnvelope(model, opts) {
  const env = envelope(model, opts);
  if (!countsMissing(model)) return env;
  return { ...env, warnings: [...(env.warnings ?? []), COUNTS_MISSING] };
}

// The recommendation without its "Hypothesis:" label, for a brief that already labels it.
const unlabelled = (text) => {
  const t = String(text ?? '')
    .replace(/^\s*Hypothesis:\s*/i, '')
    .trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : '';
};

// Each item's priority badge: the busiest third of the list (by `valueOf`) is high, the next third
// medium. Decided here once, so a page only draws it.
function withPriority(items, valueOf) {
  const bands = priorityBands(items.map((it) => Number(valueOf(it)) || 0));
  return items.map((it, i) => ({ ...it, priority: bands[i] }));
}
const PRIORITY_NOTE = 'Priority by how often it is shown, against the others in this list. The busiest third is high.';

// ---------------------------------------------------------------- topics a page already targets

// Every search in the 28 day rows placed in its topic (searches that share words), with the topics
// marked by the target keywords (registry and adopted). One build per model.
const topicOfSearch = (model) =>
  memo(model, 'insights:topics', () => {
    const targets = model.targets.map((t) => ({ keyword: t.keyword, page: t.page ? foldPage(t.page) : null }));
    const { topics } = groupTopics(model.data.gsc?.qpCur ?? [], { brands: model.brands, targets });
    const map = new Map();
    for (const t of topics) for (const q of t.queries) map.set(norm(q.query), t);
    return map;
  });

const targetKeywords = (model) =>
  memo(model, 'insights:target-keywords', () => new Set(model.targets.map((t) => norm(t.keyword))));

const CLUSTER_TEST = 'Judged by the 28-day before and after verdict if you add the section.';
const clusterRecommendation = (page) =>
  `Hypothesis: this may already be covered by ${page}, so it may be better added there as a section than written as a new page.`;

// The page Google showed most for each search (from the 28 day query and page rows), once per model.
const topPageOf = (model) =>
  memo(model, 'insights:top-page', () => {
    const best = new Map();
    for (const r of model.data.gsc?.qpCur ?? []) {
      const k = norm(r.query);
      const had = best.get(k);
      if (!had || (r.impressions || 0) > had.impressions)
        best.set(k, { page: foldPage(r.page), impressions: r.impressions || 0 });
    }
    return best;
  });

// {page, keyword, recommendation, test} when a search that is not a target (in any spelling, matchKey)
// is the same as, or a more specific variant of, the target keyword of a LIVE page: every meaningful
// word of that target appears in the search (topics.mjs tokens, which keep a one-digit number, so "8
// hour shift" never claims a 12 hour search). When several targets qualify, the one sharing the most
// words wins, then the page the search already ranks on. A broader search (fewer words than the
// target), a page that is not live and an unrelated search are never conflicts. Else null.
export function clusterConflictOf(model, query) {
  if (targetKeywords(model).has(norm(query))) return null;
  if (model.targets.some((t) => matchKey(t.keyword) && matchKey(t.keyword) === matchKey(query))) return null;
  const words = new Set(tokens(query));
  const live = liveSet(model);
  const ranksOn = topPageOf(model).get(norm(query))?.page ?? null;
  let best = null;
  for (const t of model.targets) {
    if (!t.page || !live.has(foldPage(t.page))) continue;
    const need = tokens(t.keyword);
    if (!need.length || !need.every((w) => words.has(w))) continue;
    const c = { page: foldPage(t.page), keyword: t.keyword, n: need.length };
    if (!best || c.n > best.n || (c.n === best.n && c.page === ranksOn && best.page !== ranksOn)) best = c;
  }
  return best
    ? { page: best.page, keyword: best.keyword, recommendation: clusterRecommendation(best.page), test: CLUSTER_TEST }
    : null;
}

// ---------------------------------------------------------------- open opportunities

// An opportunity the founder has not dealt with (the same set the week page counts).
export const isOpen = (model, opp) => OPEN_STATUSES.includes(itemState(model, opp.id).status);
// From the active opportunities (work.mjs activeOpps: a left alone split and a search another list owns
// are out), so every insight list, All opportunities and the sidebar hold the same cards.
const openOfType = (model, type) => activeOpps(model).filter((o) => o.type === type && isOpen(model, o));

// ---------------------------------------------------------------- one owner per search

// Every search has one owner, so the founder never gets two cards about one search. In order:
//   1. a real split (cannibalization) owns its search;
//   2. then the wrong page ranking;
//   3. for a page and a search: a runner-up when the search is that page's target (by matchKey),
//      otherwise the secondary keyword (secondary keywords never hold a target, and one search is a
//      secondary keyword of one page only), never both;
//   4. then a search a live page already shows for or targets, past page two (strengthen-page: that
//      page's job, never a new post), unless it is a cluster conflict (see 5);
//   5. then a content gap, when the rule found no live page at position 20 or better, unless the search
//      sits close to a live page's target (a cluster conflict: a section of that page, not a new post);
//   6. then a weakly answered question;
//   7. the cluster conflict list keeps only the searches nothing above holds.
// A runner-up whose page and search carry a finished or dismissed secondary keyword stays closed too.
// Returns {drop: Set of opportunity ids another list owns, owner: Map(search -> owning kind)}.
export function ownership(model) {
  return memo(model, 'insights:ownership', () => {
    const k = (q) => norm(q);
    const owner = new Map();
    const take = (q, kind) => {
      if (!owner.has(k(q))) owner.set(k(q), kind);
    };
    for (const c of competingList(model)) take(c.query, 'competing-pages');
    const drop = new Set();
    const ofType = (t) => model.opps.filter((o) => o.type === t && o.query);
    for (const o of ofType('wrong-page')) {
      if (owner.has(k(o.query))) drop.add(o.id);
      else take(o.query, 'wrong-page');
    }
    const secondary = secondaryCandidates(model);
    for (const c of secondary) take(c.query, 'secondary');
    const closedSecondary = (o) => {
      const st = itemState(model, secondaryId(foldPage(o.page), o.query)).status;
      return st === 'done' || st === 'ignored';
    };
    for (const o of ofType('near-page-one')) {
      const held = owner.get(k(o.query));
      if ((held && held !== 'near-page-one') || closedSecondary(o)) drop.add(o.id);
    }
    for (const o of ofType('near-page-one')) if (!drop.has(o.id)) take(o.query, 'near-page-one');
    // A search a live page already shows for or targets is that page's job (rules.mjs unservedSplit);
    // a secondary keyword or anything above that holds the same search keeps it, and so does the cluster
    // conflict list (a section of a live page's target), as for a content gap.
    for (const o of ofType('strengthen-page')) {
      if (owner.has(k(o.query)) || clusterConflictOf(model, o.query)) drop.add(o.id);
      else take(o.query, 'strengthen-page');
    }
    for (const o of ofType('unserved')) {
      if (owner.has(k(o.query)) || clusterConflictOf(model, o.query)) drop.add(o.id);
      else take(o.query, 'unserved');
    }
    for (const o of ofType('question')) {
      if (owner.has(k(o.query))) drop.add(o.id);
      else take(o.query, 'question');
    }
    return { drop, owner };
  });
}

// ---------------------------------------------------------------- cannibalization

// How many times each page was clicked for each search, from the query and page rows.
const clicksByQueryPage = (model) =>
  memo(model, 'insights:clicks', () => {
    const m = new Map();
    for (const r of model.data.gsc?.qpCur ?? []) {
      const key = `${norm(r.query)}|${foldPage(r.page)}`;
      m.set(key, (m.get(key) ?? 0) + (r.clicks || 0));
    }
    return m;
  });

// The weaker page of a split: the one showing the fewest times for the search (when equal, the one
// that is not the page that should win), with its views and clicks for that search.
function atRiskOf(model, c, shouldWin) {
  const clicks = clicksByQueryPage(model);
  const weaker = [...c.pages].sort(
    (a, b) => a.impressions - b.impressions || Number(b.page !== shouldWin) - Number(a.page !== shouldWin)
  )[0];
  return weaker
    ? {
        page: weaker.page,
        impressions: weaker.impressions,
        clicks: clicks.get(`${norm(c.query)}|${foldPage(weaker.page)}`) ?? 0,
      }
    : null;
}

// The split searches without the founder's choice (which is read fresh, so a choice shows at once).
function cannibalizationBase(model) {
  return memo(model, 'insights:cannibalization', () =>
    competingList(model).map((c) => {
      const opp = c.oppId ? model.oppById.get(c.oppId) : null;
      const shouldWin = shouldWinOf(c.registryPage, c.pages);
      return {
        id: competingId(c),
        opp,
        query: c.query,
        impressions: c.impressions,
        shouldWin,
        others: c.pages.map((p) => p.page).filter((p) => p !== shouldWin),
        pages: c.pages.map((p) => ({
          page: p.page,
          share: p.share,
          impressions: p.impressions,
          position: round1(p.position),
          ...freezeOf(model, p.page),
        })),
        atRisk: atRiskOf(model, c, shouldWin),
        ...falseAlarmOf({
          query: c.query,
          pages: c.pages.map((p) => ({ page: p.page, impressions: p.impressions })),
          registry: model.data.local?.registry ?? [],
        }),
        note: c.note,
      };
    })
  );
}

// Every open split search with the founder's choice, the ones left alone included.
function cannibalizationAll(model) {
  const choices = readChoices();
  return cannibalizationBase(model)
    .filter((c) => !c.opp || isOpen(model, c.opp))
    .map((base) => {
      const { others } = base;
      const c = { ...base };
      delete c.opp; // the opportunity itself is not part of the payload
      delete c.others;
      const choice = CHOICES.includes(choices[c.id]?.choice) ? choices[c.id].choice : null;
      // The pages a Done edits for this choice (the same list the Done guards check and freeze).
      const editPages = splitEdit(model, c.id)?.pages ?? [c.shouldWin].filter(Boolean);
      const recommendation = recommendationOf({ choice, shouldWin: c.shouldWin, others });
      const test = cannibalizationTest(c.query);
      const measured =
        `"${c.query}" showed our site ${n0(c.impressions)} ${c.impressions === 1 ? 'time' : 'times'} from ${model.range.text}, and its views were split across ${c.pages.length} of our pages with 10 or more views each. ${c.note ?? ''}`.trim();
      const elig = editPages.length
        ? eligibilityOfPages(model, editPages)
        : { eligible: true, from: null, page: null, text: 'Records no page edit' };
      return {
        ...c,
        choice,
        measured,
        recommendation,
        test,
        state: itemState(model, c.id),
        editPages,
        // Every page the chosen action edits must be free; a choice that edits no page is always eligible.
        eligibility: elig,
        brief: brief(
          {
            title: `"${c.query}" is split between our pages`,
            page: c.shouldWin,
            measured,
            action: unlabelled(recommendation),
            test,
            isPageEdit: editPages.length > 0,
          },
          { frozen: model.frozen, hold: editPages.length ? elig : null }
        ),
        ...heading('competing-pages'),
      };
    });
}

// The ones that still need a decision: a search the founder chose to leave alone is not one of them.
export const cannibalizationItems = (model) => cannibalizationAll(model).filter((c) => c.choice !== LEAVE_ALONE);

// Searches where our pages are shown together in the same results (our pages' views are 1.3 times the
// searches or more): not cannibalization, so no choice, no Done and no merge. Kept to be seen.
export const TOGETHER_NOTE =
  'Shown together, not competing: Google showed two or more of our pages in the same results for these searches, so the pages add views rather than split them. Nothing to merge.';
function togetherItems(model) {
  return splitGroups(model).together.map((c) => ({
    id: competingId(c),
    query: c.query,
    impressions: c.impressions,
    pageViews: c.pageViews,
    ratio: c.ratio,
    pages: c.pages.map((p) => ({ page: p.page, impressions: p.impressions, position: round1(p.position) })),
    note: `"${c.query}" showed our site ${n0(c.impressions)} times from ${model.range.text}, and our pages were shown ${n0(c.pageViews)} times between them, ${c.ratio} times the searches. So they ${c.ratio >= MOSTLY_TOGETHER_RATIO ? 'mostly' : 'often'} appeared together in the same results.`,
  }));
}

export function cannibalizationView(model) {
  const items = withPriority(cannibalizationItems(model), (it) => it.impressions);
  return {
    ...insightEnvelope(model, { need: ['gsc'] }),
    ...heading('competing-pages'),
    priorityNote: PRIORITY_NOTE,
    count: items.length,
    items,
    together: togetherItems(model),
    togetherNote: TOGETHER_NOTE,
    // Split searches the founder chose to leave alone, kept so the choice can be undone.
    leftAlone: cannibalizationAll(model).filter((c) => c.choice === LEAVE_ALONE),
    // Searches with no page yet that fall in a topic an existing page already targets.
    clusterConflicts: clusterConflictList(model),
  };
}

async function saveChoice(id, body) {
  const b = body;
  if (!('choice' in b) || (b.choice !== null && !CHOICES.includes(b.choice)))
    throw bad(`choice must be one of: ${CHOICES.join(', ')}, or null to clear it.`);
  const item = cannibalizationBase(buildModel()).find((c) => c.id === id);
  if (!item) throw notFound('That search is not in the list of pages competing for a search.');
  const all = readJson(CHOICES_FILE, null);
  const next = { ...(all && typeof all === 'object' && !Array.isArray(all) ? all : {}) };
  const mine = { ...readChoices() };
  if (b.choice === null) delete mine[id];
  else mine[id] = { choice: b.choice, query: item.query, at: new Date().toISOString() };
  next.cannibalization = mine;
  writeJson(CHOICES_FILE, next);
  invalidate(); // the weekly proposal and the sidebar count read the choice
  return { ok: true, id, choice: b.choice };
}

// ---------------------------------------------------------------- runner-up keywords

export const runnerUpItems = (model) =>
  memo(model, 'insights:runner-up', () => openOfType(model, 'near-page-one').map((o) => decorateOpp(model, o)));

export function runnerUpView(model) {
  const items = runnerUpItems(model);
  return { ...insightEnvelope(model, { need: ['gsc'] }), ...heading('near-page-one'), count: items.length, items };
}

// ---------------------------------------------------------------- content gaps

// The rows the topic grouping reads, from "unserved" opportunities.
const gapRows = (opps) =>
  opps.map((o) => {
    const e = o.evidence?.[0] ?? {};
    return {
      query: o.query,
      page: e.pages?.[0]?.page ?? null,
      impressions: Number(e.impressions) || 0,
      position: Number(e.bestPosition) || 0,
    };
  });

// A set of searches with no page written for them, as one item: a working title from the lead
// search, how many times they show, and the live pages that already say the lead search in plain
// text and could link to a page written for it.
// The searches the rules call unserved that are really a section of a page a topic already points at
// (a cluster conflict) are left out: they are secondary keywords or sections, not new pages.
// The content gaps are the active unserved opportunities: ownership() already left out a search another
// list owns and a cluster conflict, so Content gaps and All opportunities hold the same searches.
const unservedOpps = (model) => activeOpps(model).filter((o) => o.type === 'unserved');

export function gapItems(model) {
  return memo(model, 'insights:gaps', () => {
    const open = unservedOpps(model).filter((o) => isOpen(model, o));
    if (!open.length) return [];
    const byQuery = new Map(open.map((o) => [norm(o.query), o]));
    const rows = gapRows(open);
    const groups = gapGroups(rows);
    const live = liveSet(model);
    const posts = loadPosts(repoRoot()).filter((p) => !live.size || live.has(foldPage(p.page)));
    const views = new Map();
    for (const r of model.data.gsc?.qp90 ?? model.data.gsc?.qpCur ?? [])
      views.set(r.page, (views.get(r.page) ?? 0) + (r.impressions || 0));
    const bands = priorityBands(groups.map((g) => g.impressions));
    return groups.map((g, i) => {
      const lead = g.searches[0];
      const leadOpp = byQuery.get(norm(lead.query));
      const title = gapTitle(lead.query);
      const why = `You already appear ${n0(g.impressions)} times for these searches with no page written for them.`;
      const recommendation = `Hypothesis: a post written for "${lead.query}" may let the site show higher for these searches. Consider adding it to the plan; the plan decides which posts are written.`;
      const test =
        'Check in Search Console about four weeks after it goes live whether the new page shows for these searches.';
      return {
        id: leadOpp.id,
        title,
        topic: g.topic,
        searches: g.searches,
        impressions: g.impressions,
        why,
        linkFrom: gapLinkFrom(model, g, { posts, views, live }),
        priority: bands[i],
        recommendation,
        test,
        brief: brief(
          {
            title: `Consider adding this to the plan: ${title}`,
            measured: `${why} The searches: ${g.searches.map((x) => `"${x.query}"`).join(', ')}.`,
            action: unlabelled(recommendation),
            test,
            slot: 'new-post',
          },
          { frozen: model.frozen }
        ),
        state: itemState(model, leadOpp.id),
        oppIds: g.searches.map((x) => byQuery.get(norm(x.query))?.id).filter(Boolean),
        ...heading('unserved'),
      };
    });
  });
}

const LINK_FROM_TEXT = {
  mentions: 'Already says these words in plain text.',
  shown: 'Google already shows this page for these searches.',
  topic: 'Covers the same topic.',
};

// The live pages a new page for a gap should get a link from on day one, best first: pages whose text
// already says the lead search, then the pages Google already shows for the gap's searches (from the
// stored search and page rows, busiest first), then the pages on the same topic (the ones that target
// a keyword in it, then the ones shown for it). Each keeps its freeze, and frozen pages go last.
function gapLinkFrom(model, g, { posts, views, live }) {
  const out = new Map();
  const add = (page, reason) => {
    const p = foldPage(page);
    if (!p || p === GAP_PAGE || out.has(p) || (live.size && !live.has(p))) return;
    out.set(p, { page: p, ...freezeOf(model, p), reason, reasonText: LINK_FROM_TEXT[reason] });
  };
  const lead = g.searches[0];
  for (const x of linkSuggestions({ targetPage: GAP_PAGE, keyword: lead.query, posts, max: 1000, impressions: views }))
    add(x.from, 'mentions');
  const wanted = new Set(g.searches.map((x) => norm(x.query)));
  const shown = new Map();
  for (const r of model.data.gsc?.qp90 ?? model.data.gsc?.qpCur ?? []) {
    if (!wanted.has(norm(r.query)) || !r.page) continue;
    const p = foldPage(r.page);
    shown.set(p, (shown.get(p) ?? 0) + (r.impressions || 0));
  }
  for (const [p] of [...shown].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) add(p, 'shown');
  const topic = topicOfSearch(model).get(norm(lead.query));
  for (const t of topic?.targets ?? []) if (t.page) add(t.page, 'topic');
  for (const p of topic?.pages ?? []) add(p.page, 'topic');
  // A page edited this week or inside its 28 days is the last one to ask for a link.
  return [...out.values()]
    .sort((a, b) => Number(Boolean(a.frozenUntil)) - Number(Boolean(b.frozenUntil)))
    .slice(0, LINK_FROM_MAX);
}

// Every opportunity id in the gap that holds `id` (the lead's id, or any search's), whatever each one's
// state, so Reopen finds a gap that was marked done. Null when no gap holds it.
function gapOppIds(model, id) {
  const all = unservedOpps(model);
  if (!all.some((o) => o.id === id)) return null;
  const byQuery = new Map(all.map((o) => [norm(o.query), o.id]));
  for (const g of gapGroups(gapRows(all))) {
    const ids = g.searches.map((s) => byQuery.get(norm(s.query))).filter(Boolean);
    if (ids.includes(id)) return ids;
  }
  return null;
}

const GAP_ACTIONS = ['done', 'ignore', 'reopen', 'snooze'];

// Marks a whole gap, not just its lead search: the same transition goes to every search in it through
// the existing item action (same guards, same override rule). Done, Ignore and Snooze go to the searches
// still open; Reopen goes to the ones that are not. Every search is checked first, so a refusal changes
// nothing.
function gapAction(id, body) {
  const action = body.action;
  if (!GAP_ACTIONS.includes(action)) throw bad(`action must be one of: ${GAP_ACTIONS.join(', ')}.`);
  const model = buildModel();
  const ids = gapOppIds(model, id);
  if (!ids) throw notFound('That content gap is not in the desk data. Refresh the page.');
  const isOpenId = (i) => OPEN_STATUSES.includes(itemState(model, i).status);
  const targets = ids.filter((i) => (action === 'reopen' ? !isOpenId(i) : isOpenId(i)));
  if (action === 'snooze' && body.until !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(String(body.until)))
    throw bad('Snooze needs a date such as 2026-12-01.');
  for (const i of targets) {
    try {
      transition(itemOf(model, i), action, {
        today: model.today,
        until: body.until,
        reason: body.reason,
        isPageEdit: false,
      });
    } catch (e) {
      throw Object.assign(
        new Error(
          e.message === 'conflict'
            ? 'One of these searches is finished or ignored, so that action is not allowed. Press Reopen first.'
            : e.message
        ),
        { status: e.message === 'conflict' ? 409 : 400 }
      );
    }
  }
  const applied = [];
  for (const i of targets) {
    itemAction(i, { action, until: body.until, reason: body.reason, override: body.override });
    applied.push(i);
  }
  return { ok: true, id, action, applied, skipped: ids.length - applied.length };
}

// The searches the gap rule left out because an unwritten post in the plan already covers them
// (rules.mjs unservedSplit), once per model.
const plannedSearches = (model) =>
  memo(
    model,
    'insights:planned',
    () => unservedSplit({ gsc: model.data.gsc, local: model.data.local }, model.cfg).planned
  );

export function gapsView(model) {
  const items = gapItems(model);
  const covered = plannedSearches(model).length;
  return {
    ...insightEnvelope(model, { need: ['gsc'] }),
    ...heading('unserved'),
    count: items.length,
    items,
    // How many searches would have been gaps but a planned post already covers them.
    covered,
    coveredNote: covered
      ? `${covered === 1 ? '1 search is' : `${n0(covered)} searches are`} already covered by ${covered === 1 ? 'a planned post' : 'planned posts'}.`
      : null,
  };
}

// ---------------------------------------------------------------- decay

const byKey = (rows, key) => new Map(rows.map((r) => [norm(r[key]), r]));

// Page and search rows with the change in views over the last 28 days against the 28 before. The
// change is the model's own gated number (null under the minimum base), so a drop from a handful of
// views never shows. Growing and decaying are the model's own movement words.
function decayRows(model) {
  const { prev } = windowsFor(model, DECAY_DAYS);
  const pageDaily = model.data.gsc?.pageDaily ?? [];
  const before = new Map();
  for (const r of pageDaily) {
    if (r.date >= prev.start && r.date <= prev.end)
      before.set(r.page, (before.get(r.page) ?? 0) + (r.impressions || 0));
  }
  const pages = pagesTable(model, DECAY_DAYS).rows.map((r) => ({
    page: r.page,
    impressions: r.impressions,
    prevImpressions: before.get(r.page) ?? 0,
    position: r.position,
    change: r.change,
    movement: r.movement,
  }));
  const priorQueries = byKey(model.data.gsc?.queryPrev ?? [], 'query');
  const queries = queriesTable(model, DECAY_DAYS)
    .rows.filter((r) => !r.brand)
    .map((r) => ({
      query: r.query,
      impressions: r.impressions,
      prevImpressions: priorQueries.get(norm(r.query))?.impressions ?? 0,
      position: r.position,
      change: r.change,
      movement: r.movement,
    }));
  return { pages, queries };
}

const split = (rows) => {
  const gap = (r) => r.impressions - r.prevImpressions;
  const decaying = rows
    .filter((r) => r.change !== null && (r.movement === 'slipping' || r.movement === 'gone'))
    .sort((a, b) => gap(a) - gap(b) || String(a.page ?? a.query).localeCompare(String(b.page ?? b.query)));
  const growing = rows
    .filter((r) => r.change !== null && r.movement === 'growing')
    .sort((a, b) => gap(b) - gap(a) || String(a.page ?? a.query).localeCompare(String(b.page ?? b.query)));
  return {
    growing: growing.slice(0, DECAY_ROWS),
    decaying: decaying.slice(0, DECAY_ROWS),
    totals: { growing: growing.length, decaying: decaying.length },
  };
};

// For each page: its own numbers in the last 28 days against the 28 before, and whether the last 14
// days fell away. Built from the daily page rows, once per model.
function pageFigures(model) {
  return memo(model, 'insights:figures', () => {
    const rows = model.data.gsc?.pageDaily ?? [];
    const { cur, prev } = windowsFor(model, DECAY_DAYS);
    const sum = (start, end) => {
      const m = new Map();
      for (const r of rows) {
        if (r.date < start || r.date > end) continue;
        const a = m.get(r.page) ?? { clicks: 0, impressions: 0, posW: 0 };
        a.clicks += r.clicks || 0;
        a.impressions += r.impressions || 0;
        a.posW += (r.position || 0) * (r.impressions || 0);
        m.set(r.page, a);
      }
      return m;
    };
    const asNumbers = (a) => ({
      clicks: a?.clicks ?? 0,
      impressions: a?.impressions ?? 0,
      position: a?.impressions ? a.posW / a.impressions : null,
    });
    const before = sum(prev.start, prev.end);
    const after = sum(cur.start, cur.end);
    const lately = new Map();
    for (const r of rows) {
      if (r.date < cur.start || r.date > cur.end) continue;
      if (!lately.has(r.page)) lately.set(r.page, []);
      lately.get(r.page).push(r);
    }
    return { before, after, lately, through: cur.end, asNumbers };
  });
}

// What a decaying page's own numbers say: the kind of drop (a labelled hypothesis, with a
// recommendation that does not state a cause as certain) and whether it lost views lately.
function dropInfo(model, page) {
  const f = pageFigures(model);
  const d = dropKindOf(f.asNumbers(f.before.get(page)), f.asNumbers(f.after.get(page)));
  return {
    dropKind: d.kind,
    dropKindLabel: d.label,
    dropKindWhy: d.why,
    recommendation: d.recommendation,
    recentDrop: recentDropOf(f.lately.get(page) ?? [], f.through),
  };
}

// The open decay cards: each carries the kind of drop the rule read (rules.mjs detectSlipping, from
// lib/decay.mjs), so its action, test and brief are the kind-of-drop recommendation everywhere: All
// opportunities, the brief, this page, the week's worry and the Ask digest.
export const decayItems = (model) =>
  memo(model, 'insights:decay', () =>
    openOfType(model, 'slipping').map((o) => {
      const d = decorateOpp(model, o);
      const own = dropInfo(model, o.page);
      const drop = o.dropKind
        ? {
            dropKind: o.dropKind,
            dropKindLabel: o.dropKindLabel,
            dropKindWhy: o.dropKindWhy,
            recommendation: o.recommendation,
            recentDrop: own.recentDrop,
          }
        : own;
      // A lost demand card advises leaving the page alone, so it offers Leave it (model.mjs leaveItFor).
      return { ...d, ...drop, leaveIt: leaveItFor(model, o, drop.dropKind).leaveIt ?? null };
    })
  );

// The decaying pages carry the kind of drop; the growing ones have none.
const withDrop = (model, { growing, decaying, totals }) => ({
  growing,
  decaying: decaying.map((r) => ({ ...r, ...dropInfo(model, r.page) })),
  totals,
});

// Google's ranking updates that touch start..end, as a caution (never the cause).
const rankingUpdatesIn = (model, start, end) =>
  (model.data.local?.googleUpdates ?? [])
    .filter((u) => u?.kind === 'ranking' && u.start && u.start <= end && (u.end ?? model.today) >= start)
    .sort((a, b) => a.start.localeCompare(b.start));

export const BUSY_WEEK_NOTE =
  'These pages passed the decay rule only because one week of the earlier period was unusually busy. With that week counted as the middle of the other three, the drop is not big enough, so they are not decaying, not worries and not cards. The Growing list is not checked this way.';

// The pages whose drop came from one busy week (rules.mjs busyWeekPages), with the week's dates and
// both numbers in one sentence, and a Google ranking update inside that week named as a caution.
function busyWeekItems(model) {
  let list = [];
  try {
    list = busyWeekPages({ gsc: model.data.gsc, local: model.data.local }, model.cfg);
  } catch {
    list = [];
  }
  return list.map((b) => {
    const updates = rankingUpdatesIn(model, b.week.start, b.week.end);
    const names = updates.map((u) => `${plain(u.title)} (from ${longDate(u.start)})`);
    return {
      page: b.page,
      prev: b.prev,
      adjusted: b.adjusted,
      cur: b.cur,
      week: { ...b.week, text: longRange(b.week.start, b.week.end) },
      prevWeeks: b.prevWeeks,
      curWeeks: b.curWeeks,
      text: `${b.page} showed up ${n0(b.prev)} times from ${longRange(b.range.prev.start, b.range.prev.end)}, and ${n0(b.week.views)} of the ${n0(b.prev)} times came in one week, ${longRange(b.week.start, b.week.end)}. Counting that week as ${n0(b.median)}, the middle of the other three weeks, the earlier period is ${n0(b.adjusted)}, against ${n0(b.cur)} times from ${longRange(b.range.cur.start, b.range.cur.end)}.`,
      caution: names.length
        ? `Google's ${names.join(' and ')} fell inside that busy week, so read it with care. That does not show the update caused it.`
        : null,
    };
  });
}

export function decayView(model) {
  const { pages, queries } = decayRows(model);
  // Priority by how often the page was shown before the drop.
  const items = withPriority(decayItems(model), (o) => o.evidence?.[0]?.prev?.impressions);
  const p = withDrop(model, split(pages));
  const q = split(queries);
  const shownText = (n, total, what) => (total > n ? `Showing the first ${n} of ${n0(total)} ${what}.` : null);
  return {
    ...envelope(model, { need: ['gsc'], range: rangeOf(windowsFor(model, DECAY_DAYS).cur) }),
    ...heading('slipping'),
    priorityNote: 'Priority by how often the page was shown before the drop, against the others in this list.',
    count: items.length,
    items,
    pages: { growing: p.growing, decaying: p.decaying },
    queries: { growing: q.growing, decaying: q.decaying },
    // The true number of rows behind each list (the lists stop at 50), with the line to show under it.
    totals: { pages: p.totals, queries: q.totals },
    shownMax: DECAY_ROWS,
    shownText: {
      pages: {
        growing: shownText(DECAY_ROWS, p.totals.growing, 'growing pages'),
        decaying: shownText(DECAY_ROWS, p.totals.decaying, 'decaying pages'),
      },
      queries: {
        growing: shownText(DECAY_ROWS, q.totals.growing, 'growing searches'),
        decaying: shownText(DECAY_ROWS, q.totals.decaying, 'decaying searches'),
      },
    },
    recentDropNote: RECENT_DROP_NOTE,
    // Pages whose drop came from one busy week: folded on the page, never decaying, never a worry.
    busyWeek: busyWeekItems(model),
    busyWeekNote: BUSY_WEEK_NOTE,
    note: 'Change is the last 28 days against the 28 days before. It is left out when the earlier period had too few views to compare.',
    // The searches lists stay empty on a snapshot whose stored search totals are a day short.
    queriesNote: queryPeriodsEven(model.data.gsc) ? null : QUERY_WAIT_NOTE,
  };
}

// ---------------------------------------------------------------- the keyword map table

const FLAGS = ['runner-up', 'cannibalized', 'wrong-page'];
const liveSet = (model) => new Set((model.data.local?.livePages ?? []).map((p) => foldPage(p.page)));

export function keywordTable(model) {
  return memo(model, 'insights:keyword-table', () => {
    const queriesOf = (type) => new Set(openOfType(model, type).map((o) => norm(o.query)));
    const near = queriesOf('near-page-one');
    const split_ = queriesOf('competing-pages');
    const wrong = queriesOf('wrong-page');
    const live = liveSet(model);
    const adopted = new Map(model.targetState.adopted.map((a) => [norm(a.keyword), a]));
    const flagsOf = (keyword, extra = []) => {
      const k = norm(keyword);
      const set = new Set([
        ...(near.has(k) ? ['runner-up'] : []),
        ...(split_.has(k) ? ['cannibalized'] : []),
        ...extra,
      ]);
      if (wrong.has(k)) set.add('wrong-page');
      return FLAGS.filter((f) => set.has(f));
    };
    // Where a keyword came from: the page registry file, an import, and Search Console (it returned
    // the search, or the keyword was adopted from the searches it returned).
    const sourcesOf = (r, seen) => {
      const a = adopted.get(norm(r.keyword));
      return [
        ...(r.origin === 'registry' ? ['file'] : []),
        ...(a?.source === 'import' ? ['import'] : []),
        ...(seen ? ['search-console'] : []),
      ];
    };
    // Without the per-search counts a times-shown figure would be page rows added up (a search counted
    // once per page shown), so the column is left empty and no search is discovered (that needs a minimum).
    const missing = countsMissing(model);
    const targeted = targetRows(model).rows.map((r) => ({
      keyword: r.keyword,
      kind: 'targeted',
      status: r.page && live.has(foldPage(r.page)) ? 'live' : 'pending',
      mappedTo: r.page ?? null,
      origin: r.origin,
      source: sourcesOf(r, r.position !== null),
      volume: adopted.get(norm(r.keyword))?.volume ?? null,
      position: r.position,
      impressions: missing ? null : r.impressions,
      rankingPage: r.rankingPage,
      flags: flagsOf(r.keyword, r.label === 'ranks elsewhere' ? ['wrong-page'] : []),
      clusterConflict: null,
    }));
    const { owner } = ownership(model);
    const found = (missing ? [] : discoveredList(model)).map((d) => ({
      keyword: d.query,
      kind: 'discovered',
      // A live page already on page one for it: no page targets it, but one ranks (audit W4).
      status:
        d.rankingPage && live.has(foldPage(d.rankingPage)) && Number.isFinite(d.position) && d.position <= 10
          ? 'ranks'
          : 'pending',
      mappedTo: null,
      origin: 'discovered',
      source: ['search-console'],
      volume: null,
      position: round1(d.position),
      impressions: d.impressions,
      rankingPage: d.rankingPage ? foldPage(d.rankingPage) : null,
      flags: flagsOf(d.query),
      // Another list owns the search (one owner per search): it is not a cluster conflict as well.
      clusterConflict: owner.has(norm(d.query)) ? null : clusterConflictOf(model, d.query),
    }));
    const rows = [...targeted, ...found];
    const has = (f) => rows.filter((r) => r.flags.includes(f)).length;
    return {
      counters: {
        all: rows.length,
        mapped: targeted.length,
        unmapped: found.length,
        live: rows.filter((r) => r.status === 'live').length,
        ranks: rows.filter((r) => r.status === 'ranks').length,
        pending: rows.filter((r) => r.status === 'pending').length,
        opportunities: rows.filter((r) => r.flags.length).length,
        runnerUp: has('runner-up'),
        cannibalized: has('cannibalized'),
        clusterConflicts: rows.filter((r) => r.clusterConflict).length,
      },
      rows,
    };
  });
}

// The "planned keyword may already be covered" list: unmapped searches that fall in a topic an
// existing page already targets, each with the plain recommendation.
function clusterConflictList(model) {
  const list = keywordTable(model)
    .rows.filter((r) => r.clusterConflict)
    .map((r) => ({
      keyword: r.keyword,
      page: r.clusterConflict.page,
      targetKeyword: r.clusterConflict.keyword,
      impressions: r.impressions,
      position: r.position,
      recommendation: r.clusterConflict.recommendation,
      test: r.clusterConflict.test,
    }));
  return withPriority(list, (c) => c.impressions);
}

function keywordTableView(model) {
  return {
    ...insightEnvelope(model, { need: ['gsc', 'local'] }),
    // The order of the rows and the minimum behind a discovered one, from the rule itself.
    minImpressions: MIN_DISCOVERED_IMPRESSIONS,
    orderNote: `Targeted keywords first, then searches you already show for (${MIN_DISCOVERED_IMPRESSIONS} or more times shown).`,
    ...keywordTable(model),
  };
}

function keywordCsv(model) {
  return toCsv(
    [
      ['keyword', (r) => r.keyword],
      ['status', (r) => r.status],
      ['mapped_to_page', (r) => r.mappedTo],
      ['origin', (r) => r.origin],
      ['position', (r) => r.position],
      ['impressions', (r) => r.impressions],
      ['ranking_page', (r) => r.rankingPage],
      ['flags', (r) => r.flags.join('; ')],
      ['kind', (r) => r.kind],
      ['source', (r) => r.source.join('; ')],
      ['monthly_searches', (r) => r.volume],
      ['may_be_covered_by', (r) => r.clusterConflict?.page ?? null],
    ],
    keywordTable(model).rows
  );
}

// ---------------------------------------------------------------- secondary keywords

const SECONDARY_MIN_VIEWS = 30;
const SECONDARY_PER_PAGE = 3;

const secondaryId = (page, query) =>
  `sec-${crypto
    .createHash('sha1')
    .update(`${page}|${norm(query)}`)
    .digest('hex')
    .slice(0, 12)}`;

// The meaningful words two phrases share (topics.mjs tokens: stop words dropped, plurals trimmed, digits kept).
const sharedWords = (a, b) => {
  const words = new Set(tokens(a));
  return tokens(b).filter((w) => words.has(w)).length;
};
const SECONDARY_MIN_SHARED = 2;
// Our pages' views at this many times the searches or more read "mostly" shown together; from the
// together line (1.3) up to here they read "often".
const MOSTLY_TOGETHER_RATIO = 1.6;
// A phrase's meaningful words as one key, in any order: "scheduling for nurses" and "nurse scheduling"
// are one key. Empty for a phrase with no meaningful word.
const wordSetKey = (s) => [...tokens(s)].sort().join(' ');

// Searches a live page that targets a keyword already shows for, that nothing targets: 30 or more views
// on that page in the 28 days (the page's own views, from the query and page rows), not a brand search,
// not any target in another spelling (matchKey) or with its words joined or ordered differently (the
// same meaningful words, tokens), and about the page: it shares two or more meaningful
// words with one of the page's target keywords (the one sharing the most is named). A search a real
// split or a wrong page ranking owns is left out (ownership), and one search is offered to one page
// only, the best placed. At most three a page, busiest first. Each is a candidate whatever the founder
// has done with it; the list the page shows keeps only the open ones.
function secondaryCandidates(model) {
  return memo(model, 'insights:secondary', () => {
    const live = liveSet(model);
    const taken = targetKeywords(model);
    const takenKeys = new Set(model.targets.map((t) => matchKey(t.keyword)).filter(Boolean));
    const takenWords = new Set(model.targets.map((t) => wordSetKey(t.keyword)).filter(Boolean));
    const owned = new Set([
      ...competingList(model).map((c) => norm(c.query)),
      ...model.opps.filter((o) => o.type === 'wrong-page' && o.query).map((o) => norm(o.query)),
    ]);
    const targetsOf = new Map();
    for (const t of model.targets) {
      if (!t.page) continue;
      const page = foldPage(t.page);
      if (!targetsOf.has(page)) targetsOf.set(page, []);
      targetsOf.get(page).push(t.keyword);
    }
    const rows = new Map(); // page|query -> one search on one page, views added, place weighted by views
    for (const r of model.data.gsc?.qpCur ?? []) {
      const page = foldPage(r.page);
      if (!live.has(page) || !targetsOf.has(page)) continue;
      const key = `${page}\u0000${norm(r.query)}`;
      const e = rows.get(key) ?? { page, query: String(r.query).trim(), impressions: 0, posW: 0 };
      e.impressions += r.impressions || 0;
      e.posW += (r.position || 0) * (r.impressions || 0);
      rows.set(key, e);
    }
    const best = new Map(); // search -> the best placed page's candidate
    for (const e of rows.values()) {
      const q = norm(e.query);
      if (e.impressions < SECONDARY_MIN_VIEWS || taken.has(q) || takenKeys.has(matchKey(e.query))) continue;
      if (takenWords.has(wordSetKey(e.query))) continue;
      if (owned.has(q) || isBrand(e.query, model.brands)) continue;
      const scored = targetsOf
        .get(e.page)
        .map((k) => ({ k, n: sharedWords(e.query, k) }))
        .filter((x) => x.n >= SECONDARY_MIN_SHARED)
        .sort((a, b) => b.n - a.n);
      if (!scored.length) continue;
      const c = { ...e, position: e.impressions ? round1(e.posW / e.impressions) : null, target: scored[0].k };
      const had = best.get(q);
      if (!had || c.position < had.position || (c.position === had.position && c.impressions > had.impressions))
        best.set(q, c);
    }
    const byPage = new Map();
    for (const c of best.values()) {
      if (!byPage.has(c.page)) byPage.set(c.page, []);
      byPage.get(c.page).push(c);
    }
    const out = [];
    for (const list of byPage.values()) {
      list.sort((a, b) => b.impressions - a.impressions || a.query.localeCompare(b.query));
      out.push(...list.slice(0, SECONDARY_PER_PAGE));
    }
    return out.sort(
      (a, b) => b.impressions - a.impressions || a.page.localeCompare(b.page) || a.query.localeCompare(b.query)
    );
  });
}

// The state of a secondary keyword: its own, or, while its own is still open, a finished or dismissed
// runner-up for the same page and search (the same job, marked from the other list).
function secondaryState(model, id, c) {
  const own = itemState(model, id);
  if (!OPEN_STATUSES.includes(own.status)) return own;
  const runner = itemState(model, opportunityId('near-page-one', c.page, c.query));
  return runner.status === 'done' || runner.status === 'ignored' ? runner : own;
}

function secondaryAll(model) {
  const adopted = new Set(model.targetState.secondary.map((x) => `${x.page}\u0000${norm(x.keyword)}`));
  return secondaryCandidates(model).map((c) => {
    const id = secondaryId(c.page, c.query);
    const f = freezeOf(model, c.page);
    const elig = eligibilityOfPages(model, [c.page]);
    const evidence = `${c.page} is already shown ${n0(c.impressions)} times for "${c.query}" at an average place of ${c.position}, but the page does not target it.`;
    const recommendation = `Hypothesis: working "${c.query}" into a heading and the opening of ${c.page} may help the page answer it, and may help it show for that search more often.`;
    const test = `Wait 28 days after the change, then check in Search Console whether ${c.page} is shown more often for "${c.query}" and at a better place.`;
    return {
      id,
      page: c.page,
      query: c.query,
      impressions: c.impressions,
      position: c.position,
      targetKeyword: c.target,
      evidence,
      recommendation,
      test,
      brief: brief(
        {
          title: `Work "${c.query}" into ${c.page}`,
          page: c.page,
          measured: evidence,
          action: unlabelled(recommendation),
          test,
          isPageEdit: true,
        },
        { frozen: model.frozen, hold: elig }
      ),
      state: secondaryState(model, id, c),
      eligibility: elig,
      frozenUntil: f.frozenUntil,
      frozenUntilText: f.frozenUntilText,
      holdText: f.holdText,
      adopted: adopted.has(`${c.page}\u0000${norm(c.query)}`),
      ...SECONDARY,
    };
  });
}

export const secondaryKeywordItems = (model) =>
  memo(model, 'insights:secondary-open', () =>
    secondaryAll(model).filter((i) => OPEN_STATUSES.includes(i.state.status))
  );

const FINISHED_MAX = 50;
const finishedAt = (i) => String(i.state.doneAt ?? i.state.since ?? '');

export function secondaryView(model) {
  const items = withPriority(secondaryKeywordItems(model), (it) => it.impressions);
  // Marked done or dismissed, newest first, so a mistaken Done (which froze the page and spent the
  // week's edit) can be found and reopened.
  const finished = secondaryAll(model)
    .filter((i) => i.state.status === 'done' || i.state.status === 'ignored')
    .sort((a, b) => finishedAt(b).localeCompare(finishedAt(a)) || a.id.localeCompare(b.id))
    .slice(0, FINISHED_MAX);
  return {
    ...insightEnvelope(model, { need: ['gsc'] }),
    ...SECONDARY,
    priorityNote: PRIORITY_NOTE,
    count: items.length,
    items,
    finished,
  };
}

const SECONDARY_ACTIONS = ['adopt', 'done', 'dismiss', 'reopen'];

function secondaryAction(id, body) {
  const action = body.action;
  if (!SECONDARY_ACTIONS.includes(action)) throw bad(`action must be one of: ${SECONDARY_ACTIONS.join(', ')}.`);
  const model = buildModel();
  const item = secondaryAll(model).find((i) => i.id === id);
  if (!item) throw notFound('That secondary keyword is not in the list. Refresh the page.');

  if (action === 'adopt') {
    const state = loadTargets();
    const key = (x) => `${x.page}\u0000${norm(x.keyword)}`;
    if (!state.secondary.some((x) => key(x) === key({ page: item.page, keyword: item.query }))) {
      if (state.secondary.length >= MAX_SECONDARY)
        throw bad(
          `The desk keeps at most ${MAX_SECONDARY.toLocaleString('en-US')} secondary keywords. Remove some first on the Keywords page, under Secondary keywords, then adopt this one again.`
        );
      state.secondary.push({ keyword: norm(item.query), page: item.page, addedOn: model.today });
      saveTargets(state);
      invalidate();
    }
    return { ok: true, id, action, adopted: true, item: itemState(buildModel(), id) };
  }

  const cur = itemOf(model, id);
  let next;
  try {
    next =
      action === 'done'
        ? transition(cur, 'done', { today: model.today, page: item.page, isPageEdit: true })
        : action === 'dismiss'
          ? transition(cur, 'ignore', { today: model.today, reason: 'Dismissed from secondary keywords.' })
          : transition(cur, 'reopen', { today: model.today });
  } catch (e) {
    throw Object.assign(
      new Error(
        e.message === 'conflict'
          ? 'That item is finished or dismissed, so that action is not allowed. Press Reopen first.'
          : e.message
      ),
      { status: e.message === 'conflict' ? 409 : 400 }
    );
  }
  // The same two guards, with the same reply, as marking any page edit done (a frozen page, or this
  // week's one page edit already made), so the page asks the same question for both. A finished or
  // dismissed item is refused above with its own plain reason, before these.
  if (action === 'done' && cur?.status !== 'done' && body.override !== true) {
    const g = editGuards(model, item.page);
    if (g) throw editRefused(g, 'Marking this done');
  }
  next = {
    ...next,
    meta: {
      kind: 'secondary-keyword',
      page: item.page,
      query: item.query,
      title: `Secondary keyword "${item.query}" on ${item.page}`,
      isPageEdit: true,
    },
  };
  saveItems({ ...loadItems(), [id]: next });
  invalidate();
  const out = { ok: true, id, action, adopted: item.adopted, item: itemState(buildModel(), id) };
  if (action === 'done' && next.status === 'done')
    out.freeze = {
      page: item.page,
      until: addDays(next.doneAt, FREEZE_DAYS),
      untilText: longDate(addDays(next.doneAt, FREEZE_DAYS)),
    };
  return out;
}

// ---------------------------------------------------------------- counts for /api/nav

// How many pages the internal links insight lists: the pages with an open "needs links" opportunity.
export const internalLinkPages = (model) => new Set(openOfType(model, 'needs-links').map((o) => o.page)).size;

// ---------------------------------------------------------------- the routes

export const routes = [
  get('/api/insights/cannibalization', () => cannibalizationView(buildModel())),
  post('/api/insights/cannibalization/:id/choice', async (ctx) => saveChoice(ctx.params.id, await bodyOf(ctx))),
  get('/api/insights/runner-up', () => runnerUpView(buildModel())),
  get('/api/insights/content-gaps', () => gapsView(buildModel())),
  post('/api/insights/content-gaps/:id', async (ctx) => gapAction(ctx.params.id, await bodyOf(ctx))),
  get('/api/insights/decay', () => decayView(buildModel())),
  get('/api/insights/secondary-keywords', () => secondaryView(buildModel())),
  post('/api/insights/secondary-keywords/:id', async (ctx) => secondaryAction(ctx.params.id, await bodyOf(ctx))),
  get('/api/keyword-map/table', () => keywordTableView(buildModel())),
  get('/api/export/keyword-map.csv', (ctx) => {
    const model = buildModel();
    sendText(ctx, 'text/csv; charset=utf-8', keywordCsv(model), `seo-desk-keyword-map-${deskToday()}.csv`);
  }),
];
