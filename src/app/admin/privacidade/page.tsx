import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { AdminPrivacidadeClient } from '@/components/admin/AdminPrivacidadeClient';

export const metadata = { title: 'LGPD & Titulares — Admin' };

export default async function AdminPrivacidadePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/entrar');

  const admin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: requests } = await admin
    .from('data_subject_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  return <AdminPrivacidadeClient initialRequests={requests || []} />;
}
