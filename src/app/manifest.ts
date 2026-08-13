import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kauã Souza — Criador em Oxford',
    short_name: 'Kauã Artx',
    description:
      'Kauã Souza mora em Oxford, constrói o canal @KauaArtx e se prepara para estudar.',
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

