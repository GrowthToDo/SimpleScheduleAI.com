// Settings: how the desk ranks work, which pages are money pages, the few numbers you can
// change, how each source is doing, and one button to download everything.

import { SOURCE_NAMES } from '../app.js';
import { toggle } from './audit.js';

const CSS = `
.st-presets { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; }
.st-preset { display: flex; flex-direction: column; justify-content: flex-start; text-align: left; font: inherit; color: inherit; background: var(--bg); border: 1px solid var(--line-strong); border-radius: var(--radius); padding: 16px 18px; cursor: pointer; }
.st-preset:hover { background: var(--wash); }
.st-preset[aria-pressed='true'] { border-color: var(--accent); background: var(--accent-wash); box-shadow: inset 0 0 0 1px var(--accent); }
.st-preset b { display: block; font-size: 17px; margin-bottom: 4px; }
.st-preset span { font-size: 14px; color: var(--muted); }
.st-slider { padding: 14px 0; border-top: 1px solid var(--line); }
.st-slider:last-child { border-bottom: 1px solid var(--line); }
.st-slider-top { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; }
.st-slider-top b { font-size: 15px; }
.st-slider-top output { font-variant-numeric: tabular-nums; font-weight: 600; }
.st-slider input[type='range'] { width: 100%; margin: 8px 0 2px; accent-color: var(--accent); }
.st-pages { list-style: none; margin: 0 0 12px; padding: 0; }
.st-pages li { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 8px 0; border-top: 1px solid var(--line); overflow-wrap: anywhere; }
.st-pages li:last-child { border-bottom: 1px solid var(--line); }
.st-add { display: flex; flex-wrap: wrap; gap: 8px; }
.st-add .input { flex: 1 1 220px; width: auto; }
.st-thr { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px 16px; align-items: center; padding: 12px 0; border-top: 1px solid var(--line); }
.st-thr:last-child { border-bottom: 1px solid var(--line); }
.st-thr .input { width: 110px; text-align: right; font-variant-numeric: tabular-nums; }
.st-thr small { display: block; color: var(--muted); }
.st-fixed { margin-top: 18px; }
.st-fixed summary { cursor: pointer; font-weight: 600; }
.st-fixed .st-thr .st-val { font-variant-numeric: tabular-nums; font-weight: 600; display: flex; gap: 10px; align-items: center; }
.st-src { padding: 12px 0; border-top: 1px solid var(--line); }
.st-src:last-child { border-bottom: 1px solid var(--line); }
.st-src-top { display: flex; flex-wrap: wrap; gap: 6px 12px; align-items: center; }
.st-brands { display: flex; flex-wrap: wrap; gap: 6px; }
`;

const PRESET_SENTENCE = {
  balanced: 'Gives search demand, room to improve and page importance a fairly even say. A good place to start.',
  'money-pages-first':
    'Pushes the pages that matter most to the business to the top, even when other pages are seen more.',
  'findability-first': 'Favours what people already search for and pages close to ranking, so more people can find us.',
  'ai-citations-first': 'Favours the work that helps AI assistants name and cite us.',
  'interest-signals-first':
    'Favours pages whose visitors go on to use a form, the calculator or the template. That is still interest, not sales.',
};

