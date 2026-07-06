import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Press_Start_2P } from 'next/font/google';
import './globals.css';

const pixelFont = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://kauadsouzaal.vercel.app'),
  title: {
    default: 'Kauã Souza — Vendedor & Aventureiro',
    template: '%s | Kauã Souza',
  },
  description:
    'Vendedor na Loog.ai, CEO do Facility e aventureiro documentando a jornada pelo mundo.',
  keywords: [
    'Kauã Souza', 'Vendedor', 'Aventureiro', 'Empreendedor', 'Facility',
    'Loog.ai', 'YouTube', 'Viagens', 'Crescimento pessoal',
  ],
  authors: [{ name: 'Kauã Souza' }],
  creator: 'Kauã Souza',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://kauadsouzaal.vercel.app',
    title: 'Kauã Souza — Vendedor & Aventureiro',
    description:
      'Vendedor na Loog.ai, CEO do Facility e aventureiro documentando a jornada pelo mundo.',
    siteName: 'Kauã Souza',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kauã Souza — Vendedor & Aventureiro',
    description:
      'Vendedor, CEO do Facility e aventureiro documentando a jornada pelo mundo.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt"
      className={`${GeistSans.variable} ${GeistMono.variable} ${pixelFont.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
