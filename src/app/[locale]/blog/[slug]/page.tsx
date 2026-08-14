import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { AlertTriangle, ArrowLeft, ArrowRight, Radio } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getPostBySlug, getPublishedPosts } from '@/lib/supabase/server';
import { SITE_URL } from '@/lib/site';
import { formatDate } from '@/lib/utils';
import RawHtmlContent from '@/components/blog/RawHtmlContent';
import PostCover from '@/components/blog/PostCover';
import SharePost from '@/components/blog/SharePost';
import type { Post } from '@/lib/supabase/types';
import { getBlogMeta } from '@/data/blog-curation';

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
  // A capa entra no metadata — é ela que aparece quando o link do post é
  // colado no WhatsApp, X, LinkedIn etc. Sem isso o compartilhamento sai
  // "pelado", só texto.
  const cover = post.cover_url ?? undefined;
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: 'article',
      publishedTime: post.created_at,
      ...(cover ? { images: [{ url: cover, alt: post.title }] } : {}),
    },
    twitter: {
      card: cover ? 'summary_large_image' : 'summary',
      title: post.title,
      description: post.excerpt ?? undefined,
      ...(cover ? { images: [cover] } : {}),
    },
  };
}

// Vizinhos e relacionados: se o post tem categoria com mais posts, a
// navegação anda DENTRO da série (é o caso dos Nômades Digitais); senão,
// anda na linha do tempo geral. Relacionados completam com o resto.
function buildTrail(post: Post, all: Post[]) {
  const sameCat = post.category
    ? all.filter((p) => p.category === post.category)
    : [];
  const pool = sameCat.length > 1 ? sameCat : all;
  const idx = pool.findIndex((p) => p.id === post.id);
  // Lista vem em created_at DESC → mais novo antes. "Anterior" = mais
  // antigo (idx+1); "próximo" = mais novo (idx-1).
  const older = idx >= 0 ? (pool[idx + 1] ?? null) : null;
  const newer = idx >= 0 ? (pool[idx - 1] ?? null) : null;

  const seen = new Set(
    [post.id, older?.id, newer?.id].filter(Boolean) as string[]
  );
  const related: Post[] = [];
  for (const p of [...sameCat, ...all]) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    related.push(p);
    if (related.length === 3) break;
  }
  return { older, newer, related };
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

  const all = await getPublishedPosts();
  const { older, newer, related } = buildTrail(post, all);
  const blogMeta = getBlogMeta(post);
  // Link canônico do post pro compartilhamento (PT é a raiz, EN tem /en)
  const shareUrl = `${SITE_URL}${locale === 'pt' ? '' : `/${locale}`}/blog/${post.slug}`;

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
              priority
              className="absolute inset-0 w-full h-full"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-[#03110f] via-[#03110f]/55 to-[#03110f]/15"
            />
            <div className="relative w-full p-6 sm:p-10">
              {post.category && (
                <Link
                  href={
                    blogMeta.kind === 'news'
                      ? '/blog/noticias'
                      : { pathname: '/blog', query: { categoria: post.category } }
                  }
                  className="inline-flex items-center gap-1.5 mb-4 px-3 py-1 rounded-full border border-white/25 bg-black/30 backdrop-blur-sm text-[11px] font-semibold text-white hover:border-accent-bright hover:text-accent-bright transition-colors"
                >
                  <span aria-hidden className="w-1 h-1 rounded-full bg-accent-bright" />
                  {post.category}
                </Link>
              )}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight max-w-3xl [text-shadow:0_2px_18px_rgba(0,0,0,0.85)]">
                {post.title}
              </h1>
              <p className="mt-4 text-sm text-white/85 [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
                {t('published_on')} {formatDate(new Date(post.created_at), dateLocale)}
              </p>
            </div>
          </div>

          {blogMeta.coverCredit && (
            <p className="border-t border-border bg-background/45 px-6 py-3 text-xs leading-relaxed text-foreground-subtle sm:px-10">
              Imagem ilustrativa · Foto:{' '}
              <a
                href={blogMeta.coverCredit.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground-muted underline decoration-border-strong underline-offset-4 hover:text-foreground"
              >
                {blogMeta.coverCredit.author}
              </a>{' '}
              · {blogMeta.coverCredit.license}
            </p>
          )}

          {/* Conteúdo */}
          <div className="p-6 sm:p-10">
            {blogMeta.kind === 'news' && (
              <div className="mb-8 flex gap-3 rounded-2xl border border-[#F5C97B]/30 bg-[#F5C97B]/8 p-4 text-sm leading-relaxed text-foreground-muted">
                <Radio size={18} className="mt-0.5 shrink-0 text-[#F5C97B]" />
                <p>
                  <strong className="text-foreground">Radar verificado:</strong>{' '}
                  informações conferidas em fontes oficiais na data indicada. Confirme novamente antes de viajar.
                </p>
              </div>
            )}
            {blogMeta.archive && (
              <div className="mb-8 flex gap-3 rounded-2xl border border-border-strong bg-background/35 p-4 text-sm leading-relaxed text-foreground-muted">
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[#F5C97B]" />
                <p>
                  <strong className="text-foreground">Guia do arquivo:</strong>{' '}
                  regras de visto, residência e impostos podem ter mudado desde a publicação. Use como ponto de partida e confirme no governo do destino.
                </p>
              </div>
            )}
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

        {/* ── Compartilhar: o post acabou, bora fazer ele circular ── */}
        <div className="mt-8 flex justify-center sm:justify-start">
          <SharePost url={shareUrl} title={post.title} />
        </div>

        {/* ── Anterior / Próximo: dentro da série quando há categoria ── */}
        {(older || newer) && (
          <nav aria-label={t('post_nav_label')} className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {older ? (
              <Link
                href={`/blog/${older.slug}`}
                className="group flex flex-col gap-2 rounded-2xl bg-surface border border-border p-5 hover:border-accent/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-foreground-subtle">
                  <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-1" />
                  {t('prev_post')}
                </span>
                <span className="font-bold text-foreground leading-snug line-clamp-2 group-hover:text-accent-deep transition-colors">
                  {older.title}
                </span>
              </Link>
            ) : (
              <span aria-hidden className="hidden sm:block" />
            )}
            {newer && (
              <Link
                href={`/blog/${newer.slug}`}
                className="group flex flex-col items-end text-right gap-2 rounded-2xl bg-surface border border-border p-5 hover:border-accent/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-foreground-subtle">
                  {t('next_post')}
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </span>
                <span className="font-bold text-foreground leading-snug line-clamp-2 group-hover:text-accent-deep transition-colors">
                  {newer.title}
                </span>
              </Link>
            )}
          </nav>
        )}

        {/* ── Continue a jornada: mais leituras ── */}
        {related.length > 0 && (
          <section className="mt-14">
            <div className="flex items-center gap-4 mb-7">
              <h2 className="font-pixel text-[10px] tracking-[0.3em] uppercase text-foreground whitespace-nowrap">
                <span className="text-accent-bright">#</span> {t('related_title')}
              </h2>
              <span aria-hidden className="flex-1 h-px bg-border" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  className="group flex flex-col rounded-2xl overflow-hidden bg-surface border border-border hover:border-border-strong hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <PostCover
                      src={p.cover_url}
                      position={p.cover_position}
                      className="absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col flex-1 p-4">
                    <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2 mb-2 group-hover:text-accent-deep transition-colors">
                      {p.title}
                    </h3>
                    <span className="mt-auto text-xs text-foreground-subtle">
                      {formatDate(new Date(p.created_at), dateLocale)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
