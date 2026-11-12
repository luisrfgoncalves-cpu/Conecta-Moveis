import { createBrowserClient } from '@supabase/ssr';
import { env, isSupabaseConfigured } from '@/lib/env';

export function createClient() {
  if (!isSupabaseConfigured) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Supabase não configurado. Operando em modo desacoplado.');
    }
    return null;
  }

  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
