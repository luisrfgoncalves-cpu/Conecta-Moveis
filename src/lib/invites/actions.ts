'use server';

import { createHash, randomBytes } from 'crypto';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { CreateInviteInput, CreateInviteSchema, InviteLinkRecord } from './schemas';
import { getAdminUserRole, grantManualPlan } from '@/lib/admin/actions';

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function hashToken(token: string): string {
  return createHash('sha256').update(token.trim()).digest('hex');
}

/**
 * 1. Obter o Modo Atual de Cadastro (signup_mode)
 */
export async function getSignupMode(): Promise<'aberto' | 'somente_convite' | 'fechado'> {
  try {
    const admin = getAdminClient();
    const { data } = await admin
      .from('system_settings')
      .select('value')
      .eq('key', 'signup_mode')
      .single();

    if (data && typeof data.value === 'string') {
      const mode = data.value.replace(/"/g, '');
      if (mode === 'aberto' || mode === 'somente_convite' || mode === 'fechado') {
        return mode;
      }
    }
  } catch {
    // Fallback padrão
  }
  return 'somente_convite';
}

/**
 * 2. Criar Link de Convite / Campanha com Dias de Teste Personalizados pelo Dono
 */
export async function createInviteLink(
  rawInput: CreateInviteInput
): Promise<{ success: boolean; invite?: InviteLinkRecord; fullToken?: string; error?: string }> {
  const { user, role } = await getAdminUserRole();
  if (!user || (role !== 'owner' && role !== 'admin')) {
    return { success: false, error: 'Apenas administradores podem criar links de convite.' };
  }

  const parsed = CreateInviteSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: 'Parâmetros de convite inválidos.' };
  }

  const token = randomBytes(16).toString('hex');
  const token_hash = hashToken(token);
  const token_preview = `${token.slice(0, 4)}...${token.slice(-4)}`;

  const admin = getAdminClient();
  const { data, error } = await admin
    .from('invite_links')
    .insert({
      token_hash,
      token_preview,
      type: parsed.data.type,
      plan_code: parsed.data.plan_code,
      trial_days: parsed.data.trial_days, // Decidido pelo proprietário
      max_uses: parsed.data.max_uses || null,
      expires_at: parsed.data.expires_at ? new Date(parsed.data.expires_at).toISOString() : null,
      campaign_label: parsed.data.campaign_label?.trim() || null,
      notes: parsed.data.notes?.trim() || null,
      created_by: user.id,
      is_active: true,
    })
    .select('*')
    .single();

  if (error || !data) {
    return { success: false, error: error?.message || 'Falha ao criar convite.' };
  }

  revalidatePath('/admin/convites');
  return {
    success: true,
    invite: data as InviteLinkRecord,
    fullToken: token, // Exibido apenas nesta resposta inicial
  };
}

/**
 * 3. Listar Links de Convite
 */
export async function listInviteLinks(): Promise<{
  success: boolean;
  invites?: InviteLinkRecord[];
  campaignStats?: Record<string, number>;
  error?: string;
}> {
  const { user, role } = await getAdminUserRole();
  if (!user || !role) return { success: false, error: 'Acesso negado.' };

  const admin = getAdminClient();
  const { data, error } = await admin
    .from('invite_links')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: error.message };

  const invites = (data || []) as InviteLinkRecord[];
  const campaignStats: Record<string, number> = {};

  for (const inv of invites) {
    const label = inv.campaign_label || 'Sem campanha';
    campaignStats[label] = (campaignStats[label] || 0) + (inv.uses_count || 0);
  }

  return { success: true, invites, campaignStats };
}

/**
 * 4. Revogar Link de Convite
 */
export async function revokeInviteLink(id: string): Promise<{ success: boolean; error?: string }> {
  const { user, role } = await getAdminUserRole();
  if (!user || (role !== 'owner' && role !== 'admin')) {
    return { success: false, error: 'Permissão insuficiente.' };
  }

  const admin = getAdminClient();
  const { error } = await admin
    .from('invite_links')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/convites');
  return { success: true };
}

/**
 * 5. Duplicar Link de Convite
 */
