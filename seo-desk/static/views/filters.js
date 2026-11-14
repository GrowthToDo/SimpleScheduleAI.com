// The filter bar shared by Search and Pages: date range buttons (with a custom range), text
// filters on the search and the page (contains, is exactly, does not contain), country and
// device, shown as removable chips with "Clear all". Everything lives in the page address, so a
// filtered view can be bookmarked; applying a change redraws the page from the address.
//
//   readFilters(params)                 the filter state from ctx.params
//   hasFilters(state)                   a search, page, country or device filter is set
//   isExploring(state, storedRanges)    the lists must come from /api/explore
//   apiQuery(state)                     the query string for /api/explore and friends
//   hashWith(hash, route, state)        the page address with this filter state
//   chipsOf(state, {countryName, today}) [{key, text, clear}] for the chips (dates first)
//   checkCustom(start, end, today)      null, or a plain sentence saying what is wrong
//   filterBar(ctx, {route, state, countries, today})  the bar itself, as an element
//
// Filters apply on Enter or the Apply button, never on each key: a filtered view is a live
// Search Console pull that takes a few seconds. No imports, so the pure parts run under node.

export const RANGES = [
  { value: '7', label: '7 days' },
  { value: '14', label: '14 days' },
  { value: '28', label: '28 days' },
  { value: '90', label: '90 days' },
  { value: '480', label: '16 months' },
  { value: 'this-month', label: 'This month' },
  { value: 'last-month', label: 'Last month' },
  { value: 'last-quarter', label: 'Last quarter' },
  { value: 'custom', label: 'Custom' },
];

export const MODES = [
  { value: 'contains', label: 'contains' },
  { value: 'exact', label: 'is exactly' },
  { value: 'excludes', label: 'does not contain' },
];

export const DEVICES = [
  { value: 'DESKTOP', label: 'Computer' },
  { value: 'MOBILE', label: 'Phone' },
  { value: 'TABLET', label: 'Tablet' },
];

// Address keys owned by the bar. The page filter is "pagefilter" because #/pages?page=/x already
// opens a page's drawer.
const KEYS = ['range', 'start', 'end', 'q', 'qmode', 'pagefilter', 'pagemode', 'country', 'device'];
const DEFAULT_RANGE = '28';
const MAX_DAYS = 480;
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

// A real calendar day: '2026-02-31' is refused (Date.parse would roll it over to 3 March).
const isIso = (s) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(s ?? ''))) return false;
  const t = Date.parse(`${s}T00:00:00Z`);
  return !Number.isNaN(t) && new Date(t).toISOString().slice(0, 10) === s;
};
const modeOf = (v) => (MODES.some((m) => m.value === v) ? v : 'contains');
const dayNum = (iso) => Date.parse(`${iso}T00:00:00Z`) / 86400000;
const isoOf = (n) => new Date(n * 86400000).toISOString().slice(0, 10);
const longDate = (iso, today) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]}${String(y) === String(today).slice(0, 4) ? '' : ` ${y}`}`;
};

// A custom range whose dates are missing, impossible or (with `today`) past Search Console's last
// day falls back to 28 days, with `problem` saying why, so no request is sent with it.
export function readFilters(params, { today } = {}) {
  const get = (k) => String(params.get(k) ?? '').trim();
  let range = RANGES.some((r) => r.value === get('range')) ? get('range') : DEFAULT_RANGE;
  let problem = null;
  if (range === 'custom') {
    const [from, to] = [get('start'), get('end')];
    // Without `today` only the dates themselves are checked.
    problem = today || !isIso(from) || !isIso(to) ? checkCustom(from, to, today) : null;
    if (problem) range = DEFAULT_RANGE;
  }
  const custom = range === 'custom';
  const device = get('device').toUpperCase();
  return {
    ...(problem ? { problem } : {}),
    range,
    start: custom ? get('start') : '',
    end: custom ? get('end') : '',
    q: get('q'),
    qmode: modeOf(get('qmode')),
    pagefilter: get('pagefilter'),
    pagemode: modeOf(get('pagemode')),
    country: /^[a-z]{2,3}$/i.test(get('country')) ? get('country').toLowerCase() : '',
    device: DEVICES.some((d) => d.value === device) ? device : '',
  };
}

export const hasFilters = (s) => Boolean(s.q.trim() || s.pagefilter.trim() || s.country || s.device);

export const isExploring = (s, storedRanges) => hasFilters(s) || !storedRanges.includes(s.range);

export function apiQuery(s) {
  const p = new URLSearchParams({ range: s.range });
  if (s.range === 'custom') {
    p.set('start', s.start);
    p.set('end', s.end);
  }
  if (s.q.trim()) {
    p.set('q', s.q.trim());
    if (s.qmode !== 'contains') p.set('qmode', s.qmode);
  }
  if (s.pagefilter.trim()) {
    p.set('page', s.pagefilter.trim());
    if (s.pagemode !== 'contains') p.set('pmode', s.pagemode);
  }
  if (s.country) p.set('country', s.country);
  if (s.device) p.set('device', s.device);
  return p.toString();
}

// The address for `route` with this filter state; other keys in the address (tab, metric) stay.
export function hashWith(hash, route, s) {
  const p = new URLSearchParams(String(hash ?? '').split('?')[1] ?? '');
  for (const k of KEYS) p.delete(k);
  const set = (k, v, skip = '') => {
    if (v && v !== skip) p.set(k, v);
  };
  set('range', s.range, DEFAULT_RANGE);
  if (s.range === 'custom') {
    set('start', s.start);
    set('end', s.end);
  }
  if (s.q.trim()) {
    set('q', s.q.trim());
    set('qmode', s.qmode, 'contains');
  }
  if (s.pagefilter.trim()) {
    set('pagefilter', s.pagefilter.trim());
    set('pagemode', s.pagemode, 'contains');
  }
  set('country', s.country);
  set('device', s.device);
  const q = p.toString();
  return `#/${route}${q ? `?${q}` : ''}`;
}

