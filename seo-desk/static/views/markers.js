// The words for each kind of chart marker the server sends (timelineEvents and
// googleUpdateMarkers in seo-desk/lib/api/work.mjs). One place, so the Search, Pages and Did it
// work charts all read the same. This module imports nothing, so node tests can check it.

export const MARKER_LABEL = {
  publish: 'Published',
  edit: 'Edit',
  note: 'Note',
  annotation: 'Your note',
  'google-update': 'Google update',
};

// A kind the desk does not know yet still reads as a sentence, never ": label".
export const markerLabel = (kind) => MARKER_LABEL[kind] ?? 'Marker';

// The hover text of one marker: "Google update: November core update".
export const markerText = (m) => `${markerLabel(m?.kind)}: ${m?.label ?? ''}`;
