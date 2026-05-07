'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ArrowRight, Zap, Globe2, BookOpen, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

const TIMELINE_KEYS = ['2022', '2023', '2024', '2025a', '2025b', '2026', 'today'] as const;

const TIMELINE_YEARS: Record<typeof TIMELINE_KEYS[number], string> = {
  '2022': '2022',
  '2023': '2023',
  '2024': '2024',
  '2025a': 'Jan 2025',
  '2025b': 'Jun 2025',
  '2026': '2026',
  'today': '→ Hoje',
};

const VALUE_ICONS = {
  build_in_public: BookOpen,
  move_fast: Zap,
  tech_with_purpose: Target,
  global_mindset: Globe2,
};

const VALUE_KEYS = ['build_in_public', 'move_fast', 'tech_with_purpose', 'global_mindset'] as const;

export default function AboutPage() {
  const t = useTranslations('about');
  const timeline = useTranslations('timeline');
  const values = useTranslations('values');
  const [activeKey, setActiveKey] = useState<typeof TIMELINE_KEYS[number] | null>(null);

  return (
    <div className="min-h-screen pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="py-16 sm:py-24 max-w-3xl"
        >
          <p className="text-accent-bright font-mono text-sm mb-4">/ sobre</p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground tracking-tight mb-6">
            {t('title')}
          </h1>
          <p className="text-xl text-foreground-muted">{t('subtitle')}</p>
        </motion.div>

        {/* Bio */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 pb-24 border-b border-border"
        >
          <div className="space-y-6">
            {[t('bio_1'), t('bio_2')].map((bio, i) => (
              <p key={i} className="text-foreground-muted leading-relaxed">{bio}</p>
            ))}
          </div>
          <div className="space-y-6">
            {[t('bio_3'), t('bio_4')].map((bio, i) => (
              <p key={i} className="text-foreground-muted leading-relaxed">{bio}</p>
            ))}
          </div>
        </motion.div>

        {/* Timeline */}
        <section className="py-24">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold text-foreground mb-16"
          >
            {t('timeline_title')}
          </motion.h2>

          <div className="relative">
            {/* Vertical line (desktop) */}
            <div className="hidden lg:block absolute left-[180px] top-0 bottom-0 w-px bg-border" />

            <div className="space-y-6">
              {TIMELINE_KEYS.map((key, i) => {
                const isActive = activeKey === key;
                const isLast = key === 'today';
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.5, delay: i * 0.07 }}
                  >
                    <button
                      onClick={() => setActiveKey(isActive ? null : key)}
                      className="w-full text-left group"
                    >
                      <div className="flex items-start gap-8 lg:gap-0">
                        {/* Year label */}
                        <div className="lg:w-[180px] shrink-0 pt-1">
                          <span className={cn(
                            'font-mono text-sm transition-colors',
                            isActive ? 'text-accent-bright' : 'text-foreground-subtle group-hover:text-foreground-muted'
                          )}>
                            {TIMELINE_YEARS[key]}
                          </span>
                        </div>

                        {/* Dot */}
                        <div className="hidden lg:flex items-center justify-center w-0 relative">
                          <div className={cn(
                            'absolute w-3 h-3 rounded-full border-2 transition-all duration-200 -translate-x-1/2',
                            isActive
                              ? 'border-accent-bright bg-accent-bright scale-125'
                              : 'border-border-strong bg-background group-hover:border-accent'
                          )} />
                        </div>

                        {/* Content */}
                        <div className="lg:pl-12 flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className={cn(
                              'font-semibold text-lg transition-colors',
                              isActive ? 'text-foreground' : 'text-foreground-muted group-hover:text-foreground',
                              isLast && 'text-accent-bright'
                            )}>
                              {timeline(`${key}.title` as 'today.title')}
                            </h3>
                            {isLast && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent-bright border border-accent/30 font-mono animate-pulse">
                                live
                              </span>
                            )}
                          </div>

                          <AnimatePresence>
                            {isActive && (
                              <motion.p
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                transition={{ duration: 0.25 }}
                                className="text-foreground-subtle text-sm leading-relaxed overflow-hidden"
                              >
                                {timeline(`${key}.description` as 'today.description')}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-24 border-t border-border">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold text-foreground mb-12"
          >
            {t('values_title')}
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUE_KEYS.map((key, i) => {
              const Icon = VALUE_ICONS[key];
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="p-6 rounded-lg border border-border bg-surface hover:border-border-strong hover:bg-surface-elevated transition-all group"
                >
                  <Icon
                    size={20}
                    className="text-accent mb-4 group-hover:text-accent-bright transition-colors"
                  />
                  <h3 className="font-semibold text-foreground mb-2">
                    {values(`${key}.title` as 'build_in_public.title')}
                  </h3>
                  <p className="text-sm text-foreground-subtle leading-relaxed">
                    {values(`${key}.description` as 'build_in_public.description')}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* CTAs */}
        <section className="pb-24 flex flex-wrap gap-4">
          <Link
            href="/now"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border bg-surface hover:border-border-strong hover:bg-surface-elevated text-foreground-muted hover:text-foreground font-medium text-sm transition-all"
          >
            {t('cta_now')}
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent hover:bg-accent-bright text-foreground font-medium text-sm transition-all"
          >
            {t('cta_contact')}
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </section>
      </div>
    </div>
  );
}
