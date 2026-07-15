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
        { text: 'Blog', href: getBlogPermalink() },
        { text: 'Articles', href: getPermalink('/articles') },
      ],
    },
    {
      title: 'Company',
      links: [
        { text: 'About', href: getPermalink('/about') },
        { text: 'Contact', href: getPermalink('/contact') },
      ],
    },
    {
      title: 'Legal',
      links: [
        { text: 'Privacy', href: getPermalink('/privacy') },
        { text: 'Terms', href: getPermalink('/terms') },
      ],
    },
  ],
  secondaryLinks: [],
  socialLinks: [],
  footNote: `Built for Critical Access Hospitals in Texas.`,
};
