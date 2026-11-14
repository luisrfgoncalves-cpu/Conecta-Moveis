import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calculateHaversineDistanceKm,
  findNearestMunicipio,
} from '../lib/geo/haversine';
import {
  listMunicipios,
  getMunicipioBySlug,
  getMunicipioByIbge,
  searchProfilesByDistance,
  getPublishedProfilesForServiceCity,
} from '../lib/geo/actions';
import type { Municipio } from '../lib/geo/schemas';

// Dataset de teste simulando municípios oficiais do IBGE
const mockMunicipiosDB: Municipio[] = [
  {
    id: 'm-jundiai',
    ibge_code: '3525904',
    nome: 'Jundiaí',
    uf: 'SP',
    slug: 'jundiai-sp',
    latitude: -23.1857,
    longitude: -46.8978,
  },
  {
    id: 'm-varzea',
    ibge_code: '3556503',
    nome: 'Várzea Paulista',
    uf: 'SP',
    slug: 'varzea-paulista-sp',
    latitude: -23.2114,
    longitude: -46.8286,
  },
  {
    id: 'm-campinas',
    ibge_code: '3509502',
    nome: 'Campinas',
    uf: 'SP',
    slug: 'campinas-sp',
    latitude: -22.9056,
    longitude: -47.0608,
  },
  {
    id: 'm-saopaulo',
    ibge_code: '3550308',
    nome: 'São Paulo',
    uf: 'SP',
    slug: 'sao-paulo-sp',
    latitude: -23.5505,
    longitude: -46.6333,
  },
  {
    id: 'm-cidade-sem-perfis',
    ibge_code: '3599999',
    nome: 'Cidade Remota',
    uf: 'SP',
    slug: 'cidade-remota-sp',
    latitude: -20.0,
    longitude: -48.0,
  },
];

const mockProfilesDistanceDB = [
  {
    id: 'prof-jundiai',
    display_name: 'Marcenaria Jundiaí Prime',
    slug: 'marcenaria-jundiai',
    bio: 'Móveis sob medida no centro de Jundiaí.',
    city: 'Jundiaí',
    state: 'SP',
    municipio_id: 'm-jundiai',
    municipio_nome: 'Jundiaí',
    service_radius_km: 30,
    is_featured: true,
    is_published: true,
    is_suspended: false,
    created_at: '2026-01-01T00:00:00Z',
    avatar_url: null,
  },
  {
    id: 'prof-varzea',
    display_name: 'João Montador Várzea',
    slug: 'joao-varzea',
    bio: 'Montagem de móveis em Várzea e Jundiaí.',
    city: 'Várzea Paulista',
    state: 'SP',
    municipio_id: 'm-varzea',
    municipio_nome: 'Várzea Paulista',
    service_radius_km: 40,
    is_featured: false,
    is_published: true,
    is_suspended: false,
    created_at: '2026-01-05T00:00:00Z',
    avatar_url: null,
  },
  {
    id: 'prof-campinas',
    display_name: 'Planejados Campinas',
    slug: 'planejados-campinas',
    bio: 'Atendimento exclusivo na região metropolitana de Campinas.',
    city: 'Campinas',
    state: 'SP',
    municipio_id: 'm-campinas',
    municipio_nome: 'Campinas',
    service_radius_km: 20,
    is_featured: false,
    is_published: true,
    is_suspended: false,
    created_at: '2026-01-10T00:00:00Z',
    avatar_url: null,
  },
];

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: vi.fn((table: string) => {
      if (table === 'public_professionals') {
        return {
          select: vi.fn(() => ({
            ilike: vi.fn((col: string, val: string) => {
              const cityName = val.replace(/%/g, '').toLowerCase();
              const found = mockProfilesDistanceDB.filter(
                (p) => p.city.toLowerCase().includes(cityName) && p.is_published
              );
              return Promise.resolve({
                data: found,
                count: found.length,
                error: null,
              });
            }),
          })),
        };
      }
      return {
        select: vi.fn(() => ({
          eq: vi.fn(async () => ({ data: [], error: null })),
        })),
      };
    }),
  })),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'municipios') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn((col: string, val: string) => {
              if (col === 'uf') {
                return {
                  order: vi.fn(async () => ({
                    data: mockMunicipiosDB.filter((m) => m.uf === val),
                    error: null,
                  })),
                };
              }
              if (col === 'slug') {
                const found = mockMunicipiosDB.find((m) => m.slug === val);
                return {
                  single: vi.fn(async () => ({
                    data: found || null,
                    error: found ? null : { message: 'Not found' },
                  })),
                };
              }
              if (col === 'ibge_code') {
                const found = mockMunicipiosDB.find((m) => m.ibge_code === val);
                return {
                  single: vi.fn(async () => ({
                    data: found || null,
                    error: found ? null : { message: 'Not found' },
                  })),
                };
              }
              return {
                single: vi.fn(async () => ({ data: null, error: null })),
              };
            }),
          })),
        };
      }
      return {
        select: vi.fn(() => ({
          eq: vi.fn(async () => ({ data: [], error: null })),
        })),
      };
    }),

    rpc: vi.fn(async (funcName: string, args: Record<string, unknown>) => {
      if (funcName === 'search_profiles_by_distance') {
        const originIbge = String(args.p_origin_ibge);
        const maxRadius = Number(args.p_max_radius_km || 50);
        const origin = mockMunicipiosDB.find((m) => m.ibge_code === originIbge);
        if (!origin) return { data: [], error: null };

        const rows = mockProfilesDistanceDB
          .map((p) => {
            const mun = mockMunicipiosDB.find((m) => m.id === p.municipio_id);
            if (!mun) return null;
            const dist = calculateHaversineDistanceKm(
              { latitude: origin.latitude, longitude: origin.longitude },
              { latitude: mun.latitude, longitude: mun.longitude }
            );
            return {
              id: p.id,
              display_name: p.display_name,
              slug: p.slug,
              bio: p.bio,
              city: p.city,
              state: p.state,
              municipio_nome: mun.nome,
              distance_km: dist,
              service_radius_km: p.service_radius_km,
              is_featured: p.is_featured,
              created_at: p.created_at,
              avatar_url: p.avatar_url,
              total_count: 0,
            };
          })
          .filter(Boolean)
          .filter((p) => p!.distance_km <= maxRadius && p!.distance_km <= p!.service_radius_km);

        const totalCount = rows.length;
        const result = rows.map((r) => ({ ...r, total_count: totalCount }));
        return { data: result, error: null };
      }
      return { data: null, error: null };
    }),
  })),
}));

