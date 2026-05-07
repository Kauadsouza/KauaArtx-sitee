export interface Project {
  slug: string;
  name: string;
  tagline: string;
  status: 'production' | 'development' | 'building';
  externalUrl: string | null;
  githubUrl: string | null;
  year: string;
  overview: string;
  problem: string;
  solution: string;
  stack: { name: string; role: string }[];
  lessons: {
    worked: string[];
    failed: string[];
    different: string[];
  };
  nextSteps: string[];
}

export const PROJECTS: Record<string, Project> = {
  'the-kaden': {
    slug: 'the-kaden',
    name: 'The Kaden',
    tagline: 'SaaS de automação WhatsApp para clínicas estéticas e salões de beleza.',
    status: 'production',
    externalUrl: 'https://thekaden.com.br',
    githubUrl: null,
    year: '2025',
    overview:
      'The Kaden é uma plataforma SaaS que automatiza o atendimento via WhatsApp para clínicas estéticas e salões de beleza no interior do Brasil. Permite que estabelecimentos gerenciem agendamentos, confirmações, follow-ups e cobranças de forma automática, reduzindo no-shows e aumentando a retenção de clientes.',
    problem:
      'Donos de clínicas estéticas e salões de beleza no interior do Brasil perdem em média 30% dos seus agendamentos por falta de follow-up adequado. As soluções existentes no mercado são caras, complexas ou não integram com WhatsApp — o canal de comunicação dominante nesse nicho.',
    solution:
      'Construímos uma plataforma com onboarding chat-first — o próprio WhatsApp da empresa vira o canal de configuração e gestão. O cliente configura seu negócio respondendo mensagens, sem precisar aprender uma interface complicada. Automações inteligentes cuidam de lembretes, confirmações e cobranças automaticamente.',
    stack: [
      { name: 'Next.js', role: 'Frontend & API Routes' },
      { name: 'TypeScript', role: 'Linguagem principal' },
      { name: 'Supabase', role: 'Database, Auth & Storage' },
      { name: 'WhatsApp Business API', role: 'Canal de comunicação' },
      { name: 'Stripe', role: 'Pagamentos e assinaturas' },
      { name: 'Vercel', role: 'Deploy & Edge Functions' },
      { name: 'Tailwind CSS', role: 'Estilização' },
      { name: 'Resend', role: 'Email transacional' },
    ],
    lessons: {
      worked: [
        'Onboarding via WhatsApp reduziu drasticamente a curva de aprendizado',
        'Foco num nicho específico (interior do Brasil) permitiu pricing agressivo',
        'Supabase RLS eliminou uma camada inteira de lógica de autorização',
      ],
      failed: [
        'Subestimamos a complexidade das APIs de WhatsApp Business — validação levou meses',
        'Primeiro MVP tinha muitas features, o que atrasou o lançamento em 6 semanas',
        'Pricing inicial era muito baixo — não cobria CAC adequadamente',
      ],
      different: [
        'Teria feito o MVP mais focado: só agendamentos, sem cobranças no início',
        'Teria validado o mercado com formulário simples antes de codar',
        'Teria contratado alguém com experiência em vendas mais cedo',
      ],
    },
    nextSteps: [
      'Expansão para outros nichos (academia, pet shops, clínicas médicas)',
      'Integrações com sistemas de ponto de venda (PDV)',
      'Módulo de análises e relatórios avançados',
      'App mobile nativo para gestores',
    ],
  },
  condor: {
    slug: 'condor',
    name: 'CONDOR',
    tagline: 'Assistente IA local rodando 100% offline via Ollama. Privacidade first.',
    status: 'development',
    externalUrl: null,
    githubUrl: 'https://github.com/Kauadsouza',
    year: '2025',
    overview:
      'CONDOR é uma interface desktop para modelos de IA que rodam localmente via Ollama. O objetivo é oferecer uma experiência de assistente IA de alta qualidade sem enviar nenhum dado para servidores externos. Ideal para desenvolvedores, escritores e profissionais que trabalham com dados sensíveis.',
    problem:
      'Ferramentas de IA como ChatGPT e Claude enviam todas as suas conversas para servidores de terceiros. Para profissionais que lidam com código proprietário, dados de clientes ou informações sigilosas, isso é inaceitável. As alternativas existentes de UI local são feias, lentas ou difíceis de configurar.',
    solution:
      'Interface Electron limpa e rápida que conecta com qualquer modelo Ollama instalado localmente. Foco obsessivo em experiência do usuário — deve parecer tão polida quanto o ChatGPT, mas 100% offline. Suporte a múltiplos modelos, histórico de conversas, e um modo de "contexto de projeto" que permite carregar documentos para análise local.',
    stack: [
      { name: 'Electron', role: 'Shell desktop cross-platform' },
      { name: 'React + JSX', role: 'Interface do usuário' },
      { name: 'Ollama', role: 'Runtime de modelos locais' },
      { name: 'Node.js', role: 'Processo principal Electron' },
      { name: 'qwen2.5-coder', role: 'Modelo padrão para código' },
      { name: 'SQLite', role: 'Histórico de conversas local' },
    ],
    lessons: {
      worked: [
        'Ollama como backend simplificou absurdamente o gerenciamento de modelos',
        'Electron facilitou o empacotamento cross-platform sem muito esforço',
        'Foco em UX desde o início diferenciou o projeto das alternativas open-source',
      ],
      failed: [
        'Performance de streaming no Electron exigiu otimizações não triviais',
        'Gerenciamento de estado ficou complexo sem um padrão definido',
        'Suporte a Windows vs macOS teve diferenças de comportamento inesperadas',
      ],
      different: [
        'Definiria a arquitetura de estado (Zustand/Jotai) antes de começar',
        'Criaria testes de integração para o bridge Electron-Renderer mais cedo',
        'Focaria em um sistema operacional primeiro, depois expandiria',
      ],
    },
    nextSteps: [
      'Release público beta com instaladores para Windows e macOS',
      'Sistema de plugins para modelos customizados',
      'Integração com repositórios Git para contexto de código',
      'Modo "agente" com execução de tarefas autonomamente',
    ],
  },
  'null-forge': {
    slug: 'null-forge',
    name: 'Null Forge',
    tagline: 'Democratizando educação tech no Brasil. Começando pelas escolas.',
    status: 'building',
    externalUrl: null,
    githubUrl: null,
    year: '2025',
    overview:
      'Null Forge é uma iniciativa de impacto social com missão de democratizar o acesso à educação tecnológica de qualidade no Brasil. O projeto nasce da crença de que o próximo Linus Torvalds ou Grace Hopper pode estar numa escola pública do interior, esperando apenas uma oportunidade.',
    problem:
      'O Brasil tem um déficit enorme de profissionais de tecnologia — são necessários mais de 800 mil desenvolvedores nos próximos anos, segundo dados do setor. Ao mesmo tempo, o ensino de tecnologia nas escolas públicas é praticamente inexistente. Crianças e adolescentes de baixa renda ficam excluídos de uma das profissões mais acessíveis e bem remuneradas do mundo.',
    solution:
      'Programa estruturado de educação tech que vai às escolas, em vez de esperar os alunos chegarem até nós. Currículo prático focado em resultados tangíveis (cada aluno cria um projeto real), mentorias com profissionais da indústria, e conexão com o mercado de trabalho para os melhores alunos.',
    stack: [
      { name: 'Next.js', role: 'Plataforma de conteúdo e gestão' },
      { name: 'MDX', role: 'Conteúdo educacional interativo' },
      { name: 'Supabase', role: 'Gestão de alunos e progresso' },
      { name: 'TypeScript', role: 'Linguagem principal' },
    ],
    lessons: {
      worked: [
        'Parcerias diretas com diretores de escola aceleraram muito a entrada',
        'Formato presencial criou engajamento que cursos online nunca conseguem',
        'Focar no ensino de lógica antes de linguagens específicas foi decisão certa',
      ],
      failed: [
        'Burocracia escolar é incompatível com velocidade de startup — aprendemos na prática',
        'Subestimamos o custo logístico de ir às escolas pessoalmente',
        'Primeiros materiais eram muito técnicos para o público-alvo',
      ],
      different: [
        'Teria envolvido educadores de formação na criação do currículo desde o início',
        'Teria focado numa única escola-piloto antes de tentar escalar',
        'Teria documentado melhor o processo para criar um playbook replicável',
      ],
    },
    nextSteps: [
      'Formalizar parceria com primeiras 3 escolas piloto em Uberlândia',
      'Lançar plataforma de conteúdo online complementar',
      'Buscar financiamento: editais de impacto social e empresas parceiras',
      'Criar programa de certificação reconhecido pelo mercado',
    ],
  },
};

export function getProject(slug: string): Project | null {
  return PROJECTS[slug] ?? null;
}

export function getAllSlugs(): string[] {
  return Object.keys(PROJECTS);
}
