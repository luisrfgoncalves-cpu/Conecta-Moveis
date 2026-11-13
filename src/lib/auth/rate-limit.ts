import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

type RateLimitAction = 'signup' | 'login' | 'password_recovery' | 'resend_confirmation';

const LIMITS: Record<RateLimitAction, { max: number; windowMinutes: number }> = {
  signup: { max: 5, windowMinutes: 60 },
  login: { max: 10, windowMinutes: 15 },
  password_recovery: { max: 3, windowMinutes: 60 },
  resend_confirmation: { max: 4, windowMinutes: 30 },
};

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function checkRateLimit(
  action: RateLimitAction,
  identifier?: string
): Promise<{ allowed: boolean }> {
  try {
    const headersList = await headers();
    const ip =
      identifier ??
      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      headersList.get('x-real-ip') ??
      'unknown';

    const limit = LIMITS[action];
    const supabase = getAdminClient();
    const now = new Date();
    const windowDuration = limit.windowMinutes * 60 * 1000;

    const { data: existing } = await supabase
      .from('rate_limits')
      .select('id, hit_count, window_start')
      .eq('identifier', ip)
      .eq('action', action)
      .single();

    if (!existing) {
      await supabase
        .from('rate_limits')
        .insert({ identifier: ip, action, hit_count: 1, window_start: now.toISOString() });
      return { allowed: true };
    }

    const windowExpired =
      now.getTime() - new Date(existing.window_start).getTime() > windowDuration;

    if (windowExpired) {
      await supabase
        .from('rate_limits')
        .update({ hit_count: 1, window_start: now.toISOString() })
        .eq('id', existing.id);
      return { allowed: true };
    }

    if (existing.hit_count >= limit.max) {
      return { allowed: false };
    }

    await supabase
      .from('rate_limits')
      .update({ hit_count: existing.hit_count + 1 })
      .eq('id', existing.id);

    return { allowed: true };
  } catch {
    // Falha silenciosa — nunca bloquear usuário se a checagem falhar
    return { allowed: true };
  }
}

