'use client';

import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <p className="font-mono text-8xl font-bold text-accent/20 mb-6">404</p>
        <h1 className="text-3xl font-bold text-foreground mb-3">Página não encontrada</h1>
        <p className="text-foreground-muted mb-8">
          A página que você procura não existe ou foi movida.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent hover:bg-accent-bright text-foreground font-medium text-sm transition-all"
        >
          <ArrowLeft size={14} />
          Voltar ao início
        </Link>
      </motion.div>
    </div>
  );
}