export async function duplicateInviteLink(
  id: string
): Promise<{ success: boolean; fullToken?: string; error?: string }> {
  const { user, role } = await getAdminUserRole();
  if (!user || (role !== 'owner' && role !== 'admin')) {
    return { success: false, error: 'Permissão insuficiente.' };
  }

  const admin = getAdminClient();
  const { data: original, error: fetchErr } = await admin
    .from('invite_links')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchErr || !original) return { success: false, error: 'Convite original não encontrado.' };

  return createInviteLink({
    type: original.type,
    plan_code: original.plan_code,
    trial_days: original.trial_days,
    max_uses: original.max_uses,
    campaign_label: original.campaign_label ? `${original.campaign_label} (cópia)` : null,
    notes: original.notes,
  });
}

/**
 * 6. Validação Prévia de Token de Convite (Sem Resgate)
 */
export async function validateInviteToken(token: string): Promise<{
  valid: boolean;
  invite?: {
    id: string;
    type: string;
    plan_code: string;
    trial_days: number;
    campaign_label: string | null;
  };
  error?: string;
}> {
  if (!token || token.trim().length < 10) {
    return { valid: false, error: 'Código de convite com formato inválido.' };
  }

  const token_hash = hashToken(token);
  const admin = getAdminClient();

  const { data: invite, error } = await admin
    .from('invite_links')
    .select('id, type, plan_code, trial_days, max_uses, uses_count, expires_at, campaign_label, is_active')
    .eq('token_hash', token_hash)
    .maybeSingle();

  if (error || !invite) {
    return { valid: false, error: 'Convite não encontrado ou código incorreto.' };
  }

  if (!invite.is_active) {
    return { valid: false, error: 'Este link de convite foi desativado.' };
  }

  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return { valid: false, error: 'Este convite expirou a sua data de validade.' };
  }

  if (invite.max_uses && invite.uses_count >= invite.max_uses) {
    return { valid: false, error: 'O limite de resgates deste convite foi esgotado.' };
  }

  return {
    valid: true,
    invite: {
      id: invite.id,
      type: invite.type,
      plan_code: invite.plan_code,
      trial_days: invite.trial_days,
      campaign_label: invite.campaign_label,
    },
  };
}

/**
 * 7. Resgate Efetivo de Convite pelo Usuário Logado ou no Cadastro
 */
export async function redeemInviteLink(
  token: string,
  explicitUserId?: string
): Promise<{
  success: boolean;
  planCode?: string;
  trialDays?: number;
  error?: string;
}> {
  let targetUserId = explicitUserId;

  if (!targetUserId) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Faça login ou crie sua conta para resgatar o convite.' };
    }
    targetUserId = user.id;
  }

  const check = await validateInviteToken(token);
  if (!check.valid || !check.invite) {
    return { success: false, error: check.error || 'Convite inválido.' };
  }

  const admin = getAdminClient();

  // Verifica se o usuário já resgatou este convite específico
  const { data: existingRedemption } = await admin
    .from('invite_redemptions')
    .select('id')
    .eq('invite_id', check.invite.id)
    .eq('user_id', targetUserId)
    .maybeSingle();

  if (existingRedemption) {
    return { success: false, error: 'Você já resgatou este link de convite anteriormente.' };
  }

  // 1. Grava o resgate
  const { error: redemptionErr } = await admin.from('invite_redemptions').insert({
    invite_id: check.invite.id,
    user_id: targetUserId,
  });

  if (redemptionErr) {
    return { success: false, error: 'Falha ao registrar resgate do convite.' };
  }

  // 2. Incrementa contador de usos
  try {
    const { error: rpcErr } = await admin.rpc('increment_invite_uses', { p_invite_id: check.invite.id });
    if (rpcErr) throw rpcErr;
  } catch {
    // Fallback se a RPC não existir
    const { data: cur } = await admin.from('invite_links').select('uses_count').eq('id', check.invite.id).single();
    if (cur) {
      await admin.from('invite_links').update({ uses_count: (cur.uses_count || 0) + 1 }).eq('id', check.invite.id);
    }
  }

  // 3. Aplica o plano manual com a validade em dias de teste configurada pelo dono
  const validUntilDate =
    check.invite.trial_days > 0
      ? new Date(Date.now() + check.invite.trial_days * 24 * 60 * 60 * 1000).toISOString()
      : null;

  await grantManualPlan({
    userId: targetUserId,
    planCode: check.invite.plan_code,
    validUntil: validUntilDate,
    reason: `Resgate de link de convite (${check.invite.campaign_label || 'Geral'}) com ${check.invite.trial_days} dias de degustação`,
    origin: 'convite',
  });

  return {
    success: true,
    planCode: check.invite.plan_code,
    trialDays: check.invite.trial_days,
  };
}
