import type { MetadataRoute } from 'next';
import { getPublishedPosts } from '@/lib/supabase/server';
import { SITE_URL } from '@/lib/site';

// PT é o idioma padrão (sem prefixo); EN vive em /en
const STATIC_PATHS = [
  '',
  '/about',
  '/agora',
  '/blog',
  '/blog/noticias',
  '/contact',
  '/ferramentas',
  '/glossario',
  '/mapa',
  '/viagens/oxford',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.flatMap((path) => [
    {
      url: `${SITE_URL}${path || '/'}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: path === '' ? 1 : 0.7,
    },
    {
      url: `${SITE_URL}/en${path}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: path === '' ? 0.9 : 0.6,
    },
  ]);

  const posts = await getPublishedPosts();
  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...staticEntries, ...postEntries];
}
