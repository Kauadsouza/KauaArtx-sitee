'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Linkedin, Twitter, Link2, Check } from 'lucide-react';

// O lucide não tem o glifo do WhatsApp — desenhado aqui, no mesmo esquema
// dos ícones do Google/GitHub no portal (sign-up.tsx).
function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

// Fila de compartilhar no fim do post: WhatsApp, X, LinkedIn e copiar link.
// Os três primeiros abrem a tela de compartilhar de cada rede em aba nova;
// o último copia e confirma na hora ("Link copiado!").
export default function SharePost({ url, title }: { url: string; title: string }) {
  const t = useTranslations('blog');
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Navegador antigo ou página sem permissão: caminho clássico
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const enc = encodeURIComponent;
  const networks = [
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${enc(`${title} — ${url}`)}`,
      icon: <WhatsAppIcon size={16} />,
    },
    {
      label: 'X / Twitter',
      href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`,
      icon: <Twitter size={16} />,
    },
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
      icon: <Linkedin size={16} />,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium text-foreground-muted mr-1">
        {t('share_title')}
      </span>
      {networks.map(({ label, href, icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground-subtle hover:text-accent-bright hover:border-accent hover:-translate-y-0.5 transition-all duration-300"
        >
          {icon}
        </a>
      ))}
      <button
        type="button"
        onClick={copy}
        aria-label={t('share_copy')}
        title={t('share_copy')}
        className="group flex items-center gap-2 h-10 pl-3 pr-4 rounded-full border border-border text-foreground-subtle hover:text-accent-bright hover:border-accent transition-all duration-300"
      >
        {copied ? <Check size={15} className="text-accent-bright" /> : <Link2 size={15} />}
        <span className="text-xs font-medium">
          {copied ? t('share_copied') : t('share_copy')}
        </span>
      </button>
    </div>
  );
}
