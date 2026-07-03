import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

/** Minimal YAML-subset frontmatter parser (key: value lines; quoted strings; booleans; > folded excerpt kept raw). */
export function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: text };
  const data = {};
  let pendingKey = null;
  for (const rawLine of m[1].split(/\r?\n/)) {
    if (pendingKey !== null) {
      if (/^\s+\S/.test(rawLine)) {
        data[pendingKey] += (data[pendingKey] ? ' ' : '') + rawLine.trim();
        continue;
      }
      pendingKey = null;
    }
    const kv = rawLine.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    let val = kv[2].trim();
    if (val === '>' || val === '|') {
      data[key] = '';
      pendingKey = key;
      continue;
    }
    if (/^'.*'$/.test(val) || /^".*"$/.test(val)) val = val.slice(1, -1);
    if (val === 'true') val = true;
    else if (val === 'false') val = false;
    data[key] = val;
  }
  return { data, body: text.slice(m[0].length) };
}

export function contentHash(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

const COLLECTIONS = [
  { collection: 'post', dir: ['src', 'data', 'post'] },
  { collection: 'article', dir: ['src', 'data', 'article'] },
];

export function resolvePost(slugOrPath, root = process.cwd()) {
  const norm = slugOrPath.replace(/\\/g, '/');
  for (const { collection, dir } of COLLECTIONS) {
    const rel = dir.join('/');
    if (norm.includes(`${rel}/`)) {
      const filePath = path.resolve(root, norm);
      if (!fs.existsSync(filePath)) throw new Error(`Not found: ${slugOrPath}`);
      return { slug: path.basename(filePath).replace(/\.mdx?$/, ''), collection, filePath };
    }
  }
  for (const { collection, dir } of COLLECTIONS) {
    for (const ext of ['.md', '.mdx']) {
      const filePath = path.join(root, ...dir, slugOrPath + ext);
      if (fs.existsSync(filePath)) return { slug: slugOrPath, collection, filePath };
    }
  }
  throw new Error(`Not found in any collection: ${slugOrPath}`);
}

export function listPosts(root = process.cwd()) {
  const out = [];
  for (const { collection, dir } of COLLECTIONS) {
    const abs = path.join(root, ...dir);
    if (!fs.existsSync(abs)) continue;
    for (const f of fs.readdirSync(abs)) {
      if (!/\.mdx?$/.test(f)) continue;
      const filePath = path.join(abs, f);
      const { data, body } = parseFrontmatter(fs.readFileSync(filePath, 'utf8'));
      out.push({ filePath, slug: f.replace(/\.mdx?$/, ''), collection, data, body });
    }
  }
  return out;
}

/** Inbound links to /blog/<slug> or /articles/<slug> from LIVE sibling posts (draft !== true). */
export function scanInboundLinks(slug, collection, root = process.cwd()) {
  const urlPath = collection === 'article' ? `/articles/${slug}` : `/blog/${slug}`;
  const needle = new RegExp(`\\]\\(${urlPath.replace(/\//g, '\\/')}\\)`);
  const sources = [];
  for (const p of listPosts(root)) {
    if (p.slug === slug && p.collection === collection) continue;
    if (p.data.draft === true) continue;
    if (needle.test(p.body)) sources.push(path.relative(root, p.filePath));
  }
  return { count: sources.length, sources };
}
