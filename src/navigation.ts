import { getPermalink, getBlogPermalink, getAsset } from './utils/permalinks';

export const headerData = {
  links: [
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
      text: 'Articles',
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
  secondaryLinks: [
    { text: 'Contact', href: getPermalink('/contact') },
    { text: 'Privacy', href: getPermalink('/privacy') },
    { text: 'Terms', href: getPermalink('/terms') },
  ],
  socialLinks: [],
  footNote: `Built for Critical Access Hospitals in Texas.`,
};