const COUNT_WORDS = ['none', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const MAX_STRATEGIC = 200;

const STATUS_WORDS = {
  fresh: 'Up to date',
  stale: 'Out of date, a refresh is due',
  failed: 'The last pull failed',
  'needs-sign-in': 'Needs you to sign in again',
  never: 'Not pulled yet',
};
const STATUS_CLASS = {
  fresh: 'chip-accent',
  stale: 'chip-warn',
  failed: 'chip-bad',
  'needs-sign-in': 'chip-bad',
  never: '',
};

// "https://x.com/pricing?a=1" or "pricing" becomes "/pricing". Returns null for nothing usable.
function toPath(text) {
  let raw = String(text ?? '').trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) {
    try {
      raw = new URL(raw).pathname;
    } catch {
      return null;
    }
  }
  raw = raw.split(/[?#]/)[0];
  if (!raw.startsWith('/')) raw = `/${raw}`;
  return raw.length > 1 ? raw.replace(/\/+$/, '') : raw;
}

// After a slider saves, the page draws again; this puts the keyboard back on that slider.
let refocus = null;
const timers = new Map();

export async function render(el, ctx) {
  const { api, h } = ctx;
  const data = await api.get('/api/settings');
  ctx.envelope(data);

  const presetLabel = data.presets.find((p) => p.key === data.preset)?.label;
  const save = async (body, message) => {
    try {
      await api.post('/api/settings', body);
      ctx.toast(message, 'success');
    } catch (e) {
      ctx.toast(e.message, 'error');
    }
    await ctx.reload();
  };

  ctx.mount(
    el,
    h('style', {}, CSS),
    h(
      'div',
      { class: 'page-head' },
      h(
        'div',
        {},
        h('h1', { class: 'page-title' }, 'Settings'),
        h(
          'p',
          { class: 'page-sub' },
          presetLabel
            ? `The desk ranks work with the ${presetLabel} setting.`
            : 'The desk ranks work with your own mix of the sliders below.',
          ` ${data.schedule.text}`
        ),
        h('p', { class: 'page-sub', style: { marginTop: '2px' } }, data.paidCalls)
      )
    ),
    data.paused || data.sources?.some((s) => s.paused)
      ? h(
          'p',
          { class: 'banner banner-warn' },
          h('strong', {}, 'The morning refresh is paused. '),
          'Nothing refreshes on its own until you switch it back on below. Refresh now at the top of the page still works.'
        )
      : null,
    data.empty
      ? h(
          'p',
          { class: 'banner banner-warn' },
          'No data has been pulled yet. Press Refresh now at the top of the page.'
        )
      : null,
    planSizeSection(data, ctx, save),
    presetsSection(data, ctx, save),
    slidersSection(data, ctx, save),
    moneySection(data, ctx, save),
    strategicSection(data, ctx, save),
    switchesSection(data, ctx),
    thresholdSection(data, ctx, save),
    sourcesSection(data, ctx),
    brandSection(data, ctx),
    h(
      'section',
      { class: 'section' },
      h('div', { class: 'section-head' }, h('h2', { class: 'section-title' }, 'Download everything')),
      h('p', {}, `${data.backup.what} It is one file you can keep as a backup.`),
      h(
        'p',
        { style: { marginTop: '12px' } },
        h('a', { class: 'btn btn-primary', href: data.backup.url, download: '' }, 'Download everything')
      )
    )
  );

  if (refocus) {
    // The shell puts the page on screen after render resolves.
    const key = refocus;
    refocus = null;
    setTimeout(() => document.querySelector(`.st-slider input[data-key="${key}"]`)?.focus({ preventScroll: true }), 0);
  }
}

// ------------------------------------------------------------------ how many priorities

function planSizeSection(data, ctx, save) {
  const { h } = ctx;
  const OPTIONS = [
    { size: 3, sentence: 'A lighter week: the top three. Still never two page edits.' },
    { size: 5, sentence: 'The full five: a new post, a page edit, a verdict, a worry and the next best.' },
  ];
  return h(
    'section',
    { class: 'section', style: { marginTop: '8px' } },
    h(
      'div',
      { class: 'section-head' },
      h('h2', { class: 'section-title' }, 'How many priorities each week: 3 or 5'),
      h('span', { class: 'section-note' }, 'A plan you already chose or locked keeps its size.')
    ),
    h(
      'div',
      { class: 'st-presets', role: 'group', 'aria-label': 'Priorities each week' },
      OPTIONS.map((o) =>
        h(
          'button',
          {
            type: 'button',
            class: 'st-preset',
            'aria-pressed': String(o.size === data.planSize),
            onclick: () =>
              o.size !== data.planSize &&
              save({ planSize: o.size }, `This week's plan now proposes ${o.size} priorities.`),
          },
          h('b', {}, `${o.size} priorities`),
          h('span', {}, o.sentence)
        )
      )
    )
  );
}

// ------------------------------------------------------------------ presets

function presetsSection(data, ctx, save) {
  const { h } = ctx;
  const topSignals = (w) =>
    Object.entries(w)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([k]) => data.signals.find((s) => s.key === k)?.label?.toLowerCase() ?? k);
  return h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'section-head' },
      h('h2', { class: 'section-title' }, 'What should the desk put first?'),
      h(
        'span',
        { class: 'section-note' },
        data.preset === 'custom'
          ? 'You have your own mix. Pick one to go back to a ready-made setting.'
          : 'Pick one. The lists re-rank at once.'
      )
    ),
    h(
      'div',
      { class: 'st-presets', role: 'group', 'aria-label': 'Ranking setting' },
      data.presets.map((p) =>
        h(
          'button',
          {
            type: 'button',
            class: 'st-preset',
            'aria-pressed': String(p.key === data.preset),
            onclick: () => p.key !== data.preset && save({ preset: p.key }, `Ranking set to ${p.label}.`),
          },
          h('b', {}, p.label),
          h('span', {}, PRESET_SENTENCE[p.key] ?? `Favours ${topSignals(p.weights).join(' and ')}.`)
        )
      )
    )
  );
}

