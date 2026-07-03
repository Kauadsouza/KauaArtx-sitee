-- ============================================================
-- Blog do Kauã — Schema do Supabase
-- Cole este arquivo inteiro no SQL Editor do Supabase e clique RUN
-- ============================================================

-- Tabela de posts
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null default '',
  cover_url text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Atualiza updated_at automaticamente a cada edição
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- ============================================================
-- SEGURANÇA (Row Level Security)
-- Visitantes só LEEM posts publicados.
-- Só usuário logado (você) pode criar/editar/excluir.
-- ============================================================

alter table public.posts enable row level security;

drop policy if exists "public read published" on public.posts;
create policy "public read published"
  on public.posts for select
  to anon
  using (published = true);

drop policy if exists "admin read all" on public.posts;
create policy "admin read all"
  on public.posts for select
  to authenticated
  using (true);

drop policy if exists "admin insert" on public.posts;
create policy "admin insert"
  on public.posts for insert
  to authenticated
  with check (true);

drop policy if exists "admin update" on public.posts;
create policy "admin update"
  on public.posts for update
  to authenticated
  using (true);

drop policy if exists "admin delete" on public.posts;
create policy "admin delete"
  on public.posts for delete
  to authenticated
  using (true);
