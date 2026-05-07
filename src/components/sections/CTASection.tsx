'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  const t = useTranslations('cta_section');

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-2xl border border-border bg-surface overflow-hidden p-12 sm:p-16 text-center"
        >
          {/* Radial glow */}
          <div className="absolute inset-0 gradient-radial-green pointer-events-none" />

          <h2 className="relative text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight">
            {t('title')}
          </h2>
          <p className="relative text-foreground-muted mb-10 text-lg max-w-lg mx-auto">
            {t('subtitle')}
          </p>
          <Link
            href="/contact"
            className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-accent hover:bg-accent-bright text-foreground font-semibold text-base transition-all duration-200 hover:shadow-xl hover:shadow-accent/20"
          >
            {t('button')}
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
