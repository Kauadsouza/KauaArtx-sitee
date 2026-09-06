import type { Metadata } from 'next';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpenCheck,
  Fingerprint,
  Home,
  IdCard,
  PlaneTakeoff,
  ShieldCheck,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';

const TERMS = [
  {
    key: 'eta',
    icon: PlaneTakeoff,
    label: 'ETA',
    status: { pt: 'Em vigor no Reino Unido', en: 'In force in the United Kingdom' },
    summary: {
      pt: 'Autorização eletrônica para viajar ao Reino Unido quando o seu perfil exige esse documento.',
      en: 'An electronic authorisation to travel to the United Kingdom when your profile requires it.',
    },
    limit: {
      pt: 'Não é visto e não garante sua entrada. A decisão final continua sendo feita na fronteira.',
      en: 'It is not a visa and does not guarantee entry. The final decision is still made at the border.',
    },
    source: 'https://www.gov.uk/eta/overview',
    sourceLabel: { pt: 'GOV.UK — ETA', en: 'GOV.UK — ETA' },
  },
  {
    key: 'etias',
    icon: ShieldCheck,
    label: 'ETIAS',
    status: { pt: 'Previsto para o fim de 2026', en: 'Expected in late 2026' },
    summary: {
      pt: 'Autorização de viagem europeia planejada para visitantes isentos de visto em viagens curtas.',
      en: 'A planned European travel authorisation for visa-exempt visitors taking short trips.',
    },
    limit: {
      pt: 'Não é visto nem residência. Em 14/08/2026, o sistema oficial ainda informava que nenhuma ação era necessária.',
      en: 'It is neither a visa nor residence permission. On 14 Aug 2026, the official site still said no action was required.',
    },
    source: 'https://www.travel-europe.europa.eu/en/etias/about-etias/who-should-apply',
    sourceLabel: { pt: 'União Europeia — ETIAS', en: 'European Union — ETIAS' },
  },
  {
    key: 'ees',
    icon: Fingerprint,
    label: 'EES',
    status: { pt: 'Em operação', en: 'Operational' },
    summary: {
      pt: 'Sistema europeu que registra digitalmente entradas e saídas de viajantes de fora da União Europeia em estadias curtas.',
      en: 'A European system that digitally records non-EU travellers entering and leaving for short stays.',
    },
    limit: {
      pt: 'Não é uma inscrição para viajar. É um controle de fronteira e pode envolver foto do rosto e impressões digitais.',
      en: 'It is not a travel application. It is a border-control system and may involve a facial image and fingerprints.',
    },
    source: 'https://travel-europe.europa.eu/ees/what-is-the-ees',
    sourceLabel: { pt: 'União Europeia — EES', en: 'European Union — EES' },
  },
  {
    key: 'visa',
    icon: IdCard,
    label: { pt: 'Visto', en: 'Visa' },
    status: { pt: 'Depende do país e do objetivo', en: 'Depends on country and purpose' },
    summary: {
      pt: 'Permissão ligada a um motivo específico, como visitar, estudar ou trabalhar, seguindo as regras do destino.',
      en: 'Permission linked to a specific purpose, such as visiting, studying, or working, under the destination’s rules.',
    },
    limit: {
      pt: 'Um visto de visita normalmente não dá os mesmos direitos de um visto de estudo ou trabalho. As condições variam.',
      en: 'A visitor visa does not normally grant the same rights as a study or work visa. Conditions vary.',
    },
    source: 'https://www.gov.uk/check-uk-visa',
    sourceLabel: { pt: 'GOV.UK — conferir visto', en: 'GOV.UK — check a visa' },
  },
  {
    key: 'residence',
    icon: Home,
    label: { pt: 'Residência', en: 'Residence' },
    status: { pt: 'Uma situação migratória, não uma viagem', en: 'An immigration status, not a trip' },
    summary: {
      pt: 'Autorização ou status para morar em um país por um período e sob condições definidas.',
      en: 'Permission or status to live in a country for a period and under defined conditions.',
    },
    limit: {
      pt: 'Não é sinônimo de cidadania e não libera automaticamente morar ou trabalhar em outros países.',
      en: 'It is not the same as citizenship and does not automatically allow you to live or work in other countries.',
    },
    source: 'https://immigration-portal.ec.europa.eu/index_en',
    sourceLabel: { pt: 'Portal de Imigração da UE', en: 'EU Immigration Portal' },
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
    title: isPt ? 'Glossário de viagem' : 'Travel glossary',
    description: isPt
      ? 'ETA, ETIAS, EES, visto e residência explicados sem complicação.'
      : 'ETA, ETIAS, EES, visas, and residence explained without the jargon.',
  };
}

