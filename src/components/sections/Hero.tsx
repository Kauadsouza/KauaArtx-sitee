'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Youtube, Briefcase, Rocket, Compass, Plane } from 'lucide-react';

const YOUTUBE_URL = 'https://www.youtube.com/@KauartX';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export default function Hero() {
  const t = useTranslations('hero');

  const chips = [
    { icon: Briefcase, label: t('chip_sales'), color: 'text-accent-deep bg-accent/10 border-accent/25' },
    { icon: Rocket, label: t('chip_ceo'), color: 'text-accent-2-deep bg-accent-2/10 border-accent-2/25' },
    { icon: Youtube, label: t('chip_youtube'), color: 'text-red-400 bg-red-500/10 border-red-500/25' },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Luz de aurora atrás do conteúdo */}
      <div className="orb w-[520px] h-[520px] top-[-10%] left-[-10%] bg-accent-bright/20 animate-float-slow" />
      <div className="orb w-[460px] h-[460px] bottom-[-8%] right-[-8%] bg-accent-2/20 animate-float-slower" />
      <div className="absolute inset-0 gradient-radial-top pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-4xl"
        >
          {/* Badge de movimento */}
          <motion.div variants={item} className="inline-flex items-center gap-2 mb-8">
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full glass text-[10px] sm:text-xs text-foreground-muted font-pixel uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-bright animate-pulse-dot" />
              <Compass size={11} className="text-accent-2-bright" />
              <span>{t('open_to')}</span>
            </div>
          </motion.div>

          {/* Name */}
          <motion.h1
            variants={item}
            className="text-5xl sm:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tighter text-foreground leading-[0.95] mb-5 break-words [text-shadow:0_0_60px_rgba(99,247,141,0.25)]"
          >
            {t('name')}
          </motion.h1>

          {/* Role — gradiente de aurora */}
          <motion.p
            variants={item}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-6"
          >
            <span className="text-gradient">{t('role')}</span>
          </motion.p>

          {/* Tagline */}
          <motion.p
            variants={item}
            className="text-base sm:text-lg text-foreground-muted max-w-xl mb-8 leading-relaxed"
          >
            {t('tagline')}
          </motion.p>

          {/* Chips: as três frentes */}
          <motion.div variants={item} className="flex flex-wrap gap-2.5 mb-6">
            {chips.map(({ icon: Icon, label, color }) => (
              <span
                key={label}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold ${color}`}
              >
                <Icon size={12} />
                {label}
              </span>
            ))}
          </motion.div>

          {/* Etiqueta de embarque — BRA → MUNDO */}
          <motion.div variants={item} className="mb-10">
            <span className="boarding-tag font-pixel text-[10px] sm:text-xs uppercase">
              <Plane size={13} className="text-accent-bright" />
              <span>{t('route')}</span>
              <span className="text-foreground-subtle">·</span>
              <span className="text-accent-deep">GO FAR</span>
            </span>
          </motion.div>

          {/* CTAs — negócio na frente, canal como bônus */}
          <motion.div variants={item} className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
            <Link href="/contact" className="group btn-pill-primary text-sm">
              {t('cta_contact')}
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group btn-pill-secondary text-sm"
            >
              <Youtube size={15} />
              {t('cta_youtube')}
            </a>
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
            className="w-px h-12 bg-gradient-to-b from-accent-bright via-accent-2-bright/60 to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
}
