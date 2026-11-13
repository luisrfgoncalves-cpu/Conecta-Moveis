import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { AdminBackupClient } from '@/components/admin/AdminBackupClient';

export const metadata = { title: 'Backup & Dados — Admin Conecta Móveis' };

export default async function AdminBackupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/entrar');

  const admin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: roleRow } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!roleRow || roleRow.role !== 'admin') {
    redirect('/admin');
  }

  return <AdminBackupClient />;
}
