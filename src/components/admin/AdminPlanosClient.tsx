'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Edit3, Check, AlertCircle, Loader2 } from 'lucide-react';
import { PlanItem, adminUpdatePlanLimits } from '@/lib/plans/actions';

interface AdminPlanosClientProps {
  plans: PlanItem[];
}

export function AdminPlanosClient({ plans }: AdminPlanosClientProps) {
  const router = useRouter();
  const [editingPlan, setEditingPlan] = useState<PlanItem | null>(null);
  const [maxPhotos, setMaxPhotos] = useState<number>(6);
  const [maxCategories, setMaxCategories] = useState<number>(2);
  const [allowFeatured, setAllowFeatured] = useState<boolean>(false);
  const [description, setDescription] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  function startEdit(plan: PlanItem) {
    setEditingPlan(plan);
    setMaxPhotos(plan.max_photos);
    setMaxCategories(plan.max_categories);
    setAllowFeatured(plan.allow_featured);
    setDescription(plan.description || '');
    setReason('');
    setFeedback(null);
  }

  async function handleSave() {
    if (!editingPlan) return;
    if (!reason.trim()) {
      setFeedback({ type: 'error', message: 'A justificativa administrativa é estritamente obrigatória.' });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    const res = await adminUpdatePlanLimits({
      planId: editingPlan.id,
      maxPhotos: Number(maxPhotos),
      maxCategories: Number(maxCategories),
      allowFeatured: Boolean(allowFeatured),
      description: description.trim(),
      reason: reason.trim(),
    });

    setIsLoading(false);

    if (res.success) {
      setFeedback({ type: 'success', message: `Limites do plano "${editingPlan.name}" atualizados com sucesso!` });
      setEditingPlan(null);
      router.refresh();
    } else {
      setFeedback({ type: 'error', message: res.error || 'Erro ao atualizar plano.' });
    }
  }

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((p) => (
          <div key={p.id} className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-sky-400" />
                    {p.name}
                  </h3>
                  <span className="font-mono text-[10px] text-slate-400">ID: {p.id}</span>
                </div>
                <button
                  type="button"
                  onClick={() => startEdit(p)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 transition flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Editar Limites
                </button>
              </div>

              <p className="text-xs text-slate-400 min-h-[32px]">{p.description}</p>

              <div className="space-y-2 text-xs text-slate-300 pt-3 border-t border-white/5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Fotos no portfólio:</span>
                  <span className="font-bold text-white">{p.max_photos} fotos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Categorias simultâneas:</span>
                  <span className="font-bold text-white">{p.max_categories}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Destaque Patrocinado:</span>
                  <span
                    className={`font-bold ${
                      p.allow_featured ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {p.allow_featured ? 'Permitido' : 'Não incluso'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Preço comercial:</span>
                  <span className="font-bold text-slate-300">
                    {p.id === 'free' ? 'Gratuito' : 'A definir'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Edição de Limites */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-lg w-full border border-white/20 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-orange-400" />
                Editar Limites do Plano: {editingPlan.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Todas as alterações alteram as cotas aplicadas no servidor e exigem registro de auditoria.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Limite Máximo de Fotos no Portfólio:
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={maxPhotos}
                  onChange={(e) => setMaxPhotos(Number(e.target.value))}
                  className="w-full bg-slate-900/80 border border-white/15 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Limite Máximo de Categorias:
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={maxCategories}
                  onChange={(e) => setMaxCategories(Number(e.target.value))}
                  className="w-full bg-slate-900/80 border border-white/15 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-slate-300 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowFeatured}
                    onChange={(e) => setAllowFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-500 border-white/20 bg-slate-900"
                  />
                  Habilitar &quot;Destaque Patrocinado&quot; para este plano
                </label>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Descrição do Plano:
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900/80 border border-white/15 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="pt-2 border-t border-white/10">
                <label className="block text-orange-400 font-bold mb-1">
                  Motivo da Alteração (Obrigatório para Auditoria)*:
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: Ajuste de cotas promocionais para a fase de testes."
                  className="w-full bg-slate-900/80 border border-white/15 rounded-xl p-2.5 text-white placeholder-slate-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white transition flex items-center gap-2"
              >
                {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
