'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Check, Globe, UserPlus, DoorOpen } from 'lucide-react';

// Tela de login estilo game na frente do site, usando a arte oficial
// (moldura ornamentada + círculo com a floresta) como cenário completo.
// Um mago guardião conversa a cada clique. É teatro — qualquer nome/senha
// abre o portal. Depois de entrar, a escolha fica salva.
//
// IMPORTANTE: o conteúdo é estático (sem animações de entrada por elemento).
// Animação de entrada em cada bloco deixava a tela vazia quando o navegador
// pausava o requestAnimationFrame (ex.: troca de idioma com aba desfocada).
const ENTERED_KEY = 'kaua-portal-entered';
const NAME_KEY = 'kaua-adventurer';

const YOUTUBE_URL = 'https://www.youtube.com/@KauartX';

// A arte de fundo tem 1672×941. Os campos reais ficam alinhados por cima
// dos elementos pintados nela (posições medidas por script, em %).
const BG_RATIO = 941 / 1672;
const BOX = {
  email: { left: '41.2%', top: '41.3%', width: '17.5%', height: '4.1%' },
  senha: { left: '41.2%', top: '49.9%', width: '17.5%', height: '4.1%' },
  lembrar: { left: '41.2%', top: '56.5%', width: '10.5%', height: '3%' },
  entrar: { left: '42.9%', top: '60.7%', width: '14.1%', height: '4.6%' },
  visitante: { left: '41.2%', top: '66.6%', width: '17.5%' },
  loading: { left: '38%', top: '44%', width: '24%', height: '24%' },
} as const;

