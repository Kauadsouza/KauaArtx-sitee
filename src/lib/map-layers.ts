// ============================================================
// AS CAMADAS DO MAPA — o que aparece em cada nível de zoom.
//
// A ideia é a mesma do Google Maps: de longe você vê só os países; foi
// aproximando, vão nascendo as cidades grandes, depois as médias, depois
// as pequenas. E o desenho da costa também fica mais detalhado (é aí que
// as ilhas pequenas aparecem).
//
// Nada disso vem junto com a página. Cada camada é buscada só quando o
// zoom pede — quem nunca aproximar baixa só o mapa dos países.
//
// Os arquivos de cidade saem de scripts/build-map-data.mjs (npm run map:data).
// ============================================================

import { geoArea, geoBounds, geoCentroid } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import worldTopo110 from 'world-atlas/countries-110m.json';
import countriesInfo from '@/data/map/countries.json';

// [nome, longitude, latitude, população, país (sigla), 1 se é capital]
export type City = [string, number, number, number, string, number];

export interface CountryInfo {
  pt: string;
  en: string;
  cca2: string;
  capital: string | null;
  region: { pt: string; en: string } | null;
  area: number | null;
  // [longitude, latitude] pra escrever o nome. O JSON não carrega a garantia
  // de "exatamente dois números", então a leitura é frouxa e o uso é que
  // aperta (ver COUNTRY_LABELS).
  ll: number[] | null;
}

// Janela do mundo que está aparecendo na tela, em graus. `lon0 > lon1`
// significa que a janela passa pela linha de data (o "fim" do mapa).
export interface Bounds {
  lon0: number;
  lon1: number;
  lat0: number;
  lat1: number;
  wrap: boolean;
}

/**
 * Esse pedaço do mundo cabe todo fora da tela? Então nem desenha.
 *
 * A pegadinha mora nas caixas que dão a volta pela linha de data: a Rússia
 * começa em 19° L e termina em 169° O, ou seja, o "oeste" dela é um número
 * MAIOR que o "leste". Quem trata isso como caixa comum conclui que ela está
 * fora de qualquer tela e apaga a Rússia do mapa — foi exatamente o que
 * aconteceu. Fiji tem o mesmo problema.
 */
export const boxOutside = (b: Bounds, box: [number, number, number, number]) => {
  const [oeste, sul, leste, norte] = box;
  if (norte < b.lat0 || sul > b.lat1) return true;
  // Caixa que passa pela linha de data vale de `oeste` até 180° E TAMBÉM de
  // -180° até `leste`
  if (oeste > leste) return b.lon1 < oeste && b.lon0 > leste;
  return leste < b.lon0 || oeste > b.lon1;
};

// ── Países ──────────────────────────────────────────────────────────
const infoByNumeric = countriesInfo as Record<string, CountryInfo>;
const infoByAlpha2 = new Map<string, CountryInfo>(
  Object.values(infoByNumeric).map((c) => [c.cca2, c])
);

export const countryByNumeric = (id: string | number | undefined) =>
  id == null ? null : infoByNumeric[String(id)] ?? null;

export const countryByAlpha2 = (cc: string) => infoByAlpha2.get(cc) ?? null;

// ── Contornos: três níveis de detalhe ───────────────────────────────
// 110m = traço grosso (rápido); 50m = costas e ilhas de verdade;
// 10m = tudo mesmo, até ilhota. Os dois maiores só descem se o zoom pedir.
export type DetailLevel = 110 | 50 | 10;

export interface Landmass {
  features: Feature<Geometry>[];
  // caixa [oeste, sul, leste, norte] de cada país — serve pra pular no
  // desenho quem está fora da tela
  boxes: [number, number, number, number][];
}

function toLandmass(topo: unknown): Landmass {
  const t = topo as Topology<{ countries: GeometryCollection }>;
  const fc = feature(t, t.objects.countries) as FeatureCollection<Geometry>;
  // Sem a Antártida o mundo preenche melhor o quadro (ninguém mora lá… ainda)
  const features = fc.features.filter((f) => f.id !== '010');
  // Caixa [oeste, sul, leste, norte] de cada país.
  //
  // CUIDADO: quem cruza a linha de data (Rússia e Fiji) vem com o oeste MAIOR
  // que o leste — a Rússia começa em 19°E e termina em 169°O, dando a volta
  // pelo Pacífico. Quem esquecer disso simplesmente apaga a Rússia do mapa.
  const boxes = features.map((f) => {
    const [[w, s], [e, n]] = geoBounds(f);
    return [w, s, e, n] as [number, number, number, number];
  });
  return { features, boxes };
}

const details = new Map<DetailLevel, Landmass>();
details.set(110, toLandmass(worldTopo110));

const detailLoading = new Set<DetailLevel>();

