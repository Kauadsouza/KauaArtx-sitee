'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  geoDistance,
  geoGraticule10,
  geoNaturalEarth1,
  geoOrthographic,
  geoPath,
} from 'd3-geo';
import type { GeoProjection } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { FeatureCollection, Geometry } from 'geojson';
import worldTopo from 'world-atlas/countries-110m.json';
import { Globe2, Map as MapIcon, Minus, Pause, Play, Plus, RotateCcw } from 'lucide-react';
import { TRAVELS, type TravelStatus } from '@/data/travels';

// Verde vívido usado só pra glow de destaque (mesmo tom do "você está aqui"
// da trilha em /about). Fora daqui o mapa lê os tokens reais de globals.css,
// então a paleta continua sendo um verde monocromático — sem ciano.
const GLOW_GREEN = '#35E065';

const MIN_ZOOM = 0.7;
const MAX_ZOOM = 7;
const SPIN_DEG_PER_SEC = 3.2; // giro ocioso do globo — lento, quase respirando

type Mode = 'globe' | 'flat';

// ── Geometria do mundo: calculada UMA vez quando o módulo carrega ──────
const { LANDS, COUNTRIES } = (() => {
  const topo = worldTopo as unknown as Topology<{ countries: GeometryCollection }>;
  const world = feature(topo, topo.objects.countries) as FeatureCollection<Geometry>;
  // Sem a Antártida o mundo preenche melhor o quadro (ninguém mora lá… ainda)
  const lands: FeatureCollection<Geometry> = {
    ...world,
    features: world.features.filter((f) => f.id !== '010'),
  };
  return { LANDS: lands, COUNTRIES: lands.features };
})();

const GRATICULE = geoGraticule10();
const SPHERE = { type: 'Sphere' } as const;

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

interface Hit {
  id: string;
  x: number;
  y: number;
  visible: boolean;
}

