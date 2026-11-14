// Reads the output of scripts/site-hygiene.mjs into issues the Site health page can show:
// {id, severity: 'fail'|'warn'|'info', what, why, fix, urls: [{page, detail}]}. Pure: lines in,
// issues out. Lines it cannot place are returned as `unparsed`, so the page keeps them visible.

// One entry per section header the script prints. `row` reads one indented line of the section
// into {page, detail}; `group` sections print a quoted value line, then "- /route" lines under it.
const SECTIONS = [
  {
    re: /^--- FAIL: broken internal links ---$/,
    id: 'site:broken-links',
    severity: 'fail',
    what: (n) => `${n} ${n === 1 ? 'link points' : 'links point'} at a page that does not exist.`,
    why: 'A broken link sends readers and Google to an error page, and wastes the link.',
    fix: 'Change each link to the right address, or bring back the page it points at.',
    row: (line) => {
      const m = /^\s+(\S+)\s+->\s+(\S+)\s*$/.exec(line);
      return m ? { page: m[1], detail: `links to ${m[2]}` } : null;
    },
  },
  {
    re: /^--- FAIL: duplicate <title> ---$/,
    id: 'site:duplicate-titles',
    severity: 'fail',
    group: true,
    what: (n) => `${n} ${n === 1 ? 'page shares its' : 'pages share their'} title with another page.`,
    why: 'Two pages with the same title compete for the same searches, and Google may show the wrong one.',
    fix: 'Give each page a title that says what that page alone is about.',
    label: (v) => `shares the title "${v}"`,
  },
  {
    re: /^--- FAIL: missing\/empty title or description ---$/,
    id: 'site:missing-meta',
    severity: 'fail',
    what: (n) => `${n} ${n === 1 ? 'page has' : 'pages have'} no title or no description.`,
    why: 'Google then writes its own snippet, which usually gets fewer clicks.',
    fix: 'Add a title and a one or two sentence description to each page.',
    row: (line) => {
      const m = /^\s+(\/\S*):\s+(.+)$/.exec(line);
      return m ? { page: m[1], detail: m[2].replace(/missing\/empty/g, 'missing').replace(/<title>/g, 'title') } : null;
    },
  },
  {
    re: /^--- WARN: duplicate meta description ---$/,
    id: 'site:duplicate-descriptions',
    severity: 'warn',
    group: true,
    what: (n) => `${n} ${n === 1 ? 'page shares its' : 'pages share their'} description with another page.`,
    why: 'The description is the text under the title in search results. A copy tells searchers nothing new.',
    fix: 'Write a description for each page that matches what that page says.',
    label: (v) => `shares the description "${v}"`,
  },
  {
    re: /^--- WARN: orphan pages/,
    id: 'site:orphans',
    severity: 'warn',
    what: (n) => `${n} ${n === 1 ? 'page has' : 'pages have'} no link from any other page.`,
    why: 'Google finds and ranks pages through links. A page nothing links to is hard to find.',
    fix: 'Link to each page from two related pages.',
    row: (line) => {
      const m = /^\s+(\/\S*)\s*$/.exec(line);
      return m ? { page: m[1], detail: '' } : null;
    },
  },
  {
    re: /^--- WARN: unlisted \(noindex\) pages/,
    id: 'site:unlisted-orphans',
    severity: 'info',
    what: (n) => `${n} hidden ${n === 1 ? 'page has' : 'pages have'} no link from any other page.`,
    why: 'These pages are kept out of Google on purpose, so this is usually fine.',
    fix: 'Nothing to do unless one of them should be public.',
    row: (line) => {
      const m = /^\s+(\/\S*)\s*$/.exec(line);
      return m ? { page: m[1], detail: '' } : null;
    },
  },
  {
    re: /^--- WARN: titles > 60 chars/,
    id: 'site:long-titles',
    severity: 'warn',
    what: (n) => `${n} ${n === 1 ? 'title is' : 'titles are'} longer than 60 characters (the longest are listed).`,
    why: 'Google cuts long titles short in search results, so the end of the title is lost.',
    fix: 'Shorten the title so the words that matter come first.',
    row: (line) => {
      const m = /^\s+\[(\d+)\]\s+(\/\S*):/.exec(line);
      return m ? { page: m[2], detail: `${m[1]} characters` } : null;
    },
  },
  {
    re: /^--- WARN: descriptions > 160 chars/,
    id: 'site:long-descriptions',
    severity: 'warn',
    what: (n) =>
      `${n} ${n === 1 ? 'description is' : 'descriptions are'} longer than 160 characters (the longest are listed).`,
    why: 'Google cuts long descriptions short in search results.',
    fix: 'Shorten the description to one or two sentences.',
    row: (line) => {
      const m = /^\s+\[(\d+)\]\s+(\/\S*):/.exec(line);
      return m ? { page: m[2], detail: `${m[1]} characters` } : null;
    },
  },
  {
    re: /^--- INFO: noindex pages with title\/description gaps/,
    id: 'site:hidden-meta',
    severity: 'info',
    what: (n) => `${n} hidden ${n === 1 ? 'page has' : 'pages have'} no title or description.`,
    why: 'These pages are kept out of Google, so this only matters if one should be public.',
    fix: 'Nothing to do unless one of them should be public.',
    row: (line) => {
      const m = /^\s+(\/\S*):\s+(.+)$/.exec(line);
      return m ? { page: m[1], detail: m[2].replace(/missing\/empty/g, 'missing').replace(/<title>/g, 'title') } : null;
    },
  },
];

// Lines the script prints around the sections: rules, the heading, the summary and the result.
const FRAME = [
  /^=+$/,
  /^SITE HYGIENE AUDIT$/,
  /^Pages scanned: \d+$/,
  /^--- SUMMARY ---$/,
  /^(FAIL|WARN|INFO): .+\s\d+/,
  /^RESULT: /,
  /^\s*$/,
];

// lines: the script's output, one entry per line. Build output before the audit is ignored.
export function parseHygiene(lines) {
  const all = (lines ?? []).map(String);
  const start = all.findIndex((l) => /^SITE HYGIENE AUDIT$/.test(l));
  const body = start >= 0 ? all.slice(Math.max(0, start - 1)) : all;
  const issues = [];
  const unparsed = [];
  let cur = null;
  let groupValue = null;
  for (const line of body) {
    if (/^--- /.test(line)) {
      const def = SECTIONS.find((s) => s.re.test(line));
      groupValue = null;
      if (def) {
        cur = { def, urls: [] };
        issues.push(cur);
      } else {
        cur = null;
        if (!/^--- SUMMARY ---$/.test(line)) unparsed.push(line);
      }
      continue;
    }
    if (FRAME.some((re) => re.test(line))) continue;
    if (!cur) {
      if (start >= 0) unparsed.push(line);
      continue;
    }
    if (cur.def.group) {
      const value = /^\s{2}"(.*)"\s*$/.exec(line);
      const route = /^\s{4}-\s+(\/\S*)\s*$/.exec(line);
      if (value) groupValue = value[1].replace(/\.\.\.$/, '');
      else if (route && groupValue !== null) cur.urls.push({ page: route[1], detail: cur.def.label(groupValue) });
      else unparsed.push(line);
      continue;
    }
    const row = cur.def.row(line);
    if (row) cur.urls.push(row);
    else unparsed.push(line);
  }
  return {
    issues: issues
      .filter((i) => i.urls.length)
      .map(({ def, urls }) => ({
        id: def.id,
        severity: def.severity,
        what: def.what(urls.length),
        why: def.why,
        fix: def.fix,
        urls,
      })),
    unparsed,
  };
}
