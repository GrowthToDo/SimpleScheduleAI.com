// GET /api/ai-visibility: how often the AI assistants named us and linked to us, by kind of
// question and by assistant, from the last citation check. Read only; the check itself runs as
// the "citations" job.

import { visibility, competitorNamesFrom } from '../../ai-visibility.mjs';
import { buildModel, envelope } from '../model.mjs';
import { get } from '../kit.mjs';

// Our own names, whatever the brand file holds besides: the file also lists competitors.
const OWN_DEFAULTS = ['simplescheduleai', 'simple schedule ai', 'simple schedule'];
const isOwn = (term) => /simple\s*-?\s*schedule/i.test(term) || /^ssai$/i.test(term.trim());

// The websites the desk watches as competitors: the pages in the watch log and the sitemap log.
function watchedHosts(local) {
  const hosts = [];
  for (const w of local?.competitors?.watch ?? []) {
    // a watch entry is a page address, or a "host__page" label when its snapshot has no address
    hosts.push(String(w?.url ?? '').split('__')[0]);
  }
  for (const s of local?.competitors?.sitemap ?? []) hosts.push(String(s?.host ?? '').split('__')[0]);
  return hosts.filter(Boolean);
}

export function configFor(model) {
  const terms = (model.brands ?? []).map(String).filter((t) => t.trim());
  const brands = [...new Set([...OWN_DEFAULTS, ...terms.filter(isOwn)])];
  const competitors = [
    ...terms.filter((t) => !isOwn(t)),
    ...competitorNamesFrom(watchedHosts(model.data.local), { own: brands }),
  ];
  return { brands, competitors, today: model.today };
}

export const view = (model) => {
  const lines = model.data.local?.aeo ?? [];
  const env = envelope(model, { need: ['local'] });
  return { ...env, empty: env.empty || !lines.length, ...visibility(lines, configFor(model)) };
};

export const routes = [get('/api/ai-visibility', () => view(buildModel()))];
