/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { approvePortfolioImage, rejectPortfolioImage } from '@/lib/portfolio/actions';

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export type AdminRole = 'owner' | 'admin' | 'moderator' | 'support';

/**
 * 1. Verifica autenticação e papel do usuário (owner, admin, moderator ou support)
 */
export async function getAdminUserRole(): Promise<{
  user: { id: string; email: string } | null;
  role: AdminRole | null;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { user: null, role: null };

  const admin = getAdminClient();
  const { data: roleRow } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .in('role', ['owner', 'admin', 'moderator', 'support'])
    .maybeSingle();

  if (!roleRow) return { user: null, role: null };

  return {
    user: { id: user.id, email: user.email || '' },
    role: roleRow.role as AdminRole,
  };
}

/**
 * 2. Grava log de auditoria obrigatório em admin_logs
 */
export async function recordAdminLog(params: {
  adminId: string;
  action: string;
  targetTable: string;
  targetId: string;
  reason: string;
  oldValue?: any;
  newValue?: any;
}): Promise<void> {
  if (!params.reason || !params.reason.trim()) {
    throw new Error('O motivo da ação administrativa é estritamente obrigatório.');
  }

  const admin = getAdminClient();
  await admin.from('admin_logs').insert({
    admin_id: params.adminId,
    action: params.action,
    target_table: params.targetTable,
    target_id: params.targetId,
    reason: params.reason.trim(),
    old_value: params.oldValue ? sanitizeSensitiveData(params.oldValue) : null,
    new_value: params.newValue ? sanitizeSensitiveData(params.newValue) : null,
  });
}

function sanitizeSensitiveData(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  const clone = { ...obj };
  delete clone.password;
  delete clone.password_hash;
  delete clone.token;
  delete clone.refresh_token;
  delete clone.secret;
  return clone;
}

/**
 * 3. Ações sobre fotos pendentes (usa funções da Fase 7)
 */
export async function adminApprovePhoto(
  imageId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const { user, role } = await getAdminUserRole();
  if (!user || !role) return { success: false, error: 'Acesso negado.' };
  if (!reason || !reason.trim()) return { success: false, error: 'Motivo obrigatório.' };

  const admin = getAdminClient();
  const res = await approvePortfolioImage(imageId, admin);
  if (!res.success) return res;

  await recordAdminLog({
    adminId: user.id,
    action: 'approve_photo',
    targetTable: 'portfolio_images',
    targetId: imageId,
    reason,
    oldValue: { status: 'pending' },
    newValue: { status: 'approved' },
  });

  return { success: true };
}

export async function adminRejectPhoto(
  imageId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const { user, role } = await getAdminUserRole();
  if (!user || !role) return { success: false, error: 'Acesso negado.' };
  if (!reason || !reason.trim()) return { success: false, error: 'Motivo obrigatório.' };

  const admin = getAdminClient();
  const res = await rejectPortfolioImage(imageId, admin);
  if (!res.success) return res;

  await recordAdminLog({
    adminId: user.id,
    action: 'reject_photo',
    targetTable: 'portfolio_images',
    targetId: imageId,
    reason,
    oldValue: { status: 'pending' },
    newValue: { status: 'rejected' },
  });

  return { success: true };
}

/**
 * 4. Ações sobre perfis profissionais (suspender, desbloquear)
 */
export async function adminSuspendProfile(
  profileId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const { user, role } = await getAdminUserRole();
  if (!user || !role) return { success: false, error: 'Acesso negado.' };
  if (!reason || !reason.trim()) return { success: false, error: 'Motivo obrigatório.' };

  const admin = getAdminClient();

  const { data: current } = await admin
    .from('professional_profiles')
    .select('is_suspended, is_published')
    .eq('id', profileId)
    .single();

  const { error } = await admin
    .from('professional_profiles')
    .update({ is_suspended: true })
    .eq('id', profileId);

  if (error) return { success: false, error: 'Erro ao suspender perfil.' };

  await recordAdminLog({
    adminId: user.id,
    action: 'suspend_profile',
    targetTable: 'professional_profiles',
    targetId: profileId,
    reason,
    oldValue: current,
    newValue: { ...current, is_suspended: true },
  });

  return { success: true };
}

