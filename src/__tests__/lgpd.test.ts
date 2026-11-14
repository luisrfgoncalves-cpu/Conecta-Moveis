import { describe, it, expect, vi } from 'vitest';
import { createDataSubjectRequest, readApplicationLogsWithAudit, executeRetentionPurge } from '../lib/lgpd/actions';

// Mock do next/cache (revalidatePath não funciona fora de contexto Next.js)
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

// Mock do supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: { id: 'user-lgpd-123', email: 'usuario@exemplo.com' } },
      })),
    },
  })),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => ({
    get: (key: string) => {
      if (key === 'x-forwarded-for') return '177.18.29.30';
      if (key === 'user-agent') return 'Mozilla/5.0 TestBrowser';
      return null;
    },
  })),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'data_subject_requests') {
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(async () => ({
                data: {
                  protocol: 'DSR-2026-000015',
                  deadline_at: '2026-11-28T12:00:00Z',
                },
                error: null,
              })),
            })),
          })),
        };
      }
      if (table === 'profiles') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(async () => ({
                data: { full_name: 'Usuário Silva' },
              })),
            })),
          })),
        };
      }
      if (table === 'user_roles') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(async () => ({
                  data: { role: 'admin' },
                })),
              })),
            })),
          })),
        };
      }
      if (table === 'app_access_logs') {
        return {
          insert: vi.fn(async () => ({ error: null })),
          select: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(async () => ({
                data: [
                  {
                    id: 1,
                    user_id: 'user-1',
                    ip_address: '177.18.29.30',
                    action: 'auth.login',
                    created_at: '2026-11-13T10:00:00Z',
                    legal_hold: false,
                  },
                ],
                error: null,
              })),
            })),
          })),
        };
      }
      if (table === 'app_access_log_reads') {
        return {
          insert: vi.fn(async () => ({ error: null })),
        };
      }
      return {
        select: vi.fn(() => ({
          single: vi.fn(async () => ({ data: null, error: null })),
        })),
      };
    }),
    rpc: vi.fn(async (fnName: string) => {
      if (fnName === 'purge_expired_records') {
        return {
          data: {
            success: true,
            purged_contacts_90d: 5,
            purged_access_logs_180d: 42,
          },
          error: null,
        };
      }
      return { data: null, error: null };
    }),
  })),
}));

describe('Fase 17 — LGPD Operacional e Direitos do Titular (Art. 18/19)', () => {
  it('deve gerar protocolo DSR-YYYY-XXXXXX e calcular prazo de 15 dias', async () => {
    const res = await createDataSubjectRequest('portability', 'Solicito o envio dos meus dados em formato legível.');
    expect(res.success).toBe(true);
    expect(res.protocol).toBe('DSR-2026-000015');
    expect(res.deadline).toBeDefined();
  });
});

describe('Fase 17 — Registros de Acesso (Marco Civil Art. 15)', () => {
  it('deve exigir justificativa fundamentada de no mínimo 15 caracteres para ler logs de acesso', async () => {
    const res = await readApplicationLogsWithAudit('curioso');
    expect(res.success).toBe(false);
    expect(res.error).toContain('15 caracteres');
  });

  it('deve permitir leitura quando acompanhada de justificativa formal auditada', async () => {
    const res = await readApplicationLogsWithAudit('Atendimento formal ao Ofício Policial nº 123/2026 da 1ª DP');
    expect(res.success).toBe(true);
    expect(res.logs).toHaveLength(1);
    expect(res.logs?.[0].ip_address).toBe('177.18.29.30');
  });
});

describe('Fase 17 — Retenção Legal e Expurgo Automático', () => {
  it('deve executar o expurgo de registros expirados (>90d contatos, >180d logs)', async () => {
    const res = await executeRetentionPurge();
    expect(res.success).toBe(true);
    expect(res.result).toBeDefined();
    const purgeResult = res.result as Record<string, unknown>;
    expect(purgeResult.purged_contacts_90d).toBe(5);
    expect(purgeResult.purged_access_logs_180d).toBe(42);
  });
});

