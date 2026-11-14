// Annotation routes beyond the core ones: the archive list and restoring a note. Adding, editing,
// archiving and deleting a note are the core routes in lib/api.mjs (PUT and DELETE on
// /api/annotations/:id); deleting a live note archives it and deleting an archived one removes it.

import { get, post } from '../kit.mjs';
import { buildModel } from '../model.mjs';
import { annotationsView, restoreAnnotation } from '../actions.mjs';

export const routes = [
  get('/api/annotations/archived', () => annotationsView(buildModel(), { archived: true })),
  post('/api/annotations/:id/restore', (ctx) => restoreAnnotation(ctx.params.id)),
];
