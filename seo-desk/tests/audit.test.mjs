import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';

// Everything here is synthetic: invented pages on the real host name, an injected fetch that
// never touches the network, and a temp data folder.

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-audit-'));
process.env.SEO_DESK_DATA = path.join(root, 'data');
fs.mkdirSync(process.env.SEO_DESK_DATA, { recursive: true });
process.env.SEO_DESK_TODAY = '2026-11-10';

const crawl = await import('../lib/audit/crawl.mjs');
const checks = await import('../lib/audit/checks.mjs');
const run = await import('../lib/audit/run.mjs');
const store = await import('../lib/store.mjs');
const { JOBS, createJobs } = await import('../lib/jobs.mjs');
const { createServer } = await import('../server.mjs');
const { invalidate } = await import('../lib/api/model.mjs');

const { fetchPage, extract, checkLink, isAllowedUrl, SITE_ORIGIN } = crawl;
const { CHECKS, GROUPS, buildPage, buildSite, evaluate, scoreOf } = checks;
const { runAudit, compareAudits, saveAudit, listAudits, loadAudit, shouldRunWeeklyAudit, HISTORY_LIMIT } = run;

after(() => fs.rmSync(root, { recursive: true, force: true }));

// ---------------------------------------------------------------- a fake site

const html = (body, { status = 200, headers = {} } = {}) =>
  new Response(body, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8', 'content-encoding': 'gzip', ...headers },
  });

const words = (n) => Array.from({ length: n }, (_, i) => `word${i}`).join(' ');

// One page of HTML. Every default is a good value: a page built from them trips no check.
function pageHtml(path, over = {}) {
  const o = {
    title: `Nurse scheduling rules, part ${path.replace(/\W+/g, ' ').trim() || 'home'}`,
    description: `A plain guide to ${path.replace(/\W+/g, ' ').trim() || 'home'} written for small hospital managers who build the rota by hand every week.`,
    h1: `How the ${path.replace(/\W+/g, ' ').trim() || 'home'} rules work`,
    h1Extra: [],
    lang: 'en',
    viewport: true,
    canonical: `${SITE_ORIGIN}${path === '/' ? '/' : path}`,
    robots: null,
    headings: [
      [2, 'Why the rules matter'],
      [3, 'A worked example'],
    ],
    words: 350,
    jsonld: path.startsWith('/blog/')
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: 'A post',
            datePublished: '2026-10-01',
            author: { '@type': 'Person', name: 'Pradeep' },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home' }],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              { '@type': 'Question', name: 'Why?', acceptedAnswer: { '@type': 'Answer', text: 'Because.' } },
            ],
          },
        ]
      : path === '/'
        ? [{ '@context': 'https://schema.org', '@type': 'Organization', name: 'SimpleScheduleAI' }]
        : [],
    rawJsonld: [],
    links: [
      ['/', 'Home'],
      ['/blog/alpha', 'Alpha post'],
      ['/blog/beta', 'Beta post'],
      ['/about', 'About us'],
      ['https://example.org/source', 'A source'],
    ],
    images: [{ src: '/images/a.webp', alt: 'A chart of shifts', width: 800, height: 400 }],
    headScripts: ['<script type="module" src="/_astro/page.js"></script>'],
    bodyScripts: 2,
    extraHead: '',
    extraBody: '',
    ...over,
  };
  const ld = [...o.jsonld.map((j) => JSON.stringify(j)), ...o.rawJsonld]
    .map((j) => `<script type="application/ld+json">${j}</script>`)
    .join('');
  return `<!doctype html><html${o.lang ? ` lang="${o.lang}"` : ''}><head><meta charset="utf-8">${
    o.title === null ? '' : `<title>${o.title}</title>`
  }${o.description === null ? '' : `<meta name="description" content="${o.description}">`}${
    o.viewport ? '<meta name="viewport" content="width=device-width, initial-scale=1">' : ''
  }${o.canonical ? `<link rel="canonical" href="${o.canonical}">` : ''}${
    o.robots ? `<meta name="robots" content="${o.robots}">` : ''
  }<link rel="stylesheet" href="/_astro/site.css">${o.headScripts.join('')}${ld}${o.extraHead}</head><body><header><nav><a href="/">Home</a></nav></header><main>${
    o.h1 === null ? '' : `<h1>${o.h1}</h1>`
  }${o.h1Extra.map((h) => `<h1>${h}</h1>`).join('')}${o.headings.map(([l, t]) => `<h${l}>${t}</h${l}>`).join('')}<p>${words(o.words)}</p>${o.links
    .map(([h, t]) => `<a href="${h}">${t}</a>`)
    .join(' ')}${o.images
    .map(
      (i) =>
        `<img src="${i.src}"${i.alt === null ? '' : ` alt="${i.alt}"`}${i.width ? ` width="${i.width}"` : ''}${i.height ? ` height="${i.height}"` : ''}>`
    )
    .join(
      ''
    )}${o.extraBody}</main>${Array.from({ length: o.bodyScripts }, (_, i) => `<script src="/_astro/b${i}.js" defer></script>`).join('')}</body></html>`;
}

const GOOD_HEADERS = {
  'content-type': 'text/html; charset=utf-8',
  'content-encoding': 'gzip',
  'strict-transport-security': 'max-age=31536000',
  'x-content-type-options': 'nosniff',
};

// A scenario is plain data: the pages, the sitemap, link answers and the http answer. buildScenario
// turns it into what the checks see, exactly the way runAudit does.
function scenario(mutate) {
  const sc = {
    paths: ['/', '/blog/alpha', '/blog/beta', '/about'],
    over: {},
    headers: {},
    fetched: {},
    sitemap: null,
    linkStatus: {},
    httpHome: { status: 301, location: `${SITE_ORIGIN}/`, error: null },
    extraLinkStatus: {},
  };
  mutate?.(sc);
  return sc;
}

function evaluateScenario(sc) {
  const pages = sc.paths.map((p) => {
    const f = {
      url: `${SITE_ORIGIN}${p}`,
      status: 200,
      finalUrl: `${SITE_ORIGIN}${p}`,
      redirects: [],
      headers: Object.fromEntries(
        Object.entries({ ...GOOD_HEADERS, ...(sc.headers[p] ?? {}) }).filter(([, v]) => v !== undefined)
      ),
      html: pageHtml(p, sc.over[p]),
      ms: 20,
      bytes: 0,
      error: null,
      ...(sc.fetched[p] ?? {}),
    };
    if (!sc.fetched[p]?.bytes) f.bytes = Buffer.byteLength(f.html);
    return buildPage(f, p);
  });
  const linkStatus = new Map();
  for (const p of pages)
    for (const t of p.internalTargets) {
      if (!linkStatus.has(t)) linkStatus.set(t, { status: 200, location: null });
    }
  for (const [t, v] of Object.entries(sc.extraLinkStatus)) linkStatus.set(t, v);
  const site = buildSite({
    pages,
    sitemap: new Set(sc.sitemap ?? sc.paths),
    linkStatus,
    httpHome: sc.httpHome,
  });
  return { pages, site, issues: evaluate({ pages, site, clicksOf: () => 0 }) };
}

// ---------------------------------------------------------------- the checks

test('the check list has at least 40 checks in the six groups, each with plain text', () => {
  assert.ok(CHECKS.length >= 40, `only ${CHECKS.length} checks`);
  assert.deepEqual(
    GROUPS.map((g) => g.group),
    ['reachability', 'onpage', 'structured', 'links', 'security', 'speed']
  );
  const ids = new Set();
  for (const c of CHECKS) {
    assert.ok(!ids.has(c.id), `duplicate id ${c.id}`);
    ids.add(c.id);
    assert.ok(
      GROUPS.some((g) => g.group === c.group),
      c.id
    );
    assert.ok(['critical', 'high', 'medium', 'low'].includes(c.severity), `${c.id} severity`);
    assert.ok(['quick win', 'moderate', 'larger job'].includes(c.effort), `${c.id} effort`);
    assert.ok(['high', 'medium', 'low'].includes(c.impact), `${c.id} impact`);
    assert.ok(Array.isArray(c.steps) && c.steps.length >= 2 && c.steps.length <= 4, `${c.id} steps`);
    for (const step of c.steps) {
      assert.ok(typeof step === 'string' && step.length > 15, `${c.id} step`);
      assert.doesNotMatch(step, /[–—]/, `${c.id} step has a dash`);
    }
    assert.equal(typeof c.test, 'function', c.id);
    for (const key of ['what', 'why', 'fix']) {
      const text = typeof c[key] === 'function' ? c[key](3) : c[key];
      assert.ok(typeof text === 'string' && text.length > 20, `${c.id} ${key}`);
      assert.doesNotMatch(text, /[–—]/, `${c.id} ${key} has a dash`);
    }
  }
  for (const g of GROUPS)
    assert.ok(
      CHECKS.some((c) => c.group === g.group),
      `no checks in ${g.group}`
    );
});

test('a good site trips no check', () => {
  const { issues } = evaluateScenario(scenario());
  assert.deepEqual(
    issues.map((i) => i.id),
    []
  );
});