// Posições fixas (nada de Math.random no render → sem bug de hidratação)
const FIREFLIES = [
  { left: '10%', top: '30%', dur: '9s', delay: '0s' },
  { left: '20%', top: '66%', dur: '11s', delay: '1.2s' },
  { left: '33%', top: '24%', dur: '8s', delay: '2.4s' },
  { left: '62%', top: '30%', dur: '12s', delay: '0.6s' },
  { left: '75%', top: '62%', dur: '10s', delay: '3s' },
  { left: '87%', top: '34%', dur: '9.5s', delay: '1.8s' },
  { left: '48%', top: '76%', dur: '11.5s', delay: '0.3s' },
] as const;

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
  const [remember, setRemember] = useState(true);
  const [progress, setProgress] = useState(0);

  // Diálogo do mago
  const [line, setLine] = useState(0);
  const [typed, setTyped] = useState('');
  const typedRef = useRef(0);

  const adventurer = name.trim() || t('default_adventurer');
  const fullMsg =
    stage === 'thanks' || stage === 'loading'
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

  // Trava o scroll do site enquanto o portal está aberto
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
  const formActive = stage === 'open';

  if (typeof document === 'undefined') return null;

  const inputClass =
    'absolute rounded-md bg-[#0a1c0f]/95 border border-[#68a14c]/45 focus:border-[#9fdb6d] outline-none px-3 text-[13px] text-[#e9fbef] placeholder:text-[#7a9a83]/80 shadow-[inset_0_2px_8px_rgba(0,0,0,0.55)] transition-colors';

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
          className="fixed inset-0 z-[100] overflow-hidden bg-[#0a1408]"
        >
          {/* ── Cenário: a arte ocupa a tela inteira (tipo background cover).
                 Os campos ficam em % DENTRO desta caixa, então sempre
                 alinham com os elementos pintados. ── */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              aspectRatio: '1672 / 941',
              height: `max(100vh, calc(100vw * ${BG_RATIO}))`,
            }}
          >
            <Image
              src="/images/login-bg.webp"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover select-none"
            />
            {/* Pegada mais verde + leitura */}
            <div aria-hidden className="absolute inset-0 bg-[#0d3a1c]/15 mix-blend-overlay" />
            <div aria-hidden className="absolute inset-0 aurora-vignette opacity-60" />

            {/* ── Campos reais alinhados sobre os pintados ── */}
            {stage !== 'loading' ? (
              <form onSubmit={enter} className={formActive ? '' : 'pointer-events-none opacity-80'}>
                <input
                  id="gate-user"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('placeholder_user')}
                  aria-label={t('label_user')}
                  autoComplete="off"
                  maxLength={40}
                  style={BOX.email}
                  className={inputClass}
                />
                <input
                  id="gate-pass"
                  type="password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder={t('placeholder_pass')}
                  aria-label={t('label_pass')}
                  autoComplete="off"
                  maxLength={64}
                  style={BOX.senha}
                  className={inputClass}
                />

                {/* Lembrar de mim (cobre o pintado, que era ilegível) */}
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={remember}
                  onClick={() => setRemember(!remember)}
                  style={BOX.lembrar}
                  className="absolute flex items-center gap-1.5 px-1.5 rounded bg-[#0a1c0f]/90 border border-[#68a14c]/30"
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-all ${
                      remember
                        ? 'bg-[#4caf50] border-[#9fdb6d] text-[#04150c]'
                        : 'bg-[#0a1c0f] border-[#68a14c]/60'
                    }`}
                  >
                    {remember && <Check size={10} strokeWidth={3.5} />}
                  </span>
                  <span className="text-[11px] text-[#d8f2e2] whitespace-nowrap pr-1">
                    {t('remember')}
                  </span>
                </button>

                {/* Botão Entrar: o desenho pintado é o visual; aqui só o clique */}
                <button
                  type="submit"
                  aria-label={t('enter')}
                  style={BOX.entrar}
                  className="absolute rounded-lg cursor-pointer transition-all hover:shadow-[0_0_24px_rgba(120,220,110,0.55),inset_0_0_14px_rgba(160,255,150,0.2)] hover:brightness-110 active:scale-[0.98]"
                />

                <button
                  type="button"
                  onClick={enterGuest}
                  style={BOX.visitante}
                  className="absolute text-center text-[11px] text-[#d8f2e2]/90 [text-shadow:0_1px_3px_rgba(0,0,0,0.95)] hover:text-white underline underline-offset-4 decoration-dotted transition-colors"
                >
                  {t('guest')} →
                </button>
              </form>
            ) : (
              /* ── Carregando o mundo (no centro do círculo) ── */
              <div
                style={BOX.loading}
                className="absolute flex flex-col items-center justify-center gap-3 text-center rounded-2xl bg-[#07130a]/85 border border-[#68a14c]/35 backdrop-blur-sm p-4"
              >
                <Compass
                  size={26}
                  className="text-accent-bright animate-[portal-spin_3s_linear_infinite]"
                />
                <p className="font-pixel text-[8px] text-[#d8f2e2] uppercase min-h-[2.5em]">
                  {t(`loading_${msgIndex}`)}
                </p>
                <div className="w-full h-2 rounded-full bg-[#04150c] border border-[#1f4a2e] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent-bright to-accent-2-bright transition-[width] duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="font-mono text-[11px] text-accent-deep">
                  {Math.floor(progress)}%
                </span>
              </div>
            )}
          </div>

          {/* ── Vagalumes por cima do cenário ── */}
          <div aria-hidden className="absolute inset-0 pointer-events-none">
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

          {/* ── Logo (canto superior esquerdo, como nos games) ── */}
          <div className="absolute top-5 left-6 sm:top-7 sm:left-9">
            <h1 className="font-pixel text-sm sm:text-lg text-foreground [text-shadow:0_0_18px_rgba(99,247,141,0.7),0_2px_4px_rgba(0,0,0,0.9)]">
              KAUÃ <span className="text-gradient">ARTX</span>
            </h1>
            <p className="font-pixel text-[6px] sm:text-[8px] text-[#c4e3d1] tracking-[0.3em] mt-1.5 uppercase [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
              {t('subtitle')}
            </p>
          </div>

          {/* ── Mago guardião + balão de diálogo ── */}
          <button
            type="button"
            onClick={talkToWizard}
            aria-label={t('wizard_tap')}
            className="group absolute left-2 sm:left-6 lg:left-[4%] bottom-16 sm:bottom-14 flex flex-col items-start gap-2 cursor-pointer text-left max-w-[78vw] sm:max-w-[300px]"
          >
            <span className="relative block w-full rounded-lg border-2 border-[#68a14c]/50 bg-[#07130a]/95 backdrop-blur-sm p-3 shadow-[0_8px_30px_rgba(0,0,0,0.65),inset_0_0_0_1px_rgba(120,220,110,0.15)]">
              <span className="block font-pixel text-[8px] sm:text-[9px] leading-[1.9] text-[#e9fbef] min-h-[4.75em]">
                {typed}
                {stage === 'open' && typed === fullMsg && (
                  <span className="rpg-blink text-accent-bright"> ▼</span>
                )}
              </span>
              <span className="block mt-1.5 font-pixel text-[6px] sm:text-[7px] text-[#7a9a83] uppercase tracking-widest">
                {t('wizard_tap')}
              </span>
              <span
                aria-hidden
                className="absolute left-8 -bottom-[8px] w-3.5 h-3.5 rotate-45 bg-[#07130a] border-r-2 border-b-2 border-[#68a14c]/50"
              />
            </span>
            <Image
              src="/images/pixel-wizard.png"
              alt=""
              width={36}
              height={52}
              priority
              className={`w-16 sm:w-24 lg:w-28 h-auto ml-3 [image-rendering:pixelated] select-none transition-[filter] duration-500 group-hover:drop-shadow-[0_0_14px_rgba(99,247,141,0.55)] ${
                stage === 'thanks' || stage === 'loading'
                  ? 'drop-shadow-[0_0_22px_rgba(99,247,141,0.95)]'
                  : 'drop-shadow-[0_0_10px_rgba(53,224,101,0.4)]'
              }`}
            />
          </button>

          {/* ── Rodapé: versão + copyright centralizados (o mago mora à esquerda) ── */}
          <div className="absolute bottom-2.5 sm:bottom-4 inset-x-0 text-center pointer-events-none">
            <p className="font-pixel text-[7px] text-[#c4e3d1]/90 [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
              {t('version')} · {t('copyright')}
            </p>
          </div>

          <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-9 flex flex-col gap-2">
            {[
              { icon: Globe, label: `${t('language')}: ${locale === 'pt' ? 'EN' : 'PT'}`, onClick: switchLocale },
              { icon: UserPlus, label: t('create'), onClick: goCreateAccount },
            ].map(({ icon: Icon, label, onClick }) => (
              <button
                key={label}
                type="button"
                onClick={onClick}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-md bg-[#0a1c0f]/90 border border-[#68a14c]/50 hover:border-[#9fdb6d] hover:bg-[#12301a]/90 text-xs text-[#d8f2e2] transition-all shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-md bg-[#0a1c0f]/90 border border-[#68a14c]/50 hover:border-red-400/60 hover:text-red-300 text-xs text-[#d8f2e2] transition-all shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
            >
              <DoorOpen size={12} />
              {t('exit')}
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
