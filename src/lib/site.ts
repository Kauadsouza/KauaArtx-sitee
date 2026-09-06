// URL canônica do site.
// Na Vercel, VERCEL_PROJECT_PRODUCTION_URL aponta pro domínio de produção;
// NEXT_PUBLIC_SITE_URL permite fixar um domínio próprio quando houver.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');

export const SITE_NAME = 'Kauã Souza';
export const SITE_BRAND = 'Site KauaArtx';

export const SOCIAL_PROFILES = [
  'https://www.youtube.com/@KauaArtx',
  'https://www.instagram.com/kauaartx/',
  'https://www.linkedin.com/in/kauadsouza/',
  'https://x.com/KauaArtx',
];
