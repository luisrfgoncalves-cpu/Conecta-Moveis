/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  searchProfessionals,
  getPublicProfessionalBySlug,
  getPublicCompanyBySlug,
} from '@/lib/search/actions';
import { CATEGORIES_CATALOG } from '@/lib/profile/schemas';

// Mock do Supabase Server Client
vi.mock('@/lib/supabase/server', () => {
  return {
    createClient: vi.fn(),
  };
});

import { createClient } from '@/lib/supabase/server';

describe('FASE 6 — Descoberta, Categorias, Busca e Perfil Público', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. Validação do catálogo de categorias e especialidades
  describe('Catálogo de Categorias e Especialidades (Seed Real)', () => {
    it('deve conter as 6 categorias obrigatórias com slugs válidos', () => {
      const expectedSlugs = [
        'montador-de-moveis',
        'marceneiro',
        'loja-de-planejados',
        'marcenaria',
        'projetista',
        'parceiros-complementares',
      ];
      const slugs = CATEGORIES_CATALOG.map((c) => c.slug);
      for (const s of expectedSlugs) {
        expect(slugs).toContain(s);
      }
    });

    it('deve conter as 8 especialidades obrigatórias de parceiros complementares', () => {
      const parceiros = CATEGORIES_CATALOG.find((c) => c.slug === 'parceiros-complementares');
      expect(parceiros).toBeDefined();

      const requiredPartnerSlugs = [
        'eletricista-led',
        'instalador-esquadrias',
        'vidraceiro',
        'serralheiro',
        'transportador',
        'medidor-tecnico',
        'reparador',
        'instalador-acessorios',
      ];

      const partnerSpecialties = parceiros!.specialties.map((s) => s.slug);
      for (const req of requiredPartnerSlugs) {
        expect(partnerSpecialties).toContain(req);
      }
    });
  });

  // 2. Busca e Paginação
  describe('Busca de Profissionais e Paginação', () => {
    it('deve aplicar paginação de exatamente 12 itens por página', async () => {
      const mockQueryBuilder: any = {
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockImplementation((from, to) => {
          expect(from).toBe(0);
          expect(to).toBe(11); // 12 itens (0 a 11)
          return Promise.resolve({
            data: [],
            count: 25,
            error: null,
          });
        }),
      };

      (createClient as any).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQueryBuilder),
      });

      const res = await searchProfessionals({ page: 1 });
      expect(res.limit).toBe(12);
      expect(res.page).toBe(1);
      expect(res.total).toBe(25);
      expect(res.totalPages).toBe(3); // ceil(25 / 12) = 3
    });

    it('deve calcular range correto para a página 2', async () => {
      const mockQueryBuilder: any = {
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockImplementation((from, to) => {
          expect(from).toBe(12);
          expect(to).toBe(23); // 12 itens (12 a 23)
          return Promise.resolve({
            data: [],
            count: 30,
            error: null,
          });
        }),
      };

      (createClient as any).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQueryBuilder),
      });

      const res = await searchProfessionals({ page: 2 });
      expect(res.page).toBe(2);
      expect(res.totalPages).toBe(3);
    });

    it('deve filtrar por cidade e UF', async () => {
      const mockQueryBuilder: any = {
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'prof-1',
              display_name: 'Carlos Montador',
              slug: 'carlos-montador',
              city: 'Jundiaí',
              state: 'SP',
              is_featured: false,
              created_at: new Date().toISOString(),
            },
          ],
          count: 1,
          error: null,
        }),
      };

      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'public_professionals') return mockQueryBuilder;
          if (table === 'profile_specialties') {
            return {
              select: vi.fn().mockReturnThis(),
              in: vi.fn().mockResolvedValue({ data: [] }),
            };
          }
          return mockQueryBuilder;
        }),
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      const res = await searchProfessionals({ cidade: 'Jundiaí', uf: 'SP' });

      expect(mockQueryBuilder.ilike).toHaveBeenCalledWith('city', '%Jundiaí%');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('state', 'SP');
      expect(res.professionals.length).toBe(1);
      expect(res.professionals[0].city).toBe('Jundiaí');
    });

    it('deve tratar busca vazia retornando array vazio e total 0', async () => {
      const mockQueryBuilder: any = {
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: [],
          count: 0,
          error: null,
        }),
      };

      (createClient as any).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQueryBuilder),
      });

      const res = await searchProfessionals({ termo: 'TermoInexistente9999' });
      expect(res.professionals).toEqual([]);
      expect(res.total).toBe(0);
      expect(res.totalPages).toBe(0);
    });
  });

  // 3. Segurança e Privacidade de Dados
  describe('Segurança e Isolamento de Dados Privados', () => {
    it('a resposta da busca deve ler exclusivamente a view pública sem campos privados', async () => {
      const mockPublicRecord = {
        id: '0d10eb12-81c5-409e-b488-d0735fe9af83',
        display_name: 'Marcenaria Silva',
        slug: 'marcenaria-silva',
        bio: 'Oficina especializada em móveis sob medida.',
        city: 'Jundiaí',
        state: 'SP',
        whatsapp: '11999998888',
        phone: null,
        is_featured: false,
        created_at: new Date().toISOString(),
        avatar_url: null,
        company_name: null,
        company_slug: null,
      };

      const mockQueryBuilder: any = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: [mockPublicRecord],
          count: 1,
          error: null,
        }),
      };

      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          // A consulta principal OBRIGATORIAMENTE consulta a view public_professionals
          if (table === 'public_professionals') return mockQueryBuilder;
          if (table === 'profile_specialties') {
            return {
              select: vi.fn().mockReturnThis(),
              in: vi.fn().mockResolvedValue({ data: [] }),
            };
          }
          return mockQueryBuilder;
        }),
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      const res = await searchProfessionals({});

      expect(mockSupabase.from).toHaveBeenCalledWith('public_professionals');

      const item = res.professionals[0] as any;
      expect(item).toBeDefined();

      // NENHUM campo privado pode existir no objeto público
      expect(item.email).toBeUndefined();
      expect(item.user_id).toBeUndefined();
      expect(item.cpf).toBeUndefined();
      expect(item.rg).toBeUndefined();
      expect(item.address).toBeUndefined();
      expect(item.street).toBeUndefined();
      expect(item.postal_code).toBeUndefined();
      expect(item.internal_notes).toBeUndefined();
      expect(item.stripe_customer_id).toBeUndefined();
      expect(item.is_suspended).toBeUndefined();
      expect(item.is_published).toBeUndefined();
    });
  });

  // 4. Perfil Público e 404
  describe('Páginas Públicas de Perfil (/profissionais/[slug] e /empresas/[slug])', () => {
    it('deve retornar null (404) quando o slug do profissional não existir', async () => {
      const mockQueryBuilder: any = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      };

      (createClient as any).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQueryBuilder),
      });

      const result = await getPublicProfessionalBySlug('slug-inexistente');
      expect(result).toBeNull();
    });

    it('deve retornar null para empresa inexistente ou não publicada', async () => {
      const mockQueryBuilder: any = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      };

      (createClient as any).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQueryBuilder),
      });

      const result = await getPublicCompanyBySlug('empresa-nao-publicada');
      expect(result).toBeNull();
    });

    it('deve carregar dados públicos do perfil quando o slug existir', async () => {
      const mockProfile = {
        id: 'prof-123',
        display_name: 'Roberto Projetista',
        slug: 'roberto-projetista',
        bio: 'Projetos 3D completos em Promob.',
        city: 'Jundiaí',
        state: 'SP',
        whatsapp: '11988887777',
        phone: null,
        is_featured: true,
        created_at: new Date().toISOString(),
        avatar_url: 'https://example.com/avatar.webp',
        company_name: 'Studio Design',
        company_slug: 'studio-design',
      };

      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'public_professionals') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
            };
          }
          if (table === 'profile_specialties') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockResolvedValue({
                data: [
                  { specialties: { id: 'spec-1', name: 'Projeto 3D / Promob', slug: 'projeto-promob' } },
                ],
              }),
            };
          }
          if (table === 'service_regions') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockResolvedValue({
                data: [{ city: 'Jundiaí', state: 'SP', neighborhood: 'Centro' }],
              }),
            };
          }
          if (table === 'portfolio_items') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
            };
          }
          return {};
        }),
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      const result = await getPublicProfessionalBySlug('roberto-projetista');
      expect(result).not.toBeNull();
      expect(result?.display_name).toBe('Roberto Projetista');
      expect(result?.specialties?.length).toBe(1);
      expect(result?.specialties?.[0].name).toBe('Projeto 3D / Promob');
      expect(result?.service_regions?.length).toBe(1);
    });
  });
});
