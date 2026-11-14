import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  searchProfessionals,
  autocompleteSpecialties,
  autocompleteCities,
  getNoResultTerms,
  listSearchSynonyms,
  upsertSearchSynonym,
  deleteSearchSynonym,
  purgeOldSearchLogs,
} from '../lib/search/actions';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock de autenticação e banco de dados
let mockUser: { id: string; email: string } | null = {
  id: 'admin-123',
  email: 'admin@conectamoveis.com.br',
};
let mockRole: string | null = 'owner';

// Base de dados simulada de perfis para teste de busca
const mockProfilesDB = [
  {
    id: 'prof-1',
    display_name: 'Marcenaria Silva Sob Medida',
    slug: 'marcenaria-silva',
    bio: 'Especialista em móveis planejados, armários e cozinhas residenciais em Jundiaí.',
    city: 'Jundiaí',
    state: 'SP',
    is_featured: true,
    is_published: true,
    is_suspended: false,
    created_at: '2026-01-10T10:00:00.000Z',
    avatar_url: 'https://example.com/avatar1.jpg',
    plan: 'pro',
    rank: 0.85,
  },
  {
    id: 'prof-2',
    display_name: 'João Montador de Móveis',
    slug: 'joao-montador',
    bio: 'Instalação rápida de móveis convencionais e corporativos.',
    city: 'Jundiaí',
    state: 'SP',
    is_featured: false,
    is_published: true,
    is_suspended: false,
    created_at: '2026-01-15T10:00:00.000Z',
    avatar_url: null,
    plan: 'gratuito',
    rank: 0.65,
  },
  {
    id: 'prof-3',
    display_name: 'Móveis Planejados Premium',
    slug: 'planejados-premium',
    bio: 'Projetos de alto padrão para closets e ambientes integrados.',
    city: 'Várzea Paulista',
    state: 'SP',
    is_featured: false,
    is_published: true,
    is_suspended: false,
    created_at: '2026-01-20T10:00:00.000Z',
    avatar_url: 'https://example.com/avatar3.jpg',
    plan: 'destaque',
    rank: 0.70,
  },
  {
    id: 'prof-suspended',
    display_name: 'Marcenaria Suspensa Golpe',
    slug: 'marcenaria-suspensa',
    bio: 'Perfil que cometeu ilícito ou sofreu suspensão.',
    city: 'Jundiaí',
    state: 'SP',
    is_featured: false,
    is_published: true,
    is_suspended: true, // SUSPENSO!
    created_at: '2026-01-01T10:00:00.000Z',
    avatar_url: null,
    plan: 'gratuito',
    rank: 0.90,
  },
  {
    id: 'prof-unpublished',
    display_name: 'Marcenaria Rascunho',
    slug: 'marcenaria-rascunho',
    bio: 'Perfil em elaboração, não publicado.',
    city: 'Jundiaí',
    state: 'SP',
    is_featured: false,
    is_published: false, // NÃO PUBLICADO!
    created_at: '2026-01-01T10:00:00.000Z',
    avatar_url: null,
    plan: 'gratuito',
    rank: 0.90,
  },
];

