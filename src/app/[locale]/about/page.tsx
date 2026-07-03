'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Youtube, Heart, TrendingUp, PackageCheck, Share2 } from 'lucide-react';

const YOUTUBE_URL = 'https://www.youtube.com/@KauartX';

const TIMELINE_KEYS = ['2022', '2023', '2024', '2025', '2026', 'today'] as const;

const VALUES = [
  { key: 'people_first', icon: Heart, color: 'bg-accent-2/10 text-accent-2-deep' },
  { key: 'always_growing', icon: TrendingUp, color: 'bg-accent/10 text-accent-deep' },
  { key: 'real_delivery', icon: PackageCheck, color: 'bg-accent/10 text-accent-deep' },
  { key: 'share_the_journey', icon: Share2, color: 'bg-accent-2/10 text-accent-2-deep' },
] as const;

export default function AboutPage() {
  const t = useTranslations('about');
  const timeline = useTranslations('timeline');
  const values = useTranslations('values');

  return (
    <div className="min-h-screen pt-24 relative overflow-hidden">
      <div className="orb w-[420px] h-[420px] top-[-6%] right-[-8%] bg-accent-2/20 animate-float-slow" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="py-16 sm:py-20"
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter text-foreground mb-5">
            {t('title')}
          </h1>
          <p className="text-xl sm:text-2xl font-semibold mb-2">
            <span className="text-gradient">{t('subtitle')}</span>
          </p>
        </motion.div>

        {/* Bio */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-6 text-lg text-foreground-muted leading-relaxed mb-20"
        >
          <p>{t('bio_1')}</p>
          <p>{t('bio_2')}</p>
          <p>{t('bio_3')}</p>
          <p>{t('bio_4')}</p>
        </motion.div>

        {/* Timeline */}
        <section className="mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-10"
          >
            {t('timeline_title')}
          </motion.h2>

          <div className="relative pl-8 border-l-2 border-border space-y-10">
            {TIMELINE_KEYS.map((key, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="relative"
              >
                {/* Ponto na linha */}
                <span
                  className={`absolute -left-[41px] top-1 w-4 h-4 rounded-full border-4 border-background ${
                    key === 'today'
                      ? 'bg-gradient-to-r from-accent-bright to-accent-2'
                      : 'bg-border-strong'
                  }`}
                />
                <span className="text-xs font-bold text-accent-deep uppercase tracking-widest">
                  {key === 'today' ? '•' : key}
                </span>
                <h3 className="text-xl font-bold text-foreground mt-1 mb-1.5">
                  {timeline(`${key}.title`)}
                </h3>
                <p className="text-foreground-muted leading-relaxed">
                  {timeline(`${key}.description`)}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-10"
          >
            {t('values_title')}
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {VALUES.map(({ key, icon: Icon, color }, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group p-6 rounded-2xl bg-surface border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon size={20} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {values(`${key}.title`)}
                </h3>
                <p className="text-sm text-foreground-muted leading-relaxed">
                  {values(`${key}.description`)}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTAs */}
        <section className="pb-24 flex flex-wrap gap-4">
          <a
            href={YOUTUBE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group btn-pill-primary text-sm"
          >
            <Youtube size={15} />
            {t('cta_youtube')}
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
          </a>
          <Link href="/contact" className="group btn-pill-secondary text-sm">
            {t('cta_contact')}
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </section>
      </div>
    </div>
  );
}
