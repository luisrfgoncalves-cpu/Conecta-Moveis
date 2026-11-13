/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { contactRequestSchema, type ContactRequestInput } from './schemas';

// ===== Rate limit helper =====
function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function checkContactRateLimit(identifier: string): Promise<boolean> {
  try {
    const admin = getAdminClient();
    const action = 'contact_request';
    const max = 5;
    const windowMinutes = 60;
    const now = new Date();
    const windowDuration = windowMinutes * 60 * 1000;

    const { data: existing } = await admin
      .from('rate_limits')
      .select('id, hit_count, window_start')
      .eq('identifier', identifier)
      .eq('action', action)
      .single();

    if (!existing) {
      await admin
        .from('rate_limits')
        .insert({ identifier, action, hit_count: 1, window_start: now.toISOString() });
      return true;
    }

    const windowExpired =
      now.getTime() - new Date(existing.window_start).getTime() > windowDuration;

    if (windowExpired) {
      await admin
        .from('rate_limits')
        .update({ hit_count: 1, window_start: now.toISOString() })
        .eq('id', existing.id);
      return true;
    }

    if (existing.hit_count >= max) return false;

    await admin
      .from('rate_limits')
      .update({ hit_count: existing.hit_count + 1 })
      .eq('id', existing.id);

    return true;
  } catch {
    return true; // Nunca bloquear por falha de infra
  }
}

// ===== Registrar clique WhatsApp =====
export async function trackWhatsAppClick(
  profileId: string
): Promise<{ success: boolean }> {
  try {
    const admin = getAdminClient();
    const today = new Date().toISOString().slice(0, 10);
    await admin.from('daily_metrics').upsert(
      {
        date: today,
        metric_name: 'whatsapp_click',
        dimension: profileId,
        counter: 1,
      },
      {
        onConflict: 'date,metric_name,dimension',
        ignoreDuplicates: false,
      }
    );
    // Incrementar se já existe — upsert não incrementa, usar RPC
    await admin.rpc('increment_daily_metric', {
      p_date: today,
      p_metric: 'whatsapp_click',
      p_dimension: profileId,
    }).maybeSingle();
  } catch {
    // Contador não-crítico — falha silenciosa
  }
  return { success: true };
}

// ===== Criar solicitação de contato =====
export async function createContactRequest(
  input: ContactRequestInput
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Você precisa estar logado para enviar uma solicitação.' };
  }

  // Validação
  const parsed = contactRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // Rate limit por user_id
  const allowed = await checkContactRateLimit(`contact:${user.id}`);
  if (!allowed) {
    return {
      success: false,
      error: 'Você enviou muitas solicitações. Aguarde 1 hora antes de tentar novamente.',
    };
  }

  // Verificar se o perfil existe e está publicado
  const { data: profile } = await supabase
    .from('professional_profiles')
    .select('id, user_id')
    .eq('id', parsed.data.profileId)
    .eq('is_published', true)
    .eq('is_suspended', false)
    .single();

  if (!profile) {
    return { success: false, error: 'Perfil não encontrado.' };
  }

  // Não enviar mensagem para si mesmo
  if (profile.user_id === user.id) {
    return { success: false, error: 'Você não pode enviar uma solicitação para seu próprio perfil.' };
  }

  const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase.from('contact_requests').insert({
    sender_id: user.id,
    profile_id: parsed.data.profileId,
    message: parsed.data.message,
    expires_at: expiresAt,
  });

  if (error) {
    return { success: false, error: 'Erro ao enviar solicitação. Tente novamente.' };
  }

  // Aviso por e-mail: só se SMTP configurado
  await notifyProfessionalByEmail(profile.id);

  return { success: true };
}

// ===== Notificação por e-mail (somente se SMTP configurado) =====
async function notifyProfessionalByEmail(_profileId: string): Promise<void> {
  const smtpConfigured =
    process.env.SMTP_HOST &&
    process.env.SMTP_HOST !== '' &&
    process.env.SMTP_HOST !== 'pending';

  if (!smtpConfigured) {
    // SMTP não configurado — apenas painel, sem fingir envio
    return;
  }

  // TODO Fase 9+: implementar envio real via Resend/Nodemailer
  // quando SMTP estiver configurado
}

// ===== Listar solicitações do profissional =====
export interface ContactRequestItem {
  id: string;
  message: string;
  is_read: boolean;
  is_archived: boolean;
  expires_at: string;
  created_at: string;
  sender: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

export async function getMyContactRequests(): Promise<{
  data: ContactRequestItem[];
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: [], error: 'Não autenticado.' };

  // Buscar o perfil profissional do usuário
  const { data: profile } = await supabase
    .from('professional_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) return { data: [] };

  const { data, error } = await supabase
    .from('contact_requests')
    .select(`
      id,
      message,
      is_read,
      is_archived,
      expires_at,
      created_at,
      profiles!sender_id (
        id,
        full_name,
        email,
        avatar_url
      )
    `)
    .eq('profile_id', profile.id)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) return { data: [], error: 'Erro ao carregar solicitações.' };

  return {
    data: (data || []).map((item: any) => ({
      id: item.id,
      message: item.message,
      is_read: item.is_read,
      is_archived: item.is_archived,
      expires_at: item.expires_at,
      created_at: item.created_at,
      sender: item.profiles,
    })),
  };
}

// ===== Marcar solicitação como lida =====
export async function markContactRequestRead(
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Não autenticado.' };

  const { error } = await supabase
    .from('contact_requests')
    .update({ is_read: true })
    .eq('id', requestId);

  return error
    ? { success: false, error: 'Erro ao atualizar.' }
    : { success: true };
}

// ===== Arquivar solicitação =====
export async function archiveContactRequest(
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Não autenticado.' };

  const { error } = await supabase
    .from('contact_requests')
    .update({ is_archived: true })
    .eq('id', requestId);

  return error
    ? { success: false, error: 'Erro ao arquivar.' }
    : { success: true };
}

