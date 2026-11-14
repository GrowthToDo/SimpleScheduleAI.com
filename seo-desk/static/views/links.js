// Internal link suggestions: pages on the site that already say a page's keyword in plain text,
// where that text could become a link to the page. Shown as the "Internal links" tab on
// Opportunities and inside an opportunity's "Why this rank" drawer.
//
//   linksPanel(ctx, data)              the whole tab from GET /api/link-suggestions
//   suggestionList(ctx, page, opts)    one page's suggestions, with Done, Dismiss and Copy
//   suggestionText(s)                  "Link from /a to /b using the words 'x'"
//   briefFor(s, keyword)               the instruction "Copy as a brief for Claude" copies
//
// This module imports nothing from the browser at load time, so its pure parts run in node tests.
// Every page path, anchor and sentence is data and goes in as text.

export const suggestionText = (s) => `Link from ${s.from} to ${s.to} using the words '${s.anchor}'`;

// The warning when the page the link goes on is being measured (frozen by a deliberate edit), or
// null. The date comes from the server's lifecycle rule.
export const frozenWarning = (s) =>
  s?.fromFrozenUntilText
    ? `This page is being measured until ${s.fromFrozenUntilText}. Adding the link now will blur that verdict; wait if you can.`
    : null;

export const frozenChipText = (s) => (s?.fromFrozenUntilText ? `Frozen until ${s.fromFrozenUntilText}` : null);

// A ready instruction for Claude: both pages, the exact words, the sentence, and the freeze
// warning when the page to edit is being measured.
export function briefFor(s, keyword = null) {
  const warning = frozenWarning(s);
  return [
    'Add one internal link in the SimpleScheduleAI website repo.',
    '',
    `Page to edit: ${s.from} (find its source file under src/)`,
    `Link to: ${s.to}`,
    `Words to turn into the link: "${s.anchor}"`,
    `The sentence they are in: "${s.context}"`,
    keyword ? `Search it may help with: ${keyword}` : null,
    warning ? '' : null,
    warning,
    '',
    `Turn exactly those words into a link to ${s.to}. Change nothing else on the page: same words, same order, no new sentences.`,
    'Run npx prettier --write on the changed file only, then show me the diff before committing.',
  ]
    .filter((line) => line !== null)
    .join('\n');
}

// The number of suggestions still to do, across every page of the reply. The server sends the same
// number as `open` (the sidebar's count); this is the fallback for an older reply.
export const openCount = (pages) =>
  (pages ?? []).reduce((n, p) => n + p.suggestions.filter((s) => s.status !== 'done').length, 0);

// ------------------------------------------------------------------ one suggestion

function suggestionRow(ctx, s, keyword, onChange, reasons = []) {
  const { h, api, toast, copyText } = ctx;
  const done = s.status === 'done';
  const mark = async (status, message) => {
    try {
      await api.post('/api/link-suggestions', { to: s.to, from: s.from, status });
      toast(message, 'success');
      await onChange();
    } catch (e) {
      toast(e.message, 'error');
    }
  };
  const copy = async () => {
    const ok = await copyText(briefFor(s, keyword));
    toast(
      ok
        ? 'Brief copied. Paste it into Claude to add the link.'
        : 'The browser blocked copying. Click the page once, then try again.',
      ok ? 'success' : 'error'
    );
  };
  // A page shows as its title (from the post file) with the path under it, or as the path alone.
  const pageLink = (p, title) =>
    title
      ? h(
          'span',
          {},
          h('a', { href: `#/pages?page=${encodeURIComponent(p)}` }, title),
          h('span', { class: 'lk-path' }, p)
        )
      : h('a', { href: `#/pages?page=${encodeURIComponent(p)}`, class: 'p2-path' }, p);
  return h(
    'li',
    { class: `card lk-card${done ? ' is-done' : ''}`, 'aria-label': suggestionText(s) },
    h(
      'div',
      { class: 'card-top' },
      reasons.map((r) => h('span', { class: 'chip chip-accent' }, r)),
      done ? h('span', { class: 'chip chip-accent' }, 'Done') : null,
      frozenChipText(s)
        ? h(
            'span',
            { class: 'chip chip-hyp', title: `${s.from} was changed on purpose and is being measured` },
            frozenChipText(s)
          )
        : null
    ),
    h('p', { class: 'lk-lead' }, h('span', { class: 'lk-verb' }, 'Strengthen'), ' ', pageLink(s.to, s.toTitle)),
    h(
      'dl',
      { class: 'lk-facts' },
      h('dt', {}, 'From'),
      h('dd', {}, pageLink(s.from, s.fromTitle)),
      h('dt', {}, 'Anchor'),
      h('dd', {}, h('code', { class: 'lk-anchor' }, s.anchor))
    ),
    s.context ? h('blockquote', { class: 'p2-quote' }, `"${s.context}"`) : null,
    keyword ? h('p', { class: 'small muted lk-why' }, `The words come from the search "${keyword}".`) : null,
    frozenWarning(s) && !done ? h('p', { class: 'small p2-edit-line' }, frozenWarning(s)) : null,
    h(
      'div',
      { class: 'row p2-sugg-actions' },
      done
        ? h(
            'button',
            {
              type: 'button',
              class: 'btn btn-small btn-quiet',
              onclick: () => mark('open', 'Marked as not done yet.'),
            },
            'Undo done'
          )
        : h(
            'button',
            {
              type: 'button',
              class: 'btn btn-small btn-primary',
              title: 'You added this link on the live site',
              onclick: () => mark('done', 'Marked done.'),
            },
            'Done'
          ),
      done
        ? null
        : h(
            'button',
            {
              type: 'button',
              class: 'btn btn-small',
              title: 'Hide this suggestion for good',
              onclick: () => mark('dismissed', 'Dismissed. It will not be suggested again.'),
            },
            'Dismiss'
          ),
      done
        ? null
        : h('button', { type: 'button', class: 'btn btn-small btn-quiet', onclick: copy }, 'Copy brief for Claude')
    )
  );
}

