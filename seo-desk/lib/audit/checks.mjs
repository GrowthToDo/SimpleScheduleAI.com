// The technical audit's checks. Each check reads one fetched page (and the site around it) and says
// whether something is wrong. Everything a check says to the founder is one or two plain sentences:
// what was found, why it matters, how to fix it.
//
// A page check is test(page, site) -> false, true, or a detail sentence. A site check (scope 'site')
// is test(null, site) -> a list of {page, detail}; it covers things that are true of the whole site
// or of the pages together (the http address, the sitemap against the links).

import { extract, pathOfUrl, SITE_HOST } from './crawl.mjs';
import { plain } from '../text.mjs';

export const GROUPS = [
  { group: 'reachability', label: 'Reachability and indexing' },
  { group: 'onpage', label: 'On the page' },
  { group: 'structured', label: 'Structured data' },
  { group: 'links', label: 'Links' },
  { group: 'security', label: 'Security' },
  { group: 'speed', label: 'Speed hints' },
];

// Critical: the page cannot be reached or read, or is blocked from Google. High: a problem that
// can cost clicks on a page that earns them, or a gap across the whole site in how Google finds
// pages. Medium: on-page and structured-data gaps. Low: tidy-ups such as long titles.
export const SEVERITIES = ['critical', 'high', 'medium', 'low'];
export const SEVERITY_RANK = { critical: 0, high: 1, medium: 2, low: 3 };
export const SEVERITY_WEIGHT = { critical: 3, high: 2, medium: 1, low: 0.1 };
export const SEVERITY_LABEL = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' };
export const EFFORTS = ['quick win', 'moderate', 'larger job'];
export const IMPACTS = ['high', 'medium', 'low'];
// Runs saved before the four levels used these two names.
const LEGACY_SEVERITY = { warning: 'medium', notice: 'low' };
export const normSeverity = (s) => (Object.hasOwn(SEVERITY_RANK, s) ? s : (LEGACY_SEVERITY[s] ?? 'low'));
export const SCORE_NOTE =
  'The score is 100 minus the share of pages with problems. Critical problems count most; low priority ones barely move it. A problem that affects the whole site counts once, against the home page.';

const POST_RE = /^\/(blog|articles)\/[^/]+$/;
const ARCHIVE_RE = /^\/(tag|category)\/|^\/(blog|articles)\/\d+$/;
// Where Cloudflare sends an email link it has scrambled (Email Address Obfuscation).
const EMAIL_PROTECTION_RE = /^\/cdn-cgi\/l\/email-protection(\/|$)/;
const KB = 1024;
const HINT = " This is a hint from the page's weight, not measured speed.";

// ---------------------------------------------------------------- pages and the site around them

export const normPath = (p) => {
  const s = String(p ?? '');
  return s.length > 1 ? s.replace(/\/+$/, '') || '/' : s || '/';
};

const hostOf = (u) => {
  try {
    return new URL(u).hostname;
  } catch {
    return '';
  }
};

// A fetched page (see fetchPage) plus what the checks need: its path, whether it is a web page,
// the parsed document, the internal links it holds.
export function buildPage(fetched, pathArg) {
  const path = normPath(pathArg ?? pathOfUrl(fetched.url));
  const headers = fetched.headers ?? {};
  const isHtml = /html/i.test(String(headers['content-type'] ?? ''));
  const hasDoc = fetched.status === 200 && isHtml && Boolean(fetched.html);
  const doc = hasDoc ? extract(fetched.html, fetched.finalUrl || fetched.url) : null;
  const targets = new Set();
  for (const l of doc?.links ?? []) {
    if (!l.internal) continue;
    const t = pathOfUrl(l.href);
    if (/^\/(admin|api|cdn-cgi)(\/|$)/.test(t) || normPath(t) === path) continue;
    targets.add(t);
  }
  return {
    ...fetched,
    headers,
    path,
    isHtml,
    hasDoc,
    doc,
    isHome: path === '/',
    isPost: POST_RE.test(path),
    offHost: Boolean(fetched.finalUrl) && hostOf(fetched.finalUrl) !== SITE_HOST,
    internalTargets: [...targets],
  };
}

// pages: built pages. sitemap: Set of normalised paths. linkStatus: Map of link target path to
// {status, location}. httpHome: {status, location, error} for http://simplescheduleai.com/, or null.
export function buildSite({ pages, sitemap, linkStatus = new Map(), httpHome = null, complete = true }) {
  const byPath = new Map(pages.map((p) => [p.path, p]));
  const inbound = new Map();
  for (const p of pages) {
    for (const t of p.internalTargets) {
      const key = normPath(t);
      if (key === p.path) continue;
      if (!inbound.has(key)) inbound.set(key, new Set());
      inbound.get(key).add(p.path);
    }
  }
  const group = (read) => {
    const m = new Map();
    for (const p of pages) {
      const v = p.hasDoc ? read(p.doc).trim().toLowerCase().replace(/\s+/g, ' ') : '';
      if (!v) continue;
      if (!m.has(v)) m.set(v, []);
      m.get(v).push(p.path);
    }
    return m;
  };
  return {
    pages: byPath,
    sitemap: sitemap instanceof Set ? sitemap : new Set(sitemap),
    inbound,
    linkStatus,
    httpHome,
    complete,
    titles: group((d) => d.title),
    descriptions: group((d) => d.description),
    home: byPath.get('/') ?? null,
  };
}

// ---------------------------------------------------------------- helpers for the checks

const few = (items, n = 3) =>
  items.length <= n ? items.join(', ') : `${items.slice(0, n).join(', ')} and ${items.length - n} more`;
const these = (n, one, many) => (n === 1 ? `1 page ${one}.` : `${n} pages ${many}.`);
const chars = (s) => `${[...s].length} characters`;

function nodesOf(doc) {
  const out = [];
  const walk = (n) => {
    if (Array.isArray(n)) return n.forEach(walk);
    if (n && typeof n === 'object') {
      out.push(n);
      if (n['@graph']) walk(n['@graph']);
    }
  };
  for (const j of doc.jsonLd) if (j.parsed) walk(j.parsed);
  return out;
}
const typesOf = (n) => [].concat(n['@type'] ?? []).map(String);
const hasType = (doc, re) => nodesOf(doc).some((n) => typesOf(n).some((t) => re.test(t)));
const ARTICLE_RE = /^(Article|BlogPosting|NewsArticle|TechArticle)$/;
const ORG_RE = /(Organization|LocalBusiness|Corporation|ProfessionalService)$/;
const present = (v) =>
  Array.isArray(v) ? v.length > 0 : v && typeof v === 'object' ? Object.keys(v).length > 0 : Boolean(v);

// A page's answer code in plain words, with the code in brackets.
function statusText(status) {
  if (status === 404 || status === 410) return `The page was not found (${status}).`;
  if (status >= 500) return `The server answered with an error (${status}).`;
  if (status === 401 || status === 403) return `The page refused to open (${status}).`;
  if (status >= 300 && status < 400) return `The page kept sending visitors on to other addresses (${status}).`;
  return `The page answered with code ${status} instead of opening.`;
}

