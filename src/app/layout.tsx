import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Press_Start_2P, Dancing_Script } from 'next/font/google';
import { SITE_URL, SITE_NAME, SOCIAL_PROFILES } from '@/lib/site';
import './globals.css';

const pixelFont = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel',
  display: 'swap',
});

// Cursiva do card de login (o "Sign Up" manuscrito da referência)
const scriptFont = Dancing_Script({
  weight: '600',
  subsets: ['latin'],
  variable: '--font-script',
  display: 'swap',
});

const DESCRIPTION =
  'Vendedor na Loog.ai, CEO do Facility e aventureiro documentando a jornada pelo mundo.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Vendedor & Aventureiro`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  keywords: [
    'Kauã Souza', 'Vendedor', 'Aventureiro', 'Empreendedor', 'Facility',
    'Loog.ai', 'YouTube', 'Viagens', 'Crescimento pessoal',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    alternateLocale: 'en_US',
    url: SITE_URL,
    title: `${SITE_NAME} — Vendedor & Aventureiro`,
    description: DESCRIPTION,
    siteName: SITE_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Vendedor & Aventureiro`,
    description:
      'Vendedor, CEO do Facility e aventureiro documentando a jornada pelo mundo.',
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
  jobTitle: 'Vendedor & Aventureiro',
  worksFor: { '@type': 'Organization', name: 'Loog.ai' },
  sameAs: SOCIAL_PROFILES,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt"
      className={`${GeistSans.variable} ${GeistMono.variable} ${pixelFont.variable} ${scriptFont.variable}`}
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
