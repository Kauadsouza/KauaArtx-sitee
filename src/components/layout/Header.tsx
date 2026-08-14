'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, Youtube, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ENTERED_KEY, NAME_KEY, AUTH_EVENT, SITE_ENTER_EVENT } from '@/components/gate/LoginGate';
import { createClient } from '@/lib/supabase/client';
import { HeaderExploreMenu, MobileExploreLinks } from './HeaderExploreMenu';

const LOCALES = [
  { code: 'pt', label: 'PT', flag: '🇧🇷' },
  { code: 'en', label: 'EN', flag: '🇺🇸' },
];

const YOUTUBE_URL = 'https://www.youtube.com/@KauaArtx';

function friendlyName(raw: string): string {
  const first = raw.split(/[._-]/)[0].replace(/\d+$/, '') || raw;
  const trimmed = first.slice(0, 16);
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

interface HeaderProps {
  locale: string;
}

export default function Header({ locale }: HeaderProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [hasAccount, setHasAccount] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [entrance, setEntrance] = useState(0);

  useEffect(() => {
    const replay = () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      setEntrance((n) => n + 1);
    };
    window.addEventListener(SITE_ENTER_EVENT, replay);
    return () => window.removeEventListener(SITE_ENTER_EVENT, replay);
  }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const check = () => {
      try {
        const entered =
          localStorage.getItem(ENTERED_KEY) ?? sessionStorage.getItem(ENTERED_KEY);
        const saved = localStorage.getItem(NAME_KEY);
        setHasAccount(!!entered && !!saved);
        setGuestName(saved ? friendlyName(saved) : '');
      } catch {
        setHasAccount(false);
        setGuestName('');
      }
    };
    check();
    window.addEventListener(AUTH_EVENT, check);
    window.addEventListener('storage', check);
    return () => {
      window.removeEventListener(AUTH_EVENT, check);
      window.removeEventListener('storage', check);
    };
  }, []);

  const logout = async () => {
    try {
      localStorage.removeItem(ENTERED_KEY);
      sessionStorage.removeItem(ENTERED_KEY);
      localStorage.removeItem(NAME_KEY);
    } catch {}
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    window.location.href = locale === 'pt' ? '/' : `/${locale}`;
  };

  const navLinks = [
    { href: '/about', label: t('about') },
    { href: '/blog', label: t('blog') },
    { href: '/mapa', label: t('map') },
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
    <motion.header
      key={entrance}
      initial={entrance > 0 ? { y: -18, opacity: 0 } : false}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 lg:px-8"
    >
      {/* Barra flutuante — vira uma pill de vidro ao rolar */}
      <div
        className={cn(
          'mx-auto max-w-7xl transition-all duration-300',
          isScrolled
            ? 'mt-3 rounded-2xl glass-strong shadow-lg shadow-black/30 px-3 sm:px-5'
            : 'mt-0 px-1 sm:px-0 border border-transparent'
        )}
      >
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-foreground">
              Kauã <span className="text-gradient">Artx</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
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
            <HeaderExploreMenu locale={locale} />
            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full text-foreground-muted hover:text-accent-bright transition-colors"
            >
              <Youtube size={15} />
              {t('youtube')}
            </a>
            {/* Sair fica SEMPRE visível — leva de volta pra tela de login */}
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full text-foreground-muted hover:text-red-400 transition-colors"
            >
              <LogOut size={15} />
              {t('logout')}
            </button>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Saudação discreta pra quem tem conta — o site reconhece a pessoa */}
            {hasAccount && guestName && (
              <span className="hidden lg:inline-block max-w-[170px] truncate text-sm text-foreground-muted pr-1">
                {t('greeting', { name: guestName })}
              </span>
            )}
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
              className="lg:hidden p-2 rounded-full text-foreground-muted hover:text-foreground transition-colors"
              onClick={() => {
                setIsMobileOpen(!isMobileOpen);
                setIsLangOpen(false);
              }}
              aria-label={locale === 'pt' ? 'Abrir menu' : 'Open menu'}
              aria-expanded={isMobileOpen}
              aria-controls="mobile-navigation"
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
                'lg:hidden overflow-hidden border-t border-border',
                !isScrolled && 'glass rounded-b-2xl'
              )}
            >
              <nav id="mobile-navigation" className="px-2 py-4 flex flex-col gap-1">
                {hasAccount && guestName && (
                  <span className="px-4 pb-2 text-sm text-foreground-muted">
                    {t('greeting', { name: guestName })}
                  </span>
                )}
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
                <MobileExploreLinks
                  locale={locale}
                  onNavigate={() => setIsMobileOpen(false)}
                />
                <a
                  href={YOUTUBE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-foreground-muted hover:text-accent-bright transition-colors"
                >
                  <Youtube size={15} />
                  {t('youtube')}
                </a>
                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-foreground-muted hover:text-red-400 transition-colors text-left"
                >
                  <LogOut size={15} />
                  {t('logout')}
                </button>
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
    </motion.header>
  );
}
