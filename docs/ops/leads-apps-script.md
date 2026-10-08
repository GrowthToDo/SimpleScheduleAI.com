# Leads Apps Script: template gate + calculator breakdown

One Google Apps Script web app serves both work-email gates, so there is one
deployment and one URL:

- `kind: "template"` (or no `kind`): emails the nurse schedule template .xlsx.
  Form: `src/components/ui/forms/TemplateRequestForm.astro` (branch `template-gate`).
- `kind: "roi_breakdown"`: emails a one-page PDF of the visitor's numbers from the
  scheduling cost calculator. Form: `src/components/widgets/ROICalculatorWidget.svelte`.

**Live deployment (2026-10-08): "Leads v4", an interim deployment that executes as
pradeep.pandey99@gmail.com.** Leads v3 ran as simplescheduleai@gmail.com and stopped
working on 2026-10-08, when that Gmail account was converted into the Google Workspace
account pradeep@simplescheduleai.com. The converted account is an Editor on the project
but gets "You do not have permission" on Manage deployments, a Workspace-side setting
still to fix. Once fixed, redeploy as pradeep@simplescheduleai.com so lead emails come
from the company domain, and set `TEMPLATE_FILE_ID` back to that account's copy
(1zde-lJHq_V07sxszkL42Mv255hRvOesA). Replies go to support@simplescheduleai.com, which
is now a real Google Workspace mailbox (MX moved from Cloudflare Email Routing to Google
on 2026-10-08).
Web app URL:
`https://script.google.com/macros/s/AKfycbz4p0y635-FzHVZM_Euo-D7PfMaFyuRg6GYhuG-0bA9AB8sKevRBCQTuX8sRm2wzNsW/exec`
Both forms use it: the calculator (`ROICalculatorWidget.svelte`) and the template gate
(`TemplateRequestForm.astro`). In the live copy, `TEMPLATE_FILE_ID` points to the .xlsx in
pradeep.pandey99@gmail.com's Drive (1CgBPxdDcZYvlC9ARmC086d90pBwVSCuN), which must be the deploying account's own file (or shared with it).
The live copy holds the team-alert addresses in `NOTIFY_EMAILS`; this doc keeps
that list empty because the repo is public.

**This code supersedes the code block in `template-gate-apps-script.md`.** The setup
steps there still apply (Drive file, deployment). If the template script is already
deployed, replace its code with the code below and use Deploy > Manage deployments >
Edit > New version, so the URL stays the same.

Founder decisions: work addresses only (no Gmail, Yahoo or other personal accounts),
fields = email + hospital + role (template 2026-10-02; breakdown 2026-10-02).

## What the breakdown script does

1. Re-checks the email domain and required fields (a browser check can be bypassed).
2. **Recomputes every number from the inputs and rates**, with clamps, so nothing the
   browser sends as a "cost" is trusted. The formulas mirror the calculator exactly.
3. Builds a one-page summary, sends it as the email body and as a PDF attachment.
4. Logs the request to the `Calculator breakdowns` tab, one column per input, rate and cost, (not the old `Calculator Leads` tab: Sheets treats tab names that differ only in case as the same name, and the old tab has different columns): who, the hospital, the total and the
   inputs, so a follow-up call can start from their own numbers.
5. Sends at most one breakdown per address per 10 minutes (stops double-clicks and abuse).

Only claims already approved appear in the PDF: the `hours-returned` line (1 to 2
hours of review) and the product lines from the calculator page. The what-if is
labelled as the visitor's own assumption. No savings percentages.

## Code

