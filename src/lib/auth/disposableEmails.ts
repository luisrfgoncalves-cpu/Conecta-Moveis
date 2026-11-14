/**
 * Lista estática de domínios conhecidos de e-mails descartáveis / temporários.
 * Mantida localmente sem consultas externas a APIs (para velocidade, privacidade e resguardo LGPD).
 */
export const DISPOSABLE_EMAIL_DOMAINS = new Set([
  '10minutemail.com',
  '10minutemail.net',
  '10minmail.com',
  'tempmail.com',
  'temp-mail.org',
  'tempmail.net',
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamailblock.com',
  'sharklasers.com',
  'grr.la',
  'guerrillamail.biz',
  'guerrillamail.de',
  'guerrillamail.net',
  'guerrillamail.org',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'trashmail.com',
  'trashmail.net',
  'trashmail.me',
  'dispostable.com',
  'maildrop.cc',
  'getairmail.com',
  'throwawaymail.com',
  'fakemailgenerator.com',
  'generator.email',
  'crazymailing.com',
  'nada.ltd',
  'getnada.com',
  'inboxkitten.com',
  'burnermail.io',
  'dropmail.me',
  'mohmal.com',
  'mytemp.email',
  'emailfake.com',
]);

/**
 * Verifica se um endereço de e-mail pertence a um provedor temporário / descartável.
 */
export function isDisposableEmail(email: string): boolean {
  if (!email || !email.includes('@')) return false;
  const parts = email.toLowerCase().trim().split('@');
  if (parts.length !== 2) return false;
  const domain = parts[1];
  return DISPOSABLE_EMAIL_DOMAINS.has(domain);
}

