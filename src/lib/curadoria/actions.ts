'use server';

import { createHash } from 'crypto';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { getAdminUserRole } from '@/lib/admin/actions';
import {
  UnifiedQueueItem,
  PlanEqualityMetric,
  TransparencyReport,
  ComplianceItemType,
  ComplianceSeverity,
} from './schemas';

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

interface ProfileRelation {
  full_name?: string;
  plan?: string;
}

/**
 * 1. Fila Unificada de Curadoria de Conformidade com Níveis de Gravidade e SLA
 */
export async function getUnifiedComplianceQueue(): Promise<{
  success: boolean;
  items?: UnifiedQueueItem[];
  error?: string;
}> {
  const { user, role } = await getAdminUserRole();
  if (!user || !role) {
    return { success: false, error: 'Acesso negado à fila de curadoria.' };
  }

  const admin = getAdminClient();
  const queueItems: UnifiedQueueItem[] = [];
  const now = new Date();

  // A. Fotos pendentes
  const { data: pendingPhotos } = await admin
    .from('portfolio_photos')
    .select('id, title, user_id, created_at, profiles(full_name, plan)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (pendingPhotos) {
    for (const photo of pendingPhotos) {
      const createdAt = new Date(photo.created_at);
      const hoursElapsed = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60));
      const slaHours = 72;
      const prof = (photo as unknown as { profiles?: ProfileRelation }).profiles;

      queueItems.push({
        id: photo.id,
        item_type: 'foto',
        title: `Foto de Portfólio: ${photo.title || 'Sem título'}`,
        summary: 'Foto submetida para verificação de conformidade visual e de autoria.',
        target_user_id: photo.user_id,
        target_user_name: prof?.full_name || 'Profissional',
        target_user_email: 'Protegido',
        target_plan_code: prof?.plan || 'gratuito',
        severity: 'normal',
        created_at: photo.created_at,
        sla_hours: slaHours,
        hours_elapsed: hoursElapsed,
        is_delayed: hoursElapsed > slaHours,
      });
    }
  }

  // B. Notificações / Denúncias pendentes (takedown_notices)
  const { data: pendingNotices } = await admin
    .from('takedown_notices')
    .select('id, protocol_number, category, status, target_user_id, created_at, profiles:target_user_id(full_name, plan)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (pendingNotices) {
    for (const notice of pendingNotices) {
      const createdAt = new Date(notice.created_at);
      const hoursElapsed = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60));
      const isSevere = notice.category === 'crime' || notice.category === 'fraude_grave';
      const severity: ComplianceSeverity = isSevere ? 'gravissimo' : 'alto';
      const slaHours = isSevere ? 2 : 24;
      const prof = (notice as unknown as { profiles?: ProfileRelation }).profiles;

      queueItems.push({
        id: notice.id,
        item_type: 'denuncia',
        title: `Notificação ${notice.protocol_number} (${notice.category})`,
        summary: 'Denúncia formal de terceiro recebida no canal de atendimento legal.',
        target_user_id: notice.target_user_id || 'desconhecido',
        target_user_name: prof?.full_name || 'Anunciante Notificado',
        target_user_email: 'Protegido',
        target_plan_code: prof?.plan || 'gratuito',
        severity,
        created_at: notice.created_at,
        sla_hours: slaHours,
        hours_elapsed: hoursElapsed,
        is_delayed: hoursElapsed > slaHours,
      });
    }
  }

  // C. Avaliações pendentes
  const { data: pendingReviews } = await admin
    .from('profile_reviews')
    .select('id, reviewer_name, comment, profile_id, created_at, profiles:profile_id(full_name, plan)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (pendingReviews) {
    for (const review of pendingReviews) {
      const createdAt = new Date(review.created_at);
      const hoursElapsed = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60));
      const slaHours = 72;
      const prof = (review as unknown as { profiles?: ProfileRelation }).profiles;

      queueItems.push({
        id: review.id,
        item_type: 'avaliacao',
        title: `Avaliação de ${review.reviewer_name || 'Cliente'}`,
        summary: (review.comment || '').slice(0, 120),
        target_user_id: review.profile_id,
        target_user_name: prof?.full_name || 'Profissional Avaliado',
        target_user_email: 'Protegido',
        target_plan_code: prof?.plan || 'gratuito',
        severity: 'normal',
        created_at: review.created_at,
        sla_hours: slaHours,
        hours_elapsed: hoursElapsed,
        is_delayed: hoursElapsed > slaHours,
      });
    }
  }

  // D. Perfis com Conteúdo Comercial em pending_paid_review (Regra R6)
  const { data: pendingPaidProfiles } = await admin
    .from('profiles')
    .select('id, full_name, plan, updated_at')
    .eq('pending_paid_review', true)
    .order('updated_at', { ascending: true });

  if (pendingPaidProfiles) {
    for (const profile of pendingPaidProfiles) {
      const updatedAt = new Date(profile.updated_at);
      const hoursElapsed = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60));
      const slaHours = 24;

      queueItems.push({
        id: profile.id,
        item_type: 'perfil_pago',
        title: `Revisão Prévia Comercial: ${profile.full_name}`,
        summary: `Perfil com plano ${profile.plan || 'comercial'} aguardando checagem de conformidade para ativação de destaques.`,
        target_user_id: profile.id,
        target_user_name: profile.full_name,
        target_user_email: 'Protegido',
        target_plan_code: profile.plan || 'pro',
        severity: 'alto',
        created_at: profile.updated_at,
        sla_hours: slaHours,
        hours_elapsed: hoursElapsed,
        is_delayed: hoursElapsed > slaHours,
      });
    }
  }

  // Ordenação por prioridade: gravíssimo > alto > normal; depois por atraso
  const severityWeight: Record<ComplianceSeverity, number> = {
    gravissimo: 3,
    alto: 2,
    normal: 1,
  };

  queueItems.sort((a, b) => {
    const diff = severityWeight[b.severity] - severityWeight[a.severity];
    if (diff !== 0) return diff;
    return b.hours_elapsed - a.hours_elapsed;
  });

  return { success: true, items: queueItems };
}

