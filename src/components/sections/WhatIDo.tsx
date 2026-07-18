'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Handshake, Rocket, Youtube, Compass } from 'lucide-react';

export default function WhatIDo() {
  const t = useTranslations('what_i_do');

  const cards = [
    {
      icon: Handshake,
      title: t('loog_title'),
      tag: t('loog_tag'),
      desc: t('loog_desc'),
      iconBg: 'bg-accent/10 text-accent-bright',
      tagStyle: 'text-accent-deep bg-accent/10 border-accent/25',
      glow: 'bg-accent/15',
    },
    {
      icon: Rocket,
      title: t('facility_title'),
      tag: t('facility_tag'),
      desc: t('facility_desc'),
      iconBg: 'bg-accent-2/10 text-accent-2-bright',
      tagStyle: 'text-accent-2-deep bg-accent-2/10 border-accent-2/25',
      glow: 'bg-accent-2/15',
    },
    {
      icon: Youtube,
      title: t('youtube_title'),
      tag: t('youtube_tag'),
      desc: t('youtube_desc'),
      // Vermelho-brasa: fica na família quente da paleta (fogueira),
      // mas ainda acena pro vermelho do YouTube
      iconBg: 'bg-[#ff5a3c]/12 text-[#ff7a52]',
      tagStyle: 'text-[#ff7a52] bg-[#ff5a3c]/12 border-[#ff5a3c]/30',
      glow: 'bg-[#ff5a3c]/15',
    },
  ];

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2.5 mb-4">
            <Compass size={15} className="text-accent-bright" />
            <span aria-hidden className="h-px w-12 bg-gradient-to-r from-accent/60 to-transparent" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-3">
            {t('title')}
          </h2>
          <p className="text-foreground-muted text-lg">{t('subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map(({ icon: Icon, title, tag, desc, iconBg, tagStyle, glow }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
              className="group relative flex flex-col p-7 rounded-2xl bg-surface/70 backdrop-blur-xl border border-border shadow-sm hover:shadow-xl hover:shadow-accent/5 hover:border-border-strong transition-all duration-300 overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-px hairline-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {/* Brilho de aurora que acende no hover, na cor do card */}
              <div aria-hidden className={`absolute -top-24 -right-16 w-56 h-56 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none ${glow}`} />
              {/* Numeração editorial em pixel */}
              <span aria-hidden className="absolute top-7 right-7 font-pixel text-[9px] text-foreground-subtle/50 group-hover:text-foreground-subtle transition-colors">
                {String(i + 1).padStart(2, '0')}
              </span>

              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ring-1 ring-inset ring-white/5 transition-transform duration-300 group-hover:scale-105 ${iconBg}`}>
                <Icon size={22} />
              </div>

              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl font-bold tracking-tight text-foreground">{title}</h3>
              </div>

              <span className={`self-start text-xs px-3 py-1 rounded-full border font-semibold mb-4 ${tagStyle}`}>
                {tag}
              </span>

              <p className="text-sm text-foreground-muted leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
