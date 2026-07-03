'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getYearsOfExperience } from '@/lib/utils';

interface GitHubStats {
  public_repos: number;
}

interface StatsData {
  yearsExperience: number;
  repos: number | null;
  loading: boolean;
}

function StatCard({
  value,
  label,
  loading,
  index,
}: {
  value: string | number;
  label: string;
  loading?: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative p-8 rounded-2xl glass hover:border-border-strong transition-all duration-300 overflow-hidden"
    >
      {/* Hairline gradiente no topo — aparece no hover */}
      <div className="absolute top-0 left-0 right-0 h-px hairline-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Brilho difuso no hover */}
      <div className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full bg-accent/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative text-5xl font-bold font-mono mb-3 tracking-tighter">
        {loading ? (
          <span className="text-foreground-subtle animate-pulse">—</span>
        ) : (
          <span className="text-gradient-green">{value}</span>
        )}
      </div>
      <div className="relative text-sm text-foreground-muted">{label}</div>
    </motion.div>
  );
}

export default function StatsSection() {
  const t = useTranslations('stats');
  const [stats, setStats] = useState<StatsData>({
    yearsExperience: getYearsOfExperience(2022),
    repos: null,
    loading: true,
  });

  useEffect(() => {
    fetch('/api/github-stats')
      .then((r) => r.json())
      .then((data: GitHubStats) => {
        setStats((prev) => ({
          ...prev,
          repos: data.public_repos ?? null,
          loading: false,
        }));
      })
      .catch(() => {
        setStats((prev) => ({ ...prev, loading: false }));
      });
  }, []);

  return (
    <section className="py-16 sm:py-24 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            index={0}
            value={`${stats.yearsExperience}+`}
            label={t('years_coding')}
          />
          <StatCard
            index={1}
            value={stats.repos ?? '—'}
            label={t('github_repos')}
            loading={stats.loading}
          />
          <StatCard
            index={2}
            value="3"
            label="Startups / Projetos"
          />
          <StatCard
            index={3}
            value="∞"
            label="Ambição"
          />
        </div>
      </div>
    </section>
  );
}
