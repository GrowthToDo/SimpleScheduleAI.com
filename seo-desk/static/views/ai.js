// AI visibility: are AI assistants naming and citing us?
//
// One plain sentence from the data, four big numbers, the split by kind of question and by
// assistant (GET /api/ai-visibility: counts only, never a share), the answers-over-time line, the money
// keyword table, visits that came from AI assistants, the Search Console CSV import and the
// paid citation check (confirm first, then poll the job and show its output).

import { lineChart } from '../chart.js';
import { dataTable } from './table.js';
import { jobBlock, tile, daysText } from './jobs.js';

const CSS = `
.ai-chart { margin-top: 12px; }
.ai-import { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-top: 12px; }
.ai-import input[type='file'] { max-width: 100%; font-size: 14px; }
.ai-snapshots { margin-top: 16px; }
`;

const cleanDomain = (d) => String(d).replace(/^www\./, '');

// The keyword checks of one kind or assistant as "named in N of M keyword checks", only when
// there are enough of them (keywordEnough, 3 or more); else not enough data yet. The listed
// answers are a count on their own and are never put over a total.
export function keywordShare(row) {
  if (!row?.keywordEnough || typeof row.keywordNamed !== 'number') return 'not enough data yet';
  return `named in ${row.keywordNamed} of ${row.keywordChecked} keyword checks`;
}

export async function render(el, ctx) {
  const { api, h, fmt } = ctx;
  const [data, jobs, split] = await Promise.all([
    api.get('/api/ai'),
    api.get('/api/jobs'),
    // A failing split costs only its own section, never the whole page.
    api.get('/api/ai-visibility').catch(() => null),
  ]);
  ctx.envelope(data);

  const check = jobBlock(ctx, jobs, 'citations', {
    label: 'Run citation check',
    primary: true,
    confirm: {
      title: 'Run the AI citation check?',
      body:
        `This asks the AI assistants about the money keywords and costs ${data.check.cost}.\n\n` +
        `It adds one line to ${data.check.writes.join(', ')}, a file tracked in git, so it will show up as a change to commit.\n\n` +
        'Nothing else changes.',
      confirmLabel: `Run it (${data.check.cost})`,
    },
  });

  const last = data.latestCheck;
  // The one "N of M" for money keywords is the server's, gated at its minimum number of checks.
  const money = data.moneyCitations ?? { checked: 0, cited: null, enough: false, text: '' };
  const visits = data.visitsFromAi;

  ctx.mount(
    el,
    h('style', {}, CSS),
    h(
      'div',
      { class: 'page-head' },
      h(
        'div',
        {},
        h('h1', { class: 'page-title' }, 'AI visibility'),
        h('p', { class: 'page-sub' }, headline(data)),
        money.checked ? h('p', { class: 'page-sub', style: { marginTop: '2px' } }, money.text) : null
      ),
      h('div', { class: 'row' }, check.button)
    ),
    check.panel,
    data.empty
      ? h(
          'p',
          { class: 'banner banner-warn' },
          'No data has been pulled yet. Press Refresh now at the top of the page.'
        )
      : null,
    h(
      'section',
      { class: 'section', style: { marginTop: '24px' }, 'aria-label': 'AI answers in numbers' },
      h(
        'div',
        { class: 'tiles' },
        ...assistants(data).map((p) =>
          p.checked
            ? tile(h, `${p.label} named us in at least`, fmt.num(p.n), last ? `at the check on ${last.dateText}` : '')
            : tile(
                h,
                `${p.label} named us in at least`,
                'not checked this time',
                last ? `at the check on ${last.dateText}` : '',
                {
                  text: true,
                }
              )
        ),
        tile(
          h,
          'Money keywords that cite us',
          // The server's gated pair: "N of M" only when there are enough keyword checks.
          money.enough ? `${money.cited} of ${money.checked}` : money.checked ? fmt.NOT_ENOUGH : 'none checked',
          last ? `at the check on ${last.dateText}` : 'run the citation check first',
          { text: !money.enough }
        ),
        tile(
          h,
          'Visits from AI assistants',
          visits.total === null ? fmt.NOT_ENOUGH : fmt.num(visits.total),
          visits.total === null ? '' : `${fmt.num(visits.prevTotal)} in the 28 days before, ${fmt.range(visits.range)}`,
          { text: visits.total === null }
        ),
        tile(
          h,
          'Last citation check',
          last ? last.dateText : 'never',
          last ? daysText(last.daysAgo) : 'press Run citation check',
          { text: true }
        )
      )
    ),
    splitSection(split, ctx),
    trendSection(data, ctx),
    keywordSection(data, ctx),
    visitsSection(data, ctx),
    importSection(data, ctx)
  );

  check.resume();
}

