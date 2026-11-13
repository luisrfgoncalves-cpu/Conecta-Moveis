/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { reviewSchema, reviewReplySchema, type ReviewInput, type ReviewReplyInput } from './schemas';
import { analyzeReviewRisk } from './risk-filter';

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export interface ReviewItem {
  id: string;
  contact_request_id: string;
  rating_quality: number;
  rating_punctuality: number;
  rating_communication: number;
  rating_organization: number;
  rating_overall: number; // rating_commitment
  average_rating: number;
  comment?: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'removed';
  reply_text?: string | null;
  reply_at?: string | null;
  created_at: string;
  reviewer: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  professional?: {
    id: string;
    display_name: string;
    slug: string;
  };
}

export interface ReviewStats {
  totalCount: number;
  averageOverall: number;
  criteriaAverages: {
    quality: number;
    punctuality: number;
    communication: number;
    organization: number;
    commitment: number;
  };
}

/**
 * 1. Verifica elegibilidade para avaliar:
 * - Usuário logado
 * - Solicitação de contato com o perfil registrada há pelo menos 3 dias (72h)
 * - Não é autoavaliação
 * - Não são da mesma empresa
 * - Não avaliou esta solicitação antes
 */
export async function checkReviewEligibility(profileId: string): Promise<{
  eligible: boolean;
  contactRequestId?: string;
  reason?: string;
  daysRemaining?: number;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { eligible: false, reason: 'Você precisa estar logado para avaliar.' };
  }

  // 1. Verificar se o perfil profissional pertence ao próprio usuário (autoavaliação)
  const { data: targetProfile } = await supabase
    .from('professional_profiles')
    .select('id, user_id, company_id')
    .eq('id', profileId)
    .single();

  if (!targetProfile) {
    return { eligible: false, reason: 'Profissional não encontrado.' };
  }

  if (targetProfile.user_id === user.id) {
    return { eligible: false, reason: 'Você não pode avaliar seu próprio perfil.' };
  }

  // 2. Verificar contas da mesma empresa
  if (targetProfile.company_id) {
    const { data: myMember } = await supabase
      .from('company_members')
      .select('id')
      .eq('company_id', targetProfile.company_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (myMember) {
      return { eligible: false, reason: 'Não é permitida avaliação entre contas da mesma empresa.' };
    }
  }

  // 3. Buscar solicitações de contato feitas pelo usuário para este perfil
  const { data: requests } = await supabase
    .from('contact_requests')
    .select('id, created_at')
    .eq('sender_id', user.id)
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });

  if (!requests || requests.length === 0) {
    return {
      eligible: false,
      reason: 'Elegibilidade: É necessário ter uma solicitação de contato registrada com este profissional.',
    };
  }

  // 4. Verificar se alguma solicitação tem mais de 3 dias (72 horas)
  const now = new Date().getTime();
  const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

  for (const req of requests) {
    const reqTime = new Date(req.created_at).getTime();
    const elapsed = now - reqTime;

    if (elapsed < THREE_DAYS_MS) {
      const remainingHours = Math.ceil((THREE_DAYS_MS - elapsed) / (1000 * 60 * 60));
      return {
        eligible: false,
        reason: `A avaliação só é liberada 3 dias após a solicitação de contato. Aguarde mais ${remainingHours}h.`,
        daysRemaining: Math.ceil(remainingHours / 24),
      };
    }

    // Verificar se já foi avaliada
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('contact_request_id', req.id)
      .maybeSingle();

    if (!existingReview) {
      // Encontrou solicitação elegível há mais de 3 dias e sem avaliação!
      return {
        eligible: true,
        contactRequestId: req.id,
      };
    }
  }

  return {
    eligible: false,
    reason: 'Você já avaliou todas as solicitações de contato registradas para este profissional.',
  };
}

/**
 * 2. Criar avaliação:
 * - Validação Zod
 * - Filtro de termos de risco -> se tiver termo de risco, status = 'pending' e gera moderation_events
 * - Caso contrário, status = 'approved' (publicada)
 */
