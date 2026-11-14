// Ask: type a question about the search data and read Claude's answer, drawn from the desk's own
// data. Claude can read the desk but cannot change anything (see lib/ask.mjs).
//
//   GET /api/ask     {available, reason, suggestions, history}
//   POST /api/ask    {question} -> {id, question, answer, askedAt, through, throughText, tookMs}
//   DELETE /api/ask  clears the history
//
// The answer is untrusted text. answerBlocks() reads it into paragraphs, lists and bold runs, and
// renderAnswer() builds them with text nodes only: no HTML is ever parsed from it and no link is
// ever made from it. Both are pure enough to test under node.
//
// Asking spends a Claude run, so it happens only on the founder's own action in this tab: Enter,
// the Ask button, a suggestion, or the sidebar's ask field, which hands its question over in memory
// (handOver, takeHandedQuestion). A question in the address (#/ask?q=..., from a link anywhere) only
// fills the field; he still presses Enter. startAction decides which.

export const PLACEHOLDER = 'Ask about your search data';
export const THINKING = "Claude is reading the desk's data. Answers take a few seconds to a minute.";
export const SENT_LINE =
  "Your question and the desk's search and visitor numbers are sent to Claude to write the answer.";
export const TRUST_LINE =
  "Claude is given only the desk's numbers and is told to answer from them. Check a number on its page before you act on it.";
const QUESTION_MAX = 500;

// The question the sidebar's ask field handed over, waiting for the Ask page in this tab.
let handed = null;
export function handOver(question) {
  handed = String(question ?? '').slice(0, QUESTION_MAX);
}
export function takeHandedQuestion() {
  const q = handed;
  handed = null;
  return q;
}

// What the page does when it opens: ask a handed-over question at once, or only fill the field.
export function startAction({ handed: h = null, fromAddress = '' } = {}) {
  const given = String(h ?? '').trim();
  if (given) return { ask: given.slice(0, QUESTION_MAX), prefill: given.slice(0, QUESTION_MAX) };
  return { ask: null, prefill: String(fromAddress ?? '').slice(0, QUESTION_MAX) };
}

// ------------------------------------------------------------------ reading the answer

// "a **b** c" -> [{text: 'a '}, {text: 'b', bold: true}, {text: ' c'}]
export function inlineParts(line) {
  const parts = [];
  const re = /\*\*([^*]+?)\*\*/g;
  let at = 0;
  for (let m = re.exec(line); m; m = re.exec(line)) {
    if (m.index > at) parts.push({ text: line.slice(at, m.index) });
    parts.push({ text: m[1], bold: true });
    at = m.index + m[0].length;
  }
  if (at < line.length) parts.push({ text: line.slice(at) });
  return parts.filter((p) => p.text);
}

const BULLET = /^\s*[-*]\s+/;
const NUMBER = /^\s*\d+\.\s+/;

// Plain text -> [{type: 'p', lines: [parts]} | {type: 'ul' | 'ol', items: [parts]}]. Paragraphs
// split on blank lines; lines starting with "- " or a number and a full stop are list items.
export function answerBlocks(text) {
  const blocks = [];
  for (const chunk of String(text ?? '')
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)) {
    let current = null;
    for (const raw of chunk.split('\n')) {
      const line = raw.trimEnd();
      if (!line.trim()) continue;
      const type = BULLET.test(line) ? 'ul' : NUMBER.test(line) ? 'ol' : 'p';
      if (type === 'p') {
        if (current?.type !== 'p') blocks.push((current = { type: 'p', lines: [] }));
        current.lines.push(inlineParts(line.trim()));
      } else {
        if (current?.type !== type) blocks.push((current = { type, items: [] }));
        current.items.push(inlineParts(line.replace(type === 'ul' ? BULLET : NUMBER, '')));
      }
    }
  }
  // A numbered list that runs across blank lines ("1." ... "2.") stays one list.
  return blocks.reduce((out, b) => {
    const last = out.at(-1);
    if (last && b.type !== 'p' && last.type === b.type) last.items.push(...b.items);
    else out.push(b);
    return out;
  }, []);
}

