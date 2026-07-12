'use client';

import { useEffect, useRef } from 'react';

// Camada de VIDA sobre o cenário do login: borboletas pixel batendo asas,
// vagalumes piscando, folhas caindo e uma libélula apressada de vez em
// quando — tudo desenhado sprite a sprite num canvas (nada de imagem).
// Respeita prefers-reduced-motion (não anima) e pausa sozinho em aba
// escondida (requestAnimationFrame para — e o portal tem timers de
// segurança pra nunca prender ninguém).

const SCALE = 3; // 1 pixel do sprite = 3px na tela

// ── Sprites em ASCII (cada letra = cor da paleta) ──
const PAL: Record<string, string> = {
  D: '#3a2410', W: '#ffe9c9',
  O: '#ff9f43', o: '#e0761f',
  G: '#8ffcb0', g: '#35e065',
  B: '#9ad8ff', b: '#4fa8d8',
  L: '#4f8f3a', l: '#2f6b26', d: '#1d4517',
  T: '#4beec6', t: '#1fd3a7',
};

// Borboleta: asas abertas / fechadas (2 frames de voo)
const FLY_OPEN = [
  '.OO...OO.',
  'OOOo.oOOO',
  'oOWoDoWOo',
  '.ooDDDoo.',
  '.oo.D.oo.',
  'oo.....oo',
];
const FLY_CLOSED = [
  '...O.O...',
  '..OoDoO..',
  '...oDo...',
  '....D....',
  '....D....',
  '.........',
];

// Folha que cai (4 rotações)
const LEAF_FRAMES = [
  ['..L..', '.LlL.', 'LlLlL', '.lLl.', '..d..'],
  ['..l..', '.dLl.', '.lLL.', '.LlL.', '..L..'],
  ['..d..', '.lLl.', 'LlLlL', '.LlL.', '..L..'],
  ['..L..', '.LlL.', '.LLl.', '.lLd.', '..l..'],
];

// Libélula (2 frames de asa)
const DRAGON_A = [
  '.B..B.....',
  'tTTTTTTTt.',
  '.B..B.....',
];
const DRAGON_B = [
  '.b..b.....',
  'tTTTTTTTt.',
  '.b..b.....',
];

// Troca de cor das asas → borboletas variadas (laranja, verde-aurora, azul)
const WING_SWAPS: Record<string, string>[] = [
  {},
  { O: 'G', o: 'g' },
  { O: 'B', o: 'b' },
];

function drawSprite(
  ctx: CanvasRenderingContext2D,
  map: string[],
  x: number,
  y: number,
  swap: Record<string, string> = {},
  flip = false
) {
  for (let r = 0; r < map.length; r++) {
    const row = map[r];
    for (let c = 0; c < row.length; c++) {
      const raw = row[flip ? row.length - 1 - c : c];
      if (raw === '.') continue;
      const ch = swap[raw] ?? raw;
      const col = PAL[ch];
      if (!col) continue;
      ctx.fillStyle = col;
      ctx.fillRect(Math.round(x) + c * SCALE, Math.round(y) + r * SCALE, SCALE, SCALE);
    }
  }
}

type Butterfly = {
  x: number; y: number; dir: 1 | -1; speed: number;
  baseY: number; wobble: number; phase: number; swap: Record<string, string>;
};
type Leaf = { x: number; y: number; speed: number; sway: number; phase: number; frame: number };
type Firefly = { x: number; y: number; phase: number; speed: number };
type Dragon = { x: number; y: number; dir: 1 | -1; active: boolean; nextAt: number };

