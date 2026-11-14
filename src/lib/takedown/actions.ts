'use server';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export interface CreateTakedownInput {
  category: 'copyright_image' | 'trademark' | 'defamation' | 'privacy' | 'fraud' | 'illegal_grave' | 'other';
  targetUrl?: string;
  targetType: 'profile' | 'portfolio_image' | 'review' | 'company';
  targetId?: string;
  description: string;
  notifierName: string;
  notifierEmail: string;
  goodFaithDeclaration: boolean;
}

/**
 * 1. Enviar Notificação Formal de Conteúdo com Geração de Protocolo
 */
export async function submitTakedownNotice(input: CreateTakedownInput): Promise<{
  success: boolean;
  protocol?: string;
  error?: string;
}> {
  if (!input.goodFaithDeclaration) {
    return { success: false, error: 'É obrigatório declarar a veracidade e boa-fé das informações fornecidas.' };
  }

  if (!input.notifierName?.trim() || !input.notifierEmail?.trim()) {
    return { success: false, error: 'Identificação completa do notificante (nome e e-mail) é obrigatória.' };
  }

  if (!input.description || input.description.trim().length < 15) {
    return { success: false, error: 'Descreva os fatos com no mínimo 15 caracteres para permitir análise.' };
  }

  const admin = getAdminClient();

  // Snapshot inicial do conteúdo alvo para preservação
  let snapshot: Record<string, unknown> | null = null;
  if (input.targetType === 'profile' && input.targetId) {
    const { data: prof } = await admin.from('professional_profiles').select('*').eq('id', input.targetId).single();
    if (prof) snapshot = prof;
  } else if (input.targetType === 'portfolio_image' && input.targetId) {
    const { data: img } = await admin.from('portfolio_images').select('*').eq('id', input.targetId).single();
    if (img) snapshot = img;
  }

  const evidenceHash = snapshot ? crypto.createHash('sha256').update(JSON.stringify(snapshot)).digest('hex') : null;

  const { data, error } = await admin
    .from('takedown_notices')
    .insert({
      category: input.category,
      target_url: input.targetUrl || null,
      target_type: input.targetType,
      target_id: input.targetId || null,
      description: input.description.trim(),
      notifier_name: input.notifierName.trim(),
      notifier_email: input.notifierEmail.trim(),
      good_faith_declaration: true,
      status: 'recebida',
      evidence_snapshot: snapshot,
      evidence_hash: evidenceHash,
      evidence_stored_at: snapshot ? new Date().toISOString() : null,
    })
    .select('protocol')
    .single();

  if (error || !data) {
    return { success: false, error: error?.message || 'Falha ao registrar notificação de conteúdo.' };
  }

  return { success: true, protocol: data.protocol };
}

/**
 * 2. Ação Imediata: Ocultar e Preservar Conteúdo Gravíssimo (R9)
 */
export async function hideAndPreserveContent(
  targetType: string,
  targetId: string,
  reason: string
): Promise<{ success: boolean; evidenceHash?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Não autenticado.' };

  const admin = getAdminClient();

  // Verificar papel de moderador ou admin
  const { data: roleRow } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .in('role', ['admin', 'moderator'])
    .single();

  if (!roleRow) return { success: false, error: 'Acesso restrito à moderação.' };

  let snapshot: Record<string, unknown> = {};

  if (targetType === 'profile') {
    const { data: prof } = await admin.from('professional_profiles').select('*').eq('id', targetId).single();
    snapshot = (prof as Record<string, unknown>) || {};
    // Oculta imediatamente o perfil
    await admin.from('professional_profiles').update({ is_published: false, is_suspended: true }).eq('id', targetId);
  } else if (targetType === 'portfolio_image') {
    const { data: img } = await admin.from('portfolio_images').select('*').eq('id', targetId).single();
    snapshot = (img as Record<string, unknown>) || {};
    // Oculta imagem
    await admin.from('portfolio_images').update({ status: 'rejected' }).eq('id', targetId);
  }

  const hash = crypto.createHash('sha256').update(JSON.stringify(snapshot)).digest('hex');

  // Registrar em moderation_events
  await admin.from('moderation_events').insert({
    target_type: targetType,
    target_id: targetId,
    action: 'hide_and_preserve',
    reason: `[CASO GRAVE/R9] ${reason}`,
    actor_id: user.id,
    metadata: {
      evidence_hash: hash,
      preserved_at: new Date().toISOString(),
      snapshot,
    },
  });

  revalidatePath('/admin/denuncias');
  return { success: true, evidenceHash: hash };
}

/**
 * 3. Exportar Pacote de Evidências Policiais / Judiciais (com 1 Clique no Admin)
 */
export async function exportEvidencePackage(noticeId: string): Promise<{
  success: boolean;
  packageData?: {
    protocol: string;
    category: string;
    hashSha256: string;
    generatedAt: string;
    chainOfCustody: {
      platform: string;
      jurisdiction: string;
      officerResponsibleId: string;
    };
    notification: Record<string, unknown>;
    preservedSnapshot: Record<string, unknown>;
  };
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Acesso negado.' };

  const admin = getAdminClient();

  const { data: roleRow } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .in('role', ['admin', 'moderator'])
    .single();

  if (!roleRow) return { success: false, error: 'Acesso restrito à moderação.' };

  const { data: notice, error } = await admin
    .from('takedown_notices')
    .select('*')
    .eq('id', noticeId)
    .single();

  if (error || !notice) {
    return { success: false, error: 'Notificação não localizada.' };
  }

  const snapshot = notice.evidence_snapshot || {};
  const hash = notice.evidence_hash || crypto.createHash('sha256').update(JSON.stringify(snapshot)).digest('hex');

  const evidencePackage = {
    protocol: notice.protocol,
    category: notice.category,
    hashSha256: hash,
    generatedAt: new Date().toISOString(),
    chainOfCustody: {
      platform: 'Conecta Móveis Jundiaí',
      jurisdiction: 'Comarca de Jundiaí/SP — Brasil',
      officerResponsibleId: user.id,
    },
    notification: {
      protocol: notice.protocol,
      notifierName: notice.notifier_name,
      notifierEmail: notice.notifier_email,
      description: notice.description,
      status: notice.status,
      targetType: notice.target_type,
      targetId: notice.target_id,
      targetUrl: notice.target_url,
      receivedAt: notice.created_at,
      decisionReason: notice.decision_reason,
      decidedAt: notice.decided_at,
    },
    preservedSnapshot: snapshot,
  };

  return { success: true, packageData: evidencePackage };
}

