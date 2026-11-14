import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminCapacidadeClient } from '@/components/admin/AdminCapacidadeClient';
import { getLiveCapacityMetrics } from '@/lib/capacity/metrics';

export const metadata = {
  title: 'Painel de Capacidade e Infraestrutura — Admin',
};

export default async function AdminCapacidadePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/entrar');
  }

  const metrics = await getLiveCapacityMetrics();

  return <AdminCapacidadeClient initialMetrics={metrics} />;
}

