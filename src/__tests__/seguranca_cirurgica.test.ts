import { describe, it, expect } from 'vitest';
import { isDisposableEmail } from '@/lib/auth/disposableEmails';
import { signUpSchema } from '@/lib/auth/schemas';
import { validateHoneypot } from '@/lib/security/honeypot';
import { scrubPersonalData, sanitizeErrorPayload } from '@/lib/errors/scrubbing';

describe('Fase 25 — Segurança Reforçada Cirúrgica', () => {
  describe('Bloqueio de E-mails Descartáveis', () => {
    it('deve identificar provedores conhecidos de e-mails descartáveis', () => {
      expect(isDisposableEmail('teste@mailinator.com')).toBe(true);
      expect(isDisposableEmail('usuario@tempmail.com')).toBe(true);
      expect(isDisposableEmail('bot@10minutemail.com')).toBe(true);
      expect(isDisposableEmail('alvo@yopmail.com')).toBe(true);
      expect(isDisposableEmail('alvo@guerrillamail.com')).toBe(true);
    });

    it('deve aceitar provedores permanentes e legítimos', () => {
      expect(isDisposableEmail('marceneiro@gmail.com')).toBe(false);
      expect(isDisposableEmail('contato@marcenariasaojose.com.br')).toBe(false);
      expect(isDisposableEmail('montador@outlook.com')).toBe(false);
      expect(isDisposableEmail('empresa@uol.com.br')).toBe(false);
    });

    it('signUpSchema deve rejeitar cadastro com e-mail descartável', () => {
      const result = signUpSchema.safeParse({
        fullName: 'Marceneiro Silva',
        email: 'fraude@tempmail.com',
        password: 'senhaSegura123!',
        acceptedTerms: true,
        ageDeclaration: true,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const emailError = result.error.errors.find((e) => e.path.includes('email'));
        expect(emailError?.message).toContain('e-mails temporários não são permitidos');
      }
    });

    it('signUpSchema deve aprovar cadastro com e-mail idôneo', () => {
      const result = signUpSchema.safeParse({
        fullName: 'Marceneiro Silva',
        email: 'marceneiro.silva@gmail.com',
        password: 'senhaSegura123!',
        acceptedTerms: true,
        ageDeclaration: true,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Proteção Anti-Bot via Honeypot', () => {
    it('deve rejeitar submissão quando o campo honeypot invisível foi preenchido por robô', () => {
      const isHuman = validateHoneypot({
        hp_field: 'http://spam-link.ru',
        hp_timestamp: Date.now() - 5000,
      });
      expect(isHuman).toBe(false);
    });

    it('deve rejeitar submissão com velocidade desumana (< 400ms)', () => {
      const isHuman = validateHoneypot({
        hp_field: '',
        hp_timestamp: Date.now() - 50, // submetido em 50ms
      });
      expect(isHuman).toBe(false);
    });

    it('deve aceitar submissão humana legítima', () => {
      const isHuman = validateHoneypot({
        hp_field: '',
        hp_timestamp: Date.now() - 3000, // 3 segundos para digitar
      });
      expect(isHuman).toBe(true);
    });
  });

  describe('Sanitização / Scrubbing de Dados Pessoais em Logs de Erro (LGPD)', () => {
    it('deve mascarar e-mails, telefones, CPFs e tokens em mensagens de erro', () => {
      const rawText =
        'Falha no usuário joao.silva@empresa.com.br, CPF 123.456.789-00, tel 11 98765-4321 com token Bearer eyJhbGciOiJIUzI1Ni';
      const scrubbed = scrubPersonalData(rawText);

      expect(scrubbed).not.toContain('joao.silva@empresa.com.br');
      expect(scrubbed).toContain('[EMAIL_MASCARADO]');

      expect(scrubbed).not.toContain('123.456.789-00');
      expect(scrubbed).toContain('[CPF_MASCARADO]');

      expect(scrubbed).not.toContain('98765-4321');
      expect(scrubbed).toContain('[TELEFONE_MASCARADO]');

      expect(scrubbed).toContain('Bearer [TOKEN_MASCARADO]');
    });

    it('sanitizeErrorPayload deve higienizar o stack trace e objeto Error', () => {
      const err = new Error('Falha ao processar cliente contato@fraude.com com tel 21999998888');
      const sanitized = sanitizeErrorPayload(err);

      expect(sanitized.message).toContain('[EMAIL_MASCARADO]');
      expect(sanitized.message).toContain('[TELEFONE_MASCARADO]');
      expect(sanitized.message).not.toContain('contato@fraude.com');
    });
  });
});

