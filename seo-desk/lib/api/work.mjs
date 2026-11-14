// View models for the working pages: This week, Opportunities, Two pages competing and
// Did it work. Pure reads of the shared model; the only files touched are the ones the
// week module already owns (weeks.json) and the annotations list.

import { readJson } from '../store.mjs';
import { WINDOW_DAYS, GSC_LAG_DAYS, isDueDate, windowsFor } from '../../../scripts/lib/change-log-core.mjs';
import { splitQueries, isBrand } from '../../../scripts/lib/gsc-diagnose-core.mjs';
import { judgePage } from '../verdicts.mjs';
import { addDays, mondayOf } from '../dates.mjs';
import { deliberateEdits as lifecycleEdits, eligibility } from '../lifecycle.mjs';
import {
  proposeTop5,
  worries as buildWorries,
  waiting as buildWaiting,
  blockedOnYou,
  getWeek,
  weeks,
  oppCard,
  worryCard,
  openWorkCard,
  pageForSlug,
  editThisWeek,
  planSizeOf,
} from '../week.mjs';
import { brief } from '../brief.mjs';
import { staleUpdatesNote } from '../google-updates.mjs';
import { longDate, plain } from '../text.mjs';
import {
  termOf,
  cardExplain,
  OPEN_STATUSES,
  leftAloneIds,
  readChoices,
  shouldWinOf,
  CHOICES,
  LEAVE_ALONE,
} from '../insights.mjs';
import { opportunityId } from '../rules.mjs';
import {
  POST_PAGE_RE,
  TYPE_LABEL,
  typeLabelOf,
  envelope,
  memo,
  sourcesOf,
  itemState,
  itemOf,
  decorateOpp,
  goneOpps,
  linksFor,
  pagePath,
  slugOf,
  loadSettings,
} from './model.mjs';
import { n0, pct, sumRange, lower } from './fmt.mjs';

// ---------------------------------------------------------------- annotations

export const ANNOTATIONS_FILE = 'state/annotations.json';
// Notes saved before they had a title, an end date, a category and a detail get those filled in.
const noteShape = (a) => ({
  ...a,
  title: a.title ?? a.text ?? '',
  text: a.text ?? a.title ?? '',
  endDate: a.endDate ?? null,
  category: a.category ?? 'other',
  detail: a.detail ?? '',
});
export const loadAnnotations = () => {
  const v = readJson(ANNOTATIONS_FILE, []);
  return Array.isArray(v) ? v.map(noteShape) : [];
};

// ---------------------------------------------------------------- Google ranking updates

const rankingUpdates = (model) =>
  (model.data.local?.googleUpdates ?? []).filter((u) => u?.kind === 'ranking' && u.start);

// Google's ranking updates that touch start..end (either may be left out), as chart markers:
// {date, endDate, label, kind: 'google-update'}. An update still rolling out has no end date and
// counts up to today. Empty when the founder has turned them off in settings.
export function googleUpdateMarkers(model, { start = null, end = null } = {}) {
  if (!loadSettings().showGoogleUpdates) return [];
  return rankingUpdates(model)
    .filter((u) => (!start || (u.end ?? model.today) >= start) && (!end || u.start <= end))
    .map((u) => ({ date: u.start, endDate: u.end ?? null, label: plain(u.title), kind: 'google-update' }))
    .sort((a, b) => a.date.localeCompare(b.date) || a.label.localeCompare(b.label));
}

// Ranking updates inside the 28 days before a change or the 28 days after it, the judge's own
// windows (windowsFor; the change day itself is in neither), whatever the markers setting says:
// this is a caution about a verdict, not a decoration.
export function updatesNear(model, changeDate) {
  if (!changeDate) return [];
  const { before, after } = windowsFor(changeDate);
  const windows = [before, after];
  return rankingUpdates(model)
    .filter((u) => windows.some((w) => u.start <= w.end && (u.end ?? model.today) >= w.start))
    .sort((a, b) => a.start.localeCompare(b.start))
    .map((u) => ({ label: plain(u.title), date: u.start }));
}

export const NEAR_UPDATE_NOTE = 'A Google ranking update fell inside this period, so read this verdict with care.';

// ---------------------------------------------------------------- the timeline

