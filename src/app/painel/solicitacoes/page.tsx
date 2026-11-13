import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getMyContactRequests } from '@/lib/contact/actions';
import { SolicitacoesManager } from '@/components/contact/SolicitacoesManager';

export const metadata = { title: 'Solicitações de Contato — Conecta Móveis' };

export default async function SolicitacoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/entrar');

  const { data: requests } = await getMyContactRequests();

  return <SolicitacoesManager initialRequests={requests} />;
}

