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
}

export function getOperatorSettings(): OperatorSettings {
  const cnpj = (process.env.OPERATOR_CNPJ || process.env.NEXT_PUBLIC_OPERATOR_CNPJ || '').trim();
  const razaoSocial = (process.env.OPERATOR_RAZAO_SOCIAL || process.env.NEXT_PUBLIC_OPERATOR_RAZAO_SOCIAL || '').trim();
  
  const isPending = !cnpj || cnpj.toLowerCase() === 'pendente';

  return {
    razaoSocial: razaoSocial || (isPending ? 'Conecta Móveis — Identificação do Operador Pendente' : 'Conecta Móveis'),
    cnpj: cnpj || (isPending ? 'CNPJ Pendente' : ''),
    endereco: process.env.OPERATOR_ENDERECO || 'Jundiaí - SP',
    cidade: 'Jundiaí',
    estado: 'SP',
    emailAtendimento: process.env.OPERATOR_EMAIL_ATENDIMENTO || 'atendimento@conectamoveis.com.br',
    emailTitulares: process.env.OPERATOR_EMAIL_TITULARES || 'titulares@conectamoveis.com.br',
    emailAutoridades: process.env.OPERATOR_EMAIL_AUTORIDADES || 'autoridades@conectamoveis.com.br',
    emailNotificacoes: process.env.OPERATOR_EMAIL_NOTIFICACOES || 'notificacoes@conectamoveis.com.br',
    isPending,
  };
}

