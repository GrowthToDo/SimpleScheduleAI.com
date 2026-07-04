/**
 * Positioning-registry drift patterns (docs/seo/positioning-registry.md).
 * All WARN-severity by design: these are judgment-adjacent phrasing calls,
 * not deterministic factual errors. A line violates when `trigger` matches
 * AND (`bad` matches OR `requires` fails), unless the line has
 * `<!-- positioning-ok -->`. Mirrors the shape of scripts/lib/facts-rules.mjs.
 * Grow this table whenever a new recurring positioning drift enters the
 * registry's mapping table.
 */
export const POSITIONING_RULES = [
  {
    id: 'product-mode-leak',
    trigger: /guided setup session|facility license|runs in the browser, no installation|21 automated rule checks/i,
    bad: /guided setup session|facility license|runs in the browser, no installation|21 automated rule checks/i,
    requires: null,
    anchor: 'positioning-registry.md#mapping-table',
    message: 'product-mode phrase in service-mode content; use the registry service column',
  },
  {
    id: 'triad-drift',
    trigger: /AI builds (your|the) schedule/i,
    bad: null,
    requires: /our scheduling team (checks|reviews)/i,
    anchor: 'positioning-registry.md#mapping-table',
    message: 'triad must use registry wording "AI builds your schedule, our scheduling team checks it, you approve"',
  },
  {
    id: 'novel-service-promise',
    trigger: /we (configure|handle|manage|take care of|deliver|run) [^.\n]{0,50}for you/i,
    bad: /we (configure|handle|manage|take care of|deliver|run) [^.\n]{0,50}for you/i,
    requires: null,
    anchor: 'positioning-registry.md#authoring-rules-for-new-service-mode-content-blogs-and-pages',
    message: 'novel we-do-X-for-you construction; use a registry service token or add one',
  },
  {
    id: 'retired-demo-wording',
    trigger: /live demo/i,
    bad: /live demo/i,
    requires: null,
    anchor: 'positioning-registry.md#mapping-table',
    message: 'founder rule; "interactive demo" only',
  },
];

export function checkPositioning(body) {
  const violations = [];
  const lines = body.split(/\r?\n/);
  lines.forEach((text, i) => {
    if (text.includes('<!-- positioning-ok -->')) return;
    for (const r of POSITIONING_RULES) {
      if (!r.trigger.test(text)) continue;
      const isBad = r.bad ? r.bad.test(text) : false;
      const missing = r.requires ? !r.requires.test(text) : false;
      if (isBad || missing)
        violations.push({ line: i + 1, id: r.id, text: text.slice(0, 120), anchor: r.anchor, message: r.message });
    }
  });
  return violations;
}
