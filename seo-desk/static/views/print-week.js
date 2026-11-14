// The week's plan as a clean page to print or save as a PDF (#/print/week). The priorities with
// the evidence, the recommendation and the test for each, the worries, the pages to leave alone
// this week and what is waiting. "Save as PDF" opens the browser's print dialog, where Save as PDF
// is one of the printers. The print styles in app.css hide the sidebar, the top bar and the
// buttons, and print black on white from either theme.
//
// cardLines(card) and planHeading(week) import nothing from the browser, so node tests run them.
// Every title and sentence from the server is data and goes in as text.

const STANDING = 'Search numbers show findability and credibility. They are not sales.';

// The three lines of a week card, a worry or an opportunity, whatever its shape.
export function cardLines(card) {
  return {
    evidence: card?.measured ?? null,
    recommendation: card?.action ?? card?.fix ?? null,
    test: card?.test ?? null,
  };
}

// A recommendation is a hypothesis unless the card says it is not (a competitor change is only
// something to read).
export const isHypothesis = (card) => card?.hypothesis !== false && !card?.competitor;

// The browser tab's title for this page (app.js reads it; the page is not in the sidebar).
export const PRINT_TITLE = "This week's plan";

// The heading lines. The range is built the way This week builds it: the server's text, else the
// start and end dates (rangeText is fmt.range in the page; a plain fallback in node).
const plainRange = (r) => r?.text ?? (r?.start && r?.end ? `${r.start} to ${r.end}` : null);

export function planHeading(week, { rangeText = plainRange } = {}) {
  const text = week.range ? rangeText(week.range) : null;
  return {
    title: `SEO plan: ${week.weekLabel}`,
    range: text ? `Numbers cover ${text}.` : null,
    through: week.through ?? null,
  };
}

const STATUS_WORD = {
  'in-progress': 'In progress',
  done: 'Done',
  snoozed: 'Snoozed',
  ignored: 'Ignored',
  'came-back': 'Came back',
};

export async function render(el, ctx) {
  const { api, h, fmt } = ctx;
  const week = await api.get('/api/week');
  ctx.envelope(week);
  const head = planHeading(week, { rangeText: fmt.range });

  const lines = (card) => {
    const l = cardLines(card);
    return h(
      'dl',
      { class: 'pw-facts' },
      l.evidence ? [h('dt', {}, 'Evidence'), h('dd', {}, l.evidence)] : null,
      l.recommendation
        ? [
            h('dt', {}, 'Recommendation'),
            h(
              'dd',
              {},
              l.recommendation,
              isHypothesis(card) ? h('span', { class: 'pw-hyp' }, ' (a hypothesis)') : null
            ),
          ]
        : null,
      l.test ? [h('dt', {}, 'How we will know'), h('dd', {}, l.test)] : null
    );
  };

  const priorities = h(
    'ol',
    { class: 'pw-list' },
    week.top5.map((c) =>
      h(
        'li',
        { class: 'pw-item' },
        h(
          'p',
          { class: 'pw-meta' },
          [c.typeLabel ?? c.term, c.page, STATUS_WORD[c.state?.status]].filter(Boolean).join(', ')
        ),
        h('h3', { class: 'pw-title' }, c.title),
        lines(c)
      )
    )
  );

  const section = (title, body, note = null) =>
    h(
      'section',
      { class: 'pw-section' },
      h('h2', { class: 'pw-h2' }, title),
      note ? h('p', { class: 'pw-note' }, note) : null,
      body
    );

  ctx.mount(
    el,
    h(
      'div',
      { class: 'pw-tools' },
      h('a', { class: 'btn', href: '#/week' }, 'Back to This week'),
      h('button', { type: 'button', class: 'btn btn-primary', onclick: () => window.print() }, 'Save as PDF'),
      h(
        'span',
        { class: 'small muted' },
        'In the print box, pick Save as PDF as the printer. It prints black on white whichever theme you use.'
      )
    ),
    h(
      'article',
      { class: 'pw-sheet' },
      h(
        'header',
        { class: 'pw-head' },
        h('h1', { class: 'pw-h1' }, head.title),
        h(
          'p',
          { class: 'pw-sub' },
          [head.range, head.through ? `Data through ${fmt.date(head.through)}.` : 'No data pulled yet.']
            .filter(Boolean)
            .join(' ')
        ),
        h('p', { class: 'pw-sub' }, STANDING)
      ),
      section(
        `This week's ${week.top5.length === 1 ? 'priority' : `${week.top5.length} priorities`}`,
        week.top5.length ? priorities : h('p', {}, 'Nothing proposed yet.'),
        week.locked ? 'The plan is locked.' : 'The desk proposed these. The plan is not locked yet.'
      ),
      section(
        'Worries',
        week.worries.length
          ? h(
              'ul',
              { class: 'pw-list pw-plain' },
              week.worries.map((w) => h('li', { class: 'pw-item' }, h('h3', { class: 'pw-title' }, w.title), lines(w)))
            )
          : h('p', {}, 'Nothing has broken or got worse.')
      ),
      section(
        'Leave these alone this week',
        week.leaveAlone?.length
          ? h(
              'ul',
              { class: 'pw-list pw-plain pw-compact' },
              week.leaveAlone.map((x) =>
                h('li', { class: 'pw-item' }, h('strong', {}, x.page), h('span', {}, ` ${x.reason}`))
              )
            )
          : h('p', {}, 'No page needs leaving alone.')
      ),
      section(
        'Waiting',
        week.waiting.length
          ? h(
              'ul',
              { class: 'pw-list pw-plain pw-compact' },
              week.waiting.map((w) => h('li', { class: 'pw-item' }, h('strong', {}, `${w.dateText}: `), w.title))
            )
          : h('p', {}, 'No verdicts or frozen pages are waiting.'),
        'Nothing to do here. Shown so you know it is handled.'
      )
    )
  );
}
