// SEO Desk server: a local web app on 127.0.0.1 only.
//
// Routing is a small table of {method, path, handler}. Later modules add routes by
// passing `routes` to createServer(). A handler gets a context
// {req, res, url, params, body, json, pullers} and either calls ctx.json(status, value)
// itself or returns a value, which is sent as a 200 JSON reply.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { PORT } from './lib/config.mjs';
import { routes as apiRoutes } from './lib/api.mjs';
import { ORDER, refreshAll, refreshProgress, sourceStatus, ensureFresh, startSchedule } from './lib/refresh.mjs';
import { plainError } from './lib/text.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const STATIC_DIR = path.join(HERE, 'static');
const MAX_BODY = 1024 * 1024;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

// ------------------------------------------------------------------ routing table

// '/api/page/:slug' becomes a matcher that fills params.slug. A RegExp is used as is.
function matcher(pattern) {
  if (pattern instanceof RegExp) return (p) => (pattern.test(p) ? {} : null);
  const names = [];
  const source = pattern
    .split('/')
    .map((part) => {
      if (!part.startsWith(':')) return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      names.push(part.slice(1));
      return '([^/]+)';
    })
    .join('/');
  const re = new RegExp(`^${source}$`);
  return (p) => {
    const m = re.exec(p);
    if (!m) return null;
    try {
      return Object.fromEntries(names.map((n, i) => [n, decodeURIComponent(m[i + 1])]));
    } catch {
      throw Object.assign(new Error('The address has a bad % escape.'), { status: 400 });
    }
  };
}

// The routes this module owns.
export function coreRoutes() {
  return [
    { method: 'GET', path: '/api/sources', handler: () => sourceStatus() },
    {
      method: 'GET',
      path: '/api/refresh',
      handler: () => refreshProgress(),
    },
    {
      method: 'POST',
      path: '/api/refresh',
      handler: async (ctx) => {
        const body = await ctx.body();
        const only = body?.only;
        if (only !== undefined && (!Array.isArray(only) || only.some((s) => !ORDER.includes(s)))) {
          return ctx.json(400, { error: `"only" must be a list of: ${ORDER.join(', ')}.` });
        }
        // Returns at once; the page polls GET /api/refresh for progress.
        refreshAll({ only, pullers: ctx.pullers }).catch(() => {});
        return ctx.json(200, { running: true });
      },
    },
  ];
}

// ------------------------------------------------------------------ static files

function sendFile(ctx, file) {
  const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
  const data = fs.readFileSync(file);
  ctx.res.writeHead(200, { 'Content-Type': type, 'Content-Length': data.length, 'Cache-Control': 'no-cache' });
  ctx.res.end(ctx.req.method === 'HEAD' ? undefined : data);
}

// Returns true when it served a file.
function serveStatic(ctx, staticDir) {
  if (ctx.req.method !== 'GET' && ctx.req.method !== 'HEAD') return false;
  let rel;
  try {
    rel = decodeURIComponent(ctx.url.pathname);
  } catch {
    return false;
  }
  if (rel.includes('\0')) return false;
  if (rel === '/') rel = '/index.html';
  // No dotfiles (and no '..' segments) are ever served.
  if (rel.split('/').some((seg) => seg.startsWith('.'))) return false;
  const root = path.resolve(staticDir);
  const file = path.resolve(root, `.${rel}`);
  if (file !== root && !file.startsWith(root + path.sep)) return false;
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return false;
  sendFile(ctx, file);
  return true;
}

// ------------------------------------------------------------------ server

