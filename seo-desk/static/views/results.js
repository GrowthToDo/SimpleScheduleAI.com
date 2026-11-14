// Did it work? Were past changes better, worse, or is it too early? Verdicts with before,
// after and a typical page on the site beside each one, what is ready to judge, what is still waiting,
// frozen pages, Judge now (preview first, then the real run), "I edited a page", and the
// timeline with the founder's own annotations.

import { lineChart } from '../chart.js';
import { jobBlock } from './jobs.js';
import { markerLabel, markerText } from './markers.js';
import { confirmSecondEdit } from './card.js';

// The status of a lesson in words: Trial (still being tried), Proven, Dropped.
const LESSON_WORD = { trial: 'Trial', proven: 'Proven', dropped: 'Dropped' };
export const lessonWord = (status) => LESSON_WORD[status] ?? status;
const LESSON_CHIP = { trial: 'chip-hyp', proven: 'chip-accent', dropped: '' };

const VERDICT_CHIP = {
  better: 'chip-accent',
  worse: 'chip-bad',
  mixed: 'chip-warn',
};

// The quiet line under a verdict whose dates hold a Google ranking update. It names the update
// and its start day and never says the update caused the move. dateText turns 'YYYY-MM-DD' into words.
export function careLine(nearUpdates, dateText) {
  const list = (nearUpdates ?? []).filter((u) => u?.label);
  if (!list.length) return null;
  const names = list.map((u) => `${u.label} (from ${dateText(u.date)})`);
  const joined = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0];
  return `Google's ${joined} fell inside these dates, so read this verdict with care.`;
}

// "24 September to 8 October", "from 10 November, still rolling out", or one day.
export function spanText(date, endDate, dateText, { open = false } = {}) {
  if (endDate && endDate !== date) return `${dateText(date)} to ${dateText(endDate)}`;
  if (!endDate && open) return `from ${dateText(date)}, still rolling out`;
  return dateText(date);
}

const DEFAULT_CATEGORIES = [
  { key: 'content', label: 'Content change' },
  { key: 'technical', label: 'Technical change' },
  { key: 'links', label: 'Links' },
  { key: 'promotion', label: 'Promotion or outreach' },
  { key: 'google', label: 'Google update' },
  { key: 'other', label: 'Something else' },
];

// The archived notes list stays open across a redraw once opened.
let archivedOpen = false;

const PENDING_SHOWN = 8;
const TIMELINE_SHOWN = 15;

export async function render(el, ctx) {
  const { api, h, fmt } = ctx;
  const [data, chartData, jobs, lessons] = await Promise.all([
    api.get('/api/results'),
    api.get('/api/search?range=90&metric=impressions').catch(() => null),
    api.get('/api/jobs'),
    // A failing lessons reply costs only that section.
    api.get('/api/lessons').catch(() => null),
  ]);
  ctx.envelope(data);
  if (lessons?.provenWhen) provenWhen = lessons.provenWhen;
  const judge = judgeBlocks(data, jobs, ctx);

  const frozenSince = new Map(data.frozen.map((f) => [f.page, f.since]));
  const pendingGroups = foldChanges(data.pending, frozenSince);
  const dueGroups = foldChanges(data.due, frozenSince);
  const verdicts = [
    ...data.verdicts.map((v) => ({ ...v, money: false })),
    ...data.moneyPageVerdicts.map((v) => ({
      ...v,
      id: `money:${v.page}|${v.changeDate}`,
      verdict: v.status === 'too-early' ? 'too-early' : v.verdict,
      batch: false,
      pages: [],
      money: true,
    })),
  ].sort((a, b) => b.changeDate.localeCompare(a.changeDate));

  const count = (k) => verdicts.filter((v) => v.verdict === k).length;
  const splitLine = [
    ['better', 'better'],
    ['worse', 'worse'],
    ['mixed', 'mixed'],
    ['flat', 'no real change'],
    ['insufficient-data', 'too small to tell'],
    ['too-early', 'too early'],
  ]
    .filter(([k]) => count(k))
    .map(([k, word]) => `${count(k)} ${word}`)
    .join(', ');

  ctx.mount(
    el,
    head(data, ctx, judge),
    judge.panels,
    data.empty
      ? h('p', { class: 'banner banner-warn' }, 'No data has been pulled yet. Press Refresh now at the top.')
      : null,
    data.warnings?.length ? h('p', { class: 'banner banner-warn' }, data.warnings.join(' ')) : null,
    h(
      'section',
      { class: 'section', 'aria-label': 'Verdicts in numbers' },
      h(
        'div',
        { class: 'tiles' },
        tile(h, 'Verdicts so far', fmt.num(verdicts.length), splitLine || 'none yet'),
        tile(
          h,
          'Ready to judge',
          fmt.num(dueGroups.reduce((s, g) => s + g.pages.length, 0)),
          data.due.length ? 'finished the 28 day wait. Press Judge now' : 'nothing has finished its wait'
        ),
        tile(
          h,
          'Still waiting',
          fmt.num(data.pending.length),
          pendingGroups.length
            ? `page changes, grouped into ${fmt.plural(pendingGroups.length, 'change', 'changes')}`
            : 'no change is waiting'
        ),
        tile(
          h,
          'Frozen pages',
          fmt.num(data.frozen.length),
          data.frozen.length ? 'may not be edited yet' : 'every page is free to edit'
        )
      )
    ),
    h(
      'div',
      { class: 'cols' },
      h(
        'div',
        {},
        verdictSection(verdicts, ctx, lessons),
        dueSection(dueGroups, ctx),
        pendingSection(pendingGroups, ctx)
      ),
      h('div', {}, frozenSection(data, ctx), annotationsSection(data, ctx))
    ),
    lessonsSection(lessons, data.verdicts, ctx),
    timelineSection(data, chartData, ctx)
  );
  judge.resume();
}

