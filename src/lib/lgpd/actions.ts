'use server';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * 1. Gravar Registro de Acesso a Aplicação (Marco Civil, Art. 15)
 * Apenas em eventos de autenticação e ações de escrita
 */
export async function logApplicationAccess(
  action: string,
  resourceType?: string,
  resourceId?: string,
  metadata: Record<string, unknown> = {}
) {
  try {
    const headerList = await headers();
    const forwardedFor = headerList.get('x-forwarded-for');
    const realIp = headerList.get('x-real-ip');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : (realIp || '127.0.0.1');
    const userAgent = headerList.get('user-agent') || 'desconhecido';

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const admin = getAdminClient();
    await admin.from('app_access_logs').insert({
      user_id: user?.id || null,
      ip_address: ipAddress,
      action,
      resource_type: resourceType || null,
      resource_id: resourceId || null,
      user_agent: userAgent.slice(0, 255),
      metadata,
    });
  } catch {
    // Falha silenciosa para não quebrar a transação de usuário se log falhar
  }
}

export type DSRType =
  | 'confirm_treatment'
  | 'access_data'
  | 'correction'
  | 'portability'
  | 'revocation_consent'
  | 'opposition'
  | 'elimination';

/**
 * 2. Criar Solicitação de Direitos do Titular de Dados (LGPD Art. 18 / 19)
 */
export async function createDataSubjectRequest(type: DSRType, details?: string): Promise<{
  success: boolean;
  protocol?: string;
  deadline?: string;
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Faça login para exercer seus direitos como titular.' };

  const admin = getAdminClient();

  // Buscar perfil para preencher nome
  const { data: profile } = await admin.from('profiles').select('full_name').eq('id', user.id).single();
  const applicantName = profile?.full_name || user.email?.split('@')[0] || 'Usuário';

  const { data, error } = await admin
    .from('data_subject_requests')
    .insert({
      user_id: user.id,
      request_type: type,
      applicant_name: applicantName,
      applicant_email: user.email!,
      details: details?.trim() || null,
      status: 'aberto',
    })
    .select('protocol, deadline_at')
    .single();

  if (error || !data) {
    return { success: false, error: error?.message || 'Falha ao registrar pedido de privacidade.' };
  }

  // Gravar registro telemático do pedido
  await logApplicationAccess('lgpd.dsr_created', 'data_subject_requests', data.protocol);

  revalidatePath('/painel/seguranca');
  return {
    success: true,
    protocol: data.protocol,
    deadline: new Date(data.deadline_at).toLocaleDateString('pt-BR'),
  };
}

/**
 * 3. Consulta restrita aos Logs de Acesso com Justificativa Formal (Marco Civil / LGPD)
 */
export async function readApplicationLogsWithAudit(
  justification: string,
  courtOrderRef?: string
): Promise<{
  success: boolean;
  logs?: Array<{
    id: number;
    user_id: string | null;
    ip_address: string;
    action: string;
    created_at: string;
    legal_hold: boolean;
  }>;
  error?: string;
}> {
  if (!justification || justification.trim().length < 15) {
    return { success: false, error: 'A justificativa formal auditada (mínimo 15 caracteres) é estritamente obrigatória.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Acesso negado.' };

  const admin = getAdminClient();

  // Verificar papel de admin
  const { data: roleRow } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .single();

  if (!roleRow) return { success: false, error: 'Apenas administradores podem auditar logs.' };

  // Buscar os logs recentes (limite seguro)
  const { data: logs, error } = await admin
    .from('app_access_logs')
    .select('id, user_id, ip_address, action, created_at, legal_hold')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return { success: false, error: error.message };

  // Registrar auditoria da leitura no livro restrito
  await admin.from('app_access_log_reads').insert({
    actor_id: user.id,
    justification: justification.trim(),
    court_order_ref: courtOrderRef?.trim() || null,
    rows_examined: logs?.length || 0,
  });

  return { success: true, logs: logs || [] };
}

/**
 * 4. Disparo Manual ou Periódico de Purge de Dados Expirados
 */
export async function executeRetentionPurge(): Promise<{
  success: boolean;
  result?: Record<string, unknown>;
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Acesso não autorizado.' };

  const admin = getAdminClient();

  const { data: roleRow } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .single();

  if (!roleRow) return { success: false, error: 'Acesso restrito ao administrador.' };

  const { data, error } = await admin.rpc('purge_expired_records');

  if (error) return { success: false, error: error.message };

  return { success: true, result: data as Record<string, unknown> };
}

