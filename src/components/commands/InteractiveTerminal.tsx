'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
}

const COMMANDS: Record<string, (args: string[]) => string | string[]> = {
  help: () => [
    'Comandos disponíveis:',
    '  about       → Informações sobre o Kauã',
    '  projects    → Lista de projetos',
    '  contact     → Como entrar em contato',
    '  matrix      → ??? (tente e veja)',
    '  clear       → Limpar o terminal',
    '  exit        → Fechar o terminal',
    '  whoami      → Quem sou eu',
    '',
    'Dica: use ↑↓ para navegar no histórico',
  ],
  whoami: () => 'kauã souza | full-stack developer & founder | uberlândia, brasil',
  about: () => [
    'Nome: Kauã Souza',
    'Idade: 18 anos',
    'Localização: Uberlândia, MG, Brasil',
    'Papel: Full-Stack Developer & Founder',
    'Empresa atual: Loog.ai',
    'Projetos: The Kaden, CONDOR, Null Forge',
    'Objetivo: Estudar em Harvard, MIT ou Oxford',
    'Email: kauadsouza@gmail.com',
  ],
  projects: () => [
    'Projetos em destaque:',
    '',
    '→ The Kaden      [Em Produção]',
    '   SaaS de automação WhatsApp para clínicas e salões',
    '   https://thekaden.com.br',
    '',
    '→ CONDOR         [Em Desenvolvimento]',
    '   Assistente IA local via Ollama (privacidade first)',
    '   Stack: Electron + JSX + Ollama',
    '',
    '→ Null Forge     [Estruturando]',
    '   Educação tech com impacto social no Brasil',
  ],
  contact: () => [
    'Como entrar em contato:',
    '',
    '→ Email:     kauadsouza@gmail.com',
    '→ Instagram: @kauaartx',
    '→ LinkedIn:  linkedin.com/in/kauadsouza',
    '→ GitHub:    github.com/Kauadsouza',
    '→ YouTube:   @KauartX',
  ],
  clear: () => '__CLEAR__',
  exit: () => '__EXIT__',
};

interface InteractiveTerminalProps {
  onClose: () => void;
  onMatrix?: () => void;
}

export default function InteractiveTerminal({ onClose, onMatrix }: InteractiveTerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'system', content: 'Terminal interativo — Kauã Souza' },
    { type: 'system', content: 'Digite "help" para ver os comandos disponíveis.' },
    { type: 'system', content: '' },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const runCommand = useCallback(
    (cmd: string) => {
      const trimmed = cmd.trim();
      if (!trimmed) return;

      const newLines: TerminalLine[] = [{ type: 'input', content: `$ ${trimmed}` }];
      const [name, ...args] = trimmed.toLowerCase().split(' ');

      if (name === 'matrix') {
        newLines.push({ type: 'output', content: 'Iniciando sequência matrix...' });
        setLines((prev) => [...prev, ...newLines]);
        onMatrix?.();
        return;
      }

      const fn = COMMANDS[name];

      if (!fn) {
        newLines.push({
          type: 'error',
          content: `Comando não encontrado: "${name}". Digite "help" para ver os disponíveis.`,
        });
      } else {
        const result = fn(args);
        if (result === '__CLEAR__') {
          setLines([{ type: 'system', content: '' }]);
          setHistory((h) => [trimmed, ...h]);
          setHistoryIdx(-1);
          setInput('');
          return;
        }
        if (result === '__EXIT__') {
          onClose();
          return;
        }
        const outputs = Array.isArray(result) ? result : [result];
        outputs.forEach((line) => newLines.push({ type: 'output', content: line }));
      }

      newLines.push({ type: 'output', content: '' });
      setLines((prev) => [...prev, ...newLines]);
      setHistory((h) => [trimmed, ...h]);
      setHistoryIdx(-1);
      setInput('');
    },
    [onClose, onMatrix]
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      runCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const nextIdx = Math.min(historyIdx + 1, history.length - 1);
      setHistoryIdx(nextIdx);
      setInput(history[nextIdx] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = Math.max(historyIdx - 1, -1);
      setHistoryIdx(nextIdx);
      setInput(nextIdx === -1 ? '' : history[nextIdx] ?? '');
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const lineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'input': return 'text-accent-glow';
      case 'error': return 'text-red-400';
      case 'system': return 'text-foreground-subtle';
      default: return 'text-foreground-muted';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[900] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.96, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 20 }}
        className="w-full max-w-3xl bg-surface border border-border rounded-lg overflow-hidden shadow-2xl"
        style={{ maxHeight: '80vh' }}
      >
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-surface-elevated border-b border-border">
          <button
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors"
          />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-3 text-xs text-foreground-subtle font-mono">
            kaua@portfolio — bash
          </span>
          <button
            onClick={onClose}
            className="ml-auto text-foreground-subtle hover:text-foreground transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Terminal output */}
        <div
          className="p-4 font-mono text-sm overflow-y-auto"
          style={{ height: 'calc(80vh - 120px)' }}
          onClick={() => inputRef.current?.focus()}
        >
          {lines.map((line, i) => (
            <div key={i} className={`leading-relaxed whitespace-pre ${lineColor(line.type)}`}>
              {line.content || <>&nbsp;</>}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-border bg-surface-elevated">
          <span className="text-accent-glow font-mono text-sm shrink-0">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            className="flex-1 bg-transparent font-mono text-sm text-foreground outline-none"
            autoComplete="off"
            spellCheck={false}
          />
          <span
            className="w-2 h-4 bg-accent-glow"
            style={{ animation: 'cursor-blink 1s step-end infinite' }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
