-- ============================================================
-- Formato do conteúdo do post (Markdown ou HTML)
-- Cole este arquivo no SQL Editor do Supabase e clique RUN.
-- Pode rodar mais de uma vez sem problema.
-- ============================================================

alter table public.posts
  add column if not exists content_format text not null default 'markdown';

-- Posts que já existem ficam como 'markdown' (comportamento de sempre).
-- Novo valor possível: 'html' — o post é renderizado como HTML puro,
-- permitindo CSS e JS embutidos direto no conteúdo.
