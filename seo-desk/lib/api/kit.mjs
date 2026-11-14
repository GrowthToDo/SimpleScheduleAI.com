// Small helpers shared by the API index and by every extension route file in lib/api/ext/.

export const bad = (message) => Object.assign(new Error(message), { status: 400 });

export const get = (path, handler) => ({ method: 'GET', path, handler });
export const post = (path, handler) => ({ method: 'POST', path, handler });
export const put = (path, handler) => ({ method: 'PUT', path, handler });
export const del = (path, handler) => ({ method: 'DELETE', path, handler });

// One query-string value, or '' when it is absent.
export const q = (ctx, name) => ctx.url.searchParams.get(name) ?? '';

// The JSON body of a POST or PUT. It must be an object; null, a list, a string or a number is a 400.
export async function bodyOf(ctx) {
  const b = await ctx.body();
  if (b === null || typeof b !== 'object' || Array.isArray(b)) throw bad('The request body must be a JSON object.');
  return b;
}

// Send a file download (CSV and the like).
export function sendText(ctx, type, text, filename) {
  const data = Buffer.from(text, 'utf8');
  ctx.res.writeHead(200, {
    'Content-Type': type,
    'Content-Length': data.length,
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Cache-Control': 'no-store',
  });
  ctx.res.end(data);
}
