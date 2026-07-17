'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Youtube, Instagram, Linkedin, Twitter } from 'lucide-react';

const YOUTUBE_URL = 'https://www.youtube.com/@KauartX';

const SOCIALS = [
  { href: YOUTUBE_URL, icon: Youtube, label: 'YouTube' },
  { href: 'https://www.instagram.com/kauaartx/', icon: Instagram, label: 'Instagram' },
  { href: 'https://www.linkedin.com/in/kauadsouza/', icon: Linkedin, label: 'LinkedIn' },
  { href: 'https://x.com/KauaArtx', icon: Twitter, label: 'Twitter / X' },
];

// Hero pôster: a foto oficial do Fuji com o "ARTX" já embutido ATRÁS
// da montanha (em 4K) — o site só coloca os controles por cima.
export default function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="relative h-[100svh] min-h-[600px] overflow-hidden">
      {/* ── A foto oficial em tela cheia ── */}
      <motion.div
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
      >
        <Image
          src="/images/hero-photo.webp"
          alt="ARTX gigante atrás do Monte Fuji, com uma loja de conveniência iluminada à noite"
          fill
          priority
          quality={95}
          sizes="100vw"
          className="object-cover select-none"
        />
        {/* Véus leves só pra legibilidade do menu e da base */}
        <div aria-hidden className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#04100a]/70 to-transparent" />
      </motion.div>

      {/* Nome pra SEO/leitores de tela (o visual está na foto) */}
      <h1 className="sr-only">{`${t('name')} — ${t('role')}`}</h1>

      {/* ── Kicker discreto no topo ── */}
      <motion.span
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-x-0 top-[7%] z-[1] text-center font-pixel text-[8px] sm:text-[10px] text-white/90 tracking-[0.4em] uppercase [text-shadow:0_1px_4px_rgba(0,0,0,0.9)]"
      >
        {t('name')}
      </motion.span>

      {/* Sombra de leitura na base */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-40 z-[1] bg-gradient-to-t from-[#04100a]/80 to-transparent pointer-events-none"
      />

      {/* ── Botão central estilo "WATCH TOUR" ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="absolute inset-x-0 top-[52%] sm:top-[55%] z-[2] flex flex-col items-center gap-3 px-4"
      >
        <a
          href={YOUTUBE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 px-8 sm:px-10 py-3 sm:py-3.5 rounded-full border-2 border-white/85 text-white text-xs sm:text-sm font-bold tracking-[0.22em] uppercase backdrop-blur-[2px] bg-[#04100a]/20 transition-all hover:bg-white hover:text-[#04100a] hover:shadow-[0_0_40px_rgba(255,255,255,0.35)]"
        >
          <Youtube size={16} />
          {t('watch_tour')}
        </a>
        <span className="font-pixel text-[7px] sm:text-[9px] text-white/85 tracking-[0.3em] uppercase [text-shadow:0_1px_4px_rgba(0,0,0,0.9)]">
          {t('role')}
        </span>
      </motion.div>

      {/* ── "Saiba mais" vertical à esquerda ── */}
      <div className="hidden sm:flex absolute left-6 bottom-8 z-[2] flex-col items-center gap-3">
        <span className="[writing-mode:vertical-rl] rotate-180 text-[10px] tracking-[0.3em] text-white/70 uppercase">
          {t('learn_more')}
        </span>
        <motion.div
          animate={{ scaleY: [1, 0.6, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-16 bg-white/50 origin-top"
        />
      </div>

      {/* ── Sociais no canto inferior direito ── */}
      <div className="absolute right-5 sm:right-7 bottom-6 z-[2] flex items-center gap-1.5">
        {SOCIALS.map(({ href, icon: Icon, label }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="p-2 rounded-full text-white/80 hover:text-accent-bright hover:bg-white/10 transition-all"
          >
            <Icon size={16} />
          </a>
        ))}
      </div>
    </section>
  );
}
