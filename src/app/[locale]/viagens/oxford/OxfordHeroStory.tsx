import Image from 'next/image';
import { ArrowRight, BookOpen, Check, Clock3, MapPin } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { TravelStop } from '@/data/travels';
import type { Post } from '@/lib/supabase/types';
import type { OxfordCopy, OxfordLocale } from './copy';

export default function OxfordHeroStory({
  copy,
  loc,
  oxford,
  story,
}: {
  copy: OxfordCopy;
  loc: OxfordLocale;
  oxford: TravelStop;
  story: Post;
}) {
  return (
    <>
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
              <MapPin size={13} />
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
          <div
            key={label}
            className="glass-strong flex items-center gap-4 rounded-2xl p-5 shadow-xl"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent-bright">
              <Icon size={19} />
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
            <BookOpen size={16} className="text-accent-bright" />
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
            <ArrowRight
              size={15}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        <aside className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 sm:p-8">
          <span aria-hidden className="absolute inset-x-0 top-0 h-px hairline-gradient" />
          <div className="flex items-center gap-2 text-accent-bright">
            <Clock3 size={15} />
            <span className="font-pixel text-[8px] tracking-[0.22em]">
              {loc === 'pt' ? 'AGORA' : 'NOW'}
            </span>
          </div>
          <p className="mt-5 text-2xl font-bold text-foreground">
            {oxford.name[loc]}, {oxford.country[loc]}
          </p>
          <p className="mt-3 leading-relaxed text-foreground-muted">
            {oxford.note?.[loc]}
          </p>
          <div className="mt-7 space-y-3 border-t border-border pt-6 text-sm text-foreground-muted">
            <div className="flex items-start gap-3">
              <Check size={16} className="mt-0.5 shrink-0 text-accent-bright" />
              <span>{copy.pinLinked}</span>
            </div>
            <div className="flex items-start gap-3">
              <Clock3 size={16} className="mt-0.5 shrink-0 text-foreground-subtle" />
              <span>{copy.pinFuture}</span>
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
