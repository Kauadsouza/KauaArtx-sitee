import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/layout/PageTransition';
import BootSequence from '@/components/animations/BootSequence';
import CustomCursor from '@/components/animations/CustomCursor';
import CircuitBackground from '@/components/animations/CircuitBackground';
import CommandPalette from '@/components/commands/CommandPalette';

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'hero' });

  return {
    title: {
      default: `${t('name')} — ${t('role')}`,
      template: `%s | ${t('name')}`,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'pt' | 'en' | 'es')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {/* Background em todas as páginas */}
      <CircuitBackground />

      <BootSequence />
      <CustomCursor />
      <CommandPalette />
      <Header locale={locale} />

      {/* z-10 garante que o conteúdo fica acima do canvas */}
      <main className="relative z-10 min-h-screen">
        <PageTransition>{children}</PageTransition>
      </main>

      <Footer />
    </NextIntlClientProvider>
  );
}
