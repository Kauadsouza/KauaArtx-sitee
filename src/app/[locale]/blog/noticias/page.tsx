import type { Metadata } from 'next';
import { Clock3, Radio, ShieldCheck } from 'lucide-react';
import BlogCard from '@/components/blog/BlogCard';
import BlogTabs from '@/components/blog/BlogTabs';
import { getBlogMeta } from '@/data/blog-curation';
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
    title: isPt ? 'Notícias para viajantes e nômades' : 'News for travellers and nomads',
    description: isPt
      ? 'Atualizações verificadas sobre documentos, fronteiras e trabalho remoto para quem quer viajar.'
      : 'Verified updates on documents, borders, and remote work for people who want to travel.',
  };
}

export default async function TravelNewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isPt = locale === 'pt';
  const posts = (await getPublishedPosts())
    .filter((post) => getBlogMeta(post).kind === 'news')
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  return (
    <div className="min-h-screen pt-24">
      <div className="mx-auto max-w-7xl px-4 pb-32 sm:px-6 lg:px-8">
        <header className="py-14 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] lg:items-end">
            <div>
              <div className="mb-5 inline-flex items-center rounded-full border border-[#F5C97B]/35 bg-[#F5C97B]/10 px-3 py-1.5 text-xs font-semibold text-[#F5C97B]">
                <span aria-hidden className="mr-2 h-1.5 w-1.5 rounded-full bg-[#F5C97B]" />
                RADAR NÔMADE
              </div>
              <h1 className="max-w-4xl text-5xl font-bold tracking-[-0.055em] text-foreground sm:text-7xl lg:text-8xl">
                {isPt ? 'Notícia que muda a viagem.' : 'News that changes the trip.'}
              </h1>
            </div>

            <div className="lg:pb-2">
              <p className="text-lg leading-relaxed text-foreground-muted">
                {isPt
                  ? 'Documentos, fronteiras e trabalho remoto explicados sem alarme. Cada texto mostra quando foi checado e aponta para a fonte oficial.'
                  : 'Documents, borders, and remote work explained without alarm. Every post shows when it was checked and links to the official source.'}
              </p>
              <div className="mt-7">
                <BlogTabs active="news" locale={locale} />
              </div>
            </div>
          </div>
        </header>

        <div className="mb-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
          <div className="flex items-start gap-3 bg-surface p-5">
            <Clock3 size={19} className="mt-0.5 shrink-0 text-[#F5C97B]" />
            <div>
              <p className="text-sm font-semibold text-foreground">{isPt ? 'Checagem' : 'Checked'}</p>
              <p className="mt-1 text-xs leading-relaxed text-foreground-muted">
                {isPt ? '14 de agosto de 2026' : 'August 14, 2026'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-surface p-5">
            <ShieldCheck size={19} className="mt-0.5 shrink-0 text-accent" />
            <div>
              <p className="text-sm font-semibold text-foreground">{isPt ? 'Fontes' : 'Sources'}</p>
              <p className="mt-1 text-xs leading-relaxed text-foreground-muted">
                {isPt ? 'Governos e União Europeia' : 'Governments and the European Union'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-surface p-5">
            <Radio size={19} className="mt-0.5 shrink-0 text-accent" />
            <div>
              <p className="text-sm font-semibold text-foreground">{isPt ? 'Regra do radar' : 'Radar rule'}</p>
              <p className="mt-1 text-xs leading-relaxed text-foreground-muted">
                {isPt ? 'O que não começou fica marcado' : 'What has not started is clearly marked'}
              </p>
            </div>
          </div>
        </div>

        {posts.length > 0 ? (
          <section aria-label={isPt ? 'Últimas notícias de viagem' : 'Latest travel news'}>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
              <BlogCard post={posts[0]} locale={locale} featured priority />
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
                {posts.slice(1, 3).map((post, index) => (
                  <BlogCard key={post.id} post={post} locale={locale} priority={index === 0} />
                ))}
              </div>
            </div>
            {posts.length > 3 && (
              <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {posts.slice(3).map((post) => (
                  <BlogCard key={post.id} post={post} locale={locale} />
                ))}
              </div>
            )}
          </section>
        ) : (
          <div className="rounded-3xl border border-dashed border-border-strong bg-surface px-6 py-16 text-center text-foreground-muted">
            {isPt ? 'Nenhuma atualização verificada por enquanto.' : 'No verified updates yet.'}
          </div>
        )}

        <aside className="mt-12 rounded-2xl border border-border bg-surface/75 p-6 text-sm leading-relaxed text-foreground-muted">
          <strong className="text-foreground">{isPt ? 'Antes de comprar:' : 'Before buying:'}</strong>{' '}
          {isPt
            ? 'as regras podem mudar depois da data de checagem. Abra a fonte oficial dentro da notícia e confirme de novo para o seu passaporte e para o motivo real da viagem.'
            : 'rules may change after the check date. Open the official source inside the article and check again for your passport and the actual purpose of your trip.'}
        </aside>
      </div>
    </div>
  );
}
