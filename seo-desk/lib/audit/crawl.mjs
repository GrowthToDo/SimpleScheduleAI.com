// Fetching and reading the site's own pages for the technical audit.
//
// Only https://simplescheduleai.com/... is ever requested (and, for the "does the plain http
// address move to https" check, exactly http://simplescheduleai.com/). Redirects are followed by
// hand, at most five, and a redirect that leaves the site is recorded but never followed. One
// request at a time with a short pause between them, so the audit is polite to the live site.
// Pages are read with a small tolerant parser (regular expressions over tags, no dependency).

export const SITE_HOST = 'simplescheduleai.com';
export const SITE_ORIGIN = `https://${SITE_HOST}`;
export const HTTP_HOME = `http://${SITE_HOST}/`;
export const USER_AGENT = 'SSAI-SEO-Desk-Audit';
export const MAX_BODY_BYTES = 2 * 1024 * 1024;
export const MAX_REDIRECTS = 5;
export const PAUSE_MS = 300;
export const FETCH_TIMEOUT_MS = 15000;

const defaultSleep = (ms) => new Promise((r) => setTimeout(r, ms));

// True for the site over https (default port, no login in the address) and for the one plain
// http home address. Anything else is never requested.
export function isAllowedUrl(value) {
  let u;
  try {
    u = new URL(String(value));
  } catch {
    return false;
  }
  if (u.href === HTTP_HOME) return true;
  return u.protocol === 'https:' && u.hostname === SITE_HOST && !u.username && !u.password && u.port === '';
}

// ---------------------------------------------------------------- pacing

// Every request, from every caller, waits its turn: one at a time, pauseMs after the last one ended.
let chain = Promise.resolve();
let lastEndedAt = 0;
function paced(fn, pauseMs, sleep) {
  const turn = chain.then(async () => {
    const wait = lastEndedAt + pauseMs - Date.now();
    if (wait > 0) await sleep(wait);
    try {
      return await fn();
    } finally {
      lastEndedAt = Date.now();
    }
  });
  chain = turn.catch(() => {});
  return turn;
}

function withDeadline(promise, ms) {
  let timer;
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => reject(Object.assign(new Error('timeout'), { timedOut: true })), ms);
  });
  return Promise.race([promise, deadline]).finally(() => clearTimeout(timer));
}

const secondsText = (ms) => `${Math.max(1, Math.round(ms / 1000))} second${Math.round(ms / 1000) === 1 ? '' : 's'}`;

function plainFailure(e, timeoutMs) {
  if (e?.timedOut || e?.name === 'TimeoutError' || e?.name === 'AbortError') {
    return `The page did not answer within ${secondsText(timeoutMs)}.`;
  }
  return 'The page could not be reached.';
}

function headersOf(res) {
  const out = {};
  res.headers?.forEach?.((value, key) => {
    out[key.toLowerCase()] = value;
  });
  const cookies = res.headers?.getSetCookie?.();
  if (cookies?.length) out['set-cookie'] = cookies;
  return out;
}

async function readBody(res, maxBytes) {
  if (!res.body?.getReader) {
    const text = String((await res.text?.()) ?? '');
    const bytes = Buffer.byteLength(text);
    return bytes > maxBytes ? { text: text.slice(0, maxBytes), bytes: maxBytes } : { text, bytes };
  }
  const reader = res.body.getReader();
  const chunks = [];
  let bytes = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    const room = maxBytes - bytes;
    if (value.length >= room) {
      chunks.push(value.subarray(0, room));
      bytes += room;
      await reader.cancel().catch(() => {});
      break;
    }
    chunks.push(value);
    bytes += value.length;
  }
  return { text: Buffer.concat(chunks).toString('utf8'), bytes };
}

async function dropBody(res) {
  try {
    await res.body?.cancel?.();
  } catch {
    // nothing to drop
  }
}

// One request, no redirects followed. Returns {status, headers, location, text, bytes}.
async function requestOnce(url, { method, fetchImpl, timeoutMs, pauseMs, sleep, wantBody }) {
  return paced(
    () =>
      withDeadline(
        (async () => {
          const res = await fetchImpl(url, {
            method,
            redirect: 'manual',
            headers: { 'user-agent': USER_AGENT, accept: 'text/html,application/xhtml+xml,*/*;q=0.8' },
            signal: AbortSignal.timeout(timeoutMs),
          });
          const headers = headersOf(res);
          const location = headers.location ? String(headers.location) : null;
          const isHtml = /html/i.test(String(headers['content-type'] ?? ''));
          if (wantBody && res.status === 200 && isHtml) {
            const { text, bytes } = await readBody(res, MAX_BODY_BYTES);
            return { status: res.status, headers, location, text, bytes };
          }
          await dropBody(res);
          return { status: res.status, headers, location, text: '', bytes: 0 };
        })(),
        timeoutMs
      ),
    pauseMs,
    sleep
  );
}

