import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import {
  MapPin,
  ArrowRight,
  BookOpen,
  Footprints,
  MessageCircleQuestion,
  PlayCircle,
} from 'lucide-react';
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
  const copy =
    loc === 'pt'
      ? {
          story: 'Abrir página da viagem',
          video: 'Assistir ao vídeo',
          videoPending: 'Vídeo ainda não publicado',
          questionKicker: 'O próximo capítulo',
          questionTitle: 'O que você quer ver no próximo vídeo?',
          questionDescription:
            'Mande sua pergunta ou uma curiosidade. As melhores podem virar parte do próximo roteiro do canal.',
          questionCta: 'Pergunte para o próximo vídeo',
        }
      : {
          story: 'Open travel page',
          video: 'Watch the video',
          videoPending: 'Video not published yet',
          questionKicker: 'The next chapter',
          questionTitle: 'What do you want to see in the next video?',
          questionDescription:
            'Send a question or something you are curious about. The best ones may become part of the channel\'s next script.',
          questionCta: 'Ask about the next video',
        };

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
              <article
                key={stop.id}
                className={`rounded-2xl bg-surface border p-6 ${
                  stop.status === 'planned'
                    ? 'border-dashed border-border opacity-90'
                    : 'border-border'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2 mb-2.5">
                  <h3 className="font-bold text-foreground">{stop.name[loc]}</h3>
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

                <div className="mt-5 flex flex-wrap items-center gap-2.5">
                  {stop.storyHref && (
                    <Link
                      href={stop.storyHref}
                      className="group inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3.5 py-2 text-xs font-semibold text-foreground transition hover:border-accent hover:bg-accent/15"
                    >
                      <BookOpen size={14} aria-hidden />
                      {copy.story}
                      <ArrowRight
                        size={12}
                        aria-hidden
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </Link>
                  )}

                  {stop.videoUrl ? (
                    <a
                      href={stop.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 rounded-full border border-border-strong px-3.5 py-2 text-xs font-semibold text-foreground-muted transition hover:border-accent hover:text-foreground"
                    >
                      <PlayCircle size={14} aria-hidden />
                      {copy.video}
                      <ArrowRight
                        size={12}
                        aria-hidden
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-1 text-xs text-foreground-subtle">
                      <PlayCircle size={14} aria-hidden />
                      {copy.videoPending}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-foreground-subtle">
            {t('soon_note')}
          </p>
        </section>

        {/* O formulário especializado vive na página da viagem; o mapa só encaminha até ele. */}
        <section
          aria-labelledby="next-video-question"
          className="relative mt-16 overflow-hidden rounded-3xl border border-border bg-surface px-6 py-8 sm:px-10 sm:py-10"
        >
          <div
            aria-hidden
            className="orb -bottom-24 -right-20 h-64 w-64 bg-accent/10 animate-float-slower"
          />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-2 text-accent-deep">
                <MessageCircleQuestion size={16} aria-hidden />
                <span className="font-pixel text-[9px] uppercase tracking-[0.3em]">
                  {copy.questionKicker}
                </span>
              </div>
              <h2
                id="next-video-question"
                className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
              >
                {copy.questionTitle}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-foreground-muted sm:text-base">
                {copy.questionDescription}
              </p>
            </div>

            <Link
              href="/viagens/oxford#pergunte"
              className="group btn-pill-primary shrink-0 text-sm"
            >
              {copy.questionCta}
              <ArrowRight
                size={14}
                aria-hidden
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
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