// ------------------------------------------------------------------ sliders

function slidersSection(data, ctx, save) {
  const { h } = ctx;
  return h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'section-head' },
      h('h2', { class: 'section-title' }, 'Fine tune it'),
      h(
        'span',
        { class: 'section-note' },
        `Let go of a slider to save it. The desk shares out 100% across all ${COUNT_WORDS[data.signals.length] ?? data.signals.length}, so the others move a little.`
      )
    ),
    data.signals.map((s) => {
      const value = Math.round((data.weights[s.key] ?? 0) * 100);
      const out = h('output', {}, `${value}%`);
      const input = h('input', {
        type: 'range',
        min: '0',
        max: '100',
        step: '1',
        'aria-label': `${s.label}, share of the ranking`,
        oninput: () => (out.textContent = `${input.value}%`),
        // Saves a moment after the last move, so arrow keys can step through several values.
        onchange: () => {
          clearTimeout(timers.get(s.key));
          timers.set(
            s.key,
            setTimeout(() => {
              refocus = s.key;
              save({ weights: { [s.key]: Number(input.value) / 100 } }, `${s.label} saved.`);
            }, 700)
          );
        },
      });
      input.dataset.key = s.key;
      input.value = String(value);
      return h(
        'div',
        { class: 'st-slider' },
        h('div', { class: 'st-slider-top' }, h('b', {}, s.label), out),
        h('div', { class: 'small muted' }, s.meaning.charAt(0).toUpperCase() + s.meaning.slice(1)),
        input
      );
    })
  );
}

// ------------------------------------------------------------------ money pages

function moneySection(data, ctx, save) {
  const { h } = ctx;
  const pages = data.moneyPages;
  const field = h('input', {
    class: 'input',
    type: 'text',
    placeholder: 'For example /pricing',
    'aria-label': 'Page address to add',
    onkeydown: (e) => e.key === 'Enter' && add(),
  });
  const add = () => {
    const path = toPath(field.value);
    if (!path) {
      ctx.toast('Type the page address, such as /pricing.', 'error');
      return;
    }
    if (pages.includes(path)) {
      ctx.toast(`${path} is already a money page.`);
      return;
    }
    return save({ moneyPages: [...pages, path] }, `${path} is now a money page.`);
  };
  return h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'section-head' },
      h('h2', { class: 'section-title' }, 'Money pages'),
      h(
        'span',
        { class: 'section-note' },
        'The pages that matter most to the business. Money pages first uses this list.'
      )
    ),
    pages.length
      ? h(
          'ul',
          { class: 'st-pages' },
          pages.map((p) =>
            h(
              'li',
              {},
              h('span', {}, p),
              h(
                'button',
                {
                  type: 'button',
                  class: 'btn btn-small btn-quiet',
                  'aria-label': `Remove ${p} from the money pages`,
                  onclick: () => save({ moneyPages: pages.filter((x) => x !== p) }, `${p} is no longer a money page.`),
                },
                'Remove'
              )
            )
          )
        )
      : h('p', { class: 'empty', style: { marginBottom: '12px' } }, 'No money pages. Add the pages that matter most.'),
    h('div', { class: 'st-add' }, field, h('button', { type: 'button', class: 'btn', onclick: add }, 'Add page'))
  );
}

// ------------------------------------------------------------------ strategic keywords