const partsOf = (h, parts) => parts.map((p) => (p.bold ? h('strong', {}, p.text) : p.text));

// The answer as DOM, built with h (strings become text nodes).
export function renderAnswer(h, text) {
  return h(
    'div',
    { class: 'ask-answer-body' },
    answerBlocks(text).map((b) =>
      b.type === 'p'
        ? h(
            'p',
            {},
            b.lines.map((l, i) => [i ? h('br', {}) : null, ...partsOf(h, l)])
          )
        : h(
            b.type,
            {},
            b.items.map((it) => h('li', {}, partsOf(h, it)))
          )
    )
  );
}

export const footLine = (throughText) =>
  `Answered from the desk's data${throughText ? ` through ${throughText}` : ''}. Claude can read the desk but cannot change anything.`;

// ------------------------------------------------------------------ the page

export async function render(el, ctx) {
  const { h, fmt } = ctx;
  const data = await ctx.api.get('/api/ask');
  let running = false;
  let lastQuestion = '';

  const field = h('input', {
    class: 'input ask-input',
    type: 'text',
    id: 'ask-question',
    placeholder: PLACEHOLDER,
    maxlength: QUESTION_MAX,
    autocomplete: 'off',
    'aria-describedby': 'ask-hint',
    'data-search': true,
  });
  const button = h('button', { type: 'submit', class: 'btn btn-primary ask-go' }, 'Ask');
  const result = h('div', { class: 'ask-result', 'aria-live': 'polite' });

  const setRunning = (on) => {
    running = on;
    field.disabled = on;
    button.disabled = on;
    // The page's nodes leave `el` when the shell shows them, so the buttons are held directly.
    for (const b of suggestionButtons) b.disabled = on;
  };
  const suggestionButtons = [];

  const answerView = (r) =>
    h(
      'article',
      { class: 'ask-answer' },
      h('p', { class: 'ask-asked' }, r.question),
      renderAnswer(h, r.answer),
      h('p', { class: 'ask-foot' }, footLine(r.throughText ?? (r.through ? fmt.date(r.through) : null)))
    );

  async function ask(question) {
    const q = String(question ?? '').trim();
    if (running) return;
    if (q.length < 3) {
      result.replaceChildren(h('p', { class: 'ask-note' }, 'Type a question of 3 to 500 characters.'));
      field.focus();
      return;
    }
    lastQuestion = q;
    field.value = q;
    setRunning(true);
    const started = Date.now();
    const seconds = h('span', { class: 'ask-seconds num' });
    const tick = setInterval(() => {
      const s = Math.round((Date.now() - started) / 1000);
      seconds.textContent = s >= 3 ? ` ${fmt.plural(s, 'second', 'seconds')} so far.` : '';
    }, 1000);
    result.replaceChildren(
      h(
        'div',
        { class: 'ask-thinking' },
        h('p', { class: 'ask-asked' }, q),
        h('p', { class: 'ask-wait' }, h('span', { class: 'ask-pulse', 'aria-hidden': 'true' }), THINKING, seconds)
      )
    );
    try {
      const r = await ctx.api.post('/api/ask', { question: q });
      result.replaceChildren(answerView(r));
      field.value = '';
      await drawHistory();
    } catch (e) {
      result.replaceChildren(
        h(
          'div',
          { class: 'banner banner-bad ask-error' },
          h('p', {}, e.message || 'Claude could not be started.'),
          h('button', { type: 'button', class: 'btn btn-small', onclick: () => ask(lastQuestion) }, 'Try again')
        )
      );
    } finally {
      clearInterval(tick);
      setRunning(false);
      field.focus();
    }
  }

  const form = h(
    'form',
    {
      class: 'ask-form',
      onsubmit: (e) => {
        e.preventDefault();
        ask(field.value);
      },
    },
    h('label', { class: 'sr-only', for: 'ask-question' }, PLACEHOLDER),
    h('div', { class: 'ask-row' }, field, button),
    h('p', { class: 'ask-hint', id: 'ask-hint' }, `Press Enter to ask. ${TRUST_LINE}`),
    h('p', { class: 'ask-hint ask-sent' }, SENT_LINE)
  );

  const suggestions = h(
    'div',
    { class: 'ask-suggestions', role: 'group', 'aria-label': 'Questions to try' },
    (data.suggestions ?? []).map((s) => {
      const b = h('button', { type: 'button', class: 'chip chip-btn ask-suggestion', onclick: () => ask(s) }, s);
      suggestionButtons.push(b);
      return b;
    })
  );

  const historyBox = h('div', { class: 'ask-history' });
  async function drawHistory(fresh = null) {
    const d = fresh ?? (await ctx.api.get('/api/ask'));
    const list = d.history ?? [];
    if (!list.length) {
      historyBox.replaceChildren();
      return;
    }
    historyBox.replaceChildren(
      h(
        'section',
        { class: 'section' },
        h(
          'div',
          { class: 'section-head' },
          h('h2', { class: 'section-title' }, 'Earlier questions'),
          h('button', { type: 'button', class: 'btn btn-small btn-quiet', onclick: clear }, 'Clear')
        ),
        h(
          'p',
          { class: 'section-note' },
          `The last ${list.length === 1 ? 'question is' : `${list.length} questions are`} kept on this Mac, newest first.`
        ),
        h(
          'ul',
          { class: 'ask-past' },
          list.map((it) =>
            h(
              'li',
              {},
              h(
                'details',
                { class: 'ask-fold' },
                h(
                  'summary',
                  {},
                  h('span', { class: 'ask-past-q' }, it.question),
                  h('span', { class: 'ask-past-when small muted' }, fmt.ago(it.askedAt))
                ),
                h(
                  'div',
                  { class: 'ask-fold-body' },
                  renderAnswer(h, it.answer),
                  h('p', { class: 'ask-foot' }, footLine(it.throughText))
                )
              )
            )
          )
        )
      )
    );
  }

  async function clear() {
    const ok = await ctx.confirmBox({
      title: 'Clear the earlier questions?',
      body: 'This removes every saved question and answer from this Mac. It cannot be undone.',
      confirmLabel: 'Clear them',
      danger: true,
    });
    if (!ok) return;
    try {
      await ctx.api.del('/api/ask');
      historyBox.replaceChildren();
      ctx.toast('The earlier questions are cleared.', 'success');
    } catch (e) {
      ctx.toast(e.message, 'error');
    }
  }

  ctx.mount(
    el,
    h(
      'div',
      { class: 'page-head' },
      h(
        'div',
        {},
        h('h1', { class: 'page-title' }, 'Ask'),
        h(
          'p',
          { class: 'page-sub' },
          'Ask a question about your search data and read the answer here. Claude cannot change anything, and it uses the Claude sign-in on this Mac.'
        )
      )
    ),
    data.available
      ? null
      : h(
          'div',
          { class: 'banner banner-warn ask-unavailable' },
          data.reason || 'The Claude command-line tool was not found on this Mac.'
        ),
    h('div', { class: 'ask-desk' }, form, suggestions, result),
    historyBox
  );
  await drawHistory(data);

  // Only a question handed over by the sidebar field in this tab is asked at once. One in the
  // address (a link from anywhere) only fills the field; Enter or the button asks it.
  const start = startAction({ handed: takeHandedQuestion(), fromAddress: ctx.params.get('q') ?? '' });
  if (ctx.params.has('q')) ctx.setParams({ q: null });
  if (start.prefill) field.value = start.prefill;
  if (start.ask) setTimeout(() => ask(start.ask), 0);
}
