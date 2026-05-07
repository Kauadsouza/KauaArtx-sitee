# Portfolio Kauã Souza — Setup Guide

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS v4** + utilitários customizados
- **Framer Motion** — todas as animações
- **next-intl** — i18n PT / EN / ES
- **Resend** — formulário de contato
- **Lucide Icons** — ícones

## Requisitos

- Node.js 18+
- npm 9+
- Conta no [Resend](https://resend.com) (gratuita para até 3.000 emails/mês)

---

## Variáveis de Ambiente

Copie `.env.local` e preencha:

```env
# Obtenha em resend.com/api-keys
RESEND_API_KEY=re_xxxxxxxxxxxx

# Seu username do GitHub (já preenchido)
NEXT_PUBLIC_GITHUB_USERNAME=Kauadsouza
```

---

## Como Rodar Localmente

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Build de Produção

```bash
npm run build
npm run start
```

---

## Deploy na Vercel

1. Conecte o repositório `Site-Kauadsouza` na Vercel
2. Vá em **Settings → Environment Variables** e adicione:
   - `RESEND_API_KEY` = sua chave do Resend
3. Deploy automático em cada push para `main`

---

## Como Editar Conteúdo

### Página `/now`
Edite diretamente em [src/app/[locale]/now/page.tsx](src/app/[locale]/now/page.tsx).
O array `NOW_DATA` contém as 4 seções. Troque os items quando quiser.
Atualize também a data no texto `"atualizado em..."`.

### Projetos (case studies)
Edite [src/lib/projects.ts](src/lib/projects.ts).
Cada projeto tem: `overview`, `problem`, `solution`, `stack`, `lessons`, `nextSteps`.

### Textos / Traduções
- Português: [messages/pt.json](messages/pt.json)
- Inglês: [messages/en.json](messages/en.json)
- Espanhol: [messages/es.json](messages/es.json)

### Blog (MDX)
Crie arquivos em `src/content/blog/`:

```
src/content/blog/
  meu-primeiro-post.mdx
  construindo-o-the-kaden.mdx
```

Frontmatter sugerido:
```mdx
---
title: "Meu primeiro post"
date: "2026-05-07"
tags: ["tech", "startup"]
description: "Uma breve descrição para SEO."
---

Conteúdo em Markdown aqui.
```

Depois implemente o loader em `src/app/[locale]/blog/[slug]/page.tsx`.

---

## Easter Eggs

| Ação | Resultado |
|------|-----------|
| `Ctrl + K` / `Cmd + K` | Abre o Command Palette |
| Clica em **[sudo]** no terminal da Home | Abre terminal interativo full-screen |
| Digite `matrix` no terminal interativo | Efeito Matrix por 5 segundos |
| 1ª visita ao site | Boot sequence estilo Linux |

---

## Estrutura de Pastas

```
src/
  app/
    [locale]/          → Páginas com suporte a i18n
      page.tsx         → Home
      about/           → Sobre
      projects/        → Lista + case studies
      now/             → Página /now
      blog/            → Blog (MDX)
      contact/         → Formulário + redes
      faq/             → Perguntas frequentes
    api/
      contact/         → POST → envia email via Resend
      github-stats/    → GET → stats do GitHub (cache 1h)
  components/
    layout/            → Header, Footer
    sections/          → Hero, Terminal, Stats, etc.
    animations/        → BootSequence, CustomCursor, ParticleGrid
    commands/          → CommandPalette, InteractiveTerminal
  lib/
    projects.ts        → Dados dos case studies
    utils.ts           → Funções utilitárias
  i18n/
    routing.ts         → Configuração de locales
    request.ts         → Loader de mensagens
messages/
  pt.json / en.json / es.json
```