function tile(h, label, value, change) {
  return h(
    'div',
    { class: 'tile' },
    h('span', { class: 'tile-label' }, label),
    h('span', { class: 'tile-value' }, value),
    h('div', { class: 'tile-change' }, change)
  );
}

// Rows that share one change (same date, same commit or note) become one group. Deliberate
// edits (a note you logged, or the change that froze the page) come first.
function foldChanges(rows, frozenSince) {
  const groups = new Map();
  for (const r of rows) {
    const key = `${r.changeDate}|${r.subject}`;
    if (!groups.has(key)) groups.set(key, { ...r, pages: [] });
    groups.get(key).pages.push(r.page);
  }
  const list = [...groups.values()].map((g) => ({
    ...g,
    deliberate: g.kind === 'manual' || g.pages.some((p) => frozenSince.get(p) === g.changeDate),
  }));
  return list.sort(
    (a, b) =>
      Number(b.deliberate) - Number(a.deliberate) ||
      String(a.judgeFrom).localeCompare(String(b.judgeFrom)) ||
      a.pages.length - b.pages.length
  );
}

// ------------------------------------------------------------------ head and its buttons

function head(data, ctx, judge) {
  const { h, fmt } = ctx;
  return h(
    'div',
    { class: 'page-head' },
    h(
      'div',
      {},
      h('h1', { class: 'page-title' }, 'Did it work?'),
      h(
        'p',
        { class: 'page-sub' },
        'Each change is judged on the 28 days before it against the 28 days after, next to how a typical page on the site moved over the same dates. ',
        data.through ? `Search Console data runs through ${fmt.date(data.through)}.` : ''
      )
    ),
    h(
      'div',
      { class: 'row' },
      judge.preview.button,
      judge.showSave ? judge.save.button : null,
      h('button', { type: 'button', class: 'btn', onclick: () => editNoteForm(ctx) }, 'I edited a page')
    )
  );
}

// Judge now, through the shared job panel: a preview first (nothing saved), then, once a
// preview has finished cleanly and is newer than the last save, the button that saves.
function judgeBlocks(data, jobs, ctx) {
  const { fmt } = ctx;
  const last = (key) => jobs.jobs.find((j) => j.key === key)?.last ?? null;
  const preview = jobBlock(ctx, jobs, 'judge-preview', {
    label: 'Judge now',
    primary: true,
    confirm: {
      title: 'Preview the verdicts?',
      body: `The desk pulls fresh numbers from Search Console and works out a verdict for every change that has finished its 28 day wait (${fmt.plural(data.due.length, 'page change is', 'page changes are')} ready now).\n\nNothing is saved. It can take a minute or two.`,
      confirmLabel: 'Start the preview',
    },
  });
  const save = jobBlock(ctx, jobs, 'judge', {
    label: 'Save these verdicts',
    confirm: {
      title: 'Save these verdicts?',
      body: 'This runs the same judging again and adds the verdicts to docs/seo/change-log-verdicts.jsonl, a file tracked in git.\n\nIt costs nothing. Commit the file yourself when you are happy with it.',
      confirmLabel: 'Save the verdicts',
    },
  });
  const p = last('judge-preview');
  const saved = last('judge');
  const showSave = Boolean(p?.ok && (!saved || p.at > saved.at)) || jobs.running === 'judge';
  return {
    preview,
    save,
    showSave,
    panels: ctx.h('div', {}, preview.panel, save.panel),
    resume: () => {
      preview.resume();
      save.resume();
    },
  };
}

