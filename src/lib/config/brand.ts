import { getOperatorSettings } from './operator';

export interface BrandConfig {
  name: string;
  shortName: string;
  slogan: string;
  focusRegion: string;
  focusCity: string;
  focusState: string;
  gender: 'a' | 'o';
  baseUrl: string;
  brandProvisional: boolean;
  emails: {
    atendimento: string;
    titulares: string;
    notificacoes: string;
    autoridades: string;
  };
  operator: ReturnType<typeof getOperatorSettings>;
}

export function getBrandConfig(): BrandConfig {
  const brandProvisional = process.env.NEXT_PUBLIC_BRAND_PROVISIONAL !== 'false';
  const name = (process.env.NEXT_PUBLIC_BRAND_NAME || 'Conecta Móveis').trim();
  const shortName = (process.env.NEXT_PUBLIC_BRAND_SHORT_NAME || name).trim();
  const slogan = (
    process.env.NEXT_PUBLIC_BRAND_SLOGAN ||
    'Encontre montadores e marceneiros em Jundiaí e região'
  ).trim();
  const focusRegion = (process.env.NEXT_PUBLIC_BRAND_FOCUS_REGION || 'Jundiaí e região').trim();
  const focusCity = (process.env.NEXT_PUBLIC_BRAND_FOCUS_CITY || 'Jundiaí').trim();
  const focusState = (process.env.NEXT_PUBLIC_BRAND_FOCUS_STATE || 'SP').trim();
  const gender: 'a' | 'o' = (process.env.NEXT_PUBLIC_BRAND_GENDER as 'a' | 'o') || 'a';

  // Base URL: VERCEL_URL / NEXT_PUBLIC_APP_URL / fallback seguro
  let baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://conecta-moveis.vercel.app')
  ).trim();
  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }

  const operator = getOperatorSettings();

  const sanitizeEmail = (val?: string) => {
    if (!val || val.includes('@conectamoveis.com.br') || val.toLowerCase().includes('pendente')) {
      return 'em implantação';
    }
    return val.trim();
  };

  return {
    name,
    shortName,
    slogan,
    focusRegion,
    focusCity,
    focusState,
    gender,
    baseUrl,
    brandProvisional,
    emails: {
      atendimento: sanitizeEmail(process.env.SUPPORT_EMAIL || process.env.OPERATOR_EMAIL_ATENDIMENTO || operator.emailAtendimento),
      titulares: sanitizeEmail(process.env.OPERATOR_EMAIL_TITULARES || operator.emailTitulares),
      notificacoes: sanitizeEmail(process.env.OPERATOR_EMAIL_NOTIFICACOES || operator.emailNotificacoes),
      autoridades: sanitizeEmail(process.env.OPERATOR_EMAIL_AUTORIDADES || operator.emailAutoridades),
    },
    operator,
  };
}
