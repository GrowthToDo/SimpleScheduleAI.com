import { getCollection, render } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import type { Post } from '~/types';
import { cleanSlug, trimSlash } from './permalinks';

// The Newsroom (`/articles`) is a parallel content section to the blog. It is
// intentionally self-contained and does NOT read the single `APP_BLOG` config
// object, so that adding it cannot alter blog routing/permalinks. The base and
// permalink pattern are hardcoded here.
export const ARTICLES_BASE = 'articles';
const ARTICLE_PERMALINK_PATTERN = `${ARTICLES_BASE}/%slug%`;

const generatePermalink = async ({ slug }: { slug: string }) => {
  const permalink = ARTICLE_PERMALINK_PATTERN.replace('%slug%', slug);

  return permalink
    .split('/')
    .map((el) => trimSlash(el))
    .filter((el) => !!el)
    .join('/');
};

const getNormalizedArticle = async (article: CollectionEntry<'article'>): Promise<Post> => {
  const { id, data } = article;
  const { Content, remarkPluginFrontmatter } = await render(article);

  const {
    publishDate: rawPublishDate = new Date(),
    updateDate: rawUpdateDate,
    title,
    excerpt,
    image,
    tags: rawTags = [],
    category: rawCategory,
    author,
    draft = false,
    metadata = {},
  } = data;

  const slug = cleanSlug(id);
  const publishDate = new Date(rawPublishDate);
  const updateDate = rawUpdateDate ? new Date(rawUpdateDate) : undefined;

  const category = rawCategory
    ? {
        slug: cleanSlug(rawCategory),
        title: rawCategory,
      }
    : undefined;

  const tags = rawTags.map((tag: string) => ({
    slug: cleanSlug(tag),
    title: tag,
  }));

  return {
    id: id,
    slug: slug,
    permalink: await generatePermalink({ slug }),

    publishDate: publishDate,
    updateDate: updateDate,

    title: title,
    excerpt: excerpt,
    image: image,

    category: category,
    tags: tags,
    author: author,

    draft: draft,

    metadata,

    Content: Content,

    readingTime: remarkPluginFrontmatter?.readingTime,
  };
};

const load = async function (): Promise<Array<Post>> {
  const articles = await getCollection('article');
  const normalizedArticles = articles.map(async (article) => await getNormalizedArticle(article));

  const results = (await Promise.all(normalizedArticles))
    .sort((a, b) => b.publishDate.valueOf() - a.publishDate.valueOf())
    // Drafts render on the dev server so the founder can preview them at the
    // real URL; production builds still exclude them.
    .filter((article) => !article.draft || import.meta.env.DEV);

  return results;
};

let _articles: Array<Post>;

/** Fetch every published (non-draft) Newsroom article, newest first. Memoized. */
export const fetchArticles = async (): Promise<Array<Post>> => {
  if (!_articles) {
    _articles = await load();
  }

  return _articles;
};

/** One static path per published article at /articles/<slug>. */
export const getStaticPathsArticle = async () => {
  return (await fetchArticles()).flatMap((article) => ({
    params: {
      // The [...slug] route already lives under /articles/, so the catch-all
      // param must be the bare slug. Using article.permalink here (which is
      // "articles/<slug>") would emit the page at /articles/articles/<slug>
      // while every link/canonical points at /articles/<slug> -> 404.
      slug: article.slug,
    },
    props: { article },
  }));
};