const modeText = (m) => MODES.find((x) => x.value === m)?.label ?? 'contains';

export function chipsOf(s, { countryName = (c) => c.toUpperCase(), today } = {}) {
  const out = [];
  const clearRange = { range: DEFAULT_RANGE, start: '', end: '' };
  if (s.range === 'custom' && s.start && s.end) {
    const ref = today ?? s.end;
    out.push({
      key: 'range',
      text: `Dates: ${longDate(s.start, ref)} to ${longDate(s.end, ref)}`,
      clear: clearRange,
    });
  } else if (s.range !== 'custom' && s.range !== DEFAULT_RANGE) {
    const label = RANGES.find((r) => r.value === s.range)?.label ?? s.range;
    out.push({ key: 'range', text: `Dates: ${label.toLowerCase()}`, clear: clearRange });
  }
  if (s.q.trim())
    out.push({ key: 'q', text: `Search ${modeText(s.qmode)} "${s.q.trim()}"`, clear: { q: '', qmode: 'contains' } });
  if (s.pagefilter.trim())
    out.push({
      key: 'page',
      text: `Page ${modeText(s.pagemode)} "${s.pagefilter.trim()}"`,
      clear: { pagefilter: '', pagemode: 'contains' },
    });
  if (s.country) out.push({ key: 'country', text: `Country: ${countryName(s.country)}`, clear: { country: '' } });
  if (s.device)
    out.push({
      key: 'device',
      text: `Device: ${DEVICES.find((d) => d.value === s.device)?.label ?? s.device}`,
      clear: { device: '' },
    });
  return out;
}

// Search Console's data ends three days before today.
export const lastDataDay = (today) => isoOf(dayNum(today) - 3);

export function checkCustom(start, end, today) {
  if (!start || !end) return 'Pick both dates first.';
  if (!isIso(start) || !isIso(end)) return 'One of the dates does not exist on the calendar. Pick both dates again.';
  if (start > end) return 'The first date must be on or before the second.';
  const last = lastDataDay(today);
  if (end > last) return `Search Console data runs to ${longDate(last, today)}, so pick an end date on or before it.`;
  if (dayNum(end) - dayNum(start) + 1 > MAX_DAYS) return 'Pick at most 16 months (480 days) between the two dates.';
  return null;
}

// ------------------------------------------------------------------ the bar

