import type { Post } from '@/lib/supabase/types';

export type BlogKind = 'story' | 'guide' | 'news';

export interface BlogMeta {
  kind: BlogKind;
  badge: string;
  archive?: boolean;
  coverCredit?: {
    author: string;
    sourceUrl: string;
    license: string;
  };
}

const FEATURED_SLUGS = [
  'checklist-real-para-comecar-a-viajar-e-trabalhar-remoto',
  'ees-e-etias-o-que-muda-na-europa-em-2026',
  'oxford-o-primeiro-ponto-do-meu-mapa',
] as const;

const CURATION: Record<string, Partial<BlogMeta>> = {
  'oxford-o-primeiro-ponto-do-meu-mapa': {
    kind: 'story',
    badge: 'Relato real',
  },
  'checklist-real-para-comecar-a-viajar-e-trabalhar-remoto': {
    kind: 'guide',
    badge: 'Comece por aqui',
    coverCredit: {
      author: 'Mikhail Mamaev',
      sourceUrl: 'https://unsplash.com/photos/yellow-backpack-on-a-bench-at-a-train-station-afU18qSLMcE',
      license: 'Unsplash License',
    },
  },
  'uk-eta-para-brasileiros-o-que-mudou-em-2026': {
    kind: 'news',
    badge: 'Em vigor',
    coverCredit: {
      author: 'Valentin Lacoste',
      sourceUrl: 'https://unsplash.com/photos/people-in-airport-waiting-area-with-departure-board-Ge_zO-UXwdo',
      license: 'Unsplash License',
    },
  },
  'ees-e-etias-o-que-muda-na-europa-em-2026': {
    kind: 'news',
    badge: 'Atualizado',
    coverCredit: {
      author: 'Oxana Melis',
      sourceUrl: 'https://unsplash.com/photos/a-passport-and-a-boarding-pass-are-on-a-bag-LVA3S6isNYQ',
      license: 'Unsplash License',
    },
  },
  'trabalho-remoto-como-visitante-no-reino-unido': {
    kind: 'news',
    badge: 'Regra atual',
    coverCredit: {
      author: 'Julio Lopez',
      sourceUrl: 'https://unsplash.com/photos/woman-working-on-laptop-with-city-view-WbGrqnS_t3k',
      license: 'Unsplash License',
    },
  },
};

const ARCHIVE_SLUGS = new Set([
  'impostos-do-nomade-digital',
  'paises-com-visto-de-nomade-digital',
  'visto-nomade-digital-espanha',
  'visto-remoto-dubai',
  'visto-d8-portugal',
  'estonia-e-residency',
  'nomade-digital-america-latina',
  'novos-vistos-italia-indonesia',
  'a-revolucao-dos-nomades-digitais-o-estilo-de-vida-que-esta-mudando-o-mercado-de-trabalho',
]);

const COVER_OVERRIDES: Record<string, Pick<Post, 'cover_url' | 'cover_position'>> = {
  'impostos-do-nomade-digital': {
    cover_url: '/images/travel-remote-work.webp',
    cover_position: '50% 45%',
  },
  'paises-com-visto-de-nomade-digital': {
    cover_url: '/images/travel-passport.webp',
    cover_position: '52% 52%',
  },
  'visto-nomade-digital-espanha': {
    cover_url: '/images/travel-train.webp',
    cover_position: '58% 50%',
  },
  'visto-remoto-dubai': {
    cover_url: '/images/travel-airport.webp',
    cover_position: '50% 42%',
  },
  'visto-d8-portugal': {
    cover_url: '/images/travel-backpack.webp',
    cover_position: '61% 64%',
  },
  'estonia-e-residency': {
    cover_url: '/images/travel-remote-work.webp',
    cover_position: '50% 45%',
  },
  'nomade-digital-america-latina': {
    cover_url: '/images/travel-backpack.webp',
    cover_position: '61% 64%',
  },
  'novos-vistos-italia-indonesia': {
    cover_url: '/images/travel-airport.webp',
    cover_position: '50% 42%',
  },
  'a-revolucao-dos-nomades-digitais-o-estilo-de-vida-que-esta-mudando-o-mercado-de-trabalho': {
    cover_url: '/images/travel-train.webp',
    cover_position: '58% 50%',
  },
};

const SHARED_CREDITS: Record<string, BlogMeta['coverCredit']> = {
  '/images/travel-passport.webp': {
    author: 'Oxana Melis',
    sourceUrl: 'https://unsplash.com/photos/a-passport-and-a-boarding-pass-are-on-a-bag-LVA3S6isNYQ',
    license: 'Unsplash License',
  },
  '/images/travel-airport.webp': {
    author: 'Valentin Lacoste',
    sourceUrl: 'https://unsplash.com/photos/people-in-airport-waiting-area-with-departure-board-Ge_zO-UXwdo',
    license: 'Unsplash License',
  },
  '/images/travel-remote-work.webp': {
    author: 'Julio Lopez',
    sourceUrl: 'https://unsplash.com/photos/woman-working-on-laptop-with-city-view-WbGrqnS_t3k',
    license: 'Unsplash License',
  },
  '/images/travel-backpack.webp': {
    author: 'Mikhail Mamaev',
    sourceUrl: 'https://unsplash.com/photos/yellow-backpack-on-a-bench-at-a-train-station-afU18qSLMcE',
    license: 'Unsplash License',
  },
  '/images/travel-train.webp': {
    author: 'viktor rejent',
    sourceUrl: 'https://unsplash.com/photos/view-from-a-train-window-showing-blurred-landscape-z4E3lpdl0Zk',
    license: 'Unsplash License',
  },
};

export function applyBlogCuration(post: Post): Post {
  const cover = COVER_OVERRIDES[post.slug];
  return cover ? { ...post, ...cover } : post;
}

export function getBlogMeta(post: Post): BlogMeta {
  const curated = CURATION[post.slug];
  const kind = curated?.kind ?? inferKind(post);
  const archive = curated?.archive ?? ARCHIVE_SLUGS.has(post.slug);
  const coverCredit =
    curated?.coverCredit ?? (post.cover_url ? SHARED_CREDITS[post.cover_url] : undefined);

  return {
    kind,
    badge: curated?.badge ?? (archive ? 'Guia do arquivo' : labelForKind(kind)),
    archive,
    coverCredit,
  };
}

export function sortCuratedPosts(posts: Post[]): Post[] {
  const rank = new Map<string, number>(
    FEATURED_SLUGS.map((slug, index) => [slug, index])
  );
  return [...posts].sort((a, b) => {
    const aRank = rank.get(a.slug) ?? Number.MAX_SAFE_INTEGER;
    const bRank = rank.get(b.slug) ?? Number.MAX_SAFE_INTEGER;
    if (aRank !== bRank) return aRank - bRank;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
}

export function getFeaturedPosts(posts: Post[]): Post[] {
  const bySlug = new Map(posts.map((post) => [post.slug, post]));
  return FEATURED_SLUGS.map((slug) => bySlug.get(slug)).filter(
    (post): post is Post => Boolean(post)
  );
}

function inferKind(post: Post): BlogKind {
  if (post.category === 'Notícias') return 'news';
  if (post.category === 'Viagem' || post.category === 'Histórias') return 'story';
  return 'guide';
}

function labelForKind(kind: BlogKind): string {
  if (kind === 'story') return 'História';
  if (kind === 'news') return 'Notícia';
  return 'Guia';
}