const DETAIL_LOADERS: Record<number, () => Promise<unknown>> = {
  50: () => import('world-atlas/countries-50m.json'),
  10: () => import('world-atlas/countries-10m.json'),
};

/** O contorno mais detalhado que já está na mão (nunca devolve vazio). */
export function currentLand(want: DetailLevel): Landmass {
  return details.get(want) ?? details.get(50) ?? details.get(110)!;
}

/** Pede um nível de detalhe; baixa em segundo plano se ainda não veio. */
export function ensureDetail(want: DetailLevel, onReady?: () => void) {
  if (want === 110 || details.has(want) || detailLoading.has(want)) return;
  detailLoading.add(want);
  DETAIL_LOADERS[want]()
    .then((mod) => {
      const topo = (mod as { default?: unknown }).default ?? mod;
      details.set(want, toLandmass(topo));
      detailLoading.delete(want);
      onReady?.();
    })
    .catch(() => detailLoading.delete(want));
}

/**
 * Onde escrever o nome de cada país.
 *
 * Sai da FICHA, não do desenho: o contorno de baixa resolução tem 177 países
 * dos 250, então Malta, Singapura e Mônaco nunca ganhariam nome. Com o ponto
 * vindo da ficha, todo país tem lugar marcado — só depende de o zoom chegar
 * perto o bastante.
 */
const RAIO_TERRA_KM2 = 6371 * 6371;

export const COUNTRY_LABELS = Object.entries(infoByNumeric)
  .filter(([, info]) => info.ll?.length === 2)
  .map(([id, info]) => ({
    id,
    center: [info.ll![0], info.ll![1]] as [number, number],
    // km² viram "fatia da esfera", que multiplicada pelo raio² dá o tamanho
    // que o país ocupa na tela
    area: (info.area ?? 0) / RAIO_TERRA_KM2,
  }));

// Centro geométrico de verdade (do desenho) pros países que existem no
// contorno — fica melhor que o ponto oficial em país torto, tipo o Chile
const centroidesReais = new Map(
  details.get(110)!.features.map((f) => [String(f.id ?? ''), geoCentroid(f) as [number, number]])
);
for (const label of COUNTRY_LABELS) {
  const real = centroidesReais.get(label.id);
  if (real) label.center = real;
  if (!label.area) {
    const f = details.get(110)!.features.find((g) => String(g.id ?? '') === label.id);
    if (f) label.area = geoArea(f);
  }
}

// ── Divisões internas: estados, províncias, departamentos ───────────
// Guardadas por país e como LINHA (não polígono), então desenhar só as
// divisas de quem está na tela é barato. 194 países cobertos.
export interface Admin1Entry {
  box: [number, number, number, number];
  linhas: { type: 'MultiLineString'; coordinates: [number, number][][] };
}

let admin1: Record<string, Admin1Entry> | null = null;
let admin1Loading = false;

export function ensureAdmin1(onReady?: () => void) {
  if (admin1 || admin1Loading) return;
  admin1Loading = true;
  import('@/data/map/admin1.json')
    .then((mod) => {
      admin1 = ((mod as { default?: unknown }).default ?? mod) as Record<string, Admin1Entry>;
      admin1Loading = false;
      onReady?.();
    })
    .catch(() => {
      admin1Loading = false;
    });
}

/** As divisas dos países que aparecem na janela (vazio se ainda não baixou). */
export function admin1InView(dentro: (box: [number, number, number, number]) => boolean) {
  return recorta(admin1, dentro);
}

// ── Divisa de município (Brasil, do IBGE) ───────────────────────────
// Um degrau abaixo do estado: só desce quando o zoom chega perto de verdade,
// porque é a camada mais fina do mapa. Guardada por estado.
let municipios: Record<string, Admin1Entry> | null = null;
let municipiosLoading = false;

export function ensureMunicipios(onReady?: () => void) {
  if (municipios || municipiosLoading) return;
  municipiosLoading = true;
  import('@/data/map/municipios-br.json')
    .then((mod) => {
      municipios = ((mod as { default?: unknown }).default ?? mod) as Record<string, Admin1Entry>;
      municipiosLoading = false;
      onReady?.();
    })
    .catch(() => {
      municipiosLoading = false;
    });
}

export function municipiosInView(dentro: (box: [number, number, number, number]) => boolean) {
  return recorta(municipios, dentro);
}

function recorta(
  fonte: Record<string, Admin1Entry> | null,
  dentro: (box: [number, number, number, number]) => boolean
) {
  if (!fonte) return [];
  const saida: Admin1Entry['linhas'][] = [];
  for (const k in fonte) {
    const e = fonte[k];
    if (dentro(e.box)) saida.push(e.linhas);
  }
  return saida;
}

