'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowRight, Youtube, Heart, TrendingUp, PackageCheck, Share2,
  Briefcase, Rocket, Megaphone, Building2, Plane, GraduationCap,
  Sparkles, Wrench, School, Check, Lock, Flag, Footprints,
} from 'lucide-react';

const YOUTUBE_URL = 'https://www.youtube.com/@KauartX';

// A jornada é uma trilha estilo game (tipo Duolingo): paradas concluídas,
// paradas em andamento, a parada ATUAL (onde o Kauã está, com a arte dele
// caminhando) e as fases futuras ainda bloqueadas. No desktop a trilha
// serpenteia em zigue-zague (cards alternando os lados da linha central).
type TrailState = 'done' | 'progress' | 'current' | 'locked' | 'final';

interface TrailStop {
  key: string;
  icon: typeof Briefcase;
  state: TrailState;
  title: string;
  tag?: string;
  desc?: string;
}

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
  const j = useTranslations('journey');

  // A trajetória profissional continua como histórico. A fase atual começa
  // em Oxford e segue nas duas frentes vivas: canal e preparação para estudar.
  const trail: TrailStop[] = [
    { key: 'diamond', icon: Building2, state: 'done', title: exp('diamond.place'), tag: exp('diamond.role'), desc: exp('diamond.desc') },
    { key: 'hlts', icon: Wrench, state: 'done', title: exp('hlts.place'), tag: exp('hlts.role'), desc: exp('hlts.desc') },
    { key: 'finance_card', icon: School, state: 'done', title: projects('finance_card.name'), tag: projects('finance_card.tag'), desc: projects('finance_card.desc') },
    { key: 'agencies', icon: Megaphone, state: 'done', title: exp('agencies.place'), tag: exp('agencies.role'), desc: exp('agencies.desc') },
    { key: 'null_forge', icon: Share2, state: 'done', title: projects('null_forge.name'), tag: projects('null_forge.tag'), desc: projects('null_forge.desc') },
    { key: 'kadenduo', icon: Sparkles, state: 'done', title: projects('kadenduo.name'), tag: projects('kadenduo.tag'), desc: projects('kadenduo.desc') },
    { key: 'facility', icon: Rocket, state: 'done', title: exp('facility.place'), tag: exp('facility.role'), desc: exp('facility.desc') },
    { key: 'loog', icon: Briefcase, state: 'done', title: exp('loog.place'), tag: exp('loog.role'), desc: exp('loog.desc') },
    { key: 'uk', icon: Plane, state: 'current', title: j('uk_title'), desc: j('uk_desc') },
    { key: 'youtube_ch', icon: Youtube, state: 'progress', title: j('youtube_title'), desc: j('youtube_desc') },
    { key: 'studies', icon: GraduationCap, state: 'progress', title: goals('usa') },
    { key: 'final', icon: Flag, state: 'final', title: j('final_title'), desc: j('final_desc') },
  ];

  // Tudo a partir de onde ele está hoje é caminho ainda não trilhado
  const currentIdx = trail.findIndex((s) => s.state === 'current');

  return (
    <div className="min-h-screen pt-24 relative overflow-hidden">
      <div className="orb w-[420px] h-[420px] top-[-6%] right-[-8%] bg-accent-2/20 animate-float-slow" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-8">
        {/* ── Hero: a arte da jornada com o título por cima ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden border border-border shadow-lg mt-4"
        >
          <Image
            src="/images/kaua-journey.png"
            alt={t('portrait_alt')}
            width={960}
            height={1440}
            priority
            sizes="(min-width: 896px) 832px, 100vw"
            className="w-full h-[340px] sm:h-[430px] object-cover object-[center_20%] [image-rendering:pixelated]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-[#04100a]/85 via-[#04100a]/45 to-transparent"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#04100a]/70 to-transparent"
          />
          <div className="absolute inset-0 flex flex-col justify-center p-6 sm:p-10">
            <span className="font-pixel text-[8px] sm:text-[10px] uppercase tracking-[0.3em] text-accent-bright mb-4 [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
              {t('title')}
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white max-w-xl leading-tight [text-shadow:0_2px_10px_rgba(0,0,0,0.8)]">
              {t('subtitle')}
            </h1>
            <p className="mt-4 inline-flex items-center gap-2 text-sm sm:text-base text-[#d8f2e2] [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
              <Footprints size={15} className="text-accent-bright" />
              {t('hero_follow')}
            </p>
          </div>
        </motion.div>

        {/* ── Pill de contato (meio sobreposta no hero, como nos sites de viagem) ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 -mt-7 flex justify-center mb-16 sm:mb-20 px-2"
        >
          <div className="glass-strong rounded-full pl-5 pr-2 py-2 flex items-center gap-3 sm:gap-5 shadow-lg">
            <span className="text-xs sm:text-sm text-foreground-muted whitespace-nowrap">
              {t('pill_text')}
            </span>
            <Link
              href="/contact"
              className="btn-pill-primary !py-2 !px-5 text-xs whitespace-nowrap"
            >
              {t('pill_button')}
            </Link>
          </div>
        </motion.div>

        {/* ── Jornada: trilha estilo game em zigue-zague ── */}
        <section className="mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8 sm:mb-10 text-center"
          >
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground mb-2">
              {j('title')}
            </h2>
            <p className="text-foreground-muted mb-4">{j('subtitle')}</p>
            <span className="boarding-tag font-pixel text-[8px] text-accent-deep uppercase">
              {j('start_badge')}
            </span>
          </motion.div>

          <div>
            {trail.map((stop, i) => {
              const Icon = stop.icon;
              const isLast = i === trail.length - 1;
              // Zigue-zague: no desktop os cards alternam o lado da linha
              const leftSide = i % 2 === 0;
              // Tudo daqui pra frente ainda não foi trilhado — agora medido
              // pela posição, senão o canal (em andamento) reacendia o
              // caminho no meio das fases futuras
              const pathAhead = i >= currentIdx;

              const node = {
                done: 'w-12 h-12 bg-accent/15 border-2 border-accent text-accent-deep',
                progress: 'w-12 h-12 bg-accent/10 border-2 border-dashed border-accent/70 text-accent-deep',
                current: 'w-16 h-16 bg-accent text-[#04100a] border-4 border-accent-bright shadow-[0_0_30px_rgba(53,224,101,0.55)]',
                locked: 'w-12 h-12 bg-surface-elevated border-2 border-dashed border-border text-foreground-subtle',
                final: 'w-14 h-14 bg-accent-2/10 border-2 border-accent-2 text-accent-2-deep',
              }[stop.state];

              const card = {
                done: 'bg-surface border-border',
                progress: 'bg-surface border-border',
                current: 'bg-surface border-accent/50 shadow-[0_0_24px_rgba(53,224,101,0.15)]',
                locked: 'bg-surface/60 border-dashed border-border opacity-80',
                final: 'bg-surface border-accent-2/40',
              }[stop.state];

              return (
                <motion.div
                  key={stop.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: 0.04 }}
                  className="grid grid-cols-[4.5rem_1fr] sm:grid-cols-[1fr_6rem_1fr] gap-x-3 sm:gap-x-2 items-stretch"
                >
                  {/* Coluna do caminho: parada + pegadas até a próxima */}
                  <div className="flex flex-col items-center col-start-1 sm:col-start-2 row-start-1">
                    {stop.state === 'current' && (
                      <Image
                        src="/images/kaua-journey.png"
                        alt={t('portrait_alt')}
                        width={120}
                        height={150}
                        className="w-14 sm:w-16 h-auto mb-1.5 rounded-xl border-2 border-accent/60 [image-rendering:pixelated] shadow-[0_6px_20px_rgba(53,224,101,0.35)]"
                      />
                    )}
                    <div
                      className={`relative shrink-0 rounded-full flex items-center justify-center ${node}`}
                    >
                      <Icon size={stop.state === 'current' ? 24 : 19} />
                      {stop.state === 'done' && (
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent text-[#04100a] border-2 border-background flex items-center justify-center">
                          <Check size={11} strokeWidth={3.5} />
                        </span>
                      )}
                      {stop.state === 'locked' && (
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-surface-elevated border border-border text-foreground-subtle flex items-center justify-center">
                          <Lock size={10} />
                        </span>
                      )}
                    </div>
                    {!isLast && (
                      <div
                        className={`trail-steps flex-1 min-h-8 mt-2 mb-1 ${
                          pathAhead ? 'opacity-30' : ''
                        }`}
                      />
                    )}
                  </div>

                  {/* Card da parada — alterna o lado no desktop */}
                  <div
                    className={`col-start-2 row-start-1 min-w-0 ${
                      leftSide ? 'sm:col-start-1' : 'sm:col-start-3'
                    } ${isLast ? '' : 'pb-8 sm:pb-10'}`}
                  >
                    <div
                      className={`rounded-2xl border p-4 sm:p-5 ${card} ${
                        leftSide ? 'sm:text-right' : ''
                      }`}
                    >
                      <div
                        className={`flex flex-wrap items-center gap-2 mb-1.5 ${
                          leftSide ? 'sm:justify-end' : ''
                        }`}
                      >
                        <h3
                          className={`font-bold text-foreground ${
                            stop.state === 'final'
                              ? 'font-pixel text-xs sm:text-sm text-gradient'
                              : 'text-base sm:text-lg'
                          }`}
                        >
                          {stop.title}
                        </h3>
                        {stop.tag && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-elevated border border-border text-foreground-muted font-semibold">
                            {stop.tag}
                          </span>
                        )}
                        {stop.state === 'current' && (
                          <span className="font-pixel text-[7px] px-2.5 py-1 rounded-full bg-accent/15 border border-accent/40 text-accent-deep uppercase">
                            {j('you_are_here')}
                          </span>
                        )}
                        {stop.state === 'done' && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-accent/10 border border-accent/25 text-accent-deep font-bold">
                            {j('done_badge')}
                          </span>
                        )}
                        {stop.state === 'progress' && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-accent/10 border border-accent/25 text-accent-deep font-bold">
                            {j('in_progress_badge')}
                          </span>
                        )}
                        {stop.state === 'locked' && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-elevated border border-border text-foreground-subtle font-bold">
                            {j('locked_badge')}
                          </span>
                        )}
                      </div>
                      {stop.desc && (
                        <p className="text-sm text-foreground-muted leading-relaxed">
                          {stop.desc}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── Faixa de cenário (respiro visual, como na referência) ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl overflow-hidden border border-border shadow-lg mb-16 sm:mb-20"
        >
          {/* Foto do mochileiro no vale — banda a 72% da altura mantém ele
              inteiro na trilha, com rio e árvores em volta. quality 95 =
              teto permitido pelo next.config (mesmo nível do hero). */}
          <Image
            src="/images/journey-strip.webp"
            alt=""
            width={1672}
            height={941}
            quality={95}
            sizes="(min-width: 896px) 832px, 100vw"
            className="w-full h-36 sm:h-52 object-cover object-[center_72%]"
          />
        </motion.div>

        {/* ── "Nascido pra aventura": retrato + bio (foto à esquerda, texto à direita) ── */}
        <section className="mb-16 sm:mb-20 grid grid-cols-1 md:grid-cols-[minmax(0,300px)_1fr] gap-8 md:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative mx-auto md:mx-0 max-w-[280px]"
          >
            <div
              aria-hidden
              className="absolute inset-4 rounded-full bg-accent/15 blur-2xl"
            />
            <div className="relative rounded-3xl bg-surface border border-border p-6 shadow-lg">
              <Image
                src="/images/kaua-pixel.png"
                alt={t('portrait_alt')}
                width={720}
                height={735}
                sizes="280px"
                className="w-full h-auto drop-shadow-[0_12px_32px_rgba(53,224,101,0.2)]"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground mb-5">
              {t('born_title')}
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-foreground-muted leading-relaxed mb-7">
              <p>{t('bio_1')}</p>
              <p>{t('bio_2')}</p>
              <p>{t('bio_3')}</p>
              <p>{t('bio_4')}</p>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
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
            </div>
          </motion.div>
        </section>

        {/* Values */}
        <section className="pb-24">
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
      </div>
    </div>
  );
}
