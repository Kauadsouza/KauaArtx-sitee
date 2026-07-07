'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Youtube, Plane, TrendingUp, Camera, ArrowRight } from 'lucide-react';

const YOUTUBE_URL = 'https://www.youtube.com/@KauartX';

export default function YouTubeSection() {
  const t = useTranslations('youtube_section');

  const pillars = [
    { icon: Plane, title: t('pillar_travel'), desc: t('pillar_travel_desc') },
    { icon: TrendingUp, title: t('pillar_growth'), desc: t('pillar_growth_desc') },
    { icon: Camera, title: t('pillar_journey'), desc: t('pillar_journey_desc') },
  ];

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-3xl overflow-hidden p-7 sm:p-12 lg:p-16 bg-surface border border-border shadow-sm"
        >
          {/* Aurora interna */}
          <div className="orb w-[380px] h-[380px] -top-24 -right-20 bg-accent-2/20 animate-float-slow" />
          <div className="orb w-[320px] h-[320px] -bottom-24 -left-16 bg-accent-bright/20 animate-float-slower" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px hairline-gradient" />

          <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center">
                  <Youtube size={24} />
                </div>
                <span className="font-pixel text-[10px] sm:text-xs text-foreground-muted uppercase">@KauartX</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                <span className="text-gradient">{t('title')}</span>
              </h2>
              <p className="text-foreground-muted text-lg max-w-2xl mb-10 leading-relaxed">
                {t('subtitle')}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
                {pillars.map(({ icon: Icon, title, desc }, i) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
                    className="flex flex-col gap-2 p-5 rounded-2xl bg-surface-elevated/70 border border-border"
                  >
                    <Icon size={20} className="text-accent-bright" />
                    <h3 className="font-bold text-foreground">{title}</h3>
                    <p className="text-sm text-foreground-muted leading-relaxed">{desc}</p>
                  </motion.div>
                ))}
              </div>

              <a
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group btn-pill-primary text-sm"
              >
                <Youtube size={15} />
                {t('button')}
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </a>
            </div>

            {/* Arte da jornada — o aventureiro a caminho do horizonte */}
            <motion.div
              initial={{ opacity: 0, y: 24, rotate: 1.5 }}
              whileInView={{ opacity: 1, y: 0, rotate: -1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-w-xs mx-auto lg:mx-0 w-full hover:rotate-0 transition-transform duration-500"
            >
              <div className="relative rounded-2xl overflow-hidden border border-border-strong shadow-2xl shadow-black/50">
                <Image
                  src="/images/kaua-journey.png"
                  alt={t('image_alt')}
                  width={960}
                  height={1440}
                  sizes="(min-width: 1024px) 300px, 20rem"
                  className="w-full h-auto"
                />
                <div className="absolute inset-x-0 bottom-0 p-4 pt-12 bg-gradient-to-t from-black/75 to-transparent">
                  <span className="inline-flex items-center gap-2 font-pixel text-[9px] text-white/90 uppercase">
                    <Plane size={11} className="text-accent-bright" />
                    BRA → MUNDO · GO FAR
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
