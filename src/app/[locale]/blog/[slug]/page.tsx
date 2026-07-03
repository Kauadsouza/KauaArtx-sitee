import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getPostBySlug } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';

// Revalida a cada 60s — edições aparecem sozinhas
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: 'article',
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const t = await getTranslations({ locale, namespace: 'blog' });
  const dateLocale = locale === 'pt' ? 'pt-BR' : 'en-US';

  return (
    <div className="min-h-screen pt-24">
      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-32">
        {/* Voltar */}
        <div className="py-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground-muted hover:text-accent-deep transition-colors"
          >
            <ArrowLeft size={14} />
            {t('back_to_blog')}
          </Link>
        </div>

        {/* Header */}
        <header className="mb-10">
          <p className="text-sm text-foreground-subtle mb-4">
            {t('published_on')} {formatDate(new Date(post.created_at), dateLocale)}
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-foreground mb-4">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-xl text-foreground-muted leading-relaxed">{post.excerpt}</p>
          )}
          <div className="mt-8 h-px w-24 hairline-gradient" />
        </header>

        {/* Capa */}
        {post.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_url}
            alt={post.title}
            className="w-full rounded-2xl mb-10 border border-border"
          />
        )}

        {/* Conteúdo */}
        <div className="prose-post">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>
      </article>
    </div>
  );
}