// ---------------------------------------------------------------- pages

// Fetches one page of the site. Redirects are followed by hand (at most 5) and every hop is kept.
// A failure is a result, never a throw: status 0 and a plain sentence in `error`.
export async function fetchPage(
  url,
  { fetchImpl = fetch, timeoutMs = FETCH_TIMEOUT_MS, pauseMs = PAUSE_MS, sleep = defaultSleep } = {}
) {
  const started = Date.now();
  const out = { url, status: 0, finalUrl: url, redirects: [], headers: {}, html: '', ms: 0, bytes: 0, error: null };
  const finish = () => ({ ...out, ms: Date.now() - started });
  if (!isAllowedUrl(url)) {
    out.error = 'Only pages on simplescheduleai.com are checked.';
    return finish();
  }
  let current = url;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    let r;
    try {
      r = await requestOnce(current, { method: 'GET', fetchImpl, timeoutMs, pauseMs, sleep, wantBody: true });
    } catch (e) {
      out.error = plainFailure(e, timeoutMs);
      out.status = 0;
      out.finalUrl = current;
      return finish();
    }
    out.status = r.status;
    out.headers = r.headers;
    out.finalUrl = current;
    if (r.status >= 300 && r.status < 400 && r.location) {
      let next;
      try {
        next = new URL(r.location, current).href;
      } catch {
        out.error = 'The page redirects to an address that is not valid.';
        return finish();
      }
      if (isAllowedUrl(next) && hop === MAX_REDIRECTS) {
        out.error = `The page redirects more than ${MAX_REDIRECTS} times.`;
        return finish();
      }
      out.redirects.push({ from: current, to: next, status: r.status });
      out.finalUrl = next;
      if (!isAllowedUrl(next)) return finish();
      current = next;
      continue;
    }
    out.html = r.text;
    out.bytes = r.bytes;
    return finish();
  }
  return finish();
}

// A link target: HEAD, then GET when the server does not allow HEAD. Never follows a redirect.
// Returns {url, status, location, error}.
export async function checkLink(
  url,
  { fetchImpl = fetch, timeoutMs = FETCH_TIMEOUT_MS, pauseMs = PAUSE_MS, sleep = defaultSleep } = {}
) {
  if (!isAllowedUrl(url))
    return { url, status: 0, location: null, error: 'Only pages on simplescheduleai.com are checked.' };
  try {
    let r = await requestOnce(url, { method: 'HEAD', fetchImpl, timeoutMs, pauseMs, sleep, wantBody: false });
    if (r.status === 405 || r.status === 501) {
      r = await requestOnce(url, { method: 'GET', fetchImpl, timeoutMs, pauseMs, sleep, wantBody: false });
    }
    let location = null;
    if (r.location) {
      try {
        location = new URL(r.location, url).href;
      } catch {
        location = r.location;
      }
    }
    return { url, status: r.status, location, error: null };
  } catch (e) {
    return { url, status: 0, location: null, error: plainFailure(e, timeoutMs) };
  }
}

// ---------------------------------------------------------------- reading a page

// A page is read with one forward scan and never backs up, so a page full of broken markup costs
// time in proportion to its size. A tag, comment or script that never ends is cut at the next "<"
// (or the end of the text). Only the first MAX_PARSE_CHARS characters are read.
export const MAX_PARSE_CHARS = 1024 * 1024;
const CAPTURE_MAX = 2000;

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '-', mdash: '-', hellip: '...' };
function decode(s) {
  return String(s ?? '').replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      try {
        return Number.isFinite(code) ? String.fromCodePoint(code) : m;
      } catch {
        return m;
      }
    }
    return Object.hasOwn(ENTITIES, e.toLowerCase()) ? ENTITIES[e.toLowerCase()] : m;
  });
}

const squash = (s) => decode(s).replace(/\s+/g, ' ').trim();

const isSpace = (code) => code === 32 || code === 9 || code === 10 || code === 13 || code === 12;
const isLetter = (code) => (code >= 65 && code <= 90) || (code >= 97 && code <= 122);

