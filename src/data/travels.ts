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
}

export const TRAVELS: TravelStop[] = [
  {
    id: 'uberlandia',
    name: { pt: 'Uberlândia', en: 'Uberlândia' },
    country: { pt: 'Brasil', en: 'Brazil' },
    coords: [-48.2772, -18.9186],
    year: 'hoje',
    status: 'lived',
    note: {
      pt: 'É daqui que eu saio. A base hoje — trabalho, projetos e o plano de ir mais longe.',
      en: "This is where I'm setting off from. Home base today — work, projects, and the plan to go further.",
    },
  },
  {
    id: 'londres',
    name: { pt: 'Londres', en: 'London' },
    country: { pt: 'Reino Unido', en: 'United Kingdom' },
    coords: [-0.1276, 51.5072],
    status: 'planned',
    note: {
      pt: 'A próxima parada da jornada.',
      en: 'The next stop of the journey.',
    },
  },
  {
    id: 'nova-york',
    name: { pt: 'Nova York', en: 'New York' },
    country: { pt: 'Estados Unidos', en: 'United States' },
    coords: [-74.006, 40.7128],
    status: 'planned',
    note: {
      pt: 'De Londres pra Nova York — o passo seguinte da rota.',
      en: 'From London to New York — the next leg of the route.',
    },
  },
];