// By kind of question and by assistant, from the newest saved check. Counts only.
function splitSection(split, ctx) {
  const { h, fmt } = ctx;
  if (!split || split.empty || !split.byKind) return null;
  const table = (title, rows, nameOf) =>
    h(
      'div',
      { class: 'panel' },
      h('div', { class: 'section-head' }, h('h3', { class: 'section-title' }, title)),
      h(
        'div',
        { class: 'table-wrap' },
        h(
          'table',
          { class: 'table table-flush table-compact', 'aria-label': title },
          h(
            'thead',
            {},
            h(
              'tr',
              {},
              h('th', { scope: 'col' }, title === 'By assistant' ? 'Assistant' : 'Kind of question'),
              h('th', { scope: 'col', class: 'num', title: 'Answers the check listed that named us' }, 'Named us in'),
              h('th', { scope: 'col', class: 'num', title: 'How many of those listed a page of ours' }, 'Linked to us'),
              h('th', { scope: 'col', title: 'Only the money keyword checks can miss' }, 'Keyword checks')
            )
          ),
          h(
            'tbody',
            {},
            rows.map((r) =>
              h(
                'tr',
                { title: r.text },
                h('td', { class: 'cell-wrap' }, nameOf(r)),
                h('td', { class: 'num' }, fmt.plural(r.listed, 'answer', 'answers')),
                h('td', { class: 'num' }, fmt.num(r.listedLinked)),
                h('td', { class: 'muted' }, keywordShare(r))
              )
            )
          )
        )
      )
    );
  return h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'section-head' },
      h('h2', { class: 'section-title' }, 'Where we are named'),
      split.lastCheck ? h('span', { class: 'section-note' }, `From the check on ${split.lastCheck.dateText}.`) : null
    ),
    h(
      'div',
      { class: 'cols-even section-first' },
      table('By kind of question', split.byKind, (r) => r.label),
      table('By assistant', split.byAssistant ?? [], (r) => r.assistant)
    ),
    split.note ? h('p', { class: 'tiles-note' }, split.note) : null
  );
}

function headline(data) {
  const last = data.latestCheck;
  const latest = data.trend.at(-1);
  if (!last || !latest) {
    return 'No citation check has been recorded yet. Press Run citation check to ask the AI assistants about the money keywords.';
  }
  const when = `at the last check on ${last.dateText} (${daysText(last.daysAgo)})`;
  return assistants(data)
    .map((p, i) => {
      const tail = i === 0 ? ` ${when}` : '';
      if (!p.checked) return `${p.label}: not checked this time${tail}.`;
      return p.n > 0
        ? `${p.label} named us in at least ${p.n} ${p.n === 1 ? 'answer' : 'answers'}${tail}.`
        : `${p.label} was not named in the answers listed${tail}.`;
    })
    .join(' ');
}

// Each assistant at the latest check. The data has an entry for an assistant when it named us
// or when it was asked about a money keyword; with neither, it was not checked this time.
function assistants(data) {
  const latest = data.trend.at(-1);
  const asked = new Set((data.moneyKeywords ?? []).flatMap((k) => k.platforms.map((p) => p.platform)));
  return data.platforms
    .map((p) => {
      const n = latest?.byPlatform?.[p.platform] ?? 0;
      return { label: p.label, n, checked: n > 0 || asked.has(p.platform) };
    })
    .sort((a, b) => Number(b.checked) - Number(a.checked) || b.n - a.n);
}

// ------------------------------------------------------------------ answers over time

