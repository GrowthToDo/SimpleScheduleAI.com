// The sidebar: five groups of pages, each entry with its route, its label (the standard SEO term),
// one plain sentence saying what it means, and the count it shows from GET /api/nav.
//
//   NAV                      the groups and entries, in sidebar order
//   NAV_ENTRIES              every entry, flat
//   entryFor(route)          one entry, or undefined
//   countText(value)         the number as shown; null (source never pulled) is a dash
//   countTone(entry, value)  'warn', 'danger' or '' (a tint only when the count is above zero)
//   countTitle(entry, value) the hover text for a count
//   ASK_ENTRY                the Ask page, drawn above the groups (not in NAV_ENTRIES)
//   askBlock(h, onAsk)       the Ask link and the compact ask field
//   buildNav(h, counts, {onAsk})  the <nav> contents (browser only)
//
// The pure parts are tested in tests/shell.test.mjs.

export const NAV = [
  {
    group: 'Plan',
    items: [
      {
        route: 'week',
        label: 'This week',
        explain: 'The few things worth doing this week, and what may be going wrong.',
        count: 'worries',
        tone: 'danger',
        unit: ['worry', 'worries'],
      },
    ],
  },
  {
    group: 'Search',
    items: [
      { route: 'performance', label: 'Performance', explain: 'Clicks, impressions and click rate from Google.' },
      { route: 'queries', label: 'Queries', explain: 'Every search Google showed the site for.' },
      { route: 'pages', label: 'Pages', explain: 'Every page on the site and how search treats it.' },
    ],
  },
  {
    group: 'Insights',
    items: [
      {
        route: 'keyword-map',
        label: 'Keyword map',
        explain: 'Every keyword you target or already show for, and the page it maps to.',
        count: 'keywordMap',
        unit: ['keyword', 'keywords'],
      },
      {
        route: 'cannibalization',
        label: 'Cannibalization',
        explain: 'Two of your pages are competing for the same search.',
        count: 'cannibalization',
        tone: 'warn',
        unit: ['search', 'searches'],
      },
      {
        route: 'runner-up',
        label: 'Runner-up keywords',
        explain: 'Searches where you sit just off page one.',
        count: 'runnerUp',
        unit: ['search', 'searches'],
      },
      {
        route: 'secondary-keywords',
        label: 'Secondary keywords',
        explain: 'Searches a page already appears for but does not target.',
        count: 'secondaryKeywords',
        unit: ['search', 'searches'],
      },
      {
        route: 'content-gaps',
        label: 'Content gaps',
        explain: 'Searches you already appear for that no page is written for.',
        count: 'contentGaps',
        unit: ['gap', 'gaps'],
      },
      {
        route: 'decay',
        label: 'Decay',
        explain: 'Pages that are being shown less than before.',
        count: 'decay',
        tone: 'warn',
        unit: ['page', 'pages'],
      },
      {
        route: 'links',
        label: 'Internal links',
        explain: 'Pages that few of your other pages link to.',
        count: 'internalLinks',
        unit: ['link to add', 'links to add'],
      },
      {
        route: 'opportunities',
        label: 'All opportunities',
        explain: 'Every open opportunity of every kind, in one list.',
        count: 'opportunities',
        unit: ['open opportunity', 'open opportunities'],
      },
    ],
  },
  {
    group: 'Health and AI',
    items: [
      {
        route: 'audit',
        label: 'Technical audit',
        explain: 'Problems on the pages themselves that can keep them out of search.',
        // The open critical and high issues ("2 to fix"), or a tick when there are none. The score
        // stays on the page: it is not a to-do count.
        count: 'auditToFix',
        tone: 'danger',
        unit: ['issue to fix', 'issues to fix'],
      },
      { route: 'ai', label: 'AI visibility', explain: 'Whether AI assistants name the site when asked.' },
      { route: 'visitors', label: 'Visitors', explain: 'Who came to the site and what they did.' },
    ],
  },
  {
    group: 'Workspace',
    items: [
      { route: 'results', label: 'Did it work?', explain: 'The verdict on each page change, 28 days on.' },
      { route: 'keywords', label: 'Keywords', explain: 'The keywords you target and the page meant to win each.' },
      { route: 'competitors', label: 'Competitors', explain: 'What competing sites changed.' },
      { route: 'settings', label: 'Settings', explain: 'Data sources, schedules and the desk itself.' },
    ],
  },
];

