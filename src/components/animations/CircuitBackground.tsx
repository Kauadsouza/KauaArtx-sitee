'use client';

import { useEffect, useRef } from 'react';

/* ── Types ──────────────────────────────────── */
interface Node { x: number; y: number }
interface Conn { from: number; to: number; corner: 'hv' | 'vh' }
interface Pulse { conn: number; t: number; speed: number; rev: boolean; size: number }
interface Orb   { cx: number; cy: number; rx: number; ry: number; angle: number; speed: number; r: number; color: string; alpha: number }

/* ── Helpers ─────────────────────────────────── */
const dist = (a: Node, b: Node) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

const corner = (c: Conn, nodes: Node[]) => {
  const a = nodes[c.from], b = nodes[c.to];
  return c.corner === 'hv' ? { x: b.x, y: a.y } : { x: a.x, y: b.y };
};

const pulsePos = (p: Pulse, conns: Conn[], nodes: Node[]) => {
  const c = conns[p.conn];
  if (!c) return { x: 0, y: 0 };
  const a = nodes[c.from], b = nodes[c.to], cr = corner(c, nodes);
  const t = p.rev ? 1 - p.t : p.t;
  const l1 = dist(a, cr), l2 = dist(cr, b), total = l1 + l2;
  const prog = t * total;
  if (prog <= l1) {
    const s = l1 > 0 ? prog / l1 : 0;
    return { x: a.x + (cr.x - a.x) * s, y: a.y + (cr.y - a.y) * s };
  }
  const s = l2 > 0 ? (prog - l1) / l2 : 0;
  return { x: cr.x + (b.x - cr.x) * s, y: cr.y + (b.y - cr.y) * s };
};

/* ── Config ─────────────────────────────────── */
const GRID     = 80;
const JITTER   = 0.42;
const MAX_CONN = 3;
const N_PULSES = 28;
const FPS      = 40;
const FRAME_MS = 1000 / FPS;

