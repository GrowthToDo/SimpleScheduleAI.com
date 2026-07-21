// Renders a faithful visual of the template's Schedule tab (real values from the
// tested workbook: Med-Surg week 2025-11-03, required 3/2 RN day/night, Garcia
// OVER+CHECK row, Miller SHORT row) to a webp for the landing page.
import { chromium } from 'playwright';
import sharp from 'sharp';

const OUT = process.argv[2] || 'grid-visual.webp';

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Inter,system-ui,sans-serif;background:#FAF7F2;width:1400px;padding:28px}
table{border-collapse:collapse;font-size:13px;background:#fff}
td,th{border:1px solid #C8D2CE;padding:6px 9px;text-align:center;white-space:nowrap}
th{background:#2D5A4A;color:#fff;font-weight:600}
.lbl{text-align:left;font-weight:600;color:#1A2332;background:#fff}
.req{background:#EEF2F0;font-weight:600}
.date{background:#EEF2F0;font-weight:700;color:#1A2332}
.hol{color:#B00000;font-weight:700;font-style:italic}
.dayn{font-style:italic;color:#777;font-size:11px}
.day{background:#FFF3D6}
.nite{background:#DDE3F0}
.off{background:#EFEFEC;color:#888}
.flag{background:#F8D7DA;color:#B00000;font-weight:700}
.name{text-align:left}
.sel{background:#FFF7E6;font-weight:600}
.cap{margin:0 0 14px;color:#1A2332;font-weight:700;font-size:16px}
.gapbad{background:#F8D7DA;font-weight:700}
.gapok{font-weight:600}
</style></head><body>
<p class="cap">Schedule tab: pick the unit, assign shifts from dropdowns, and the checks light up</p>
<table>
<tr><td class="lbl">Select Unit:</td><td class="sel">Med-Surg</td><td class="lbl" style="border-left:none"></td>
<th class="date">Mon 11-03</th><th class="date">Tue 11-04</th><th class="date">Wed 11-05</th><th class="date">Thu 11-06</th><th class="date">Fri 11-07</th><th class="date">Sat 11-08</th><th class="date">Sun 11-09</th>
<td style="border:none;background:#FAF7F2" colspan="6"></td></tr>
<tr><td class="lbl" colspan="3"></td>
<td class="dayn">Mon</td><td class="dayn">Tue</td><td class="dayn">Wed</td><td class="dayn hol">HOLIDAY</td><td class="dayn">Fri</td><td class="dayn">Sat</td><td class="dayn">Sun</td>
<td style="border:none;background:#FAF7F2" colspan="6"></td></tr>
<tr><td class="lbl" colspan="3">RNs Required - Day</td><td class="req">3</td><td class="req">2</td><td class="req">3</td><td class="req">3</td><td class="req">3</td><td class="req">3</td><td class="req">4</td><td style="border:none;background:#FAF7F2" colspan="6"></td></tr>
<tr><td class="lbl" colspan="3">RNs Required - Night</td><td class="req">2</td><td class="req">2</td><td class="req">2</td><td class="req">2</td><td class="req">2</td><td class="req">2</td><td class="req">2</td><td style="border:none;background:#FAF7F2" colspan="6"></td></tr>
<tr><th>Nurse</th><th>Role</th><th style="min-width:8px"></th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th><th>Sun</th><th>Hours</th><th>OT?</th><th>Consec?</th><th>Min Rest</th><th>Rest?</th><th>Leave?</th></tr>
<tr><td class="name">Smith, John</td><td>RN</td><td></td><td class="off">PTO</td><td class="off">PTO</td><td class="day">D12</td><td class="off">WO</td><td class="day">D12</td><td class="off">WO</td><td class="nite">N12</td><td>36</td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td class="name">Johnson, Emily</td><td>RN</td><td></td><td class="day">D12</td><td class="off">WO</td><td class="off">SICK</td><td class="off">WO</td><td class="nite">N12</td><td class="off">WO</td><td class="nite">N12</td><td>36</td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td class="name">Jones, David</td><td>RN</td><td></td><td class="day">D12</td><td class="day">D12</td><td class="day">D12</td><td class="day">D12</td><td class="off">WO</td><td class="off">WO</td><td class="off">WO</td><td>48</td><td class="flag">OVER</td><td></td><td>12</td><td></td><td></td></tr>
<tr><td class="name">Garcia, Sarah</td><td>RN</td><td></td><td class="day">D8</td><td class="day">D8</td><td class="day">D8</td><td class="day">D8</td><td class="day">D8</td><td class="day">D8</td><td class="off">WO</td><td>48</td><td class="flag">OVER</td><td class="flag">OVER</td><td>16</td><td></td><td class="flag">CHECK</td></tr>
<tr><td class="name">Miller, Chris</td><td>RN</td><td></td><td class="nite">N12</td><td class="day">D12</td><td class="off">WO</td><td class="off">WO</td><td class="nite">N12</td><td class="off">WO</td><td class="off">WO</td><td>36</td><td></td><td></td><td>0</td><td class="flag">SHORT</td><td></td></tr>
<tr><td class="lbl" colspan="3">Coverage gap - Day (RN, + = short)</td><td class="gapok">0</td><td class="gapbad">1</td><td class="gapok">0</td><td class="gapok">0</td><td class="gapok">0</td><td class="gapok">0</td><td class="gapbad">2</td><td style="border:none;background:#FAF7F2" colspan="6"></td></tr>
</table>
<p style="margin-top:12px;color:#777;font-size:12px;font-style:italic">Shown: a slice of the sample week that ships inside the template. Gold = day shift, slate = night, grey = off. Red flags are computed live from your rules.</p>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 620 }, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);
const el = await page.locator('body');
const png = await page.screenshot({ fullPage: true });
await browser.close();
await sharp(png).trim({ threshold: 8 }).webp({ quality: 90 }).toFile(OUT);
console.log('wrote', OUT);
