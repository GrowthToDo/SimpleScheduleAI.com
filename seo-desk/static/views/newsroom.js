// Newsroom (#/newsroom?tab=fresh): news from the last 14 days that fits the Newsroom method
// (.claude/skills/trendjacking-articles.md), from GET /api/newsroom. The top says what the page is,
// when the feeds were read and how many answered, with Refresh now (the news feeds only) and Paste a
// link. Tabs: Fresh, Already covered or decided, Held, Dropped, Picked, each with its count. Each card:
// the title, the tier with its words, every outlet (an https link opening in a new tab), the draft score
// with its two parts to check, the paid placement label, what we already have, and the buttons: Copy
// brief for Claude (the main one), Pick for this week, Hold, Drop; Published, Unpick and Reopen where
// they apply.
//
// The server works out every tier, score, match and count; this page only shows them. Text from the
// feeds and from pasted pages goes in as text nodes, never as HTML.
//
// Pure parts, tested in tests/newsroom.test.mjs (no browser needed):
//   tabOf(params)            the tab the address asks for (Fresh when none or an unknown one)
//   safeHref(url)            the address when it is https, else null (the outlet is then plain text)
//   scoreLines(card)         the draft score as four lines
//   actionsFor(card)         which buttons a card offers, main one first
//   feedsLine(feeds, fmt)    when the feeds were read and how many answered

export const TAB_KEYS = ['fresh', 'covered', 'held', 'dropped', 'picked'];

export const tabOf = (params) => {
  const t = params?.get?.('tab');
  return TAB_KEYS.includes(t) ? t : 'fresh';
};

export const safeHref = (url) => (/^https:\/\/[^\s]+$/i.test(String(url ?? '')) ? String(url) : null);

export function scoreLines(card) {
  const s = card?.score ?? {};
  return [
    `Relevance ${s.relevance} of 5: ${String(card?.tierText ?? '').replace(/\.$/, '')}.`,
    `Rising ${s.rising} of 5: ${s.risingWhy ?? ''}`.trim(),
    ...(s.toCheck ?? []).map((t) => `${t.name}: to check. ${t.how}`),
  ];
}

// The buttons a card offers, main one first: brief, pick, unpick, published, hold, drop, reopen.
export function actionsFor(card) {
  const s = card?.state?.status ?? 'new';
  const tab = card?.tab ?? 'fresh';
  if (tab === 'dropped' || tab === 'held') return ['reopen', 'brief'];
  if (tab === 'picked') return s === 'done' ? ['reopen', 'brief'] : ['brief', 'published', 'unpick'];
  if (s === 'done') return ['reopen', 'brief'];
  // A Tier 3 story is never picked: the method says to skip it.
  return card?.tier === 3 ? ['brief', 'hold', 'drop'] : ['brief', 'pick', 'hold', 'drop'];
}

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

export function feedsLine(feeds, fmt) {
  if (!feeds?.readAt) return feeds?.text ?? 'The news feeds have not been read yet. Press Refresh now.';
  const when = `${fmt.date(feeds.readAt.slice(0, 10))}, ${fmt.ago(feeds.readAt)}`;
  const failed = (feeds.failed ?? []).map((f) => f.name);
  return `Feeds read ${when}. ${feeds.text}${failed.length ? ` Did not answer: ${failed.join(', ')}.` : ''}`;
}

const CSS = `
.nr-top { display: grid; gap: 6px; }
.nr-paste { display: flex; flex-wrap: wrap; gap: 8px; align-items: flex-end; margin: 0; }
.nr-paste label { display: grid; gap: 4px; flex: 1 1 260px; min-width: 0; font-size: 14px; }
.nr-paste input { width: 100%; min-width: 0; box-sizing: border-box; }
.nr-cards { display: grid; gap: 14px; }
.nr-outlets, .nr-have, .nr-score { margin: 0; padding-left: 18px; }
.nr-outlets li, .nr-have li, .nr-score li { margin: 2px 0; overflow-wrap: anywhere; }
.nr-card .card-title, .nr-card dd { overflow-wrap: anywhere; }
.nr-words { color: var(--muted); }
.nr-note { margin: 8px 0 0; }
.nr-more { margin-top: 14px; }
.nr-picks { margin: 12px 0 4px; }
.nr-card details summary { cursor: pointer; color: var(--muted); margin: 4px 0; }
`;