// Publishes, deliberate edits logged by hand, grouped git edits and the founder's own
// annotations, oldest first. Used for the markers on every chart.
export function timelineEvents(model, { page = null, start = null, end = null } = {}) {
  const inRange = (d) => (!start || d >= start) && (!end || d <= end);
  const out = [];
  const seen = new Set();
  const push = (e) => {
    const key = `${e.kind}|${e.date}|${e.page ?? ''}|${e.label}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(e);
    }
  };
  const groups = new Map();
  for (const e of model.edits) {
    if ((page && e.page !== page) || !inRange(e.date)) continue;
    if (e.kind === 'manual') push({ date: e.date, kind: 'note', label: plain(e.subject), page: e.page });
    else if (e.kind === 'publish') push({ date: e.date, kind: 'publish', label: `Published ${e.page}`, page: e.page });
    else {
      const key = `${e.date}|${e.subject}`;
      if (!groups.has(key)) groups.set(key, { date: e.date, subject: e.subject, pages: [] });
      groups.get(key).pages.push(e.page);
    }
  }
  for (const g of groups.values()) {
    push({
      date: g.date,
      kind: 'edit',
      label: plain(g.subject),
      page: g.pages.length === 1 ? g.pages[0] : null,
      pages: g.pages.slice(0, 5),
      count: g.pages.length,
    });
  }
  for (const a of loadAnnotations()) {
    if (a.archived || !inRange(a.date)) continue;
    push({
      date: a.date,
      endDate: a.endDate ?? null,
      kind: 'annotation',
      label: plain(a.title),
      page: null,
      id: a.id,
      category: a.category,
    });
  }
  // Site wide, so a single page chart shows them too.
  for (const m of googleUpdateMarkers(model, { start, end })) push(m);
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.label.localeCompare(b.label));
}

// ---------------------------------------------------------------- deliberate edits and verdicts

// page -> the dates it was deliberately improved, newest first. The rule for what counts lives
// in lifecycle.mjs (the freeze uses the same list), so the two can never disagree.
export function deliberateEdits(model) {
  return memo(model, 'deliberate', () => {
    const map = new Map();
    const list = lifecycleEdits({
      items: model.items,
      opps: model.opps,
      plan: model.data.local?.plan ?? null,
      edits: model.edits,
      planTicks: model.planTicks,
      planSeenOn: model.planSeenOn,
    });
    for (const { page, date } of list) {
      map.set(page, [...new Set([...(map.get(page) ?? []), date])].sort().reverse());
    }
    return map;
  });
}

const VERDICT_TEXT = {
  better: 'Better',
  worse: 'Worse',
  mixed: 'Mixed',
  flat: 'No real change',
  'insufficient-data': 'Too small to tell',
  'too-early': 'Too early',
};

function verdictSentence({ verdict, changeDate, subject, before, after, controlPct }) {
  const label = VERDICT_TEXT[verdict] ?? verdict;
  const place = (m) => (m?.position ? ` at an average place of ${m.position}` : '');
  let s = `${label}. In the ${WINDOW_DAYS} days before the ${longDate(changeDate)} change, ${subject} was shown ${n0(before?.impressions)} times${place(before)}. In the ${WINDOW_DAYS} days after, ${n0(after?.impressions)} times${place(after)}.`;
  if (typeof controlPct === 'number') {
    const p = Math.round(controlPct * 100);
    s += ` The typical page ${p === 0 ? 'stayed flat' : `moved ${p > 0 ? '+' : ''}${p}%`} over the same dates.`;
  }
  return s;
}

// docs/seo/change-log-verdicts.jsonl, shaped for the page. A batch is several pages judged as one.
export function verdictRows(model) {
  const local = model.data.local ?? {};
  return (local.verdicts ?? []).map((v) => {
    const batch = v.kind === 'batch' || (Array.isArray(v.pages) && !v.url);
    const near = updatesNear(model, v.changeDate);
    const pages = batch ? (v.pages ?? []).map((slug) => pageForSlug(slug, local)) : [];
    return {
      id: `${v.slug}|${v.changeDate}`,
      slug: v.slug,
      page: batch ? null : (v.url ?? pageForSlug(v.slug, local)),
      batch,
      pages,
      changeDate: v.changeDate,
      judgedOn: v.judgedOn ?? null,
      verdict: v.verdict,
      verdictText: VERDICT_TEXT[v.verdict] ?? v.verdict,
      before: v.before ?? null,
      after: v.after ?? null,
      // The page's own change in times shown, null under the minimum base.
      impChange: v.before && v.after ? pct(v.after.impressions, v.before.impressions) : null,
      control: { impPct: v.siteImpPct ?? null },
      relImpPct: v.relImpPct ?? null,
      posDelta: v.posDelta ?? null,
      nearUpdates: near,
      nearUpdatesNote: near.length ? NEAR_UPDATE_NOTE : null,
      overlapping: Boolean(v.overlapping),
      clicksTooSmall: Boolean(v.clicksTooSmall),
      dropType: v.dropType ?? null,
      signals: v.signals ?? [],
      summary: verdictSentence({
        verdict: v.verdict,
        changeDate: v.changeDate,
        subject: batch ? `the ${pages.length} pages together` : 'the page',
        before: v.before,
        after: v.after,
        controlPct: v.siteImpPct,
      }),
    };
  });
}

// Edits change-log would judge that are not ready yet: content pages edited fewer than 30 days ago.
export function pendingEdits(model) {
  return memo(model, 'pending', () => {
    const verdicts = model.data.local?.verdicts ?? [];
    const judged = (slug, date) =>
      verdicts.some((v) => (v.slug === slug || v.pages?.includes(slug)) && v.changeDate === date);
    const seen = new Set();
    const out = [];
    for (const e of model.edits) {
      if (e.kind === 'publish' || !POST_PAGE_RE.test(e.page) || isDueDate(e.date, model.today)) continue;
      const key = `${e.page}|${e.date}`;
      if (seen.has(key) || judged(slugOf(e.page), e.date)) continue;
      seen.add(key);
      const judgeFrom = addDays(e.date, WINDOW_DAYS + GSC_LAG_DAYS);
      out.push({
        page: e.page,
        changeDate: e.date,
        judgeFrom,
        judgeFromText: longDate(judgeFrom),
        kind: e.kind,
        subject: plain(e.subject),
      });
    }
    // A routine commit often touches many pages at once; the page can fold rows that share a change.
    const same = new Map();
    for (const r of out) same.set(`${r.changeDate}|${r.subject}`, (same.get(`${r.changeDate}|${r.subject}`) ?? 0) + 1);
    for (const r of out) r.sameChangeCount = same.get(`${r.changeDate}|${r.subject}`);
    return out.sort((a, b) => a.judgeFrom.localeCompare(b.judgeFrom) || a.page.localeCompare(b.page));
  });
}

// Edits finished their wait and not judged yet (what change-log calls due).
export function dueEdits(model) {
  const local = model.data.local ?? {};
  return (local.due ?? []).map((d) => ({
    page: d.url ?? pageForSlug(d.slug, local),
    changeDate: d.date,
    judgeFrom: addDays(d.date, WINDOW_DAYS + GSC_LAG_DAYS),
    kind: d.kind,
    subject: plain(d.commits?.[0]?.subject ?? d.notes?.[0] ?? ''),
    overlapping: Boolean(d.overlapping),
  }));
}

// Money pages and other pages outside src/data cannot be judged by change-log, so the desk
// runs the same before and after check on its own daily pulls.
export function moneyPageVerdicts(model) {
  return memo(model, 'moneyVerdicts', () => {
    const pageDaily = model.data.gsc?.pageDaily;
    if (!Array.isArray(pageDaily)) return [];
    const out = [];
    for (const [page, dates] of deliberateEdits(model)) {
      if (POST_PAGE_RE.test(page)) continue;
      const changeDate = dates[0];
      if (!(changeDate >= addDays(model.today, -120))) continue;
      const r = judgePage({ page, changeDate, pageDaily, today: model.today });
      out.push({
        page,
        changeDate,
        status: r.status,
        judgeFrom: r.judgeFrom,
        judgeFromText: longDate(r.judgeFrom),
        verdict: r.verdict,
        verdictText: VERDICT_TEXT[r.verdict ?? 'too-early'],
        before: r.before,
        after: r.after,
        impChange: r.before && r.after ? pct(r.after.impressions, r.before.impressions) : null,
        control: r.control ? { impPct: r.control.impPct, pages: r.control.pages } : null,
        partial: Boolean(r.partial),
        summary:
          r.status === 'judged'
            ? verdictSentence({
                verdict: r.verdict,
                changeDate,
                subject: 'the page',
                before: r.before,
                after: r.after,
                controlPct: r.control?.impPct,
              }) +
              (r.partial ? ' The desk has less than 28 days of its own data on one side, so treat this as rough.' : '')
            : `Too early. The ${longDate(changeDate)} change can be judged from ${longDate(r.judgeFrom)}.`,
      });
    }
    return out.sort((a, b) => b.changeDate.localeCompare(a.changeDate));
  });
}

export function resultsView(model) {
  const frozen = [...model.frozen].map(([page, f]) => ({
    page,
    since: f.since,
    until: f.until,
    untilText: longDate(f.until),
    why: f.why,
  }));
  frozen.sort((a, b) => a.until.localeCompare(b.until) || a.page.localeCompare(b.page));
  return {
    ...envelope(model, { need: ['local'] }),
    verdicts: verdictRows(model).sort((a, b) => String(b.judgedOn).localeCompare(String(a.judgedOn))),
    due: dueEdits(model),
    pending: pendingEdits(model),
    frozen,
    moneyPageVerdicts: moneyPageVerdicts(model),
    annotations: loadAnnotations().filter((a) => !a.archived),
    timeline: timelineEvents(model, { start: addDays(model.today, -120) }),
    // One plain line when Google's update list has not been read for more than 3 days.
    googleUpdatesNote: staleUpdatesNote(
      {
        fetchedAt: model.data.local?.googleUpdatesFetchedAt ?? null,
        triedAt: model.data.local?.googleUpdatesTriedAt ?? null,
      },
      model.today
    ),
    judgeNow: { preview: 'judge-preview', run: 'judge' },
  };
}

// ---------------------------------------------------------------- since you last looked

export function visitSummary(model) {
  const gsc = model.data.gsc;
  const cur = gsc?.windows?.cur;
  const index = model.index.rows ?? [];
  return {
    through: model.snapObjs.gsc?.through ?? null,
    impressions: cur && gsc?.siteDaily ? sumRange(gsc.siteDaily, cur.start, cur.end, 'impressions') : null,
    indexed: model.index.rows ? index.filter((r) => r.verdict === 'indexed').length : null,
    checked: model.index.checked,
    oppIds: model.opps.map((o) => o.id),
    verdictKeys: (model.data.local?.verdicts ?? []).map((v) => `${v.slug}|${v.changeDate}`),
  };
}

function sinceLastVisit(model, last) {
  if (!last?.summary) {
    return [
      'This is the first visit the desk has on record, so it has nothing to compare against yet. Changes show here from your next visit.',
    ];
  }
  const was = last.summary;
  const now = visitSummary(model);
  const out = [];
  const newVerdicts = (model.data.local?.verdicts ?? []).filter(
    (v) => !(was.verdictKeys ?? []).includes(`${v.slug}|${v.changeDate}`)
  );
  if (newVerdicts.length) {
    const worse = newVerdicts.filter((v) => v.verdict === 'worse').length;
    out.push(
      `${newVerdicts.length} new ${newVerdicts.length === 1 ? 'verdict is' : 'verdicts are'} in on Did it work${worse ? `, ${worse} of them worse` : ''}.`
    );
  }
  if (now.indexed !== null && was.indexed !== null && now.indexed !== was.indexed && now.checked === was.checked) {
    out.push(`Pages on Google went from ${was.indexed} to ${now.indexed} of the ${now.checked} checked.`);
  }
  const change = now.impressions !== null && was.impressions !== null ? pct(now.impressions, was.impressions) : null;
  if (change !== null && Math.abs(change) >= 5) {
    out.push(
      `Google impressions for the last 28 days ${change > 0 ? 'rose' : 'fell'} ${Math.abs(change)}% since you last looked, from ${n0(was.impressions)} to ${n0(now.impressions)} (${model.range.text}).`
    );
  }
  const wasIds = new Set(was.oppIds ?? []);
  const fresh = model.opps.filter((o) => !wasIds.has(o.id));
  if (fresh.length) {
    out.push(
      `${fresh.length} new ${fresh.length === 1 ? 'opportunity' : 'opportunities'} appeared. The highest ranked is: ${plain(fresh[0].title)}.`
    );
  }
  if (!out.length && now.through && was.through && now.through !== was.through) {
    out.push(
      `Search Console data now runs through ${longDate(now.through)}, up from ${longDate(was.through)}. Nothing else moved enough to mention.`
    );
  }
  if (!out.length)
    out.push(`Nothing has changed since you last looked on ${longDate(last.day ?? String(last.at).slice(0, 10))}.`);
  return out.slice(0, 3);
}

// ---------------------------------------------------------------- cards

const keyOfCard = (id) => (String(id).startsWith('opp:') ? String(id).slice(4) : String(id));
export const itemKey = keyOfCard;

// Plain names for the cards that are not opportunities, by the id they are built with.
const WORRY_LABEL = {
  'dropped-from-index': 'Dropped off Google',
  'slipping-page': 'Decay',
  'verdict-worse': 'A change made things worse',
  'crawl-issue': 'Bing crawl problem',
  'registry-fail': 'Keyword file problem',
  'source-failed': 'A data source did not refresh',
  'competitor-change': 'Competitor change',
};
const SLOT_LABEL = {
  'new-post': 'New post',
  'page-edit': 'Live page improvement',
  verdict: 'Verdict',
  other: 'Open work',
};

// The plain label of what a card is: the opportunity type when it came from one, else its kind.
function cardLabel(model, card) {
  const opp = card.oppId ? model.oppById.get(card.oppId) : null;
  if (opp) return typeLabelOf(opp.type, opp.source);
  if (card.source === 'worry') return WORRY_LABEL[String(card.id).split(':')[0]] ?? 'Worry';
  return SLOT_LABEL[card.slot] ?? 'Task';
}

// The standard term and its one sentence for a card: an opportunity's from its type, any other card's
// from its label.
function termFields(model, card) {
  const opp = card.oppId ? model.oppById.get(card.oppId) : null;
  if (opp) return termOf(opp.type, opp.source);
  const label = cardLabel(model, card);
  return { term: label, explain: cardExplain(label) };
}

// The pages a Done on a split search edits, for the card's confirm (only for split searches).
const editPagesOf = (model, oppId) => {
  const id = oppId ? keyOfCard(oppId) : null;
  const split = id && model.oppById.get(id)?.type === 'competing-pages' ? splitEdit(model, id) : null;
  return split ? { editPages: split.pages } : {};
};

function cardOut(model, card) {
  const e = card.eligibility ?? { eligible: true, from: null };
  return {
    ...card,
    ...editPagesOf(model, card.oppId),
    typeLabel: cardLabel(model, card),
    ...termFields(model, card),
    score: (card.oppId ? model.oppById.get(card.oppId)?.score : null) ?? null,
    eligibility: { ...e, text: e.text ?? (e.eligible ? 'Eligible now' : `Eligible from ${longDate(e.from)}`) },
    state: itemState(model, keyOfCard(card.id)),
    brief: brief(card, { frozen: model.frozen }),
    links: linksFor(card.page),
  };
}

// The worries, minus any the founder has dealt with. Competitor changes come back when a
// newer change appears after the day it was marked seen.
function visibleWorries(model, all) {
  const watchDate = new Map();
  for (const w of model.data.local?.competitors?.watch ?? []) {
    if (!w.changes?.length) continue;
    let host = String(w.url).split('__')[0];
    try {
      host = new URL(w.url).hostname.replace(/^www\./, '');
    } catch {
      // a sentinel label, already a host
    }
    if (!watchDate.has(host) || w.fetchedAt > watchDate.get(host)) watchDate.set(host, w.fetchedAt);
  }
  return all.filter((w) => {
    const it = itemOf(model, w.oppId ?? w.id);
    if (!it) return true;
    if (it.status === 'ignored') return false;
    if (it.status === 'snoozed' && it.snoozeUntil > model.today) return false;
    if (it.status === 'done' && w.kind === 'competitor-change') {
      const latest = watchDate.get(String(w.id).split(':')[1]);
      return Boolean(latest && it.doneAt && latest > it.doneAt);
    }
    return true;
  });
}

// Everything the week page can show as a card, by id: the proposal, every opportunity,
// every worry and the open work rows. The founder's chosen five come from here.
export function weekModel(model) {
  return memo(model, 'week', () => {
    const { today, items, frozen } = model;
    const local = model.data.local ?? {};
    const weekOf = mondayOf(today);
    const sources = sourcesOf(model);
    const allWorries = buildWorries({
      snaps: {
        gsc: model.snapObjs.gsc,
        bing: model.snapObjs.bing,
        local: model.snapObjs.local,
        index: { data: { pages: model.index.rows ?? [] } },
      },
      prevSnaps: { gsc: { data: { index: model.prevIndex ?? [] } } },
      sources,
      frozen,
      opps: model.opps,
      today,
    });
    const worryList = visibleWorries(model, allWorries);
    // A split search the founder chose to leave alone is not proposed for the week.
    const proposed = proposeTop5({
      plan: local.plan ?? null,
      ranked: activeOpps(model),
      due: local.due ?? [],
      worries: worryList,
      openWork: local.openWork ?? [],
      frozen,
      items,
      today,
      size: planSizeOf(),
    });
    const pool = new Map();
    for (const w of allWorries) {
      const c = worryCard(w, frozen, today);
      pool.set(c.id, c);
    }
    for (const w of local.openWork ?? []) pool.set(openWorkCard(w).id, openWorkCard(w));
    for (const o of model.opps) pool.set(`opp:${o.id}`, oppCard(o, 'other', frozen, today));
    for (const c of proposed) pool.set(c.id, c);
    return { weekOf, proposed, pool, worries: worryList, allWorries };
  });
}

// A chosen or locked page edit card, brought up to date: the freeze and the this-week check are
// worked out again from the current data (lifecycle eligibility and week.mjs editThisWeek), so a
// week edit dated by another route (a plan row, an edit note, another card) shows on it. A card
// whose own item is the week's edit, or a card that edits no live page, is left as it is.
function freshen(model, card) {
  if (!card.isPageEdit || card.readOnly || !card.page) return card;
  const e = eligibility({ isPageEdit: true, page: card.page }, model.frozen, model.today);
  const week = editThisWeek(model.frozen, model.today);
  const own = itemOf(model, keyOfCard(card.id))?.status === 'done';
  if (!week || own || !e.eligible) return { ...card, eligibility: e, weekEditDone: null };
  const next = addDays(mondayOf(model.today), 7);
  return {
    ...card,
    eligibility: {
      eligible: false,
      from: next,
      text: `This week's page edit is done (${week.page}, ${longDate(week.since)}). The next one can go in from ${longDate(next)}`,
    },
    weekEditDone: { page: week.page, date: week.since, dateText: longDate(week.since) },
  };
}

