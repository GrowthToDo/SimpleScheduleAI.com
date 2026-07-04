/**
 * Image-pool family helpers.
 *
 * Every entry in scripts/image-pool.json carries a `family` field — a coarse
 * VISUAL grouping (all supplies flat-lays, all stethoscope close-ups, ...).
 * The exact-ID uniqueness gate cannot see that three different IDs are
 * visually near-identical; the family check can. check-blog WARNs when the
 * chosen image's family is already used by 3+ live posts.
 */

export const IMAGE_FAMILIES = [
  'supplies-flat-lay',
  'stethoscope-closeup',
  'nurse-portrait',
  'team-meeting',
  'facility-exterior',
  'ward-clinical',
  'desk-admin',
  'historic-bw',
  'data-analytics',
  'misc',
];

/** Family of a pool image id, or null when unknown / untagged. */
export function familyOf(pool, id) {
  if (!Array.isArray(pool)) return null;
  const entry = pool.find((p) => p && p.id === id);
  return (entry && entry.family) || null;
}

/**
 * Over-used-family detector. `siblings` is [{ slug, imageId, live }] for every
 * OTHER post in the corpus. Returns { family, count, slugs } when at least
 * `threshold` LIVE sibling posts use an image from the same family as the
 * chosen `id`; otherwise null.
 */
export function overusedFamily(pool, id, siblings, threshold = 3) {
  const family = familyOf(pool, id);
  if (!family) return null;
  const users = (siblings || []).filter((s) => s && s.live && s.imageId && familyOf(pool, s.imageId) === family);
  if (users.length < threshold) return null;
  return { family, count: users.length, slugs: users.map((s) => s.slug) };
}