export default async function GlossaryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isPt = locale === 'pt';
  const loc = isPt ? 'pt' : 'en';

  return (
    <div className="relative min-h-screen overflow-hidden pt-24">
      <div aria-hidden className="orb right-[-12%] top-[-8%] h-[430px] w-[430px] bg-accent/15 animate-float-slow" />

      <div className="relative mx-auto max-w-6xl px-4 pb-32 sm:px-6 lg:px-8">
        <header className="py-14 sm:py-20">
          <div className="max-w-4xl">
            <div className="mb-5 flex items-center gap-2.5 text-accent">
              <BookOpenCheck size={16} aria-hidden />
              <span className="font-mono text-xs uppercase tracking-[0.28em]">
                {isPt ? 'GLOSSÁRIO DE BOLSO' : 'POCKET GLOSSARY'}
              </span>
            </div>
            <h1 className="text-5xl font-bold tracking-[-0.055em] text-foreground sm:text-7xl">
              {isPt ? 'Antes da sigla, entenda o que ela faz.' : 'Before the acronym, understand what it does.'}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-foreground-muted">
              {isPt
                ? 'Uma leitura simples para não confundir autorização de viagem, controle de fronteira, visto e direito de morar.'
                : 'A simple guide to avoid confusing travel authorisation, border control, a visa, and the right to live somewhere.'}
            </p>
          </div>
        </header>

        <section
          aria-label={isPt ? 'Resumo das diferenças' : 'Summary of the differences'}
          className="mb-12 grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-3"
        >
          {[
            {
              title: 'ETA + ETIAS',
              text: isPt
                ? 'São autorizações anteriores à viagem; o ETIAS ainda não está operando.'
                : 'They are pre-travel authorisations; ETIAS is not operating yet.',
            },
            {
              title: 'EES',
              text: isPt ? 'Registra a passagem pela fronteira.' : 'Records a border crossing.',
            },
            {
              title: isPt ? 'Visto + residência' : 'Visa + residence',
              text: isPt ? 'Definem finalidade, condições e direitos.' : 'Define purpose, conditions, and rights.',
            },
          ].map((item) => (
            <div key={item.title} className="bg-surface p-6 sm:p-7">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{item.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-foreground-muted">{item.text}</p>
            </div>
          ))}
        </section>

        <section aria-labelledby="terms-title">
          <div className="mb-8 flex items-center gap-4">
            <h2 id="terms-title" className="whitespace-nowrap text-2xl font-bold text-foreground">
              {isPt ? 'As cinco palavras' : 'The five terms'}
            </h2>
            <span aria-hidden className="h-px flex-1 bg-border" />
            <span className="font-mono text-xs text-foreground-subtle">
              {isPt ? 'CHECADO 14 AGO 2026' : 'CHECKED 14 AUG 2026'}
            </span>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {TERMS.map((term, index) => {
              const Icon = term.icon;
              const label = typeof term.label === 'string' ? term.label : term.label[loc];

              return (
                <article
                  key={term.key}
                  className={`rounded-3xl border border-border bg-surface p-6 sm:p-8 ${
                    index === TERMS.length - 1 ? 'lg:col-span-2' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-5">
                    <div className="flex items-center gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border-strong bg-surface-elevated text-accent-bright">
                        <Icon size={21} aria-hidden />
                      </span>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground">{label}</h3>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                          {term.status[loc]}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="mt-6 text-base leading-relaxed text-foreground-muted">{term.summary[loc]}</p>
                  <div className="mt-5 rounded-2xl border border-border bg-background/35 px-4 py-4">
                    <p className="text-sm leading-relaxed text-foreground">
                      <strong>{isPt ? 'Limite importante:' : 'Important limit:'}</strong>{' '}
                      <span className="text-foreground-muted">{term.limit[loc]}</span>
                    </p>
                  </div>
                  <a
                    href={term.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent-bright"
                  >
                    {term.sourceLabel[loc]}
                    <ArrowUpRight size={14} aria-hidden />
                  </a>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="mt-12 rounded-3xl border border-[#F5C97B]/35 bg-[#F5C97B]/[0.06] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#F5C97B]">
            {isPt ? 'O que este glossário não faz' : 'What this glossary does not do'}
          </p>
          <p className="mt-3 max-w-3xl leading-relaxed text-foreground-muted">
            {isPt
              ? 'Isto não analisa o seu caso nem substitui orientação jurídica ou migratória. Passaporte, destino, duração, motivo da viagem e histórico pessoal podem mudar a resposta. Use os links oficiais antes de tomar uma decisão.'
              : 'This does not assess your case or replace legal or immigration advice. Passport, destination, duration, purpose, and personal history can change the answer. Use the official links before making a decision.'}
          </p>
        </aside>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/blog/uk-eta-para-brasileiros-o-que-mudou-em-2026" className="group btn-pill-primary text-sm">
            {isPt ? 'Ler o guia da ETA' : 'Read the ETA guide'}
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="/blog/ees-e-etias-o-que-muda-na-europa-em-2026" className="group btn-pill-secondary text-sm">
            {isPt ? 'Entender EES e ETIAS' : 'Understand EES and ETIAS'}
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
