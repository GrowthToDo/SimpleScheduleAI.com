// The Newsroom cards as every reader sees them: the Newsroom page (ext/newsroom.mjs), This week (a picked
// story is a "Newsroom piece" card), the sidebar count and the Ask digest. Built once per model from the
// news snapshot, the links the founder pasted (state/news-pasted.json), the stories kept with his Hold,
// Drop and Pick (state/items.json, meta.story), and the repo's own posts, plan and topic log (the local
// snapshot). Reads only; nothing here writes a file.

import fs from 'node:fs';
import path from 'node:path';
import { readJson } from '../store.mjs';
import { mondayOf, daysBetween } from '../dates.mjs';
import { longDate, plain } from '../text.mjs';
import {
  storyCards,
  storyCard,
  matchHave,
  newsBrief,
  byScore,
  buildTopics,
  parseTopicLog,
  TO_CHECK,
  PAID_LABEL,
} from '../news.mjs';
import { readContent } from '../sources/local.mjs';
import { memo, itemOf, itemState, repoRoot } from './model.mjs';

// What the site has already written and decided: from the local snapshot, or, when that snapshot was
// read before the desk kept these (a desk just updated), straight from the repo files, so the matching
// never runs against nothing.
export function haveOf(model) {
  return memo(model, 'newsroom:have', () => {
    const local = model.data.local ?? {};
    let content = local.content;
    let log = local.newsroomLog;
    if (!Array.isArray(content)) {
      try {
        content = readContent(repoRoot(), model.today);
      } catch {
        content = [];
      }
    }
    if (!Array.isArray(log)) {
      try {
        log = parseTopicLog(fs.readFileSync(path.join(repoRoot(), 'docs/seo/articles-trendjacking-plan.md'), 'utf8'));
      } catch {
        log = [];
      }
    }
    const have = { content, registry: local.registry ?? [], log, plan: local.plan ?? null, today: model.today };
    return { ...have, topics: buildTopics(have) };
  });
}

export const PASTED_FILE = 'state/news-pasted.json';
export const PASTED_MAX = 50;
export const MAX_PICKS = 2;
export const HOLD_DAYS = 7;
export const NEWSROOM_LINE =
  'News from the last 14 days that fits your Newsroom method, checked against what you have written and decided.';
export const PICK_WHY = "You picked it for this week's Newsroom piece.";
export const PICK_LIMIT =
  "At most two picks a week, the method's maximum. Unpick one of this week's two before you pick another.";
export const TABS = [
  { key: 'fresh', label: 'Fresh' },
  { key: 'covered', label: 'Already covered or decided' },
  { key: 'held', label: 'Held' },
  { key: 'dropped', label: 'Dropped' },
  { key: 'picked', label: 'Picked' },
];

export const loadPasted = () => {
  const v = readJson(PASTED_FILE, []);
  return Array.isArray(v) ? v.filter((p) => p && typeof p.id === 'string' && typeof p.url === 'string') : [];
};

// What an item keeps of its story, so a held, dropped or picked card outlives the 14 day window.
export const storyOf = (card) => ({
  title: card.title,
  description: card.description ?? '',
  outlets: (card.outlets ?? []).map((o) => ({
    name: o.name,
    url: o.url,
    date: o.date,
    title: o.title,
    google: o.google,
  })),
  pasted: Boolean(card.pasted),
  pastedAt: card.pastedAt ?? null,
});

