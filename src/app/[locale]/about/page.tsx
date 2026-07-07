'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowRight, Youtube, Heart, TrendingUp, PackageCheck, Share2,
  Briefcase, Rocket, Megaphone, Building2, Globe2, Plane, GraduationCap,
  Sparkles, Wrench, School,
} from 'lucide-react';

const YOUTUBE_URL = 'https://www.youtube.com/@KauartX';

// Ordem: mais recente primeiro
const EXPERIENCES = [
  { key: 'loog', icon: Briefcase, current: true },
  { key: 'facility', icon: Rocket, current: true },
  { key: 'diamond', icon: Building2, current: false },
  { key: 'hlts', icon: Wrench, current: false },
  { key: 'agencies', icon: Megaphone, current: false },
] as const;

const PROJECTS = [
  { key: 'kadenduo', icon: Sparkles, color: 'bg-accent/10 text-accent-deep' },
  { key: 'finance_card', icon: School, color: 'bg-accent-2/10 text-accent-2-deep' },
  { key: 'null_forge', icon: Share2, color: 'bg-accent/10 text-accent-deep' },
] as const;

const GOALS = [
  { key: 'international', icon: Globe2 },
  { key: 'abroad', icon: Plane },
  { key: 'usa', icon: GraduationCap },
  { key: 'youtube', icon: Youtube },
] as const;

const VALUES = [
  { key: 'people_first', icon: Heart, color: 'bg-accent-2/10 text-accent-2-deep' },
  { key: 'always_growing', icon: TrendingUp, color: 'bg-accent/10 text-accent-deep' },
  { key: 'real_delivery', icon: PackageCheck, color: 'bg-accent/10 text-accent-deep' },
  { key: 'share_the_journey', icon: Share2, color: 'bg-accent-2/10 text-accent-2-deep' },
] as const;

export default function AboutPage() {
  const t = useTranslations('about');
  const exp = useTranslations('experience');
  const projects = useTranslations('side_projects');
  const goals = useTranslations('goals');
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
          className="py-12 sm:py-20 flex flex-col-reverse sm:flex-row sm:items-center gap-8 sm:gap-12"
        >
          <div className="flex-1">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tighter text-foreground mb-5">
              {t('title')}
            </h1>
            <p className="text-lg sm:text-2xl font-semibold mb-2">
              <span className="text-gradient">{t('subtitle')}</span>
            </p>
          </div>
          <div className="relative shrink-0 self-center">
            <div
              aria-hidden
              className="absolute inset-2 rounded-full bg-accent/15 blur-2xl"
            />
            <Image
              src="/images/kaua-pixel.png"
              alt={t('portrait_alt')}
              width={720}
              height={735}
              priority
              sizes="(min-width: 640px) 13rem, 10rem"
              className="relative w-40 sm:w-52 h-auto drop-shadow-[0_12px_32px_rgba(53,224,101,0.2)]"
            />
          </div>
        </motion.div>

        {/* Bio */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-6 text-base sm:text-lg text-foreground-muted leading-relaxed mb-16 sm:mb-20"
        >
          <p>{t('bio_1')}</p>
          <p>{t('bio_2')}</p>
          <p>{t('bio_3')}</p>
          <p>{t('bio_4')}</p>
        </motion.div>

        {/* Experiências */}
        <section className="mb-16 sm:mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground mb-8 sm:mb-10"
          >
            {t('experience_title')}
          </motion.h2>

          <div className="space-y-4">
            {EXPERIENCES.map(({ key, icon: Icon, current }, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="group flex flex-col sm:flex-row gap-4 p-5 sm:p-6 rounded-2xl bg-surface border border-border shadow-sm hover:shadow-lg hover:border-border-strong transition-all duration-300"
              >
                <div
                  className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${
                    current
                      ? 'bg-accent/10 text-accent-deep'
                      : 'bg-surface-elevated text-foreground-subtle'
                  }`}
                >
                  <Icon size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-foreground">
                      {exp(`${key}.place`)}
                    </h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface-elevated border border-border text-foreground-muted font-semibold">
                      {exp(`${key}.role`)}
                    </span>
                    {current && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/25 text-accent-deep font-bold">
                        {exp('current_badge')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground-muted leading-relaxed">
                    {exp(`${key}.desc`)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Projetos próprios */}
        <section className="mb-16 sm:mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground mb-8 sm:mb-10"
          >
            {t('projects_title')}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PROJECTS.map(({ key, icon: Icon, color }, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group flex flex-col p-6 rounded-2xl bg-surface border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon size={20} />
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-foreground">
                    {projects(`${key}.name`)}
                  </h3>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-elevated border border-border text-foreground-muted font-semibold">
                    {projects(`${key}.tag`)}
                  </span>
                </div>
                <p className="text-sm text-foreground-muted leading-relaxed">
                  {projects(`${key}.desc`)}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Objetivos */}
        <section className="mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl overflow-hidden p-7 sm:p-12 bg-surface border border-border shadow-sm"
          >
            <div className="orb w-[280px] h-[280px] -top-20 -right-16 bg-accent-2/15 animate-float-slow" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px hairline-gradient" />

            <div className="relative">
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-2">
                <span className="text-gradient">{t('goals_title')}</span>
              </h2>
              <p className="text-foreground-muted mb-8">{goals('subtitle')}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {GOALS.map(({ key, icon: Icon }, i) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-surface-elevated/70 border border-border"
                  >
                    <div className="w-9 h-9 shrink-0 rounded-xl bg-accent/10 text-accent-deep flex items-center justify-center">
                      <Icon size={17} />
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {goals(key)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Values */}
        <section className="mb-16 sm:mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground mb-8 sm:mb-10"
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
        <section className="pb-24 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
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
