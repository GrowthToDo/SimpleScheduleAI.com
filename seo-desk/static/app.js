// SEO Desk page shell: hash routing, the sidebar (views/nav.js) with its live counts, the bar at
// the top of the content (source dots, data date, Refresh now, the standing line), the theme
// switch (theme.js), one fetch helper, toasts, confirm and prompt boxes, keyboard shortcuts, and
// the context object every view receives. Each page is one module in views/ that exports
//   async function render(el, ctx)
// The contract is written down in README-views.md.

import { openDrawer, closeDrawer, isDrawerOpen } from './views/drawer.js';
import { buildNav, updateCounts, entryFor } from './views/nav.js';
import { themeSwitch, drawFavicon } from './theme.js';
import { handOver } from './views/ask.js';

export const DESK_VERSION = 'Version 3.0';

// Route name -> view module in views/ (without .js). The sidebar order lives in views/nav.js.
export const ROUTES = {
  // Above the groups in the sidebar: a question answered by Claude from the desk's data.
  ask: 'ask',
  week: 'week',
  performance: 'overview',
  queries: 'search',
  pages: 'pages',
  'keyword-map': 'keyword-map',
  cannibalization: 'cannibalization',
  'runner-up': 'runner-up',
  'secondary-keywords': 'secondary-keywords',
  'content-gaps': 'content-gaps',
  decay: 'decay',
  links: 'internal-links',
  opportunities: 'opportunities',
  audit: 'health',
  ai: 'ai',
  visitors: 'visitors',
  results: 'results',
  keywords: 'keywords',
  competitors: 'competitors',
  settings: 'settings',
  // Not in the sidebar: the week's plan as a clean page to print or save as a PDF.
  'print/week': 'print-week',
};

// Addresses from before the sidebar, kept working.
export const OLD_ROUTES = { search: 'performance', health: 'audit' };

// The old Search page's Searches and Target keywords lists and its filters now live under
// Queries, so an old link that names one of them lands there with its parameters. Its Pages list
// lives on Pages: `tab=pages` goes there.
const SEARCH_LIST_KEYS = ['tab', 'q', 'qmode', 'pagefilter', 'pagemode', 'pmode', 'country', 'device', 'start', 'end'];

// True for a page address ('#/week', '#/', ''). An in-page anchor such as '#view' (the skip link)
// is not an address, so the router leaves it alone.
export function isRouteHash(hash) {
  const h = String(hash ?? '');
  return h === '' || h === '#' || h.startsWith('#/');
}

// '#/search?tab=queries' -> {name: 'search', query: 'tab=queries'}
export function parseHashText(hash) {
  const raw = String(hash ?? '').replace(/^#\/?/, '');
  const at = raw.indexOf('?');
  return at < 0 ? { name: raw, query: '' } : { name: raw.slice(0, at), query: raw.slice(at + 1) };
}

// The page to draw for an address. `moved` is true when the address must be rewritten.
export function resolveRoute(name, query = '') {
  const p = new URLSearchParams(query);
  if ((name === 'search' || name === 'queries') && p.get('tab') === 'pages')
    return { name: 'pages', query, moved: true };
  if (Object.hasOwn(ROUTES, name)) return { name, query, moved: false };
  if (name === 'search') {
    const toList = SEARCH_LIST_KEYS.some((k) => p.has(k));
    return { name: toList ? 'queries' : OLD_ROUTES.search, query, moved: true };
  }
  if (Object.hasOwn(OLD_ROUTES, name)) return { name: OLD_ROUTES[name], query, moved: true };
  return { name: 'week', query: '', moved: name !== '' };
}

export const SOURCE_NAMES = {
  gsc: 'Search Console',
  bing: 'Bing Webmaster',
  ga4: 'Google Analytics',
  clarity: 'Clarity',
  local: 'Repo files',
  index: 'Index checks',
  dfs: 'AI citation check',
};

const STATUS_WORDS = {
  fresh: 'up to date',
  stale: 'out of date, a refresh is due',
  failed: 'the last pull failed',
  'needs-sign-in': 'needs you to sign in again',
  never: 'not pulled yet',
};

export const NOT_ENOUGH = 'not enough data yet';

// ------------------------------------------------------------------ DOM helper

// h('div', {class: 'x', onclick: fn, dataset: {id: 1}}, 'text', node, [more, nodes])
// Strings become text nodes, so data is never parsed as HTML.
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs ?? {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'value' || k === 'checked' || k === 'disabled' || k === 'hidden') el[k] = v;
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  append(el, children);
  return el;
}

