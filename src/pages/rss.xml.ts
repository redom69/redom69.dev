import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

export const GET: APIRoute = async (context) => {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  const sortedPosts = posts.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );

  return rss({
    title: 'Code2Learn — Daniel Hernandez Puerto',
    description:
      'Newsletter de desarrollo full-stack: opiniones, últimos avances y relatos de la vida de un developer.',
    site: context.site ?? 'https://www.redom69.dev',
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/newsletter/${post.id.replace(/\.md$/, '')}`,
      categories: post.data.tags,
    })),
  });
};
