'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, Youtube } from 'lucide-react';
import { cn } from '@/lib/utils';

const LOCALES = [
  { code: 'pt', label: 'PT', flag: '🇧🇷' },
  { code: 'en', label: 'EN', flag: '🇺🇸' },
];

const YOUTUBE_URL = 'https://www.youtube.com/@KauartX';

interface HeaderProps {
  locale: string;
}

export default function Header({ locale }: HeaderProps) {
  const t = useTranslations('nav');
  // usePathname from @/i18n/navigation returns path WITHOUT locale prefix
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '/about', label: t('about') },
    { href: '/blog', label: t('blog') },
    { href: '/contact', label: t('contact') },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const switchLocale = (newLocale: string) => {
    if (newLocale === locale) {
      setIsLangOpen(false);
      return;
    }
    router.replace(pathname, { locale: newLocale });
    setIsLangOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 lg:px-8">
      {/* Barra flutuante — vira uma pill de vidro ao rolar */}
      <div
        className={cn(
          'mx-auto max-w-7xl transition-all duration-300',
          isScrolled
            ? 'mt-3 rounded-2xl glass-strong shadow-lg shadow-black/5 px-3 sm:px-5'
            : 'mt-0 px-1 sm:px-0 border border-transparent'
        )}
      >
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-foreground">
              Kauã<span className="text-gradient">.</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative px-4 py-2 text-sm font-medium transition-colors rounded-full',
                  isActive(link.href)
                    ? 'text-foreground'
                    : 'text-foreground-muted hover:text-foreground'
                )}
              >
                {isActive(link.href) && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-full bg-surface-elevated border border-border"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            ))}
            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full text-foreground-muted hover:text-accent-2-deep transition-colors"
            >
              <Youtube size={15} />
              {t('youtube')}
            </a>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-foreground-muted hover:text-foreground hover:bg-surface-elevated transition-all text-sm font-medium"
                aria-label="Trocar idioma"
              >
                <Globe size={14} />
                <span>{LOCALES.find((l) => l.code === locale)?.label}</span>
              </button>

              <AnimatePresence>
                {isLangOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-2 glass-strong rounded-xl overflow-hidden min-w-[100px] shadow-lg"
                  >
                    {LOCALES.map((l) => (
                      <button
                        type="button"
                        key={l.code}
                        onClick={() => switchLocale(l.code)}
                        className={cn(
                          'flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors',
                          locale === l.code
                            ? 'text-accent-deep bg-surface-elevated cursor-default'
                            : 'text-foreground-muted hover:text-foreground hover:bg-surface-elevated'
                        )}
                      >
                        <span>{l.flag}</span>
                        <span className="font-medium">{l.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 rounded-full text-foreground-muted hover:text-foreground transition-colors"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label="Abrir menu"
            >
              {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'md:hidden overflow-hidden border-t border-border',
                !isScrolled && 'glass rounded-b-2xl'
              )}
            >
              <nav className="px-2 py-4 flex flex-col gap-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        'block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                        isActive(link.href)
                          ? 'text-accent-deep bg-surface-elevated'
                          : 'text-foreground-muted hover:text-foreground hover:bg-surface-elevated'
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <a
                  href={YOUTUBE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-foreground-muted hover:text-accent-2-deep transition-colors"
                >
                  <Youtube size={15} />
                  {t('youtube')}
                </a>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isLangOpen && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setIsLangOpen(false)}
        />
      )}
    </header>
  );
}