// Appends children to el, skipping null, undefined and false (el.append would print "null").
export function mount(el, ...children) {
  append(el, children);
  return el;
}

function append(el, children) {
  for (const c of children.flat(Infinity)) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
}

// ------------------------------------------------------------------ formatting

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const isoParts = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso ?? ''));
  return m ? { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) } : null;
};

export const fmt = {
  NOT_ENOUGH,
  // 12193 -> '12,193'; null -> 'not enough data yet'
  num(v, { digits = 0 } = {}) {
    if (v === null || v === undefined || !Number.isFinite(Number(v))) return NOT_ENOUGH;
    return Number(v).toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: 0 });
  },
  // A change: 'percent' (12 -> '+12%'), 'positions' (positive = better, '1.2 places better'),
  // 'count' (4 -> '+4'). null -> 'not enough data yet'. Never a dash character.
  change(v, kind = 'percent') {
    if (v === null || v === undefined || !Number.isFinite(Number(v))) return NOT_ENOUGH;
    const n = Number(v);
    if (kind === 'positions') {
      if (n === 0) return 'no change in place';
      const a = Math.abs(n).toFixed(1);
      return `${a} ${a === '1.0' ? 'place' : 'places'} ${n > 0 ? 'better' : 'worse'}`;
    }
    const sign = n > 0 ? '+' : n < 0 ? '-' : '';
    const body = Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 1 });
    return `${sign}${body}${kind === 'percent' ? '%' : ''}`;
  },
  // Direction of a change for colouring: 'up', 'down' or ''.
  direction(v, { lowerIsBetter = false } = {}) {
    if (v === null || v === undefined || !Number(v)) return '';
    return Number(v) > 0 !== lowerIsBetter ? 'up' : 'down';
  },
  // '2026-11-07' -> '7 November' (with the year when it is not this year)
  date(iso) {
    const p = isoParts(iso);
    if (!p) return iso ? String(iso) : '';
    const year = p.y === new Date().getFullYear() ? '' : ` ${p.y}`;
    return `${p.d} ${MONTHS[p.m - 1]}${year}`;
  },
  // '2026-11-07' -> '7 Nov'
  dateShort(iso) {
    const p = isoParts(iso);
    return p ? `${p.d} ${MONTHS[p.m - 1].slice(0, 3)}` : '';
  },
  // {start, end, text} -> '11 October to 7 November'
  range(r) {
    if (!r) return '';
    if (r.text) return r.text;
    return r.start === r.end ? fmt.date(r.start) : `${fmt.date(r.start)} to ${fmt.date(r.end)}`;
  },
  // an average place in search: 6.86 -> '6.9'
  position(v) {
    return v === null || v === undefined || !Number.isFinite(Number(v)) ? NOT_ENOUGH : Number(v).toFixed(1);
  },
  // a share or rate held as 0..1: 0.46 -> '46%', 0.0091 -> '0.9%'
  share(v, digits) {
    if (v === null || v === undefined || !Number.isFinite(Number(v))) return NOT_ENOUGH;
    const p = Number(v) * 100;
    const d = digits ?? (p > 0 && p < 10 ? 1 : 0);
    return `${p.toFixed(d)}%`;
  },
  // an ISO time -> '06:40', the time of day on this computer's clock
  clock(iso) {
    const d = new Date(iso ?? '');
    if (!iso || Number.isNaN(d.getTime())) return '';
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  },
  // an ISO time -> 'just now', '3 hours ago', '2 days ago'
  ago(iso) {
    if (!iso) return 'never';
    const s = (Date.now() - Date.parse(iso)) / 1000;
    if (!Number.isFinite(s)) return '';
    if (s < 90) return 'just now';
    if (s < 3600) return `${Math.round(s / 60)} minutes ago`;
    if (s < 36 * 3600) return `${Math.round(s / 3600)} ${Math.round(s / 3600) === 1 ? 'hour' : 'hours'} ago`;
    const d = Math.round(s / 86400);
    return `${d} ${d === 1 ? 'day' : 'days'} ago`;
  },
  plural(n, one, many) {
    return `${fmt.num(n)} ${Number(n) === 1 ? one : many}`;
  },
  // 'YYYY-MM-DD' for today plus n days, on this computer's calendar (the server counts the
  // same way, see seo-desk/lib/dates.mjs todayIso).
  isoPlus(days, from = new Date()) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + days);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  },
};

