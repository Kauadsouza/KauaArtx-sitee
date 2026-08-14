import { ArrowRight, MapPin } from 'lucide-react';
import { Link } from '@/i18n/navigation';

const COPY = {
  pt: {
    kicker: 'AGORA',
    title: 'Onde estou agora',
    location: 'Oxford, Inglaterra',
    status: 'Minha base nesta fase',
    description:
      'Moro aqui com a minha família, estou construindo o @KauaArtx e me preparando para estudar.',
    action: 'Ver no mapa',
    route: 'OXFORD · REINO UNIDO',
  },
  en: {
    kicker: 'RIGHT NOW',
    title: 'Where I am now',
    location: 'Oxford, England',
    status: 'My base in this phase',
    description:
      'I live here with my family, I am building @KauaArtx, and I am preparing to study.',
    action: 'See it on the map',
    route: 'OXFORD · UNITED KINGDOM',
  },
} as const;

export default function NowSection({ locale }: { locale: string }) {
  const copy = locale === 'en' ? COPY.en : COPY.pt;

  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-surface">
          <span aria-hidden className="absolute inset-x-0 top-0 h-px hairline-gradient" />
          <div
            aria-hidden
            className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
          />

          <div className="relative grid gap-8 p-7 sm:p-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:p-12">
            <div className="max-w-2xl">
              <div className="mb-4 flex items-center gap-2.5">
                <MapPin size={15} className="text-accent-bright" />
                <span className="font-pixel text-[9px] tracking-[0.3em] text-accent-deep">
                  {copy.kicker}
                </span>
              </div>

              <p className="mb-2 text-sm font-medium text-foreground-muted">{copy.title}</p>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {copy.location}
              </h2>
              <p className="mt-2 text-sm font-semibold text-accent-deep">{copy.status}</p>
              <p className="mt-5 max-w-xl leading-relaxed text-foreground-muted">
                {copy.description}
              </p>
            </div>

            <div className="flex flex-col items-start gap-5 lg:items-end">
              <div className="flex items-center gap-3 text-[10px] font-semibold tracking-[0.22em] text-foreground-subtle">
                <span aria-hidden className="h-px w-10 bg-border-strong" />
                <span>{copy.route}</span>
                <span aria-hidden className="h-2 w-2 rounded-full bg-accent" />
              </div>
              <Link href="/mapa" className="group btn-pill-secondary text-sm">
                {copy.action}
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

