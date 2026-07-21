'use client';

import { useState } from 'react';

interface PostCoverProps {
  src: string | null;
  className?: string;
}

// Capa do post.
//
// Usa <img> em vez de next/image de propósito: o editor aceita link de
// qualquer host, e o otimizador do Next só libera **.supabase.co — um link
// de fora derrubaria a página inteira.
//
// Se o link estiver quebrado (ou vazio), cai no bloco de degradê em vez de
// mostrar o ícone de imagem quebrada, que era o que estava feando o blog.
export default function PostCover({ src, className }: PostCoverProps) {
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
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className ?? ''}`}
    />
  );
}
