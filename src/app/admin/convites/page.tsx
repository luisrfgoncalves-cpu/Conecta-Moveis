import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminConvitesClient } from '@/components/admin/AdminConvitesClient';
import { listInviteLinks } from '@/lib/invites/actions';
import { getAdminUserRole } from '@/lib/admin/actions';

export const metadata = { title: 'Convites & Campanhas — Admin' };

export default async function AdminConvitesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/entrar');

  const { role } = await getAdminUserRole();
  if (!role || (role !== 'owner' && role !== 'admin')) {
    redirect('/admin');
  }

  const res = await listInviteLinks();
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://conectamoveis.com.br';

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-5">
        <h1 className="text-2xl font-black text-white">Convites & Campanhas de Degustação</h1>
        <p className="text-sm text-slate-400">
          Gere links de convite e campanhas promocionais com total controle sobre os dias de degustação.
        </p>
      </div>

      <AdminConvitesClient
        initialInvites={res.invites || []}
        initialStats={res.campaignStats || {}}
        appBaseUrl={appBaseUrl}
      />
    </div>
  );
}