export default function CircuitBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0;
    let nodes:  Node[]  = [];
    let conns:  Conn[]  = [];
    let pulses: Pulse[] = [];
    let orbs:   Orb[]   = [];
    let staticBG: HTMLCanvasElement | null = null;

    /* ── Build aurora orbs ───────────────────── */
    const buildOrbs = () => {
      orbs = [
        { cx: W * 0.15, cy: H * 0.25, rx: W * 0.30, ry: H * 0.20, angle: 0,    speed: 0.00018, r: Math.min(W,H) * 0.50, color: '#1F4D3A', alpha: 0.22 },
        { cx: W * 0.80, cy: H * 0.70, rx: W * 0.25, ry: H * 0.30, angle: 2.1,  speed: 0.00012, r: Math.min(W,H) * 0.45, color: '#0D2E22', alpha: 0.28 },
        { cx: W * 0.55, cy: H * 0.10, rx: W * 0.20, ry: H * 0.22, angle: 4.2,  speed: 0.00022, r: Math.min(W,H) * 0.38, color: '#2D7A5C', alpha: 0.14 },
        { cx: W * 0.90, cy: H * 0.15, rx: W * 0.18, ry: H * 0.18, angle: 1.0,  speed: 0.00015, r: Math.min(W,H) * 0.35, color: '#1A3D2C', alpha: 0.20 },
        { cx: W * 0.30, cy: H * 0.85, rx: W * 0.22, ry: H * 0.16, angle: 3.5,  speed: 0.00020, r: Math.min(W,H) * 0.40, color: '#0F3326', alpha: 0.18 },
      ];
    };

    /* ── Build circuit graph ─────────────────── */
    const buildGraph = () => {
      nodes = []; conns = []; pulses = [];
      const cols = Math.ceil(W / GRID) + 1;
      const rows = Math.ceil(H / GRID) + 1;

      for (let c = 0; c < cols; c++)
        for (let r = 0; r < rows; r++)
          nodes.push({
            x: c * GRID + (Math.random() - .5) * GRID * JITTER,
            y: r * GRID + (Math.random() - .5) * GRID * JITTER,
          });

      const cnt  = new Array(nodes.length).fill(0);
      const seen = new Set<string>();

      for (let i = 0; i < nodes.length; i++) {
        const nearby = nodes
          .map((_, j) => j)
          .filter(j => j !== i && dist(nodes[i], nodes[j]) < GRID * 2.3)
          .sort((a, b) => dist(nodes[i], nodes[a]) - dist(nodes[i], nodes[b]));

        for (const j of nearby) {
          if (cnt[i] >= MAX_CONN || cnt[j] >= MAX_CONN) continue;
          const key = `${Math.min(i,j)}-${Math.max(i,j)}`;
          if (seen.has(key) || Math.random() > 0.62) continue;
          seen.add(key);
          conns.push({ from: i, to: j, corner: Math.random() > .5 ? 'hv' : 'vh' });
          cnt[i]++; cnt[j]++;
        }
      }

      for (let i = 0; i < N_PULSES; i++) {
        if (!conns.length) break;
        pulses.push({
          conn:  Math.floor(Math.random() * conns.length),
          t:     Math.random(),
          speed: 0.07 + Math.random() * 0.12,
          rev:   Math.random() > .5,
          size:  1.5 + Math.random() * 2,
        });
      }
    };

    /* ── Bake static circuit to offscreen canvas ── */
    const bakeBG = () => {
      staticBG = document.createElement('canvas');
      staticBG.width  = W;
      staticBG.height = H;
      const c = staticBG.getContext('2d');
      if (!c) return;

      c.lineWidth   = 1;
      c.strokeStyle = 'rgba(45,122,92,0.30)';

      for (const conn of conns) {
        const a = nodes[conn.from], b = nodes[conn.to];
        const cr = corner(conn, nodes);
        c.beginPath();
        c.moveTo(a.x, a.y);
        c.lineTo(cr.x, cr.y);
        c.lineTo(b.x, b.y);
        c.stroke();
      }

      for (const n of nodes) {
        c.beginPath();
        c.arc(n.x, n.y, 2, 0, Math.PI * 2);
        c.fillStyle   = 'rgba(45,122,92,0.55)';
        c.shadowColor = '#2D7A5C';
        c.shadowBlur  = 5;
        c.fill();
        c.shadowBlur  = 0;
      }
    };

    /* ── Init everything ─────────────────────── */
    const init = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      buildOrbs();
      buildGraph();
      bakeBG();
    };

    /* ── Draw aurora orbs ────────────────────── */
    const drawOrbs = (time: number) => {
      for (const o of orbs) {
        o.angle += o.speed;
        const x = o.cx + Math.cos(o.angle) * o.rx;
        const y = o.cy + Math.sin(o.angle) * o.ry;
        const g = ctx.createRadialGradient(x, y, 0, x, y, o.r);
        g.addColorStop(0, o.color + Math.round(o.alpha * 255).toString(16).padStart(2,'0'));
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, o.r, 0, Math.PI * 2);
        ctx.fill();
      }
      void time;
    };

    /* ── Draw a single pulse ─────────────────── */
    const drawPulse = (p: Pulse) => {
      if (!conns.length) return;
      const pos = pulsePos(p, conns, nodes);
      const s   = p.size;

      // Wide soft aura
      const g = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, s * 6);
      g.addColorStop(0, `rgba(0,255,136,0.65)`);
      g.addColorStop(0.4, `rgba(0,255,136,0.20)`);
      g.addColorStop(1, 'rgba(0,255,136,0)');
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, s * 6, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();

      // Bright core
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, s, 0, Math.PI * 2);
      ctx.fillStyle   = '#00FF88';
      ctx.shadowColor = '#00FF88';
      ctx.shadowBlur  = 12;
      ctx.fill();
      ctx.shadowBlur  = 0;
    };

    /* ── Main render loop ────────────────────── */
    let lastDraw = 0;

    const animate = (now: number) => {
      rafRef.current = requestAnimationFrame(animate);
      if (now - lastDraw < FRAME_MS) return;
      lastDraw = now;

      ctx.clearRect(0, 0, W, H);

      // 1. Aurora blobs
      drawOrbs(now);

      // 2. Static circuit
      if (staticBG) ctx.drawImage(staticBG, 0, 0);

      // 3. Animated pulses
      const delta = Math.min(FRAME_MS / 1000, 0.05);
      for (const p of pulses) {
        p.t += p.speed * delta;
        if (p.t >= 1) {
          p.t = 0;
          if (Math.random() > .5) p.conn = Math.floor(Math.random() * conns.length);
          p.rev = Math.random() > .5;
        }
        drawPulse(p);
      }
    };

    init();
    rafRef.current = requestAnimationFrame(animate);

    const onResize = () => {
      cancelAnimationFrame(rafRef.current);
      init();
      rafRef.current = requestAnimationFrame(animate);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="circuit-bg fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