// A title that says one word of four or more letters three times, or the site name twice. A detail
// sentence when it does, else false. Whole words only, in any case.
const SITE_NAME_RE = /simple\s*schedule\s*ai/gi;
function repeatsInTitle(title) {
  const text = String(title ?? '');
  const counts = new Map();
  for (const w of text.toLowerCase().match(/\p{L}{4,}/gu) ?? []) counts.set(w, (counts.get(w) ?? 0) + 1);
  const word = [...counts].find(([, n]) => n >= 3);
  if (word) return `The word "${word[0]}" appears ${word[1]} times in the title.`;
  const name = (text.match(SITE_NAME_RE) ?? []).length;
  return name >= 2 ? `The site name appears ${name} times in the title.` : false;
}

const onPage = (fn) => (p, site) => (p.hasDoc ? fn(p, p.doc, site) : false);

// ---------------------------------------------------------------- the checks

// Checks whose fix changes what a reader or Google reads on a live page: its words, title,
// description, headings, image descriptions or how much it carries. Doing one counts as that
// week's one page edit. Every other fix is a site setting, a redirect, the sitemap, a template, a
// server header, or a routine link or file address swap that leaves the words alone (routine
// edits do not freeze a page; see lifecycle.mjs).
const PAGE_EDIT_CHECKS = new Set([
  'noindex-in-sitemap',
  'canonical-elsewhere',
  'title-missing',
  'title-long',
  'title-short',
  'title-repeats-name',
  'title-duplicate',
  'description-missing',
  'description-long',
  'description-short',
  'description-duplicate',
  'h1-missing',
  'h1-multiple',
  'h1-equals-title',
  'heading-skip',
  'thin-post',
  'page-read-partly',
  'faq-empty',
  'link-empty-text',
  'too-many-links',
  'html-over-200kb',
  'img-no-alt',
]);

// What a saved run lacks: the effort, impact and steps of a check, by id. Null for an id that is no
// longer a check.
export const guideOf = (id) => {
  const c = CHECKS.find((x) => x.id === id);
  return c ? { effort: c.effort, impact: c.impact, steps: c.steps } : null;
};

// The severity of a saved issue: what the check says today when its id is still a check, so a saved
// run never keeps a stale level; the saved value (old names read as medium and low) otherwise.
export const severityOf = (id, saved) => CHECKS.find((x) => x.id === id)?.severity ?? normSeverity(saved);

// True when fixing check `id` edits a live page (see PAGE_EDIT_CHECKS). Also used for saved runs,
// which were written before issues carried the mark.
export const editsPageOf = (id) => PAGE_EDIT_CHECKS.has(id);

// The last step of every fix says whether it uses up the week's one page edit.
const EDIT_NOTE = "This counts as that week's one page edit.";
const NO_EDIT_NOTE = 'This does not count as a page edit.';
const SETUP_NOTE = "This is a change to the site's setup, not to a page, so it is safe to hand to Claude to make.";

function def(id, group, severity, name, what, why, fix, test, scope = 'page', siteWide = scope === 'site') {
  const g = GUIDE[id];
  if (!g) throw new Error(`The check ${id} has no effort, impact and steps.`);
  const editsPage = editsPageOf(id);
  if (g.setup && editsPage) throw new Error(`The check ${id} is a setup change but counts as a page edit.`);
  const tail = editsPage ? EDIT_NOTE : g.setup ? `${NO_EDIT_NOTE} ${SETUP_NOTE}` : NO_EDIT_NOTE;
  const steps = g.steps.map((t, i) => (i === g.steps.length - 1 ? `${t} ${tail}` : t));
  return {
    id,
    group,
    severity,
    name,
    what,
    why,
    fix,
    test,
    scope,
    siteWide,
    editsPage,
    setup: g.setup === true,
    effort: g.effort,
    impact: g.impact,
    steps,
  };
}

