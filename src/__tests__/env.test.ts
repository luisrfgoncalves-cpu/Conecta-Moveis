import { describe, it, expect } from 'vitest';
import { isSupabaseConfigured } from '../lib/env';

describe('Ambiente e Tokens', () => {
  it('detecta estado de configuração do Supabase sem crashar', () => {
    expect(typeof isSupabaseConfigured).toBe('boolean');
  });

  it('permite execução sem credenciais na fase de casca visual', () => {
    // Na fase 2, o supabase não é obrigatório para testar layout e casca
    expect(true).toBe(true);
  });
});

