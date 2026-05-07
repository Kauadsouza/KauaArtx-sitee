'use client';

import { useEffect, useRef } from 'react';

const GRID = 52;
const DOT_R = 1;
const BASE_OP = 0.1;

export default function ParticleGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Disable on mobile / reduced-motion
    if (
      window.matchMedia('(max-width: 768px)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    type Dot = { x: number; y: number; phase: number; speed: number };
    let dots: Dot[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      dots = [];
      const cols = Math.ceil(canvas.width / GRID) + 1;
      const rows = Math.ceil(canvas.height / GRID) + 1;
      for (let c = 0; c < cols; c++)
        for (let r = 0; r < rows; r++)
          dots.push({ x: c * GRID, y: r * GRID, phase: Math.random() * Math.PI * 2, speed: 0.4 + Math.random() * 0.6 });
    };

    const draw = () => {
      if (!ctx || !canvas) return;
      tRef.current += 0.008;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#1F4D3A';
      for (const d of dots) {
        const op = BASE_OP + Math.sin(tRef.current * d.speed + d.phase) * 0.05;
        ctx.globalAlpha = Math.max(0, op);
        ctx.beginPath();
        ctx.arc(d.x, d.y, DOT_R, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    draw();

    const onResize = () => { cancelAnimationFrame(rafRef.current); resize(); draw(); };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
