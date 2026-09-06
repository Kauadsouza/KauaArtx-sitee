'use client';

import { useState } from 'react';

interface PostCoverProps {
  src: string | null;
  className?: string;
  // object-position CSS (ex.: "50% 30%") — qual parte da foto fica visível
  // depois do corte automático pra proporção do container.
  position?: string | null;
  priority?: boolean;
}

// Capa do post.
//
// Usa <img> em vez de next/image de propósito: o editor aceita link de
// qualquer host, e o otimizador do Next só libera **.supabase.co — um link
// de fora derrubaria a página inteira.
//
// Se o link estiver quebrado (ou vazio), cai no bloco de degradê em vez de
// mostrar o ícone de imagem quebrada, que era o que estava feando o blog.
export default function PostCover({ src, className, position, priority = false }: PostCoverProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        aria-hidden
        className={`bg-gradient-to-br from-surface-elevated via-surface to-background ${className ?? ''}`}
      >
        <div className="w-full h-full gradient-radial-top opacity-60" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      onError={() => setFailed(true)}
      style={{ objectPosition: position ?? '50% 50%' }}
      className={`object-cover ${className ?? ''}`}
    />
  );
}