// countries: [{code, name}] from /api/explore/options (most seen first). today: 'YYYY-MM-DD'.
export function filterBar(ctx, { route, state, countries = [], today, ranges = RANGES }) {
  const { h } = ctx;
  const countryName = (c) => countries.find((x) => x.code === c)?.name ?? c.toUpperCase();
  const go = (next) => ctx.navigate(hashWith(location.hash, route, next));

  // Range buttons. Custom opens two date fields; the view changes only when they are applied.
  // A custom range refused from the address opens the date fields with the reason.
  const customBox = h('div', { class: 'fb-custom', hidden: state.range !== 'custom' && !state.problem });
  const rangeRow = h(
    'div',
    { class: 'chips fb-ranges', role: 'group', 'aria-label': 'Date range' },
    ranges.map((r) =>
      h(
        'button',
        {
          type: 'button',
          class: 'chip chip-btn',
          'aria-pressed': String(r.value === state.range),
          'aria-expanded': r.value === 'custom' ? String(!customBox.hidden) : null,
          onclick: (e) => {
            if (r.value === 'custom') {
              customBox.hidden = !customBox.hidden;
              e.currentTarget.setAttribute('aria-expanded', String(!customBox.hidden));
              if (!customBox.hidden) customBox.querySelector('input')?.focus();
              return;
            }
            go({ ...state, range: r.value, start: '', end: '' });
          },
        },
        r.label
      )
    )
  );
  const last = lastDataDay(today);
  const from = h('input', { class: 'input', type: 'date', max: last, value: state.start, 'aria-label': 'From' });
  const to = h('input', { class: 'input', type: 'date', max: last, value: state.end || '', 'aria-label': 'To' });
  const customError = h('p', { class: 'fb-error', role: 'alert', hidden: !state.problem }, state.problem ?? '');
  customBox.append(
    h(
      'form',
      {
        class: 'fb-custom-form',
        // The page says what is wrong in its own words, not the browser's.
        novalidate: true,
        onsubmit: (e) => {
          e.preventDefault();
          const problem = checkCustom(from.value, to.value, today);
          customError.textContent = problem ?? '';
          customError.hidden = !problem;
          if (!problem) go({ ...state, range: 'custom', start: from.value, end: to.value });
        },
      },
      h('label', { class: 'fb-field' }, h('span', { class: 'small muted' }, 'From'), from),
      h('label', { class: 'fb-field' }, h('span', { class: 'small muted' }, 'To'), to),
      h('button', { type: 'submit', class: 'btn btn-small btn-primary' }, 'Show these dates')
    ),
    customError,
    h('p', { class: 'small muted' }, `Search Console data runs to ${longDate(last, today)}. At most 16 months.`)
  );

  // Text, country and device filters, applied together.
  const modeSelect = (value, label) => {
    const sel = h(
      'select',
      { class: 'select', 'aria-label': label },
      MODES.map((m) => h('option', { value: m.value }, m.label))
    );
    sel.value = value;
    return sel;
  };
  const qMode = modeSelect(state.qmode, 'How to match the search');
  const qText = h('input', {
    class: 'input',
    type: 'text',
    value: state.q,
    maxlength: 200,
    placeholder: 'words in the search',
    'aria-label': 'Search filter',
  });
  const pMode = modeSelect(state.pagemode, 'How to match the page');
  const pText = h('input', {
    class: 'input',
    type: 'text',
    value: state.pagefilter,
    maxlength: 200,
    placeholder: 'for example /blog/',
    'aria-label': 'Page filter',
  });
  const countryList = [...countries];
  if (state.country && !countryList.some((c) => c.code === state.country))
    countryList.unshift({ code: state.country, name: countryName(state.country) });
  const country = h(
    'select',
    { class: 'select', 'aria-label': 'Country' },
    h('option', { value: '' }, 'Every country'),
    countryList.map((c) => h('option', { value: c.code }, c.name))
  );
  country.value = state.country;
  const device = h(
    'select',
    { class: 'select', 'aria-label': 'Device' },
    h('option', { value: '' }, 'Every device'),
    DEVICES.map((d) => h('option', { value: d.value }, d.label))
  );
  device.value = state.device;

  const chips = chipsOf(state, { countryName, today });
  const filterCount = chips.filter((c) => c.key !== 'range').length;
  const more = h(
    'details',
    { class: 'fb-more', open: filterCount > 0 },
    h(
      'summary',
      { class: 'btn btn-small' },
      filterCount ? 'Change filters' : 'Filter by search, page, country or device'
    ),
    h(
      'form',
      {
        class: 'fb-fields',
        onsubmit: (e) => {
          e.preventDefault();
          go({
            ...state,
            q: qText.value,
            qmode: qMode.value,
            pagefilter: pText.value,
            pagemode: pMode.value,
            country: country.value,
            device: device.value,
          });
        },
      },
      h(
        'div',
        { class: 'fb-field fb-text' },
        h('span', { class: 'small muted' }, 'Search'),
        h('div', { class: 'fb-pair' }, qMode, qText)
      ),
      h(
        'div',
        { class: 'fb-field fb-text' },
        h('span', { class: 'small muted' }, 'Page'),
        h('div', { class: 'fb-pair' }, pMode, pText)
      ),
      h('label', { class: 'fb-field' }, h('span', { class: 'small muted' }, 'Country'), country),
      h('label', { class: 'fb-field' }, h('span', { class: 'small muted' }, 'Device'), device),
      h('div', { class: 'fb-apply' }, h('button', { type: 'submit', class: 'btn btn-primary' }, 'Apply'))
    )
  );

  const chipRow = chips.length
    ? h(
        'div',
        { class: 'chips fb-chips', 'aria-label': 'Filters in use' },
        chips.map((c) =>
          h(
            'span',
            { class: 'chip chip-accent fb-chip' },
            c.text,
            h(
              'button',
              {
                type: 'button',
                class: 'chip-x',
                'aria-label': `Remove the filter ${c.text}`,
                title: 'Remove this filter',
                onclick: () => go({ ...state, ...c.clear }),
              },
              '×'
            )
          )
        ),
        h(
          'button',
          {
            type: 'button',
            class: 'btn btn-quiet btn-small',
            onclick: () => go(readFilters(new URLSearchParams(''))),
          },
          'Clear all'
        )
      )
    : null;

  return h(
    'div',
    { class: 'fb', role: 'search', 'aria-label': 'Dates and filters' },
    rangeRow,
    customBox,
    more,
    chipRow
  );
}