function trendSection(data, ctx) {
  const { h } = ctx;
  const box = h('div', { class: 'ai-chart' });
  const seriesFor = (key) =>
    data.trend.map((t) => ({ date: t.date, value: key === 'all' ? t.total : (t.byPlatform[key] ?? 0) }));
  const labelFor = (key) =>
    key === 'all'
      ? 'Answers that name us, all assistants together, at least'
      : `Answers that name us on ${data.platforms.find((p) => p.platform === key)?.label}, at least`;
  const chart = lineChart(box, { series: seriesFor('all'), label: labelFor('all') });

  const choices = [
    { key: 'all', label: 'All assistants' },
    ...data.platforms.map((p) => ({ key: p.platform, label: p.label })),
  ];
  const chips = h('div', { class: 'chips', role: 'group', 'aria-label': 'Show one assistant' });
  const draw = (current) => {
    chips.replaceChildren(
      ...choices.map((c) =>
        h(
          'button',
          {
            type: 'button',
            class: 'chip chip-btn',
            'aria-pressed': String(c.key === current),
            onclick: () => {
              chart.update({ series: seriesFor(c.key), label: labelFor(c.key) });
              draw(c.key);
            },
          },
          c.label
        )
      )
    );
  };
  draw('all');

  return h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'section-head' },
      h('h2', { class: 'section-title' }, 'Answers that name us, over time'),
      h('span', { class: 'section-note' }, data.atLeastNote)
    ),
    data.platforms.length > 1 ? chips : null,
    data.trend.length
      ? box
      : h('p', { class: 'empty' }, 'No check has been recorded yet. Run the citation check to start this line.')
  );
}

// ------------------------------------------------------------------ money keywords

function keywordSection(data, ctx) {
  const { h } = ctx;
  const keywords = data.moneyKeywords ?? [];
  const platforms = [...new Map(keywords.flatMap((k) => k.platforms).map((p) => [p.platform, p.label])).entries()].map(
    ([platform, label]) => ({ platform, label })
  );

  const domains = (k, field) => [
    ...new Set(k.platforms.flatMap((p) => p[field].map((d) => cleanDomain(d.domain))).filter(Boolean)),
  ];
  const rows = keywords.map((k) => {
    const row = {
      keyword: k.keyword,
      competitors: domains(k, 'competitors').slice(0, 5).join(', '),
      sources: domains(k, 'sources').slice(0, 5).join(', '),
    };
    for (const p of platforms) {
      const hit = k.platforms.find((x) => x.platform === p.platform);
      row[`p_${p.platform}`] = !hit
        ? 'Not checked'
        : hit.cited
          ? hit.rank
            ? `Cited, place ${hit.rank}`
            : 'Cited'
          : 'Not cited';
    }
    return row;
  });

  const columns = [
    { key: 'keyword', label: 'Money keyword', wrap: true },
    ...platforms.map((p) => ({
      key: `p_${p.platform}`,
      label: p.label,
      format: (v) => h('span', { class: `chip${v.startsWith('Cited') ? ' chip-accent' : ''}` }, v),
    })),
    {
      key: 'competitors',
      label: 'Competitors named instead',
      wrap: true,
      format: (v) => (v ? v : h('span', { class: 'muted' }, 'none listed')),
    },
    {
      key: 'sources',
      label: 'Sites the assistant read',
      wrap: true,
      format: (v) => (v ? v : h('span', { class: 'muted' }, 'none listed')),
    },
  ];

  const box = h('div', {});
  dataTable(box, {
    columns,
    rows,
    label: 'Money keywords in AI answers',
    emptyText: 'No money keywords have been checked yet.',
  });
  return h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'section-head' },
      h('h2', { class: 'section-title' }, 'Are we cited for the money keywords?'),
      h('span', { class: 'section-note' }, data.latestCheck ? `From the check on ${data.latestCheck.dateText}.` : '')
    ),
    box
  );
}

// ------------------------------------------------------------------ visits from AI assistants

