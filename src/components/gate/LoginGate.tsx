'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass, Eye, EyeOff, Check, Globe, UserPlus, DoorOpen, Swords,
} from 'lucide-react';

// Tela de login estilo game na frente do site.
// É teatro: qualquer nome/senha abre o portal. Depois de entrar,
// a escolha fica salva e o portal não aparece de novo.
const ENTERED_KEY = 'kaua-portal-entered';
const NAME_KEY = 'kaua-adventurer';

const YOUTUBE_URL = 'https://www.youtube.com/@KauartX';

// Posições fixas (nada de Math.random no render → sem bug de hidratação)
const FIREFLIES = [
  { left: '6%', top: '18%', dur: '9s', delay: '0s' },
  { left: '14%', top: '64%', dur: '11s', delay: '1.2s' },
  { left: '22%', top: '38%', dur: '8s', delay: '2.4s' },
  { left: '31%', top: '78%', dur: '12s', delay: '0.6s' },
  { left: '44%', top: '12%', dur: '10s', delay: '3s' },
  { left: '58%', top: '84%', dur: '9.5s', delay: '1.8s' },
  { left: '67%', top: '26%', dur: '11.5s', delay: '0.3s' },
  { left: '74%', top: '58%', dur: '8.5s', delay: '2.1s' },
  { left: '83%', top: '20%', dur: '10.5s', delay: '1.5s' },
  { left: '90%', top: '70%', dur: '9s', delay: '2.7s' },
  { left: '38%', top: '52%', dur: '13s', delay: '0.9s' },
  { left: '52%', top: '40%', dur: '10s', delay: '3.3s' },
] as const;

type Stage = 'hidden' | 'open' | 'loading';