export async function adminUnsuspendProfile(
  profileId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const { user, role } = await getAdminUserRole();
  if (!user || !role) return { success: false, error: 'Acesso negado.' };
  if (!reason || !reason.trim()) return { success: false, error: 'Motivo obrigatório.' };

  const admin = getAdminClient();

  const { data: current } = await admin
    .from('professional_profiles')
    .select('is_suspended, is_published')
    .eq('id', profileId)
    .single();

  const { error } = await admin
    .from('professional_profiles')
    .update({ is_suspended: false })
    .eq('id', profileId);

  if (error) return { success: false, error: 'Erro ao desbloquear perfil.' };

  await recordAdminLog({
    adminId: user.id,
    action: 'unsuspend_profile',
    targetTable: 'professional_profiles',
    targetId: profileId,
    reason,
    oldValue: current,
    newValue: { ...current, is_suspended: false },
  });

  return { success: true };
}

/**
 * 5. Ações sobre denúncias (resolver/rejeitar/suspender alvo)
 */
export async function adminResolveReport(
  reportId: string,
  actionTaken: 'approved' | 'rejected' | 'removed',
  resolutionNotes: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const { user, role } = await getAdminUserRole();
  if (!user || !role) return { success: false, error: 'Acesso negado.' };
  if (!reason || !reason.trim()) return { success: false, error: 'Motivo obrigatório.' };

  const admin = getAdminClient();

  const { data: report } = await admin
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single();

  if (!report) return { success: false, error: 'Denúncia não encontrada.' };

  const { error } = await admin
    .from('reports')
    .update({
      status: actionTaken,
      resolution_notes: resolutionNotes,
    })
    .eq('id', reportId);

  if (error) return { success: false, error: 'Erro ao atualizar denúncia.' };

  await recordAdminLog({
    adminId: user.id,
    action: `resolve_report_${actionTaken}`,
    targetTable: 'reports',
    targetId: reportId,
    reason,
    oldValue: { status: report.status },
    newValue: { status: actionTaken, resolution_notes: resolutionNotes },
  });

  return { success: true };
}

/**
 * 6. Ações sobre avaliações em moderação (aprovar, recusar, remover)
 */
export async function adminModerateReview(
  reviewId: string,
  status: 'approved' | 'rejected' | 'removed',
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const { user, role } = await getAdminUserRole();
  if (!user || !role) return { success: false, error: 'Acesso negado.' };
  if (!reason || !reason.trim()) return { success: false, error: 'Motivo obrigatório.' };

  const admin = getAdminClient();

  const { data: review } = await admin
    .from('reviews')
    .select('status, comment')
    .eq('id', reviewId)
    .single();

  if (!review) return { success: false, error: 'Avaliação não encontrada.' };

  const { error } = await admin
    .from('reviews')
    .update({ status })
    .eq('id', reviewId);

  if (error) return { success: false, error: 'Erro ao moderar avaliação.' };

  await recordAdminLog({
    adminId: user.id,
    action: `moderate_review_${status}`,
    targetTable: 'reviews',
    targetId: reviewId,
    reason,
    oldValue: { status: review.status },
    newValue: { status },
  });

  return { success: true };
}

/**
 * 7. Obter métricas de uso em relação ao limite gratuito do Supabase
 * Limites Supabase Free:
 * - Banco de dados: 500 MB (500 * 1024 * 1024 bytes)
 * - Storage: 1 GB (1024 * 1024 * 1024 bytes)
 */
