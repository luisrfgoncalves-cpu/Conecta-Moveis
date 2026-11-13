import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { AdminPerfisClient } from '@/components/admin/AdminPerfisClient';

export const metadata = { title: 'Gestão de Perfis — Admin' };

export default async function AdminPerfisPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/entrar');

  const admin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data } = await admin
    .from('professional_profiles')
    .select('id, display_name, slug, city, state, is_published, is_suspended, created_at, whatsapp, phone, bio, avatar_url')
    .order('created_at', { ascending: false });

  return <AdminPerfisClient initialProfiles={data || []} />;
}

