import fs from 'node:fs';
import path from 'node:path';

export const MECHANICAL_FIELDS = [
  'checkBlog',
  'checkLinks',
  'inboundLinks',
  'image',
  'prettier',
  'dateSanity',
  'factsDossier',
];
export const RECORDED_FIELDS = ['proofread', 'factCheck', 'imageEyeball', 'founderApproval', 'indexNow', 'gscSitemap'];
export const BLOCKING_RECORDED = ['proofread', 'factCheck', 'imageEyeball', 'founderApproval'];

const ACCEPTED = {
  proofread: ['READY'],
  factCheck: ['PASS', 'NOT_REQUIRED'],
  imageEyeball: ['OK'],
  founderApproval: ['YES'],
  indexNow: ['DONE'],
  gscSitemap: ['DONE'],
};

const manifestPath = (slug, root) => path.join(root, '.publish', `${slug}.json`);

export function loadManifest(slug, root = process.cwd(), collection = 'post') {
  const p = manifestPath(slug, root);
  if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  return { schemaVersion: 1, slug, collection, mechanical: {}, recorded: {}, overrides: [] };
}

export function saveManifest(manifest, root = process.cwd()) {
  const dir = path.join(root, '.publish');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(manifestPath(manifest.slug, root), JSON.stringify(manifest, null, 2) + '\n');
}

export function setMechanical(manifest, field, status, contentHash) {
  if (!MECHANICAL_FIELDS.includes(field)) throw new Error(`Unknown mechanical field: ${field}`);
  manifest.mechanical[field] = { status, checkedAt: new Date().toISOString(), contentHash };
}

export function setRecorded(manifest, field, value, by, contentHash) {
  if (!RECORDED_FIELDS.includes(field)) throw new Error(`Unknown recorded field: ${field}`);
  manifest.recorded[field] = { value, setBy: by || 'unknown', setAt: new Date().toISOString(), contentHash };
}

/**
 * @param {object} manifest
 * @param {string|{mechanicalHash: string, verdictHash: string}} hashes - either
 *   a single hash string (applied to both mechanical and recorded fields, for
 *   callers that don't distinguish), or an object separating the two: MECHANICAL
 *   fields are compared against `mechanicalHash` (the full content hash — dateSanity
 *   etc. must re-run on any content change including date bumps); RECORDED fields
 *   (human verdicts) are compared against `verdictHash` (draft:/publishDate:/
 *   updateDate: stripped), so flipping draft or bumping dates alone does not stale
 *   an already-recorded proofread/factCheck/etc. verdict.
 */
export function manifestStatus(manifest, hashes) {
  const { mechanicalHash, verdictHash } =
    typeof hashes === 'string' ? { mechanicalHash: hashes, verdictHash: hashes } : hashes;
  const rows = [];
  let green = true;
  for (const f of MECHANICAL_FIELDS) {
    const e = manifest.mechanical[f];
    const fresh = !!e && e.contentHash === mechanicalHash;
    const pass = !!e && e.status === 'PASS' && fresh;
    rows.push({ field: f, kind: 'mechanical', status: e ? e.status : 'MISSING', fresh });
    if (!pass) green = false;
  }
  for (const f of RECORDED_FIELDS) {
    const e = manifest.recorded[f];
    const fresh = !!e && e.contentHash === verdictHash;
    const ok = !!e && ACCEPTED[f].includes(e.value) && fresh;
    rows.push({ field: f, kind: 'recorded', status: e ? e.value : 'MISSING', fresh });
    if (BLOCKING_RECORDED.includes(f) && !ok) green = false;
  }
  return { green, rows };
}
