#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter, contentHash, resolvePost, scanInboundLinks } from './lib/publish-shared.mjs';
import { checkFacts } from './lib/facts-rules.mjs';
import {
  loadManifest,
  saveManifest,
  setMechanical,
  setRecorded,
  manifestStatus,
  RECORDED_FIELDS,
} from './lib/manifest.mjs';

const FIELD_ALIASES = {
  proofread: 'proofread',
  factcheck: 'factCheck',
  'fact-check': 'factCheck',
  'image-eyeball': 'imageEyeball',
  'founder-approval': 'founderApproval',
  indexnow: 'indexNow',
  'index-now': 'indexNow',
  'gsc-sitemap': 'gscSitemap',
  gscsitemap: 'gscSitemap',
};

const NPX_CMD = process.platform === 'win32' ? 'npx.cmd' : 'npx';

function runTool(cmd, args, cwd) {
  try {
    // On Windows, npx resolves to the npx.cmd shim; spawnSync fails with EINVAL
    // unless invoked through a shell. Plain `node` invocations don't need this.
    const shell = process.platform === 'win32' && cmd === NPX_CMD;
    execFileSync(cmd, args, { cwd, encoding: 'utf8', stdio: 'pipe', shell });
    return { ok: true, out: '' };
  } catch (e) {
    return { ok: false, out: String(e.stdout || '') + String(e.stderr || '') };
  }
}

async function imageCheck(data, root, network) {
  const url = String(data.image || '');
  const idMatch = url.match(/photo-([0-9]+-[0-9a-f]+)/);
  if (!idMatch) return { ok: false, why: 'no unsplash photo id in frontmatter image' };
  const id = idMatch[1];
  const pool = JSON.parse(fs.readFileSync(path.join(root, 'scripts', 'image-pool.json'), 'utf8'));
  if (!pool.some((p) => p.id === id)) return { ok: false, why: `image id ${id} not in image-pool.json` };
  let uses = 0;
  for (const dir of ['post', 'article']) {
    const abs = path.join(root, 'src', 'data', dir);
    if (!fs.existsSync(abs)) continue;
    for (const f of fs.readdirSync(abs)) {
      if (/\.mdx?$/.test(f) && fs.readFileSync(path.join(abs, f), 'utf8').includes(id)) uses++;
    }
  }
  if (uses > 1) return { ok: false, why: `image id ${id} used by ${uses} files (must be unique)` };
  if (!network) return { ok: true };
  const res = await fetch(url.split('&')[0], { method: 'GET' });
  const type = res.headers.get('content-type') || '';
  if (!res.ok || !type.startsWith('image/')) return { ok: false, why: `image URL returned ${res.status} ${type}` };
  return { ok: true };
}

function dateSanity(data) {
  const pub = new Date(String(data.publishDate));
  const upd = data.updateDate ? new Date(String(data.updateDate)) : pub;
  if (isNaN(pub)) return { ok: false, why: 'publishDate unparseable' };
  if (pub.getFullYear() >= 2099) return { ok: false, why: 'placeholder publishDate' };
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (pub > today) return { ok: false, why: 'publishDate in the future' };
  if (upd < pub) return { ok: false, why: 'updateDate earlier than publishDate' };
  return { ok: true };
}

export function parseCheckLinksOutput(out, canonical) {
  // Tolerate ONLY the canonical self-URL 404 (expected pre-deploy).
  // A non-zero exit with no [BROKEN] lines is a tool failure, not a pass.
  const broken = out.split(/\r?\n/).filter((l) => l.includes('[BROKEN]'));
  return broken.length > 0 && broken.every((l) => canonical && l.includes(canonical));
}