// The attributes of one tag, read left to right: {name: value}, names lower case, first one wins.
function attrsOf(source) {
  const out = Object.create(null);
  const n = source.length;
  let i = 0;
  while (i < n) {
    const c = source.charCodeAt(i);
    if (isSpace(c) || c === 47) {
      i++;
      continue;
    }
    const start = i;
    while (i < n) {
      const d = source.charCodeAt(i);
      if (isSpace(d) || d === 61 || d === 47 || d === 34 || d === 39 || d === 60) break;
      i++;
    }
    if (i === start) {
      i++;
      continue;
    }
    const name = source.slice(start, i).toLowerCase();
    let j = i;
    while (j < n && isSpace(source.charCodeAt(j))) j++;
    let value = '';
    if (source[j] === '=') {
      j++;
      while (j < n && isSpace(source.charCodeAt(j))) j++;
      const q = source[j];
      if (q === '"' || q === "'") {
        const close = source.indexOf(q, j + 1);
        value = close === -1 ? source.slice(j + 1) : source.slice(j + 1, close);
        j = close === -1 ? n : close + 1;
      } else {
        const from = j;
        while (j < n && !isSpace(source.charCodeAt(j))) j++;
        value = source.slice(from, j);
      }
      i = j;
    }
    if (!(name in out)) out[name] = decode(value);
  }
  return out;
}

const pathOfUrl = (u) => {
  try {
    return new URL(u).pathname;
  } catch {
    return '/';
  }
};
export { pathOfUrl };

