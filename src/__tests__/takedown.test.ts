import { describe, it, expect, vi } from 'vitest';
import { submitTakedownNotice, exportEvidencePackage } from '../lib/takedown/actions';
import { signUpSchema } from '../lib/auth/schemas';

// Mock do supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: { id: 'admin-123', email: 'admin@conectamoveis.com.br' } },
      })),
    },
  })),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'takedown_notices') {
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(async () => ({
                data: { protocol: 'NOT-2026-000042' },
                error: null,
              })),
            })),
          })),
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(async () => ({
                data: {
                  id: 'notice-abc',
                  protocol: 'NOT-2026-000042',
                  category: 'copyright_image',
                  description: 'Uso indevido de fotografia autoral sem autorização prévia.',
                  notifier_name: 'Fotógrafo da Silva',
                  notifier_email: 'fotografo@exemplo.com',
                  target_type: 'portfolio_image',
                  target_id: 'img-999',
                  evidence_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
                  evidence_snapshot: { title: 'Armário planejado', url: 'https://exemplo.com/foto.jpg' },
                  created_at: '2026-11-13T12:00:00Z',
                  status: 'recebida',
                },
                error: null,
              })),
            })),
          })),
        };
      }
      if (table === 'user_roles') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              in: vi.fn(() => ({
                single: vi.fn(async () => ({
                  data: { role: 'admin' },
                  error: null,
                })),
              })),
            })),
          })),
        };
      }
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(async () => ({ data: null, error: null })),
          })),
        })),
      };
    }),
  })),
}));

describe('Fase 16 — Trava de Idade no Cadastro', () => {
  it('deve rejeitar cadastro sem a declaração de maioridade (18+ anos)', () => {
    const invalidData = {
      fullName: 'Carlos Marceneiro',
      email: 'carlos@exemplo.com',
      password: 'password123',
      acceptedTerms: true,
      ageDeclaration: false,
    };
    const res = signUpSchema.safeParse(invalidData);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.errors[0].message).toContain('18 anos ou mais');
    }
  });

  it('deve aprovar cadastro quando 18+ anos e termos forem aceitos', () => {
    const validData = {
      fullName: 'Carlos Marceneiro',
      email: 'carlos@exemplo.com',
      password: 'password123',
      acceptedTerms: true,
      ageDeclaration: true,
    };
    const res = signUpSchema.safeParse(validData);
    expect(res.success).toBe(true);
  });
});

describe('Fase 16 — Canal de Notificação e Retirada (Takedown)', () => {
  it('deve exigir declaração de boa-fé e identificação ao enviar notificação', async () => {
    const res = await submitTakedownNotice({
      category: 'copyright_image',
      targetType: 'portfolio_image',
      description: 'Imagem copiada do meu portfólio sem licença expressa.',
      notifierName: 'João da Silva',
      notifierEmail: 'joao@exemplo.com',
      goodFaithDeclaration: false, // Sem boa-fé
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain('boa-fé');
  });

  it('deve registrar notificação válida e retornar protocolo oficial NOT-YYYY-XXXXXX', async () => {
    const res = await submitTakedownNotice({
      category: 'copyright_image',
      targetType: 'portfolio_image',
      targetId: 'img-999',
      description: 'Uso indevido de fotografia autoral sem autorização prévia.',
      notifierName: 'Fotógrafo da Silva',
      notifierEmail: 'fotografo@exemplo.com',
      goodFaithDeclaration: true,
    });
    expect(res.success).toBe(true);
    expect(res.protocol).toBe('NOT-2026-000042');
  });

  it('deve exportar dossiê policial com hash SHA-256 e cadeia de custódia', async () => {
    const res = await exportEvidencePackage('notice-abc');
    expect(res.success).toBe(true);
    expect(res.packageData).toBeDefined();
    expect(res.packageData?.protocol).toBe('NOT-2026-000042');
    expect(res.packageData?.hashSha256).toBeDefined();
    expect(res.packageData?.chainOfCustody.platform).toBe('Conecta Móveis Jundiaí');
    expect(res.packageData?.chainOfCustody.jurisdiction).toContain('Jundiaí/SP');
  });
});