// ══════════════════════════════════════════════════════════════════════
// Mapa da jornada — agora dá pra mexer: arrastar gira o globo, a roda com
// Ctrl dá zoom, dois dedos fazem pinça e clicar num pino voa até ele.
// Tudo é desenhado num <canvas> (leve o bastante pra rodar a 60fps até com
// o globo girando), com um cartão HTML por cima pros detalhes.
// ══════════════════════════════════════════════════════════════════════
export default function WorldMap() {
  const t = useTranslations('map');
  const locale = useLocale() as 'pt' | 'en';

  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<Mode>('globe');
  const [spinning, setSpinning] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [scrollHint, setScrollHint] = useState(false);
  // No celular não existe "Ctrl + roda" — a dica precisa falar de pinça
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    setTouch(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  // Onde a câmera começa: centrada no lugar onde ele mora hoje
  const home = useMemo(() => {
    const base = TRAVELS.find((s) => s.status === 'lived') ?? TRAVELS[0];
    return base ? ([-base.coords[0], -base.coords[1] * 0.7] as [number, number]) : ([0, -10] as [number, number]);
  }, []);

  // ── Estado da câmera vive em refs: muda 60x por segundo, então não pode
  //    passar pelo React (senão é re-render em cada quadro) ──
  const view = useRef({ rot: [...home] as [number, number], pan: [0, 0] as [number, number], zoom: 1 });
  const size = useRef({ w: 0, h: 0, dpr: 1 });
  const themeRef = useRef<Theme | null>(null);
  const hitsRef = useRef<Hit[]>([]);
  const cardBox = useRef<{ id: string | null; h: number }>({ id: null, h: 0 });
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
  const activeRef = useRef(activeId);
  const draggingRef = useRef(false);
  const readyRef = useRef(false);
  const reduceMotion = useRef(false);
  const visibleRef = useRef(true);

  useEffect(() => {
    modeRef.current = mode;
    flatBase.current = null;
  }, [mode]);
  useEffect(() => {
    spinRef.current = spinning;
  }, [spinning]);
  useEffect(() => {
    activeRef.current = activeId;
  }, [activeId]);

  // Enquadramento do planisfério. fitSize percorre o mundo inteiro pra achar
  // a escala — caro demais pra rodar a cada quadro, então fica em cache.
  const getFlatBase = useCallback(() => {
    const { w, h } = size.current;
    if (!flatBase.current || flatBase.current.w !== w || flatBase.current.h !== h) {
      const base = geoNaturalEarth1();
      base.fitSize([w, h], LANDS);
      flatBase.current = { w, h, s: base.scale(), t: base.translate() as [number, number] };
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
        .precision(0.5)
        .scale(s * zoom)
        .translate([
          (tr[0] - w / 2) * zoom + w / 2 + pan[0],
          (tr[1] - h / 2) * zoom + h / 2 + pan[1],
        ]);
    },
    [getFlatBase]
  );

  // ── Projeção do quadro atual ────────────────────────────────────────
  const buildProjection = useCallback((): GeoProjection => {
    const { w, h } = size.current;
    const v = view.current;

    if (modeRef.current === 'globe') {
      return geoOrthographic()
        .rotate([v.rot[0], v.rot[1], 0])
        .translate([w / 2 + v.pan[0], h / 2 + v.pan[1]])
        .scale((Math.min(w, h) / 2 - 12) * v.zoom)
        .clipAngle(90)
        .precision(0.5);
    }

    return flatProjection(v.zoom, v.pan);
  }, [flatProjection]);

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
      const projection = buildProjection();
      const path = geoPath(projection, ctx);
      const still = reduceMotion.current;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Fundo: a laje escura do site + um halo verde bem difuso
      ctx.fillStyle = theme.deep;
      ctx.fillRect(0, 0, w, h);
      const bg = ctx.createRadialGradient(w / 2, h * 0.45, 0, w / 2, h * 0.45, Math.max(w, h) * 0.65);
      bg.addColorStop(0, alpha(theme.accent2, 0.28));
      bg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Estrelas (só no modo globo — no planisfério o mapa ocupa tudo)
      if (isGlobe) {
        for (const st of STARS) {
          const tw = still ? 0.55 : 0.45 + 0.35 * Math.sin(ts / 1400 + st.phase);
          ctx.beginPath();
          ctx.arc(st.x * w, st.y * h, st.r, 0, Math.PI * 2);
          ctx.fillStyle = alpha(theme.accentBright, 0.28 * tw);
          ctx.fill();
        }
      }

      const R = projection.scale();
      const cx = w / 2 + v.pan[0];
      const cy = h / 2 + v.pan[1];

      // Atmosfera: o brilho que escapa da borda do planeta
      if (isGlobe) {
        const atmo = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.35);
        atmo.addColorStop(0, alpha(theme.accent, 0.22));
        atmo.addColorStop(0.45, alpha(theme.accent2, 0.12));
        atmo.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(cx, cy, R * 1.35, 0, Math.PI * 2);
        ctx.fillStyle = atmo;
        ctx.fill();

        // O oceano — mais claro de um lado, como se pegasse luz de fora
        ctx.beginPath();
        path(SPHERE);
        const sea = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
        sea.addColorStop(0, alpha(theme.surface, 0.95));
        sea.addColorStop(0.75, alpha(theme.deep, 0.92));
        sea.addColorStop(1, alpha(theme.deep, 0.98));
        ctx.fillStyle = sea;
        ctx.fill();
      }

      // Malha de latitude/longitude — a textura de "rede" por trás
      ctx.beginPath();
      path(GRATICULE);
      ctx.strokeStyle = alpha(theme.fgSubtle, 0.16);
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Continentes: contorno com glow, preenchimento quase nada — o mesmo
      // fio de luz dos cards do site
      const line = ctx.createLinearGradient(0, 0, w, h);
      line.addColorStop(0, alpha(theme.accent2, 0.55));
      line.addColorStop(0.45, alpha(theme.accentBright, 0.95));
      line.addColorStop(1, alpha(theme.accent, 0.6));

      ctx.beginPath();
      for (const f of COUNTRIES) path(f);
      ctx.fillStyle = alpha(theme.accent, 0.07);
      ctx.fill();
      ctx.save();
      ctx.shadowColor = alpha(theme.accentBright, 0.5);
      ctx.shadowBlur = 7;
      ctx.strokeStyle = line;
      ctx.lineWidth = 0.75;
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.restore();

      // Borda do planeta
      if (isGlobe) {
        ctx.beginPath();
        path(SPHERE);
        ctx.strokeStyle = alpha(theme.accent, 0.5);
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Rota da jornada — um sinal viajando pela linha pontilhada
      if (ROUTE) {
        ctx.save();
        ctx.beginPath();
        path(ROUTE);
        ctx.setLineDash([1.6, 8]);
        ctx.lineDashOffset = still ? 0 : -(ts / 42) % 1000;
        ctx.lineCap = 'round';
        ctx.strokeStyle = line;
        ctx.lineWidth = 1.8;
        ctx.shadowColor = alpha(theme.accentBright, 0.6);
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.restore();
      }

      // ── Pinos ──
      const center: [number, number] = [-v.rot[0], -v.rot[1]];
      const hits: Hit[] = [];
      const pulse = still ? 0 : (ts % 2200) / 2200;

      for (const stop of TRAVELS) {
        const p = projection(stop.coords);
        // No globo, esconde quem está do outro lado do planeta
        const visible =
          !!p &&
          (!isGlobe || geoDistance(stop.coords, center) < Math.PI / 2 - 0.02) &&
          p[0] > -60 &&
          p[0] < w + 60 &&
          p[1] > -60 &&
          p[1] < h + 60;
        const x = p?.[0] ?? 0;
        const y = p?.[1] ?? 0;
        hits.push({ id: stop.id, x, y, visible });
        if (!visible) continue;

        const isLived = stop.status === 'lived';
        const isPlanned = stop.status === 'planned';
        const isActive = activeRef.current === stop.id;
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

        ctx.save();
        ctx.shadowColor = alpha(isPlanned ? theme.accent : GLOW_GREEN, 0.85);
        ctx.shadowBlur = isActive ? 16 : 9;
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

      hitsRef.current = hits;

      // O cartão de detalhes segue o pino — mexido direto no DOM pra não
      // disparar re-render a cada quadro
      const card = cardRef.current;
      if (card) {
        const hit = hits.find((s) => s.id === activeRef.current);
        if (hit?.visible) {
          // A altura muda com o texto de cada lugar; mede só quando troca de
          // pino (ler layout todo quadro seria desperdício)
          if (cardBox.current.id !== hit.id || !cardBox.current.h) {
            cardBox.current = { id: hit.id, h: card.offsetHeight };
          }
          const ch = cardBox.current.h || 130;
          // Pino lá embaixo? O cartão vira pra cima, senão a caixa corta ele
          const below = hit.y + 18;
          const top = below + ch > h - 6 ? Math.max(6, hit.y - 18 - ch) : below;
          card.style.opacity = '1';
          card.style.left = `${clamp(hit.x, 118, Math.max(118, w - 118))}px`;
          card.style.top = `${top}px`;
        } else {
          card.style.opacity = '0';
        }
      }
    },
    [buildProjection, locale]
  );

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
      size.current = { w, h, dpr };
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      flatBase.current = null;
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
    const frame = (ts: number) => {
      const dt = Math.min((ts - last) / 1000, 0.1);
      last = ts;

      if (visibleRef.current && !document.hidden) {
        const v = view.current;

        // Voo até um lugar (clique num pino / num atalho)
        const fly = flyRef.current;
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
          !activeRef.current &&
          !reduceMotion.current
        ) {
          v.rot = [(v.rot[0] - SPIN_DEG_PER_SEC * dt + 540) % 360 - 180, v.rot[1]];
        }

        paint(ts);
        if (!readyRef.current) {
          readyRef.current = true;
          setReady(true);
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

  // ── Voar até um lugar ───────────────────────────────────────────────
  const flyTo = useCallback(
    (id: string) => {
      const stop = TRAVELS.find((s) => s.id === id);
      if (!stop) return;
      const v = view.current;
      const { w, h } = size.current;
      const toZoom = Math.max(v.zoom, modeRef.current === 'globe' ? 1.75 : 2.2);

      let toPan: [number, number] = [0, 0];
      let dRot: [number, number] = [0, 0];

      if (modeRef.current === 'globe') {
        dRot = [shortestAngle(v.rot[0], -stop.coords[0]), shortestAngle(v.rot[1], -stop.coords[1])];
      } else {
        // No planisfério a câmera não gira: desloca até o ponto ficar no meio
        const p = flatProjection(toZoom, [0, 0])(stop.coords);
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
      setActiveId(id);
    },
    [flatProjection]
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
    setActiveId(null);
  }, [home]);

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
    },
    [clampPan]
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

    const pick = (x: number, y: number) => {
      let best: { id: string; d: number } | null = null;
      for (const hit of hitsRef.current) {
        if (!hit.visible) continue;
        const d = Math.hypot(hit.x - x, hit.y - y);
        if (d < 22 && (!best || d < best.d)) best = { id: hit.id, d };
      }
      return best?.id ?? null;
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
        // Só passando o mouse: acende o pino embaixo do cursor
        const id = pick(p.x, p.y);
        canvas.style.cursor = id ? 'pointer' : 'grab';
        if (id !== activeRef.current) setActiveId(id);
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
      if (moved > 6 && activeRef.current) setActiveId(null);

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
          const id = pick(p.x, p.y);
          if (id) flyTo(id);
          else setActiveId(null);
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
      // se limpasse aqui, o cartão do pino sumiria no instante do toque
      if (e.pointerType !== 'mouse') return;
      if (!draggingRef.current) setActiveId(null);
    };

    const onDouble = (e: MouseEvent) => {
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      zoomBy(1.6, [e.clientX - r.left, e.clientY - r.top]);
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
      zoomBy(e.deltaY < 0 ? 1.12 : 1 / 1.12, [e.clientX - r.left, e.clientY - r.top]);
    };

    const onKey = (e: KeyboardEvent) => {
      const v = view.current;
      const step = e.shiftKey ? 18 : 6;
      const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-', '_', '0'];
      if (!keys.includes(e.key)) return;
      e.preventDefault();
      flyRef.current = null;
      if (e.key === '0') return resetView();
      if (e.key === '+' || e.key === '=') return zoomBy(1.2);
      if (e.key === '-' || e.key === '_') return zoomBy(1 / 1.2);
      const dx = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;
      const dy = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0;
      if (modeRef.current === 'globe') {
        v.rot = [
          ((v.rot[0] - dx * step + 540) % 360) - 180,
          clamp(v.rot[1] + dy * step, -89, 89),
        ];
      } else {
        v.pan = [v.pan[0] - dx * step * 4, v.pan[1] - dy * step * 4];
        clampPan();
      }
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
  }, [clampPan, flyTo, resetView, zoomBy]);

  const active = TRAVELS.find((s) => s.id === activeId) ?? null;

  const statusLabel: Record<TravelStatus, string> = {
    lived: t('status_lived'),
    visited: t('status_visited'),
    planned: t('status_planned'),
  };

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

          {/* Cartão do lugar — posicionado pelo loop de desenho */}
          <div
            ref={cardRef}
            aria-hidden={!active}
            className="pointer-events-none absolute z-10 w-56 -translate-x-1/2 rounded-2xl glass-strong border border-border p-4 shadow-xl shadow-black/40 transition-opacity duration-200"
            style={{ opacity: 0, left: '-999px', top: '-999px' }}
          >
            {active && (
              <>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    aria-hidden
                    className="w-2 h-2 rounded-full"
                    style={{ background: active.status === 'lived' ? GLOW_GREEN : 'var(--accent)' }}
                  />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-foreground-subtle">
                    {statusLabel[active.status]}
                    {active.year ? ` · ${active.year}` : ''}
                  </span>
                </div>
                <p className="font-bold text-foreground text-sm mb-1">
                  {active.name[locale]}
                  {active.country[locale] !== active.name[locale] ? ` — ${active.country[locale]}` : ''}
                </p>
                {active.note && (
                  <p className="text-xs text-foreground-muted leading-relaxed">{active.note[locale]}</p>
                )}
              </>
            )}
          </div>

          {/* Controles — canto superior direito */}
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
            <div className="flex flex-col rounded-xl glass overflow-hidden">
              <button
                type="button"
                onClick={() => zoomBy(1.25)}
                aria-label={t('zoom_in')}
                title={t('zoom_in')}
                className={`${ctrlBtn} w-9 h-9 rounded-none border-0`}
              >
                <Plus size={15} />
              </button>
              <span aria-hidden className="h-px bg-border" />
              <button
                type="button"
                onClick={() => zoomBy(1 / 1.25)}
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
                  setActiveId(null);
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
              activeId === stop.id
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
    </div>
  );
}