// ------------------------------------------------------------------ fetch helper

async function request(method, path, body) {
  const init = { method, headers: {} };
  if (body !== undefined) {
    init.headers['Content-Type'] = typeof body === 'string' ? 'text/plain' : 'application/json';
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch(path, init);
  } catch {
    throw new Error('The desk server is not answering. Is it still running?');
  }
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    const err = new Error(data?.error || `The server answered ${res.status}.`);
    err.status = res.status;
    // The whole reply, for the few refusals that carry facts (Done on a frozen page sends `frozen`).
    err.data = data;
    throw err;
  }
  return data;
}

// Anything that changes state may change a sidebar count, so a successful write recounts them.
async function write(method, path, body) {
  const data = await request(method, path, body);
  scheduleCounts();
  return data;
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body = {}) => write('POST', path, body),
  put: (path, body = {}) => write('PUT', path, body),
  // DELETE with an optional JSON body ({keyword} for /api/targets).
  del: (path, body) => write('DELETE', path, body),
};

// ------------------------------------------------------------------ toasts

export function toast(message, kind = 'info', { ms } = {}) {
  const box = document.getElementById('toasts');
  const el = h(
    'div',
    { class: `toast${kind === 'error' ? ' is-error' : kind === 'success' ? ' is-success' : ''}` },
    message
  );
  box.append(el);
  const life = ms ?? (kind === 'error' ? 7000 : Math.min(9000, 2800 + String(message).length * 30));
  setTimeout(() => el.remove(), life);
}

// ------------------------------------------------------------------ confirm and prompt boxes

function modal(build) {
  return new Promise((resolve) => {
    const dialog = h('dialog', { class: 'dialog' });
    const done = (value) => {
      dialog.close();
      dialog.remove();
      resolve(value);
    };
    dialog.addEventListener('cancel', (e) => {
      e.preventDefault();
      done(build.cancelValue);
    });
    dialog.append(build(done));
    document.body.append(dialog);
    dialog.showModal();
    const first = dialog.querySelector('[data-autofocus]') ?? dialog.querySelector('button');
    first?.focus();
  });
}

// Resolves true when the person presses the confirm button, false otherwise.
export function confirmBox({ title, body = '', confirmLabel = 'Go ahead', cancelLabel = 'Cancel', danger = false }) {
  const build = (done) =>
    h(
      'form',
      {
        method: 'dialog',
        onsubmit: (e) => {
          e.preventDefault();
          done(true);
        },
      },
      h('h2', {}, title),
      body ? h('p', { class: 'dialog-body' }, body) : null,
      h(
        'div',
        { class: 'dialog-actions' },
        h('button', { type: 'button', class: 'btn', onclick: () => done(false) }, cancelLabel),
        h(
          'button',
          { type: 'submit', class: `btn ${danger ? 'btn-danger' : 'btn-primary'}`, 'data-autofocus': true },
          confirmLabel
        )
      )
    );
  build.cancelValue = false;
  return modal(build);
}

