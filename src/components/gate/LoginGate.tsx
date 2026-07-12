'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Check, Globe, UserPlus, DoorOpen } from 'lucide-react';
import PixelLife from './PixelLife';

// Tela de login estilo game na frente do site, usando a arte oficial
// (moldura ornamentada + círculo com a floresta) como cenário completo.
// Um mago guardião conversa a cada clique. É teatro — qualquer nome/senha
// abre o portal. Depois de entrar, a escolha fica salva.
//
// IMPORTANTE: o conteúdo é estático (sem animações de entrada por elemento).
// Animação de entrada em cada bloco deixava a tela vazia quando o navegador
// pausava o requestAnimationFrame (ex.: troca de idioma com aba desfocada).
// Chaves compartilhadas com o Header (botão Sair) — e, no futuro, com a
// conta real via Supabase (quando o Kauã mandar as credenciais da API).
export const ENTERED_KEY = 'kaua-portal-entered';
export const NAME_KEY = 'kaua-adventurer';
export const AUTH_EVENT = 'kaua-auth-changed';

const YOUTUBE_URL = 'https://www.youtube.com/@KauartX';

// Duas versões da arte oficial: horizontal (PC) e vertical (celular).
// Na horizontal o formulário está PINTADO na arte e os campos reais só se
// alinham por cima (posições medidas por script). A vertical é limpa — o
// site desenha rótulos, campos e botão no estilo da arte.
type Pos = { left: string; top: string; width: string; height?: string };
type ArtSpec = {
  src: string;
  ratio: string;
  hOverW: number;
  painted: boolean;
  labels?: { user: Pos; pass: Pos };
  box: Record<'email' | 'senha' | 'lembrar' | 'entrar' | 'visitante' | 'loading', Pos>;
};

const ART: Record<'landscape' | 'portrait', ArtSpec> = {
  // Arte dourada limpa (sem formulário pintado): o site desenha
  // rótulos, campos e botão centralizados no círculo
  landscape: {
    src: '/images/login-bg.webp',
    ratio: '1672 / 941',
    hOverW: 941 / 1672,
    painted: false,
    labels: {
      user: { left: '40.5%', top: '35.8%', width: '19%' },
      pass: { left: '40.5%', top: '44.6%', width: '19%' },
    },
    box: {
      email: { left: '40.5%', top: '38.8%', width: '19%', height: '4.3%' },
      senha: { left: '40.5%', top: '47.6%', width: '19%', height: '4.3%' },
      lembrar: { left: '40.5%', top: '53.4%', width: '19%', height: '2.8%' },
      entrar: { left: '42.5%', top: '57.6%', width: '15%', height: '5%' },
      visitante: { left: '40.5%', top: '64.2%', width: '19%' },
      loading: { left: '38%', top: '44%', width: '24%', height: '24%' },
    },
  },
  portrait: {
    src: '/images/login-bg-mobile.webp',
    ratio: '853 / 1844',
    hOverW: 1844 / 853,
    painted: false,
    labels: {
      user: { left: '27.4%', top: '47.4%', width: '45.2%' },
      pass: { left: '27.4%', top: '53.8%', width: '45.2%' },
    },
    box: {
      email: { left: '27.4%', top: '49.6%', width: '45.2%', height: '3%' },
      senha: { left: '27.4%', top: '55.9%', width: '45.2%', height: '3%' },
      lembrar: { left: '27.4%', top: '59.9%', width: '45.2%', height: '2.2%' },
      entrar: { left: '29.5%', top: '63.2%', width: '41%', height: '4%' },
      visitante: { left: '27.4%', top: '68.6%', width: '45.2%' },
      loading: { left: '22%', top: '43%', width: '56%', height: '15%' },
    },
  },
};

const WIZARD_LINES = 4;

// 'opening' = os portões se partindo em duas portas 3D que giram
// abrindo pra fora, com luz explodindo do vão — a recompensa de quem
// entregou as credenciais ao mago (visitante entra sem cerimônia)
type Stage = 'hidden' | 'open' | 'thanks' | 'loading' | 'opening';

