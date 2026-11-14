'use server';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  InfraProfile,
  SystemSetting,
  FeatureFlag,
  CapacitySimulatorInput,
  CapacitySimulationResult,
  CapacitySimulatorInputSchema,
} from './schemas';
import { SYSTEM_SETTINGS_REGISTRY, FEATURE_FLAGS_REGISTRY } from './registry';

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function verifyAdminRole() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { authorized: false, error: 'Acesso negado: faça login.' };

  const admin = getAdminClient();
  const { data: roleRow } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .in('role', ['admin', 'moderator'])
    .single();

  if (!roleRow) {
    return { authorized: false, error: 'Acesso restrito ao administrador.' };
  }

  return { authorized: true, user, role: roleRow.role };
}

/**
 * 1. Obter Perfil de Infraestrutura Ativo (Camada A)
 */
export async function getActiveInfraProfile(): Promise<InfraProfile> {
  try {
    const admin = getAdminClient();
    const { data } = await admin
      .from('infra_profiles')
      .select('*')
      .eq('is_active', true)
      .single();

    if (data) return data as InfraProfile;
  } catch {
    // Fallback padrão se tabela não estiver instanciada
  }

  return {
    id: 'gratuito',
    name: 'Plano Gratuito (Supabase Free / Vercel Hobby)',
    storage_mb: 1024,
    db_mb: 500,
    transfer_gb_month: 5,
    max_upload_size_mb: 5,
    is_active: true,
  };
}

/**
 * 2. Atualizar Perfil de Infraestrutura (Apenas Owner com Confirmação)
 */
