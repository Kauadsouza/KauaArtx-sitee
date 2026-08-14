import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { ArrowRight, PenLine, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';
import { getPublishedPosts } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import PostCover from '@/components/blog/PostCover';
import type { Post } from '@/lib/supabase/types';

// Renderiza a cada visita: o filtro ?categoria= depende da URL da hora e
// uma página em cache ignoraria a query (o filtro funcionaria no preview e
// falharia no ar). Posts novos também aparecem na hora, de brinde.
export const dynamic = 'force-dynamic';

const SOCIALS = [
  { href: 'https://www.instagram.com/kauaartx/', icon: Instagram, label: 'Instagram', handle: '@kauaartx' },
  { href: 'https://x.com/KauaArtx', icon: Twitter, label: 'Twitter / X', handle: '@KauaArtx' },
  { href: 'https://www.youtube.com/@KauaArtx', icon: Youtube, label: 'YouTube', handle: '@KauaArtx' },
  { href: 'https://www.linkedin.com/in/kauadsouza/', icon: Linkedin, label: 'LinkedIn', handle: 'kauadsouza' },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });
  return { title: t('title'), description: t('subtitle') };
}

// A etiqueta agora é clicável: leva pro blog filtrado pela categoria.
// Nos cards (que são um link inteiro) ela flutua ACIMA do link do card
// (z-[2] sobre o overlay z-[1]) — clicar nela filtra, clicar no resto abre
// o post. Links aninhados são HTML inválido, por isso o overlay.
function CategoryTag({ category, asLink = false }: { category: string | null; asLink?: boolean }) {
  if (!category) return null;
  const base =
    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border-strong bg-background/60 text-[11px] font-medium text-accent-deep';
  const inner = (
    <>
      <span aria-hidden className="w-1 h-1 rounded-full bg-accent-bright" />
      {category}
    </>
  );
  if (!asLink) return <span className={base}>{inner}</span>;
  return (
    <Link
      href={{ pathname: '/blog', query: { categoria: category } }}
      className={`relative z-[2] ${base} hover:border-accent hover:text-accent-bright transition-colors`}
    >
      {inner}
    </Link>
  );
}

// Pill da fileira de filtros no topo do blog
function CategoryPill({
  href,
  label,
  active,
}: {
  href: { pathname: '/blog'; query?: { categoria: string } };
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`inline-flex items-center px-4 py-1.5 rounded-full border text-xs font-semibold transition-colors duration-300 ${
        active
          ? 'bg-accent text-[color:var(--ink-on-accent)] border-accent'
          : 'bg-surface border-border text-foreground-muted hover:text-foreground hover:border-border-strong'
      }`}
    >
      {label}
    </Link>
  );
}

// Assinatura: monograma + nome. É blog de uma pessoa só, então o autor
// é sempre o Kauã — nada de lista de autores inventada.
function Byline({ date }: { date: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-6 h-6 rounded-full bg-accent/15 border border-border-strong flex items-center justify-center text-[10px] font-bold text-accent-deep">
        K
      </span>
      <span className="text-xs text-foreground-muted">Kauã</span>
      <span aria-hidden className="text-foreground-subtle">·</span>
      <span className="text-xs text-foreground-subtle">{date}</span>
    </div>
  );
}

