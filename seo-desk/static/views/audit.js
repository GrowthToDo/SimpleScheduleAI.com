// The technical audit section of the Technical audit page: the score and six group scores, what
// is new and fixed since the run before, every issue by severity (critical, high, medium, low)
// with its effort and impact tags, what, why, the numbered steps to fix it and the pages (most
// clicks first), filters by severity and "Show quick wins", the history of runs, the run button,
// the weekly switch and the CSV.
//
//   auditSection(ctx, data, jobs) -> {node, resume}
//     data  the reply of GET /api/audit; jobs the reply of GET /api/jobs
//
// The pure helpers below import nothing from the browser, so node tests can run them. Page paths,
// issue details and messages are data and go in as text.

import { jobBlock } from './jobs.js';

export const SPEED_LINE = "Hints from the page's weight, not measured speed.";

export const SEVERITIES = [
  {
    key: 'critical',
    label: 'Critical',
    note: 'Fix these first. They can stop a page being found or read.',
    chip: 'chip-bad',
  },
  { key: 'high', label: 'High', note: 'A gap in how Google finds or serves pages. Fix soon.', chip: 'chip-warn' },
  { key: 'medium', label: 'Medium', note: 'Worth fixing when you have an hour.', chip: 'sev-medium' },
  { key: 'low', label: 'Low', note: 'Small things to tidy when you are on the page anyway.', chip: '' },
];

const SEVERITY_WORD = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' };
const EFFORT_WORD = { 'quick win': 'Quick win', moderate: 'Moderate', 'larger job': 'Larger job' };
const IMPACT_WORD = { high: 'High impact', medium: 'Medium impact', low: 'Low impact' };
const PAGES_SHOWN = 10;
const SITE = 'https://simplescheduleai.com';

// Issues in severity groups, worst first, leaving out empty groups. Inside a group the server's
// order stays (most clicks first).
export function bySeverity(issues) {
  return SEVERITIES.map((s) => ({ ...s, issues: (issues ?? []).filter((i) => i.severity === s.key) })).filter(
    (g) => g.issues.length
  );
}

// The colour band of a score: 90 and up good, 50 to 89 middling, under 50 poor, null unknown.
export function scoreBand(score) {
  if (typeof score !== 'number') return 'none';
  if (score >= 90) return 'good';
  if (score >= 50) return 'mid';
  return 'poor';
}

// The live page and its Search Console report, the same addresses the server builds.
export function auditLinks(page, site = SITE) {
  const base = `https://search.google.com/search-console/performance/search-analytics?resource_id=${encodeURIComponent(`${site}/`)}`;
  return { live: `${site}${page}`, searchConsole: `${base}&page=!${encodeURIComponent(`${site}${page}`)}` };
}

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// "1 critical, 2 high, 9 low", leaving out the zero ones; "nothing found" when all are zero.
export function countsText(counts) {
  const c = counts ?? {};
  const parts = SEVERITIES.map((s) => (c[s.key] ? `${c[s.key]} ${s.key}` : null)).filter(Boolean);
  return parts.length ? parts.join(', ') : 'nothing found';
}

// The issues a filter keeps: one severity (or all), and with quick: true only the quick wins.
export function filterIssues(issues, { severity = null, quick = false } = {}) {
  return (issues ?? []).filter((i) => (!severity || i.severity === severity) && (!quick || i.effort === 'quick win'));
}

// Pages across a list of issues (an issue and a page counted once each).
export const pageCount = (issues) => (issues ?? []).reduce((n, i) => n + i.pages.length, 0);

// ------------------------------------------------------------------ the section

let weeklySaving = false;

