import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Hero from '@/components/sections/Hero';
import AdventureFeatures from '@/components/sections/AdventureFeatures';
import AdventureSplit from '@/components/sections/AdventureSplit';
import AdventureGrid from '@/components/sections/AdventureGrid';
import AdventureSpotlight from '@/components/sections/AdventureSpotlight';
import LoginGate from '@/components/gate/LoginGate';
import { getPublishedPosts } from '@/lib/supabase/server';

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

export default async function HomePage() {
  const posts = await getPublishedPosts(4);

  return (
    <>
      {/* Portal de entrada estilo game — some depois do primeiro "login" */}
      <LoginGate />
      {/* Hero do Fuji (intocado) + estrutura de aventura espelhada do
          escopo enviado pelo Kauã: features + 2 destaques, split texto/foto,
          grade do blog e bloco de 2 cards + CTA grande. */}
      <Hero />
      <AdventureFeatures />
      <AdventureSplit />
      <AdventureGrid posts={posts} />
      <AdventureSpotlight />
    </>
  );
}
