import { ArrowUpRight, Play, Youtube } from 'lucide-react';
import Image from 'next/image';
import type { LatestYouTubeState } from '@/lib/youtube';

const COPY = {
  pt: {
    kicker: 'CANAL @KAUAARTX',
    title: 'Último vídeo',
    description: 'O vídeo mais recente do canal aparece aqui automaticamente.',
    watch: 'Assistir no YouTube',
    emptyTitle: 'O primeiro vídeo vai aparecer aqui',
    emptyDescription:
      'Ainda não há vídeo publicado no canal. Quando o primeiro sair, esta seção será atualizada automaticamente.',
    unavailableTitle: 'O canal está sendo preparado',
    unavailableDescription:
      'Assim que um vídeo estiver disponível, ele aparecerá aqui automaticamente.',
    channel: 'Abrir o canal',
    imageAlt: 'Identidade visual do canal KauaArtx',
  },
  en: {
    kicker: '@KAUAARTX CHANNEL',
    title: 'Latest video',
    description: 'The latest channel video appears here automatically.',
    watch: 'Watch on YouTube',
    emptyTitle: 'The first video will appear here',
    emptyDescription:
      'There is no published video on the channel yet. When the first one goes live, this section will update automatically.',
    unavailableTitle: 'The channel is being prepared',
    unavailableDescription:
      'As soon as a video is available, it will appear here automatically.',
    channel: 'Open the channel',
    imageAlt: 'KauaArtx channel visual identity',
  },
} as const;

function formatPublishedAt(value: string, locale: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export default function LatestYouTube({
  locale,
  state,
}: {
  locale: string;
  state: LatestYouTubeState;
}) {
  const copy = locale === 'en' ? COPY.en : COPY.pt;
  const video = state.status === 'video' ? state.video : null;
  const publishedAt = video ? formatPublishedAt(video.publishedAt, locale) : null;

  return (
    <section className="deep-band py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <Youtube size={15} className="text-accent-bright" />
              <span className="font-pixel text-[9px] tracking-[0.3em] text-accent-deep">
                {copy.kicker}
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {copy.title}
            </h2>
            <p className="mt-3 text-foreground-muted">{copy.description}</p>
          </div>
        </div>

        {video ? (
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group grid overflow-hidden rounded-3xl border border-border bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-border-strong hover:shadow-2xl hover:shadow-black/30 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]"
          >
            <div
              aria-hidden
              className="relative min-h-64 bg-cover bg-center lg:min-h-96"
              style={{
                backgroundImage: `linear-gradient(110deg, rgba(3,21,20,0.14), rgba(3,21,20,0.72)), url(${video.thumbnailUrl})`,
              }}
            >
              <span className="absolute inset-0 bg-gradient-to-t from-deep/70 via-transparent to-transparent" />
              <span className="absolute bottom-5 left-5 grid h-14 w-14 place-items-center rounded-full bg-accent text-[color:var(--ink-on-accent)] shadow-lg transition-transform duration-300 group-hover:scale-105">
                <Play size={21} fill="currentColor" />
              </span>
            </div>

            <div className="flex flex-col justify-center p-7 sm:p-10">
              {publishedAt && (
                <p className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-foreground-subtle">
                  {publishedAt}
                </p>
              )}
              <h3 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">
                {video.title}
              </h3>
              <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-accent-deep transition-colors group-hover:text-accent-bright">
                {copy.watch}
                <ArrowUpRight size={15} />
              </span>
            </div>
          </a>
        ) : (
          <div className="grid overflow-hidden rounded-3xl border border-dashed border-border-strong bg-surface lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
            <div className="relative min-h-64 overflow-hidden lg:min-h-96">
              <Image
                src="/images/kaua-artx-brand-master.webp"
                alt={copy.imageAlt}
                fill
                sizes="(min-width: 1024px) 760px, 100vw"
                className="object-cover"
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-deep/45 via-transparent to-transparent"
              />
            </div>

            <div className="relative flex flex-col justify-center p-8 sm:p-10">
              <div
                aria-hidden
                className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
              />
              <div className="relative">
                <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl border border-accent/20 bg-accent/10 text-accent-bright">
                  <Play size={22} />
                </div>
                <h3 className="text-2xl font-bold text-foreground sm:text-3xl">
                  {state.status === 'empty' ? copy.emptyTitle : copy.unavailableTitle}
                </h3>
                <p className="mt-3 leading-relaxed text-foreground-muted">
                  {state.status === 'empty'
                    ? copy.emptyDescription
                    : copy.unavailableDescription}
                </p>
                <a
                  href={state.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group btn-pill-primary mt-7 text-sm"
                >
                  <Youtube size={15} />
                  {copy.channel}
                  <ArrowUpRight
                    size={14}
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