// How big each fix is, how much it may help, and what to do, in plain steps. The first step says
// where to look. def() adds the note about the week's one page edit to the last step.
// effort: 'quick win' (minutes), 'moderate' (an hour or two, or a template change), 'larger job'.
// impact is a hypothesis about how much fixing it may help, not a measured gain.
const GUIDE = {
  'status-not-200': {
    effort: 'moderate',
    impact: 'high',
    steps: [
      'Open each page listed here in your browser and see what it shows.',
      'Check in Netlify whether the latest deploy of the site succeeded, or ask Claude to look at why the page fails.',
      'If the page is gone on purpose, ask Claude to take it out of the sitemap (the site builds the sitemap itself) or to redirect it to the closest live page.',
    ],
  },
  'not-html': {
    effort: 'quick win',
    impact: 'medium',
    steps: [
      'Open the address listed here in your browser and see what it serves.',
      'Ask Claude to take it out of the sitemap (the site builds the sitemap itself), or to make the address serve a normal web page.',
    ],
  },
  'redirect-chain': {
    effort: 'quick win',
    impact: 'medium',
    setup: true,
    steps: [
      'Open the address listed here and note each stop it goes through before the page opens.',
      'Look for the redirect rule for the old address in netlify.toml in the repository, or in Cloudflare under Rules, Redirect Rules, and point it straight at the final page.',
      'Change any links that use the old address to use the final one.',
    ],
  },
  'redirect-off-host': {
    effort: 'moderate',
    impact: 'high',
    setup: true,
    steps: [
      'Open the page listed here and note which website it ends up on.',
      'Look for the redirect rule behind it in netlify.toml in the repository, or in Cloudflare under Rules, Redirect Rules.',
      'If the move was not meant, remove the rule so the page opens on your own site. If it is meant, ask Claude to take the page out of the sitemap.',
    ],
  },
  'noindex-in-sitemap': {
    effort: 'quick win',
    impact: 'high',
    steps: [
      "Open the page listed here and look in its source for the word noindex. The instruction can also come from a response header called X-Robots-Tag, not only from the page. Response headers are short notes the server sends along with every page, which a visitor never sees, so ask Claude to check the page's response headers too.",
      'If the page should be found in search, remove the noindex instruction wherever it comes from.',
      'If it should stay hidden, ask Claude to take it out of the sitemap instead.',
    ],
  },
  'canonical-missing': {
    effort: 'quick win',
    impact: 'medium',
    setup: true,
    steps: [
      "Open the page template (the file every page is built from) and look in the head (the hidden top part of the page code) for a canonical link (the line that names the page's main address).",
      "Add one that names each page's own address.",
    ],
  },
  'canonical-elsewhere': {
    effort: 'quick win',
    impact: 'high',
    steps: [
      "Open the page listed here and find its canonical link, the line in the head (the hidden top part of the page code) that names the page's main address.",
      "Point it at the page's own address, unless the page is meant to be a copy of the other one.",
      'Run the audit again to check it.',
    ],
  },
  'sitemap-not-linked': {
    effort: 'quick win',
    impact: 'high',
    steps: [
      'Look at the pages listed here. No other page links to them.',
      'For each one, pick two related pages and add a link with words that say what the page is about.',
      'Run the audit again to check each page now has links pointing at it.',
    ],
  },
  'linked-not-in-sitemap': {
    effort: 'quick win',
    impact: 'low',
    steps: [
      'Open the pages listed here and decide whether each should be found in search.',
      'For the ones that should be found, ask Claude to change what the sitemap includes (the site builds it by itself, so there is no list to add to by hand). Leave out the ones meant to be private.',
    ],
  },
  'http-not-redirecting': {
    effort: 'moderate',
    impact: 'high',
    setup: true,
    steps: [
      'Type the plain http address of the site into your browser and see where it lands.',
      'In Cloudflare, open SSL/TLS, then Edge Certificates, and check whether Always Use HTTPS is on. Turn it on if it is off.',
      'Or ask Claude to add a permanent redirect from http to https in netlify.toml in the repository. Use one of the two, not both, then run the audit again.',
    ],
  },
  'trailing-slash-duplicate': {
    effort: 'moderate',
    impact: 'low',
    steps: [
      "Open the pages listed here and see which address form their links and canonical link (the line that names the page's main address) use.",
      'Pick one form, with or without the slash, and use it in every link and canonical link.',
    ],
  },
  'title-missing': {
    effort: 'quick win',
    impact: 'high',
    steps: [
      'Open the page listed here and check its title in the browser tab.',
      'Write a title that says what the page is about, with the main words first.',
    ],
  },
  'title-long': {
    effort: 'quick win',
    impact: 'low',
    steps: [
      'Open the pages listed here and read each title in the browser tab.',
      'Shorten each to about 60 characters, with the words that matter first.',
    ],
  },
  'title-short': {
    effort: 'quick win',
    impact: 'low',
    steps: [
      'Open the pages listed here and read each title in the browser tab.',
      'Lengthen each to say what the page is about, up to about 60 characters.',
    ],
  },
  'title-repeats-name': {
    effort: 'quick win',
    impact: 'low',
    steps: [
      'Open the pages listed here and read each title in the browser tab.',
      'Say each word or the site name once, and use the room that frees up for words people search for.',
    ],
  },
  'title-duplicate': {
    effort: 'moderate',
    impact: 'medium',
    steps: [
      'Open the pages listed here side by side and compare their titles.',
      'Decide which page should be found for the words in the title.',
      'Rewrite the title of the other page to say what that page alone covers.',
    ],
  },
  'description-missing': {
    effort: 'quick win',
    impact: 'medium',
    steps: [
      'Open the pages listed here and check that each has no description set.',
      'Write one or two sentences that say what the page offers and why to click.',
    ],
  },
  'description-long': {
    effort: 'quick win',
    impact: 'low',
    steps: [
      'Open the pages listed here and read each description.',
      'Shorten each to one or two sentences, up to about 160 characters.',
    ],
  },
  'description-short': {
    effort: 'quick win',
    impact: 'low',
    steps: [
      'Open the pages listed here and read each description.',
      'Lengthen each to one or two sentences that say why to click, up to about 160 characters.',
    ],
  },
  'description-duplicate': {
    effort: 'moderate',
    impact: 'medium',
    steps: [
      'Open the pages listed here side by side and compare their descriptions.',
      'Write a new description for each page that matches what that page says.',
    ],
  },
  'h1-missing': {
    effort: 'quick win',
    impact: 'medium',
    steps: [
      'Open the page listed here and look for a main heading at the top.',
      'Add one main heading that says what the page is about.',
    ],
  },
  'h1-multiple': {
    effort: 'quick win',
    impact: 'low',
    steps: [
      'Open the page listed here and find its main headings.',
      'Keep the one that says what the page is about and turn the others into smaller headings.',
    ],
  },
  'h1-equals-title': {
    effort: 'quick win',
    impact: 'low',
    steps: [
      'Open the page listed here and compare its title with its main heading.',
      'Reword one of them so each adds something the other does not.',
    ],
  },
  'heading-skip': {
    effort: 'quick win',
    impact: 'low',
    steps: [
      'Open the page listed here and read its headings from top to bottom.',
      'Change the heading that jumps down to the next level, so a heading two is followed by a heading three.',
    ],
  },
  'thin-post': {
    effort: 'larger job',
    impact: 'medium',
    steps: [
      'Open the post listed here and read it against the question it is meant to answer.',
      'Add what is missing so a reader gets the full answer, or decide the post should be folded into a stronger one.',
      'If you fold it in, redirect the old address to the stronger post.',
    ],
  },
  'page-read-partly': {
    effort: 'moderate',
    impact: 'low',
    steps: [
      'Open the page listed here and look at what makes it so large, such as long inline data.',
      'Move that data out of the page, or cut it down, until the page is a normal size.',
    ],
  },
  'lang-missing': {
    effort: 'quick win',
    impact: 'low',
    setup: true,
    steps: [
      'Open the page template (the file every page is built from) and look at the first line of the page code.',
      'Set the language on it, for example en.',
    ],
  },
  'viewport-missing': {
    effort: 'quick win',
    impact: 'medium',
    setup: true,
    steps: [
      'Open the page template (the file every page is built from) and look in the head (the hidden top part of the page code) for the viewport line (the setting that makes a page fit a phone screen).',
      'Add the viewport line if it is missing.',
    ],
  },
  'jsonld-missing-post': {
    effort: 'moderate',
    impact: 'medium',
    setup: true,
    steps: [
      'Open the post template (the file every blog post page is built from) and look for structured data (extra machine readable facts about the page) in the head (the hidden top part of the page code).',
      'Add article structured data that fills in the headline, date and author from each post.',
    ],
  },
  'jsonld-invalid': {
    effort: 'moderate',
    impact: 'medium',
    steps: [
      "Open the page listed here in Google's rich results test (a free Google page that checks the structured data, the extra machine readable facts on a page).",
      'Read the errors it reports and fix the structured data they point at.',
      'Test the page again.',
    ],
  },
  'article-incomplete': {
    effort: 'quick win',
    impact: 'medium',
    steps: [
      "Open the page listed here in Google's rich results test and see which fields are missing.",
      'Add the missing headline, date or author to the article structured data.',
    ],
  },
  'faq-empty': {
    effort: 'quick win',
    impact: 'low',
    steps: [
      'Open the page listed here and find its list of questions.',
      'Add the questions and answers, or remove the empty list.',
    ],
  },
  'breadcrumb-missing-post': {
    effort: 'moderate',
    impact: 'low',
    setup: true,
    steps: [
      'Open the post template (the file every blog post page is built from) and look for breadcrumb structured data (a machine readable trail from the home page to the post) in the head (the hidden top part of the page code).',
      'Add breadcrumb structured data that lists the home page, the blog and the post.',
    ],
  },
  'org-missing-home': {
    effort: 'quick win',
    impact: 'medium',
    setup: true,
    steps: [
      'Open the home page template (the file the home page is built from) and look for organization structured data (machine readable facts about the business) in the head (the hidden top part of the page code).',
      'Add it with the business name, address and logo.',
    ],
  },
  'internal-link-broken': {
    effort: 'quick win',
    impact: 'high',
    steps: [
      'Open each page listed here and find the links named in the detail.',
      'Change each link to the right address, or bring back the page it pointed at.',
    ],
  },
  'link-not-checked': {
    effort: 'quick win',
    impact: 'low',
    steps: [
      'Open the links named in the detail yourself and see whether each page opens.',
      'If one is broken, change the link. If all open, run the audit again later.',
    ],
  },
  'internal-link-redirects': {
    effort: 'quick win',
    impact: 'medium',
    steps: [
      'Open each page listed here and find the links named in the detail.',
      'Change each link to the address the redirect leads to.',
    ],
  },
  'link-empty-text': {
    effort: 'quick win',
    impact: 'low',
    steps: [
      'Open the page listed here and look for links that are only an image or an icon.',
      'Give each one words that describe where it goes.',
    ],
  },
  'too-many-links': {
    effort: 'moderate',
    impact: 'low',
    steps: [
      'Open the page listed here and scroll through its links.',
      'Remove the ones a reader would not follow, such as repeated menus or long lists.',
    ],
  },
  'external-http-link': {
    effort: 'quick win',
    impact: 'low',
    steps: [
      'Open the page listed here and find the links named in the detail.',
      'Change each link to https, or remove it if the other site has no secure version.',
    ],
  },
  'email-link-protected': {
    effort: 'quick win',
    impact: 'low',
    setup: true,
    steps: [
      'Look at the pages listed here: each one shows an email address. What to do is your decision, and either choice below is fine.',
      'Choice 1: in Cloudflare, open Scrape Shield and turn off Email Address Obfuscation. The links become ordinary email links again, so crawlers stop reporting them, but spam collectors can read the addresses.',
      'Choice 2: keep the protection and leave this finding as it is. People who click still get a normal email link.',
    ],
  },
  'hsts-missing': {
    effort: 'moderate',
    impact: 'medium',
    setup: true,
    steps: [
      'Check first where the header could already come from: in Cloudflare, open SSL/TLS, then Edge Certificates, and look at the HTTP Strict Transport Security (HSTS) setting.',
      "To add it in the site's own files, ask Claude to add a Strict-Transport-Security header for all pages in netlify.toml in the repository, next to the other headers (the site also has public/_headers; use one of the two, not both). Start with a short period, for example five minutes.",
      'Caution: HSTS is hard to undo, because browsers remember it. Do not tick "include subdomains" or "preload" until you are sure every address on the domain works over https, and lengthen the period only after the short one has worked.',
    ],
  },
  'mixed-content': {
    effort: 'quick win',
    impact: 'medium',
    steps: [
      'Open the page listed here and find the files named in the detail.',
      'Change the address of each file to https.',
    ],
  },
  'nosniff-missing': {
    effort: 'moderate',
    impact: 'low',
    setup: true,
    steps: [
      "Open netlify.toml in the repository, where the site's other headers are set (the site also has public/_headers; use one of the two, not both), and check that no X-Content-Type-Options line exists yet.",
      'Ask Claude to add the X-Content-Type-Options header, set to nosniff, for all pages.',
    ],
  },
  'cookie-no-secure': {
    effort: 'moderate',
    impact: 'low',
    setup: true,
    steps: [
      'Open the page listed here and note which cookies the detail names.',
      "Check what sets each cookie. If it comes from a tool on the page, such as analytics, look in that tool's settings for a Secure option; if it comes from the site's own code, ask Claude to add the Secure flag. The Secure flag is a mark on a cookie that tells the browser to send it only over a secure https connection.",
    ],
  },
  'html-over-200kb': {
    effort: 'larger job',
    impact: 'low',
    steps: [
      'Open the page listed here and look at what it carries, such as long inline data or unused sections.',
      'Cut down or move out whatever is not needed.',
    ],
  },
  'blocking-scripts': {
    effort: 'moderate',
    impact: 'low',
    setup: true,
    steps: [
      'Open the page template (the file every page is built from) and look at the scripts in the head (the hidden top part of the page code).',
      'Mark each one to load later, or move it to the bottom of the page.',
    ],
  },
  'img-no-size': {
    effort: 'moderate',
    impact: 'low',
    steps: [
      'Open the page listed here and look at its images in the page code.',
      'Add the width and height to each image.',
    ],
  },
  'img-no-alt': {
    effort: 'moderate',
    impact: 'medium',
    steps: [
      'Open the page listed here and find the images without a description.',
      'Add a short description to each image that carries meaning.',
    ],
  },
  'too-many-scripts': {
    effort: 'larger job',
    impact: 'low',
    steps: [
      'Open the page listed here and list the scripts it loads.',
      'Remove the ones the page does not need, or combine them.',
    ],
  },
  'no-compression': {
    effort: 'quick win',
    impact: 'medium',
    setup: true,
    steps: [
      "Check the page's response through Cloudflare: run the audit again, and if the same page is flagged again, ask Claude to request it and show its response headers, the short notes the server sends along with the page. Look for a content-encoding line: it says how the page was compressed, and a missing line means it was sent uncompressed. Netlify and Cloudflare normally compress pages on their own, so this may be a one-off.",
      'If it repeats, look in Cloudflare for a recent change to compression or to a rule that covers that page, and tell Claude what you find.',
    ],
  },
};

