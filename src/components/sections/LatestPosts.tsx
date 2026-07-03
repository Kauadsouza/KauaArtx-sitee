'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, PenLine } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Post } from '@/lib/supabase/types';

export default function LatestPosts({ posts }: { posts: Post[] }) {
  const t = useTranslations('latest_posts');
  const locale = useLocale();

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-3">
              {t('title')}
            </h2>
            <p className="text-foreground-muted text-lg">{t('subtitle')}</p>
          </div>
          <Link
            href="/blog"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-foreground-muted hover:text-accent-deep transition-colors"
          >
            {t('view_all')}
            <ArrowRight size={13} />
          </Link>
        </motion.div>

        {posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-3 py-16 rounded-2xl bg-surface border border-dashed border-border-strong text-center"
          >
            <PenLine size={28} className="text-accent-deep" />
            <p className="text-foreground-muted">{t('empty')}</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col h-full p-7 rounded-2xl bg-surface border border-border shadow-sm hover:shadow-xl hover:shadow-accent/5 hover:-translate-y-1.5 hover:border-border-strong transition-all duration-300"
                >
                  <span className="text-xs text-foreground-subtle mb-3">
                    {formatDate(new Date(post.created_at), locale === 'pt' ? 'pt-BR' : 'en-US')}
                  </span>
                  <h3 className="text-xl font-bold tracking-tight text-foreground mb-2 group-hover:text-accent-deep transition-colors">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm text-foreground-muted leading-relaxed mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                  <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-accent-deep">
                    {t('view_all')}
                    <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground-muted hover:text-accent-deep transition-colors"
          >
            {t('view_all')}
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </section>
  );
}
