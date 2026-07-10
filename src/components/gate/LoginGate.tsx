'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass, Eye, EyeOff, Check, Globe, UserPlus, DoorOpen, Swords,
} from 'lucide-react';

// Tela de login estilo game na frente do site: um portão de madeira
// guardado por um mago que conversa a cada clique. É teatro — qualquer
// nome/senha abre o portão. Depois de entrar, a escolha fica salva.
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
] as const;

// A janela do portão no sprite (240×320): x 64..176, y 22..158
// (com 2px de sangria pro aro de ferro cobrir a emenda)
const HOLE = { left: '26.7%', top: '6.9%', width: '46.6%', height: '42.5%' };
// Área das portas de madeira onde o formulário se apoia
const DOOR = { left: '9%', top: '51%', width: '82%', height: '44%' };

const WIZARD_LINES = 4;

type Stage = 'hidden' | 'open' | 'thanks' | 'loading';

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

  // Diálogo do mago
  const [line, setLine] = useState(0);
  const [typed, setTyped] = useState('');
  const typedRef = useRef(0);

  const adventurer = name.trim() || t('default_adventurer');
  const fullMsg =
    stage === 'thanks'
      ? t('wizard_thanks', { name: adventurer })
      : t(`wizard_${line + 1}`);

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

  // Trava o scroll do site enquanto o portão está fechado
  useEffect(() => {
    if (stage === 'hidden') return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [stage]);

  // Máquina de escrever do diálogo
  useEffect(() => {
    if (stage === 'hidden' || stage === 'loading') return;
    typedRef.current = 0;
    setTyped('');
    const id = setInterval(() => {
      typedRef.current = Math.min(fullMsg.length, typedRef.current + 1);
      setTyped(fullMsg.slice(0, typedRef.current));
      if (typedRef.current >= fullMsg.length) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [fullMsg, stage]);

  const talkToWizard = () => {
    if (stage !== 'open') return;
    if (typedRef.current < fullMsg.length) {
      // completa a fala na hora
      typedRef.current = fullMsg.length;
      setTyped(fullMsg);
    } else {
      setLine((l) => (l + 1) % WIZARD_LINES);
    }
  };

  const persist = (rememberMe: boolean) => {
    try {
      (rememberMe ? localStorage : sessionStorage).setItem(ENTERED_KEY, '1');
    } catch {
      // navegação privada sem storage — segue o jogo
    }
  };

  // Depois do agradecimento do mago, começa o carregamento
  useEffect(() => {
    if (stage !== 'thanks' || typed !== fullMsg) return;
    const to = setTimeout(() => {
      setProgress(0);
      setStage('loading');
    }, 1100);
    return () => clearTimeout(to);
  }, [stage, typed, fullMsg]);

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
    setStage('thanks');
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

  // Esc = pular o portão (acessibilidade)
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
            {[
              '-top-1 -left-1', '-top-1 -right-1',
              '-bottom-1 -left-1', '-bottom-1 -right-1',
            ].map((pos) => (
              <div
                key={pos}
                className={`absolute ${pos} w-2.5 h-2.5 rotate-45 bg-gradient-to-br from-accent to-accent-2 shadow-[0_0_10px_rgba(53,224,101,0.8)]`}
              />
            ))}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2">
              <div className="gate-emblem w-5 h-5 rotate-45 bg-gradient-to-br from-accent-bright to-accent-2-bright rounded-[3px] flex items-center justify-center">
                <div className="w-2 h-2 bg-[#04150c] rounded-[1px]" />
              </div>
            </div>
          </div>

          {/* ── Conteúdo central (com scroll interno se a tela for baixa) ── */}
          <div className="relative flex-1 min-h-0 overflow-y-auto">
          <div className="min-h-full flex flex-col items-center justify-center px-4 pt-8 pb-3 gap-3 sm:gap-5">
            {/* Título */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.7 }}
              className="text-center"
            >
              <h1 className="font-pixel text-lg sm:text-2xl text-foreground [text-shadow:0_0_24px_rgba(99,247,141,0.65),0_0_60px_rgba(75,238,198,0.35)]">
                KAUÃ <span className="text-gradient">ARTX</span>
              </h1>
              <p className="font-pixel text-[7px] sm:text-[9px] text-foreground-muted tracking-[0.35em] mt-2 uppercase">
                {t('subtitle')}
              </p>
            </motion.div>

            {/* Mago + Portão */}
            <div className="flex flex-col lg:flex-row items-center lg:items-end justify-center gap-3 lg:gap-8 w-full max-w-4xl min-h-0">
              {/* ── Mago interativo ── */}
              <motion.button
                type="button"
                onClick={talkToWizard}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55, duration: 0.7 }}
                className="group flex lg:flex-col items-end lg:items-center gap-2 lg:gap-3 w-full lg:w-64 max-w-[430px] px-1 shrink-0 cursor-pointer text-left lg:pb-4"
                aria-label={t('wizard_tap')}
              >
                {/* Silhueta do mago */}
                <Image
                  src="/images/pixel-wizard.png"
                  alt=""
                  width={36}
                  height={52}
                  priority
                  className={`order-1 w-16 sm:w-20 lg:w-28 h-auto shrink-0 [image-rendering:pixelated] select-none transition-[filter] duration-500 group-hover:drop-shadow-[0_0_14px_rgba(99,247,141,0.5)] ${
                    stage === 'thanks'
                      ? 'drop-shadow-[0_0_20px_rgba(99,247,141,0.9)]'
                      : 'drop-shadow-[0_0_10px_rgba(53,224,101,0.35)]'
                  }`}
                />
                {/* Balão de diálogo RPG */}
                <span className="order-2 relative flex-1 lg:flex-none lg:w-full lg:order-first block rounded-lg border-2 border-[#1f4a2e] bg-[#04150c]/95 backdrop-blur-sm p-3 sm:p-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(53,224,101,0.12)]">
                  <span className="block font-pixel text-[8px] sm:text-[9px] leading-[1.9] text-foreground min-h-[4.75em]">
                    {typed}
                    {stage === 'open' && typed === fullMsg && (
                      <span className="rpg-blink text-accent-bright"> ▼</span>
                    )}
                  </span>
                  <span className="block mt-1.5 font-pixel text-[6px] sm:text-[7px] text-foreground-subtle uppercase tracking-widest">
                    {t('wizard_tap')}
                  </span>
                  {/* Rabinho do balão apontando pro mago */}
                  <span
                    aria-hidden
                    className="absolute -left-[7px] bottom-4 lg:left-1/2 lg:-bottom-[7px] lg:-translate-x-1/2 w-3 h-3 rotate-45 bg-[#04150c] border-l-2 border-b-2 border-[#1f4a2e] lg:border-l-0 lg:border-t-0"
                  />
                </span>
              </motion.button>

              {/* ── Portão de madeira ── */}
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="relative shrink-0 w-[min(84vw,44vh,340px)]"
                style={{ aspectRatio: '3 / 4' }}
              >
                {/* Brilho difuso atrás */}
                <div aria-hidden className="absolute -inset-5 bg-accent/10 blur-3xl rounded-3xl" />

                {/* Floresta vista pelo vidro da janela */}
                <div
                  className="absolute overflow-hidden"
                  style={{
                    ...HOLE,
                    borderRadius: '50% 50% 0 0 / 42% 42% 0 0',
                  }}
                >
                  <Image
                    src="/images/gate-forest.png"
                    alt=""
                    fill
                    sizes="240px"
                    priority
                    className="object-cover gate-forest-drift"
                  />
                  {/* Vidro: tinta esverdeada + reflexo diagonal */}
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(115deg, transparent 22%, rgba(234,255,242,0.12) 42%, rgba(234,255,242,0.2) 48%, transparent 60%), linear-gradient(180deg, rgba(31,211,167,0.1), rgba(4,21,12,0.18))',
                    }}
                  />
                </div>

                {/* O portão em pixel art (janela transparente) */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/pixel-gate.png"
                  alt=""
                  className="absolute inset-0 w-full h-full [image-rendering:pixelated] select-none pointer-events-none drop-shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
                />

                {/* Formulário sobre as portas de madeira */}
                <div className="absolute" style={DOOR}>
                  <AnimatePresence mode="wait">
                    {stage === 'open' || stage === 'thanks' ? (
                      <motion.form
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3 }}
                        onSubmit={enter}
                        className={`w-full h-full flex flex-col justify-center gap-1.5 sm:gap-2 transition-opacity ${
                          stage === 'thanks' ? 'opacity-60 pointer-events-none' : ''
                        }`}
                      >
                        <input
                          id="gate-user"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={t('placeholder_user')}
                          aria-label={t('label_user')}
                          autoComplete="off"
                          maxLength={40}
                          className="w-full px-3 py-2 rounded-md bg-[#04150c]/90 backdrop-blur-sm border border-[#1f4a2e] focus:border-accent-bright outline-none text-[13px] text-foreground placeholder:text-foreground-subtle/70 transition-colors"
                        />
                        <div className="relative">
                          <input
                            id="gate-pass"
                            type={showPass ? 'text' : 'password'}
                            value={pass}
                            onChange={(e) => setPass(e.target.value)}
                            placeholder={t('placeholder_pass')}
                            aria-label={t('label_pass')}
                            autoComplete="off"
                            maxLength={64}
                            className="w-full px-3 py-2 pr-9 rounded-md bg-[#04150c]/90 backdrop-blur-sm border border-[#1f4a2e] focus:border-accent-bright outline-none text-[13px] text-foreground placeholder:text-foreground-subtle/70 transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            aria-label={showPass ? 'Esconder senha' : 'Mostrar senha'}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground-subtle hover:text-accent-bright transition-colors"
                          >
                            {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>

                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={remember}
                          onClick={() => setRemember(!remember)}
                          className="group/r flex items-center gap-2 self-center py-0.5"
                        >
                          <span
                            className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-all ${
                              remember
                                ? 'bg-accent border-accent-bright text-[#04150c]'
                                : 'bg-[#04150c]/90 border-[#1f4a2e] group-hover/r:border-accent'
                            }`}
                          >
                            {remember && <Check size={10} strokeWidth={3.5} />}
                          </span>
                          <span className="text-[11px] text-[#d8f2e2] [text-shadow:0_1px_2px_rgba(0,0,0,0.9)] group-hover/r:text-white transition-colors">
                            {t('remember')}
                          </span>
                        </button>

                        <button
                          type="submit"
                          className="btn-pill-primary w-full !py-2.5 !rounded-lg font-pixel text-[9px] sm:text-[10px] uppercase tracking-wider"
                        >
                          <Swords size={12} />
                          {t('enter')}
                        </button>

                        <button
                          type="button"
                          onClick={enterGuest}
                          className="self-center text-[10px] text-[#c4e3d1] [text-shadow:0_1px_2px_rgba(0,0,0,0.9)] hover:text-accent-bright underline underline-offset-4 decoration-dotted transition-colors"
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
                        className="w-full h-full flex flex-col items-center justify-center gap-3 text-center"
                      >
                        <Compass
                          size={26}
                          className="text-accent-bright animate-[portal-spin_3s_linear_infinite]"
                        />
                        <p className="font-pixel text-[8px] text-[#d8f2e2] [text-shadow:0_1px_2px_rgba(0,0,0,0.9)] uppercase min-h-[2.5em]">
                          {t(`loading_${msgIndex}`)}
                        </p>
                        <div className="w-[85%] h-2 rounded-full bg-[#04150c]/90 border border-[#1f4a2e] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-accent-bright to-accent-2-bright transition-[width] duration-100"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-accent-deep [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]">
                          {Math.floor(progress)}%
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </div>
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
