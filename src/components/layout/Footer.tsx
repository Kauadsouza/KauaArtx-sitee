'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Instagram, Linkedin, Twitter, Youtube, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const SOCIAL_LINKS = [
  { href: 'https://www.instagram.com/kauaartx/', icon: Instagram, label: 'Instagram' },
  { href: 'https://www.linkedin.com/in/kauadsouza/', icon: Linkedin, label: 'LinkedIn' },
  { href: 'https://x.com/KauaArtx', icon: Twitter, label: 'Twitter / X' },
  { href: 'https://www.youtube.com/@KauartX', icon: Youtube, label: 'YouTube' },
  { href: 'mailto:kauaartx@gmail.com', icon: Mail, label: 'Email' },
];

const NAV_LINKS = [
  { href: '/about', key: 'about' },
  { href: '/blog', key: 'blog' },
  { href: '/contact', key: 'contact' },
] as const;

export default function Footer() {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');

  return (
    <footer className="relative z-10 border-t border-border mt-32 bg-surface/80 backdrop-blur-sm">
      {/* Hairline gradiente no topo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px hairline-gradient" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="group inline-block">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                Kauã <span className="text-gradient">Artx</span>
              </span>
            </Link>
            <p className="text-sm text-foreground-muted leading-relaxed max-w-xs">
              {t('tagline')}
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3 pt-2">
              {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
                <motion.a
                  key={href}
                  href={href}
                  target={href.startsWith('mailto') ? undefined : '_blank'}
                  rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                  aria-label={label}
                  whileHover={{ y: -2 }}
                  className="p-2 rounded-full text-foreground-subtle hover:text-accent-deep hover:bg-surface-elevated transition-all"
                >
                  <Icon size={16} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-semibold text-foreground-subtle uppercase tracking-widest mb-4">
              {t('nav_title')}
            </h3>
            <ul className="space-y-2">
              {NAV_LINKS.map(({ href, key }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-foreground-muted hover:text-foreground transition-colors"
                  >
                    {nav(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xs font-semibold text-foreground-subtle uppercase tracking-widest mb-4">
              {t('links_title')}
            </h3>
            <ul className="space-y-2">
              {[
                { href: 'https://www.youtube.com/@KauartX', label: 'YouTube — @KauartX' },
                { href: 'https://www.linkedin.com/in/kauadsouza/', label: 'LinkedIn — kauadsouza' },
                { href: 'https://x.com/KauaArtx', label: 'Twitter / X — @KauaArtx' },
                { href: 'https://www.instagram.com/kauaartx/', label: 'Instagram — @kauaartx' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-foreground-muted hover:text-accent-deep transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-foreground-subtle">
            © {new Date().getFullYear()} Kauã Souza. {t('rights')}
          </p>
          <p className="text-xs text-foreground-subtle">
            {t('built_with')}
          </p>
        </div>
      </div>
    </footer>
  );
}
