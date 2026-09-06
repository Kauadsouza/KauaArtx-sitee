import { ArrowUpRight, Clock3 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { getBlogMeta } from '@/data/blog-curation';
import { estimateReadingMinutes } from '@/lib/blog-reading';
import { formatDate } from '@/lib/utils';
import type { Post } from '@/lib/supabase/types';
import PostCover from './PostCover';

interface BlogCardProps {
  post: Post;
  locale: string;
  featured?: boolean;
  priority?: boolean;
}

export default function BlogCard({ post, locale, featured = false, priority = false }: BlogCardProps) {
  const meta = getBlogMeta(post);
  const dateLocale = locale === 'pt' ? 'pt-BR' : 'en-US';
  const date = formatDate(new Date(post.updated_at), dateLocale);
  const readingMinutes = estimateReadingMinutes(post.content);

  return (
    <article
      className={`group relative isolate overflow-hidden rounded-3xl border border-border bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-border-strong ${
        featured ? 'min-h-[480px] lg:min-h-[680px]' : 'min-h-[330px]'
      }`}
    >
      <PostCover
        src={post.cover_url}
        position={post.cover_position}
        priority={priority}
        className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-[1.035]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-[#03110f] via-[#03110f]/68 to-[#03110f]/10"
      />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(120deg,rgba(142,182,155,0.12),transparent_45%)]" />

      <Link
        href={`/blog/${post.slug}`}
        aria-label={post.title}
        className="absolute inset-0 z-10 rounded-3xl"
      />

      <div className="absolute inset-0 z-[1] flex flex-col justify-between p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-black/35 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            {meta.kind === 'news' && <span aria-hidden className="mr-2 h-1.5 w-1.5 rounded-full bg-[#F5C97B]" />}
            {meta.badge}
          </span>
          <ArrowUpRight size={18} className="text-white/70 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>

        <div className="mt-auto pt-24">
          <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium uppercase tracking-[0.16em] text-white/85">
            <span>{post.category ?? (meta.kind === 'story' ? 'História' : 'Guia')}</span>
            <span aria-hidden>·</span>
            <span>{date}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1 normal-case tracking-normal">
              <Clock3 size={12} aria-hidden />
              {readingMinutes} min
            </span>
          </div>
          <h2 className={`${featured ? 'text-3xl sm:text-4xl' : 'text-2xl'} max-w-3xl font-bold leading-tight tracking-tight text-white`}>
            {post.title}
          </h2>
          {post.excerpt && (
            <p className={`mt-4 max-w-2xl leading-relaxed text-white/85 ${featured ? 'text-base' : 'line-clamp-3 text-sm'}`}>
              {post.excerpt}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