function strategicSection(data, ctx, save) {
  const { h } = ctx;
  const words = data.strategicKeywords ?? [];
  const field = h('input', {
    class: 'input',
    type: 'text',
    maxLength: 120,
    placeholder: 'For example: nurse scheduling for small hospitals',
    'aria-label': 'Search phrase to add',
    onkeydown: (e) => e.key === 'Enter' && add(),
  });
  const add = () => {
    const word = field.value.trim().replace(/\s+/g, ' ');
    if (!word) {
      ctx.toast('Type a search phrase first.', 'error');
      return;
    }
    if (words.some((w) => w.toLowerCase() === word.toLowerCase())) {
      ctx.toast(`"${word}" is already on the list.`);
      return;
    }
    if (words.length >= MAX_STRATEGIC) {
      ctx.toast(`The list holds at most ${MAX_STRATEGIC}. Remove one first.`, 'error');
      return;
    }
    return save({ strategicKeywords: [...words, word] }, `"${word}" added.`);
  };
  return h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'section-head' },
      h('h2', { class: 'section-title' }, 'Strategic keywords'),
      h('span', { class: 'section-note' }, `${words.length} of ${MAX_STRATEGIC}`)
    ),
    h(
      'p',
      { class: 'muted', style: { margin: '0 0 12px', maxWidth: '70ch' } },
      'Searches that matter to the business whatever their numbers say. Any opportunity about one of these searches, or about a page that targets one, counts as fully important in the ranking.'
    ),
    words.length
      ? h(
          'ul',
          { class: 'p2-keywords', 'aria-label': 'Strategic keywords' },
          words.map((w) =>
            h(
              'li',
              {},
              h('span', {}, w),
              h(
                'button',
                {
                  type: 'button',
                  class: 'icon-btn',
                  'aria-label': `Remove ${w}`,
                  title: 'Remove',
                  onclick: () => save({ strategicKeywords: words.filter((x) => x !== w) }, `"${w}" removed.`),
                },
                '\u00d7'
              )
            )
          )
        )
      : h(
          'p',
          { class: 'empty', style: { marginBottom: '12px' } },
          'No strategic keywords yet. Add the searches you most want to win.'
        ),
    h('div', { class: 'st-add' }, field, h('button', { type: 'button', class: 'btn', onclick: add }, 'Add keyword'))
  );
}

// ------------------------------------------------------------------ switches

function switchesSection(data, ctx) {
  const { h, api, toast } = ctx;
  // Each switch saves at once. Pause redraws the page, so the banner at the top follows it.
  const row = (key, title, text, messages, redraw = false) =>
    h(
      'div',
      { class: 'p2-switch-row' },
      h('div', {}, h('strong', {}, title), h('p', {}, text)),
      toggle(ctx, {
        states: ['On', 'Off'],
        name: title,
        on: data[key],
        save: async (next) => {
          try {
            await api.post('/api/settings', { [key]: next });
            toast(next ? messages[0] : messages[1], 'success');
          } catch (e) {
            toast(e.message, 'error');
            return false;
          }
          if (redraw) await ctx.reload();
          return true;
        },
      })
    );
  return h(
    'section',
    { class: 'section' },
    h('div', { class: 'section-head' }, h('h2', { class: 'section-title' }, 'Switches')),
    h(
      'div',
      { class: 'p2-switches' },
      row(
        'paused',
        'Pause monitoring',
        'Stops the morning refresh and the refresh when you open a stale desk. Nothing is pulled on its own while it is on. Refresh now at the top still works. Use it when you are away or a source keeps failing.',
        ['Monitoring paused. Refresh now still works.', 'Monitoring is back on. The morning refresh runs again.'],
        true
      ),
      row(
        'showGoogleUpdates',
        'Show Google updates',
        'Marks Google’s ranking updates on the charts and in the timeline of the Did it work page. Verdicts still say when an update fell inside their dates, whether this is on or off.',
        ['Google updates are shown on the charts.', 'Google updates are hidden from the charts.']
      ),
      row(
        'weeklyAudit',
        'Weekly technical audit',
        'Runs the technical audit on its own every Monday, after the morning refresh. It reads your own live pages, costs nothing and writes no file in the repo. While monitoring is paused it does not run.',
        ['The audit will run every Monday.', 'The weekly audit is off.']
      )
    )
  );
}

// ------------------------------------------------------------------ thresholds

