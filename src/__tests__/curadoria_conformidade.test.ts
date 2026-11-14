import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getUnifiedComplianceQueue,
  approveComplianceItem,
  rejectComplianceItem,
  hideAndPreserveSeverity,
  triggerPaidReviewOnProfileEdit,
  getPlanEqualityReport,
  getTransparencyReport,
} from '../lib/curadoria/actions';
import { STANDARD_COMPLIANCE_REASONS } from '../lib/curadoria/reasons';

// Mock de autenticação e banco de dados
let mockUser: { id: string; email: string } | null = {
  id: 'moderator-123',
  email: 'moderador@conectamoveis.com.br',
};
let mockRole: string | null = 'moderator';

let mockProfiles: Record<string, unknown>[] = [];
let mockAuditLogs: Record<string, unknown>[] = [];
let mockPhotos: Record<string, unknown>[] = [];
let mockNotices: Record<string, unknown>[] = [];

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: mockUser },
      })),
    },
  })),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
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

      if (table === 'portfolio_photos') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(async () => ({ data: mockPhotos, error: null })),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn(async () => ({ error: null })),
          })),
        };
      }

      if (table === 'takedown_notices') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(async () => ({ data: mockNotices, error: null })),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn(async () => ({ error: null })),
          })),
        };
      }

      if (table === 'profile_reviews') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(async () => ({ data: [], error: null })),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn(async () => ({ error: null })),
          })),
        };
      }

      if (table === 'profiles') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(async () => ({ data: mockProfiles, error: null })),
              single: vi.fn(async () => ({ data: mockProfiles[0] || null, error: null })),
            })),
          })),
          update: vi.fn((payload) => ({
            eq: vi.fn(async () => {
              if (mockProfiles.length > 0) {
                Object.assign(mockProfiles[0], payload);
              }
              return { error: null };
            }),
          })),
        };
      }

      if (table === 'compliance_audit_logs') {
        return {
          select: vi.fn(() => {
            const chainable: Record<string, unknown> = {
              gte: vi.fn(() => chainable),
              lte: vi.fn(async () => ({ data: mockAuditLogs, error: null })),
              then: (resolve: (val: unknown) => void) =>
                Promise.resolve({ data: mockAuditLogs, error: null }).then(resolve),
            };
            return chainable;
          }),
          insert: vi.fn(async (payload) => {
            mockAuditLogs.push(payload);
            return { error: null };
          }),
        };
      }

      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(async () => ({ data: null, error: null })),
          })),
        })),
        insert: vi.fn(async () => ({ error: null })),
        update: vi.fn(() => ({
          eq: vi.fn(async () => ({ error: null })),
        })),
      };
    }),
  })),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Fase 21 — Curadoria de Conformidade e Moderação Reforçada', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = { id: 'moderator-123', email: 'moderador@conectamoveis.com.br' };
    mockRole = 'moderator';

    mockProfiles = [
      {
        id: 'user-pago-1',
        full_name: 'Marcenaria Arte & Madeira',
        plan: 'pro',
        pending_paid_review: true,
        paid_review_status: 'pending',
        updated_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ];

    mockPhotos = [
      {
        id: 'photo-1',
        title: 'Mesa de Jantar',
        user_id: 'user-pago-1',
        status: 'pending',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        profiles: { full_name: 'Marcenaria Arte & Madeira', plan: 'pro' },
      },
    ];

    mockNotices = [
      {
        id: 'notice-severe-1',
        protocol_number: 'NOT-2026-000099',
        category: 'fraude_grave',
        status: 'pending',
        target_user_id: 'user-fraude',
        created_at: new Date(Date.now() - 1000000).toISOString(),
        profiles: { full_name: 'Anunciante Suspeito', plan: 'gratuito' },
      },
    ];

    mockAuditLogs = [
      { target_plan_code: 'gratuito', action: 'rejeitado', reason_code: 'foto_terceiro_sem_autoria', created_at: new Date().toISOString() },
      { target_plan_code: 'gratuito', action: 'liberado', reason_code: null, created_at: new Date().toISOString() },
      { target_plan_code: 'pro', action: 'rejeitado', reason_code: 'contato_indevido_midia', created_at: new Date().toISOString() },
      { target_plan_code: 'pro', action: 'liberado', reason_code: null, created_at: new Date().toISOString() },
      { target_plan_code: 'destaque', action: 'liberado', reason_code: null, created_at: new Date().toISOString() },
    ];
  });

  describe('1. Fila Unificada e Priorização por Gravidade', () => {
    it('deve priorizar casos gravíssimos no topo da fila com SLA de 2 horas', async () => {
      const res = await getUnifiedComplianceQueue();
      expect(res.success).toBe(true);
      expect(res.items).toBeDefined();

      const items = res.items || [];
      expect(items.length).toBeGreaterThanOrEqual(2);

      // O primeiro item deve ser gravíssimo (a denúncia de fraude grave)
      expect(items[0].severity).toBe('gravissimo');
      expect(items[0].sla_hours).toBe(2);
      expect(items[0].item_type).toBe('denuncia');
    });
  });

  describe('2. Revisão Prévia de Conteúdo Comercial (Regra R6 / STF Tema 987)', () => {
    it('deve manter perfil com pending_paid_review até aprovação explícita', async () => {
      expect(mockProfiles[0].pending_paid_review).toBe(true);

      const res = await approveComplianceItem({
        itemId: 'user-pago-1',
        itemType: 'perfil_pago',
        targetUserId: 'user-pago-1',
      });

      expect(res.success).toBe(true);
      expect(mockProfiles[0].pending_paid_review).toBe(false);
      expect(mockProfiles[0].paid_review_status).toBe('approved');
    });

    it('deve reverter para pending_paid_review quando o anunciante comercial edita o perfil', async () => {
      mockProfiles[0].pending_paid_review = false;
      mockProfiles[0].paid_review_status = 'approved';

      await triggerPaidReviewOnProfileEdit('user-pago-1');

      expect(mockProfiles[0].pending_paid_review).toBe(true);
      expect(mockProfiles[0].paid_review_status).toBe('pending');
    });
  });

  describe('3. Segregação de Funções: Moderador não pode aprovar o próprio conteúdo', () => {
    it('deve barrar tentativa de moderador aprovar seu próprio conteúdo ou perfil', async () => {
      const res = await approveComplianceItem({
        itemId: 'moderator-123',
        itemType: 'perfil_pago',
        targetUserId: 'moderator-123', // Mesmo ID do usuário logado
      });

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/próprio conteúdo/i);
    });

    it('deve barrar tentativa de moderador rejeitar seu próprio conteúdo', async () => {
      const res = await rejectComplianceItem({
        itemId: 'moderator-123',
        itemType: 'foto',
        targetUserId: 'moderator-123',
        reasonCode: 'contato_indevido_midia',
      });

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/próprio conteúdo/i);
    });
  });

  describe('4. Ação Única para Ilícito Gravíssimo: Ocultar e Preservar com Hash SHA-256', () => {
    it('deve ocultar o conteúdo imediatamente e gerar pacote de evidência com hash', async () => {
      const res = await hideAndPreserveSeverity({
        itemId: 'user-fraude',
        itemType: 'perfil_pago',
        targetUserId: 'user-fraude',
        details: 'Tentativa comprovada de golpe financeiro contra moradores.',
      });

      expect(res.success).toBe(true);
      expect(res.evidenceHash).toBeDefined();
      expect(res.evidenceHash?.length).toBe(64); // SHA-256 hex string tem 64 caracteres

      // Confere se foi gravado no log de auditoria
      const log = mockAuditLogs.find((l) => l.action === 'ocultado_preservado');
      expect(log).toBeDefined();
      expect(log?.evidence_hash).toBe(res.evidenceHash);
    });
  });

  describe('5. Auditoria de Isonomia entre Planos (Regras R14 e R20)', () => {
    it('deve calcular corretamente taxas de remoção comparando planos comerciais e gratuitos', async () => {
      const res = await getPlanEqualityReport();
      expect(res.success).toBe(true);
      expect(res.metrics).toBeDefined();

      const gratuitoMetric = res.metrics?.find((m) => m.plan_code === 'gratuito');
      const proMetric = res.metrics?.find((m) => m.plan_code === 'pro');

      expect(gratuitoMetric).toBeDefined();
      expect(proMetric).toBeDefined();

      // 1 remoção em 2 ações = 50%
      expect(gratuitoMetric?.removal_rate).toBe(50);
      expect(proMetric?.removal_rate).toBe(50);
    });
  });

  describe('6. Relatório Anual de Transparência', () => {
    it('deve consolidar métricas anuais sem dados pessoais', async () => {
      const res = await getTransparencyReport(2026);
      expect(res.success).toBe(true);
      expect(res.report).toBeDefined();

      const rep = res.report!;
      expect(rep.total_received).toBe(mockAuditLogs.length);
      expect(rep.total_accepted).toBeGreaterThan(0);
      expect(rep.category_breakdown).toBeDefined();
      // Não pode haver campos pessoais
      const sanitized = rep as unknown as Record<string, unknown>;
      expect(sanitized.emails).toBeUndefined();
      expect(sanitized.names).toBeUndefined();
    });
  });

  describe('7. Biblioteca de Motivos e Diretrizes de Isenção', () => {
    it('deve conter motivos vinculados exclusivamente a políticas públicas sem termos de endosso', () => {
      for (const reason of STANDARD_COMPLIANCE_REASONS) {
        expect(['politica_anuncios', 'politica_portfolio', 'politica_avaliacoes', 'termos_uso', 'regras_denuncia']).toContain(
          reason.policy_source
        );
        expect(reason.description).toBeDefined();
        expect(reason.advertiser_message_template).toBeDefined();
        // Não pode haver promessa de garantia ou escolha editorial
        expect(reason.title.toLowerCase()).not.toContain('escolha da equipe');
        expect(reason.title.toLowerCase()).not.toContain('seleção da equipe');
      }
    });
  });
});
