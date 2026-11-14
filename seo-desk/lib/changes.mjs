// One reading per distinct change, shared by Did it work (its tile and its list) and the week's
// worries, so the three never disagree. Pure functions.
//
// A change is one commit: verdict rows that share a commit hash (a batch row and its page rows) are one
// change, and a row with no commit is a change of its own. A change reads as its batch verdict when the
// batch row has one and no other change overlaps it. Otherwise it is read from its page rows that no
// other change overlaps: one word when they agree (all better reads better), mixed when they do not,
// and "cannot be read" (unreadable) when none of them can be read.

export const isBatchVerdict = (v) => v?.kind === 'batch' || (Array.isArray(v?.pages) && !v?.url);

// One id per distinct change. rows: change-log-verdicts.jsonl rows. Returns an array of change ids
// (change-1, change-2, ...) in the order of `rows`.
export function changeIdsOf(rows) {
  const parent = new Map();
  const find = (x) => {
    while (parent.get(x) !== x) {
      parent.set(x, parent.get(parent.get(x)));
      x = parent.get(x);
    }
    return x;
  };
  const join = (a, b) => {
    for (const k of [a, b]) if (!parent.has(k)) parent.set(k, k);
    parent.set(find(a), find(b));
  };
  const keys = rows.map((v, i) => {
    const hashes = (v.commits ?? []).map((c) => c?.hash).filter(Boolean);
    const own = `row:${v.slug}|${v.changeDate}|${i}`;
    if (!parent.has(own)) parent.set(own, own);
    for (const h of hashes) join(own, `commit:${h}`);
    return own;
  });
  const names = new Map();
  return keys.map((k) => {
    const root = find(k);
    if (!names.has(root)) names.set(root, `change-${names.size + 1}`);
    return names.get(root);
  });
}

// rows: change-log-verdicts.jsonl rows. Returns {ids, changes}: ids as changeIdsOf, and changes, one
// per distinct change in first-seen order, as {id, word, rows, used}: `word` is the change's reading
// (a verdict word, or 'unreadable'), `rows` the indexes of all its rows, `used` the indexes of the rows
// the reading came from (empty when it cannot be read).
export function readChanges(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const ids = changeIdsOf(list);
  const byId = new Map();
  list.forEach((_, i) => {
    if (!byId.has(ids[i])) byId.set(ids[i], []);
    byId.get(ids[i]).push(i);
  });
  const changes = [...byId].map(([id, idx]) => {
    const batch = idx.find((i) => isBatchVerdict(list[i]) && !list[i].overlapping);
    const used = batch !== undefined ? [batch] : idx.filter((i) => !isBatchVerdict(list[i]) && !list[i].overlapping);
    const words = new Set(used.map((i) => list[i].verdict));
    const word = !used.length ? 'unreadable' : words.size === 1 ? [...words][0] : 'mixed';
    return { id, word, rows: idx, used };
  });
  return { ids, changes };
}
