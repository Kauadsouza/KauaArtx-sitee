'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { motion, useMotionValue, useMotionTemplate, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { useRef, MouseEvent } from 'react';
import { cn } from '@/lib/utils';

const PROJECTS = [
  {
    slug: 'the-kaden',
    name: 'The Kaden',
    tagline: 'SaaS de automação WhatsApp para clínicas estéticas e salões de beleza.',
    stack: ['Next.js', 'Supabase', 'WhatsApp API', 'TypeScript'],
    status: 'production' as const,
    externalUrl: 'https://thekaden.com.br',
    category: 'SaaS',
    gradient: 'from-accent/15 to-transparent',
    glow: 'rgba(0,255,136,0.10)',
  },
  {
    slug: 'condor',
    name: 'CONDOR',
    tagline: 'Assistente IA local rodando 100% offline via Ollama. Privacidade first.',
    stack: ['Electron', 'JSX', 'Ollama', 'Node.js'],
    status: 'development' as const,
    externalUrl: null,
    category: 'AI',
    gradient: 'from-accent-2/15 to-transparent',
    glow: 'rgba(0,212,255,0.10)',
  },
  {
    slug: 'null-forge',
    name: 'Null Forge',
    tagline: 'Democratizando educação tech no Brasil. Começando pelas escolas.',
    stack: ['Next.js', 'TypeScript', 'Educação', 'Impacto Social'],
    status: 'building' as const,
    externalUrl: null,
    category: 'Educação',
    gradient: 'from-accent/10 via-accent-2/10 to-transparent',
    glow: 'rgba(0,230,190,0.10)',
  },
];

const STATUS_STYLES = {
  production: 'text-accent-bright bg-accent/15 border-accent/30',
  development: 'text-accent-2 bg-accent-2/10 border-accent-2/30',
  building: 'text-foreground-muted bg-surface-elevated border-border-strong',
};

const STATUS_LABELS = {
  production: 'Em Produção',
  development: 'Em Desenvolvimento',
  building: 'Estruturando',
};

function ProjectCard({ project, index }: { project: typeof PROJECTS[0]; index: number }) {
  const t = useTranslations('featured_projects');
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4, 4]), { stiffness: 300, damping: 30 });
  const glowX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
  const glowY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);
  const spotlight = useMotionTemplate`radial-gradient(320px circle at ${glowX}% ${glowY}%, ${project.glow}, transparent 70%)`;

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const onMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 1000 }}
      className="h-full"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{ rotateX, rotateY }}
        className="relative group flex flex-col p-7 rounded-2xl glass hover:border-border-strong transition-colors duration-300 overflow-hidden h-full"
      >
        {/* Hairline gradiente no topo */}
        <div className="absolute top-0 left-0 right-0 h-px hairline-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Spotlight que segue o mouse */}
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: spotlight }}
        />

        {/* Gradiente de fundo */}
        <div className={cn('absolute inset-0 bg-gradient-to-br opacity-50', project.gradient)} />

        <div className="relative flex flex-col h-full">
          {/* Status + Category */}
          <div className="flex items-center justify-between mb-5">
            <span className={cn('text-xs px-3 py-1 rounded-full border font-mono', STATUS_STYLES[project.status])}>
              {STATUS_LABELS[project.status]}
            </span>
            <span className="text-xs text-foreground-subtle font-mono">{project.category}</span>
          </div>

          {/* Name */}
          <h3 className="text-2xl font-bold tracking-tight text-foreground mb-2 group-hover:text-accent-bright transition-colors">
            {project.name}
          </h3>

          {/* Tagline */}
          <p className="text-sm text-foreground-muted leading-relaxed mb-6">
            {project.tagline}
          </p>

          {/* Stack */}
          <div className="flex flex-wrap gap-2 mb-8">
            {project.stack.map((tech) => (
              <span
                key={tech}
                className="text-xs px-2.5 py-1 rounded-full bg-surface-elevated/80 border border-border text-foreground-subtle font-mono"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-auto">
            <Link
              href={`/projects/${project.slug}`}
              className="group/btn inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors"
            >
              {t('view_case_study')}
              <ArrowRight size={13} className="transition-transform group-hover/btn:translate-x-1" />
            </Link>
            {project.externalUrl && (
              <a
                href={project.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto p-2 rounded-full text-foreground-subtle hover:text-accent-bright hover:bg-surface-elevated transition-all"
                aria-label={`Visitar ${project.name}`}
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function FeaturedProjects() {
  const t = useTranslations('featured_projects');

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-3">
              {t('title')}
            </h2>
            <p className="text-foreground-muted">{t('subtitle')}</p>
          </div>
          <Link
            href="/projects"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-accent-bright transition-colors"
          >
            {t('view_all')}
            <ArrowRight size={13} />
          </Link>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECTS.map((p, i) => (
            <ProjectCard key={p.slug} project={p} index={i} />
          ))}
        </div>

        {/* Mobile "view all" */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors"
          >
            {t('view_all')}
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </section>
  );
}
