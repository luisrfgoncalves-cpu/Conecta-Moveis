/**
 * Validação e Sanitização de Links Externos de Anunciantes (Fase 24, Item 10)
 *
 * Regras:
 * 1. Protocolo obrigatório: exclusivamente https://
 * 2. Bloqueio estrito de javascript:, data:, vbscript:, file: e IPs locais.
 * 3. Atributos rel mandatórios: rel="noopener nofollow ugc"
 * 4. Passa pela rota/aviso de saída antes de redirecionar para fora da plataforma.
 */

export interface ExternalLinkValidation {
  valid: boolean;
  sanitizedUrl?: string;
  error?: string;
}

export const EXTERNAL_LINK_REL = 'noopener nofollow ugc' as const;

const FORBIDDEN_SCHEMES = [
  'javascript:',
  'data:',
  'vbscript:',
  'file:',
  'about:',
  'chrome:',
];

export function validateExternalLink(url: string | null | undefined): ExternalLinkValidation {
  if (!url || url.trim() === '') {
    return { valid: true }; // Link é opcional
  }

  const trimmed = url.trim();

  // 1. Deve iniciar expressamente com https://
  if (!trimmed.toLowerCase().startsWith('https://')) {
    return {
      valid: false,
      error: 'O endereço deve iniciar obrigatoriamente com https:// para garantir a segurança.',
    };
  }

  // 2. Bloquear esquemas perigosos
  for (const scheme of FORBIDDEN_SCHEMES) {
    if (trimmed.toLowerCase().includes(scheme)) {
      return {
        valid: false,
        error: 'Endereço inválido ou contém caracteres não permitidos.',
      };
    }
  }

  // 3. Validação de parsing via URL nativo
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') {
      return {
        valid: false,
        error: 'Apenas endereços com protocolo seguro HTTPS são permitidos.',
      };
    }

    // Hostname deve ter pelo menos um ponto ou ser domínio válido
    if (!parsed.hostname || !parsed.hostname.includes('.') || parsed.hostname.length < 4) {
      return {
        valid: false,
        error: 'Informe um endereço de site ou rede social válido (ex.: https://instagram.com/seuperfil).',
      };
    }

    // Bloquear localhost e IPs privados
    if (
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1' ||
      parsed.hostname.startsWith('192.168.') ||
      parsed.hostname.startsWith('10.')
    ) {
      return {
        valid: false,
        error: 'Endereços locais ou de rede privada não são permitidos.',
      };
    }

    return {
      valid: true,
      sanitizedUrl: parsed.href,
    };
  } catch {
    return {
      valid: false,
      error: 'Formato de link inválido. Verifique a digitação.',
    };
  }
}
