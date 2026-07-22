import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getPostBySlug } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import RawHtmlContent from '@/components/blog/RawHtmlContent';
import PostCover from '@/components/blog/PostCover';

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

  // Post em HTML traz layout próprio (cards, grades, seções largas), então
  // ganha mais espaço; texto corrido continua na largura boa de leitura.
  const isHtml = post.content_format === 'html';

  return (
    <div className="min-h-screen pt-24">
      <article
        className={`mx-auto px-4 sm:px-6 lg:px-8 pb-32 ${isHtml ? 'max-w-5xl' : 'max-w-3xl'}`}
      >
        {/* Voltar */}
        <div className="py-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground-muted hover:text-accent-deep transition-colors"
          >
            <ArrowLeft size={14} />
            {t('back_to_blog')}
          </Link>
        </div>

        {/* ── Moldura do post: herói (título sobre a capa) + conteúdo ──
              Borda em sálvia com fio de luz no topo e brilho suave em volta. */}
        <div className="relative rounded-3xl overflow-hidden bg-surface border border-border-strong shadow-[0_0_0_1px_rgba(142,182,155,0.10),0_36px_80px_-30px_rgba(0,0,0,0.85)]">
          {/* fio de luz no topo da moldura */}
          <span aria-hidden className="absolute top-0 inset-x-0 h-px hairline-gradient z-20" />

          {/* Herói: a capa é o FUNDO e o título fica por cima. O véu escuro
                garante a leitura mesmo que a foto seja clara ou o título longo
                cubra boa parte dela — como o Kauã pediu. */}
          <div className="relative flex items-end min-h-[340px] sm:min-h-[460px]">
            <PostCover
              src={post.cover_url}
              position={post.cover_position}
              className="absolute inset-0 w-full h-full"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-[#03110f] via-[#03110f]/55 to-[#03110f]/15"
            />
            <div className="relative w-full p-6 sm:p-10">
              {post.category && (
                <span className="inline-flex items-center gap-1.5 mb-4 px-3 py-1 rounded-full border border-white/25 bg-black/30 backdrop-blur-sm text-[11px] font-semibold text-white">
                  <span aria-hidden className="w-1 h-1 rounded-full bg-accent-bright" />
                  {post.category}
                </span>
              )}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight max-w-3xl [text-shadow:0_2px_18px_rgba(0,0,0,0.85)]">
                {post.title}
              </h1>
              <p className="mt-4 text-sm text-white/85 [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
                {t('published_on')} {formatDate(new Date(post.created_at), dateLocale)}
              </p>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-6 sm:p-10">
            {post.excerpt && (
              <p className="text-lg text-foreground-muted leading-relaxed mb-8 pb-8 border-b border-border">
                {post.excerpt}
              </p>
            )}
            {isHtml ? (
              <RawHtmlContent html={post.content} />
            ) : (
              <div className="prose-post">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
