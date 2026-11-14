// Technical audit: is anything on the pages keeping them out of search?
//
// The audit's health card, scores and issues (views/audit.js), what is on Google and what is not, what changed since the last check, Bing crawl problems,
// each issue with what, why and the fix, and the two checks you can run from here.

import { dataTable } from './table.js';
import { jobBlock, tile } from './jobs.js';
import { auditSection } from './audit.js';

const CSS = `
.hl-issue { border: 1px solid var(--line); border-left: 3px solid var(--bad); border-radius: var(--radius); padding: 16px 18px; }
.hl-issue h3 { font-size: 17px; margin-bottom: 6px; }
.hl-issue p { margin: 4px 0; }
.hl-issue ul { margin: 10px 0 0; }
.hl-url { display: flex; justify-content: space-between; gap: 12px; padding: 5px 0; border-top: 1px solid var(--line); font-size: 14px; }
.hl-url > span:first-child { overflow-wrap: anywhere; min-width: 0; }
.hl-url > span:last-child { white-space: nowrap; color: var(--muted); font-variant-numeric: tabular-nums; }
.hl-checks { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
.hl-check { border: 1px solid var(--line); border-radius: var(--radius); padding: 16px 18px; }
.hl-check h3 { font-size: 16px; margin-bottom: 4px; }
.hl-issue.is-warn { border-left-color: var(--warn); }
.hl-issue.is-info { border-left-color: var(--line-strong); }
.hl-url .hl-detail { display: block; color: var(--muted); font-size: 13px; }
.hl-crawlers { margin: 8px 0 0; }
.hl-crawlers li { display: flex; justify-content: space-between; gap: 12px; padding: 4px 0; border-top: 1px solid var(--line); font-size: 14px; }
.hl-raw summary { cursor: pointer; font-size: 13px; color: var(--accent); margin-top: 8px; }
.hl-raw pre { margin: 8px 0 0; max-height: 320px; overflow: auto; font-size: 12px; line-height: 1.5; white-space: pre-wrap; overflow-wrap: anywhere; font-family: ui-monospace, Menlo, Consolas, monospace; }
`;

const SEVERITY = {
  fail: { text: 'Must fix', cls: 'chip-bad' },
  warn: { text: 'Worth a look', cls: 'chip-warn' },
  info: { text: 'For your information', cls: '' },
};

const STATUS = {
  indexed: { text: 'On Google', cls: 'chip-accent' },
  'not-indexed': { text: 'Not on Google', cls: 'chip-bad' },
  unknown: { text: 'Not checked yet', cls: '' },
};

