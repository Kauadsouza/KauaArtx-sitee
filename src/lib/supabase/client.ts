'use client';

import { createBrowserClient } from '@supabase/ssr';

// Cliente para uso no navegador (painel admin).
// Retorna null se o Supabase ainda não foi configurado nas variáveis de ambiente.
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}
