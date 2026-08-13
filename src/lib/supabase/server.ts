import { createClient as createSupabaseClient } from '@supabase/supabase-js';
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

function isLegacyNomadSlug(slug: string) {
  return /nomade|visto-remoto|visto-d8/i.test(slug);
}

export async function getPublishedPosts(limit?: number): Promise<Post[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  // select('*'): resiliente a colunas novas (ex.: cover_position) — o blog
  // não quebra se uma migração ainda não foi rodada; o campo só vem vazio.
  const query = supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });
  const { data, error } = await query;
  if (error) return [];
  const currentPosts = (data ?? []).filter((post) => !isLegacyNomadSlug(post.slug));
  return limit ? currentPosts.slice(0, limit) : currentPosts;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (isLegacyNomadSlug(slug)) return null;
  const supabase = createPublicClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();
  if (error) return null;
  return data;
}
