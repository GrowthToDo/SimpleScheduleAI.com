// "Paste a link you found": the only place the desk reads an address a person typed. So it is guarded:
// GET only, https only, the normal port, public hosts only (localhost, private, link-local and other
// special addresses are refused after the DNS lookup, and the connection goes to the address that was
// checked, so a second lookup cannot point it elsewhere), 20 seconds, 2 MB, and at most one redirect,
// checked the same way. Then the page's title, publisher (og:site_name) and date
// (article:published_time) are read.
//
// fetchPublicPage(url, {fetchImpl, lookup}) takes both as options, so tests need no network and no DNS.

import https from 'node:https';
import dns from 'node:dns';
import net from 'node:net';
import zlib from 'node:zlib';
import { USER_AGENT } from './news.mjs';
import { decodeEntities, stripHtml, feedDate } from '../news.mjs';
import { plain } from '../text.mjs';

export const PAGE_TIMEOUT_MS = 20000;
export const PAGE_MAX_BYTES = 2 * 1024 * 1024;

const refuse = (message, status = 400) => Object.assign(new Error(message), { status });

export const NOT_PUBLIC =
  'That address points to this computer or a private network, so the desk will not read it. Paste a public news page.';

// ---------------------------------------------------------------- which addresses are public

const v4num = (ip) => ip.split('.').reduce((n, p) => n * 256 + Number(p), 0);
const V4_BLOCKED = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.88.99.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
];
const inBlock = (n, [base, bits]) => {
  const size = 2 ** (32 - bits);
  const start = Math.floor(v4num(base) / size) * size;
  return n >= start && n < start + size;
};
const publicV4 = (ip) => !V4_BLOCKED.some((b) => inBlock(v4num(ip), b));

// The eight 16-bit groups of an IPv6 address (an IPv4 tail becomes two groups), or null.
function v6groups(ip) {
  let s = ip.split('%')[0].toLowerCase();
  const tail = /(\d+\.\d+\.\d+\.\d+)$/.exec(s);
  if (tail) {
    const n = v4num(tail[1]);
    s = `${s.slice(0, -tail[1].length)}${Math.floor(n / 65536).toString(16)}:${(n % 65536).toString(16)}`;
  }
  const [head, rest] = s.split('::');
  const a = head ? head.split(':') : [];
  const b = rest !== undefined && rest !== '' ? rest.split(':') : [];
  const fill = s.includes('::') ? 8 - a.length - b.length : 0;
  const g = [...a, ...Array(Math.max(0, fill)).fill('0'), ...b].map((x) => parseInt(x || '0', 16));
  return g.length === 8 && g.every((x) => Number.isFinite(x) && x >= 0 && x <= 0xffff) ? g : null;
}
const v4of = (hi, lo) => [hi >> 8, hi & 255, lo >> 8, lo & 255].join('.');

function publicV6(ip) {
  const g = v6groups(ip);
  if (!g) return false;
  const zeros = (n) => g.slice(0, n).every((x) => x === 0);
  if (zeros(8)) return false; // ::
  if (zeros(7) && g[7] === 1) return false; // ::1
  if (zeros(5) && g[5] === 0xffff) return publicV4(v4of(g[6], g[7])); // ::ffff:a.b.c.d
  if (zeros(6)) return publicV4(v4of(g[6], g[7])); // ::a.b.c.d
  if (g[0] === 0x64 && g[1] === 0xff9b) return publicV4(v4of(g[6], g[7])); // NAT64
  if (g[0] === 0x2002) return publicV4(v4of(g[1], g[2])); // 6to4
  if ((g[0] & 0xfe00) === 0xfc00) return false; // unique local
  if ((g[0] & 0xffc0) === 0xfe80 || (g[0] & 0xffc0) === 0xfec0) return false; // link and site local
  if ((g[0] & 0xff00) === 0xff00) return false; // multicast
  if (g[0] === 0x2001 && (g[1] === 0xdb8 || g[1] === 0)) return false; // documentation, Teredo
  if (g[0] === 0x100 && zeros(4)) return false; // discard
  return true;
}

// True only for an address on the public internet.
export function isPublicAddress(ip) {
  const v = net.isIP(String(ip ?? '').split('%')[0]);
  if (v === 4) return publicV4(String(ip));
  if (v === 6) return publicV6(String(ip));
  return false;
}

// ---------------------------------------------------------------- the checks

// All the addresses a name has, as [{address, family}].
export const dnsLookup = (host) => dns.promises.lookup(host, { all: true, verbatim: true });

// {url, address, family} for an address the desk may read, or a 400 with a plain sentence.
export async function checkTarget(raw, { lookup = dnsLookup } = {}) {
  let url;
  try {
    url = new URL(String(raw ?? '').trim());
  } catch {
    throw refuse('That is not an address the desk can read. Paste the whole address, starting with https://.');
  }
  if (url.protocol !== 'https:')
    throw refuse('Only https addresses can be read. Paste the address starting with https://.');
  if (url.username || url.password) throw refuse('An address with a user name or password in it is not read.');
  if (url.port && url.port !== '443') throw refuse('The address must use the normal https port.');
  const host = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (!host || host === 'localhost' || host.endsWith('.localhost') || (!host.includes('.') && !net.isIP(host)))
    throw refuse(NOT_PUBLIC);
  let addresses;
  if (net.isIP(host)) addresses = [{ address: host, family: net.isIP(host) }];
  else {
    try {
      addresses = await lookup(host);
    } catch {
      throw refuse(`The desk could not find the site ${host}. Check the address.`);
    }
  }
  if (!Array.isArray(addresses) || !addresses.length)
    throw refuse(`The desk could not find the site ${host}. Check the address.`);
  if (addresses.some((a) => !isPublicAddress(a?.address))) throw refuse(NOT_PUBLIC);
  return { url, address: addresses[0].address, family: addresses[0].family ?? net.isIP(addresses[0].address) };
}

