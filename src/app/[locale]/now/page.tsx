'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Briefcase, BookOpen, Headphones, Heart } from 'lucide-react';

const NOW_DATA = {
  working: [
    { title: 'The Kaden — Escalar para 50 clientes', desc: 'Focando em aquisição e no sucesso dos clientes atuais para provar product-market fit antes de investir pesado em marketing.' },
    { title: 'CONDOR v2 — Novo modelo base', desc: 'Refinando a experiência com qwen2.5-coder como modelo padrão. Trabalhando em streaming mais rápido e modo de contexto de projeto.' },
    { title: 'Loog.ai — Features de rastreamento inteligente', desc: 'Desenvolvimento full-stack na plataforma logística. Stack: Next.js, APIs de transportadoras, dashboards em tempo real.' },
  ],
  learning: [
    { title: 'Segurança Ofensiva', desc: 'Estudando redes, protocolos e fundamentos de SIEM. Caminho longo, mas fascinante.' },
    { title: 'System Design', desc: 'Aprofundando em sistemas distribuídos, consistência eventual e padrões de alta disponibilidade.' },
    { title: 'Inglês — Fluência Conversacional', desc: 'Prática diária com podcasts, filmes sem legenda e conversas assíncronas com devs internacionais.' },
  ],
  reading: [
    { title: '"The Mom Test" — Rob Fitzpatrick', desc: 'Como validar ideias sem enganar a si mesmo. Deveria ser leitura obrigatória antes de qualquer startup.' },
    { title: 'Podcasts de VC', desc: 'Y Combinator, 20VC, Invest Like the Best. Absurdamente educativos sobre como o jogo funciona lá fora.' },
    { title: 'Documentação do Linux Kernel', desc: 'Sim, é masoquismo. Mas entender o SO em profundidade muda como você pensa em software.' },
  ],
  life: [
    { title: 'Voltando para a academia', desc: 'Depois de uma pausa de alguns meses, retomando a rotina de treinos. Mente sã, código são.' },
    { title: 'Planejando viagem internacional', desc: 'Estudando opções de universidades, intercâmbios e eventos tech fora do Brasil para 2026-2027.' },
  ],
};

const SECTION_ICONS = {
  working: Briefcase,
  learning: BookOpen,
  reading: Headphones,
  life: Heart,
};

export default function NowPage() {
  const t = useTranslations('now');

  const sections = [
    { key: 'working', label: t('working_title'), data: NOW_DATA.working, icon: SECTION_ICONS.working },
    { key: 'learning', label: t('learning_title'), data: NOW_DATA.learning, icon: SECTION_ICONS.learning },
    { key: 'reading', label: t('reading_title'), data: NOW_DATA.reading, icon: SECTION_ICONS.reading },
    { key: 'life', label: t('life_title'), data: NOW_DATA.life, icon: SECTION_ICONS.life },
  ] as const;

  return (
    <div className="min-h-screen pt-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-32">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="py-16 sm:py-24"
        >
          <p className="text-accent-bright font-mono text-sm mb-4">/ now</p>
          <h1 className="text-5xl sm:text-6xl font-bold text-foreground tracking-tight mb-6">
            {t('title')}
          </h1>
          <p className="text-foreground-muted leading-relaxed mb-4">{t('intro')}</p>
          <p className="text-xs text-foreground-subtle font-mono">
            {t('updated')}: maio de 2026
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-16">
          {sections.map(({ key, label, data, icon: Icon }, sectionIdx) => (
            <motion.section
              key={key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: sectionIdx * 0.05 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Icon size={16} className="text-accent-bright" />
                <h2 className="text-xl font-bold text-foreground">{label}</h2>
              </div>

              <div className="space-y-4">
                {data.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="flex gap-4 p-4 rounded-lg border border-border bg-surface hover:border-border-strong hover:bg-surface-elevated transition-all group"
                  >
                    <div className="w-1 rounded-full bg-border group-hover:bg-accent transition-colors shrink-0" />
                    <div>
                      <h3 className="font-medium text-foreground text-sm mb-1">{item.title}</h3>
                      <p className="text-sm text-foreground-subtle leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          ))}
        </div>
      </div>
    </div>
  );
}
