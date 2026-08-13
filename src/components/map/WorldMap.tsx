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

// Verde vívido usado só pra glow de destaque (mesmo tom do "você está aqui"
// da trilha em /about). Fora daqui o mapa lê os tokens reais de globals.css,
// então a paleta continua sendo um verde monocromático — sem ciano.
const GLOW_GREEN = '#35E065';

const MIN_ZOOM = 0.7;
const MAX_ZOOM = 16;
const SPIN_DEG_PER_SEC = 3.2; // giro ocioso do globo — lento, quase respirando
const RAIO_TERRA_KM = 6371;

// Teto de cidades escritas por quadro — segura o mapa liso e legível mesmo
// numa região abarrotada (a costa leste dos EUA, o Vale do Ganges…)
const MAX_CITY_LABELS = 130;

// Quanto maior a cidade, maior o nome e o ponto. É o que faz a hierarquia
// aparecer de relance: Nova York salta, Vineland fica de canto.
const cityStyle = (pop: number) => {
  if (pop >= 5_000_000) return { px: 14, r: 4.4 };
  if (pop >= 1_000_000) return { px: 12.5, r: 3.8 };
  if (pop >= 300_000) return { px: 11.5, r: 3.2 };
  if (pop >= 80_000) return { px: 10.8, r: 2.7 };
  return { px: 10.2, r: 2.3 };
};

type Mode = 'globe' | 'flat';

// O que está aberto no cartão: uma parada da jornada, uma cidade ou um país
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

// Estrelas do fundo — posições fixas (pseudo-aleatórias determinísticas) pra
// não "piscar de lugar" a cada render
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

// ── Helpers ───────────────────────────────────────────────────────────
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

// Interpola ângulos pelo caminho mais curto (evita o globo dar a volta ao mundo
// pro lado errado quando a rotação cruza os 180°)
const shortestAngle = (from: number, to: number) => {
  let d = ((to - from + 180) % 360) - 180;
  if (d < -180) d += 360;
  return d;
};

const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

/**
 * Quão fino o d3 deve picar as linhas do mapa.
 *
 * Ele reamostra cada trecho até ficar mais liso que `precision` pixels — de
 * longe isso é o que faz o contorno acompanhar a curva do globo. De perto,
 * porém, um único trecho vira centenas de pontos e o quadro despenca: a
 * curvatura da Terra num pedaço de 300 km simplesmente não aparece. Então o
 * corte vai afrouxando junto com o zoom.
 */
const precisionForZoom = (zoom: number) => (zoom < 2 ? 0.5 : zoom < 5 ? 2 : 10);

