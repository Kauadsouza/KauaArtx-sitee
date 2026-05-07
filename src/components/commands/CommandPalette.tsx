'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from '@/i18n/navigation';
import {
  Search,
  Home,
  User,
  FolderOpen,
  Clock,
  BookOpen,
  HelpCircle,
  Mail,
  Github,
  Instagram,
  Linkedin,
  Youtube,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  action: () => void;
  shortcut?: string;
  group: 'navigation' | 'social' | 'actions';
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const navigate = useCallback(
    (path: string) => {
      router.push(path);
      setOpen(false);
    },
    [router]
  );

  const commands: Command[] = [
    { id: 'home', label: 'Home', description: 'Página inicial', icon: Home, action: () => navigate('/'), shortcut: 'G H', group: 'navigation' },
    { id: 'about', label: 'Sobre', description: 'Sobre o Kauã', icon: User, action: () => navigate('/about'), shortcut: 'G A', group: 'navigation' },
    { id: 'projects', label: 'Projetos', description: 'The Kaden, CONDOR, Null Forge', icon: FolderOpen, action: () => navigate('/projects'), shortcut: 'G P', group: 'navigation' },
    { id: 'now', label: 'Now', description: 'O que estou fazendo agora', icon: Clock, action: () => navigate('/now'), shortcut: 'G N', group: 'navigation' },
    { id: 'blog', label: 'Blog', description: 'Artigos e reflexões', icon: BookOpen, action: () => navigate('/blog'), group: 'navigation' },
    { id: 'faq', label: 'FAQ', description: 'Perguntas frequentes', icon: HelpCircle, action: () => navigate('/faq'), group: 'navigation' },
    { id: 'contact', label: 'Contato', description: 'Entrar em contato', icon: Mail, action: () => navigate('/contact'), shortcut: 'G C', group: 'navigation' },
    { id: 'github', label: 'GitHub', description: 'github.com/Kauadsouza', icon: Github, action: () => { window.open('https://github.com/Kauadsouza', '_blank'); setOpen(false); }, group: 'social' },
    { id: 'instagram', label: 'Instagram', description: '@kauaartx', icon: Instagram, action: () => { window.open('https://www.instagram.com/kauaartx/', '_blank'); setOpen(false); }, group: 'social' },
    { id: 'linkedin', label: 'LinkedIn', description: 'linkedin.com/in/kauadsouza', icon: Linkedin, action: () => { window.open('https://www.linkedin.com/in/kauadsouza', '_blank'); setOpen(false); }, group: 'social' },
    { id: 'youtube', label: 'YouTube', description: '@KauartX', icon: Youtube, action: () => { window.open('https://www.youtube.com/@KauartX', '_blank'); setOpen(false); }, group: 'social' },
    { id: 'email', label: 'Email', description: 'kauadsouza@gmail.com', icon: Mail, action: () => { window.location.href = 'mailto:kauadsouza@gmail.com'; setOpen(false); }, group: 'social' },
  ];

  const filtered = query
    ? commands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.description?.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  const groups = [
    { key: 'navigation', label: 'Navegação' },
    { key: 'social', label: 'Redes Sociais' },
    { key: 'actions', label: 'Ações' },
  ] as const;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
        setQuery('');
        setSelected(0);
      }
      if (!open) return;
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, filtered.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        filtered[selected]?.action();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, filtered, selected]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 z-[1001] w-full max-w-xl"
          >
            <div className="glass-strong rounded-xl overflow-hidden shadow-2xl border border-border-strong">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Search size={16} className="text-foreground-subtle shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar páginas, projetos..."
                  className="flex-1 bg-transparent text-foreground placeholder:text-foreground-subtle text-sm outline-none"
                />
                <kbd className="text-xs text-foreground-subtle font-mono px-1.5 py-0.5 rounded border border-border">
                  esc
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto py-2">
                {filtered.length === 0 ? (
                  <p className="text-center text-foreground-subtle text-sm py-8">
                    Nenhum resultado encontrado.
                  </p>
                ) : (
                  groups.map(({ key, label }) => {
                    const groupCommands = filtered.filter((c) => c.group === key);
                    if (groupCommands.length === 0) return null;

                    return (
                      <div key={key}>
                        <p className="px-4 py-1.5 text-xs font-semibold text-foreground-subtle uppercase tracking-widest">
                          {label}
                        </p>
                        {groupCommands.map((cmd) => {
                          const idx = filtered.indexOf(cmd);
                          const Icon = cmd.icon;
                          return (
                            <button
                              key={cmd.id}
                              onClick={cmd.action}
                              onMouseEnter={() => setSelected(idx)}
                              className={cn(
                                'flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors',
                                idx === selected
                                  ? 'bg-surface-elevated text-foreground'
                                  : 'text-foreground-muted hover:bg-surface-elevated hover:text-foreground'
                              )}
                            >
                              <Icon size={15} className={idx === selected ? 'text-accent-bright' : 'text-foreground-subtle'} />
                              <span className="flex-1 text-sm">{cmd.label}</span>
                              {cmd.description && (
                                <span className="text-xs text-foreground-subtle">
                                  {cmd.description}
                                </span>
                              )}
                              {cmd.shortcut && idx === selected && (
                                <span className="text-xs font-mono text-foreground-subtle">
                                  {cmd.shortcut}
                                </span>
                              )}
                              {idx === selected && <ArrowRight size={12} className="text-accent-bright" />}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer hint */}
              <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-xs text-foreground-subtle font-mono">
                <span>↑↓ navegar</span>
                <span>↵ abrir</span>
                <span>esc fechar</span>
                <span className="ml-auto">⌘K</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
