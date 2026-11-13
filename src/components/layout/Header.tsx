import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { HeaderClient } from './HeaderClient';

export async function Header() {
  let currentUser: {
    id: string;
    email?: string | null;
    fullName?: string | null;
    avatarUrl?: string | null;
    isAdminOrMod?: boolean;
  } | null = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .maybeSingle();

      const admin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );

      const { data: roleRow } = await admin
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'moderator'])
        .maybeSingle();

      currentUser = {
        id: user.id,
        email: user.email,
        fullName: profile?.full_name || null,
        avatarUrl: profile?.avatar_url || null,
        isAdminOrMod: Boolean(roleRow),
      };
    }
  } catch {
    // Falha tolerante caso Supabase não responda
  }

  return <HeaderClient currentUser={currentUser} />;
}
