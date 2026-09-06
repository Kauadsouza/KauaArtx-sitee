import { ArrowRight, BookOpenText, MapPinned, Radio, Wrench } from 'lucide-react';
import { Link } from '@/i18n/navigation';

const ITEMS = [
  {
    href: '/viagens/oxford',
    icon: MapPinned,
    title: { pt: 'Oxford, por inteiro', en: 'Oxford, in one place' },
    description: {
      pt: 'O primeiro relato, o ponto no mapa e o espaço preparado para fotos e vídeo.',
      en: 'The first story, its map point, and space prepared for photos and video.',
    },
  },
  {
    href: '/ferramentas',
    icon: Wrench,
    title: { pt: 'Ferramentas de viagem', en: 'Travel tools' },
    description: {
      pt: 'Checklists, documentos, seguro, internet e planejamento sem misturar tudo.',
      en: 'Checklists, documents, insurance, internet, and planning without the clutter.',
    },
  },
  {
    href: '/glossario',
    icon: BookOpenText,
    title: { pt: 'Glossário sem enrolação', en: 'No-nonsense glossary' },
    description: {
      pt: 'ETA, ETIAS, EES, visto e residência explicados de forma simples.',
      en: 'ETA, ETIAS, EES, visas, and residence explained simply.',
    },
  },
  {
    href: '/agora',
    icon: Radio,
    title: { pt: 'Histórico do agora', en: 'Now archive' },
    description: {
      pt: 'Atualizações manuais e datadas sobre onde estou e o que estou construindo.',
      en: 'Manual, dated updates on where I am and what I am building.',
    },
  },
] as const;

export default function ExploreSection({ locale }: { locale: string }) {
  const loc = locale === 'en' ? 'en' : 'pt';

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.24em] text-accent">
            {loc === 'pt' ? 'EXPLORE O PROJETO' : 'EXPLORE THE PROJECT'}
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            {loc === 'pt' ? 'Mais caminhos, sem perder o fio.' : 'More paths, without losing the thread.'}
          </h2>
        </div>

        <div className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map(({ href, icon: Icon, title, description }, index) => (
            <Link
              key={href}
              href={href}
              className="group flex min-h-64 flex-col bg-surface p-7 transition-colors hover:bg-surface-elevated"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border-strong text-accent">
                  <Icon size={19} aria-hidden />
                </span>
                <span className="font-mono text-xs text-foreground-subtle">0{index + 1}</span>
              </div>
              <h3 className="mt-8 text-xl font-bold text-foreground">{title[loc]}</h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground-muted">{description[loc]}</p>
              <span className="mt-auto flex items-center gap-2 pt-7 text-sm font-semibold text-accent transition-colors group-hover:text-accent-bright">
                {loc === 'pt' ? 'Abrir' : 'Open'}
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