export const NAV_ENTRIES = NAV.flatMap((g) => g.items.map((it) => ({ ...it, group: g.group })));

// The Ask page sits above the groups, with a small ask field under its link (buildNav draws both).
export const ASK_ENTRY = {
  route: 'ask',
  label: 'Ask',
  explain: "Ask a question about your search data. Claude is given the desk's numbers and changes nothing.",
};

export const entryFor = (route) =>
  NAV_ENTRIES.find((e) => e.route === route) ?? (route === ASK_ENTRY.route ? ASK_ENTRY : undefined);

// What each count needs before it can be counted, for the hover text of a dash.
const NEEDS = {
  keywordMap: 'Search Console',
  cannibalization: 'Search Console',
  runnerUp: 'Search Console',
  secondaryKeywords: 'Search Console',
  contentGaps: 'Search Console',
  decay: 'Search Console',
  internalLinks: 'the repo files',
  auditToFix: 'a technical audit',
  opportunities: 'any search source',
  worries: 'any search source',
};

export const DASH = '-';

const isNum = (v) => v !== null && v !== undefined && Number.isFinite(Number(v));

export function countText(value) {
  return isNum(value) ? Number(value).toLocaleString('en-US') : DASH;
}

export function countTone(entry, value) {
  if (!entry?.tone || !isNum(value) || Number(value) <= 0) return '';
  return entry.tone;
}

// The tick the Technical audit entry shows when nothing critical or high is open.
export const TICK = '\u2713';

export function countTitle(entry, value, counts = null) {
  if (!entry?.count) return '';
  if (entry.count === 'auditScore') {
    return isNum(value) ? `Audit score: ${value} out of 100` : 'No technical audit has run yet.';
  }
  if (entry.count === 'auditToFix') {
    if (!isNum(value)) return 'No technical audit has run yet.';
    const open = isNum(counts?.auditOpen) ? Number(counts.auditOpen) : null;
    const rest = open === null ? 0 : open - Number(value);
    const lower =
      rest > 0 ? ` ${countText(rest)} lower priority ${rest === 1 ? 'issue is' : 'issues are'} on the page.` : '';
    return Number(value) > 0
      ? `${countText(value)} critical or high ${Number(value) === 1 ? 'issue' : 'issues'} to fix.${lower}`
      : `Nothing critical or high to fix.${lower}`;
  }
  if (!isNum(value)) return `Not counted yet: ${NEEDS[entry.count] ?? 'its source'} has not been pulled on this Mac.`;
  const [one, many] = entry.unit ?? ['item', 'items'];
  return `${countText(value)} ${Number(value) === 1 ? one : many}`;
}

// What a count slot shows, from the whole counts object of GET /api/nav:
//   counts not loaded yet (null)       nothing at all
//   the key is not in the reply        a dash, "Not available yet."
//   the value is null (never pulled)   a dash, which source has not been pulled
//   a number                           the number, and what it counts
// `label` is the same sentence for screen readers (the visible number is hidden from them).
export const NOT_AVAILABLE = 'Not available yet.';

export function countView(entry, counts) {
  const none = { text: '', title: '', tone: '', label: '' };
  if (!entry?.count || !counts) return none;
  if (!Object.hasOwn(counts, entry.count)) return { text: DASH, title: NOT_AVAILABLE, tone: '', label: NOT_AVAILABLE };
  const value = counts[entry.count];
  const title = countTitle(entry, value, counts);
  // The audit shows "2 to fix", or a tick when nothing critical or high is open.
  const text =
    entry.count === 'auditToFix' && isNum(value)
      ? Number(value) > 0
        ? `${countText(value)} to fix`
        : TICK
      : countText(value);
  return { text, title, tone: countTone(entry, value), label: title };
}

// ------------------------------------------------------------------ the DOM part

