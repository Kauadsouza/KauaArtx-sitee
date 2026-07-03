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
          className="relative rounded-3xl overflow-hidden p-8 sm:p-14 lg:p-20 text-center bg-surface border border-border shadow-sm"
        >
          {/* Hairline gradiente no topo */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px hairline-gradient" />

          {/* Aurora interna */}
          <div className="orb w-[340px] h-[340px] -top-24 -left-16 bg-accent-bright/20 animate-float-slow" />
          <div className="orb w-[300px] h-[300px] -bottom-20 -right-12 bg-accent-2/20 animate-float-slower" />

          <h2 className="relative text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter mb-5">
            <span className="text-gradient">{t('title')}</span>
          </h2>
          <p className="relative text-foreground-muted mb-12 text-lg max-w-lg mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
          <Link href="/contact" className="group relative btn-pill-primary text-base">
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