export async function render(el, ctx) {
  const { api, h, fmt } = ctx;
  const [data, jobs, auditData] = await Promise.all([
    api.get('/api/health'),
    api.get('/api/jobs'),
    // A failing audit reply costs only the audit section, never the whole page.
    api.get('/api/audit').catch(() => null),
  ]);
  ctx.envelope(data);
  const audit = auditData
    ? auditSection(ctx, auditData, jobs)
    : {
        node: h(
          'section',
          { class: 'section p2-audit', id: 'technical-audit' },
          h('div', { class: 'section-head' }, h('h2', { class: 'section-title' }, 'Page checks')),
          h(
            'p',
            { class: 'banner banner-warn', role: 'status' },
            'The technical audit could not be loaded just now. The rest of this page is fine. Reload the page to try again.'
          )
        ),
        resume: () => {},
      };

  const sum = data.indexSummary;
  const notChecked = Math.max(0, (sum.live ?? 0) - sum.checked);
  const live = new Map(data.index.map((r) => [r.page, r.links?.live]));

  const siteCheck = jobBlock(ctx, jobs, 'site-check', {
    label: 'Run site check',
    primary: true,
    confirm: {
      title: 'Run the site check?',
      body:
        `This builds the whole site, then looks for broken links, missing or doubled titles and descriptions, and pages nothing links to. It takes a few minutes.\n\n` +
        `It writes only ${data.siteCheck.writes.join(', ')}, the build folder, which is not tracked in git. It costs nothing.`,
      confirmLabel: 'Build and check',
    },
  });
  const indexAll = jobBlock(ctx, jobs, 'index-all', {
    label: 'Check every page on Google now',
    confirm: {
      title: 'Check every page on Google now?',
      body:
        'Each morning the desk asks Search Console about 40 pages, oldest check first. This asks about every live page now, 40 at a time, until each one has a fresh answer.\n\n' +
        'It writes nothing in the repo and costs nothing. It can take half an hour or more, and it stops early if Search Console says its daily limit is used up.',
      confirmLabel: 'Check every page',
    },
  });
  const keywordCheck = jobBlock(ctx, jobs, 'keyword-check', {
    label: 'Check your keyword file',
    confirm: {
      title: 'Check your keyword file?',
      body: 'This checks that every keyword in your keyword file is well formed and points at a real page. It changes no files and costs nothing.',
      confirmLabel: 'Run the check',
    },
  });

  let headline;
  if (!sum.checked) {
    headline =
      `Google has not been asked about any of the ${sum.live ?? ''} live pages yet. Press Refresh now at the top of the page.`.replace(
        '  ',
        ' '
      );
  } else if (sum.notIndexed === 0) {
    headline = `All ${sum.checked} pages the desk checked are on Google.`;
  } else {
    headline = `${sum.indexed} of the ${sum.checked} pages the desk checked are on Google, and ${sum.notIndexed} ${sum.notIndexed === 1 ? 'is' : 'are'} not.`;
  }
  if (sum.checked && notChecked) headline += ` ${notChecked} of the ${sum.live} live pages have not been checked yet.`;

  ctx.mount(
    el,
    h('style', {}, CSS),
    h(
      'div',
      { class: 'page-head' },
      h(
        'div',
        {},
        h('h1', { class: 'page-title' }, 'Technical audit'),
        h('p', { class: 'page-sub' }, 'Problems on the pages themselves that can keep them out of search.'),
        h('p', { class: 'page-sub', style: { marginTop: '2px' } }, headline)
      ),
      h('div', { class: 'row' }, indexAll.button, keywordCheck.button, siteCheck.button)
    ),
    siteCheck.panel,
    keywordCheck.panel,
    indexAll.panel,
    data.empty
      ? h(
          'p',
          { class: 'banner banner-warn' },
          'No data has been pulled yet. Press Refresh now at the top of the page.'
        )
      : null,
    audit.node,
    h(
      'section',
      { class: 'section', 'aria-label': 'Pages on Google in numbers' },
      h(
        'div',
        { class: 'section-head' },
        h('h2', { class: 'section-title' }, 'Pages on Google'),
        h('span', { class: 'section-note' }, 'From the Search Console index checks and Bing.')
      ),
      h(
        'div',
        { class: 'tiles' },
        tile(h, 'On Google', fmt.num(sum.indexed), `of ${fmt.num(sum.checked)} checked`),
        tile(h, 'Not on Google', fmt.num(sum.notIndexed), sum.notIndexed ? 'see the list below' : 'none', {
          dir: sum.notIndexed ? 'down' : '',
        }),
        tile(h, 'Not checked yet', fmt.num(notChecked), `of ${fmt.num(sum.live)} live pages`),
        tile(
          h,
          'Bing crawl problems',
          fmt.num(data.bingCrawlIssues.length),
          data.bingCrawlIssues.length ? 'see the list below' : 'none reported',
          { dir: data.bingCrawlIssues.length ? 'down' : '' }
        )
      )
    ),
    issuesSection(data, ctx, live),
    indexSection(data, ctx),
    changesSection(data, ctx, live),
    bingSection(data, ctx),
    checksSection(data, ctx)
  );

  siteCheck.resume();
  keywordCheck.resume();
  indexAll.resume();
  audit.resume();
}

const pathNode = (h, page, live) =>
  live && /^https:\/\//.test(live) ? h('a', { href: live, target: '_blank', rel: 'noopener' }, page) : page;

// ------------------------------------------------------------------ issues

