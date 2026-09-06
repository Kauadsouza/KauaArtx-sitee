import {
  FileText,
  GraduationCap,
  ListVideo,
  Route,
  ScrollText,
  Users,
} from 'lucide-react';

export const COPY = {
  pt: {
    back: 'Voltar para o mapa',
    kicker: 'PRIMEIRO PONTO DO MAPA',
    title: 'Oxford, o começo real',
    intro:
      'Minha primeira viagem internacional também virou a minha base atual. Hoje moro em Oxford com a minha família, construo o @KauaArtx e me preparo para estudar.',
    facts: [
      { label: 'Primeira viagem', value: 'Internacional', icon: Route },
      { label: 'Onde moro hoje', value: 'Oxford, Reino Unido', icon: Users },
      { label: 'Fase atual', value: 'Canal e estudos', icon: GraduationCap },
    ],
    storyKicker: 'O RELATO',
    storyTitle: 'O que existe até aqui',
    storyParagraphs: [
      'Tenho 18 anos, nasci e cresci em Uberlândia, Minas Gerais, e Oxford foi a minha primeira viagem internacional.',
      'Hoje moro aqui com a minha família. A mudança já aconteceu, e este é o ponto real em que a minha história está agora.',
      'Passei em todas as provas do CESEC e concluí essa etapa. Agora estou me preparando para estudar em Oxford e, ao mesmo tempo, construindo o @KauaArtx para registrar viagens, mudanças e o que realmente acontece pelo caminho.',
      'Por enquanto, Oxford é a única viagem publicada no meu mapa. Não quero preencher os espaços com histórias que ainda não vivi.',
    ],
    fullStory: 'Ler o relato completo no blog',
    locationKicker: 'LOCALIZAÇÃO',
    locationTitle: 'Um ponto real, sem pesar a página',
    locationDescription:
      'Este cartão usa os mesmos dados do mapa principal. O mapa interativo completo abre somente quando você quiser explorar.',
    currentBase: 'Base atual',
    coordinates: 'Coordenadas do pin',
    openMap: 'Abrir o mapa interativo',
    photosKicker: 'IMAGENS',
    photosTitle: 'Referências agora. Fotos pessoais depois.',
    photosDescription:
      'As imagens que já aparecem no site são referências licenciadas de Oxford. Não são fotos tiradas por mim.',
    referencePhoto: 'Imagem licenciada de referência',
    personalPhotos: 'Fotos pessoais',
    personalPhotosState:
      'Ainda não há fotos pessoais publicadas. Quando elas existirem, esta área passa a contar a viagem com o meu próprio olhar.',
    videoKicker: 'PRIMEIRO VÍDEO',
    videoTitle: 'O espaço já está pronto para o @KauaArtx',
    videoDescription:
      'Ainda não publiquei um vídeo sobre Oxford. Nada aparece como pronto antes de existir.',
    videoPending: 'Vídeo ainda não publicado',
    channel: 'Abrir @KauaArtx',
    futureTitle: 'Quando o vídeo sair, entram aqui',
    futureItems: [
      {
        title: 'Resumo',
        description: 'Uma visão rápida do que aconteceu no vídeo.',
        icon: FileText,
      },
      {
        title: 'Capítulos',
        description: 'Os momentos do vídeo com os tempos reais.',
        icon: ListVideo,
      },
      {
        title: 'Transcrição',
        description: 'O conteúdo falado em texto, depois da publicação.',
        icon: ScrollText,
      },
    ],
    futureState: 'Aguardando o primeiro vídeo',
    pinLinked: 'O relato já está ligado ao pin de Oxford.',
    pinFuture: 'O vídeo também será ligado ao mesmo pin quando for publicado.',
    closeTitle: 'Esse é o começo, do jeito que ele existe hoje.',
    closeDescription:
      'Oxford é o primeiro ponto. As próximas páginas só entram quando houver uma viagem real para contar.',
    seeMap: 'Ver a jornada no mapa',
  },
  en: {
    back: 'Back to the map',
    kicker: 'FIRST POINT ON THE MAP',
    title: 'Oxford, the real beginning',
    intro:
      'My first international trip also became my current base. I now live in Oxford with my family, build @KauaArtx, and prepare to study.',
    facts: [
      { label: 'First trip', value: 'International', icon: Route },
      { label: 'Where I live now', value: 'Oxford, United Kingdom', icon: Users },
      { label: 'Current phase', value: 'Channel and studies', icon: GraduationCap },
    ],
    storyKicker: 'THE STORY',
    storyTitle: 'What exists so far',
    storyParagraphs: [
      'I am 18, I was born and raised in Uberlandia, Minas Gerais, and Oxford was my first international trip.',
      'I now live here with my family. The move has already happened, and this is the real point where my story is today.',
      'I passed all my CESEC exams and completed that stage. I am now preparing to study in Oxford while building @KauaArtx to document travel, change, and what really happens along the way.',
      'For now, Oxford is the only trip published on my map. I do not want to fill the gaps with stories I have not lived yet.',
    ],
    fullStory: 'Read the full story on the blog',
    locationKicker: 'LOCATION',
    locationTitle: 'A real point, without weighing down the page',
    locationDescription:
      'This card uses the same data as the main map. The full interactive map opens only when you want to explore.',
    currentBase: 'Current base',
    coordinates: 'Pin coordinates',
    openMap: 'Open the interactive map',
    photosKicker: 'IMAGES',
    photosTitle: 'References now. Personal photos later.',
    photosDescription:
      'The images already shown on the site are licensed references of Oxford. They were not taken by me.',
    referencePhoto: 'Licensed reference image',
    personalPhotos: 'Personal photos',
    personalPhotosState:
      'There are no personal photos published yet. When they exist, this area will tell the trip through my own perspective.',
    videoKicker: 'FIRST VIDEO',
    videoTitle: 'The space is ready for @KauaArtx',
    videoDescription:
      'I have not published a video about Oxford yet. Nothing is presented as ready before it exists.',
    videoPending: 'Video not published yet',
    channel: 'Open @KauaArtx',
    futureTitle: 'When the video is out, this page will include',
    futureItems: [
      {
        title: 'Summary',
        description: 'A quick view of what happened in the video.',
        icon: FileText,
      },
      {
        title: 'Chapters',
        description: 'Video moments with their real timestamps.',
        icon: ListVideo,
      },
      {
        title: 'Transcript',
        description: 'The spoken content in text after publication.',
        icon: ScrollText,
      },
    ],
    futureState: 'Waiting for the first video',
    pinLinked: 'The story is already connected to the Oxford pin.',
    pinFuture: 'The video will be connected to the same pin when it is published.',
    closeTitle: 'This is the beginning as it really exists today.',
    closeDescription:
      'Oxford is the first point. New pages will only appear when there is a real trip to tell.',
    seeMap: 'See the journey on the map',
  },
} as const;

export type OxfordLocale = keyof typeof COPY;
export type OxfordCopy = (typeof COPY)[OxfordLocale];
