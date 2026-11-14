// The one CSV reader. Quotes, doubled quotes, commas and line breaks inside quotes are handled,
// a byte-order mark is dropped, and lines with nothing in any cell are left out.
// Returns [{line, cells}]: the line each record starts on (1 is the first line) and its cells as text.

export function readCsv(text) {
  const src = String(text ?? '').replace(/^\uFEFF/, '');
  const out = [];
  let cells = [];
  let field = '';
  let quoted = false;
  let line = 1;
  let start = 1;
  const endRecord = () => {
    cells.push(field);
    if (cells.some((c) => c !== '')) out.push({ line: start, cells });
    cells = [];
    field = '';
  };
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else {
        if (ch === '\n') line++;
        field += ch;
      }
    } else if (ch === '"') quoted = true;
    else if (ch === ',') {
      cells.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      endRecord();
      line++;
      start = line;
    } else field += ch;
  }
  endRecord();
  return out;
}