function issuesSection(data, ctx, live) {
  const { h, fmt } = ctx;
  return h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'section-head' },
      h('h2', { class: 'section-title' }, 'What to fix'),
      h('span', { class: 'section-note' }, 'Most clicks first, using the last 28 days of Search Console.')
    ),
    data.issues.length
      ? h(
          'div',
          { class: 'stack' },
          data.issues.map((i) =>
            h(
              'div',
              { class: `hl-issue${i.severity === 'warn' ? ' is-warn' : i.severity === 'info' ? ' is-info' : ''}` },
              h(
                'div',
                { class: 'row', style: { marginBottom: '6px' } },
                h(
                  'span',
                  { class: `chip ${SEVERITY[i.severity]?.cls ?? ''}`.trim() },
                  SEVERITY[i.severity]?.text ?? 'Must fix'
                ),
                i.source === 'site-check' ? h('span', { class: 'chip' }, 'From the site check') : null
              ),
              h('h3', {}, i.what),
              h('p', {}, h('strong', {}, 'Why it matters: '), i.why),
              h('p', {}, h('strong', {}, 'The fix: '), i.fix),
              i.details?.length
                ? h(
                    'details',
                    { class: 'hl-raw' },
                    h('summary', {}, 'Details from the script'),
                    h('pre', {}, i.details.join('\n'))
                  )
                : null,
              h(
                'ul',
                { class: 'plain-list' },
                i.urls
                  .slice(0, 12)
                  .map((u) =>
                    h(
                      'li',
                      { class: 'hl-url' },
                      h(
                        'span',
                        {},
                        pathNode(h, u.page, live.get(u.page)),
                        u.detail ? h('span', { class: 'hl-detail' }, u.detail) : null
                      ),
                      h('span', {}, `${fmt.plural(u.clicks, 'click', 'clicks')}`)
                    )
                  )
              ),
              i.urls.length > 12 ? h('p', { class: 'small muted' }, `and ${i.urls.length - 12} more.`) : null
            )
          )
        )
      : h('p', { class: 'empty' }, 'Nothing is broken in what the desk can see.')
  );
}

// ------------------------------------------------------------------ indexing table

function indexSection(data, ctx) {
  const { h, fmt } = ctx;
  const box = h('div', {});
  dataTable(box, {
    label: 'Pages and whether Google has them',
    searchKeys: ['page', 'reason'],
    csvHref: '/api/export/health.csv',
    pageSize: 20,
    emptyText: 'Google has not been asked about any page yet. Press Refresh now at the top of the page.',
    filters: [
      { key: 'not', label: 'Not on Google', test: (r) => r.verdict === 'not-indexed' },
      { key: 'on', label: 'On Google', test: (r) => r.verdict === 'indexed' },
      { key: 'unk', label: 'Not checked yet', test: (r) => r.verdict === 'unknown' },
    ],
    rows: data.index.map((r) => ({ ...r, statusText: STATUS[r.verdict]?.text ?? STATUS.unknown.text })),
    columns: [
      {
        key: 'page',
        label: 'Page',
        wrap: true,
        format: (v, r) => pathNode(h, v, r.links?.live),
      },
      {
        key: 'statusText',
        label: 'Status',
        format: (v, r) => h('span', { class: `chip ${STATUS[r.verdict]?.cls ?? ''}`.trim() }, v),
      },
      {
        key: 'reason',
        label: 'Reason',
        wrap: true,
        format: (v) => (v ? v : h('span', { class: 'muted' }, 'nothing to report')),
      },
      {
        key: 'checkedOn',
        label: 'Last checked',
        title: 'The day the desk last asked Search Console about this page',
        format: (v) => (v ? fmt.date(v) : h('span', { class: 'muted' }, 'not yet')),
      },
      {
        key: 'lastCrawl',
        label: 'Last crawl',
        title: 'The last day Google visited the page',
        format: (v) => (v ? fmt.date(v) : h('span', { class: 'muted' }, 'not crawled yet')),
      },
      { key: 'clicks', label: 'Clicks, 28 days', align: 'right', format: (v) => fmt.num(v) },
      {
        key: 'changedSinceLast',
        label: 'Since last check',
        format: (v) =>
          v === 'new-problem'
            ? h('span', { class: 'chip chip-bad' }, 'New problem')
            : v === 'fixed'
              ? h('span', { class: 'chip chip-accent' }, 'Fixed')
              : '',
      },
    ],
  });
  return h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'section-head' },
      h('h2', { class: 'section-title' }, 'Is each page on Google?'),
      h('span', { class: 'section-note' }, data.indexSummary.text ?? '')
    ),
    box
  );
}

// ------------------------------------------------------------------ new and fixed

