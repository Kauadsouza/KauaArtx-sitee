import Image from 'next/image';
import { ArrowLeft, ArrowRight, BookOpen, Check, Clock3, MapPin, Navigation } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { EDITORIAL_POSTS } from '@/data/editorial-posts';
import { OXFORD_COPY, OXFORD_STORY_SLUG, type OxfordLocale } from '@/data/oxford-page';
import { TRAVELS } from '@/data/travels';

export default function OxfordOverview({ loc }: { loc: OxfordLocale }) {
  const copy = OXFORD_COPY[loc];
  const oxford = TRAVELS.find((stop) => stop.id === 'oxford');
  const story = EDITORIAL_POSTS.find((post) => post.slug === OXFORD_STORY_SLUG);

  if (!oxford || !story) return null;

  const [longitude, latitude] = oxford.coords;
  const coordinatesLabel = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  const location =
    loc === 'pt'
      ? {
          route: 'TRAJETO SIMBÓLICO',
          title: 'Da minha origem ao primeiro ponto internacional',
          description:
            'Uberlândia é onde a minha história começou. Oxford é o primeiro destino internacional registrado nesta jornada — e o único publicado até agora.',
          origin: 'De onde eu vim',
          destination: 'Primeiro ponto internacional',
          note: 'Uma linha da jornada, não uma rota aérea exata.',
          mapNote: 'Só entram no mapa viagens que realmente aconteceram.',
        }
      : {
          route: 'SYMBOLIC ROUTE',
          title: 'From my roots to the first international point',
          description:
            'Uberlândia is where my story began. Oxford is the first international destination recorded in this journey — and the only one published so far.',
          origin: 'Where I came from',
          destination: 'First international point',
          note: 'A line through the journey, not an exact flight route.',
          mapNote: 'Only trips that really happened are added to the map.',
        };

  return (
    <>
      <div className="py-7 sm:py-9">
        <Link
          href="/mapa"
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft size={15} aria-hidden />
          {copy.back}
        </Link>
      </div>

      <header className="relative min-h-[560px] overflow-hidden rounded-[2rem] border border-border-strong bg-surface shadow-[0_34px_90px_-42px_rgba(0,0,0,0.95)] sm:min-h-[630px]">
        <Image
          src={story.cover_url ?? '/images/oxford-radcliffe-camera.webp'}
          alt={copy.referencePhoto}
          fill
          priority
          sizes="(min-width: 1280px) 1152px, 100vw"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[#031514] via-[#031514]/72 to-[#031514]/15"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-[#031514]/70 via-transparent to-transparent"
        />
        <span aria-hidden className="absolute inset-x-0 top-0 z-10 h-px hairline-gradient" />

        <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-10 lg:p-14">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="boarding-tag font-pixel text-[8px] tracking-[0.22em] text-accent-bright sm:text-[9px]">
              <MapPin size={13} aria-hidden />
              {copy.kicker}
            </span>
            <span className="rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md">
              {oxford.name[loc]} · {oxford.country[loc]}
            </span>
          </div>
          <h1 className="max-w-4xl text-4xl font-bold tracking-[-0.045em] text-white [text-shadow:0_3px_22px_rgba(0,0,0,0.75)] sm:text-6xl lg:text-7xl">
            {copy.title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#DAF1DE] [text-shadow:0_2px_10px_rgba(0,0,0,0.9)] sm:text-lg">
            {loc === 'pt' ? (story.excerpt ?? copy.intro) : copy.intro}
          </p>
          <p className="mt-5 text-xs leading-relaxed text-white/65">
            Radcliffe Camera ·{' '}
            <a
              href="https://commons.wikimedia.org/wiki/File:Radcliffe_Camera,_Oxford_-_36286514263.jpg"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-white/30 underline-offset-2 hover:text-white"
            >
              Dmitry Djouce
            </a>{' '}
            ·{' '}
            <a
              href="https://creativecommons.org/licenses/by/2.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-white/30 underline-offset-2 hover:text-white"
            >
              CC BY 2.0
            </a>{' '}
            · {copy.referencePhoto}
          </p>
        </div>
      </header>

      <section
        aria-label={loc === 'pt' ? 'Resumo da viagem' : 'Trip summary'}
        className="relative z-20 mx-auto -mt-7 grid max-w-5xl gap-3 px-3 sm:grid-cols-3 sm:px-6"
      >
        {copy.facts.map(({ label, value, icon: Icon }) => (
          <div key={label} className="glass-strong flex items-center gap-4 rounded-2xl p-5 shadow-xl">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent-bright">
              <Icon size={19} aria-hidden />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground-subtle">
                {label}
              </p>
              <p className="mt-1 font-bold text-foreground">{value}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mx-auto grid max-w-5xl gap-10 py-20 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)] lg:items-start">
        <div>
          <div className="mb-5 flex items-center gap-3">
            <BookOpen size={16} className="text-accent-bright" aria-hidden />
            <span className="font-pixel text-[9px] tracking-[0.28em] text-accent-deep">
              {copy.storyKicker}
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            {copy.storyTitle}
          </h2>
          <div className="mt-8 space-y-5 text-base leading-[1.85] text-[#C7E0CD] sm:text-lg">
            {copy.storyParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <Link
            href={`/blog/${story.slug}`}
            className="group mt-8 inline-flex items-center gap-2 font-semibold text-accent-deep transition-colors hover:text-accent-bright"
          >
            {copy.fullStory}
            <ArrowRight size={15} aria-hidden className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <aside className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 sm:p-8">
          <span aria-hidden className="absolute inset-x-0 top-0 h-px hairline-gradient" />
          <div className="flex items-center gap-2 text-accent-bright">
            <Clock3 size={15} aria-hidden />
            <span className="font-pixel text-[8px] tracking-[0.22em]">
              {loc === 'pt' ? 'AGORA' : 'NOW'}
            </span>
          </div>
          <p className="mt-5 text-2xl font-bold text-foreground">
            {oxford.name[loc]}, {oxford.country[loc]}
          </p>
          <p className="mt-3 leading-relaxed text-foreground-muted">{oxford.note?.[loc]}</p>
          <div className="mt-7 space-y-3 border-t border-border pt-6 text-sm text-foreground-muted">
            <div className="flex items-start gap-3">
              <Check size={16} className="mt-0.5 shrink-0 text-accent-bright" aria-hidden />
              <span>{copy.pinLinked}</span>
            </div>
            <div className="flex items-start gap-3">
              <Clock3 size={16} className="mt-0.5 shrink-0 text-foreground-subtle" aria-hidden />
              <span>{copy.pinFuture}</span>
            </div>
          </div>
        </aside>
      </section>

      <section
        aria-labelledby="oxford-location-title"
        className="deep-band -mx-4 overflow-hidden border-y border-border px-4 py-16 sm:-mx-6 sm:px-6 sm:py-20 lg:-mx-8 lg:px-8"
      >
        <div className="mx-auto max-w-5xl">
          <div className="max-w-3xl">
            <div className="mb-4 flex items-center gap-2.5">
              <Navigation size={15} className="text-accent-bright" aria-hidden />
              <span className="font-pixel text-[9px] tracking-[0.28em] text-accent-deep">
                {location.route}
              </span>
            </div>
            <h2
              id="oxford-location-title"
              className="text-3xl font-bold tracking-[-0.035em] text-foreground sm:text-5xl"
            >
              {location.title}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground-muted sm:text-lg">
              {location.description}
            </p>
          </div>

          <div className="relative mt-10 overflow-hidden rounded-[2rem] border border-accent/25 bg-[linear-gradient(135deg,#092c29_0%,#061e1d_58%,#041817_100%)] p-5 shadow-[0_28px_80px_-40px_rgba(126,211,155,0.45)] sm:p-8">
            <div aria-hidden className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

            <div className="relative flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <span className="w-fit rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-accent-bright">
                {location.route}
              </span>
              <p className="text-xs text-foreground-subtle">
                {copy.coordinates}:{' '}
                <strong className="font-mono font-medium text-foreground-muted">{coordinatesLabel}</strong>
              </p>
            </div>

            <div className="relative grid py-7 md:grid-cols-[minmax(0,0.8fr)_minmax(7rem,0.45fr)_minmax(0,1fr)] md:items-center md:py-10">
              <div className="rounded-2xl border border-white/10 bg-black/10 p-5 sm:p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground-subtle">
                  {location.origin}
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full border-2 border-accent-bright bg-[#071f1d] shadow-[0_0_0_6px_rgba(218,241,222,0.08)]" />
                  <div>
                    <p className="text-xl font-bold text-foreground">Uberlândia</p>
                    <p className="mt-0.5 text-sm text-foreground-muted">Brasil</p>
                  </div>
                </div>
              </div>

              <div aria-hidden className="relative flex h-20 items-center justify-center md:h-auto">
                <span className="absolute inset-y-0 left-1/2 border-l border-dashed border-accent/40 md:inset-x-0 md:inset-y-auto md:top-1/2 md:border-l-0 md:border-t" />
                <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-accent/30 bg-[#0a2b28] text-accent-bright shadow-lg">
                  <Navigation size={15} className="rotate-[135deg] md:rotate-45" />
                </span>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-accent/35 bg-accent/[0.09] p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-accent-bright bg-accent text-[#05201e] shadow-[0_0_30px_rgba(218,241,222,0.22)]">
                    <MapPin size={21} aria-hidden />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent-bright">
                      {location.destination}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-foreground">{oxford.name[loc]}</p>
                    <p className="mt-1 text-sm text-foreground-muted">{oxford.country[loc]}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative flex flex-col gap-5 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-foreground-subtle">{location.note}</p>
                <p className="mt-1 text-sm text-foreground-muted">{location.mapNote}</p>
              </div>
              <Link href="/mapa" className="btn-pill-primary shrink-0 text-sm">
                {copy.openMap}
                <ArrowRight size={14} aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