// Asks for one value. type: 'text' | 'textarea' | 'date'. Resolves the trimmed value, or
// null when cancelled. `required` refuses an empty answer.
export function promptBox({
  title,
  body = '',
  label = '',
  type = 'text',
  value = '',
  placeholder = '',
  min,
  confirmLabel = 'Save',
  required = true,
  maxLength = 300,
}) {
  const build = (done) => {
    const field =
      type === 'textarea'
        ? h('textarea', {
            class: 'input',
            placeholder,
            maxlength: maxLength,
            'data-autofocus': true,
            'aria-label': label,
          })
        : h('input', {
            class: 'input',
            type,
            placeholder,
            min,
            maxlength: type === 'date' ? undefined : maxLength,
            'data-autofocus': true,
            'aria-label': label || title,
          });
    field.value = value;
    const error = h('p', { class: 'dialog-error', hidden: true });
    return h(
      'form',
      {
        method: 'dialog',
        onsubmit: (e) => {
          e.preventDefault();
          const v = field.value.trim();
          if (required && !v) {
            error.textContent = type === 'date' ? 'Pick a date first.' : 'Write a few words first.';
            error.hidden = false;
            field.focus();
            return;
          }
          if (type === 'date' && min && v < min) {
            error.textContent = `Pick a date from ${fmt.date(min)} on.`;
            error.hidden = false;
            return;
          }
          done(v);
        },
      },
      h('h2', {}, title),
      body ? h('p', { class: 'dialog-body' }, body) : null,
      h('div', { class: 'dialog-field' }, label ? h('label', { class: 'small muted' }, label) : null, field),
      error,
      h(
        'div',
        { class: 'dialog-actions' },
        h('button', { type: 'button', class: 'btn', onclick: () => done(null) }, 'Cancel'),
        h('button', { type: 'submit', class: 'btn btn-primary' }, confirmLabel)
      )
    );
  };
  build.cancelValue = null;
  return modal(build);
}

// ------------------------------------------------------------------ popup menu

let openMenuEl = null;
let openMenuAnchor = null;

export function closeMenu() {
  openMenuEl?.remove();
  openMenuEl = null;
  openMenuAnchor = null;
}

// Shows a small menu under `anchor`. items: [{label, onSelect}]
export function menu(anchor, items) {
  closeMenu();
  const el = h(
    'div',
    { class: 'menu', role: 'menu' },
    items.map((it) =>
      h(
        'button',
        {
          type: 'button',
          role: 'menuitem',
          onclick: () => {
            closeMenu();
            anchor.focus();
            it.onSelect();
          },
        },
        it.label
      )
    )
  );
  document.body.append(el);
  const r = anchor.getBoundingClientRect();
  const left = Math.min(
    r.left + window.scrollX,
    window.scrollX + document.documentElement.clientWidth - el.offsetWidth - 8
  );
  el.style.left = `${Math.max(8, left)}px`;
  el.style.top = `${r.bottom + window.scrollY + 4}px`;
  openMenuEl = el;
  openMenuAnchor = anchor;
  el.querySelector('button')?.focus();
  el.addEventListener('keydown', (e) => {
    const buttons = [...el.querySelectorAll('button')];
    const i = buttons.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') buttons[(i + 1) % buttons.length].focus();
    else if (e.key === 'ArrowUp') buttons[(i - 1 + buttons.length) % buttons.length].focus();
    else return;
    e.preventDefault();
  });
}

function closeMenuOnClickOutside(e) {
  // The click that opened the menu also reaches here; it must not close it again.
  if (openMenuEl && !openMenuEl.contains(e.target) && !openMenuAnchor?.contains(e.target)) closeMenu();
}

// ------------------------------------------------------------------ clipboard

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = h('textarea', { style: { position: 'fixed', top: '-1000px' } });
    area.value = text;
    document.body.append(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }
}

// ------------------------------------------------------------------ sidebar counts

let navCounts = null;
let countsTimer = null;

export function getCounts() {
  return navCounts;
}

async function loadCounts() {
  try {
    const data = await api.get('/api/nav');
    navCounts = data?.counts ?? null;
    const navEl = document.getElementById('nav');
    if (navEl) updateCounts(navEl, navCounts);
    document.dispatchEvent(new CustomEvent('countschange', { detail: navCounts }));
  } catch {
    // The counts stay as they were; the page itself shows any error.
  }
}