// Converte "#RRGGBB" em rgba() — o canvas não entende var(--token), então a
// cor vem do CSS e ganha alpha aqui
function alpha(color: string, a: number) {
  const hex = color.trim();
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

type Theme = ReturnType<typeof readTheme>;

// Uma única fonte de verdade pras cores: os tokens de globals.css
function readTheme(el: Element) {
  const cs = getComputedStyle(el);
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  return {
    // O canvas não entende var(--font-sans): pega a família já resolvida
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
 * Que pedaço do mundo está aparecendo, em graus. Vale ouro: é o que evita
 * varrer 46 mil cidades e 177 países a cada quadro.
 * Devolve null quando a janela é larga demais (aí desenha tudo mesmo).
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
  // Poucos pontos caíram no mapa, ou a janela dá quase a volta ao mundo
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

// ══════════════════════════════════════════════════════════════════════
// Mapa da jornada. Arrastar gira o globo, a roda com Ctrl dá zoom e, igual
// no Google Maps, o mundo vai abrindo conforme você aproxima: primeiro os
// países, depois as cidades grandes, depois as pequenas — e a costa ganha
// detalhe (é aí que as ilhas aparecem). Clicar em qualquer coisa abre a
// ficha dela.
// ══════════════════════════════════════════════════════════════════════
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
  // Sobe de um a cada camada de dados que chega — é o que manda a busca
  // refazer a conta quando o mundo termina de baixar
  const [dataVersion, setDataVersion] = useState(0);
  // No celular não existe "Ctrl + roda" — a dica precisa falar de pinça
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    setTouch(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  const nf = useMemo(() => new Intl.NumberFormat(locale === 'pt' ? 'pt-BR' : 'en-US'), [locale]);

  // Resultados da busca. `dataVersion` entra na conta de propósito: quando uma
  // camada nova de cidades termina de baixar, a lista precisa ser refeita.
  const results = useMemo(
    () => (dataVersion >= 0 ? searchCities(query, locale, 8) : []),
    [query, locale, dataVersion]
  );

  // Onde a câmera começa: centrada no lugar onde ele mora hoje
  const base = useMemo(() => TRAVELS.find((s) => s.status === 'lived') ?? TRAVELS[0], []);
  const home = useMemo(
    () =>
      base
        ? ([-base.coords[0], -base.coords[1] * 0.7] as [number, number])
        : ([0, -10] as [number, number]),
    [base]
  );

  // ── Estado da câmera vive em refs: muda 60x por segundo, então não pode
  //    passar pelo React (senão é re-render em cada quadro) ──
  const view = useRef({ rot: [...home] as [number, number], pan: [0, 0] as [number, number], zoom: 1 });
  const size = useRef({ w: 0, h: 0, dpr: 1 });
  const themeRef = useRef<Theme | null>(null);
  const hitsRef = useRef<Hit[]>([]);
  const cityHitsRef = useRef<Hit[]>([]);
  const occRef = useRef<{ cols: number; rows: number; buf: Uint8Array } | null>(null);
  // Céu + oceano + atmosfera já pintados, prontos pra colar
  const skyRef = useRef<{ key: string; canvas: HTMLCanvasElement } | null>(null);
  // Densidade real da tela, e se o desenho está no modo econômico
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
  // Mapa parado não precisa ser redesenhado 60x por segundo. `dirty` marca
  // "algo mudou, redesenha"; `anim` diz se tem algo se mexendo sozinho na
  // tela (estrelas piscando, a rota correndo, o pulso do pino da base).
  const dirtyRef = useRef(true);
  const animRef = useRef(true);

  // Instante da última mexida na câmera — o desenho usa isso pra saber se
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
      selRef.current = next; // já vale no próximo quadro, sem esperar o React
      dirtyRef.current = true;
      setSel(next);
    },
    []
  );

  // Enquadramento do planisfério. fitSize percorre o mundo inteiro pra achar
  // a escala — caro demais pra rodar a cada quadro, então fica em cache.
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

  // Projeção do planisfério pra um zoom/deslocamento quaisquer — o desenho usa
  // a câmera atual, o "voar até" usa a câmera de destino
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

  // ── Projeção do quadro atual ────────────────────────────────────────
  // `precisaoMinima` deixa o desenho pedir um traço mais grosseiro enquanto a
  // câmera está em movimento.
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

  // ── O desenho de um quadro ──────────────────────────────────────────
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
      // `precision` é o capricho com que a projeção acompanha uma curva. Em
      // movimento, um traço um pouco mais reto não é percebido e poupa
      // milhares de pontos por quadro.
      const projection = buildProjection(mexendo ? 2 : 0.5);
      const path = geoPath(projection, ctx);
      const still = reduceMotion.current;
      const selection = selRef.current;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const R = projection.scale();
      const cx = w / 2 + v.pan[0];
      const cy = h / 2 + v.pan[1];

      // A borda do planeta ainda cabe na tela? Aproximando muito ela sai de
      // vista, e aí desenhar a esfera inteira é trabalho jogado fora.
      const edgeVisible = !isGlobe || R < Math.hypot(w, h);

      // ── Céu, estrelas, atmosfera e oceano ──
      // Nada disso depende de PRA ONDE o globo está virado: só do tamanho da
      // caixa e do raio. Eram quatro pinturas de tela cheia por quadro (duas
      // em degradê, que é o tipo de coisa que a placa de vídeo cobra caro).
      // Agora é pintado uma vez num canvas de rascunho e daí em diante é só
      // colar — girar o globo virou uma colagem só.
      // Durante zoom/voo, arredondar o céu a cada 6 px evita recriar dois
      // gradientes de tela cheia em todos os quadros. Parado volta ao pixel
      // exato. No planisfério o fundo nem depende da câmera.
      const skyStep = mexendo ? 6 : 1;
      const skyKey = isGlobe
        ? `${w}|${h}|${dpr}|g|${Math.round(R / skyStep)}|${Math.round(cx / skyStep)}|${Math.round(cy / skyStep)}`
        : `${w}|${h}|${dpr}|f`;
      if (!skyRef.current || skyRef.current.key !== skyKey) {
        const off = skyRef.current?.canvas ?? document.createElement('canvas');
        off.width = Math.round(w * dpr);
        off.height = Math.round(h * dpr);
        const sc = off.getContext('2d');
        if (sc) {
          sc.setTransform(dpr, 0, 0, dpr, 0, 0);
          sc.clearRect(0, 0, w, h);
          sc.fillStyle = theme.deep;
          sc.fillRect(0, 0, w, h);
          const bg = sc.createRadialGradient(w / 2, h * 0.45, 0, w / 2, h * 0.45, Math.max(w, h) * 0.65);
          bg.addColorStop(0, alpha(theme.accent2, 0.28));
          bg.addColorStop(1, 'rgba(0,0,0,0)');
          sc.fillStyle = bg;
          sc.fillRect(0, 0, w, h);

          if (isGlobe) {
            for (const st of STARS) {
              sc.beginPath();
              sc.arc(st.x * w, st.y * h, st.r, 0, Math.PI * 2);
              sc.fillStyle = alpha(theme.accentBright, 0.28 * (0.45 + 0.35 * Math.sin(st.phase)));
              sc.fill();
            }

            if (edgeVisible) {
              const atmo = sc.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.35);
              atmo.addColorStop(0, alpha(theme.accent, 0.22));
              atmo.addColorStop(0.45, alpha(theme.accent2, 0.12));
              atmo.addColorStop(1, 'rgba(0,0,0,0)');
              sc.beginPath();
              sc.arc(cx, cy, R * 1.35, 0, Math.PI * 2);
              sc.fillStyle = atmo;
              sc.fill();
            }

            // O oceano — mais claro de um lado, como se pegasse luz de fora.
            // Em projeção ortográfica o planeta é um círculo exato, então dá
            // pra desenhar com arc() em vez de mandar a esfera pela projeção.
            const sea = sc.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
            sea.addColorStop(0, alpha(theme.surface, 0.95));
            sea.addColorStop(0.75, alpha(theme.deep, 0.92));
            sea.addColorStop(1, alpha(theme.deep, 0.98));
            sc.fillStyle = sea;
            if (edgeVisible) {
              sc.beginPath();
              sc.arc(cx, cy, R, 0, Math.PI * 2);
              sc.fill();
            } else {
              sc.fillRect(0, 0, w, h); // o planeta cobre a tela toda
            }

            // Borda do planeta
            if (edgeVisible) {
              sc.beginPath();
              sc.arc(cx, cy, R, 0, Math.PI * 2);
              sc.strokeStyle = alpha(theme.accent, 0.5);
              sc.lineWidth = 1;
              sc.stroke();
            }
          }
        }
        skyRef.current = { key: skyKey, canvas: off };
      }
      ctx.drawImage(skyRef.current.canvas, 0, 0, w, h);

      // ── Que pedaço do mundo está na tela ──
      const bounds = visibleBounds(projection, w, h);

      // ── Camadas que este zoom pede (baixam sozinhas, sem travar o quadro) ──
      //
      // DESEMPENHO: enquanto a câmera está se mexendo, o mapa fica no traço
      // médio. O contorno 10m tem dezenas de milhares de pontos por país e
      // redesenhá-lo 60 vezes por segundo é o que fazia travar no arrasto.
      // Parou de mexer, ele entra — que é quando você repara no detalhe.
      let wantDetail = detailForZoom(v.zoom);
      // Interação pede resposta imediata, não litoral microscópico. O traço
      // leve mantém a silhueta do país durante o gesto; ao soltar, o detalhe
      // volta no quadro seguinte.
      if (mexendo) wantDetail = 110;
      else if (!bounds && wantDetail === 10) wantDetail = 50;
      ensureDetail(wantDetail, onLayerReady.current);
      const land = currentLand(wantDetail);

      const tier = tierForZoom(v.zoom);
      if (tier > 0) ensureCities(tier, onLayerReady.current);

      // Malha de latitude/longitude — a textura de "rede" por trás. De perto
      // sobra no máximo uma linha na tela, e processar as 400 pra isso não
      // paga: some junto com o resto do "mapa de longe".
      if (v.zoom < 5) {
        ctx.beginPath();
        path(GRATICULE);
        ctx.strokeStyle = alpha(theme.fgSubtle, 0.16);
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Continentes: contorno com glow, preenchimento quase nada — o mesmo
      // fio de luz dos cards do site
      const line = ctx.createLinearGradient(0, 0, w, h);
      line.addColorStop(0, alpha(theme.accent2, 0.55));
      line.addColorStop(0.45, alpha(theme.accentBright, 0.95));
      line.addColorStop(1, alpha(theme.accent, 0.6));

      const selectedCountry = selection?.kind === 'country' ? selection.id : null;
      let selectedFeature: (typeof land.features)[number] | null = null;

      ctx.beginPath();
      for (let i = 0; i < land.features.length; i++) {
        if (bounds && boxOutside(bounds, land.boxes[i])) continue; // fora da tela
        const f = land.features[i];
        if (selectedCountry && String(f.id) === selectedCountry) {
          selectedFeature = f;
          continue; // esse sai destacado, logo abaixo
        }
        path(f);
      }
      ctx.fillStyle = alpha(theme.accent, 0.07);
      ctx.fill();

      // O brilho do contorno é a assinatura do mapa, mas `shadowBlur` cobra
      // um borrão da TELA INTEIRA a cada quadro — era o que derrubava os
      // quadros pra 10-15 por segundo. O mesmo brilho sai de duas passadas
      // do traço: uma larga e apagada por baixo, uma fina e nítida por cima.
      // Custa duas linhas em vez de um desfoque.
      ctx.lineJoin = 'round';
      ctx.strokeStyle = alpha(theme.accentBright, 0.14);
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.strokeStyle = line;
      ctx.lineWidth = 0.85;
      ctx.stroke();

      // ── Divisões internas: estados, províncias, departamentos ──
      // Aparecem quando você chega perto o bastante pra elas quererem dizer
      // alguma coisa, e entram desbotando pra não pipocar na tela.
      const naJanela = (box: [number, number, number, number]) =>
        !bounds || !boxOutside(bounds, box);

      if (!mexendo && v.zoom >= 2.2) {
        ensureAdmin1(onLayerReady.current);
        const grupos = admin1InView(naJanela);
        if (grupos.length) {
          ctx.beginPath();
          for (const g of grupos) path(g);
          ctx.strokeStyle = alpha(theme.accent, 0.12 + 0.26 * clamp((v.zoom - 2.2) / 1.6, 0, 1));
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }

      // Divisa de município: a camada mais fina, e por isso a última a
      // aparecer. Traço mais apagado que a do estado, senão as duas competem e
      // você não sabe mais o que está olhando.
      if (!mexendo && v.zoom >= 5.5) {
        ensureMunicipios(onLayerReady.current);
        const grupos = municipiosInView(naJanela);
        if (grupos.length) {
          ctx.beginPath();
          for (const g of grupos) path(g);
          ctx.strokeStyle = alpha(theme.accent, 0.1 + 0.14 * clamp((v.zoom - 5.5) / 3, 0, 1));
          ctx.lineWidth = 0.45;
          ctx.stroke();
        }
      }

      // País escolhido: acende por dentro
      if (selectedFeature) {
        ctx.beginPath();
        path(selectedFeature);
        ctx.fillStyle = alpha(theme.accent, 0.2);
        ctx.fill();
        ctx.strokeStyle = alpha(theme.accentBright, 0.95);
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // (a borda do planeta já veio colada junto com o céu)

      // Rota da jornada — um sinal viajando pela linha pontilhada
      if (ROUTE) {
        ctx.save();
        ctx.beginPath();
        path(ROUTE);
        ctx.setLineDash([1.6, 8]);
        ctx.lineDashOffset = still ? 0 : -(ts / 42) % 1000;
        ctx.lineCap = 'round';
        // Mesmo truque do contorno: brilho por sobreposição, não por desfoque
        ctx.strokeStyle = alpha(theme.accentBright, 0.18);
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.strokeStyle = line;
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.restore();
      }

      // ── Reserva de espaço pros nomes ──
      // Um mapa vira sopa de letrinhas se todo nome for escrito. Aqui cada
      // nome só entra se o retângulo dele ainda estiver livre — as paradas
      // da jornada reservam lugar primeiro, depois os países, depois as
      // cidades (as maiores na frente).
      const GRID = 8;
      const cols = Math.ceil(w / GRID);
      const rows = Math.ceil(h / GRID);
      if (!occRef.current || occRef.current.cols !== cols || occRef.current.rows !== rows) {
        occRef.current = { cols, rows, buf: new Uint8Array(cols * rows) };
      }
      const occ = occRef.current;
      occ.buf.fill(0);

      const reserve = (x0: number, y0: number, x1: number, y1: number, claim: boolean) => {
        const a = Math.max(0, Math.floor(x0 / GRID));
        const b = Math.min(cols - 1, Math.floor(x1 / GRID));
        const c = Math.max(0, Math.floor(y0 / GRID));
        const d = Math.min(rows - 1, Math.floor(y1 / GRID));
        if (a > b || c > d) return false;
        for (let y = c; y <= d; y++) {
          for (let x = a; x <= b; x++) if (occ.buf[y * cols + x]) return false;
        }
        if (claim) {
          for (let y = c; y <= d; y++) {
            for (let x = a; x <= b; x++) occ.buf[y * cols + x] = 1;
          }
        }
        return true;
      };

      // Largura estimada do texto (medir de verdade a cada nome custaria
      // caro; a estimativa só serve pra reservar espaço)
      const textW = (s: string, px: number) => s.length * px * 0.56;

      const center: [number, number] = [-v.rot[0], -v.rot[1]];
      const onGlobeFace = (lon: number, lat: number) =>
        !isGlobe || geoDistance([lon, lat], center) < Math.PI / 2 - 0.02;

      // As paradas da jornada mandam no espaço: reserva antes de todo mundo
      const stopHits: Hit[] = [];
      for (const stop of TRAVELS) {
        const p = projection(stop.coords);
        const visible =
          !!p &&
          onGlobeFace(stop.coords[0], stop.coords[1]) &&
          p[0] > -60 &&
          p[0] < w + 60 &&
          p[1] > -60 &&
          p[1] < h + 60;
        if (!p || !visible) continue;
        stopHits.push({ x: p[0], y: p[1], sel: { kind: 'stop', id: stop.id } });
        const tw = textW(stop.name[locale], 12);
        reserve(p[0] - 14, p[1] - 12, p[0] + 14 + tw, p[1] + 12, true);
      }
      hitsRef.current = stopHits;

      // ── Nomes dos países ──
      // Somem devagar conforme as cidades tomam conta da tela
      const countryFade = v.zoom < 1.6 ? 1 : clamp(1 - (v.zoom - 1.6) / 4.5, 0.3, 1);
      for (const c of COUNTRY_LABELS) {
        if (mexendo && c.area * R * R < 18000) continue;
        if (!onGlobeFace(c.center[0], c.center[1])) continue;
        const info = countryByNumeric(c.id);
        if (!info) continue;
        // Área do país na tela: país pequeno só ganha nome quando você chega
        // perto. Sem piso, Mônaco e Singapura nunca apareceriam.
        const screenArea = Math.max(c.area * R * R, v.zoom >= 5 ? 2700 : 0);
        if (screenArea < 2600) continue;
        const p = projection(c.center);
        if (!p || p[0] < 0 || p[0] > w || p[1] < 0 || p[1] > h) continue;
        const name = info[locale];
        const px = clamp(9 + Math.sqrt(screenArea) / 26, 9, 15);
        const tw = textW(name, px) * 1.15; // maiúsculas + espaçamento
        if (!reserve(p[0] - tw / 2, p[1] - px, p[0] + tw / 2, p[1] + px, true)) continue;
        ctx.font = `700 ${px}px ${theme.font}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 3;
        ctx.strokeStyle = alpha(theme.deep, 0.85);
        if (!mexendo) ctx.strokeText(name.toUpperCase(), p[0], p[1]);
        ctx.fillStyle = alpha(
          selectedCountry === c.id ? theme.fg : theme.fgMuted,
          selectedCountry === c.id ? 1 : 0.55 * countryFade
        );
        ctx.fillText(name.toUpperCase(), p[0], p[1]);
      }
      ctx.textAlign = 'left';

      // ── Cidades ──
      // Duas passadas de propósito: primeiro todos os pontinhos (num traço
      // só, em vez de 700 desenhos separados), depois os nomes. Trocar cor e
      // fonte no canvas custa caro, então cada troca acontece uma vez.
      const cityHits: Hit[] = [];
      const minPop = minPopForZoom(v.zoom);
      if (minPop !== Infinity) {
        // ATENÇÃO: a coleta varre o mundo em gavetas, ou seja, em ordem
        // GEOGRÁFICA. Cortar aqui por quantidade seria cortar por região —
        // foi o que sumia com Washington e enchia a tela de cidadezinha.
        // Então junta tudo que passa do corte de população e só ORDENA
        // depois; quem decide quem entra é o tamanho, nunca a posição.
        const found = queryCities(bounds, minPop, mexendo ? 5000 : 20000);
        found.sort((a, b) => b[3] - a[3]);
        const selectedCity = selection?.kind === 'city' ? selection.city : null;

        // Cidade só entra se o nome dela couber. Ponto sem nome não diz nada
        // a ninguém e é isso que vira aquela nuvem de bolinhas.
        type Drawn = {
          city: City;
          x: number;
          y: number;
          px: number;
          r: number;
          cap: boolean;
          sel: boolean;
        };
        // Escrever texto é a parte mais cara do quadro: durante o arrasto
        // sai menos nome, e tudo volta assim que a mão para
        const tetoNomes = mexendo ? 28 : MAX_CITY_LABELS;
        const drawn: Drawn[] = [];
        for (const city of found) {
          if (drawn.length >= tetoNomes) break;
          if (!onGlobeFace(city[1], city[2])) continue;
          const p = projection([city[1], city[2]]);
          if (!p || p[0] < -20 || p[0] > w + 20 || p[1] < -20 || p[1] > h + 20) continue;
          const cap = city[5] === 1;
          const sel = selectedCity === city;
          const { px, r } = cityStyle(city[3]);
          // Reserva o ponto E o nome de uma vez: nada encosta em nada
          const x0 = p[0] + r + 4;
          if (
            !reserve(
              p[0] - r - 2,
              p[1] - px * 0.75,
              x0 + textW(city[0], px),
              p[1] + px * 0.75,
              true
            )
          ) {
            continue;
          }
          drawn.push({ city, x: p[0], y: p[1], px, r, cap, sel });
          cityHits.push({ x: p[0], y: p[1], sel: { kind: 'city', city } });
        }

        // Pontinhos num caminho só. Cada um leva um contorno escuro antes do
        // miolo claro — é o que faz o ponto se destacar tanto no mar quanto
        // em cima do continente, sem depender da cor do fundo.
        const dots = drawn.filter((c) => !c.sel);
        if (dots.length) {
          ctx.beginPath();
          for (const c of dots) {
            ctx.moveTo(c.x + c.r, c.y); // sem isso os círculos saem ligados por um fio
            ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
          }
          ctx.strokeStyle = alpha(theme.deep, 0.9);
          ctx.lineWidth = 2.2;
          ctx.stroke();
          ctx.fillStyle = alpha(theme.accentBright, 0.85);
          ctx.fill();
        }

        // Anel das capitais
        const caps = drawn.filter((c) => c.cap && !c.sel);
        if (caps.length) {
          ctx.beginPath();
          for (const c of caps) {
            ctx.moveTo(c.x + c.r + 2.5, c.y);
            ctx.arc(c.x, c.y, c.r + 2.5, 0, Math.PI * 2);
          }
          ctx.strokeStyle = alpha(theme.accent, 0.5);
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // A escolhida acende
        const chosen = drawn.find((c) => c.sel);
        if (chosen) {
          ctx.beginPath();
          ctx.arc(chosen.x, chosen.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = GLOW_GREEN;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(chosen.x, chosen.y, 6.5, 0, Math.PI * 2);
          ctx.strokeStyle = alpha(GLOW_GREEN, 0.9);
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Nomes — o espaço de cada um já foi reservado lá em cima.
        // O contorno escuro por trás é o que garante ler o nome em cima de
        // qualquer coisa, mas contornar letra é caro: em movimento ele sai e
        // fica só o preenchimento.
        ctx.textBaseline = 'middle';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 3;
        ctx.strokeStyle = alpha(theme.deep, 0.85);
        let curFont = '';
        for (const c of drawn) {
          const font = `${c.sel || c.cap || c.px >= 12.5 ? 600 : 400} ${c.px}px ${theme.font}`;
          if (font !== curFont) {
            ctx.font = font;
            curFont = font;
          }
          const x0 = c.x + c.r + 4;
          if (!mexendo) ctx.strokeText(c.city[0], x0, c.y + 0.5);
          ctx.fillStyle = c.sel
            ? theme.fg
            : alpha(theme.fg, c.px >= 12.5 ? 0.95 : c.cap ? 0.9 : 0.75);
          ctx.fillText(c.city[0], x0, c.y + 0.5);
        }
      }
      cityHitsRef.current = cityHits;

      // ── Pinos da jornada (sempre por cima de tudo) ──
      const pulse = still ? 0 : (ts % 2200) / 2200;
      for (const stop of TRAVELS) {
        const hit = stopHits.find((s) => s.sel.kind === 'stop' && s.sel.id === stop.id);
        if (!hit) continue;
        const { x, y } = hit;
        const isLived = stop.status === 'lived';
        const isPlanned = stop.status === 'planned';
        const isActive = selection?.kind === 'stop' && selection.id === stop.id;
        const fill = isLived ? GLOW_GREEN : isPlanned ? theme.deep : theme.accent;
        const ring = isPlanned ? theme.fgSubtle : GLOW_GREEN;

        // Onda expandindo na base (onde ele está agora)
        if (isLived && pulse > 0) {
          ctx.beginPath();
          ctx.arc(x, y, 7 + pulse * 16, 0, Math.PI * 2);
          ctx.strokeStyle = alpha(GLOW_GREEN, 0.45 * (1 - pulse));
          ctx.lineWidth = 1.6;
          ctx.stroke();
        }

        // Halo suave — lugares "na mira" não brilham ainda
        if (!isPlanned) {
          ctx.beginPath();
          ctx.arc(x, y, isLived ? 12 : 10, 0, Math.PI * 2);
          ctx.fillStyle = alpha(fill, isActive ? 0.3 : 0.18);
          ctx.fill();
        }

        // Brilho do pino em círculos concêntricos translúcidos, no lugar do
        // desfoque — três círculos custam quase nada, o desfoque custa uma
        // passada de borrão por pino
        ctx.save();
        for (const [raio, opacidade] of isActive
          ? ([
              [10, 0.16],
              [7.5, 0.24],
            ] as const)
          : ([[8, 0.14]] as const)) {
          ctx.beginPath();
          ctx.arc(x, y, raio, 0, Math.PI * 2);
          ctx.fillStyle = alpha(isPlanned ? theme.accent : GLOW_GREEN, opacidade);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(x, y, (isLived ? 5.5 : 4.5) + (isActive ? 1.4 : 0), 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.lineWidth = isPlanned ? 1.6 : 1.4;
        if (isPlanned) ctx.setLineDash([2.5, 2.5]);
        ctx.strokeStyle = isPlanned ? ring : theme.deep;
        ctx.stroke();
        ctx.restore();

        // Nome ao lado do pino — contorno escuro por trás pra ficar legível
        // sobre qualquer coisa
        ctx.font = `${isActive ? 700 : 500} 12px ${theme.font}`;
        ctx.textBaseline = 'middle';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 3;
        ctx.strokeStyle = alpha(theme.deep, 0.9);
        ctx.strokeText(stop.name[locale], x + 11, y + 1);
        ctx.fillStyle = isActive ? theme.fg : isPlanned ? theme.fgSubtle : theme.fgMuted;
        ctx.fillText(stop.name[locale], x + 11, y + 1);
      }

      // Tem algo se mexendo sozinho na tela? Só então o próximo quadro
      // precisa ser desenhado sem ninguém ter mexido em nada.
      //
      // De perto isso é proibido: repintar 130 nomes 20 vezes por segundo só
      // pra animar o pulso de um pino é o troco mais caro do mapa. Aproximou
      // pra ler, o mapa fica parado de verdade — zero trabalho até você mexer.
      animRef.current = !still && v.zoom < 3 && (isGlobe || stopHits.length > 0);

      // ── O cartão segue o que está escolhido ──
      // Mexido direto no DOM pra não disparar re-render a cada quadro
      const card = cardRef.current;
      if (card) {
        let anchor: [number, number] | null = null;
        let key = '';
        if (selection?.kind === 'stop') {
          const stop = TRAVELS.find((s) => s.id === selection.id);
          if (stop && onGlobeFace(stop.coords[0], stop.coords[1])) {
            anchor = projection(stop.coords);
            key = `stop:${selection.id}`;
          }
        } else if (selection?.kind === 'city') {
          const [, lon, lat] = selection.city;
          if (onGlobeFace(lon, lat)) anchor = projection([lon, lat]);
          key = `city:${selection.city[0]}`;
        } else if (selection?.kind === 'country') {
          const c = COUNTRY_LABELS.find((l) => l.id === selection.id);
          if (c && onGlobeFace(c.center[0], c.center[1])) anchor = projection(c.center);
          key = `country:${selection.id}`;
        }

        if (anchor && anchor[0] > -40 && anchor[0] < w + 40 && anchor[1] > -40 && anchor[1] < h + 40) {
          // A altura muda com o texto; mede só quando troca de ficha
          if (cardBox.current.key !== key || !cardBox.current.h) {
            cardBox.current = { key, h: card.offsetHeight };
          }
          const ch = cardBox.current.h || 130;
          // Alvo lá embaixo? O cartão vira pra cima, senão a caixa corta ele
          const below = anchor[1] + 18;
          const top = below + ch > h - 6 ? Math.max(6, anchor[1] - 18 - ch) : below;
          card.style.opacity = '1';
          card.style.left = `${clamp(anchor[0], 118, Math.max(118, w - 118))}px`;
          card.style.top = `${top}px`;
        } else {
          card.style.opacity = '0';
        }
      }
    },
    [buildProjection, locale]
  );

  // Quando uma camada termina de baixar, só precisamos avisar o React pra
  // atualizar o "carregando" — o desenho já pega os dados sozinho
  const onLayerReady = useRef<() => void>(() => {});
  onLayerReady.current = () => {
    dirtyRef.current = true; // camada nova chegou: redesenha com ela
    setLoadingData(citiesLoading());
    setDataVersion((n) => n + 1); // e a busca passa a achar os nomes novos
  };

  // Só em desenvolvimento: deixa medir o custo de um quadro pelo console,
  // sem depender do navegador estar compondo imagem.
  //   __medirMapa(40) → milissegundos por quadro
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    const w = window as unknown as Record<string, unknown>;
    w.__medirMapa = (n = 40, mexendo = false) => {
      const t0 = performance.now();
      for (let i = 0; i < n; i++) {
        const agora = performance.now();
        if (mexendo) lastMoveRef.current = agora; // simula câmera em movimento
        paint(agora);
      }
      const ms = (performance.now() - t0) / n;
      return { msPorQuadro: +ms.toFixed(2), fps: Math.round(1000 / ms), zoom: +view.current.zoom.toFixed(2) };
    };
    return () => {
      delete w.__medirMapa;
    };
  }, [paint]);

  // ── Loop de animação ────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const box = boxRef.current;
    if (!canvas || !box) return;

    themeRef.current = readTheme(document.documentElement);
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduceMotion.current = mq.matches;
    const onMq = (e: MediaQueryListEvent) => {
      reduceMotion.current = e.matches;
    };
    mq.addEventListener('change', onMq);

    // Tamanho: acompanha a caixa e a densidade da tela
    const resize = () => {
      const rect = box.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      dprFullRef.current = dpr;
      const escala = emBaixaRef.current ? 1 : dpr;
      size.current = { w, h, dpr: escala };
      canvas.width = Math.round(w * escala);
      canvas.height = Math.round(h * escala);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      flatBase.current = null;
      dirtyRef.current = true;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(box);

    // Não gasta bateria desenhando um mapa que ninguém está vendo
    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
      },
      { rootMargin: '120px' }
    );
    io.observe(box);

    let raf = 0;
    let last = performance.now();
    let lastDecor = 0;
    const frame = (ts: number) => {
      const dt = Math.min((ts - last) / 1000, 0.1);
      last = ts;

      if (visibleRef.current && !document.hidden) {
        const v = view.current;

        // Voo até um lugar (clique num pino / num atalho)
        const fly = flyRef.current;
        if (fly) {
          dirtyRef.current = true;
          lastMoveRef.current = ts; // voando também é câmera em movimento
        }
        if (fly) {
          const p = clamp((ts - fly.t0) / fly.dur, 0, 1);
          const e = easeInOut(p);
          v.rot = [fly.fromRot[0] + fly.dRot[0] * e, fly.fromRot[1] + fly.dRot[1] * e];
          v.zoom = fly.fromZoom + (fly.toZoom - fly.fromZoom) * e;
          v.pan = [
            fly.fromPan[0] + (fly.toPan[0] - fly.fromPan[0]) * e,
            fly.fromPan[1] + (fly.toPan[1] - fly.fromPan[1]) * e,
          ];
          if (p >= 1) flyRef.current = null;
        } else if (
          spinRef.current &&
          modeRef.current === 'globe' &&
          !draggingRef.current &&
          !selRef.current &&
          v.zoom < 1.5 && // aproximou pra olhar algo? o globo para de girar
          !reduceMotion.current
        ) {
          v.rot = [(v.rot[0] - SPIN_DEG_PER_SEC * dt + 540) % 360 - 180, v.rot[1]];
          dirtyRef.current = true;
          lastMoveRef.current = ts;
        }

        // ── Resolução: alta parada, baixa em movimento ──
        // Numa tela retina cada quadro pinta 4x mais pixel do que a tela
        // mostra. Enquanto a câmera se mexe ninguém enxerga essa diferença,
        // então o mapa desenha em resolução de tela e volta ao capricho
        // quando a mão para. Só troca na virada — não a cada quadro.
        const mexendoAgora = ts - lastMoveRef.current < 200;
        if (mexendoAgora !== emBaixaRef.current && dprFullRef.current > 1.05) {
          emBaixaRef.current = mexendoAgora;
          const escala = mexendoAgora ? 1 : dprFullRef.current;
          const { w, h } = size.current;
          size.current = { w, h, dpr: escala };
          canvas.width = Math.round(w * escala);
          canvas.height = Math.round(h * escala);
          dirtyRef.current = true; // trocar o tamanho apaga o desenho
        }

        // Nada mudou e nada está se mexendo? Então não gasta um quadro à toa.
        // E quando é só enfeite se mexendo (o pulso do pino, a rota correndo)
        // com a câmera parada, 20 quadros por segundo já enganam o olho — não
        // vale redesenhar o mundo inteiro 60 vezes por segundo pra isso.
        const somenteEnfeite = !dirtyRef.current && animRef.current;
        if (somenteEnfeite && ts - lastDecor < 50) {
          raf = requestAnimationFrame(frame);
          return;
        }
        if (somenteEnfeite) lastDecor = ts;

        if (dirtyRef.current || animRef.current) {
          paint(ts);
          dirtyRef.current = false;
          if (!readyRef.current) {
            readyRef.current = true;
            setReady(true);
          }
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mq.removeEventListener('change', onMq);
    };
    // paint muda com o idioma; o resto do loop é estável
  }, [paint]);

  // ── Voar até um ponto qualquer do mundo ─────────────────────────────
  const flyToCoords = useCallback(
    (coords: [number, number], zoomMinimo: number, escolha: Selection | null) => {
      const v = view.current;
      const { w, h } = size.current;
      const toZoom = Math.max(v.zoom, zoomMinimo);

      let toPan: [number, number] = [0, 0];
      let dRot: [number, number] = [0, 0];

      if (modeRef.current === 'globe') {
        dRot = [shortestAngle(v.rot[0], -coords[0]), shortestAngle(v.rot[1], -coords[1])];
      } else {
        // No planisfério a câmera não gira: desloca até o ponto ficar no meio
        const p = flatProjection(toZoom, [0, 0])(coords);
        if (p) toPan = [w / 2 - p[0], h / 2 - p[1]];
      }

      flyRef.current = {
        t0: performance.now(),
        dur: reduceMotion.current ? 1 : 900,
        fromRot: [...v.rot] as [number, number],
        dRot,
        fromZoom: v.zoom,
        toZoom,
        fromPan: [...v.pan] as [number, number],
        toPan,
      };
      select(escolha);
    },
    [flatProjection, select]
  );

  /** Voa até uma parada da jornada (os atalhos e o clique no pino). */
  const flyTo = useCallback(
    (id: string) => {
      const stop = TRAVELS.find((s) => s.id === id);
      if (!stop) return;
      flyToCoords(stop.coords, modeRef.current === 'globe' ? 1.75 : 2.2, { kind: 'stop', id });
    },
    [flyToCoords]
  );

  /** Voa até uma cidade achada na busca — chega perto o suficiente pra ela
   *  aparecer com as vizinhas em volta, como quem procurou espera. */
  const flyToCity = useCallback(
    (city: City) => {
      // Cidade grande cabe num enquadramento mais largo; vila precisa de mais
      // zoom pra passar do corte de população e realmente aparecer
      const pop = city[3];
      const zoom = pop >= 1_000_000 ? 4.5 : pop >= 200_000 ? 6.5 : pop >= 50_000 ? 9 : 12.5;
      flyToCoords([city[1], city[2]], zoom, { kind: 'city', city });
    },
    [flyToCoords]
  );

  const resetView = useCallback(() => {
    const v = view.current;
    flyRef.current = {
      t0: performance.now(),
      dur: reduceMotion.current ? 1 : 700,
      fromRot: [...v.rot] as [number, number],
      dRot:
        modeRef.current === 'globe'
          ? [shortestAngle(v.rot[0], home[0]), shortestAngle(v.rot[1], home[1])]
          : [0, 0],
      fromZoom: v.zoom,
      toZoom: 1,
      fromPan: [...v.pan] as [number, number],
      toPan: [0, 0],
    };
    select(null);
  }, [home, select]);

  // No globo a câmera fica sempre centrada; no planisfério o arrasto pode
  // deslocar, mas nunca a ponto do mapa sumir da caixa
  const clampPan = useCallback(() => {
    const v = view.current;
    const { w, h } = size.current;
    if (modeRef.current === 'globe') {
      v.pan = [0, 0];
      return;
    }
    const limX = Math.max(0, (w * v.zoom - w) / 2) + 60;
    const limY = Math.max(0, (h * v.zoom - h) / 2) + 60;
    v.pan = [clamp(v.pan[0], -limX, limX), clamp(v.pan[1], -limY, limY)];
  }, []);

  // Zoom pelos botões / teclado / roda / pinça.
  // `anchor` é o ponto da caixa que deve ficar parado (o cursor, ou o meio dos
  // dois dedos) — sem isso o lugar que você está olhando escapa da tela.
  const zoomBy = useCallback(
    (factor: number, anchor?: [number, number]) => {
      const v = view.current;
      const next = clamp(v.zoom * factor, MIN_ZOOM, MAX_ZOOM);
      if (modeRef.current === 'flat') {
        const { w, h } = size.current;
        const ax = (anchor?.[0] ?? w / 2) - w / 2;
        const ay = (anchor?.[1] ?? h / 2) - h / 2;
        v.pan = [
          ax - (next * (ax - v.pan[0])) / v.zoom,
          ay - (next * (ay - v.pan[1])) / v.zoom,
        ];
      }
      v.zoom = next;
      flyRef.current = null;
      clampPan();
      markDirty();
    },
    [clampPan, markDirty]
  );

  // ── Ponteiro: arrastar, pinçar, clicar, passar o mouse ──────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pointers = new Map<number, { x: number; y: number }>();
    let lastX = 0;
    let lastY = 0;
    let moved = 0;
    let pinchDist = 0;

    // Pino da jornada primeiro, cidade depois — e cada um com o alcance de
    // toque proporcional ao tamanho que tem na tela
    const pick = (x: number, y: number): Selection | null => {
      let best: { sel: Selection; d: number } | null = null;
      for (const hit of hitsRef.current) {
        const d = Math.hypot(hit.x - x, hit.y - y);
        if (d < 22 && (!best || d < best.d)) best = { sel: hit.sel, d };
      }
      if (best) return best.sel;
      for (const hit of cityHitsRef.current) {
        const d = Math.hypot(hit.x - x, hit.y - y);
        if (d < 11 && (!best || d < best.d)) best = { sel: hit.sel, d };
      }
      return best?.sel ?? null;
    };

    // Clicou no vazio? Se caiu dentro de um país, abre a ficha dele
    const pickCountry = (x: number, y: number): Selection | null => {
      const projection = buildProjection();
      const geo = projection.invert?.([x, y]);
      if (!geo || !Number.isFinite(geo[0])) return null;
      // O contorno do zoom atual: o de longe não tem os países pequenos, e
      // clicar em Malta ou Singapura não daria em nada
      const land = currentLand(detailForZoom(view.current.zoom));
      for (const f of land.features) {
        if (geoContains(f, geo as [number, number])) {
          return f.id ? { kind: 'country', id: String(f.id) } : null;
        }
      }
      return null;
    };

    const localPos = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const onDown = (e: PointerEvent) => {
      // Segurar o ponteiro deixa o arrasto continuar mesmo saindo da caixa —
      // mas alguns navegadores recusam o pedido, e isso não pode quebrar o resto
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        /* segue sem captura */
      }
      const p = localPos(e);
      pointers.set(e.pointerId, p);
      if (pointers.size === 1) {
        lastX = p.x;
        lastY = p.y;
        moved = 0;
        draggingRef.current = true;
        setDragging(true);
        flyRef.current = null;
      } else if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
      }
    };

    const onMove = (e: PointerEvent) => {
      const p = localPos(e);

      if (!pointers.has(e.pointerId)) {
        // Só passando o mouse: acende o que estiver embaixo do cursor
        const found = pick(p.x, p.y);
        canvas.style.cursor = found ? 'pointer' : 'grab';
        // Um país aberto não se fecha só porque o mouse passeou
        if (found || selRef.current?.kind !== 'country') select(found);
        return;
      }

      pointers.set(e.pointerId, p);

      if (pointers.size >= 2) {
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        // A pinça abre/fecha em volta do ponto no meio dos dois dedos
        if (pinchDist > 0) {
          zoomBy(clamp(d / pinchDist, 0.5, 2), [(a.x + b.x) / 2, (a.y + b.y) / 2]);
        }
        pinchDist = d;
        moved = 99;
        return;
      }

      const dx = p.x - lastX;
      const dy = p.y - lastY;
      lastX = p.x;
      lastY = p.y;
      moved += Math.abs(dx) + Math.abs(dy);
      if (moved > 6 && selRef.current) select(null);

      const v = view.current;
      if (modeRef.current === 'globe') {
        // Sensibilidade cai junto com o zoom: quanto mais perto, mais fino
        const k = 68 / Math.max(1, (Math.min(size.current.w, size.current.h) / 2 - 12) * v.zoom);
        v.rot = [
          ((v.rot[0] + dx * k + 540) % 360) - 180,
          clamp(v.rot[1] - dy * k, -89, 89),
        ];
      } else {
        v.pan = [v.pan[0] + dx, v.pan[1] + dy];
        clampPan();
      }
      markDirty();
    };

    const endDrag = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.delete(e.pointerId);

      if (pointers.size === 1) {
        // Saiu um dedo da pinça: o que ficou vira a nova referência do
        // arrasto, senão o mapa dá um salto
        const [rest] = [...pointers.values()];
        lastX = rest.x;
        lastY = rest.y;
      }
      if (pointers.size < 2) pinchDist = 0;

      if (pointers.size === 0) {
        draggingRef.current = false;
        setDragging(false);
        // Arrastou pouco = foi um clique
        if (moved < 6) {
          const p = localPos(e);
          const found = pick(p.x, p.y);
          if (found?.kind === 'stop') flyTo(found.id);
          else select(found ?? pickCountry(p.x, p.y));
        }
      }
    };

    // Rede de segurança: se a captura do ponteiro falhar e a pessoa soltar o
    // dedo fora da caixa, o arrasto ficaria travado pra sempre
    const onWindowUp = (e: PointerEvent) => {
      if (pointers.has(e.pointerId)) endDrag(e);
    };

    const onLeave = (e: PointerEvent) => {
      // No toque o navegador dispara pointerleave logo depois do pointerup —
      // se limpasse aqui, o cartão sumiria no instante do toque
      if (e.pointerType !== 'mouse') return;
      if (!draggingRef.current && selRef.current?.kind !== 'country') select(null);
    };

    const onDouble = (e: MouseEvent) => {
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      zoomBy(1.7, [e.clientX - r.left, e.clientY - r.top]);
    };

    // Roda: só dá zoom com Ctrl/⌘ — sem isso a página continua rolando
    // normalmente (o mapa não sequestra a rolagem)
    let hintTimer: ReturnType<typeof setTimeout> | undefined;
    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) {
        setScrollHint(true);
        clearTimeout(hintTimer);
        hintTimer = setTimeout(() => setScrollHint(false), 1400);
        return;
      }
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      zoomBy(e.deltaY < 0 ? 1.14 : 1 / 1.14, [e.clientX - r.left, e.clientY - r.top]);
    };

    const onKey = (e: KeyboardEvent) => {
      const v = view.current;
      const step = e.shiftKey ? 18 : 6;
      const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-', '_', '0'];
      if (!keys.includes(e.key)) return;
      e.preventDefault();
      flyRef.current = null;
      if (e.key === '0') return resetView();
      if (e.key === '+' || e.key === '=') return zoomBy(1.3);
      if (e.key === '-' || e.key === '_') return zoomBy(1 / 1.3);
      const dx = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;
      const dy = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0;
      if (modeRef.current === 'globe') {
        // Perto do chão o passo encolhe junto, senão a seta joga você longe
        const s = step / Math.max(1, v.zoom * 0.8);
        v.rot = [((v.rot[0] - dx * s + 540) % 360) - 180, clamp(v.rot[1] + dy * s, -89, 89)];
      } else {
        v.pan = [v.pan[0] - dx * step * 4, v.pan[1] - dy * step * 4];
        clampPan();
      }
      markDirty();
    };

    canvas.style.cursor = 'grab';
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);
    canvas.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('dblclick', onDouble);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('keydown', onKey);
    window.addEventListener('pointerup', onWindowUp);
    window.addEventListener('pointercancel', onWindowUp);

    return () => {
      clearTimeout(hintTimer);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', endDrag);
      canvas.removeEventListener('pointercancel', endDrag);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('dblclick', onDouble);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerup', onWindowUp);
      window.removeEventListener('pointercancel', onWindowUp);
    };
  }, [buildProjection, clampPan, flyTo, markDirty, resetView, select, zoomBy]);

  const statusLabel: Record<TravelStatus, string> = useMemo(
    () => ({
      lived: t('status_lived'),
      visited: t('status_visited'),
      planned: t('status_planned'),
    }),
    [t]
  );

  // ── Conteúdo do cartão ──
  const card = useMemo(() => {
    if (!sel) return null;

    if (sel.kind === 'stop') {
      const stop = TRAVELS.find((s) => s.id === sel.id);
      if (!stop) return null;
      return {
        dot: stop.status === 'lived' ? GLOW_GREEN : 'var(--accent)',
        kicker: `${statusLabel[stop.status]}${stop.year ? ` · ${stop.year}` : ''}`,
        title:
          stop.country[locale] !== stop.name[locale]
            ? `${stop.name[locale]} — ${stop.country[locale]}`
            : stop.name[locale],
        note: stop.note?.[locale] ?? null,
        rows: [] as [string, string][],
      };
    }

    if (sel.kind === 'city') {
      const [name, lon, lat, pop, cc, capital] = sel.city;
      const country = countryByAlpha2(cc);
      const rows: [string, string][] = [[t('info_population'), nf.format(pop)]];
      if (base) {
        const km = geoDistance([lon, lat], base.coords) * RAIO_TERRA_KM;
        rows.push([t('info_from_base'), `${nf.format(Math.round(km))} km`]);
      }
      return {
        dot: 'var(--accent-bright)',
        kicker: capital ? t('info_capital_of_country') : t('info_city'),
        title: country ? `${name} — ${country[locale]}` : name,
        note: null,
        rows,
      };
    }

    const info = countryByNumeric(sel.id);
    if (!info) return null;
    const rows: [string, string][] = [];
    if (info.capital) rows.push([t('info_capital'), info.capital]);
    if (info.region) rows.push([t('info_region'), info.region[locale]]);
    if (info.area) rows.push([t('info_area'), `${nf.format(info.area)} km²`]);
    return {
      dot: 'var(--accent)',
      kicker: t('info_country'),
      title: info[locale],
      note: null,
      rows,
    };
  }, [sel, locale, nf, base, t, statusLabel]);

  const ctrlBtn =
    'inline-flex items-center justify-center rounded-xl border border-border-strong/70 text-foreground-muted transition hover:text-foreground hover:border-accent hover:bg-surface-elevated/70 disabled:opacity-40';

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-3xl border border-border overflow-hidden"
        style={{ background: 'var(--deep)' }}
      >
        {/* A caixa do mapa: o canvas ocupa tudo e o resto flutua por cima */}
        <div
          ref={boxRef}
          className="relative w-full h-[clamp(320px,58vh,600px)]"
          style={{ touchAction: 'none' }}
        >
          <canvas
            ref={canvasRef}
            tabIndex={0}
            role="img"
            aria-label={t('map_alt')}
            className={`block w-full h-full outline-none ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          />

          {/* Enquanto o primeiro quadro não sai */}
          {!ready && (
            <div className="absolute inset-0 grid place-items-center">
              <span className="font-pixel text-[10px] tracking-[0.3em] uppercase text-foreground-subtle animate-pulse">
                {t('loading')}
              </span>
            </div>
          )}

          {/* Ficha do que está escolhido — posicionada pelo loop de desenho */}
          <div
            ref={cardRef}
            aria-hidden={!card}
            className="pointer-events-none absolute z-10 w-56 -translate-x-1/2 rounded-2xl glass-strong border border-border p-4 shadow-xl shadow-black/40 transition-opacity duration-200"
            style={{ opacity: 0, left: '-999px', top: '-999px' }}
          >
            {card && (
              <>
                <div className="flex items-center gap-2 mb-1.5">
                  <span aria-hidden className="w-2 h-2 rounded-full" style={{ background: card.dot }} />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-foreground-subtle">
                    {card.kicker}
                  </span>
                </div>
                <p className="font-bold text-foreground text-sm mb-1">{card.title}</p>
                {card.note && (
                  <p className="text-xs text-foreground-muted leading-relaxed">{card.note}</p>
                )}
                {card.rows.length > 0 && (
                  <dl className="mt-2 space-y-1">
                    {card.rows.map(([label, value]) => (
                      <div key={label} className="flex items-baseline justify-between gap-3 text-xs">
                        <dt className="text-foreground-subtle">{label}</dt>
                        <dd className="font-semibold text-foreground-muted text-right">{value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </>
            )}
          </div>

          {/* Controles — canto superior direito */}
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
            <div className="flex flex-col rounded-xl glass overflow-hidden">
              <button
                type="button"
                onClick={() => zoomBy(1.5)}
                aria-label={t('zoom_in')}
                title={t('zoom_in')}
                className={`${ctrlBtn} w-9 h-9 rounded-none border-0`}
              >
                <Plus size={15} />
              </button>
              <span aria-hidden className="h-px bg-border" />
              <button
                type="button"
                onClick={() => zoomBy(1 / 1.5)}
                aria-label={t('zoom_out')}
                title={t('zoom_out')}
                className={`${ctrlBtn} w-9 h-9 rounded-none border-0`}
              >
                <Minus size={15} />
              </button>
            </div>

            <button
              type="button"
              onClick={resetView}
              aria-label={t('reset')}
              title={t('reset')}
              className={`${ctrlBtn} w-9 h-9 glass`}
            >
              <RotateCcw size={14} />
            </button>

            <button
              type="button"
              onClick={() => setSpinning((s) => !s)}
              aria-label={spinning ? t('spin_pause') : t('spin_play')}
              title={spinning ? t('spin_pause') : t('spin_play')}
              disabled={mode === 'flat'}
              className={`${ctrlBtn} w-9 h-9 glass`}
            >
              {spinning ? <Pause size={14} /> : <Play size={14} />}
            </button>
          </div>

          {/* Globo ↔ planisfério — canto superior esquerdo */}
          <div className="absolute top-3 left-3 z-20 flex rounded-xl glass overflow-hidden text-xs font-semibold">
            {(
              [
                ['globe', Globe2, t('mode_globe')],
                ['flat', MapIcon, t('mode_flat')],
              ] as const
            ).map(([m, Icon, label]) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  if (m === mode) return;
                  setMode(m);
                  view.current.pan = [0, 0];
                  view.current.zoom = 1;
                  flyRef.current = null;
                  select(null);
                  markDirty();
                }}
                aria-pressed={mode === m}
                className={`inline-flex items-center gap-1.5 px-3 py-2 transition ${
                  mode === m
                    ? 'text-foreground bg-surface-elevated/80'
                    : 'text-foreground-subtle hover:text-foreground-muted'
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          {/* Busca: digitar qualquer lugar do mundo e voar até ele */}
          <div className="absolute top-14 left-3 z-30 w-[min(17rem,calc(100%-1.5rem))]">
            <div className="relative">
              <Search
                size={14}
                aria-hidden
                className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle pointer-events-none"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  // Só quem vai buscar precisa dos 25 mil nomes — então eles
                  // descem agora, não no carregamento da página
                  ensureCities(3, onLayerReady.current);
                  setSearchOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setQuery('');
                    setSearchOpen(false);
                    (e.target as HTMLInputElement).blur();
                  }
                  if (e.key === 'Enter' && results[0]) {
                    flyToCity(results[0].city);
                    setSearchOpen(false);
                  }
                }}
                placeholder={t('search_placeholder')}
                aria-label={t('search_placeholder')}
                className="w-full rounded-xl glass pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-foreground-subtle outline-none focus-visible:border-accent [&::-webkit-search-cancel-button]:hidden"
              />
            </div>

            {searchOpen && query.trim().length >= 2 && (
              <ul className="mt-1.5 max-h-64 overflow-y-auto rounded-xl glass-strong divide-y divide-border/60 shadow-xl shadow-black/40">
                {results.length === 0 ? (
                  <li className="px-3 py-2.5 text-xs text-foreground-subtle">
                    {loadingData ? t('loading_places') : t('search_empty')}
                  </li>
                ) : (
                  results.map(({ city, pais }) => (
                    <li key={`${city[0]}|${city[1]}|${city[2]}`}>
                      <button
                        type="button"
                        onClick={() => {
                          flyToCity(city);
                          setSearchOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 transition hover:bg-surface-elevated/70"
                      >
                        <span className="block text-xs font-semibold text-foreground">
                          {city[0]}
                        </span>
                        <span className="block text-[11px] text-foreground-subtle">
                          {pais} · {nf.format(city[3])}
                        </span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          {/* Baixando uma camada nova de cidades */}
          {loadingData && (
            <span className="absolute bottom-3 right-3 z-20 rounded-full glass px-3 py-1 text-[10px] uppercase tracking-widest text-foreground-subtle">
              {t('loading_places')}
            </span>
          )}

          {/* Dica de rolagem — aparece só quando a pessoa tenta dar zoom sem Ctrl */}
          <div
            className={`pointer-events-none absolute inset-0 z-30 grid place-items-center transition-opacity duration-200 ${
              scrollHint ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <span className="rounded-full glass-strong px-5 py-2.5 text-xs font-semibold text-foreground">
              {t('scroll_hint')}
            </span>
          </div>

          {/* Instrução discreta no rodapé da caixa */}
          <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 z-20 text-[11px] text-foreground-subtle text-center px-4">
            {touch ? t('drag_hint_touch') : t('drag_hint')}
          </p>
        </div>
      </motion.div>

      {/* Atalhos: teclado e celular também precisam chegar em cada lugar */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <span className="text-[11px] uppercase tracking-widest text-foreground-subtle mr-1">
          {t('jump_to')}
        </span>
        {TRAVELS.map((stop) => (
          <button
            key={stop.id}
            type="button"
            onClick={() => flyTo(stop.id)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              sel?.kind === 'stop' && sel.id === stop.id
                ? 'border-accent text-foreground bg-surface-elevated'
                : 'border-border text-foreground-muted hover:border-accent hover:text-foreground'
            }`}
          >
            {stop.name[locale]}
          </button>
        ))}
      </div>

      {/* Legenda */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {(['lived', 'visited', 'planned'] as const).map((s) => (
          <span key={s} className="inline-flex items-center gap-2 text-xs text-foreground-muted">
            {s === 'planned' ? (
              <span
                aria-hidden
                className="w-3 h-3 rounded-full border-2 border-dashed"
                style={{ borderColor: 'var(--fg-subtle)' }}
              />
            ) : (
              <span
                aria-hidden
                className="w-3 h-3 rounded-full"
                style={{ background: s === 'lived' ? GLOW_GREEN : 'var(--accent)' }}
              />
            )}
            {statusLabel[s]}
          </span>
        ))}
      </div>

      {/* Crédito de quem faz os dados existirem */}
      <p className="mt-4 text-center text-[11px] text-foreground-subtle">{t('data_credit')}</p>
    </div>
  );
}
