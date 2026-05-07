import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { ThemeProvider } from 'next-themes';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://kauadsouzaal.vercel.app'),
  title: {
    default: 'Kauã Souza — Full-Stack Developer & Founder',
    template: '%s | Kauã Souza',
  },
  description:
    'Full-Stack Developer & Founder. Co-fundador do The Kaden, criador do CONDOR e da Null Forge. Construindo o futuro da tech brasileira.',
  keywords: [
    'Kauã Souza', 'Full-Stack Developer', 'Founder',
    'Next.js', 'React', 'TypeScript',
    'The Kaden', 'CONDOR', 'Null Forge', 'Uberlândia', 'Brasil',
  ],
  authors: [{ name: 'Kauã Souza', url: 'https://github.com/Kauadsouza' }],
  creator: 'Kauã Souza',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://kauadsouzaal.vercel.app',
    title: 'Kauã Souza — Full-Stack Developer & Founder',
    description: 'Full-Stack Developer & Founder. Co-fundador do The Kaden, criador do CONDOR e da Null Forge.',
    siteName: 'Kauã Souza',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kauã Souza — Full-Stack Developer & Founder',
    description: 'Full-Stack Developer & Founder baseado em Uberlândia, Brasil.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