// ── Cidades: quatro camadas por população ───────────────────────────
const CELL_DEG = 5;
const COLS = 360 / CELL_DEG;
const ROWS = 180 / CELL_DEG;

const cells = new Map<number, City[]>();
const tiersLoaded = new Set<number>();
const tiersLoading = new Set<number>();

const TIER_LOADERS: Record<number, () => Promise<unknown>> = {
  1: () => import('@/data/map/cities-1.json'),
  2: () => import('@/data/map/cities-2.json'),
  3: () => import('@/data/map/cities-3.json'),
  4: () => import('@/data/map/cities-4.json'),
};

const cellOf = (lon: number, lat: number) => {
  const x = Math.min(COLS - 1, Math.max(0, Math.floor((lon + 180) / CELL_DEG)));
  const y = Math.min(ROWS - 1, Math.max(0, Math.floor((lat + 90) / CELL_DEG)));
  return y * COLS + x;
};

/** Baixa todas as camadas até `tier` (1 = só as maiores, 4 = até vilas). */
export function ensureCities(tier: number, onReady?: () => void) {
  for (let t = 1; t <= tier; t++) {
    if (tiersLoaded.has(t) || tiersLoading.has(t)) continue;
    tiersLoading.add(t);
    TIER_LOADERS[t]()
      .then((mod) => {
        const rows = ((mod as { default?: unknown }).default ?? mod) as City[];
        const touched = new Set<number>();
        for (const c of rows) {
          const k = cellOf(c[1], c[2]);
          let arr = cells.get(k);
          if (!arr) cells.set(k, (arr = []));
          arr.push(c);
          touched.add(k);
        }
        // Cada gaveta fica ordenada da cidade maior pra menor — assim a
        // busca por população para cedo em vez de varrer tudo
        for (const k of touched) cells.get(k)!.sort((a, b) => b[3] - a[3]);
        tiersLoaded.add(t);
        tiersLoading.delete(t);
        onReady?.();
      })
      .catch(() => tiersLoading.delete(t));
  }
}

export const citiesReady = (tier: number) => tiersLoaded.has(tier);
export const citiesLoading = () => tiersLoading.size > 0;

// ── Busca por nome ──────────────────────────────────────────────────
const semAcento = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

/**
 * Os nomes vêm como se escrevem no lugar ("Tokyo", "Moscow", "Köln"), então
 * quem digita em português não acharia. Esta lista cobre os apelidos que o
 * português consagrou — não é chute de tradução, é o nome que a gente usa.
 */
const APELIDOS_PT: Record<string, string> = {
  toquio: 'tokyo',
  londres: 'london',
  'novayork': 'new york city',
  'novaiorque': 'new york city',
  pequim: 'beijing',
  moscou: 'moscow',
  moscovo: 'moscow',
  'cidadedomexico': 'mexico city',
  roma: 'rome',
  milao: 'milan',
  genebra: 'geneva',
  copenhague: 'copenhagen',
  zurique: 'zurich',
  munique: 'munich',
  colonia: 'cologne',
  varsovia: 'warsaw',
  praga: 'prague',
  atenas: 'athens',
  estocolmo: 'stockholm',
  viena: 'vienna',
  bruxelas: 'brussels',
  haia: 'the hague',
  berna: 'bern',
  'novadelhi': 'new delhi',
  xangai: 'shanghai',
  seul: 'seoul',
  bancoc: 'bangkok',
  cingapura: 'singapore',
  joanesburgo: 'johannesburg',
  argel: 'algiers',
  tunis: 'tunis',
  damasco: 'damascus',
  bagda: 'baghdad',
  teera: 'tehran',
  jerusalem: 'jerusalem',
  'cidadedocabo': 'cape town',
  'baixasaxonia': 'hannover',
  genova: 'genoa',
  florenca: 'florence',
  veneza: 'venice',
  napoles: 'naples',
  turim: 'turin',
  sevilha: 'seville',
  saragoca: 'zaragoza',
  'corunha': 'a coruña',
  bordeus: 'bordeaux',
  marselha: 'marseille',
  lyon: 'lyon',
  toulouse: 'toulouse',
  edimburgo: 'edinburgh',
  dublim: 'dublin',
  helsinque: 'helsinki',
  oslo: 'oslo',
  riade: 'riyadh',
  'hanoi': 'hanoi',
  cantao: 'guangzhou',
  'hongkong': 'hong kong',
  macau: 'macau',
};

export interface Achado {
  city: City;
  /** país da cidade, já no idioma do site */
  pais: string;
}

/**
 * Procura um lugar pelo nome entre as cidades já baixadas.
 *
 * Ordem: quem COMEÇA com o que foi digitado vem antes de quem só contém, e
 * dentro disso a maior população primeiro — é o que faz "sao" achar São Paulo
 * antes de São Gabriel do Oeste.
 */