export const CHECKS = [
  // ------------------------------------------------ reachability and indexing
  def(
    'status-not-200',
    'reachability',
    'critical',
    'Page does not open normally',
    (n) => these(n, 'does not open normally for visitors', 'do not open normally for visitors'),
    'A page that errors or does not answer may not be read or ranked by Google, and visitors who click it in search see an error.',
    'Open the page, find out why it fails, and fix it or take it out of the sitemap.',
    (p) => {
      if (p.offHost && p.status >= 300 && p.status < 400) return false;
      if (p.status === 200) return false;
      return p.error || statusText(p.status);
    }
  ),
  def(
    'not-html',
    'reachability',
    'medium',
    'Address is not a web page',
    (n) => these(n, 'is listed as a page but is not a web page', 'are listed as pages but are not web pages'),
    'Google expects a page in the sitemap to be a normal web page it can read and rank.',
    'Take the address out of the sitemap, or make it serve a normal web page.',
    (p) =>
      p.status === 200 && !p.isHtml
        ? `It answers with ${String(p.headers['content-type'] ?? '').split(';')[0] || 'something that is not a web page'}.`
        : false
  ),
  def(
    'redirect-chain',
    'reachability',
    'medium',
    'Redirects more than once',
    (n) => these(n, 'sends visitors through more than one redirect', 'send visitors through more than one redirect'),
    'Each extra redirect adds a delay, and Google may stop following a long chain before the page arrives.',
    'Point the old address straight at the final page in one step.',
    (p) => (p.redirects.length > 1 ? `Goes through ${p.redirects.length} redirects before the page opens.` : false)
  ),
  def(
    'redirect-off-host',
    'reachability',
    'critical',
    'Sends visitors to another website',
    (n) => these(n, 'sends visitors to a different website', 'send visitors to a different website'),
    "A page in your sitemap should be on your own site. This one sends its visitors to another website, and Google may count the page as that site's instead of yours.",
    'Remove the redirect, or take the page out of the sitemap if the move is meant.',
    (p) => (p.offHost ? `Sends visitors to ${hostOf(p.finalUrl) || 'another website'}.` : false)
  ),
  def(
    'noindex-in-sitemap',
    'reachability',
    'critical',
    'Hidden from Google but listed',
    (n) =>
      these(
        n,
        'tells Google to ignore it but is listed in the sitemap',
        'tell Google to ignore them but are listed in the sitemap'
      ),
    'The sitemap says the page matters while the page itself says to keep it out of search. Google may go by the page, so it may stay out of search.',
    'Remove the "noindex" instruction if the page should be found, or take it out of the sitemap.',
    onPage((p, d, site) =>
      site.sitemap.has(p.path) &&
      (/noindex/i.test(d.robotsMeta) || /noindex/i.test(String(p.headers['x-robots-tag'] ?? '')))
        ? 'It carries a noindex instruction.'
        : false
    )
  ),
  def(
    'canonical-missing',
    'reachability',
    'medium',
    'No preferred address set',
    (n) => these(n, 'does not name its preferred address', 'do not name their preferred address'),
    'Without a preferred address, Google may have to guess which version of the page to show when the same page opens at several addresses.',
    "In the page head, name the page's own address as its main one (a canonical link).",
    onPage((p, d) => (d.canonical ? false : true))
  ),
  def(
    'canonical-elsewhere',
    'reachability',
    'high',
    'Preferred address is a different page',
    (n) =>
      these(n, 'names a different page as its preferred address', 'name a different page as their preferred address'),
    'Google may drop this page from search in favor of the page it points to.',
    'Change the address the page says is its main one (the canonical link) to this page, unless the page is meant to be a copy.',
    onPage((p, d) => {
      let c;
      try {
        c = new URL(d.canonical, p.finalUrl || p.url);
      } catch {
        return d.canonical ? 'The preferred address is not a valid address.' : false;
      }
      if (!d.canonical) return false;
      if (c.hostname !== SITE_HOST) return `It points at another website, ${c.hostname}.`;
      const target = normPath(c.pathname);
      if (target === p.path || target === normPath(pathOfUrl(p.finalUrl || p.url))) return false;
      return `It points at ${target}.`;
    })
  ),
  def(
    'sitemap-not-linked',
    'reachability',
    'high',
    'Page nobody links to',
    (n) =>
      these(n, 'is in the sitemap but no other page links to it', 'are in the sitemap but no other page links to them'),
    'Google finds pages by following links. A page with no links pointing at it is harder to find and may rank lower.',
    'Link to the page from two related pages, with words that say what it is about.',
    (p, site) =>
      site.complete &&
      site.pages.size > 1 &&
      p.path !== '/' &&
      site.sitemap.has(p.path) &&
      !(site.inbound.get(p.path)?.size > 0)
        ? 'No other page links to it.'
        : false,
    'page',
    true
  ),
  def(
    'linked-not-in-sitemap',
    'reachability',
    'low',
    'Linked page missing from the sitemap',
    (n) =>
      n === 1
        ? '1 page is linked from your pages but is not in the sitemap.'
        : `${n} pages are linked from your pages but are not in the sitemap.`,
    'Pages the sitemap leaves out may be found more slowly. It is fine when the page is hidden on purpose.',
    'Add the page to the sitemap if it should be found, or leave it out if it is meant to be private.',
    (_, site) => {
      const out = [];
      for (const [target, from] of site.inbound) {
        if (site.sitemap.has(target) || site.pages.has(target)) continue;
        if (/\.[a-z0-9]{2,5}$/i.test(target) || /^\/(admin|api|_astro|cdn-cgi)(\/|$)/.test(target)) continue;
        // Archive pages (tags, categories, page 2 of a list) are left out of a sitemap on purpose.
        if (ARCHIVE_RE.test(target)) continue;
        const s = site.linkStatus.get(target) ?? site.linkStatus.get(`${target}/`);
        if (s?.status !== 200) continue;
        const list = [...from].sort();
        out.push({ page: target, detail: `Linked from ${few(list, 2)}, but not in the sitemap.` });
      }
      return out;
    },
    'site'
  ),
  def(
    'http-not-redirecting',
    'reachability',
    'high',
    'Plain http address does not move to https',
    () => 'The plain http address of the site does not move visitors to the secure https address.',
    'Anyone who types or follows an old http link lands on an unsecured copy, and Google may treat it as a second site.',
    "Turn on Always Use HTTPS in Cloudflare, or add a permanent redirect from http to https in the site's netlify.toml.",
    (_, site) => {
      const h = site.httpHome;
      if (!h || h.error) return [];
      const moves =
        [301, 302, 307, 308].includes(h.status) && /^https:\/\/simplescheduleai\.com\//.test(h.location ?? '');
      return moves
        ? []
        : [{ page: '/', detail: `The http address did not move visitors to https (it answered ${h.status}).` }];
    },
    'site'
  ),
  def(
    'trailing-slash-duplicate',
    'reachability',
    'low',
    'Same page at two addresses',
    (n) =>
      these(
        n,
        'points at the same page with and without a trailing slash',
        'point at the same page with and without a trailing slash'
      ),
    'When one page opens at two addresses, links and ranking may be split between them.',
    'Pick one form, then use it in every link and in the address the page says is its main one (the canonical link).',
    onPage((p, d, site) => {
      const found = [];
      if (d.canonical) {
        try {
          const c = new URL(d.canonical, p.finalUrl || p.url);
          if (
            c.hostname === SITE_HOST &&
            normPath(c.pathname) === p.path &&
            c.pathname !== pathOfUrl(p.finalUrl || p.url)
          ) {
            found.push(`Its preferred address ends differently (${c.pathname}).`);
          }
        } catch {
          // an invalid canonical is reported by its own check
        }
      }
      const slashed = p.internalTargets.filter((t) => t !== normPath(t) && site.sitemap.has(normPath(t)));
      if (slashed.length)
        found.push(`Links to ${few(slashed)} with a trailing slash, but the page is listed without one.`);
      return found.length ? found.join(' ') : false;
    })
  ),

  // ------------------------------------------------ on the page
  def(
    'title-missing',
    'onpage',
    'high',
    'No page title',
    (n) => these(n, 'has no title for search results', 'have no title for search results'),
    'The title is the headline Google shows in search. Without one, Google writes its own, which may not say what you want.',
    'Add a title that says what the page is about, ideally with the main words first.',
    onPage((p, d) => (d.title ? false : true))
  ),
  def(
    'title-long',
    'onpage',
    'low',
    'Title too long',
    (n) => these(n, 'has a title longer than 60 characters', 'have titles longer than 60 characters'),
    'Google may cut a title longer than about 60 characters short in search results, so the end of it may not show.',
    'Shorten the title so the words that matter come first.',
    onPage((p, d) => ([...d.title].length > 60 ? chars(d.title) : false))
  ),
  def(
    'title-short',
    'onpage',
    'low',
    'Title very short',
    (n) => these(n, 'has a title under 20 characters', 'have titles under 20 characters'),
    'A very short title leaves room unused that could say what the page offers.',
    'Lengthen the title to say what the page is about, up to about 60 characters.',
    onPage((p, d) => (d.title && [...d.title].length < 20 ? chars(d.title) : false))
  ),
  def(
    'title-repeats-name',
    'onpage',
    'low',
    'Title repeats a word or the site name',
    (n) =>
      these(n, 'has a title that repeats a word or the site name', 'have titles that repeat a word or the site name'),
    'A title that says the same word three times, or the site name twice, may look like stuffing to Google and uses up room that could say what the page offers.',
    'Say each word or the site name once in the title, and use the freed room for what the page is about.',
    onPage((p, d) => repeatsInTitle(d.title))
  ),
  def(
    'title-duplicate',
    'onpage',
    'medium',
    'Title shared with another page',
    (n) => these(n, 'shares its title with another page', 'share their title with another page'),
    'Two pages with the same title may compete for the same searches, and Google may show the wrong one.',
    'Give each page a title that says what that page alone is about.',
    onPage((p, d, site) => {
      const others = (site.titles.get(d.title.trim().toLowerCase().replace(/\s+/g, ' ')) ?? []).filter(
        (x) => x !== p.path
      );
      return others.length ? `Shares its title with ${few(others, 2)}.` : false;
    })
  ),
  def(
    'description-missing',
    'onpage',
    'medium',
    'No search description',
    (n) => these(n, 'has no description for search results', 'have no description for search results'),
    'The description is the text under the title in search. Without one, Google picks a snippet itself, which may draw fewer clicks.',
    'Add a description of one or two sentences that says what the page offers.',
    onPage((p, d) => (d.description ? false : true))
  ),
  def(
    'description-long',
    'onpage',
    'low',
    'Description too long',
    (n) => these(n, 'has a description longer than 160 characters', 'have descriptions longer than 160 characters'),
    'Google may cut a long description short in search results.',
    'Shorten the description to one or two sentences.',
    onPage((p, d) => ([...d.description].length > 160 ? chars(d.description) : false))
  ),
  def(
    'description-short',
    'onpage',
    'low',
    'Description very short',
    (n) => these(n, 'has a description under 70 characters', 'have descriptions under 70 characters'),
    'A very short description wastes the space Google gives to tell searchers why to click.',
    'Lengthen the description to one or two sentences, up to about 160 characters.',
    onPage((p, d) => (d.description && [...d.description].length < 70 ? chars(d.description) : false))
  ),
  def(
    'description-duplicate',
    'onpage',
    'medium',
    'Description shared with another page',
    (n) => these(n, 'shares its description with another page', 'share their description with another page'),
    'A copied description may tell searchers nothing new about this page.',
    'Write a description for each page that matches what that page says.',
    onPage((p, d, site) => {
      const others = (site.descriptions.get(d.description.trim().toLowerCase().replace(/\s+/g, ' ')) ?? []).filter(
        (x) => x !== p.path
      );
      return others.length ? `Shares its description with ${few(others, 2)}.` : false;
    })
  ),
  def(
    'h1-missing',
    'onpage',
    'medium',
    'No main heading',
    (n) => these(n, 'has no main heading', 'have no main heading'),
    'The main heading tells readers and Google what the page is about at a glance.',
    'Add one main heading near the top of the page.',
    onPage((p, d) => (d.h1s.length === 0 ? true : false))
  ),
  def(
    'h1-multiple',
    'onpage',
    'low',
    'More than one main heading',
    (n) => these(n, 'has more than one main heading', 'have more than one main heading'),
    'Several main headings may blur what the page is about.',
    'Keep one main heading and turn the others into smaller headings.',
    onPage((p, d) => (d.h1s.length > 1 ? `${d.h1s.length} main headings.` : false))
  ),
  def(
    'h1-equals-title',
    'onpage',
    'low',
    'Heading repeats the title word for word',
    (n) => these(n, 'has a main heading identical to its title', 'have a main heading identical to their title'),
    'The title and the heading can work together: the title wins the click, the heading welcomes the reader.',
    'Reword one of them so each adds something.',
    onPage((p, d) => (d.title && d.h1s.some((h) => h.toLowerCase() === d.title.toLowerCase()) ? true : false))
  ),
  def(
    'heading-skip',
    'onpage',
    'low',
    'Heading levels skipped',
    (n) => these(n, 'skips a heading level', 'skip a heading level'),
    'Headings work like an outline. Jumping from a big heading to a very small one makes the outline hard to follow, for readers and for screen readers.',
    'Use the next level down, so a heading two is followed by a heading three.',
    onPage((p, d) => {
      for (let i = 1; i < d.headings.length; i++) {
        const a = d.headings[i - 1].level;
        const b = d.headings[i].level;
        if (b > a + 1) return `Jumps from heading ${a} to heading ${b}.`;
      }
      return false;
    })
  ),
  def(
    'thin-post',
    'onpage',
    'medium',
    'Post is very short',
    (n) => (n === 1 ? '1 post has fewer than 300 words.' : `${n} posts have fewer than 300 words.`),
    'A very short post may not answer the question fully, so it may rank below fuller answers.',
    'Expand the post to answer the question completely, or fold it into a stronger post.',
    onPage((p, d) => (p.isPost && d.wordCount < 300 ? `${d.wordCount} words.` : false))
  ),
  def(
    'page-read-partly',
    'onpage',
    'low',
    'Page too large to read in full',
    (n) =>
      these(n, 'is so large that only its first part was read', 'are so large that only their first part was read'),
    'The audit reads the first megabyte of a page, so the checks below may have missed something further down.',
    'Cut down what the page carries, such as long inline data, so it is a normal size.',
    onPage((p, d) => (d.truncated ? 'Only the first 1 MB of the page was read.' : false))
  ),
  def(
    'lang-missing',
    'onpage',
    'low',
    'Page language not set',
    (n) => these(n, 'does not say what language it is written in', 'do not say what language they are written in'),
    'Browsers, screen readers and search engines use the language setting to treat the page correctly.',
    'Set the language on the page, for example en.',
    onPage((p, d) => (d.lang ? false : true))
  ),
  def(
    'viewport-missing',
    'onpage',
    'medium',
    'Not set up for phones',
    (n) => these(n, 'is not set up for phone screens', 'are not set up for phone screens'),
    'Without it, phones show a tiny zoomed out page, and Google judges the page mainly as it appears on a phone.',
    'Add the setting that fits the page to a phone screen (the viewport line) to the page head.',
    onPage((p, d) => (d.viewport ? false : true))
  ),

  // ------------------------------------------------ structured data
  def(
    'jsonld-missing-post',
    'structured',
    'medium',
    'Post has no structured data',
    (n) => (n === 1 ? '1 post has no structured data.' : `${n} posts have no structured data.`),
    'Structured data can tell Google who wrote the post and when, which may help the post show up properly.',
    'Add article structured data to the post template.',
    onPage((p, d) => (p.isPost && d.jsonLd.length === 0 ? true : false))
  ),
  def(
    'jsonld-invalid',
    'structured',
    'medium',
    'Structured data is broken',
    (n) => these(n, 'has structured data that cannot be read', 'have structured data that cannot be read'),
    'Google may ignore structured data it cannot read, so the page may not get the extras it was meant to get.',
    "Fix the structured data so it is valid, then test the page with Google's rich results test.",
    onPage((p, d) => {
      const n = d.jsonLd.filter((j) => j.parsed === null).length;
      return n ? `${n} block${n === 1 ? '' : 's'} of structured data cannot be read.` : false;
    })
  ),
  def(
    'article-incomplete',
    'structured',
    'medium',
    'Article data is incomplete',
    (n) =>
      these(
        n,
        'has article data that is missing a headline, date or author',
        'have article data that is missing a headline, date or author'
      ),
    'Google asks for a headline, a publish date and an author to show an article properly.',
    'Add the missing fields to the article structured data.',
    onPage((p, d) => {
      const missing = [];
      for (const n of nodesOf(d).filter((x) => typesOf(x).some((t) => ARTICLE_RE.test(t)))) {
        for (const f of ['headline', 'datePublished', 'author'])
          if (!present(n[f]) && !missing.includes(f)) missing.push(f);
      }
      return missing.length ? `Missing: ${missing.join(', ')}.` : false;
    })
  ),
  def(
    'faq-empty',
    'structured',
    'medium',
    'Question list has no questions',
    (n) => these(n, 'has a question list with no questions in it', 'have a question list with no questions in it'),
    'An empty question list may earn nothing and can be flagged as an error.',
    'Add the questions and answers, or remove the empty list.',
    onPage((p, d) => {
      const faq = nodesOf(d).filter((n) => typesOf(n).includes('FAQPage'));
      return faq.some((n) => !present(n.mainEntity)) ? 'A question list has no questions.' : false;
    })
  ),
  def(
    'breadcrumb-missing-post',
    'structured',
    'low',
    'Post has no breadcrumb data',
    (n) => (n === 1 ? '1 post has no breadcrumb data.' : `${n} posts have no breadcrumb data.`),
    'Breadcrumb data can let Google show where the post sits on the site, instead of a long address.',
    'Add breadcrumb structured data to the post template.',
    onPage((p, d) => (p.isPost && !hasType(d, /^BreadcrumbList$/) ? true : false))
  ),
  def(
    'org-missing-home',
    'structured',
    'medium',
    'Home page does not say who you are',
    () => 'The home page has no organization structured data.',
    'Google can use it to know the business behind the site, which may help the name and logo show up properly.',
    'Add organization structured data with the name, address and logo to the home page.',
    onPage((p, d) => (p.isHome && !hasType(d, ORG_RE) ? true : false))
  ),

  // ------------------------------------------------ links
  def(
    'internal-link-broken',
    'links',
    'high',
    'Link to a page that is gone',
    (n) => these(n, 'links to a page that does not open', 'link to pages that do not open'),
    'A broken link sends readers and Google to an error page and wastes the link.',
    'Change each link to the right address, or bring back the page it points at.',
    onPage((p, d, site) => {
      const bad = [];
      for (const t of p.internalTargets) {
        const s = site.linkStatus.get(t);
        if (s && s.status >= 400) bad.push(`${t} (${s.status})`);
      }
      return bad.length ? `Links to ${few(bad)}.` : false;
    })
  ),
  def(
    'link-not-checked',
    'links',
    'low',
    'Link could not be checked',
    (n) => these(n, 'has a link that could not be checked this time', 'have links that could not be checked this time'),
    'The linked page did not answer in time, twice. That is often a passing problem, so it is not counted as a broken link.',
    'Run the audit again later. If the same link keeps failing, open it yourself to see whether the page works.',
    onPage((p, d, site) => {
      const open = p.internalTargets.filter((t) => {
        const s = site.linkStatus.get(t);
        return s && s.status === 0;
      });
      return open.length ? `Could not check ${few(open)}.` : false;
    })
  ),
  def(
    'internal-link-redirects',
    'links',
    'medium',
    'Link goes through a redirect',
    (n) => these(n, 'links to an address that redirects', 'link to addresses that redirect'),
    'Every redirect adds a delay, and Google may give a link that goes through one a little less weight.',
    'Change each link to the address the redirect leads to.',
    onPage((p, d, site) => {
      const moved = [];
      for (const t of p.internalTargets) {
        const s = site.linkStatus.get(t);
        if (s && s.status >= 300 && s.status < 400) moved.push(t);
      }
      return moved.length ? `Links to ${few(moved)}, which redirect.` : false;
    })
  ),
  def(
    'link-empty-text',
    'links',
    'medium',
    'Link with no words',
    (n) => these(n, 'has a link with no words in it', 'have links with no words in them'),
    'Google reads the words of a link to learn what the target page is about. A link with none may teach it nothing.',
    'Give each link words that describe where it goes.',
    onPage((p, d) => {
      const n = d.links.filter((l) => !l.text).length;
      return n ? `${n} link${n === 1 ? '' : 's'} with no text.` : false;
    })
  ),
  def(
    'too-many-links',
    'links',
    'low',
    'More than 150 links',
    (n) => these(n, 'has more than 150 links', 'have more than 150 links'),
    'A very large number of links may make each one count for less and the page harder to use.',
    'Cut the links down to the ones a reader would actually follow.',
    onPage((p, d) => (d.links.length > 150 ? `${d.links.length} links.` : false))
  ),
  def(
    'external-http-link',
    'links',
    'low',
    'Link to an unsecured website',
    (n) => these(n, 'links to a website over plain http', 'link to websites over plain http'),
    'Browsers may warn visitors about unsecured sites, which can reflect badly on the page that sent them.',
    'Change the link to https, or remove it if the other site has no secure version.',
    onPage((p, d) => {
      const hosts = [
        ...new Set(d.links.filter((l) => !l.internal && l.href.startsWith('http://')).map((l) => hostOf(l.href))),
      ];
      return hosts.length ? `Links to ${few(hosts)} over plain http.` : false;
    })
  ),
  def(
    'email-link-protected',
    'links',
    'low',
    'Email link that crawlers see as broken',
    (n) => these(n, 'has an email link that crawlers see as broken', 'have an email link that crawlers see as broken'),
    'Cloudflare scrambles email addresses to hide them from spam collectors. People who click get a normal email link. A crawler follows the scrambled address and gets a page-not-found reply, so tools such as Ahrefs report a broken link on these pages.',
    'Your choice: turn off Email Address Obfuscation in Cloudflare, or keep the protection and leave this finding as it is.',
    onPage((p, d) => {
      // Cloudflare's protected email address. buildPage leaves every /cdn-cgi/ address out of the
      // links it checks, so these never show as a broken internal link.
      const n = d.links.filter((l) => l.internal && EMAIL_PROTECTION_RE.test(pathOfUrl(l.href))).length;
      return n
        ? `${n} email ${n === 1 ? 'link goes' : 'links go'} to Cloudflare's scrambled address (/cdn-cgi/l/email-protection).`
        : false;
    })
  ),

  // ------------------------------------------------ security
  def(
    'hsts-missing',
    'security',
    'medium',
    'Secure connection not enforced',
    () => 'The site does not tell browsers to use only the secure https connection.',
    'Without that instruction, a visitor on an unsafe network can be pushed onto an unsecured copy of the site.',
    "Add the Strict-Transport-Security header in the site's netlify.toml, or in Cloudflare under SSL/TLS, Edge Certificates, starting with a short period.",
    (_, site) => {
      const h = site.home;
      if (!h || h.status === 0) return [];
      return h.headers['strict-transport-security']
        ? []
        : [{ page: '/', detail: 'Checked on the home page. It applies to the whole site.' }];
    },
    'site'
  ),
  def(
    'mixed-content',
    'security',
    'medium',
    'Page loads something over plain http',
    (n) => these(n, 'loads a file over plain http', 'load files over plain http'),
    'Browsers may block or warn about unsecured files on a secure page, so images or scripts can silently fail.',
    'Change the address of each file to https.',
    onPage((p, d) => (d.mixed.length ? `Loads ${few(d.mixed, 2)}.` : false))
  ),
  def(
    'nosniff-missing',
    'security',
    'low',
    'File type protection missing',
    () => 'The site does not send the instruction that stops browsers from guessing file types.',
    'It is a small safety measure against files being treated as something they are not.',
    "Add the X-Content-Type-Options header, set to nosniff, in the site's netlify.toml.",
    (_, site) => {
      const h = site.home;
      if (!h || h.status === 0) return [];
      return /nosniff/i.test(String(h.headers['x-content-type-options'] ?? ''))
        ? []
        : [{ page: '/', detail: 'Checked on the home page. It applies to the whole site.' }];
    },
    'site'
  ),
  def(
    'cookie-no-secure',
    'security',
    'medium',
    'Cookie not marked secure',
    (n) => these(n, 'sets a cookie that is not marked secure', 'set cookies that are not marked secure'),
    'A cookie without the secure mark can be sent over an unsecured connection.',
    'Mark every cookie the site sets as secure (the Secure flag, which tells the browser to send it only over https).',
    (p) => {
      const bad = [].concat(p.headers['set-cookie'] ?? []).filter((c) => !/;\s*secure\b/i.test(String(c)));
      return bad.length
        ? `Sets ${few(bad.map((c) => String(c).split('=')[0].trim()))} without the secure flag.`
        : false;
    }
  ),

  // ------------------------------------------------ speed hints (the weight of the page, not measured speed)
  def(
    'html-over-200kb',
    'speed',
    'low',
    'Page code is large',
    (n) => these(n, 'has more than 200 KB of page code', 'have more than 200 KB of page code'),
    `Heavy pages take longer to arrive on a slow phone connection.${HINT}`,
    'Trim what the page carries, such as unused sections or long inline data.',
    (p) => (p.bytes > 200 * KB ? `${Math.round(p.bytes / KB)} KB of page code.` : false)
  ),
  def(
    'blocking-scripts',
    'speed',
    'low',
    'Scripts that hold up the page',
    (n) =>
      these(
        n,
        'has more than 3 scripts that must load before it shows',
        'have more than 3 scripts that must load before they show'
      ),
    `Scripts in the head that have to finish first delay everything under them.${HINT}`,
    'Mark the scripts to load later, or move them to the bottom of the page.',
    onPage((p, d) => (d.scripts.blocking > 3 ? `${d.scripts.blocking} scripts hold up the page.` : false))
  ),
  def(
    'img-no-size',
    'speed',
    'low',
    'Images without a set size',
    (n) => these(n, 'has images without a width and height', 'have images without a width and height'),
    `Without a set size, the page jumps around while pictures load.${HINT}`,
    'Add the width and height to each image.',
    onPage((p, d) => {
      const n = d.images.filter((i) => !i.hasSize).length;
      return n ? `${n} of ${d.images.length} images have no width and height.` : false;
    })
  ),
  def(
    'img-no-alt',
    'speed',
    'medium',
    'Images without a description',
    (n) => these(n, 'has images with no description text', 'have images with no description text'),
    `Without a short description, Google Images and screen readers may not be able to tell what a picture shows. Image checks sit with the speed hints, which are a hint from the page's weight, not measured speed.`,
    'Add a short description to each image that carries meaning.',
    onPage((p, d) => {
      const n = d.images.filter((i) => i.alt === null).length;
      return n ? `${n} of ${d.images.length} images have no description.` : false;
    })
  ),
  def(
    'too-many-scripts',
    'speed',
    'low',
    'Many scripts on the page',
    (n) => these(n, 'runs more than 15 scripts', 'run more than 15 scripts'),
    `Each script is another file to fetch and run.${HINT}`,
    'Remove the scripts the page does not need, or combine them.',
    onPage((p, d) => (d.scripts.count > 15 ? `${d.scripts.count} scripts.` : false))
  ),
  def(
    'no-compression',
    'speed',
    'medium',
    'Page is sent uncompressed',
    (n) => these(n, 'is sent without compression', 'are sent without compression'),
    `Compression can make a page several times smaller to send. Netlify and Cloudflare normally compress pages on their own, so one uncompressed answer may be a one-off.${HINT}`,
    "Run the audit again to see whether it repeats, and check the page's response through Cloudflare for a content-encoding line (the note the server sends that says how the page was compressed).",
    onPage((p) =>
      p.bytes > KB && !p.headers['content-encoding']
        ? 'The page arrives without compression (no Content-Encoding header).'
        : false
    )
  ),
];

