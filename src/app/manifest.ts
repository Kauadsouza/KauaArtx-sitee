import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kauã Souza — Viagens e vida real',
    short_name: 'Kauã Artx',
    description:
      'Viagens, histórias e vida real no canal @KauaArtx.',
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