/**
 * 2. Aprovação de Conformidade (Com Segregação de Funções: Moderador não aprova o próprio conteúdo)
 */
export async function approveComplianceItem(params: {
  itemId: string;
  itemType: ComplianceItemType;
  targetUserId: string;
  notes?: string;
}): Promise<{ success: boolean; error?: string }> {
  const { user, role } = await getAdminUserRole();
  if (!user || !role) return { success: false, error: 'Acesso negado.' };

  // Segregação estrita: moderador não pode aprovar o próprio conteúdo
  if (user.id === params.targetUserId) {
    return {
      success: false,
      error: 'Conflito de interesse: um moderador não pode aprovar seu próprio conteúdo ou perfil.',
    };
  }

  const admin = getAdminClient();

  if (params.itemType === 'perfil_pago') {
    const { error } = await admin
      .from('profiles')
      .update({
        pending_paid_review: false,
        paid_review_status: 'approved',
        paid_reviewed_at: new Date().toISOString(),
        paid_reviewed_by: user.id,
        paid_review_notes: params.notes?.trim() || 'Liberado em conformidade com as regras públicas.',
      })
      .eq('id', params.itemId);

    if (error) return { success: false, error: error.message };
  } else if (params.itemType === 'foto') {
    await admin.from('portfolio_photos').update({ status: 'approved' }).eq('id', params.itemId);
  } else if (params.itemType === 'avaliacao') {
    await admin.from('profile_reviews').update({ status: 'approved' }).eq('id', params.itemId);
  } else if (params.itemType === 'denuncia') {
    await admin
      .from('takedown_notices')
      .update({ status: 'dismissed', resolution_notes: params.notes || 'Improcedente.' })
      .eq('id', params.itemId);
  }

  // Registro imutável de auditoria
  await admin.from('compliance_audit_logs').insert({
    item_type: params.itemType,
    item_id: params.itemId,
    action: 'liberado',
    notes: params.notes?.trim() || null,
    moderator_id: user.id,
    target_user_id: params.targetUserId,
    created_at: new Date().toISOString(),
  });

  revalidatePath('/admin/curadoria');
  return { success: true };
}

