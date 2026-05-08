'use client';

import { useEffect, useRef } from 'react';

/* ── Types ──────────────────────────────────────────── */
interface Node { x: number; y: number }
interface Conn { from: number; to: number; corner: 'hv' | 'vh' }
interface Pulse { conn: number; t: number; speed: number; rev: boolean }

/* ── Helpers ─────────────────────────────────────────── */
const dist = (a: Node, b: Node) =>
  Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

const corner = (c: Conn, nodes: Node[]) => {
  const a = nodes[c.from], b = nodes[c.to];
  return c.corner === 'hv' ? { x: b.x, y: a.y } : { x: a.x, y: b.y };
};

const pulsePos = (p: Pulse, conns: Conn[], nodes: Node[]) => {
  const c = conns[p.conn];
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

/* ── Config ──────────────────────────────────────────── */
const GRID      = 95;    // px between nodes
const JITTER    = 0.38;  // randomness
const MAX_CONN  = 3;     // per node
const CONN_PROB = 0.60;  // sparseness
const MAX_DIST  = 2.3;   // grid cells
const N_PULSES  = 18;
const FPS_CAP   = 30;
const FRAME_MS  = 1000 / FPS_CAP;

/* ── Component ───────────────────────────────────────── */
export default function CircuitBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let nodes:  Node[]  = [];
    let conns:  Conn[]  = [];
    let pulses: Pulse[] = [];
    // Static circuit drawn once to an offscreen canvas
    let bg: HTMLCanvasElement | null = null;

    /* ── Build graph ────────────────── */
    const build = () => {
      nodes = []; conns = []; pulses = [];
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;

      const cols = Math.ceil(canvas.width  / GRID) + 1;
      const rows = Math.ceil(canvas.height / GRID) + 1;

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
          .filter(j => j !== i && dist(nodes[i], nodes[j]) < GRID * MAX_DIST)
          .sort((a, b) => dist(nodes[i], nodes[a]) - dist(nodes[i], nodes[b]));

        for (const j of nearby) {
          if (cnt[i] >= MAX_CONN || cnt[j] >= MAX_CONN) continue;
          const key = `${Math.min(i,j)}-${Math.max(i,j)}`;
          if (seen.has(key) || Math.random() > CONN_PROB) continue;
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
          speed: 0.055 + Math.random() * 0.09,
          rev:   Math.random() > .5,
        });
      }
    };

    /* ── Paint static circuit to offscreen canvas ── */
    const buildBG = () => {
      bg = document.createElement('canvas');
      bg.width  = canvas.width;
      bg.height = canvas.height;
      const c = bg.getContext('2d');
      if (!c) return;

      // Lines
      c.lineWidth = 1;
      for (const conn of conns) {
        const a = nodes[conn.from], b = nodes[conn.to];
        const cr = corner(conn, nodes);
        c.beginPath();
        c.moveTo(a.x, a.y);
        c.lineTo(cr.x, cr.y);
        c.lineTo(b.x, b.y);
        c.strokeStyle = 'rgba(31,77,58,0.18)';
        c.stroke();
      }

      // Nodes
      for (const n of nodes) {
        c.beginPath();
        c.arc(n.x, n.y, 1.8, 0, Math.PI * 2);
        c.fillStyle = 'rgba(45,122,92,0.35)';
        c.shadowColor = '#2D7A5C';
        c.shadowBlur  = 4;
        c.fill();
        c.shadowBlur  = 0;
      }
    };

    /* ── Draw animated pulses ─────────────────────── */
    const drawPulse = (p: Pulse) => {
      if (!conns.length) return;
      const pos = pulsePos(p, conns, nodes);

      // Soft aura
      const g = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 10);
      g.addColorStop(0, 'rgba(0,255,136,0.55)');
      g.addColorStop(1, 'rgba(0,255,136,0)');
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.shadowColor = '#00FF88';
      ctx.shadowBlur  = 14;
      ctx.fill();
      ctx.shadowBlur  = 0;

      // Core dot
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,255,136,0.95)';
      ctx.fill();
    };

    /* ── Render loop ──────────────────────────────── */
    let last = 0, drawLast = 0;

    const animate = (now: number) => {
      rafRef.current = requestAnimationFrame(animate);
      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;

      // Cap to FPS_CAP
      if (now - drawLast < FRAME_MS) return;
      drawLast = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (bg) ctx.drawImage(bg, 0, 0);

      for (const p of pulses) {
        p.t += p.speed * delta;
        if (p.t >= 1) {
          p.t = 0;
          if (Math.random() > .6) p.conn = Math.floor(Math.random() * conns.length);
          p.rev = Math.random() > .5;
        }
        drawPulse(p);
      }
    };

    build();
    buildBG();
    rafRef.current = requestAnimationFrame(animate);

    const onResize = () => {
      cancelAnimationFrame(rafRef.current);
      build();
      buildBG();
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