export function auditSection(ctx, data, jobs) {
  const { h } = ctx;
  const job = jobBlock(ctx, jobs, 'audit', {
    label: 'Run the technical audit',
    confirm: {
      title: 'Run the technical audit?',
      body:
        'The desk reads every live page on the public site, one at a time, and checks titles, descriptions, headings, links, structured data, security and page weight. It takes about four minutes.\n\n' +
        'It fetches only your own live pages, costs nothing and writes no file in the repo.',
      confirmLabel: 'Run the audit',
    },
  });
  const body = h('div', {});
  const head = h(
    'div',
    { class: 'section-head p2-audit-head' },
    h('h2', { class: 'section-title' }, 'Page checks'),
    h(
      'div',
      { class: 'row' },
      weeklySwitch(ctx, data.weeklyAudit),
      data.audit
        ? h('a', { class: 'btn btn-small btn-quiet', href: '/api/export/audit.csv', download: '' }, 'Download CSV')
        : null,
      data.audit ? job.button : null
    )
  );

  const showRun = async (startedAt) => {
    try {
      const run = startedAt ? await ctx.api.get(`/api/audit/${encodeURIComponent(startedAt)}`) : data;
      draw(run, startedAt !== null);
      body.scrollIntoView({ block: 'start', behavior: 'smooth' });
    } catch (e) {
      ctx.toast(e.message, 'error');
    }
  };

  const draw = (run, older) => {
    body.replaceChildren();
    if (!run.audit) {
      ctx.mount(
        body,
        h(
          'div',
          { class: 'p2-audit-empty' },
          h('p', {}, h('strong', {}, 'The technical audit has not run yet.')),
          h(
            'p',
            { class: 'muted' },
            'It reads every live page on the site, about 150 of them, and lists what to fix: missing titles, broken links, pages Google is told to skip, missing structured data and heavy pages. It takes about four minutes, costs nothing and writes no file in the repo.'
          ),
          h('div', { style: { marginTop: '12px' } }, job.button)
        )
      );
      return;
    }
    const a = run.audit;
    ctx.mount(
      body,
      older
        ? h(
            'p',
            { class: 'banner banner-warn' },
            `You are looking at the audit from ${a.startedText}. `,
            h(
              'button',
              { type: 'button', class: 'btn btn-small', style: { marginLeft: '8px' }, onclick: () => showRun(null) },
              'Back to the latest'
            )
          )
        : null,
      h(
        'p',
        { class: 'section-note', style: { marginBottom: '14px' } },
        `${plural(a.pagesChecked, 'page', 'pages')} checked on ${a.startedText}: ${countsText(a.counts)}.`,
        a.linkTargetsSkipped
          ? ` ${plural(a.linkTargetsSkipped, 'linked address was', 'linked addresses were')} not checked, to keep the run short.`
          : ''
      ),
      a.stoppedNote ? h('p', { class: 'banner banner-warn', role: 'status' }, a.stoppedNote) : null,
      run.ruleLine ? h('p', { class: 'p2-rule-line small' }, run.ruleLine) : null,
      older ? null : healthCard(ctx, data.health, data.weeklyAudit),
      scores(ctx, a),
      changes(ctx, run.comparison),
      issueList(ctx, a, Boolean(run.comparison)),
      history(ctx, run.history, a.startedAt, showRun)
    );
  };
  draw(data, false);

  const node = h('section', { class: 'section p2-audit', id: 'technical-audit' }, head, job.panel, body);
  return { node, resume: job.resume };
}

// The health card: pages audited, open issues, the last audit and the next one.
function healthCard(ctx, hl, weekly) {
  const { h, fmt } = ctx;
  if (!hl) return null;
  const tile = (label, value, note, { text = false, warn = false } = {}) =>
    h(
      'div',
      { class: 'tile' },
      h('span', { class: 'tile-label' }, label),
      h('span', { class: `tile-value${text ? ' is-text' : ''}${warn ? ' is-warn' : ''}` }, value),
      note ? h('div', { class: 'tile-change' }, note) : null
    );
  return h(
    'div',
    { class: 'tiles tiles-four au-health', 'aria-label': 'Audit health' },
    tile(
      'Pages audited',
      fmt.num(hl.pagesAudited),
      typeof hl.pagesKnown === 'number' ? `of ${fmt.num(hl.pagesKnown)} live pages` : null
    ),
    // The sidebar's number: the open critical and high issues, the ones to fix first.
    tile(
      'To fix first',
      fmt.num(hl.toFix ?? 0),
      `critical or high, of ${fmt.plural(hl.openIssues, 'open issue', 'open issues')}: ${countsText(hl.bySeverity)}`,
      { warn: (hl.toFix ?? 0) > 0 }
    ),
    tile('Last audit', hl.lastAuditText ?? 'never', hl.lastAuditAt ? fmt.ago(hl.lastAuditAt) : 'run it below', {
      text: true,
    }),
    tile(
      'Next audit',
      hl.nextAuditText ?? 'not scheduled',
      hl.nextAuditText
        ? 'the weekly run, after the morning refresh'
        : weekly
          ? null
          : 'turn on Every Monday to schedule it',
      { text: true }
    )
  );
}

