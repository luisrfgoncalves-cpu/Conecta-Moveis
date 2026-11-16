export interface OnboardingStep {
  stepNumber: number;
  totalSteps: number;
  title: string;
  leadText: string;
  description: string;
  iconName: 'search' | 'message' | 'shield' | 'users' | 'clock' | 'sparkles';
  tag: string;
}

export interface OnboardingTrack {
  id: 'procurar' | 'divulgar';
  label: string;
  shortLabel: string;
  badge: string;
  steps: OnboardingStep[];
}

export const ONBOARDING_TRACKS: Record<'procurar' | 'divulgar', OnboardingTrack> = {
  procurar: {
    id: 'procurar',
    label: 'Para quem procura profissionais',
    shortLabel: 'Quem procura',
    badge: 'Buscar profissional',
    steps: [
      {
        stepNumber: 1,
        totalSteps: 3,
        tag: 'Passo 1 de 3 • Busca regional',
        title: 'Encontre quem monta e fabrica móveis na sua região.',
        leadText: 'Catálogo aberto para você encontrar montadores, marceneiros e projetistas atuando em Jundiaí e região.',
        description: 'Filtre por especialidade e município para encontrar profissionais disponíveis para o seu projeto moveleiro.',
        iconName: 'search',
      },
      {
        stepNumber: 2,
        totalSteps: 3,
        tag: 'Passo 2 de 3 • Contato direto',
        title: 'Veja os perfis e fale direto',
        leadText: 'Veja os perfis e fale direto: preço, prazo e pagamento são combinados só entre vocês.',
        description: 'Entre na sua conta gratuita para visualizar o contato de WhatsApp do profissional e tirar dúvidas sem intermediários.',
        iconName: 'message',
      },
      {
        stepNumber: 3,
        totalSteps: 3,
        tag: 'Passo 3 de 3 • Segurança e transparência',
        title: 'O que a plataforma faz e não faz',
        leadText: 'A plataforma divulga os profissionais. Não contrata, não cobra comissão e não garante o serviço. Antes de fechar, peça contrato por escrito.',
        description: 'Somos um diretório de divulgação neutro. Verifique referências, peça contrato formal e alinhe todos os detalhes diretamente com o profissional.',
        iconName: 'shield',
      },
    ],
  },
  divulgar: {
    id: 'divulgar',
    label: 'Para quem anuncia serviços',
    shortLabel: 'Quem anuncia',
    badge: 'Anunciar trabalho',
    steps: [
      {
        stepNumber: 1,
        totalSteps: 3,
        tag: 'Passo 1 de 3 • Divulgação local',
        title: 'Seja encontrado por quem procura montagem e marcenaria na sua cidade.',
        leadText: 'Apresente seu trabalho para pessoas que precisam de montagem, marcenaria ou projetos moveleiros na sua região.',
        description: 'Apareça nos resultados de busca por município e receba contatos diretos de clientes interessados.',
        iconName: 'users',
      },
      {
        stepNumber: 2,
        totalSteps: 3,
        tag: 'Passo 2 de 3 • Criação rápida de anúncio',
        title: 'Perfil pronto em cerca de 10 minutos',
        leadText: 'Perfil pronto em cerca de 10 minutos: especialidades, região, fotos e WhatsApp.',
        description: 'Cadastre suas especialidades, informe as cidades atendidas e adicione fotos de apresentação dos seus trabalhos.',
        iconName: 'clock',
      },
      {
        stepNumber: 3,
        totalSteps: 3,
        tag: 'Passo 3 de 3 • Sem comissões',
        title: 'Sem comissão sobre seus serviços',
        leadText: 'Cadastro gratuito no lançamento. Mudanças serão avisadas antes. Sem comissão sobre seus serviços.',
        description: 'O pagamento combinado com o cliente é integralmente seu. Não retemos valores e não cobramos taxa sobre seus serviços.',
        iconName: 'sparkles',
      },
    ],
  },
};
