// Links from our own pages to a page, and what to do about a live page Google left out. One source
// for Site health, the Not indexed cards (rules.mjs detectNotIndexed) and every count of links in.
// Pure functions.
//
// The repo link count (local.inbound) reads the links written in each page's text. Links in the
// menu and the footer are not in it, so every count says so.

export const IN_TEXT_NOTE = 'menu and footer links are not counted';

// How many other pages link to `page` in their page text: real pages only (a src/... entry is a shared
// component or a listing template, not a page that links), never the page itself. null when the page
// was never counted, which is not zero.
export function inboundCount(inbound, page) {
  const sources = inbound?.[page];
  if (!Array.isArray(sources)) return null;
  return new Set(sources.map(String).filter((src) => src.startsWith('/') && src !== page)).size;
}

// "3 pages link to it in their page text (menu and footer links are not counted)." null when the page
// was never counted.
export const linksInText = (n, where = 'to it', { other = false } = {}) =>
  n === null || n === undefined
    ? null
    : `${n} ${other ? 'other ' : ''}${n === 1 ? 'page links' : 'pages link'} ${where} in their page text (${IN_TEXT_NOTE}).`;

// A page needs this many links in from page text before more links stop being the first thing to try.
export const LINKED_ENOUGH = 3;

// Why Search Console left a page out, as one of a few kinds. 'excluded': the page itself keeps it
// out (a noindex instruction, a redirect, another page named as the main version), so links do not
// help. 'unknown': Google has not met the address. 'waiting': Google knows it and has not added it.
export function notIndexedKind(reason) {
  const r = String(reason ?? '');
  if (/noindex|redirect|canonical|alternate|duplicate/i.test(r)) return 'excluded';
  if (/unknown to google/i.test(r)) return 'unknown';
  return 'waiting';
}

// The plain words for a page the page itself keeps out of Google.
export function excludedText(reason) {
  const r = String(reason ?? '');
  if (/noindex/i.test(r)) return 'The page tells Google not to index it (a noindex instruction).';
  if (/redirect/i.test(r)) return 'The address sends visitors on to another page, so Google indexes that page instead.';
  return 'Google treats another page as the main version of this one.';
}

// The recommendation for one live page Google left out, the same on Site health and on its Not
// indexed card. {group, action}: group is the Site health issue it falls under (not-indexed,
// not-indexed-linked or not-indexed-excluded); action is the card's recommendation for that page.
export function notIndexedAdvice({ page, reason, inbound }) {
  if (notIndexedKind(reason) === 'excluded')
    return {
      group: 'not-indexed-excluded',
      action: `${excludedText(reason)} Decide whether ${page} should be found. If it should, remove what keeps it out. If not, ask Claude to take it out of the sitemap.`,
    };
  if ((inbound ?? 0) >= LINKED_ENOUGH)
    return {
      group: 'not-indexed-linked',
      action: `Ask Google to index ${page} in Search Console (URL inspection, then Request indexing). More links are not the likely gap: ${linksInText(inbound)}`,
    };
  return {
    group: 'not-indexed',
    action: `Link to ${page} from two related pages that Google already crawls, then request indexing in Search Console.`,
  };
}