// "I edited a page": logs a manual edit note, which freezes the page for 28 days.
async function editNoteForm(ctx) {
  const { h, fmt, api, confirmBox, openDrawer, closeDrawer, toast } = ctx;
  let pages = [];
  try {
    pages = (await api.get('/api/pages')).items.map((p) => p.page);
  } catch {
    // The box still works; the server checks the page.
  }
  const listId = 'r9-page-list';
  const pageInput = h('input', {
    class: 'input',
    type: 'text',
    id: 'r9-edit-page',
    list: listId,
    placeholder: '/blog/the-page',
    autocomplete: 'off',
  });
  const text = h('textarea', {
    id: 'r9-edit-text',
    maxLength: 500,
    placeholder: 'For example: rewrote the title and the first paragraph',
  });
  const error = h('p', { class: 'small', style: { color: 'var(--bad)' }, hidden: true });
  const show = (msg) => {
    error.textContent = msg;
    error.hidden = false;
  };
  const save = h(
    'button',
    {
      type: 'button',
      class: 'btn btn-primary',
      onclick: async () => {
        error.hidden = true;
        const page = pageInput.value.trim();
        const note = text.value.trim().replace(/\s+/g, ' ');
        if (!page.startsWith('/')) return show('Type the page address, starting with a slash.');
        if (!note) return show('Say in a few words what you changed.');
        const until = fmt.date(fmt.isoPlus(28));
        const ok = await confirmBox({
          title: 'Log this edit?',
          body: `This adds one line to docs/seo/change-log-notes.jsonl, a file tracked in git:\nEdit: ${note}\n\n${page} is then frozen for 28 days, until about ${until}, so its before and after verdict stays clean.`,
          confirmLabel: 'Log the edit',
        });
        if (!ok) return;
        save.disabled = true;
        try {
          let res;
          try {
            res = await api.post('/api/edit-note', { page, text: note, confirm: true });
          } catch (e) {
            // A frozen page or a second edit this week: ask once per reason, then send the override.
            const f = e.status === 409 ? e.data?.frozen : null;
            const w = e.status === 409 ? e.data?.secondThisWeek : null;
            if (!f && !w) throw e;
            if (
              f &&
              !(await confirmBox({
                title: 'This page is still frozen',
                body: `${f.page} was edited on ${f.sinceText} and is frozen until ${f.untilText}.\n\nLogging this edit restarts the 28 days from today, and the verdict on the earlier edit will be muddied by this one.`,
                confirmLabel: 'Log it anyway',
                danger: true,
              }))
            ) {
              save.disabled = false;
              return;
            }
            if (
              w &&
              !(await confirmSecondEdit(confirmBox, w, { ask: 'Log this one anyway?', confirmLabel: 'Log it anyway' }))
            ) {
              save.disabled = false;
              return;
            }
            res = await api.post('/api/edit-note', { page, text: note, confirm: true, override: true });
          }
          closeDrawer();
          toast(`Logged. ${page} is frozen until ${res.frozenUntilText ?? until}.`, 'success');
          await ctx.reload();
        } catch (e) {
          show(e.message);
          save.disabled = false;
        }
      },
    },
    'Log the edit'
  );
  openDrawer(
    h(
      'div',
      { class: 'stack r9-form' },
      h(
        'p',
        { class: 'small muted' },
        'Use this when you changed a live page by hand and no card or plan row recorded it. The desk then judges the change after 28 days and keeps the page frozen until then.'
      ),
      h('div', {}, h('label', { for: 'r9-edit-page' }, 'Which page?'), pageInput),
      h(
        'datalist',
        { id: listId },
        pages.map((p) => h('option', { value: p }))
      ),
      h('div', {}, h('label', { for: 'r9-edit-text' }, 'What did you change?'), text),
      error,
      h('div', { class: 'row' }, save, h('button', { type: 'button', class: 'btn', onclick: closeDrawer }, 'Cancel'))
    ),
    { title: 'I edited a page' }
  );
  pageInput.focus();
}

// ------------------------------------------------------------------ verdicts

// One verdict as a card. Exported for the page drawer on the Pages page.
export function verdictCard(v, ctx, { showPage = true } = {}) {
  const { h, fmt } = ctx;
  const chip = h('span', { class: `chip ${VERDICT_CHIP[v.verdict] ?? ''}` }, v.verdictText);
  const when = v.judgedOn
    ? `Changed ${fmt.date(v.changeDate)}, judged ${fmt.date(v.judgedOn)}.`
    : v.verdict === 'too-early'
      ? `Changed ${fmt.date(v.changeDate)}. It can be judged from ${v.judgeFromText ?? fmt.date(v.judgeFrom)}.`
      : `Changed ${fmt.date(v.changeDate)}.`;
  const title = v.batch ? `${fmt.plural(v.pages.length, 'page', 'pages')} changed together` : showPage ? v.page : null;

  const b = v.before;
  const a = v.after;
  const rows =
    b && a
      ? [
          [
            'Times shown',
            fmt.num(b.impressions),
            fmt.num(a.impressions),
            // The server's change, null (not enough data yet) under the minimum base.
            fmt.change(v.impChange),
          ],
          ['Clicks', fmt.num(b.clicks), fmt.num(a.clicks), fmt.change(a.clicks - b.clicks, 'count')],
          [
            'Average place',
            b.position ? fmt.position(b.position) : 'none',
            a.position ? fmt.position(a.position) : 'none',
            b.position && a.position ? fmt.change(Math.round((b.position - a.position) * 10) / 10, 'positions') : '',
          ],
        ]
      : null;
  const table = rows
    ? h(
        'table',
        { class: 'r9-ba' },
        h(
          'thead',
          {},
          h(
            'tr',
            {},
            h('th', {}, ''),
            h('th', {}, '28 days before'),
            h('th', {}, '28 days after'),
            h('th', {}, 'Change')
          )
        ),
        h(
          'tbody',
          {},
          rows.map((r) =>
            h(
              'tr',
              {},
              r.map((c) => h('td', {}, c))
            )
          )
        )
      )
    : null;

  const ctrl = v.control?.impPct;
  const own = v.impChange ?? null;
  const control = h(
    'p',
    { class: 'r9-control' },
    typeof ctrl === 'number'
      ? `A typical page on the site moved ${fmt.change(Math.round(ctrl * 1000) / 10)} in the same period${own !== null ? `, while ${v.batch ? 'these pages' : 'this page'} moved ${fmt.change(own)}` : ''}.`
      : v.verdict === 'too-early'
        ? 'The comparison with a typical page on the site comes with the verdict.'
        : 'There is no comparison with a typical page for this one.'
  );

  const care = careLine(v.nearUpdates, fmt.date);
  const notes = [
    v.clicksTooSmall ? 'Too few clicks to judge on clicks, so the verdict rests on times shown and place.' : null,
    v.overlapping ? 'Another change landed inside the same 28 days, so part of the move may come from that one.' : null,
    v.partial ? 'The 28 days after are not complete yet, so this is an early read.' : null,
  ].filter(Boolean);

  const pageLink = (p) =>
    h('a', { href: `#/pages?page=${encodeURIComponent(p)}`, style: { overflowWrap: 'anywhere' } }, p);

  return h(
    'article',
    { class: 'card' },
    h('div', { class: 'card-top' }, chip, h('span', { class: 'small muted' }, when)),
    title ? h('h3', { class: 'card-title', style: { overflowWrap: 'anywhere' } }, title) : null,
    table,
    control,
    care ? h('p', { class: 'p2-care' }, care) : null,
    notes.length
      ? h(
          'ul',
          { class: 'r9-pages muted' },
          notes.map((n) => h('li', {}, n))
        )
      : null,
    v.batch
      ? h(
          'details',
          { style: { marginTop: '8px' } },
          h('summary', { class: 'small' }, 'Which pages'),
          h(
            'ul',
            { class: 'r9-pages' },
            v.pages.map((p) => h('li', {}, pageLink(p)))
          )
        )
      : null,
    !v.batch && showPage && v.page
      ? h(
          'div',
          { class: 'card-links' },
          h('a', { href: `#/pages?page=${encodeURIComponent(v.page)}` }, 'See this page')
        )
      : null
  );
}

