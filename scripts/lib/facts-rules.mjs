/**
 * Known-drift facts patterns. Each entry names the dossier anchor that holds
 * the approved wording. A line violates when `trigger` matches AND
 * (`bad` matches OR `requires` fails), unless the line has `<!-- facts-ok -->`.
 * Grow this table whenever a new recurring fact enters docs/seo/facts-dossier.md.
 */
export const FACTS_RULES = [
  {
    id: 'cfr-631-on-duty',
    trigger: /registered nurse[^.\n]{0,60}on duty/i,
    bad: null,
    requires: /clinical nurse specialist,? or licensed practical nurse/i,
    anchor: 'facts-dossier.md#42-cfr-485631a5',
    message: '485.631(a)(5) permits an RN, CNS, or LPN on duty — RN-only overstates the reg',
  },
  {
    id: 'cfr-631-scope',
    trigger: /485\.631/,
    bad: /provide \(?or (assign|supervise)/i,
    requires: null,
    anchor: 'facts-dossier.md#42-cfr-485635d',
    message: 'provide-or-supervise is 485.635(d), not 485.631',
  },
  {
    id: 'nsi-2024-figure',
    trigger: /\$52,?350|\$52K/i,
    bad: /\$52,?350|\$52K/i,
    requires: null,
    anchor: 'facts-dossier.md#nsi-2025',
    message: 'stale NSI figure; 2025 report = $61,110 ($61K short form)',
  },
  {
    id: 'nsi-2024-turnover',
    trigger: /18\.4\s?(%|percent)/,
    bad: /18\.4\s?(%|percent)/,
    requires: null,
    anchor: 'facts-dossier.md#nsi-2025',
    message:
      'stale NSI turnover rate; 2025 report = 16.4% (facts-ok + explicit year label if citing an older edition deliberately)',
  },
  {
    id: 'nnu-date',
    trigger: /June 3,? 2026/i,
    bad: /June 3,? 2026/i,
    requires: null,
    anchor: 'facts-dossier.md#nnu-fact-sheet',
    message: 'NNU primary source is dated May 26, 2026 (June 3 is a republication)',
  },
  {
    id: 'jama-65-qualifier',
    trigger: /65\s?(percent|%)[^.\n]{0,40}(respondent|nurse)/i,
    bad: null,
    requires: /nonretired/i,
    anchor: 'facts-dossier.md#jama-network-open-feb-2026',
    message: 'the 65% is of the NONRETIRED subset; qualifier required',
  },
  {
    id: 'ca-only-ratio-state',
    trigger: /only state\b[^.\n]{0,60}(ratio|staffing)|California is the only/i,
    bad: /only state\b[^.\n]{0,60}(ratio|staffing)|California is the only/i,
    requires: null,
    anchor: 'facts-dossier.md#state-ratio-law-landscape-ca-or-ma-ny',
    message:
      'Oregon (2023 law, 12 unit types, in effect mid-2026) also mandates broad ratios — California is not the only state',
  },
];

export function checkFacts(body) {
  const violations = [];
  const lines = body.split(/\r?\n/);
  lines.forEach((text, i) => {
    if (text.includes('<!-- facts-ok -->')) return;
    for (const r of FACTS_RULES) {
      if (!r.trigger.test(text)) continue;
      const isBad = r.bad ? r.bad.test(text) : false;
      const missing = r.requires ? !r.requires.test(text) : false;
      if (isBad || missing)
        violations.push({ line: i + 1, id: r.id, text: text.slice(0, 120), anchor: r.anchor, message: r.message });
    }
  });
  return violations;
}
