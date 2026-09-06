# Site KauaArtx

The public platform behind [@KauaArtx](https://www.youtube.com/@KauaArtx): a bilingual space for videos, travel stories, practical guides and the ongoing journey of building a new life in Oxford.

[Visit kauaartx.vercel.app](https://kauaartx.vercel.app)

## What the platform includes

- Portuguese and English routes powered by `next-intl`.
- Editorial home page focused on the latest videos and current chapter.
- Blog with articles, curated news and dynamic Open Graph images.
- Interactive world and Brazil travel map built with D3 and TopoJSON.
- Dedicated Oxford travel story and reusable destination components.
- RSS feed, sitemap, robots metadata and structured social previews.
- Private Supabase-backed publishing area for authenticated administration.
- Contact and newsletter integrations with server-side credential handling.
- Responsive navigation designed for both desktop exploration and mobile use.
- Automated data, reading and map regression tests.

## Tech stack

Next.js 15, React 19, TypeScript, next-intl, Supabase, D3/TopoJSON, Framer Motion, Vitest and Vercel.

## Local development

```powershell
npm.cmd install
Copy-Item .env.example .env.local
npm.cmd run dev
```

The public site can run without private publishing credentials. Supabase, email and newsletter capabilities require the relevant variables from `.env.example`.

## Verification

```powershell
npm.cmd run lint
npm.cmd run test
npm.cmd run build
npm.cmd audit --omit=dev
```

## Repository map

```text
messages/         Portuguese and English interface copy
public/           Brand and travel media
scripts/          Map data preparation
src/app/          Public pages, admin area, feeds and metadata
src/components/   Editorial, travel, map and navigation components
src/data/         Published journeys and curated content
src/lib/          Supabase, reading, map and YouTube integrations
supabase/         Database setup for publishing integrations
testes/           Content and map regression tests
```

## Status

Actively maintained and deployed on Vercel. The current editorial focus is the @KauaArtx YouTube channel, travel, Oxford and personal development.

Built and maintained by [Kauã Diniz Souza](https://github.com/Kauadsouza).
