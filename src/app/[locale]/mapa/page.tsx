import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { MapPin, ArrowRight, Footprints } from 'lucide-react';
import WorldMap from '@/components/map/WorldMap';
import { TRAVELS, type TravelStatus } from '@/data/travels';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'map' });
  return { title: t('title'), description: t('subtitle') };
}

const BADGE: Record<TravelStatus, string> = {
  lived: 'bg-accent/15 border-accent/40 text-accent-deep',
  visited: 'bg-accent/10 border-accent/25 text-accent-deep',
  planned: 'bg-surface-elevated border-dashed border-border text-foreground-subtle',
};

// Aba do mapa: o mundo em silhueta com os lugares da jornada.
// Os dados moram em src/data/travels.ts — adicionar lugar lá = aparece aqui.
export default async function MapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'map' });
  const loc = (locale === 'pt' ? 'pt' : 'en') as 'pt' | 'en';

  const visitedCount = TRAVELS.filter((s) => s.status !== 'planned').length;
  const plannedCount = TRAVELS.filter((s) => s.status === 'planned').length;
  const countryCount = new Set(TRAVELS.map((s) => s.country.pt)).size;

  const stats = [
    { value: visitedCount, label: t('stats_visited') },
    { value: countryCount, label: t('stats_countries') },
    { value: plannedCount, label: t('stats_planned') },
  ];

  return (
    <div className="min-h-screen pt-24 relative overflow-hidden">
      <div aria-hidden className="orb w-[420px] h-[420px] top-[-8%] right-[-10%] bg-accent-2/15 animate-float-slow" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-32">
        {/* ── Cabeçalho ── */}
        <header className="py-14 sm:py-20 text-center">
          <div className="flex items-center justify-center gap-2.5 mb-5">
            <MapPin size={15} className="text-accent-bright" />
            <span className="font-pixel text-[10px] tracking-[0.35em] uppercase text-accent-deep">
              {t('kicker')}
            </span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter text-foreground mb-6">
            {t('title')}
          </h1>
          <p className="max-w-xl mx-auto text-base sm:text-lg text-foreground-muted leading-relaxed">
            {t('subtitle')}
          </p>

          {/* Números honestos, direto da lista de lugares */}
          <div className="mt-10 inline-flex items-center divide-x divide-border rounded-2xl bg-surface border border-border overflow-hidden">
            {stats.map(({ value, label }) => (
              <div key={label} className="px-6 sm:px-9 py-4">
                <p className="text-2xl sm:text-3xl font-bold text-gradient leading-none mb-1">
                  {value}
                </p>
                <p className="text-[11px] uppercase tracking-widest text-foreground-subtle">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </header>

        {/* ── O mapa ── */}
        <WorldMap />

        {/* ── Lista dos lugares ── */}
        <section className="mt-16 sm:mt-20">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="font-pixel text-[10px] tracking-[0.3em] uppercase text-foreground whitespace-nowrap">
              <span className="text-accent-bright">#</span> {t('list_title')}
            </h2>
            <span aria-hidden className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TRAVELS.map((stop) => (
              <div
                key={stop.id}
                className={`rounded-2xl bg-surface border p-6 ${
                  stop.status === 'planned'
                    ? 'border-dashed border-border opacity-90'
                    : 'border-border'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2 mb-2.5">
                  <h3 className="font-bold text-foreground">{stop.name}</h3>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full border font-bold ${BADGE[stop.status]}`}
                  >
                    {t(`status_${stop.status}`)}
                  </span>
                  {stop.year && (
                    <span className="text-xs text-foreground-subtle">{stop.year}</span>
                  )}
                </div>
                {stop.note && (
                  <p className="text-sm text-foreground-muted leading-relaxed">
                    {stop.note[loc]}
                  </p>
                )}
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-foreground-subtle">
            {t('soon_note')}
          </p>
        </section>

        {/* ── Fecho: liga com a trilha do Sobre ── */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/about" className="group btn-pill-primary text-sm">
            <Footprints size={15} />
            {t('cta_trail')}
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="/contact" className="group btn-pill-secondary text-sm">
            {t('cta_contact')}
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