// For each check: how to spoil the good scenario so exactly that check has something to say.
const longTitle = 'T'.repeat(61);
const BAD = {
  'status-not-200': (s) => (s.fetched['/about'] = { status: 500, html: '' }),
  'not-html': (s) =>
    (s.fetched['/about'] = { headers: { ...GOOD_HEADERS, 'content-type': 'application/pdf' }, html: '' }),
  'redirect-chain': (s) =>
    (s.fetched['/about'] = {
      redirects: [
        { from: `${SITE_ORIGIN}/old`, to: `${SITE_ORIGIN}/older`, status: 301 },
        { from: `${SITE_ORIGIN}/older`, to: `${SITE_ORIGIN}/about`, status: 301 },
      ],
    }),
  'redirect-off-host': (s) =>
    (s.fetched['/about'] = {
      status: 301,
      html: '',
      finalUrl: 'https://elsewhere.example/about',
      redirects: [{ from: `${SITE_ORIGIN}/about`, to: 'https://elsewhere.example/about', status: 301 }],
    }),
  'noindex-in-sitemap': (s) => (s.over['/about'] = { robots: 'noindex, follow' }),
  'canonical-missing': (s) => (s.over['/about'] = { canonical: '' }),
  'canonical-elsewhere': (s) => (s.over['/about'] = { canonical: `${SITE_ORIGIN}/somewhere-else` }),
  'sitemap-not-linked': (s) => {
    for (const p of ['/', '/blog/alpha', '/blog/beta']) {
      s.over[p] = {
        links: [
          ['/', 'Home'],
          ['/blog/alpha', 'Alpha post'],
          ['/blog/beta', 'Beta post'],
        ],
      };
    }
  },
  'linked-not-in-sitemap': (s) => {
    s.over['/about'] = {
      links: [
        ['/', 'Home'],
        ['/blog/alpha', 'Alpha post'],
        ['/blog/beta', 'Beta post'],
        ['/hidden-page', 'A page'],
      ],
    };
  },
  'http-not-redirecting': (s) => (s.httpHome = { status: 200, location: null, error: null }),
  'trailing-slash-duplicate': (s) => {
    s.over['/about'] = {
      links: [
        ['/', 'Home'],
        ['/blog/alpha/', 'Alpha post'],
        ['/blog/beta', 'Beta post'],
      ],
    };
    s.extraLinkStatus['/blog/alpha/'] = { status: 200, location: null };
  },
  'title-missing': (s) => (s.over['/about'] = { title: null }),
  'title-long': (s) => (s.over['/about'] = { title: longTitle }),
  'title-short': (s) => (s.over['/about'] = { title: 'Short title' }),
  'title-repeats-name': (s) => (s.over['/about'] = { title: 'Nurse scheduling for nurse managers and nurse leaders' }),
  'title-duplicate': (s) => {
    s.over['/about'] = { title: 'The very same title on two pages' };
    s.over['/blog/alpha'] = { title: 'The very same title on two pages' };
  },
  'description-missing': (s) => (s.over['/about'] = { description: null }),
  'description-long': (s) => (s.over['/about'] = { description: 'd'.repeat(170) }),
  'description-short': (s) => (s.over['/about'] = { description: 'Too short to help anyone.' }),
  'description-duplicate': (s) => {
    const d = 'The same description sits on two different pages here so a searcher learns nothing new from it at all.';
    s.over['/about'] = { description: d };
    s.over['/blog/alpha'] = { description: d };
  },
  'h1-missing': (s) => (s.over['/about'] = { h1: null }),
  'h1-multiple': (s) => (s.over['/about'] = { h1Extra: ['A second main heading'] }),
  'h1-equals-title': (s) =>
    (s.over['/about'] = { title: 'The same words in both places', h1: 'The same words in both places' }),
  'heading-skip': (s) =>
    (s.over['/about'] = {
      headings: [
        [2, 'One'],
        [4, 'Four'],
      ],
    }),
  'thin-post': (s) => (s.over['/blog/alpha'] = { words: 120 }),
  'lang-missing': (s) => (s.over['/about'] = { lang: '' }),
  'viewport-missing': (s) => (s.over['/about'] = { viewport: false }),
  'jsonld-missing-post': (s) => (s.over['/blog/alpha'] = { jsonld: [] }),
  'jsonld-invalid': (s) => (s.over['/about'] = { rawJsonld: ['{"@type": "Article", '] }),
  'article-incomplete': (s) =>
    (s.over['/blog/alpha'] = {
      jsonld: [
        { '@type': 'BlogPosting', headline: 'A post' },
        { '@type': 'BreadcrumbList', itemListElement: [] },
      ],
    }),
  'faq-empty': (s) => (s.over['/about'] = { jsonld: [{ '@type': 'FAQPage', mainEntity: [] }] }),
  'breadcrumb-missing-post': (s) =>
    (s.over['/blog/alpha'] = {
      jsonld: [{ '@type': 'BlogPosting', headline: 'A post', datePublished: '2026-10-01', author: { name: 'P' } }],
    }),
  'org-missing-home': (s) => (s.over['/'] = { jsonld: [] }),
  'internal-link-broken': (s) => (s.extraLinkStatus['/blog/beta'] = { status: 404, location: null }),
  'link-not-checked': (s) => (s.extraLinkStatus['/blog/beta'] = { status: 0, location: null }),
  'page-read-partly': (s) => (s.over['/about'] = { extraBody: `<p>${'x'.repeat(1_100_000)}</p>` }),
  'internal-link-redirects': (s) =>
    (s.extraLinkStatus['/blog/beta'] = { status: 301, location: `${SITE_ORIGIN}/blog/gamma` }),
  'link-empty-text': (s) =>
    (s.over['/about'] = {
      links: [
        ['/', 'Home'],
        ['/blog/alpha', ''],
        ['/blog/beta', 'Beta post'],
      ],
    }),
  'too-many-links': (s) =>
    (s.over['/about'] = {
      links: [['/', 'Home'], ...Array.from({ length: 151 }, (_, i) => [`https://example.org/${i}`, `Link ${i}`])],
    }),
  'external-http-link': (s) =>
    (s.over['/about'] = {
      links: [
        ['/', 'Home'],
        ['/blog/alpha', 'Alpha post'],
        ['http://example.org/plain', 'Plain'],
      ],
    }),
  'email-link-protected': (s) =>
    (s.over['/about'] = {
      links: [
        ['/', 'Home'],
        ['/blog/alpha', 'Alpha post'],
        ['/cdn-cgi/l/email-protection#0a1b2c', 'Email us'],
      ],
    }),
  'hsts-missing': (s) => (s.headers['/'] = { 'strict-transport-security': undefined }),
  'mixed-content': (s) =>
    (s.over['/about'] = {
      images: [{ src: 'http://simplescheduleai.com/old.png', alt: 'Old', width: 10, height: 10 }],
    }),
  'nosniff-missing': (s) => (s.headers['/'] = { 'x-content-type-options': undefined }),
  'cookie-no-secure': (s) => (s.headers['/about'] = { 'set-cookie': ['visit=1; Path=/; HttpOnly'] }),
  'html-over-200kb': (s) => (s.fetched['/about'] = { bytes: 230 * 1024 }),
  'blocking-scripts': (s) =>
    (s.over['/about'] = {
      headScripts: Array.from({ length: 4 }, (_, i) => `<script src="/a${i}.js"></script>`),
    }),
  'img-no-size': (s) => (s.over['/about'] = { images: [{ src: '/i.webp', alt: 'Chart', width: 0, height: 0 }] }),
  'img-no-alt': (s) => (s.over['/about'] = { images: [{ src: '/i.webp', alt: null, width: 10, height: 10 }] }),
  'too-many-scripts': (s) => (s.over['/about'] = { bodyScripts: 16 }),
  'no-compression': (s) => (s.headers['/about'] = { 'content-encoding': undefined }),
};

test('every check has a bad case and every bad case belongs to a check', () => {
  assert.deepEqual(Object.keys(BAD).sort(), CHECKS.map((c) => c.id).sort());
});

