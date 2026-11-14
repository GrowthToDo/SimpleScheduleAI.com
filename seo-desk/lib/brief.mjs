// "Copy brief for Claude": turns a card into a ready prompt that carries the
// repo rules, so a card becomes work without retyping. Pure function: no files,
// no clock.

import { SITE } from '../../scripts/lib/change-log-core.mjs';
import { longDate, plain } from './text.mjs';

const slugOfPage = (page) => (page && /^\/(blog|articles)\/[^/]+$/.test(page) ? page.split('/').pop() : null);

// card: a Card from proposeTop5 or an Opportunity. Both carry title, measured,
// action, test, page and isPageEdit; only a card carries source.
export function brief(card, { frozen = new Map() } = {}) {
  const page = card.page || null;
  const slug = slugOfPage(page);
  const lines = [];
  lines.push(`Task for the SimpleScheduleAI website: ${plain(card.title)}`);
  lines.push('');
  if (page) lines.push(`Page: ${page} (${SITE}${page})`);
  lines.push(`What we measured: ${plain(card.measured)}`);
  lines.push(`Recommendation (a hypothesis): ${plain(card.action)}`);
  lines.push(
    `How we will know: ${plain(card.test) || 'Judged by the 28 day before and after verdict, about 30 days after the edit.'}`
  );
  lines.push('');
  lines.push('Rules for this repo:');
  const rules = [];
  if (slug) {
    rules.push('Load .claude/skills/seo-aeo-simplescheduleai.md before editing a post.');
    rules.push(`First command: npm run publish-gate ${slug} -- --status`);
  } else if (card.slot === 'new-post') {
    rules.push(
      'Load .claude/skills/publish-pipeline.md and .claude/skills/seo-aeo-simplescheduleai.md before writing the post.'
    );
    rules.push('Once the slug is chosen, the first command is: npm run publish-gate <slug> -- --status');
    rules.push('The post stays draft: true until the founder says to publish it.');
  } else if (page) {
    rules.push(
      'This is a site page, not a blog post, so the post skill and the publish gate do not apply. Edit the file under src/pages.'
    );
  }
  if (card.isPageEdit || card.slot === 'page-edit') {
    rules.push('One live page edit a week, and never the same page inside 28 days.');
    const f = page ? frozen.get(page) : null;
    if (f) rules.push(`This page is frozen until ${longDate(f.until)}. Do not edit it before then.`);
  }
  if (card.source === 'plan') {
    rules.push(
      `This card came from the plan file in docs/seo. When the work is live, write "Done YYYY-MM-DD" in the row's last cell and tick it.`
    );
  }
  rules.push('After a live page edit, log it with npm run change-log so it is judged 28 days later.');
  rules.forEach((r, i) => lines.push(`${i + 1}. ${r}`));
  return lines.join('\n');
}
