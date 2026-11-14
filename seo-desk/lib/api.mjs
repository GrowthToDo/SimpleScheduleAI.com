// The API: view models for every page, the actions behind the buttons, CSV export and the
// jobs. Routes are a table for server.mjs. GET routes read the shared model (built once per
// change of the data) and change nothing. makeRoutes takes a job runner so tests can inject
// a fake spawner; `routes` is the real one.

import { buildModel, envelope } from './api/model.mjs';
import { weekView, opportunitiesView, competingView, resultsView } from './api/work.mjs';
import { searchView, pagesView, pageView, RANGES } from './api/search.mjs';
import { aiView, visitorsView, healthView, competitorsView, settingsView } from './api/panels.mjs';
import { csvFor, LISTS } from './api/csv.mjs';
import {
  itemAction,
  chooseTop5,
  lockCurrentWeek,
  unlockWeek,
  annotationsView,
  addAnnotation,
  updateAnnotation,
  deleteAnnotation,
  changeSettings,
  recordVisit,
  importAiCsv,
  addEditNote,
  backup,
} from './api/actions.mjs';
import { createJobs, confirmText } from './jobs.mjs';
import { bad, get, post, q, bodyOf, sendText } from './api/kit.mjs';
import { navCounts } from './api/ext/overview.mjs';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const TILE_KEYS = ['impressions', 'clicks', 'targetPosition', 'searches', 'bing', 'indexed'];

export function makeRoutes({ jobs = createJobs() } = {}) {
  return [
    get('/api/week', () => weekView(buildModel())),
    get('/api/opportunities', (ctx) => {
      const model = buildModel();
      // The type tabs show each insight page's own count, the same number the sidebar shows.
      return opportunitiesView(
        model,
        { type: q(ctx, 'type'), status: q(ctx, 'status'), page: q(ctx, 'page') },
        { insightCounts: navCounts(model) }
      );
    }),
    get('/api/competing', () => competingView(buildModel())),
    get('/api/results', () => resultsView(buildModel())),
    get('/api/search', (ctx) => {
      const days = q(ctx, 'range') === '' ? 28 : Number(q(ctx, 'range'));
      if (!RANGES.includes(days)) throw bad(`range must be one of: ${RANGES.join(', ')}.`);
      const metric = q(ctx, 'metric') || 'impressions';
      if (!TILE_KEYS.includes(metric)) throw bad(`metric must be one of: ${TILE_KEYS.join(', ')}.`);
      return searchView(buildModel(), { days, metric });
    }),
    get('/api/pages', () => pagesView(buildModel())),
    get('/api/page', (ctx) => {
      const path = q(ctx, 'path');
      if (!path.startsWith('/')) throw bad('path must be a page path that starts with a slash, such as /pricing.');
      const model = buildModel();
      if (model.empty) {
        return {
          ...envelope(model),
          page: path,
          queries: [],
          series: [],
          markers: [],
          opportunities: [],
          verdicts: [],
          inboundFrom: [],
        };
      }
      const view = pageView(model, path);
      if (!view) throw Object.assign(new Error('That page is not in the desk data.'), { status: 404 });
      return view;
    }),
    get('/api/ai', () => aiView(buildModel())),
    get('/api/visitors', () => visitorsView(buildModel())),
    get('/api/health', () => healthView(buildModel())),
    get('/api/competitors', () => competitorsView(buildModel())),
    get('/api/settings', () => settingsView(buildModel())),
    get('/api/annotations', (ctx) => annotationsView(buildModel(), { archived: q(ctx, 'archived') === '1' })),
    get('/api/backup', (ctx) => {
      const day = buildModel().today;
      sendText(
        ctx,
        'application/json; charset=utf-8',
        `${JSON.stringify(backup(), null, 2)}\n`,
        `seo-desk-backup-${day}.json`
      );
    }),
    get(/^\/api\/export\/[a-z]+\.csv$/, (ctx) => {
      const list = ctx.url.pathname.replace(/^\/api\/export\//, '').replace(/\.csv$/, '');
      if (!LISTS.includes(list))
        throw Object.assign(new Error(`There is no list called ${list}. Use: ${LISTS.join(', ')}.`), { status: 404 });
      const model = buildModel();
      const params = { type: q(ctx, 'type'), status: q(ctx, 'status'), page: q(ctx, 'page'), range: q(ctx, 'range') };
      sendText(ctx, 'text/csv; charset=utf-8', csvFor(model, list, params), `seo-desk-${list}-${model.today}.csv`);
    }),

    get('/api/jobs', () => {
      const model = buildModel();
      return { ...envelope(model), jobs: jobs.list(), running: jobs.runningKey() };
    }),
    post('/api/jobs/:key', async (ctx) => {
      const body = await bodyOf(ctx);
      const def = jobs.def(ctx.params.key);
      if (!def) {
        const e =
          ctx.params.key === 'edit-note'
            ? 'The edit note has its own route: POST /api/edit-note.'
            : 'There is no job with that name.';
        throw Object.assign(new Error(e), { status: ctx.params.key === 'edit-note' ? 400 : 404 });
      }
      if (body?.confirm !== true) throw bad(confirmText(def));
      return jobs.start(def.key);
    }),

    post('/api/item/:id', async (ctx) => itemAction(ctx.params.id, await bodyOf(ctx))),
    post('/api/week/top5', async (ctx) => chooseTop5((await bodyOf(ctx)).ids)),
    post('/api/week/lock', async (ctx) => (await bodyOf(ctx), lockCurrentWeek())),
    post('/api/week/unlock', async (ctx) => (await bodyOf(ctx), unlockWeek())),
    post('/api/annotations', async (ctx) => addAnnotation(await bodyOf(ctx))),
    {
      method: 'PUT',
      path: '/api/annotations/:id',
      handler: async (ctx) => updateAnnotation(ctx.params.id, await bodyOf(ctx)),
    },
    { method: 'DELETE', path: '/api/annotations/:id', handler: (ctx) => deleteAnnotation(ctx.params.id) },
    post('/api/settings', async (ctx) => changeSettings(await bodyOf(ctx))),
    post('/api/visit', async (ctx) => (await bodyOf(ctx), recordVisit())),
    post('/api/ai/import', async (ctx) => importAiCsv(await ctx.rawBody())),
    post('/api/edit-note', async (ctx) => addEditNote(await bodyOf(ctx))),
  ];
}

// Extension routes: every lib/api/ext/*.mjs file that exports a `routes` array is added, in
// file-name order. A feature adds routes by adding a file there; this index is not edited.
async function loadExtRoutes() {
  const dir = fileURLToPath(new URL('./api/ext/', import.meta.url));
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const name of fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mjs'))
    .sort()) {
    const mod = await import(new URL(`./api/ext/${name}`, import.meta.url));
    if (Array.isArray(mod.routes)) out.push(...mod.routes);
  }
  return out;
}

export const extRoutes = await loadExtRoutes();
// Extension routes come first, so a specific address such as /api/export/topics.csv is not
// swallowed by a broader core pattern.
export const routes = [...extRoutes, ...makeRoutes()];
