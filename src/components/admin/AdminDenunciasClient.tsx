'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';
import { adminResolveReport } from '@/lib/admin/actions';

interface ReportRow {
  id: string;
  target_type: string;
  target_id: string;
  reason: string;
  description: string;
  status: string;
  reporter_email?: string;
  created_at: string;
}

export function AdminDenunciasClient({ initialReports }: { initialReports: ReportRow[] }) {
  const [list, setList] = useState<ReportRow[]>(initialReports);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [modalAction, setModalAction] = useState<{ id: string; action: 'approved' | 'rejected' } | null>(null);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleConfirm() {
    if (!modalAction) return;
    if (!reason.trim()) {
      setErrorMsg('O motivo é estritamente obrigatório.');
      return;
    }

    setLoadingId(modalAction.id);
    setErrorMsg('');

    const res = await adminResolveReport(
      modalAction.id,
      modalAction.action,
      notes.trim(),
      reason.trim()
    );

    if (res.success) {
      setList((prev) => prev.filter((r) => r.id !== modalAction.id));
      setModalAction(null);
      setReason('');
      setNotes('');
    } else {
      setErrorMsg(res.error || 'Erro na operação.');
    }
    setLoadingId(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Flag className="w-6 h-6 text-red-400" />
          Fila de Denúncias
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Investigue conteúdos sinalizados pela comunidade ({list.length} pendentes).
        </p>
      </div>

      {list.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center text-slate-400">
          Nenhuma denúncia pendente de análise no momento.
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Data</th>
                  <th className="p-3.5">Alvo</th>
                  <th className="p-3.5">Motivo</th>
                  <th className="p-3.5">Descrição</th>
                  <th className="p-3.5">Contato</th>
                  <th className="p-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {list.map((rep) => (
                  <tr key={rep.id} className="hover:bg-white/5 transition">
                    <td className="p-3.5 whitespace-nowrap text-slate-400">
                      {new Date(rep.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-white/10 font-mono text-[10px] text-orange-400 font-bold">
                        {rep.target_type}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-white max-w-[150px] truncate">{rep.reason}</td>
                    <td className="p-3.5 max-w-[280px] truncate text-slate-300">{rep.description}</td>
                    <td className="p-3.5 text-slate-400 truncate">{rep.reporter_email || 'Anônimo'}</td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setModalAction({ id: rep.id, action: 'approved' })}
                          className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 font-bold text-[11px]"
                        >
                          Procedente
                        </button>
                        <button
                          onClick={() => setModalAction({ id: rep.id, action: 'rejected' })}
                          className="px-2.5 py-1 rounded bg-slate-700/50 text-slate-300 hover:bg-slate-700 font-bold text-[11px]"
                        >
                          Improcedente
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Justificativa */}
      {modalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white">
              {modalAction.action === 'approved' ? 'Marcar Denúncia como Procedente' : 'Marcar como Improcedente'}
            </h3>
            <div>
              <label htmlFor="denuncia-reason" className="block text-xs font-semibold text-slate-300 mb-1">
                Motivo da decisão (obrigatório para log de auditoria):
              </label>
              <textarea
                id="denuncia-reason"
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Conteúdo verificado como falso / Denúncia inconsistente..."
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
              />
            </div>
            <div>
              <label htmlFor="denuncia-notes" className="block text-xs font-semibold text-slate-300 mb-1">
                Notas internas de resolução:
              </label>
              <input
                id="denuncia-notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Perfil advertido por e-mail..."
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              {errorMsg && <p className="text-xs text-red-400 mt-1">{errorMsg}</p>}
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setModalAction(null); setReason(''); setNotes(''); setErrorMsg(''); }}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={loadingId !== null}
                className="btn-primary px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50"
              >
                Confirmar Resolução
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