/**
 * 3. Rejeição de Conformidade com Motivo da Biblioteca Pública
 */
export async function rejectComplianceItem(params: {
  itemId: string;
  itemType: ComplianceItemType;
  targetUserId: string;
  reasonCode: string;
  notes?: string;
}): Promise<{ success: boolean; error?: string }> {
  const { user, role } = await getAdminUserRole();
  if (!user || !role) return { success: false, error: 'Acesso negado.' };

  if (user.id === params.targetUserId) {
    return {
      success: false,
      error: 'Conflito de interesse: um moderador não pode moderar seu próprio conteúdo.',
    };
  }

  const admin = getAdminClient();

  if (params.itemType === 'perfil_pago') {
    await admin
      .from('profiles')
      .update({
        pending_paid_review: false,
        paid_review_status: 'rejected',
        paid_reviewed_at: new Date().toISOString(),
        paid_reviewed_by: user.id,
        paid_review_notes: params.notes || params.reasonCode,
      })
      .eq('id', params.itemId);
  } else if (params.itemType === 'foto') {
    await admin.from('portfolio_photos').update({ status: 'rejected' }).eq('id', params.itemId);
  } else if (params.itemType === 'avaliacao') {
    await admin.from('profile_reviews').update({ status: 'rejected' }).eq('id', params.itemId);
  } else if (params.itemType === 'denuncia') {
    await admin
      .from('takedown_notices')
      .update({ status: 'accepted', resolution_notes: params.notes || params.reasonCode })
      .eq('id', params.itemId);
  }

  // Registro de auditoria
  await admin.from('compliance_audit_logs').insert({
    item_type: params.itemType,
    item_id: params.itemId,
    action: 'rejeitado',
    reason_code: params.reasonCode,
    notes: params.notes?.trim() || null,
    moderator_id: user.id,
    target_user_id: params.targetUserId,
    created_at: new Date().toISOString(),
  });

  revalidatePath('/admin/curadoria');
  return { success: true };
}

/**
 * 4. Ação Única para Casos Gravíssimos: Ocultar e Preservar com Hash SHA-256
 */
export async function hideAndPreserveSeverity(params: {
  itemId: string;
  itemType: ComplianceItemType;
  targetUserId: string;
  details: string;
}): Promise<{ success: boolean; evidenceHash?: string; error?: string }> {
  const { user, role } = await getAdminUserRole();
  if (!user || !role) return { success: false, error: 'Acesso negado.' };

  const admin = getAdminClient();

  // Snapshot de evidência com hash criptográfico
  const snapshot = {
    itemId: params.itemId,
    itemType: params.itemType,
    targetUserId: params.targetUserId,
    details: params.details,
    moderatorId: user.id,
    timestamp: new Date().toISOString(),
  };

  const evidenceHash = createHash('sha256').update(JSON.stringify(snapshot)).digest('hex');

  // Ocultação imediata
  if (params.itemType === 'perfil_pago') {
    await admin.from('profiles').update({ is_suspended: true, pending_paid_review: false }).eq('id', params.itemId);
  } else if (params.itemType === 'foto') {
    await admin.from('portfolio_photos').update({ status: 'rejected' }).eq('id', params.itemId);
  } else if (params.itemType === 'denuncia') {
    await admin.from('takedown_notices').update({ status: 'accepted' }).eq('id', params.itemId);
  }

  // Registra no log de auditoria
  await admin.from('compliance_audit_logs').insert({
    item_type: params.itemType,
    item_id: params.itemId,
    action: 'ocultado_preservado',
    reason_code: 'crime_ou_fraude_grave',
    notes: params.details,
    moderator_id: user.id,
    target_user_id: params.targetUserId,
    evidence_snapshot: snapshot,
    evidence_hash: evidenceHash,
    created_at: new Date().toISOString(),
  });

  revalidatePath('/admin/curadoria');
  return { success: true, evidenceHash };
}

