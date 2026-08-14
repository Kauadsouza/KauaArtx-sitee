import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Hero from '@/components/sections/Hero';
import AdventureFeatures from '@/components/sections/AdventureFeatures';
import AdventureSplit from '@/components/sections/AdventureSplit';
import AdventureGrid from '@/components/sections/AdventureGrid';
import AdventureSpotlight from '@/components/sections/AdventureSpotlight';
import LatestYouTube from '@/components/sections/LatestYouTube';
import NowSection from '@/components/sections/NowSection';
import ExploreSection from '@/components/sections/ExploreSection';
import LoginGate from '@/components/gate/LoginGate';
import { getPublishedPosts } from '@/lib/supabase/server';
import { getLatestYouTubeVideo } from '@/lib/youtube';

// Revalida a cada 60s — posts novos aparecem sozinhos
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'hero' });
  return {
    title: `${t('name')} — ${t('role')}`,
    description: t('tagline'),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [posts, latestYouTube] = await Promise.all([
    getPublishedPosts(4),
    getLatestYouTubeVideo(),
  ]);

  return (
    <>
      {/* Portal de entrada estilo game — some depois do primeiro "login" */}
      <LoginGate />
      {/* Hero do Fuji (intocado) + estrutura de aventura espelhada do
          escopo enviado pelo Kauã: features + 2 destaques, split texto/foto,
          grade do blog e bloco de 2 cards + CTA grande. */}
      <Hero />
      <NowSection locale={locale} />
      <AdventureFeatures />
      <AdventureSplit />
      <LatestYouTube locale={locale} state={latestYouTube} />
      <AdventureGrid posts={posts} />
      <ExploreSection locale={locale} />
      <AdventureSpotlight />
    </>
  );
}