export default function LoginGate() {
  const t = useTranslations('gate');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [stage, setStage] = useState<Stage>('hidden');
  const [uiFading, setUiFading] = useState(false);
  const [portrait, setPortrait] = useState(false);
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

  // Celular/tela em pé usa a arte vertical; PC usa a horizontal
  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait)');
    setPortrait(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setPortrait(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

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
    // Avisa o Header (botão Sair) que o estado de login mudou
    window.dispatchEvent(new Event(AUTH_EVENT));
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

  // Carregou 100% → a interface some e os portões se abrem
  useEffect(() => {
    if (stage !== 'loading' || progress < 100) return;
    persist(remember);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setUiFading(true);
    const to = setTimeout(
      () => setStage(reduce ? 'hidden' : 'opening'),
      reduce ? 450 : 380
    );
    return () => clearTimeout(to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, stage, remember]);

  // Rede de segurança: se a animação dos portões travar (aba desfocada
  // pausa o requestAnimationFrame), fecha mesmo assim
  useEffect(() => {
    if (stage !== 'opening') return;
    const to = setTimeout(() => setStage('hidden'), 2300);
    return () => clearTimeout(to);
  }, [stage]);

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
  const art = portrait ? ART.portrait : ART.landscape;
  const BOX = art.box;

  if (typeof document === 'undefined') return null;

  const inputClass =
    'absolute rounded-md bg-[#0a1c0f]/95 border border-[#68a14c]/45 focus:border-[#9fdb6d] outline-none px-3 text-[13px] text-[#e9fbef] placeholder:text-[#7a9a83]/80 shadow-[inset_0_2px_8px_rgba(0,0,0,0.55)] transition-colors';

  // Some suave da interface pouco antes dos portões abrirem
  const uiFadeClass = `transition-opacity duration-300 ${uiFading ? 'opacity-0' : ''}`;

  // Cópia só da arte (sem interface) — cada porta carrega metade dela
  const artOnly = (
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{
        aspectRatio: art.ratio,
        height: `max(100vh, calc(100vw * ${art.hOverW}))`,
      }}
    >
      <Image
        src={art.src}
        alt=""
        fill
        priority
        unoptimized
        sizes="100vw"
        className="object-cover select-none [image-rendering:pixelated]"
      />
      <div aria-hidden className="absolute inset-0 bg-[#0d3a1c]/15 mix-blend-overlay" />
      <div aria-hidden className="absolute inset-0 aurora-vignette opacity-60" />
    </div>
  );

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
          className={`fixed inset-0 z-[100] overflow-hidden ${
            stage === 'opening' ? 'bg-transparent' : 'bg-[#0a1408]'
          }`}
        >
          {stage === 'opening' ? (
            /* ── PORTÕES SE ABRINDO: a cena parte ao meio e as duas
                   portas giram pra fora em 3D, luz jorrando do vão ── */
            <div className="absolute inset-0" style={{ perspective: '1400px' }}>
              {/* Porta esquerda */}
              <motion.div
                className="absolute inset-y-0 left-0 w-1/2 overflow-hidden"
                style={{ transformOrigin: 'left center', backfaceVisibility: 'hidden' }}
                initial={{ rotateY: 0 }}
                animate={{ rotateY: -105 }}
                transition={{ duration: 1.6, ease: [0.6, 0.05, 0.9, 0.5] }}
                onAnimationComplete={() => setStage('hidden')}
              >
                <div className="absolute inset-y-0 left-0 w-screen h-full">{artOnly}</div>
                <div aria-hidden className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/60 to-transparent" />
                <div aria-hidden className="absolute inset-y-0 right-0 w-1 bg-[#eafff2]/90 shadow-[0_0_38px_14px_rgba(160,255,180,0.9)]" />
              </motion.div>

              {/* Porta direita */}
              <motion.div
                className="absolute inset-y-0 right-0 w-1/2 overflow-hidden"
                style={{ transformOrigin: 'right center', backfaceVisibility: 'hidden' }}
                initial={{ rotateY: 0 }}
                animate={{ rotateY: 105 }}
                transition={{ duration: 1.6, ease: [0.6, 0.05, 0.9, 0.5] }}
              >
                <div className="absolute inset-y-0 right-0 w-screen h-full">{artOnly}</div>
                <div aria-hidden className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/60 to-transparent" />
                <div aria-hidden className="absolute inset-y-0 left-0 w-1 bg-[#eafff2]/90 shadow-[0_0_38px_14px_rgba(160,255,180,0.9)]" />
              </motion.div>

              {/* Feixe de luz vertical rasgando o vão */}
              <motion.div
                aria-hidden
                className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-2"
                style={{
                  background:
                    'linear-gradient(180deg, transparent, #d5ffe2 18%, #ffffff 50%, #d5ffe2 82%, transparent)',
                  boxShadow: '0 0 80px 30px rgba(170,255,190,0.75)',
                }}
                initial={{ opacity: 0, scaleX: 0.4 }}
                animate={{ opacity: [0, 1, 1, 0], scaleX: [0.4, 3, 14, 40] }}
                transition={{ duration: 1.6, times: [0, 0.25, 0.65, 1], ease: 'easeIn' }}
              />

              {/* Clarão que toma a tela quando as portas passam do meio */}
              <motion.div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at center, rgba(240,255,245,0.95) 0%, rgba(140,245,165,0.45) 35%, transparent 70%)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.15, 0.9, 0] }}
                transition={{ duration: 1.6, times: [0, 0.45, 0.8, 1] }}
              />
            </div>
          ) : (
          <>
          {/* ── Cenário: a arte ocupa a tela inteira (tipo background cover).
                 Os campos ficam em % DENTRO desta caixa, então sempre
                 alinham com os elementos pintados. ── */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              aspectRatio: art.ratio,
              height: `max(100vh, calc(100vw * ${art.hOverW}))`,
            }}
          >
            <Image
              key={art.src}
              src={art.src}
              alt=""
              fill
              priority
              unoptimized
              sizes="100vw"
              className="object-cover select-none [image-rendering:pixelated]"
            />
            {/* Pegada mais verde + leitura */}
            <div aria-hidden className="absolute inset-0 bg-[#0d3a1c]/15 mix-blend-overlay" />
            <div aria-hidden className="absolute inset-0 aurora-vignette opacity-60" />

            {/* ── Vida pixel: borboletas, vagalumes, folhas e libélula ── */}
            <div aria-hidden className={`absolute inset-0 pointer-events-none ${uiFadeClass}`}>
              <PixelLife />
            </div>

            {/* ── Campos reais alinhados sobre os pintados ── */}
            {stage !== 'loading' ? (
              <form onSubmit={enter} className={formActive ? '' : 'pointer-events-none opacity-80'}>
                {/* Arte limpa (celular): os rótulos são desenhados pelo site — e traduzem */}
                {art.labels && (
                  <>
                    <label
                      htmlFor="gate-user"
                      style={art.labels.user}
                      className="absolute text-center text-[13px] font-semibold text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.95),0_0_14px_rgba(0,0,0,0.6)] pointer-events-none"
                    >
                      {t('label_user')}
                    </label>
                    <label
                      htmlFor="gate-pass"
                      style={art.labels.pass}
                      className="absolute text-center text-[13px] font-semibold text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.95),0_0_14px_rgba(0,0,0,0.6)] pointer-events-none"
                    >
                      {t('label_pass')}
                    </label>
                  </>
                )}
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

                {/* Lembrar de mim: no PC cobre o pintado (chip opaco); na arte
                    limpa é checkbox + texto direto sobre a grama, como na referência */}
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={remember}
                  onClick={() => setRemember(!remember)}
                  style={BOX.lembrar}
                  className={`absolute flex items-center justify-center gap-1.5 ${
                    art.painted ? 'px-1.5 rounded bg-[#0a1c0f] border border-[#68a14c]/30' : ''
                  }`}
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
                  <span
                    className={`text-[#f2fdf5] whitespace-nowrap pr-1 [text-shadow:0_1px_3px_rgba(0,0,0,0.95)] ${
                      art.painted ? 'text-[11px]' : 'text-[12px] font-medium'
                    }`}
                  >
                    {t('remember')}
                  </span>
                </button>

                {/* Botão Entrar: no PC o desenho pintado é o visual (aqui só o
                    clique); na arte limpa o botão é desenhado no mesmo estilo */}
                <button
                  type="submit"
                  aria-label={t('enter')}
                  style={BOX.entrar}
                  className={`absolute rounded-lg cursor-pointer transition-all hover:brightness-110 active:scale-[0.98] ${
                    art.painted
                      ? 'hover:shadow-[0_0_24px_rgba(120,220,110,0.55),inset_0_0_14px_rgba(160,255,150,0.2)]'
                      : 'bg-gradient-to-b from-[#25491f] via-[#132e14] to-[#0a1f0d] border-2 border-[#7ba659]/75 text-[15px] font-semibold text-[#eefbea] [text-shadow:0_1px_3px_rgba(0,0,0,0.9)] shadow-[inset_0_1px_0_rgba(190,255,170,0.3),inset_0_-8px_14px_rgba(0,0,0,0.45),0_6px_18px_rgba(0,0,0,0.6)] hover:shadow-[0_0_22px_rgba(120,220,110,0.5),inset_0_1px_0_rgba(190,255,170,0.3)]'
                  }`}
                >
                  {!art.painted && t('enter')}
                </button>

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
                className={`absolute flex flex-col items-center justify-center gap-3 text-center rounded-2xl bg-[#07130a]/85 border border-[#68a14c]/35 backdrop-blur-sm p-4 ${uiFadeClass}`}
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

          {/* ── Logo (canto superior esquerdo, como nos games). No celular ganha
                 uma placa escura atrás — direto sobre a arte clara ficava lavado.
                 O "ARTX" é verde vivo sólido: o gradiente com clip-text some na
                 arte e ignora text-shadow. ── */}
          <div className={`absolute top-3 left-3 sm:top-7 sm:left-9 rounded-xl bg-[#04100a]/70 border border-[#68a14c]/30 shadow-[0_4px_18px_rgba(0,0,0,0.5)] backdrop-blur-[2px] px-3 py-2.5 sm:bg-transparent sm:border-transparent sm:shadow-none sm:backdrop-blur-0 sm:px-0 sm:py-0 ${uiFadeClass}`}>
            <h1 className="font-pixel text-sm sm:text-lg text-white [text-shadow:0_2px_0_rgba(0,0,0,0.9),0_0_18px_rgba(99,247,141,0.75),0_2px_6px_rgba(0,0,0,0.95)]">
              KAUÃ{' '}
              <span className="text-[#63f78d] [text-shadow:0_2px_0_rgba(0,0,0,0.9),0_0_16px_rgba(99,247,141,0.85),0_2px_6px_rgba(0,0,0,0.95)]">
                ARTX
              </span>
            </h1>
            <p className="font-pixel text-[6px] sm:text-[8px] text-[#eafff2] tracking-[0.3em] mt-1.5 uppercase [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
              {t('subtitle')}
            </p>
            {/* No celular a versão/copyright mora aqui (embaixo não cabe junto dos botões) */}
            <p className="sm:hidden font-pixel text-[6px] text-[#d5efe0] mt-2 max-w-[190px] leading-relaxed [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
              {t('version')} · {t('copyright')}
            </p>
          </div>

          {/* ── Mago guardião + diálogo. No celular vira caixa RPG na BASE da
                 tela (mago à esquerda, fala à direita) — o balão que crescia
                 pra cima cobria o botão Entrar quando a fala era longa. ── */}
          <button
            type="button"
            onClick={talkToWizard}
            aria-label={t('wizard_tap')}
            className={`group absolute left-2 right-2 bottom-2 sm:right-auto sm:left-6 lg:left-[4%] sm:bottom-14 flex flex-row items-end gap-2 sm:flex-col sm:items-start sm:gap-2 cursor-pointer text-left sm:max-w-[300px] ${uiFadeClass}`}
          >
            <Image
              src="/images/pixel-wizard.png"
              alt=""
              width={36}
              height={52}
              priority
              className={`order-1 sm:order-2 w-14 sm:w-24 lg:w-28 h-auto shrink-0 sm:ml-3 [image-rendering:pixelated] select-none transition-[filter] duration-500 group-hover:drop-shadow-[0_0_14px_rgba(99,247,141,0.55)] ${
                stage === 'thanks' || stage === 'loading'
                  ? 'drop-shadow-[0_0_22px_rgba(99,247,141,0.95)]'
                  : 'drop-shadow-[0_0_10px_rgba(53,224,101,0.4)]'
              }`}
            />
            <span className="order-2 sm:order-1 relative block flex-1 sm:flex-none sm:w-full rounded-lg border-2 border-[#68a14c]/50 bg-[#07130a]/95 backdrop-blur-sm p-3 shadow-[0_8px_30px_rgba(0,0,0,0.65),inset_0_0_0_1px_rgba(120,220,110,0.15)]">
              <span className="block font-pixel text-[8px] sm:text-[9px] leading-[1.9] text-[#e9fbef] min-h-[4.75em]">
                {typed}
                {stage === 'open' && typed === fullMsg && (
                  <span className="rpg-blink text-accent-bright"> ▼</span>
                )}
              </span>
              <span className="block mt-1.5 font-pixel text-[6px] sm:text-[7px] text-[#7a9a83] uppercase tracking-widest">
                {t('wizard_tap')}
              </span>
              {/* setinha do balão: aponta pro mago (esquerda no celular, baixo no PC) */}
              <span
                aria-hidden
                className="absolute top-1/2 -left-[8px] -translate-y-1/2 w-3.5 h-3.5 rotate-45 bg-[#07130a] border-l-2 border-b-2 border-[#68a14c]/50 sm:top-auto sm:translate-y-0 sm:left-8 sm:-bottom-[8px] sm:border-l-0 sm:border-r-2"
              />
            </span>
          </button>

          {/* ── Rodapé: versão + copyright centralizados (o mago mora à esquerda) ── */}
          <div className={`hidden sm:block absolute bottom-4 inset-x-0 text-center pointer-events-none ${uiFadeClass}`}>
            <p className="font-pixel text-[7px] text-[#c4e3d1]/90 [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
              {t('version')} · {t('copyright')}
            </p>
          </div>

          {/* No celular ficam no topo direito (a base é da caixa de diálogo do mago) */}
          <div className={`absolute top-4 right-3 bottom-auto sm:top-auto sm:right-9 sm:bottom-6 flex flex-col items-end sm:items-stretch gap-2 ${uiFadeClass}`}>
            {[
              { icon: Globe, label: `${t('language')}: ${locale === 'pt' ? 'EN' : 'PT'}`, onClick: switchLocale },
              { icon: UserPlus, label: t('create'), onClick: goCreateAccount },
            ].map(({ icon: Icon, label, onClick }) => (
              <button
                key={label}
                type="button"
                onClick={onClick}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-5 sm:py-2 rounded-md bg-[#0a1c0f]/90 border border-[#68a14c]/50 hover:border-[#9fdb6d] hover:bg-[#12301a]/90 text-[11px] sm:text-xs text-[#d8f2e2] transition-all shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-5 sm:py-2 rounded-md bg-[#0a1c0f]/90 border border-[#68a14c]/50 hover:border-red-400/60 hover:text-red-300 text-[11px] sm:text-xs text-[#d8f2e2] transition-all shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
            >
              <DoorOpen size={12} />
              {t('exit')}
            </a>
          </div>
          </>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
