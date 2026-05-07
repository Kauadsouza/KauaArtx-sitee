'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  opacity: number;
  phase: number;
  speed: number;
}

const GRID_SIZE = 40;
const DOT_RADIUS = 1.2;
const BASE_OPACITY = 0.12;

export default function ParticleGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Disable on mobile for performance
    if (window.matchMedia('(max-width: 768px)').matches) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      buildParticles();
    };

    const buildParticles = () => {
      particlesRef.current = [];
      const cols = Math.ceil(canvas.width / GRID_SIZE) + 1;
      const rows = Math.ceil(canvas.height / GRID_SIZE) + 1;

      for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
          particlesRef.current.push({
            x: col * GRID_SIZE,
            y: row * GRID_SIZE,
            opacity: BASE_OPACITY,
            phase: Math.random() * Math.PI * 2,
            speed: 0.3 + Math.random() * 0.7,
          });
        }
      }
    };

    const draw = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      timeRef.current += 0.01;

      for (const p of particlesRef.current) {
        const pulse = Math.sin(timeRef.current * p.speed + p.phase);
        const opacity = BASE_OPACITY + pulse * 0.06;

        ctx.beginPath();
        ctx.arc(p.x, p.y, DOT_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(31, 77, 58, ${opacity})`; // --accent
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animRef.current);
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