```javascript
// ---- Settings ----
// Drive file ID of the template .xlsx. Empty = template requests are logged but not sent yet.
const TEMPLATE_FILE_ID = '';
const FROM_NAME = 'SimpleScheduleAI';
const REPLY_TO = 'support@simplescheduleai.com';
const CALL_LINK = 'https://cal.com/gautham-8bdvdx/30min';
const NSI_LINK = 'https://www.nsinursingsolutions.com/documents/library/nsi_national_health_care_retention_report.pdf';
// Team alert on every lead. Paste the NOTIFY_EMAILS line from your old calculator script here.
// (Kept out of this doc on purpose: the repo is public.)
const NOTIFY_EMAILS = [];
// Only needed if the script is NOT bound to a sheet: paste the sheet ID from its URL.
const SHEET_ID = '';

// Keep in step with the two forms.
const FREE_EMAIL_DOMAINS = [
  'gmail.com', 'googlemail.com', 'yahoo.com', 'ymail.com', 'rocketmail.com',
  'hotmail.com', 'outlook.com', 'live.com', 'msn.com', 'aol.com', 'icloud.com',
  'me.com', 'mac.com', 'proton.me', 'protonmail.com', 'pm.me', 'gmx.com', 'gmx.net',
  'mail.com', 'yandex.com', 'zoho.com', 'zohomail.com', 'tutanota.com', 'fastmail.com',
  'hey.com', 'comcast.net', 'att.net', 'sbcglobal.net', 'verizon.net', 'cox.net',
  'charter.net', 'bellsouth.net', 'earthlink.net', 'juno.com', 'rediffmail.com',
  'qq.com', '163.com',
];

// ---- Router ----
function doPost(e) {
  const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  const result = data.kind === 'roi_breakdown' ? handleBreakdown(data) : handleTemplate(data);
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function checkLead(data) {
  const email = String(data.email || '').trim().toLowerCase();
  const hospital = String(data.hospital || '').trim().slice(0, 200);
  const role = String(data.role || '').trim().slice(0, 100);
  const domain = email.split('@')[1] || '';
  let status = 'ok';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) status = 'rejected: invalid email';
  else if (FREE_EMAIL_DOMAINS.indexOf(domain) !== -1) status = 'rejected: personal email';
  else if (!hospital || !role) status = 'rejected: missing field';
  return { email, hospital, role, domain, status };
}

// ---- Template gate (unchanged behaviour) ----
function handleTemplate(data) {
  const lead = checkLead(data);
  const sheet = getSheet('Template leads', ['Timestamp', 'Email', 'Hospital', 'Role', 'Domain', 'Page', 'Status']);
  let status = lead.status === 'ok' ? 'sent' : lead.status;
  if (status === 'sent' && !TEMPLATE_FILE_ID) status = 'error: template file not set yet';
  if (status === 'sent' && sentRecently(sheet, lead.email, 24 * 60, 6)) status = 'skipped: already sent in last 24h';
  if (status === 'sent') {
    try {
      sendTemplate(lead.email);
    } catch (err) {
      status = 'error: ' + err;
    }
  }
  sheet.appendRow([new Date(), lead.email, lead.hospital, lead.role, lead.domain, data.page || '', status]);
  if (status === 'sent') notifyTeam('Template request', lead, '');
  return { status: status };
}

function sendTemplate(email) {
  const file = DriveApp.getFileById(TEMPLATE_FILE_ID).getBlob().setName('SimpleScheduleAI-Nurse-Schedule-Template.xlsx');
  const body = [
    'Hello,',
    '',
    'Here is the nurse schedule template you requested. It is attached as an Excel file.',
    '',
    'Start with the Staff, Units and Rules tabs, then build a week on the Schedule tab.',
    'The page has the full instructions: https://simplescheduleai.com/resources/nurse-schedule-template',
    '',
    'Questions about the template, or about scheduling at a small hospital? Reply to this email.',
    '',
    'SimpleScheduleAI',
  ].join('\n');
  MailApp.sendEmail({ to: email, subject: 'Your nurse schedule template (Excel)', body: body, name: FROM_NAME, replyTo: REPLY_TO, attachments: [file] });
}

// ---- Calculator breakdown ----
const BREAKDOWN_HEADER = [
  'Timestamp', 'Email', 'Hospital', 'Role', 'Domain', 'Status', 'Total per year',
  'Manager hrs/week', 'Overtime hrs/week', 'Agency shifts/month', 'Nurse exits/year',
  'What-if: agency shifts covered', 'What-if: overtime hrs avoided',
  'Manager $/hr', 'Overtime premium $/hr', 'Agency premium $/hr', 'Hours per agency shift', 'RN replacement cost',
  'Manager cost/yr', 'Overtime cost/yr', 'Agency cost/yr', 'Turnover cost/yr',
  'Manager time back (low)', 'Manager time back (high)', 'What-if $/yr', 'Page',
];
function handleBreakdown(data) {
  const lead = checkLead(data);
  const sheet = getSheet('Calculator breakdowns', BREAKDOWN_HEADER);
  const c = computeBreakdown(data.inputs || {}, data.rates || {});
  let status = lead.status === 'ok' ? 'sent' : lead.status;
  if (status === 'sent' && sentRecently(sheet, lead.email, 10, 5)) status = 'skipped: already sent in last 10 min';
  if (status === 'sent') {
    try {
      sendBreakdown(lead, c);
    } catch (err) {
      status = 'error: ' + err;
    }
  }
  const i = c.inputs, r = c.rates;
  // One column per value the visitor entered, so leads can be sorted and qualified later.
  sheet.appendRow([
    new Date(), lead.email, lead.hospital, lead.role, lead.domain, status, c.total,
    i.mgmtHours, i.otHours, i.agencyShifts, i.rnExits, i.coverShifts, i.avoidOt,
    r.mgrRate, r.otPremium, r.agencyPremium, r.agencyShiftHours, r.replaceCost,
    c.mgmt, c.ot, c.agency, c.turnover, c.backLow, c.backHigh, c.whatIf, data.page || '',
  ]);
  if (status === 'sent') notifyTeam('Calculator breakdown', lead, 'Total: $' + c.total.toLocaleString('en-US') + ' a year');
  return { status: status };
}

// Mirrors ROICalculatorWidget.svelte. Every value is clamped to the calculator's own ranges.
function computeBreakdown(inputs, rates) {
  const num = (v, lo, hi, dflt) => {
    const x = Number(v);
    return isFinite(x) ? Math.min(hi, Math.max(lo, x)) : dflt;
  };
  const i = {
    mgmtHours: num(inputs.mgmtHours, 2, 20, 10),
    otHours: num(inputs.otHours, 0, 120, 48),
    agencyShifts: num(inputs.agencyShifts, 0, 20, 3),
    rnExits: num(inputs.rnExits, 0, 6, 2),
  };
  i.coverShifts = num(inputs.coverShifts, 0, i.agencyShifts, 0);
  i.avoidOt = num(inputs.avoidOt, 0, i.otHours, 0);
  const r = {
    mgrRate: num(rates.mgrRate, 0, 500, 50),
    otPremium: num(rates.otPremium, 0, 200, 23.63),
    agencyPremium: num(rates.agencyPremium, 0, 500, 31.77),
    agencyShiftHours: num(rates.agencyShiftHours, 0, 24, 12),
    replaceCost: num(rates.replaceCost, 0, 500000, 60090),
  };
  const mgmt = Math.round(i.mgmtHours * 52 * r.mgrRate);
  const ot = Math.round(i.otHours * 52 * r.otPremium);
  const agency = Math.round(i.agencyShifts * r.agencyShiftHours * r.agencyPremium * 12);
  const turnover = Math.round(i.rnExits * r.replaceCost);
  const backLow = Math.max(0, Math.round((i.mgmtHours - 2) * 52 * r.mgrRate));
  const backHigh = Math.max(0, Math.round((i.mgmtHours - 1) * 52 * r.mgrRate));
  const whatIf = Math.round(i.coverShifts * r.agencyShiftHours * r.agencyPremium * 12 + i.avoidOt * 52 * r.otPremium);
  return { inputs: i, rates: r, mgmt: mgmt, ot: ot, agency: agency, turnover: turnover, total: mgmt + ot + agency + turnover, backLow: backLow, backHigh: backHigh, whatIf: whatIf };
}

function sendBreakdown(lead, c) {
  const html = breakdownHtml(lead, c);
  const pdf = Utilities.newBlob(html, 'text/html', 'breakdown.html').getAs('application/pdf').setName('Scheduling-cost-breakdown.pdf');
  MailApp.sendEmail({
    to: lead.email,
    subject: 'Your scheduling cost breakdown' + (lead.hospital ? ' for ' + lead.hospital : ''),
    htmlBody: html,
    body: 'Your one-page scheduling cost breakdown is attached as a PDF. Questions? Reply to this email.',
    name: FROM_NAME,
    replyTo: REPLY_TO,
    attachments: [pdf],
  });
}

function breakdownHtml(lead, c) {
  const $ = (v) => '$' + Math.round(v).toLocaleString('en-US');
  const esc = (s) => String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const today = Utilities.formatDate(new Date(), 'America/Chicago', 'MMMM d, yyyy');
  const row = (label, detail, value) =>
    '<tr><td style="padding:8px 0;border-bottom:1px solid #e4ddd1"><b>' + label + '</b><br><span style="color:#5d6673;font-size:12px">' + detail + '</span></td>' +
    '<td style="padding:8px 0;border-bottom:1px solid #e4ddd1;text-align:right;white-space:nowrap"><b>' + $(value) + '/yr</b></td></tr>';
  const back = c.backHigh > 0
    ? (c.backLow > 0 ? 'About ' + $(c.backLow) + ' to ' + $(c.backHigh) : 'Up to ' + $(c.backHigh)) + ' a year of manager time back, using your numbers.'
    : '';
  const i = c.inputs, r = c.rates;
  return [
    '<div style="font-family:Arial,Helvetica,sans-serif;color:#1a2332;max-width:640px;margin:0 auto;font-size:14px;line-height:1.5">',
    '<p style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#2d5a4a;margin:0"><b>SimpleScheduleAI</b> · Scheduling cost breakdown</p>',
    '<h1 style="font-size:22px;margin:6px 0 2px">' + esc(lead.hospital) + '</h1>',
    '<p style="color:#5d6673;margin:0 0 14px">Prepared ' + today + ' from the numbers entered at simplescheduleai.com/roi</p>',
    '<p style="margin:0;color:#5d6673">What these four cost your hospital each year</p>',
    '<p style="font-size:32px;margin:0 0 8px"><b>' + $(c.total) + '</b></p>',
    '<table style="width:100%;border-collapse:collapse">',
    row('Nurse manager time on scheduling', i.mgmtHours + ' hrs a week × ' + $(r.mgrRate) + '/hr', c.mgmt),
    row('Overtime premium', i.otHours + ' hrs a week × ' + $(r.otPremium) + '/hr premium', c.ot),
    row('Agency premium over staff pay', i.agencyShifts + ' shifts a month × ' + r.agencyShiftHours + ' hrs × ' + $(r.agencyPremium) + '/hr', c.agency),
    row('Replacing nurses who left', i.rnExits + ' nurses × ' + $(r.replaceCost), c.turnover),
    '</table>',
    '<p style="color:#5d6673;font-size:12px">Not all of this comes from scheduling. It is what these four costs add up to with your numbers. Default rates come from the <a href="' + NSI_LINK + '">2026 NSI National Health Care Retention &amp; RN Staffing Report</a>; the manager rate is our estimate. Any rate you changed is shown above as you entered it.</p>',
    '<h2 style="font-size:16px;margin:18px 0 6px">Where SimpleScheduleAI helps</h2>',
    '<p style="margin:0 0 6px"><b>Manager time.</b> Most of those hours go back to the floor. What\'s left is 1 to 2 hours of review.' + (back ? ' <b style="color:#2d5a4a">' + back + '</b>' : '') + '</p>',
    '<p style="margin:0 0 6px"><b>Overtime.</b> Overtime shows up on the draft, before anyone works it. When someone calls out, nurses who can cover without going into overtime are ranked first.</p>',
    '<p style="margin:0 0 6px"><b>Agency.</b> When someone calls out, you get a ranked list in under two minutes. Your own nurses come first. Agency comes last.</p>',
    '<p style="margin:0 0 6px"><b>Turnover.</b> Weekends and holidays are shared evenly, so the same few nurses don\'t carry them.</p>',
    '<h2 style="font-size:16px;margin:18px 0 6px">Your what-if</h2>',
    '<p style="margin:0">Your own assumption: ' + i.coverShifts + ' agency shifts a month covered by your own nurses, and ' + i.avoidOt + ' overtime hours a week avoided. That comes to <b>' + $(c.whatIf) + ' a year</b>' +
      (c.backHigh > 0 ? ', or <b>' + (c.backLow !== c.backHigh ? $(c.whatIf + c.backLow) + ' to ' + $(c.whatIf + c.backHigh) : $(c.whatIf + c.backHigh)) + ' a year</b> with the manager time back' : '') + '.</p>',
    '<p style="color:#5d6673;font-size:12px;margin:4px 0 0">We don\'t quote savings percentages. These figures are yours.</p>',
    '<div style="margin-top:20px;padding:12px 16px;background:#e3ece7;border-radius:8px">Want to walk through these numbers for your hospital? <a href="' + CALL_LINK + '">Book a 30-minute call with our team</a>, or reply to this email.</div>',
    '</div>',
  ].join('');
}

// ---- Shared ----
function notifyTeam(kind, lead, extra) {
  if (!NOTIFY_EMAILS.length) return;
  try {
    MailApp.sendEmail({
      to: NOTIFY_EMAILS.join(','),
      subject: 'New lead: ' + kind + ' (' + lead.hospital + ')',
      body: [kind, 'Email: ' + lead.email, 'Hospital: ' + lead.hospital, 'Role: ' + lead.role, extra].filter(Boolean).join('\n'),
      name: FROM_NAME,
    });
  } catch (err) {
    // A failed alert must never block the visitor's email.
  }
}

function sentRecently(sheet, email, minutes, statusCol) {
  const rows = sheet.getDataRange().getValues();
  const cutoff = Date.now() - minutes * 60 * 1000;
  for (let k = rows.length - 1; k >= 1; k--) {
    const when = rows[k][0];
    if (when instanceof Date && when.getTime() < cutoff) break;
    if (rows[k][1] === email && rows[k][statusCol] === 'sent') return true;
  }
  return false;
}

function getSheet(name, header) {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.appendRow(header); // new or hand-made empty tab
  return sheet;
}
```

If the script is NOT bound to a sheet (a standalone project), replace
`SpreadsheetApp.getActiveSpreadsheet()` with `SpreadsheetApp.openById('<SHEET_ID>')`.

Permissions on first deploy: Sheets, Drive (template file), Gmail send. The PDF is
made with Apps Script's built-in HTML-to-PDF conversion; no extra service needed.

## Test after go-live

1. On `/roi`, request a breakdown with a Gmail address: the page refuses it.
2. Request one with a work address you own: a row appears in `Calculator breakdowns` with
   status `sent`, and the email arrives with the PDF attached. Check that the PDF
   total matches the page.
3. Request again within 10 minutes: the row says `skipped`, and no second email.
4. Repeat steps 1 and 2 for the template on `/resources/nurse-schedule-template`.
