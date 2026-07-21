// Renders the SimpleScheduleAI wordmark + Route mark as a PNG for embedding in
// the downloadable Excel template (Instructions / Beyond-this-template mastheads).
import { chromium } from 'playwright';
import fs from 'node:fs';

const OUT = process.argv[2] || 'xlsx-logo.png';

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&display=swap');
*{margin:0;padding:0}body{width:420px;height:74px;background:#fff;display:flex;align-items:center;gap:12px;padding-left:4px}
.wm{font-family:'Fraunces',Georgia,serif;font-weight:600;font-size:34px;color:#1A2332;letter-spacing:-0.5px}
.wm .d{color:#7BAF9B}
.tag{position:absolute;left:64px;top:52px;font-family:Inter,Arial,sans-serif;font-size:10.5px;letter-spacing:2.2px;color:#2D5A4A;text-transform:uppercase}
</style></head><body>
<svg width="52" height="52" viewBox="0 0 96 96"><circle cx="83" cy="23" r="7" fill="#7BAF9B"/>
<path d="M 69 23 H 38 a 15 15 0 0 0 0 30 h 20 a 15 15 0 0 1 0 30 H 15" fill="none" stroke="#1A2332" stroke-width="14" stroke-linecap="round"/></svg>
<span class="wm">SimpleScheduleAI<span class="d">.</span></span>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 420, height: 74 }, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);
const png = await page.screenshot();
await browser.close();
fs.writeFileSync(OUT, png);
console.log('wrote', OUT);