// A burst of writes (bulk Done) recounts once, shortly after the last one.
function scheduleCounts() {
  if (typeof document === 'undefined') return;
  clearTimeout(countsTimer);
  countsTimer = setTimeout(loadCounts, 400);
}

// ------------------------------------------------------------------ top bar

function showSources(sources, through) {
  const dots = document.getElementById('dots');
  dots.replaceChildren(
    ...(sources ?? []).map((s) => {
      const name = SOURCE_NAMES[s.source] ?? s.source;
      let text = `${name}: ${STATUS_WORDS[s.status] ?? s.status}`;
      if (s.pulledAt) text += `. Pulled ${fmt.ago(s.pulledAt)}`;
      if (s.through) text += `, data through ${fmt.date(s.through)}`;
      text += '.';
      if (s.error) text += ` ${s.error}`;
      // A failed pull that the desk will try again on its own says when.
      if (s.retryAt) text += ` Trying again at ${fmt.clock(s.retryAt)}.`;
      return h('button', { type: 'button', class: 'dot', 'data-status': s.status, title: text, 'aria-label': text });
    })
  );
  const gsc = (sources ?? []).find((s) => s.source === 'gsc');
  const date = through ?? gsc?.through ?? null;
  document.getElementById('through').textContent = date ? `Data through ${fmt.date(date)}` : 'No data pulled yet';
  measureTopline();
}

// Views pass the envelope of any GET so the top bar shows the freshest source state.
function envelope(data) {
  if (data?.sources) showSources(data.sources, data.through);
}

async function loadSources() {
  try {
    showSources(await api.get('/api/sources'));
  } catch (e) {
    document.getElementById('through').textContent = e.message;
  }
}

let refreshTimer = null;

function refreshLabel(p) {
  if (!p?.running) return 'Refresh now';
  const done = Object.keys(p.completed ?? {}).length;
  const total = Math.max(p.queue?.length ?? 0, done + 1);
  return p.current
    ? `Refreshing ${SOURCE_NAMES[p.current] ?? p.current} (${Math.min(done + 1, total)} of ${total})`
    : 'Refreshing...';
}

async function watchRefresh() {
  const button = document.getElementById('refresh');
  clearTimeout(refreshTimer);
  let p;
  try {
    p = await api.get('/api/refresh');
  } catch {
    button.disabled = false;
    button.textContent = 'Refresh now';
    return;
  }
  button.textContent = refreshLabel(p);
  button.disabled = Boolean(p.running);
  if (p.running) {
    refreshTimer = setTimeout(async () => {
      const was = await api.get('/api/refresh').catch(() => null);
      if (was && !was.running) {
        button.textContent = 'Refresh now';
        button.disabled = false;
        await loadSources();
        loadCounts();
        const failed = Object.entries(was.completed ?? {}).filter(([, v]) => v === 'failed' || v === 'needs-sign-in');
        toast(
          failed.length
            ? `Refresh finished. ${failed.map(([k]) => SOURCE_NAMES[k] ?? k).join(', ')} did not update.`
            : 'Refresh finished. The page now shows the new data.',
          failed.length ? 'error' : 'success'
        );
        reload();
      } else {
        watchRefresh();
      }
    }, 2000);
  }
}

async function startRefresh() {
  try {
    await api.post('/api/refresh', {});
    toast('Pulling fresh data from every source. This takes a minute or two.');
    watchRefresh();
  } catch (e) {
    toast(e.message, 'error');
  }
}

// ------------------------------------------------------------------ routing

// The page for the current address. An old or unknown address is rewritten in place (no extra
// history entry), keeping its parameters.
function parseHash() {
  const { name: raw, query } = parseHashText(location.hash);
  const { name, query: q, moved } = resolveRoute(raw, query);
  if (moved) history.replaceState(null, '', `#/${name}${q ? `?${q}` : ''}`);
  return { name, params: new URLSearchParams(q) };
}

export function navigate(hash) {
  const target = hash.startsWith('#') ? hash : `#/${hash.replace(/^\//, '')}`;
  if (location.hash === target) render();
  else location.hash = target;
}

