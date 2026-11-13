/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getAdminUserRole, recordAdminLog } from '@/lib/admin/actions';

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export interface UserEntitlements {
  userId: string;
  planId: string;
  planName: string;
  maxPhotos: number;
  maxCategories: number;
  canFeature: boolean;
  hasStats: boolean;
}

export interface PlanItem {
  id: string;
  name: string;
  description: string | null;
  max_photos: number;
  max_categories: number;
  allow_featured: boolean;
  price_cents: number;
  is_active: boolean;
}

export interface UserSubscriptionSummary {
  planId: string;
  planName: string;
  status: string;
  billingMode: 'off' | 'test';
  entitlements: UserEntitlements;
  usage: {
    photosCount: number;
    categoriesCount: number;
    isFeatured: boolean;
  };
}

export interface ProfessionalMetrics {
  profileViews: number;
  whatsappClicks: number;
  contactRequests: number;
}

/**
 * 1. getEntitlements - Fonte única de verdade de limites do usuário
 */
export async function getEntitlements(userId: string): Promise<UserEntitlements> {
  const admin = getAdminClient();

  // 1.1 Buscar assinatura ativa
  const { data: sub } = await admin
    .from('subscriptions')
    .select('plan_id, status, plans ( id, name, max_photos, max_categories, allow_featured )')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  const plan = (sub?.plans as any) || null;
  const planId = plan?.id || 'free';
  const planName = plan?.name || 'Gratuito';

  // 1.2 Buscar entitlements específicos do usuário
  const { data: ent } = await admin
    .from('entitlements')
    .select('max_photos, max_categories, can_feature')
    .eq('user_id', userId)
    .maybeSingle();

  if (ent) {
    return {
      userId,
      planId,
      planName,
      maxPhotos: ent.max_photos ?? 6,
      maxCategories: ent.max_categories ?? 2,
      canFeature: !!ent.can_feature,
      hasStats: planId !== 'free',
    };
  }

  // 1.3 Se não existir linha de entitlements, buscar do plano base ou padrão free
  const defaultMaxPhotos = plan?.max_photos ?? 6;
  const defaultMaxCategories = plan?.max_categories ?? 2;
  const defaultCanFeature = plan?.allow_featured ?? false;

  // Registrar entitlements padrão
  await admin.from('entitlements').upsert({
    user_id: userId,
    max_photos: defaultMaxPhotos,
    max_categories: defaultMaxCategories,
    can_feature: defaultCanFeature,
  });

  return {
    userId,
    planId,
    planName,
    maxPhotos: defaultMaxPhotos,
    maxCategories: defaultMaxCategories,
    canFeature: defaultCanFeature,
    hasStats: planId !== 'free',
  };
}

/**
 * 2. getPlansCatalog - Lista planos ativos do catálogo
 */
export async function getPlansCatalog(): Promise<PlanItem[]> {
  const admin = getAdminClient();
  const { data: plans } = await admin
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .order('max_photos', { ascending: true });

  return (plans as PlanItem[]) || [];
}

/**
 * 3. getUserSubscriptionDetails - Resumo completo para o /painel/assinatura
 */
export async function getUserSubscriptionDetails(): Promise<UserSubscriptionSummary | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const admin = getAdminClient();
  const entitlements = await getEntitlements(user.id);
  const billingMode = (process.env.BILLING_MODE === 'test' ? 'test' : 'off') as 'off' | 'test';

  // Buscar contagem de fotos utilizadas
  const { data: items } = await admin
    .from('portfolio_items')
    .select('id, portfolio_images ( id )')
    .eq('user_id', user.id);

  let photosCount = 0;
  for (const item of items || []) {
    photosCount += (item.portfolio_images || []).length;
  }

  // Buscar perfil profissional e categorias ativas
  const { data: prof } = await admin
    .from('professional_profiles')
    .select('id, is_featured, profile_specialties ( specialty_id, specialties ( category_id ) )')
    .eq('user_id', user.id)
    .maybeSingle();

  const isFeatured = !!prof?.is_featured;
  const categoryIds = new Set<string>();
  if (prof?.profile_specialties) {
    for (const ps of prof.profile_specialties as any[]) {
      if (ps.specialties?.category_id) {
        categoryIds.add(ps.specialties.category_id);
      }
    }
  }

  return {
    planId: entitlements.planId,
    planName: entitlements.planName,
    status: 'active',
    billingMode,
    entitlements,
    usage: {
      photosCount,
      categoriesCount: categoryIds.size,
      isFeatured,
    },
  };
}

/**
 * 4. registerPlanInterest - Manifestar interesse em um plano (BILLING_MODE = 'off')
 */
export async function registerPlanInterest(
  planId: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Usuário não autenticado.' };
  }

  const admin = getAdminClient();
  const { error } = await admin.from('plan_interest').insert({
    user_id: user.id,
    plan_id: planId,
    notes: notes || 'Interesse registrado via /planos ou /painel/assinatura',
  });

  if (error) {
    return { success: false, error: 'Não foi possível registrar o interesse no momento.' };
  }

  return { success: true };
}

