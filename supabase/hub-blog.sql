-- Blog do Kauã no mesmo Supabase privado usado pelo ARTX Hub.
-- Idempotente: pode ser executado novamente com segurança.

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null default '',
  cover_url text,
  cover_position text not null default '50% 50%',
  category text,
  content_format text not null default 'markdown',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts add column if not exists cover_position text not null default '50% 50%';
alter table public.posts add column if not exists category text;
alter table public.posts add column if not exists content_format text not null default 'markdown';

alter table public.posts drop constraint if exists posts_title_length;
alter table public.posts add constraint posts_title_length check (char_length(title) between 1 and 200);
alter table public.posts drop constraint if exists posts_slug_format;
alter table public.posts add constraint posts_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) <= 220);
alter table public.posts drop constraint if exists posts_excerpt_length;
alter table public.posts add constraint posts_excerpt_length check (excerpt is null or char_length(excerpt) <= 600);
alter table public.posts drop constraint if exists posts_content_length;
alter table public.posts add constraint posts_content_length check (octet_length(content) <= 2097152);
alter table public.posts drop constraint if exists posts_cover_url_length;
alter table public.posts add constraint posts_cover_url_length check (cover_url is null or char_length(cover_url) <= 2048);
alter table public.posts drop constraint if exists posts_cover_position_format;
alter table public.posts add constraint posts_cover_position_format check (cover_position ~ '^(left|center|right|[0-9]{1,3}%) (top|center|bottom|[0-9]{1,3}%)$');
alter table public.posts drop constraint if exists posts_category_length;
alter table public.posts add constraint posts_category_length check (category is null or char_length(category) <= 80);
alter table public.posts drop constraint if exists posts_content_format_allowed;
alter table public.posts add constraint posts_content_format_allowed check (content_format in ('markdown', 'html'));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at before update on public.posts
for each row execute function public.set_updated_at();

alter table public.posts enable row level security;
alter table public.posts force row level security;

drop policy if exists "public read published" on public.posts;
drop policy if exists "authenticated read published" on public.posts;
drop policy if exists "admin read all" on public.posts;
drop policy if exists "admin insert" on public.posts;
drop policy if exists "admin update" on public.posts;
drop policy if exists "admin delete" on public.posts;

create policy "public read published" on public.posts
for select to anon using (published = true);

create policy "authenticated read published" on public.posts
for select to authenticated using (
  published = true or lower(coalesce(auth.jwt() ->> 'email', '')) = 'kauaartx@gmail.com'
);

create policy "admin insert" on public.posts
for insert to authenticated with check (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'kauaartx@gmail.com'
);

create policy "admin update" on public.posts
for update to authenticated using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'kauaartx@gmail.com'
) with check (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'kauaartx@gmail.com'
);

create policy "admin delete" on public.posts
for delete to authenticated using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'kauaartx@gmail.com'
);

revoke all on public.posts from anon, authenticated;
grant select on public.posts to anon;
grant select, insert, update, delete on public.posts to authenticated;

create index if not exists posts_published_created_idx on public.posts (published, created_at desc);

-- Os dois perfis antigos estavam vazios e idênticos. Preserva a linha antiga
-- como arquivo e deixa apenas Kauã como perfil ativo.
update public.hub_app_state
set profile = 'archive/kaua-empty-20260904'
where app = 'study' and profile = 'kaua'
  and payload = '{"sessions":[],"srsCards":[],"englishEngine":[],"englishProgress":[],"generatedContent":[]}'::jsonb;