// The five cards the week page shows: the locked plan, else the founder's chosen five, else
// the proposal. Raw cards (no state, brief or links). Stored cards are freshened first.
export function currentTop5(model) {
  const { weekOf, proposed, pool } = weekModel(model);
  const stored = getWeek(weekOf);
  if (stored?.locked && stored.cards?.length)
    return { cards: stored.cards.map((c) => freshen(model, c)), source: 'locked', stored };
  if (stored?.top5?.length) {
    return {
      cards: stored.top5
        .map((id) => pool.get(id))
        .filter(Boolean)
        .map((c) => freshen(model, c)),
      source: 'chosen',
      stored,
    };
  }
  return { cards: proposed, source: 'proposed', stored };
}

// What not to touch this week: pages inside their 28 days (the lifecycle freeze, so no new edit
// restarts the measuring) and the pages of split searches the founder chose to leave alone.
// [{page, reason, until}]; until is null for a choice, which has no end date.
export function leaveAloneList(model) {
  const frozen = [...model.frozen]
    .sort((a, b) => a[1].until.localeCompare(b[1].until) || a[0].localeCompare(b[0]))
    .map(([page, f]) => ({
      page,
      reason: `Edited on ${longDate(f.since)}, being measured until ${longDate(f.until)}.`,
      until: f.until,
    }));
  const chosen = [];
  for (const c of leftAloneSplits(model))
    for (const page of c.pages)
      chosen.push({ page, reason: `You marked the split over "${c.query}" as leave alone.`, until: null });
  return [...frozen, ...chosen];
}