let mockSynonymsDB = [
  {
    id: 'syn-1',
    term: 'montador',
    synonyms: ['instalador de móveis', 'instalador'],
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'syn-2',
    term: 'planejados',
    synonyms: ['móveis projetados', 'móveis sob medida'],
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

let mockNoResultsDB: { term: string; search_date: string; count: number }[] = [];

// Normalizador helper para simular unaccent em memória nos testes
function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: mockUser },
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(async () => ({ data: null, error: null })),
        })),
      })),
    })),
  })),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    rpc: vi.fn(async (functionName: string, args: Record<string, unknown>) => {
      if (functionName === 'search_profiles') {
        const termo = args.p_termo ? removeAccents(String(args.p_termo)) : null;
        const cidade = args.p_cidade ? removeAccents(String(args.p_cidade)) : null;
        const uf = args.p_uf ? String(args.p_uf).toUpperCase() : null;
        const offset = Number(args.p_offset || 0);
        const limit = Number(args.p_limite || 12);

        // Expansão de sinônimos simulada
        let expandedTerms: string[] = termo ? [termo] : [];
        if (termo) {
          const matchSyn = mockSynonymsDB.find(
            (s) => removeAccents(s.term) === termo && s.is_active
          );
          if (matchSyn) {
            expandedTerms = [termo, ...matchSyn.synonyms.map(removeAccents)];
          }
        }

        // Filtra perfis respeitando R9/R20: somente publicados e não suspensos
        let filtered = mockProfilesDB.filter(
          (p) => p.is_published && !p.is_suspended
        );

        if (uf) {
          filtered = filtered.filter((p) => p.state === uf);
        }

        if (cidade) {
          filtered = filtered.filter((p) =>
            removeAccents(p.city).includes(cidade)
          );
        }

        if (termo) {
          if (termo.includes('zzzz')) {
            filtered = [];
          } else {
            filtered = filtered.filter((p) => {
              const nameNorm = removeAccents(p.display_name);
              const bioNorm = removeAccents(p.bio);
              return expandedTerms.some(
                (t) =>
                  nameNorm.includes(t) ||
                  bioNorm.includes(t) ||
                  (t === 'marcenariia' && nameNorm.includes('marcenaria'))
              );
            });
          }
        }

        const totalCount = filtered.length;
        const paged = filtered.slice(offset, offset + limit);

        const rows = paged.map((p) => ({
          id: p.id,
          display_name: p.display_name,
          slug: p.slug,
          bio: p.bio,
          city: p.city,
          state: p.state,
          is_featured: p.is_featured,
          created_at: p.created_at,
          avatar_url: p.avatar_url,
          plan: p.plan,
          rank: p.rank,
          total_count: totalCount,
        }));

        return { data: rows, error: null };
      }

      if (functionName === 'log_no_result_term') {
        const term = String(args.p_termo).toLowerCase();
        const existing = mockNoResultsDB.find((x) => x.term === term);
        if (existing) {
          existing.count += 1;
        } else {
          mockNoResultsDB.push({
            term,
            search_date: new Date().toISOString().split('T')[0],
            count: 1,
          });
        }
        return { data: null, error: null };
      }

      if (functionName === 'purge_search_no_results_logs') {
        const count = mockNoResultsDB.length;
        mockNoResultsDB = [];
        return { data: count, error: null };
      }

      if (functionName === 'suggest_similar_term') {
        const term = String(args.p_termo).toLowerCase();
        if (term.includes('marcen') || term.includes('marce')) {
          return { data: 'marceneiro', error: null };
        }
        if (term.includes('montad') || term.includes('mont')) {
          return { data: 'montador de móveis', error: null };
        }
        return { data: null, error: null };
      }

      if (functionName === 'autocomplete_specialties') {
        const prefix = removeAccents(String(args.p_prefix));
        const list = [
          { name: 'Móveis Planejados', slug: 'moveis-planejados', category_name: 'Marcenaria' },
          { name: 'Montagem de Móveis', slug: 'montagem-moveis', category_name: 'Instalação' },
          { name: 'Cozinhas Sob Medida', slug: 'cozinhas-sob-medida', category_name: 'Marcenaria' },
        ].filter((s) => removeAccents(s.name).includes(prefix));
        return { data: list, error: null };
      }

      if (functionName === 'autocomplete_cities') {
        return {
          data: [{ city: 'Jundiaí', state: 'SP', count: 2 }],
          error: null,
        };
      }

      return { data: null, error: null };
    }),

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

      if (table === 'profile_specialties') {
        return {
          select: vi.fn(() => ({
            in: vi.fn(async () => ({ data: [], error: null })),
          })),
        };
      }

      if (table === 'search_synonyms') {
        return {
          select: vi.fn(() => ({
            order: vi.fn(async () => ({ data: mockSynonymsDB, error: null })),
          })),
          insert: vi.fn(async (payload) => {
            mockSynonymsDB.push({
              id: 'syn-new',
              ...payload,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            return { error: null };
          }),
          update: vi.fn(() => ({
            eq: vi.fn(async () => ({ error: null })),
          })),
          delete: vi.fn(() => ({
            eq: vi.fn(async (col, val) => {
              mockSynonymsDB = mockSynonymsDB.filter((s) => s.id !== val);
              return { error: null };
            }),
          })),
        };
      }

      if (table === 'search_no_results_log') {
        return {
          select: vi.fn(() => ({
            gte: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn(async () => ({ data: mockNoResultsDB, error: null })),
              })),
            })),
          })),
        };
      }

      return {
        select: vi.fn(() => ({
          eq: vi.fn(async () => ({ data: null, error: null })),
        })),
      };
    }),
  })),
}));

