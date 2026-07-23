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

  // Só abre pra quem ainda não entrou (e nunca no servidor → SEO intacto)
  useEffect(() => {
    let alive = true;
    const supabase = createClient();

    (async () => {
      // Sessão real primeiro: cobre o caso de voltar do OAuth (Google/
      // GitHub) e o de já ter conta numa visita anterior, mesmo sem a
      // flag local (ex.: outro navegador com o mesmo login).
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          persistLocal(data.session.user.email ?? undefined);
          if (alive) setOpen(false);
          return;
        }
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

  if (typeof document === 'undefined') return null;

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
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] overflow-y-auto bg-background"
          >
            <AuthComponent
              logo={null}
              brandName={<>Kauã <span className="text-gradient">Artx</span></>}
              backgroundImageUrl="/images/login-leaves-bg.webp"
              onComplete={(email) => finish(email)}
              onGuest={() => finish()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
}
