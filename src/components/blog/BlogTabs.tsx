import { Link } from '@/i18n/navigation';
import type { BlogKind } from '@/data/blog-curation';

type ActiveTab = 'all' | BlogKind;

interface BlogTabsProps {
  active: ActiveTab;
  locale: string;
}

function tabClass(active: boolean): string {
  return `inline-flex min-h-10 items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
    active
      ? 'border-accent bg-accent text-[color:var(--ink-on-accent)]'
      : 'border-border bg-surface text-foreground-muted hover:border-border-strong hover:text-foreground'
  }`;
}

export default function BlogTabs({ active, locale }: BlogTabsProps) {
  const labels =
    locale === 'pt'
      ? { all: 'Destaques', story: 'Histórias', guide: 'Guias', news: 'Notícias' }
      : { all: 'Highlights', story: 'Stories', guide: 'Guides', news: 'News' };

  return (
    <nav aria-label={locale === 'pt' ? 'Seções do blog' : 'Blog sections'} className="flex flex-wrap gap-2">
      <Link href="/blog" aria-current={active === 'all' ? 'page' : undefined} className={tabClass(active === 'all')}>
        {labels.all}
      </Link>
      <Link
        href={{ pathname: '/blog', query: { tipo: 'historias' } }}
        aria-current={active === 'story' ? 'page' : undefined}
        className={tabClass(active === 'story')}
      >
        {labels.story}
      </Link>
      <Link
        href={{ pathname: '/blog', query: { tipo: 'guias' } }}
        aria-current={active === 'guide' ? 'page' : undefined}
        className={tabClass(active === 'guide')}
      >
        {labels.guide}
      </Link>
      <Link
        href="/blog/noticias"
        aria-current={active === 'news' ? 'page' : undefined}
        className={tabClass(active === 'news')}
      >
        <span aria-hidden className="mr-2 h-1.5 w-1.5 rounded-full bg-[#F5C97B]" />
        {labels.news}
      </Link>
    </nav>
  );
}
