import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitTakedownNotice } from '@/lib/takedown/actions';
import { getPlansCatalog } from '@/lib/plans/actions';
import { SYSTEM_SETTINGS_REGISTRY } from '@/lib/config/registry';

// Mock do client Supabase
let _mockInsertRecord: Record<string, unknown> | null = null;

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn((payload) => {
        _mockInsertRecord = payload;
        return {
          select: vi.fn(() => ({
            single: vi.fn(async () => ({ data: { protocol: 'NOT-2026-999999' }, error: null })),
          })),
        };
      }),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(async () => ({ data: null, error: null })),
          order: vi.fn(async () => ({ data: [], error: null })),
        })),
        order: vi.fn(async () => ({ data: [], error: null })),
      })),
    })),
  })),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
      })),
    },
  })),
}));

describe('BLOCO 2 — Bugs de Fluxo e Links', () => {
  beforeEach(() => {
    _mockInsertRecord = null;
  });

  describe('2.2 Validação de Redirecionamento Seguro (Anti Open-Redirect)', () => {
    function sanitizeRedirect(rawUrl: string | null | undefined): string {
      if (!rawUrl) return '/painel';
      if (rawUrl.startsWith('/') && !rawUrl.startsWith('//')) {
        return rawUrl;
      }
      return '/painel';
    }

    it('permite caminhos internos válidos', () => {
      expect(sanitizeRedirect('/profissionais/marceneiro-silva')).toBe('/profissionais/marceneiro-silva');
      expect(sanitizeRedirect('/planos')).toBe('/planos');
      expect(sanitizeRedirect('/painel/perfil')).toBe('/painel/perfil');
    });

    it('bloqueia tentativas de open redirect externo', () => {
      expect(sanitizeRedirect('https://evil.com')).toBe('/painel');
      expect(sanitizeRedirect('http://malicious.org')).toBe('/painel');
      expect(sanitizeRedirect('//evil.com/phishing')).toBe('/painel');
      expect(sanitizeRedirect('javascript:alert(1)')).toBe('/painel');
    });
  });

  describe('2.3 Configurações Centrais de Planos e Limites', () => {
    it('o registro de configurações define 1 imagem no card e 2 no perfil para o plano gratuito', () => {
      expect(SYSTEM_SETTINGS_REGISTRY.max_photos_free_card.value).toBe(1);
      expect(SYSTEM_SETTINGS_REGISTRY.max_photos_free_profile.value).toBe(2);
      expect(SYSTEM_SETTINGS_REGISTRY.max_photos_free_plan.value).toBe(3);
      expect(SYSTEM_SETTINGS_REGISTRY.max_categories_free_plan.value).toBe(1);
    });

    it('getPlansCatalog retorna planos lendo os limites do registro de configurações', async () => {
      const plans = await getPlansCatalog();
      expect(plans.length).toBeGreaterThanOrEqual(3);

      const freePlan = plans.find((p) => p.id === 'free');
      expect(freePlan).toBeDefined();
      expect(freePlan?.max_photos).toBe(3);
      expect(freePlan?.max_categories).toBe(1);

      const proPlan = plans.find((p) => p.id === 'pro');
      expect(proPlan).toBeDefined();
      expect(proPlan?.max_photos).toBe(20);
      expect(proPlan?.max_categories).toBe(3);
    });
  });

  describe('2.4 Notificação e Retirada: Titularidade e Boa-fé', () => {
    it('exige identificação (nome e e-mail) para categoria de direitos autorais', async () => {
      const res = await submitTakedownNotice({
        category: 'copyright_image',
        targetType: 'portfolio_image',
        description: 'Esta imagem foi tirada do meu site pessoal sem autorização.',
        notifierName: '',
        notifierEmail: '',
        goodFaithDeclaration: true,
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain('obrigatória para denúncias de direitos autorais');
    });

    it('permite denúncia sem nome e e-mail para suspeita de golpe/fraude (apenas boa-fé)', async () => {
      const res = await submitTakedownNotice({
        category: 'fraud',
        targetType: 'profile',
        description: 'Perfil suspeito solicitando adiantamento via PIX sem prestar serviço.',
        notifierName: '',
        notifierEmail: '',
        goodFaithDeclaration: true,
      });

      expect(res.success).toBe(true);
      expect(res.protocol).toBeDefined();
    });

    it('bloqueia qualquer denúncia se a declaração de boa-fé não for marcada', async () => {
      const res = await submitTakedownNotice({
        category: 'defamation',
        targetType: 'review',
        description: 'Comentário calunioso atacando minha honra.',
        goodFaithDeclaration: false,
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain('boa-fé');
    });
  });
});
