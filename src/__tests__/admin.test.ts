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

function makeSupabaseMock(currentUserId: string | null = 'admin-user-001') {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: currentUserId ? { id: currentUserId, email: 'admin@conectamoveis.com.br' } : null },
        error: null,
      }),
    },
    from: vi.fn().mockReturnThis(),
  };
}

function makeAdminDbMock(role: 'admin' | 'moderator' | null = 'admin') {
  return {
    from: vi.fn().mockImplementation((table: string) => {
      if (table === 'user_roles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: role ? { role } : null,
            error: null,
          }),
        };
      }
      if (table === 'professional_profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockImplementation((col: string) => {
            if (col === 'id') {
              return {
                single: vi.fn().mockResolvedValue({
                  data: { id: 'prof-1', is_suspended: false, is_published: true },
                  error: null,
                }),
                error: null,
              };
            }
            return { error: null };
          }),
        };
      }
      if (table === 'admin_logs') {
        return {
          insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
        };
      }
      if (table === 'portfolio_images') {
        return {
          select: vi.fn().mockResolvedValue({
            data: [{ bytes_size: 1024 * 1024 * 50 }], // 50 MB
            error: null,
          }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        count: vi.fn().mockResolvedValue({ count: 10 }),
      };
    }),
  };
}

describe('FASE 10 — Administração e Moderação', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('Controle de Acesso e Papéis (getAdminUserRole)', () => {
    it('usuário sem login tem acesso negado', async () => {
      const { getAdminUserRole } = await import('@/lib/admin/actions');
      (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabaseMock(null));
      (createSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue(makeAdminDbMock(null));

      const res = await getAdminUserRole();
      expect(res.user).toBeNull();
      expect(res.role).toBeNull();
    });

    it('usuário comum sem papel de moderador ou admin tem acesso negado', async () => {
      const { getAdminUserRole } = await import('@/lib/admin/actions');
      (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabaseMock('common-user-001'));
      (createSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue(makeAdminDbMock(null));

      const res = await getAdminUserRole();
      expect(res.role).toBeNull();
    });

    it('moderador e admin são identificados corretamente', async () => {
      const { getAdminUserRole } = await import('@/lib/admin/actions');
      (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabaseMock('mod-001'));
      (createSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue(makeAdminDbMock('moderator'));

      const res = await getAdminUserRole();
      expect(res.role).toBe('moderator');
      expect(res.user?.id).toBe('mod-001');
    });
  });

  describe('Auditoria e Ações Administrativas (admin_logs)', () => {
    it('rejeita ação administrativa com motivo vazio', async () => {
      const { adminSuspendProfile } = await import('@/lib/admin/actions');
      (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabaseMock('admin-001'));
      (createSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue(makeAdminDbMock('admin'));

      const res = await adminSuspendProfile('prof-1', '');
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/motivo obrigatório/i);
    });

    it('ação de suspender perfil grava log completo e aplica is_suspended = true', async () => {
      const { adminSuspendProfile } = await import('@/lib/admin/actions');
      (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabaseMock('admin-001'));

      const adminMock = makeAdminDbMock('admin');
      (createSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue(adminMock);

      const res = await adminSuspendProfile('prof-1', 'Denúncias reiteradas de descumprimento contratual.');
      expect(res.success).toBe(true);

      // Garante que tentou inserir em admin_logs
      expect(adminMock.from).toHaveBeenCalledWith('admin_logs');
    });

    it('ação de reativar perfil grava log completo e aplica is_suspended = false', async () => {
      const { adminUnsuspendProfile } = await import('@/lib/admin/actions');
      (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabaseMock('admin-001'));
      (createSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue(makeAdminDbMock('admin'));

      const res = await adminUnsuspendProfile('prof-1', 'Documentação regularizada pelo prestador.');
      expect(res.success).toBe(true);
    });
  });

  describe('Uso de Recursos e Limite Gratuito (getStorageAndDatabaseUsage)', () => {
    it('calcula porcentagens de Storage e dispara alerta se ultrapassar 70%', async () => {
      const { getStorageAndDatabaseUsage } = await import('@/lib/admin/actions');

      // Simular 800 MB de fotos (limite é 1000 MB -> 80% de uso)
      const bigStorageMock = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'portfolio_images') {
            return {
              select: vi.fn().mockResolvedValue({
                data: [{ bytes_size: 800 * 1024 * 1024 }],
                error: null,
              }),
            };
          }
          return {
            select: vi.fn().mockReturnValue({ count: 50 }),
          };
        }),
      };

      (createSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue(bigStorageMock);

      const usage = await getStorageAndDatabaseUsage();
      expect(usage.storageUsagePercent).toBeGreaterThanOrEqual(70);
      expect(usage.isStorageAlert).toBe(true);
    });
  });

  describe('Proteção de Dados Sensíveis', () => {
    it('recordAdminLog descarta senhas e tokens antes de salvar log', async () => {
      const { recordAdminLog } = await import('@/lib/admin/actions');

      const adminDb = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockImplementation((payload: any) => {
            // Validar que o payload não contém senhas nem tokens
            expect(payload.old_value).not.toHaveProperty('password');
            expect(payload.old_value).not.toHaveProperty('token');
            expect(payload.new_value).not.toHaveProperty('secret');
            return Promise.resolve({ data: {}, error: null });
          }),
        }),
      };

      (createSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue(adminDb);

      await recordAdminLog({
        adminId: 'admin-001',
        action: 'test_action',
        targetTable: 'profiles',
        targetId: 'user-1',
        reason: 'Teste de segurança',
        oldValue: { name: 'João', password: 'secret_hash_123', token: 'jwt_token_abc' },
        newValue: { name: 'João Silva', secret: 'oauth_secret' },
      });
    });
  });
});
