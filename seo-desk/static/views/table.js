// One sortable, searchable table for every list in the desk.
//
//   dataTable(el, options) -> {update(rows), setFilter(key)}
//
//   columns     [{key, label, format?(value, row) -> string|Node, sortable? (default true),
//                 align? 'left'|'right', wrap? true for long text, title? hover help}]
//   rows        the data, any objects
//   onRowClick  (row) => void; rows become focusable and open with Enter or Space. Up and Down
//               move between rows (showing more when the last shown row is passed).
//   onKeyNav    (row) => void, called after Up or Down moved to `row`
//   rowKey      (row) => string, to find a row again after update() (default: the row itself)
//   searchKeys  keys searched by the text box; no box when empty
//   filters     [{key, label, test(row) -> bool}] chips above the table, one at a time,
//               plus an "All" chip
//   csvHref     link for "Download CSV"
//   onCsv       () => void, a "Download CSV" button instead of the link (for lists built in the page)
//   emptyText   shown when there are no rows (default "Nothing to show yet.")
//   pageSize    rows shown before "Show more" (default 50)
//   sort        {key, dir: 'asc'|'desc'} to start with
//   label       what the table lists, for screen readers
//
// Also returned: visibleRows() (searched, filtered and sorted, all of them, not only those shown),
// step(row, delta) (moves to the row `delta` places away in that order, focuses it, marks it as
// the current row and returns it, or null at either end), markCurrent(row) and focusRow(row)
// (focus without a page jump, then scroll just enough to show it).
//
//   toCsv(header, rows) and downloadCsv(fileName, header, rows) build a CSV in the page.

import { h } from '../app.js';

// A CSV with a header row and CRLF line ends. A cell starting with = + - or @ is prefixed with a
// quote mark so a spreadsheet keeps it as text.
export function toCsv(header, rows) {
  const cell = (v) => {
    if (v === null || v === undefined) return '';
    let t = String(v);
    if (/^[=+\-@]/.test(t) && typeof v !== 'number') t = `'${t}`;
    return /[",\r\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
  };
  return [header, ...rows].map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n';
}

// Saves a CSV built in the page as a file. Nothing goes over the network.
export function downloadCsv(fileName, header, rows) {
  const url = URL.createObjectURL(new Blob([toCsv(header, rows)], { type: 'text/csv;charset=utf-8' }));
  const a = h('a', { href: url, download: fileName, hidden: true });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const cmp = (a, b) => {
  const an = a === null || a === undefined || a === '';
  const bn = b === null || b === undefined || b === '';
  if (an || bn) return an === bn ? 0 : an ? 1 : -1; // empty values always last
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), 'en', { numeric: true, sensitivity: 'base' });
};

