// The side drawer, and the evidence drawer behind "Why this rank".
//
//   openDrawer(node, {title})  shows node in a panel on the right; Esc, the close button
//                              or a click outside closes it; focus returns to the opener
//   closeDrawer()
//   isDrawerOpen()
//   evidenceView(opp, fmt)     the score parts, the rows behind them and the dates, as a node

import { h, fmt as appFmt, api, toast, copyText } from '../app.js';
import { drawerBlock } from './links.js';

let current = null;

export function isDrawerOpen() {
  return current !== null;
}

export function closeDrawer() {
  if (!current) return;
  const { root, opener } = current;
  current = null;
  root.remove();
  document.body.style.overflow = '';
  if (opener && document.contains(opener)) opener.focus();
}

export function openDrawer(node, { title = '' } = {}) {
  closeDrawer();
  const opener = document.activeElement;
  const close = h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Close', onclick: closeDrawer }, '×');
  const panel = h(
    'aside',
    { class: 'drawer', role: 'dialog', 'aria-modal': 'true', 'aria-label': title || 'Details' },
    h('div', { class: 'drawer-head' }, h('h2', { class: 'drawer-title' }, title), close),
    h('div', { class: 'drawer-body' }, node)
  );
  const backdrop = h('div', { class: 'drawer-backdrop', onclick: closeDrawer });
  const root = h('div', {}, backdrop, panel);
  // Keep Tab inside the drawer while it is open.
  panel.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusables = [...panel.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"]')].filter(
      (el) => !el.disabled && el.offsetParent !== null
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
  document.body.append(root);
  document.body.style.overflow = 'hidden';
  current = { root, opener };
  close.focus();
  return closeDrawer;
}

// ------------------------------------------------------------------ evidence

const SIGNAL_NAMES = {
  demand: 'How many people see it',
  distance: 'Room to improve',
  importance: 'How much the page matters',
  confidence: 'How much data backs it',
  effort: 'How cheap the fix is',
  ai: 'Value for AI answers',
  outcome: 'Interest from visitors',
};

const FIELD_NAMES = {
  query: 'Search',
  page: 'Page',
  url: 'Page',
  clicks: 'Clicks',
  impressions: 'Times shown',
  position: 'Average place',
  bestPosition: 'Best place',
  ctr: 'Click rate',
  share: 'Share',
  keyword: 'Target keyword',
  topPage: 'Page that ranks',
  status: 'Status',
  verdict: 'Verdict',
  inbound: 'Links in',
  inboundPages: 'Pages linking in',
  pages: 'Pages',
  lastCrawl: 'Last crawled by Google',
  reason: 'Reason',
  dropType: 'Kind of drop',
  posDelta: 'Change in average place',
  impPct: 'Change in times shown',
  relImpPct: 'Change against the typical page',
  prev: 'Before',
  cur: 'After',
  platform: 'AI assistant',
  cited: 'Names us',
  rank: 'Place in the answer',
  sources: 'Sources it cited',
  competitors: 'Competitors it cited',
  date: 'Date',
  lastmod: 'Last changed',
};

// A key the list above does not know, in plain words: 'bestPosition' becomes 'Best position'.
function fieldName(key) {
  if (FIELD_NAMES[key]) return FIELD_NAMES[key];
  const words = String(key)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function fieldValue(key, v, fmt) {
  if (v === null || v === undefined) return 'none';
  if (typeof v === 'boolean') return v ? 'yes' : 'no';
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}(T|$)/.test(v)) return fmt.date(v.slice(0, 10));
  // Codes such as 'lost-rankings' read as words; search phrases and paths have spaces or slashes.
  if (typeof v === 'string' && !['query', 'keyword'].includes(key) && /^[a-z]+(-[a-z]+)+$/.test(v)) {
    return v.replace(/-/g, ' ');
  }
  if (typeof v === 'number') {
    if (key === 'ctr' || key === 'share' || /Pct$/.test(key)) return fmt.share(v);
    if (/position/i.test(key)) return fmt.position(v);
    return fmt.num(v, { digits: 2 });
  }
  if (Array.isArray(v)) {
    if (!v.length) return 'none';
    if (typeof v[0] === 'object') return `${v.length} rows`;
    return v.join(', ');
  }
  if (typeof v === 'object') {
    return Object.entries(v)
      .filter(([, x]) => typeof x !== 'object')
      .map(([k, x]) => `${fieldName(k)} ${fieldValue(k, x, fmt)}`)
      .join(', ');
  }
  return String(v);
}

