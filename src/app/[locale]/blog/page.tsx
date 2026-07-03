import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { ArrowRight, PenLine } from 'lucide-react';
import { getPublishedPosts } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';

// Revalida a cada 60s — posts novos aparecem sozinhos
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });
  return { title: t('title'), description: t('subtitle') };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });
  const posts = await getPublishedPosts();
  const dateLocale = locale === 'pt' ? 'pt-BR' : 'en-US';

  return (
    <div className="min-h-screen pt-24 relative overflow-hidden">
      <div className="orb w-[400px] h-[400px] top-[-8%] left-[-10%] bg-accent-bright/15" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-32">
        {/* Hero */}
        <div className="py-16 sm:py-20">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter text-foreground mb-5">
            {t('title')}
          </h1>
          <p className="text-xl text-foreground-muted max-w-2xl">{t('subtitle')}</p>
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 rounded-3xl bg-surface border border-dashed border-border-strong text-center">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent-deep flex items-center justify-center">
              <PenLine size={26} />
            </div>
            <h2 className="text-2xl font-bold text-foreground">{t('coming_soon')}</h2>
            <p className="text-foreground-muted max-w-sm">{t('coming_soon_desc')}</p>
          </div>
        ) : (
          <div className="space-y-5">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col gap-2 p-7 rounded-2xl bg-surface border border-border shadow-sm hover:shadow-xl hover:shadow-accent/5 hover:-translate-y-1 hover:border-border-strong transition-all duration-300"
              >
                <span className="text-xs text-foreground-subtle">
                  {formatDate(new Date(post.created_at), dateLocale)}
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-foreground group-hover:text-accent-deep transition-colors">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-foreground-muted leading-relaxed">{post.excerpt}</p>
                )}
                <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-accent-deep">
                  {t('read_more')}
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
