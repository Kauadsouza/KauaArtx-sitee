'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import {
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Mail,
  SendHorizonal,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  Radio,
  ArrowRight,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

const SOCIALS = [
  { href: 'mailto:kauaartx@gmail.com', icon: Mail, label: 'Email', handle: 'kauaartx@gmail.com' },
  { href: 'https://www.instagram.com/kauaartx/', icon: Instagram, label: 'Instagram', handle: '@kauaartx' },
  { href: 'https://www.linkedin.com/in/kauadsouza/', icon: Linkedin, label: 'LinkedIn', handle: 'kauadsouza' },
  { href: 'https://x.com/KauaArtx', icon: Twitter, label: 'Twitter / X', handle: '@KauaArtx' },
  { href: 'https://www.youtube.com/@KauaArtx', icon: Youtube, label: 'YouTube', handle: '@KauaArtx' },
];

// Os 3 cartões de informação da dobra "vamos conversar".
const INFO_CARDS = [
  { icon: MapPin, k: 'base', href: '/about', external: false },
  { icon: Clock, k: 'hours', href: '/blog', external: false },
  { icon: Radio, k: 'channels', href: 'mailto:kauaartx@gmail.com', external: true },
] as const;

// Curvas de nível de mapa: cada linha repete a anterior um pouco mais aberta,
// como a topografia de uma trilha. Desenhadas por fórmula pra ficarem
// perfeitamente aninhadas.
const CONTOURS = Array.from({ length: 18 }, (_, i) => {
  const y = 40 + i * 27;
  const amp = 30 + i * 3.5;
  return `M -100 ${y} C 190 ${y - amp}, 400 ${y + amp}, 640 ${y - amp * 0.55} S 1060 ${y + amp * 0.9}, 1340 ${y - amp * 0.3}`;
});