// Changes the query part of the current page address without drawing the page again.
function setParams(values) {
  const { name, params } = parseHash();
  for (const [k, v] of Object.entries(values)) {
    if (v === null || v === undefined || v === '' || v === false) params.delete(k);
    else params.set(k, String(v));
  }
  const q = params.toString();
  history.replaceState(null, '', `#/${name}${q ? `?${q}` : ''}`);
}

let renderToken = 0;

function makeCtx(name, params) {
  return {
    route: name,
    params,
    api,
    toast,
    confirmBox,
    promptBox,
    menu,
    copyText,
    openDrawer,
    closeDrawer,
    navigate,
    setParams,
    reload,
    envelope,
    counts: getCounts,
    fmt,
    h,
    mount,
  };
}

function markCurrent(name) {
  for (const a of document.querySelectorAll('#nav a')) {
    if (a.dataset.route === name) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
  // Keep the current entry in view inside the sidebar (the sidebar scrolls on its own).
  const side = document.getElementById('side');
  const cur = document.querySelector('#nav a[aria-current]');
  if (side && cur) {
    const top = cur.offsetTop - side.scrollTop;
    if (top < 60 || top > side.clientHeight - 140) side.scrollTop = cur.offsetTop - side.clientHeight / 3;
  }
}

async function render({ keepScroll = false } = {}) {
  const token = ++renderToken;
  const { name, params } = parseHash();
  const view = document.getElementById('view');
  markCurrent(name);
  const y = window.scrollY;
  const slow = setTimeout(() => {
    if (token === renderToken && !keepScroll) view.replaceChildren(h('p', { class: 'loading' }, 'Loading...'));
  }, 150);
  try {
    const mod = await import(`./views/${ROUTES[name]}.js`);
    // Views draw into a detached box first, so a reload does not flash an empty page.
    const box = document.createElement('div');
    await mod.render(box, makeCtx(name, params));
    if (token !== renderToken) return;
    clearTimeout(slow);
    view.replaceChildren(...box.childNodes);
    if (keepScroll) window.scrollTo(0, y);
    else window.scrollTo(0, 0);
    // A page outside the sidebar names itself (PRINT_TITLE on the print view); the desk alone otherwise.
    const label = entryFor(name)?.label ?? mod.PRINT_TITLE ?? null;
    document.title = label ? `${label} | SEO Desk` : 'SEO Desk';
  } catch (e) {
    if (token !== renderToken) return;
    clearTimeout(slow);
    view.replaceChildren(
      h(
        'div',
        { class: 'banner banner-bad' },
        h('strong', {}, 'This page could not load. '),
        e.message || String(e),
        ' ',
        h('button', { type: 'button', class: 'btn btn-small', onclick: () => render() }, 'Try again')
      )
    );
  }
}

// Draws the current page again with fresh data and keeps the scroll position.
export function reload() {
  return render({ keepScroll: true });
}

// ------------------------------------------------------------------ the sidebar on a small screen

// Under 900 px the sidebar is a panel over the page (a modal dialog while open), opened by the
// menu button and closed by its own Close the menu button, Esc, a tap outside it, or picking a
// page. While it is open everything behind it is inert (the menu button too, which the panel
// covers), so Tab stays inside the panel; on close, focus goes back to the menu button.
const narrow = () => window.matchMedia('(max-width: 900px)').matches;

function isSideOpen() {
  return document.body.classList.contains('side-open');
}

function setBehind(inert) {
  for (const el of document.querySelectorAll('.main, .skip')) el.inert = inert;
}

function openSide() {
  const side = document.getElementById('side');
  const button = document.getElementById('menu-btn');
  document.body.classList.add('side-open');
  side.setAttribute('role', 'dialog');
  side.setAttribute('aria-modal', 'true');
  button.setAttribute('aria-expanded', 'true');
  button.setAttribute('aria-label', 'Close the menu');
  document.getElementById('scrim').hidden = false;
  document.getElementById('side-close').hidden = false;
  setBehind(true);
  (document.querySelector('#nav a[aria-current]') ?? document.querySelector('#nav a'))?.focus();
}

function closeSide({ focusButton = true } = {}) {
  if (!isSideOpen()) return;
  const side = document.getElementById('side');
  const button = document.getElementById('menu-btn');
  document.body.classList.remove('side-open');
  side.removeAttribute('role');
  side.removeAttribute('aria-modal');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-label', 'Open the menu');
  document.getElementById('scrim').hidden = true;
  document.getElementById('side-close').hidden = true;
  setBehind(false);
  if (focusButton && narrow()) button.focus();
}

// The top bar sticks; anything else that sticks (the bulk bar) or scrolls a row into view sits
// below it. Its height changes with the width and the wrapping, so it is measured, not guessed.
function measureTopline() {
  const bar = document.querySelector('.topline');
  if (bar) {
    document.documentElement.style.setProperty('--topline-h', `${Math.ceil(bar.getBoundingClientRect().height)}px`);
  }
}

function trackTopline() {
  const bar = document.querySelector('.topline');
  if (!bar) return;
  measureTopline();
  window.addEventListener('resize', measureTopline);
  // The bar also changes height when its text wraps differently (a longer "Data through" line).
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(measureTopline).observe(bar);
}

// ------------------------------------------------------------------ keyboard

function onKey(e) {
  const typing = e.target.closest?.('input, textarea, select, [contenteditable="true"]');
  if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
    const box = document.querySelector('#view [data-search]');
    if (box) {
      e.preventDefault();
      box.focus();
      box.select?.();
    }
  } else if (e.key === 'Escape') {
    // An open confirm or prompt box handles its own Esc; the drawer under it stays open.
    if (document.querySelector('dialog[open]')) return;
    if (openMenuEl) closeMenu();
    else if (isDrawerOpen()) closeDrawer();
    else if (isSideOpen()) closeSide();
  }
}