function visitsSection(data, ctx) {
  const { h, fmt } = ctx;
  const v = data.visitsFromAi;
  const total = v.bySource.reduce((s, r) => s + r.sessions, 0);
  const box = h('div', { class: 'ai-chart' });
  lineChart(box, { series: v.series, label: 'Visits from AI assistants per day' });
  return h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'section-head' },
      h('h2', { class: 'section-title' }, 'Visits from AI assistants'),
      h(
        'span',
        { class: 'section-note' },
        `The sources below cover ${fmt.range(v.range)}. The line shows every day with a visit.`
      )
    ),
    h(
      'div',
      { class: 'cols' },
      h(
        'div',
        {},
        total
          ? h(
              'ul',
              { class: 'share-list', style: { marginTop: '0' } },
              v.bySource.map((r) =>
                h(
                  'li',
                  {},
                  h(
                    'div',
                    { class: 'share-head' },
                    h('span', { class: 'page-path' }, r.source),
                    h(
                      'span',
                      { class: 'num muted' },
                      h('strong', { style: { color: 'var(--ink)' } }, fmt.num(r.sessions)),
                      r.sessions === 1 ? ' visit' : ' visits'
                    )
                  ),
                  h(
                    'div',
                    { class: 'bar' },
                    h('span', { style: { width: `${Math.round((r.sessions / total) * 100)}%` } })
                  )
                )
              )
            )
          : h('p', { class: 'empty' }, `No visits from AI assistants were recorded from ${fmt.range(v.range)}.`)
      ),
      h('div', {}, box)
    )
  );
}

// ------------------------------------------------------------------ the Search Console CSV

function importSection(data, ctx) {
  const { h, api, fmt } = ctx;
  const imp = data.imports;
  const file = h('input', {
    type: 'file',
    accept: '.csv,text/csv',
    'aria-label': 'Choose the CSV file from Search Console',
  });
  const button = h(
    'button',
    {
      type: 'button',
      class: 'btn',
      onclick: async () => {
        const f = file.files?.[0];
        if (!f) {
          ctx.toast('Choose the CSV file first.', 'error');
          return;
        }
        button.disabled = true;
        try {
          const res = await api.post('/api/ai/import', await f.text());
          ctx.toast(
            `Imported ${fmt.plural(res.rowCount, 'row', 'rows')} as the snapshot for ${fmt.date(res.date)}.`,
            'success'
          );
          await ctx.reload();
        } catch (e) {
          ctx.toast(e.message, 'error');
          button.disabled = false;
        }
      },
    },
    'Import this file'
  );

  const totalsText = (t) =>
    Object.entries(t ?? {})
      .map(([k, v]) => `${k} ${fmt.num(v)}`)
      .join(', ');

  let latest = null;
  if (imp.latest) {
    const numeric = new Set(Object.keys(imp.latest.totals ?? {}));
    const box = h('div', {});
    dataTable(box, {
      label: 'Latest imported Generative AI report',
      columns: imp.latest.columns.map((c) => ({
        key: c,
        label: c,
        wrap: !numeric.has(c),
        align: numeric.has(c) ? 'right' : undefined,
        format: numeric.has(c) ? (v) => (v === '' ? '' : String(v)) : undefined,
      })),
      rows: imp.latest.rows,
      pageSize: 10,
    });
    latest = h(
      'div',
      { class: 'ai-snapshots' },
      h(
        'h3',
        { style: { fontSize: '16px', marginBottom: '6px' } },
        `Latest file, imported ${fmt.date(imp.latest.date)}`
      ),
      h(
        'p',
        { class: 'muted small', style: { marginBottom: '8px' } },
        `${fmt.plural(imp.latest.rowCount, 'row', 'rows')}. The table shows the first 50.`
      ),
      box
    );
  }

  return h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'section-head' },
      h('h2', { class: 'section-title' }, "Google's Generative AI report"),
      h(
        'span',
        { class: 'section-note' },
        imp.count ? `${fmt.plural(imp.count, 'snapshot', 'snapshots')} kept so far.` : 'Nothing imported yet.'
      )
    ),
    h(
      'p',
      {},
      'In Search Console, open the Generative AI report, press Export and choose Download CSV, then pick that file here. Search Console has no way for the desk to fetch it. Each file is kept as a dated snapshot, so a trend builds up.'
    ),
    h('div', { class: 'ai-import' }, file, button),
    imp.trend.length
      ? h(
          'ul',
          { class: 'side-list ai-snapshots' },
          [...imp.trend]
            .reverse()
            .map((t) =>
              h(
                'li',
                {},
                h('span', { class: 'side-date' }, t.dateText),
                h(
                  'div',
                  { class: 'small muted' },
                  `${fmt.plural(t.rowCount, 'row', 'rows')}${totalsText(t.totals) ? `. Totals: ${totalsText(t.totals)}` : ''}`
                )
              )
            )
        )
      : null,
    latest
  );
}
