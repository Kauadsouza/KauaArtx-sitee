import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { EDITORIAL_POSTS, getEditorialPostBySlug } from '@/data/editorial-posts';
import type { Post } from './types';

// Cliente público (somente leitura via RLS) para páginas do site.
// Não usa cookies — as páginas públicas podem ser cacheadas/ISR.
function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// O banco continua sendo a fonte dos posts criados no painel. Os relatos
// editoriais locais entram junto, sem apagar ou esconder nenhum post existente.
// Se um dia um relato com o mesmo slug for criado no painel, a versão do banco
// assume o lugar da local e pode ser editada normalmente por lá.
function mergePublishedPosts(databasePosts: Post[]): Post[] {
  const bySlug = new Map<string, Post>();

  for (const post of EDITORIAL_POSTS) {
    if (post.published) bySlug.set(post.slug, post);
  }
  for (const post of databasePosts) {
    bySlug.set(post.slug, post);
  }

  return [...bySlug.values()].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getPublishedPosts(limit?: number): Promise<Post[]> {
  const supabase = createPublicClient();
  if (!supabase) {
    const posts = mergePublishedPosts([]);
    return limit ? posts.slice(0, limit) : posts;
  }
  // select('*'): resiliente a colunas novas (ex.: cover_position) — o blog
  // não quebra se uma migração ainda não foi rodada; o campo só vem vazio.
  let query = supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  const posts = mergePublishedPosts(error ? [] : (data ?? []));
  return limit ? posts.slice(0, limit) : posts;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = createPublicClient();
  const editorialPost = getEditorialPostBySlug(slug);
  if (!supabase) return editorialPost;
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();
  if (error || !data) return editorialPost;
  return data;
}