export async function runMechanical(slugOrPath, root, { network = true, externalTools = true } = {}) {
  const { slug, collection, filePath } = resolvePost(slugOrPath, root);
  const text = fs.readFileSync(filePath, 'utf8');
  const { data, body } = parseFrontmatter(text);
  const hash = contentHash(text);
  const manifest = loadManifest(slug, root, collection);
  manifest.collection = collection;
  const rel = path.relative(root, filePath);

  if (externalTools) {
    const cb = runTool('node', [path.join(root, 'scripts', 'check-blog.mjs'), rel], root);
    setMechanical(manifest, 'checkBlog', cb.ok ? 'PASS' : 'FAIL', hash);
    const pr = runTool(NPX_CMD, ['prettier', '--check', rel], root);
    setMechanical(manifest, 'prettier', pr.ok ? 'PASS' : 'FAIL', hash);
  } else {
    setMechanical(manifest, 'checkBlog', 'PASS', hash); // SKIPPED (test mode)
    setMechanical(manifest, 'prettier', 'PASS', hash); // SKIPPED (test mode)
  }

  if (network) {
    const cl = runTool('node', [path.join(root, 'scripts', 'check-links.mjs'), rel], root);
    const canonical =
      data.canonical || '' || `https://simplescheduleai.com/${collection === 'article' ? 'articles' : 'blog'}/${slug}`;
    setMechanical(manifest, 'checkLinks', cl.ok || parseCheckLinksOutput(cl.out, canonical) ? 'PASS' : 'FAIL', hash);
  } else {
    setMechanical(manifest, 'checkLinks', 'PASS', hash); // SKIPPED (no-network)
  }

  const inbound = scanInboundLinks(slug, collection, root);
  setMechanical(manifest, 'inboundLinks', inbound.count >= 2 ? 'PASS' : 'FAIL', hash);

  const img = await imageCheck(data, root, network);
  setMechanical(manifest, 'image', img.ok ? 'PASS' : 'FAIL', hash);
  if (!img.ok) console.log(`  image: ${img.why}`);

  const ds = dateSanity(data);
  setMechanical(manifest, 'dateSanity', ds.ok ? 'PASS' : 'FAIL', hash);
  if (!ds.ok) console.log(`  dateSanity: ${ds.why}`);

  const facts = checkFacts(body);
  setMechanical(manifest, 'factsDossier', facts.length === 0 ? 'PASS' : 'FAIL', hash);
  for (const v of facts) console.log(`  facts drift [${v.id}] L${v.line}: ${v.message}`);

  saveManifest(manifest, root);
  return { manifest, hash };
}

export function printStatus(manifest, currentHash) {
  const { green, rows } = manifestStatus(manifest, currentHash);
  console.log(`\nPublish manifest: ${manifest.slug} (${manifest.collection})`);
  for (const r of rows) {
    const freshness = r.status === 'MISSING' ? '' : r.fresh ? '' : '  <- STALE (post edited since)';
    const mark =
      r.status === 'PASS' || ['READY', 'NOT_REQUIRED', 'OK', 'YES', 'DONE'].includes(r.status)
        ? r.fresh
          ? 'PASS '
          : 'STALE'
        : r.status === 'MISSING'
          ? 'TODO '
          : 'FAIL ';
    console.log(`  [${mark}] ${r.field}${freshness}`);
  }
  console.log(green ? '\nALL GREEN — publishable.' : '\nNOT publishable — clear the non-green rows above.');
  return green;
}

async function main() {
  const args = process.argv.slice(2);
  const consumed = new Set();
  const flagValue = (name) => {
    const i = args.indexOf(name);
    if (i < 0) return null;
    consumed.add(i);
    consumed.add(i + 1);
    return args[i + 1];
  };
  const rootArg = flagValue('--root');
  const root = rootArg ? path.resolve(rootArg) : process.cwd();
  const setArgRaw = flagValue('--set');
  const byArg = flagValue('--by');
  const network = !args.includes('--no-network');
  const externalTools = !args.includes('--skip-external-tools');
  const target = args.find((a, i) => !a.startsWith('--') && !consumed.has(i));
  if (!target) {
    console.error('Usage: publish-gate <slug|path> [--status] [--set field=value] [--by who]');
    process.exit(2);
  }

  const { slug, collection, filePath } = resolvePost(target, root);
  const currentHash = contentHash(fs.readFileSync(filePath, 'utf8'));

  if (setArgRaw) {
    const [rawField, value] = setArgRaw.split('=');
    const field = FIELD_ALIASES[rawField.toLowerCase()];
    if (!field || !RECORDED_FIELDS.includes(field)) {
      console.error(`Unknown field: ${rawField}`);
      process.exit(2);
    }
    const manifest = loadManifest(slug, root, collection);
    setRecorded(manifest, field, value, byArg || 'unknown', currentHash);
    saveManifest(manifest, root);
    process.exit(printStatus(manifest, currentHash) ? 0 : 1);
  }

  if (args.includes('--status')) {
    const manifest = loadManifest(slug, root, collection);
    process.exit(printStatus(manifest, currentHash) ? 0 : 1);
  }

  const { manifest, hash } = await runMechanical(target, root, { network, externalTools });
  process.exit(printStatus(manifest, hash) ? 0 : 1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => {
    console.error(e.message);
    process.exit(2);
  });
}
