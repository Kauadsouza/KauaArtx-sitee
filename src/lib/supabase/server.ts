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

export async function getPublishedPosts(limit?: number): Promise<Post[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  // select('*'): resiliente a colunas novas (ex.: cover_position) — o blog
  // não quebra se uma migração ainda não foi rodada; o campo só vem vazio.
  let query = supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) return [];
  return data ?? [];
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
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
