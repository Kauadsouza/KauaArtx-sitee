import { notFound } from 'next/navigation';

// Placeholder — conteúdo MDX será adicionado em /src/content/blog/
export default async function BlogSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // When MDX posts exist, load them here
  void slug;
  notFound();
}
