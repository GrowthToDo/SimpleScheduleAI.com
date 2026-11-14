// Plain spoken text helpers shared by the desk modules. Pure functions.

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

// '2026-12-07' -> '7 December'.
export function longDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso ?? ''));
  if (!m) return String(iso ?? '');
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]}`;
}

// '12 October to 8 November' (or one date when the ends match).
export function longRange(start, end) {
  return start === end ? longDate(start) : `${longDate(start)} to ${longDate(end)}`;
}

// The same, with the year on each end when the two ends fall in different years ('3 July 2025 to
// 7 November 2026'), for a range that can run past a year.
export function spanText(start, end) {
  const y = (iso) => String(iso ?? '').slice(0, 4);
  if (!start || !end || y(start) === y(end)) return longRange(start, end);
  return `${longDate(start)} ${y(start)} to ${longDate(end)} ${y(end)}`;
}

// The desk never shows an em or en dash, even when the source text has one.
export function plain(text) {
  return String(text ?? '')
    .replace(/\s*[–—]\s*/g, ', ')
    .trim();
}

// One plain sentence from an error for the screen: no stack trace, no "stderr: Traceback..."
// tail, no line breaks, at most about 200 characters.
export function plainError(e) {
  let s = String(e?.message ?? e ?? '').trim();
  s = s.split(/\s*stderr:/i)[0];
  s = s.split(/\s*Traceback \(most recent call last\)/)[0];
  s = s.split(/\r?\n/)[0];
  s = s.replace(/\s+at\s+\S+\s+\(.*$/, '');
  s = plain(s).replace(/\s+/g, ' ').trim();
  if (!s) return 'Unknown error.';
  if (s.length > 200) s = `${s.slice(0, 197).replace(/\s+\S*$/, '')}...`;
  return /[.!?]$/.test(s) ? s : `${s}.`;
}
