// Internal links: pages that few of the site's other pages link to, each with sentences already
// on the site that could carry the link. The list itself is views/links.js (also used on All
// opportunities); this page gives it its own place in the sidebar, under the insight links row.

import { insightLinks, entryFor, countText } from './nav.js';
import { linksPanel } from './links.js';

export async function render(el, ctx) {
  const { h } = ctx;
  const [data, nav] = await Promise.all([
    ctx.api.get('/api/link-suggestions'),
    ctx.api.get('/api/nav').catch(() => null),
  ]);
  ctx.envelope(nav ?? data);
  const entry = entryFor('links');
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
        'a',
        {
          class: 'tile lk-tile',
          href: '#/opportunities?type=needs-links',
          title: 'See these pages in All opportunities',
        },
        h('span', { class: 'tile-label' }, 'Pages that could use links'),
        h('span', { class: 'tile-value' }, countText((data.pages ?? []).length)),
        h('div', { class: 'tile-change' }, 'listed below, with or without a suggestion')
      )
    ),
    h('div', { class: 'ins-first' }, linksPanel(ctx, data))
  );
}
