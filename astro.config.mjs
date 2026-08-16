import { defineConfig } from 'astro/config';
import robotsTxt from 'astro-robots-txt';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'server',
  integrations: [robotsTxt(), sitemap()],
  adapter: vercel(),
  site: 'https://www.redom69.dev',
  markdown: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});