export default function LoginGate() {
  const t = useTranslations('gate');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [stage, setStage] = useState<Stage>('hidden');
  const [name, setName] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [progress, setProgress] = useState(0);

  // Só abre pra quem ainda não entrou (e nunca no servidor → SEO intacto)
  useEffect(() => {
    try {
      const entered =
        localStorage.getItem(ENTERED_KEY) ?? sessionStorage.getItem(ENTERED_KEY);
      if (!entered) setStage('open');
    } catch {
      setStage('open');
    }
  }, []);

  // Trava o scroll do site enquanto o portal está aberto
  useEffect(() => {
    if (stage === 'hidden') return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [stage]);

  const persist = (rememberMe: boolean) => {
    try {
      (rememberMe ? localStorage : sessionStorage).setItem(ENTERED_KEY, '1');
    } catch {
      // navegação privada sem storage — segue o jogo
    }
  };

  // Barra de progresso do "carregamento do mundo"
  useEffect(() => {
    if (stage !== 'loading') return;
    const id = setInterval(() => {
      setProgress((p) => Math.min(100, p + 2 + Math.random() * 4));
    }, 45);
    return () => clearInterval(id);
  }, [stage]);

  useEffect(() => {
    if (stage !== 'loading' || progress < 100) return;
    persist(remember);
    const to = setTimeout(() => setStage('hidden'), 500);
    return () => clearTimeout(to);
  }, [progress, stage, remember]);

  const enter = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = name.trim();
    if (trimmed) {
      try {
        localStorage.setItem(NAME_KEY, trimmed);
      } catch {}
    }
    setProgress(0);
    setStage('loading');
  };

  const enterGuest = () => {
    persist(false);
    setStage('hidden');
  };

  const switchLocale = () => {
    router.replace(pathname, { locale: locale === 'pt' ? 'en' : 'pt' });
  };

  const goCreateAccount = () => {
    persist(false);
    router.push('/contact');
  };

  // Esc = pular o portal (acessibilidade)
  useEffect(() => {
    if (stage !== 'open') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') enterGuest();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const msgIndex = progress < 30 ? 1 : progress < 60 ? 2 : progress < 88 ? 3 : 4;

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {stage !== 'hidden' && (
        <motion.div
          key="gate"
          role="dialog"
          aria-modal="true"
          aria-label={t('aria_label')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: 'brightness(2)' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] overflow-hidden bg-[#020a06] flex flex-col"
        >
          {/* ── Céu: estrelas + auroras + horizonte ── */}
          <div aria-hidden className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 stars-layer opacity-80" />
            <div className="absolute inset-0 stars-layer-2" />
            <div
              className="aurora-curtain w-[70vw] h-[100vh] top-[-32%] left-[-12%]"
              style={{
                background:
                  'radial-gradient(ellipse 42% 52% at 50% 30%, rgba(99,247,141,0.38), rgba(53,224,101,0.1) 58%, transparent 76%)',
                ['--tilt' as string]: '-18deg',
                ['--speed' as string]: '24s',
                ['--glow' as string]: '0.9',
              }}
            />
            <div
              className="aurora-curtain w-[60vw] h-[95vh] top-[-30%] right-[-10%]"
              style={{
                background:
                  'radial-gradient(ellipse 40% 50% at 50% 28%, rgba(75,238,198,0.34), rgba(31,211,167,0.09) 58%, transparent 76%)',
                ['--tilt' as string]: '14deg',
                ['--speed' as string]: '32s',
                ['--glow' as string]: '0.85',
                animationDirection: 'reverse',
              }}
            />
            <div className="absolute inset-x-0 bottom-0 h-[46vh] horizon-glow" />
            <div className="absolute inset-0 aurora-vignette" />
            {FIREFLIES.map((f, i) => (
              <span
                key={i}
                className="gate-firefly"
                style={{
                  left: f.left,
                  top: f.top,
                  ['--dur' as string]: f.dur,
                  ['--delay' as string]: f.delay,
                }}
              />
            ))}
          </div>

          {/* ── Moldura ornamentada ── */}
          <div aria-hidden className="absolute inset-2.5 sm:inset-5 pointer-events-none">
            <div className="absolute inset-0 rounded-xl border border-[#1f4a2e]/70" />
            <div className="absolute inset-1.5 rounded-lg border border-[#35e065]/15" />
            {/* Losangos nos cantos */}
            {[
              '-top-1 -left-1', '-top-1 -right-1',
              '-bottom-1 -left-1', '-bottom-1 -right-1',
            ].map((pos) => (
              <div
                key={pos}
                className={`absolute ${pos} w-2.5 h-2.5 rotate-45 bg-gradient-to-br from-accent to-accent-2 shadow-[0_0_10px_rgba(53,224,101,0.8)]`}
              />
            ))}
            {/* Emblema no topo */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2">
              <div className="gate-emblem w-5 h-5 rotate-45 bg-gradient-to-br from-accent-bright to-accent-2-bright rounded-[3px] flex items-center justify-center">
                <div className="w-2 h-2 rotate-0 bg-[#04150c] rounded-[1px]" />
              </div>
            </div>
          </div>

          {/* ── Conteúdo central ── */}
          <div className="relative flex-1 flex flex-col items-center justify-center px-4 pt-10 pb-2 min-h-0">
            {/* Título */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.7 }}
              className="text-center mb-5 sm:mb-7"
            >
              <h1 className="font-pixel text-xl sm:text-3xl text-foreground [text-shadow:0_0_24px_rgba(99,247,141,0.65),0_0_60px_rgba(75,238,198,0.35)]">
                KAUÃ <span className="text-gradient">ARTX</span>
              </h1>
              <p className="font-pixel text-[8px] sm:text-[10px] text-foreground-muted tracking-[0.35em] mt-3 uppercase">
                {t('subtitle')}
              </p>
            </motion.div>

            {/* Portal circular com a arte da jornada + formulário */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-square w-[min(92vw,54vh,520px)]"
            >
              {/* Brilho difuso atrás do portal */}
              <div
                aria-hidden
                className="absolute -inset-6 rounded-full bg-accent/10 blur-3xl"
              />
              {/* Anel de energia girando */}
              <div aria-hidden className="absolute inset-0 rounded-full gate-ring-spin" />
              {/* Anel estático */}
              <div aria-hidden className="absolute inset-[7px] rounded-full border-2 border-[#1f4a2e]" />
              {/* Interior do portal: a jornada */}
              <div className="absolute inset-[12px] rounded-full overflow-hidden">
                <Image
                  src="/images/kaua-journey.png"
                  alt=""
                  fill
                  sizes="520px"
                  priority
                  className="object-cover object-[center_32%]"
                />
                {/* Escurece o centro pra leitura do formulário */}
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(circle at 50% 54%, rgba(2,10,6,0.92) 0%, rgba(2,10,6,0.72) 42%, rgba(2,10,6,0.28) 68%, rgba(2,10,6,0.05) 82%, transparent 92%)',
                  }}
                />
              </div>

              {/* Formulário / carregamento dentro do portal */}
              <div className="absolute inset-0 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {stage === 'open' ? (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      onSubmit={enter}
                      className="w-[74%] max-w-[300px] flex flex-col gap-2.5 sm:gap-3"
                    >
                      <div>
                        <label
                          htmlFor="gate-user"
                          className="block font-pixel text-[8px] sm:text-[9px] text-accent-deep uppercase tracking-widest mb-1.5"
                        >
                          {t('label_user')}
                        </label>
                        <input
                          id="gate-user"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={t('placeholder_user')}
                          autoComplete="off"
                          maxLength={40}
                          className="w-full px-3.5 py-2.5 rounded-lg bg-[#04150c]/85 backdrop-blur-sm border border-[#1f4a2e] focus:border-accent-bright outline-none text-sm text-foreground placeholder:text-foreground-subtle/70 transition-colors"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="gate-pass"
                          className="block font-pixel text-[8px] sm:text-[9px] text-accent-deep uppercase tracking-widest mb-1.5"
                        >
                          {t('label_pass')}
                        </label>
                        <div className="relative">
                          <input
                            id="gate-pass"
                            type={showPass ? 'text' : 'password'}
                            value={pass}
                            onChange={(e) => setPass(e.target.value)}
                            placeholder={t('placeholder_pass')}
                            autoComplete="off"
                            maxLength={64}
                            className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-[#04150c]/85 backdrop-blur-sm border border-[#1f4a2e] focus:border-accent-bright outline-none text-sm text-foreground placeholder:text-foreground-subtle/70 transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            aria-label={showPass ? 'Esconder senha' : 'Mostrar senha'}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground-subtle hover:text-accent-bright transition-colors"
                          >
                            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                        <p className="text-[10px] text-foreground-subtle mt-1.5">{t('hint')}</p>
                      </div>

                      {/* Lembrar de mim */}
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={remember}
                        onClick={() => setRemember(!remember)}
                        className="group flex items-center gap-2 self-center"
                      >
                        <span
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                            remember
                              ? 'bg-accent border-accent-bright text-[#04150c]'
                              : 'bg-[#04150c]/85 border-[#1f4a2e] group-hover:border-accent'
                          }`}
                        >
                          {remember && <Check size={11} strokeWidth={3.5} />}
                        </span>
                        <span className="text-xs text-foreground-muted group-hover:text-foreground transition-colors">
                          {t('remember')}
                        </span>
                      </button>

                      <button
                        type="submit"
                        className="btn-pill-primary w-full !py-3 font-pixel text-[10px] sm:text-[11px] uppercase tracking-wider"
                      >
                        <Swords size={13} />
                        {t('enter')}
                      </button>

                      <button
                        type="button"
                        onClick={enterGuest}
                        className="self-center text-[11px] text-foreground-subtle hover:text-accent-bright underline underline-offset-4 decoration-dotted transition-colors"
                      >
                        {t('guest')} →
                      </button>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-[70%] max-w-[280px] flex flex-col items-center gap-4 text-center"
                    >
                      <Compass
                        size={30}
                        className="text-accent-bright animate-[portal-spin_3s_linear_infinite]"
                      />
                      {name.trim() && (
                        <p className="text-sm text-foreground font-semibold">
                          {t('welcome')}, <span className="text-gradient">{name.trim()}</span>!
                        </p>
                      )}
                      <p className="font-pixel text-[9px] text-foreground-muted uppercase min-h-[2.5em]">
                        {t(`loading_${msgIndex}`)}
                      </p>
                      <div className="w-full h-2 rounded-full bg-[#04150c]/90 border border-[#1f4a2e] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-accent-bright to-accent-2-bright transition-[width] duration-100"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] text-accent-deep">
                        {Math.floor(progress)}%
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* ── Rodapé: versão + botões de game ── */}
          <div className="relative flex flex-col-reverse sm:flex-row items-center sm:items-end justify-between gap-3 px-6 sm:px-10 pb-5 sm:pb-8">
            <div className="text-center sm:text-left">
              <p className="font-pixel text-[8px] text-foreground-subtle">{t('version')}</p>
              <p className="text-[10px] text-foreground-subtle/70 mt-1">{t('copyright')}</p>
            </div>

            <p className="hidden md:block font-pixel text-[8px] text-foreground-subtle/80 uppercase tracking-[0.25em]">
              {t('tagline')}
            </p>

            <div className="flex sm:flex-col gap-2">
              <button
                type="button"
                onClick={switchLocale}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#04150c]/80 border border-[#1f4a2e] hover:border-accent text-xs text-foreground-muted hover:text-foreground transition-all"
              >
                <Globe size={12} />
                {t('language')}: {locale === 'pt' ? 'EN' : 'PT'}
              </button>
              <button
                type="button"
                onClick={goCreateAccount}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#04150c]/80 border border-[#1f4a2e] hover:border-accent text-xs text-foreground-muted hover:text-foreground transition-all"
              >
                <UserPlus size={12} />
                {t('create')}
              </button>
              <a
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#04150c]/80 border border-[#1f4a2e] hover:border-red-500/50 text-xs text-foreground-muted hover:text-red-400 transition-all"
              >
                <DoorOpen size={12} />
                {t('exit')}
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
