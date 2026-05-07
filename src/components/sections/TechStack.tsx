'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

const TECH = [
  { name: 'Next.js', category: 'Frontend' },
  { name: 'React', category: 'Frontend' },
  { name: 'TypeScript', category: 'Language' },
  { name: 'Tailwind CSS', category: 'Styling' },
  { name: 'Node.js', category: 'Backend' },
  { name: 'Supabase', category: 'Database' },
  { name: 'PostgreSQL', category: 'Database' },
  { name: 'Framer Motion', category: 'Animation' },
  { name: 'Electron', category: 'Desktop' },
  { name: 'Ollama', category: 'AI' },
  { name: 'Vercel', category: 'Deploy' },
  { name: 'Git', category: 'DevOps' },
  { name: 'Docker', category: 'DevOps' },
  { name: 'Prisma', category: 'ORM' },
  { name: 'tRPC', category: 'API' },
  { name: 'Redis', category: 'Cache' },
];

export default function TechStack() {
  const t = useTranslations('tech_stack');

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">{t('title')}</h2>
          <p className="text-foreground-muted">{t('subtitle')}</p>
        </motion.div>

        <div className="flex flex-wrap gap-3">
          {TECH.map((tech, i) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              whileHover={{ scale: 1.05 }}
              className="group flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-surface hover:border-accent hover:bg-surface-elevated transition-all duration-200 cursor-default"
            >
              <span className="text-sm font-medium text-foreground-muted group-hover:text-foreground transition-colors">
                {tech.name}
              </span>
              <span className="text-xs text-foreground-subtle group-hover:text-accent-bright transition-colors font-mono">
                {tech.category}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
