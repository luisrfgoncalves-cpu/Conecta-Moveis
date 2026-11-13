'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  Images,
  Tag,
  Sparkles,
  Eye,
  MessageSquare,
  PhoneCall,
  ShieldAlert,
  Check,
  AlertCircle,
  Loader2,
  Building2,
} from 'lucide-react';
import {
  UserSubscriptionSummary,
  ProfessionalMetrics,
  PlanItem,
  registerPlanInterest,
  changePlanTestMode,
} from '@/lib/plans/actions';

interface PainelAssinaturaClientProps {
  subscription: UserSubscriptionSummary;
  metrics: ProfessionalMetrics;
  catalog: PlanItem[];
  profileSlug: string | null;
}

export function PainelAssinaturaClient({
  subscription,
  metrics,
  catalog,
  profileSlug,
}: PainelAssinaturaClientProps) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(null);
  const [interestNotes, setInterestNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { entitlements, usage, billingMode } = subscription;

  const photoPercent = Math.min(
    100,
    Math.round((usage.photosCount / (entitlements.maxPhotos || 1)) * 100)
  );
  const catPercent = Math.min(
    100,
    Math.round((usage.categoriesCount / (entitlements.maxCategories || 1)) * 100)
  );

  async function handleTestChangePlan(planId: string) {
    setIsLoading(true);
    setFeedback(null);
    const res = await changePlanTestMode(planId);
    setIsLoading(false);
    if (res.success) {
      setFeedback({
        type: 'success',
        message: 'Plano atualizado com sucesso no modo de teste!',
      });
      router.refresh();
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Erro ao alterar plano.',
      });
    }
  }

  async function submitInterest() {
    if (!selectedPlan) return;
    setIsLoading(true);
    setFeedback(null);
    const res = await registerPlanInterest(
      selectedPlan.id,
      interestNotes.trim() || `Interesse no plano ${selectedPlan.name} registrado via painel.`
    );
    setIsLoading(false);
    if (res.success) {
      setFeedback({
        type: 'success',
        message: `Interesse registrado com sucesso para o plano "${selectedPlan.name}"!`,
      });
      setSelectedPlan(null);
      setInterestNotes('');
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Não foi possível registrar seu interesse.',
      });
    }
  }

  return (
    <div className="space-y-8">
      {/* Banner de Modo de Teste */}
      {billingMode === 'test' ? (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-xs text-amber-200">
              <strong className="block text-amber-300 font-bold text-sm">
                Modo de teste: nenhuma cobrança real
              </strong>
              Você pode alternar entre planos livremente para testar limites e comportamentos no sistema.
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
            A contratação de planos comerciais está em fase de implantação sem cobrança real no MVP.
            Você pode manifestar interesse no plano desejado para garantir condições de lançamento.
          </p>
        </div>
      )}

      {/* Alerta de Feedback */}
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

      {/* Card do Plano Atual */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Plano Ativo
            </span>
            <div className="flex items-center gap-3 mt-1">
              <h2 className="text-2xl font-black text-white">{entitlements.planName}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Ativo
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Investimento atual:</span>
            <span className="text-sm font-bold text-white">
              {entitlements.planId === 'free' ? 'Gratuito' : 'Modo de Teste / A definir'}
            </span>
          </div>
        </div>

        {/* Consumo de Limites (Entitlements x Uso Real) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Cota de Fotos */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Images className="w-4 h-4 text-orange-400" />
                Fotos no Portfólio
              </span>
              <span className="text-xs font-black text-white">
                {usage.photosCount} / {entitlements.maxPhotos}
              </span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  photoPercent >= 90 ? 'bg-amber-500' : 'bg-orange-500'
                }`}
                style={{ width: `${photoPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              {usage.photosCount >= entitlements.maxPhotos
                ? 'Limite máximo atingido para seu plano.'
                : `Você pode cadastrar mais ${entitlements.maxPhotos - usage.photosCount} foto(s).`}
            </p>
          </div>

          {/* Cota de Categorias */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Tag className="w-4 h-4 text-sky-400" />
                Categorias Atendidas
              </span>
              <span className="text-xs font-black text-white">
                {usage.categoriesCount} / {entitlements.maxCategories}
              </span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 transition-all duration-300"
                style={{ width: `${catPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              {usage.categoriesCount >= entitlements.maxCategories
                ? 'Limite de categorias preenchido.'
                : `Você pode atuar em mais ${entitlements.maxCategories - usage.categoriesCount} categoria(s).`}
            </p>
          </div>

          {/* Destaque Patrocinado */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Destaque Patrocinado
              </span>
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  entitlements.canFeature
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-white/10'
                }`}
              >
                {entitlements.canFeature ? 'Habilitado' : 'Indisponível'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {entitlements.canFeature
                ? 'Seu perfil recebe o selo visível "Destaque patrocinado" nas listagens.'
                : 'Disponível nos planos Profissional e Loja ou Marcenaria.'}
            </p>
          </div>
        </div>
      </div>

      {/* Estatísticas Agregadas (Métricas Reais) */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-sky-400" />
            Estatísticas do Seu Perfil
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Consolidado de visualizações e interações geradas através da plataforma.
          </p>
        </div>

        {!profileSlug ? (
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-slate-400">
            Você ainda não completou seu perfil profissional. Complete-o em &quot;Meu Perfil&quot; para começar a acompanhar suas métricas.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Visualizações de Perfil</span>
                <Eye className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-black text-white">{metrics.profileViews}</div>
              <p className="text-[10px] text-slate-500">Acessos à sua página pública</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Cliques no WhatsApp</span>
                <PhoneCall className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white">{metrics.whatsappClicks}</div>
              <p className="text-[10px] text-slate-500">Cliques no botão de contato direto</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Solicitações Recebidas</span>
                <MessageSquare className="w-4 h-4 text-orange-400" />
              </div>
              <div className="text-2xl font-black text-white">{metrics.contactRequests}</div>
              <p className="text-[10px] text-slate-500">Mensagens pela plataforma (90 dias)</p>
            </div>
          </div>
        )}
      </div>

      {/* Outros Planos do Catálogo (Upgrade / Teste) */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-orange-400" />
            Catálogo de Planos
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Compare os limites disponíveis e selecione o plano ideal para a escala do seu negócio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {catalog.map((p) => {
            const isCurrent = p.id === entitlements.planId;
            return (
              <div
                key={p.id}
                className={`p-5 rounded-2xl border space-y-4 flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-orange-500/10 border-orange-500/30'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-base">{p.name}</h3>
                    {p.id === 'enterprise' ? (
                      <Building2 className="w-4 h-4 text-purple-400" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-orange-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{p.description}</p>
                  <ul className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-white/5">
                    <li>• Até {p.max_photos} fotos no portfólio</li>
                    <li>• Até {p.max_categories} categorias</li>
                    <li>
                      • Destaque patrocinado:{' '}
                      <strong>{p.allow_featured ? 'Sim' : 'Não'}</strong>
                    </li>
                  </ul>
                </div>

                <div>
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-white/10 text-slate-400 border border-white/10 cursor-default"
                    >
                      Plano Atual
                    </button>
                  ) : billingMode === 'test' ? (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleTestChangePlan(p.id)}
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white transition flex items-center justify-center gap-2"
                    >
                      {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Testar este plano
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedPlan(p)}
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition"
                    >
                      Manifestar interesse
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal para Manifestar Interesse (BILLING_MODE = 'off') */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-md w-full border border-white/20 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-lg font-black text-white">
                Interesse no Plano {selectedPlan.name}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Ainda não estamos efetuando cobranças online. Registre seu interesse para receber condições prioritárias no lançamento comercial.
              </p>
            </div>

            <div>
              <label htmlFor="notes" className="block text-xs font-bold text-slate-300 mb-1.5">
                Mensagem ou necessidade específica (opcional):
              </label>
              <textarea
                id="notes"
                rows={3}
                value={interestNotes}
                onChange={(e) => setInterestNotes(e.target.value)}
                placeholder="Ex: Gostaria de mais fotos para o portfólio da minha marcenaria."
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
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
