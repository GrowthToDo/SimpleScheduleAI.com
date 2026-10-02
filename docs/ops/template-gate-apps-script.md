# Nurse schedule template gate: Google Apps Script

The `/resources/nurse-schedule-template` page asks for a work email, hospital and
role, then this script emails the .xlsx as an attachment. The file lives in Google
Drive, not on the website, so the only way to get it is through the form.

Founder decision 2026-10-02: emailed link, work addresses only (no Gmail, Yahoo or
other personal accounts), fields = email + hospital + role.

The form component is `src/components/ui/forms/TemplateRequestForm.astro`. It checks
the email domain in the browser; this script checks it again, because a browser check
can be bypassed. Keep the two blocklists in step.

## Setup (one time, about 10 minutes)

1. **Put the file in Drive.** Upload `public/downloads/SimpleScheduleAI-Nurse-Schedule-Template.xlsx`
   to Google Drive in the same Google account that owns the contact-form sheet. Leave
   its sharing **restricted** (the script attaches it; nobody needs a link). Copy the
   file ID from its URL: `https://drive.google.com/file/d/<FILE_ID>/view`.
2. **Create the script.** Open the Google Sheet that receives the contact form, then
   Extensions > Apps Script > New project (or add a new file to the existing project:
   the contact form's `doPost` must keep working, so if you add it to the SAME project,
   tell Claude, because two `doPost` functions cannot live in one project). The
   simplest path: a **separate** Apps Script project bound to the same sheet.
3. Paste the code below. Set `TEMPLATE_FILE_ID` to the ID from step 1.
4. **Deploy.** Deploy > New deployment > type **Web app** > Execute as **Me** > Who has
   access **Anyone**. Approve the permissions (Sheets, Drive, Gmail send).
5. **Send Claude the Web app URL** (ends in `/exec`). Claude wires it into the form,
   removes the public file from the site, redirects the old download URL to the page,
   and ships.
6. **Test** with a work address you own and with a Gmail address (must be refused on
   the page). A row appears in the `Template leads` tab for the work address.

Sending limit: a free Google account can send about 100 emails a day through Apps
Script; Google Workspace about 1,500. At today's volume (37 downloads in 90 days) that
is far beyond need.

## Code

```javascript
const TEMPLATE_FILE_ID = 'PASTE_DRIVE_FILE_ID_HERE';
const SHEET_NAME = 'Template leads';
const FROM_NAME = 'SimpleScheduleAI';
const REPLY_TO = 'support@simplescheduleai.com';

const FREE_EMAIL_DOMAINS = [
  'gmail.com', 'googlemail.com', 'yahoo.com', 'ymail.com', 'rocketmail.com',
  'hotmail.com', 'outlook.com', 'live.com', 'msn.com', 'aol.com', 'icloud.com',
  'me.com', 'mac.com', 'proton.me', 'protonmail.com', 'pm.me', 'gmx.com', 'gmx.net',
  'mail.com', 'yandex.com', 'zoho.com', 'zohomail.com', 'tutanota.com', 'fastmail.com',
  'hey.com', 'comcast.net', 'att.net', 'sbcglobal.net', 'verizon.net', 'cox.net',
  'charter.net', 'bellsouth.net', 'earthlink.net', 'juno.com', 'rediffmail.com',
  'qq.com', '163.com',
];

function doPost(e) {
  const data = JSON.parse(e.postData.contents || '{}');
  const email = String(data.email || '').trim().toLowerCase();
  const hospital = String(data.hospital || '').trim().slice(0, 200);
  const role = String(data.role || '').trim().slice(0, 100);
  const domain = email.split('@')[1] || '';
  const sheet = getSheet();

  let status = 'sent';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) status = 'rejected: invalid email';
  else if (FREE_EMAIL_DOMAINS.indexOf(domain) !== -1) status = 'rejected: personal email';
  else if (!hospital || !role) status = 'rejected: missing field';
  else if (sentInLastDay(sheet, email)) status = 'skipped: already sent in last 24h';

  if (status === 'sent') {
    try {
      sendTemplate(email);
    } catch (err) {
      status = 'error: ' + err;
    }
  }

  sheet.appendRow([new Date(), email, hospital, role, domain, data.page || '', status]);
  return ContentService.createTextOutput(JSON.stringify({ status: status }))
    .setMimeType(ContentService.MimeType.JSON);
}

function sendTemplate(email) {
  const file = DriveApp.getFileById(TEMPLATE_FILE_ID).getBlob()
    .setName('SimpleScheduleAI-Nurse-Schedule-Template.xlsx');
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
  MailApp.sendEmail({
    to: email,
    subject: 'Your nurse schedule template (Excel)',
    body: body,
    name: FROM_NAME,
    replyTo: REPLY_TO,
    attachments: [file],
  });
}

function sentInLastDay(sheet, email) {
  const rows = sheet.getDataRange().getValues();
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (let i = rows.length - 1; i >= 1; i--) {
    const when = rows[i][0];
    if (when instanceof Date && when.getTime() < cutoff) break;
    if (rows[i][1] === email && rows[i][6] === 'sent') return true;
  }
  return false;
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Timestamp', 'Email', 'Hospital', 'Role', 'Domain', 'Page', 'Status']);
  }
  return sheet;
}
```

If the script is NOT bound to a sheet (a standalone project), replace
`SpreadsheetApp.getActiveSpreadsheet()` with `SpreadsheetApp.openById('<SHEET_ID>')`.

## Changing the template file later

Upload the new version to Drive with **Manage versions > Upload new version** on the
same file, so the file ID stays the same. Nothing on the website needs to change.
