// Internal links: pages that would gain from more links (runner-up searches or too few links in),
// each with how many pages link to it now and the sentences already on the site that could carry
// the link. The list itself is views/links.js (also used on All
// opportunities); this page gives it its own place in the sidebar, under the insight links row.

import { insightLinks, entryFor, countText } from './nav.js';
import { linksPanel } from './links.js';

export async function render(el, ctx) {
  const { h, fmt } = ctx;
  const [data, nav] = await Promise.all([
    ctx.api.get('/api/link-suggestions'),
    ctx.api.get('/api/nav').catch(() => null),
  ]);
  ctx.envelope(nav ?? data);
  const entry = entryFor('links');
  const pages = data.pages ?? [];
  // Every page on the list with how many pages link to it now (the server's sentence). The tile opens it.
  const pageList = pages.length
    ? h(
        'details',
        { class: 'section ins-fold' },
        h('summary', {}, `Pages that would gain from more links (${pages.length})`),
        h(
          'p',
          { class: 'small muted', style: { margin: '6px 0 10px' } },
          'Pages with runner-up searches or too few links in. More links from related pages may help them; how many link to each now is below.'
        ),
        h(
          'ul',
          { class: 'side-list' },
          pages.map((p) =>
            h(
              'li',
              {},
              h('a', { href: `#/pages?page=${encodeURIComponent(p.page)}`, class: 'p2-path' }, p.page),
              h('div', { class: 'small muted' }, p.linkedFromText ?? '')
            )
          )
        )
      )
    : null;
  const openList = () => {
    if (!pageList) return;
    pageList.open = true;
    pageList.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  ctx.mount(
    el,
    insightLinks(h, 'links', nav?.counts ?? {}),
    h(
      'div',
      { class: 'page-head' },
      h('div', {}, h('h1', { class: 'page-title' }, entry.label), h('p', { class: 'page-sub' }, entry.explain))
    ),
    // The first number is the sidebar's: the suggestions still to do, as the server counts them.
    h(
      'div',
      { class: 'tiles ins-tiles', 'aria-label': 'Counts' },
      h(
        'div',
        { class: 'tile' },
        h('span', { class: 'tile-label' }, 'Links to add'),
        h('span', { class: 'tile-value' }, countText(data.open)),
        h('div', { class: 'tile-change' }, 'sentences already on the site, below')
      ),
      h(
        'button',
        {
          type: 'button',
          class: 'tile lk-tile',
          title: 'Open the list of these pages, with how many pages link to each now',
          onclick: openList,
        },
        h('span', { class: 'tile-label' }, 'Pages that would gain from more links'),
        h('span', { class: 'tile-value' }, fmt.num(pages.length)),
        h('div', { class: 'tile-change' }, 'with how many pages link to each now')
      )
    ),
    h('div', { class: 'ins-first' }, linksPanel(ctx, data)),
    pageList
  );
}
