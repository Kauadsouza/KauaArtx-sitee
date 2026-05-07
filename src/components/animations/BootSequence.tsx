'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BOOT_LINES = [
  { text: '[  OK  ] Initializing kernel...', delay: 100 },
  { text: '[  OK  ] Loading system modules...', delay: 300 },
  { text: '[  OK  ] Mounting filesystem...', delay: 500 },
  { text: '[  OK  ] Starting network services...', delay: 700 },
  { text: '[  OK  ] Loading developer profile...', delay: 900 },
  { text: '[  OK  ] Mounting portfolio.dev...', delay: 1100 },
  { text: '', delay: 1300 },
  { text: 'Welcome. | Bem-vindo. | Bienvenido.', delay: 1400, highlight: true },
];

const BOOT_STORAGE_KEY = 'kaua_boot_done';

export default function BootSequence() {
  const [visible, setVisible] = useState(false);
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [exiting, setExiting] = useState(false);

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem(BOOT_STORAGE_KEY, '1');
    }, 600);
  }, []);

  useEffect(() => {
    // Show boot only once per session
    if (sessionStorage.getItem(BOOT_STORAGE_KEY)) return;
    setVisible(true);

    const timers: ReturnType<typeof setTimeout>[] = [];

    BOOT_LINES.forEach((line, i) => {
      const t = setTimeout(() => {
        setVisibleLines((prev) => [...prev, i]);
      }, line.delay);
      timers.push(t);
    });

    // Auto-dismiss after all lines + brief pause
    const dismissTimer = setTimeout(() => {
      dismiss();
    }, 2200);
    timers.push(dismissTimer);

    return () => timers.forEach(clearTimeout);
  }, [dismiss]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] bg-background flex flex-col items-start justify-center p-8 sm:p-16"
        >
          {/* Terminal window */}
          <div className="w-full max-w-2xl font-mono text-sm space-y-1">
            <AnimatePresence mode="popLayout">
              {visibleLines.map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  className={
                    BOOT_LINES[i].highlight
                      ? 'text-accent-glow font-semibold mt-4 text-lg'
                      : 'text-accent-bright/80'
                  }
                >
                  {BOOT_LINES[i].text || <>&nbsp;</>}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Blinking cursor */}
            {visibleLines.length < BOOT_LINES.length && (
              <span
                className="inline-block w-2 h-4 bg-accent-glow"
                style={{ animation: 'cursor-blink 1s step-end infinite' }}
              />
            )}
          </div>

          {/* Skip button */}
          <button
            onClick={dismiss}
            className="fixed bottom-6 right-6 text-xs text-foreground-subtle hover:text-foreground-muted transition-colors font-mono"
          >
            [skip]
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