// The raw request body as text (at most `max` bytes, MAX_BODY unless a route asks for more). A
// declared Content-Length above the cap is refused before any of the body is read.
function readRaw(req, max = MAX_BODY) {
  return new Promise((resolve, reject) => {
    if (Number(req.headers?.['content-length']) > max) {
      req.pause();
      reject(Object.assign(new Error('Request body too large.'), { status: 413 }));
      return;
    }
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      if (size > max) return;
      size += c.length;
      if (size > max) {
        // The caller sends the 413 reply first and closes the connection after it.
        req.pause();
        reject(Object.assign(new Error('Request body too large.'), { status: 413 }));
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

// A JSON body; an empty body is {}.
async function readBody(req) {
  const text = (await readRaw(req)).trim();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw Object.assign(new Error('Request body is not valid JSON.'), { status: 400 });
  }
}

// Returns an http.Server that is not listening yet.
//   pullers      injected pullers for tests (default: the real ones)
//   dataDir      sets SEO_DESK_DATA for this process (the store reads it on every call)
//   routes       extra route entries, checked before the api and core ones
//   staticDir    folder of static files
//   autoRefresh  false stops page loads from kicking off a background refresh
export function createServer({ pullers, dataDir, routes = [], staticDir = STATIC_DIR, autoRefresh = true } = {}) {
  if (dataDir) process.env.SEO_DESK_DATA = dataDir;
  const table = [...routes, ...apiRoutes, ...coreRoutes()].map((r) => ({ ...r, match: matcher(r.path) }));

  const handle = async (req, res) => {
    const port = server.address()?.port;
    const hosts = [`127.0.0.1:${port}`, `localhost:${port}`];
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // No other site may load the desk in a frame (a hidden frame could press its buttons).
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
    const json = (status, value) => {
      const text = JSON.stringify(value);
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(text);
    };

    // Rejects DNS rebinding (wrong Host) and cross-site posts (foreign Origin or fetch site).
    if (!hosts.includes(String(req.headers.host ?? ''))) return json(403, { error: 'Forbidden host.' });
    // Every method that changes something gets the same checks, not only POST.
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const origin = req.headers.origin;
      const site = req.headers['sec-fetch-site'];
      if (origin !== undefined && !hosts.map((h) => `http://${h}`).includes(origin)) {
        return json(403, { error: 'Forbidden origin.' });
      }
      if (site !== undefined && site !== 'same-origin' && site !== 'none') {
        return json(403, { error: 'Forbidden request source.' });
      }
    }

    try {
      let url;
      try {
        url = new URL(req.url, `http://${req.headers.host}`);
      } catch {
        return json(400, { error: 'Bad address.' });
      }
      // An api request (any method, GET too) from another website's page is refused, so a page on
      // another site cannot start a live pull with an image tag. The check is on the parsed path,
      // the same one routing uses, so a target such as //x/api/sources is caught too.
      if (url.pathname.startsWith('/api/')) {
        const fetchSite = req.headers['sec-fetch-site'];
        if (fetchSite !== undefined && fetchSite !== 'same-origin' && fetchSite !== 'none') {
          return json(403, { error: 'This address only answers requests made from the desk itself.' });
        }
      }
      const ctx = {
        req,
        res,
        url,
        params: {},
        pullers,
        json,
        body: () => readBody(req),
        rawBody: (maxBytes) => readRaw(req, maxBytes),
      };
      const method = req.method === 'HEAD' ? 'GET' : req.method;
      for (const r of table) {
        if (r.method !== method) continue;
        const params = r.match(url.pathname);
        if (!params) continue;
        ctx.params = params;
        const value = await r.handler(ctx);
        if (value !== undefined && !res.headersSent) json(200, value);
        return;
      }
      if (!url.pathname.startsWith('/api/') && serveStatic(ctx, staticDir)) {
        // A page load is the moment to refresh anything stale, in the background.
        if (autoRefresh && (url.pathname === '/' || url.pathname === '/index.html')) ensureFresh({ pullers });
        return;
      }
      json(404, { error: 'Not found.' });
    } catch (e) {
      if (res.headersSent) return res.end();
      if (e?.status === 413) {
        // Answer first, then drop the connection so the rest of the upload is not read.
        res.setHeader('Connection', 'close');
        res.once('finish', () => req.destroy());
      }
      json(e?.status || 500, {
        error: e?.status ? e.message : 'Something went wrong on the server.',
        ...(e?.status && e.extra && typeof e.extra === 'object' ? e.extra : {}),
      });
    }
  };

  // Last resort: whatever goes wrong inside one request, the server keeps running.
  const server = http.createServer((req, res) => {
    handle(req, res).catch(() => {
      try {
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end('{"error":"Something went wrong on the server."}');
        } else {
          res.end();
        }
      } catch {
        res.destroy();
      }
    });
  });
  return server;
}

// ------------------------------------------------------------------ command line

function openBrowser(url) {
  const [cmd, args] =
    process.platform === 'darwin'
      ? ['open', [url]]
      : process.platform === 'win32'
        ? ['cmd', ['/c', 'start', '', url]]
        : ['xdg-open', [url]];
  try {
    const child = spawn(cmd, args, { stdio: 'ignore', detached: true });
    child.on('error', () => {});
    child.unref();
  } catch {
    // The address is printed anyway.
  }
}

export function parseArgs(argv) {
  const flags = { open: true, schedule: true, port: PORT };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--no-open') flags.open = false;
    else if (argv[i] === '--no-schedule') flags.schedule = false;
    else if (argv[i] === '--port') flags.port = Number(argv[++i]);
  }
  if (!Number.isInteger(flags.port) || flags.port < 0 || flags.port > 65535) {
    throw new Error('--port needs a number from 0 to 65535.');
  }
  return flags;
}

// An error nothing caught: one plain line in the log, then exit with 1 so launchd (KeepAlive
// on a failed exit) starts a clean copy, instead of running on in an unknown state.
export function fatal(e, { log = console.error, exit = process.exit } = {}) {
  log(`The SEO Desk stopped on an unexpected error: ${plainError(e)} It starts again on its own.`);
  exit(1);
}

async function main() {
  let flags;
  try {
    flags = parseArgs(process.argv.slice(2));
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
  process.on('uncaughtException', (e) => fatal(e));
  process.on('unhandledRejection', (e) => fatal(e));
  const server = createServer();
  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      // Another copy is already serving. A clean exit, so launchd does not start this one again.
      console.log(`Port ${flags.port} is already in use, so the SEO Desk is already running. This copy stops here.`);
      process.exit(0);
    }
    console.error(`The server could not start: ${plainError(e)}`);
    process.exit(1);
  });
  server.listen(flags.port, '127.0.0.1', () => {
    const url = `http://127.0.0.1:${server.address().port}/`;
    console.log(`SEO Desk is running at ${url}`);
    if (flags.schedule) startSchedule();
    if (flags.open) openBrowser(url);
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
