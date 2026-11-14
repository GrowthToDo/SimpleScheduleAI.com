// A small line chart in hand-written SVG. No library.
//
//   lineChart(el, {series, markers, invert, format, label}) -> {update(options), destroy()}
//
//   series   [{date: 'YYYY-MM-DD', value: number|null}]  oldest first; null leaves a gap
//   markers  [{date, label}]  shown as dots on the bottom axis; the label shows on hover
//   invert   true for average place in search: lower is better, so it is drawn higher up
//   format   value -> text for the axis and tooltip (default: whole numbers with commas)
//   label    what the line is, for screen readers (default 'Chart')
//   mode     'area' (default: the line with a light fill under it) or 'line' (the line only)
//   controls true adds a small Line / Area switch and a "Download image" button above the chart
//   title    the chart's title, drawn into the downloaded image and used for its file name
//   rangeText the dates, drawn into the image under the title (default: first to last date)
//
// The image is the chart's own SVG drawn onto a white canvas with the title and dates above it, in
// the light theme's colours whatever theme the desk shows (it is meant for documents), saved as a PNG. Nothing goes over the network. The Line / Area choice is remembered in
// this browser.
//
// Fewer than two points shows "not enough data yet". The chart draws when the element
// has a width and redraws when it is resized, so it is safe to call on a detached element.
// Hover or tap shows the date and value; with the chart focused, Left and Right step through.

const NS = 'http://www.w3.org/2000/svg';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const HEIGHT = 240;
const PAD = { top: 14, right: 12, bottom: 30, left: 52 };

const defaultFormat = (v) => Number(v).toLocaleString('en-US', { maximumFractionDigits: 1 });

function dateText(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso));
  return m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}` : String(iso);
}

function svg(tag, attrs = {}) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

// Round numbers for the value axis.
function ticks(min, max, count = 4) {
  if (min === max) {
    const pad = Math.abs(min) * 0.1 || 1;
    min -= pad;
    max += pad;
  }
  const raw = (max - min) / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const out = [];
  for (let v = lo; v <= hi + step / 2; v += step) out.push(Number(v.toFixed(10)));
  return out;
}

const hasValue = (p) => p && p.value !== null && p.value !== undefined && Number.isFinite(Number(p.value));

const dayNum = (iso) => Date.parse(`${String(iso).slice(0, 10)}T00:00:00Z`) / 86400000;

const MODE_KEY = 'seo-desk-chart-mode';
export const IMAGE_FAILED = 'The image could not be made. Try again.';
const savedMode = () => {
  try {
    const v = localStorage.getItem(MODE_KEY);
    return v === 'line' || v === 'area' ? v : null;
  } catch {
    return null;
  }
};
const saveMode = (v) => {
  try {
    localStorage.setItem(MODE_KEY, v);
  } catch {
    // private window or blocked storage: the choice lasts for this page only
  }
};

// 'Times shown, each day' -> 'times-shown-each-day.png'
export function imageFileName(title) {
  const slug = String(title ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return `${slug || 'chart'}.png`;
}

// Styles that come from app.css; copied onto the copy of the SVG so the image looks the same.
const STYLE_PROPS = [
  'fill',
  'fill-opacity',
  'stroke',
  'stroke-width',
  'stroke-linejoin',
  'stroke-linecap',
  'opacity',
  'visibility',
  'font-size',
  'font-family',
  'font-weight',
];

// Draws `svgEl` onto a white canvas with the title and the dates above it, in the light theme's
// colours, and saves it as a PNG. Resolves true when the file was handed to the browser.
async function saveImage(svgEl, { title, rangeText, width }) {
  const copy = svgEl.cloneNode(true);
  const from = [svgEl, ...svgEl.querySelectorAll('*')];
  const to = [copy, ...copy.querySelectorAll('*')];
  // The image is for pasting into documents, so it always uses the light theme's colours on white,
  // whatever theme the desk is in. The styles are read with the light theme switched on for an
  // instant; nothing is drawn in between, so the page does not flicker.
  const root = document.documentElement;
  const was = root.dataset.theme;
  root.dataset.theme = 'light';
  let colours;
  try {
    from.forEach((node, i) => {
      const cs = getComputedStyle(node);
      for (const p of STYLE_PROPS) to[i].style.setProperty(p, cs.getPropertyValue(p));
    });
    const theme = getComputedStyle(root);
    colours = Object.fromEntries(['--paper', '--ink', '--muted'].map((n) => [n, theme.getPropertyValue(n).trim()]));
  } finally {
    if (was === undefined) delete root.dataset.theme;
    else root.dataset.theme = was;
  }
  copy.setAttribute('xmlns', NS);
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(copy))}`;
  await img.decode();

  const scale = 2;
  const pad = 24;
  const head = rangeText ? 68 : 48;
  const canvas = document.createElement('canvas');
  canvas.width = (width + pad * 2) * scale;
  canvas.height = (HEIGHT + head + pad) * scale;
  const c = canvas.getContext('2d');
  c.scale(scale, scale);
  const colour = (name) => colours[name];
  c.fillStyle = colour('--paper');
  c.fillRect(0, 0, width + pad * 2, HEIGHT + head + pad);
  const font = getComputedStyle(document.body).fontFamily || 'system-ui, sans-serif';
  c.textBaseline = 'alphabetic';
  c.fillStyle = colour('--ink');
  c.font = `650 17px ${font}`;
  c.fillText(title || 'Chart', pad, pad + 14);
  if (rangeText) {
    c.fillStyle = colour('--muted');
    c.font = `400 13px ${font}`;
    c.fillText(rangeText, pad, pad + 36);
  }
  c.drawImage(img, pad, head, width, HEIGHT);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) return false;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = imageFileName(title);
  a.hidden = true;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}

