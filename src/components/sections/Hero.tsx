'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Globe } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export default function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="relative min-h-screen flex items-center">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-radial-top pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-4xl"
        >
          {/* Location badge */}
          <motion.div variants={item} className="inline-flex items-center gap-2 mb-8">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface text-xs text-foreground-muted font-mono">
              <MapPin size={11} className="text-accent-bright" />
              <span>{t('based_in')}</span>
              <span className="text-foreground-subtle">·</span>
              <Globe size={11} className="text-accent-bright" />
              <span>{t('open_to')}</span>
            </div>
          </motion.div>

          {/* Name */}
          <motion.h1
            variants={item}
            className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tight text-foreground leading-none mb-4"
          >
            {t('name')}
          </motion.h1>

          {/* Role */}
          <motion.p
            variants={item}
            className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground-muted mb-6 tracking-tight"
          >
            {t('role')}
          </motion.p>

          {/* Tagline */}
          <motion.p
            variants={item}
            className="text-base sm:text-lg text-foreground-subtle max-w-xl mb-10 leading-relaxed"
          >
            {t('tagline')}
          </motion.p>

          {/* CTAs */}
          <motion.div variants={item} className="flex flex-wrap gap-4">
            <Link
              href="/projects"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent hover:bg-accent-bright text-foreground font-medium text-sm transition-all duration-200 hover:shadow-lg hover:shadow-accent/20"
            >
              {t('cta_projects')}
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border hover:border-border-strong bg-surface hover:bg-surface-elevated text-foreground-muted hover:text-foreground font-medium text-sm transition-all duration-200"
            >
              {t('cta_contact')}
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-px h-12 bg-gradient-to-b from-accent-bright to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
}
