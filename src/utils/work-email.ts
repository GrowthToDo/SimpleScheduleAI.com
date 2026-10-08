// Work-email rule shared by every lead form on the site (contact page, simulator demo,
// calculator breakdown, template gate). Founder decision 2026-10-08: take entries from
// official (work) addresses only, never Gmail, Yahoo or other personal accounts.
//
// The leads Apps Script re-checks this server-side for the calculator and the template
// (docs/ops/leads-apps-script.md keeps its own copy of the list: keep them in step).

export const FREE_EMAIL_DOMAINS = [
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'ymail.com',
  'rocketmail.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'msn.com',
  'aol.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'proton.me',
  'protonmail.com',
  'pm.me',
  'gmx.com',
  'gmx.net',
  'mail.com',
  'yandex.com',
  'zoho.com',
  'zohomail.com',
  'tutanota.com',
  'fastmail.com',
  'hey.com',
  'comcast.net',
  'att.net',
  'sbcglobal.net',
  'verizon.net',
  'cox.net',
  'charter.net',
  'bellsouth.net',
  'earthlink.net',
  'juno.com',
  'rediffmail.com',
  'qq.com',
  '163.com',
];

export const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const WORK_EMAIL_MESSAGE =
  'Please use your work email. We accept hospital and organization addresses only, not Gmail, Yahoo or other personal accounts.';

/** '' when the address is a valid work email, otherwise the message to show. */
export function workEmailError(raw: string): string {
  const email = String(raw || '')
    .trim()
    .toLowerCase();
  if (!EMAIL_FORMAT.test(email)) return 'Please enter a valid email address.';
  if (FREE_EMAIL_DOMAINS.includes(email.split('@')[1] || '')) return WORK_EMAIL_MESSAGE;
  return '';
}