export async function updateInfraProfile(
  profileId: 'gratuito' | 'pro' | 'personalizado',
  confirmationConfirmed: boolean
): Promise<{ success: boolean; error?: string }> {
  const check = await verifyAdminRole();
  if (!check.authorized || !check.user) return { success: false, error: check.error };

  if (!confirmationConfirmed) {
    return {
      success: false,
      error: 'A confirmação explícita de contratação prévia do plano é obrigatória.',
    };
  }

  const admin = getAdminClient();

  // Desativa todos e ativa o selecionado
  await admin.from('infra_profiles').update({ is_active: false }).neq('id', 'null');
  const { error } = await admin
    .from('infra_profiles')
    .update({ is_active: true, updated_at: new Date().toISOString(), updated_by: check.user.id })
    .eq('id', profileId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/configuracoes');
  return { success: true };
}

/**
 * 3. Listar Configurações Tipadas
 */
export async function getSystemSettings(): Promise<SystemSetting[]> {
  try {
    const admin = getAdminClient();
    const { data } = await admin.from('system_settings').select('*');
    if (data && data.length > 0) {
      return data as SystemSetting[];
    }
  } catch {
    // Fallback
  }

  return Object.values(SYSTEM_SETTINGS_REGISTRY);
}

/**
 * 4. Atualizar Configuração com Zod, Validação de Tetos e Histórico
 */
export async function updateSystemSetting(
  key: string,
  newValue: unknown,
  reason: string,
  bypassConfirmation = false
): Promise<{ success: boolean; requiresConfirmation?: boolean; warning?: string; error?: string }> {
  const check = await verifyAdminRole();
  if (!check.authorized || !check.user) return { success: false, error: check.error };

  if (!reason || reason.trim().length < 10) {
    return { success: false, error: 'A justificativa de alteração deve ter pelo menos 10 caracteres.' };
  }

  // Buscar configuração atual no catálogo ou banco
  const allSettings = await getSystemSettings();
  const setting = allSettings.find((s) => s.key === key);
  if (!setting) return { success: false, error: `Configuração '${key}' não reconhecida.` };

  // Validação de tipo numérico e limites mínimo / máximo
  if (setting.value_type === 'number') {
    const num = Number(newValue);
    if (isNaN(num)) return { success: false, error: 'O dado informado deve ser um número válido.' };

    if (setting.min_value !== null && setting.min_value !== undefined && num < setting.min_value) {
      return { success: false, error: `Limite mínimo permitido para ${key}: ${setting.min_value}.` };
    }

    if (setting.max_value !== null && setting.max_value !== undefined && num > setting.max_value) {
      return { success: false, error: `Limite máximo permitido para ${key}: ${setting.max_value}.` };
    }
  }

  // Checagem de compatibilidade com o teto da Infraestrutura (Camada A x Camada B)
  const activeInfra = await getActiveInfraProfile();
  if (
    setting.requires_infra_profile === 'pro' &&
    activeInfra.id === 'gratuito' &&
    !bypassConfirmation
  ) {
    return {
      success: false,
      requiresConfirmation: true,
      warning: `Atenção: A configuração '${key}' requer recursos do perfil 'pro', mas a infraestrutura ativa é 'gratuito'. Deseja salvar mesmo assim ciente do risco de sobrecarga?`,
    };
  }

  const admin = getAdminClient();

  // Gravar histórico
  await admin.from('system_setting_history').insert({
    setting_key: key,
    old_value: setting.value,
    new_value: newValue,
    changed_by: check.user.id,
    reason: reason.trim(),
  });

  // Atualizar valor
  const { error } = await admin
    .from('system_settings')
    .upsert({
      key,
      value: newValue,
      value_type: setting.value_type,
      default_value: setting.default_value,
      min_value: setting.min_value,
      max_value: setting.max_value,
      scope: setting.scope,
      description: setting.description,
      requires_infra_profile: setting.requires_infra_profile,
      requires_legal_review: setting.requires_legal_review,
      updated_at: new Date().toISOString(),
      updated_by: check.user.id,
    });

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/configuracoes');
  return { success: true };
}

/**
 * 5. Desfazer Alteração de Configuração (Rollback para Versão Anterior)
 */
export async function rollbackSetting(
  historyId: string
): Promise<{ success: boolean; restoredKey?: string; error?: string }> {
  const check = await verifyAdminRole();
  if (!check.authorized || !check.user) return { success: false, error: check.error };

  const admin = getAdminClient();
  const { data: historyRow, error } = await admin
    .from('system_setting_history')
    .select('*')
    .eq('id', historyId)
    .single();

  if (error || !historyRow) {
    return { success: false, error: 'Registro de histórico não localizado para reversão.' };
  }

  // Restaura o valor antigo gravando novo registro no histórico
  await admin.from('system_setting_history').insert({
    setting_key: historyRow.setting_key,
    old_value: historyRow.new_value,
    new_value: historyRow.old_value,
    changed_by: check.user.id,
    reason: `Reversão (rollback) para a versão anterior a partir do histórico ${historyId}.`,
  });

  await admin
    .from('system_settings')
    .update({
      value: historyRow.old_value,
      updated_at: new Date().toISOString(),
      updated_by: check.user.id,
    })
    .eq('key', historyRow.setting_key);

  revalidatePath('/admin/configuracoes');
  return { success: true, restoredKey: historyRow.setting_key };
}

/**
 * 6. Obter e Atualizar Feature Flags com Trava de Infraestrutura e Jurídica
 */
export async function getFeatureFlags(): Promise<FeatureFlag[]> {
  try {
    const admin = getAdminClient();
    const { data } = await admin.from('feature_flags').select('*');
    if (data && data.length > 0) return data as FeatureFlag[];
  } catch {
    // Fallback
  }

  return Object.values(FEATURE_FLAGS_REGISTRY);
}

export async function updateFeatureFlag(
  key: string,
  state: 'desligado' | 'teste' | 'ligado',
  legalApprovalId?: string
): Promise<{ success: boolean; error?: string }> {
  const check = await verifyAdminRole();
  if (!check.authorized || !check.user) return { success: false, error: check.error };

  const allFlags = await getFeatureFlags();
  const flag = allFlags.find((f) => f.key === key);
  if (!flag) return { success: false, error: `Feature flag '${key}' não encontrada.` };

  const activeInfra = await getActiveInfraProfile();

  // Trava 1: Se requer infraestrutura paga e o perfil for gratuito, bloqueia ativação
  if (flag.requires_infra_profile === 'pro' && activeInfra.id === 'gratuito' && state !== 'desligado') {
    return {
      success: false,
      error: 'Esta funcionalidade requer plano pago da infraestrutura. Faça o upgrade do perfil de infraestrutura para ativá-la.',
    };
  }

  // Trava 2: Se requer revisão jurídica e for ligar em produção, exige ID de aprovação formal
  if (flag.requires_legal_review && state === 'ligado') {
    const approval = legalApprovalId || flag.legal_approval_id;
    if (!approval || !approval.trim().toUpperCase().startsWith('J-')) {
      return {
        success: false,
        error: 'Esta funcionalidade requer aprovação jurídica formal. É obrigatório informar um ID de registro válido (ex: J-001 a J-006).',
      };
    }
  }

  const admin = getAdminClient();
  const { error } = await admin
    .from('feature_flags')
    .upsert({
      key,
      name: flag.name,
      state,
      scope: flag.scope,
      description: flag.description,
      requires_infra_profile: flag.requires_infra_profile,
      requires_legal_review: flag.requires_legal_review,
      legal_approval_id: legalApprovalId?.trim() || flag.legal_approval_id || null,
      updated_at: new Date().toISOString(),
      updated_by: check.user.id,
    });

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/configuracoes');
  return { success: true };
}

/**
 * 7. Simulador de Capacidade de Infraestrutura
 */
export async function simulateCapacity(inputRaw: CapacitySimulatorInput): Promise<CapacitySimulationResult> {
  const input = CapacitySimulatorInputSchema.parse(inputRaw);
  const infra = await getActiveInfraProfile();

  // 1. Projeção de Armazenamento (Storage) em MB
  // Fotos de perfil: perfis * fotos_por_perfil * tamanho_medio_kb / 1024
  const projected_storage_mb = Math.round(
    (input.total_profiles * input.photos_per_profile * input.avg_photo_size_kb) / 1024
  );

  // 2. Projeção de Banco de Dados em MB
  // Base estática ~15MB + 150KB por perfil com dados e avaliações + metadados de fotos
  const projected_db_mb = Math.round(
    15 + input.total_profiles * 0.15 + input.total_profiles * input.photos_per_profile * 0.005
  );

  // 3. Projeção de Transferência Mensal em GB
  // Visitantes * Páginas * Fotos vistas * Tamanho / (1024 * 1024)
  const totalPhotoViews = input.active_monthly_visitors * input.views_per_visitor * 3; // Média 3 fotos vistas por página
  const projected_transfer_gb_month = Number(
    ((totalPhotoViews * input.avg_photo_size_kb) / (1024 * 1024)).toFixed(2)
  );

  // Porcentagens em relação ao teto do perfil ativo
  const storage_usage_percent = Number(((projected_storage_mb / infra.storage_mb) * 100).toFixed(1));
  const db_usage_percent = Number(((projected_db_mb / infra.db_mb) * 100).toFixed(1));
  const transfer_usage_percent = Number(
    ((projected_transfer_gb_month / infra.transfer_gb_month) * 100).toFixed(1)
  );

  // Níveis de alerta (70% e 90%)
  function getAlertLevel(pct: number): 'ok' | 'warning_70' | 'critical_90' {
    if (pct >= 90) return 'critical_90';
    if (pct >= 70) return 'warning_70';
    return 'ok';
  }

  const storage_alert_level = getAlertLevel(storage_usage_percent);
  const db_alert_level = getAlertLevel(db_usage_percent);
  const transfer_alert_level = getAlertLevel(transfer_usage_percent);

  // Quantos perfis o plano aguenta até 90% do storage?
  const maxStorageSustainableMb = infra.storage_mb * 0.9;
  const mbPerProfile = (input.photos_per_profile * input.avg_photo_size_kb) / 1024;
  const max_profiles_sustainable = Math.max(1, Math.floor(maxStorageSustainableMb / mbPerProfile));

  let recommendation = 'A infraestrutura atual comporta tranquilamente esta projeção.';
  if (storage_alert_level === 'critical_90' || db_alert_level === 'critical_90') {
    recommendation = `ALERTA CRÍTICO: Projeção ultrapassa 90% da cota do plano ${infra.name}. O upgrade para o Supabase Pro deve ser planejado antes de atingir este volume.`;
  } else if (storage_alert_level === 'warning_70' || db_alert_level === 'warning_70') {
    recommendation = `ATENÇÃO: Projeção atinge a faixa de atenção (70% a 90%). Inicie o planejamento do plano Pro.`;
  }

  return {
    projected_storage_mb,
    projected_db_mb,
    projected_transfer_gb_month,
    storage_usage_percent,
    db_usage_percent,
    transfer_usage_percent,
    storage_alert_level,
    db_alert_level,
    transfer_alert_level,
    max_profiles_sustainable,
    recommendation,
  };
}

/**
 * 8. Política de Redução: Bloqueio Brando (Grandfathering)
 * Verifica se um usuário com limite reduzido pode adicionar novo item.
 * O conteúdo já existente NUNCA é deletado.
 */
export async function checkSoftLimitEnforcement(currentCount: number, allowedLimit: number): Promise<{
  canAdd: boolean;
  message?: string;
  isGrandfathered: boolean;
}> {
  if (currentCount < allowedLimit) {
    return { canAdd: true, isGrandfathered: false };
  }

  const isGrandfathered = currentCount > allowedLimit;
  const message = isGrandfathered
    ? `Você possui ${currentCount} itens cadastrados, o que supera o limite atual de ${allowedLimit} itens. Seus itens anteriores permanecem preservados e ativos, mas não é possível adicionar novos sem liberar espaço.`
    : `Você atingiu o limite de ${allowedLimit} itens permitidos pelo seu plano.`;

  return {
    canAdd: false,
    message,
    isGrandfathered,
  };
}
