import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateProfileSlug } from '../lib/invites/slug';
import {
  createInviteLink,
  validateInviteToken,
  redeemInviteLink,
  getSignupMode,
} from '../lib/invites/actions';
import { signUp } from '../lib/auth/actions';

// Mock de autenticação e banco de dados
let mockUser: { id: string; email: string } | null = {
  id: 'user-admin',
  email: 'admin@conectamoveis.com.br',
};
let mockRole: string | null = 'admin';

interface MockInvite {
  id: string;
  token_hash: string;
  type: string;
  plan_code: string;
  trial_days: number;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  is_active: boolean;
  campaign_label: string | null;
}

interface MockRedemption {
  user_id: string;
  invite_id: string;
}

let mockInviteData: MockInvite = {
  id: 'invite-123',
  token_hash: 'mocked_hash',
  type: 'teste',
  plan_code: 'pro',
  trial_days: 30,
  max_uses: 10,
  uses_count: 0,
  expires_at: null,
  is_active: true,
  campaign_label: 'TesteCampanha',
};

let mockRedemptions: MockRedemption[] = [];
let mockSignupMode = 'somente_convite';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: mockUser },
      })),
      signUp: vi.fn(async ({ email }) => ({
        data: { user: { id: 'new-user-id', email } },
        error: null,
      })),
    },
  })),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      admin: {
        signOut: vi.fn(async () => ({ error: null })),
      },
    },
    from: vi.fn((table: string) => {
      if (table === 'user_roles') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              in: vi.fn(() => ({
                maybeSingle: vi.fn(async () => ({
                  data: mockRole ? { role: mockRole } : null,
                })),
              })),
            })),
          })),
        };
      }

      if (table === 'system_settings') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(async () => ({
                data: { value: JSON.stringify(mockSignupMode) },
              })),
            })),
          })),
        };
      }

      if (table === 'invite_links') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn(async () => ({
                data: mockInviteData,
                error: null,
              })),
              single: vi.fn(async () => ({
                data: mockInviteData,
                error: null,
              })),
            })),
            order: vi.fn(async () => ({
              data: [mockInviteData],
              error: null,
            })),
          })),
          insert: vi.fn((payload) => ({
            select: vi.fn(() => ({
              single: vi.fn(async () => ({
                data: { id: 'new-inv-id', ...payload },
                error: null,
              })),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn(async () => ({ error: null })),
          })),
        };
      }

      if (table === 'invite_redemptions') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(async () => {
                  const found = mockRedemptions.find((r) => r.user_id === mockUser?.id);
                  return { data: found || null, error: null };
                }),
              })),
            })),
          })),
          insert: vi.fn(async (payload) => {
            mockRedemptions.push(payload);
            return { error: null };
          }),
        };
      }

      if (table === 'user_consents' || table === 'admin_logs' || table === 'user_plan_history') {
        return {
          insert: vi.fn(async () => ({ error: null })),
        };
      }

      const chainable: Record<string, unknown> = {
        error: null,
        data: { id: 'mock-id' },
        eq: vi.fn(() => chainable),
        select: vi.fn(() => chainable),
        single: vi.fn(async () => ({ data: { id: 'mock-id' }, error: null })),
        maybeSingle: vi.fn(async () => ({ data: null, error: null })),
        then: (resolve: (val: unknown) => void) =>
          Promise.resolve({ error: null, data: { id: 'mock-id' } }).then(resolve),
      };

      return {
        select: vi.fn(() => chainable),
        insert: vi.fn(() => chainable),
        update: vi.fn(() => chainable),
      };
    }),
    rpc: vi.fn(async () => ({ error: null })),
  })),
}));