export async function createReview(input: ReviewInput): Promise<{
  success: boolean;
  status?: string;
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Você precisa estar logado para avaliar.' };
  }

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // Buscar solicitação de contato correspondente
  const { data: request } = await supabase
    .from('contact_requests')
    .select('id, sender_id, profile_id, created_at')
    .eq('id', parsed.data.contactRequestId)
    .single();

  if (!request) {
    return { success: false, error: 'Solicitação de contato não encontrada.' };
  }

  if (request.sender_id !== user.id) {
    return { success: false, error: 'Permissão negada. Você não é o autor desta solicitação.' };
  }

  // Conferir regra dos 3 dias
  const elapsed = Date.now() - new Date(request.created_at).getTime();
  if (elapsed < 3 * 24 * 60 * 60 * 1000) {
    return { success: false, error: 'A avaliação só pode ser enviada após 3 dias da interação inicial.' };
  }

  // Bloquear duplicidade
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('contact_request_id', request.id)
    .maybeSingle();

  if (existing) {
    return { success: false, error: 'Esta solicitação de contato já foi avaliada.' };
  }

  // Analisar termos de risco no comentário
  const riskAnalysis = analyzeReviewRisk(parsed.data.comment);
  const status = riskAnalysis.hasRiskTerms ? 'pending' : 'approved';

  const admin = getAdminClient();

  const { data: newReview, error: insertErr } = await admin
    .from('reviews')
    .insert({
      contact_request_id: request.id,
      reviewer_id: user.id,
      profile_id: request.profile_id,
      rating_quality: parsed.data.ratingQuality,
      rating_punctuality: parsed.data.ratingPunctuality,
      rating_communication: parsed.data.ratingCommunication,
      rating_organization: parsed.data.ratingOrganization,
      rating_overall: parsed.data.ratingCommitment,
      comment: parsed.data.comment?.trim() || null,
      status: status,
    })
    .select('id')
    .single();

  if (insertErr || !newReview) {
    return { success: false, error: 'Erro ao registrar avaliação.' };
  }

  // Se caiu na moderação, registrar moderation_events
  if (riskAnalysis.hasRiskTerms) {
    await admin.from('moderation_events').insert({
      target_type: 'review',
      target_id: newReview.id,
      action: 'flagged_risk_terms',
      notes: `Termos detectados: ${riskAnalysis.detectedTerms.join(', ')}`,
    });
  }

  return {
    success: true,
    status: status,
  };
}

/**
 * 3. Obter estatísticas e avaliações públicas aprovadas de um perfil
 */