// The weekly switch. It saves at once and says so.
function weeklySwitch(ctx, on) {
  return toggle(ctx, {
    label: 'Every Monday',
    name: 'Run the audit every Monday',
    title: 'Run the audit on its own every Monday, after the morning refresh',
    on,
    save: async (next) => {
      if (weeklySaving) return false;
      weeklySaving = true;
      try {
        await ctx.api.post('/api/audit/settings', { weeklyAudit: next });
        ctx.toast(
          next
            ? 'The audit will run every Monday after the morning refresh.'
            : 'The weekly audit is off. Run it by hand when you want.',
          'success'
        );
        return true;
      } catch (e) {
        ctx.toast(e.message, 'error');
        return false;
      } finally {
        weeklySaving = false;
      }
    },
  });
}

// A switch: a button with role switch. save(next) resolves true when the server took it.
//   label       the words beside it; or states: ['On', 'Off'] for words that follow the switch
//   name        the accessible name when the words beside it are only On or Off
export function toggle(ctx, { label = '', states = null, name = '', title = '', on, save }) {
  const { h } = ctx;
  const words = h('span', { class: 'p2-switch-label' });
  const btn = h(
    'button',
    { type: 'button', class: 'p2-switch', role: 'switch', title },
    h('span', { class: 'p2-switch-track', 'aria-hidden': 'true' }, h('span', { class: 'p2-switch-knob' })),
    words
  );
  if (name) btn.setAttribute('aria-label', name);
  const set = (value) => {
    btn.setAttribute('aria-checked', String(value));
    words.textContent = states ? states[value ? 0 : 1] : label;
  };
  set(Boolean(on));
  btn.addEventListener('click', async () => {
    const next = btn.getAttribute('aria-checked') !== 'true';
    btn.disabled = true;
    const ok = await save(next);
    btn.disabled = false;
    if (ok) set(next);
  });
  return btn;
}

// ------------------------------------------------------------------ scores

function meter(h, score) {
  return h(
    'div',
    { class: `p2-meter is-${scoreBand(score)}`, role: 'presentation' },
    h('span', { style: { width: `${typeof score === 'number' ? Math.max(2, score) : 0}%` } })
  );
}

function scores(ctx, a) {
  const { h } = ctx;
  return h(
    'div',
    { class: 'p2-scores', 'aria-label': 'Audit scores' },
    h(
      'div',
      { class: `p2-score is-${scoreBand(a.score)}` },
      h('span', { class: 'tile-label' }, 'Overall score'),
      h('span', { class: 'p2-score-value' }, a.score ?? 'none', h('small', {}, ' of 100')),
      meter(h, a.score),
      h('span', { class: 'small muted' }, 'Fewer pages with problems, and milder problems, give a higher score.')
    ),
    h(
      'div',
      { class: 'p2-groups' },
      a.groups.map((g) =>
        h(
          'div',
          { class: 'p2-group' },
          h('span', { class: 'tile-label' }, g.label),
          h('span', { class: 'p2-group-value' }, typeof g.score === 'number' ? String(g.score) : 'not scored'),
          meter(h, g.score)
        )
      )
    )
  );
}

// ------------------------------------------------------------------ new and fixed

function changes(ctx, comparison) {
  const { h } = ctx;
  if (!comparison) {
    return h(
      'p',
      { class: 'muted', style: { margin: '18px 0 0' } },
      'This is the first audit, so there is nothing to compare with yet. The next run shows what is new and what got fixed.'
    );
  }
  const list = (title, issues, none, chipClass) =>
    h(
      'div',
      {},
      h('h3', { class: 'p2-h3' }, title, h('span', { class: 'count' }, ` ${pageCount(issues)}`)),
      issues.length
        ? h(
            'ul',
            { class: 'side-list' },
            issues.map((i) =>
              h(
                'li',
                {},
                h(
                  'span',
                  { class: `chip ${chipClass}`.trim(), style: { marginRight: '8px' } },
                  SEVERITY_WORD[i.severity] ?? i.severity
                ),
                h('strong', {}, i.name ?? i.what),
                h(
                  'details',
                  { class: 'p2-fold' },
                  h('summary', {}, plural(i.pages.length, 'page', 'pages')),
                  h(
                    'ul',
                    { class: 'plain-list small' },
                    i.pages.map((p) => h('li', { class: 'p2-path' }, p.page))
                  )
                )
              )
            )
          )
        : h('p', { class: 'muted' }, none)
    );
  return h(
    'div',
    { style: { marginTop: '22px' } },
    h(
      'p',
      { class: 'section-note', style: { marginBottom: '8px' } },
      `Compared with the audit from ${comparison.sinceText}. ${plural(comparison.unchanged, 'problem on a page is', 'problems on pages are')} the same as then.`
    ),
    h(
      'div',
      { class: 'cols' },
      list('New since last audit', comparison.added, 'Nothing new went wrong.', 'chip-bad'),
      list('Fixed since last audit', comparison.fixed, 'Nothing was fixed since then.', 'chip-accent')
    )
  );
}