const itemsOfStory = (story) =>
  (story?.outlets ?? [])
    .filter((o) => /^https:\/\//.test(String(o?.url ?? '')))
    .map((o) => ({
      title: o.title || story.title,
      link: o.url,
      date: o.date ?? null,
      publisher: o.name,
      description: story.description ?? '',
      google: Boolean(o.google),
    }));

const normUrl = (u) => {
  try {
    const x = new URL(u);
    return `${x.hostname.replace(/^www\./, '')}${x.pathname.replace(/\/+$/, '')}${x.search}`.toLowerCase();
  } catch {
    return String(u ?? '').toLowerCase();
  }
};

const isPicked = (it, weekOf) => it?.pinnedWeek === weekOf && it.status !== 'ignored' && it.status !== 'snoozed';

// Which tab a card is on, and the line at its top that says why it is not fresh.
function placeOf(card, it, today, weekOf) {
  const s = it?.status ?? 'new';
  if (s === 'ignored')
    return {
      tab: 'dropped',
      topLine: `You dropped it${it.reason ? `: ${plain(it.reason)}` : ''}.`.replace(/\.\.$/, '.'),
    };
  if (s === 'snoozed' && it.snoozeUntil > today)
    return { tab: 'held', topLine: `You held it until ${longDate(it.snoozeUntil)}.` };
  if (it?.pinnedWeek === weekOf)
    return {
      tab: 'picked',
      topLine:
        s === 'done'
          ? `You marked the piece published on ${longDate(it.doneAt ?? it.since)}.`
          : "You picked it for this week's Newsroom piece.",
    };
  if (s === 'done')
    return { tab: 'covered', topLine: `You marked the piece published on ${longDate(it.doneAt ?? it.since)}.` };
  const covered = card.have.find((x) => x.covered);
  if (covered) return { tab: 'covered', topLine: `Already covered: ${covered.text}.` };
  const decided = card.have.find((x) => x.decided);
  if (decided) return { tab: 'covered', topLine: `Already decided: ${decided.text}`.replace(/([^.])$/, '$1.') };
  return { tab: 'fresh', topLine: null };
}

// The card as This week shows it (a Card from week.mjs's point of view): never a page edit.
export function weekCardOf(card, { picked = false } = {}) {
  const outlets = card.outlets.map((o) => o.name);
  const list =
    outlets.length > 3 ? `${outlets.slice(0, 3).join(', ')} and ${outlets.length - 3} more` : outlets.join(', ');
  return {
    id: card.id,
    slot: 'newsroom',
    title: card.title,
    measured: `${card.tierText}. ${card.score.risingWhy.replace(/\.$/, '')}${list ? ` (${list})` : ''}.${card.paid ? ` ${PAID_LABEL}.` : ''}`,
    action:
      'Write this Newsroom piece with the trendjacking method. Copy the brief first: it checks who owns the results page and the one citable hook before any writing.',
    test: 'Press Done once the piece is published. Whether it worked is judged by the links it earns, in the monthly measure the method describes.',
    page: null,
    isPageEdit: false,
    source: 'news',
    oppId: null,
    eligibility: { eligible: true, from: null },
    brief: card.brief,
    story: storyOf(card),
    ...(picked ? { why: PICK_WHY } : {}),
  };
}

// {cards, byId, weekOf, pastedOther}. cards: every Tier 1 and 2 card, plus any card the founder acted
// on, each with its tab. pastedOther: pasted links that fit no Newsroom topic (Tier 3), not acted on.
export function newsroomCards(model) {
  return memo(model, 'newsroom', () => {
    const today = model.today;
    const weekOf = mondayOf(today);
    const have = haveOf(model);

    // Stories the founder already acted on, by id, and each of their links, so a story keeps its id (and
    // so its Hold, Drop or Pick) when a new outlet joins it or its first outlet ages out of the window.
    const kept = Object.entries(model.items ?? {}).filter(([id, it]) => id.startsWith('news:') && it?.meta?.story);
    const idOfLink = new Map();
    for (const [id, it] of kept) for (const o of it.meta.story.outlets ?? []) idOfLink.set(normUrl(o.url), id);

    const byId = new Map();
    const add = (c) => {
      if (!byId.has(c.id)) byId.set(c.id, c);
    };
    for (const c of storyCards(model.data.news?.items ?? [], { today, topics: have.topics })) {
      const known = c.outlets.map((o) => idOfLink.get(normUrl(o.url))).find(Boolean);
      add(known && !byId.has(known) ? { ...c, id: known } : c);
    }
    const pastedIds = new Set(loadPasted().map((p) => p.id));
    for (const p of loadPasted()) {
      const items = [
        { title: p.title, link: p.url, date: p.date ?? null, publisher: p.publisher, description: p.description ?? '' },
      ];
      add({ ...storyCard(items, { today, pasted: true }), id: p.id, pastedAt: p.pastedAt ?? null });
    }
    // A story kept in state comes back from what the item saved: when it is held, dropped, picked or done,
    // and when it was pasted (a pasted card reopened is still the founder's own link).
    for (const [id, it] of kept) {
      if (byId.has(id)) continue;
      const acted = (it.status ?? 'new') !== 'new' || Boolean(it.pinnedWeek);
      if (!acted && !it.meta.story.pasted) continue;
      const items = itemsOfStory(it.meta.story);
      if (!items.length) continue;
      add({
        ...storyCard(items, { today, pasted: Boolean(it.meta.story.pasted) }),
        id,
        title: plain(it.meta.story.title),
        pastedAt: it.meta.story.pastedAt ?? null,
        aged: true,
      });
    }

    const cards = [];
    const pastedOther = [];
    for (const c of byId.values()) {
      const it = itemOf(model, c.id);
      // A pasted link that is already in the feeds is the feed's card, marked as pasted.
      const withHave = { ...c, pasted: c.pasted || pastedIds.has(c.id), have: matchHave(c, have) };
      const place = placeOf(withHave, it, today, weekOf);
      const card = {
        ...withHave,
        ...place,
        score: { ...c.score, toCheck: TO_CHECK },
        state: itemState(model, c.id),
        picked: isPicked(it, weekOf),
      };
      card.brief = newsBrief(card);
      // A pasted link that fits no topic is shown apart from the tabs until the founder acts on it.
      if (c.tier === 3 && place.tab === 'fresh') pastedOther.push(card);
      else if (c.tier !== 3 || c.pasted) cards.push(card);
    }
    const order = Object.fromEntries(TABS.map((t, i) => [t.key, i]));
    cards.sort((a, b) => order[a.tab] - order[b.tab] || byScore(a, b));
    const suggested = suggestionsOf(cards);
    const rank = new Map(suggested.map((x) => [x.id, x]));
    for (const c of cards) {
      const x = rank.get(c.id);
      if (x) Object.assign(c, { suggested: true, suggestRank: x.rank, suggestWhy: x.why, suggestScore: x.score });
    }
    return {
      cards,
      suggested: suggested.map((x) => cards.find((c) => c.id === x.id)),
      byId: new Map([...cards, ...pastedOther].map((c) => [c.id, c])),
      weekOf,
      pastedOther,
    };
  });
}

// ---------------------------------------------------------------- suggested for this week

export const SUGGEST_MAX = 5;
const TEXAS = /\btexas\b/i;
const CAH = /\bcritical access\b/i;
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// At most five: the best by draft score among Fresh Tier 1 and 2 cards (Fresh already leaves out what a
// recent piece covers, what is decided, held, dropped or picked) that are not a paid placement only.
// Texas or critical access in the story adds one to relevance (Texas is the founder's market). Each
// says in one line why: "Tier 1, Texas, 6 outlets in 5 days, nothing on our site yet".
export function suggestionsOf(cards) {
  const scored = [];
  for (const c of cards) {
    if (c.tab !== 'fresh' || c.tier === 3 || c.paid) continue;
    const text = [c.title, c.description ?? '', ...(c.outlets ?? []).map((o) => o.title ?? '')].join(' ');
    const extra = [TEXAS.test(text) ? 'Texas' : null, CAH.test(text) ? 'critical access' : null].filter(Boolean);
    const relevance = Math.min(5, c.score.relevance + (extra.length ? 1 : 0));
    scored.push({ c, extra, score: relevance * c.score.rising });
  }
  scored.sort(
    (a, b) =>
      b.score - a.score ||
      String(b.c.latestDate).localeCompare(String(a.c.latestDate)) ||
      a.c.title.localeCompare(b.c.title)
  );
  return scored.slice(0, SUGGEST_MAX).map(({ c, extra, score }, i) => ({
    id: c.id,
    rank: i + 1,
    score,
    why: suggestWhy(c, extra),
  }));
}

function suggestWhy(c, extra) {
  const n = (c.outlets ?? []).length;
  const span = c.firstDate && c.latestDate ? daysBetween(c.firstDate, c.latestDate) + 1 : null;
  const ran =
    n > 1 && span
      ? `${plural(n, 'outlet', 'outlets')} in ${plural(span, 'day', 'days')}`
      : `${plural(n, 'outlet', 'outlets')}${c.latestDate ? `, on ${longDate(c.latestDate)}` : ''}`;
  // The have lines are ordered closest first (a shared topic before shared words).
  const close = (c.have ?? []).find((x) => x.kind === 'article' || x.kind === 'post');
  const site = close
    ? `close to ${close.page}${close.publishDate ? ` (${longDate(close.publishDate)})` : ''}: it needs an angle that piece does not have`
    : 'nothing on our site yet';
  return [`Tier ${c.tier}`, ...extra, ran, site].join(', ');
}

// This week's picks, as week cards, best draft score first.
export function newsPicks(model) {
  const { cards } = newsroomCards(model);
  return cards.filter((c) => c.picked).map((c) => weekCardOf(c, { picked: true }));
}

// The sidebar count: the suggested stories (at most five), not every fresh one. Null when the news
// feeds were never read and nothing was pasted.
export function freshNewsCount(model) {
  const nr = newsroomCards(model);
  if (!model.snapObjs.news && !nr.cards.length) return null;
  return nr.suggested.length;
}