function changesSection(data, ctx, live) {
  const { h } = ctx;
  const list = (title, pages, none) =>
    h(
      'div',
      {},
      h('h3', { style: { fontSize: '16px', marginBottom: '8px' } }, title),
      pages.length
        ? h(
            'ul',
            { class: 'side-list' },
            pages.map((p) => h('li', { style: { overflowWrap: 'anywhere' } }, pathNode(h, p, live.get(p))))
          )
        : h('p', { class: 'muted' }, none)
    );
  return h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'section-head' },
      h('h2', { class: 'section-title' }, 'What changed'),
      h(
        'span',
        { class: 'section-note' },
        data.comparedWith
          ? `Compared with ${data.comparedWith}.`
          : 'There is nothing to compare with yet. The first comparison appears after the next refresh.'
      )
    ),
    h(
      'div',
      { class: 'cols' },
      list(
        'New since last check',
        data.newSinceLast,
        data.comparedWith ? 'No page has dropped off Google.' : 'Nothing to compare with yet.'
      ),
      list(
        'Fixed since last check',
        data.fixedSinceLast,
        data.comparedWith ? 'No page has come back on Google.' : 'Nothing to compare with yet.'
      )
    )
  );
}

// ------------------------------------------------------------------ Bing

function bingSection(data, ctx) {
  const { h, fmt } = ctx;
  const issues = data.bingCrawlIssues;
  return h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'section-head' },
      h('h2', { class: 'section-title' }, 'Bing crawl problems'),
      h('span', { class: 'section-note' }, 'Pages Bing tried to read and could not.')
    ),
    issues.length
      ? h(
          'ul',
          { class: 'side-list' },
          issues.map((i) =>
            h(
              'li',
              {},
              h('div', { style: { overflowWrap: 'anywhere', fontWeight: 600 } }, i.page ?? i.url),
              h(
                'div',
                { class: 'small muted' },
                `${i.issue}. ${fmt.plural(i.clicks ?? 0, 'click', 'clicks')} in the last 28 days.`
              )
            )
          )
        )
      : h('p', { class: 'empty' }, 'Bing reports no crawl problems.')
  );
}

// ------------------------------------------------------------------ checks

function checksSection(data, ctx) {
  const { h, fmt } = ctx;
  const crawl = data.aiCrawlers;
  return h(
    'section',
    { class: 'section' },
    h('div', { class: 'section-head' }, h('h2', { class: 'section-title' }, 'Other checks')),
    h(
      'div',
      { class: 'hl-checks' },
      h(
        'div',
        { class: 'hl-check' },
        h('h3', {}, 'Sitemap'),
        h(
          'p',
          {},
          `${fmt.plural(data.sitemap.pages, 'page is', 'pages are')} in the sitemap.`,
          data.sitemap.newestLastmod ? ` The newest change is dated ${fmt.date(data.sitemap.newestLastmod)}.` : ''
        )
      ),
      h(
        'div',
        { class: 'hl-check' },
        h('h3', {}, 'Can AI crawlers read the site?'),
        h(
          'p',
          { class: 'small muted' },
          crawl?.note ?? '',
          crawl?.checkedOn ? ` Last read ${fmt.date(crawl.checkedOn)}.` : ''
        ),
        crawl?.error ? h('p', { class: 'small jb-warn' }, crawl.error) : null,
        h(
          'ul',
          { class: 'plain-list hl-crawlers' },
          (crawl?.crawlers ?? []).map((c) =>
            h(
              'li',
              {},
              h('span', {}, c.agent),
              h(
                'span',
                {
                  class:
                    `chip ${c.status === 'Allowed' ? 'chip-accent' : c.status === 'Blocked' ? 'chip-bad' : ''}`.trim(),
                },
                c.status
              )
            )
          )
        )
      ),
      siteCheckCard(data, ctx)
    )
  );
}

// The last site check: one plain line, and the script's whole report folded away.
function siteCheckCard(data, ctx) {
  const { h, fmt } = ctx;
  const sc = data.siteCheck;
  const last = sc.last;
  return h(
    'div',
    { class: 'hl-check' },
    h('h3', {}, 'Site check'),
    h(
      'p',
      {},
      !last
        ? 'Not run yet. Press Run site check at the top of the page.'
        : `Last run ${fmt.ago(last.at)}: ${sc.issues ? `${fmt.plural(sc.issues, 'problem', 'problems')} found, listed under What to fix.` : last.ok ? 'nothing to fix.' : (last.summary ?? 'It did not finish cleanly.')}`
    ),
    sc.unparsed?.length
      ? h(
          'p',
          { class: 'small muted' },
          `${fmt.plural(sc.unparsed.length, 'line', 'lines')} of the report the desk could not read are in the details.`
        )
      : null,
    sc.output?.length
      ? h(
          'details',
          { class: 'hl-raw' },
          h('summary', {}, 'Details from the script'),
          h('pre', {}, sc.output.join('\n'))
        )
      : null
  );
}
