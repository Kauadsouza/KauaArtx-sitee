'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, Globe, Eye, EyeOff,
  Youtube, Instagram, Linkedin,
} from 'lucide-react';
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
  // Onde o card de vidro (formulário) se apoia
  card: Pos;
};

const ART: Record<'landscape' | 'portrait', ArtSpec> = {
  // O formulário mora num CARD DE VIDRO fosco centralizado no círculo,
  // com o "Entrar" manuscrito ao lado — como na referência de Sign Up
  landscape: {
    src: '/images/login-bg.webp',
    ratio: '1672 / 941',
    hOverW: 941 / 1672,
    card: { left: '50%', top: '26%', width: '26%' },
  },
  // Celular: foto real de floresta com névoa (sem moldura pintada) — o
  // site desenha o card de vidro centralizado por cima.
  portrait: {
    src: '/images/login-bg-mobile.webp',
    ratio: '720 / 1285',
    hOverW: 1285 / 720,
    card: { left: '50%', top: '33%', width: '66%' },
  },
};

const WIZARD_LINES = 4;

// 'casting' = o mago ergue o cajado, o orbe concentra energia e um
// clarão de magia engole a tela — quando a luz dissipa, o site já está
// revelado. Visitante ganha o feitiço direto, sem o agradecimento antes.
type Stage = 'hidden' | 'open' | 'thanks' | 'casting';

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
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);

  // Diálogo do mago
  const [line, setLine] = useState(0);
  const [typed, setTyped] = useState('');
  const typedRef = useRef(0);
  const lastMsgRef = useRef('');
  // Visitante não marca "lembrar" — mas ganha a mesma entrada animada
  const guestRef = useRef(false);
  // O feitiço roda SEMPRE (celulares com economia de bateria ligam
  // prefers-reduced-motion sem o dono saber e o mago ficava mudo);
  // ele é curto e os timeouts garantem que ninguém fica preso.

  // Parallax do cenário: a arte acompanha o mouse de leve (só desktop)
  const artLayerRef = useRef<HTMLDivElement>(null);

  const adventurer = name.trim() || t('default_adventurer');
  const fullMsg =
    stage === 'thanks' || stage === 'casting'
      ? t('wizard_thanks', { name: adventurer })
      : t(`wizard_${line + 1}`);

  // Cena viva: a arte se move sutilmente com o mouse (profundidade).
  // Celular (pointer coarse) e quem pediu menos animação ficam de fora.
  useEffect(() => {
    if (stage === 'hidden') return;
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.matchMedia('(pointer: coarse)').matches
    )
      return;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * -16;
      ty = (e.clientY / window.innerHeight - 0.5) * -10;
    };
    const loop = () => {
      cx += (tx - cx) * 0.05;
      cy += (ty - cy) * 0.05;
      if (artLayerRef.current) {
        artLayerRef.current.style.transform = `scale(1.05) translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px)`;
      }
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [stage]);

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

  // Máquina de escrever do diálogo. Se a fala já terminou e só o estágio
  // mudou (thanks → casting), não recomeça — evitaria redigitar o obrigado.
  useEffect(() => {
    if (stage === 'hidden') return;
    if (lastMsgRef.current === fullMsg && typedRef.current >= fullMsg.length) return;
    lastMsgRef.current = fullMsg;
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

  // Mago terminou de agradecer → ergue o cajado e lança o feitiço
  useEffect(() => {
    if (stage !== 'thanks' || typed !== fullMsg) return;
    const to = setTimeout(() => setStage('casting'), 500);
    return () => clearTimeout(to);
  }, [stage, typed, fullMsg]);

  // O feitiço: o card some, o orbe do cajado concentra energia e o clarão
  // engole a tela. Timeouts (e não onAnimationComplete) guiam o estágio —
  // aba desfocada pausa animações, mas o portal fecha mesmo assim.
  useEffect(() => {
    if (stage !== 'casting') return;
    persist(guestRef.current ? false : remember);
    const fade = setTimeout(() => setUiFading(true), 150);
    // ~1,5s de energia concentrando no orbe + ~1s de clarão crescendo;
    // no auge o portal se desfaz e o fade de saída dissolve a luz
    const done = setTimeout(() => setStage('hidden'), 2700);
    return () => {
      clearTimeout(fade);
      clearTimeout(done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, remember]);

  // Fecha o teclado do celular — senão ele esconde o mago na hora do show
  const closeKeyboard = () => {
    try {
      (document.activeElement as HTMLElement | null)?.blur?.();
    } catch {}
  };

  const enter = (e?: React.FormEvent) => {
    e?.preventDefault();
    closeKeyboard();
    const trimmed = name.trim();
    if (trimmed) {
      try {
        localStorage.setItem(NAME_KEY, trimmed);
      } catch {}
    }
    setStage('thanks');
  };

  // Visitante entra com a mesma cerimônia: o feitiço do mago
  const enterGuest = () => {
    closeKeyboard();
    guestRef.current = true;
    setStage('casting');
  };

  const switchLocale = () => {
    router.replace(pathname, { locale: locale === 'pt' ? 'en' : 'pt' });
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

  const formActive = stage === 'open';
  const casting = stage === 'casting';
  // O mago ergue o cajado (troca da arte parada → arte de conjuração) no
  // instante em que agradece e mantém erguido durante o feitiço.
  const armRaised = stage === 'thanks' || stage === 'casting';
  const art = portrait ? ART.portrait : ART.landscape;

  if (typeof document === 'undefined') return null;

  // Some suave da interface enquanto o mago concentra o feitiço
  const uiFadeClass = `transition-opacity duration-300 ${uiFading ? 'opacity-0' : ''}`;

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
            {/* A arte fica numa camada própria com leve zoom — o parallax
                   move ela sem nunca mostrar as bordas */}
            <div
              ref={artLayerRef}
              className="absolute inset-0 will-change-transform"
              style={{ transform: 'scale(1.05)' }}
            >
              <Image
                key={art.src}
                src={art.src}
                alt=""
                fill
                priority
                quality={95}
                sizes="100vw"
                className="object-cover select-none"
              />
            </div>
            {/* Pegada mais verde + leitura */}
            <div aria-hidden className="absolute inset-0 bg-[#0d3a1c]/15 mix-blend-overlay" />
            <div aria-hidden className="absolute inset-0 aurora-vignette opacity-60" />

            {/* ── Atmosfera: sol respirando, raios e névoa ── */}
            <div aria-hidden className={`absolute inset-0 pointer-events-none overflow-hidden ${uiFadeClass}`}>
              <div className="gate-sun-breathe absolute left-1/2 top-[28%] -translate-x-1/2 -translate-y-1/2 w-[46%] aspect-square rounded-full" />
              <div className="gate-rays absolute left-1/2 top-0 -translate-x-1/2 w-[76%] h-[68%]" />
              <div className="gate-fog gate-fog-a" />
              <div className="gate-fog gate-fog-b" />
            </div>

            {/* ── Vida pixel: borboletas, vagalumes, folhas e libélula ── */}
            <div aria-hidden className={`absolute inset-0 pointer-events-none ${uiFadeClass}`}>
              <PixelLife />
            </div>

            {/* ── Card de vidro com login animado (labels flutuantes) ── */}
            <form
                onSubmit={enter}
                style={art.card}
                className={`absolute -translate-x-1/2 w-[min(400px,92vw)] rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.15)] p-5 sm:p-7 transition-opacity duration-300 ${
                  uiFading
                    ? 'pointer-events-none opacity-0'
                    : formActive
                      ? ''
                      : 'pointer-events-none opacity-80'
                }`}
              >
                {/* Cabeçalho de boas-vindas */}
                <div className="text-center mb-4 sm:mb-5">
                  <h2 className="font-script text-4xl sm:text-5xl text-[#eafff2] [text-shadow:0_2px_12px_rgba(0,0,0,0.7)]">
                    {t('welcome_title')}
                  </h2>
                  <p className="mt-1.5 text-[12px] text-[#c9e4d2] [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
                    {t('welcome_sub')}
                  </p>
                </div>

                {/* Nômade — label flutuante */}
                <div className="relative mb-3">
                  <input
                    id="gate-user"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder=" "
                    autoComplete="off"
                    maxLength={40}
                    className="peer w-full rounded-xl bg-[#0a1c0f]/80 border border-white/15 focus:border-[#9fdb6d] outline-none px-3.5 pt-5 pb-2 text-[14px] text-[#e9fbef] shadow-[inset_0_2px_8px_rgba(0,0,0,0.45)] transition-colors"
                  />
                  <label
                    htmlFor="gate-user"
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] text-[#8fae9a] pointer-events-none transition-all duration-200 peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:text-[#9fdb6d] peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[10px]"
                  >
                    {t('label_user')}
                  </label>
                </div>

                {/* Senha — label flutuante + mostrar/esconder */}
                <div className="relative mb-3.5">
                  <input
                    id="gate-pass"
                    type={showPass ? 'text' : 'password'}
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    placeholder=" "
                    autoComplete="off"
                    maxLength={64}
                    className="peer w-full rounded-xl bg-[#0a1c0f]/80 border border-white/15 focus:border-[#9fdb6d] outline-none px-3.5 pr-10 pt-5 pb-2 text-[14px] text-[#e9fbef] shadow-[inset_0_2px_8px_rgba(0,0,0,0.45)] transition-colors"
                  />
                  <label
                    htmlFor="gate-pass"
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] text-[#8fae9a] pointer-events-none transition-all duration-200 peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:text-[#9fdb6d] peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[10px]"
                  >
                    {t('label_pass')}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    aria-label={showPass ? 'Esconder senha' : 'Mostrar senha'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8fae9a] hover:text-[#9fdb6d] transition-colors"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Lembrar de mim + visitante */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={remember}
                    onClick={() => setRemember(!remember)}
                    className="inline-flex items-center gap-2 group/r"
                  >
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        remember
                          ? 'bg-[#4caf50] border-[#9fdb6d] text-[#04150c]'
                          : 'bg-[#0a1c0f]/80 border-white/25 group-hover/r:border-[#9fdb6d]'
                      }`}
                    >
                      {remember && <Check size={11} strokeWidth={3.5} />}
                    </span>
                    <span className="text-[11px] text-[#e4f5ea] [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
                      {t('remember')}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={enterGuest}
                    className="text-[11px] text-[#9fdb6d] hover:text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.8)] transition-colors"
                  >
                    {t('guest')} →
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-b from-[#25491f] via-[#132e14] to-[#0a1f0d] border border-[#7ba659]/60 text-[14px] font-semibold text-[#eefbea] [text-shadow:0_1px_3px_rgba(0,0,0,0.9)] shadow-[inset_0_1px_0_rgba(190,255,170,0.3),0_6px_18px_rgba(0,0,0,0.5)] transition-all hover:brightness-115 hover:shadow-[0_0_22px_rgba(120,220,110,0.5)] active:scale-[0.98]"
                >
                  {t('enter')}
                </button>

                {/* Separador */}
                <div className="flex items-center gap-3 my-4">
                  <span aria-hidden className="h-px flex-1 bg-white/15" />
                  <span className="text-[10px] text-[#c9e4d2]/85 uppercase tracking-widest [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
                    {t('or_continue')}
                  </span>
                  <span aria-hidden className="h-px flex-1 bg-white/15" />
                </div>

                {/* Sociais */}
                <div className="flex justify-center gap-3">
                  {[
                    { href: YOUTUBE_URL, icon: Youtube, label: 'YouTube' },
                    { href: 'https://www.instagram.com/kauaartx/', icon: Instagram, label: 'Instagram' },
                    { href: 'https://www.linkedin.com/in/kauadsouza/', icon: Linkedin, label: 'LinkedIn' },
                  ].map(({ href, icon: Icon, label }) => (
                    <a
                      key={href}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 hover:bg-white/20 hover:border-white/30 flex items-center justify-center text-[#e9fbef] transition-all"
                    >
                      <Icon size={17} />
                    </a>
                  ))}
                </div>
              </form>
          </div>

          {/* ── Logo (canto superior esquerdo) — mesma marca profissional
                 do header do site: Geist bold, "Artx" em verde ── */}
          <div className={`absolute top-4 left-4 sm:top-6 sm:left-8 ${uiFadeClass}`}>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.85),0_0_22px_rgba(0,0,0,0.6)]">
              Kauã{' '}
              <span className="text-[#63f78d] [text-shadow:0_1px_3px_rgba(0,0,0,0.85),0_0_18px_rgba(99,247,141,0.5)]">
                Artx
              </span>
            </h1>
          </div>

          {/* ── Mago guardião + diálogo. No celular vira caixa RPG na BASE da
                 tela (mago à esquerda, fala à direita) — o balão que crescia
                 pra cima cobria o botão Entrar quando a fala era longa. ── */}
          <button
            type="button"
            onClick={talkToWizard}
            aria-label={t('wizard_tap')}
            className="group absolute left-2 right-2 bottom-2 sm:right-auto sm:left-6 lg:left-[4%] sm:bottom-14 flex flex-row items-end gap-2 sm:flex-col sm:items-start sm:gap-2 cursor-pointer text-left sm:max-w-[300px]"
          >
            {/* O mago não some no fade: ele é quem lança o feitiço.
                   Duas artes ancoradas na BASE: a parada (cajado abaixado) e
                   a de conjuração (cajado erguido). Elas se alternam num
                   crossfade — o corpo fica no lugar e só o cajado sobe.
                   Larguras/offset medidos por script pros pés casarem. */}
            <motion.span
              className="order-1 sm:order-2 relative block shrink-0 sm:ml-3 w-16 sm:w-28 lg:w-32"
              style={{ aspectRatio: '829 / 1292' }}
              animate={
                casting
                  ? { scale: [1, 1.05, 1.02, 1.06, 1.03, 1.09], y: [0, -3, -1, -5, -2, -7] }
                  : {}
              }
              transition={{ duration: 2.4, ease: 'easeInOut' }}
            >
              {/* Mago parado (cajado abaixado, orbe azul em descanso) */}
              <Image
                src="/images/wizard-idle.webp"
                alt=""
                fill
                priority
                sizes="140px"
                className={`object-contain object-bottom select-none transition-opacity duration-500 drop-shadow-[0_0_10px_rgba(53,224,101,0.35)] group-hover:drop-shadow-[0_0_14px_rgba(99,247,141,0.55)] ${
                  armRaised ? 'opacity-0' : 'opacity-100'
                }`}
              />

              {/* Mago conjurando (cajado erguido): mais alto, ancorado embaixo
                     e alinhado ao corpo da arte parada (feitiço nasce daqui) */}
              <div
                className="absolute bottom-0 pointer-events-none transition-opacity duration-500"
                style={{ left: '2.4%', width: '87.6%', height: '112.7%', opacity: armRaised ? 1 : 0 }}
              >
                <Image
                  src="/images/wizard-cast.webp"
                  alt=""
                  fill
                  priority
                  sizes="140px"
                  className={`object-contain object-bottom select-none transition-[filter] duration-500 ${
                    casting
                      ? 'drop-shadow-[0_0_30px_rgba(140,255,170,1)]'
                      : 'drop-shadow-[0_0_22px_rgba(99,247,141,0.95)]'
                  }`}
                />
                {/* ── O FEITIÇO: energia concentra no orbe verde do cajado
                       (84,4% / 8,1% do sprite) e explode num clarão ── */}
                {casting && (
                  <span
                    aria-hidden
                    className="absolute pointer-events-none"
                    style={{ left: '84.4%', top: '8.1%' }}
                  >
                    {/* orbe concentrando energia */}
                    <motion.span
                      className="absolute block w-10 h-10 rounded-full"
                      style={{
                        x: '-50%',
                        y: '-50%',
                        background:
                          'radial-gradient(circle, #ffffff 0%, #c8ffdb 40%, rgba(140,255,170,0) 72%)',
                        boxShadow: '0 0 34px 14px rgba(150,255,180,0.85)',
                      }}
                      initial={{ scale: 0.15, opacity: 0 }}
                      animate={{
                        scale: [0.15, 0.8, 0.55, 1.0, 0.7, 1.25, 0.9, 1.7],
                        opacity: [0, 1, 0.85, 1, 0.9, 1, 1, 1],
                      }}
                      transition={{ duration: 1.5, ease: 'easeInOut' }}
                    />
                    {/* anel de choque disparando na frente do clarão */}
                    <motion.span
                      className="absolute block w-16 h-16 rounded-full border-2 border-[#d9ffe6]"
                      style={{ x: '-50%', y: '-50%' }}
                      initial={{ scale: 0.2, opacity: 0 }}
                      animate={{ scale: 16, opacity: [0, 0.9, 0] }}
                      transition={{ duration: 0.9, delay: 1.5, ease: 'easeOut' }}
                    />
                    {/* o clarão em si, crescendo do orbe até tomar tudo */}
                    <motion.span
                      className="absolute block w-24 h-24 rounded-full"
                      style={{
                        x: '-50%',
                        y: '-50%',
                        background:
                          'radial-gradient(circle, #ffffff 0%, #eafff2 34%, #a5f7bd 60%, rgba(150,247,180,0.7) 80%, rgba(150,247,180,0) 100%)',
                      }}
                      initial={{ scale: 0, opacity: 0.9 }}
                      animate={{ scale: 60, opacity: 1 }}
                      transition={{ duration: 0.95, delay: 1.6, ease: [0.4, 0, 0.8, 0.4] }}
                    />
                  </span>
                )}
              </div>
            </motion.span>
            <span className="order-2 sm:order-1 relative block flex-1 sm:flex-none sm:w-full rounded-lg border-2 border-[#68a14c]/50 bg-[#07130a]/95 backdrop-blur-sm p-3 shadow-[0_8px_30px_rgba(0,0,0,0.65),inset_0_0_0_1px_rgba(120,220,110,0.15)]">
              <span className="block font-pixel text-[8px] sm:text-[9px] leading-[1.9] text-[#e9fbef] min-h-[4.75em]">
                {typed}
                {stage === 'open' && typed === fullMsg && (
                  <span className="rpg-blink text-[#9fdb6d]"> ▼</span>
                )}
              </span>
              {stage === 'open' && (
                <span className="block mt-1.5 font-pixel text-[6px] sm:text-[7px] text-[#7a9a83] uppercase tracking-widest">
                  {t('wizard_tap')}
                </span>
              )}
              {/* setinha do balão: aponta pro mago (esquerda no celular, baixo no PC) */}
              <span
                aria-hidden
                className="absolute top-1/2 -left-[8px] -translate-y-1/2 w-3.5 h-3.5 rotate-45 bg-[#07130a] border-l-2 border-b-2 border-[#68a14c]/50 sm:top-auto sm:translate-y-0 sm:left-8 sm:-bottom-[8px] sm:border-l-0 sm:border-r-2"
              />
            </span>
          </button>

          {/* ── Garantia de cobertura do feitiço: em telas muito grandes o
                 clarão que cresce do cajado pode não alcançar o canto oposto —
                 esta camada acende a tela inteira junto com o auge ── */}
          {casting && (
            <motion.div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 10% 88%, #ffffff 0%, #eafff2 45%, #b9f7cc 100%)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.55, delay: 2.0, ease: 'easeIn' }}
            />
          )}

          {/* ── Troca de idioma discreta (canto superior direito) ── */}
          <button
            type="button"
            onClick={switchLocale}
            className={`absolute top-4 right-4 sm:top-6 sm:right-7 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#04100a]/50 border border-white/15 backdrop-blur-[2px] text-[11px] text-[#d8f2e2] hover:bg-[#04100a]/70 hover:border-white/30 transition-all ${uiFadeClass}`}
          >
            <Globe size={12} />
            {locale === 'pt' ? 'EN' : 'PT'}
          </button>
          </>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
