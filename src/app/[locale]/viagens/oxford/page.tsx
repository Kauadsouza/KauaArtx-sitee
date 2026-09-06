import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import OxfordMedia from '@/components/travel/OxfordMedia';
import OxfordOverview from '@/components/travel/OxfordOverview';
import { EDITORIAL_POSTS } from '@/data/editorial-posts';
import { OXFORD_COPY, OXFORD_STORY_SLUG, type OxfordLocale } from '@/data/oxford-page';
import { TRAVELS } from '@/data/travels';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const copy = locale === 'en' ? OXFORD_COPY.en : OXFORD_COPY.pt;

  return {
    title: copy.title,
    description: copy.intro,
    openGraph: {
      title: copy.title,
      description: copy.intro,
      type: 'article',
      images: [
        {
          url: '/images/oxford-radcliffe-camera.webp',
          alt: copy.referencePhoto,
        },
      ],
    },
  };
}

export default async function OxfordTravelPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc: OxfordLocale = locale === 'en' ? 'en' : 'pt';
  const oxford = TRAVELS.find((stop) => stop.id === 'oxford');
  const story = EDITORIAL_POSTS.find((post) => post.slug === OXFORD_STORY_SLUG);

  if (!oxford || !story) notFound();

  return (
    <div className="relative min-h-screen overflow-hidden pt-24">
      <div
        aria-hidden
        className="orb right-[-12rem] top-[-8rem] h-[34rem] w-[34rem] bg-accent/12 animate-float-slow"
      />
      <div
        aria-hidden
        className="orb bottom-[20%] left-[-16rem] h-[30rem] w-[30rem] bg-accent-2/20 animate-float-slower"
      />

      <article className="relative mx-auto max-w-6xl px-4 pb-28 sm:px-6 lg:px-8">
        <OxfordOverview loc={loc} />
        <OxfordMedia locale={locale} loc={loc} />
      </article>
    </div>
  );
}
