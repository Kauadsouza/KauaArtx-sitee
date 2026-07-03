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
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Backdrop: grid técnico + aurora verde/ciano */}
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="orb w-[480px] h-[480px] top-[-8%] left-[-8%] bg-accent/25 dark:bg-accent/20 animate-float-slow" />
      <div className="orb w-[420px] h-[420px] bottom-[-5%] right-[-6%] bg-accent-2/20 dark:bg-accent-2/15 animate-float-slower" />
      <div className="absolute inset-0 gradient-radial-top pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-4xl"
        >
          {/* Location badge */}
          <motion.div variants={item} className="inline-flex items-center gap-2 mb-10">
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full glass text-xs text-foreground-muted font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-glow animate-pulse-dot" />
              <MapPin size={11} className="text-accent-bright" />
              <span>{t('based_in')}</span>
              <span className="text-foreground-subtle">·</span>
              <Globe size={11} className="text-accent-2" />
              <span>{t('open_to')}</span>
            </div>
          </motion.div>

          {/* Name */}
          <motion.h1
            variants={item}
            className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tighter text-foreground leading-[0.95] mb-5"
          >
            {t('name')}
          </motion.h1>

          {/* Role — gradiente verde→ciano animado */}
          <motion.p
            variants={item}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-6"
          >
            <span className="text-gradient">{t('role')}</span>
          </motion.p>

          {/* Tagline */}
          <motion.p
            variants={item}
            className="text-base sm:text-lg text-foreground-muted max-w-xl mb-12 leading-relaxed"
          >
            {t('tagline')}
          </motion.p>

          {/* CTAs */}
          <motion.div variants={item} className="flex flex-wrap gap-4">
            <Link href="/projects" className="group btn-pill-primary text-sm">
              {t('cta_projects')}
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <Link href="/contact" className="btn-pill-secondary text-sm">
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
            className="w-px h-12 bg-gradient-to-b from-accent-glow via-accent-2-glow/60 to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
}
