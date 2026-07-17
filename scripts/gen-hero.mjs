// Branded blog-hero generator. Renders a 1200x630 on-brand hero to webp.
// Usage: node scripts/gen-hero.mjs "<eyebrow>" "<title>" <outPathWebp>
import { chromium } from 'playwright';
import sharp from 'sharp';

const [, , eyebrow, title, outPath] = process.argv;
const OUT =
  outPath ||
  'C:/Users/Admin/AppData/Local/Temp/claude/d--Pradeep-Personal-Projects-SimpleScheduleAI-com--New/1bafb271-932f-454c-9c55-9283d5ab75d0/scratchpad/hero-sample.webp';

const html = `<!doctype html><html><head><meta charset="utf-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,900&family=Inter:wght@400;500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1200px;height:630px}
.hero{position:relative;width:1200px;height:630px;background:#FAF7F2;overflow:hidden;
  font-family:'Inter',system-ui,sans-serif;color:#1A2332}
/* faint route motif, right side */
.motif{position:absolute;right:-70px;top:-40px;width:720px;height:720px;opacity:.07}
.motif2{position:absolute;right:70px;bottom:56px;display:flex;gap:14px;align-items:center;opacity:.9}
.dot{width:13px;height:13px;border-radius:50%;background:#7BAF9B}
.dot.ring{background:transparent;border:3px solid #2D5A4A;width:15px;height:15px}
.grid{position:absolute;inset:0;background-image:linear-gradient(#1A233208 1px,transparent 1px),linear-gradient(90deg,#1A233208 1px,transparent 1px);background-size:48px 48px}
.pad{position:absolute;inset:0;padding:64px 72px;display:flex;flex-direction:column;justify-content:space-between}
.top{display:flex;align-items:center;gap:12px}
.wm{font-family:'Fraunces',Georgia,serif;font-weight:600;font-size:30px;letter-spacing:-.5px;color:#1A2332}
.wm .d{color:#2D5A4A}
.eyebrow{display:inline-block;align-self:flex-start;margin-bottom:22px;padding:8px 16px;border-radius:999px;
  background:rgba(45,90,74,.09);color:#2D5A4A;font-weight:600;font-size:15px;letter-spacing:.14em;text-transform:uppercase}
.title{font-family:'Fraunces',Georgia,serif;font-weight:600;color:#1A2332;font-size:64px;line-height:1.06;letter-spacing:-1px;max-width:820px}
.rule{width:96px;height:6px;border-radius:6px;background:#2D5A4A;margin-top:28px}
.mid{display:flex;flex-direction:column;justify-content:center;flex:1;padding-top:8px}
.foot{display:flex;align-items:center;justify-content:space-between}
.url{color:rgba(26,35,50,.6);font-weight:500;font-size:20px}
</style></head>
<body>
<div class="hero">
  <div class="grid"></div>
  <svg class="motif" viewBox="0 0 96 96"><circle cx="83" cy="23" r="7" fill="#2D5A4A"/>
    <path d="M 69 23 H 38 a 15 15 0 0 0 0 30 h 20 a 15 15 0 0 1 0 30 H 15" fill="none" stroke="#2D5A4A" stroke-width="14" stroke-linecap="round"/></svg>
  <div class="pad">
    <div class="top">
      <svg width="34" height="34" viewBox="0 0 96 96"><circle cx="83" cy="23" r="7" fill="#7BAF9B"/>
        <path d="M 69 23 H 38 a 15 15 0 0 0 0 30 h 20 a 15 15 0 0 1 0 30 H 15" fill="none" stroke="#1A2332" stroke-width="14" stroke-linecap="round"/></svg>
      <span class="wm">SimpleScheduleAI<span class="d">.</span></span>
    </div>
    <div class="mid">
      <span class="eyebrow">${eyebrow || 'Healthcare Operations'}</span>
      <h1 class="title">${title || 'Untitled'}</h1>
      <div class="rule"></div>
    </div>
    <div class="foot">
      <span class="url">simplescheduleai.com</span>
      <span class="motif2"><span class="dot ring"></span><span class="dot"></span><span class="dot"></span><span class="dot" style="background:#2D5A4A"></span></span>
    </div>
  </div>
</div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(600);
const png = await page.screenshot({ clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();
await sharp(png).resize(1200, 630).webp({ quality: 88 }).toFile(OUT);
console.log('wrote', OUT);
