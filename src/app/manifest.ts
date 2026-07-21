import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kauã Souza — Vendedor & Aventureiro',
    short_name: 'Kauã Artx',
    description:
      'Vendedor na Loog.ai e criador no YouTube: eu mostro o caminho pra sair do país, não só conto.',
    start_url: '/',
    display: 'standalone',
    background_color: '#04100a',
    theme_color: '#04100a',
    icons: [
      { src: '/icon.png', sizes: '512x512', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
