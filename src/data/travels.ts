// ============================================================
// OS LUGARES DA JORNADA — o mapa inteiro nasce desta lista.
//
// Pra adicionar um lugar novo é só copiar um bloco e trocar os dados:
//
//   name / country / note: sempre { pt: '...', en: '...' } — o site é
//   bilíngue, então cada lugar precisa do nome nos dois idiomas (ex.:
//   name: { pt: 'Londres', en: 'London' }).
//
//   coords: [longitude, latitude]
//   → No Google Maps, clique com o botão direito no lugar e copie os
//     números. ATENÇÃO: o Google mostra "latitude, longitude" e aqui
//     vai INVERTIDO — longitude primeiro. Ex.: Google mostra
//     "-21.76, -43.35" → aqui fica coords: [-43.35, -21.76].
//
//   status:
//   'lived'   → base (onde mora/morou) — pino verde forte
//   'visited' → já pisou lá — pino verde
//   'planned' → na mira, ainda não foi — pino tracejado
//
// A ORDEM da lista importa: a linha tracejada do mapa liga os pontos
// nessa sequência (a rota da jornada).
// ============================================================

export type TravelStatus = 'lived' | 'visited' | 'planned';

export interface TravelStop {
  id: string;
  name: { pt: string; en: string }; // cidade ou lugar — "Londres" muda pra "London" em inglês
  country: { pt: string; en: string };
  coords: [number, number]; // [longitude, latitude]
  year?: string; // "2024" ou "2019 — hoje"
  status: TravelStatus;
  note?: { pt: string; en: string };
  storyHref?: string;
  videoUrl?: string;
}

export const TRAVELS: TravelStop[] = [
  {
    id: 'oxford',
    name: { pt: 'Oxford', en: 'Oxford' },
    country: { pt: 'Reino Unido', en: 'United Kingdom' },
    coords: [-1.2577, 51.752],
    status: 'lived',
    note: {
      pt: 'Minha primeira viagem internacional e onde eu moro hoje.',
      en: 'My first international trip and where I live today.',
    },
    storyHref: '/viagens/oxford',
  },
];
