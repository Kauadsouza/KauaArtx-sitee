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
  {
    id: 'editorial-checklist-real-para-viajar-e-trabalhar-remoto',
    title: 'Quer viajar e trabalhar de qualquer lugar? Comece por este checklist',
    slug: 'checklist-real-para-comecar-a-viajar-e-trabalhar-remoto',
    excerpt:
      'Um ponto de partida sem fantasia: situação migratória, dinheiro, trabalho, documentos e um teste pequeno antes de transformar viagem em estilo de vida.',
    content: `Este é um guia de preparação, não um relato de algo que eu já vivi. A ideia é organizar as perguntas que vêm antes da passagem — sem fingir que basta abrir o notebook em qualquer país.

## 1. Defina que tipo de viagem você quer fazer

“Ser nômade” pode significar coisas bem diferentes: uma viagem curta enquanto você mantém um trabalho no exterior, alguns meses em uma base ou uma mudança com autorização específica. Antes de escolher o destino, escreva quanto tempo você quer ficar e de onde virá sua renda.

## 2. Confira se a sua atividade é permitida

Entrada como visitante, autorização eletrônica e visto de trabalho não são a mesma coisa. Cada país decide o que um visitante pode fazer, por quanto tempo pode ficar e se trabalho remoto é permitido.

Use apenas portais oficiais do governo do destino. Se a regra não estiver clara, não trate um vídeo curto ou um post antigo como autorização.

## 3. Faça a conta sem depender do melhor cenário

Liste passagem, hospedagem, alimentação, transporte, internet, seguro, taxas e uma reserva para imprevistos. Depois compare esse total com uma renda que já existe — não com um cliente que talvez apareça durante a viagem.

## 4. Teste o trabalho antes de sair

Passe alguns dias trabalhando só com o equipamento que levaria. Verifique bateria, backup, autenticação em duas etapas, acesso aos arquivos e como você reage a horários diferentes. O problema mais simples em casa pode virar um dia perdido fora.

## 5. Organize os documentos

- passaporte válido e cópias protegidas;
- autorização, visto ou comprovante exigido pelo destino;
- seguro adequado ao tipo de viagem;
- endereço da primeira hospedagem;
- passagens e reservas que a fronteira possa solicitar;
- contatos de emergência e acesso seguro ao seu dinheiro.

## 6. Comece com um teste menor

Uma viagem curta mostra mais do que meses idealizando. Ela ajuda a descobrir o seu ritmo, o custo real, o que cabe na mochila e se trabalhar enquanto viaja combina com a vida que você quer.

## O próximo passo

Antes de comprar qualquer coisa, abra a aba [Notícias](/blog/noticias) e confira as regras mais recentes. O radar separa o que já está em vigor do que ainda não começou.

*Imagem de capa ilustrativa. Foto: [Mikhail Mamaev](https://unsplash.com/photos/yellow-backpack-on-a-bench-at-a-train-station-afU18qSLMcE), Unsplash License.*`,
    cover_url: '/images/travel-backpack.webp',
    cover_position: '61% 64%',
    category: 'Guias',
    content_format: 'markdown',
    published: true,
    created_at: '2026-08-14T13:00:00.000Z',
    updated_at: '2026-08-14T13:00:00.000Z',
  },
  {
    id: 'editorial-uk-eta-para-brasileiros-2026',
    title: 'ETA do Reino Unido para brasileiros: o que mudou em 2026',
    slug: 'uk-eta-para-brasileiros-o-que-mudou-em-2026',
    excerpt:
      'A autorização já é exigida de viajantes brasileiros sem visto ou outra permissão válida. Veja o preço atual, a validade e quem não precisa solicitar.',
    content: `> **Radar Nômade — checado em 14 de agosto de 2026.** Regras de entrada mudam. Antes de viajar, confirme novamente no GOV.UK.

Brasileiros que viajam ao Reino Unido sem visto ou outra permissão britânica válida precisam de uma Electronic Travel Authorisation, a ETA. A exigência para passaportes brasileiros começou em 8 de janeiro de 2025, e as transportadoras passaram a fiscalizar obrigatoriamente a autorização em 25 de fevereiro de 2026.

## O que está valendo agora

- **Preço:** £20 por pessoa.
- **Prazo:** a resposta normalmente chega em até um dia, mas o governo orienta permitir até três dias úteis.
- **Validade:** dois anos ou até o passaporte vencer, o que acontecer primeiro.
- **Uso:** permite múltiplas viagens durante a validade.
- **Documento:** a ETA fica ligada ao mesmo passaporte usado na solicitação.

## Quem não precisa

Quem já tem visto britânico ou permissão para morar, trabalhar ou estudar no Reino Unido não precisa de ETA. Também existem outras exceções específicas no guia oficial.

## O que a ETA não faz

A ETA não é visto, não dá permissão para morar ou trabalhar no país e não garante entrada na fronteira. Ela é uma autorização para viajar até o Reino Unido e ser avaliado na chegada.

## Como pedir sem cair em site intermediário

Use o aplicativo oficial UK ETA ou a página do GOV.UK. O governo britânico avisa que outro site não consegue acelerar a decisão.

## Fontes oficiais

- [Solicitar uma ETA e conferir o preço atual — GOV.UK](https://www.gov.uk/eta/apply)
- [Nacionalidades que podem solicitar, incluindo Brasil — GOV.UK](https://www.gov.uk/guidance/check-when-you-can-get-an-electronic-travel-authorisation-eta)
- [Quem não precisa de ETA — GOV.UK](https://www.gov.uk/eta/when-not-need-eta)
- [Fiscalização obrigatória desde fevereiro de 2026 — Home Office](https://www.gov.uk/government/news/uk-enforces-digital-permission-to-travel)

*Imagem de capa ilustrativa. Foto: [Valentin Lacoste](https://unsplash.com/photos/people-in-airport-waiting-area-with-departure-board-Ge_zO-UXwdo), Unsplash License.*`,
    cover_url: '/images/travel-airport.webp',
    cover_position: '50% 42%',
    category: 'Notícias',
    content_format: 'markdown',
    published: true,
    created_at: '2026-08-14T14:00:00.000Z',
    updated_at: '2026-08-14T14:00:00.000Z',
  },
  {
    id: 'editorial-ees-etias-europa-2026',
    title: 'EES e ETIAS: o que já mudou para viajar à Europa em 2026',
    slug: 'ees-e-etias-o-que-muda-na-europa-em-2026',
    excerpt:
      'O EES já funciona nas fronteiras do Espaço Schengen. O ETIAS ainda não começou. Entenda a diferença antes de preencher qualquer formulário.',
    content: `> **Radar Nômade — checado em 14 de agosto de 2026.** O EES já está ativo. O ETIAS ainda não recebe solicitações.

Os nomes são parecidos, mas os sistemas fazem coisas diferentes. Para brasileiros que planejam uma estadia curta na Europa, a distinção evita formulário falso, taxa desnecessária e informação velha.

## EES: já está funcionando

O Entry/Exit System começou a ser implantado em 12 de outubro de 2025 e está totalmente operacional desde 10 de abril de 2026 nos 29 países participantes do Espaço Schengen.

Não existe pedido antecipado nem taxa do EES. Na fronteira externa, o sistema registra dados do passaporte, imagem facial, impressões digitais e as datas de entrada e saída. A regra de até 90 dias dentro de qualquer período de 180 dias continua a mesma.

Irlanda e Chipre não usam o EES. Na primeira passagem por uma fronteira que usa o sistema, vale deixar tempo extra para o cadastro.

## ETIAS: ainda não começou

Em 14 de agosto de 2026, o ETIAS não está operando e não aceita solicitações. A União Europeia informa apenas que o início será no último trimestre de 2026; o dia exato ainda não foi anunciado.

Quando entrar em operação, viajantes brasileiros isentos de visto para estadias curtas nos 30 países participantes precisarão solicitar a autorização, salvo exceções. A taxa anunciada é de €20, e a validade será de até três anos ou até o passaporte vencer.

## A diferença em uma linha

- **EES:** registro feito na fronteira; já está ativo; não exige formulário prévio.
- **ETIAS:** autorização pedida antes da viagem; ainda não está ativo.

## O que fazer agora

Não pague por ETIAS e não preencha sites que dizem aceitar a solicitação. Para o EES, leve o passaporte correto e esteja preparado para o registro na fronteira.

## Fontes oficiais

- [Diferenças entre EES e ETIAS — Comissão Europeia](https://home-affairs.ec.europa.eu/news/main-differences-between-ees-and-etias-what-travellers-need-know-2026-04-28_en)
- [Como funciona o EES — União Europeia](https://travel-europe.europa.eu/ees/what-is-the-ees)
- [Situação e cronograma do ETIAS — União Europeia](https://travel-europe.europa.eu/etias)

*Imagem de capa ilustrativa. Foto: [Oxana Melis](https://unsplash.com/photos/a-passport-and-a-boarding-pass-are-on-a-bag-LVA3S6isNYQ), Unsplash License.*`,
    cover_url: '/images/travel-passport.webp',
    cover_position: '52% 52%',
    category: 'Notícias',
    content_format: 'markdown',
    published: true,
    created_at: '2026-08-14T13:40:00.000Z',
    updated_at: '2026-08-14T13:40:00.000Z',
  },
  {
    id: 'editorial-trabalho-remoto-visitante-uk',
    title: 'Dá para trabalhar remoto como visitante no Reino Unido?',
    slug: 'trabalho-remoto-como-visitante-no-reino-unido',
    excerpt:
      'A regra permite atividade remota ligada a um emprego no exterior apenas quando trabalhar não é o objetivo principal da visita. Isso não criou um visto nômade.',
    content: `> **Radar Nômade — checado em 14 de agosto de 2026.** Este texto resume a regra oficial e não substitui orientação migratória para um caso individual.

A resposta curta é: existe uma permissão limitada, mas ela não transforma a rota de visitante em visto de nômade digital.

## O que a regra permite

A cláusula PA 4(h) das Immigration Rules permite que um visitante realize atividades relacionadas ao seu emprego no exterior de forma remota dentro do Reino Unido, desde que isso não seja o objetivo principal da visita.

Na prática, a viagem precisa continuar sendo uma visita genuína. Responder mensagens ou participar de uma reunião ligada ao trabalho no exterior pode ser incidental; entrar no país principalmente para trabalhar exige outra análise.

## O que não dá para concluir

- ETA não é permissão de trabalho.
- A regra não criou um “visto nômade” britânico.
- Não existe no texto legal um passe automático de 30 dias para trabalhar remoto.
- Trabalho para o mercado britânico ou uma viagem cujo foco seja trabalhar pode exigir uma rota migratória adequada.

## Antes de planejar

Confira a atividade específica, quem paga pelo trabalho, onde está o empregador e qual é o motivo real da viagem. Se o plano depende de trabalhar durante toda a estadia, não compre passagem baseado apenas em um resumo da internet.

## Fontes oficiais

- [Immigration Rules, cláusula PA 4(h) — GOV.UK](https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-visitor-permitted-activities)
- [Orientação para análise de visitantes — Home Office](https://www.gov.uk/government/publications/visit-guidance/visit-caseworker-guidance-accessible--2)

*Imagem de capa ilustrativa. Foto: [Julio Lopez](https://unsplash.com/photos/woman-working-on-laptop-with-city-view-WbGrqnS_t3k), Unsplash License.*`,
    cover_url: '/images/travel-remote-work.webp',
    cover_position: '50% 45%',
    category: 'Notícias',
    content_format: 'markdown',
    published: true,
    created_at: '2026-08-14T13:20:00.000Z',
    updated_at: '2026-08-14T13:20:00.000Z',
  },
];

export function getEditorialPostBySlug(slug: string): Post | null {
  return EDITORIAL_POSTS.find((post) => post.slug === slug && post.published) ?? null;
}
