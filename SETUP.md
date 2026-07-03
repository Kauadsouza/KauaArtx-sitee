# Site pessoal — Kauã Souza

Site sobre o Kauã: vendedor na Loog.ai, CEO do Facility e criador de conteúdo
no YouTube sobre viagens e crescimento pessoal.

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS v4** — design claro com verde vivo + laranja
- **Framer Motion** — animações
- **next-intl** — PT / EN
- **Supabase** — blog + login do painel admin
- **Resend** — formulário de contato

## Páginas

| Rota | O que é |
|------|---------|
| `/` | Home: quem é o Kauã, o que faz, YouTube e últimos posts |
| `/about` | História, jornada e valores |
| `/blog` | Posts publicados (vêm do Supabase) |
| `/blog/[slug]` | Página de cada post |
| `/contact` | Formulário + redes sociais |
| `/admin` | Painel do blog (precisa de login) |

## Variáveis de ambiente

```env
# Formulário de contato — resend.com/api-keys
RESEND_API_KEY=re_xxxxxxxxxxxx

# Blog + admin — veja SETUP-SUPABASE.md
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
```

## Como rodar localmente

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Blog / Admin

Siga o **[SETUP-SUPABASE.md](SETUP-SUPABASE.md)** (passo a passo completo).
Depois é só acessar `/admin`, logar e postar.

## Como editar conteúdo

- **Textos do site**: [messages/pt.json](messages/pt.json) e [messages/en.json](messages/en.json)
- **Links de redes sociais**: `src/components/layout/Footer.tsx` e `src/app/[locale]/contact/page.tsx`
- **Posts do blog**: pelo painel `/admin` (não precisa mexer em código)

## Deploy

Push na branch `main` → a Vercel faz o deploy automático.
