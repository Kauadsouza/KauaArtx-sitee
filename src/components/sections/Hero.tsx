'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Youtube, Instagram, Linkedin, Twitter, ArrowDown } from 'lucide-react';

const YOUTUBE_URL = 'https://www.youtube.com/@KauartX';

const SOCIALS = [
  { href: YOUTUBE_URL, icon: Youtube, label: 'YouTube' },
  { href: 'https://www.instagram.com/kauaartx/', icon: Instagram, label: 'Instagram' },
  { href: 'https://www.linkedin.com/in/kauadsouza/', icon: Linkedin, label: 'LinkedIn' },
  { href: 'https://x.com/KauaArtx', icon: Twitter, label: 'Twitter / X' },
];

// Cascata de entrada — cada elemento surge em sequência, sem pressa.
const reveal = {
  hidden: { opacity: 0, y: 22 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay: 0.2 + i * 0.14, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

// Ken-burns compartilhado pelas duas camadas de foto (base e recorte) —
// mesmos parâmetros = movimento perfeitamente sincronizado.
const kenBurns = {
  animate: { scale: [1, 1.06] },
  transition: { duration: 24, ease: 'easeInOut' as const, repeat: Infinity, repeatType: 'reverse' as const },
};

// No celular a foto ganha um zoom ancorado na base: a crista do Fuji sobe
// até a altura do nome e a oclusão funciona também em telas estreitas.
const PHOTO_WRAP = 'absolute inset-0 scale-[1.12] origin-bottom sm:scale-100';

// Hero editorial: o nome monumental fica ENTRE a foto e um recorte real do
// Fuji (fuji-cutout.webp, céu removido) — a montanha passa na frente da base
// das letras, como um cartaz de viagem.
export default function Hero() {
  const t = useTranslations('hero');

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative h-[100svh] min-h-[600px] overflow-hidden bg-[#0a1526]"
    >
      {/* ── Camada 1: a foto completa ── */}
      <div aria-hidden className={PHOTO_WRAP}>
        <motion.div className="absolute inset-0" {...kenBurns}>
          <Image
            src="/images/hero-photo.webp"
            alt=""
            fill
            priority
            quality={95}
            sizes="100vw"
            className="object-cover select-none"
          />
        </motion.div>
      </div>

      {/* Véu no topo pro menu respirar sobre o céu */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#0a1526]/85 via-[#0a1526]/25 to-transparent" />

      {/* ── Camada 2: o nome monumental ── */}
      <div className="absolute inset-x-0 top-[14%] sm:top-[12%] z-[1] flex flex-col items-center px-4">
        {/* Kicker editorial: hairline · KAUÃ SOUZA · hairline */}
        <motion.div
          custom={0}
          variants={reveal}
          initial="hidden"
          animate="show"
          className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6"
        >
          <span aria-hidden className="h-px w-8 sm:w-14 bg-white/45" />
          <span className="font-pixel text-[8px] sm:text-[10px] text-white/90 tracking-[0.42em] uppercase [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
            {t('name')}
          </span>
          <span aria-hidden className="h-px w-8 sm:w-14 bg-white/45" />
        </motion.div>

        {/* ARTX — gradiente frio + brilho; a base mergulha atrás do Fuji */}
        <motion.h1
          custom={1}
          variants={reveal}
          initial="hidden"
          animate="show"
          aria-label={`${t('name')} — ${t('role')}`}
          className="font-black leading-[0.82] tracking-[-0.03em] text-[30vw] sm:text-[21vw] lg:text-[18vw] select-none text-transparent bg-clip-text [background-image:linear-gradient(178deg,#ffffff_0%,#eef4ff_46%,#cdddf5_100%)] [text-shadow:0_0_60px_rgba(150,190,255,0.28)] [mask-image:linear-gradient(180deg,#000_82%,rgba(0,0,0,0.5)_100%)]"
        >
          <span aria-hidden className="drop-shadow-[0_6px_34px_rgba(4,12,30,0.6)]">ARTX</span>
        </motion.h1>
      </div>

      {/* ── Camada 3: o Fuji recortado, na frente do nome ── */}
      <div aria-hidden className={`${PHOTO_WRAP} z-[2] pointer-events-none`}>
        <motion.div className="absolute inset-0" {...kenBurns}>
          <Image
            src="/images/fuji-cutout.webp"
            alt=""
            fill
            priority
            quality={95}
            sizes="100vw"
            className="object-cover select-none"
          />
        </motion.div>
      </div>

      {/* ── Camada 4: atmosfera por cima de tudo ── */}
      <div aria-hidden className="absolute inset-0 z-[3] pointer-events-none [background:radial-gradient(120%_90%_at_50%_36%,transparent_48%,rgba(6,14,30,0.5)_100%)]" />
      {/* Emenda com o site: o azul da noite derrete no verde-aurora do fundo */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 z-[3] h-56 pointer-events-none bg-gradient-to-t from-[#04100a] via-[#062018]/60 to-transparent" />

      {/* ── Chamada central ── */}
      <motion.div
        custom={2}
        variants={reveal}
        initial="hidden"
        animate="show"
        className="absolute inset-x-0 top-[56%] sm:top-[58%] z-[4] flex flex-col items-center gap-4 px-4"
      >
        <span className="font-pixel text-[7px] sm:text-[9px] text-white/85 tracking-[0.34em] uppercase [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
          {t('role')}
        </span>
        <a
          href={YOUTUBE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2.5 px-8 sm:px-10 py-3 sm:py-3.5 rounded-full border border-white/70 text-white text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase backdrop-blur-md bg-white/5 transition-all duration-300 hover:bg-white hover:text-[#0a1526] hover:border-white hover:shadow-[0_10px_40px_rgba(180,210,255,0.4)] hover:scale-[1.03]"
        >
          <Youtube size={16} className="transition-transform group-hover:scale-110" />
          {t('watch_tour')}
        </a>
      </motion.div>

      {/* ── "Saiba mais" vertical à esquerda (desktop) ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 1 }}
        className="hidden sm:flex absolute left-7 bottom-9 z-[4] flex-col items-center gap-3"
      >
        <span className="[writing-mode:vertical-rl] rotate-180 text-[10px] tracking-[0.35em] text-white/65 uppercase">
          {t('learn_more')}
        </span>
        <motion.span
          aria-hidden
          animate={{ y: [0, 8, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="text-white/70"
        >
          <ArrowDown size={15} />
        </motion.span>
      </motion.div>

      {/* ── Sociais no canto inferior direito ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute right-5 sm:right-7 bottom-6 z-[4] flex items-center gap-1"
      >
        {SOCIALS.map(({ href, icon: Icon, label }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="p-2 rounded-full text-white/75 hover:text-white hover:bg-white/12 hover:-translate-y-0.5 transition-all duration-300"
          >
            <Icon size={16} />
          </a>
        ))}
      </motion.div>
    </motion.section>
  );
}
