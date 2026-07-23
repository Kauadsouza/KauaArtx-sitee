// ============================================================
// OS LUGARES DA JORNADA — o mapa inteiro nasce desta lista.
//
// Pra adicionar um lugar novo é só copiar um bloco e trocar os dados:
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
  name: string; // cidade ou lugar
  country: { pt: string; en: string };
  coords: [number, number]; // [longitude, latitude]
  year?: string; // "2024" ou "2019 — hoje"
  status: TravelStatus;
  note?: { pt: string; en: string };
}

export const TRAVELS: TravelStop[] = [
  {
    id: 'brasil-base',
    name: 'Brasil',
    country: { pt: 'Brasil', en: 'Brazil' },
    coords: [-43.94, -19.92],
    year: 'hoje',
    status: 'lived',
    note: {
      pt: 'A base. Onde tudo começa — trabalho, projetos e o plano de ir mais longe.',
      en: 'Home base. Where it all starts — work, projects, and the plan to go further.',
    },
  },
  {
    id: 'reino-unido',
    name: 'Reino Unido',
    country: { pt: 'Reino Unido', en: 'United Kingdom' },
    coords: [-0.13, 51.51],
    status: 'planned',
    note: {
      pt: 'A próxima parada da jornada.',
      en: 'The next stop of the journey.',
    },
  },
  {
    id: 'estados-unidos',
    name: 'Estados Unidos',
    country: { pt: 'Estados Unidos', en: 'United States' },
    coords: [-74.01, 40.71],
    status: 'planned',
    note: {
      pt: 'Meta de longo prazo: estudar por lá.',
      en: 'Long-term goal: studying there.',
    },
  },
];
