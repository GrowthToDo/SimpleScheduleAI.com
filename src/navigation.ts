import { getPermalink, getBlogPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Home',
      href: getPermalink('/'),
    },
    {
      text: 'How it Works',
      href: getPermalink('/how-it-works'),
    },
    {
      text: 'Interactive Demo',
      href: getPermalink('/simulator'),
    },
    {
      text: 'Pricing',
      href: getPermalink('/pricing'),
    },
    {
      text: 'Resources',
      links: [
        { text: 'Cost Calculator', href: getPermalink('/roi') },
        { text: 'Nurse Scheduling Software', href: getPermalink('/nurse-scheduling-software') },
        { text: 'AI Nurse Scheduling', href: getPermalink('/ai-nurse-scheduling') },
        { text: 'Critical Access Hospital Scheduling', href: getPermalink('/critical-access-hospital-scheduling') },
        { text: 'Nurse Staffing Statistics', href: getPermalink('/rural-hospital-nurse-staffing-statistics') },
        { text: 'Free Schedule Template', href: getPermalink('/resources/nurse-schedule-template') },
        { text: 'Blog', href: getBlogPermalink() },
        { text: 'Articles', href: getPermalink('/articles') },
      ],
    },
  ],
  actions: [{ text: 'Get your first schedule', href: getPermalink('/contact'), variant: 'primary' as const }],
};

export const footerData = {
  links: [
    {
      title: 'Product',
      links: [
        { text: 'How It Works', href: getPermalink('/how-it-works') },
        { text: 'Interactive Demo', href: getPermalink('/simulator') },
        { text: 'Get Started', href: getPermalink('/contact') },
        { text: 'Pricing', href: getPermalink('/pricing') },
        { text: 'Scheduling Cost Calculator', href: getPermalink('/roi') },
      ],
    },
    {
      title: 'Resources',
      links: [
        { text: 'Nurse Scheduling Software', href: getPermalink('/nurse-scheduling-software') },
        { text: 'AI Nurse Scheduling', href: getPermalink('/ai-nurse-scheduling') },
        { text: 'CAH Scheduling Guide', href: getPermalink('/critical-access-hospital-scheduling') },
        { text: 'Nurse Staffing Statistics', href: getPermalink('/rural-hospital-nurse-staffing-statistics') },
        { text: 'Free Schedule Template', href: getPermalink('/resources/nurse-schedule-template') },
        { text: 'Free Scheduling Software', href: getPermalink('/blog/free-nurse-scheduling-software') },
        { text: 'Blog', href: getBlogPermalink() },
        { text: 'Articles', href: getPermalink('/articles') },
      ],
    },
    // Comparison pages live in the footer deliberately. They are the pages a
    // buyer looks for by competitor name, they rank as individual brand-vs-brand
    // URLs, and a site-wide link is the cheapest way to give them the internal
    // authority they were missing (2026-09-01 link audit: every post linked the
    // two pillars, which already rank, and almost nothing else).
    // Ordered by 90-day GSC impressions, then by how central the vendor is to
    // the dossier.
    {
      title: 'Compare',
      links: [
        { text: 'Aladtec Alternatives', href: getPermalink('/blog/aladtec-alternatives') },
        { text: 'ShiftWizard Alternatives', href: getPermalink('/blog/shiftwizard-alternatives') },
        { text: 'Schedule360 Alternatives', href: getPermalink('/blog/schedule360-alternatives') },
        { text: 'QGenda Alternatives', href: getPermalink('/blog/qgenda-alternatives') },
        { text: 'UKG Alternatives', href: getPermalink('/blog/ukg-alternatives-small-hospitals') },
        { text: 'SmartLinx Alternatives', href: getPermalink('/blog/smartlinx-alternatives') },
        { text: 'NurseGrid Alternatives', href: getPermalink('/blog/nursegrid-alternatives') },
        { text: 'M7 Health Alternatives', href: getPermalink('/blog/m7-health-alternatives') },
      ],
    },
    {
      title: 'Company',
      links: [
        { text: 'About', href: getPermalink('/about') },
        { text: 'Contact', href: getPermalink('/contact') },
        { text: 'Privacy', href: getPermalink('/privacy') },
        { text: 'Terms', href: getPermalink('/terms') },
      ],
    },
  ],
  secondaryLinks: [],
  socialLinks: [],
  footNote: `Built for Critical Access Hospitals in Texas.`,
};