export function lineChart(el, options = {}) {
  let opts = { ...options };
  if (opts.controls && !options.mode) opts.mode = savedMode() ?? 'area';
  let width = 0;
  const root = document.createElement('div');
  root.className = 'chart';
  const plot = document.createElement('div');
  plot.className = 'chart-plot';
  let tools = null;
  let modeButtons = [];
  let saveButton = null;
  if (opts.controls) {
    tools = document.createElement('div');
    tools.className = 'chart-tools';
    const seg = document.createElement('div');
    seg.className = 'seg';
    seg.setAttribute('role', 'group');
    seg.setAttribute('aria-label', 'Chart style');
    modeButtons = [
      ['line', 'Line'],
      ['area', 'Area'],
    ].map(([value, text]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = text;
      b.dataset.mode = value;
      b.addEventListener('click', () => {
        if (opts.mode === value) return;
        saveMode(value);
        opts = { ...opts, mode: value };
        draw();
      });
      seg.append(b);
      return b;
    });
    saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.className = 'btn btn-small btn-quiet';
    saveButton.textContent = 'Download image';
    saveButton.title = 'Save this chart as a picture (PNG)';
    // One plain line when the picture could not be made (an image or canvas the browser refused).
    const saveMsg = document.createElement('span');
    saveMsg.className = 'chart-msg';
    saveMsg.setAttribute('role', 'status');
    saveButton.addEventListener('click', async () => {
      const svgEl = plot.querySelector('svg');
      if (!svgEl) return;
      saveButton.disabled = true;
      saveMsg.textContent = '';
      let ok = false;
      try {
        const pts = (opts.series ?? []).filter((p) => hasValue(p) && p.date);
        const rangeText =
          opts.rangeText ?? (pts.length > 1 ? `${dateText(pts[0].date)} to ${dateText(pts[pts.length - 1].date)}` : '');
        ok = await saveImage(svgEl, { title: opts.title ?? opts.label ?? 'Chart', rangeText, width });
      } catch {
        ok = false;
      } finally {
        saveButton.disabled = false;
      }
      if (!ok) saveMsg.textContent = IMAGE_FAILED;
    });
    tools.append(saveMsg, seg, saveButton);
    root.append(tools);
  }
  root.append(plot);
  el.replaceChildren(root);

  function draw() {
    const format = opts.format ?? defaultFormat;
    const points = (opts.series ?? []).filter((p) => hasValue(p) && p.date);
    for (const b of modeButtons) b.setAttribute('aria-pressed', String(b.dataset.mode === (opts.mode ?? 'area')));
    if (saveButton) saveButton.hidden = points.length < 2;
    plot.replaceChildren();
    if (points.length < 2) {
      const empty = document.createElement('div');
      empty.className = 'chart-empty';
      empty.textContent = 'not enough data yet';
      plot.append(empty);
      return;
    }
    if (!width) width = Math.round(plot.getBoundingClientRect().width);
    if (!width) return;

    const values = points.map((p) => Number(p.value));
    const yTicks = ticks(opts.invert ? Math.min(...values) : Math.min(0, ...values), Math.max(...values));
    const yMin = yTicks[0];
    const yMax = yTicks[yTicks.length - 1];
    const d0 = dayNum(points[0].date);
    const d1 = dayNum(points[points.length - 1].date);
    const plotW = Math.max(40, width - PAD.left - PAD.right);
    const plotH = HEIGHT - PAD.top - PAD.bottom;
    const x = (iso) => PAD.left + ((dayNum(iso) - d0) / Math.max(1, d1 - d0)) * plotW;
    const y = (v) => {
      const t = (v - yMin) / Math.max(1e-9, yMax - yMin);
      return PAD.top + (opts.invert ? t : 1 - t) * plotH;
    };

    const chart = svg('svg', {
      viewBox: `0 0 ${width} ${HEIGHT}`,
      width,
      height: HEIGHT,
      role: 'img',
      tabindex: 0,
      'aria-label': `${opts.label ?? 'Chart'} from ${dateText(points[0].date)} to ${dateText(points[points.length - 1].date)}. Use the left and right arrow keys to read each day.`,
    });

    for (const t of yTicks) {
      chart.append(svg('line', { class: 'grid', x1: PAD.left, x2: PAD.left + plotW, y1: y(t), y2: y(t) }));
      const label = svg('text', { class: 'axis-text', x: PAD.left - 8, y: y(t) + 4, 'text-anchor': 'end' });
      label.textContent = format(t);
      chart.append(label);
    }

    // Date labels: first, middle and last.
    const idx = [...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])];
    for (const i of idx) {
      const p = points[i];
      const anchor = i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle';
      const label = svg('text', { class: 'axis-text', x: x(p.date), y: HEIGHT - 8, 'text-anchor': anchor });
      label.textContent = dateText(p.date).replace(/ \d{4}$/, '');
      chart.append(label);
    }

    // Segments: a null value starts a new segment. In a daily series (points usually one day
    // apart) a jump of missing days also breaks the line. A sparse series, such as the weekly
    // AI answers check, is one line through all its points, with a dot on each.
    const steps = points.slice(1).map((p, i) => dayNum(p.date) - dayNum(points[i].date));
    const usual = steps.length ? [...steps].sort((a, b) => a - b)[Math.floor(steps.length / 2)] : 1;
    const daily = usual <= 1;
    const segments = [];
    let seg = [];
    let prevDay = null;
    for (const p of opts.series ?? []) {
      if (!hasValue(p) || !p.date) {
        if (seg.length) segments.push(seg);
        seg = [];
        prevDay = null;
        continue;
      }
      const day = dayNum(p.date);
      if (daily && prevDay !== null && day - prevDay > usual * 1.5 && seg.length) {
        segments.push(seg);
        seg = [];
      }
      seg.push(p);
      prevDay = day;
    }
    if (seg.length) segments.push(seg);

    const base = opts.invert ? PAD.top : PAD.top + plotH;
    const first = points[0];
    const last = points[points.length - 1];
    const lineOf = (s) =>
      s.map((p, i) => `${i ? 'L' : 'M'}${x(p.date).toFixed(1)},${y(Number(p.value)).toFixed(1)}`).join('');
    if (!opts.invert && opts.mode !== 'line') {
      for (const s of segments.filter((s) => s.length > 1)) {
        const x0 = x(s[0].date).toFixed(1);
        const x1 = x(s[s.length - 1].date).toFixed(1);
        chart.append(svg('path', { class: 'area', d: `M${x0},${base}${lineOf(s).replace(/^M/, 'L')}L${x1},${base}Z` }));
      }
    }
    chart.append(svg('path', { class: 'line', d: segments.map(lineOf).join('') }));
    // A point with no neighbour on either side would not show as a line, so it gets a dot. A
    // sparse series gets a dot on every point, so each check is visible.
    for (const p of daily ? segments.filter((s) => s.length === 1).map((s) => s[0]) : segments.flat()) {
      chart.append(svg('circle', { class: 'cursor-dot', cx: x(p.date), cy: y(Number(p.value)), r: 2.5 }));
    }

    // Markers on the bottom axis.
    const markers = (opts.markers ?? []).filter((m) => m.date >= first.date && m.date <= last.date);
    for (const m of markers) {
      const dot = svg('circle', { class: 'marker', cx: x(m.date), cy: PAD.top + plotH, r: 4 });
      const title = svg('title');
      title.textContent = `${dateText(m.date)}: ${m.label}`;
      dot.append(title);
      chart.append(dot);
    }

    // Hover cursor and tooltip.
    const cursor = svg('line', { class: 'cursor', y1: PAD.top, y2: PAD.top + plotH, visibility: 'hidden' });
    const cursorDot = svg('circle', { class: 'cursor-dot', r: 4.5, visibility: 'hidden' });
    chart.append(cursor, cursorDot);
    const tip = document.createElement('div');
    tip.className = 'chart-tip';
    tip.hidden = true;
    plot.append(chart, tip);

    let active = -1;
    const show = (i) => {
      active = Math.max(0, Math.min(points.length - 1, i));
      const p = points[active];
      const px = x(p.date);
      const py = y(Number(p.value));
      cursor.setAttribute('x1', px);
      cursor.setAttribute('x2', px);
      cursor.setAttribute('visibility', 'visible');
      cursorDot.setAttribute('cx', px);
      cursorDot.setAttribute('cy', py);
      cursorDot.setAttribute('visibility', 'visible');
      const near = markers.filter((m) => m.date === p.date).map((m) => m.label);
      tip.replaceChildren();
      const b = document.createElement('b');
      b.textContent = format(Number(p.value));
      tip.append(b, ` on ${dateText(p.date)}`);
      for (const label of near) {
        const line = document.createElement('div');
        line.textContent = label;
        tip.append(line);
      }
      tip.hidden = false;
      tip.style.left = `${Math.min(Math.max(px, 70), width - 70)}px`;
      tip.style.top = `${py}px`;
    };
    const hide = () => {
      cursor.setAttribute('visibility', 'hidden');
      cursorDot.setAttribute('visibility', 'hidden');
      tip.hidden = true;
    };
    const nearest = (clientX) => {
      const r = chart.getBoundingClientRect();
      const px = ((clientX - r.left) / r.width) * width;
      let best = 0;
      let dist = Infinity;
      points.forEach((p, i) => {
        const d = Math.abs(x(p.date) - px);
        if (d < dist) {
          dist = d;
          best = i;
        }
      });
      return best;
    };
    chart.addEventListener('pointermove', (e) => show(nearest(e.clientX)));
    chart.addEventListener('pointerdown', (e) => show(nearest(e.clientX)));
    chart.addEventListener('pointerleave', hide);
    chart.addEventListener('blur', hide);
    chart.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') show(active < 0 ? points.length - 1 : active + 1);
      else if (e.key === 'ArrowLeft') show(active < 0 ? points.length - 1 : active - 1);
      else if (e.key === 'Escape') hide();
      else return;
      e.preventDefault();
    });
  }

  const observer = new ResizeObserver((entries) => {
    const w = Math.round(entries[0].contentRect.width);
    if (w && w !== width) {
      width = w;
      draw();
    }
  });
  observer.observe(plot);
  draw();

  return {
    update(next) {
      opts = { ...opts, ...next };
      draw();
    },
    destroy() {
      observer.disconnect();
      root.remove();
    },
  };
}

