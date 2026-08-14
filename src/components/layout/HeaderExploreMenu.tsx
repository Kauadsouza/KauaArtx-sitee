'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

interface ExploreProps {
  locale: string;
}

interface MobileExploreProps extends ExploreProps {
  onNavigate: () => void;
}

function useExplore(locale: string) {
  const pathname = usePathname();
  const label = locale === 'pt' ? 'Explorar' : 'Explore';
  const links = [
    {
      href: '/viagens/oxford',
      label: 'Oxford',
      helper: locale === 'pt' ? 'Viagem completa' : 'Complete trip',
    },
    {
      href: '/ferramentas',
      label: locale === 'pt' ? 'Ferramentas' : 'Tools',
      helper: locale === 'pt' ? 'Organize a viagem' : 'Organize your trip',
    },
    {
      href: '/glossario',
      label: locale === 'pt' ? 'Glossário' : 'Glossary',
      helper: locale === 'pt' ? 'Termos sem complicação' : 'Terms made simple',
    },
    {
      href: '/agora',
      label: locale === 'pt' ? 'Agora' : 'Now',
      helper: locale === 'pt' ? 'Onde estou agora' : 'Where I am now',
    },
  ];
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return { pathname, label, links, isActive };
}

export function HeaderExploreMenu({ locale }: ExploreProps) {
  const { pathname, label, links, isActive } = useExplore(locale);
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isExploreActive = links.some((link) => isActive(link.href));

  useEffect(() => setIsOpen(false), [pathname]);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !isOpen) return;
      setIsOpen(false);
      buttonRef.current?.focus();
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  const focusItem = (position: 'first' | 'last') => {
    requestAnimationFrame(() => {
      const items = rootRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]');
      if (!items?.length) return;
      items[position === 'first' ? 0 : items.length - 1].focus();
    });
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={(event) => {
          if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
          event.preventDefault();
          setIsOpen(true);
          focusItem(event.key === 'ArrowDown' ? 'first' : 'last');
        }}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="desktop-explore-menu"
        className={cn(
          'relative flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors',
          isExploreActive || isOpen
            ? 'text-foreground'
            : 'text-foreground-muted hover:text-foreground'
        )}
      >
        {isExploreActive && (
          <motion.span
            layoutId="nav-indicator"
            className="absolute inset-0 rounded-full border border-border bg-surface-elevated"
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
        )}
        <span className="relative z-10">{label}</span>
        <ChevronDown
          size={14}
          aria-hidden="true"
          className={cn('relative z-10 transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="desktop-explore-menu"
            role="menu"
            aria-label={label}
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            onKeyDown={(event) => {
              const items = Array.from(
                event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]')
              );
              const current = items.indexOf(document.activeElement as HTMLElement);
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                items[(current + 1 + items.length) % items.length]?.focus();
              } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                items[(current - 1 + items.length) % items.length]?.focus();
              } else if (event.key === 'Home') {
                event.preventDefault();
                items[0]?.focus();
              } else if (event.key === 'End') {
                event.preventDefault();
                items[items.length - 1]?.focus();
              }
            }}
            className="absolute left-1/2 top-full z-50 mt-3 w-64 -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-background/95 p-2 shadow-2xl shadow-black/35 backdrop-blur-xl"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                role="menuitem"
                aria-current={isActive(link.href) ? 'page' : undefined}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'group flex items-center justify-between gap-4 rounded-xl px-3 py-2.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  isActive(link.href)
                    ? 'bg-surface-elevated text-foreground'
                    : 'text-foreground-muted hover:bg-surface-elevated hover:text-foreground'
                )}
              >
                <span>
                  <span className="block text-sm font-semibold">{link.label}</span>
                  <span className="block text-xs text-foreground-muted">{link.helper}</span>
                </span>
                <span
                  aria-hidden="true"
                  className="text-accent transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MobileExploreLinks({ locale, onNavigate }: MobileExploreProps) {
  const { label, links, isActive } = useExplore(locale);

  return (
    <>
      <div className="mx-2 my-2 border-t border-border/80" />
      <span className="px-4 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
        {label}
      </span>
      {links.map((link, index) => (
        <motion.div
          key={link.href}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: (4 + index) * 0.04 }}
        >
          <Link
            href={link.href}
            onClick={onNavigate}
            aria-current={isActive(link.href) ? 'page' : undefined}
            className={cn(
              'flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
              isActive(link.href)
                ? 'bg-surface-elevated text-accent-deep'
                : 'text-foreground-muted hover:bg-surface-elevated hover:text-foreground'
            )}
          >
            <span>{link.label}</span>
            <span aria-hidden="true" className="text-accent">→</span>
          </Link>
        </motion.div>
      ))}
      <div className="mx-2 my-2 border-t border-border/80" />
    </>
  );
}
