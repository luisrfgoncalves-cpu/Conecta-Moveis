/**
 * Módulo de segurança cirúrgica para proteção contra bots (Honeypot).
 * Um campo invisível para usuários humanos que, se preenchido por um bot/crawler,
 * indica automação e descarta o payload com segurança.
 */

export interface HoneypotPayload {
  _hp_field?: string;
  _hp_timestamp?: number;
}

/**
 * Valida o campo honeypot.
 * Retorna true se for legítimo (campo vazio e tempo mínimo razoável decorrido se informado).
 * Retorna false se o honeypot foi violado (indício de bot).
 */
export function validateHoneypot(data: {
  hp_field?: string | null;
  hp_timestamp?: number | string | null;
}): boolean {
  // 1. Se o campo honeypot invisível foi preenchido por script automatizado, é bot
  if (data.hp_field && data.hp_field.trim().length > 0) {
    return false;
  }

  // 2. Se o timestamp foi informado e a submissão foi sobre-humana (< 400ms), é bot
  if (data.hp_timestamp) {
    const start = Number(data.hp_timestamp);
    if (!isNaN(start) && start > 0) {
      const elapsed = Date.now() - start;
      if (elapsed < 400) {
        return false;
      }
    }
  }

  return true;
}

