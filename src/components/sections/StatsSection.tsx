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
}: {
  value: string | number;
  label: string;
  loading?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group p-6 rounded-lg border border-border bg-surface hover:border-border-strong hover:bg-surface-elevated transition-all"
    >
      <div className="text-4xl font-bold text-foreground font-mono mb-2 group-hover:text-accent-bright transition-colors">
        {loading ? (
          <span className="text-foreground-subtle animate-pulse">—</span>
        ) : (
          value
        )}
      </div>
      <div className="text-sm text-foreground-muted">{label}</div>
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
    <section className="py-16 sm:py-24 border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            value={`${stats.yearsExperience}+`}
            label={t('years_coding')}
          />
          <StatCard
            value={stats.repos ?? '—'}
            label={t('github_repos')}
            loading={stats.loading}
          />
          <StatCard
            value="3"
            label="Startups / Projetos"
          />
          <StatCard
            value="∞"
            label="Ambição"
          />
        </div>
      </div>
    </section>
  );
}
