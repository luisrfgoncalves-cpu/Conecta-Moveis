'use client';

import { useState } from 'react';
import { Star, Check, X } from 'lucide-react';
import { adminModerateReview } from '@/lib/admin/actions';

interface PendingReviewRow {
  id: string;
  rating_quality: number;
  rating_overall: number;
  comment?: string;
  created_at: string;
  profiles?: { full_name: string };
  professional_profiles?: { display_name: string };
}

export function AdminAvaliacoesClient({ initialReviews }: { initialReviews: PendingReviewRow[] }) {
  const [list, setList] = useState<PendingReviewRow[]>(initialReviews);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [modalAction, setModalAction] = useState<{ id: string; status: 'approved' | 'rejected' } | null>(null);
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleConfirm() {
    if (!modalAction) return;
    if (!reason.trim()) {
      setErrorMsg('O motivo é estritamente obrigatório.');
      return;
    }

    setLoadingId(modalAction.id);
    setErrorMsg('');

    const res = await adminModerateReview(modalAction.id, modalAction.status, reason.trim());

    if (res.success) {
      setList((prev) => prev.filter((r) => r.id !== modalAction.id));
      setModalAction(null);
      setReason('');
    } else {
      setErrorMsg(res.error || 'Erro na operação.');
    }
    setLoadingId(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Star className="w-6 h-6 text-purple-400" />
          Fila de Avaliações em Moderação
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Avaliações retidas por detecção de termos de risco ({list.length} pendentes).
        </p>
      </div>

      {list.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center text-slate-400">
          Nenhuma avaliação aguardando liberação da moderação.
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((rev) => (
            <div key={rev.id} className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-bold text-white">De: {rev.profiles?.full_name || 'Cliente'}</span>
                  <span className="text-slate-400 ml-2">
                    Para: {rev.professional_profiles?.display_name || 'Profissional'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  Média: {((rev.rating_quality + rev.rating_overall) / 2).toFixed(1)}
                </div>
              </div>

              {rev.comment && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                  <p className="font-mono">{rev.comment}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  onClick={() => setModalAction({ id: rev.id, status: 'approved' })}
                  disabled={loadingId === rev.id}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-bold flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  Liberar Avaliação
                </button>
                <button
                  onClick={() => setModalAction({ id: rev.id, status: 'rejected' })}
                  disabled={loadingId === rev.id}
                  className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-bold flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Rejeitar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Justificativa */}
      {modalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white">
              {modalAction.status === 'approved' ? 'Liberar Avaliação' : 'Rejeitar Avaliação'}
            </h3>
            <div>
              <label htmlFor="modal-rev-reason" className="block text-xs font-semibold text-slate-300 mb-1">
                Motivo da decisão (obrigatório para log de auditoria):
              </label>
              <textarea
                id="modal-rev-reason"
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Termo verificado como contexto legítimo / Ofensa confirmada..."
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
              />
              {errorMsg && <p className="text-xs text-red-400 mt-1">{errorMsg}</p>}
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setModalAction(null); setReason(''); setErrorMsg(''); }}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={loadingId !== null}
                className="btn-primary px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

