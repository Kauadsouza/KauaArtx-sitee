'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthComponent } from '@/components/ui/sign-up';
import { createClient } from '@/lib/supabase/client';

// Portal de entrada do site, com o cadastro de vidro (sign-up.tsx).
// Duas formas de "estar entrado":
// 1) Sessão REAL do Supabase (email/senha, Google ou GitHub) — manda mais
//    que qualquer flag local; é o que faz o portal não reaparecer depois
//    do redirect de volta do Google/GitHub, e nem numa aba nova.
// 2) Flag local (visitante) — sem conta de verdade, só teatro, do jeito
//    que sempre foi.
// O Header (botão Sair) continua escutando as mesmas chaves.
export const ENTERED_KEY = 'kaua-portal-entered';
export const NAME_KEY = 'kaua-adventurer';
export const AUTH_EVENT = 'kaua-auth-changed';
// Disparado no instante em que o portal começa a se despedir. Hero e
// Header escutam e retocam suas entradas — sem isso, as animações deles
// tocam no carregamento da página, escondidas atrás do portal, e o site
// aparece já parado quando o véu levanta.
export const SITE_ENTER_EVENT = 'kaua-site-enter';

function persistLocal(email?: string) {
  try {
    localStorage.setItem(ENTERED_KEY, '1');
    if (email) localStorage.setItem(NAME_KEY, email.split('@')[0]);
  } catch {
    // navegação privada sem storage — segue o jogo
  }
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export default function LoginGate() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Cria o portal somente depois da primeira montagem, mantendo a primeira
  // árvore do navegador idêntica ao HTML entregue pelo servidor.
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (window.parent !== window) window.parent.postMessage({
      type: 'ARTX_SYSTEM_STATUS', system: 'site', state: 'ready',
      title: 'Site publicado', detail: 'Página pública carregada e pronta para visitantes.',
    }, 'https://artx-hub.vercel.app');
  }, []);

  // Só abre pra quem ainda não entrou (e nunca no servidor → SEO intacto)
  useEffect(() => {
    let alive = true;
    const supabase = createClient();

    (async () => {
      // Sessão real primeiro: cobre o caso de voltar do OAuth (Google/
      // GitHub) e o de já ter conta numa visita anterior, mesmo sem a
      // flag local (ex.: outro navegador com o mesmo login).
      if (supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            persistLocal(data.session.user.email ?? undefined);
            if (alive) setOpen(false);
            return;
          }
        } catch { /* Public browsing remains available during an auth outage. */ }
      }
      try {
        const entered =
          localStorage.getItem(ENTERED_KEY) ?? sessionStorage.getItem(ENTERED_KEY);
        if (alive) setOpen(!entered);
      } catch {
        if (alive) setOpen(true);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // Trava o scroll do site enquanto o portal está aberto
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const finish = (email?: string) => {
    persistLocal(email);
    setOpen(false);
    // Avisa o site que a pessoa está entrando AGORA — a cascata do Hero
    // toca junto com a despedida do portal, uma coisa emendando na outra.
    window.dispatchEvent(new Event(SITE_ENTER_EVENT));
  };

  // Esc = pular o portal (acessibilidade)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
     
  }, [open]);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    // O wrapper (fora do AnimatePresence) trava o pointer-events em "auto"/
    // "none" na hora, seguindo `open` diretamente — não espera a animação
    // de saída terminar. Sem isso, se a animação de saída nunca completar
    // (aba em segundo plano, navegador lento), um overlay invisível ficaria
    // bloqueando cliques no site inteiro por trás dele.
    <div style={{ pointerEvents: open ? 'auto' : 'none' }}>
      <AnimatePresence>
        {open && (
          <motion.div
            key="gate"
            role="dialog"
            aria-modal="true"
            aria-label="Portal de entrada do site"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            // Despedida em duas fases: o conteúdo do cadastro se recolhe
            // rápido (motion.div interno) e este véu escuro se dissolve
            // devagar por cima do site, que entra em cena por baixo.
            exit={{
              opacity: 0,
              scale: 1.015,
              transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
            }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] overflow-y-auto bg-background"
          >
            <motion.div
              exit={{
                opacity: 0,
                y: 14,
                transition: { duration: 0.4, ease: 'easeOut' },
              }}
            >
              <AuthComponent
                logo={null}
                brandName={<>Kauã <span className="text-gradient">Artx</span></>}
                backgroundImageUrl="/images/login-leaves-bg.webp"
                visitorOnly
                onComplete={(email) => finish(email)}
                onGuest={() => finish()}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
}
