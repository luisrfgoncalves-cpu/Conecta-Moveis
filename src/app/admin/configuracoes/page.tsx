import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminConfiguracoesClient } from '@/components/admin/AdminConfiguracoesClient';
import {
  getActiveInfraProfile,
  getSystemSettings,
  getFeatureFlags,
} from '@/lib/config/actions';

export const metadata = { title: 'Configurações e Upgrade — Admin' };

export default async function AdminConfiguracoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/entrar');

  const [profile, settings, flags] = await Promise.all([
    getActiveInfraProfile(),
    getSystemSettings(),
    getFeatureFlags(),
  ]);

  return (
    <AdminConfiguracoesClient
      initialProfile={profile}
      initialSettings={settings}
      initialFlags={flags}
    />
  );
}
