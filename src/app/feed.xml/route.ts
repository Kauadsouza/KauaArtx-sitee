import { getPublishedPosts } from '@/lib/supabase/server';
import { SITE_BRAND, SITE_URL } from '@/lib/site';

// Feed RSS do blog. Serve pra quem acompanha por leitor de feed e, mais
// importante hoje, pra agregadores e newsletters puxarem post novo sozinhos.
// Endereço: /feed.xml
export const revalidate = 600;

// Texto vira XML seguro: sem isso um título com "&" ou "<" quebra o feed
const escapa = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export async function GET() {
  const posts = await getPublishedPosts(30);

  const itens = posts
    .map((post) => {
      const url = `${SITE_URL}/pt/blog/${post.slug}`;
      return `    <item>
      <title>${escapa(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
      ${post.excerpt ? `<description>${escapa(post.excerpt)}</description>` : ''}
      ${post.category ? `<category>${escapa(post.category)}</category>` : ''}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapa(SITE_BRAND)} — blog</title>
    <link>${SITE_URL}/pt/blog</link>
    <description>Textos sobre viagens, lugares e histórias do caminho.</description>
    <language>pt-BR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${itens}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'content-type': 'application/rss+xml; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400',
    },
  });
}