// ---------------------------------------------------------------- running them

// Every issue found across the pages: [{id, name, group, severity, what, why, fix, pages: [{page, detail, clicks}]}],
// worst first, then by the clicks the pages get.
export function evaluate({ pages, site, clicksOf = () => 0 }) {
  const issues = [];
  for (const c of CHECKS) {
    let hits = [];
    try {
      if (c.scope === 'site') {
        const r = c.test(null, site);
        hits = Array.isArray(r) ? r : [];
      } else {
        for (const p of pages) {
          let r;
          try {
            r = c.test(p, site);
          } catch {
            continue;
          }
          if (r) hits.push({ page: p.path, detail: r === true ? '' : String(r) });
        }
      }
    } catch {
      continue;
    }
    if (!hits.length) continue;
    const rows = hits
      .map((h) => ({ page: h.page, detail: plain(h.detail ?? ''), clicks: Number(clicksOf(h.page)) || 0 }))
      .sort((a, b) => b.clicks - a.clicks || a.page.localeCompare(b.page));
    issues.push({
      id: c.id,
      name: c.name,
      group: c.group,
      severity: c.severity,
      siteWide: c.siteWide,
      editsPage: c.editsPage,
      what: plain(typeof c.what === 'function' ? c.what(rows.length) : c.what),
      why: plain(c.why),
      fix: plain(c.fix),
      effort: c.effort,
      impact: c.impact,
      steps: c.steps.map(plain),
      pages: rows,
    });
  }
  return sortIssues(issues);
}

