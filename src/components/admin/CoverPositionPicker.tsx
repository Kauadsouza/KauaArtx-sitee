'use client';

import { useRef, useState } from 'react';
import { Move } from 'lucide-react';

interface CoverPositionPickerProps {
  src: string;
  value: string; // object-position, ex.: "50% 30%"
  onChange: (value: string) => void;
}

// Converte "50% 30%" → [0.5, 0.3]. Tolera valores fora do padrão caindo no centro.
function parse(value: string): [number, number] {
  const m = value.match(/(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%/);
  if (!m) return [0.5, 0.5];
  const x = Math.min(1, Math.max(0, Number(m[1]) / 100));
  const y = Math.min(1, Math.max(0, Number(m[2]) / 100));
  return [x, y];
}

const PRESETS: { label: string; value: string }[] = [
  { label: 'Topo', value: '50% 0%' },
  { label: 'Centro', value: '50% 50%' },
  { label: 'Base', value: '50% 100%' },
  { label: 'Esquerda', value: '0% 50%' },
  { label: 'Direita', value: '100% 50%' },
];

// Prévia do corte 16:9 com foco arrastável. O que aparece aqui é EXATAMENTE
// o que sai no blog (mesmo object-fit: cover + object-position). Arraste o
// alvo pra escolher qual parte da foto fica visível.
export default function CoverPositionPicker({ src, value, onChange }: CoverPositionPickerProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [failed, setFailed] = useState(false);
  const [x, y] = parse(value);

  const setFromPointer = (clientX: number, clientY: number) => {
    const box = boxRef.current;
    if (!box) return;
    const r = box.getBoundingClientRect();
    const fx = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    const fy = Math.min(1, Math.max(0, (clientY - r.top) / r.height));
    onChange(`${Math.round(fx * 100)}% ${Math.round(fy * 100)}%`);
  };

  if (failed) return null; // link quebrado: sem prévia (o aviso já explica)

  return (
    <div>
      <div
        ref={boxRef}
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          setDragging(true);
          setFromPointer(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => dragging && setFromPointer(e.clientX, e.clientY)}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-border cursor-move select-none touch-none bg-surface"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          draggable={false}
          onError={() => setFailed(true)}
          style={{ objectPosition: value }}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        {/* Grade de terços, ajuda a enquadrar */}
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 inset-x-0 h-px bg-white/25" />
          <div className="absolute top-2/3 inset-x-0 h-px bg-white/25" />
          <div className="absolute left-1/3 inset-y-0 w-px bg-white/25" />
          <div className="absolute left-2/3 inset-y-0 w-px bg-white/25" />
        </div>
        {/* Alvo do foco */}
        <div
          aria-hidden
          className="absolute w-7 h-7 rounded-full border-2 border-white bg-black/30 backdrop-blur-sm shadow-[0_0_0_2px_rgba(0,0,0,0.4)] flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
        >
          <Move size={13} className="text-white" />
        </div>
      </div>

      {/* Atalhos de enquadramento */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => onChange(p.value)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              value === p.value
                ? 'bg-accent text-[color:var(--ink-on-accent)] border-accent'
                : 'border-border text-foreground-muted hover:text-foreground hover:border-border-strong'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-foreground-subtle">
        Arraste o alvo pra escolher qual parte da foto aparece. É exatamente o que sai no blog.
      </p>
    </div>
  );
}
