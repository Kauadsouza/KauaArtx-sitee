import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Hero from '@/components/sections/Hero';
import TerminalSection from '@/components/sections/TerminalSection';
import StatsSection from '@/components/sections/StatsSection';
import FeaturedProjects from '@/components/sections/FeaturedProjects';
import TechStack from '@/components/sections/TechStack';
import CTASection from '@/components/sections/CTASection';
import ParticleGrid from '@/components/animations/ParticleGrid';

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

export default function HomePage() {
  return (
    <div className="relative">
      <ParticleGrid />
      <div className="relative z-10">
        <Hero />
        <TerminalSection />
        <StatsSection />
        <FeaturedProjects />
        <TechStack />
        <CTASection />
      </div>
    </div>
  );
}
