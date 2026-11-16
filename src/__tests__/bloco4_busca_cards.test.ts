import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerAlertRequest } from '@/lib/alerts/actions';

// Mock do supabase
const mockInsert = vi.fn();
const mockFrom = vi.fn(() => ({
  insert: mockInsert,
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: mockFrom,
  })),
}));

describe('Bloco 4 — Alertas e Busca (Avise-me)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejeita requisição de alerta com e-mail inválido', async () => {
    const res = await registerAlertRequest({
      email: 'invalid-email',
      cidade: 'Jundiaí',
      categoria: 'montador',
      consentimento: true,
    });
    expect(res.success).toBe(false);
    expect(res.error).toBe('E-mail inválido.');
  });

  it('rejeita requisição sem consentimento explícito LGPD', async () => {
    const res = await registerAlertRequest({
      email: 'teste@email.com',
      cidade: 'Jundiaí',
      categoria: 'montador',
      consentimento: false,
    });
    expect(res.success).toBe(false);
    expect(res.error).toBe('É necessário aceitar o uso do e-mail.');
  });

  it('registra com sucesso quando e-mail e consentimento são válidos', async () => {
    mockInsert.mockResolvedValueOnce({ error: null });

    const res = await registerAlertRequest({
      email: 'user@email.com',
      cidade: 'Jundiaí',
      categoria: 'montador',
      consentimento: true,
    });

    expect(res.success).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith('alert_requests');
    expect(mockInsert).toHaveBeenCalledWith({
      email: 'user@email.com',
      cidade: 'Jundiaí',
      categoria: 'montador',
      consentimento: true,
    });
  });

  it('trata duplicatas silenciosamente sem quebrar para o usuário', async () => {
    mockInsert.mockResolvedValueOnce({ error: { code: '23505' } });

    const res = await registerAlertRequest({
      email: 'duplicado@email.com',
      cidade: 'Jundiaí',
      categoria: 'montador',
      consentimento: true,
    });

    expect(res.success).toBe(true);
  });
});
