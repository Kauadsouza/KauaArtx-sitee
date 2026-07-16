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

// Hero estilo pôster de viagem: o nome GIGANTE atrás da paisagem
// (a arte da jornada com o céu recortado cobre parte das letras).
export default function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="relative h-[100svh] min-h-[600px] overflow-hidden">
      {/* Luz de aurora atrás de tudo */}
      <div className="absolute inset-0 gradient-radial-top pointer-events-none" />
      <div className="orb w-[520px] h-[520px] top-[-10%] left-[-10%] bg-accent-bright/15 animate-float-slow" />
      <div className="orb w-[460px] h-[460px] top-[-5%] right-[-8%] bg-accent-2/15 animate-float-slower" />

      {/* ── O nome gigante (ATRÁS da paisagem) ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-x-0 top-[11%] sm:top-[10%] z-0 flex flex-col items-center px-2"
      >
        <span className="font-pixel text-[8px] sm:text-[11px] text-accent-bright tracking-[0.4em] uppercase mb-2 sm:mb-4 [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]">
          {t('name')}
        </span>
        <h1
          aria-label={`${t('name')} — ${t('role')}`}
          className="font-black text-white leading-[0.85] tracking-tight text-[30vw] sm:text-[24vw] lg:text-[20vw] select-none [text-shadow:0_0_90px_rgba(99,247,141,0.3)]"
        >
          <span aria-hidden>ARTX</span>
        </h1>
      </motion.div>

      {/* ── A paisagem por cima do texto (céu transparente) ── */}
      {/* Desktop/paisagem: faixa larga ancorada embaixo */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-x-0 bottom-0 h-[78%] z-[1] hidden sm:block"
      >
        <Image
          src="/images/kaua-journey-cutout.png"
          alt={t('portrait_alt')}
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover [object-position:center_12%] [image-rendering:pixelated] select-none"
        />
      </motion.div>
      {/* Celular: a arte inteira centralizada */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-x-0 bottom-0 h-[76%] z-[1] sm:hidden"
      >
        <Image
          src="/images/kaua-journey-cutout.png"
          alt={t('portrait_alt')}
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover [object-position:center_8%] [image-rendering:pixelated] select-none"
        />
      </motion.div>

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
        className="absolute inset-x-0 top-[47%] sm:top-[50%] z-[2] flex flex-col items-center gap-3 px-4"
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
