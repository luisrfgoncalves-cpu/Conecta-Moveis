import { describe, it, expect, vi } from 'vitest';
import {
  updateSystemSetting,
  rollbackSetting,
  updateFeatureFlag,
  simulateCapacity,
  checkSoftLimitEnforcement,
  updateInfraProfile,
} from '../lib/config/actions';
import { defaultAdapters, SupabaseStorageAdapter } from '../lib/adapters';

// Mock do Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: { id: 'admin-123', email: 'admin@conectamoveis.com.br' } },
      })),
    },
  })),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

const mockHistoryStore: Array<{
  id: string;
  setting_key: string;
  old_value: unknown;
  new_value: unknown;
  reason: string;
}> = [];

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'user_roles') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              in: vi.fn(() => ({
                single: vi.fn(async () => ({
                  data: { role: 'admin' },
                })),
              })),
            })),
          })),
        };
      }

      if (table === 'infra_profiles') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(async () => ({
                data: {
                  id: 'gratuito',
                  name: 'Plano Gratuito',
                  storage_mb: 1024,
                  db_mb: 500,
                  transfer_gb_month: 5,
                  max_upload_size_mb: 5,
                  is_active: true,
                },
              })),
            })),
          })),
          update: vi.fn(() => ({
            neq: vi.fn(async () => ({ error: null })),
            eq: vi.fn(async () => ({ error: null })),
          })),
        };
      }

      if (table === 'system_settings') {
        return {
          select: vi.fn(async () => ({
            data: [
              {
                key: 'max_photos_free_plan',
                value: 5,
                value_type: 'number',
                min_value: 1,
                max_value: 20,
                requires_infra_profile: 'gratuito',
              },
              {
                key: 'max_photos_pro_plan',
                value: 20,
                value_type: 'number',
                min_value: 5,
                max_value: 100,
                requires_infra_profile: 'pro',
              },
            ],
          })),
          upsert: vi.fn(async () => ({ error: null })),
          update: vi.fn(() => ({
            eq: vi.fn(async () => ({ error: null })),
          })),
        };
      }

      if (table === 'system_setting_history') {
        return {
          insert: vi.fn(async (row: { setting_key: string; old_value: unknown; new_value: unknown; reason: string }) => {
            mockHistoryStore.push({ id: 'hist-1', ...row });
            return { error: null };
          }),
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(async () => ({
                data: {
                  id: 'hist-1',
                  setting_key: 'max_photos_free_plan',
                  old_value: 5,
                  new_value: 10,
                  reason: 'Ajuste de teste',
                },
                error: null,
              })),
            })),
          })),
        };
      }

      if (table === 'feature_flags') {
        return {
          select: vi.fn(async () => ({
            data: [
              {
                key: 'advanced_ai_search',
                name: 'Busca Semântica por IA',
                state: 'desligado',
                requires_infra_profile: 'pro',
                requires_legal_review: false,
              },
              {
                key: 'automated_review_sentiment',
                name: 'Análise de Sentimento',
                state: 'desligado',
                requires_infra_profile: 'gratuito',
                requires_legal_review: true,
                legal_approval_id: null,
              },
            ],
          })),
          upsert: vi.fn(async () => ({ error: null })),
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

describe('FASE 18 — Arquitetura de Configuração e Upgrade', () => {
  describe('1. Validação de Limites Mínimo e Máximo (Zod / Tipagem)', () => {
    it('rejeita dado abaixo do mínimo permitido com mensagem explicativa', async () => {
      const res = await updateSystemSetting('max_photos_free_plan', 0, 'Tentativa de zerar limite');
      expect(res.success).toBe(false);
      expect(res.error).toContain('mínimo permitido');
    });

    it('rejeita dado acima do máximo permitido com mensagem explicativa', async () => {
      const res = await updateSystemSetting('max_photos_free_plan', 99, 'Tentativa de valor excessivo');
      expect(res.success).toBe(false);
      expect(res.error).toContain('máximo permitido');
    });

    it('rejeita justificativa de alteração com menos de 10 caracteres', async () => {
      const res = await updateSystemSetting('max_photos_free_plan', 8, 'curto');
      expect(res.success).toBe(false);
      expect(res.error).toContain('10 caracteres');
    });
  });

  describe('2. Duas Camadas: Tetos de Infraestrutura vs Limites Comerciais', () => {
    it('exige confirmação explícita quando configuração requer plano pro mas infraestrutura ativa é gratuita', async () => {
      const res = await updateSystemSetting(
        'max_photos_pro_plan',
        30,
        'Ajuste para plano comercial pro',
        false // sem confirmação prévia
      );
      expect(res.success).toBe(false);
      expect(res.requiresConfirmation).toBe(true);
      expect(res.warning).toContain("requer recursos do perfil 'pro'");
    });

    it('bloqueia alteração do perfil de infraestrutura sem confirmação explícita de contratação', async () => {
      const res = await updateInfraProfile('pro', false);
      expect(res.success).toBe(false);
      expect(res.error).toContain('confirmação explícita de contratação');
    });
  });

  describe('3. Feature Flags com Travas de Infraestrutura e Jurídica', () => {
    it('bloqueia ativação de flag que requer plano pro quando a infraestrutura ativa é gratuita', async () => {
      const res = await updateFeatureFlag('advanced_ai_search', 'ligado');
      expect(res.success).toBe(false);
      expect(res.error).toContain('requer plano pago da infraestrutura');
    });

    it('bloqueia ativação de flag regulada sem ID de aprovação jurídica formal (J-xxx)', async () => {
      const res = await updateFeatureFlag('automated_review_sentiment', 'ligado');
      expect(res.success).toBe(false);
      expect(res.error).toContain('aprovação jurídica formal');
    });

    it('permite ativação de flag regulada quando acompanhada de ID de aprovação válido (J-004)', async () => {
      const res = await updateFeatureFlag('automated_review_sentiment', 'ligado', 'J-004');
      expect(res.success).toBe(true);
    });
  });

  describe('4. Política de Redução: Bloqueio Brando (Grandfathering)', () => {
    it('permite adicionar conteúdo quando o total atual é inferior ao novo limite', async () => {
      const check = await checkSoftLimitEnforcement(3, 5);
      expect(check.canAdd).toBe(true);
      expect(check.isGrandfathered).toBe(false);
    });

    it('aplica bloqueio brando quando usuário já possui mais itens do que o limite reduzido sem apagar conteúdo', async () => {
      // Usuário tinha 10 fotos no plano antigo, limite caiu para 5
      const check = await checkSoftLimitEnforcement(10, 5);
      expect(check.canAdd).toBe(false);
      expect(check.isGrandfathered).toBe(true);
      expect(check.message).toContain('permanecem preservados e ativos');
    });
  });

  describe('5. Histórico e Reversão (Rollback)', () => {
    it('reverte configuração para a versão anterior gravando log de auditoria', async () => {
      const res = await rollbackSetting('hist-1');
      expect(res.success).toBe(true);
      expect(res.restoredKey).toBe('max_photos_free_plan');
    });
  });

  describe('6. Simulador de Capacidade', () => {
    it('calcula projeções corretas e não dispara alertas para volumes comportados no plano gratuito', async () => {
      const result = await simulateCapacity({
        total_profiles: 50,
        photos_per_profile: 4,
        avg_photo_size_kb: 500,
        active_monthly_visitors: 1000,
        views_per_visitor: 3,
      });

      expect(result.projected_storage_mb).toBeLessThan(700);
      expect(result.storage_alert_level).toBe('ok');
      expect(result.max_profiles_sustainable).toBeGreaterThan(50);
    });

    it('dispara alerta de 70% ou crítico de 90% quando volume se aproxima do teto da infraestrutura', async () => {
      const result = await simulateCapacity({
        total_profiles: 400,
        photos_per_profile: 5,
        avg_photo_size_kb: 600,
        active_monthly_visitors: 10000,
        views_per_visitor: 5,
      });

      // 400 * 5 * 600KB / 1024 = ~1171 MB (> 1024 MB do plano gratuito)
      expect(result.storage_usage_percent).toBeGreaterThan(90);
      expect(result.storage_alert_level).toBe('critical_90');
      expect(result.recommendation).toContain('ALERTA CRÍTICO');
    });
  });

  describe('7. Adaptadores de Infraestrutura', () => {
    it('respeita os contratos de interface sem falhas nos testes', async () => {
      const adapter = defaultAdapters.storage;
      expect(adapter).toBeInstanceOf(SupabaseStorageAdapter);

      const url = adapter.getPublicUrl('portfolios', 'foto.jpg');
      expect(url).toContain('storage/v1/object/public/portfolios/foto.jpg');

      const thumbUrl = adapter.getVariantUrl('portfolios', 'foto.jpg', 'thumb');
      expect(thumbUrl).toContain('variant=thumb');

      const emailResult = await defaultAdapters.email.send({
        to: 'teste@exemplo.com',
        subject: 'Teste de Upgrade',
      });
      expect(emailResult.success).toBe(true);

      const rateLimitResult = await defaultAdapters.rateLimit.check('user-1', 5, 60);
      expect(rateLimitResult.success).toBe(true);
      expect(rateLimitResult.remaining).toBe(4);
    });
  });
});
