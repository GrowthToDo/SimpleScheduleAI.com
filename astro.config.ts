import path from 'path';
import { fileURLToPath } from 'url';

import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import svelte from '@astrojs/svelte';
import partytown from '@astrojs/partytown';
import icon from 'astro-icon';
import compress from 'astro-compress';
import type { AstroIntegration } from 'astro';
import astrowind from './vendor/integration';

import { readingTimeRemarkPlugin, responsiveTablesRehypePlugin, lazyImagesRehypePlugin } from './src/utils/frontmatter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const hasExternalScripts = true;
const whenExternalScripts = (items: (() => AstroIntegration) | (() => AstroIntegration)[] = []) =>
  hasExternalScripts ? (Array.isArray(items) ? items.map((item) => item()) : [items()]) : [];

export default defineConfig({
  site: 'https://simplescheduleai.com',
  output: 'static',

  // Founder feedback 2026-07-07 item 5: pages should feel preloaded on click.
  // 'viewport' fetches a page as soon as its link scrolls into view.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },

  build: {
    inlineStylesheets: 'always',
  },

  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap({
      filter: (page) =>
        !page.includes('/tag/') &&
        !page.includes('/category/') &&
        !page.includes('/ask') &&
        !page.includes('/simulator') &&
        // Unlisted product-positioning page (noindex); remove this line together
        // with the robots noindex in product.astro when the founder flips the
        // positioning experiment live (see docs/seo/positioning-registry.md runbook).
        !page.includes('/product') &&
        // Retired pillar (301s to /nurse-scheduling-software) and internal decks
        !page.includes('/healthcare-staff-scheduling') &&
        !page.includes('/slide') &&
        // Unlisted investor evidence page (noindex in proof-of-work.astro)
        !page.includes('/proof-of-work') &&
        // Dormant programmatic SEO surface: never list /alternatives/ pages
        // until an entry is flipped live per the switch-on contract.
        !page.includes('/alternatives/'),
    }),
    mdx(),
    svelte(),
    icon({
      include: {
        tabler: ['*'],
        'flat-color-icons': [
          'template',
          'gallery',
          'approval',
          'document',
          'advertising',
          'currency-exchange',
          'voice-presentation',
          'business-contact',
          'database',
        ],
      },
    }),

    ...whenExternalScripts(() =>
      partytown({
        config: { forward: ['dataLayer.push'] },
      })
    ),

    compress({
      CSS: true,
      HTML: {
        'html-minifier-terser': {
          removeAttributeQuotes: false,
        },
      },
      Image: false,
      JavaScript: true,
      SVG: false,
      Logger: 1,
    }),

    astrowind({
      config: './src/config.yaml',
    }),
  ],

  image: {
    domains: ['cdn.pixabay.com'],
  },

  markdown: {
    remarkPlugins: [readingTimeRemarkPlugin],
    rehypePlugins: [responsiveTablesRehypePlugin, lazyImagesRehypePlugin],
  },

  vite: {
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
      },
    },
  },
});