const EMPTY = {
  fresh:
    'No fresh story fits the method right now. The feeds are read each morning; paste a link if you found one yourself.',
  covered: 'Nothing here. No story matches a piece you wrote or a decision in your topic log.',
  held: 'No story is held.',
  dropped: 'No story is dropped.',
  picked: "No story is picked for this week. Pick one or two from Fresh; they go into This week's priorities.",
};

// How many outlets a card lists before the rest fold away, and how many cards a tab shows at a time.
export const OUTLETS_SHOWN = 6;
export const CARDS_SHOWN = 25;

const BRIEF_HINT =
  'Copy the brief and paste it into Claude Code. It checks who owns the results page and the citable hook before any writing.';

async function waitForRefresh(ctx) {
  for (let i = 0; i < 90; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const p = await ctx.api.get('/api/refresh').catch(() => null);
    if (p && !p.running) return p;
  }
  return null;
}

export async function render(el, ctx) {
  const { api, h, fmt } = ctx;
  const data = await api.get('/api/newsroom');
  ctx.envelope(data);
  const tab = tabOf(ctx.params);

  const guard = (fn) => async (e) => {
    const b = e?.currentTarget;
    if (b) b.disabled = true;
    try {
      await fn(e);
    } catch (err) {
      ctx.toast(err.message, 'error');
    } finally {
      if (b && document.contains(b)) b.disabled = false;
    }
  };
  const itemPath = (id) => `/api/item/${encodeURIComponent(id)}`;
  const done = async (msg) => {
    ctx.toast(msg, 'success');
    await ctx.reload();
  };

  // ---------------------------------------------------------------- the buttons

  const ACTIONS = {
    brief: {
      label: 'Copy brief for Claude',
      run: async (c) => {
        const ok = await ctx.copyText(c.brief);
        ctx.toast(
          ok
            ? 'Brief copied. Paste it into Claude Code; it scores the story and logs the decision before any draft.'
            : 'The browser blocked copying. Click the page once, then try again.',
          ok ? 'success' : 'error'
        );
      },
    },
    pick: {
      label: 'Pick for this week',
      run: async (c) => {
        const res = await api.post('/api/newsroom/pick', { id: c.id });
        await done(res.message ?? 'Picked for this week.');
      },
    },
    unpick: {
      label: 'Unpick',
      run: async (c) => {
        const res = await api.post('/api/newsroom/unpick', { id: c.id });
        await done(res.message ?? 'Unpicked.');
      },
    },
    published: {
      label: 'Published',
      run: async (c) => {
        const ok = await ctx.confirmBox({
          title: 'Mark this piece published?',
          body: "Press this once the piece is live on /articles.\n\nIt is not a page edit, so nothing is frozen and this week's one page edit is not used.",
          confirmLabel: 'Yes, it is published',
        });
        if (!ok) return;
        await api.post(itemPath(c.id), { action: 'done' });
        await done('Marked published.');
      },
    },
    hold: {
      label: 'Hold',
      run: async (c) => {
        const until = await ctx.promptBox({
          title: 'Hold this story until',
          body: 'It leaves Fresh and comes back on this date.',
          type: 'date',
          min: fmt.isoPlus(1),
          value: fmt.isoPlus(data.holdDays ?? 7),
          confirmLabel: 'Hold it',
        });
        if (!until) return;
        await api.post(itemPath(c.id), { action: 'snooze', until });
        await done(`Held until ${fmt.date(until)}. It comes back on its own then.`);
      },
    },
    drop: {
      label: 'Drop',
      run: async (c) => {
        const reason = await ctx.promptBox({
          title: 'Drop this story?',
          body: 'It stays dropped until you reopen it. The method asks for the reason, so a later look does not redo the work.',
          label: 'Reason',
          placeholder: 'For example: no Critical Access Hospital angle',
          required: true,
          maxLength: 200,
          confirmLabel: 'Drop it',
        });
        if (!reason) return;
        await api.post(itemPath(c.id), { action: 'ignore', reason });
        await done('Dropped. It stays on the Dropped tab until you reopen it.');
      },
    },
    reopen: {
      label: 'Reopen',
      run: async (c) => {
        await api.post(itemPath(c.id), { action: 'reopen' });
        await done('Reopened. It is back with the others.');
      },
    },
  };

  // ---------------------------------------------------------------- one card

  const chip = (cls, text) => h('span', { class: `chip ${cls}`.trim() }, text);

  function card(c) {
    const list = actionsFor(c);
    const main = list[0];
    const buttons = list.map((key, i) =>
      h(
        'button',
        {
          type: 'button',
          class: `btn btn-small${i === 0 ? ' btn-primary' : ''}`,
          onclick: guard(() => ACTIONS[key].run(c)),
        },
        ACTIONS[key].label
      )
    );
    const outletLine = (o) => {
      const href = safeHref(o.url);
      const name = href ? h('a', { href, target: '_blank', rel: 'noopener noreferrer' }, o.name) : o.name;
      return h(
        'li',
        {},
        name,
        o.dateText ? `, ${o.dateText}` : ', no date given',
        o.paid ? h('span', { class: 'nr-words' }, ' (a press release or paid placement: not citable as a peg)') : null
      );
    };
    // A story that ran in dozens of outlets shows the newest few; the rest fold away.
    const all = c.outlets ?? [];
    const outlets = h(
      'div',
      {},
      h('ul', { class: 'nr-outlets' }, all.slice(0, OUTLETS_SHOWN).map(outletLine)),
      all.length > OUTLETS_SHOWN
        ? h(
            'details',
            {},
            h('summary', { class: 'small' }, `The other ${plural(all.length - OUTLETS_SHOWN, 'outlet', 'outlets')}`),
            h('ul', { class: 'nr-outlets' }, all.slice(OUTLETS_SHOWN).map(outletLine))
          )
        : null
    );
    const have = (c.have ?? []).length
      ? h(
          'ul',
          { class: 'nr-have' },
          c.have.map((x) =>
            h(
              'li',
              {},
              x.text,
              x.words?.length ? h('span', { class: 'nr-words' }, ` (shared words: ${x.words.join(', ')})`) : null
            )
          )
        )
      : h('span', { class: 'muted' }, 'Nothing the desk could match by title words.');
    return h(
      'article',
      { class: 'card nr-card', dataset: { id: c.id } },
      h(
        'div',
        { class: 'card-top' },
        chip('chip-accent', 'Newsroom'),
        chip(c.tier === 1 ? 'chip-accent' : '', c.tierText),
        c.pasted ? chip('', 'You pasted it') : null,
        c.aged ? chip('', 'No longer in the feeds') : null,
        c.state?.status === 'in-progress' ? chip('chip-accent', 'Started') : null
      ),
      c.topLine ? h('p', { class: 'banner banner-accent nr-note' }, c.topLine) : null,
      h('h3', { class: 'card-title' }, c.title),
      c.paid ? h('p', { class: 'banner banner-warn nr-note' }, c.paidText ?? data.paidLabel) : null,
      h(
        'dl',
        { class: 'facts' },
        h('dt', {}, `Outlets (${(c.outlets ?? []).length})`),
        h('dd', {}, outlets),
        h('dt', {}, 'Draft score'),
        h(
          'dd',
          {},
          h(
            'ul',
            { class: 'nr-score' },
            scoreLines(c).map((line) => h('li', {}, line))
          ),
          h('span', { class: 'chip chip-hyp', title: data.scoreNote }, 'Draft')
        ),
        h('dt', {}, 'What we already have'),
        h('dd', {}, have)
      ),
      h('div', { class: 'card-actions' }, buttons),
      main === 'brief' ? h('p', { class: 'muted small', style: { margin: '6px 0 0' } }, BRIEF_HINT) : null
    );
  }

  // ---------------------------------------------------------------- the top

  const refresh = h(
    'button',
    {
      type: 'button',
      class: 'btn',
      onclick: guard(async () => {
        await api.post('/api/refresh', { only: ['news'] });
        ctx.toast('Reading the news feeds. This takes under a minute.');
        const p = await waitForRefresh(ctx);
        const st = p?.completed?.news;
        ctx.toast(
          !p
            ? 'The feeds are still being read. Open the page again in a minute.'
            : st === 'failed'
              ? 'The news feeds did not answer. Settings shows why.'
              : 'The news feeds are read.',
          !p || st === 'failed' ? 'error' : 'success'
        );
        await ctx.reload();
      }),
    },
    'Refresh now'
  );

  const input = h('input', {
    class: 'input',
    type: 'url',
    name: 'url',
    inputmode: 'url',
    autocomplete: 'off',
    placeholder: 'https://',
    required: true,
  });
  const pasteButton = h('button', { type: 'submit', class: 'btn' }, 'Read it');
  const paste = h(
    'form',
    {
      class: 'nr-paste',
      onsubmit: async (e) => {
        e.preventDefault();
        const url = input.value.trim();
        if (!url) return;
        pasteButton.disabled = true;
        try {
          const res = await api.post('/api/newsroom/paste', { url });
          input.value = '';
          ctx.toast(res.message ?? 'Read.', 'success');
          const t = res.card?.tab;
          if (t && t !== tab && TAB_KEYS.includes(t) && res.card.tier !== 3) ctx.navigate(`#/newsroom?tab=${t}`);
          else await ctx.reload();
        } catch (err) {
          ctx.toast(err.message, 'error');
        } finally {
          if (document.contains(pasteButton)) pasteButton.disabled = false;
        }
      },
    },
    h('label', {}, 'Paste a link you found', input),
    pasteButton
  );

  const tabs = h(
    'div',
    { class: 'tabs', role: 'tablist', 'aria-label': 'Newsroom stories' },
    (data.tabs ?? []).map((t) =>
      h(
        'button',
        {
          type: 'button',
          class: 'tab',
          role: 'tab',
          'aria-selected': String(t.key === tab),
          onclick: () => ctx.navigate(t.key === 'fresh' ? '#/newsroom' : `#/newsroom?tab=${t.key}`),
        },
        t.label,
        h('span', { class: 'count' }, fmt.num(t.count))
      )
    )
  );

  // The tab's cards, best first, 25 at a time.
  const inTab = (data.cards ?? []).filter((c) => c.tab === tab);
  const list = h('div', { class: 'nr-cards' }, inTab.slice(0, CARDS_SHOWN).map(card));
  let drawn = Math.min(CARDS_SHOWN, inTab.length);
  const more = h('button', { type: 'button', class: 'btn' });
  const moreText = () => {
    const left = inTab.length - drawn;
    more.textContent = `Show ${Math.min(CARDS_SHOWN, left)} more (${left} not shown yet)`;
    more.hidden = left <= 0;
  };
  more.addEventListener('click', () => {
    list.append(...inTab.slice(drawn, drawn + CARDS_SHOWN).map(card));
    drawn = Math.min(drawn + CARDS_SHOWN, inTab.length);
    moreText();
  });
  moreText();
  const panel = h(
    'div',
    { role: 'tabpanel', 'aria-label': (data.tabs ?? []).find((t) => t.key === tab)?.label ?? 'Fresh' },
    inTab.length ? [list, h('div', { class: 'nr-more' }, more)] : h('p', { class: 'empty' }, EMPTY[tab])
  );

  // On a narrow screen the tab row scrolls sideways: bring the chosen tab into it once the page is shown.
  setTimeout(() => {
    const sel = tabs.querySelector('[aria-selected="true"]');
    if (sel && tabs.scrollWidth > tabs.clientWidth) tabs.scrollLeft = Math.max(0, sel.offsetLeft - 16);
  }, 0);

  const other = data.pastedOther ?? [];
  ctx.mount(
    el,
    h('style', {}, CSS),
    h(
      'div',
      { class: 'page-head' },
      h(
        'div',
        { class: 'nr-top' },
        h('h1', { class: 'page-title' }, 'Newsroom'),
        h('p', { class: 'page-sub' }, data.line),
        h('p', { class: 'page-sub' }, feedsLine(data.feeds, fmt))
      ),
      h('div', { class: 'row' }, refresh)
    ),
    h('section', { class: 'section' }, paste),
    other.length
      ? h(
          'section',
          { class: 'section' },
          h('h2', { class: 'section-title' }, 'Links you pasted that fit no Newsroom topic'),
          h(
            'p',
            { class: 'section-note' },
            'The method says to skip a Tier 3 story. Drop it, or copy the brief to look again.'
          ),
          h('div', { class: 'nr-cards' }, other.map(card))
        )
      : null,
    h(
      'p',
      { class: 'muted small nr-picks' },
      `Picked this week: ${data.picks?.count ?? 0} of ${data.picks?.max ?? 2}. ${plural(
        data.picks?.max ?? 2,
        'pick',
        'picks'
      )} a week at most, the method's maximum. A pick goes into This week's priorities and is not a page edit.`
    ),
    tabs,
    panel,
    h('p', { class: 'muted small' }, data.scoreNote)
  );
}
