import type { APIRoute } from 'astro';
import { sections, lastUpdatedISO, PAGE_URL } from '~/data/staffing-stats';

// JSON twin of the .csv endpoint. Same figures, same source of truth.

export const GET: APIRoute = () => {
  const body = {
    name: 'Rural Hospital and Critical Access Hospital Nurse Staffing Statistics (2026)',
    compiledBy: 'SimpleScheduleAI',
    url: PAGE_URL,
    updated: lastUpdatedISO,
    license: 'https://creativecommons.org/licenses/by/4.0/',
    attribution: `Cite the primary source given for each figure, and link ${PAGE_URL} as the collection.`,
    sections: sections.map((s) => ({
      id: s.id,
      heading: s.heading,
      takeaway: s.takeaway,
      stats: s.stats.map((stat) => ({
        anchor: stat.anchor,
        value: stat.value,
        label: stat.label,
        context: stat.context,
        source: stat.source,
        sourceUrl: stat.url,
        permalink: `${PAGE_URL}#${stat.anchor}`,
      })),
    })),
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
