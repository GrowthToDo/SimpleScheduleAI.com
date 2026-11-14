// Whether AI crawlers may fetch the site, from its robots.txt. Pure functions: the local source
// fetches the file and calls robotsAllows for each crawler.

// The crawlers the Site health page reports on, in the order it lists them.
export const AI_CRAWLERS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'PerplexityBot',
  'CCBot',
  'Google-Extended',
];

// robots.txt text to groups: [{agents: [lower case], rules: [{allow, path}]}]. User-agent lines
// in a row share one group; a rule line ends the run of agent lines.
function groupsOf(text) {
  const groups = [];
  let cur = null;
  let lastWasAgent = false;
  for (const raw of String(text ?? '').split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, '').trim();
    const m = /^([A-Za-z-]+)\s*:\s*(.*)$/.exec(line);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const value = m[2].trim();
    if (key === 'user-agent') {
      if (!cur || !lastWasAgent) {
        cur = { agents: [], rules: [] };
        groups.push(cur);
      }
      cur.agents.push(value.toLowerCase());
      lastWasAgent = true;
    } else if (key === 'allow' || key === 'disallow') {
      lastWasAgent = false;
      if (cur) cur.rules.push({ allow: key === 'allow', path: value });
    } else {
      lastWasAgent = false;
    }
  }
  return groups;
}

// A rule path to a test: * matches anything, a trailing $ anchors the end, the rest is a prefix.
function matches(pattern, path) {
  const anchored = pattern.endsWith('$');
  const body = anchored ? pattern.slice(0, -1) : pattern;
  const re = body
    .split('*')
    .map((s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*');
  return new RegExp(`^${re}${anchored ? '$' : ''}`).test(path);
}

// True when `agent` may fetch `path` under robots.txt `text`. The group naming the agent wins
// over the * group; inside it the longest matching rule wins, and Allow wins a tie. An empty
// Disallow, no matching rule, or no file at all means allowed.
export function robotsAllows(text, agent, path = '/') {
  const groups = groupsOf(text);
  const name = String(agent).toLowerCase();
  const own = groups.filter((g) => g.agents.includes(name));
  const chosen = own.length ? own : groups.filter((g) => g.agents.includes('*'));
  let best = null;
  for (const rule of chosen.flatMap((g) => g.rules)) {
    if (!rule.path) continue;
    if (!matches(rule.path, path)) continue;
    const len = rule.path.length;
    if (!best || len > best.len || (len === best.len && rule.allow && !best.allow)) best = { len, allow: rule.allow };
  }
  return best ? best.allow : true;
}