// Título de seção com o filete atravessando a página, como no layout de revista
function SectionRule({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <h2 className="font-pixel text-[10px] tracking-[0.3em] uppercase text-foreground whitespace-nowrap">
        <span className="text-accent-bright">#</span> {label}
      </h2>
      <span aria-hidden className="flex-1 h-px bg-border" />
    </div>
  );
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { locale } = await params;
  const { categoria } = await searchParams;
  const t = await getTranslations({ locale, namespace: 'blog' });
  const allPosts = await getPublishedPosts();
  const dateLocale = locale === 'pt' ? 'pt-BR' : 'en-US';
  const when = (p: Post) => formatDate(new Date(p.created_at), dateLocale);

  // Categorias reais dos posts publicados → viram a fileira de filtros.
  // ?categoria=X só vale se existir de verdade; qualquer coisa estranha na
  // URL cai de volta em "todos" (então a lista filtrada nunca fica vazia).
  const categories = [
    ...new Set(allPosts.map((p) => p.category).filter(Boolean)),
  ] as string[];
  const active = categoria && categories.includes(categoria) ? categoria : null;
  const posts = active ? allPosts.filter((p) => p.category === active) : allPosts;

  // O layout de revista se adapta à quantidade de posts: destaque, apoio
  // e o resto vira feed. Com poucos posts as seções somem sozinhas.
  const [featured, secondary, ...rest] = posts;
  // A barra lateral segue mostrando o site inteiro, mesmo com filtro ativo
  const recent = allPosts.slice(0, 5);

  return (
    <div className="min-h-screen pt-24 relative overflow-hidden">
      <div aria-hidden className="orb w-[420px] h-[420px] top-[-8%] left-[-12%] bg-accent/12 animate-float-slow" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-32">

        {/* ══ Hero: título display à esquerda, resumo e ações à direita ══ */}
        <header className="py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-8 lg:gap-16 items-end">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tighter text-foreground">
              {t('title')}
            </h1>
            <div className="lg:pb-3">
              <p className="text-foreground-muted leading-relaxed mb-6">{t('subtitle')}</p>
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/contact" className="btn-pill-primary text-sm !py-2.5 !px-5">
                  {t('hero_cta')}
                  <ArrowRight size={14} />
                </Link>
                <a
                  href="https://www.youtube.com/@KauaArtx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-sm text-foreground-muted hover:text-foreground hover:border-border-strong transition-all"
                >
                  <Youtube size={14} />
                  {t('hero_cta_secondary')}
                </a>
              </div>
            </div>
          </div>
          {/* Filete grosso sob o título, como o do layout de revista */}
          <div aria-hidden className="mt-10 h-0.5 w-full hairline-gradient opacity-60" />

          {/* Fileira de categorias — clicou, filtrou */}
          {categories.length > 0 && (
            <nav aria-label={t('filter_label')} className="mt-6 flex flex-wrap items-center gap-2">
              <CategoryPill
                href={{ pathname: '/blog' }}
                label={t('filter_all')}
                active={!active}
              />
              {categories.map((c) => (
                <CategoryPill
                  key={c}
                  href={{ pathname: '/blog', query: { categoria: c } }}
                  label={c}
                  active={active === c}
                />
              ))}
            </nav>
          )}
        </header>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 rounded-3xl bg-surface border border-dashed border-border-strong text-center">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent-deep flex items-center justify-center">
              <PenLine size={26} />
            </div>
            <h2 className="text-2xl font-bold text-foreground">{t('coming_soon')}</h2>
            <p className="text-foreground-muted max-w-sm">{t('coming_soon_desc')}</p>
          </div>
        ) : (
          <>
            {/* ══ Destaque: cartão de texto + capa grande + cartão de apoio ══
                   Com um post só a terceira coluna sai de cena e o texto ganha
                   o espaço dela — em três colunas o título ficava espremido. */}
            <section className="mb-20">
              <div
                className={`grid grid-cols-1 gap-6 items-stretch ${
                  secondary
                    ? 'lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.7fr)_minmax(0,0.95fr)]'
                    : 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]'
                }`}
              >

                {/* Texto do post em destaque — o card inteiro é um link
                       (overlay) e a etiqueta de categoria flutua por cima
                       com o link de filtro dela */}
                <div className="group relative flex flex-col justify-center rounded-2xl bg-surface border border-border p-7 hover:border-border-strong transition-colors duration-300">
                  <Link
                    href={`/blog/${featured.slug}`}
                    aria-label={featured.title}
                    className="absolute inset-0 z-[1] rounded-2xl"
                  />
                  <div className="mb-4">
                    <CategoryTag category={featured.category} asLink />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight mb-4 group-hover:text-accent-deep transition-colors">
                    {featured.title}
                  </h2>
                  {featured.excerpt && (
                    <p className="text-sm text-foreground-muted leading-relaxed mb-6 line-clamp-4">
                      {featured.excerpt}
                    </p>
                  )}
                  <div className="mt-auto pt-5 border-t border-border">
                    <Byline date={when(featured)} />
                  </div>
                </div>

                {/* Capa grande do destaque */}
                <Link
                  href={`/blog/${featured.slug}`}
                  className="group relative rounded-2xl overflow-hidden border border-border min-h-[280px] lg:min-h-[420px]"
                >
                  <PostCover
                    src={featured.cover_url}
                    position={featured.cover_position}
                    className="absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-105"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent"
                  />
                </Link>

                {/* Post de apoio — só existe quando há um segundo post. Sem
                       ele a grade já é de duas colunas e o convite pra conversa
                       fica só na barra lateral, sem repetir. */}
                {secondary && (
                  <div className="group relative flex flex-col rounded-2xl bg-surface border border-border overflow-hidden hover:border-border-strong transition-colors duration-300">
                    <Link
                      href={`/blog/${secondary.slug}`}
                      aria-label={secondary.title}
                      className="absolute inset-0 z-[1]"
                    />
                    <div className="relative h-40 overflow-hidden">
                      <PostCover
                        src={secondary.cover_url}
                    position={secondary.cover_position}
                        className="absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-col flex-1 p-6">
                      <div className="mb-3">
                        <CategoryTag category={secondary.category} asLink />
                      </div>
                      <h3 className="text-lg font-bold tracking-tight text-foreground leading-snug mb-3 group-hover:text-accent-deep transition-colors">
                        {secondary.title}
                      </h3>
                      {secondary.excerpt && (
                        <p className="text-sm text-foreground-muted leading-relaxed line-clamp-3">
                          {secondary.excerpt}
                        </p>
                      )}
                      <span className="mt-auto pt-5 text-xs text-foreground-subtle">
                        {when(secondary)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* ══ Feed principal + barra lateral ══ */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)] gap-10 lg:gap-14">

              {/* Coluna do feed */}
              <div>
                <SectionRule label={t('latest_kicker')} />
                {rest.length === 0 ? (
                  <p className="text-sm text-foreground-subtle py-8">{t('coming_soon_desc')}</p>
                ) : (
                  <div className="space-y-5">
                    {rest.map((post) => (
                      <div
                        key={post.id}
                        className="group relative grid grid-cols-1 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] gap-5 rounded-2xl bg-surface border border-border overflow-hidden hover:border-border-strong hover:-translate-y-0.5 transition-all duration-300"
                      >
                        <Link
                          href={`/blog/${post.slug}`}
                          aria-label={post.title}
                          className="absolute inset-0 z-[1]"
                        />
                        <div className="relative h-48 sm:h-full min-h-[180px] overflow-hidden">
                          <PostCover
                            src={post.cover_url}
                    position={post.cover_position}
                            className="absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                        <div className="flex flex-col p-6 sm:pl-0 sm:py-7 sm:pr-7">
                          <div className="mb-3">
                            <CategoryTag category={post.category} asLink />
                          </div>
                          <h3 className="text-xl font-bold tracking-tight text-foreground leading-snug mb-2.5 group-hover:text-accent-deep transition-colors">
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="text-sm text-foreground-muted leading-relaxed line-clamp-3 mb-5">
                              {post.excerpt}
                            </p>
                          )}
                          <div className="mt-auto pt-4 border-t border-border">
                            <Byline date={when(post)} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Barra lateral */}
              <aside className="space-y-10">

                {/* Mais recentes — miniatura + título + data */}
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-foreground-subtle mb-5">
                    {t('sidebar_recent')}
                  </h2>
                  <ul className="divide-y divide-border border-y border-border">
                    {recent.map((post) => (
                      <li key={post.id}>
                        <Link
                          href={`/blog/${post.slug}`}
                          className="group flex items-center gap-4 py-4"
                        >
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-accent-deep transition-colors">
                              {post.title}
                            </h3>
                            <span className="text-xs text-foreground-subtle">{when(post)}</span>
                          </div>
                          <div className="w-16 h-14 rounded-lg overflow-hidden border border-border shrink-0">
                            <PostCover src={post.cover_url}
                    position={post.cover_position} className="w-full h-full" />
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Me acompanhe — handles reais, sem contador inventado */}
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-foreground-subtle mb-5">
                    {t('sidebar_follow')}
                  </h2>
                  <div className="grid grid-cols-2 gap-2.5">
                    {SOCIALS.map(({ href, icon: Icon, label, handle }) => (
                      <a
                        key={href}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="group flex flex-col gap-1 p-3 rounded-xl border border-border bg-surface hover:border-accent/40 transition-colors duration-300"
                      >
                        <Icon size={15} className="text-foreground-subtle group-hover:text-accent-bright transition-colors" />
                        <span className="text-xs text-foreground-muted truncate">{handle}</span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Convite pra conversa no lugar do slot de anúncio da referência */}
                <div className="relative rounded-2xl bg-surface border border-border p-6 overflow-hidden">
                  <span aria-hidden className="absolute top-0 inset-x-0 h-px hairline-gradient" />
                  <h2 className="text-lg font-bold text-foreground mb-2">{t('sidebar_cta_title')}</h2>
                  <p className="text-sm text-foreground-muted leading-relaxed mb-5">
                    {t('sidebar_cta_desc')}
                  </p>
                  <Link href="/contact" className="btn-pill-primary text-xs !py-2.5 !px-4 w-fit">
                    {t('sidebar_cta_button')}
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