const NON_SCRIPT_TYPES = /ld\+json|application\/json|importmap|partytown|speculationrules/i;
const WORD_RE = /[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu;

export function extract(htmlInput, url = `${SITE_ORIGIN}/`) {
  const full = typeof htmlInput === 'string' ? htmlInput : '';
  const truncated = full.length > MAX_PARSE_CHARS;
  const src = truncated ? full.slice(0, MAX_PARSE_CHARS) : full;
  const n = src.length;

  const out = {
    title: '',
    description: '',
    canonical: '',
    robotsMeta: '',
    h1s: [],
    headings: [],
    links: [],
    images: [],
    jsonLd: [],
    scripts: { count: 0, blocking: 0 },
    stylesheets: 0,
    wordCount: 0,
    lang: '',
    viewport: '',
    og: { title: '', description: '', image: '' },
    mixed: [],
    truncated,
  };

  let base;
  try {
    base = new URL(url);
  } catch {
    base = new URL(`${SITE_ORIGIN}/`);
  }
  const mixed = new Set();
  const noteMixed = (value) => {
    if (/^http:\/\//i.test(String(value ?? '').trim())) mixed.add(String(value).trim());
  };

  // What is being read between an opening and closing tag: a title, a heading, a link.
  const feedCap = (cap, text) => {
    if (cap && cap.len < CAPTURE_MAX) {
      cap.parts.push(text);
      cap.len += text.length;
    }
  };
  let titleCap = null;
  let headCap = null;
  let anchorCap = null;
  let titleDone = false;
  let sawHtml = false;
  let inHead = false;
  let skip = 0; // inside template, svg or noscript
  let excluded = 0; // inside nav, header, footer or aside
  let mainDepth = 0;
  let articleDepth = 0;
  let sawMain = false;
  let sawArticle = false;
  const words = { all: 0, main: 0, article: 0 };

  const endTitle = () => {
    if (!titleCap) return;
    out.title = squash(titleCap.parts.join(' '));
    titleCap = null;
    titleDone = true;
  };
  const endHeading = () => {
    if (!headCap) return;
    const text = squash(headCap.parts.join(' '));
    if (text) {
      out.headings.push({ level: headCap.level, text });
      if (headCap.level === 1) out.h1s.push(text);
    }
    headCap = null;
  };
  const endAnchor = () => {
    const cap = anchorCap;
    anchorCap = null;
    if (!cap) return;
    const rawHref = (cap.attrs.href ?? '').trim();
    if (!rawHref || rawHref.startsWith('#')) return;
    let target;
    try {
      target = new URL(rawHref, base);
    } catch {
      return;
    }
    if (target.protocol !== 'http:' && target.protocol !== 'https:') return;
    target.hash = '';
    const text = squash(cap.parts.join(' ')) || squash(cap.attrs['aria-label'] || cap.attrs.title || cap.alt);
    out.links.push({ href: target.href, text, internal: target.hostname === SITE_HOST });
  };

  const onText = (from, to) => {
    const text = src.slice(from, to);
    feedCap(titleCap, text);
    feedCap(headCap, text);
    feedCap(anchorCap, text);
    if (skip > 0 || inHead) return;
    const count = (text.match(/[\p{L}\p{N}]/u) ? (decode(text).match(WORD_RE) ?? []).length : 0) || 0;
    if (!count) return;
    if (excluded === 0) words.all += count;
    if (mainDepth > 0) words.main += count;
    if (articleDepth > 0) words.article += count;
  };

  const onOpen = (name, attrSource) => {
    if (name === 'a') {
      endAnchor();
      anchorCap = { attrs: attrsOf(attrSource), parts: [], len: 0, alt: '' };
      return;
    }
    if (name.length === 2 && name[0] === 'h' && name[1] >= '1' && name[1] <= '6') {
      endHeading();
      headCap = { level: Number(name[1]), parts: [], len: 0 };
      return;
    }
    switch (name) {
      case 'title':
        if (!titleDone && !titleCap && skip === 0) titleCap = { parts: [], len: 0 };
        return;
      case 'html':
        if (!sawHtml) {
          sawHtml = true;
          out.lang = (attrsOf(attrSource).lang ?? '').trim();
        }
        return;
      case 'head':
        inHead = true;
        return;
      case 'body':
        inHead = false;
        return;
      case 'main':
        sawMain = true;
        mainDepth++;
        return;
      case 'article':
        sawArticle = true;
        articleDepth++;
        return;
      case 'nav':
      case 'header':
      case 'footer':
      case 'aside':
        excluded++;
        return;
      case 'template':
      case 'svg':
      case 'noscript':
        skip++;
        return;
      case 'meta': {
        const a = attrsOf(attrSource);
        const key = (a.name ?? a.property ?? '').toLowerCase();
        const content = a.content ?? '';
        if (key === 'description' && !out.description) out.description = squash(content);
        else if (key === 'robots' || key === 'googlebot')
          out.robotsMeta = `${out.robotsMeta} ${content}`.trim().toLowerCase();
        else if (key === 'viewport' && !out.viewport) out.viewport = content.trim();
        else if (key === 'og:title' && !out.og.title) out.og.title = squash(content);
        else if (key === 'og:description' && !out.og.description) out.og.description = squash(content);
        else if (key === 'og:image' && !out.og.image) out.og.image = content.trim();
        return;
      }
      case 'link': {
        const a = attrsOf(attrSource);
        const rel = (a.rel ?? '').toLowerCase();
        if (/\bcanonical\b/.test(rel) && !out.canonical) out.canonical = (a.href ?? '').trim();
        if (/\bstylesheet\b/.test(rel)) {
          out.stylesheets++;
          noteMixed(a.href);
        }
        return;
      }
      case 'img': {
        const a = attrsOf(attrSource);
        const imgSrc = a.src ?? '';
        if (anchorCap && !anchorCap.alt && a.alt) anchorCap.alt = a.alt;
        if (!/^data:/i.test(imgSrc)) {
          out.images.push({
            src: imgSrc,
            alt: 'alt' in a ? a.alt : null,
            hasSize: Boolean(String(a.width ?? '').trim() && String(a.height ?? '').trim()),
          });
        }
        noteMixed(imgSrc);
        return;
      }
      case 'iframe':
      case 'source':
      case 'video':
      case 'audio':
      case 'embed':
        noteMixed(attrsOf(attrSource).src);
        return;
      default:
    }
  };

  const onClose = (name) => {
    if (name === 'a') return endAnchor();
    if (name.length === 2 && name[0] === 'h' && name[1] >= '1' && name[1] <= '6') return endHeading();
    switch (name) {
      case 'title':
        return endTitle();
      case 'head':
        inHead = false;
        return;
      case 'main':
        mainDepth = Math.max(0, mainDepth - 1);
        return;
      case 'article':
        articleDepth = Math.max(0, articleDepth - 1);
        return;
      case 'nav':
      case 'header':
      case 'footer':
      case 'aside':
        excluded = Math.max(0, excluded - 1);
        return;
      case 'template':
      case 'svg':
      case 'noscript':
        skip = Math.max(0, skip - 1);
        return;
      default:
    }
  };

  const onScript = (attrSource, content) => {
    const a = attrsOf(attrSource);
    if (a.src) noteMixed(a.src);
    const type = a.type ?? '';
    if (/ld\+json/i.test(type)) {
      const text = content.trim();
      try {
        out.jsonLd.push({ raw: text, parsed: JSON.parse(text), error: null });
      } catch (e) {
        out.jsonLd.push({ raw: text, parsed: null, error: String(e?.message ?? e).slice(0, 160) });
      }
    }
    if (NON_SCRIPT_TYPES.test(type)) return;
    out.scripts.count++;
    const deferred = 'async' in a || 'defer' in a || /module/i.test(type);
    if (inHead && a.src && !deferred) out.scripts.blocking++;
  };

  // The forward scan. Each failed search for an end (a comment, a script, a quote) is remembered, so
  // a repeat of the same broken markup is never searched for again.
  const noEnd = { script: false, style: false };
  const endRe = { script: /<\/script/gi, style: /<\/style/gi };
  let noCommentEnd = false;
  const noQuote = { '"': false, "'": false };
  let i = 0;
  let textFrom = 0;
  const flush = (to) => {
    if (to > textFrom) onText(textFrom, to);
  };
  while (i < n) {
    const lt = src.indexOf('<', i);
    if (lt === -1) break;
    const c = src.charCodeAt(lt + 1);

    if (c === 33 && src.startsWith('<!--', lt)) {
      flush(lt);
      let next;
      const end = noCommentEnd ? -1 : src.indexOf('-->', lt + 4);
      if (end === -1) {
        noCommentEnd = true;
        const nx = src.indexOf('<', lt + 4);
        next = nx === -1 ? n : nx;
      } else next = end + 3;
      i = textFrom = next;
      continue;
    }
    if (c === 33 || c === 63) {
      flush(lt);
      let j = lt + 2;
      while (j < n && src[j] !== '>' && src[j] !== '<') j++;
      i = textFrom = src[j] === '>' ? j + 1 : j;
      continue;
    }
    if (c === 47 && isLetter(src.charCodeAt(lt + 2))) {
      flush(lt);
      let j = lt + 2;
      while (j < n && !isSpace(src.charCodeAt(j)) && src[j] !== '>' && src[j] !== '<' && src[j] !== '/') j++;
      const name = src.slice(lt + 2, j).toLowerCase();
      while (j < n && src[j] !== '>' && src[j] !== '<') j++;
      onClose(name);
      i = textFrom = src[j] === '>' ? j + 1 : j;
      continue;
    }
    if (!isLetter(c)) {
      i = lt + 1;
      continue;
    }

    flush(lt);
    let j = lt + 1;
    while (j < n) {
      const d = src.charCodeAt(j);
      if (isSpace(d) || d === 62 || d === 60 || d === 47) break;
      j++;
    }
    const name = src.slice(lt + 1, j).toLowerCase();
    const attrStart = j;
    let afterEquals = false;
    for (; j < n; j++) {
      const ch = src[j];
      if (ch === '>' || ch === '<') break;
      if (ch === '=') {
        afterEquals = true;
      } else if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r' || ch === '\f') {
        // spaces keep "after an equals sign" alive
      } else if ((ch === '"' || ch === "'") && afterEquals) {
        afterEquals = false;
        if (!noQuote[ch]) {
          const close = src.indexOf(ch, j + 1);
          if (close === -1) noQuote[ch] = true;
          else j = close;
        }
      } else afterEquals = false;
    }
    const attrSource = src.slice(attrStart, j);
    const selfClosing = attrSource.endsWith('/');
    i = textFrom = src[j] === '>' ? j + 1 : j;

    if (name === 'script' || name === 'style') {
      let contentEnd;
      if (!noEnd[name] && !selfClosing) {
        endRe[name].lastIndex = i;
        const m = endRe[name].exec(src);
        if (m) contentEnd = m.index;
        else noEnd[name] = true;
      }
      if (selfClosing) contentEnd = i;
      else if (contentEnd === undefined) {
        const nx = src.indexOf('<', i);
        contentEnd = nx === -1 ? n : nx;
      }
      if (name === 'script') onScript(attrSource, src.slice(i, contentEnd));
      i = textFrom = contentEnd;
      continue;
    }
    onOpen(name, attrSource);
  }
  flush(n);
  endTitle();
  endHeading();
  endAnchor();

  out.mixed = [...mixed];
  out.wordCount = sawMain ? words.main : sawArticle ? words.article : words.all;
  return out;
}
