'use client';

import { useState } from 'react';
import { Users, ShieldAlert } from 'lucide-react';
import { adminSuspendProfile, adminUnsuspendProfile } from '@/lib/admin/actions';

interface ProfileRow {
  id: string;
  display_name: string;
  slug: string;
  city: string;
  state: string;
  is_published: boolean;
  is_suspended: boolean;
  created_at: string;
}

export function AdminPerfisClient({ initialProfiles }: { initialProfiles: ProfileRow[] }) {
  const [list, setList] = useState<ProfileRow[]>(initialProfiles);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [modalAction, setModalAction] = useState<{ id: string; action: 'suspend' | 'unsuspend'; name: string } | null>(null);
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

    const res = modalAction.action === 'suspend'
      ? await adminSuspendProfile(modalAction.id, reason.trim())
      : await adminUnsuspendProfile(modalAction.id, reason.trim());

    if (res.success) {
      setList((prev) =>
        prev.map((p) =>
          p.id === modalAction.id ? { ...p, is_suspended: modalAction.action === 'suspend' } : p
        )
      );
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
          <Users className="w-6 h-6 text-emerald-400" />
          Gerenciamento de Perfis Profissionais
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Suspenda ou reative perfis cadastrados na plataforma ({list.length} perfis).
        </p>
      </div>

      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Nome</th>
                <th className="p-3.5">Localização</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Suspenso?</th>
                <th className="p-3.5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {list.map((prof) => (
                <tr key={prof.id} className="hover:bg-white/5 transition">
                  <td className="p-3.5 font-bold text-white whitespace-nowrap">{prof.display_name}</td>
                  <td className="p-3.5 text-slate-400 whitespace-nowrap">{prof.city} - {prof.state}</td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      prof.is_published ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-700/50 text-slate-400'
                    }`}>
                      {prof.is_published ? 'Publicado' : 'Rascunho'}
                    </span>
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    {prof.is_suspended ? (
                      <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold">
                        Sim (Suspenso)
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Não</span>
                    )}
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap">
                    {prof.is_suspended ? (
                      <button
                        onClick={() => setModalAction({ id: prof.id, action: 'unsuspend', name: prof.display_name })}
                        disabled={loadingId === prof.id}
                        className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 font-bold text-[11px]"
                      >
                        Reativar
                      </button>
                    ) : (
                      <button
                        onClick={() => setModalAction({ id: prof.id, action: 'suspend', name: prof.display_name })}
                        disabled={loadingId === prof.id}
                        className="px-2.5 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 font-bold text-[11px]"
                      >
                        Suspender
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Justificativa */}
      {modalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-orange-400" />
              {modalAction.action === 'suspend' ? 'Suspender Perfil' : 'Reativar Perfil'}
            </h3>
            <p className="text-xs text-slate-300">
              Perfil alvo: <strong>{modalAction.name}</strong>.
              {modalAction.action === 'suspend'
                ? ' O perfil deixará de aparecer em buscas públicas imediatamente.'
                : ' O perfil voltará a ser indexado na busca pública.'}
            </p>
            <div>
              <label htmlFor="modal-prof-reason" className="block text-xs font-semibold text-slate-300 mb-1">
                Motivo da decisão (obrigatório para log de auditoria):
              </label>
              <textarea
                id="modal-prof-reason"
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Fraude documental confirmada / Regularização atendida..."
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
