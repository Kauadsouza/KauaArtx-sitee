-- ============================================================
-- Categoria dos posts
-- Cole este arquivo no SQL Editor do Supabase e clique RUN.
-- Pode rodar mais de uma vez sem problema.
-- ============================================================

alter table public.posts
  add column if not exists category text;

-- Posts que já existem ficam com categoria vazia (null). O site
-- mostra eles normalmente, só sem a tarja de categoria — dá pra
-- preencher depois editando cada post no /admin.
