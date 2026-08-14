import type { Post } from '@/lib/supabase/types';

// Relatos que fazem parte da narrativa principal do site e precisam continuar
// disponíveis mesmo quando o Supabase estiver temporariamente indisponível.
// Posts criados no painel continuam vindo do banco e são combinados com estes.
export const EDITORIAL_POSTS: readonly Post[] = [
  {
    id: 'editorial-oxford-o-primeiro-ponto-do-meu-mapa',
    title: 'Oxford: o primeiro ponto do meu mapa',
    slug: 'oxford-o-primeiro-ponto-do-meu-mapa',
    excerpt:
      'Minha primeira viagem internacional também marcou o começo de uma nova fase: hoje moro em Oxford com a minha família, construo o @KauaArtx e me preparo para estudar.',
    content: `Eu tenho 18 anos e nasci e cresci em Uberlândia, Minas Gerais. Oxford foi a minha primeira viagem internacional.

Hoje eu moro aqui com a minha família. A mudança já aconteceu, e este é o ponto real em que a minha história está agora.

![Radcliffe Camera, em Oxford — imagem licenciada de referência, não é uma foto pessoal do Kauã.](/images/oxford-radcliffe-camera.webp)

*Radcliffe Camera, Oxford. Imagem licenciada de referência — não é uma foto pessoal minha. Foto: [Dmitry Djouce](https://commons.wikimedia.org/wiki/File:Radcliffe_Camera,_Oxford_-_36286514263.jpg), [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/).*

## Antes de chegar aqui

Eu passei em todas as provas do CESEC e concluí essa etapa. Agora estou me preparando para estudar em Oxford.

## O canal começa junto

Ao mesmo tempo, estou construindo o @KauaArtx. Quero usar o canal para registrar viagens, mudanças e o que realmente acontece pelo caminho.

Por enquanto, Oxford é a única viagem que fiz e o primeiro relato do meu mapa. Não quero preencher os espaços com histórias que ainda não vivi.

![Vista do horizonte de Oxford — imagem licenciada de referência, não é uma foto pessoal do Kauã.](/images/oxford-skyline.webp)

*Horizonte de Oxford. Imagem licenciada de referência — não é uma foto pessoal minha. Foto: [WFan](https://commons.wikimedia.org/wiki/File:Oxford_skyline.jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).*

## O que entra depois

As imagens acima são referências licenciadas de Oxford, não fotos tiradas por mim. Ainda não publiquei um vídeo dessa viagem e este relato ainda não tem fotos pessoais. Quando esse material existir, ele entra aqui e também fica ligado ao pin de Oxford no mapa.

Este é o começo, do jeito que ele existe hoje.`,
    cover_url: '/images/oxford-radcliffe-camera.webp',
    cover_position: '50% 50%',
    category: 'Viagem',
    content_format: 'markdown',
    published: true,
    created_at: '2026-08-14T12:00:00.000Z',
    updated_at: '2026-08-14T12:00:00.000Z',
  },
];

export function getEditorialPostBySlug(slug: string): Post | null {
  return EDITORIAL_POSTS.find((post) => post.slug === slug && post.published) ?? null;
}
