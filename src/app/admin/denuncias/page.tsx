import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { AdminDenunciasClient } from '@/components/admin/AdminDenunciasClient';

export const metadata = { title: 'Fila de Denúncias e Notificações — Admin' };

export default async function AdminDenunciasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/entrar');

  const admin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const [reportsRes, takedownsRes] = await Promise.all([
    admin
      .from('reports')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true }),
    admin
      .from('takedown_notices')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  return (
    <AdminDenunciasClient
      initialReports={reportsRes.data || []}
      initialTakedowns={takedownsRes.data || []}
    />
  );
}