// One evidence row as a small key and value list. Search phrases are shown as they are.
function evidenceRow(row, fmt) {
  const entries = Object.entries(row ?? {});
  return h(
    'div',
    { class: 'evidence-row' },
    h(
      'dl',
      { class: 'kv' },
      entries.flatMap(([k, v]) => {
        const nested = Array.isArray(v) && v.length && typeof v[0] === 'object';
        return [
          h('dt', {}, fieldName(k)),
          h(
            'dd',
            {},
            nested
              ? h(
                  'ul',
                  { class: 'plain-list small' },
                  v.slice(0, 8).map((x) => h('li', {}, fieldValue('', x, fmt)))
                )
              : fieldValue(k, v, fmt)
          ),
        ];
      })
    )
  );
}

// opp: an Opp from the API (score may be null when the rules no longer find it).
export function evidenceView(opp, fmt = appFmt) {
  const parts = opp.score?.parts ?? [];
  return h(
    'div',
    {},
    h('p', { class: 'card-title' }, opp.title),
    opp.range
      ? h('p', { class: 'muted small', style: { marginTop: '4px' } }, `Numbers cover ${fmt.range(opp.range)}.`)
      : null,
    opp.score
      ? h(
          'div',
          { class: 'section' },
          h(
            'div',
            { class: 'section-head' },
            h('h3', { class: 'section-title' }, 'Why this rank'),
            h(
              'span',
              { class: 'num' },
              h('b', { style: { fontSize: '28px' } }, fmt.num(opp.score.total, { digits: 1 })),
              ' of 100'
            )
          ),
          h(
            'p',
            { class: 'muted small' },
            `The score adds up ${parts.length || 'its'} signals. Each signal is worth up to its weight. A signal with too little data adds nothing.`
          ),
          h(
            'ol',
            { class: 'score-parts', style: { marginTop: '10px' } },
            parts.map((p) =>
              h(
                'li',
                {},
                h(
                  'div',
                  { class: 'share-head' },
                  h('strong', {}, SIGNAL_NAMES[p.signal] ?? p.signal),
                  h(
                    'span',
                    { class: 'num' },
                    p.value === null
                      ? 'no data, adds 0'
                      : `${fmt.num(p.points, { digits: 1 })} of ${fmt.num(p.weight * 100)} points`
                  )
                ),
                h(
                  'div',
                  { class: 'bar', role: 'presentation' },
                  h('span', { style: { width: `${Math.max(0, Math.min(1, p.value ?? 0)) * 100}%` } })
                ),
                h('p', { class: 'muted small', style: { marginTop: '4px' } }, p.why)
              )
            )
          )
        )
      : h(
          'p',
          { class: 'banner', style: { marginTop: '16px' } },
          'This item has no score now. The desk no longer finds the problem in the latest data, and keeps it so its status and notes stay on record.'
        ),
    opp.evidence?.length
      ? h(
          'div',
          { class: 'section' },
          h('h3', { class: 'section-title', style: { marginBottom: '10px' } }, 'The rows behind it'),
          opp.evidence.slice(0, 12).map((row) => evidenceRow(row, fmt)),
          opp.evidence.length > 12
            ? h(
                'p',
                { class: 'muted small', style: { marginTop: '8px' } },
                `And ${opp.evidence.length - 12} more rows.`
              )
            : null
        )
      : null,
    opp.touchedOn?.length
      ? h(
          'div',
          { class: 'section' },
          h('h3', { class: 'section-title', style: { marginBottom: '6px' } }, 'Also touched on'),
          h(
            'p',
            { class: 'muted' },
            'Routine commits changed this page on these days. They do not freeze it, but a verdict that overlaps them is less clear: ',
            opp.touchedOn
              .slice(-8)
              .map((d) => fmt.date(d))
              .join(', '),
            '.'
          )
        )
      : null,
    // Pages that could link to this one; the block stays empty when there are none.
    opp.page ? drawerBlock({ h, fmt, api, toast, copyText }, opp.page) : null
  );
}