export function dataTable(el, options = {}) {
  const {
    columns = [],
    onRowClick = null,
    onKeyNav = null,
    rowKey = (r) => r,
    onCsv = null,
    searchKeys = [],
    filters = [],
    csvHref = null,
    emptyText = 'Nothing to show yet.',
    pageSize = 50,
    label = 'Table',
  } = options;
  const state = {
    rows: options.rows ?? [],
    q: '',
    filter: null,
    sort: options.sort ?? null,
    shown: pageSize,
    current: null,
  };
  let trOf = new Map();

  const search = searchKeys.length
    ? h('input', {
        class: 'input',
        type: 'search',
        placeholder: 'Search',
        'aria-label': `Search ${label}`,
        'data-search': true,
        title: 'Press / anywhere on the page to jump here',
      })
    : null;
  const chipBox = filters.length ? h('div', { class: 'chips', role: 'group', 'aria-label': 'Filter' }) : null;
  const tableBox = h('div', {});
  const foot = h('div', { class: 'table-foot' });

  const visible = () => {
    const needle = state.q.trim().toLowerCase();
    const f = filters.find((x) => x.key === state.filter);
    let rows = state.rows.filter(
      (r) =>
        (!f || f.test(r)) &&
        (!needle ||
          searchKeys.some((k) =>
            String(r[k] ?? '')
              .toLowerCase()
              .includes(needle)
          ))
    );
    if (state.sort) {
      const { key, dir } = state.sort;
      rows = [...rows].sort((a, b) => {
        const an = a[key] === null || a[key] === undefined || a[key] === '';
        const bn = b[key] === null || b[key] === undefined || b[key] === '';
        if (an || bn) return cmp(a[key], b[key]);
        return dir === 'asc' ? cmp(a[key], b[key]) : cmp(b[key], a[key]);
      });
    }
    return rows;
  };

  const drawChips = () => {
    if (!chipBox) return;
    const all = [{ key: null, label: 'All', test: () => true }, ...filters];
    chipBox.replaceChildren(
      ...all.map((f) =>
        h(
          'button',
          {
            type: 'button',
            class: 'chip chip-btn',
            'aria-pressed': String(state.filter === f.key),
            onclick: () => {
              state.filter = f.key;
              state.shown = pageSize;
              draw();
            },
          },
          `${f.label} `,
          h('span', { class: 'count' }, state.rows.filter(f.test).length.toLocaleString('en-US'))
        )
      )
    );
  };

  const cell = (col, row) => {
    const v = row[col.key];
    const out = col.format ? col.format(v, row) : v === null || v === undefined ? '' : String(v);
    const td = h('td', {
      class: [col.align === 'right' ? 'num' : '', col.wrap ? 'cell-wrap' : ''].join(' ').trim() || null,
    });
    td.append(out instanceof Node ? out : document.createTextNode(String(out ?? '')));
    return td;
  };

  const draw = () => {
    drawChips();
    trOf = new Map();
    const rows = visible();
    if (!state.rows.length || !rows.length) {
      tableBox.replaceChildren(
        h('p', { class: 'empty' }, state.rows.length ? 'Nothing matches. Clear the search or pick All.' : emptyText)
      );
    } else {
      const head = h(
        'tr',
        {},
        columns.map((col) => {
          const sorted = state.sort?.key === col.key;
          const th = h('th', {
            scope: 'col',
            class: col.align === 'right' ? 'num' : null,
            title: col.title ?? null,
            'aria-sort': sorted ? (state.sort.dir === 'asc' ? 'ascending' : 'descending') : null,
          });
          if (col.sortable === false) th.append(col.label);
          else {
            th.append(
              h(
                'button',
                {
                  type: 'button',
                  onclick: () => {
                    // Numbers start biggest first, words start A to Z.
                    const firstDir =
                      typeof state.rows.find((r) => r[col.key] != null)?.[col.key] === 'number' ? 'desc' : 'asc';
                    state.sort = sorted
                      ? { key: col.key, dir: state.sort.dir === 'asc' ? 'desc' : 'asc' }
                      : { key: col.key, dir: firstDir };
                    draw();
                  },
                },
                col.label
              )
            );
          }
          return th;
        })
      );
      const body = h(
        'tbody',
        {},
        rows.slice(0, state.shown).map((row) => {
          const tr = h(
            'tr',
            {},
            columns.map((col) => cell(col, row))
          );
          if (onRowClick) {
            tr.className = 'is-clickable';
            tr.tabIndex = 0;
            tr.addEventListener('click', (e) => {
              if (!e.target.closest('a, button, input, select, textarea, label, summary')) onRowClick(row);
            });
            tr.addEventListener('keydown', (e) => {
              if (e.target !== tr) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onRowClick(row);
              } else if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !e.altKey && !e.metaKey) {
                e.preventDefault();
                const next = step(row, e.key === 'ArrowDown' ? 1 : -1);
                if (next && onKeyNav) onKeyNav(next);
              }
            });
          }
          if (state.current !== null && rowKey(row) === state.current) tr.setAttribute('aria-current', 'true');
          trOf.set(rowKey(row), tr);
          return tr;
        })
      );
      tableBox.replaceChildren(
        h(
          'div',
          { class: 'table-wrap' },
          h('table', { class: 'table', 'aria-label': label }, h('thead', {}, head), body)
        )
      );
    }
    const more = rows.length - Math.min(rows.length, state.shown);
    foot.replaceChildren(
      h(
        'span',
        {},
        rows.length
          ? `Showing ${Math.min(rows.length, state.shown).toLocaleString('en-US')} of ${rows.length.toLocaleString('en-US')}.`
          : ''
      ),
      h(
        'span',
        { class: 'row' },
        more > 0
          ? h(
              'button',
              {
                type: 'button',
                class: 'btn btn-small',
                onclick: () => {
                  state.shown += pageSize;
                  draw();
                },
              },
              `Show ${Math.min(pageSize, more)} more`
            )
          : null,
        onCsv
          ? h('button', { type: 'button', class: 'btn btn-small', onclick: () => onCsv() }, 'Download CSV')
          : csvHref
            ? h('a', { class: 'btn btn-small', href: csvHref, download: '' }, 'Download CSV')
            : null
      )
    );
  };

  const markCurrent = (row) => {
    for (const tr of tableBox.querySelectorAll('tr[aria-current]')) tr.removeAttribute('aria-current');
    state.current = row ? rowKey(row) : null;
    if (row) trOf.get(rowKey(row))?.setAttribute('aria-current', 'true');
  };

  function step(row, delta) {
    const rows = visible();
    const key = rowKey(row);
    const i = rows.findIndex((r) => rowKey(r) === key);
    const next = i < 0 ? null : rows[i + delta];
    if (!next) return null;
    if (i + delta >= state.shown) {
      state.shown = i + delta + 1;
      draw();
    }
    markCurrent(next);
    focusRow(next);
    return next;
  }

  // Focuses a shown row without jumping the page, then scrolls just enough to show it.
  function focusRow(row) {
    const tr = trOf.get(rowKey(row));
    if (!tr) return;
    tr.focus({ preventScroll: true });
    tr.scrollIntoView({ block: 'nearest' });
  }

  search?.addEventListener('input', () => {
    state.q = search.value;
    state.shown = pageSize;
    draw();
  });

  const top =
    search || chipBox
      ? h('div', { class: 'toolbar' }, search ? h('div', { class: 'grow' }, search) : null, chipBox)
      : null;
  el.replaceChildren(...[top, tableBox, foot].filter(Boolean));
  draw();

  return {
    update(rows) {
      state.rows = rows ?? [];
      draw();
    },
    setFilter(key) {
      state.filter = key;
      draw();
    },
    visibleRows: visible,
    step,
    markCurrent,
    focusRow,
  };
}
