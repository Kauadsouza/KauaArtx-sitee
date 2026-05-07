'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { ExternalLink, Github, ArrowLeft, CheckCircle2, XCircle, RefreshCw, ChevronRight } from 'lucide-react';
import type { Project } from '@/lib/projects';
import { cn } from '@/lib/utils';

const STATUS_STYLES = {
  production: 'text-accent-bright bg-accent/20 border-accent/30',
  development: 'text-purple-400 bg-purple-900/20 border-purple-800/30',
  building: 'text-blue-400 bg-blue-900/20 border-blue-800/30',
};

const STATUS_LABELS = {
  production: 'Em Produção',
  development: 'Em Desenvolvimento',
  building: 'Estruturando',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6 }}
      className="py-12 border-t border-border"
    >
      <h2 className="text-2xl font-bold text-foreground mb-6">{title}</h2>
      {children}
    </motion.section>
  );
}

export default function CaseStudyClient({ project }: { project: Project }) {
  const t = useTranslations('case_study');

  return (
    <div className="min-h-screen pt-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-32">

        {/* Back */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="py-8"
        >
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm text-foreground-subtle hover:text-foreground transition-colors"
          >
            <ArrowLeft size={13} />
            Todos os Projetos
          </Link>
        </motion.div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="pb-12"
        >
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className={cn('text-xs px-2.5 py-1 rounded border font-mono', STATUS_STYLES[project.status])}>
              {STATUS_LABELS[project.status]}
            </span>
            <span className="text-xs text-foreground-subtle font-mono">{project.year}</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground tracking-tight mb-4">
            {project.name}
          </h1>
          <p className="text-xl text-foreground-muted mb-8 max-w-2xl">{project.tagline}</p>

          {/* External links */}
          <div className="flex items-center gap-4">
            {project.externalUrl && (
              <a
                href={project.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent-bright text-foreground text-sm font-medium transition-all"
              >
                <ExternalLink size={13} />
                {t('links')} ↗
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-surface hover:bg-surface-elevated text-foreground-muted hover:text-foreground text-sm font-medium transition-all"
              >
                <Github size={13} />
                GitHub
              </a>
            )}
          </div>
        </motion.div>

        {/* Overview */}
        <Section title={t('overview')}>
          <p className="text-foreground-muted leading-relaxed">{project.overview}</p>
        </Section>

        {/* Problem */}
        <Section title={t('problem')}>
          <div className="p-6 rounded-lg border border-border bg-surface">
            <p className="text-foreground-muted leading-relaxed">{project.problem}</p>
          </div>
        </Section>

        {/* Solution */}
        <Section title={t('solution')}>
          <p className="text-foreground-muted leading-relaxed">{project.solution}</p>
        </Section>

        {/* Stack */}
        <Section title={t('stack')}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {project.stack.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-surface hover:border-border-strong transition-colors"
              >
                <span className="font-medium text-foreground text-sm font-mono">{item.name}</span>
                <span className="text-xs text-foreground-subtle">{item.role}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Lessons */}
        <Section title={t('lessons')}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Worked */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-accent-bright font-medium text-sm">
                <CheckCircle2 size={15} />
                {t('lessons_worked')}
              </div>
              {project.lessons.worked.map((l, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-foreground-muted">
                  <ChevronRight size={12} className="mt-0.5 shrink-0 text-accent" />
                  {l}
                </div>
              ))}
            </div>

            {/* Failed */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-red-400 font-medium text-sm">
                <XCircle size={15} />
                {t('lessons_failed')}
              </div>
              {project.lessons.failed.map((l, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-foreground-muted">
                  <ChevronRight size={12} className="mt-0.5 shrink-0 text-red-500/50" />
                  {l}
                </div>
              ))}
            </div>

            {/* Different */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-blue-400 font-medium text-sm">
                <RefreshCw size={15} />
                {t('lessons_different')}
              </div>
              {project.lessons.different.map((l, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-foreground-muted">
                  <ChevronRight size={12} className="mt-0.5 shrink-0 text-blue-500/50" />
                  {l}
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Next Steps */}
        <Section title={t('next_steps')}>
          <ul className="space-y-3">
            {project.nextSteps.map((step, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="flex items-start gap-3 text-foreground-muted text-sm"
              >
                <span className="text-accent-bright font-mono shrink-0 mt-0.5">{String(i + 1).padStart(2, '0')}.</span>
                {step}
              </motion.li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
}