export async function getStorageAndDatabaseUsage(): Promise<{
  storageBytes: number;
  storageLimitBytes: number;
  storageUsagePercent: number;
  databaseUsageEstMB: number;
  databaseLimitMB: number;
  databaseUsagePercent: number;
  isStorageAlert: boolean;
  isDatabaseAlert: boolean;
}> {
  const admin = getAdminClient();

  // Somar bytes reais das fotos registradas em portfolio_images
  const { data: images } = await admin
    .from('portfolio_images')
    .select('bytes_size');

  const totalStorageBytes = (images || []).reduce((acc: number, curr: any) => acc + (curr.bytes_size || 0), 0);
  const STORAGE_LIMIT_BYTES = 1024 * 1024 * 1024; // 1 GB
  const storageUsagePercent = Math.min(100, Number(((totalStorageBytes / STORAGE_LIMIT_BYTES) * 100).toFixed(2)));

  // Estimativa de linhas do banco de dados (1 linha média ≈ 2 KB)
  const [usersCount, profilesCount, reviewsCount, requestsCount] = await Promise.all([
    admin.from('profiles').select('id', { count: 'exact', head: true }),
    admin.from('professional_profiles').select('id', { count: 'exact', head: true }),
    admin.from('reviews').select('id', { count: 'exact', head: true }),
    admin.from('contact_requests').select('id', { count: 'exact', head: true }),
  ]);

  const totalRows = (usersCount.count || 0) + (profilesCount.count || 0) + (reviewsCount.count || 0) + (requestsCount.count || 0);
  // Base de 15 MB (tabelas + índices do Postgres) + ~2KB por linha
  const estimatedDatabaseMB = Number((15 + (totalRows * 2) / 1024).toFixed(1));
  const DATABASE_LIMIT_MB = 500;
  const databaseUsagePercent = Math.min(100, Number(((estimatedDatabaseMB / DATABASE_LIMIT_MB) * 100).toFixed(2)));

  return {
    storageBytes: totalStorageBytes,
    storageLimitBytes: STORAGE_LIMIT_BYTES,
    storageUsagePercent,
    databaseUsageEstMB: estimatedDatabaseMB,
    databaseLimitMB: DATABASE_LIMIT_MB,
    databaseUsagePercent,
    isStorageAlert: storageUsagePercent >= 70,
    isDatabaseAlert: databaseUsagePercent >= 70,
  };
}

export async function adminDeleteProfile(
  profileId: string
): Promise<{ success: boolean; error?: string }> {
  const { user, role } = await getAdminUserRole();
  if (!user || role !== 'admin') return { success: false, error: 'Acesso restrito ao administrador.' };

  const admin = getAdminClient();

  const { data: current } = await admin
    .from('professional_profiles')
    .select('display_name, slug')
    .eq('id', profileId)
    .single();

  const { error } = await admin
    .from('professional_profiles')
    .delete()
    .eq('id', profileId);

  if (error) return { success: false, error: 'Erro ao excluir perfil permanentemente.' };

  await recordAdminLog({
    adminId: user.id,
    action: 'delete_profile',
    targetTable: 'professional_profiles',
    targetId: profileId,
    reason: 'Exclusão definitiva solicitada pelo administrador',
    oldValue: current,
  });

  return { success: true };
}

export async function adminSetPublished(
  profileId: string,
  published: boolean
): Promise<{ success: boolean; error?: string }> {
  const { user, role } = await getAdminUserRole();
  if (!user || !role) return { success: false, error: 'Acesso negado.' };

  const admin = getAdminClient();

  const { error } = await admin
    .from('professional_profiles')
    .update({ is_published: published })
    .eq('id', profileId);

  if (error) return { success: false, error: 'Erro ao alterar status de publicação.' };

  await recordAdminLog({
    adminId: user.id,
    action: published ? 'publish_profile' : 'unpublish_profile',
    targetTable: 'professional_profiles',
    targetId: profileId,
    reason: `Publicação alterada para ${published ? 'publicado' : 'despublicado'} pelo administrador`,
  });

  return { success: true };
}

/**
 * 12. Backup e Exportação completa de Dados do Banco
 * Permite ao administrador baixar cópia JSON de todos os dados essenciais do sistema.
 */
