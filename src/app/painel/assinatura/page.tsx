import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  getUserSubscriptionDetails,
  getPlansCatalog,
  getProfessionalMetrics,
} from '@/lib/plans/actions';
import { PainelAssinaturaClient } from '@/components/plans/PainelAssinaturaClient';

export const metadata = {
  title: 'Minha Assinatura e Limites — Painel',
};

export default async function PainelAssinaturaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/entrar');

  const subscription = await getUserSubscriptionDetails();
  if (!subscription) redirect('/painel');

  const catalog = await getPlansCatalog();

  // Buscar perfil profissional do usuário para coletar métricas
  const { data: profile } = await supabase
    .from('professional_profiles')
    .select('id, slug')
    .eq('user_id', user.id)
    .maybeSingle();

  const metrics = profile?.id
    ? await getProfessionalMetrics(profile.id)
    : { profileViews: 0, whatsappClicks: 0, contactRequests: 0 };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Minha Assinatura</h1>
        <p className="text-slate-400 text-sm mt-1">
          Acompanhe seu plano ativo, cotas de portfólio e métricas de desempenho.
        </p>
      </div>

      <PainelAssinaturaClient
        subscription={subscription}
        metrics={metrics}
        catalog={catalog}
        profileSlug={profile?.slug ?? null}
      />
    </div>
  );
}

