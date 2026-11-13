import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getMyReviewsData } from '@/lib/reviews/actions';
import { AvaliacoesManager } from '@/components/reviews/AvaliacoesManager';

export const metadata = { title: 'Avaliações — Conecta Móveis' };

export default async function AvaliacoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/entrar');

  const { received, given, isProfessional } = await getMyReviewsData();

  return (
    <AvaliacoesManager
      received={received}
      given={given}
      isProfessional={isProfessional}
    />
  );
}