export function weekView(model) {
  const wm = weekModel(model);
  const { weekOf } = wm;
  const local = model.data.local ?? {};
  const { cards, source: top5Source, stored } = currentTop5(model);
  const inFive = new Set(cards.map((c) => c.oppId).filter(Boolean));
  const open = (o) => OPEN_STATUSES.includes(itemOf(model, o.id)?.status ?? 'new');
  const topTen = activeOpps(model)
    .filter((o) => !inFive.has(o.id) && open(o))
    .slice(0, 10)
    .map((o) => decorateOpp(model, o));
  const last = readJson('state/visit.json', null);
  const waitingList = buildWaiting({
    verdictsDue: [],
    frozen: model.frozen,
    plan: local.plan ?? null,
    today: model.today,
  }).map((w) => ({ ...w, dateText: longDate(w.date) }));
  return {
    ...envelope(model),
    weekOf,
    weekLabel: `Week of ${longDate(weekOf)}`,
    standingLine:
      'Rankings, impressions and visits are not sales. Customers come through personal contacts. This page tracks how easy we are to find.',
    sinceLastVisit: sinceLastVisit(model, last),
    lastVisit: last?.at ?? null,
    top5: cards.map((c) => cardOut(model, c)),
    top5Source,
    opportunities: topTen,
    counts: { openOpportunities: activeOpps(model).filter(open).length },
    worries: wm.worries.map((w) => {
      // The same card the five would show for it, so brief and test read like an opportunity's,
      // and the same id (a slipping page is its opportunity, opp:<id>), so every button works.
      const c = worryCard(w, model.frozen, model.today);
      return {
        ...w,
        ...termFields(model, c),
        id: c.id,
        test: c.test,
        brief: brief(c, { frozen: model.frozen }),
        links: linksFor(w.page),
        state: itemState(model, keyOfCard(c.id)),
      };
    }),
    waiting: waitingList,
    planSize: planSizeOf(),
    leaveAlone: leaveAloneList(model),
    blockedOnYou: blockedOnYou(local.openWork ?? []),
    locked: Boolean(stored?.locked),
    lockedAt: stored?.lockedAt ?? null,
    pastWeeks: weeks()
      .filter((w) => w.weekOf !== weekOf)
      .map((w) => {
        const list = (w.cards?.length ? w.cards : (w.top5 ?? []).map((id) => ({ id, title: id }))).map((c) => ({
          id: c.id,
          title: plain(c.title),
          status: itemOf(model, keyOfCard(c.id))?.status ?? 'new',
        }));
        return {
          weekOf: w.weekOf,
          weekLabel: `Week of ${longDate(w.weekOf)}`,
          locked: Boolean(w.locked),
          lockedAt: w.lockedAt ?? null,
          cards: list,
          doneCount: list.filter((c) => c.status === 'done').length,
        };
      }),
  };
}

