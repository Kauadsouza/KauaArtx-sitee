-- ============================================================
-- CORREÇÃO DE SEGURANÇA — rode este arquivo no SQL Editor do Supabase
--
-- O problema: as regras antigas davam permissão de escrever no blog pra
-- QUALQUER usuário logado. Isso era ok quando só o Kauã tinha conta —
-- mas o portal de entrada do site agora cria contas reais pra qualquer
-- visitante (email/senha, Google, GitHub). Ou seja: qualquer pessoa
-- cadastrada conseguiria criar/editar/apagar posts.
--
-- A correção: escrever e ver rascunhos passam a ser exclusivos dos
-- emails de admin listados abaixo. Visitantes logados continuam LENDO
-- os posts publicados normalmente (o site precisa disso).
--
-- Se o seu email de admin for outro, é só trocar na lista.
-- ============================================================

-- Ler: publicado é público; rascunho é só do admin
drop policy if exists "admin read all" on public.posts;
create policy "admin read all"
  on public.posts for select
  to authenticated
  using (
    published = true
    or (auth.jwt()->>'email') in ('kauaartx@gmail.com', 'kauadsouza@gmail.com')
  );

-- Criar: só admin
drop policy if exists "admin insert" on public.posts;
create policy "admin insert"
  on public.posts for insert
  to authenticated
  with check (
    (auth.jwt()->>'email') in ('kauaartx@gmail.com', 'kauadsouza@gmail.com')
  );

-- Editar: só admin
drop policy if exists "admin update" on public.posts;
create policy "admin update"
  on public.posts for update
  to authenticated
  using (
    (auth.jwt()->>'email') in ('kauaartx@gmail.com', 'kauadsouza@gmail.com')
  );

-- Excluir: só admin
drop policy if exists "admin delete" on public.posts;
create policy "admin delete"
  on public.posts for delete
  to authenticated
  using (
    (auth.jwt()->>'email') in ('kauaartx@gmail.com', 'kauadsouza@gmail.com')
  );
