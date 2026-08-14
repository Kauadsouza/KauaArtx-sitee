'use client';

import { useEffect, useId, useRef, useState } from 'react';

interface RawHtmlContentProps {
  html: string;
  className?: string;
  title?: string;
}

// Tira cercas de código markdown (```html ... ```) que vêm junto quando o
// conteúdo é copiado de um chat — sem isso elas apareciam como texto no post.
export function stripCodeFences(raw: string): string {
  let s = raw.trim();
  const opening = /^```[a-zA-Z]*\s*\n?/;
  if (opening.test(s)) {
    s = s.replace(opening, '');
    s = s.replace(/\n?```\s*$/, '');
  }
  return s.trim();
}

// Estilos base de dentro do post: herdam a paleta do site, então um HTML
// simples já nasce com a cara certa. O autor pode sobrescrever à vontade —
// como está isolado, nada disso escapa pro resto da página.
const BASE_CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  html {
    color-scheme: dark;
    background: #0B2B26;
  }
  html, body { margin: 0; padding: 0; background: #0B2B26; }
  body {
    color: #C7E0CD;
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    font-size: 18px;
    line-height: 1.82;
    overflow-x: hidden;
    word-wrap: break-word;
  }
  img, video, canvas, svg, iframe { max-width: 100%; height: auto; }
  table { max-width: 100%; display: block; overflow-x: auto; }
  pre { max-width: 100%; overflow-x: auto; }
  a { color: #8EB69B; text-underline-offset: 3px; }
  a:hover { color: #DAF1DE; }
  h1, h2, h3, h4 { line-height: 1.2; }
`;

// Os oito posts antigos repetem um herói próprio antes do texto. A página do
// artigo já tem capa, título, categoria e data, então escondemos só essa peça
// duplicada e deixamos o restante do layout do post intacto. O texto corrido
// também fica numa medida confortável, sem estreitar cards, tabelas e alertas.
const READING_CSS = `
  body > .post { max-width: 800px !important; }
  body > .post > .hero { display: none !important; }
  body > .post > :is(p, h2, h3, h4, ul, ol) {
    max-width: 68ch;
    margin-left: auto;
    margin-right: auto;
  }
  body > .post > h2,
  body > .post > h3,
  body > .post > h4 {
    margin-top: 2.75rem;
    margin-bottom: 1rem;
  }
  @media (max-width: 640px) {
    body { font-size: 17px; }
  }
`;

// Script que roda DENTRO do iframe: mede a altura do conteúdo e avisa a
// página. Sem isso o iframe teria altura fixa e barra de rolagem interna.
const RESIZE_JS = `
  (function () {
    var id = "__FRAME_ID__";
    function send() {
      var d = document.documentElement, b = document.body;
      var h = Math.max(
        d.scrollHeight, d.offsetHeight,
        b ? b.scrollHeight : 0, b ? b.offsetHeight : 0
      );
      parent.postMessage({ source: "kaua-post-frame", id: id, height: h }, "*");
    }
    if (window.ResizeObserver) new ResizeObserver(send).observe(document.documentElement);
    window.addEventListener("load", send);
    window.addEventListener("resize", send);
    setTimeout(send, 60);
    setTimeout(send, 400);
    setTimeout(send, 1200);
    send();
  })();
`;

// Renderiza o HTML/CSS/JS de um post dentro de um IFRAME isolado.
//
// Por que iframe: antes o HTML era injetado direto na página. Se o post
// trouxesse regras globais (body, *, .container...), elas vazavam e
// desmontavam o layout do site inteiro — cabeçalho sobrepondo o título,
// conteúdo espremido. Dentro do iframe o post é um mundo à parte: pode ter
// o CSS e o JS que quiser sem encostar no resto.
//
// `base target="_parent"` faz os links do post navegarem a aba de verdade
// em vez de abrirem presos dentro do quadro.
export default function RawHtmlContent({ html, className, title = 'Conteúdo do post' }: RawHtmlContentProps) {
  const frameId = useId();
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(320);

  const body = stripCodeFences(html);

  const srcDoc = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<base target="_parent">
<style>${BASE_CSS}</style>
</head>
<body>
${body}
<style>${READING_CSS}</style>
<script>${RESIZE_JS.replace('__FRAME_ID__', frameId)}<\/script>
</body>
</html>`;

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const data = e.data;
      if (!data || data.source !== 'kaua-post-frame' || data.id !== frameId) return;
      const h = Number(data.height);
      if (Number.isFinite(h) && h > 0) setHeight(Math.ceil(h));
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [frameId]);

  return (
    <iframe
      ref={ref}
      title={title}
      srcDoc={srcDoc}
      // sem allow-same-origin de propósito: o post não alcança o site.
      // allow-scripts mantém o JS do post funcionando; a navegação por
      // clique do visitante continua permitida.
      sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
      scrolling="no"
      className={`w-full block border-0 ${className ?? ''}`}
      style={{ height, backgroundColor: '#0B2B26', colorScheme: 'dark' }}
    />
  );
}
