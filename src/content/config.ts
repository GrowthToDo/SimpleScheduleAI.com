import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const metadataDefinition = () =>
  z
    .object({
      title: z.string().optional(),
      ignoreTitleTemplate: z.boolean().optional(),

      canonical: z.string().url().optional(),

      robots: z
        .object({
          index: z.boolean().optional(),
          follow: z.boolean().optional(),
        })
        .optional(),

      description: z.string().optional(),

      openGraph: z
        .object({
          url: z.string().optional(),
          siteName: z.string().optional(),
          images: z
            .array(
              z.object({
                url: z.string(),
                width: z.number().optional(),
                height: z.number().optional(),
              })
            )
            .optional(),
          locale: z.string().optional(),
          type: z.string().optional(),
        })
        .optional(),

      twitter: z
        .object({
          handle: z.string().optional(),
          site: z.string().optional(),
          cardType: z.string().optional(),
        })
        .optional(),
    })
    .optional();

// Shared schema so the Newsroom `article` collection is guaranteed identical to
// the blog `post` collection (same fields, same validation, same metadata).
const contentSchema = z.object({
  publishDate: z.date().optional(),
  updateDate: z.date().optional(),
  draft: z.boolean().optional(),

  title: z.string(),
  excerpt: z.string().optional(),
  image: z.string().optional(),

  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),

  metadata: metadataDefinition(),
});

const postCollection = defineCollection({
  loader: glob({ pattern: ['*.md', '*.mdx'], base: 'src/data/post' }),
  schema: contentSchema,
});

// Newsroom: time-sensitive news/analysis posts, parallel to the blog.
const articleCollection = defineCollection({
  loader: glob({ pattern: ['*.md', '*.mdx'], base: 'src/data/article' }),
  schema: contentSchema,
});

export const collections = {
  post: postCollection,
  article: articleCollection,
};
