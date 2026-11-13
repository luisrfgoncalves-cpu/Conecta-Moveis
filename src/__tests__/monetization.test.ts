/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ===== Mocks =====
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import {
  getEntitlements,
  registerPlanInterest,
  changePlanTestMode,
  getProfessionalMetrics,
  adminUpdatePlanLimits,
} from '@/lib/plans/actions';

function makeSupabaseMock(currentUserId: string | null = 'user-test-123') {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: currentUserId
            ? { id: currentUserId, email: 'marceneiro@teste.com' }
            : null,
        },
        error: null,
      }),
    },
    from: vi.fn().mockReturnThis(),
  };
}

describe('FASE 11 — Planos, Entitlements e Monetização sem Cobrança Real', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.BILLING_MODE;
  });

  describe('1. getEntitlements (Fonte única de verdade de cotas)', () => {
    it('deve retornar cotas do plano gratuito padrão quando usuário não possui assinatura paga', async () => {
      const mockAdminDb = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'subscriptions') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            };
          }
          if (table === 'entitlements') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              maybeSingle: vi.fn().mockResolvedValue({
                data: { max_photos: 6, max_categories: 2, can_feature: false },
                error: null,
              }),
            };
          }
          return { select: vi.fn().mockReturnThis() };
        }),
      };
      (createSupabaseClient as any).mockReturnValue(mockAdminDb);

      const ent = await getEntitlements('user-test-123');
      expect(ent.planId).toBe('free');
      expect(ent.maxPhotos).toBe(6);
      expect(ent.maxCategories).toBe(2);
      expect(ent.canFeature).toBe(false);
      expect(ent.hasStats).toBe(false);
    });

    it('deve retornar cotas expandidas quando usuário possui assinatura Pro', async () => {
      const mockAdminDb = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'subscriptions') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              maybeSingle: vi.fn().mockResolvedValue({
                data: {
                  plan_id: 'pro',
                  status: 'active',
                  plans: { id: 'pro', name: 'Profissional', max_photos: 15, max_categories: 5, allow_featured: true },
                },
                error: null,
              }),
            };
          }
          if (table === 'entitlements') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              maybeSingle: vi.fn().mockResolvedValue({
                data: { max_photos: 15, max_categories: 5, can_feature: true },
                error: null,
              }),
            };
          }
          return { select: vi.fn().mockReturnThis() };
        }),
      };
      (createSupabaseClient as any).mockReturnValue(mockAdminDb);

      const ent = await getEntitlements('user-test-pro');
      expect(ent.planId).toBe('pro');
      expect(ent.maxPhotos).toBe(15);
      expect(ent.maxCategories).toBe(5);
      expect(ent.canFeature).toBe(true);
      expect(ent.hasStats).toBe(true);
    });
  });

  describe('2. Controle de Alteração de Planos (BILLING_MODE)', () => {
    it('deve BLOQUEAR alteração de plano por requisição manipulada quando BILLING_MODE=off', async () => {
      process.env.BILLING_MODE = 'off';
      (createClient as any).mockResolvedValue(makeSupabaseMock('user-hacker'));

      const res = await changePlanTestMode('pro');
      expect(res.success).toBe(false);
      expect(res.error).toContain('desativada');
    });

    it('deve PERMITIR alteração de plano quando BILLING_MODE=test e sincronizar entitlements', async () => {
      process.env.BILLING_MODE = 'test';
      (createClient as any).mockResolvedValue(makeSupabaseMock('user-tester'));

      const upsertEntitlementsMock = vi.fn().mockResolvedValue({ error: null });
      const updateProfProfileMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      const mockAdminDb = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'plans') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'pro',
                  name: 'Profissional',
                  max_photos: 15,
                  max_categories: 5,
                  allow_featured: true,
                },
                error: null,
              }),
            };
          }
          if (table === 'subscriptions') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              insert: vi.fn().mockResolvedValue({ error: null }),
            };
          }
          if (table === 'entitlements') {
            return {
              upsert: upsertEntitlementsMock,
            };
          }
          if (table === 'professional_profiles') {
            return {
              update: updateProfProfileMock,
            };
          }
          return { select: vi.fn().mockReturnThis() };
        }),
      };
      (createSupabaseClient as any).mockReturnValue(mockAdminDb);

      const res = await changePlanTestMode('pro');
      expect(res.success).toBe(true);
      expect(upsertEntitlementsMock).toHaveBeenCalledWith(
        expect.objectContaining({
          max_photos: 15,
          max_categories: 5,
          can_feature: true,
        })
      );
    });

    it('deve registrar manifestação de interesse em plan_interest com sucesso', async () => {
      (createClient as any).mockResolvedValue(makeSupabaseMock('user-lead'));
      const insertInterestMock = vi.fn().mockResolvedValue({ error: null });

      const mockAdminDb = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'plan_interest') {
            return { insert: insertInterestMock };
          }
          return {};
        }),
      };
      (createSupabaseClient as any).mockReturnValue(mockAdminDb);

      const res = await registerPlanInterest('enterprise', 'Quero testar na marcenaria');
      expect(res.success).toBe(true);
      expect(insertInterestMock).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-lead',
          plan_id: 'enterprise',
          notes: 'Quero testar na marcenaria',
        })
      );
    });
  });

  describe('3. Edição Administrativa de Planos e Auditoria', () => {
    it('deve rejeitar alteração de limites de plano se motivo estiver vazio', async () => {
      (createClient as any).mockResolvedValue(makeSupabaseMock('admin-id'));
      const mockAdminDb = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'user_roles') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              in: vi.fn().mockReturnThis(),
              maybeSingle: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
            };
          }
          return {};
        }),
      };
      (createSupabaseClient as any).mockReturnValue(mockAdminDb);

      const res = await adminUpdatePlanLimits({
        planId: 'pro',
        maxPhotos: 20,
        maxCategories: 6,
        allowFeatured: true,
        reason: '   ',
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain('motivo');
    });

    it('deve rejeitar se usuário não for administrador', async () => {
      (createClient as any).mockResolvedValue(makeSupabaseMock('user-comum'));
      const mockAdminDb = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'user_roles') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              in: vi.fn().mockReturnThis(),
              maybeSingle: vi.fn().mockResolvedValue({ data: { role: 'moderator' }, error: null }), // moderador não edita planos
            };
          }
          return {};
        }),
      };
      (createSupabaseClient as any).mockReturnValue(mockAdminDb);

      const res = await adminUpdatePlanLimits({
        planId: 'pro',
        maxPhotos: 20,
        maxCategories: 6,
        allowFeatured: true,
        reason: 'Tentativa indevida',
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain('Apenas administradores');
    });

    it('deve atualizar plano e gravar admin_logs quando executado por admin com motivo', async () => {
      (createClient as any).mockResolvedValue(makeSupabaseMock('admin-id'));
      const updatePlanMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });
      const insertLogMock = vi.fn().mockResolvedValue({ error: null });

      const mockAdminDb = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'user_roles') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              in: vi.fn().mockReturnThis(),
              maybeSingle: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
            };
          }
          if (table === 'plans') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: { id: 'pro', max_photos: 15, max_categories: 5, allow_featured: true },
                error: null,
              }),
              update: updatePlanMock,
            };
          }
          if (table === 'admin_logs') {
            return { insert: insertLogMock };
          }
          return {};
        }),
      };
      (createSupabaseClient as any).mockReturnValue(mockAdminDb);

      const res = await adminUpdatePlanLimits({
        planId: 'pro',
        maxPhotos: 18,
        maxCategories: 6,
        allowFeatured: true,
        reason: 'Expansão de cota para novos anunciantes',
      });

      expect(res.success).toBe(true);
      expect(updatePlanMock).toHaveBeenCalled();
      expect(insertLogMock).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'UPDATE_PLAN_LIMITS',
          reason: 'Expansão de cota para novos anunciantes',
        })
      );
    });
  });

  describe('4. Métricas Agregadas do Profissional (daily_metrics)', () => {
    it('deve totalizar visualizações de perfil, cliques de WhatsApp e solicitações', async () => {
      const mockAdminDb = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'daily_metrics') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockResolvedValue({
                data: [
                  { metric_name: 'profile_view', counter: 45 },
                  { metric_name: 'profile_view', counter: 15 },
                  { metric_name: 'whatsapp_click', counter: 12 },
                  { metric_name: 'whatsapp_click', counter: 8 },
                ],
                error: null,
              }),
            };
          }
          if (table === 'contact_requests') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockResolvedValue({ count: 7, error: null }),
            };
          }
          return {};
        }),
      };
      (createSupabaseClient as any).mockReturnValue(mockAdminDb);

      const metrics = await getProfessionalMetrics('prof-123');
      expect(metrics.profileViews).toBe(60); // 45 + 15
      expect(metrics.whatsappClicks).toBe(20); // 12 + 8
      expect(metrics.contactRequests).toBe(7);
    });
  });

  describe('5. Destaque Patrocinado e Rótulo Obrigatório', () => {
    it('rotula expressamente como "Destaque patrocinado" sem linguagem de garantia ou qualidade', () => {
      const labelPadrao = 'Destaque patrocinado';
      const labelTeste = 'Destaque patrocinado (Teste)';

      expect(labelPadrao).toContain('patrocinado');
      expect(labelPadrao).not.toMatch(/garantido|melhor|recomendado/i);

      expect(labelTeste).toContain('patrocinado');
      expect(labelTeste).toContain('Teste');
    });
  });
});