// ---------------------------------------------------------------- opportunities

export const STATUSES = ['new', 'in-progress', 'snoozed', 'done', 'ignored', 'came-back'];

// status: one of STATUSES, 'open' (new, in progress or came back: the one definition of open the
// sidebar and the insight pages use), 'attention' (new only, an older address) or 'all'.
export function opportunitiesList(model, { type = '', status = '', page = '' } = {}) {
  const wantStatus = status === 'attention' ? 'new' : status;
  const wantPage = page ? pagePath(page) : '';
  const all = [
    ...activeOpps(model).map((o) => ({ ...decorateOpp(model, o), ...editPagesOf(model, o.id) })),
    ...goneOpps(model),
  ];
  const byPage = all.filter((o) => !wantPage || o.page === wantPage);
  const matchType = (o) => !type || type === 'all' || o.type === type;
  const matchStatus = (o) =>
    !wantStatus ||
    wantStatus === 'all' ||
    (wantStatus === 'open' ? OPEN_STATUSES.includes(o.status) : o.status === wantStatus);
  const byType = Object.fromEntries(Object.keys(TYPE_LABEL).map((t) => [t, 0]));
  const byStatus = Object.fromEntries([...STATUSES, 'open'].map((s) => [s, 0]));
  for (const o of byPage) {
    if (matchStatus(o)) byType[o.type] = (byType[o.type] ?? 0) + 1;
    if (matchType(o)) {
      byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
      if (OPEN_STATUSES.includes(o.status)) byStatus.open += 1;
    }
  }
  return {
    byPage,
    items: byPage.filter((o) => matchType(o) && matchStatus(o)),
    counts: { byType, byStatus },
  };
}

