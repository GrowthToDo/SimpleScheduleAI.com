// The Newsroom page (GET /api/newsroom) and its buttons: Paste a link (POST /api/newsroom/paste), Pick
// for this week and Unpick (POST /api/newsroom/pick, /api/newsroom/unpick). Hold, Drop, Reopen and Done
// are the ordinary item actions (POST /api/item/:id), and Refresh now is POST /api/refresh with
// {only: ['news']}. "Ask Claude for this week's topic" is POST /api/newsroom/ask-topic (lib/newsroom-ask.mjs:
// the Ask box machinery, every tool off, one run at a time for the whole desk). The cards come from
// api/newsroom-model.mjs; nothing here writes a tracked file.

import { get, post, bodyOf, bad } from '../kit.mjs';
import { buildModel, envelope } from '../model.mjs';
import { newsroomCards, haveOf, NEWSROOM_LINE, TABS, MAX_PICKS, HOLD_DAYS, SUGGEST_MAX } from '../newsroom-model.mjs';
import { runClaude, findClaude, NOT_FOUND } from '../../ask.mjs';
import { takeClaude, releaseClaude } from '../../claude-lock.mjs';
import {
  readMethod,
  topicData,
  topicPrompt,
  parseTopics,
  topicsWithBriefs,
  loadTopicAsk,
  saveTopicAsk,
  TOPIC_BUSY,
  HYPOTHESIS_LINE,
} from '../../newsroom-ask.mjs';
import { repoRoot } from '../model.mjs';
import { pickNews, unpickNews, pasteLink } from '../newsroom-actions.mjs';
import { fetchPublicPage } from '../../sources/page-fetch.mjs';
import { TO_CHECK, PAID_LABEL, NEWS_DAYS } from '../../news.mjs';
import { longDate, longRange } from '../../text.mjs';

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// How the feeds were read: when, how many outlets answered, and which did not.
function feedsOf(model) {
  const snap = model.snapObjs.news;
  const feeds = snap?.data?.feeds ?? [];
  const answered = feeds.filter((f) => f.ok).length;
  const failed = feeds.filter((f) => !f.ok).map((f) => ({ name: f.name, error: f.error ?? null }));
  const window =
    snap?.data?.from && snap?.data?.to
      ? { start: snap.data.from, end: snap.data.to, text: longRange(snap.data.from, snap.data.to) }
      : null;
  return {
    readAt: snap?.pulledAt ?? null,
    status: snap ? (snap.ok === false ? 'failed' : 'fresh') : 'never',
    answered,
    total: feeds.length,
    failed,
    items: (snap?.data?.items ?? []).length,
    window,
    text: !snap
      ? 'The news feeds have not been read yet. Press Refresh now.'
      : `${answered} of ${plural(feeds.length, 'feed', 'feeds')} answered, with ${plural((snap?.data?.items ?? []).length, 'item', 'items')} from ${window ? window.text : `the last ${NEWS_DAYS} days`}.`,
  };
}

// The latest topic answer, kept for the day it was asked.
function latestTopicAsk(model) {
  const v = loadTopicAsk();
  if (!v || v.date !== model.today) return null;
  return { ...v, dateText: longDate(v.date) };
}

export function newsroomView(model, { find = findClaude } = {}) {
  const nr = newsroomCards(model);
  const available = Boolean(find());
  const counts = Object.fromEntries(TABS.map((t) => [t.key, nr.cards.filter((c) => c.tab === t.key).length]));
  return {
    ...envelope(model, { need: ['news'] }),
    line: NEWSROOM_LINE,
    weekOf: nr.weekOf,
    weekLabel: `Week of ${longDate(nr.weekOf)}`,
    feeds: feedsOf(model),
    tabs: TABS.map((t) => ({ ...t, count: counts[t.key] })),
    suggested: nr.suggested,
    suggestNote: `At most ${SUGGEST_MAX}: the best by draft score among fresh Tier 1 and 2 stories that no piece of ours from the last 60 days covers, that you have not held or dropped, and that are not a paid placement only. Texas or critical access in the story counts one extra for relevance.`,
    allCount: nr.cards.length,
    cards: nr.cards,
    pastedOther: nr.pastedOther,
    topicAsk: {
      available,
      reason: available ? null : NOT_FOUND,
      latest: latestTopicAsk(model),
      note: HYPOTHESIS_LINE,
      what: "Claude reads the method, the top 40 fresh stories, our articles, the topic log of the last 90 days and the plan's next five posts, and suggests up to three topics. It uses your own Claude sign in on this Mac, costs no money and takes up to two minutes.",
    },
    picks: { count: counts.picked, max: MAX_PICKS },
    holdDays: HOLD_DAYS,
    toCheck: TO_CHECK,
    paidLabel: PAID_LABEL,
    scoreNote:
      'The draft score is the desk reading words and outlet counts. Relevance and Rising are drafts; Can we be first and Citable hook need a live search and a reading of the sources, which the brief asks Claude to do.',
  };
}