function verdictSection(verdicts, ctx, lessons) {
  const { h } = ctx;
  const FILTERS = [
    { key: 'all', label: 'All', test: () => true },
    { key: 'better', label: 'Better', test: (v) => v.verdict === 'better' },
    { key: 'worse', label: 'Worse', test: (v) => v.verdict === 'worse' },
    { key: 'mixed', label: 'Mixed', test: (v) => v.verdict === 'mixed' },
    {
      key: 'other',
      label: 'No real change or too small',
      test: (v) => v.verdict === 'flat' || v.verdict === 'insufficient-data',
    },
    { key: 'too-early', label: 'Too early', test: (v) => v.verdict === 'too-early' },
  ].filter((f) => f.key === 'all' || verdicts.some(f.test));
  let current = 'all';
  const list = h('div', { class: 'stack' });
  const chips = h('div', { class: 'chips', role: 'group', 'aria-label': 'Show verdicts' });
  const draw = () => {
    const f = FILTERS.find((x) => x.key === current);
    chips.replaceChildren(
      ...FILTERS.map((x) =>
        h(
          'button',
          {
            type: 'button',
            class: 'chip chip-btn',
            'aria-pressed': String(x.key === current),
            onclick: () => {
              current = x.key;
              draw();
            },
          },
          `${x.label} `,
          h('span', { class: 'count' }, String(verdicts.filter(x.test).length))
        )
      )
    );
    list.replaceChildren(
      ...verdicts.filter(f.test).map((v) => {
        const card = verdictCard(v, ctx);
        // A lesson can start from any judged verdict the desk keeps (not the money page reads).
        if (lessons && !v.money && v.judgedOn) {
          card.append(
            h(
              'div',
              { class: 'card-actions' },
              h('button', { type: 'button', class: 'btn btn-small', onclick: () => addLesson(ctx, v) }, 'Add a lesson')
            )
          );
        }
        return card;
      })
    );
  };
  draw();
  return h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'section-head' },
      h('h2', { class: 'section-title' }, 'Verdicts'),
      h('a', { class: 'btn btn-quiet btn-small', href: '/api/export/verdicts.csv', download: '' }, 'Download CSV')
    ),
    verdicts.length
      ? h('div', {}, h('div', { class: 'toolbar' }, chips), list)
      : h('p', { class: 'empty' }, 'No change has been judged yet. Verdicts appear 30 days after a change.')
  );
}

// ------------------------------------------------------------------ lessons

// The server's sentence on when a lesson is proven (kept from the last lessons reply).
let provenWhen = 'It becomes proven when three results all read better, or all read worse.';

async function addLesson(ctx, verdict = null) {
  const text = await ctx.promptBox({
    title: verdict ? 'Add a lesson from this verdict' : 'Add a lesson',
    body: verdict
      ? `From the verdict on ${verdict.batch ? 'pages changed together' : verdict.page} (${verdict.verdictText}). Write what you learned in one sentence. It starts as a trial. ${provenWhen}`
      : `Write what you learned in one sentence, and link results to it later. ${provenWhen}`,
    label: 'Lesson',
    type: 'textarea',
    maxLength: 300,
    placeholder: 'For example: a question in the title gets more clicks on comparison posts',
    confirmLabel: 'Add the lesson',
    required: true,
  });
  if (!text) return;
  try {
    await ctx.api.post('/api/lessons', verdict ? { text, verdictId: verdict.id } : { text });
    ctx.toast('Lesson added as a trial.', 'success');
    await ctx.reload();
  } catch (e) {
    ctx.toast(e.message, 'error');
  }
}

async function changeLesson(ctx, id, body, message) {
  try {
    await ctx.api.put(`/api/lessons/${encodeURIComponent(id)}`, body);
    ctx.toast(message, 'success');
    await ctx.reload();
  } catch (e) {
    ctx.toast(e.message, 'error');
  }
}