// The open opportunities: the sidebar's All opportunities count, and the Open view's All tab.
export const openOpportunityCount = (model) => opportunitiesList(model, { status: 'open' }).items.length;

// The opportunity types that have an insight page of their own, with the sidebar count (in that
// page's own unit) and the unit one row of All opportunities is. Internal links is left out: its
// page counts link suggestions (for runner-up pages too), which the Internal links tab on All
// opportunities shows with that same count.
export const INSIGHT_OF_TYPE = {
  'near-page-one': { route: 'runner-up', count: 'runnerUp', unit: ['search', 'searches'], row: ['search', 'searches'] },
  'competing-pages': {
    route: 'cannibalization',
    count: 'cannibalization',
    unit: ['search', 'searches'],
    row: ['search', 'searches'],
  },
  unserved: { route: 'content-gaps', count: 'contentGaps', unit: ['gap', 'gaps'], row: ['search', 'searches'] },
  slipping: { route: 'decay', count: 'decay', unit: ['page', 'pages'], row: ['page', 'pages'] },
};

const plural = (n, [one, many]) => `${n0(n)} ${n === 1 ? one : many}`;

// insightCounts: the /api/nav counts (the route passes them), so each type tab on the Open view
// shows the same number, in the same unit, as the sidebar and the insight page. `openRows` is how
// many rows of this list the type has in the Open view, and `countNote` says how the two meet when
// the units differ (a content gap is several searches).
export function opportunitiesView(model, filters, { insightCounts = null } = {}) {
  const { items, counts } = opportunitiesList(model, filters);
  const openRows = opportunitiesList(model, { status: 'open', page: filters?.page ?? '' }).counts.byType;
  return {
    ...envelope(model, { need: ['gsc', 'bing', 'local'] }),
    types: Object.entries(TYPE_LABEL).map(([type, label]) => {
      const ins = INSIGHT_OF_TYPE[type];
      const count = ins && insightCounts ? (insightCounts[ins.count] ?? null) : null;
      const rows = openRows[type] ?? 0;
      return {
        type,
        label,
        ...termOf(type),
        route: ins?.route ?? null,
        // The insight page's own count (open, in its unit), or null when the type has no page of its own.
        insightCount: count,
        unit: ins?.unit ?? ['opportunity', 'opportunities'],
        openRows: rows,
        countNote:
          count !== null && (count !== rows || ins.unit[0] !== ins.row[0])
            ? `${plural(count, ins.unit)} on the ${label} page, listed here as ${plural(rows, ins.row)}.`
            : null,
      };
    }),
    statuses: STATUSES,
    counts,
    items,
  };
}