export async function getProfileReviews(profileId: string): Promise<{
  reviews: ReviewItem[];
  stats: ReviewStats;
}> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('reviews')
    .select(`
      id,
      contact_request_id,
      rating_quality,
      rating_punctuality,
      rating_communication,
      rating_organization,
      rating_overall,
      comment,
      status,
      reply_text,
      reply_at,
      created_at,
      profiles!reviewer_id (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('profile_id', profileId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  const rawList = data || [];
  const count = rawList.length;

  if (count === 0) {
    return {
      reviews: [],
      stats: {
        totalCount: 0,
        averageOverall: 0,
        criteriaAverages: { quality: 0, punctuality: 0, communication: 0, organization: 0, commitment: 0 },
      },
    };
  }

  let sumQuality = 0;
  let sumPunctuality = 0;
  let sumCommunication = 0;
  let sumOrganization = 0;
  let sumCommitment = 0;
  let sumAll = 0;

  const reviews: ReviewItem[] = rawList.map((r: any) => {
    sumQuality += r.rating_quality;
    sumPunctuality += r.rating_punctuality;
    sumCommunication += r.rating_communication;
    sumOrganization += r.rating_organization;
    sumCommitment += r.rating_overall;

    const avgOne = (
      r.rating_quality +
      r.rating_punctuality +
      r.rating_communication +
      r.rating_organization +
      r.rating_overall
    ) / 5;

    sumAll += avgOne;

    return {
      id: r.id,
      contact_request_id: r.contact_request_id,
      rating_quality: r.rating_quality,
      rating_punctuality: r.rating_punctuality,
      rating_communication: r.rating_communication,
      rating_organization: r.rating_organization,
      rating_overall: r.rating_overall,
      average_rating: Number(avgOne.toFixed(1)),
      comment: r.comment,
      status: r.status,
      reply_text: r.reply_text,
      reply_at: r.reply_at,
      created_at: r.created_at,
      reviewer: r.profiles,
    };
  });

  return {
    reviews,
    stats: {
      totalCount: count,
      averageOverall: Number((sumAll / count).toFixed(1)),
      criteriaAverages: {
        quality: Number((sumQuality / count).toFixed(1)),
        punctuality: Number((sumPunctuality / count).toFixed(1)),
        communication: Number((sumCommunication / count).toFixed(1)),
        organization: Number((sumOrganization / count).toFixed(1)),
        commitment: Number((sumCommitment / count).toFixed(1)),
      },
    },
  };
}

/**
 * 4. Resposta do profissional:
 * - Uma única resposta
 * - Somente pelo dono do perfil
 * - Registra moderation_events
 */
export async function replyToReview(input: ReviewReplyInput): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Não autenticado.' };
  }

  const parsed = reviewReplySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // Buscar avaliação e checar se o usuário logado é o profissional dono do perfil
  const { data: review } = await supabase
    .from('reviews')
    .select(`
      id,
      profile_id,
      reply_text,
      professional_profiles!profile_id (
        user_id
      )
    `)
    .eq('id', parsed.data.reviewId)
    .single();

  if (!review) {
    return { success: false, error: 'Avaliação não encontrada.' };
  }

  const ownerUserId = (review.professional_profiles as any)?.user_id;
  if (ownerUserId !== user.id) {
    return { success: false, error: 'Apenas o profissional avaliado pode responder.' };
  }

  if (review.reply_text) {
    return { success: false, error: 'Esta avaliação já foi respondida. O direito de resposta é de uma manifestação.' };
  }

  const admin = getAdminClient();
  const now = new Date().toISOString();

  const { error: updateErr } = await admin
    .from('reviews')
    .update({
      reply_text: parsed.data.replyText.trim(),
      reply_at: now,
    })
    .eq('id', parsed.data.reviewId);

  if (updateErr) {
    return { success: false, error: 'Erro ao salvar resposta.' };
  }

  // Registrar em moderation_events
  await admin.from('moderation_events').insert({
    target_type: 'review',
    target_id: parsed.data.reviewId,
    action: 'professional_replied',
    notes: `Resposta enviada pelo profissional titular em ${now}`,
  });

  return { success: true };
}

/**
 * 5. Obter avaliações para a página /painel/avaliacoes
 * - Aba "Recebidas" (se o usuário for profissional)
 * - Aba "Feitas por mim" (como cliente)
 */
export async function getMyReviewsData(): Promise<{
  received: ReviewItem[];
  given: ReviewItem[];
  isProfessional: boolean;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { received: [], given: [], isProfessional: false };

  // 1. Verificar se usuário tem perfil profissional
  const { data: profile } = await supabase
    .from('professional_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  let received: ReviewItem[] = [];

  if (profile) {
    const { data: recData } = await supabase
      .from('reviews')
      .select(`
        id,
        contact_request_id,
        rating_quality,
        rating_punctuality,
        rating_communication,
        rating_organization,
        rating_overall,
        comment,
        status,
        reply_text,
        reply_at,
        created_at,
        profiles!reviewer_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false });

    received = (recData || []).map((r: any) => ({
      ...r,
      average_rating: Number(
        (
          (r.rating_quality +
            r.rating_punctuality +
            r.rating_communication +
            r.rating_organization +
            r.rating_overall) /
          5
        ).toFixed(1)
      ),
      reviewer: r.profiles,
    }));
  }

  // 2. Avaliações feitas pelo usuário
  const { data: givenData } = await supabase
    .from('reviews')
    .select(`
      id,
      contact_request_id,
      rating_quality,
      rating_punctuality,
      rating_communication,
      rating_organization,
      rating_overall,
      comment,
      status,
      reply_text,
      reply_at,
      created_at,
      professional_profiles!profile_id (
        id,
        display_name,
        slug
      )
    `)
    .eq('reviewer_id', user.id)
    .order('created_at', { ascending: false });

  const given: ReviewItem[] = (givenData || []).map((r: any) => ({
    ...r,
    average_rating: Number(
      (
        (r.rating_quality +
          r.rating_punctuality +
          r.rating_communication +
          r.rating_organization +
          r.rating_overall) /
        5
      ).toFixed(1)
    ),
    reviewer: { id: user.id, full_name: 'Você' },
    professional: r.professional_profiles,
  }));

  return {
    received,
    given,
    isProfessional: !!profile,
  };
}