export async function exportDatabaseBackup(): Promise<{
  success: boolean;
  error?: string;
  data?: {
    metadata: {
      exportedAt: string;
      exportedBy: string;
      platform: string;
      counts: Record<string, number>;
    };
    tables: {
      profiles: any[];
      professional_profiles: any[];
      portfolio_items: any[];
      portfolio_images: any[];
      categories: any[];
      reviews: any[];
      contact_requests: any[];
      reports: any[];
      admin_audit_logs: any[];
    };
  };
}> {
  const { user, role } = await getAdminUserRole();
  if (!user || role !== 'admin') {
    return { success: false, error: 'Apenas administradores podem exportar backup completo.' };
  }

  const admin = getAdminClient();

  try {
    const [
      profilesRes,
      profProfilesRes,
      itemsRes,
      imagesRes,
      categoriesRes,
      reviewsRes,
      contactsRes,
      reportsRes,
      logsRes,
    ] = await Promise.all([
      admin.from('profiles').select('*'),
      admin.from('professional_profiles').select('*'),
      admin.from('portfolio_items').select('*'),
      admin.from('portfolio_images').select('*'),
      admin.from('categories').select('*'),
      admin.from('reviews').select('*'),
      admin.from('contact_requests').select('*'),
      admin.from('reports').select('*'),
      admin.from('admin_audit_logs').select('*').order('created_at', { ascending: false }).limit(500),
    ]);

    const backupData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        exportedBy: user.id,
        platform: 'Conecta Móveis Jundiaí',
        counts: {
          profiles: profilesRes.data?.length || 0,
          professional_profiles: profProfilesRes.data?.length || 0,
          portfolio_items: itemsRes.data?.length || 0,
          portfolio_images: imagesRes.data?.length || 0,
          categories: categoriesRes.data?.length || 0,
          reviews: reviewsRes.data?.length || 0,
          contact_requests: contactsRes.data?.length || 0,
          reports: reportsRes.data?.length || 0,
          admin_audit_logs: logsRes.data?.length || 0,
        },
      },
      tables: {
        profiles: profilesRes.data || [],
        professional_profiles: profProfilesRes.data || [],
        portfolio_items: itemsRes.data || [],
        portfolio_images: imagesRes.data || [],
        categories: categoriesRes.data || [],
        reviews: reviewsRes.data || [],
        contact_requests: contactsRes.data || [],
        reports: reportsRes.data || [],
        admin_audit_logs: logsRes.data || [],
      },
    };

    await recordAdminLog({
      adminId: user.id,
      action: 'export_backup',
      targetTable: 'system',
      targetId: 'backup',
      reason: 'Exportação manual de backup do banco de dados em JSON realizada pelo administrador',
    });

    return { success: true, data: backupData };
  } catch (err: any) {
    return { success: false, error: err.message || 'Falha ao gerar backup.' };
  }
}

// ==============================================================================
// FASE 19 — ADMINISTRAÇÃO COMPLETA: NÚCLEO
// ==============================================================================

/**
 * 12. Verificação de Nível MFA AAL2 no Servidor
 */
export async function checkAdminMfaAal2(): Promise<{
  isAal2: boolean;
  hasMfaEnrolled: boolean;
}> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (!data) return { isAal2: true, hasMfaEnrolled: false };

    const hasMfaEnrolled = data.nextLevel === 'aal2';
    const isAal2 = data.currentLevel === 'aal2';

    return { isAal2, hasMfaEnrolled };
  } catch {
    return { isAal2: true, hasMfaEnrolled: false };
  }
}

/**
 * 13. Busca de Usuários com Ficha Segura (Sem senhas ou tokens)
 */