// ---------------------------------------------------------------- two pages competing

export function competingList(model) {
  return memo(model, 'competing', () => {
    const qp = model.data.gsc?.qpCur;
    if (!Array.isArray(qp)) return [];
    const registry = model.data.local?.registry ?? [];
    const byKeyword = new Map(registry.filter((r) => r.primaryKeyword).map((r) => [lower(r.primaryKeyword), r.url]));
    const oppFor = new Map(model.opps.filter((o) => o.type === 'competing-pages').map((o) => [o.query, o.id]));
    return splitQueries(qp)
      .filter((q) => !isBrand(q.query, model.brands))
      .map((q) => {
        const registryPage = byKeyword.get(lower(q.query)) ?? null;
        const winner = registryPage ? q.pages[0].page === registryPage : null;
        return {
          query: q.query,
          impressions: q.impressions,
          topShare: Math.round(q.topShare * 100) / 100,
          registryPage,
          registryWins: winner,
          pages: q.pages.map((p) => ({
            page: p.page,
            share: Math.round(p.share * 100) / 100,
            impressions: p.impressions,
            position: p.position,
            isRegistryPage: registryPage ? p.page === registryPage : false,
          })),
          note: registryPage
            ? winner
              ? 'The page your keyword file names is already the top one. A split is fine if the pages answer different needs.'
              : `Your keyword file names ${registryPage} for this search, but another page is showing more. A split is fine if the pages answer different needs.`
            : 'No page in your keyword file targets this search. A split is fine if the pages answer different needs.',
          oppId: oppFor.get(q.query) ?? null,
        };
      });
  });
}