// ---------------------------------------------------------------- the request

// One GET to `href`, connecting only to `address` (checked by checkTarget). Never follows a redirect.
// {status, headers, body}: body is the page text, at most maxBytes after it is unpacked.
export function httpsGet(href, { address, family, timeoutMs = PAGE_TIMEOUT_MS, maxBytes = PAGE_MAX_BYTES }) {
  return new Promise((resolve, reject) => {
    let done = false;
    const finish = (fn, v) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      fn(v);
    };
    const req = https.request(
      href,
      {
        method: 'GET',
        headers: {
          'user-agent': USER_AGENT,
          accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5',
          'accept-encoding': 'gzip, deflate, br',
        },
        // The connection goes to the checked address, whatever a new lookup would say.
        lookup: (_host, opts, cb) => (opts?.all ? cb(null, [{ address, family }]) : cb(null, address, family)),
      },
      (res) => {
        const status = res.statusCode ?? 0;
        if (status >= 300 && status < 400) {
          res.resume();
          return finish(resolve, { status, headers: res.headers, body: '' });
        }
        const enc = String(res.headers['content-encoding'] ?? '').toLowerCase();
        const stream =
          enc === 'gzip'
            ? res.pipe(zlib.createGunzip())
            : enc === 'deflate'
              ? res.pipe(zlib.createInflate())
              : enc === 'br'
                ? res.pipe(zlib.createBrotliDecompress())
                : res;
        const chunks = [];
        let size = 0;
        stream.on('data', (c) => {
          size += c.length;
          if (size > maxBytes) {
            req.destroy();
            finish(reject, refuse('That page is larger than 2 MB, so the desk stopped reading it.', 502));
            return;
          }
          chunks.push(c);
        });
        stream.on('end', () =>
          finish(resolve, { status, headers: res.headers, body: Buffer.concat(chunks).toString('utf8') })
        );
        stream.on('error', () => finish(reject, refuse('The page could not be unpacked.', 502)));
      }
    );
    const timer = setTimeout(() => {
      req.destroy();
      finish(reject, refuse(`The site did not answer in ${Math.round(timeoutMs / 1000)} seconds.`, 502));
    }, timeoutMs);
    req.on('error', (e) =>
      finish(reject, refuse(`The site could not be reached (${String(e?.code ?? e?.message ?? 'error')}).`, 502))
    );
    req.end();
  });
}

const isRedirect = (s) => [301, 302, 303, 307, 308].includes(s);
const header = (headers, name) => {
  const v = headers?.[name] ?? headers?.[name.toLowerCase()];
  return Array.isArray(v) ? v[0] : v;
};

// The page at `raw`: {url (where it was read), html}. At most one redirect, checked the same way.
export async function fetchPublicPage(raw, { fetchImpl = httpsGet, lookup = dnsLookup, timeoutMs, maxBytes } = {}) {
  let target = await checkTarget(raw, { lookup });
  const get = (t) => fetchImpl(t.url.href, { address: t.address, family: t.family, timeoutMs, maxBytes });
  let res = await get(target);
  if (isRedirect(res.status)) {
    const loc = header(res.headers, 'location');
    if (!loc) throw refuse('The site sent a redirect with no address, so the page could not be read.', 502);
    target = await checkTarget(new URL(loc, target.url).href, { lookup });
    res = await get(target);
    if (isRedirect(res.status))
      throw refuse(
        'The page sent the desk on more than one redirect, so it stopped. Open the link in the browser and paste the address it ends on.'
      );
  }
  if (!(res.status >= 200 && res.status < 300))
    throw refuse(`The site answered ${res.status}, so the page could not be read.`, 502);
  const type = String(header(res.headers, 'content-type') ?? '');
  if (type && !/html/i.test(type))
    throw refuse('That address is not a web page, so the desk cannot read a title from it.');
  return { url: target.url.href, html: String(res.body ?? '') };
}

// ---------------------------------------------------------------- reading the page

// The content of <meta property|name="key" content="...">, in either attribute order.
function metaOf(html, keys) {
  for (const key of keys) {
    const k = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const a = new RegExp(`<meta[^>]+(?:property|name|itemprop)=["']${k}["'][^>]*content=["']([^"']*)["']`, 'i').exec(
      html
    );
    const b = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name|itemprop)=["']${k}["']`, 'i').exec(
      html
    );
    const v = (a ?? b)?.[1];
    if (v && v.trim()) return plain(decodeEntities(v).replace(/\s+/g, ' ').trim());
  }
  return null;
}

// {title, publisher, date, description} from a page's HTML. publisher falls back to the host name.
export function readPage(html, url) {
  const h = String(html ?? '').slice(0, PAGE_MAX_BYTES);
  const titleTag = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(h)?.[1];
  const title = metaOf(h, ['og:title', 'twitter:title']) ?? (titleTag ? stripHtml(titleTag) : null);
  let host = '';
  try {
    host = new URL(url).hostname.replace(/^www\./, '');
  } catch {
    // no host
  }
  const publisher = metaOf(h, ['og:site_name']) ?? (host || null);
  // "Story title | The Ledger": the site's own name at the end of the title is the publisher, not the title.
  const esc = String(publisher ?? '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const clean = title && publisher ? title.replace(new RegExp(`\\s+[|\\-:]\\s+${esc}\\s*$`, 'i'), '').trim() : title;
  return {
    title: clean || title || null,
    publisher,
    date: feedDate(metaOf(h, ['article:published_time', 'datePublished', 'pubdate', 'date']) ?? ''),
    description: metaOf(h, ['og:description', 'description', 'twitter:description']) ?? '',
  };
}
