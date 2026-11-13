'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Sparkles, Building2, UserCheck, ShieldAlert, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { PlanItem, registerPlanInterest, changePlanTestMode } from '@/lib/plans/actions';

interface PlansClientProps {
  plans: PlanItem[];
  currentPlanId?: string;
  isLoggedIn: boolean;
  billingMode: 'off' | 'test';
}

export function PlansClient({
  plans,
  currentPlanId = 'free',
  isLoggedIn,
  billingMode,
}: PlansClientProps) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(null);
  const [interestNotes, setInterestNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  async function handleAction(plan: PlanItem) {
    if (!isLoggedIn) {
      router.push(`/entrar?next=/planos`);
      return;
    }

    if (plan.id === currentPlanId) {
      return;
    }

    if (billingMode === 'test') {
      setIsLoading(true);
      setFeedback(null);
      const res = await changePlanTestMode(plan.id);
      setIsLoading(false);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Plano atualizado com sucesso para "${plan.name}" em modo de teste!`,
        });
        router.refresh();
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Erro ao alterar plano.',
        });
      }
    } else {
      // Modo off: abrir modal de manifestar interesse
      setSelectedPlan(plan);
      setFeedback(null);
    }
  }

  async function submitInterest() {
    if (!selectedPlan) return;
    setIsLoading(true);
    setFeedback(null);
    const res = await registerPlanInterest(
      selectedPlan.id,
      interestNotes.trim() || `Interesse no plano ${selectedPlan.name}`
    );
    setIsLoading(false);
    if (res.success) {
      setFeedback({
        type: 'success',
        message: `Obrigado! Seu interesse no plano "${selectedPlan.name}" foi registrado com sucesso. Entraremos em contato assim que a cobrança estiver liberada.`,
      });
      setSelectedPlan(null);
      setInterestNotes('');
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Não foi possível registrar o interesse.',
      });
    }
  }

  return (
    <div className="space-y-8">
      {/* Banner de Modo de Teste ou Informativo */}
      {billingMode === 'test' ? (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-xs text-amber-200">
              <strong className="block text-amber-300 font-bold text-sm">
                Modo de teste: nenhuma cobrança real
              </strong>
              Você pode trocar de plano livremente para testar limites de fotos, categorias e destaque patrocinado.
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/40">
            TEST MODE
          </span>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-sky-400 shrink-0" />
          <p className="text-xs text-slate-300">
            <strong>Fase MVP:</strong> No momento, a plataforma opera sem cobrança online direta.
            Você pode manifestar interesse nos planos superiores para ter prioridade quando a versão comercial for lançada.
          </p>
        </div>
      )}

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/15 border-red-500/30 text-red-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Grade de Planos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          const isPro = plan.id === 'pro';
          const isEnterprise = plan.id === 'enterprise';

          return (
            <div
              key={plan.id}
              className={`glass-panel p-6 sm:p-8 rounded-3xl border flex flex-col justify-between relative transition-all ${
                isCurrent
                  ? 'border-orange-500/60 ring-1 ring-orange-500/30'
                  : isPro
                  ? 'border-white/20 hover:border-orange-500/40'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                  Seu Plano Atual
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-white">{plan.name}</h3>
                    {isEnterprise && <Building2 className="w-5 h-5 text-purple-400" />}
                    {isPro && <Sparkles className="w-5 h-5 text-orange-400" />}
                    {!isPro && !isEnterprise && <UserCheck className="w-5 h-5 text-slate-400" />}
                  </div>
                  <p className="text-xs text-slate-400 mt-2 min-h-[32px]">
                    {plan.description || 'Plano de visibilidade no Conecta Móveis.'}
                  </p>
                </div>

                {/* Preço (Sem valores inventados) */}
                <div className="pt-2 border-t border-white/10">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">
                    Investimento
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">
                      {plan.id === 'free' ? 'Gratuito' : 'A definir'}
                    </span>
                    {plan.id !== 'free' && (
                      <span className="text-xs text-slate-400">(Sob consulta)</span>
                    )}
                  </div>
                </div>

                {/* Lista de Entitlements e Benefícios */}
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Até <strong>{plan.max_photos} fotos</strong> no portfólio
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Até <strong>{plan.max_categories} categorias</strong> simultâneas
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    {plan.allow_featured ? (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <span className="w-4 h-4 text-slate-600 shrink-0 text-center font-bold">✕</span>
                    )}
                    <span className={plan.allow_featured ? 'text-white' : 'text-slate-500'}>
                      Destaque patrocinado na busca
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    {plan.id !== 'free' ? (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <span className="w-4 h-4 text-slate-600 shrink-0 text-center font-bold">✕</span>
                    )}
                    <span className={plan.id !== 'free' ? 'text-white' : 'text-slate-500'}>
                      Métricas de visualização e cliques
                    </span>
                  </li>
                </ul>
              </div>

              {/* Botão de Ação */}
              <div className="pt-6 border-t border-white/10 mt-6">
                <button
                  type="button"
                  onClick={() => handleAction(plan)}
                  disabled={isLoading || isCurrent}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                    isCurrent
                      ? 'bg-white/5 text-slate-400 cursor-default border border-white/10'
                      : isPro
                      ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isCurrent ? (
                    'Plano Atual'
                  ) : !isLoggedIn ? (
                    <>
                      Criar conta / Entrar
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  ) : billingMode === 'test' ? (
                    'Mudar para este plano (Teste)'
                  ) : (
                    'Manifestar interesse'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal para Manifestar Interesse (BILLING_MODE = 'off') */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-md w-full border border-white/20 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-lg font-black text-white">
                Manifestar Interesse: Plano {selectedPlan.name}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Ainda não estamos processando pagamentos online. Registre seu interesse para ser notificado
                em primeira mão e receber condições especiais no lançamento.
              </p>
            </div>

            <div>
              <label htmlFor="notes" className="block text-xs font-bold text-slate-300 mb-1.5">
                Mensagem ou observações (opcional):
              </label>
              <textarea
                id="notes"
                rows={3}
                value={interestNotes}
                onChange={(e) => setInterestNotes(e.target.value)}
                placeholder="Ex: Tenho uma marcenaria em Jundiaí e gostaria de incluir 20 fotos."
                className="w-full bg-slate-900/80 border border-white/15 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPlan(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={submitInterest}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white transition flex items-center gap-2"
              >
                {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirmar Interesse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
