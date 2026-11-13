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

function makeSupabaseMock(overrides: Record<string, unknown> = {}) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'client-user-uuid-000000000001' } },
        error: null,
      }),
    },
    from: vi.fn().mockImplementation((table: string) => {
      if (overrides[table]) return overrides[table];
      return {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    }),
  };
}

function makeAdminMock(overrides: Record<string, unknown> = {}) {
  return {
    from: vi.fn().mockImplementation((table: string) => {
      if (overrides[table]) return overrides[table];
      return {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'rev-created-uuid-0000000001' },
              error: null,
            }),
          }),
        }),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: {}, error: null }),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    }),
  };
}

describe('FASE 9 — Avaliações e Moderação de Conteúdo', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('Filtro de Termos de Risco (analyzeReviewRisk)', () => {
    it('detecta acusações criminais e termos ofensivos graves', async () => {
      const { analyzeReviewRisk } = await import('@/lib/reviews/risk-filter');

      const res1 = analyzeReviewRisk('Ele é um golpista e não entregou nada!');
      expect(res1.hasRiskTerms).toBe(true);
      expect(res1.detectedTerms).toContain('golpista');

      const res2 = analyzeReviewRisk('O serviço atrasou um pouco mas foi bem feito.');
      expect(res2.hasRiskTerms).toBe(false);
      expect(res2.detectedTerms).toHaveLength(0);

      const res3 = analyzeReviewRisk('Esse cara é um ladrao safado');
      expect(res3.hasRiskTerms).toBe(true);
    });

    it('detecta exposição indevida de CPF em comentários', async () => {
      const { analyzeReviewRisk } = await import('@/lib/reviews/risk-filter');
      const res = analyzeReviewRisk('Meu CPF é 123.456.789-00 favor checar.');
      expect(res.hasRiskTerms).toBe(true);
      expect(res.detectedTerms).toContain('cpf_exposto');
    });
  });

  describe('Regras de Elegibilidade (checkReviewEligibility)', () => {
    it('bloqueia autoavaliação (dono do perfil)', async () => {
      const { checkReviewEligibility } = await import('@/lib/reviews/actions');

      const currentUserId = 'client-user-uuid-000000000001';
      const profMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'prof-1', user_id: currentUserId, company_id: null },
          error: null,
        }),
      };

      (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
        makeSupabaseMock({ professional_profiles: profMock })
      );

      const res = await checkReviewEligibility('prof-1');
      expect(res.eligible).toBe(false);
      expect(res.reason).toMatch(/próprio perfil/i);
    });

    it('bloqueia avaliação entre membros da mesma empresa', async () => {
      const { checkReviewEligibility } = await import('@/lib/reviews/actions');

      const profMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'prof-1', user_id: 'other-user', company_id: 'comp-123' },
          error: null,
        }),
      };

      const memberMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: { id: 'member-1' }, // Pertence à mesma empresa!
          error: null,
        }),
      };

      (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
        makeSupabaseMock({
          professional_profiles: profMock,
          company_members: memberMock,
        })
      );

      const res = await checkReviewEligibility('prof-1');
      expect(res.eligible).toBe(false);
      expect(res.reason).toMatch(/mesma empresa/i);
    });

    it('bloqueia quem nunca enviou solicitação de contato', async () => {
      const { checkReviewEligibility } = await import('@/lib/reviews/actions');

      const profMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'prof-1', user_id: 'other-user', company_id: null },
          error: null,
        }),
      };

      const contactMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [], // Nenhuma solicitação
          error: null,
        }),
      };

      (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
        makeSupabaseMock({
          professional_profiles: profMock,
          contact_requests: contactMock,
        })
      );

      const res = await checkReviewEligibility('prof-1');
      expect(res.eligible).toBe(false);
      expect(res.reason).toMatch(/solicitação de contato/i);
    });

    it('bloqueia avaliação antes do prazo mínimo de 3 dias', async () => {
      const { checkReviewEligibility } = await import('@/lib/reviews/actions');

      const profMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'prof-1', user_id: 'other-user', company_id: null },
          error: null,
        }),
      };

      // Solicitação feita há apenas 1 dia (24h)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const contactMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [{ id: 'req-1', created_at: oneDayAgo }],
          error: null,
        }),
      };

      (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
        makeSupabaseMock({
          professional_profiles: profMock,
          contact_requests: contactMock,
        })
      );

      const res = await checkReviewEligibility('prof-1');
      expect(res.eligible).toBe(false);
      expect(res.reason).toMatch(/3 dias/i);
    });

    it('permite avaliação se solicitação tem mais de 3 dias e não foi avaliada', async () => {
      const { checkReviewEligibility } = await import('@/lib/reviews/actions');

      const profMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'prof-1', user_id: 'other-user', company_id: null },
          error: null,
        }),
      };

      // 4 dias atrás
      const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();
      const contactMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [{ id: 'req-1', created_at: fourDaysAgo }],
          error: null,
        }),
      };

      const reviewsMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
        makeSupabaseMock({
          professional_profiles: profMock,
          contact_requests: contactMock,
          reviews: reviewsMock,
        })
      );

      const res = await checkReviewEligibility('prof-1');
      expect(res.eligible).toBe(true);
      expect(res.contactRequestId).toBe('req-1');
    });
  });

  describe('Criação e Moderação de Avaliação (createReview)', () => {
    it('avaliação com termo de risco vai para a fila como pending', async () => {
      const { createReview } = await import('@/lib/reviews/actions');

      const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();
      const requestMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'c0000000-0000-0000-0000-000000000001',
            sender_id: 'client-user-uuid-000000000001',
            profile_id: 'p0000000-0000-0000-0000-000000000001',
            created_at: fourDaysAgo,
          },
          error: null,
        }),
      };

      (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
        makeSupabaseMock({
          contact_requests: requestMock,
          reviews: {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          },
        })
      );

      const adminMock = makeAdminMock();
      (createSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue(adminMock);

      const res = await createReview({
        contactRequestId: 'c0000000-0000-0000-0000-000000000001',
        ratingQuality: 1,
        ratingPunctuality: 1,
        ratingCommunication: 1,
        ratingOrganization: 1,
        ratingCommitment: 1,
        comment: 'Esse montador é um caloteiro!', // termo de risco
      });

      expect(res.success).toBe(true);
      expect(res.status).toBe('pending');
    });

    it('avaliação limpa é aprovada imediatamente', async () => {
      const { createReview } = await import('@/lib/reviews/actions');

      const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();
      const requestMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'c0000000-0000-0000-0000-000000000001',
            sender_id: 'client-user-uuid-000000000001',
            profile_id: 'p0000000-0000-0000-0000-000000000001',
            created_at: fourDaysAgo,
          },
          error: null,
        }),
      };

      (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
        makeSupabaseMock({
          contact_requests: requestMock,
          reviews: {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          },
        })
      );

      (createSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue(makeAdminMock());

      const res = await createReview({
        contactRequestId: 'c0000000-0000-0000-0000-000000000001',
        ratingQuality: 5,
        ratingPunctuality: 5,
        ratingCommunication: 5,
        ratingOrganization: 5,
        ratingCommitment: 5,
        comment: 'Excelente montagem da cozinha planejada, super recomendo!',
      });

      expect(res.success).toBe(true);
      expect(res.status).toBe('approved');
    });

    it('bloqueia duplicidade de avaliação para a mesma solicitação', async () => {
      const { createReview } = await import('@/lib/reviews/actions');

      const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();
      const requestMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'c0000000-0000-0000-0000-000000000001',
            sender_id: 'client-user-uuid-000000000001',
            profile_id: 'p0000000-0000-0000-0000-000000000001',
            created_at: fourDaysAgo,
          },
          error: null,
        }),
      };

      const reviewsMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: { id: 'rev-already-exists' }, // já avaliou!
          error: null,
        }),
      };

      (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
        makeSupabaseMock({
          contact_requests: requestMock,
          reviews: reviewsMock,
        })
      );

      const res = await createReview({
        contactRequestId: 'c0000000-0000-0000-0000-000000000001',
        ratingQuality: 5,
        ratingPunctuality: 5,
        ratingCommunication: 5,
        ratingOrganization: 5,
        ratingCommitment: 5,
      });

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/já foi avaliada/i);
    });
  });

  describe('Direito de Resposta (replyToReview)', () => {
    it('permite resposta apenas pelo dono do perfil avaliado', async () => {
      const { replyToReview } = await import('@/lib/reviews/actions');

      const currentUserId = 'client-user-uuid-000000000001';
      const reviewMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'r0000000-0000-0000-0000-000000000001',
            profile_id: 'prof-1',
            reply_text: null,
            professional_profiles: { user_id: 'other-owner-uuid' }, // Não é o usuário logado
          },
          error: null,
        }),
      };

      (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
        makeSupabaseMock({ reviews: reviewMock })
      );

      const res = await replyToReview({
        reviewId: 'a0000000-0000-0000-0000-000000000001',
        replyText: 'Muito obrigado pela preferência e confiança!',
      });

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/apenas o profissional/i);
    });

    it('bloqueia mais de uma resposta para a mesma avaliação', async () => {
      const { replyToReview } = await import('@/lib/reviews/actions');

      const currentUserId = 'client-user-uuid-000000000001';
      const reviewMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'a0000000-0000-0000-0000-000000000001',
            profile_id: 'prof-1',
            reply_text: 'Primeira resposta já enviada.', // Já tem resposta!
            professional_profiles: { user_id: currentUserId },
          },
          error: null,
        }),
      };

      (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
        makeSupabaseMock({ reviews: reviewMock })
      );

      const res = await replyToReview({
        reviewId: 'a0000000-0000-0000-0000-000000000001',
        replyText: 'Tentando responder uma segunda vez...',
      });

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/já foi respondida/i);
    });
  });

  describe('Cálculo Correto de Médias (getProfileReviews)', () => {
    it('calcula médias individuais e média geral corretamente', async () => {
      const { getProfileReviews } = await import('@/lib/reviews/actions');

      const reviewsMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'rev-1',
              contact_request_id: 'req-1',
              rating_quality: 5,
              rating_punctuality: 4,
              rating_communication: 5,
              rating_organization: 4,
              rating_overall: 5,
              comment: 'Ótimo',
              status: 'approved',
              reply_text: null,
              reply_at: null,
              created_at: new Date().toISOString(),
              profiles: { id: 'u1', full_name: 'Ana', avatar_url: null },
            },
            {
              id: 'rev-2',
              contact_request_id: 'req-2',
              rating_quality: 4,
              rating_punctuality: 4,
              rating_communication: 3,
              rating_organization: 4,
              rating_overall: 3,
              comment: 'Bom',
              status: 'approved',
              reply_text: null,
              reply_at: null,
              created_at: new Date().toISOString(),
              profiles: { id: 'u2', full_name: 'Bruno', avatar_url: null },
            },
          ],
          error: null,
        }),
      };

      (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
        makeSupabaseMock({ reviews: reviewsMock })
      );

      const { stats } = await getProfileReviews('prof-1');
      expect(stats.totalCount).toBe(2);
      expect(stats.criteriaAverages.quality).toBe(4.5);
      expect(stats.criteriaAverages.punctuality).toBe(4.0);
      expect(stats.criteriaAverages.communication).toBe(4.0);
      expect(stats.criteriaAverages.organization).toBe(4.0);
      expect(stats.criteriaAverages.commitment).toBe(4.0);
      // Média geral = (4.6 + 3.6) / 2 = 4.1
      expect(stats.averageOverall).toBe(4.1);
    });

    it('retorna contagem 0 e média 0 quando não houver avaliações publicadas', async () => {
      const { getProfileReviews } = await import('@/lib/reviews/actions');

      const reviewsMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
        makeSupabaseMock({ reviews: reviewsMock })
      );

      const { stats } = await getProfileReviews('prof-sem-reviews');
      expect(stats.totalCount).toBe(0);
      expect(stats.averageOverall).toBe(0);
    });
  });
});
