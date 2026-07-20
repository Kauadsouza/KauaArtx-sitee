'use client';

import { useEffect, useRef } from 'react';

interface RawHtmlContentProps {
  html: string;
  className?: string;
}

// Renderiza HTML/CSS/JS cru de um post. Navegadores ignoram <script> injetado
// via innerHTML por segurança — recriamos cada tag manualmente pra rodar de
// verdade (o mesmo truque que qualquer embed de terceiro usa).
export default function RawHtmlContent({ html, className }: RawHtmlContentProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const oldScripts = container.querySelectorAll('script');
    oldScripts.forEach((oldScript) => {
      const newScript = document.createElement('script');
      for (const attr of oldScript.attributes) {
        newScript.setAttribute(attr.name, attr.value);
      }
      newScript.textContent = oldScript.textContent;
      oldScript.replaceWith(newScript);
    });
  }, [html]);

  return <div ref={ref} className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