function thresholdSection(data, ctx, save) {
  const { h, fmt } = ctx;
  const mine = data.thresholds.filter((t) => t.adjustable);
  const fixed = data.thresholds.filter((t) => !t.adjustable);
  return h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'section-head' },
      h('h2', { class: 'section-title' }, 'Numbers the desk uses'),
      h(
        'span',
        { class: 'section-note' },
        `${mine.length} can be changed. The other ${fixed.length} are shared with the monthly check script, so they are fixed here.`
      )
    ),
    mine.map((t) => {
      const input = h('input', {
        class: 'input',
        type: 'number',
        min: '0',
        step: 'any',
        'aria-label': t.label,
        onchange: () => {
          const v = Number(input.value);
          if (input.value.trim() === '' || !Number.isFinite(v) || v < 0) {
            ctx.toast('Type a number, zero or more.', 'error');
            input.value = String(t.value);
            return;
          }
          return save({ thresholds: { [t.key]: v } }, `Saved: ${t.label} is now ${v}.`);
        },
      });
      input.value = String(t.value);
      return h(
        'div',
        { class: 'st-thr' },
        h(
          'div',
          {},
          t.label,
          h(
            'small',
            {},
            t.overridden
              ? `Changed from ${fmt.num(t.default, { digits: 2 })}.`
              : `Standard value ${fmt.num(t.default, { digits: 2 })}.`
          )
        ),
        h(
          'div',
          { class: 'row' },
          input,
          t.overridden
            ? h(
                'button',
                {
                  type: 'button',
                  class: 'btn btn-small btn-quiet',
                  onclick: () => save({ thresholds: { [t.key]: null } }, `${t.label} is back to ${t.default}.`),
                },
                'Reset'
              )
            : null
        )
      );
    }),
    h(
      'details',
      { class: 'st-fixed' },
      h('summary', {}, `Fixed numbers (${fixed.length}), shown for reference`),
      fixed.map((t) =>
        h(
          'div',
          { class: 'st-thr' },
          h('div', {}, t.label),
          h('div', { class: 'st-val' }, fmt.num(t.value, { digits: 2 }), h('span', { class: 'chip' }, 'fixed'))
        )
      )
    )
  );
}

// ------------------------------------------------------------------ source status

function sourcesSection(data, ctx) {
  const { h, fmt } = ctx;
  return h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'section-head' },
      h('h2', { class: 'section-title' }, 'Where the data comes from'),
      h(
        'span',
        { class: 'section-note' },
        'The last error is shown in the desk’s own words, so you can tell what to do.'
      )
    ),
    data.sources.map((s) =>
      h(
        'div',
        { class: 'st-src' },
        h(
          'div',
          { class: 'st-src-top' },
          h('strong', {}, SOURCE_NAMES[s.source] ?? s.source),
          h('span', { class: `chip ${STATUS_CLASS[s.status] ?? ''}`.trim() }, STATUS_WORDS[s.status] ?? s.status),
          h(
            'span',
            { class: 'muted small' },
            s.pulledAt ? `Last pulled ${fmt.ago(s.pulledAt)}` : 'Never pulled',
            s.through ? `. Data through ${fmt.date(s.through)}.` : '.'
          )
        ),
        h(
          'div',
          { class: 'small', style: { marginTop: '4px', overflowWrap: 'anywhere' } },
          s.error
            ? `Last error${s.failedAt ? ` (${fmt.ago(s.failedAt)})` : ''}: ${s.error}${s.retryAt ? ` Trying again at ${fmt.clock(s.retryAt)}.` : ''}`
            : s.status === 'never'
              ? 'Nothing has been pulled yet, so there is no error either.'
              : 'No errors.'
        )
      )
    )
  );
}

// ------------------------------------------------------------------ brand terms

function brandSection(data, ctx) {
  const { h } = ctx;
  return h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'section-head' },
      h('h2', { class: 'section-title' }, 'Brand names'),
      h(
        'span',
        { class: 'section-note' },
        `Searches that include one of these are counted as people looking for a company by name. To change the list, edit ${data.brandFile}.`
      )
    ),
    h(
      'div',
      { class: 'st-brands' },
      data.brands.map((b) => h('span', { class: 'chip' }, b))
    )
  );
}