// ------------------------------------------------------------------ start

function buildShell() {
  // The sidebar's ask field hands its question to the Ask page in memory (never through the
  // address, so a link from elsewhere cannot spend a Claude run), and the page asks it at once.
  const onAsk = (q) => {
    closeSide({ focusButton: false });
    handOver(q);
    navigate('#/ask');
  };
  document.getElementById('nav').replaceChildren(...buildNav(h, navCounts, { onAsk }));
  document
    .getElementById('side-foot')
    .replaceChildren(
      themeSwitch(h),
      h('p', { class: 'side-version', title: 'The SEO Desk runs on this Mac only.' }, DESK_VERSION)
    );
  const menuBtn = document.getElementById('menu-btn');
  menuBtn.addEventListener('click', () => (isSideOpen() ? closeSide() : openSide()));
  document.getElementById('scrim').addEventListener('click', () => closeSide());
  document.getElementById('side-close').addEventListener('click', () => closeSide());
  document.getElementById('nav').addEventListener('click', (e) => {
    if (e.target.closest('a')) closeSide();
  });
  // The skip link is an in-page jump, not a page address: move focus, leave the address alone.
  document.querySelector('.skip')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('view').focus();
  });
  trackTopline();
  window.matchMedia('(max-width: 900px)').addEventListener('change', (m) => {
    if (!m.matches) closeSide({ focusButton: false });
  });
}

function boot() {
  document.addEventListener('click', closeMenuOnClickOutside);
  document.addEventListener('keydown', onKey);

  window.addEventListener('unhandledrejection', (e) => {
    const msg = e.reason?.message;
    if (msg) toast(msg, 'error');
  });

  window.addEventListener('hashchange', () => {
    if (!isRouteHash(location.hash)) return;
    closeDrawer();
    closeMenu();
    closeSide({ focusButton: false });
    render();
  });

  document.getElementById('refresh').addEventListener('click', startRefresh);

  buildShell();
  drawFavicon();
  loadSources();
  loadCounts();
  watchRefresh();
  render();
}

// Under node (the tests import the page modules) there is no page to start.
if (typeof document !== 'undefined') boot();
