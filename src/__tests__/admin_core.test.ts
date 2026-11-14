import { describe, it, expect, vi } from 'vitest';
import {
  suspendUserAccount,
  reactivateUserAccount,
  forceUserLogout,
  deleteUserAccountTwoStep,
  grantManualPlan,
  revokeManualPlan,
  exportAdminLogsToCsv,
} from '../lib/admin/actions';

// Mock do supabase
let mockRole: string | null = 'owner';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: { id: 'admin-123', email: 'owner@conectamoveis.com.br' } },
      })),
      mfa: {
        getAuthenticatorAssuranceLevel: vi.fn(async () => ({
          data: { currentLevel: 'aal2', nextLevel: 'aal2' },
        })),
      },
    },
  })),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      admin: {
        signOut: vi.fn(async () => ({ error: null })),
        deleteUser: vi.fn(async () => ({ error: null })),
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

      if (table === 'profiles') {
        return {
          update: vi.fn(() => ({
            eq: vi.fn(async () => ({ error: null })),
          })),
        };
      }

      if (table === 'app_access_logs') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                limit: vi.fn(async () => ({ data: [] })), // Nenhum legal_hold por padrão
              })),
            })),
          })),
        };
      }

      if (table === 'manual_plan_grants') {
        return {
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(async () => ({ error: null })),
            })),
          })),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(async () => ({
                data: { id: 'grant-new-123' },
                error: null,
              })),
            })),
          })),
        };
      }

      if (table === 'admin_logs') {
        return {
          insert: vi.fn(async () => ({ error: null })),
          select: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(async () => ({
                data: [
                  {
                    id: 1,
                    admin_id: 'admin-123',
                    action: 'suspend_user_account',
                    target_table: 'profiles',
                    target_id: 'user-456',
                    reason: 'Violação de regras',
                    created_at: '2026-11-13T12:00:00Z',
                  },
                ],
                error: null,
              })),
            })),
          })),
        };
      }

      return {
        select: vi.fn(() => ({
          single: vi.fn(async () => ({ data: null })),
        })),
      };
    }),
  })),
}));

describe('FASE 19 — Administração Completa: Núcleo e Governança de Papéis', () => {
  describe('1. Hierarquia de Papéis e Restrição de Ações de Owner', () => {
    it('moderador ou suporte NÃO conseguem executar exclusão definitiva de conta', async () => {
      mockRole = 'moderator';
      const res = await deleteUserAccountTwoStep(
        'target-user',
        'Tentativa sem permissão',
        'CONFIRMAR_EXCLUSAO'
      );
      expect(res.success).toBe(false);
      expect(res.error).toContain('Apenas o proprietário (owner)');
    });

    it('suporte NÃO consegue suspender contas de usuários', async () => {
      mockRole = 'support';
      const res = await suspendUserAccount('target-user', 'Motivo formal com mais de 10 caracteres');
      expect(res.success).toBe(false);
      expect(res.error).toContain('permissão insuficiente');
    });

    it('owner consegue suspender e reativar contas com justificativa gravada', async () => {
      mockRole = 'owner';
      const resSuspend = await suspendUserAccount('target-user', 'Suspensão preventiva por denúncia');
      expect(resSuspend.success).toBe(true);

      const resReactivate = await reactivateUserAccount('target-user', 'Regularização dos dados cadastrais');
      expect(resReactivate.success).toBe(true);
    });
  });

  describe('2. Exclusão em Duas Etapas e Trava de Legal Hold', () => {
    it('rejeita exclusão se a palavra de confirmação for diferente de CONFIRMAR_EXCLUSAO', async () => {
      mockRole = 'owner';
      const res = await deleteUserAccountTwoStep('target-user', 'Motivo formal longo o suficiente', 'sim');
      expect(res.success).toBe(false);
      expect(res.error).toContain('CONFIRMAR_EXCLUSAO');
    });

    it('permite exclusão pelo owner com motivo válido e palavra de confirmação correta', async () => {
      mockRole = 'owner';
      const res = await deleteUserAccountTwoStep(
        'target-user',
        'Solicitação formal de exclusão pelo próprio titular da conta',
        'CONFIRMAR_EXCLUSAO'
      );
      expect(res.success).toBe(true);
    });
  });

  describe('3. Planos Manuais', () => {
    it('permite ao administrador conceder plano manual com motivo e vigência', async () => {
      mockRole = 'admin';
      const res = await grantManualPlan({
        userId: 'marceneiro-123',
        planCode: 'pro',
        origin: 'manual',
        reason: 'Concessão cortesia para período de avaliação',
        validUntil: '2026-12-31',
      });
      expect(res.success).toBe(true);
    });

    it('rejeita concessão de plano manual com motivo menor que 10 caracteres', async () => {
      mockRole = 'admin';
      const res = await grantManualPlan({
        userId: 'marceneiro-123',
        planCode: 'pro',
        origin: 'manual',
        reason: 'curto',
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain('10 caracteres');
    });

    it('permite revogar plano manual ativo registrando o motivo', async () => {
      mockRole = 'admin';
      const res = await revokeManualPlan('grant-123', 'Término do período de testes acordado');
      expect(res.success).toBe(true);
    });
  });

  describe('4. Logout Forçado e Exportação Auditada de Logs', () => {
    it('permite forçar logout de sessão suspeita com registro em auditoria', async () => {
      mockRole = 'admin';
      const res = await forceUserLogout('usuario-alvo', 'Encerramento de sessão por suspeita de comprometimento');
      expect(res.success).toBe(true);
    });

    it('exporta logs em formato CSV e registra a ação de exportação', async () => {
      mockRole = 'admin';
      const res = await exportAdminLogsToCsv();
      expect(res.success).toBe(true);
      expect(res.csvContent).toContain('ID,Admin_ID,Acao,Tabela_Alvo');
      expect(res.csvContent).toContain('suspend_user_account');
    });
  });
});

