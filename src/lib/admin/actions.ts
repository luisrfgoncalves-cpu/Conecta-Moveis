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

export type AdminRole = 'admin' | 'moderator';

/**
 * 1. Verifica autenticação e papel do usuário (moderator ou admin)
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
    .in('role', ['admin', 'moderator'])
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

