'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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

const ROW_1 = TECH.slice(0, 8);
const ROW_2 = TECH.slice(8);

function TechChip({ tech, accent2 }: { tech: (typeof TECH)[0]; accent2?: boolean }) {
  return (
    <div className="group flex shrink-0 items-center gap-2.5 px-5 py-3 rounded-full glass hover:border-border-strong transition-colors duration-200 cursor-default">
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full transition-transform duration-200 group-hover:scale-150',
          accent2 ? 'bg-accent-2-glow' : 'bg-accent-glow'
        )}
      />
      <span className="text-sm font-medium text-foreground-muted group-hover:text-foreground transition-colors whitespace-nowrap">
        {tech.name}
      </span>
      <span
        className={cn(
          'text-xs font-mono transition-colors whitespace-nowrap',
          accent2
            ? 'text-foreground-subtle group-hover:text-accent-2'
            : 'text-foreground-subtle group-hover:text-accent-bright'
        )}
      >
        {tech.category}
      </span>
    </div>
  );
}

function MarqueeRow({
  items,
  reverse,
  accent2,
}: {
  items: typeof TECH;
  reverse?: boolean;
  accent2?: boolean;
}) {
  // Duplicado para o loop ser contínuo (a animação desloca -50%)
  const doubled = [...items, ...items];

  return (
    <div className="marquee-mask overflow-hidden">
      <div
        className={cn(
          'flex w-max gap-3 py-1',
          reverse ? 'animate-marquee-reverse' : 'animate-marquee'
        )}
      >
        {doubled.map((tech, i) => (
          <TechChip key={`${tech.name}-${i}`} tech={tech} accent2={accent2} />
        ))}
      </div>
    </div>
  );
}

export default function TechStack() {
  const t = useTranslations('tech_stack');

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      <div className="orb w-[360px] h-[360px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent-2/10 dark:bg-accent-2/8" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-3">
            {t('title')}
          </h2>
          <p className="text-foreground-muted">{t('subtitle')}</p>
        </motion.div>
      </div>

      {/* Marquee em largura total, fora do container */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative space-y-4"
      >
        <MarqueeRow items={ROW_1} />
        <MarqueeRow items={ROW_2} reverse accent2 />
      </motion.div>
    </section>
  );
}