vi.mock('@/lib/auth/rate-limit', () => ({
  checkRateLimit: vi.fn(async () => ({ allowed: true })),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Fase 20 — Convites, Degustações, Campanhas e Slugs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = { id: 'admin-user', email: 'admin@conectamoveis.com.br' };
    mockRole = 'admin';
    mockSignupMode = 'somente_convite';
    mockRedemptions = [];
    mockInviteData = {
      id: 'invite-123',
      token_hash: 'mocked_hash',
      type: 'teste',
      plan_code: 'pro',
      trial_days: 45, // Decidido pelo dono
      max_uses: 10,
      uses_count: 2,
      expires_at: null,
      is_active: true,
      campaign_label: 'FeiraMoveis',
    };
  });

  describe('1. Validador de Slug Personalizado (Regra R4 e Proteção Marcária)', () => {
    it('deve aceitar slug válido de profissional', () => {
      const res = validateProfileSlug('marcenaria-souza-jundiai');
      expect(res.valid).toBe(true);
      expect(res.cleanSlug).toBe('marcenaria-souza-jundiai');
    });

    it('deve recusar slug menor que 3 ou maior que 40 caracteres', () => {
      expect(validateProfileSlug('ab').valid).toBe(false);
      expect(validateProfileSlug('a'.repeat(45)).valid).toBe(false);
    });

    it('deve recusar caracteres inválidos (espaços, maiúsculas acentuadas, símbolos)', () => {
      expect(validateProfileSlug('Marcenaria Top!').valid).toBe(false);
      expect(validateProfileSlug('marcenaria_silva').valid).toBe(false);
    });

    it('deve recusar termos de endosso ou superioridade (Regra R4)', () => {
      expect(validateProfileSlug('marcenaria-oficial').valid).toBe(false);
      expect(validateProfileSlug('o-melhor-marceneiro').valid).toBe(false);
      expect(validateProfileSlug('marceneiro-certificado').valid).toBe(false);
      expect(validateProfileSlug('servico-garantido').valid).toBe(false);
    });

    it('deve recusar termos institucionais e governamentais', () => {
      expect(validateProfileSlug('prefeitura-jundiai').valid).toBe(false);
      expect(validateProfileSlug('procon-atendimento').valid).toBe(false);
    });

    it('deve recusar rotas reservadas do sistema', () => {
      expect(validateProfileSlug('admin').valid).toBe(false);
      expect(validateProfileSlug('painel').valid).toBe(false);
      expect(validateProfileSlug('convite').valid).toBe(false);
    });
  });

  describe('2. Gestão de Convites e Permissões Administrativas', () => {
    it('deve permitir que admin/owner crie link com dias de teste personalizados', async () => {
      const res = await createInviteLink({
        type: 'teste',
        plan_code: 'pro',
        trial_days: 60, // Dono decidiu 60 dias
        campaign_label: 'BlackFriday2026',
      });

      expect(res.success).toBe(true);
      expect(res.fullToken).toBeDefined();
      expect(res.fullToken?.length).toBeGreaterThan(10);
      expect(res.invite?.trial_days).toBe(60);
    });

    it('deve barrar criação de convite por usuário comum sem papel administrativo', async () => {
      mockRole = null; // Sem role admin
      const res = await createInviteLink({
        type: 'convite',
        plan_code: 'pro',
        trial_days: 30,
      });

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/administradores/i);
    });
  });

  describe('3. Validação e Resgate de Token de Convite', () => {
    it('deve validar com sucesso um token ativo e dentro das regras', async () => {
      const res = await validateInviteToken('0123456789abcdef0123456789abcdef');
      expect(res.valid).toBe(true);
      expect(res.invite?.trial_days).toBe(45);
      expect(res.invite?.plan_code).toBe('pro');
    });

    it('deve recusar token revogado/desativado', async () => {
      mockInviteData.is_active = false;
      const res = await validateInviteToken('0123456789abcdef0123456789abcdef');
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/desativado/i);
    });

    it('deve recusar token expirado', async () => {
      mockInviteData.expires_at = new Date(Date.now() - 100000).toISOString();
      const res = await validateInviteToken('0123456789abcdef0123456789abcdef');
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/expirou/i);
    });

    it('deve recusar token com limite de utilizações esgotado', async () => {
      mockInviteData.max_uses = 5;
      mockInviteData.uses_count = 5;
      const res = await validateInviteToken('0123456789abcdef0123456789abcdef');
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/esgotado/i);
    });

    it('deve barrar segundo resgate pelo mesmo usuário', async () => {
      mockUser = { id: 'marceneiro-ja-resgatou', email: 'ja@marceneiro.com' };
      mockRedemptions = [{ user_id: 'marceneiro-ja-resgatou', invite_id: 'invite-123' }];

      const res = await redeemInviteLink('0123456789abcdef0123456789abcdef');
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/já resgatou/i);
    });
  });

  describe('4. Modo de Cadastro Global (signup_mode)', () => {
    it('deve bloquear novo cadastro sem token quando signup_mode for somente_convite', async () => {
      mockSignupMode = 'somente_convite';

      const res = await signUp({
        fullName: 'Novo Marceneiro',
        email: 'marceneiro@email.com',
        password: 'SenhaSegura123!',
        acceptedTerms: true,
        ageDeclaration: true,
      });

      expect('error' in res).toBe(true);
      if ('error' in res) {
        expect(res.error).toMatch(/exclusivo para convidados/i);
      }
    });

    it('deve permitir cadastro quando fornecido token de convite válido', async () => {
      mockSignupMode = 'somente_convite';

      const res = await signUp({
        fullName: 'Marceneiro Convidado',
        email: 'convidado@email.com',
        password: 'SenhaSegura123!',
        acceptedTerms: true,
        ageDeclaration: true,
        inviteToken: '0123456789abcdef0123456789abcdef',
      });

      expect('success' in res).toBe(true);
      if ('success' in res) {
        expect(res.success).toBe(true);
      }
    });

    it('deve bloquear cadastro quando signup_mode for fechado', async () => {
      mockSignupMode = 'fechado';

      const res = await signUp({
        fullName: 'Marceneiro Bloqueado',
        email: 'bloqueado@email.com',
        password: 'SenhaSegura123!',
        acceptedTerms: true,
        ageDeclaration: true,
      });

      expect('error' in res).toBe(true);
      if ('error' in res) {
        expect(res.error).toMatch(/suspensos/i);
      }
    });

    it('deve retornar o modo de cadastro configurado', async () => {
      mockSignupMode = 'somente_convite';
      const mode = await getSignupMode();
      expect(mode).toBe('somente_convite');
    });
  });
});
