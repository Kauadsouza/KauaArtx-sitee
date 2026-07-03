'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Github, Instagram, Linkedin, Youtube, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const SOCIAL_LINKS = [
  { href: 'https://github.com/Kauadsouza', icon: Github, label: 'GitHub' },
  { href: 'https://www.instagram.com/kauaartx/', icon: Instagram, label: 'Instagram' },
  { href: 'https://www.linkedin.com/in/kauadsouza', icon: Linkedin, label: 'LinkedIn' },
  { href: 'https://www.youtube.com/@KauartX', icon: Youtube, label: 'YouTube' },
  { href: 'mailto:kauadsouza@gmail.com', icon: Mail, label: 'Email' },
];

const NAV_LINKS = [
  { href: '/about', key: 'about' },
  { href: '/projects', key: 'projects' },
  { href: '/now', key: 'now' },
  { href: '/blog', key: 'blog' },
  { href: '/faq', key: 'faq' },
  { href: '/contact', key: 'contact' },
];

export default function Footer() {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');

  return (
    <footer className="border-t border-border mt-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="group inline-block">
              <span className="font-mono text-3xl font-bold text-gradient">
                K.
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
                  className="p-2 rounded-md text-foreground-subtle hover:text-accent-bright hover:bg-surface-elevated transition-all"
                >
                  <Icon size={16} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-semibold text-foreground-subtle uppercase tracking-widest mb-4">
              Navegação
            </h3>
            <ul className="space-y-2">
              {NAV_LINKS.map(({ href, key }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-foreground-muted hover:text-foreground transition-colors"
                  >
                    {nav(key as 'about' | 'projects' | 'now' | 'blog' | 'faq' | 'contact')}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Projects */}
          <div>
            <h3 className="text-xs font-semibold text-foreground-subtle uppercase tracking-widest mb-4">
              Projetos
            </h3>
            <ul className="space-y-2">
              {[
                { href: '/projects/the-kaden', label: 'The Kaden' },
                { href: '/projects/condor', label: 'CONDOR' },
                { href: '/projects/null-forge', label: 'Null Forge' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-foreground-muted hover:text-accent-bright transition-colors"
                  >
                    {label}
                  </Link>
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