// The id of a split search: its opportunity's id, else the id the rules would give it. The founder's
// cannibalization choices are saved under it.
export const competingId = (c) => c.oppId ?? opportunityId('competing-pages', '', c.query);

// The pages a Done on a split search edits, by the founder's choice for it:
//   no choice       the page that should win (the recommendation strengthens it)
//   consolidate     the page that should win and every page folded into it
//   differentiate   the page whose angle was changed, when one is named; else none
//   leave alone     none
// {id, query, choice, shouldWin, pages, splitPages}, or null when `id` is not a split search the desk
// lists. A named page that is not part of the split is refused (400). One place decides this, so the
// Done guards, the freeze, the card's confirm and its eligibility all name the same pages.
export function splitEdit(model, id, page = null) {
  const c = competingList(model).find((x) => competingId(x) === id);
  if (!c) return null;
  const saved = readChoices()[id]?.choice;
  const choice = CHOICES.includes(saved) ? saved : null;
  const shouldWin = shouldWinOf(c.registryPage, c.pages);
  const splitPages = c.pages.map((p) => p.page);
  const named = page ? pagePath(page) : null;
  if (named && !splitPages.includes(named))
    throw Object.assign(new Error(`${named} is not one of the pages split over "${c.query}".`), { status: 400 });
  const others = splitPages.filter((p) => p !== shouldWin);
  const pages =
    choice === LEAVE_ALONE
      ? []
      : choice === 'consolidate'
        ? [shouldWin, ...others]
        : choice === 'differentiate'
          ? named
            ? [named]
            : []
          : [shouldWin];
  return { id, query: c.query, choice, shouldWin, pages: pages.filter(Boolean), splitPages };
}

// The split searches the founder chose to leave alone, that are still listed and still open:
// [{id, query, oppId, pages: [page]}].
export function leftAloneSplits(model) {
  const ids = leftAloneIds();
  if (!ids.size) return [];
  return competingList(model)
    .map((c) => ({ id: competingId(c), query: c.query, oppId: c.oppId, pages: c.pages.map((p) => p.page) }))
    .filter((c) => ids.has(c.id) && (!c.oppId || OPEN_STATUSES.includes(itemOf(model, c.oppId)?.status ?? 'new')));
}

// The ranked opportunities without the split searches the founder chose to leave alone. One place
// decides this, so the week, the Opportunities list, the proposal and the sidebar count agree. The
// left alone ones stay reachable through the cannibalization route's leftAlone list.
export const activeOpps = (model) =>
  memo(model, 'active-opps', () => {
    const left = new Set(leftAloneSplits(model).map((c) => c.oppId));
    return left.size ? model.opps.filter((o) => !left.has(o.id)) : model.opps;
  });

export function competingView(model) {
  return {
    ...envelope(model, { need: ['gsc'] }),
    note: 'A search shared by two pages is only a problem when both pages answer the same need.',
    items: competingList(model),
  };
}
