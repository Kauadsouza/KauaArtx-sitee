import Image from 'next/image';
import { ArrowRight, Camera, Play, Youtube } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { OXFORD_COPY, type OxfordLocale } from '@/data/oxford-page';
import AskNextVideo from './AskNextVideo';

export default function OxfordMedia({ locale, loc }: { locale: string; loc: OxfordLocale }) {
  const copy = OXFORD_COPY[loc];

  return (
    <>
      <section className="mx-auto max-w-5xl py-20">
        <div className="mb-9 max-w-2xl">
          <div className="mb-4 flex items-center gap-2.5">
            <Camera size={15} className="text-accent-bright" aria-hidden />
            <span className="font-pixel text-[9px] tracking-[0.28em] text-accent-deep">
              {copy.photosKicker}
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            {copy.photosTitle}
          </h2>
          <p className="mt-5 leading-relaxed text-foreground-muted">{copy.photosDescription}</p>
        </div>

        <div className="grid gap-5 md:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
          <figure className="overflow-hidden rounded-3xl border border-border bg-surface">
            <div className="relative aspect-[16/10]">
              <Image
                src="/images/oxford-skyline.webp"
                alt={copy.referencePhoto}
                fill
                sizes="(min-width: 768px) 650px, 100vw"
                className="object-cover"
              />
              <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                {copy.referencePhoto}
              </span>
            </div>
            <figcaption className="px-5 py-4 text-xs leading-relaxed text-foreground-subtle">
              Oxford skyline ·{' '}
              <a
                href="https://commons.wikimedia.org/wiki/File:Oxford_skyline.jpg"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-border-strong underline-offset-2 hover:text-foreground"
              >
                WFan
              </a>{' '}
              ·{' '}
              <a
                href="https://creativecommons.org/licenses/by-sa/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-border-strong underline-offset-2 hover:text-foreground"
              >
                CC BY-SA 4.0
              </a>
            </figcaption>
          </figure>

          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-dashed border-border-strong bg-surface/65 p-7 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-surface-elevated text-foreground-muted">
              <Camera size={23} aria-hidden />
            </span>
            <h3 className="mt-5 text-xl font-bold text-foreground">{copy.personalPhotos}</h3>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-foreground-muted">
              {copy.personalPhotosState}
            </p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[2rem] border border-border-strong bg-surface p-6 sm:p-10 lg:p-12">
        <span aria-hidden className="absolute inset-x-0 top-0 h-px hairline-gradient" />
        <div
          aria-hidden
          className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
        />

        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <Youtube size={16} className="text-accent-bright" aria-hidden />
              <span className="font-pixel text-[9px] tracking-[0.28em] text-accent-deep">
                {copy.videoKicker}
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {copy.videoTitle}
            </h2>
            <p className="mt-5 leading-relaxed text-foreground-muted">{copy.videoDescription}</p>

            <div className="mt-8 flex min-h-[230px] flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-background/55 p-6 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-surface-elevated text-foreground-muted">
                <Play size={24} className="ml-1" aria-hidden />
              </span>
              <p className="mt-5 font-semibold text-foreground-muted">{copy.videoPending}</p>
              <a
                href="https://www.youtube.com/@KauaArtx"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-pill-secondary mt-5 text-sm"
              >
                <Youtube size={15} aria-hidden />
                {copy.channel}
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-foreground sm:text-2xl">{copy.futureTitle}</h3>
            <div className="mt-6 space-y-3">
              {copy.futureItems.map(({ title, description, icon: Icon }) => (
                <div
                  key={title}
                  className="grid grid-cols-[auto_1fr] gap-4 rounded-2xl border border-border bg-background/35 p-5"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-elevated text-foreground-muted">
                    <Icon size={19} aria-hidden />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-foreground">{title}</h4>
                      <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground-subtle">
                        {copy.futureState}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-foreground-muted">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <AskNextVideo locale={locale} />

      <footer className="py-20 text-center">
        <p className="font-pixel text-[8px] tracking-[0.25em] text-accent-deep">
          OXFORD → {loc === 'pt' ? 'MUNDO' : 'WORLD'}
        </p>
        <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          {copy.closeTitle}
        </h2>
        <p className="mx-auto mt-5 max-w-xl leading-relaxed text-foreground-muted">
          {copy.closeDescription}
        </p>
        <Link href="/mapa" className="btn-pill-primary mt-8 text-sm">
          {copy.seeMap}
          <ArrowRight size={14} aria-hidden />
        </Link>
      </footer>
    </>
  );
}