function lessonCard(ctx, l, verdicts) {
  const { h, fmt } = ctx;
  const linked = new Set(l.verdictIds ?? []);
  const free = (verdicts ?? []).filter((v) => !linked.has(v.id) && v.judgedOn);
  const statusBtn = h(
    'button',
    { type: 'button', class: 'btn btn-small btn-quiet', 'aria-haspopup': 'menu' },
    'Set status'
  );
  statusBtn.addEventListener('click', () =>
    ctx.menu(statusBtn, [
      ...['trial', 'proven', 'dropped'].map((st) => ({
        label: lessonWord(st),
        onSelect: () => changeLesson(ctx, l.id, { status: st }, `Set to ${lessonWord(st)}.`),
      })),
      {
        label: 'Let the verdicts decide',
        onSelect: () => changeLesson(ctx, l.id, { status: 'auto' }, 'The verdicts set its status again.'),
      },
    ])
  );
  const linkBtn = free.length
    ? h('button', { type: 'button', class: 'btn btn-small btn-quiet', 'aria-haspopup': 'menu' }, 'Link a verdict')
    : null;
  linkBtn?.addEventListener('click', () =>
    ctx.menu(
      linkBtn,
      free.map((v) => ({
        label: `${v.batch ? 'Pages changed together' : v.page}: ${v.verdictText} (${fmt.dateShort(v.changeDate)})`,
        onSelect: () => changeLesson(ctx, l.id, { addVerdictId: v.id }, 'Verdict linked.'),
      }))
    )
  );
  return h(
    'article',
    { class: 'card' },
    h(
      'div',
      { class: 'card-top' },
      h('span', { class: `chip ${LESSON_CHIP[l.status] ?? ''}`.trim() }, lessonWord(l.status)),
      l.manual ? h('span', { class: 'chip', title: 'You set this status by hand' }, 'Set by you') : null,
      h('span', { class: 'small muted' }, `Added ${fmt.date(l.createdOn)}`)
    ),
    h('p', { class: 'card-title' }, l.text),
    l.statusNote ? h('p', { class: 'small muted', style: { marginTop: '4px' } }, l.statusNote) : null,
    l.verdicts?.length
      ? h(
          'ul',
          { class: 'plain-list lsn-verdicts' },
          l.verdicts.map((v) =>
            h(
              'li',
              {},
              h(
                'span',
                { class: `chip ${VERDICT_CHIP[v.verdict] ?? ''}`.trim() },
                v.known ? v.verdictText : 'No longer kept'
              ),
              ' ',
              h('span', { style: { overflowWrap: 'anywhere' } }, v.page ?? v.id),
              v.changeDate ? h('span', { class: 'muted small' }, `, changed ${fmt.date(v.changeDate)}`) : null,
              h(
                'button',
                {
                  type: 'button',
                  class: 'btn btn-small btn-quiet',
                  'aria-label': `Unlink this verdict from the lesson`,
                  onclick: () => changeLesson(ctx, l.id, { removeVerdictId: v.id }, 'Verdict unlinked.'),
                },
                'Unlink'
              )
            )
          )
        )
      : h('p', { class: 'small muted', style: { marginTop: '6px' } }, 'No verdict linked yet.'),
    h(
      'div',
      { class: 'card-actions' },
      statusBtn,
      linkBtn,
      h(
        'button',
        {
          type: 'button',
          class: 'btn btn-small btn-quiet',
          onclick: async () => {
            const ok = await ctx.confirmBox({
              title: 'Delete this lesson?',
              body: `"${l.text}"\n\nThe verdicts stay; only the lesson goes.`,
              confirmLabel: 'Delete it',
              danger: true,
            });
            if (!ok) return;
            try {
              await ctx.api.del(`/api/lessons/${encodeURIComponent(l.id)}`);
              ctx.toast('Lesson deleted.', 'success');
              await ctx.reload();
            } catch (e) {
              ctx.toast(e.message, 'error');
            }
          },
        },
        'Delete'
      )
    )
  );
}

function lessonsSection(lessons, verdicts, ctx) {
  const { h, fmt } = ctx;
  if (!lessons) return null;
  const c = lessons.counts ?? {};
  return h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'section-head' },
      h('h2', { class: 'section-title' }, 'What we have learned'),
      h(
        'div',
        { class: 'row' },
        h(
          'span',
          { class: 'section-note' },
          `${fmt.num(c.trial ?? 0)} trial, ${fmt.num(c.proven ?? 0)} proven, ${fmt.num(c.dropped ?? 0)} dropped`
        ),
        h('button', { type: 'button', class: 'btn btn-small', onclick: () => addLesson(ctx) }, 'Add a lesson')
      )
    ),
    h(
      'p',
      { class: 'section-note', style: { marginBottom: '12px' } },
      `${lessons.explain ?? ''} ${lessons.ruleNote ?? ''}`.trim()
    ),
    lessons.items?.length
      ? h(
          'div',
          { class: 'cols-even section-first lsn-grid' },
          lessons.items.map((l) => lessonCard(ctx, l, verdicts))
        )
      : h(
          'p',
          { class: 'empty' },
          'No lesson yet. Press Add a lesson on a verdict above to write down what it taught you.'
        )
  );
}

function changeRow(g, ctx, { dateText }) {
  const { h, fmt } = ctx;
  const pageLink = (p) =>
    h('a', { href: `#/pages?page=${encodeURIComponent(p)}`, style: { overflowWrap: 'anywhere' } }, p);
  return h(
    'li',
    {},
    h('span', { class: 'side-date' }, dateText),
    h(
      'div',
      { style: { overflowWrap: 'anywhere' } },
      g.pages.length === 1 ? pageLink(g.pages[0]) : h('strong', {}, fmt.plural(g.pages.length, 'page', 'pages'))
    ),
    h(
      'div',
      { class: 'small muted', style: { overflowWrap: 'anywhere' } },
      `Changed ${fmt.date(g.changeDate)}: ${g.subject}`
    ),
    h(
      'div',
      { class: 'row', style: { marginTop: '4px' } },
      g.deliberate ? h('span', { class: 'chip chip-accent' }, 'Deliberate edit') : null,
      g.kind === 'manual' ? h('span', { class: 'chip' }, 'Logged by hand') : null,
      g.overlapping ? h('span', { class: 'chip chip-warn' }, 'Overlaps another change') : null
    ),
    g.pages.length > 1
      ? h(
          'details',
          {},
          h('summary', { class: 'small' }, 'Which pages'),
          h(
            'ul',
            { class: 'r9-pages' },
            g.pages.map((p) => h('li', {}, pageLink(p)))
          )
        )
      : null
  );
}

