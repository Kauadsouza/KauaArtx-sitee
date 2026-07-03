# Como ativar o Blog + Painel Admin (passo a passo)

O site já está no ar, mas o blog e o painel admin precisam do **Supabase**
(banco de dados gratuito). Siga os passos abaixo **uma única vez** — leva uns 10 minutos.

---

## Passo 1 — Criar a conta e o projeto

1. Acesse [supabase.com](https://supabase.com) e clique em **Start your project**
2. Entre com sua conta do GitHub ou Google
3. Clique em **New project**
4. Preencha:
   - **Name**: `site-kaua` (ou qualquer nome)
   - **Database Password**: crie uma senha forte e **guarde ela** (não vai precisar no dia a dia)
   - **Region**: `South America (São Paulo)`
5. Clique em **Create new project** e espere uns 2 minutos

## Passo 2 — Criar a tabela do blog

1. No menu lateral do Supabase, clique em **SQL Editor**
2. Abra o arquivo `supabase/schema.sql` deste projeto, copie **tudo**
3. Cole no SQL Editor e clique em **Run**
4. Deve aparecer "Success. No rows returned" — perfeito ✅

## Passo 3 — Criar SEU usuário de admin

1. No menu lateral, clique em **Authentication** → aba **Users**
2. Clique em **Add user** → **Create new user**
3. Coloque **seu email** e uma **senha forte** (essa é a senha que você vai usar pra entrar no painel `/admin`)
4. Marque **Auto Confirm User** e crie

## Passo 4 — BLOQUEAR cadastro de estranhos (importante!)

Isso garante que **ninguém além de você** consiga criar conta:

1. Ainda em **Authentication**, vá em **Sign In / Up** (ou "Providers")
2. Em **Email**, **desative** a opção **Allow new users to sign up**
3. Salve

## Passo 5 — Pegar as chaves

1. No menu lateral, clique em **Project Settings** (engrenagem) → **API**
2. Copie dois valores:
   - **Project URL** (algo como `https://abcdefg.supabase.co`)
   - **anon / public key** (um código longo)

## Passo 6 — Colocar as chaves na Vercel

1. Acesse [vercel.com](https://vercel.com) → seu projeto **Site-Kauadsouza**
2. Vá em **Settings** → **Environment Variables**
3. Adicione as duas variáveis:

   | Nome | Valor |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | a Project URL que você copiou |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | a anon key que você copiou |

4. Vá em **Deployments** → nos três pontinhos do último deploy → **Redeploy**

## Pronto! 🎉

- Acesse `seusite.com/admin` → faça login com o email e senha do Passo 3
- Clique em **Novo post**, escreva e marque **Publicar**
- O post aparece no blog do site em até 1 minuto

---

## Sobre a segurança

- O painel `/admin` só abre com login — sem sessão válida, redireciona pro login
- O banco tem **Row Level Security**: visitantes só conseguem LER posts publicados;
  criar/editar/excluir exige estar autenticado como você
- O cadastro de novos usuários fica **desativado** (Passo 4), então só existe a sua conta
- O site envia headers de segurança (anti-clickjacking, HSTS, nosniff etc.)
- O formulário de contato tem limite de envios por IP e escapa qualquer código malicioso

## Se quiser testar no computador (opcional)

Crie um arquivo `.env.local` na raiz do projeto com:

```
NEXT_PUBLIC_SUPABASE_URL=sua_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave
RESEND_API_KEY=sua_chave_do_resend
```

E rode `npm run dev`.
