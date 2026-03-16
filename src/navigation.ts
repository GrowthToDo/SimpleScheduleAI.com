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
      text: 'Pilot',
      href: getPermalink('/pilot'),
    },
    {
      text: 'Scheduling Cost Calculator',
      href: getPermalink('/roi'),
    },
    {
      text: 'Blog',
      href: getBlogPermalink(),
    },
  ],
  actions: [{ text: 'Book a Call', href: 'https://cal.com/gautham-8bdvdx/30min' }],
};

export const footerData = {
  links: [
    {
      title: 'Product',
      links: [
        { text: 'How It Works', href: getPermalink('/how-it-works') },
        { text: 'The Pilot', href: getPermalink('/pilot') },
        { text: 'Scheduling Cost Calculator', href: getPermalink('/roi') },
      ],
    },
    {
      title: 'Company',
      links: [
        { text: 'About', href: getPermalink('/about') },
        { text: 'Blog', href: getBlogPermalink() },
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