export async function searchAdminUsers(searchTerm?: string): Promise<{
  success: boolean;
  users?: Array<{
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    is_suspended: boolean;
    created_at: string;
    role: string | null;
    active_plan: string;
  }>;
  error?: string;
}> {
  const { user, role } = await getAdminUserRole();
  if (!user || !role) return { success: false, error: 'Acesso negado.' };

  const admin = getAdminClient();
  let query = admin
    .from('profiles')
    .select('id, full_name, email, phone, is_suspended, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (searchTerm && searchTerm.trim()) {
    const term = searchTerm.trim();
    query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%`);
  }

  const { data: profiles, error } = await query;
  if (error) return { success: false, error: error.message };

  // Buscar papéis e planos
  const userIds = (profiles || []).map((p) => p.id);
  const [rolesRes, plansRes] = await Promise.all([
    admin.from('user_roles').select('user_id, role').in('user_id', userIds),
    admin.from('manual_plan_grants').select('user_id, plan_code').eq('is_active', true).in('user_id', userIds),
  ]);

  const roleMap = new Map((rolesRes.data || []).map((r) => [r.user_id, r.role]));
  const planMap = new Map((plansRes.data || []).map((p) => [p.user_id, p.plan_code]));

  const mapped = (profiles || []).map((p) => ({
    id: p.id,
    full_name: p.full_name,
    email: p.email,
    phone: p.phone,
    is_suspended: Boolean(p.is_suspended),
    created_at: p.created_at,
    role: roleMap.get(p.id) || 'user',
    active_plan: planMap.get(p.id) || 'gratuito',
  }));

  return { success: true, users: mapped };
}

/**
 * 14. Suspender Usuário
 */
export async function suspendUserAccount(
  targetUserId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const { user, role } = await getAdminUserRole();
  if (!user || !role || role === 'support') {
    return { success: false, error: 'Acesso negado: permissão insuficiente.' };
  }
  if (!reason || reason.trim().length < 10) {
    return { success: false, error: 'Justificativa de suspensão de no mínimo 10 caracteres é obrigatória.' };
  }

  const admin = getAdminClient();
  const { error } = await admin
    .from('profiles')
    .update({ is_suspended: true, updated_at: new Date().toISOString() })
    .eq('id', targetUserId);

  if (error) return { success: false, error: error.message };

  await recordAdminLog({
    adminId: user.id,
    action: 'suspend_user_account',
    targetTable: 'profiles',
    targetId: targetUserId,
    reason: reason.trim(),
    oldValue: { is_suspended: false },
    newValue: { is_suspended: true },
  });

  return { success: true };
}

/**
 * 15. Reativar Usuário
 */
export async function reactivateUserAccount(
  targetUserId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const { user, role } = await getAdminUserRole();
  if (!user || !role || role === 'support') {
    return { success: false, error: 'Acesso negado: permissão insuficiente.' };
  }
  if (!reason || reason.trim().length < 10) {
    return { success: false, error: 'Justificativa de reativação de no mínimo 10 caracteres é obrigatória.' };
  }

  const admin = getAdminClient();
  const { error } = await admin
    .from('profiles')
    .update({ is_suspended: false, updated_at: new Date().toISOString() })
    .eq('id', targetUserId);

  if (error) return { success: false, error: error.message };

  await recordAdminLog({
    adminId: user.id,
    action: 'reactivate_user_account',
    targetTable: 'profiles',
    targetId: targetUserId,
    reason: reason.trim(),
    oldValue: { is_suspended: true },
    newValue: { is_suspended: false },
  });

  return { success: true };
}

/**
 * 16. Forçar Logout de Usuário (Invalidação de Sessão)
 */
export async function forceUserLogout(
  targetUserId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const { user, role } = await getAdminUserRole();
  if (!user || !role || role === 'support') {
    return { success: false, error: 'Acesso negado: permissão insuficiente.' };
  }
  if (!reason || reason.trim().length < 10) {
    return { success: false, error: 'Justificativa de encerramento de sessão de no mínimo 10 caracteres é obrigatória.' };
  }

  const admin = getAdminClient();
  try {
    await admin.auth.admin.signOut(targetUserId);
  } catch {
    // Ignora se não houver sessão ativa
  }

  await recordAdminLog({
    adminId: user.id,
    action: 'force_user_signout',
    targetTable: 'auth.users',
    targetId: targetUserId,
    reason: reason.trim(),
  });

  return { success: true };
}

/**
 * 17. Exclusão ou Anonimização em Duas Etapas (Exclusivo OWNER)
 */
export async function deleteUserAccountTwoStep(
  targetUserId: string,
  reason: string,
  confirmationWord: string
): Promise<{ success: boolean; error?: string }> {
  const { user, role } = await getAdminUserRole();
  if (!user || role !== 'owner') {
    return { success: false, error: 'Apenas o proprietário (owner) possui autorização para exclusão definitiva de contas.' };
  }

  if (confirmationWord !== 'CONFIRMAR_EXCLUSAO') {
    return { success: false, error: "A palavra de confirmação deve ser exatamente 'CONFIRMAR_EXCLUSAO'." };
  }

  if (!reason || reason.trim().length < 15) {
    return { success: false, error: 'Justificativa formal com no mínimo 15 caracteres é estritamente obrigatória.' };
  }

  const admin = getAdminClient();

  // Trava de Legal Hold: se houver registros telemáticos sob preservação judicial, bloqueia exclusão
  const { data: heldLogs } = await admin
    .from('app_access_logs')
    .select('id')
    .eq('user_id', targetUserId)
    .eq('legal_hold', true)
    .limit(1);

  if (heldLogs && heldLogs.length > 0) {
    return {
      success: false,
      error: 'OPERAÇÃO BLOQUEADA: Este usuário possui registros sob ordem judicial de preservação (legal hold). Os dados não podem ser excluídos.',
    };
  }

  // Grava log auditado da exclusão ANTES de remover
  await recordAdminLog({
    adminId: user.id,
    action: 'delete_user_account_permanent',
    targetTable: 'auth.users',
    targetId: targetUserId,
    reason: reason.trim(),
  });

  // Executa remoção no auth e cascade
  const { error } = await admin.auth.admin.deleteUser(targetUserId);
  if (error) return { success: false, error: error.message };

  return { success: true };
}

/**
 * 18. Concessão de Plano Manual com Efeito Imediato e Histórico
 */
export async function grantManualPlan(params: {
  userId: string;
  planCode: string;
  validUntil?: string | null;
  reason: string;
  origin: 'manual' | 'convite' | 'teste' | 'pago_futuro';
}): Promise<{ success: boolean; error?: string }> {
  const { user, role } = await getAdminUserRole();
  if (!user || (role !== 'owner' && role !== 'admin')) {
    return { success: false, error: 'Acesso restrito a administradores ou proprietário.' };
  }

  if (!params.reason || params.reason.trim().length < 10) {
    return { success: false, error: 'Justificativa de concessão com no mínimo 10 caracteres é obrigatória.' };
  }

  const admin = getAdminClient();

  // 1. Desativa planos manuais ativos anteriores
  await admin
    .from('manual_plan_grants')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('user_id', params.userId)
    .eq('is_active', true);

  // 2. Insere novo plano manual
  const { data: newGrant, error } = await admin
    .from('manual_plan_grants')
    .insert({
      user_id: params.userId,
      plan_code: params.planCode,
      valid_from: new Date().toISOString(),
      valid_until: params.validUntil ? new Date(params.validUntil).toISOString() : null,
      reason: params.reason.trim(),
      origin: params.origin,
      granted_by: user.id,
      is_active: true,
    })
    .select('id')
    .single();

  if (error) return { success: false, error: error.message };

  // 3. Grava log auditado
  await recordAdminLog({
    adminId: user.id,
    action: 'grant_manual_plan',
    targetTable: 'manual_plan_grants',
    targetId: newGrant?.id || params.userId,
    reason: params.reason.trim(),
    newValue: { plan: params.planCode, origin: params.origin, valid_until: params.validUntil },
  });

  return { success: true };
}

/**
 * 19. Revogação de Plano Manual
 */
export async function revokeManualPlan(
  grantId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const { user, role } = await getAdminUserRole();
  if (!user || (role !== 'owner' && role !== 'admin')) {
    return { success: false, error: 'Acesso restrito a administradores ou proprietário.' };
  }

  if (!reason || reason.trim().length < 10) {
    return { success: false, error: 'Justificativa de revogação de no mínimo 10 caracteres é obrigatória.' };
  }

  const admin = getAdminClient();
  const { error } = await admin
    .from('manual_plan_grants')
    .update({
      is_active: false,
      revoked_at: new Date().toISOString(),
      revoked_by: user.id,
      revocation_reason: reason.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', grantId);

  if (error) return { success: false, error: error.message };

  await recordAdminLog({
    adminId: user.id,
    action: 'revoke_manual_plan',
    targetTable: 'manual_plan_grants',
    targetId: grantId,
    reason: reason.trim(),
  });

  return { success: true };
}

/**
 * 20. Exportação Auditada de Logs Administrativos para CSV
 */
export async function exportAdminLogsToCsv(): Promise<{
  success: boolean;
  csvContent?: string;
  error?: string;
}> {
  const { user, role } = await getAdminUserRole();
  if (!user || !role) return { success: false, error: 'Acesso negado.' };

  const admin = getAdminClient();
  const { data: logs, error } = await admin
    .from('admin_logs')
    .select('id, admin_id, action, target_table, target_id, reason, created_at')
    .order('created_at', { ascending: false })
    .limit(1000);

  if (error) return { success: false, error: error.message };

  const headers = ['ID', 'Admin_ID', 'Acao', 'Tabela_Alvo', 'ID_Alvo', 'Motivo', 'Data_Hora'];
  const rows = (logs || []).map((l) => [
    l.id,
    l.admin_id,
    l.action,
    l.target_table,
    l.target_id,
    `"${(l.reason || '').replace(/"/g, '""')}"`,
    l.created_at,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  // Registrar em log que a exportação foi realizada
  await recordAdminLog({
    adminId: user.id,
    action: 'export_admin_logs_csv',
    targetTable: 'admin_logs',
    targetId: 'csv_export',
    reason: `Exportação de ${(logs || []).length} registros de auditoria em arquivo CSV realizada por ${user.email}`,
  });

  return { success: true, csvContent };
}


