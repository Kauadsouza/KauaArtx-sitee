'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InteractiveTerminal from '@/components/commands/InteractiveTerminal';

interface TerminalLine {
  prompt?: string;
  output?: string;
  highlight?: boolean;
}

const SEQUENCES: TerminalLine[][] = [
  [
    { prompt: 'whoami' },
    { output: 'kauã souza | full-stack developer & founder', highlight: true },
    { prompt: 'cat goals.txt' },
    { output: 'scaling brazilian tech globally' },
    { prompt: 'ls projects/' },
    { output: 'the-kaden  condor  null-forge  loog-ai' },
  ],
  [
    { prompt: 'git log --oneline -3' },
    { output: 'a1b2c3d feat: launched The Kaden v2.0', highlight: true },
    { output: '9f8e7d6 fix: condor privacy mode' },
    { output: '3c4b5a6 init: null-forge educational platform' },
    { prompt: 'node --version' },
    { output: 'v22.0.0' },
  ],
  [
    { prompt: 'cat stack.json | jq .frontend' },
    { output: '["Next.js", "React", "TypeScript", "Tailwind"]', highlight: true },
    { prompt: 'cat stack.json | jq .backend' },
    { output: '["Node.js", "Supabase", "PostgreSQL", "Redis"]' },
    { prompt: 'echo $GOAL' },
    { output: 'harvard | mit | oxford | global' },
  ],
];

const TYPING_SPEED = 45;
const LINE_DELAY = 500;
const SEQUENCE_DELAY = 4000;

export default function TerminalSection() {
  const [visibleLines, setVisibleLines] = useState<{ text: string; highlight: boolean; isPrompt: boolean }[]>([]);
  const [typing, setTyping] = useState('');
  const [showTerminal, setShowTerminal] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);
  const seqIdx = useRef(0);
  const isAnimating = useRef(false);

  const typeText = (text: string, onDone: () => void) => {
    let i = 0;
    setTyping('');
    const tick = () => {
      setTyping(text.slice(0, i + 1));
      i++;
      if (i < text.length) {
        setTimeout(tick, TYPING_SPEED);
      } else {
        setTimeout(onDone, LINE_DELAY);
      }
    };
    tick();
  };

  const runSequence = (lines: TerminalLine[], onDone: () => void) => {
    let idx = 0;
    const next = () => {
      if (idx >= lines.length) {
        onDone();
        return;
      }
      const line = lines[idx];
      idx++;

      if (line.prompt !== undefined) {
        typeText(line.prompt, () => {
          setVisibleLines((prev) => [...prev, { text: `$ ${line.prompt}`, highlight: false, isPrompt: true }]);
          setTyping('');
          next();
        });
      } else if (line.output !== undefined) {
        setTimeout(() => {
          setVisibleLines((prev) => [...prev, { text: `  ${line.output}`, highlight: !!line.highlight, isPrompt: false }]);
          next();
        }, 200);
      }
    };
    next();
  };

  useEffect(() => {
    const loop = () => {
      if (isAnimating.current) return;
      isAnimating.current = true;
      const seq = SEQUENCES[seqIdx.current % SEQUENCES.length];
      seqIdx.current++;
      setVisibleLines([]);
      runSequence(seq, () => {
        isAnimating.current = false;
        setTimeout(loop, SEQUENCE_DELAY);
      });
    };

    const timeout = setTimeout(loop, 800);
    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Terminal window */}
          <div className="relative max-w-2xl mx-auto">
            <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-xl">
              {/* Title bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-surface-elevated border-b border-border">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-3 text-xs text-foreground-subtle font-mono">
                  kaua@portfolio — bash
                </span>
                <button
                  onClick={() => setShowTerminal(true)}
                  className="ml-auto text-xs text-foreground-subtle hover:text-accent-bright transition-colors font-mono"
                >
                  [sudo]
                </button>
              </div>

              {/* Terminal body */}
              <div className="p-6 font-mono text-sm min-h-48">
                {visibleLines.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={
                      line.isPrompt
                        ? 'text-accent-glow'
                        : line.highlight
                        ? 'text-foreground'
                        : 'text-foreground-muted'
                    }
                  >
                    {line.text}
                  </motion.div>
                ))}

                {/* Currently typing */}
                {typing !== undefined && (
                  <div className="text-accent-glow">
                    $ {typing}
                    <span
                      className="inline-block w-2 h-4 bg-accent-glow ml-0.5 align-middle"
                      style={{ animation: 'cursor-blink 1s step-end infinite' }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Subtle hint for sudo */}
            <p className="text-center text-xs text-foreground-subtle mt-3 font-mono">
              Clique em [sudo] para abrir o terminal interativo
            </p>
          </div>
        </motion.div>
      </div>

      {/* Full interactive terminal */}
      <AnimatePresence>
        {showTerminal && (
          <InteractiveTerminal
            onClose={() => setShowTerminal(false)}
            onMatrix={() => {
              setShowMatrix(true);
              setTimeout(() => setShowMatrix(false), 5000);
            }}
          />
        )}
      </AnimatePresence>

      {/* Matrix easter egg */}
      <AnimatePresence>
        {showMatrix && <MatrixEffect onDone={() => setShowMatrix(false)} />}
      </AnimatePresence>
    </section>
  );
}

function MatrixEffect({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cols = Math.floor(canvas.width / 16);
    const drops = new Array(cols).fill(1);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()カウアソウザthekadenCONDOR';

    const draw = () => {
      ctx.fillStyle = 'rgba(5, 5, 5, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00FF88';
      ctx.font = '14px monospace';

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * 16, drops[i] * 16);
        if (drops[i] * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[800]"
      onClick={onDone}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
      <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-accent-glow font-mono text-sm">
        Clique para sair da matrix
      </p>
    </motion.div>
  );
}