export default function PixelLife() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0;
    let H = 0;
    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      W = Math.ceil(rect?.width ?? window.innerWidth);
      H = Math.ceil(rect?.height ?? window.innerHeight);
      canvas.width = W;
      canvas.height = H;
      ctx.imageSmoothingEnabled = false;
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const rnd = (a: number, b: number) => a + Math.random() * (b - a);

    // Mais bichos em telas largas, menos no celular
    const wide = W > 1100;

    // Borboletas voam na faixa da vegetação (metade de baixo)
    const butterflies: Butterfly[] = Array.from({ length: wide ? 5 : 3 }, (_, i) => ({
      x: rnd(0, W),
      y: 0,
      baseY: rnd(H * 0.45, H * 0.85),
      dir: (Math.random() < 0.5 ? 1 : -1) as 1 | -1,
      speed: rnd(18, 38),
      wobble: rnd(10, 26),
      phase: rnd(0, Math.PI * 2),
      swap: WING_SWAPS[i % WING_SWAPS.length],
    }));

    const leaves: Leaf[] = Array.from({ length: wide ? 6 : 4 }, () => ({
      x: rnd(0, W),
      y: rnd(-H, 0),
      speed: rnd(12, 26),
      sway: rnd(14, 30),
      phase: rnd(0, Math.PI * 2),
      frame: (Math.random() * 4) | 0,
    }));

    const fireflies: Firefly[] = Array.from({ length: wide ? 14 : 9 }, () => ({
      x: rnd(0, W),
      y: rnd(H * 0.25, H * 0.95),
      phase: rnd(0, Math.PI * 2),
      speed: rnd(0.3, 0.8),
    }));

    const dragon: Dragon = {
      x: -60, y: 0, dir: 1, active: false, nextAt: performance.now() + rnd(5000, 9000),
    };

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, W, H);

      // ── Folhas caindo ──
      for (const lf of leaves) {
        lf.y += lf.speed * dt;
        lf.phase += dt * 1.6;
        const x = lf.x + Math.sin(lf.phase) * lf.sway;
        if (lf.y > H + 20) {
          lf.y = -20;
          lf.x = rnd(0, W);
        }
        const frame = LEAF_FRAMES[((lf.phase * 0.8) | 0) % 4];
        drawSprite(ctx, frame, x, lf.y);
      }

      // ── Vagalumes (quadradinho + brilho pulsante) ──
      for (const f of fireflies) {
        f.phase += dt * f.speed * 2;
        const glow = (Math.sin(f.phase) + 1) / 2; // 0..1
        const x = f.x + Math.sin(f.phase * 0.7) * 14;
        const y = f.y + Math.cos(f.phase * 0.5) * 10;
        if (glow > 0.12) {
          ctx.globalAlpha = glow * 0.35;
          const grad = ctx.createRadialGradient(x, y, 0, x, y, 12);
          grad.addColorStop(0, '#8ffcb0');
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.fillRect(x - 12, y - 12, 24, 24);
          ctx.globalAlpha = Math.min(1, 0.35 + glow);
          ctx.fillStyle = '#d8ffc9';
          ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 3, 3);
          ctx.globalAlpha = 1;
        }
      }

      // ── Borboletas ──
      for (const b of butterflies) {
        b.x += b.dir * b.speed * dt;
        b.phase += dt * 9; // batida de asa
        b.y = b.baseY + Math.sin(b.phase * 0.35) * b.wobble;
        if (b.dir === 1 && b.x > W + 40) {
          b.x = -40; b.baseY = rnd(H * 0.45, H * 0.85);
        } else if (b.dir === -1 && b.x < -40) {
          b.x = W + 40; b.baseY = rnd(H * 0.45, H * 0.85);
        }
        const open = Math.sin(b.phase) > -0.2;
        drawSprite(ctx, open ? FLY_OPEN : FLY_CLOSED, b.x, b.y, b.swap, b.dir === -1);
      }

      // ── Libélula: rasante rara ──
      if (!dragon.active && now >= dragon.nextAt) {
        dragon.active = true;
        dragon.dir = (Math.random() < 0.5 ? 1 : -1) as 1 | -1;
        dragon.x = dragon.dir === 1 ? -80 : W + 80;
        dragon.y = rnd(H * 0.3, H * 0.6);
      }
      if (dragon.active) {
        dragon.x += dragon.dir * 260 * dt;
        const y = dragon.y + Math.sin(dragon.x * 0.02) * 8;
        const frame = ((now / 60) | 0) % 2 === 0 ? DRAGON_A : DRAGON_B;
        drawSprite(ctx, frame, dragon.x, y, {}, dragon.dir === -1);
        if (dragon.x > W + 90 || dragon.x < -90) {
          dragon.active = false;
          dragon.nextAt = now + rnd(7000, 14000);
        }
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 w-full h-full pointer-events-none [image-rendering:pixelated]"
    />
  );
}