for (const check of CHECKS) {
  test(`check ${check.id} fires on a bad page and stays quiet on a good one`, () => {
    const good = evaluateScenario(scenario());
    assert.ok(!good.issues.some((i) => i.id === check.id), 'fired on the good site');

    const bad = evaluateScenario(scenario(BAD[check.id]));
    const issue = bad.issues.find((i) => i.id === check.id);
    assert.ok(issue, `did not fire; fired: ${bad.issues.map((i) => i.id).join(', ')}`);
    assert.equal(issue.group, check.group);
    assert.equal(issue.severity, check.severity);
    assert.ok(issue.pages.length >= 1);
    for (const text of [issue.what, issue.why, issue.fix, ...issue.pages.map((p) => p.detail)]) {
      assert.doesNotMatch(text, /[–—]/);
    }
    if (check.group === 'speed') assert.match(issue.why, /a hint from the page's weight, not measured speed/);
    // Only the check under test fires among its own kind of neighbours that could not follow from it.
    assert.ok(bad.issues.length <= 4, `too many side effects: ${bad.issues.map((i) => i.id).join(', ')}`);
  });
}

test('title-repeats-name: a word of four letters three times, or the site name twice, and not a near miss', () => {
  const fires = (title) =>
    evaluateScenario(scenario((s) => (s.over['/about'] = { title }))).issues.some((i) => i.id === 'title-repeats-name');
  // Fires: the same word of four or more letters three times (any case, whole words).
  assert.equal(fires('Nurse scheduling for nurse managers and nurse leaders'), true);
  assert.equal(fires('SHIFT swaps, shift bids and Shift rules explained'), true);
  // Fires: the site name twice.
  assert.equal(fires('SimpleScheduleAI pricing | SimpleScheduleAI'), true);
  assert.equal(fires('Simple Schedule AI plans and Simple Schedule AI help'), true);
  // Just under: a word twice, the name once, a short word three times, three different words.
  assert.equal(fires('Nurse scheduling for nurse managers and leaders'), false);
  assert.equal(fires('Float pool pricing | SimpleScheduleAI'), false);
  assert.equal(fires('How to staff the ward and the unit and the floor'), false, 'a three letter word is not counted');
  assert.equal(fires('Scheduling rules, scheduling tips and staffing tools'), false);
  // A longer word that merely contains the word does not count as the word.
  assert.equal(fires('Nurse nursery nursing nurses scheduling'), false);
  const check = CHECKS.find((c) => c.id === 'title-repeats-name');
  assert.equal(check.severity, 'low');
  assert.equal(check.group, 'onpage');
  assert.equal(check.editsPage, true);
});

test('archive pages are not reported, and an email protection link is its own low finding, never a broken link', () => {
  const sc = scenario((s) => {
    s.over['/about'] = {
      links: [
        ['/', 'Home'],
        ['/blog/alpha', 'Alpha post'],
        ['/blog/beta', 'Beta post'],
        ['/tag/rotas', 'Rotas'],
        ['/category/guides', 'Guides'],
        ['/blog/2', 'Page 2'],
        ['/cdn-cgi/l/email-protection', 'Email'],
      ],
    };
    s.extraLinkStatus['/cdn-cgi/l/email-protection'] = { status: 404, location: null };
  });
  const { issues } = evaluateScenario(sc);
  assert.deepEqual(
    issues.map((i) => i.id),
    ['email-link-protected']
  );
});

test('email-link-protected: one low setup finding listing each page with its count of protected links', () => {
  const sc = scenario((s) => {
    s.over['/about'] = {
      links: [
        ['/', 'Home'],
        ['/blog/alpha', 'Alpha post'],
        ['/cdn-cgi/l/email-protection#1a2b', 'Email the team'],
        ['/cdn-cgi/l/email-protection#3c4d', 'Email support'],
      ],
    };
    s.over['/blog/beta'] = {
      links: [
        ['/', 'Home'],
        ['/blog/alpha', 'Alpha post'],
        ['/about', 'About us'],
        [`${SITE_ORIGIN}/cdn-cgi/l/email-protection#5e6f`, 'Write to us'],
      ],
    };
    // Other Cloudflare addresses stay exempt and are not email links.
    s.over['/blog/alpha'] = {
      links: [
        ['/', 'Home'],
        ['/blog/beta', 'Beta post'],
        ['/about', 'About us'],
        ['/cdn-cgi/trace', 'Trace'],
      ],
    };
  });
  const { issues } = evaluateScenario(sc);
  assert.deepEqual(
    issues.map((i) => i.id),
    ['email-link-protected']
  );
  const issue = issues[0];
  assert.equal(issue.severity, 'low');
  assert.equal(issue.group, 'links');
  assert.equal(issue.editsPage, false);
  assert.equal(issue.what, '2 pages have an email link that crawlers see as broken.');
  assert.match(issue.why, /Cloudflare scrambles email addresses to hide them from spam collectors\./);
  assert.match(issue.why, /page-not-found reply, so tools such as Ahrefs report a broken link on these pages\./);
  const byPage = Object.fromEntries(issue.pages.map((p) => [p.page, p.detail]));
  assert.deepEqual(Object.keys(byPage).sort(), ['/about', '/blog/beta']);
  assert.match(byPage['/about'], /^2 email links/);
  assert.match(byPage['/blog/beta'], /^1 email link /);
  const check = CHECKS.find((c) => c.id === 'email-link-protected');
  assert.equal(check.setup, true);
  assert.equal(check.editsPage, false);
  const steps = check.steps.join(' ');
  assert.match(steps, /Scrape Shield/);
  assert.match(steps, /Email Address Obfuscation/);
  assert.match(steps, /spam collectors/);
  assert.match(steps, /leave this finding as it is/i);
  assert.match(steps, /a change to the site's setup, not to a page/);
  for (const t of [issue.what, issue.why, issue.fix, ...check.steps, ...issue.pages.map((p) => p.detail)])
    assert.doesNotMatch(t, /[–—]/);
});

test('a data-embed attribute holding an HTML snippet yields no link and no finding', () => {
  const snippet =
    '&lt;a href=&quot;https://simplescheduleai.com/cdn-cgi/l/email-protection#7a8b&quot;&gt;x&lt;/a&gt; <a href=&quot;https://simplescheduleai.com/gone-page&quot;>Stats</a>';
  const button = `<button type="button" data-embed="${snippet}">Copy the embed code</button>`;
  const page = pageHtml('/about', { extraBody: button });
  const hrefs = extract(page, `${SITE_ORIGIN}/about`).links.map((l) => l.href);
  assert.ok(!hrefs.some((h) => /cdn-cgi|gone-page/.test(h)), `links found inside the attribute: ${hrefs.join(', ')}`);
  const { issues } = evaluateScenario(scenario((s) => (s.over['/about'] = { extraBody: button })));
  assert.deepEqual(
    issues.map((i) => i.id),
    []
  );
});

test('a page that cannot be fetched gets one reachability issue and no on-page noise', () => {
  const { issues } = evaluateScenario(
    scenario(
      (s) =>
        (s.fetched['/about'] = {
          status: 0,
          html: '',
          error: 'The page did not answer within 15 seconds.',
          headers: {},
        })
    )
  );
  const ids = issues.map((i) => i.id);
  assert.deepEqual(ids, ['status-not-200']);
  assert.match(issues[0].pages[0].detail, /did not answer/);
});

test('the speed hints say they are hints from weight and the others do not claim to be speed', () => {
  for (const c of CHECKS.filter((x) => x.group === 'speed')) {
    assert.match(
      typeof c.why === 'function' ? c.why(1) : c.why,
      /a hint from the page's weight, not measured speed/,
      c.id
    );
  }
});

// ---------------------------------------------------------------- extract

test('extract reads the head, headings, links, images, structured data and scripts', () => {
  const page = `<!doctype html><html lang="en-US"><head><title>  Rules &amp; shifts
  </title><meta name="description" content="Plain &quot;rules&quot;"><meta name="robots" content="NoIndex"><meta name="viewport" content="width=device-width"><link rel="canonical" href="https://simplescheduleai.com/a"><meta property="og:title" content="OG t"><meta property="og:description" content="OG d"><meta property="og:image" content="https://simplescheduleai.com/i.png"><script src="/x.js"></script><script src="/y.js" async></script><script type="module" src="/m.js"></script><script type="application/ld+json">{"@type":"Article","headline":"H"}</script><script type="application/ld+json">{oops</script><link rel="stylesheet" href="/a.css"><link rel="stylesheet" href="/b.css"></head>
  <body><!-- <a href="/commented">no</a> --><main><h1>Main <em>title</em></h1><h2>Sub</h2><h4>Deep</h4><p>One two three four five.</p>
  <a href="/inner/page#frag">Inner link</a> <a href="https://simplescheduleai.com/abs">Absolute</a> <a href="http://example.org/x">Out</a> <a href="mailto:a@b.c">Mail</a> <a href="#top">Top</a> <a href="/icon"><img src="/i.png" alt="Icon only"></a> <a href="/none"></a> <a href='/single'>Single quoted</a>
  <img src="/a.png" alt="A" width="10" height="10"><img src="/b.png"><img src="/c.png" alt="" width="5"><img src="http://simplescheduleai.com/old.png" alt="Old" width="1" height="1">
  <script>var s = "<img src='/inside-script.png'>";</script></main></body></html>`;
  const d = extract(page, 'https://simplescheduleai.com/a');
  assert.equal(d.title, 'Rules & shifts');
  assert.equal(d.description, 'Plain "rules"');
  assert.equal(d.canonical, 'https://simplescheduleai.com/a');
  assert.equal(d.robotsMeta, 'noindex');
  assert.deepEqual(d.h1s, ['Main title']);
  assert.deepEqual(
    d.headings.map((h) => [h.level, h.text]),
    [
      [1, 'Main title'],
      [2, 'Sub'],
      [4, 'Deep'],
    ]
  );
  const byHref = Object.fromEntries(d.links.map((l) => [l.href, l]));
  assert.equal(byHref['https://simplescheduleai.com/inner/page'].internal, true);
  assert.equal(byHref['https://simplescheduleai.com/inner/page'].text, 'Inner link');
  assert.equal(byHref['https://simplescheduleai.com/abs'].internal, true);
  assert.equal(byHref['http://example.org/x'].internal, false);
  assert.equal(byHref['https://simplescheduleai.com/icon'].text, 'Icon only');
  assert.equal(byHref['https://simplescheduleai.com/none'].text, '');
  assert.equal(byHref['https://simplescheduleai.com/single'].text, 'Single quoted');
  assert.ok(
    !d.links.some((l) => /commented|mailto|top$/.test(l.href)),
    'comment, mailto and fragment links are left out'
  );
  assert.equal(d.images.length, 5, 'an image inside a script is not an image');
  assert.deepEqual(
    d.images.map((i) => [i.alt, i.hasSize]),
    [
      ['Icon only', false],
      ['A', true],
      [null, false],
      ['', false],
      ['Old', true],
    ]
  );
  assert.equal(d.jsonLd.length, 2);
  assert.equal(d.jsonLd[0].parsed.headline, 'H');
  assert.equal(d.jsonLd[1].parsed, null);
  assert.ok(d.jsonLd[1].error);
  assert.equal(d.scripts.count, 4, 'the structured data blocks are not scripts');
  assert.equal(d.scripts.blocking, 1, 'only the plain head script blocks');
  assert.equal(d.stylesheets, 2);
  assert.equal(d.lang, 'en-US');
  assert.equal(d.viewport, 'width=device-width');
  assert.deepEqual(d.og, { title: 'OG t', description: 'OG d', image: 'https://simplescheduleai.com/i.png' });
  assert.ok(d.wordCount >= 8 && d.wordCount < 40, `word count ${d.wordCount}`);
  assert.deepEqual(d.mixed, ['http://simplescheduleai.com/old.png']);
});

test('extract copes with an empty or broken document', () => {
  for (const bad of ['', '<', '<html><head><title>x', '<a href="/x">unclosed', '<<<>>>', null, undefined]) {
    const d = extract(bad, 'https://simplescheduleai.com/');
    assert.equal(typeof d.title, 'string');
    assert.ok(Array.isArray(d.links) && Array.isArray(d.images) && Array.isArray(d.jsonLd));
  }
});

test('extract is linear on broken markup: 300 KB of each kind parses in under 500 ms', () => {
  const kinds = {
    'repeated unterminated tag': '<a "',
    'repeated unclosed attribute quote': '<a x="',
    'repeated unclosed comment': '<!--',
    'repeated unclosed script': '<script>',
    'repeated unclosed style': '<style>',
    'repeated unclosed heading': '<h1>',
    'repeated unclosed link': '<a href="/x">',
    'repeated bare angle bracket': '< ',
    'a mix': `<a "<!--<script><h1><a x='`,
  };
  for (const [name, unit] of Object.entries(kinds)) {
    const page = unit.repeat(Math.ceil(300000 / unit.length)).slice(0, 300000);
    const started = performance.now();
    const doc = extract(page, `${SITE_ORIGIN}/`);
    const took = performance.now() - started;
    assert.ok(took < 500, `${name} took ${Math.round(took)} ms`);
    assert.equal(typeof doc.title, 'string', name);
  }
  // a whole 2 MB page of it is cut at 1 MB and still quick
  const big = '<a "'.repeat(600000);
  const started = performance.now();
  const doc = extract(big, `${SITE_ORIGIN}/`);
  assert.ok(performance.now() - started < 500);
  assert.equal(doc.truncated, true);
});

test('extract still leaves script and style contents out, and ends a broken one at the next tag', () => {
  const page = `<html><head><title>T</title><style>.a::after{content:"<a href='/in-style'>x</a>"}</style></head><body><main>
    <script>document.write("<a href='/in-script'>y</a><h1>Fake</h1><img src='/s.png'>")</script>
    <h1>Real heading</h1><p>alpha beta gamma</p>
    <!-- <a href="/in-comment">z</a> -->
    <script>unclosed("<a href='/lost'>x</a>")<a href="/after">After</a></main></body></html>`;
  const d = extract(page, `${SITE_ORIGIN}/`);
  assert.deepEqual(d.h1s, ['Real heading']);
  assert.deepEqual(d.images, []);
  const hrefs = d.links.map((l) => l.href);
  assert.ok(!hrefs.some((h) => /in-style|in-script|in-comment/.test(h)), hrefs.join());
  assert.ok(hrefs.includes(`${SITE_ORIGIN}/after`), 'a script with no end stops at the next tag');
  assert.equal(d.wordCount, 7, 'the text after a script that never ended is read as page text');
  const cut = extract(`<p>${'word '.repeat(300000)}</p>`, `${SITE_ORIGIN}/`);
  assert.equal(cut.truncated, true);
  assert.equal(extract('<p>short</p>').truncated, false);
});

// ---------------------------------------------------------------- fetching

function recorder(handler) {
  const calls = [];
  let inFlight = 0;
  let maxInFlight = 0;
  const fetchImpl = async (url, opts = {}) => {
    inFlight++;
    maxInFlight = Math.max(maxInFlight, inFlight);
    calls.push({
      url: String(url),
      method: opts.method ?? 'GET',
      redirect: opts.redirect,
      at: Date.now(),
      headers: opts.headers,
    });
    try {
      await new Promise((r) => setTimeout(r, 2));
      return await handler(String(url), opts);
    } finally {
      inFlight--;
    }
  };
  return { fetchImpl, calls, maxInFlight: () => maxInFlight };
}

const redirect = (to, status = 301) => new Response(null, { status, headers: { location: to } });
const FAST = { pauseMs: 0, timeoutMs: 500 };

test('fetchPage returns the page, its headers and its size', async () => {
  const body = pageHtml('/about');
  const { fetchImpl, calls } = recorder(() => html(body, { headers: { 'set-cookie': 'a=1; Secure' } }));
  const r = await fetchPage(`${SITE_ORIGIN}/about`, { fetchImpl, ...FAST });
  assert.equal(r.status, 200);
  assert.equal(r.finalUrl, `${SITE_ORIGIN}/about`);
  assert.deepEqual(r.redirects, []);
  assert.equal(r.html, body);
  assert.equal(r.bytes, Buffer.byteLength(body));
  assert.equal(r.error, null);
  assert.equal(r.headers['content-encoding'], 'gzip');
  assert.ok(r.ms >= 0);
  assert.equal(calls[0].redirect, 'manual');
  assert.equal(calls[0].headers['user-agent'] ?? calls[0].headers['User-Agent'], 'SSAI-SEO-Desk-Audit');
});

test('fetchPage follows redirects by hand, records each hop and stops at 5', async () => {
  const two = recorder((url) => {
    if (url.endsWith('/a')) return redirect('/b');
    if (url.endsWith('/b')) return redirect(`${SITE_ORIGIN}/c`, 308);
    return html('<title>c</title>');
  });
  const r = await fetchPage(`${SITE_ORIGIN}/a`, { fetchImpl: two.fetchImpl, ...FAST });
  assert.equal(r.status, 200);
  assert.equal(r.finalUrl, `${SITE_ORIGIN}/c`);
  assert.deepEqual(r.redirects, [
    { from: `${SITE_ORIGIN}/a`, to: `${SITE_ORIGIN}/b`, status: 301 },
    { from: `${SITE_ORIGIN}/b`, to: `${SITE_ORIGIN}/c`, status: 308 },
  ]);

  const loop = recorder((url) => redirect(`${url}x`));
  const l = await fetchPage(`${SITE_ORIGIN}/loop`, { fetchImpl: loop.fetchImpl, ...FAST });
  assert.equal(l.redirects.length, 5);
  assert.equal(loop.calls.length, 6, 'the first request plus five followed hops');
  assert.match(l.error, /redirect/i);
  assert.equal(l.html, '');
});

test('fetchPage never requests another host, even when a page redirects there', async () => {
  const { fetchImpl, calls } = recorder(() => redirect('https://elsewhere.example/landing'));
  const r = await fetchPage(`${SITE_ORIGIN}/leaves`, { fetchImpl, ...FAST });
  assert.equal(calls.length, 1);
  assert.equal(r.status, 301);
  assert.equal(r.finalUrl, 'https://elsewhere.example/landing');
  assert.equal(r.redirects.length, 1);
  assert.equal(r.error, null);

  const direct = recorder(() => html('x'));
  const d = await fetchPage('https://elsewhere.example/x', { fetchImpl: direct.fetchImpl, ...FAST });
  assert.equal(direct.calls.length, 0);
  assert.equal(d.status, 0);
  assert.match(d.error, /simplescheduleai\.com/);
});

test('isAllowedUrl accepts only the site over https and the one plain http home address', () => {
  assert.equal(isAllowedUrl('https://simplescheduleai.com/'), true);
  assert.equal(isAllowedUrl('https://simplescheduleai.com/blog/x?y=1'), true);
  assert.equal(isAllowedUrl('http://simplescheduleai.com/'), true);
  assert.equal(isAllowedUrl('http://simplescheduleai.com/blog'), false);
  assert.equal(isAllowedUrl('https://www.simplescheduleai.com/'), false);
  assert.equal(isAllowedUrl('https://simplescheduleai.com.evil.example/'), false);
  assert.equal(isAllowedUrl('https://user:pw@simplescheduleai.com/'), false);
  assert.equal(isAllowedUrl('https://simplescheduleai.com:8443/'), false);
  assert.equal(isAllowedUrl('https://example.org/'), false);
  assert.equal(isAllowedUrl('ftp://simplescheduleai.com/'), false);
  assert.equal(isAllowedUrl('not a url'), false);
});

test('fetchPage turns a timeout, a server error, a failed connection and a non-page into plain results', async () => {
  const hang = recorder(() => new Promise(() => {}));
  const t = await fetchPage(`${SITE_ORIGIN}/slow`, { fetchImpl: hang.fetchImpl, pauseMs: 0, timeoutMs: 40 });
  assert.equal(t.status, 0);
  assert.match(t.error, /did not answer/i);
  assert.equal(t.html, '');

  const five = recorder(() => html('<h1>oops</h1>', { status: 500 }));
  const s = await fetchPage(`${SITE_ORIGIN}/boom`, { fetchImpl: five.fetchImpl, ...FAST });
  assert.equal(s.status, 500);
  assert.equal(s.error, null);

  const down = recorder(() => {
    throw new TypeError('fetch failed');
  });
  const c = await fetchPage(`${SITE_ORIGIN}/down`, { fetchImpl: down.fetchImpl, ...FAST });
  assert.equal(c.status, 0);
  assert.match(c.error, /could not be reached/i);

  const pdf = recorder(() => new Response('%PDF-1.4', { status: 200, headers: { 'content-type': 'application/pdf' } }));
  const p = await fetchPage(`${SITE_ORIGIN}/a.pdf`, { fetchImpl: pdf.fetchImpl, ...FAST });
  assert.equal(p.status, 200);
  assert.equal(p.html, '');
  assert.equal(p.headers['content-type'], 'application/pdf');
});

test('fetchPage reads at most 2 MB of a page', async () => {
  const big = '<p>' + 'x'.repeat(3 * 1024 * 1024) + '</p>';
  const { fetchImpl } = recorder(() => html(big));
  const r = await fetchPage(`${SITE_ORIGIN}/huge`, { fetchImpl, ...FAST });
  assert.ok(r.bytes <= 2 * 1024 * 1024, `read ${r.bytes}`);
  assert.ok(r.html.length <= 2 * 1024 * 1024);
});

test('requests go one at a time with a pause between them', async () => {
  const { fetchImpl, calls, maxInFlight } = recorder(() => html('<title>x</title>'));
  await Promise.all(
    [1, 2, 3, 4].map((i) => fetchPage(`${SITE_ORIGIN}/p${i}`, { fetchImpl, pauseMs: 40, timeoutMs: 500 }))
  );
  assert.equal(maxInFlight(), 1);
  for (let i = 1; i < calls.length; i++)
    assert.ok(calls[i].at - calls[i - 1].at >= 35, `gap ${calls[i].at - calls[i - 1].at}`);
});

test('checkLink asks with HEAD, falls back to GET on 405, and never follows', async () => {
  const head = recorder((url, opts) => {
    if (url.endsWith('/gone')) return new Response(null, { status: 404 });
    if (url.endsWith('/nohead')) return opts.method === 'HEAD' ? new Response(null, { status: 405 }) : html('ok');
    if (url.endsWith('/moved')) return redirect('/new');
    return new Response(null, { status: 200 });
  });
  assert.equal((await checkLink(`${SITE_ORIGIN}/fine`, { fetchImpl: head.fetchImpl, ...FAST })).status, 200);
  assert.equal((await checkLink(`${SITE_ORIGIN}/gone`, { fetchImpl: head.fetchImpl, ...FAST })).status, 404);
  const moved = await checkLink(`${SITE_ORIGIN}/moved`, { fetchImpl: head.fetchImpl, ...FAST });
  assert.equal(moved.status, 301);
  assert.equal(moved.location, `${SITE_ORIGIN}/new`);
  const fb = await checkLink(`${SITE_ORIGIN}/nohead`, { fetchImpl: head.fetchImpl, ...FAST });
  assert.equal(fb.status, 200);
  assert.deepEqual(
    head.calls.filter((c) => c.url.endsWith('/nohead')).map((c) => c.method),
    ['HEAD', 'GET']
  );
  assert.ok(head.calls.every((c) => c.redirect === 'manual'));
  const off = await checkLink('https://elsewhere.example/x', { fetchImpl: head.fetchImpl, ...FAST });
  assert.equal(off.status, 0);
  assert.ok(!head.calls.some((c) => c.url.includes('elsewhere')));
});

// ---------------------------------------------------------------- the whole run

function siteFetch({ pages = {}, extra = () => null, httpHome = () => redirect(`${SITE_ORIGIN}/`) } = {}) {
  return recorder((url, opts) => {
    if (url === 'http://simplescheduleai.com/') return httpHome();
    const e = extra(url, opts);
    if (e) return e;
    const p = new URL(url).pathname.replace(/(.)\/$/, '$1');
    if (p in pages) {
      const spec = pages[p];
      return typeof spec === 'function' ? spec(url, opts) : html(spec, { headers: GOOD_HEADERS });
    }
    return opts.method === 'HEAD' ? new Response(null, { status: 404 }) : html('<h1>Not found</h1>', { status: 404 });
  });
}

const PATHS = ['/', '/blog/alpha', '/blog/beta', '/about'];
const goodPages = () => Object.fromEntries(PATHS.map((p) => [p, pageHtml(p)]));
const RUN = { pauseMs: 0, timeoutMs: 500 };

test('a clean site scores 100 with no issues and checks the http address exactly once', async () => {
  const site = siteFetch({ pages: goodPages() });
  const progress = [];
  const result = await runAudit({
    pages: PATHS,
    fetchImpl: site.fetchImpl,
    onProgress: (p) => progress.push(p),
    ...RUN,
  });
  assert.equal(result.pagesChecked, 4);
  assert.deepEqual(result.issues, [], result.issues.map((i) => i.id).join(', '));
  assert.equal(result.score, 100);
  assert.deepEqual(
    result.groups.map((g) => [g.group, g.score]),
    GROUPS.map((g) => [g.group, 100])
  );
  assert.ok(Date.parse(result.startedAt) <= Date.parse(result.finishedAt));
  assert.equal(site.calls.filter((c) => c.url === 'http://simplescheduleai.com/').length, 1);
  assert.ok(progress.length >= 4);
  assert.ok(progress.every((p) => typeof p.phase === 'string'));
});

test('Review Focus 3: a redirect, a timeout, a 500 and a non-page become issues and the run finishes', async () => {
  const pages = {
    ...goodPages(),
    '/moved': () => redirect(`${SITE_ORIGIN}/about`),
    '/slow': () => new Promise(() => {}),
    '/boom': () => html('<h1>oops</h1>', { status: 500 }),
    '/file.pdf': () => new Response('%PDF', { status: 200, headers: { 'content-type': 'application/pdf' } }),
    '/leaves': () => redirect('https://elsewhere.example/there'),
  };
  const site = siteFetch({ pages });
  const all = [...PATHS, '/moved', '/slow', '/boom', '/file.pdf', '/leaves'];
  const result = await runAudit({ pages: all, fetchImpl: site.fetchImpl, pauseMs: 0, timeoutMs: 60 });
  assert.equal(result.pagesChecked, all.length);
  const issue = (id) => result.issues.find((i) => i.id === id);
  const flagged = (id) =>
    issue(id)
      ?.pages.map((p) => p.page)
      .sort();
  assert.deepEqual(flagged('status-not-200'), ['/boom', '/slow']);
  assert.deepEqual(flagged('not-html'), ['/file.pdf']);
  assert.deepEqual(flagged('redirect-off-host'), ['/leaves']);
  assert.ok(result.score < 100 && result.score >= 0);
  assert.ok(
    site.calls.every(
      (c) => /^https:\/\/simplescheduleai\.com\//.test(c.url) || c.url === 'http://simplescheduleai.com/'
    )
  );
  const slow = issue('status-not-200').pages.find((p) => p.page === '/slow');
  assert.match(slow.detail, /did not answer/i);
});

test('only the site host is requested, internal link targets are checked once, and outside links only read as text', async () => {
  const pages = goodPages();
  pages['/about'] = pageHtml('/about', {
    links: [
      ['/', 'Home'],
      ['/blog/alpha', 'Alpha'],
      ['/blog/beta', 'Beta'],
      ['/missing-page', 'Missing'],
      ['/images/chart.png', 'Chart'],
      ['https://example.org/source', 'Outside'],
      ['https://www.simplescheduleai.com/x', 'Other host'],
    ],
  });
  const site = siteFetch({ pages });
  const result = await runAudit({ pages: PATHS, fetchImpl: site.fetchImpl, ...RUN });
  for (const c of site.calls) {
    const u = new URL(c.url);
    assert.ok(
      (u.protocol === 'https:' && u.hostname === 'simplescheduleai.com') || c.url === 'http://simplescheduleai.com/',
      `requested ${c.url}`
    );
  }
  const heads = site.calls.filter((c) => c.method === 'HEAD').map((c) => new URL(c.url).pathname);
  assert.equal(new Set(heads).size, heads.length, 'a target is checked once');
  assert.ok(heads.includes('/missing-page'));
  assert.ok(!heads.includes('/blog/alpha'), 'a page already fetched is not asked about again');
  const broken = result.issues.find((i) => i.id === 'internal-link-broken');
  assert.deepEqual(
    broken.pages.map((p) => p.page),
    ['/about']
  );
  assert.match(broken.pages[0].detail, /missing-page/);
});

test('at most 600 internal link targets are checked', async () => {
  const many = Array.from({ length: 640 }, (_, i) => [`/deep/page-${i}`, `Deep ${i}`]);
  const pages = goodPages();
  pages['/about'] = pageHtml('/about', { links: [['/', 'Home'], ...many] });
  const site = siteFetch({
    pages,
    extra: (url, opts) =>
      opts.method === 'HEAD' && url.includes('/deep/') ? new Response(null, { status: 200 }) : null,
  });
  const result = await runAudit({ pages: PATHS, fetchImpl: site.fetchImpl, ...RUN });
  const heads = site.calls.filter((c) => c.method === 'HEAD' && c.url !== 'http://simplescheduleai.com/');
  assert.ok(heads.length <= 600, `${heads.length} link checks`);
  assert.equal(result.linkTargetsChecked, heads.length);
  assert.ok(result.linkTargetsSkipped >= 40);
});

test('issues carry clicks per page and sort by severity then clicks', async () => {
  const pages = goodPages();
  pages['/about'] = pageHtml('/about', { title: null, description: null });
  pages['/blog/beta'] = pageHtml('/blog/beta', { title: null });
  const site = siteFetch({ pages });
  const result = await runAudit({
    pages: PATHS,
    fetchImpl: site.fetchImpl,
    clicksByPage: { '/blog/beta': 40, '/about': 3 },
    ...RUN,
  });
  const missing = result.issues.find((i) => i.id === 'title-missing');
  assert.deepEqual(
    missing.pages.map((p) => [p.page, p.clicks]),
    [
      ['/blog/beta', 40],
      ['/about', 3],
    ]
  );
  const rank = { critical: 0, high: 1, medium: 2, low: 3 };
  for (let i = 1; i < result.issues.length; i++) {
    assert.ok(rank[result.issues[i - 1].severity] <= rank[result.issues[i].severity]);
  }
  assert.equal(result.issues[0].id, 'title-missing');
});

test('the score is 100 minus the weighted share of pages, floored at 0', () => {
  const issue = (severity, ...pages) => ({
    id: `x-${severity}`,
    group: 'onpage',
    severity,
    pages: pages.map((page) => ({ page })),
  });
  assert.equal(scoreOf([], 10), 100);
  assert.equal(scoreOf([issue('critical', '/a')], 10), 70);
  assert.equal(scoreOf([issue('high', '/a', '/b')], 10), 60, 'a high problem weighs two');
  assert.equal(scoreOf([issue('medium', '/a', '/b')], 10), 80);
  assert.equal(scoreOf([issue('low', '/a', '/b', '/c', '/d')], 10), 96, 'a low priority problem weighs a tenth');
  assert.equal(scoreOf([issue('low', ...'abcdefghij'.split('').map((c) => `/${c}`))], 10), 90);
  // a page counts once, at its worst severity
  assert.equal(
    scoreOf([issue('critical', '/a'), issue('high', '/a'), issue('medium', '/a'), issue('low', '/a')], 10),
    70
  );
  assert.equal(scoreOf([issue('high', '/a'), issue('medium', '/a')], 10), 80);
  // a run saved with the old names still scores: warning counts as medium, notice as low
  assert.equal(scoreOf([issue('warning', '/a', '/b'), issue('notice', '/c')], 10), 79);
  assert.equal(scoreOf([issue('critical', '/a', '/b', '/c', '/d')], 10), 0, 'floored at zero');
  assert.equal(scoreOf([issue('critical', '/a')], 0), 100, 'no pages, nothing wrong to count');
  assert.equal(scoreOf([issue('critical', '/a')], 3, 'links'), 100, 'a group with no issues scores 100');
});

test('a site wide problem counts once against the home page, and pages that were not read add nothing', () => {
  const wide = (severity, ...pages) => ({
    id: `w-${severity}`,
    group: 'security',
    severity,
    siteWide: true,
    pages: pages.map((page) => ({ page })),
  });
  // five orphan pages listed, one critical weight in total
  assert.equal(scoreOf([wide('critical', '/a', '/b', '/c', '/d', '/e')], 10), 70);
  // a home page that already has a worse problem is not counted twice
  const home = { id: 'h', group: 'onpage', severity: 'critical', pages: [{ page: '/' }] };
  assert.equal(scoreOf([home, wide('medium', '/x')], 10), 70);
  // pages outside the audited set never add weight
  const audited = new Set(['/', '/a']);
  const out = { id: 'o', group: 'onpage', severity: 'critical', pages: [{ page: '/linked-only' }, { page: '/a' }] };
  assert.equal(scoreOf([out], 2, null, audited), 0);
  assert.equal(scoreOf([out], 10, null, audited), 70);
  assert.equal(scoreOf([{ ...out, pages: [{ page: '/linked-only' }] }], 10, null, audited), 100);
});

test('the real checks mark the site wide ones, and a run says in words what the score counts', async () => {
  const wide = CHECKS.filter((c) => c.siteWide).map((c) => c.id);
  for (const id of [
    'hsts-missing',
    'nosniff-missing',
    'http-not-redirecting',
    'linked-not-in-sitemap',
    'sitemap-not-linked',
  ]) {
    assert.ok(wide.includes(id), id);
  }
  assert.match(checks.SCORE_NOTE, /Critical problems count most; low priority ones barely move it\./);
  // five orphans in a good site of 4 pages would be one weight, not five
  const sc = scenario((s) => {
    s.paths = ['/', '/a1', '/a2', '/a3', '/a4', '/a5'];
    for (const p of s.paths) s.over[p] = { links: [['/', 'Home']] };
  });
  const { issues, pages } = evaluateScenario(sc);
  const orphans = issues.find((i) => i.id === 'sitemap-not-linked');
  assert.equal(orphans.pages.length, 5);
  assert.equal(orphans.siteWide, true);
  assert.equal(
    scoreOf(issues, pages.length, null, new Set(pages.map((p) => p.path))),
    67, // one high weight (2) against 6 pages
    issues.map((i) => i.id).join(', ')
  );
});

test('a stopped run reports itself and saves nothing half done', async () => {
  const ctrl = new AbortController();
  const site = siteFetch({ pages: goodPages() });
  let n = 0;
  const result = await runAudit({
    pages: PATHS,
    fetchImpl: site.fetchImpl,
    signal: ctrl.signal,
    onProgress: () => {
      if (++n === 2) ctrl.abort();
    },
    ...RUN,
  });
  assert.equal(result.stopped, true);
  assert.equal(result.stoppedEarly, true);
  assert.ok(result.pagesChecked < PATHS.length);
  assert.deepEqual(result.auditedPages, PATHS.slice(0, result.pagesChecked));
  assert.ok(
    !result.issues.some((i) => i.id === 'sitemap-not-linked'),
    'orphans cannot be judged from part of the site'
  );
  assert.equal(typeof result.score, 'number');
});

test('a link check with no answer is asked again once; a second failure is low priority, never a broken link', async () => {
  const pages = goodPages();
  pages['/about'] = pageHtml('/about', {
    links: [
      ['/', 'Home'],
      ['/blog/alpha', 'Alpha'],
      ['/blog/beta', 'Beta'],
      ['/flaky', 'Flaky'],
      ['/dead', 'Dead'],
    ],
  });
  let flaky = 0;
  const site = siteFetch({
    pages,
    extra: (url, opts) => {
      if (opts.method !== 'HEAD') return null;
      if (url.endsWith('/flaky') && ++flaky === 1) throw new TypeError('fetch failed');
      if (url.endsWith('/flaky')) return new Response(null, { status: 200 });
      if (url.endsWith('/dead')) throw new TypeError('fetch failed');
      return null;
    },
  });
  const result = await runAudit({ pages: PATHS, fetchImpl: site.fetchImpl, ...RUN });
  const asked = (end) => site.calls.filter((c) => c.method === 'HEAD' && c.url.endsWith(end)).length;
  assert.equal(asked('/flaky'), 2);
  assert.equal(asked('/dead'), 2, 'asked twice, not a third time');
  assert.ok(!result.issues.some((i) => i.id === 'internal-link-broken'));
  const open = result.issues.find((i) => i.id === 'link-not-checked');
  assert.equal(open.severity, 'low');
  assert.deepEqual(
    open.pages.map((p) => p.page),
    ['/about']
  );
  assert.match(open.pages[0].detail, /\/dead/);
  assert.doesNotMatch(open.pages[0].detail, /flaky/);
});

// ---------------------------------------------------------------- comparing and history

const mkRun = (startedAt, issues, over = {}) => ({
  startedAt,
  finishedAt: startedAt,
  pagesChecked: 10,
  score: 80,
  groups: [],
  issues,
  ...over,
});
const mkIssue = (id, pages, severity = 'warning') => ({
  id,
  group: 'onpage',
  severity,
  what: 'W',
  why: 'Y',
  fix: 'F',
  pages: pages.map((p) => ({ page: p, detail: '', clicks: 0 })),
});

test('compareAudits finds what is new, what was fixed and how much is unchanged', () => {
  const prev = mkRun('2026-11-01T12:00:00.000Z', [mkIssue('title-long', ['/a', '/b']), mkIssue('h1-missing', ['/c'])]);
  const cur = mkRun('2026-11-08T12:00:00.000Z', [
    mkIssue('title-long', ['/b', '/d']),
    mkIssue('lang-missing', ['/e'], 'notice'),
  ]);
  const cmp = compareAudits(prev, cur);
  assert.deepEqual(
    cmp.added.map((i) => [i.id, i.pages.map((p) => p.page)]),
    [
      ['title-long', ['/d']],
      ['lang-missing', ['/e']],
    ]
  );
  assert.deepEqual(
    cmp.fixed.map((i) => [i.id, i.pages.map((p) => p.page)]),
    [
      ['title-long', ['/a']],
      ['h1-missing', ['/c']],
    ]
  );
  assert.equal(cmp.unchanged, 1);
  assert.equal(compareAudits(null, cur), null);
  assert.deepEqual(compareAudits(cur, cur), { added: [], fixed: [], unchanged: 3 });
});

test('a run that stopped early leaves the pages it never reached out of new and fixed', () => {
  const prev = mkRun('2026-11-01T12:00:00.000Z', [mkIssue('title-long', ['/a', '/b', '/c'])]);
  const cur = mkRun('2026-11-08T12:00:00.000Z', [mkIssue('title-long', ['/a', '/d'])], {
    stoppedEarly: true,
    auditedPages: ['/a', '/d', '/b'],
  });
  const cmp = compareAudits(prev, cur);
  assert.deepEqual(
    cmp.fixed.map((i) => i.pages.map((p) => p.page)),
    [['/b']],
    '/c was never reached, so it is not called fixed'
  );
  assert.deepEqual(
    cmp.added.map((i) => i.pages.map((p) => p.page)),
    [['/d']]
  );
  const back = compareAudits(cur, mkRun('2026-11-15T12:00:00.000Z', [mkIssue('title-long', ['/a', '/e'])]));
  assert.deepEqual(back.added, [], 'a page the earlier partial run never reached is not new');
});

test('history keeps the newest 26 runs, in an index, and removes the files that fall off', () => {
  const stamp = (i) => new Date(Date.UTC(2026, 0, 1 + i, 6, 0, 0)).toISOString();
  for (let i = 0; i < 30; i++) saveAudit(mkRun(stamp(i), [mkIssue('title-long', ['/a'])], { score: 50 + i }));
  assert.equal(HISTORY_LIMIT, 26);
  const index = listAudits();
  assert.equal(index.length, 26);
  assert.equal(index[0].startedAt, stamp(29));
  assert.equal(index[25].startedAt, stamp(4));
  assert.deepEqual(index[0].counts, { critical: 0, high: 0, medium: 0, low: 1 }, 'title-long is low today');
  const files = fs.readdirSync(path.join(process.env.SEO_DESK_DATA, 'audits'));
  assert.equal(files.length, 26);
  assert.ok(!files.includes(`${stamp(0)}.json`));
  assert.equal(loadAudit(stamp(29)).score, 79);
  assert.equal(loadAudit(stamp(0)), null);
  assert.equal(loadAudit('../../state/settings'), null, 'a name that is not a run time reads nothing');
  assert.equal(store.readJson('state/audits.json', null).runs.length, 26);
});

// ---------------------------------------------------------------- the weekly option

test('the weekly audit starts on the first Monday refresh only when the setting is on', () => {
  const on = { weeklyAudit: true };
  const off = { weeklyAudit: false };
  assert.equal(
    shouldRunWeeklyAudit({ settings: on, today: '2026-11-09', lastAuditAt: null }),
    true,
    'Monday, never run'
  );
  assert.equal(
    shouldRunWeeklyAudit({ settings: on, today: '2026-11-09', lastAuditAt: '2026-11-02T06:10:00.000Z' }),
    true
  );
  assert.equal(shouldRunWeeklyAudit({ settings: off, today: '2026-11-09', lastAuditAt: null }), false, 'setting off');
  assert.equal(shouldRunWeeklyAudit({ settings: {}, today: '2026-11-09', lastAuditAt: null }), false, 'default off');
  assert.equal(shouldRunWeeklyAudit({ settings: on, today: '2026-11-10', lastAuditAt: null }), false, 'Tuesday');
  assert.equal(shouldRunWeeklyAudit({ settings: on, today: '2026-11-15', lastAuditAt: null }), false, 'Sunday');
  assert.equal(
    shouldRunWeeklyAudit({ settings: on, today: '2026-11-09', lastAuditAt: new Date(2026, 10, 9, 5, 0).toISOString() }),
    false,
    'already audited this Monday'
  );
});

test('the weekly hook starts the audit only when it is due and never throws', async () => {
  const monday = new Date(2026, 10, 9, 7, 0, 0);
  const tuesday = new Date(2026, 10, 10, 7, 0, 0);
  const calls = [];
  const start = async (o) => {
    calls.push(o);
    return { ok: true };
  };
  const base = { readSettings: () => ({ weeklyAudit: true }), lastAudit: () => null, start };
  assert.deepEqual(await run.maybeRunWeeklyAudit({ ...base, now: monday }), { ok: true });
  assert.equal(calls.length, 1);
  assert.equal(await run.maybeRunWeeklyAudit({ ...base, now: tuesday }), null);
  assert.equal(await run.maybeRunWeeklyAudit({ ...base, readSettings: () => ({}), now: monday }), null);
  assert.equal(calls.length, 1);
  const boom = await run.maybeRunWeeklyAudit({
    ...base,
    now: monday,
    start: async () => {
      throw new Error('boom');
    },
  });
  assert.equal(boom, null);
});

test('the weekly audit goes through the single job slot, with a stop signal, and cannot overlap another job', async () => {
  let release;
  let seen = null;
  const jobs = createJobs({
    repoRoot: '/fake',
    afterJob: () => {},
    auditRun: ({ signal }) => {
      seen = signal;
      return new Promise((r) => (release = () => r({ ok: true, note: 'Checked 4 pages.' })));
    },
  });
  const monday = new Date(2026, 10, 9, 7, 0, 0);
  const started = await run.maybeRunWeeklyAudit({
    now: monday,
    readSettings: () => ({ weeklyAudit: true }),
    lastAudit: () => null,
  });
  assert.deepEqual(started, { started: true, key: 'audit' });
  assert.equal(jobs.runningKey(), 'audit');
  assert.equal(jobs.list().find((j) => j.key === 'audit').running, true);
  assert.ok(seen instanceof AbortSignal && !seen.aborted);
  assert.throws(() => jobs.start('keyword-check'), /still running/);
  assert.throws(() => jobs.start('audit'), /still running/);
  // a second weekly start while it runs is refused quietly
  assert.equal(
    await run.maybeRunWeeklyAudit({ now: monday, readSettings: () => ({ weeklyAudit: true }), lastAudit: () => null }),
    null
  );
  release();
  for (let i = 0; i < 50 && jobs.runningKey(); i++) await new Promise((r) => setTimeout(r, 10));
  assert.equal(jobs.runningKey(), null);
});

test('the audit job stops at its time limit and saves what it has, marked stopped early', async () => {
  fs.rmSync(path.join(process.env.SEO_DESK_DATA, 'audits'), { recursive: true, force: true });
  fs.rmSync(path.join(process.env.SEO_DESK_DATA, 'state/audits.json'), { force: true });
  store.writeJson('snap/local.json', { data: { livePages: PATHS.map((p) => ({ page: p })) } });
  const slow = siteFetch({
    pages: Object.fromEntries(
      PATHS.map((p) => [
        p,
        async () => {
          await new Promise((r) => setTimeout(r, 40));
          return html(pageHtml(p), { headers: GOOD_HEADERS });
        },
      ])
    ),
  });
  const lines = [];
  const result = await run.runAuditJob({
    log: (l) => lines.push(l),
    fetchImpl: slow.fetchImpl,
    limitMs: 60,
    pauseMs: 0,
  });
  assert.equal(result.ok, false);
  assert.match(result.note, /Stopped early/);
  const saved = listAudits();
  assert.equal(saved.length, 1);
  assert.equal(saved[0].stoppedEarly, true);
  const full = loadAudit(saved[0].startedAt);
  assert.equal(full.stoppedEarly, true);
  assert.ok(full.pagesChecked >= 1 && full.pagesChecked < PATHS.length, `${full.pagesChecked} pages`);

  // and a run that finishes inside the limit is not marked
  fs.rmSync(path.join(process.env.SEO_DESK_DATA, 'audits'), { recursive: true, force: true });
  fs.rmSync(path.join(process.env.SEO_DESK_DATA, 'state/audits.json'), { force: true });
  const quick = siteFetch({ pages: goodPages() });
  const ok = await run.runAuditJob({ fetchImpl: quick.fetchImpl, pauseMs: 0 });
  assert.equal(ok.ok, true, ok.note);
  assert.equal(loadAudit(listAudits()[0].startedAt).stoppedEarly, false);
});

// ---------------------------------------------------------------- the job

test('the audit job is registered, in process, free and writes nothing in the repo', () => {
  const def = JOBS.find((j) => j.key === 'audit');
  assert.ok(def);
  assert.equal(def.label, 'Run the technical audit');
  assert.equal(def.inProcess, true);
  assert.equal(def.cost, null);
  assert.deepEqual(def.writes, []);
  assert.ok(def.timeoutMs >= 10 * 60 * 1000);
});

test('starting the audit job runs the injected audit with a log and records the outcome', async () => {
  const jobs = createJobs({
    repoRoot: '/fake',
    afterJob: () => {},
    auditRun: async ({ log }) => {
      log('Checked 3 of 4 pages.');
      return { ok: true, note: 'Checked 4 pages. Score 90.' };
    },
  });
  assert.deepEqual(jobs.start('audit'), { started: true, key: 'audit' });
  assert.throws(() => jobs.start('audit'), /still running/);
  for (let i = 0; i < 50 && jobs.runningKey(); i++) await new Promise((r) => setTimeout(r, 10));
  const row = jobs.list().find((j) => j.key === 'audit');
  assert.equal(row.running, false);
  assert.equal(row.last.ok, true);
  assert.equal(row.last.summary, 'Checked 4 pages. Score 90.');
  assert.ok(row.last.tail.includes('Checked 3 of 4 pages.'));
});

// ---------------------------------------------------------------- routes

let server;
let port;
before(async () => {
  server = createServer({ autoRefresh: false, staticDir: root });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  port = server.address().port;
});
after(async () => {
  await new Promise((r) => server.close(r));
});

function call(method, url, body) {
  return new Promise((resolve, reject) => {
    const payload = body === undefined ? null : JSON.stringify(body);
    const req = http.request(
      {
        host: '127.0.0.1',
        port,
        method,
        path: url,
        headers: payload ? { 'content-type': 'application/json', 'content-length': Buffer.byteLength(payload) } : {},
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          let json = null;
          try {
            json = JSON.parse(text);
          } catch {
            // CSV
          }
          resolve({ status: res.statusCode, headers: res.headers, text, json });
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

test('GET /api/audit with no run yet answers 200 and says it is empty', async () => {
  fs.rmSync(path.join(process.env.SEO_DESK_DATA, 'audits'), { recursive: true, force: true });
  fs.rmSync(path.join(process.env.SEO_DESK_DATA, 'state/audits.json'), { force: true });
  invalidate();
  const r = await call('GET', '/api/audit');
  assert.equal(r.status, 200);
  assert.equal(r.json.empty, true);
  assert.equal(r.json.audit, null);
  assert.equal(r.json.comparison, null);
  assert.deepEqual(r.json.history, []);
  assert.equal(r.json.weeklyAudit, false);
  assert.ok(Array.isArray(r.json.groups) && r.json.groups.length === 6);
});

test('GET /api/audit returns the latest run, its comparison with the one before and the history', async () => {
  const older = mkRun(
    '2026-11-01T12:00:00.000Z',
    [mkIssue('title-long', ['/a', '/b'], 'warning'), mkIssue('h1-missing', ['/c'], 'warning')],
    { score: 70 }
  );
  const newer = mkRun(
    '2026-11-08T12:00:00.000Z',
    [
      mkIssue('title-long', ['/b', '/d'], 'warning'),
      { ...mkIssue('status-not-200', ['/z'], 'critical'), group: 'reachability' },
    ],
    { score: 75, groups: GROUPS.map((g) => ({ group: g.group, label: g.label, score: 90 })) }
  );
  newer.issues[0].pages[0].clicks = 5;
  saveAudit(older);
  saveAudit(newer);
  invalidate();
  const r = await call('GET', '/api/audit');
  assert.equal(r.status, 200);
  assert.equal(r.json.empty, false);
  assert.equal(r.json.audit.startedAt, newer.startedAt);
  assert.equal(r.json.audit.score, 75);
  assert.match(r.json.audit.scoreNote, /Critical problems count most; low priority ones barely move it\./);
  assert.equal(r.json.scoreNote, r.json.audit.scoreNote);
  assert.equal(r.json.audit.stoppedEarly, false);
  assert.deepEqual(r.json.audit.counts, { critical: 1, high: 0, medium: 0, low: 1 });
  assert.equal(r.json.audit.issues[0].id, 'status-not-200', 'critical first');
  const long = r.json.audit.issues.find((i) => i.id === 'title-long');
  assert.deepEqual(
    long.pages.map((p) => [p.page, p.isNew]),
    [
      ['/b', false],
      ['/d', true],
    ]
  );
  assert.deepEqual(r.json.comparison.added.map((i) => i.id).sort(), ['status-not-200', 'title-long']);
  assert.deepEqual(r.json.comparison.fixed.map((i) => i.id).sort(), ['h1-missing', 'title-long']);
  assert.equal(r.json.comparison.unchanged, 1);
  assert.equal(r.json.comparison.since, '2026-11-01T12:00:00.000Z');
  assert.equal(r.json.history.length, 2);
  assert.equal(r.json.history[0].startedAt, newer.startedAt);
  assert.match(r.json.history[0].text, /8 November/);
  assert.ok(r.json.through !== undefined && Array.isArray(r.json.sources));
  assert.doesNotMatch(r.text, /[–—]/);
});

test('GET /api/audit/:startedAt returns an older run and rejects anything that is not a run time', async () => {
  const ok = await call('GET', `/api/audit/${encodeURIComponent('2026-11-01T12:00:00.000Z')}`);
  assert.equal(ok.status, 200);
  assert.equal(ok.json.audit.score, 70);
  assert.equal(ok.json.comparison, null, 'the first run has nothing before it');
  assert.equal((await call('GET', `/api/audit/${encodeURIComponent('2026-11-02T12:00:00.000Z')}`)).status, 404);
  assert.equal((await call('GET', '/api/audit/settings')).status, 400);
  assert.equal((await call('GET', `/api/audit/${encodeURIComponent('../state/settings')}`)).status, 400);
});

test('the CSV lists every issue page with severity, check, group, page, detail, clicks and status', async () => {
  const r = await call('GET', '/api/export/audit.csv');
  assert.equal(r.status, 200);
  assert.notEqual((await call('GET', '/api/export/audit-issues.csv')).status, 200, 'the old alias is gone');
  assert.match(r.headers['content-type'], /text\/csv/);
  const lines = r.text.trim().split('\r\n');
  assert.equal(lines[0], 'Severity,Check,Group,Page,Detail,Clicks,Status,Effort,Impact');
  assert.equal(lines.length, 1 + 3, 'one row per issue page in the latest run');
  assert.ok(lines.some((l) => /,new,[^,]*,[^,]*$/.test(l)));
  assert.ok(lines.some((l) => /,unchanged,[^,]*,[^,]*$/.test(l)));
  assert.ok(lines[1].toLowerCase().startsWith('critical'), 'critical rows first');
});

test('POST /api/audit/settings turns the weekly audit on and off and rejects other values', async () => {
  const on = await call('POST', '/api/audit/settings', { weeklyAudit: true });
  assert.equal(on.status, 200);
  assert.equal(on.json.weeklyAudit, true);
  assert.equal(store.readJson('state/settings.json', {}).weeklyAudit, true);
  invalidate();
  assert.equal((await call('GET', '/api/audit')).json.weeklyAudit, true);
  const off = await call('POST', '/api/audit/settings', { weeklyAudit: false });
  assert.equal(off.json.weeklyAudit, false);
  assert.equal((await call('POST', '/api/audit/settings', { weeklyAudit: 'yes' })).status, 400);
  assert.equal((await call('POST', '/api/audit/settings', {})).status, 400);
});

// ---------------------------------------------------------------- the one-edit-a-week rule in the audit

test('GET /api/audit: each issue says whether its fix edits the page, page rows carry the freeze, and the rule line is there', async () => {
  // A page edit marked done on 9 November freezes /d until 7 December (the lifecycle rule).
  store.writeJson('state/items.json', {
    'near-page-one:/d': { status: 'done', since: '2026-11-09', doneAt: '2026-11-09', page: '/d', isPageEdit: true },
  });
  invalidate();
  const r = await call('GET', '/api/audit');
  assert.equal(r.status, 200);
  assert.equal(
    r.json.ruleLine,
    "Fixing a title or the text of a page counts as that week's one page edit. Site-wide and server fixes do not."
  );
  const long = r.json.audit.issues.find((i) => i.id === 'title-long');
  const down = r.json.audit.issues.find((i) => i.id === 'status-not-200');
  assert.equal(long.editsPage, true, 'shortening a title edits the page');
  assert.equal(down.editsPage, false, 'a page that does not open is a server fix');
  const d = long.pages.find((p) => p.page === '/d');
  assert.equal(d.frozenUntil, '2026-12-07');
  assert.equal(d.frozenUntilText, '7 December');
  assert.equal(long.pages.find((p) => p.page === '/b').frozenUntil, null);
  for (const i of r.json.audit.issues) for (const p of i.pages) assert.ok('frozenUntil' in p, `${i.id} ${p.page}`);
  // The comparison lists carry the same marks.
  for (const i of r.json.comparison.added) assert.equal(typeof i.editsPage, 'boolean');
  store.writeJson('state/items.json', {});
  invalidate();
});

test('every check says whether its fix edits a live page; site settings, redirects, the sitemap and headers do not', () => {
  for (const c of CHECKS) assert.equal(typeof c.editsPage, 'boolean', c.id);
  const edits = new Set(CHECKS.filter((c) => c.editsPage).map((c) => c.id));
  for (const id of [
    'title-long',
    'title-missing',
    'description-short',
    'h1-missing',
    'thin-post',
    'link-empty-text',
    'img-no-alt',
  ])
    assert.ok(edits.has(id), id);
  for (const id of [
    'status-not-200',
    'redirect-chain',
    'redirect-off-host',
    'linked-not-in-sitemap',
    'http-not-redirecting',
    'hsts-missing',
    'nosniff-missing',
    'cookie-no-secure',
    'no-compression',
    'internal-link-broken',
    'sitemap-not-linked',
  ])
    assert.ok(!edits.has(id), id);
  const { issues } = evaluateScenario(
    scenario((sc) => {
      sc.fetched['/about'] = { status: 404, html: '' };
      sc.over['/blog/alpha'] = { title: 'Tiny' };
    })
  );
  assert.ok(issues.length >= 2);
  assert.ok(issues.every((i) => typeof i.editsPage === 'boolean'));
});

test('a run that stopped early says so on the audit and in the history, with N of M pages', async () => {
  const stopped = mkRun('2026-11-09T12:00:00.000Z', [mkIssue('title-long', ['/b'], 'warning')], {
    pagesChecked: 4,
    pagesPlanned: 10,
    stoppedEarly: true,
    auditedPages: ['/a', '/b', '/c', '/d'],
  });
  saveAudit(stopped);
  invalidate();
  const r = await call('GET', '/api/audit');
  assert.equal(r.json.audit.stoppedEarly, true);
  assert.equal(r.json.audit.stoppedNote, 'This run was stopped early. 4 of 10 pages were checked.');
  assert.equal(r.json.history[0].stoppedNote, 'This run was stopped early. 4 of 10 pages were checked.');
  assert.equal(r.json.history[1].stoppedNote, null, 'a full run has no such line');
  assert.equal(listAudits()[0].pagesPlanned, 10, 'the index keeps how many pages the run meant to read');
});

test('runAudit records how many pages it meant to read', async () => {
  const site = siteFetch({ pages: goodPages() });
  const out = await runAudit({ pages: PATHS, fetchImpl: site.fetchImpl, pauseMs: 0 });
  assert.equal(out.pagesPlanned, PATHS.length);
});

test('the audit job note counts in plain plurals', () => {
  assert.equal(
    run.countsSentence({ critical: 0, high: 0, medium: 0, low: 1 }),
    '0 critical, 0 high, 0 medium and 1 low priority'
  );
  assert.equal(
    run.countsSentence({ critical: 2, high: 1, medium: 3, low: 4 }),
    '2 critical, 1 high, 3 medium and 4 low priority'
  );
});

test('no check states a cause as certain', () => {
  const BANNED =
    /\b(usually|always|will rank|struggle|loses|spread|trusted less|hands|passes on|which helps|lets Google)\b/i;
  // a setting's own name is not a claim
  const unnamed = (t) => t.replace(/Always Use HTTPS/g, '');
  for (const c of CHECKS) {
    for (const key of ['what', 'why', 'fix', 'name']) {
      const text = typeof c[key] === 'function' ? c[key](3) : c[key];
      assert.doesNotMatch(unnamed(text), BANNED, `${c.id} ${key}: ${text}`);
    }
    for (const step of c.steps) assert.doesNotMatch(unnamed(step), BANNED, `${c.id} step: ${step}`);
  }
  // The detail lines are plain too: no raw "status 404".
  const down = CHECKS.find((c) => c.id === 'status-not-200');
  assert.equal(down.test({ status: 404, error: null }), 'The page was not found (404).');
  assert.equal(down.test({ status: 503, error: null }), 'The server answered with an error (503).');
  assert.doesNotMatch(down.test({ status: 403, error: null }), /status/);
});

// ---------------------------------------------------------------- phase 3: four levels, effort, impact, steps

test('title-long and description-long stay at the lowest level, and the levels follow their definitions', () => {
  const sev = (id) => CHECKS.find((c) => c.id === id).severity;
  assert.equal(sev('title-long'), 'low');
  assert.equal(sev('description-long'), 'low');
  for (const id of ['status-not-200', 'redirect-off-host', 'noindex-in-sitemap']) assert.equal(sev(id), 'critical', id);
  assert.equal(sev('sitemap-not-linked'), 'high');
  assert.equal(sev('jsonld-invalid'), 'medium');
  for (const level of ['critical', 'high', 'medium', 'low'])
    assert.ok(
      CHECKS.some((c) => c.severity === level),
      `no check at ${level}`
    );
});

test("the last step of every fix says whether it counts as the week's page edit, and the first says where to look", () => {
  for (const c of CHECKS) {
    const last = c.steps[c.steps.length - 1];
    if (c.editsPage) assert.match(last, /counts as that week's one page edit\.$/, c.id);
    else assert.match(last, /does not count as a page edit\./, c.id);
    // a setup change (a host, redirect, header or template fix) says it is safe to hand to Claude
    if (c.setup) {
      assert.equal(c.editsPage, false, c.id);
      assert.match(
        last,
        /This is a change to the site's setup, not to a page, so it is safe to hand to Claude to make\.$/,
        c.id
      );
    } else assert.doesNotMatch(last, /safe to hand to Claude/, c.id);
    assert.match(c.steps[0], /^(Open|Look|Type|Check)/, `${c.id} first step`);
    assert.equal(c.steps.slice(0, -1).filter((t) => /page edit/.test(t)).length, 0, `${c.id} says it only once`);
  }
});

test('an issue from a run carries effort, impact and steps', async () => {
  const pages = goodPages();
  pages['/about'] = pageHtml('/about', { title: null });
  const result = await runAudit({ pages: PATHS, fetchImpl: siteFetch({ pages }).fetchImpl, ...RUN });
  const i = result.issues.find((x) => x.id === 'title-missing');
  assert.equal(i.effort, 'quick win');
  assert.equal(i.impact, 'high');
  assert.equal(i.severity, 'high');
  assert.ok(i.steps.length >= 2);
  assert.match(i.steps.at(-1), /counts as that week's one page edit/);
});

test('a saved run takes its severity from the check as it is today, and old names only for an unknown id', () => {
  const at = '2026-10-01T12:00:00.000Z';
  saveAudit(
    mkRun(at, [
      mkIssue('title-long', ['/a'], 'warning'), // low today
      mkIssue('title-missing', ['/b'], 'critical'), // high today
      mkIssue('retired-check', ['/c'], 'warning'),
      mkIssue('another-retired-check', ['/d'], 'notice'),
    ])
  );
  const loaded = loadAudit(at);
  assert.deepEqual(
    loaded.issues.map((i) => i.severity),
    ['low', 'high', 'medium', 'low']
  );
  assert.deepEqual(listAudits().find((r) => r.startedAt === at).counts, { critical: 0, high: 1, medium: 1, low: 2 });
  // an index line written before the levels existed has only the old names to go on
  store.writeJson('state/audits.json', {
    runs: [{ startedAt: at, score: 80, pagesChecked: 10, counts: { critical: 1, warning: 2, notice: 3 } }],
  });
  assert.deepEqual(listAudits()[0].counts, { critical: 1, high: 0, medium: 2, low: 3 });
});

test('the steps name the places this site is hosted from, and say what to be careful about', () => {
  const steps = (id) => CHECKS.find((c) => c.id === id).steps.join(' ');
  for (const id of ['hsts-missing', 'nosniff-missing']) {
    assert.match(steps(id), /netlify\.toml/, id);
    assert.doesNotMatch(steps(id), /security headers/i, `${id} no such panel in the host`);
  }
  assert.match(steps('hsts-missing'), /Cloudflare/);
  assert.match(steps('hsts-missing'), /Edge Certificates/);
  assert.match(steps('hsts-missing'), /hard to undo/);
  assert.match(steps('hsts-missing'), /short period/);
  assert.match(steps('hsts-missing'), /include subdomains/);
  assert.match(steps('hsts-missing'), /preload/);
  assert.match(steps('no-compression'), /through Cloudflare/);
  assert.match(steps('no-compression'), /may be a one-off/);
  assert.match(CHECKS.find((c) => c.id === 'no-compression').why, /may be a one-off/);
  assert.match(steps('http-not-redirecting'), /Always Use HTTPS/);
  assert.match(steps('http-not-redirecting'), /netlify\.toml/);
  assert.match(steps('noindex-in-sitemap'), /X-Robots-Tag/);
  for (const c of CHECKS) assert.doesNotMatch(c.steps.join(' '), /whoever runs your hosting|hosting settings/i, c.id);
});

test('mixed-content and not-html read alike, and the severity and impact of every check agree', () => {
  const get = (id) => CHECKS.find((c) => c.id === id);
  assert.equal(get('mixed-content').severity, get('not-html').severity);
  assert.equal(get('mixed-content').impact, get('not-html').impact);
  assert.equal(get('hsts-missing').severity, 'medium');
  assert.equal(get('nosniff-missing').severity, 'low');
  // a critical or high problem never carries a low impact
  for (const c of CHECKS.filter((x) => x.severity === 'critical' || x.severity === 'high'))
    assert.notEqual(c.impact, 'low', c.id);
});

test('GET /api/audit gives each issue effort, impact and steps, and a health summary', async () => {
  fs.rmSync(path.join(process.env.SEO_DESK_DATA, 'audits'), { recursive: true, force: true });
  fs.rmSync(path.join(process.env.SEO_DESK_DATA, 'state/audits.json'), { force: true });
  store.writeJson('state/settings.json', { weeklyAudit: false });
  fs.rmSync(path.join(process.env.SEO_DESK_DATA, 'snap/local.json'), { force: true });
  invalidate();
  const empty = await call('GET', '/api/audit');
  assert.deepEqual(empty.json.health, {
    pagesAudited: 0,
    pagesKnown: null,
    openIssues: 0,
    bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
    toFix: 0,
    lastAuditAt: null,
    lastAuditText: null,
    nextAuditAt: null,
    nextAuditText: null,
    score: null,
  });
  const at = '2026-11-08T12:00:00.000Z';
  saveAudit(
    mkRun(
      at,
      [
        { ...mkIssue('status-not-200', ['/z'], 'critical'), group: 'reachability' },
        mkIssue('title-long', ['/a'], 'warning'),
        mkIssue('retired-check', ['/b'], 'warning'),
      ],
      { score: 72, pagesChecked: 12, pagesPlanned: 12 }
    )
  );
  store.writeJson('snap/local.json', {
    data: { livePages: Array.from({ length: 15 }, (_, i) => ({ page: `/p${i}` })) },
    pulledAt: '2026-11-10T06:00:00.000Z',
  });
  invalidate();
  const r = await call('GET', '/api/audit');
  assert.equal(r.status, 200);
  const down = r.json.audit.issues.find((i) => i.id === 'status-not-200');
  assert.equal(down.severity, 'critical');
  assert.equal(down.effort, 'moderate');
  assert.equal(down.impact, 'high');
  assert.ok(down.steps.length >= 2 && down.steps.every((t) => typeof t === 'string'));
  assert.equal(down.editsPage, false);
  assert.deepEqual(
    r.json.audit.issues.map((i) => i.severity),
    ['critical', 'medium', 'low']
  );
  assert.deepEqual(r.json.health, {
    pagesAudited: 12,
    pagesKnown: 15,
    openIssues: 3,
    bySeverity: { critical: 1, high: 0, medium: 1, low: 1 },
    toFix: 1,
    lastAuditAt: at,
    lastAuditText: '8 November',
    nextAuditAt: null,
    nextAuditText: null,
    score: 72,
  });
  assert.doesNotMatch(r.text, /[–—]/);
});

test('health.nextAuditAt is the next Monday when the weekly switch is on, and null when it is off', async () => {
  // the desk's day is Tuesday 10 November 2026; the last audit ran on Sunday 8 November
  store.writeJson('state/settings.json', { weeklyAudit: true });
  invalidate();
  const on = await call('GET', '/api/audit');
  assert.equal(on.json.health.nextAuditAt, '2026-11-16');
  assert.equal(on.json.health.nextAuditText, '16 November');
  store.writeJson('state/settings.json', { weeklyAudit: false });
  invalidate();
  assert.equal((await call('GET', '/api/audit')).json.health.nextAuditAt, null);
});

test('nextWeeklyAuditDate counts a Monday with no audit yet as today', () => {
  const on = { weeklyAudit: true };
  const next = run.nextWeeklyAuditDate;
  assert.equal(next({ settings: { weeklyAudit: false }, today: '2026-11-09' }), null);
  assert.equal(next({ settings: on, today: '2026-11-09', lastAuditAt: '2026-11-02T06:00:00.000Z' }), '2026-11-09');
  assert.equal(next({ settings: on, today: '2026-11-09', lastAuditAt: '2026-11-09T06:00:00.000Z' }), '2026-11-16');
  assert.equal(next({ settings: on, today: '2026-11-15', lastAuditAt: null }), '2026-11-16', 'Sunday');
  assert.equal(next({ settings: on, today: '2026-11-12', lastAuditAt: null }), '2026-11-16');
  assert.equal(next({ settings: on, today: 'nonsense' }), null);
});

test('the CSV carries effort and impact', async () => {
  const r = await call('GET', '/api/export/audit.csv');
  const lines = r.text.trim().split('\r\n');
  assert.equal(lines[0], 'Severity,Check,Group,Page,Detail,Clicks,Status,Effort,Impact');
  assert.match(lines[1], /^Critical,.*,moderate,high$/);
});
