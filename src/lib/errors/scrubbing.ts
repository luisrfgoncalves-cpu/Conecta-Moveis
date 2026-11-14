/**
 * Utilitário de sanitização (Scrubbing) de dados pessoais para logs e relatórios de erro.
 * Assegura que e-mails, CPFs, telefones e tokens de autenticação NUNCA sejam persistidos
 * em pilhas de erro ou logs técnicos (em conformidade com o art. 6º, III e VII da LGPD).
 */

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const CPF_FORMATTED_REGEX = /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g;
const PHONE_REGEX = /(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?(?:9\d{4}|\d{4})[-.\s]?\d{4}\b/g;
const CPF_RAW_REGEX = /\b\d{11}\b/g;
const BEARER_TOKEN_REGEX = /bearer\s+[a-zA-Z0-9._-]+/gi;
const SUPABASE_KEY_REGEX = /sb[p_]?[a-zA-Z0-9_-]{20,}/gi;

export function scrubPersonalData(input: string | null | undefined): string {
  if (!input) return '';
  return input
    .replace(EMAIL_REGEX, '[EMAIL_MASCARADO]')
    .replace(CPF_FORMATTED_REGEX, '[CPF_MASCARADO]')
    .replace(PHONE_REGEX, '[TELEFONE_MASCARADO]')
    .replace(CPF_RAW_REGEX, '[DOCUMENTO_MASCARADO]')
    .replace(BEARER_TOKEN_REGEX, 'Bearer [TOKEN_MASCARADO]')
    .replace(SUPABASE_KEY_REGEX, '[CHAVE_MASCARADA]');
}

export function sanitizeErrorPayload(error: unknown): {
  message: string;
  stack?: string;
} {
  if (error instanceof Error) {
    return {
      message: scrubPersonalData(error.message),
      stack: scrubPersonalData(error.stack),
    };
  }
  if (typeof error === 'string') {
    return {
      message: scrubPersonalData(error),
    };
  }
  return {
    message: scrubPersonalData(JSON.stringify(error)),
  };
}
