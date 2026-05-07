'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const PROJECTS = [
  {
    slug: 'the-kaden',
    name: 'The Kaden',
    tagline: 'SaaS de automação WhatsApp para clínicas estéticas e salões de beleza.',
    description: 'Plataforma completa que permite clínicas e salões automatizarem atendimento, agendamentos e follow-ups via WhatsApp, com onboarding chat-first e pricing acessível para o interior do Brasil.',
    stack: ['Next.js', 'Supabase', 'WhatsApp API', 'TypeScript', 'Stripe'],
    status: 'production' as const,
    category: 'saas' as const,
    externalUrl: 'https://thekaden.com.br',
    year: '2025',
  },
  {
    slug: 'condor',
    name: 'CONDOR',
    tagline: 'Assistente IA local rodando 100% offline via Ollama. Privacidade first.',
    description: 'Interface desktop para modelos de IA locais, permitindo conversas inteligentes sem enviar dados para a nuvem. Focado em desenvolvedores e profissionais que priorizam privacidade.',
    stack: ['Electron', 'JSX', 'Ollama', 'Node.js', 'qwen2.5-coder'],
    status: 'development' as const,
    category: 'ai' as const,
    externalUrl: null,
    year: '2025',
  },
  {
    slug: 'null-forge',
    name: 'Null Forge',
    tagline: 'Democratizando educação tech no Brasil. Começando pelas escolas.',
    description: 'Iniciativa de impacto social focada em levar educação tecnológica de qualidade para escolas públicas e comunidades carentes no Brasil, com currículo prático e mentoria.',
    stack: ['Next.js', 'TypeScript', 'MDX', 'Supabase'],
    status: 'building' as const,
    category: 'education' as const,
    externalUrl: null,
    year: '2025',
  },
];

const STATUS_STYLES = {
  production: 'text-accent-bright bg-accent/20 border-accent/30',
  development: 'text-purple-400 bg-purple-900/20 border-purple-800/30',
  building: 'text-blue-400 bg-blue-900/20 border-blue-800/30',
};

const FILTERS = ['all', 'saas', 'ai', 'education'] as const;
type Filter = typeof FILTERS[number];

export default function ProjectsPage() {
  const t = useTranslations('projects');
  const [filter, setFilter] = useState<Filter>('all');

  const filterLabels: Record<Filter, string> = {
    all: t('filter_all'),
    saas: t('filter_saas'),
    ai: t('filter_ai'),
    education: t('filter_education'),
  };

  const statusLabels = {
    production: t('status_production'),
    development: t('status_development'),
    building: t('status_building'),
  };

  const filtered = filter === 'all'
    ? PROJECTS
    : PROJECTS.filter((p) => p.category === filter);

  return (
    <div className="min-h-screen pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="py-16 sm:py-24"
        >
          <p className="text-accent-bright font-mono text-sm mb-4">/ projetos</p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground tracking-tight mb-6">
            {t('title')}
          </h1>
          <p className="text-xl text-foreground-muted max-w-2xl">{t('subtitle')}</p>
        </motion.div>

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center gap-2 mb-12 flex-wrap"
        >
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-all border',
                filter === f
                  ? 'border-accent-bright text-accent-bright bg-accent/10'
                  : 'border-border text-foreground-subtle hover:text-foreground-muted hover:border-border-strong'
              )}
            >
              {filterLabels[f]}
            </button>
          ))}
        </motion.div>

        {/* Projects grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-32">
          {filtered.map((project, i) => (
            <motion.div
              key={project.slug}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group flex flex-col rounded-lg border border-border bg-surface hover:border-border-strong hover:bg-surface-elevated transition-all duration-300 overflow-hidden"
            >
              <div className="p-6 flex flex-col flex-1">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <span className={cn('text-xs px-2 py-0.5 rounded border font-mono', STATUS_STYLES[project.status])}>
                    {statusLabels[project.status]}
                  </span>
                  <span className="text-xs text-foreground-subtle font-mono">{project.year}</span>
                </div>

                <h2 className="text-2xl font-bold text-foreground mb-2 group-hover:text-accent-bright transition-colors">
                  {project.name}
                </h2>
                <p className="text-sm font-medium text-foreground-muted mb-3">{project.tagline}</p>
                <p className="text-sm text-foreground-subtle leading-relaxed mb-6 flex-1">
                  {project.description}
                </p>

                {/* Stack */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {project.stack.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs px-2 py-0.5 rounded bg-background border border-border text-foreground-subtle font-mono"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-4 border-t border-border">
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
                      className="ml-auto inline-flex items-center gap-1.5 text-sm text-foreground-subtle hover:text-accent-bright transition-colors"
                    >
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