function dueSection(groups, ctx) {
  const { h, fmt } = ctx;
  if (!groups.length) return null;
  const total = groups.reduce((s, g) => s + g.pages.length, 0);
  return h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'section-head' },
      h('h2', { class: 'section-title' }, 'Ready to judge'),
      h('span', { class: 'section-note' }, `${fmt.plural(total, 'page change', 'page changes')}. Press Judge now.`)
    ),
    h(
      'ul',
      { class: 'side-list' },
      groups.map((g) => changeRow(g, ctx, { dateText: 'Ready now' }))
    )
  );
}

function pendingSection(groups, ctx) {
  const { h, fmt } = ctx;
  const total = groups.reduce((s, g) => s + g.pages.length, 0);
  const firstDate = [...groups].map((g) => g.judgeFrom).sort()[0];
  let shown = PENDING_SHOWN;
  const list = h('ul', { class: 'side-list' });
  const more = h('div', { class: 'table-foot' });
  const draw = () => {
    list.replaceChildren(
      ...groups.slice(0, shown).map((g) => changeRow(g, ctx, { dateText: `Judged from ${g.judgeFromText}` }))
    );
    const left = groups.length - shown;
    more.replaceChildren(
      h('span', {}, `Showing ${Math.min(shown, groups.length)} of ${groups.length}.`),
      left > 0
        ? h(
            'button',
            {
              type: 'button',
              class: 'btn btn-small',
              onclick: () => {
                shown += PENDING_SHOWN * 2;
                draw();
              },
            },
            `Show ${Math.min(left, PENDING_SHOWN * 2)} more`
          )
        : '' // replaceChildren would print null
    );
  };
  draw();
  return h(
    'section',
    { class: 'section' },
    h('div', { class: 'section-head' }, h('h2', { class: 'section-title' }, 'Waiting for a verdict')),
    groups.length
      ? h(
          'div',
          {},
          h(
            'p',
            { class: 'section-note', style: { marginBottom: '8px' } },
            `${fmt.plural(total, 'page change', 'page changes')}, grouped into ${fmt.plural(groups.length, 'change', 'changes')}: a commit that touched several pages at once is one line. Deliberate edits come first. The first can be judged on ${fmt.date(firstDate)}.`
          ),
          list,
          groups.length > PENDING_SHOWN ? more : null
        )
      : h('p', { class: 'empty' }, 'No change is waiting. A change shows here the day it goes live.')
  );
}

// ------------------------------------------------------------------ the side column

function frozenSection(data, ctx) {
  const { h } = ctx;
  return h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'section-head', style: { marginBottom: '4px' } },
      h('h2', { class: 'section-title' }, 'Frozen pages')
    ),
    h(
      'p',
      { class: 'section-note', style: { marginBottom: '8px' } },
      'A page changed on purpose is left alone for 28 days, so its verdict is clean.'
    ),
    data.frozen.length
      ? h(
          'ul',
          { class: 'side-list' },
          data.frozen.map((f) =>
            h(
              'li',
              {},
              h('span', { class: 'side-date' }, `Until ${f.untilText}`),
              h(
                'div',
                { style: { overflowWrap: 'anywhere' } },
                h('a', { href: `#/pages?page=${encodeURIComponent(f.page)}` }, f.page)
              ),
              h('div', { class: 'small muted' }, f.why)
            )
          )
        )
      : h('p', { class: 'empty' }, 'No page is frozen. Any page may be edited.')
  );
}