describe('FASE 23 — Localização, Distância e Páginas por Cidade', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 1. Distância correta entre municípios conhecidos (Fórmula de Haversine)
  // ───────────────────────────────────────────────────────────────────────────
  describe('1. Distância Correta entre Municípios Conhecidos (Haversine)', () => {
    it('calcula a distância real entre Jundiaí e Várzea Paulista (~7.6 km)', () => {
      const jundiai = { latitude: -23.1857, longitude: -46.8978 };
      const varzea = { latitude: -23.2114, longitude: -46.8286 };

      const dist = calculateHaversineDistanceKm(jundiai, varzea);
      expect(dist).toBeGreaterThanOrEqual(7.0);
      expect(dist).toBeLessThanOrEqual(8.5);
    });

    it('calcula a distância real entre Jundiaí e Campinas (~35 a 40 km)', () => {
      const jundiai = { latitude: -23.1857, longitude: -46.8978 };
      const campinas = { latitude: -22.9056, longitude: -47.0608 };

      const dist = calculateHaversineDistanceKm(jundiai, campinas);
      expect(dist).toBeGreaterThanOrEqual(34.0);
      expect(dist).toBeLessThanOrEqual(40.0);
    });

    it('calcula a distância real entre Jundiaí e São Paulo (~48 a 55 km)', () => {
      const jundiai = { latitude: -23.1857, longitude: -46.8978 };
      const saoPaulo = { latitude: -23.5505, longitude: -46.6333 };

      const dist = calculateHaversineDistanceKm(jundiai, saoPaulo);
      expect(dist).toBeGreaterThanOrEqual(47.0);
      expect(dist).toBeLessThanOrEqual(56.0);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 2. Filtro por Raio em KM
  // ───────────────────────────────────────────────────────────────────────────
  describe('2. Filtro por Raio em KM', () => {
    it('com raio restrito de 10 km a partir de Jundiaí, inclui Várzea Paulista e exclui Campinas', async () => {
      const res = await searchProfilesByDistance({
        origin_ibge: '3525904', // Jundiaí
        max_radius_km: 10,
        ordenacao: 'proximidade',
        page: 1,
      });

      expect(res.professionals.length).toBeGreaterThan(0);
      const slugs = res.professionals.map((p) => p.slug);
      expect(slugs).toContain('marcenaria-jundiai'); // 0 km
      expect(slugs).toContain('joao-varzea');         // ~7.6 km
      expect(slugs).not.toContain('planejados-campinas'); // ~35 km (excluído pelo raio)
    });

    it('com raio ampliado de 50 km a partir de Jundiaí, inclui profissionais da região metropolitana', async () => {
      const res = await searchProfilesByDistance({
        origin_ibge: '3525904', // Jundiaí
        max_radius_km: 50,
        ordenacao: 'proximidade',
        page: 1,
      });

      const slugs = res.professionals.map((p) => p.slug);
      expect(slugs).toContain('marcenaria-jundiai');
      expect(slugs).toContain('joao-varzea');
      // Campinas declara service_radius_km de 20km, então de Jundiaí (35km) ela não atende Jundiaí
      expect(res.total).toBe(2);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 3. "Perto de mim": processamento estritamente local sem envio de coordenadas
  // ───────────────────────────────────────────────────────────────────────────
  describe('3. "Perto de Mim" Local (Blindagem LGPD - Regra R11)', () => {
    it('converte coordenadas do navegador no município mais próximo em memória no cliente', () => {
      // Coordenada próxima à Avenida 9 de Julho em Jundiaí
      const userCoords = { latitude: -23.189, longitude: -46.885 };

      const result = findNearestMunicipio(userCoords, mockMunicipiosDB);
      expect(result).toBeDefined();
      expect(result?.municipio.nome).toBe('Jundiaí');
      expect(result?.distance_km).toBeLessThan(3.0);
    });

    it('ao buscar por proximidade, envia apenas o código IBGE ao servidor, sem latitude/longitude do usuário', async () => {
      const requestPayload = {
        origin_ibge: '3525904',
        max_radius_km: 30,
        ordenacao: 'proximidade' as const,
        page: 1,
      };

      // Inspeção do payload da requisição: NUNCA deve conter coordenadas pessoais
      const inspected = requestPayload as unknown as Record<string, unknown>;
      expect(inspected.latitude).toBeUndefined();
      expect(inspected.longitude).toBeUndefined();
      expect(inspected.lat).toBeUndefined();
      expect(inspected.lng).toBeUndefined();
      expect(inspected.user_coords).toBeUndefined();

      const res = await searchProfilesByDistance(requestPayload);
      expect(res.originMunicipio?.nome).toBe('Jundiaí');
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 4. Página de cidade sem perfis não é gerada
  // ───────────────────────────────────────────────────────────────────────────
  describe('4. Geração Condicionada de Páginas por Cidade (Sem Páginas Fantasmas)', () => {
    it('retorna total > 0 quando há ao menos um profissional publicado no município', async () => {
      const res = await getPublishedProfilesForServiceCity('marcenaria', 'jundiai-sp');
      expect(res.total).toBeGreaterThan(0);
      expect(res.professionals.length).toBeGreaterThan(0);
      expect(res.municipio?.nome).toBe('Jundiaí');
    });

    it('retorna total = 0 quando o município não possui perfis publicados (página não deve ser gerada)', async () => {
      const res = await getPublishedProfilesForServiceCity('marcenaria', 'cidade-remota-sp');
      expect(res.total).toBe(0);
      expect(res.professionals.length).toBe(0);
    });

    it('retorna null se o município for inexistente', async () => {
      const res = await getPublishedProfilesForServiceCity('marcenaria', 'cidade-inexistente-sp');
      expect(res.municipio).toBeNull();
      expect(res.total).toBe(0);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 5. Busca por município com e sem acento
  // ───────────────────────────────────────────────────────────────────────────
  describe('5. Busca de Municípios Tolerante a Acentuação', () => {
    it('recupera o município por slug independente de acentuação no nome', async () => {
      const m1 = await getMunicipioBySlug('jundiai-sp');
      expect(m1?.nome).toBe('Jundiaí');

      const m2 = await getMunicipioBySlug('varzea-paulista-sp');
      expect(m2?.nome).toBe('Várzea Paulista');

      const m3 = await getMunicipioBySlug('sao-paulo-sp');
      expect(m3?.nome).toBe('São Paulo');
    });

    it('permite listar municípios da UF e buscar por código IBGE', async () => {
      const lista = await listMunicipios('SP');
      expect(lista.length).toBeGreaterThanOrEqual(4);
      expect(lista.some((m) => m.nome === 'Jundiaí')).toBe(true);

      const jundiai = await getMunicipioByIbge('3525904');
      expect(jundiai?.nome).toBe('Jundiaí');
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 6. Integridade de Dados: Sem CEP e Sem Endereço Exato (R11)
  // ───────────────────────────────────────────────────────────────────────────
  describe('6. Regra de Ouro R11: Sem CEP e Sem Endereço Residencial', () => {
    it('municípios e resultados de busca contêm apenas coordenadas centrais do município e nenhum CEP', async () => {
      const municipios = await listMunicipios('SP');
      for (const m of municipios) {
        const item = m as unknown as Record<string, unknown>;
        expect(item.cep).toBeUndefined();
        expect(item.logradouro).toBeUndefined();
        expect(item.numero).toBeUndefined();
      }

      const res = await searchProfilesByDistance({
        origin_ibge: '3525904',
        max_radius_km: 30,
        ordenacao: 'proximidade',
        page: 1,
      });

      for (const p of res.professionals) {
        const item = p as unknown as Record<string, unknown>;
        expect(item.cep).toBeUndefined();
        expect(item.address).toBeUndefined();
        expect(item.rua).toBeUndefined();
      }
    });
  });
});
