import type { Metadata } from 'next';
import { ArrowRight, BookOpen, Compass, Radio } from 'lucide-react';
import BlogCard from '@/components/blog/BlogCard';
import BlogTabs from '@/components/blog/BlogTabs';
import {
  getBlogMeta,
  getFeaturedPosts,
  sortCuratedPosts,
  type BlogKind,
} from '@/data/blog-curation';
import { Link } from '@/i18n/navigation';
import { getPublishedPosts } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isPt = locale === 'pt';
  return {
    title: 'Blog',
    description: isPt
      ? 'Histórias reais, guias práticos e notícias verificadas para quem quer viajar.'
      : 'Real stories, practical guides, and verified news for people who want to travel.',
  };
}

function kindFromQuery(value?: string): BlogKind | null {
  if (value === 'historias') return 'story';
  if (value === 'guias') return 'guide';
  return null;
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tipo?: string; categoria?: string }>;
}) {
  const { locale } = await params;
  const { tipo, categoria } = await searchParams;
  const allPosts = sortCuratedPosts(await getPublishedPosts());
  const activeKind = kindFromQuery(tipo);
  const categoryExists = categoria
    ? allPosts.some((post) => post.category === categoria)
    : false;

  const filteredPosts = allPosts.filter((post) => {
    if (categoryExists && post.category !== categoria) return false;
    if (activeKind && getBlogMeta(post).kind !== activeKind) return false;
    return true;
  });

  const featured = !activeKind && !categoryExists ? getFeaturedPosts(allPosts) : [];
  const featuredSlugs = new Set(featured.map((post) => post.slug));
  const feed = filteredPosts.filter((post) => !featuredSlugs.has(post.slug));
  const isPt = locale === 'pt';
  const activeTab = activeKind ?? 'all';

  const sectionTitle = categoryExists
    ? categoria
    : activeKind === 'story'
      ? isPt
        ? 'Histórias vividas'
        : 'Real stories'
      : activeKind === 'guide'
        ? isPt
          ? 'Guias para sair do plano'
          : 'Guides to get moving'
        : isPt
          ? 'Mais para explorar'
          : 'More to explore';

  return (
    <div className="min-h-screen pt-24">
      <div className="mx-auto max-w-7xl px-4 pb-32 sm:px-6 lg:px-8">
        <header className="py-14 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] lg:items-end">
            <div>
              <p className="mb-5 font-mono text-xs uppercase tracking-[0.28em] text-accent">
                ARTX / {isPt ? 'DIÁRIO DE BORDO' : 'FIELD NOTES'}
              </p>
              <h1 className="max-w-4xl text-5xl font-bold tracking-[-0.055em] text-foreground sm:text-7xl lg:text-8xl">
                {isPt ? 'Histórias, guias e o que mudou.' : 'Stories, guides, and what changed.'}
              </h1>
            </div>

            <div className="lg:pb-2">
              <p className="text-lg leading-relaxed text-foreground-muted">
                {isPt
                  ? 'Viagem sem preencher os espaços com invenção: relatos do que eu vivi, guias para começar e notícias conferidas em fontes oficiais.'
                  : 'Travel without filling the gaps with fiction: stories I lived, guides to get started, and news checked against official sources.'}
              </p>
              <div className="mt-7">
                <BlogTabs active={activeTab} locale={locale} />
              </div>
            </div>
          </div>
          <div aria-hidden className="mt-12 h-px w-full hairline-gradient opacity-70" />
        </header>

        {categoryExists && (
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-5 py-4">
            <p className="text-sm text-foreground-muted">
              {isPt ? 'Mostrando a categoria' : 'Showing category'}{' '}
              <strong className="text-foreground">{categoria}</strong>
            </p>
            <Link href="/blog" className="text-sm font-semibold text-accent hover:text-accent-bright">
              {isPt ? 'Limpar filtro' : 'Clear filter'}
            </Link>
          </div>
        )}

        {featured.length > 0 && (
          <section aria-labelledby="featured-heading" className="mb-20">
            <div className="mb-7 flex items-end justify-between gap-5">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                  {isPt ? 'Escolha editorial' : 'Editor picks'}
                </p>
                <h2 id="featured-heading" className="text-3xl font-bold tracking-tight text-foreground">
                  {isPt ? 'Melhores para começar' : 'Best place to start'}
                </h2>
              </div>
              <Link
                href="/blog/noticias"
                className="hidden items-center gap-2 text-sm font-semibold text-foreground-muted transition-colors hover:text-foreground sm:inline-flex"
              >
                {isPt ? 'Abrir notícias' : 'Open news'}
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)]">
              {featured[0] && <BlogCard post={featured[0]} locale={locale} featured priority />}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
                {featured.slice(1).map((post, index) => (
                  <BlogCard key={post.id} post={post} locale={locale} priority={index === 0} />
                ))}
              </div>
            </div>
          </section>
        )}

        <section aria-labelledby="feed-heading">
          <div className="mb-8 flex items-center gap-4">
            <h2 id="feed-heading" className="whitespace-nowrap text-2xl font-bold tracking-tight text-foreground">
              {sectionTitle}
            </h2>
            <span aria-hidden className="h-px flex-1 bg-border" />
            <span className="font-mono text-xs text-foreground-subtle">
              {feed.length} {isPt ? 'leituras' : 'reads'}
            </span>
          </div>

          {feed.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {feed.map((post) => (
                <BlogCard key={post.id} post={post} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border-strong bg-surface/60 px-6 py-16 text-center">
              <p className="text-foreground-muted">
                {isPt ? 'Ainda não há outra publicação nesta seção.' : 'There is no other post in this section yet.'}
              </p>
            </div>
          )}
        </section>

        <section className="mt-24 grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-3">
          <div className="bg-surface p-7">
            <BookOpen className="mb-5 text-accent" size={23} />
            <h2 className="text-lg font-bold text-foreground">{isPt ? 'Histórias' : 'Stories'}</h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
              {isPt ? 'Só entram como relato as viagens que eu realmente fiz.' : 'Only trips I actually took are published as personal stories.'}
            </p>
          </div>
          <div className="bg-surface p-7">
            <Compass className="mb-5 text-accent" size={23} />
            <h2 className="text-lg font-bold text-foreground">{isPt ? 'Guias' : 'Guides'}</h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
              {isPt ? 'Planejamento prático, separado da minha experiência pessoal.' : 'Practical planning, kept separate from my personal experience.'}
            </p>
          </div>
          <div className="bg-surface p-7">
            <Radio className="mb-5 text-[#F5C97B]" size={23} />
            <h2 className="text-lg font-bold text-foreground">{isPt ? 'Notícias' : 'News'}</h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
              {isPt ? 'Data de checagem visível e fonte oficial em cada atualização.' : 'Visible check date and an official source in every update.'}
            </p>
          </div>
        </section>

        <div className="mt-16 flex flex-col items-start justify-between gap-6 rounded-3xl border border-border-strong bg-[linear-gradient(120deg,var(--surface),var(--surface-el))] p-7 sm:flex-row sm:items-center sm:p-9">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">@KauaArtx</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">
              {isPt ? 'O blog organiza. O canal mostra a estrada.' : 'The blog organizes it. The channel shows the road.'}
            </h2>
          </div>
          <a
            href="https://www.youtube.com/@KauaArtx"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-pill-primary shrink-0 text-sm"
          >
            {isPt ? 'Acompanhar no YouTube' : 'Follow on YouTube'}
            <ArrowRight size={15} />
          </a>
        </div>
      </div>
    </div>
  );
}
