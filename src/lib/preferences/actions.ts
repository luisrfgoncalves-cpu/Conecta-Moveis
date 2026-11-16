'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export type UserIntent = 'procurar' | 'divulgar' | 'ambos';

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * Salva a preferência de intenção do usuário autenticado.
 * Apenas preferência de navegação/contexto, NÃO é papel/permissão de segurança.
 */
export async function saveUserIntent(intent: UserIntent): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Usuário não autenticado.' };
  }

  const admin = getAdminClient();
  const { error } = await admin
    .from('user_preferences')
    .upsert(
      {
        user_id: user.id,
        intent,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

  if (error) {
    return { success: false, error: 'Não foi possível salvar sua preferência.' };
  }

  return { success: true };
}

/**
 * Obtém a preferência de intenção salva para o usuário autenticado.
 */
export async function getUserIntent(): Promise<UserIntent | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const admin = getAdminClient();
  const { data, error } = await admin
    .from('user_preferences')
    .select('intent')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !data) return null;
  return data.intent as UserIntent;
}
