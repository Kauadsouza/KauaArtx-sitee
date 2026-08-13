'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  geoContains,
  geoDistance,
  geoGraticule10,
  geoNaturalEarth1,
  geoOrthographic,
  geoPath,
} from 'd3-geo';
import type { GeoProjection } from 'd3-geo';
import { Globe2, Map as MapIcon, Minus, Pause, Play, Plus, RotateCcw, Search } from 'lucide-react';
import { TRAVELS, type TravelStatus } from '@/data/travels';
import {
  COUNTRY_LABELS,
  admin1InView,
  boxOutside,
  citiesLoading,
  searchCities,
  countryByAlpha2,
  countryByNumeric,
  currentLand,
  detailForZoom,
  ensureAdmin1,
  ensureCities,
  ensureDetail,
  ensureMunicipios,
  municipiosInView,
  minPopForZoom,
  queryCities,
  tierForZoom,
  type Bounds,
  type City,
} from '@/lib/map-layers';

// Verde vÃ­vido usado sÃ³ pra glow de destaque (mesmo tom do "vocÃª estÃ¡ aqui"
// da trilha em /about). Fora daqui o mapa lÃª os tokens reais de globals.css,
// entÃ£o a paleta continua sendo um verde monocromÃ¡tico â€” sem ciano.
const GLOW_GREEN = '#35E065';

const MIN_ZOOM = 0.7;
const MAX_ZOOM = 16;
const SPIN_DEG_PER_SEC = 3.2; // giro ocioso do globo â€” lento, quase respirando
const RAIO_TERRA_KM = 6371;

// Teto de cidades escritas por quadro â€” segura o mapa liso e legÃ­vel mesmo
// numa regiÃ£o abarrotada (a costa leste dos EUA, o Vale do Gangesâ€¦)
const MAX_CITY_LABELS = 130;

// Quanto maior a cidade, maior o nome e o ponto. Ã‰ o que faz a hierarquia
// aparecer de relance: Nova York salta, Vineland fica de canto.
const cityStyle = (pop: number) => {
  if (pop >= 5_000_000) return { px: 14, r: 4.4 };
  if (pop >= 1_000_000) return { px: 12.5, r: 3.8 };
  if (pop >= 300_000) return { px: 11.5, r: 3.2 };
  if (pop >= 80_000) return { px: 10.8, r: 2.7 };
  return { px: 10.2, r: 2.3 };
};

type Mode = 'globe' | 'flat';

// O que estÃ¡ aberto no cartÃ£o: uma parada da jornada, uma cidade ou um paÃ­s
type Selection =
  | { kind: 'stop'; id: string }
  | { kind: 'city'; city: City }
  | { kind: 'country'; id: string };

const sameSelection = (a: Selection | null, b: Selection | null) => {
  if (!a || !b) return a === b;
  if (a.kind !== b.kind) return false;
  if (a.kind === 'city' && b.kind === 'city') return a.city === b.city;
  if (a.kind === 'stop' && b.kind === 'stop') return a.id === b.id;
  if (a.kind === 'country' && b.kind === 'country') return a.id === b.id;
  return false;
};

const GRATICULE = geoGraticule10();

const ROUTE =
  TRAVELS.length > 1
    ? ({
        type: 'LineString',
        coordinates: TRAVELS.map((s) => s.coords),
      } as const)
    : null;

// Estrelas do fundo â€” posiÃ§Ãµes fixas (pseudo-aleatÃ³rias determinÃ­sticas) pra
// nÃ£o "piscar de lugar" a cada render
const STARS = Array.from({ length: 80 }, (_, i) => {
  const rnd = (seed: number) => {
    const s = Math.sin((i + 1) * seed) * 10000;
    return s - Math.floor(s);
  };
  return {
    x: rnd(12.9898),
    y: rnd(78.233),
    r: 0.5 + rnd(45.164) * 1.1,
    phase: rnd(93.989) * Math.PI * 2,
  };
});

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

// Interpola Ã¢ngulos pelo caminho mais curto (evita o globo dar a volta ao mundo
// pro lado errado quando a rotaÃ§Ã£o cruza os 180Â°)
const shortestAngle = (from: number, to: number) => {
  let d = ((to - from + 180) % 360) - 180;
  if (d < -180) d += 360;
  return d;
};

const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

/**
 * QuÃ£o fino o d3 deve picar as linhas do mapa.
 *
 * Ele reamostra cada trecho atÃ© ficar mais liso que `precision` pixels â€” de
 * longe isso Ã© o que faz o contorno acompanhar a curva do globo. De perto,
 * porÃ©m, um Ãºnico trecho vira centenas de pontos e o quadro despenca: a
 * curvatura da Terra num pedaÃ§o de 300 km simplesmente nÃ£o aparece. EntÃ£o o
 * corte vai afrouxando junto com o zoom.
 */
const precisionForZoom = (zoom: number) => (zoom < 2 ? 0.5 : zoom < 5 ? 2 : 10);