// ------------------------------------------------------------------ two lines, two scales
//
//   twoLineChart(el, {series, markers, label}) -> {update(options), destroy()}
//
//   series   exactly two: [{key, label, points: [{date, value}], format}]. The first is read on the
//            left scale, the second on the right; each line has its own colour (CSS classes
//            .s1 and .s2, from the theme variables --series-1 and --series-2).
//   markers  [{date, kind: 'edit' | 'google-update', label}]: an edit is a dot on the bottom line,
//            a Google update is a dashed line across the chart. The label shows on hover.
//
// The legend above the chart toggles each line (one always stays on). Hover, tap, or Left and
// Right with the chart focused show the day with both numbers and any marker on it.

const H2 = 280;
const PAD2 = { top: 16, right: 56, bottom: 30, left: 52 };

export function twoLineChart(el, options = {}) {
  let opts = { ...options };
  let width = 0;
  const shown = [true, true];
  const root = document.createElement('div');
  root.className = 'chart chart-two';
  const legend = document.createElement('div');
  legend.className = 'legend';
  legend.setAttribute('role', 'group');
  legend.setAttribute('aria-label', 'Lines on the chart');
  const plot = document.createElement('div');
  plot.className = 'chart-plot';
  root.append(legend, plot);
  el.replaceChildren(root);

  const drawLegend = () => {
    legend.replaceChildren(
      ...(opts.series ?? []).map((s, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = `legend-item s${i + 1}`;
        b.setAttribute('aria-pressed', String(shown[i]));
        const sw = document.createElement('span');
        sw.className = 'legend-swatch';
        sw.setAttribute('aria-hidden', 'true');
        b.append(sw, s.label);
        b.title = shown[i] ? `Hide ${s.label.toLowerCase()}` : `Show ${s.label.toLowerCase()}`;
        b.addEventListener('click', () => {
          // One line always stays on, or the chart would be empty.
          if (shown[i] && shown.filter(Boolean).length === 1) return;
          shown[i] = !shown[i];
          drawLegend();
          draw();
        });
        return b;
      }),
      ...legendMarkers()
    );
  };

  const legendMarkers = () => {
    const kinds = new Set((opts.markers ?? []).map((m) => m.kind));
    const out = [];
    if (kinds.has('edit')) out.push(markerKey('marker-key-edit', 'Page edit'));
    if (kinds.has('google-update')) out.push(markerKey('marker-key-update', 'Google update'));
    return out;
  };
  const markerKey = (cls, text) => {
    const s = document.createElement('span');
    s.className = `legend-marker ${cls}`;
    const sw = document.createElement('span');
    sw.className = 'legend-swatch';
    sw.setAttribute('aria-hidden', 'true');
    s.append(sw, text);
    return s;
  };

  function draw() {
    plot.replaceChildren();
    const series = (opts.series ?? []).slice(0, 2).map((s) => ({
      ...s,
      pts: (s.points ?? []).filter((p) => hasValue(p) && p.date),
      fmt: s.format ?? defaultFormat,
    }));
    const dates = [...new Set(series.flatMap((s) => s.pts.map((p) => p.date)))].sort();
    if (dates.length < 2) {
      const empty = document.createElement('div');
      empty.className = 'chart-empty';
      empty.textContent = 'not enough data yet';
      plot.append(empty);
      return;
    }
    if (!width) width = Math.round(plot.getBoundingClientRect().width);
    if (!width) return;

    const d0 = dayNum(dates[0]);
    const d1 = dayNum(dates[dates.length - 1]);
    const plotW = Math.max(40, width - PAD2.left - PAD2.right);
    const plotH = H2 - PAD2.top - PAD2.bottom;
    const x = (iso) => PAD2.left + ((dayNum(iso) - d0) / Math.max(1, d1 - d0)) * plotW;
    const scales = series.map((s) => {
      const t = ticks(0, Math.max(0, ...s.pts.map((p) => Number(p.value))));
      const lo = t[0];
      const hi = t[t.length - 1];
      return { ticks: t, y: (v) => PAD2.top + (1 - (v - lo) / Math.max(1e-9, hi - lo)) * plotH };
    });

    const chart = svg('svg', {
      viewBox: `0 0 ${width} ${H2}`,
      width,
      height: H2,
      role: 'img',
      tabindex: 0,
      'aria-label': `${opts.label ?? 'Chart'} from ${dateText(dates[0])} to ${dateText(dates[dates.length - 1])}. Use the left and right arrow keys to read each day.`,
    });

    // Grid lines follow the left scale (or the right one when the left line is hidden); each
    // visible line labels its own side.
    const gridOf = shown[0] ? 0 : 1;
    for (const t of scales[gridOf].ticks) {
      const yy = scales[gridOf].y(t);
      chart.append(svg('line', { class: 'grid', x1: PAD2.left, x2: PAD2.left + plotW, y1: yy, y2: yy }));
    }
    series.forEach((s, i) => {
      if (!shown[i]) return;
      for (const t of scales[i].ticks) {
        const label = svg('text', {
          class: `axis-text axis-s${i + 1}`,
          x: i === 0 ? PAD2.left - 8 : PAD2.left + plotW + 8,
          y: scales[i].y(t) + 4,
          'text-anchor': i === 0 ? 'end' : 'start',
        });
        label.textContent = s.fmt(t);
        chart.append(label);
      }
    });
    const idx = [...new Set([0, Math.floor((dates.length - 1) / 2), dates.length - 1])];
    for (const i of idx) {
      const anchor = i === 0 ? 'start' : i === dates.length - 1 ? 'end' : 'middle';
      const label = svg('text', { class: 'axis-text', x: x(dates[i]), y: H2 - 8, 'text-anchor': anchor });
      label.textContent = dateText(dates[i]).replace(/ \d{4}$/, '');
      chart.append(label);
    }

    // Google updates: a dashed line across the chart, behind the data lines.
    const inRange = (opts.markers ?? []).filter((m) => m.date >= dates[0] && m.date <= dates[dates.length - 1]);
    for (const m of inRange.filter((m) => m.kind === 'google-update')) {
      const g = svg('g', { class: 'marker-update' });
      g.append(svg('line', { x1: x(m.date), x2: x(m.date), y1: PAD2.top, y2: PAD2.top + plotH }));
      g.append(
        svg('rect', {
          x: x(m.date) - 4,
          y: PAD2.top - 4,
          width: 8,
          height: 8,
          transform: `rotate(45 ${x(m.date)} ${PAD2.top})`,
        })
      );
      const title = svg('title');
      title.textContent = `${dateText(m.date)}: ${m.label}`;
      g.append(title);
      chart.append(g);
    }

    // The lines. A missing day breaks the line.
    series.forEach((s, i) => {
      if (!shown[i]) return;
      const byDay = new Map(s.pts.map((p) => [p.date, Number(p.value)]));
      let d = '';
      let pen = false;
      let prev = null;
      for (const date of dates) {
        const v = byDay.get(date);
        if (v === undefined || (prev !== null && dayNum(date) - prev > 1.5)) pen = false;
        if (v === undefined) continue;
        d += `${pen ? 'L' : 'M'}${x(date).toFixed(1)},${scales[i].y(v).toFixed(1)}`;
        pen = true;
        prev = dayNum(date);
      }
      chart.append(svg('path', { class: `line s${i + 1}`, d }));
    });

    // Page edits: dots on the bottom line.
    for (const m of inRange.filter((m) => m.kind !== 'google-update')) {
      const dot = svg('circle', { class: 'marker marker-edit', cx: x(m.date), cy: PAD2.top + plotH, r: 4 });
      const title = svg('title');
      title.textContent = `${dateText(m.date)}: ${m.label}`;
      dot.append(title);
      chart.append(dot);
    }

    const cursor = svg('line', { class: 'cursor', y1: PAD2.top, y2: PAD2.top + plotH, visibility: 'hidden' });
    const dots = series.map((s, i) => svg('circle', { class: `cursor-dot s${i + 1}`, r: 4, visibility: 'hidden' }));
    chart.append(cursor, ...dots);
    const tip = document.createElement('div');
    tip.className = 'chart-tip';
    tip.hidden = true;
    plot.append(chart, tip);

    let active = -1;
    const show = (i) => {
      active = Math.max(0, Math.min(dates.length - 1, i));
      const date = dates[active];
      const px = x(date);
      cursor.setAttribute('x1', px);
      cursor.setAttribute('x2', px);
      cursor.setAttribute('visibility', 'visible');
      tip.replaceChildren();
      const head = document.createElement('div');
      head.className = 'chart-tip-date';
      head.textContent = dateText(date);
      tip.append(head);
      let topY = PAD2.top + plotH;
      series.forEach((s, k) => {
        const v = s.pts.find((p) => p.date === date);
        if (!shown[k] || !v) {
          dots[k].setAttribute('visibility', 'hidden');
          return;
        }
        const py = scales[k].y(Number(v.value));
        topY = Math.min(topY, py);
        dots[k].setAttribute('cx', px);
        dots[k].setAttribute('cy', py);
        dots[k].setAttribute('visibility', 'visible');
        const line = document.createElement('div');
        const b = document.createElement('b');
        b.textContent = s.fmt(Number(v.value));
        line.append(b, ` ${s.label.toLowerCase()}`);
        tip.append(line);
      });
      for (const m of inRange.filter((m) => m.date === date)) {
        const line = document.createElement('div');
        line.className = 'chart-tip-note';
        line.textContent = m.label;
        tip.append(line);
      }
      tip.hidden = false;
      tip.style.left = `${Math.min(Math.max(px, 110), width - 110)}px`;
      tip.style.top = `${topY}px`;
      // Near the top, the box goes under the point so it is not cut off.
      tip.classList.toggle('is-below', topY < 110);
    };
    const hide = () => {
      cursor.setAttribute('visibility', 'hidden');
      for (const d of dots) d.setAttribute('visibility', 'hidden');
      tip.hidden = true;
    };
    const nearest = (clientX) => {
      const r = chart.getBoundingClientRect();
      const px = ((clientX - r.left) / r.width) * width;
      let best = 0;
      let dist = Infinity;
      dates.forEach((date, i) => {
        const d = Math.abs(x(date) - px);
        if (d < dist) {
          dist = d;
          best = i;
        }
      });
      return best;
    };
    chart.addEventListener('pointermove', (e) => show(nearest(e.clientX)));
    chart.addEventListener('pointerdown', (e) => show(nearest(e.clientX)));
    chart.addEventListener('pointerleave', hide);
    chart.addEventListener('blur', hide);
    chart.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') show(active < 0 ? dates.length - 1 : active + 1);
      else if (e.key === 'ArrowLeft') show(active < 0 ? dates.length - 1 : active - 1);
      else if (e.key === 'Escape') hide();
      else return;
      e.preventDefault();
    });
  }

  const observer = new ResizeObserver((entries) => {
    const w = Math.round(entries[0].contentRect.width);
    if (w && w !== width) {
      width = w;
      draw();
    }
  });
  observer.observe(plot);
  drawLegend();
  draw();

  return {
    update(next) {
      opts = { ...opts, ...next };
      drawLegend();
      draw();
    },
    destroy() {
      observer.disconnect();
      root.remove();
    },
  };
}