// The Ask link and the compact ask field above the groups. `onAsk(question)` is called with the
// trimmed question when the field is sent (the shell opens #/ask with it).
export function askBlock(h, onAsk = () => {}) {
  const field = h('input', {
    class: 'input side-ask-input',
    type: 'text',
    id: 'side-ask',
    placeholder: 'Ask a question',
    maxlength: 500,
    autocomplete: 'off',
    'aria-label': 'Ask about your search data',
  });
  return h(
    'div',
    { class: 'nav-group nav-ask' },
    h(
      'a',
      {
        class: 'nav-link',
        href: `#/${ASK_ENTRY.route}`,
        dataset: { route: ASK_ENTRY.route },
        title: ASK_ENTRY.explain,
      },
      h('span', { class: 'nav-text' }, ASK_ENTRY.label)
    ),
    h(
      'form',
      {
        class: 'side-ask',
        role: 'search',
        'aria-label': 'Ask a question',
        onsubmit: (e) => {
          e.preventDefault();
          const q = field.value.trim();
          if (!q) return field.focus();
          field.value = '';
          onAsk(q);
        },
      },
      field,
      h('button', { type: 'submit', class: 'btn btn-small side-ask-go' }, 'Ask')
    )
  );
}

// Builds the <nav> contents: the Ask block, then one block per group, a link per entry with its
// count. `h` is the shell's element helper, passed in so this module needs no DOM under node.
export function buildNav(h, counts = null, { onAsk } = {}) {
  return [askBlock(h, onAsk), ...buildGroups(h, counts)];
}

function buildGroups(h, counts) {
  return NAV.map((g) => {
    const id = `nav-${g.group.toLowerCase().replace(/\W+/g, '-')}`;
    return h(
      'div',
      { class: 'nav-group' },
      h('p', { class: 'nav-label', id }, g.group),
      h(
        'ul',
        { class: 'nav-list', 'aria-labelledby': id },
        g.items.map((e) =>
          h(
            'li',
            {},
            h(
              'a',
              { class: 'nav-link', href: `#/${e.route}`, dataset: { route: e.route }, title: e.explain },
              h('span', { class: 'nav-text' }, e.label),
              e.count ? countSlot(h, e, counts) : null
            )
          )
        )
      )
    );
  });
}

// The count beside a link: the visible number (hidden from screen readers) and the same fact in
// words, visually hidden, so it is part of the link's name.
function countSlot(h, entry, counts) {
  const v = countView(entry, counts);
  return h(
    'span',
    { class: 'nav-count-slot', dataset: { count: entry.count } },
    h('span', { class: badgeClass(v), 'aria-hidden': 'true', title: v.title || null, hidden: !v.text }, v.text),
    h('span', { class: 'sr-only' }, v.label ? `, ${v.label}` : '')
  );
}

const badgeClass = (v) => `nav-count${v.tone ? ` is-${v.tone}` : ''}`;

// The row of quick links at the top of each insight page, so moving between insights is one click.
export const INSIGHT_LINKS = ['decay', 'cannibalization', 'runner-up', 'secondary-keywords', 'links', 'content-gaps'];

// The quick links row: the current insight is marked, each link shows its count from /api/nav.
// `counts` may be null (not loaded yet): the row then shows the links without numbers.
export function insightLinks(h, current, counts = null) {
  return h(
    'nav',
    { class: 'insight-links', 'aria-label': 'Insights' },
    INSIGHT_LINKS.map((route) => {
      const e = entryFor(route);
      return h(
        'a',
        {
          class: 'insight-link',
          href: `#/${route}`,
          'aria-current': route === current ? 'page' : null,
          title: e.explain,
        },
        e.label,
        countSlot(h, e, counts)
      );
    })
  );
}

// Updates the counts in a nav already on the page, without rebuilding the links.
export function updateCounts(navEl, counts) {
  for (const slot of navEl.querySelectorAll('.nav-count-slot')) {
    const entry = NAV_ENTRIES.find((e) => e.count === slot.dataset.count);
    const v = countView(entry, counts);
    const [badge, words] = slot.children;
    badge.textContent = v.text;
    badge.hidden = !v.text;
    badge.className = badgeClass(v);
    if (v.title) badge.title = v.title;
    else badge.removeAttribute('title');
    words.textContent = v.label ? `, ${v.label}` : '';
  }
}
