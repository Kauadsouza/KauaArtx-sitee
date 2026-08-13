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
  'Kauã Souza mora em Oxford, constrói o canal @KauaArtx e se prepara para estudar.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Criador em Oxford`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  keywords: [
    'Kauã Souza', 'Oxford', 'YouTube', 'KauaArtx', 'Criador de conteúdo',
    'Estudos', 'Inglaterra', 'Crescimento pessoal',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    alternateLocale: 'en_US',
    url: SITE_URL,
    title: `${SITE_NAME} — Criador em Oxford`,
    description: DESCRIPTION,
    siteName: SITE_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Criador em Oxford`,
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

