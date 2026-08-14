import type { Metadata } from 'next';
import { ArrowRight, CalendarDays, MapPin, Radio, Youtube } from 'lucide-react';
import { Link } from '@/i18n/navigation';

const CURRENT_UPDATES = [
  {
    date: { pt: '14 de agosto de 2026', en: '14 August 2026' },
    place: { pt: 'Oxford, Inglaterra', en: 'Oxford, England' },
    title: { pt: 'A fase atual', en: 'The current chapter' },
    text: {
      pt: 'Estou morando em Oxford com minha família. Minha energia está dividida entre construir o canal @KauaArtx e me preparar para estudar.',
      en: 'I am living in Oxford with my family. My energy is split between building the @KauaArtx channel and preparing to study.',
    },
  },
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isPt = locale === 'pt';

  return {
    title: isPt ? 'Onde estou agora' : 'Where I am now',
    description: isPt
      ? 'Atualizações reais e datadas sobre a fase atual de Kauã.'
      : 'Real, dated updates about Kauã’s current chapter.',
  };
}

export default async function NowPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isPt = locale === 'pt';
  const loc = isPt ? 'pt' : 'en';

  return (
    <div className="relative min-h-screen overflow-hidden pt-24">
      <div aria-hidden className="orb right-[-10%] top-[-5%] h-[420px] w-[420px] bg-accent/15 animate-float-slow" />

      <div className="relative mx-auto max-w-5xl px-4 pb-32 sm:px-6 lg:px-8">
        <header className="py-14 text-center sm:py-20">
          <div className="mb-5 flex items-center justify-center gap-2.5 text-accent">
            <span className="h-2 w-2 rounded-full bg-accent-bright animate-pulse-dot" aria-hidden />
            <span className="font-mono text-xs uppercase tracking-[0.28em]">
              {isPt ? 'ATUALIZAÇÃO MANUAL' : 'MANUAL UPDATE'}
            </span>
          </div>
          <h1 className="text-5xl font-bold tracking-[-0.055em] text-foreground sm:text-7xl">
            {isPt ? 'Onde estou agora' : 'Where I am now'}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-foreground-muted">
            {isPt
              ? 'Sem localização automática e sem criar uma rotina que não existe. Só entram aqui mudanças que realmente aconteceram.'
              : 'No automatic location and no invented routine. Only changes that actually happened are added here.'}
          </p>
        </header>

        <section
          aria-label={isPt ? 'Resumo atual' : 'Current snapshot'}
          className="mb-16 grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-3"
        >
          {[
            {
              icon: MapPin,
              label: { pt: 'Base atual', en: 'Current base' },
              value: { pt: 'Oxford, Inglaterra', en: 'Oxford, England' },
            },
            {
              icon: Youtube,
              label: { pt: 'Construindo', en: 'Building' },
              value: { pt: 'Canal @KauaArtx', en: '@KauaArtx channel' },
            },
            {
              icon: Radio,
              label: { pt: 'Em paralelo', en: 'Alongside it' },
              value: { pt: 'Preparação para estudar', en: 'Preparing to study' },
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label.pt} className="bg-surface p-6 sm:p-7">
                <Icon size={19} className="text-accent-bright" aria-hidden />
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-foreground-subtle">
                  {item.label[loc]}
                </p>
                <p className="mt-2 font-bold text-foreground">{item.value[loc]}</p>
              </div>
            );
          })}
        </section>

        <section aria-labelledby="history-title">
          <div className="mb-9 flex items-center gap-4">
            <CalendarDays size={19} className="text-accent" aria-hidden />
            <h2 id="history-title" className="whitespace-nowrap text-2xl font-bold text-foreground">
              {isPt ? 'Histórico' : 'History'}
            </h2>
            <span aria-hidden className="h-px flex-1 bg-border" />
          </div>

          <div className="relative ml-3 border-l border-border-strong pl-7 sm:ml-4 sm:pl-10">
            {CURRENT_UPDATES.map((update) => (
              <article key={update.date.pt} className="relative pb-12 last:pb-0">
                <span
                  aria-hidden
                  className="absolute -left-[2.18rem] top-1.5 h-3 w-3 rounded-full border-[3px] border-background bg-accent-bright shadow-[0_0_0_1px_var(--border-str)] sm:-left-[2.91rem]"
                />
                <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <time className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
                      {update.date[loc]}
                    </time>
                    <span className="text-xs text-foreground-subtle">{update.place[loc]}</span>
                  </div>
                  <h3 className="mt-4 text-2xl font-bold text-foreground">{update.title[loc]}</h3>
                  <p className="mt-3 max-w-3xl leading-relaxed text-foreground-muted">{update.text[loc]}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="mt-14 rounded-3xl border border-dashed border-border-strong bg-surface/60 p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            {isPt ? 'O histórico começa aqui' : 'The history starts here'}
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-foreground-muted">
            {isPt
              ? 'Não vou preencher o passado com datas aproximadas. Novas linhas serão adicionadas manualmente quando houver uma mudança real de lugar ou de fase.'
              : 'I will not fill the past with approximate dates. New entries will be added manually when there is a real change of place or chapter.'}
          </p>
        </aside>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/viagens/oxford" className="group btn-pill-primary text-sm">
            {isPt ? 'Ver a história de Oxford' : 'See the Oxford story'}
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="https://www.youtube.com/@KauaArtx"
            target="_blank"
            rel="noopener noreferrer"
            className="group btn-pill-secondary text-sm"
          >
            {isPt ? 'Acompanhar o canal' : 'Follow the channel'}
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </div>
  );
}
