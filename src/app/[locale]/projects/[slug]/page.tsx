import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { getProject, getAllSlugs } from '@/lib/projects';
import CaseStudyClient from './CaseStudyClient';

export async function generateStaticParams() {
  const locales = ['pt', 'en', 'es'];
  const slugs = getAllSlugs();
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const project = getProject(slug);
  if (!project) return {};
  await getTranslations({ locale, namespace: 'case_study' });
  return {
    title: project.name,
    description: project.tagline,
  };
}

export default async function ProjectSlugPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return <CaseStudyClient project={project} />;
}