// One page's suggestions as a list, or null when it has none. opts.onChange runs after a mark.
export function suggestionList(ctx, page, { onChange, showReasons = false }) {
  const { h } = ctx;
  if (!page?.suggestions?.length) return null;
  return h(
    'ul',
    { class: 'p2-suggs lk-list' },
    page.suggestions.map((s) => suggestionRow(ctx, s, page.keyword, onChange, showReasons ? page.reasons : []))
  );
}

// The search the words come from and how many were dismissed, under a page's heading.
function pageNote(ctx, p) {
  const { h, fmt } = ctx;
  return h(
    'p',
    { class: 'small muted', style: { margin: '2px 0 8px' } },
    p.keyword ? `The words come from the search "${p.keyword}". ` : '',
    p.dismissed
      ? `${fmt.plural(p.dismissed, 'suggestion was dismissed and is hidden', 'suggestions were dismissed and are hidden')}.`
      : ''
  );
}

// ------------------------------------------------------------------ the drawer block

// The block inside an opportunity's drawer. Fills itself in when the page has suggestions and
// stays empty otherwise.
export function drawerBlock(ctx, page) {
  const { h, api } = ctx;
  const box = h('div', {});
  const draw = async () => {
    let data;
    try {
      data = await api.get(`/api/link-suggestions?page=${encodeURIComponent(page)}`);
    } catch {
      box.replaceChildren();
      return;
    }
    const p = data.pages?.[0];
    const list = suggestionList(ctx, p, { onChange: draw });
    if (!list) {
      box.replaceChildren();
      return;
    }
    box.replaceChildren(
      h(
        'div',
        { class: 'section' },
        h('h3', { class: 'section-title', style: { marginBottom: '4px' } }, 'Pages that could link here'),
        pageNote(ctx, p),
        list
      )
    );
  };
  draw();
  return box;
}

// ------------------------------------------------------------------ the tab

export function linksPanel(ctx, data) {
  const { h, fmt } = ctx;
  const pages = data?.pages ?? [];
  const withSuggestions = pages.filter((p) => p.suggestions.length);
  const without = pages.filter((p) => !p.suggestions.length);
  const left = data?.open ?? openCount(pages);

  const intro = h(
    'p',
    { class: 'banner banner-accent' },
    'These pages could use more links from the rest of the site. Each suggestion is a sentence already on one of our live pages that says the right words. The link goes on that other page, so a page that is being measured is marked and listed last.'
  );

  if (!pages.length) {
    return h(
      'div',
      { class: 'stack' },
      intro,
      h(
        'p',
        { class: 'empty' },
        data?.empty
          ? 'No search data has been pulled yet. Press Refresh now at the top.'
          : 'No page needs links right now. Pages show here when they have runner-up keywords or too few links in.'
      )
    );
  }

  return h(
    'div',
    { class: 'stack' },
    intro,
    h(
      'div',
      { class: 'toolbar' },
      h(
        'p',
        { class: 'grow', style: { margin: 0 } },
        h('strong', {}, fmt.plural(left, 'link', 'links')),
        ` to add across ${fmt.plural(withSuggestions.length, 'page', 'pages')}.`,
        without.length ? ` ${fmt.plural(without.length, 'other page has', 'other pages have')} no suggestion yet.` : ''
      ),
      h('a', { class: 'btn', href: '/api/export/link-suggestions.csv', download: '' }, 'Download CSV')
    ),
    withSuggestions.map((p) => suggestionList(ctx, p, { onChange: () => ctx.reload(), showReasons: true })),
    without.length
      ? h(
          'details',
          { class: 'p2-fold' },
          h('summary', {}, `Pages with no suggestion yet (${without.length})`),
          h(
            'p',
            { class: 'small muted' },
            'No live page says their search words in plain text yet. A new post or a rewrite that mentions them would give a place to link from.'
          ),
          h(
            'ul',
            { class: 'side-list' },
            without.map((p) =>
              h(
                'li',
                {},
                h('a', { href: `#/pages?page=${encodeURIComponent(p.page)}`, class: 'p2-path' }, p.page),
                p.keyword ? h('div', { class: 'small muted' }, `Search: "${p.keyword}"`) : null
              )
            )
          )
        )
      : null
  );
}
