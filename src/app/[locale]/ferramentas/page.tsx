import type { Metadata } from 'next';
import {
  ArrowRight,
  CalendarRange,
  Check,
  FileCheck2,
  FolderSearch,
  Globe2,
  ListChecks,
  LockKeyhole,
  Luggage,
  MapPinned,
  ShieldCheck,
  Signal,
  Sparkles,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';

const TOOL_GROUPS = [
  {
    key: 'checklist',
    icon: ListChecks,
    title: { pt: 'Checklist de saída', en: 'Departure checklist' },
    intro: {
      pt: 'O básico que precisa estar resolvido antes do aeroporto.',
      en: 'The basics that need to be sorted before the airport.',
    },
    items: {
      pt: ['Passaporte válido', 'Regras de entrada conferidas', 'Passagem, hospedagem e deslocamento organizados'],
      en: ['Valid passport', 'Entry rules checked', 'Tickets, accommodation, and local transport organised'],
    },
    link: '/blog/checklist-real-para-comecar-a-viajar-e-trabalhar-remoto',
    linkLabel: { pt: 'Abrir checklist completo', en: 'Open the full checklist' },
  },
  {
    key: 'documents',
    icon: FileCheck2,
    title: { pt: 'Documentos', en: 'Documents' },
    intro: {
      pt: 'Separar o que autoriza a viagem do que comprova o seu plano.',
      en: 'Separate what authorises travel from what supports your plan.',
    },
    items: {
      pt: ['Autorização, visto ou residência aplicável', 'Comprovantes exigidos pelo destino', 'Cópia segura e acesso offline'],
      en: ['Applicable authorisation, visa, or residence status', 'Evidence required by the destination', 'A secure copy and offline access'],
    },
    link: '/glossario',
    linkLabel: { pt: 'Consultar o glossário', en: 'Open the glossary' },
  },
  {
    key: 'insurance',
    icon: ShieldCheck,
    title: { pt: 'Seguro', en: 'Insurance' },
    intro: {
      pt: 'Comparar cobertura real, não só o preço mais baixo.',
      en: 'Compare real coverage, not only the lowest price.',
    },
    items: {
      pt: ['Destino e período corretos', 'Limites, exclusões e franquia lidos', 'Contato de emergência salvo'],
      en: ['Correct destination and travel period', 'Limits, exclusions, and excess read', 'Emergency contact saved'],
    },
  },
  {
    key: 'internet',
    icon: Signal,
    title: { pt: 'Internet', en: 'Internet' },
    intro: {
      pt: 'Chegar conectado sem depender do Wi-Fi do aeroporto.',
      en: 'Arrive connected without relying on airport Wi-Fi.',
    },
    items: {
      pt: ['Roaming, SIM local ou eSIM comparados', 'Cobertura no destino verificada', 'Mapas e reservas disponíveis offline'],
      en: ['Roaming, local SIM, or eSIM compared', 'Coverage at the destination checked', 'Maps and bookings available offline'],
    },
  },
  {
    key: 'planning',
    icon: MapPinned,
    title: { pt: 'Planejamento', en: 'Planning' },
    intro: {
      pt: 'Um plano simples que deixa espaço para a viagem acontecer.',
      en: 'A simple plan that leaves room for the trip to happen.',
    },
    items: {
      pt: ['Orçamento com margem para imprevistos', 'Primeiro deslocamento e endereço salvos', 'Prioridades definidas, sem lotar todos os horários'],
      en: ['A budget with room for surprises', 'First transfer and address saved', 'Priorities set without filling every hour'],
    },
    link: '/mapa',
    linkLabel: { pt: 'Abrir o mapa', en: 'Open the map' },
  },
] as const;

const ORGANIZER_STEPS = [
  {
    icon: FolderSearch,
    title: { pt: 'Localizar', en: 'Locate' },
    text: { pt: 'Reunir as fontes oficiais certas para o destino.', en: 'Gather the right official sources for the destination.' },
  },
  {
    icon: Luggage,
    title: { pt: 'Mastigar', en: 'Make it clear' },
    text: { pt: 'Transformar a documentação em um checklist simples.', en: 'Turn the documentation into a simple checklist.' },
  },
  {
    icon: CalendarRange,
    title: { pt: 'Acompanhar', en: 'Track' },
    text: { pt: 'Visualizar status e datas de validade em um só lugar.', en: 'See status and expiry dates in one place.' },
  },
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isPt = locale === 'pt';

  return {
    title: isPt ? 'Ferramentas de viagem' : 'Travel tools',
    description: isPt
      ? 'Checklist simples para documentos, seguro, internet e planejamento de viagem.'
      : 'A simple checklist for travel documents, insurance, internet, and planning.',
  };
}

export default async function ToolsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isPt = locale === 'pt';
  const loc = isPt ? 'pt' : 'en';

  return (
    <div className="relative min-h-screen overflow-hidden pt-24">
      <div aria-hidden className="orb left-[-14%] top-[18%] h-[380px] w-[380px] bg-accent-2/20 animate-float-slower" />

      <div className="relative mx-auto max-w-6xl px-4 pb-32 sm:px-6 lg:px-8">
        <header className="py-14 sm:py-20">
          <div className="grid gap-9 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)] lg:items-end">
            <div>
              <div className="mb-5 flex items-center gap-2.5 text-accent">
                <Luggage size={17} aria-hidden />
                <span className="font-mono text-xs uppercase tracking-[0.28em]">
                  {isPt ? 'KIT DE VIAGEM' : 'TRAVEL KIT'}
                </span>
              </div>
              <h1 className="text-5xl font-bold tracking-[-0.055em] text-foreground sm:text-7xl">
                {isPt ? 'Menos abas abertas. Mais clareza.' : 'Fewer open tabs. More clarity.'}
              </h1>
            </div>
            <p className="text-lg leading-relaxed text-foreground-muted">
              {isPt
                ? 'Um ponto de partida para organizar o que precisa ser conferido — sem fingir que existe uma lista universal para toda viagem.'
                : 'A starting point for organising what needs to be checked — without pretending one universal list fits every trip.'}
            </p>
          </div>
        </header>

        <section aria-labelledby="kit-title">
          <div className="mb-8 flex items-center gap-4">
            <h2 id="kit-title" className="whitespace-nowrap text-2xl font-bold text-foreground">
              {isPt ? 'Organize por etapa' : 'Organise by stage'}
            </h2>
            <span aria-hidden className="h-px flex-1 bg-border" />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {TOOL_GROUPS.map((group, index) => {
              const Icon = group.icon;
              return (
                <article
                  key={group.key}
                  className={`flex flex-col rounded-3xl border border-border bg-surface p-6 sm:p-7 ${
                    index === TOOL_GROUPS.length - 1 ? 'md:col-span-2' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent-bright">
                      <Icon size={20} aria-hidden />
                    </span>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{group.title[loc]}</h3>
                      <p className="mt-1 text-sm text-foreground-muted">{group.intro[loc]}</p>
                    </div>
                  </div>

                  <ul className="mt-6 flex-1 space-y-3">
                    {group.items[loc].map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-relaxed text-foreground-muted">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent-bright">
                          <Check size={12} strokeWidth={3} aria-hidden />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  {'link' in group && group.link && (
                    <Link
                      href={group.link}
                      className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent-bright"
                    >
                      {group.linkLabel[loc]}
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="organizer-title" className="mt-20 overflow-hidden rounded-[2rem] border border-border-strong bg-deep">
          <div className="hairline-gradient h-px w-full" aria-hidden />
          <div className="p-6 sm:p-10">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#F5C97B]/35 bg-[#F5C97B]/[0.07] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.17em] text-[#F5C97B]">
                  <Sparkles size={13} aria-hidden />
                  {isPt ? 'Conceito em estudo' : 'Concept under study'}
                </span>
                <h2 id="organizer-title" className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {isPt ? 'Um organizador que “mastiga” a documentação.' : 'An organiser that makes documentation easier.'}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-foreground-muted">
                  {isPt
                    ? 'A ideia é transformar páginas oficiais espalhadas em um caminho claro. Uma versão futura poderia ser paga pela organização e pelo acompanhamento — nunca por prometer visto, entrada ou aprovação.'
                    : 'The idea is to turn scattered official pages into a clear path. A future version could charge for organisation and tracking — never for promising a visa, entry, or approval.'}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-foreground-subtle">
                <LockKeyhole size={14} aria-hidden />
                {isPt ? 'Nenhum dado é enviado nesta versão' : 'No data is submitted in this version'}
              </div>
            </div>

            <div className="mt-9 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
              {ORGANIZER_STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.title.pt} className="bg-surface p-6">
                    <div className="flex items-center justify-between gap-4">
                      <Icon size={20} className="text-accent-bright" aria-hidden />
                      <span className="font-mono text-xs text-foreground-subtle">0{index + 1}</span>
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-foreground">{step.title[loc]}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-foreground-muted">{step.text[loc]}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-7 flex items-start gap-3 rounded-2xl border border-border bg-background/35 p-4">
              <Globe2 size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden />
              <p className="text-sm leading-relaxed text-foreground-muted">
                {isPt
                  ? 'Por enquanto, isto é apenas um esboço estático: sem preço, conta, upload, pagamento ou armazenamento. O conteúdo não substitui análise jurídica ou migratória.'
                  : 'For now, this is only a static sketch: no price, account, upload, payment, or storage. The content does not replace legal or immigration advice.'}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