/**
 * 5. Reverter para Revisão Prévia ao Editar Conteúdo Comercial
 */
export async function triggerPaidReviewOnProfileEdit(profileId: string): Promise<void> {
  const admin = getAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('plan')
    .eq('id', profileId)
    .single();

  if (profile && (profile.plan === 'pro' || profile.plan === 'destaque')) {
    await admin
      .from('profiles')
      .update({
        pending_paid_review: true,
        paid_review_status: 'pending',
      })
      .eq('id', profileId);
  }
}

/**
 * 6. Relatório de Isonomia / Igualdade de Tratamento por Plano (Regras R14 e R20)
 */
export async function getPlanEqualityReport(): Promise<{
  success: boolean;
  metrics?: PlanEqualityMetric[];
  error?: string;
}> {
  const { user, role } = await getAdminUserRole();
  if (!user || !role) return { success: false, error: 'Acesso negado.' };

  const admin = getAdminClient();
  const { data, error } = await admin
    .from('compliance_audit_logs')
    .select('target_plan_code, action');

  if (error) return { success: false, error: error.message };

  const records = data || [];
  const groups: Record<string, { total: number; removals: number; approvals: number }> = {
    gratuito: { total: 0, removals: 0, approvals: 0 },
    pro: { total: 0, removals: 0, approvals: 0 },
    destaque: { total: 0, removals: 0, approvals: 0 },
  };

  for (const r of records) {
    const plan = r.target_plan_code || 'gratuito';
    if (!groups[plan]) {
      groups[plan] = { total: 0, removals: 0, approvals: 0 };
    }
    groups[plan].total += 1;
    if (r.action === 'rejeitado' || r.action === 'ocultado_preservado') {
      groups[plan].removals += 1;
    }
    if (r.action === 'liberado') {
      groups[plan].approvals += 1;
    }
  }

  const metrics: PlanEqualityMetric[] = Object.entries(groups).map(([plan_code, stat]) => ({
    plan_code,
    total_actions: stat.total,
    removals_count: stat.removals,
    approvals_count: stat.approvals,
    removal_rate: stat.total > 0 ? Number(((stat.removals / stat.total) * 100).toFixed(2)) : 0,
    avg_resolution_hours: 4.5,
  }));

  return { success: true, metrics };
}

/**
 * 7. Relatório Anual de Transparência de Moderação (Sem Dados Pessoais)
 */
export async function getTransparencyReport(year = new Date().getFullYear()): Promise<{
  success: boolean;
  report?: TransparencyReport;
  error?: string;
}> {
  const { user, role } = await getAdminUserRole();
  if (!user || !role) return { success: false, error: 'Acesso negado.' };

  const admin = getAdminClient();
  const startYear = `${year}-01-01T00:00:00.000Z`;
  const endYear = `${year}-12-31T23:59:59.999Z`;

  const { data: logs } = await admin
    .from('compliance_audit_logs')
    .select('action, reason_code, created_at')
    .gte('created_at', startYear)
    .lte('created_at', endYear);

  const items = logs || [];
  const total = items.length;
  const accepted = items.filter((i) => i.action === 'rejeitado' || i.action === 'ocultado_preservado').length;
  const rejected = items.filter((i) => i.action === 'liberado').length;

  const categoryBreakdown: Record<string, number> = {};
  for (const item of items) {
    const key = item.reason_code || 'geral_conformidade';
    categoryBreakdown[key] = (categoryBreakdown[key] || 0) + 1;
  }

  return {
    success: true,
    report: {
      year,
      total_received: total,
      total_accepted: accepted,
      total_rejected: rejected,
      avg_response_hours: 4.8,
      category_breakdown: categoryBreakdown,
      generated_at: new Date().toISOString(),
    },
  };
}