const schema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('Email inválido'),
  subject: z.string().min(3, 'Assunto muito curto'),
  message: z.string().min(20, 'Mensagem muito curta (mín. 20 caracteres)'),
  // Honeypot anti-bot: humanos nunca veem nem preenchem este campo
  website: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ContactPage() {
  const t = useTranslations('contact');
  const tNav = useTranslations('nav');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
      reset();
    } catch {
      setStatus('error');
    }
  };

  const inputClass = (hasError?: boolean) =>
    cn(
      'w-full px-4 py-3.5 rounded-xl border bg-background/60 text-foreground text-base placeholder:text-foreground-subtle outline-none transition-all',
      hasError
        ? 'border-red-500/50 focus:border-red-500'
        : 'border-border focus:border-accent-bright focus:ring-2 focus:ring-accent/15 hover:border-border-strong'
    );

  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* ══ 1. Hero — título centrado sobre o mapa topográfico ══ */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28">
        {/* Curvas de nível varrendo o topo da página */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-10 h-[560px] overflow-hidden opacity-[0.55] [mask-image:radial-gradient(70%_75%_at_65%_35%,#000_10%,transparent_78%)] [-webkit-mask-image:radial-gradient(70%_75%_at_65%_35%,#000_10%,transparent_78%)]"
        >
          <svg
            viewBox="0 0 1240 560"
            preserveAspectRatio="xMidYMid slice"
            className="contour-map h-full w-full"
          >
            <defs>
              <linearGradient id="contour-stroke" x1="0" y1="0" x2="1" y2="0.4">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0" />
                <stop offset="35%" stopColor="var(--accent-bright)" stopOpacity="0.9" />
                <stop offset="75%" stopColor="var(--accent2-bright)" stopOpacity="0.7" />
                <stop offset="100%" stopColor="var(--accent2)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {CONTOURS.map((d, i) => (
              <path
                key={d}
                d={d}
                fill="none"
                stroke="url(#contour-stroke)"
                strokeWidth={i % 4 === 0 ? 1.4 : 0.7}
                strokeOpacity={i % 4 === 0 ? 0.75 : 0.4}
              />
            ))}
          </svg>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center text-center"
          >
            <span className="font-pixel text-[9px] tracking-[0.45em] uppercase text-accent-deep mb-6">
              {tNav('contact')}
            </span>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tighter text-foreground uppercase">
              {t('title')}
            </h1>
            {/* Ornamento: hairline curta sob o título */}
            <span aria-hidden className="mt-7 h-px w-24 hairline-gradient" />
            <p className="mt-7 max-w-xl text-base sm:text-lg text-foreground-muted leading-relaxed">
              {t('subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ══ 2. "Vamos conversar" + 3 cartões de informação ══ */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,2fr)] gap-10 lg:gap-14 items-start">

          {/* Título display à esquerda */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-2.5 mb-5">
              <span className="font-mono text-sm text-accent-bright">{'//'}</span>
              <span className="font-pixel text-[10px] tracking-[0.3em] uppercase text-foreground">
                {t('lead_kicker')}
              </span>
            </div>
            <h2 className="text-gradient text-5xl sm:text-6xl font-bold tracking-tighter leading-[0.92] uppercase">
              {t('lead_title')}
            </h2>
          </motion.div>

          {/* Trio de cartões à direita */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px rounded-2xl bg-border overflow-hidden border border-border">
            {INFO_CARDS.map(({ icon: Icon, k, href, external }, i) => {
              const cta = (
                <>
                  {t(`card_${k}_cta`)}
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-300 group-hover:translate-x-1.5"
                  />
                </>
              );

              return (
                <motion.div
                  key={k}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative bg-surface hover:bg-surface-elevated transition-colors duration-300 p-7 flex flex-col"
                >
                  {/* Fio laranja que acende no topo do cartão em hover */}
                  <span
                    aria-hidden
                    className="absolute top-0 inset-x-0 h-px hairline-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <div className="w-12 h-12 rounded-full border border-border-strong flex items-center justify-center mb-6 group-hover:border-accent group-hover:shadow-[0_0_20px_color-mix(in_srgb,var(--accent)_25%,transparent)] transition-all duration-300">
                    <Icon size={18} className="text-accent-deep" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2.5">
                    {t(`card_${k}_title`)}
                  </h3>
                  <p className="text-sm text-foreground-muted leading-relaxed mb-1">
                    {t(`card_${k}_l1`)}
                  </p>
                  <p className="text-sm text-foreground-muted leading-relaxed mb-7">
                    {t(`card_${k}_l2`)}
                  </p>
                  {external ? (
                    <a
                      href={href}
                      className="mt-auto inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-accent-deep hover:text-accent-bright transition-colors"
                    >
                      {cta}
                    </a>
                  ) : (
                    <Link
                      href={href}
                      className="mt-auto inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-accent-deep hover:text-accent-bright transition-colors"
                    >
                      {cta}
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ 3. Faixa do formulário — cartão flutuando sobre o painel ══ */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24 sm:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-3xl bg-surface border border-border px-6 sm:px-10 lg:px-14 py-12 lg:py-14"
        >
          {/* Orbe de brasa aquecendo o painel por trás */}
          <div aria-hidden className="orb w-[380px] h-[380px] bg-accent/10 -bottom-24 -right-16 animate-float-slower" />

          <div className="relative grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-10 lg:gap-16 items-center">

            {/* Cartão do formulário — sobe pra fora do painel no desktop */}
            <div className="relative rounded-2xl bg-surface-elevated border border-border shadow-[0_24px_70px_rgba(0,0,0,0.45)] p-6 sm:p-8 lg:-my-24">
              <span aria-hidden className="absolute top-0 inset-x-0 h-px hairline-gradient opacity-70" />

              {status === 'success' ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <CheckCircle2 size={48} className="text-accent-bright mb-4" />
                  <h3 className="text-2xl font-bold text-foreground mb-2">{t('form_success_title')}</h3>
                  <p className="text-foreground-muted">{t('form_success_desc')}</p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-8 px-6 py-2.5 rounded-lg border border-border text-foreground-muted hover:text-foreground hover:border-border-strong transition-all text-sm"
                  >
                    {t('form_another')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Honeypot: invisível pra humanos, bots caem aqui */}
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="hidden"
                    {...register('website')}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-foreground-subtle mb-1.5 font-mono">
                        {t('form_name')}
                      </label>
                      <input
                        {...register('name')}
                        placeholder="Kauã Souza"
                        className={inputClass(!!errors.name)}
                      />
                      {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs text-foreground-subtle mb-1.5 font-mono">
                        {t('form_email')}
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        placeholder="hello@example.com"
                        className={inputClass(!!errors.email)}
                      />
                      {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-foreground-subtle mb-1.5 font-mono">
                      {t('form_subject')}
                    </label>
                    <input
                      {...register('subject')}
                      placeholder="Proposta de projeto / Parceria / Dúvida..."
                      className={inputClass(!!errors.subject)}
                    />
                    {errors.subject && <p className="text-xs text-red-400 mt-1">{errors.subject.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs text-foreground-subtle mb-1.5 font-mono">
                      {t('form_message')}
                    </label>
                    <textarea
                      {...register('message')}
                      rows={5}
                      placeholder="Olá Kauã, quero conversar sobre..."
                      className={cn(inputClass(!!errors.message), 'resize-none')}
                    />
                    {errors.message && <p className="text-xs text-red-400 mt-1">{errors.message.message}</p>}
                  </div>

                  {status === 'error' && (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <AlertCircle size={14} />
                      {t('form_error')}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="group btn-pill-primary w-full text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {status === 'loading' ? (
                      <>
                        <span className="w-4 h-4 border-2 border-[color:var(--ink-on-accent)]/30 border-t-[color:var(--ink-on-accent)] rounded-full animate-spin" />
                        {t('form_sending')}
                      </>
                    ) : (
                      <>
                        {t('form_send')}
                        <SendHorizonal size={14} className="transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Texto de apoio à direita */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <span aria-hidden className="h-px w-8 hairline-gradient" />
                <span className="font-pixel text-[10px] tracking-[0.3em] uppercase text-foreground">
                  {t('form_kicker')}
                </span>
              </div>
              <h2 className="text-gradient text-4xl sm:text-5xl font-bold tracking-tighter leading-[0.95] uppercase mb-6">
                {t('form_title')}
              </h2>
              <p className="text-foreground-muted leading-relaxed">{t('form_desc')}</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ══ 4. Fecho "bora conversar" + canais ══ */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8">
        <div className="border-t border-border pt-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-end">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 className="text-gradient text-5xl sm:text-7xl font-bold tracking-tighter mb-6">
                {t('talk_title')}
              </h2>
              <p className="text-foreground-muted max-w-md leading-relaxed mb-8">{t('talk_desc')}</p>
              {/* Redes em círculos, como no rodapé da referência */}
              <div className="flex items-center gap-3">
                {SOCIALS.map(({ href, icon: Icon, label }) => (
                  <a
                    key={href}
                    href={href}
                    target={href.startsWith('mailto') ? undefined : '_blank'}
                    rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                    aria-label={label}
                    className="w-11 h-11 rounded-full border border-border flex items-center justify-center text-foreground-subtle hover:text-accent-bright hover:border-accent hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Lista de canais com handle */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="lg:justify-self-end w-full lg:max-w-sm"
            >
              <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground-subtle mb-5">
                {t('social_title')}
              </h3>
              <ul className="divide-y divide-border border-y border-border">
                {SOCIALS.map(({ href, label, handle }) => (
                  <li key={href}>
                    <a
                      href={href}
                      target={href.startsWith('mailto') ? undefined : '_blank'}
                      rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                      className="group flex items-center justify-between gap-4 py-3.5 transition-colors"
                    >
                      <span className="text-sm text-foreground-muted group-hover:text-foreground transition-colors">
                        {label}
                      </span>
                      <span className="flex items-center gap-2 text-sm text-foreground-subtle group-hover:text-accent-deep transition-colors">
                        {handle}
                        <ArrowRight
                          size={13}
                          className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                        />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
