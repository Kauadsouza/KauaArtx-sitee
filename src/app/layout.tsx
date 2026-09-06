import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Press_Start_2P } from 'next/font/google';
import { SITE_URL, SITE_NAME, SOCIAL_PROFILES } from '@/lib/site';
import './globals.css';

const pixelFont = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel',
  display: 'swap',
});

const DESCRIPTION =
  'Viagens, histórias e vida real no canal @KauaArtx.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Viagens e vida real`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  keywords: [
    'Kauã Souza', 'Viagens', 'YouTube', 'KauaArtx', 'Criador de conteúdo',
    'Inglaterra', 'Mundo', 'Histórias de viagem',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  // Anuncia o feed RSS: leitor de feed e agregador acham sozinhos
  alternates: {
    types: { 'application/rss+xml': [{ url: '/feed.xml', title: `${SITE_NAME} — blog` }] },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    alternateLocale: 'en_US',
    url: SITE_URL,
    title: `${SITE_NAME} — Viagens e vida real`,
    description: DESCRIPTION,
    siteName: SITE_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Viagens e vida real`,
    description: DESCRIPTION,
    creator: '@KauaArtx',
  },
  robots: { index: true, follow: true },
};

// Dados estruturados: ajuda Google a entender quem é o Kauã
const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: SITE_NAME,
  url: SITE_URL,
  image: `${SITE_URL}/images/kaua-pixel.png`,
  jobTitle: 'Criador de conteúdo',
  sameAs: SOCIAL_PROFILES,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt"
      className={`${GeistSans.variable} ${GeistMono.variable} ${pixelFont.variable}`}
    >
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </body>
    </html>
  );
}
