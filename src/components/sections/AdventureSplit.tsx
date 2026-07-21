'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Youtube, ArrowRight, Mountain } from 'lucide-react';

const YOUTUBE_URL = 'https://www.youtube.com/@KauartX';

// Seção 2 da estrutura de aventura: painel de TEXTO à esquerda + FOTO
// grande de paisagem à direita. Espelha o split do print.
export default function AdventureSplit() {
  const t = useTranslations('home');

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* ── Painel de texto ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-3xl bg-surface border border-border p-8 sm:p-12 flex flex-col justify-center overflow-hidden"
          >
            <div className="orb w-[320px] h-[320px] -top-20 -left-16 bg-accent/15 animate-float-slow" />
            <div className="relative">
              <div className="flex items-center gap-2.5 mb-4">
                <Mountain size={15} className="text-accent-bright" />
                <span className="font-pixel text-[10px] tracking-[0.3em] uppercase text-accent-deep">
                  {t('split_kicker')}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-5">
                {t('split_title')}
              </h2>
              <p className="text-foreground-muted leading-relaxed mb-4">{t('split_p1')}</p>
              <p className="text-foreground-muted leading-relaxed mb-8">{t('split_p2')}</p>
              <a
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group btn-pill-primary text-sm w-fit"
              >
                <Youtube size={15} />
                {t('split_button')}
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </motion.div>

          {/* ── Foto de paisagem ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-3xl overflow-hidden border border-border min-h-[300px] lg:min-h-0"
          >
            {/* A foto já vem recortada na proporção exata do painel (1,303),
                então nada é cortado aqui e cada pixel salvo é pixel visível —
                é o que mantém a nitidez máxima. 95 = topo permitido pelo
                next.config (images.qualities), igual ao hero e ao login. */}
            <Image
              src="/images/journey-sunset.webp"
              alt=""
              fill
              quality={95}
              sizes="(min-width: 1024px) 600px, 100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#04191A]/75 via-[#04191A]/10 to-transparent" />
            <div className="absolute bottom-4 left-4 boarding-tag text-xs">
              <Mountain size={13} className="text-accent-bright" />
              BRA → MUNDO · GO FAR
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
