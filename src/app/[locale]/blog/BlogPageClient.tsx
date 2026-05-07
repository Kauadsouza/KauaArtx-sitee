'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { PenLine } from 'lucide-react';

export default function BlogPageClient() {
  const t = useTranslations('blog');

  return (
    <div className="min-h-screen pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-32">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="py-16 sm:py-24"
        >
          <p className="text-accent-bright font-mono text-sm mb-4">/ blog</p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground tracking-tight mb-6">
            {t('title')}
          </h1>
          <p className="text-xl text-foreground-muted max-w-2xl">{t('subtitle')}</p>
        </motion.div>

        {/* Coming soon state */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex flex-col items-center justify-center py-32 text-center border border-border rounded-2xl bg-surface"
        >
          <div className="w-16 h-16 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center mb-6">
            <PenLine size={24} className="text-accent-bright" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">{t('coming_soon')}</h2>
          <p className="text-foreground-muted max-w-sm leading-relaxed">{t('coming_soon_desc')}</p>
          <div className="mt-8 flex items-center gap-2 text-xs font-mono text-foreground-subtle">
            <span className="w-2 h-2 rounded-full bg-accent-bright animate-pulse" />
            Em preparação
          </div>
        </motion.div>
      </div>
    </div>
  );
}
