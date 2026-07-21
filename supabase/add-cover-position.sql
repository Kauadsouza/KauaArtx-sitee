-- ============================================================
-- Posição da capa (qual parte da foto aparece no corte 16:9)
-- Cole este arquivo no SQL Editor do Supabase e clique RUN.
-- Pode rodar mais de uma vez sem problema.
-- ============================================================

alter table public.posts
  add column if not exists cover_position text not null default '50% 50%';

-- A capa sempre corta pra 16:9 automaticamente. Esta coluna guarda QUAL
-- parte da foto fica visível (um valor CSS object-position, tipo "50% 30%").
-- Posts que já existem ficam centralizados ('50% 50%').
