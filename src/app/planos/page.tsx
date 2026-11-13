import { ShieldCheck, HelpCircle } from 'lucide-react';
import { getPlansCatalog } from '@/lib/plans/actions';
import { createClient } from '@/lib/supabase/server';
import { PlansClient } from '@/components/plans/PlansClient';
import { BackButton } from '@/components/navigation/BackButton';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

export const metadata = {
  title: 'Planos e Visibilidade — Conecta Móveis',
  description:
    'Conheça os planos de visibilidade do Conecta Móveis para montadores, marceneiros e lojas em Jundiaí e região.',
};

export default async function PlanosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const plans = await getPlansCatalog();
  const billingMode = (process.env.BILLING_MODE === 'test' ? 'test' : 'off') as 'off' | 'test';

  // Buscar assinatura atual caso logado
  let currentPlanId = 'free';
  if (user) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();
    if (sub?.plan_id) {
      currentPlanId = sub.plan_id;
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Topo / Voltar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Breadcrumbs items={[{ label: 'Planos e Visibilidade' }]} />
          <BackButton fallback="/" label="Voltar à tela anterior" />
        </div>
        <div className="text-center max-w-3xl mx-auto pt-2">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Planos de Visibilidade Profissional
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mt-3">
            Destaque seu trabalho, apresente seu portfólio completo e seja encontrado por clientes que
            buscam serviços moveleiros de qualidade.
          </p>
        </div>
      </div>

      {/* Grade de Planos com Interatividade */}
      <PlansClient
        plans={plans}
        currentPlanId={currentPlanId}
        isLoggedIn={!!user}
        billingMode={billingMode}
      />

      {/* Seção Informativa de Transparência e FAQ */}
      <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Transparência e Regras da Plataforma
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300 leading-relaxed">
          <div className="space-y-2">
            <h3 className="font-bold text-white flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-sky-400 shrink-0" />
              A plataforma cobra porcentagem sobre serviços?
            </h3>
            <p>
              <strong>Não.</strong> Todo orçamento, negociação, agenda e recebimento de valores
              ocorre diretamente entre o profissional e o cliente contratante, sem comissões ou taxas ocultas.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-white flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-sky-400 shrink-0" />
              O que é o &quot;Destaque Patrocinado&quot;?
            </h3>
            <p>
              É uma ferramenta de visibilidade comercial que posiciona o anunciante nas primeiras
              posições da busca. <strong>Não representa</strong> selo de recomendação técnica ou
              garantia de execução emitida pela plataforma.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

