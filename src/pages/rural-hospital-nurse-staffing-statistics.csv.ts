import type { APIRoute } from 'astro';
import { sections, lastUpdatedISO, PAGE_URL } from '~/data/staffing-stats';

// Serves the same figures the page renders, as a real downloadable file.
// The Dataset schema on the page points its `distribution` here, so the
// structured data describes something that actually exists.
//
// The header MUST be line 1. A `#` comment preamble above it breaks
// pandas.read_csv(), R's read.csv(), and every spreadsheet/chart import a
// journalist actually uses, which would make this file useless to exactly the
// audience it exists for. Licence and attribution therefore travel as columns.

const esc = (v: string) => `"${String(v ?? '').replace(/"/g, '""')}"`;

const LICENSE = 'CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)';
const ATTRIBUTION = `Cite the primary source in source_url, and link ${PAGE_URL} as the collection.`;

export const GET: APIRoute = () => {
  const header = [
    'section',
    'anchor',
    'value',
    'label',
    'context',
    'source',
    'source_url',
    'permalink',
    'updated',
    'license',
    'attribution',
  ];
  const rows = sections.flatMap((s) =>
    s.stats.map((stat) =>
      [
        s.heading,
        stat.anchor,
        stat.value,
        stat.label,
        stat.context,
        stat.source,
        stat.url,
        `${PAGE_URL}#${stat.anchor}`,
        lastUpdatedISO,
        LICENSE,
        ATTRIBUTION,
      ]
        .map(esc)
        .join(',')
    )
  );

  return new Response(`${header.join(',')}\n${rows.join('\n')}\n`, {
    headers: { 'Content-Type': 'text/csv; charset=utf-8' },
  });
};