// ------------------------------------------------------------------ issues

// hasPrev: there is an earlier run, so a page can be new; on a first run nothing is marked new.
// Filters: one severity at a time (or all), and "Show quick wins".
function issueList(ctx, a, hasPrev) {
  const { h } = ctx;
  const groupLabel = new Map(a.groups.map((g) => [g.group, g.label]));
  const state = { severity: null, quick: false };
  const bar = h('div', { class: 'toolbar au-filters' });
  const box = h('div', {});
  const draw = () => {
    const chip = (key, label, n) =>
      h(
        'button',
        {
          type: 'button',
          class: 'chip chip-btn',
          'aria-pressed': String(state.severity === key),
          onclick: () => {
            state.severity = key;
            draw();
          },
        },
        `${label} `,
        h('span', { class: 'count' }, String(n))
      );
    bar.replaceChildren(
      h(
        'div',
        { class: 'chips', role: 'group', 'aria-label': 'Severity' },
        chip(null, 'All', filterIssues(a.issues, { quick: state.quick }).length),
        SEVERITIES.map((sv) =>
          chip(sv.key, sv.label, filterIssues(a.issues, { severity: sv.key, quick: state.quick }).length)
        )
      ),
      h(
        'button',
        {
          type: 'button',
          class: 'chip chip-btn',
          'aria-pressed': String(state.quick),
          title: 'Only the fixes that take minutes',
          onclick: () => {
            state.quick = !state.quick;
            draw();
          },
        },
        'Show quick wins ',
        h('span', { class: 'count' }, String(filterIssues(a.issues, { quick: true }).length))
      )
    );
    const groups = bySeverity(filterIssues(a.issues, state));
    box.replaceChildren(
      ...(groups.length
        ? groups.map((g) =>
            h(
              'div',
              { class: 'p2-sev' },
              h(
                'div',
                { class: 'p2-sev-head' },
                h('span', { class: `chip ${g.chip}`.trim() }, `${g.label} ${g.issues.length}`),
                h('span', { class: 'small muted' }, g.note)
              ),
              g.issues.map((i) => issueCard(ctx, i, groupLabel.get(i.group), hasPrev))
            )
          )
        : [
            h(
              'p',
              { class: 'empty' },
              a.issues?.length ? 'Nothing matches these filters. Pick All.' : 'The audit found nothing to fix.'
            ),
          ])
    );
  };
  draw();
  return h('div', { style: { marginTop: '26px' } }, h('h3', { class: 'p2-h3' }, 'What the audit found'), bar, box);
}

function issueCard(ctx, i, groupLabel, hasPrev) {
  const { h, fmt } = ctx;
  const fresh = hasPrev ? i.pages.filter((p) => p.isNew).length : 0;
  const pagesBox = h('ul', { class: 'plain-list p2-pages' });
  let shown = PAGES_SHOWN;
  const more = h('div', {});
  const drawPages = () => {
    pagesBox.replaceChildren(...i.pages.slice(0, shown).map((p) => pageRow(ctx, p, hasPrev)));
    const left = i.pages.length - shown;
    more.replaceChildren();
    ctx.mount(
      more,
      left > 0
        ? h(
            'button',
            {
              type: 'button',
              class: 'btn btn-small btn-quiet',
              onclick: () => {
                shown = i.pages.length;
                drawPages();
              },
            },
            `Show all ${i.pages.length} pages`
          )
        : null
    );
  };
  drawPages();
  return h(
    'details',
    { class: `p2-issue is-${i.severity}` },
    h(
      'summary',
      {},
      h('span', { class: 'p2-issue-name' }, i.name ?? i.what),
      h(
        'span',
        { class: 'p2-issue-meta' },
        h(
          'span',
          { class: `chip ${SEVERITIES.find((x) => x.key === i.severity)?.chip ?? ''}`.trim() },
          SEVERITY_WORD[i.severity] ?? i.severity
        ),
        i.effort
          ? h(
              'span',
              { class: `chip${i.effort === 'quick win' ? ' chip-accent' : ''}` },
              EFFORT_WORD[i.effort] ?? i.effort
            )
          : null,
        i.impact ? h('span', { class: 'chip' }, IMPACT_WORD[i.impact] ?? i.impact) : null,
        plural(i.pages.length, 'page', 'pages'),
        i.clicks ? `, ${fmt.plural(i.clicks, 'click', 'clicks')} in 28 days` : '',
        fresh && fresh < i.pages.length ? h('span', { class: 'chip chip-warn' }, `${fresh} new`) : null
      )
    ),
    h(
      'div',
      { class: 'p2-issue-body' },
      groupLabel ? h('span', { class: 'chip', style: { marginBottom: '8px' } }, groupLabel) : null,
      i.group === 'speed' ? h('p', { class: 'p2-speed' }, SPEED_LINE) : null,
      h('p', {}, h('strong', {}, 'What: '), i.what),
      h('p', {}, h('strong', {}, 'Why it matters: '), i.why),
      i.steps?.length
        ? [
            h('p', { class: 'au-steps-head' }, h('strong', {}, 'How to fix')),
            h(
              'ol',
              { class: 'au-steps' },
              i.steps.map((st) => h('li', {}, st))
            ),
          ]
        : h('p', {}, h('strong', {}, 'The fix: '), i.fix),
      editLine(ctx, i),
      h('p', { class: 'small muted', style: { marginTop: '10px' } }, 'Pages, most clicks first:'),
      pagesBox,
      more
    )
  );
}

