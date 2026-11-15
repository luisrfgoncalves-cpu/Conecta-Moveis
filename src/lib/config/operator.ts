export interface OperatorSettings {
  razaoSocial: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  emailAtendimento: string;
  emailTitulares: string;
  emailAutoridades: string;
  emailNotificacoes: string;
  isPending: boolean;
  canEnableCommercialBilling: boolean;
}

export function getOperatorSettings(): OperatorSettings {
  const cnpj = (process.env.OPERATOR_CNPJ || process.env.NEXT_PUBLIC_OPERATOR_CNPJ || '').trim();
  const razaoSocial = (process.env.OPERATOR_RAZAO_SOCIAL || process.env.NEXT_PUBLIC_OPERATOR_RAZAO_SOCIAL || '').trim();

  // O operador é considerado em formalização se o CNPJ não tiver pelo menos 14 caracteres numéricos/formatados válidos
  const cleanCnpj = cnpj.replace(/\D/g, '');
  const isPending = cleanCnpj.length !== 14 || cnpj.toLowerCase() === 'pendente' || razaoSocial.length === 0;

  return {
    razaoSocial: isPending ? 'Operador: em processo de formalização' : (razaoSocial || 'Operador: em processo de formalização'),
    cnpj: isPending ? 'Em processo de formalização' : cnpj,
    endereco: process.env.OPERATOR_ENDERECO || 'Jundiaí - SP',
    cidade: 'Jundiaí',
    estado: 'SP',
    emailAtendimento: process.env.OPERATOR_EMAIL_ATENDIMENTO || process.env.SUPPORT_EMAIL || 'em implantação',
    emailTitulares: process.env.OPERATOR_EMAIL_TITULARES || 'em implantação',
    emailAutoridades: process.env.OPERATOR_EMAIL_AUTORIDADES || 'em implantação',
    emailNotificacoes: process.env.OPERATOR_EMAIL_NOTIFICACOES || 'em implantação',
    isPending,
    canEnableCommercialBilling: !isPending,
  };
}

