import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://kauadsouzaal.vercel.app'),
  title: {
    default: 'Kauã Souza — Vendedor & Empreendedor',
    template: '%s | Kauã Souza',
  },
  description:
    'Vendedor na Loog.ai, CEO do Facility e criador de conteúdo no YouTube sobre viagens e crescimento pessoal. Uberlândia, Brasil.',
  keywords: [
    'Kauã Souza', 'Vendedor', 'Empreendedor', 'Facility',
    'Loog.ai', 'YouTube', 'Viagens', 'Crescimento pessoal',
    'Uberlândia', 'Brasil',
  ],
  authors: [{ name: 'Kauã Souza' }],
  creator: 'Kauã Souza',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://kauadsouzaal.vercel.app',
    title: 'Kauã Souza — Vendedor & Empreendedor',
    description:
      'Vendedor na Loog.ai, CEO do Facility e criador de conteúdo sobre viagens e crescimento pessoal.',
    siteName: 'Kauã Souza',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kauã Souza — Vendedor & Empreendedor',
    description:
      'Vendedor, CEO do Facility e criador de conteúdo sobre viagens e crescimento. Uberlândia, Brasil.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