// "Frozen until 7 December" on a page being measured. The date comes from the server's lifecycle
// rule; the page never works the freeze out itself.
export const frozenText = (p) => (p?.frozenUntilText ? `Frozen until ${p.frozenUntilText}` : null);

function frozenChip(h, p) {
  const text = frozenText(p);
  return text
    ? h(
        'span',
        {
          class: 'chip chip-hyp',
          style: { marginLeft: '6px' },
          title: 'This page was changed on purpose and is being measured. Editing it now would blur that verdict.',
        },
        text
      )
    : null;
}

// Whether the fix is a page edit (the week's one) or a site or server change, and which of its
// pages are frozen.
export function editLineText(i) {
  const frozen = (i.pages ?? []).filter((p) => p.frozenUntilText).length;
  const first = i.editsPage
    ? "This fix edits the page, so it counts as that week's one page edit."
    : "This fix does not count as the week's page edit.";
  if (!frozen) return first;
  const which = frozen === 1 ? '1 of these pages is' : `${frozen} of these pages are`;
  return i.editsPage
    ? `${first} ${which} frozen; leave ${frozen === 1 ? 'it' : 'them'} alone until the date shown.`
    : `${first} ${which} being measured, so a change there now may blur that verdict; wait if you can.`;
}

function editLine(ctx, i) {
  return ctx.h('p', { class: `small ${i.editsPage ? 'p2-edit-line' : 'muted'}` }, editLineText(i));
}

function pageRow(ctx, p, hasPrev) {
  const { h, fmt } = ctx;
  const links = auditLinks(p.page);
  const a = (label, href) => h('a', { href, target: '_blank', rel: 'noopener noreferrer' }, label);
  return h(
    'li',
    { class: 'p2-page' },
    h(
      'div',
      { class: 'p2-page-main' },
      h('span', { class: 'p2-path' }, p.page),
      hasPrev && p.isNew ? h('span', { class: 'chip chip-warn', style: { marginLeft: '6px' } }, 'New') : null,
      frozenChip(h, p),
      p.detail ? h('span', { class: 'p2-detail' }, p.detail) : null,
      h(
        'span',
        { class: 'p2-page-links small' },
        a('Open the page', links.live),
        a('Open in Search Console', links.searchConsole)
      )
    ),
    h('span', { class: 'p2-page-clicks' }, fmt.plural(p.clicks ?? 0, 'click', 'clicks'))
  );
}

// ------------------------------------------------------------------ history

function history(ctx, runs, current, showRun) {
  const { h } = ctx;
  if (!runs?.length) return null;
  return h(
    'details',
    { class: 'p2-fold p2-history' },
    h('summary', {}, `Every audit so far (${runs.length})`),
    h(
      'ul',
      { class: 'side-list' },
      runs.map((r, idx) =>
        h(
          'li',
          { class: 'p2-history-row' },
          h(
            'div',
            {},
            h('strong', {}, r.text),
            h(
              'div',
              { class: 'small muted' },
              `Score ${r.score ?? 'none'}, ${plural(r.pagesChecked ?? 0, 'page', 'pages')} checked, ${countsText(r.counts)}.`
            ),
            r.stoppedNote ? h('div', { class: 'small p2-stopped' }, r.stoppedNote) : null
          ),
          r.startedAt === current
            ? h('span', { class: 'chip chip-accent' }, 'Showing')
            : h(
                'button',
                {
                  type: 'button',
                  class: 'btn btn-small',
                  onclick: () => showRun(idx === 0 ? null : r.startedAt),
                },
                'Open'
              )
        )
      )
    )
  );
}