export function sortIssues(issues) {
  const total = (i) => i.pages.reduce((s, p) => s + (p.clicks || 0), 0);
  return [...issues].sort(
    (a, b) =>
      SEVERITY_RANK[normSeverity(a.severity)] - SEVERITY_RANK[normSeverity(b.severity)] ||
      total(b) - total(a) ||
      a.id.localeCompare(b.id)
  );
}

// 100 minus the weighted share of pages with a problem: each page counts once, at its worst
// severity (critical 3, high 2, medium 1, low a tenth). Floored at 0. A problem that is true of the whole
// site (siteWide) counts once, against the home page. With `audited` (a Set of the pages that were
// read), a page that was not read never adds weight. With `group`, only that group's issues count.
export function scoreOf(issues, pagesChecked, group = null, audited = null) {
  if (!pagesChecked) return 100;
  const worst = new Map();
  const mark = (page, sev) => {
    if (audited && !audited.has(page)) return;
    const severity = normSeverity(sev);
    const cur = worst.get(page);
    if (cur === undefined || SEVERITY_RANK[severity] < SEVERITY_RANK[cur]) worst.set(page, severity);
  };
  for (const i of issues) {
    if (group && i.group !== group) continue;
    if (i.siteWide) mark('/', i.severity);
    else for (const p of i.pages) mark(p.page, i.severity);
  }
  let weighted = 0;
  for (const sev of worst.values()) weighted += SEVERITY_WEIGHT[sev];
  return Math.max(0, Math.round(100 - (100 * weighted) / pagesChecked));
}
