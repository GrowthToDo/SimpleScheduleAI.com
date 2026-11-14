// Shared pieces for the pages that run a job or show big numbers (Did it work, AI answers, Site
// health, Competitors). Signatures are in README-views.md under "Shared page helpers". The panel
// styles (.jb-*) live in app.css.

// 0 gives 'today', 1 gives '1 day ago', 10 gives '10 days ago'.
export const daysText = (n) => (n === 0 ? 'today' : n === 1 ? '1 day ago' : `${n} days ago`);

// One big number: tile(h, 'Visits', '643', '+45% on the 28 days before', {text, dir, warn}).
//   text  true for a word value (smaller type); dir 'up' or 'down' colours the small line;
//   warn  true makes the small line amber.
export function tile(h, label, value, change, { text = false, dir = '', warn = false } = {}) {
  return h(
    'div',
    { class: 'tile' },
    h('span', { class: 'tile-label' }, label),
    h('span', { class: `tile-value${text ? ' is-text' : ''}` }, value),
    h('div', { class: `tile-change ${dir}${warn ? ' jb-warn' : ''}`.trim() }, change)
  );
}

// A confirmed job with its output. Returns {button, panel, resume}:
//   button  put it in the page head; clicking asks with ctx.confirmBox({title, body, confirmLabel}),
//           posts {confirm: true} to /api/jobs/<key>, polls /api/jobs and redraws the page when done
//   panel   the status line and output tail; hidden until the job has run or is running
//   resume  call once after the page is mounted: follows a job that was already running
// jobsData is the reply of GET /api/jobs, fetched with the page's own data.
export function jobBlock(ctx, jobsData, key, { label, primary = false, confirm }) {
  const { h, api, fmt } = ctx;
  const panel = h('div', { class: 'jb-panel', 'aria-live': 'polite', hidden: true });
  const button = h('button', { type: 'button', class: primary ? 'btn btn-primary' : 'btn', onclick: start }, label);
  let state = jobsData;

  const lengthText = (s) => (s >= 90 ? `${Math.round(s / 60)} minutes` : `${s} seconds`);

  // The raw output stays folded away under "Details from the script"; a redraw keeps it open
  // when the person opened it.
  let detailsOpen = false;
  function draw() {
    const job = state.jobs.find((j) => j.key === key);
    const busy = Boolean(state.running);
    button.disabled = busy;
    button.title = busy && !job?.running ? 'Another job is running. Wait for it to finish.' : '';
    let text = '';
    let summary = '';
    let tail = [];
    if (job?.running) {
      const p = job.progress;
      text = `Running now${p ? `: ${p.of > 1 ? `step ${p.step} of ${p.of}, ` : ''}${lengthText(p.elapsedSec)} so far` : ''}.`;
      summary = p?.summary ?? '';
      tail = p?.tail ?? [];
    } else if (job?.last) {
      const l = job.last;
      text = `${label}: ${l.ok ? 'finished' : 'did not finish'} ${fmt.ago(l.at)}, took ${lengthText(l.durationSec)}.`;
      summary = l.summary ?? (l.ok ? '' : 'It did not finish cleanly.');
      tail = l.tail ?? [];
    }
    panel.hidden = !text;
    const details = tail.length
      ? h(
          'details',
          { class: 'jb-details' },
          h('summary', {}, 'Details from the script'),
          h('pre', {}, tail.slice(-40).join('\n'))
        )
      : null;
    if (details) {
      details.open = detailsOpen;
      details.addEventListener('toggle', () => (detailsOpen = details.open));
    }
    panel.replaceChildren(
      ...[h('div', {}, text), summary ? h('div', { class: 'jb-summary' }, summary) : null, details].filter(Boolean)
    );
  }

  async function poll() {
    if (!panel.isConnected) return;
    try {
      state = await api.get('/api/jobs');
    } catch {
      setTimeout(poll, 4000);
      return;
    }
    draw();
    if (state.running) {
      setTimeout(poll, 3000);
      return;
    }
    const job = state.jobs.find((j) => j.key === key);
    ctx.toast(
      job?.last?.ok ? `${label} finished.` : `${label} did not finish. The output is on the page.`,
      job?.last?.ok ? 'success' : 'error'
    );
    await ctx.reload();
  }

  async function start() {
    const ok = await ctx.confirmBox({ title: confirm.title, body: confirm.body, confirmLabel: confirm.confirmLabel });
    if (!ok) return;
    button.disabled = true;
    try {
      await api.post(`/api/jobs/${key}`, { confirm: true });
    } catch (e) {
      ctx.toast(e.message, 'error');
      button.disabled = false;
      return;
    }
    ctx.toast(`${label} started.`, 'success');
    panel.hidden = false;
    panel.replaceChildren(h('div', {}, 'Starting now.'));
    setTimeout(poll, 1500);
  }

  draw();
  // A job that was already running when the page opened keeps being followed.
  return { button, panel, resume: () => state.running === key && setTimeout(poll, 3000) };
}
