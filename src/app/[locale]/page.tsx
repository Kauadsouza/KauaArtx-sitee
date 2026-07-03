import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Hero from '@/components/sections/Hero';
import WhatIDo from '@/components/sections/WhatIDo';
import YouTubeSection from '@/components/sections/YouTubeSection';
import LatestPosts from '@/components/sections/LatestPosts';
import CTASection from '@/components/sections/CTASection';
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
  const posts = await getPublishedPosts(3);

  return (
    <>
      <Hero />
      <WhatIDo />
      <YouTubeSection />
      <LatestPosts posts={posts} />
      <CTASection />
    </>
  );
}