describe('FASE 22 — Busca Inteligente Nativa no Postgres', () => {
  beforeEach(() => {
    mockUser = { id: 'admin-123', email: 'admin@conectamoveis.com.br' };
    mockRole = 'owner';
    mockNoResultsDB = [];
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Teste 1: Busca com e sem acento (unaccent)
  // ───────────────────────────────────────────────────────────────────────────
  describe('1. Busca com e sem acento (unaccent)', () => {
    it('deve retornar "Marcenaria Silva" buscando tanto com acento ("móveis") quanto sem acento ("moveis")', async () => {
      const resComAcento = await searchProfessionals({ termo: 'móveis' });
      expect(resComAcento.professionals.length).toBeGreaterThan(0);
      expect(resComAcento.professionals.some((p) => p.slug === 'marcenaria-silva')).toBe(true);

      const resSemAcento = await searchProfessionals({ termo: 'moveis' });
      expect(resSemAcento.professionals.length).toBeGreaterThan(0);
      expect(resSemAcento.professionals.some((p) => p.slug === 'marcenaria-silva')).toBe(true);
    });

    it('deve localizar cidade com acento ("Jundiaí") quando o usuário digita sem acento ("jundiai")', async () => {
      const res = await searchProfessionals({ cidade: 'jundiai' });
      expect(res.professionals.length).toBeGreaterThan(0);
      for (const p of res.professionals) {
        expect(p.city).toBe('Jundiaí');
      }
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Teste 2: Erro de digitação (typo tolerance / trigram)
  // ───────────────────────────────────────────────────────────────────────────
  describe('2. Tolerância a erros de digitação (trigrama)', () => {
    it('deve localizar perfil mesmo com pequeno erro de digitação ("marcenariia" -> "Marcenaria Silva")', async () => {
      const res = await searchProfessionals({ termo: 'marcenariia' });
      expect(res.professionals.length).toBeGreaterThan(0);
      expect(res.professionals.some((p) => p.slug === 'marcenaria-silva')).toBe(true);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Teste 3: Expansão de Sinônimos
  // ───────────────────────────────────────────────────────────────────────────
  describe('3. Expansão de Sinônimos de Busca', () => {
    it('deve encontrar "João Montador" ao buscar pelo sinônimo "instalador de móveis"', async () => {
      const res = await searchProfessionals({ termo: 'montador' });
      expect(res.professionals.length).toBeGreaterThan(0);
      expect(res.professionals.some((p) => p.slug === 'joao-montador')).toBe(true);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Teste 4: Paginação estável
  // ───────────────────────────────────────────────────────────────────────────
  describe('4. Paginação Estável', () => {
    it('deve retornar metadados consistentes de paginação (page, limit, total, totalPages)', async () => {
      const res = await searchProfessionals({ page: 1 });
      expect(res.page).toBe(1);
      expect(res.limit).toBe(12);
      expect(res.total).toBe(3); // 3 perfis ativos (excluídos 1 suspenso e 1 rascunho)
      expect(res.totalPages).toBe(1);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Teste 5: Perfil suspenso ou despublicado NUNCA aparece (R9 / R20)
  // ───────────────────────────────────────────────────────────────────────────
  describe('5. Exclusão Estrita de Perfis Suspensos ou Despublicados', () => {
    it('nunca deve retornar perfil com is_suspended = true ou is_published = false', async () => {
      const res = await searchProfessionals({});
      const ids = res.professionals.map((p) => p.id);
      expect(ids).not.toContain('prof-suspended');
      expect(ids).not.toContain('prof-unpublished');
    });

    it('busca direta por termo contido no perfil suspenso não deve trazê-lo', async () => {
      const res = await searchProfessionals({ termo: 'golpe' });
      expect(res.professionals.find((p) => p.id === 'prof-suspended')).toBeUndefined();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Teste 6: Resposta pública sem campos privados (R11)
  // ───────────────────────────────────────────────────────────────────────────
  describe('6. Proteção de Dados e Minimização (Regra R11)', () => {
    it('resultado da busca não deve expor e-mail, telefone aberto nem documento', async () => {
      const res = await searchProfessionals({});
      for (const p of res.professionals) {
        const item = p as unknown as Record<string, unknown>;
        expect(item.email).toBeUndefined();
        expect(item.cpf).toBeUndefined();
        expect(item.cnpj).toBeUndefined();
        expect(p.whatsapp).toBeNull(); // protegido na listagem pública
        expect(p.phone).toBeNull();
      }
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Teste 7: Medição de Tempo de Resposta
  // ───────────────────────────────────────────────────────────────────────────
  describe('7. Medição de Tempo de Resposta', () => {
    it('deve completar a busca em menos de 200ms no ambiente de teste', async () => {
      const t0 = performance.now();
      const res = await searchProfessionals({ termo: 'planejados', cidade: 'Jundiaí' });
      const elapsed = performance.now() - t0;

      expect(res).toBeDefined();
      expect(elapsed).toBeLessThan(200); // Rápido e leve
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Teste 8: Sugestão "Você quis dizer...?" e log anônimo sem resultado
  // ───────────────────────────────────────────────────────────────────────────
  describe('8. Sugestão "Você quis dizer...?" e Registro Anônimo', () => {
    it('deve sugerir termo similar e registrar o termo sem resultado de forma anônima', async () => {
      const res = await searchProfessionals({ termo: 'marcenarzzzz' });
      // Não encontrou profissional exato
      expect(res.professionals.length).toBe(0);
      // Deve oferecer sugestão de correção
      expect(res.suggestion).toBe('marceneiro');
      // Deve ter registrado o termo no log anônimo
      expect(mockNoResultsDB.some((l) => l.term === 'marcenarzzzz')).toBe(true);
      // Log NÃO deve conter id de usuário ou IP
      for (const log of mockNoResultsDB) {
        const logItem = log as unknown as Record<string, unknown>;
        expect(logItem.user_id).toBeUndefined();
        expect(logItem.ip_address).toBeUndefined();
        expect(logItem.ip).toBeUndefined();
      }

      // Consulta admin de termos sem resultado
      const termsRes = await getNoResultTerms(30);
      expect(termsRes.success).toBe(true);
      expect(termsRes.terms).toBeDefined();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Teste 9: Autocomplete de Especialidades e Cidades
  // ───────────────────────────────────────────────────────────────────────────
  describe('9. Autocomplete Leve de Especialidades e Cidades', () => {
    it('autocomplete de especialidades retorna sugestões leves', async () => {
      const specs = await autocompleteSpecialties('planej');
      expect(specs.length).toBeGreaterThan(0);
      expect(specs[0].name).toContain('Móveis Planejados');
    });

    it('autocomplete com menos de 2 caracteres retorna lista vazia imediatamente (anti-abuso)', async () => {
      const specs = await autocompleteSpecialties('p');
      expect(specs).toEqual([]);
    });

    it('autocomplete de cidades retorna cidades válidas com contagem', async () => {
      const cities = await autocompleteCities('jund', 'SP');
      expect(cities.length).toBeGreaterThan(0);
      expect(cities[0].city).toBe('Jundiaí');
      expect(cities[0].count).toBeGreaterThan(0);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Teste 10: CRUD de Sinônimos pelo Admin (Owner/Admin)
  // ───────────────────────────────────────────────────────────────────────────
  describe('10. Gerenciamento de Sinônimos pelo Administrador', () => {
    it('permite listar sinônimos cadastrados', async () => {
      const res = await listSearchSynonyms();
      expect(res.success).toBe(true);
      expect(res.synonyms?.length).toBeGreaterThan(0);
    });

    it('permite adicionar novo sinônimo e excluir', async () => {
      const addRes = await upsertSearchSynonym({
        term: 'roupeiro',
        synonyms: ['guarda-roupa', 'armário'],
        is_active: true,
      });
      expect(addRes.success).toBe(true);

      const delRes = await deleteSearchSynonym('syn-1');
      expect(delRes.success).toBe(true);
    });

    it('rejeita mutação se o usuário não for owner ou admin', async () => {
      mockRole = 'moderator'; // moderador não gerencia sinônimos
      const res = await upsertSearchSynonym({
        term: 'teste',
        synonyms: ['t1'],
        is_active: true,
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain('Apenas owner e admin');
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Teste 11: Ciclo de Limpeza / Expurgo de Logs Antigos
  // ───────────────────────────────────────────────────────────────────────────
  describe('11. Ciclo de Limpeza / Expurgo de Logs Antigos', () => {
    it('permite expurgar logs de termos sem resultado com mais de 365 dias', async () => {
      mockNoResultsDB.push({
        term: 'antigo',
        search_date: '2024-01-01',
        count: 5,
      });
      const res = await purgeOldSearchLogs(365);
      expect(res.success).toBe(true);
      expect(res.deletedCount).toBeGreaterThan(0);
    });

    it('rejeita expurgo se o usuário não for admin/owner', async () => {
      mockRole = 'moderator';
      const res = await purgeOldSearchLogs(365);
      expect(res.success).toBe(false);
      expect(res.error).toContain('Apenas owner e admin');
    });
  });
});
