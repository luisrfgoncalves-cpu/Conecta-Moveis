export const RISK_TERMS: string[] = [
  'ladrão',
  'ladrao',
  'ladra',
  'ladrões',
  'ladroes',
  'golpista',
  'golpe',
  'estelionatário',
  'estelionatario',
  'caloteiro',
  'calote',
  'picareta',
  'vagabundo',
  'safado',
  'bandido',
  'criminoso',
  'polícia',
  'policia',
  'boletim de ocorrência',
  'processo criminal',
  'cadeia',
  'fraude',
  'estelionato',
  'roubo',
  'furto',
  'ameaça',
  'ameaca',
  'vou te matar',
  'desgraçado',
  'desgracado',
];

export interface RiskAnalysisResult {
  hasRiskTerms: boolean;
  detectedTerms: string[];
}

/**
 * Normaliza o texto removendo acentos para checagem robusta de termos de risco
 */
export function analyzeReviewRisk(text?: string | null): RiskAnalysisResult {
  if (!text || !text.trim()) {
    return { hasRiskTerms: false, detectedTerms: [] };
  }

  const cleanText = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const detectedTerms: string[] = [];

  for (const term of RISK_TERMS) {
    const cleanTerm = term
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    // Busca exata por limite de palavras ou regex de fronteira
    const regex = new RegExp(`\\b${cleanTerm}\\b`, 'i');
    if (regex.test(cleanText)) {
      detectedTerms.push(term);
    }
  }

  // Checagem também de padrões de dados pessoais explícitos (ex: CPF ou cartão)
  const cpfRegex = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/;
  if (cpfRegex.test(text)) {
    detectedTerms.push('cpf_exposto');
  }

  return {
    hasRiskTerms: detectedTerms.length > 0,
    detectedTerms,
  };
}