/**
 * 5. changePlanTestMode - Troca de plano controlada em modo de teste (BILLING_MODE = 'test')
 */
export async function changePlanTestMode(
  targetPlanId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Usuário não autenticado.' };
  }

  const billingMode = process.env.BILLING_MODE;
  if (billingMode !== 'test') {
    return {
      success: false,
      error:
        'A alteração de planos está desativada no momento. Por favor, registre seu interesse no plano desejado.',
    };
  }

  const admin = getAdminClient();

  // Buscar dados do plano alvo
  const { data: targetPlan } = await admin
    .from('plans')
    .select('*')
    .eq('id', targetPlanId)
    .single();

  if (!targetPlan) {
    return { success: false, error: 'Plano selecionado inválido.' };
  }

  // 5.1 Atualizar ou inserir subscrição
  const { data: existingSub } = await admin
    .from('subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (existingSub) {
    await admin
      .from('subscriptions')
      .update({
        plan_id: targetPlanId,
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingSub.id);
  } else {
    await admin.from('subscriptions').insert({
      user_id: user.id,
      plan_id: targetPlanId,
      status: 'active',
    });
  }

  // 5.2 Atualizar entitlements do usuário conforme os limites do novo plano
  await admin.from('entitlements').upsert({
    user_id: user.id,
    max_photos: targetPlan.max_photos,
    max_categories: targetPlan.max_categories,
    can_feature: targetPlan.allow_featured,
    updated_at: new Date().toISOString(),
  });

  // 5.3 Se o plano permitir destaque, ativar flag no perfil profissional para teste
  await admin
    .from('professional_profiles')
    .update({
      is_featured: targetPlan.allow_featured,
    })
    .eq('user_id', user.id);

  return { success: true };
}

/**
 * 6. getProfessionalMetrics - Estatísticas agregadas de daily_metrics
 */
export async function getProfessionalMetrics(
  profileId: string
): Promise<ProfessionalMetrics> {
  const admin = getAdminClient();

  // Buscar cliques de whatsapp e visualizações de perfil nos últimos 90 dias
  const { data: metrics } = await admin
    .from('daily_metrics')
    .select('metric_name, counter')
    .eq('dimension', profileId);

  let profileViews = 0;
  let whatsappClicks = 0;

  for (const row of metrics || []) {
    if (row.metric_name === 'profile_view') {
      profileViews += Number(row.counter || 0);
    } else if (row.metric_name === 'whatsapp_click') {
      whatsappClicks += Number(row.counter || 0);
    }
  }

  // Buscar solicitações de contato registradas para este perfil
  const { count: contactRequests } = await admin
    .from('contact_requests')
    .select('id', { count: 'exact', head: true })
    .eq('professional_id', profileId);

  return {
    profileViews,
    whatsappClicks,
    contactRequests: contactRequests || 0,
  };
}

/**
 * 7. trackProfileView - Incrementa visualização diária agregada de um perfil
 */
export async function trackProfileView(profileId: string): Promise<void> {
  try {
    const admin = getAdminClient();
    const today = new Date().toISOString().slice(0, 10);
    await admin.from('daily_metrics').upsert(
      {
        date: today,
        metric_name: 'profile_view',
        dimension: profileId,
        counter: 1,
      },
      {
        onConflict: 'date,metric_name,dimension',
        ignoreDuplicates: false,
      }
    );
  } catch {
    // Falha silenciosa para métricas não bloqueantes
  }
}

/**
 * 8. adminUpdatePlanLimits - Atualização de plano pelo administrador com justificativa
 */
export async function adminUpdatePlanLimits(params: {
  planId: string;
  maxPhotos: number;
  maxCategories: number;
  allowFeatured: boolean;
  description?: string;
  reason: string;
}): Promise<{ success: boolean; error?: string }> {
  const { user, role } = await getAdminUserRole();
  if (!user || role !== 'admin') {
    return { success: false, error: 'Apenas administradores podem alterar configurações de planos.' };
  }

  if (!params.reason || !params.reason.trim()) {
    return { success: false, error: 'O motivo da alteração de plano é estritamente obrigatório.' };
  }

  const admin = getAdminClient();

  // Obter valor anterior para log
  const { data: previousPlan } = await admin
    .from('plans')
    .select('*')
    .eq('id', params.planId)
    .single();

  if (!previousPlan) {
    return { success: false, error: 'Plano não encontrado.' };
  }

  const updatePayload = {
    max_photos: Number(params.maxPhotos),
    max_categories: Number(params.maxCategories),
    allow_featured: Boolean(params.allowFeatured),
    description: params.description ?? previousPlan.description,
  };

  const { error: updateError } = await admin
    .from('plans')
    .update(updatePayload)
    .eq('id', params.planId);

  if (updateError) {
    return { success: false, error: 'Erro ao atualizar plano no banco de dados.' };
  }

  // Registrar auditoria
  await recordAdminLog({
    adminId: user.id,
    action: 'UPDATE_PLAN_LIMITS',
    targetTable: 'plans',
    targetId: params.planId,
    reason: params.reason.trim(),
    oldValue: previousPlan,
    newValue: updatePayload,
  });

  return { success: true };
}
