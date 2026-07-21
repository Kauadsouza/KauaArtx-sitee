'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Youtube, Instagram, ArrowRight, ArrowUpRight } from 'lucide-react';

// Seção 4 da estrutura de aventura: à esquerda DOIS cards pequenos
// (canal do YouTube / Instagram — links externos, abrem em nova aba);
// à direita UM card-destaque grande com foto de fundo + CTA de contato.
// Espelha o "2 small + 1 big" do print.
const SMALL = [
  {
    icon: Youtube,
    titleKey: 'spot_youtube_title',
    descKey: 'spot_youtube_desc',
    href: 'https://www.youtube.com/@KauartX',
  },
  {
    icon: Instagram,
    titleKey: 'spot_instagram_title',
    descKey: 'spot_instagram_desc',
    href: 'https://www.instagram.com/kauaartx/',
  },
] as const;

export default function AdventureSpotlight() {
  const t = useTranslations('home');

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.35fr] gap-6">
          {/* ── Dois cards pequenos ── */}
          <div className="grid grid-rows-2 gap-6">
            {SMALL.map(({ icon: Icon, titleKey, descKey, href }, i) => (
              <motion.div
                key={href}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex flex-col justify-center h-full rounded-3xl bg-surface border border-border p-7 hover:border-border-strong hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div aria-hidden className="absolute -top-16 -right-12 w-44 h-44 rounded-full blur-3xl bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="relative w-12 h-12 rounded-2xl bg-accent/12 text-accent-bright flex items-center justify-center mb-4">
                    <Icon size={22} />
                  </div>
                  <h3 className="relative text-xl font-bold text-foreground mb-2 flex items-center gap-1.5">
                    {t(titleKey)}
                    <ArrowUpRight
                      size={16}
                      className="text-accent-deep opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                    />
                  </h3>
                  <p className="relative text-sm text-foreground-muted leading-relaxed">
                    {t(descKey)}
                  </p>
                </a>
              </motion.div>
            ))}
          </div>

          {/* ── Card-destaque com CTA ── */}
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-3xl overflow-hidden border border-border min-h-[360px] flex items-end p-8 sm:p-12"
          >
            <Image
              src="/images/hero-photo.webp"
              alt=""
              fill
              sizes="(min-width: 1024px) 680px, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e14] via-[#0a0e14]/75 to-[#0a0e14]/20" />
            <div className="relative max-w-md">
              <span className="font-pixel text-[10px] tracking-[0.3em] uppercase text-accent-deep">
                {t('spot_kicker')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-4 [text-shadow:0_2px_12px_rgba(0,0,0,0.6)]">
                {t('spot_cta_title')}
              </h2>
              <p className="text-white/85 leading-relaxed mb-7 [text-shadow:0_1px_6px_rgba(0,0,0,0.7)]">
                {t('spot_cta_desc')}
              </p>
              <Link href="/contact" className="group btn-pill-primary text-base">
                {t('spot_cta_button')}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
