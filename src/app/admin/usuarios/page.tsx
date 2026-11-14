import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminUsuariosClient } from '@/components/admin/AdminUsuariosClient';
import { getAdminUserRole, searchAdminUsers } from '@/lib/admin/actions';

export const metadata = { title: 'Gestão de Usuários — Admin' };

export default async function AdminUsuariosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/entrar');

  const { role } = await getAdminUserRole();
  const res = await searchAdminUsers();

  return (
    <AdminUsuariosClient
      initialUsers={res.users || []}
      currentUserRole={role || 'user'}
    />
  );
}
