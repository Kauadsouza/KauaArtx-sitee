'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Mountain, PenLine } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Post } from '@/lib/supabase/types';

// Seção 3 da estrutura de aventura: grade de 4 cards (imagem + botão +
// texto), como o "Dusaws" do print. Puxa os posts do blog; se ainda não
// há posts, mostra 3 cards "em breve" pra grade não ficar vazia.
export default function AdventureGrid({ posts }: { posts: Post[] }) {
  const t = useTranslations('home');
  const locale = useLocale();
  const hasPosts = posts.length > 0;
  const items: (Post | null)[] = hasPosts ? posts.slice(0, 4) : [null, null, null];

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <Mountain size={15} className="text-accent-bright" />
              <span className="font-pixel text-[10px] tracking-[0.3em] uppercase text-accent-deep">
                {t('grid_kicker')}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-3">
              {t('grid_title')}
            </h2>
            <p className="text-foreground-muted text-lg max-w-xl">{t('grid_sub')}</p>
          </div>
          <Link
            href="/blog"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-accent-deep hover:text-accent-bright transition-colors"
          >
            {t('grid_all')}
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((post, i) => (
            <motion.div
              key={post ? post.id : `soon-${i}`}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              {post ? (
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col h-full rounded-2xl overflow-hidden bg-surface border border-border hover:border-border-strong hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/30 transition-all duration-300"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {post.cover_url ? (
                      <Image
                        src={post.cover_url}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 280px, 90vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-surface-elevated to-[#04191A] flex items-center justify-center">
                        <Mountain size={30} className="text-accent/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 p-5">
                    <span className="text-xs text-foreground-subtle mb-2">
                      {formatDate(new Date(post.created_at), locale === 'pt' ? 'pt-BR' : 'en-US')}
                    </span>
                    <h3 className="font-bold text-foreground mb-2 line-clamp-2 group-hover:text-accent-deep transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-foreground-muted line-clamp-2 mb-4">
                        {post.excerpt}
                      </p>
                    )}
                    <span className="mt-auto self-start inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full bg-accent/12 text-accent-deep border border-accent/25 group-hover:bg-accent group-hover:text-[color:var(--ink-on-accent)] group-hover:border-accent transition-colors">
                      {t('grid_read')}
                      <ArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              ) : (
                <div className="flex flex-col h-full rounded-2xl overflow-hidden bg-surface border border-dashed border-border-strong">
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-surface-elevated to-[#04191A] flex items-center justify-center">
                    <PenLine size={26} className="text-accent/40" />
                  </div>
                  <div className="p-5">
                    <span className="text-xs text-accent-deep font-semibold uppercase tracking-wide">
                      {t('grid_soon')}
                    </span>
                    <p className="text-sm text-foreground-muted mt-2">{t('grid_soon_desc')}</p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
