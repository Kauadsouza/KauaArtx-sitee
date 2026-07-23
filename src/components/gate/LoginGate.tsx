'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Mountain } from 'lucide-react';
import { AuthComponent } from '@/components/ui/sign-up';

// Portal de entrada do site — agora com o cadastro de vidro (sign-up.tsx),
// no lugar do antigo portal-jogo do mago. Continua TEATRAL: qualquer
// email/senha entra, nada é enviado a servidor nenhum. A mecânica é a
// mesma de sempre: abre só na primeira visita, a escolha fica salva e o
// Header (botão Sair) escuta as mesmas chaves.
export const ENTERED_KEY = 'kaua-portal-entered';
export const NAME_KEY = 'kaua-adventurer';
export const AUTH_EVENT = 'kaua-auth-changed';

export default function LoginGate() {
  const [open, setOpen] = useState(false);

  // Só abre pra quem ainda não entrou (e nunca no servidor → SEO intacto)
  useEffect(() => {
    try {
      const entered =
        localStorage.getItem(ENTERED_KEY) ?? sessionStorage.getItem(ENTERED_KEY);
      if (!entered) setOpen(true);
    } catch {
      setOpen(true);
    }
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
    try {
      localStorage.setItem(ENTERED_KEY, '1');
      // Com email = "conta" (Sair aparece no Header); visitante entra sem nome
      if (email) localStorage.setItem(NAME_KEY, email.split('@')[0]);
    } catch {
      // navegação privada sem storage — segue o jogo
    }
    window.dispatchEvent(new Event(AUTH_EVENT));
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
            brandName="Kauã Artx"
            logo={
              <span className="inline-flex rounded-md bg-[#DAF1DE] p-1.5 text-[#051F20]">
                <Mountain className="h-4 w-4" />
              </span>
            }
            onComplete={(email) => finish(email)}
            onGuest={() => finish()}
          />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
