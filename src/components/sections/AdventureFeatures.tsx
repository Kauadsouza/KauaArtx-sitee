'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Handshake, Youtube, Compass, Instagram } from 'lucide-react';

// Seção 1 da estrutura de aventura: à ESQUERDA um bloco de features com
// ícones redondos laranja; à DIREITA duas artes verticais em destaque
// (jornada + canal). Espelha o "features + 2 image cards" do print.
const FEATURES = [
  { icon: Handshake, k: 'sales' },
  { icon: Youtube, k: 'content' },
  { icon: Instagram, k: 'instagram' },
] as const;

const HIGHLIGHTS = [
  {
    img: '/images/kaua-journey.png',
    titleKey: 'highlight_journey_title',
    descKey: 'highlight_journey_desc',
  },
  {
    img: '/images/login-bg-mobile.webp',
    titleKey: 'highlight_channel_title',
    descKey: 'highlight_channel_desc',
  },
] as const;

export default function AdventureFeatures() {
  const t = useTranslations('home');

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* ── Esquerda: título + grade de features ── */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <Compass size={15} className="text-accent-bright" />
              <span className="font-pixel text-[10px] tracking-[0.3em] uppercase text-accent-deep">
                {t('features_kicker')}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-3">
              {t('features_title')}
            </h2>
            <p className="text-foreground-muted text-lg mb-10 max-w-xl">
              {t('features_sub')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
              {FEATURES.map(({ icon: Icon, k }, i) => (
                <motion.div
                  key={k}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="flex gap-4"
                >
                  <div className="shrink-0 w-12 h-12 rounded-full bg-accent/12 text-accent-bright flex items-center justify-center ring-1 ring-accent/20">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">{t(`feat_${k}`)}</h3>
                    <p className="text-sm text-foreground-muted leading-relaxed">
                      {t(`feat_${k}_desc`)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── Direita: dois cards de imagem em destaque ── */}
          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            {HIGHLIGHTS.map(({ img, titleKey, descKey }, i) => (
              <motion.div
                key={img}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className={`group relative rounded-2xl overflow-hidden border border-border bg-surface aspect-[3/4] ${
                  i === 1 ? 'mt-6 sm:mt-10' : ''
                }`}
              >
                <Image
                  src={img}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 280px, 45vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e14] via-[#0a0e14]/35 to-transparent" />
                <div aria-hidden className="absolute top-0 inset-x-0 h-px hairline-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="text-sm sm:text-base font-bold text-white mb-1 [text-shadow:0_1px_6px_rgba(0,0,0,0.85)]">
                    {t(titleKey)}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-white/80 leading-snug line-clamp-3">
                    {t(descKey)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