// What the Ask digest carries: the feeds line, this week's picks and the top five fresh cards with their
// tier, how many outlets ran each, the draft score with its two parts to check, and what we already have.
export function newsroomDigest(model) {
  const nr = newsroomCards(model);
  const f = feedsOf(model);
  const fresh = nr.cards.filter((c) => c.tab === 'fresh');
  return {
    line: NEWSROOM_LINE,
    feeds: { readAt: f.readAt, answered: f.answered, total: f.total, text: f.text },
    freshCount: fresh.length,
    picks: {
      count: nr.cards.filter((c) => c.picked).length,
      max: MAX_PICKS,
      titles: nr.cards.filter((c) => c.picked).map((c) => c.title),
    },
    rule: "Relevance and Rising are drafts; Can we be first and Citable hook are to check. Never call a story rising beyond its outlet count and dates. The real scoring is the card's Copy brief for Claude.",
    suggestedCount: nr.suggested.length,
    suggested: nr.suggested.map((c) => ({
      title: c.title,
      why: c.suggestWhy,
      tierText: c.tierText,
      outlets: c.outlets.length,
      latest: c.latestText,
      have: c.have.map((x) => x.text),
    })),
    claudeTopics: (() => {
      const t = latestTopicAsk(model);
      return t
        ? {
            askedAt: t.at,
            note: HYPOTHESIS_LINE,
            topics: (t.topics ?? []).map((x) => ({ n: x.n, title: x.title, text: x.text })),
          }
        : null;
    })(),
    fresh: fresh.slice(0, 5).map((c) => ({
      title: c.title,
      tierText: c.tierText,
      outlets: c.outlets.length,
      outletNames: c.outlets.map((o) => o.name),
      latest: c.latestText,
      draftScore: { relevance: c.score.relevance, rising: c.score.rising, risingWhy: c.score.risingWhy },
      toCheck: TO_CHECK.map((t) => t.name),
      ...(c.paid ? { paidText: c.paidText } : {}),
      have: c.have.map((x) => x.text),
    })),
  };
}

const idOf = (body) => {
  const id = String(body?.id ?? '');
  if (!/^news:[0-9a-f]{12}$/.test(id)) throw bad('id must be a Newsroom card id, such as news:0123456789ab.');
  return id;
};

// Asks Claude once for this week's topic and keeps the answer for the day. One run at a time for the
// whole desk (the Ask box shares the lock); a second press while one runs is refused.
async function askTopic({ run, find, now }) {
  if (!find()) throw Object.assign(new Error(NOT_FOUND), { status: 502 });
  if (!takeClaude()) throw Object.assign(new Error(TOPIC_BUSY), { status: 429 });
  const started = now();
  try {
    const model = buildModel();
    const nr = newsroomCards(model);
    const have = haveOf(model);
    const data = topicData({
      cards: nr.cards,
      suggested: nr.suggested,
      content: have.content,
      log: have.log,
      plan: have.plan,
      today: model.today,
    });
    const { text } = await run(topicPrompt({ method: readMethod(repoRoot()), data, today: model.today }));
    const answer = String(text);
    const entry = {
      date: model.today,
      at: new Date(started).toISOString(),
      tookMs: Math.max(0, now() - started),
      text: answer,
      topics: topicsWithBriefs(parseTopics(answer), nr.cards),
    };
    saveTopicAsk(entry);
    return { ...entry, dateText: longDate(entry.date), note: HYPOTHESIS_LINE };
  } catch (e) {
    if (e?.askError) throw Object.assign(new Error(e.message), { status: 502 });
    throw e;
  } finally {
    releaseClaude();
  }
}

// fetchPage is the guarded fetch of a pasted address; tests pass one with a fake network and DNS. run,
// find and now are the Claude runner, the check that Claude is installed and the clock (tests inject
// them: no real Claude in tests).
export function makeNewsroomRoutes({
  fetchPage = (url) => fetchPublicPage(url),
  run = runClaude,
  find = findClaude,
  now = () => Date.now(),
} = {}) {
  return [
    get('/api/newsroom', () => newsroomView(buildModel(), { find })),
    post('/api/newsroom/ask-topic', async (ctx) => (await bodyOf(ctx), askTopic({ run, find, now }))),
    post('/api/newsroom/paste', async (ctx) => pasteLink(await bodyOf(ctx), { fetchPage })),
    post('/api/newsroom/pick', async (ctx) => pickNews(idOf(await bodyOf(ctx)))),
    post('/api/newsroom/unpick', async (ctx) => unpickNews(idOf(await bodyOf(ctx)))),
  ];
}

export const routes = makeNewsroomRoutes();
