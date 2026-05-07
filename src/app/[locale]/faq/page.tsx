'use client';

import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const FAQ_ITEMS = [
  { q: 'q1', a: 'a1' },
  { q: 'q2', a: 'a2' },
  { q: 'q3', a: 'a3' },
  { q: 'q4', a: 'a4' },
  { q: 'q5', a: 'a5' },
  { q: 'q6', a: 'a6' },
  { q: 'q7', a: 'a7' },
  { q: 'q8', a: 'a8' },
  { q: 'q9', a: 'a9' },
  { q: 'q10', a: 'a10' },
] as const;

type FaqKey = 'q1'|'q2'|'q3'|'q4'|'q5'|'q6'|'q7'|'q8'|'q9'|'q10'|'a1'|'a2'|'a3'|'a4'|'a5'|'a6'|'a7'|'a8'|'a9'|'a10'|'title'|'subtitle';

export default function FAQPage() {
  const t = useTranslations('faq');
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="min-h-screen pt-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-32">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="py-16 sm:py-24"
        >
          <p className="text-accent-bright font-mono text-sm mb-4">/ faq</p>
          <h1 className="text-5xl sm:text-6xl font-bold text-foreground tracking-tight mb-6">
            {t('title')}
          </h1>
          <p className="text-xl text-foreground-muted">{t('subtitle')}</p>
        </motion.div>

        {/* Accordion */}
        <div className="space-y-3">
          {FAQ_ITEMS.map(({ q, a }, i) => {
            const isOpen = openIdx === i;
            return (
              <motion.div
                key={q}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className={cn(
                  'rounded-lg border transition-all duration-200',
                  isOpen
                    ? 'border-border-strong bg-surface'
                    : 'border-border bg-surface hover:border-border-strong'
                )}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="flex items-start justify-between w-full p-5 text-left gap-4"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-medium text-foreground leading-relaxed">
                    {t(q as FaqKey)}
                  </span>
                  <ChevronDown
                    size={16}
                    className={cn(
                      'shrink-0 mt-0.5 text-foreground-subtle transition-transform duration-200',
                      isOpen && 'rotate-180 text-accent-bright'
                    )}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm text-foreground-muted leading-relaxed">
                        {t(a as FaqKey)}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
