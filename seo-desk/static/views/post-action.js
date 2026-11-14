// What happens after an action is sent: the one-edit-a-week checks on Done. No DOM and no import of
// app.js, so node tests run it with a fake api and a fake confirm box.
//
//   postAction({api, confirmBox}, path, body)   sends one action. When Done is refused under the
//       one edit a week rule (a 409 that carries `frozen`, `frozenPages` or `secondThisWeek`), it asks
//       once per reason, plainly, then sends the same body again with override. Any other refusal
//       (a 409 such as "this item is finished, press Reopen first", or any other error) is thrown as
//       it is, so the page shows the server's sentence as a plain message. Resolves the reply, or
//       null when the founder backed out.
//   frozenBox(pages)                             the confirm for one or more frozen pages
//   secondEditText(w, ask)                       the words when this week's page edit is made
//   confirmSecondEdit(confirmBox, w, opts)       asks that question once
//
// Every page path and date comes from the server's reply and goes in as text.

export const secondEditText = (w, ask = 'Mark this one done anyway?') =>
  `You already made this week's page edit on ${w.dateText}. The rule is one a week. ${ask}`;

export function confirmSecondEdit(
  confirmBox,
  w,
  { ask = 'Mark this one done anyway?', confirmLabel = 'Mark it done anyway' } = {}
) {
  return confirmBox({
    title: "This week's page edit is already made",
    body: `${secondEditText(w, ask)}\n\n${w.page ? `That edit was on ${w.page}. ` : ''}Two edits in one week make both verdicts harder to read.`,
    confirmLabel,
    danger: true,
  });
}

// pages: [{page, sinceText, untilText}], one or more.
export function frozenBox(pages) {
  const one = pages.length === 1;
  return {
    title: one ? 'This page is still frozen' : 'These pages are still frozen',
    body:
      `${pages.map((f) => `${f.page} was edited on ${f.sinceText} and is frozen until ${f.untilText}.`).join('\n')}\n\n` +
      `Marking this done restarts the 28 days from today, and the verdict on the earlier ${one ? 'edit' : 'edits'} will be muddied by this one.`,
    confirmLabel: 'Mark it done anyway',
    danger: true,
  };
}

// The one-edit-a-week fields of a refusal, or null when it carries none.
export function editRefusal(err) {
  if (err?.status !== 409) return null;
  const d = err.data ?? {};
  const frozen = Array.isArray(d.frozenPages) && d.frozenPages.length ? d.frozenPages : d.frozen ? [d.frozen] : [];
  const second = d.secondThisWeek ?? null;
  return frozen.length || second ? { frozen, second } : null;
}

export async function postAction({ api, confirmBox }, path, body) {
  try {
    return await api.post(path, body);
  } catch (err) {
    const why = body?.action === 'done' ? editRefusal(err) : null;
    if (!why) throw err;
    if (why.frozen.length && !(await confirmBox(frozenBox(why.frozen)))) return null;
    if (why.second && !(await confirmSecondEdit(confirmBox, why.second))) return null;
    return api.post(path, { ...body, override: true });
  }
}
