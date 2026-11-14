import { createClient } from '@supabase/supabase-js';
import { scrubPersonalData, sanitizeErrorPayload } from './scrubbing';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export interface LogErrorParams {
  error: unknown;
  path?: string;
  context?: Record<string, unknown>;
  severity?: 'info' | 'warn' | 'error' | 'fatal';
}

/**
 * Registra erro do sistema com prévia anonimização de dados pessoais (LGPD).
 * Execução não-bloqueante e segura (nunca propaga falha caso o log falhe).
 */
export async function logApplicationError({
  error,
  path = '',
  context = {},
  severity = 'error',
}: LogErrorParams): Promise<void> {
  try {
    const { message, stack } = sanitizeErrorPayload(error);
    const sanitizedContext = scrubPersonalData(JSON.stringify(context));

    const admin = getAdminClient();
    if (!admin) {
      console.error(`[AppError][${severity}] ${message}`);
      return;
    }

    await admin.from('app_error_logs').insert({
      error_message: message,
      error_stack: stack ?? null,
      path: path.slice(0, 255),
      context: sanitizedContext,
      severity,
    });
  } catch (loggingErr) {
    // Falha silenciosa para nunca interromper a experiência do usuário
    console.error('[ErrorLogger Fallback]', loggingErr);
  }
}