export function searchCities(termo: string, idioma: 'pt' | 'en', limite = 8): Achado[] {
  const q0 = semAcento(termo);
  if (q0.length < 2 || !cells.size) return [];
  const q = APELIDOS_PT[q0.replace(/\s/g, '')] ?? q0;

  const comeca: City[] = [];
  const contem: City[] = [];
  for (const arr of cells.values()) {
    for (const c of arr) {
      const nome = semAcento(c[0]);
      if (nome.startsWith(q)) comeca.push(c);
      else if (nome.includes(q)) contem.push(c);
    }
  }
  const porPop = (a: City, b: City) => b[3] - a[3];
  comeca.sort(porPop);
  contem.sort(porPop);

  return [...comeca, ...contem].slice(0, limite).map((city) => ({
    city,
    pais: countryByAlpha2(city[4])?.[idioma] ?? city[4],
  }));
}

/** Cidades acima de `minPop` dentro da janela visível. */
export function queryCities(b: Bounds | null, minPop: number, limit: number): City[] {
  const out: City[] = [];
  if (!cells.size) return out;

  const take = (arr: City[]) => {
    for (const c of arr) {
      if (c[3] < minPop) break; // gaveta ordenada: daqui pra frente é tudo menor
      // A gaveta tem 5° de lado, bem maior que a tela num zoom fechado —
      // esse segundo filtro evita projetar cidade que nem vai aparecer
      if (b && (c[1] < b.lon0 || c[1] > b.lon1 || c[2] < b.lat0 || c[2] > b.lat1)) continue;
      out.push(c);
      if (out.length >= limit) return true;
    }
    return false;
  };

  if (!b) {
    for (const arr of cells.values()) if (take(arr)) break;
    return out;
  }

  const y0 = Math.max(0, Math.floor((b.lat0 + 90) / CELL_DEG));
  const y1 = Math.min(ROWS - 1, Math.floor((b.lat1 + 90) / CELL_DEG));
  const x0 = Math.floor((b.lon0 + 180) / CELL_DEG);
  const x1 = Math.floor((b.lon1 + 180) / CELL_DEG);
  const spanX = b.wrap ? COLS - 1 - x0 + x1 + 1 : x1 - x0;

  for (let y = y0; y <= y1; y++) {
    for (let i = 0; i <= spanX; i++) {
      const x = (((x0 + i) % COLS) + COLS) % COLS;
      const arr = cells.get(y * COLS + x);
      if (arr && take(arr)) return out;
    }
  }
  return out;
}

// ── Quanto mostrar em cada zoom ─────────────────────────────────────
// Abaixo do primeiro degrau não aparece cidade nenhuma — só país, como
// num globo de mesa. Daí em diante o corte de população vai caindo.
const POP_STEPS: [zoom: number, minPop: number][] = [
  [1.7, 8_000_000],
  [2.4, 3_000_000],
  [3.2, 1_000_000],
  [4.5, 500_000],
  [6, 200_000],
  [8, 100_000],
  [10, 40_000],
  [12.5, 15_000],
  [15, 5_000],
];

/** População mínima pra uma cidade aparecer nesse zoom. */
export function minPopForZoom(zoom: number): number {
  if (zoom < POP_STEPS[0][0]) return Infinity;
  const last = POP_STEPS[POP_STEPS.length - 1];
  if (zoom >= last[0]) return last[1];
  for (let i = 0; i < POP_STEPS.length - 1; i++) {
    const [z0, p0] = POP_STEPS[i];
    const [z1, p1] = POP_STEPS[i + 1];
    if (zoom < z1) {
      // interpola no logaritmo: a densidade cresce suave, sem "pulo"
      const k = (zoom - z0) / (z1 - z0);
      return Math.exp(Math.log(p0) + k * (Math.log(p1) - Math.log(p0)));
    }
  }
  return last[1];
}

/** Qual camada de cidades precisa estar baixada nesse zoom. */
export function tierForZoom(zoom: number): number {
  const p = minPopForZoom(zoom);
  if (p === Infinity) return 0;
  if (p >= 500_000) return 1;
  if (p >= 100_000) return 2;
  if (p >= 20_000) return 3;
  return 4;
}

/**
 * Quão detalhado precisa ser o contorno dos continentes nesse zoom.
 *
 * O nível 10m é o que traz cada ilhota do planeta — e também 3,5 MB. Por
 * isso ele só entra bem fundo, quando a pessoa claramente foi olhar de perto:
 * quem só passeia pelo globo nunca chega a baixar esse arquivo.
 */
export function detailForZoom(zoom: number): DetailLevel {
  if (zoom >= 7.5) return 10;
  if (zoom >= 2.2) return 50;
  return 110;
}