// Converte "#RRGGBB" em rgba() â€” o canvas nÃ£o entende var(--token), entÃ£o a
// cor vem do CSS e ganha alpha aqui
function alpha(color: string, a: number) {
  const hex = color.trim();
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

type Theme = ReturnType<typeof readTheme>;

// Uma Ãºnica fonte de verdade pras cores: os tokens de globals.css
function readTheme(el: Element) {
  const cs = getComputedStyle(el);
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  return {
    // O canvas nÃ£o entende var(--font-sans): pega a famÃ­lia jÃ¡ resolvida
    font: getComputedStyle(document.body).fontFamily || 'system-ui, sans-serif',
    deep: v('--deep', '#031514'),
    surface: v('--surface', '#0B2B26'),
    borderStrong: v('--border-str', '#235347'),
    accent: v('--accent', '#8EB69B'),
    accentBright: v('--accent-bright', '#DAF1DE'),
    accent2: v('--accent2', '#235347'),
    fg: v('--fg', '#DAF1DE'),
    fgMuted: v('--fg-muted', '#8EB69B'),
    fgSubtle: v('--fg-subtle', '#5C8574'),
  };
}

/**
 * Que pedaÃ§o do mundo estÃ¡ aparecendo, em graus. Vale ouro: Ã© o que evita
 * varrer 46 mil cidades e 177 paÃ­ses a cada quadro.
 * Devolve null quando a janela Ã© larga demais (aÃ­ desenha tudo mesmo).
 */
function visibleBounds(projection: GeoProjection, w: number, h: number): Bounds | null {
  const invert = projection.invert;
  if (!invert) return null;
  let lon0 = 180;
  let lon1 = -180;
  let lat0 = 90;
  let lat1 = -90;
  let hits = 0;
  const N = 6;
  for (let i = 0; i <= N; i++) {
    for (let j = 0; j <= N; j++) {
      const p = invert([(i / N) * w, (j / N) * h]);
      if (!p || !Number.isFinite(p[0]) || !Number.isFinite(p[1])) continue;
      hits++;
      if (p[0] < lon0) lon0 = p[0];
      if (p[0] > lon1) lon1 = p[0];
      if (p[1] < lat0) lat0 = p[1];
      if (p[1] > lat1) lat1 = p[1];
    }
  }
  // Poucos pontos caÃ­ram no mapa, ou a janela dÃ¡ quase a volta ao mundo
  // (inclusive quando ela passa pela linha de data): desenha tudo.
  if (hits < 6 || lon1 - lon0 > 170 || lat1 - lat0 > 150) return null;
  const m = 2; // margem em graus, pra nada nascer estourado na borda
  return {
    lon0: Math.max(-180, lon0 - m),
    lon1: Math.min(180, lon1 + m),
    lat0: Math.max(-90, lat0 - m),
    lat1: Math.min(90, lat1 + m),
    wrap: false,
  };
}

interface Hit {
  x: number;
  y: number;
  sel: Selection;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Mapa da jornada. Arrastar gira o globo, a roda com Ctrl dÃ¡ zoom e, igual
// no Google Maps, o mundo vai abrindo conforme vocÃª aproxima: primeiro os
// paÃ­ses, depois as cidades grandes, depois as pequenas â€” e a costa ganha
// detalhe (Ã© aÃ­ que as ilhas aparecem). Clicar em qualquer coisa abre a
// ficha dela.
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export default function WorldMap() {
  const t = useTranslations('map');
  const locale = useLocale() as 'pt' | 'en';

  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<Mode>('globe');
  const [spinning, setSpinning] = useState(true);
  const [sel, setSel] = useState<Selection | null>(null);
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [scrollHint, setScrollHint] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  // Sobe de um a cada camada de dados que chega â€” Ã© o que manda a busca
  // refazer a conta quando o mundo termina de baixar
  const [dataVersion, setDataVersion] = useState(0);
  // No celular nÃ£o existe "Ctrl + roda" â€” a dica precisa falar de pinÃ§a
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    setTouch(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  const nf = useMemo(() => new Intl.NumberFormat(locale === 'pt' ? 'pt-BR' : 'en-US'), [locale]);

  // Resultados da busca. `dataVersion` entra na conta de propÃ³sito: quando uma
  // camada nova de cidades termina de baixar, a lista precisa ser refeita.
  const results = useMemo(
    () => (dataVersion >= 0 ? searchCities(query, locale, 8) : []),
    [query, locale, dataVersion]
  );

  // Onde a cÃ¢mera comeÃ§a: centrada no lugar onde ele mora hoje
  const base = useMemo(() => TRAVELS.find((s) => s.status === 'lived') ?? TRAVELS[0], []);
  const home = useMemo(
    () =>
      base
        ? ([-base.coords[0], -base.coords[1] * 0.7] as [number, number])
        : ([0, -10] as [number, number]),
    [base]
  );

  // â”€â”€ Estado da cÃ¢mera vive em refs: muda 60x por segundo, entÃ£o nÃ£o pode
  //    passar pelo React (senÃ£o Ã© re-render em cada quadro) â”€â”€
  const view = useRef({ rot: [...home] as [number, number], pan: [0, 0] as [number, number], zoom: 1 });
  const size = useRef({ w: 0, h: 0, dpr: 1 });
  const themeRef = useRef<Theme | null>(null);
  const hitsRef = useRef<Hit[]>([]);
  const cityHitsRef = useRef<Hit[]>([]);
  const occRef = useRef<{ cols: number; rows: number; buf: Uint8Array } | null>(null);
  // CÃ©u + oceano + atmosfera jÃ¡ pintados, prontos pra colar
  const skyRef = useRef<{ key: string; canvas: HTMLCanvasElement } | null>(null);
  // Densidade real da tela, e se o desenho estÃ¡ no modo econÃ´mico
  const dprFullRef = useRef(1);
  const emBaixaRef = useRef(false);
  const cardBox = useRef<{ key: string; h: number }>({ key: '', h: 0 });
  const flatBase = useRef<{ w: number; h: number; s: number; t: [number, number] } | null>(null);
  const flyRef = useRef<{
    t0: number;
    dur: number;
    fromRot: [number, number];
    dRot: [number, number];
    fromZoom: number;
    toZoom: number;
    fromPan: [number, number];
    toPan: [number, number];
  } | null>(null);

  const modeRef = useRef(mode);
  const spinRef = useRef(spinning);
  const selRef = useRef(sel);
  const draggingRef = useRef(false);
  const readyRef = useRef(false);
  const reduceMotion = useRef(false);
  const visibleRef = useRef(true);
  // Mapa parado nÃ£o precisa ser redesenhado 60x por segundo. `dirty` marca
  // "algo mudou, redesenha"; `anim` diz se tem algo se mexendo sozinho na
  // tela (estrelas piscando, a rota correndo, o pulso do pino da base).
  const dirtyRef = useRef(true);
  const animRef = useRef(true);

  // Instante da Ãºltima mexida na cÃ¢mera â€” o desenho usa isso pra saber se
  // deve caprichar (parado) ou correr (arrastando)
  const lastMoveRef = useRef(0);

  const markDirty = useCallback(() => {
    dirtyRef.current = true;
    lastMoveRef.current = performance.now();
  }, []);

  useEffect(() => {
    modeRef.current = mode;
    flatBase.current = null;
  }, [mode]);
  useEffect(() => {
    spinRef.current = spinning;
  }, [spinning]);
  useEffect(() => {
    selRef.current = sel;
  }, [sel]);

  const select = useCallback(
    (next: Selection | null) => {
      if (sameSelection(selRef.current, next)) return;
      selRef.current = next; // jÃ¡ vale no prÃ³ximo quadro, sem esperar o React
      dirtyRef.current = true;
      setSel(next);
    },
    []
  );

  // Enquadramento do planisfÃ©rio. fitSize percorre o mundo inteiro pra achar
  // a escala â€” caro demais pra rodar a cada quadro, entÃ£o fica em cache.
  const getFlatBase = useCallback(() => {
    const { w, h } = size.current;
    if (!flatBase.current || flatBase.current.w !== w || flatBase.current.h !== h) {
      const land = currentLand(110);
      const fitted = geoNaturalEarth1();
      fitted.fitSize([w, h], { type: 'FeatureCollection', features: land.features });
      flatBase.current = { w, h, s: fitted.scale(), t: fitted.translate() as [number, number] };
    }
    return flatBase.current;
  }, []);

  // ProjeÃ§Ã£o do planisfÃ©rio pra um zoom/deslocamento quaisquer â€” o desenho usa
  // a cÃ¢mera atual, o "voar atÃ©" usa a cÃ¢mera de destino
  const flatProjection = useCallback(
    (zoom: number, pan: [number, number]) => {
      const { w, h } = size.current;
      const { s, t: tr } = getFlatBase();
      return geoNaturalEarth1()
        .precision(precisionForZoom(zoom))
        .scale(s * zoom)
        .translate([
          (tr[0] - w / 2) * zoom + w / 2 + pan[0],
          (tr[1] - h / 2) * zoom + h / 2 + pan[1],
        ]);
    },
    [getFlatBase]
  );

  // â”€â”€ ProjeÃ§Ã£o do quadro atual â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // `precisaoMinima` deixa o desenho pedir um traÃ§o mais grosseiro enquanto a
  // cÃ¢mera estÃ¡ em movimento.
  const buildProjection = useCallback(
    (precisaoMinima = 0): GeoProjection => {
      const { w, h } = size.current;
      const v = view.current;
      const precisao = Math.max(precisionForZoom(v.zoom), precisaoMinima);

      if (modeRef.current === 'globe') {
        return geoOrthographic()
          .rotate([v.rot[0], v.rot[1], 0])
          .translate([w / 2 + v.pan[0], h / 2 + v.pan[1]])
          .scale((Math.min(w, h) / 2 - 12) * v.zoom)
          .clipAngle(90)
          .precision(precisao);
      }

      return flatProjection(v.zoom, v.pan).precision(precisao);
    },
    [flatProjection]
  );

  // â”€â”€ O desenho de um quadro â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const paint = useCallback(
    (ts: number) => {
      const canvas = canvasRef.current;
      const theme = themeRef.current;
      const { w, h, dpr } = size.current;
      if (!canvas || !theme || !w || !h) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const v = view.current;
      const isGlobe = modeRef.current === 'globe';
      const mexendo = ts - lastMoveRef.current < 200;
      // `precis×½ÚÚ$z{-®éÜj×6ÆV%F–ÖV÷WB††–çEF–ÖW"“°Ğ¢6çf2ç&VÖ÷fTWfVçDÆ—7FVæW"‚wö–çFW&F÷vârÂöäF÷vâ“°Ğ¢6çf2ç&VÖ÷fTWfVçDÆ—7FVæW"‚wö–çFW&Ö÷fRrÂöäÖ÷fR“°Ğ¢6çf2ç&VÖ÷fTWfVçDÆ—7FVæW"‚wö–çFW'WrÂVæDG&r“°Ğ¢6çf2ç&VÖ÷fTWfVçDÆ—7FVæW"‚wö–çFW&6æ6VÂrÂVæDG&r“°Ğ¢6çf2ç&VÖ÷fTWfVçDÆ—7FVæW"‚wö–çFW&ÆVfRrÂöäÆVfR“°Ğ¢6çf2ç&VÖ÷fTWfVçDÆ—7FVæW"‚vF&Æ6Æ–6²rÂöäF÷V&ÆR“°Ğ¢6çf2ç&VÖ÷fTWfVçDÆ—7FVæW"‚wv†VVÂrÂöåv†VVÂ“°Ğ¢6çf2ç&VÖ÷fTWfVçDÆ—7FVæW"‚v¶W–F÷vârÂöä¶W’“°Ğ¢v–æF÷rç&VÖ÷fTWfVçDÆ—7FVæW"‚wö–çFW'WrÂöåv–æF÷uW“°Ğ¢v–æF÷rç&VÖ÷fTWfVçDÆ—7FVæW"‚wö–çFW&6æ6VÂrÂöåv–æF÷uW“°Ğ¢Ó°Ğ¢ÒÂ¶'V–ÆE&ö¦V7F–öâÂ6Æ×âÂfÇ•FòÂÖ&´F—'G’Â&W6WEf–WrÂ6VÆV7BÂ¦ööÔ'•Ò“°Ğ Ğ¢6öç7B7FGW4Æ&VÃ¢&V6÷&CÅG&fVÅ7FGW2Â7G&–æsâÒW6TÖVÖò€Ğ¢‚’Óâ‡°Ğ¢Æ—fVC¢B‚w7FGW5öÆ—fVBr’ÀĞ¢f—6—FVC¢B‚w7FGW5÷f—6—FVBr’ÀĞ¢ÆææVC¢B‚w7FGW5÷ÆææVBr’ÀĞ¢Ò’ÀĞ¢·EĞĞ¢“°Ğ Ğ¢òò)H)H6öçF\;¦FòFò6'L:6ò)H)H Ğ¢6öç7B6&BÒW6TÖVÖò‚‚’Óâ°Ğ¢–b‚6VÂ’&WGW&âçVÆÃ°Ğ Ğ¢–b‡6VÂæ¶–æBÓÓÒw7F÷r’°Ğ¢6öç7B7F÷ÒE$dTÅ2æf–æB‚‡2’Óâ2æ–BÓÓÒ6VÂæ–B“°Ğ¢–b‚7F÷’&WGW&âçVÆÃ°Ğ¢&WGW&â°Ğ¢F÷C¢7F÷ç7FGW2ÓÓÒvÆ—fVBròtÄõuôu$TTâ¢wf"‚ÒÖ66VçB’rÀĞ¢¶–6¶W#¢G·7FGW4Æ&VÅ·7F÷ç7FGW5×ÒG·7F÷ç–V"ò+rG·7F÷ç–V'Ö¢rwÖÀĞ¢F—FÆS Ğ¢7F÷æ6÷VçG'•¶Æö6ÆUÒÓÒ7F÷ææÖU¶Æö6ÆUĞĞ¢òG·7F÷ææÖU¶Æö6ÆU×Ò(	BG·7F÷æ6÷VçG'•¶Æö6ÆU×Ö Ğ¢¢7F÷ææÖU¶Æö6ÆUÒÀĞ¢æ÷FS¢7F÷ææ÷FSòå¶Æö6ÆUÒóòçVÆÂÀĞ¢&÷w3¢µÒ2·7G&–ærÂ7G&–æuÕµÒÀĞ¢Ó°Ğ¢ĞĞ Ğ¢–b‡6VÂæ¶–æBÓÓÒv6—G’r’°Ğ¢6öç7B¶æÖRÂÆöâÂÆBÂ÷Â62Â6—FÅÒÒ6VÂæ6—G“°Ğ¢6öç7B6÷VçG'’Ò6÷VçG'”'”Ç†"†62“°Ğ¢6öç7B&÷w3¢·7G&–ærÂ7G&–æuÕµÒÒµ·B‚v–æfõ÷÷VÆF–öâr’Âæbæf÷&ÖB‡÷•ÕÓ°Ğ¢–b†&6R’°Ğ¢6öç7B¶ÒÒvVôF—7Fæ6R…¶ÆöâÂÆEÒÂ&6Ræ6ö÷&G2’¢$”õõDU%$ô´Ó°Ğ¢&÷w2çW6‚…·B‚v–æfõög&öÕö&6Rr’ÂG¶æbæf÷&ÖB„ÖF‚ç&÷VæB†¶Ò’—Ò¶ÖÒ“°Ğ¢ĞĞ¢&WGW&â°Ğ¢F÷C¢wf"‚ÒÖ66VçBÖ'&–v‡B’rÀĞ¢¶–6¶W#¢6—FÂòB‚v–æfõö6—FÅööeö6÷VçG'’r’¢B‚v–æfõö6—G’r’ÀĞ¢F—FÆS¢6÷VçG'’òG¶æÖWÒ(	BG¶6÷VçG'•¶Æö6ÆU×Ö¢æÖRÀĞ¢æ÷FS¢çVÆÂÀĞ¢&÷w2ÀĞ¢Ó°Ğ¢ĞĞ Ğ¢6öç7B–æfòÒ6÷VçG'”'”çVÖW&–2‡6VÂæ–B“°Ğ¢–b‚–æfò’&WGW&âçVÆÃ°Ğ¢6öç7B&÷w3¢·7G&–ærÂ7G&–æuÕµÒÒµÓ°Ğ¢–b†–æfòæ6—FÂ’&÷w2çW6‚…·B‚v–æfõö6—FÂr’Â–æfòæ6—FÅÒ“°Ğ¢–b†–æfòç&Vv–öâ’&÷w2çW6‚…·B‚v–æfõ÷&Vv–öâr’Â–æfòç&Vv–öå¶Æö6ÆUÕÒ“°Ğ¢–b†–æfòæ&V’&÷w2çW6‚…·B‚v–æfõö&Vr’ÂG¶æbæf÷&ÖB†–æfòæ&V—Ò¶Ü+&Ò“°Ğ¢&WGW&â°Ğ¢F÷C¢wf"‚ÒÖ66VçB’rÀĞ¢¶–6¶W#¢B‚v–æfõö6÷VçG'’r’ÀĞ¢F—FÆS¢–æfõ¶Æö6ÆUÒÀĞ¢æ÷FS¢çVÆÂÀĞ¢&÷w2ÀĞ¢Ó°Ğ¢ÒÂ·6VÂÂÆö6ÆRÂæbÂ&6RÂBÂ7FGW4Æ&VÅÒ“°Ğ Ğ¢6öç7B7G&Ä'FâĞĞ¢v–æÆ–æRÖfÆW‚—FV×2Ö6VçFW"§W7F–g’Ö6VçFW"&÷VæFVB×†Â&÷&FW"&÷&FW"Ö&÷&FW"×7G&öærósFW‡BÖf÷&Vw&÷VæBÖ×WFVBG&ç6—F–öâ†÷fW#§FW‡BÖf÷&Vw&÷VæB†÷fW#¦&÷&FW"Ö66VçB†÷fW#¦&r×7W&f6RÖVÆWfFVBósF—6&ÆVC¦÷6—G’ÓCs°Ğ Ğ¢&WGW&â€Ğ¢ÆF—b6Æ74æÖSÒ'&VÆF—fR#àĞ¢ÆÖ÷F–öâæF—`Ğ¢–æ—F–Ã×·²÷6—G“¢Â“¢#B×ĞĞ¢v†–ÆT–åf–Ws×·²÷6—G“¢Â“¢×ĞĞ¢f–Ww÷'C×·²öæ6S¢G'VRÂÖ&v–ã¢rÓc‚r×ĞĞ¢G&ç6—F–öã×·²GW&F–öã¢ã‚ÂV6S¢³ã#"ÂÂã3bÂÒ×ĞĞ¢6Æ74æÖSÒ'&VÆF—fR&÷VæFVBÓ7†Â&÷&FW"&÷&FW"Ö&÷&FW"÷fW&fÆ÷rÖ†–FFVâ Ğ¢7G–ÆS×·²&6¶w&÷VæC¢wf"‚ÒÖFVW’r×ĞĞ¢àĞ¢²ò¢6—†FòÖ¢ò6çf2ö7WGVFòRò&W7FòfÇWGV÷"6–Ö¢÷ĞĞ¢ÆF—`Ğ¢&Vc×¶&÷…&VgĞĞ¢6Æ74æÖSÒ'&VÆF—fRrÖgVÆÂ‚Õ¶6Æ×ƒ3#‚ÃS‡f‚Ãc‚•Ò Ğ¢7G–ÆS×·²F÷V6„7F–öã¢væöæRr×ĞĞ¢àĞ¢Æ6çf0Ğ¢&Vc×¶6çf5&VgĞĞ¢F$–æFWƒ×³ĞĞ¢&öÆSÒ&–Ör Ğ¢&–ÖÆ&VÃ×·B‚vÖöÇBr—ĞĞ¢6Æ74æÖS×¶&Æö6²rÖgVÆÂ‚ÖgVÆÂ÷WFÆ–æRÖæöæRG¶G&vv–æròv7W'6÷"Öw&&&–ærr¢v7W'6÷"Öw&"wÖĞĞ¢óàĞ Ğ¢²ò¢VçVçFòò&–ÖV—&òVG&òì:6ò6’¢÷ĞĞ¢²&VG’bb€Ğ¢ÆF—b6Æ74æÖSÒ&'6öÇWFR–ç6WBÓw&–BÆ6RÖ—FV×2Ö6VçFW"#àĞ¢Ç7â6Æ74æÖSÒ&föçB×—†VÂFW‡BÕ³…ÒG&6¶–ærÕ³ã6VÕÒWW&66RFW‡BÖf÷&Vw&÷VæB×7V'FÆRæ–ÖFR×VÇ6R#àĞ¢·B‚vÆöF–ærr—ĞĞ¢Â÷7ãàĞ¢ÂöF—càĞ¢—ĞĞ Ğ¢²ò¢f–6†FòVRW7L:W66öÆ†–Fò(	B÷6–6–öæFVÆòÆö÷FRFW6Væ†ò¢÷ĞĞ¢ÆF—`Ğ¢&Vc×¶6&E&VgĞĞ¢&–Ö†–FFVã×²6&GĞĞ¢6Æ74æÖSÒ'ö–çFW"ÖWfVçG2ÖæöæR'6öÇWFR¢ÓrÓSb×G&ç6ÆFR×‚Óó"&÷VæFVBÓ'†ÂvÆ72×7G&öær&÷&FW"&÷&FW"Ö&÷&FW"ÓB6†F÷r×†Â6†F÷rÖ&Æ6²óCG&ç6—F–öâÖ÷6—G’GW&F–öâÓ# Ğ¢7G–ÆS×·²÷6—G“¢ÂÆVgC¢rÓ““—‚rÂF÷¢rÓ““—‚r×ĞĞ¢àĞ¢¶6&Bbb€Ğ¢ÃàĞ¢ÆF—b6Æ74æÖSÒ&fÆW‚—FV×2Ö6VçFW"vÓ"Ö"ÓãR#àĞ¢Ç7â&–Ö†–FFVâ6Æ74æÖSÒ'rÓ"‚Ó"&÷VæFVBÖgVÆÂ"7G–ÆS×·²&6¶w&÷VæC¢6&BæF÷B×ÒóàĞ¢Ç7â6Æ74æÖSÒ'FW‡BÕ³…ÒföçB×6VÖ–&öÆBWW&66RG&6¶–ær×v–FW7BFW‡BÖf÷&Vw&÷VæB×7V'FÆR#àĞ¢¶6&Bæ¶–6¶W'ĞĞ¢Â÷7ãàĞ¢ÂöF—càĞ¢Ç6Æ74æÖSÒ&föçBÖ&öÆBFW‡BÖf÷&Vw&÷VæBFW‡B×6ÒÖ"Ó#ç¶6&BçF—FÆWÓÂ÷àĞ¢¶6&Bææ÷FRbb€Ğ¢Ç6Æ74æÖSÒ'FW‡B×‡2FW‡BÖf÷&Vw&÷VæBÖ×WFVBÆVF–ær×&VÆ†VB#ç¶6&Bææ÷FWÓÂ÷àĞ¢—ĞĞ¢¶6&Bç&÷w2æÆVæwF‚âbb€Ğ¢ÆFÂ6Æ74æÖSÒ&×BÓ"76R×’Ó#àĞ¢¶6&Bç&÷w2æÖ‚…¶Æ&VÂÂfÇVUÒ’Óâ€Ğ¢ÆF—b¶W“×¶Æ&VÇÒ6Æ74æÖSÒ&fÆW‚—FV×2Ö&6VÆ–æR§W7F–g’Ö&WGvVVâvÓ2FW‡B×‡2#àĞ¢ÆGB6Æ74æÖSÒ'FW‡BÖf÷&Vw&÷VæB×7V'FÆR#ç¶Æ&VÇÓÂöGCàĞ¢ÆFB6Æ74æÖSÒ&föçB×6VÖ–&öÆBFW‡BÖf÷&Vw&÷VæBÖ×WFVBFW‡B×&–v‡B#ç·fÇVWÓÂöFCàĞ¢ÂöF—càĞ¢’—ĞĞ¢ÂöFÃàĞ¢—ĞĞ¢ÂóàĞ¢—ĞĞ¢ÂöF—càĞ Ğ¢²ò¢6öçG&öÆW2(	B6çFò7WW&–÷"F—&V—Fò¢÷ĞĞ¢ÆF—b6Æ74æÖSÒ&'6öÇWFRF÷Ó2&–v‡BÓ2¢Ó#fÆW‚fÆW‚Ö6öÂvÓ"#àĞ¢ÆF—b6Æ74æÖSÒ&fÆW‚fÆW‚Ö6öÂ&÷VæFVB×†ÂvÆ72÷fW&fÆ÷rÖ†–FFVâ#àĞ¢Æ'WGFöàĞ¢G—SÒ&'WGFöâ Ğ¢öä6Æ–6³×²‚’Óâ¦ööÔ'’ƒãR—ĞĞ¢&–ÖÆ&VÃ×·B‚w¦ööÕö–âr—ĞĞ¢F—FÆS×·B‚w¦ööÕö–âr—ĞĞ¢6Æ74æÖS×¶G¶7G&Ä'FçÒrÓ’‚Ó’&÷VæFVBÖæöæR&÷&FW"ÓĞĞ¢àĞ¢ÅÇW26—¦S×³WÒóàĞ¢Âö'WGFöãàĞ¢Ç7â&–Ö†–FFVâ6Æ74æÖSÒ&‚×‚&rÖ&÷&FW""óàĞ¢Æ'WGFöàĞ¢G—SÒ&'WGFöâ Ğ¢öä6Æ–6³×²‚’Óâ¦ööÔ'’ƒòãR—ĞĞ¢&–ÖÆ&VÃ×·B‚w¦ööÕö÷WBr—ĞĞ¢F—FÆS×·B‚w¦ööÕö÷WBr—ĞĞ¢6Æ74æÖS×¶G¶7G&Ä'FçÒrÓ’‚Ó’&÷VæFVBÖæöæR&÷&FW"ÓĞĞ¢àĞ¢ÄÖ–çW26—¦S×³WÒóàĞ¢Âö'WGFöãàĞ¢ÂöF—càĞ Ğ¢Æ'WGFöàĞ¢G—SÒ&'WGFöâ Ğ¢öä6Æ–6³×·&W6WEf–WwĞĞ¢&–ÖÆ&VÃ×·B‚w&W6WBr—ĞĞ¢F—FÆS×·B‚w&W6WBr—ĞĞ¢6Æ74æÖS×¶G¶7G&Ä'FçÒrÓ’‚Ó’vÆ76ĞĞ¢àĞ¢Å&÷FFT67r6—¦S×³GÒóàĞ¢Âö'WGFöãàĞ Ğ¢Æ'WGFöàĞ¢G—SÒ&'WGFöâ Ğ¢öä6Æ–6³×²‚’Óâ6WE7–ææ–ær‚‡2’Óâ2—ĞĞ¢&–ÖÆ&VÃ×·7–ææ–æròB‚w7–å÷W6Rr’¢B‚w7–å÷Æ’r—ĞĞ¢F—FÆS×·7–ææ–æròB‚w7–å÷W6Rr’¢B‚w7–å÷Æ’r—ĞĞ¢F—6&ÆVC×¶ÖöFRÓÓÒvfÆBwĞĞ¢6Æ74æÖS×¶G¶7G&Ä'FçÒrÓ’‚Ó’vÆ76ĞĞ¢àĞ¢·7–ææ–æròÅW6R6—¦S×³GÒóâ¢ÅÆ’6—¦S×³GÒóçĞĞ¢Âö'WGFöãàĞ¢ÂöF—càĞ Ğ¢²ò¢vÆö&ò(iBÆæ—6l:—&–ò(	B6çFò7WW&–÷"W7VW&Fò¢÷ĞĞ¢ÆF—b6Æ74æÖSÒ&'6öÇWFRF÷Ó2ÆVgBÓ2¢Ó#fÆW‚&÷VæFVB×†ÂvÆ72÷fW&fÆ÷rÖ†–FFVâFW‡B×‡2föçB×6VÖ–&öÆB#àĞ¢²€Ğ¢°Ğ¢²vvÆö&RrÂvÆö&S"ÂB‚vÖöFUövÆö&Rr•ÒÀĞ¢²vfÆBrÂÖ–6öâÂB‚vÖöFUöfÆBr•ÒÀĞ¢Ò26öç7@Ğ¢’æÖ‚…¶ÒÂ–6öâÂÆ&VÅÒ’Óâ€Ğ¢Æ'WGFöàĞ¢¶W“×¶×ĞĞ¢G—SÒ&'WGFöâ Ğ¢öä6Æ–6³×²‚’Óâ°Ğ¢–b†ÒÓÓÒÖöFR’&WGW&ã°Ğ¢6WDÖöFR†Ò“°Ğ¢f–Wræ7W'&VçBçâÒ³ÂÓ°Ğ¢f–Wræ7W'&VçBç¦ööÒÒ°Ğ¢fÇ•&Vbæ7W'&VçBÒçVÆÃ°Ğ¢6VÆV7B†çVÆÂ“°Ğ¢Ö&´F—'G’‚“°Ğ¢×ĞĞ¢&–×&W76VC×¶ÖöFRÓÓÒ×ĞĞ¢6Æ74æÖS×¶–æÆ–æRÖfÆW‚—FV×2Ö6VçFW"vÓãR‚Ó2’Ó"G&ç6—F–öâG°Ğ¢ÖöFRÓÓÒĞĞ¢òwFW‡BÖf÷&Vw&÷VæB&r×7W&f6RÖVÆWfFVBóƒpĞ¢¢wFW‡BÖf÷&Vw&÷VæB×7V'FÆR†÷fW#§FW‡BÖf÷&Vw&÷VæBÖ×WFVBpĞ¢ÖĞĞ¢àĞ¢Ä–6öâ6—¦S×³7ÒóàĞ¢¶Æ&VÇĞĞ¢Âö'WGFöãàĞ¢’—ĞĞ¢ÂöF—càĞ Ğ¢²ò¢'W66¢F–v—F"VÇVW"ÇVv"Fò×VæFòRfö"L:’VÆR¢÷ĞĞ¢ÆF—b6Æ74æÖSÒ&'6öÇWFRF÷ÓBÆVgBÓ2¢Ó3rÕ¶Ö–âƒw&VÒÆ6Æ2ƒRÓãW&VÒ’•Ò#àĞ¢ÆF—b6Æ74æÖSÒ'&VÆF—fR#àĞ¢Å6V&6€Ğ¢6—¦S×³GĞĞ¢&–Ö†–FFVàĞ¢6Æ74æÖSÒ&'6öÇWFRÆVgBÓ2F÷Óó"×G&ç6ÆFR×’Óó"FW‡BÖf÷&Vw&÷VæB×7V'FÆRö–çFW"ÖWfVçG2ÖæöæR Ğ¢óàĞ¢Æ–çW@Ğ¢G—SÒ'6V&6‚ Ğ¢fÇVS×·VW'—ĞĞ¢öä6†ævS×²†R’Óâ6WEVW'’†RçF&vWBçfÇVR—ĞĞ¢öäfö7W3×²‚’Óâ°Ğ¢òò<;2VVÒf’'W66"&V6—6F÷2#RÖ–ÂæöÖW2(	BVçL:6òVÆW0Ğ¢òòFW66VÒv÷&Âì:6òæò6'&VvÖVçFòF:v–æĞ¢Vç7W&T6—F–W2ƒ2ÂöäÆ–W%&VG’æ7W'&VçB“°Ğ¢6WE6V&6„÷Vâ‡G'VR“°Ğ¢×ĞĞ¢öä¶W”F÷vã×²†R’Óâ°Ğ¢–b†Ræ¶W’ÓÓÒtW66Rr’°Ğ¢6WEVW'’‚rr“°Ğ¢6WE6V&6„÷Vâ†fÇ6R“°Ğ¢†RçF&vWB2…DÔÄ–çWDVÆVÖVçB’æ&ÇW"‚“°Ğ¢ĞĞ¢–b†Ræ¶W’ÓÓÒtVçFW"rbb&W7VÇG5³Ò’°Ğ¢fÇ•Fô6—G’‡&W7VÇG5³Òæ6—G’“°Ğ¢6WE6V&6„÷Vâ†fÇ6R“°Ğ¢ĞĞ¢×ĞĞ¢Æ6V†öÆFW#×·B‚w6V&6…÷Æ6V†öÆFW"r—ĞĞ¢&–ÖÆ&VÃ×·B‚w6V&6…÷Æ6V†öÆFW"r—ĞĞ¢6Æ74æÖSÒ'rÖgVÆÂ&÷VæFVB×†ÂvÆ72ÂÓ’"Ó2’Ó"FW‡B×‡2FW‡BÖf÷&Vw&÷VæBÆ6V†öÆFW#§FW‡BÖf÷&Vw&÷VæB×7V'FÆR÷WFÆ–æRÖæöæRfö7W2×f—6–&ÆS¦&÷&FW"Ö66VçB²c£¢×vV&¶—B×6V&6‚Ö6æ6VÂÖ'WGFöåÓ¦†–FFVâ Ğ¢óàĞ¢ÂöF—càĞ Ğ¢·6V&6„÷VâbbVW'’çG&–Ò‚’æÆVæwF‚ãÒ"bb€Ğ¢ÇVÂ6Æ74æÖSÒ&×BÓãRÖ‚Ö‚ÓcB÷fW&fÆ÷r×’ÖWFò&÷VæFVB×†ÂvÆ72×7G&öærF—f–FR×’F—f–FRÖ&÷&FW"óc6†F÷r×†Â6†F÷rÖ&Æ6²óC#àĞ¢·&W7VÇG2æÆVæwF‚ÓÓÒò€Ğ¢ÆÆ’6Æ74æÖSÒ'‚Ó2’Ó"ãRFW‡B×‡2FW‡BÖf÷&Vw&÷VæB×7V'FÆR#àĞ¢¶ÆöF–ætFFòB‚vÆöF–æu÷Æ6W2r’¢B‚w6V&6…öV×G’r—ĞĞ¢ÂöÆ“àĞ¢’¢€Ğ¢&W7VÇG2æÖ‚‡²6—G’Â—2Ò’Óâ€Ğ¢ÆÆ’¶W“×¶G¶6—G•³××ÂG¶6—G•³××ÂG¶6—G•³%×ÖÓàĞ¢Æ'WGFöàĞ¢G—SÒ&'WGFöâ Ğ¢öä6Æ–6³×²‚’Óâ°Ğ¢fÇ•Fô6—G’†6—G’“°Ğ¢6WE6V&6„÷Vâ†fÇ6R“°Ğ¢×ĞĞ¢6Æ74æÖSÒ'rÖgVÆÂFW‡BÖÆVgB‚Ó2’Ó"G&ç6—F–öâ†÷fW#¦&r×7W&f6RÖVÆWfFVBós Ğ¢àĞ¢Ç7â6Æ74æÖSÒ&&Æö6²FW‡B×‡2föçB×6VÖ–&öÆBFW‡BÖf÷&Vw&÷VæB#àĞ¢¶6—G•³×ĞĞ¢Â÷7ãàĞ¢Ç7â6Æ74æÖSÒ&&Æö6²FW‡BÕ³…ÒFW‡BÖf÷&Vw&÷VæB×7V'FÆR#àĞ¢·—7Ò+r¶æbæf÷&ÖB†6—G•³5Ò—ĞĞ¢Â÷7ãàĞ¢Âö'WGFöãàĞ¢ÂöÆ“àĞ¢’Ğ¢—ĞĞ¢Â÷VÃàĞ¢—ĞĞ¢ÂöF—càĞ Ğ¢²ò¢&—†æFòVÖ6ÖFæ÷fFR6–FFW2¢÷ĞĞ¢¶ÆöF–ætFFbb€Ğ¢Ç7â6Æ74æÖSÒ&'6öÇWFR&÷GFöÒÓ2&–v‡BÓ2¢Ó#&÷VæFVBÖgVÆÂvÆ72‚Ó2’ÓFW‡BÕ³…ÒWW&66RG&6¶–ær×v–FW7BFW‡BÖf÷&Vw&÷VæB×7V'FÆR#àĞ¢·B‚vÆöF–æu÷Æ6W2r—ĞĞ¢Â÷7ãàĞ¢—ĞĞ Ğ¢²ò¢F–6FR&öÆvVÒ(	B&V6R<;2VæFòW76öFVçFF"¦ööÒ6VÒ7G&Â¢÷ĞĞ¢ÆF—`Ğ¢6Æ74æÖS×¶ö–çFW"ÖWfVçG2ÖæöæR'6öÇWFR–ç6WBÓ¢Ó3w&–BÆ6RÖ—FV×2Ö6VçFW"G&ç6—F–öâÖ÷6—G’GW&F–öâÓ#G°Ğ¢67&öÆÄ†–çBòv÷6—G’Ór¢v÷6—G’ÓpĞ¢ÖĞĞ¢àĞ¢Ç7â6Æ74æÖSÒ'&÷VæFVBÖgVÆÂvÆ72×7G&öær‚ÓR’Ó"ãRFW‡B×‡2föçB×6VÖ–&öÆBFW‡BÖf÷&Vw&÷VæB#àĞ¢·B‚w67&öÆÅö†–çBr—ĞĞ¢Â÷7ãàĞ¢ÂöF—càĞ Ğ¢²ò¢–ç7G'\:|:6òF—67&WFæò&öF:’F6—†¢÷ĞĞ¢Ç6Æ74æÖSÒ'ö–çFW"ÖWfVçG2ÖæöæR'6öÇWFR&÷GFöÒÓ2ÆVgBÓó"×G&ç6ÆFR×‚Óó"¢Ó#FW‡BÕ³…ÒFW‡BÖf÷&Vw&÷VæB×7V'FÆRFW‡BÖ6VçFW"‚ÓB#àĞ¢·F÷V6‚òB‚vG&uö†–çE÷F÷V6‚r’¢B‚vG&uö†–çBr—ĞĞ¢Â÷àĞ¢ÂöF—càĞ¢ÂöÖ÷F–öâæF—càĞ Ğ¢²ò¢FÆ†÷3¢FV6ÆFòR6VÇVÆ"FÖ,:–Ò&V6—6Ò6†Vv"VÒ6FÇVv"¢÷ĞĞ¢ÆF—b6Æ74æÖSÒ&×BÓRfÆW‚fÆW‚×w&—FV×2Ö6VçFW"§W7F–g’Ö6VçFW"vÓ"#àĞ¢Ç7â6Æ74æÖSÒ'FW‡BÕ³…ÒWW&66RG&6¶–ær×v–FW7BFW‡BÖf÷&Vw&÷VæB×7V'FÆR×"Ó#àĞ¢·B‚v§V×÷Fòr—ĞĞ¢Â÷7ãàĞ¢µE$dTÅ2æÖ‚‡7F÷’Óâ€Ğ¢Æ'WGFöàĞ¢¶W“×·7F÷æ–GĞĞ¢G—SÒ&'WGFöâ Ğ¢öä6Æ–6³×²‚’ÓâfÇ•Fò‡7F÷æ–B—ĞĞ¢6Æ74æÖS×¶&÷VæFVBÖgVÆÂ&÷&FW"‚Ó2ãR’ÓãRFW‡B×‡2föçB×6VÖ–&öÆBG&ç6—F–öâG°Ğ¢6VÃòæ¶–æBÓÓÒw7F÷rbb6VÂæ–BÓÓÒ7F÷æ–@Ğ¢òv&÷&FW"Ö66VçBFW‡BÖf÷&Vw&÷VæB&r×7W&f6RÖVÆWfFVBpĞ¢¢v&÷&FW"Ö&÷&FW"FW‡BÖf÷&Vw&÷VæBÖ×WFVB†÷fW#¦&÷&FW"Ö66VçB†÷fW#§FW‡BÖf÷&Vw&÷VæBpĞ¢ÖĞĞ¢àĞ¢·7F÷ææÖU¶Æö6ÆU×ĞĞ¢Âö'WGFöãàĞ¢’—ĞĞ¢ÂöF—càĞ Ğ¢²ò¢ÆVvVæF¢÷ĞĞ¢ÆF—b6Æ74æÖSÒ&×BÓBfÆW‚fÆW‚×w&—FV×2Ö6VçFW"§W7F–g’Ö6VçFW"v×‚Óbv×’Ó"#àĞ¢²…²vÆ—fVBrÂwf—6—FVBrÂwÆææVBuÒ26öç7B’æÖ‚‡2’Óâ€Ğ¢Ç7â¶W“×·7Ò6Æ74æÖSÒ&–æÆ–æRÖfÆW‚—FV×2Ö6VçFW"vÓ"FW‡B×‡2FW‡BÖf÷&Vw&÷VæBÖ×WFVB#àĞ¢·2ÓÓÒwÆææVBrò€Ğ¢Ç7àĞ¢&–Ö†–FFVàĞ¢6Æ74æÖSÒ'rÓ2‚Ó2&÷VæFVBÖgVÆÂ&÷&FW"Ó"&÷&FW"ÖF6†VB Ğ¢7G–ÆS×·²&÷&FW$6öÆ÷#¢wf"‚ÒÖfr×7V'FÆR’r×ĞĞ¢óàĞ¢’¢€Ğ¢Ç7àĞ¢&–Ö†–FFVàĞ¢6Æ74æÖSÒ'rÓ2‚Ó2&÷VæFVBÖgVÆÂ Ğ¢7G–ÆS×·²&6¶w&÷VæC¢2ÓÓÒvÆ—fVBròtÄõuôu$TTâ¢wf"‚ÒÖ66VçB’r×ĞĞ¢óàĞ¢—ĞĞ¢·7FGW4Æ&VÅ·5×ĞĞ¢Â÷7ãàĞ¢’—ĞĞ¢ÂöF—càĞ Ğ¢²ò¢7,:–F—FòFRVVÒf¢÷2FF÷2W†—7F—&VÒ¢÷ĞĞ¢Ç6Æ74æÖSÒ&×BÓBFW‡BÖ6VçFW"FW‡BÕ³…ÒFW‡BÖf÷&Vw&÷VæB×7V'FÆR#ç·B‚vFFö7&VF—Br—ÓÂ÷àĞ¢ÂöF—càĞ¢“°Ğ§ĞĞ 