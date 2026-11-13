'use server';

import { createClient } from '@/lib/supabase/server';
import { reportSchema, type ReportInput } from './schemas';

// ===== Rate limit para denúncias =====
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function checkReportRateLimit(identifier: string): Promise<boolean> {
  try {
    const admin = getAdminClient();
    const action = 'report';
    const max = 3;
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
    return true;
  }
}

// ===== Criar denúncia =====
export async function createReport(
  input: ReportInput
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // Rate limit: por user_id (logado) ou por email (anônimo)
  const headersList = await headers();
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headersList.get('x-real-ip') ??
    'unknown';

  const identifier = user ? `report:${user.id}` : `report:ip:${ip}`;
  const allowed = await checkReportRateLimit(identifier);

  if (!allowed) {
    return {
      success: false,
      error: 'Você enviou muitas denúncias recentemente. Aguarde antes de tentar novamente.',
    };
  }

  const admin = getAdminClient();
  const { error } = await admin.from('reports').insert({
    reporter_id: user?.id ?? null,
    reporter_email: !user && parsed.data.reporterEmail ? parsed.data.reporterEmail : null,
    target_type: parsed.data.targetType,
    target_id: parsed.data.targetId,
    reason: parsed.data.reason,
    description: parsed.data.description,
    status: 'pending',
  });

  if (error) {
    return { success: false, error: 'Erro ao registrar denúncia. Tente novamente.' };
  }

  return { success: true };
}