function annotationsSection(data, ctx) {
  const { h, fmt, api, toast, confirmBox } = ctx;
  let categories = null;
  const categoryLabel = (key) =>
    (categories ?? DEFAULT_CATEGORIES).find((c) => c.key === key)?.label ?? DEFAULT_CATEGORIES.at(-1).label;

  const editForm = async (ann) => {
    if (!categories) {
      try {
        categories = (await api.get('/api/annotations')).categories ?? DEFAULT_CATEGORIES;
      } catch {
        categories = DEFAULT_CATEGORIES;
      }
    }
    const title = h('input', {
      class: 'input',
      type: 'text',
      id: 'r9-ann-title',
      maxLength: 300,
      value: ann?.title ?? ann?.text ?? '',
      placeholder: 'For example: Google core update started',
    });
    const date = h('input', { class: 'input', type: 'date', id: 'r9-ann-date', value: ann?.date ?? fmt.isoPlus(0) });
    const endDate = h('input', { class: 'input', type: 'date', id: 'r9-ann-end', value: ann?.endDate ?? '' });
    const category = h(
      'select',
      { class: 'select', id: 'r9-ann-cat' },
      categories.map((c) => h('option', { value: c.key }, c.label))
    );
    category.value = ann?.category ?? 'other';
    const detail = h('textarea', {
      id: 'r9-ann-detail',
      maxLength: 1000,
      value: ann?.detail ?? '',
      placeholder: 'Anything worth remembering: a link, who did it, what changed',
    });
    const syncMin = () => (endDate.min = date.value);
    date.addEventListener('change', syncMin);
    syncMin();
    const error = h('p', { class: 'small', style: { color: 'var(--bad)' }, hidden: true });
    const show = (msg) => {
      error.textContent = msg;
      error.hidden = false;
    };
    const save = h(
      'button',
      {
        type: 'button',
        class: 'btn btn-primary',
        onclick: async () => {
          error.hidden = true;
          const body = {
            title: title.value.trim(),
            date: date.value,
            endDate: endDate.value || null,
            category: category.value,
            detail: detail.value.trim(),
          };
          if (!body.title) return show('Give the note a short title.');
          if (body.endDate && body.endDate < body.date) return show('The end date cannot be before the start date.');
          save.disabled = true;
          try {
            if (ann) await api.put(`/api/annotations/${encodeURIComponent(ann.id)}`, body);
            else await api.post('/api/annotations', body);
            ctx.closeDrawer();
            toast(ann ? 'Note saved.' : 'Note added. It shows on every chart.', 'success');
            await ctx.reload();
          } catch (e) {
            show(e.message);
            save.disabled = false;
          }
        },
      },
      ann ? 'Save' : 'Add the note'
    );
    ctx.openDrawer(
      h(
        'div',
        { class: 'stack r9-form' },
        h(
          'p',
          { class: 'small muted' },
          'Your own notes, such as a Google update or a mention somewhere, show as dots on every chart in the desk. They stay on this Mac.'
        ),
        h('div', {}, h('label', { for: 'r9-ann-title' }, 'What happened?'), title),
        h(
          'div',
          { class: 'row', style: { alignItems: 'flex-end' } },
          h('div', {}, h('label', { for: 'r9-ann-date' }, 'Date'), date),
          h('div', {}, h('label', { for: 'r9-ann-end' }, 'Until (leave empty for one day)'), endDate)
        ),
        h('div', {}, h('label', { for: 'r9-ann-cat' }, 'Kind of note'), category),
        h('div', {}, h('label', { for: 'r9-ann-detail' }, 'More detail (optional)'), detail),
        error,
        h(
          'div',
          { class: 'row' },
          save,
          h('button', { type: 'button', class: 'btn', onclick: () => ctx.closeDrawer() }, 'Cancel')
        )
      ),
      { title: ann ? 'Edit your note' : 'Add a note to the timeline' }
    );
    title.focus();
  };

  const archive = async (ann) => {
    const ok = await confirmBox({
      title: 'Archive this note?',
      body: `"${ann.title ?? ann.text}"\n\nIt leaves the charts. You can bring it back from the archived notes.`,
      confirmLabel: 'Archive',
    });
    if (!ok) return;
    try {
      const res = await api.del(`/api/annotations/${encodeURIComponent(ann.id)}`);
      toast(res?.message ?? 'Archived.', 'success');
      await ctx.reload();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const restore = async (ann) => {
    try {
      const res = await api.post(`/api/annotations/${encodeURIComponent(ann.id)}/restore`, {});
      toast(res.restored ? 'Restored. It is back on the charts.' : res.message, res.restored ? 'success' : 'info');
      await ctx.reload();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const deleteForGood = async (ann) => {
    const ok = await confirmBox({
      title: 'Delete this note for good?',
      body: `"${ann.title ?? ann.text}"\n\nIt is removed from the desk and cannot be brought back.`,
      confirmLabel: 'Delete for good',
      danger: true,
    });
    if (!ok) return;
    try {
      const res = await api.del(`/api/annotations/${encodeURIComponent(ann.id)}`);
      toast(res?.deleted ? 'Deleted for good.' : (res?.message ?? 'Done.'), 'success');
      await ctx.reload();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const noteBody = (a) => [
    h('div', { style: { overflowWrap: 'anywhere' } }, a.title ?? a.text),
    h(
      'div',
      { class: 'p2-note-meta' },
      a.category ? h('span', { class: 'chip' }, categoryLabel(a.category)) : null,
      a.detail ? h('span', { class: 'small muted', style: { overflowWrap: 'anywhere' } }, a.detail) : null
    ),
  ];

  const archivedBox = h('div', {});
  const loadArchived = async () => {
    archivedBox.replaceChildren(h('p', { class: 'loading' }, 'Loading archived notes...'));
    try {
      const res = await api.get('/api/annotations/archived');
      categories = categories ?? res.categories ?? null;
      const old = [...(res.items ?? [])].sort((a, b) => b.date.localeCompare(a.date));
      archivedBox.replaceChildren(
        h('h3', { class: 'p2-h3', style: { marginTop: '14px' } }, 'Archived notes'),
        old.length
          ? h(
              'ul',
              { class: 'side-list' },
              old.map((a) =>
                h(
                  'li',
                  {},
                  h('span', { class: 'side-date' }, spanText(a.date, a.endDate, fmt.date)),
                  ...noteBody(a),
                  h(
                    'div',
                    { class: 'row', style: { marginLeft: '-8px' } },
                    h(
                      'button',
                      { type: 'button', class: 'btn btn-quiet btn-small', onclick: () => restore(a) },
                      'Restore'
                    ),
                    h(
                      'button',
                      { type: 'button', class: 'btn btn-quiet btn-small', onclick: () => deleteForGood(a) },
                      'Delete for good'
                    )
                  )
                )
              )
            )
          : h('p', { class: 'empty' }, 'Nothing is archived.')
      );
    } catch (e) {
      archivedBox.replaceChildren(h('p', { class: 'small jb-warn' }, e.message));
    }
  };
  const toggleArchived = h(
    'button',
    {
      type: 'button',
      class: 'btn btn-quiet btn-small',
      style: { marginTop: '6px', marginLeft: '-8px' },
      'aria-expanded': String(archivedOpen),
      onclick: () => {
        archivedOpen = !archivedOpen;
        toggleArchived.setAttribute('aria-expanded', String(archivedOpen));
        toggleArchived.textContent = archivedOpen ? 'Hide archived notes' : 'Show archived notes';
        if (archivedOpen) loadArchived();
        else archivedBox.replaceChildren();
      },
    },
    archivedOpen ? 'Hide archived notes' : 'Show archived notes'
  );
  if (archivedOpen) loadArchived();

  const items = [...data.annotations].filter((a) => !a.archived).sort((a, b) => b.date.localeCompare(a.date));
  return h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'section-head', style: { marginBottom: '4px' } },
      h('h2', { class: 'section-title' }, 'Your notes'),
      h('button', { type: 'button', class: 'btn btn-small', onclick: () => editForm(null) }, 'Add a note')
    ),
    h(
      'p',
      { class: 'section-note', style: { marginBottom: '8px' } },
      'Things that happened outside the site. They show as dots on every chart.'
    ),
    items.length
      ? h(
          'ul',
          { class: 'side-list' },
          items.map((a) =>
            h(
              'li',
              {},
              h('span', { class: 'side-date' }, spanText(a.date, a.endDate, fmt.date)),
              ...noteBody(a),
              h(
                'div',
                { class: 'row', style: { marginLeft: '-8px' } },
                h('button', { type: 'button', class: 'btn btn-quiet btn-small', onclick: () => editForm(a) }, 'Edit'),
                h('button', { type: 'button', class: 'btn btn-quiet btn-small', onclick: () => archive(a) }, 'Archive')
              )
            )
          )
        )
      : h('p', { class: 'empty' }, 'No notes yet.'),
    toggleArchived,
    archivedBox
  );
}

// ------------------------------------------------------------------ timeline

function timelineSection(data, chartData, ctx) {
  const { h, fmt } = ctx;
  const chartBox = h('div', {});
  if (chartData) {
    lineChart(chartBox, {
      series: chartData.series,
      markers: data.timeline.map((m) => ({ date: m.date, label: markerText(m) })),
      label: 'Times shown on Google each day',
    });
  }
  const FILTERS = [
    { key: 'all', label: 'All', test: () => true },
    { key: 'publish', label: 'Published', test: (m) => m.kind === 'publish' },
    { key: 'edit', label: 'Edits', test: (m) => m.kind === 'edit' },
    { key: 'note', label: 'Notes', test: (m) => m.kind === 'note' || m.kind === 'annotation' },
    { key: 'google-update', label: 'Google updates', test: (m) => m.kind === 'google-update' },
  ].filter((f) => f.key !== 'google-update' || data.timeline.some(f.test));
  let current = 'all';
  let shown = TIMELINE_SHOWN;
  const events = [...data.timeline].reverse();
  const chips = h('div', { class: 'chips', role: 'group', 'aria-label': 'Show events' });
  const list = h('ul', { class: 'side-list' });
  const foot = h('div', { class: 'table-foot' });
  const draw = () => {
    const f = FILTERS.find((x) => x.key === current);
    const rows = events.filter(f.test);
    chips.replaceChildren(
      ...FILTERS.map((x) =>
        h(
          'button',
          {
            type: 'button',
            class: 'chip chip-btn',
            'aria-pressed': String(x.key === current),
            onclick: () => {
              current = x.key;
              shown = TIMELINE_SHOWN;
              draw();
            },
          },
          `${x.label} `,
          h('span', { class: 'count' }, String(events.filter(x.test).length))
        )
      )
    );
    list.replaceChildren(
      ...rows
        .slice(0, shown)
        .map((m) =>
          h(
            'li',
            {},
            m.kind === 'google-update'
              ? h(
                  'span',
                  { class: 'side-date' },
                  h('span', { class: 'chip chip-warn', style: { marginRight: '8px' } }, 'Google update'),
                  spanText(m.date, m.endDate, fmt.date, { open: true })
                )
              : h(
                  'span',
                  { class: 'side-date' },
                  `${m.endDate ? spanText(m.date, m.endDate, fmt.date) : fmt.date(m.date)}, ${markerLabel(m.kind).toLowerCase()}`
                ),
            h('div', { style: { overflowWrap: 'anywhere' } }, m.label),
            m.count > 1
              ? h('div', { class: 'small muted' }, `Touched ${fmt.plural(m.count, 'page', 'pages')}.`)
              : m.page && m.kind !== 'publish'
                ? h(
                    'div',
                    { class: 'small' },
                    h(
                      'a',
                      { href: `#/pages?page=${encodeURIComponent(m.page)}`, style: { overflowWrap: 'anywhere' } },
                      m.page
                    )
                  )
                : null
          )
        )
    );
    foot.replaceChildren(
      h('span', {}, rows.length ? `Showing ${Math.min(shown, rows.length)} of ${rows.length}.` : ''),
      rows.length > shown
        ? h(
            'button',
            {
              type: 'button',
              class: 'btn btn-small',
              onclick: () => {
                shown += TIMELINE_SHOWN * 2;
                draw();
              },
            },
            `Show ${Math.min(rows.length - shown, TIMELINE_SHOWN * 2)} more`
          )
        : '' // replaceChildren would print null
    );
  };
  draw();
  return h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'section-head', style: { marginBottom: '4px' } },
      h('h2', { class: 'section-title' }, 'Timeline')
    ),
    h(
      'p',
      { class: 'section-note', style: { marginBottom: '10px' } },
      chartData
        ? `Times shown on Google each day, ${fmt.range(chartData.range)}. Each dot on the bottom line is a publish, an edit, a note or a Google ranking update. Hover a dot to read it.`
        : 'Publishes, edits, notes and Google ranking updates from the last 120 days.'
    ),
    data.googleUpdatesNote
      ? h('p', { class: 'small p2-stopped', role: 'status', style: { marginBottom: '10px' } }, data.googleUpdatesNote)
      : null,
    chartData ? chartBox : null,
    h('div', { class: 'toolbar', style: { marginTop: '12px' } }, chips),
    events.length ? list : h('p', { class: 'empty' }, 'Nothing happened in the last 120 days.'),
    events.length ? foot : null
  );
}
