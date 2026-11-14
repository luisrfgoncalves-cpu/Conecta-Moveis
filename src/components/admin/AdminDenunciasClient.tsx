'use client';

import { useState } from 'react';
import { Flag, ShieldAlert, Download, Archive, CheckCircle2, XCircle } from 'lucide-react';
import { adminResolveReport } from '@/lib/admin/actions';
import { exportEvidencePackage, hideAndPreserveContent } from '@/lib/takedown/actions';

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

interface TakedownRow {
  id: string;
  protocol: string;
  category: string;
  target_type: string;
  target_id?: string;
  target_url?: string;
  description: string;
  notifier_name: string;
  notifier_email: string;
  status: string;
  evidence_hash?: string;
  created_at: string;
}

export function AdminDenunciasClient({
  initialReports,
  initialTakedowns = [],
}: {
  initialReports: ReportRow[];
  initialTakedowns?: TakedownRow[];
}) {
  const [activeTab, setActiveTab] = useState<'takedowns' | 'reports'>('takedowns');
  const [reports, setReports] = useState<ReportRow[]>(initialReports);
  const takedowns = initialTakedowns;
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [modalAction, setModalAction] = useState<{ id: string; action: 'approved' | 'rejected' } | null>(null);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Download de dossiê de evidência (1 clique para polícia/justiça)
  async function handleDownloadEvidence(notice: TakedownRow) {
    setLoadingId(notice.id);
    setErrorMsg('');
    try {
      const res = await exportEvidencePackage(notice.id);
      if (res.success && res.packageData) {
        const jsonStr = JSON.stringify(res.packageData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `EVIDENCIA_${notice.protocol}_CUSTODIA.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setSuccessMsg(`Dossiê policial do protocolo ${notice.protocol} baixado com sucesso!`);
      } else {
        setErrorMsg(res.error || 'Falha ao gerar dossiê.');
      }
    } catch {
      setErrorMsg('Erro inesperado ao gerar dossiê policial.');
    } finally {
      setLoadingId(null);
    }
  }

  // 2. Ocultar e Preservar Imediatamente (R9 caso grave)
  async function handleHideAndPreserve(notice: TakedownRow) {
    if (!notice.target_id) {
      alert('Alvo específico não identificado para isolamento automático.');
      return;
    }
    const confirmAction = confirm(
      `ATENÇÃO: Ação Imediata R9 (Ocultar e Preservar)\n\nIsso suspenderá o conteúdo na hora e registrará hash SHA-256 e snapshot imutável para a polícia e autoridades.\n\nConfirmar isolamento de segurança?`
    );
    if (!confirmAction) return;

    setLoadingId(notice.id);
    const res = await hideAndPreserveContent(
      notice.target_type,
      notice.target_id,
      `Acionado a partir do protocolo ${notice.protocol}: ${notice.category}`
    );

    if (res.success) {
      setSuccessMsg(`Conteúdo ocultado e congelado em custódia! Hash: ${res.evidenceHash?.slice(0, 16)}...`);
    } else {
      setErrorMsg(res.error || 'Falha ao isolar conteúdo.');
    }
    setLoadingId(null);
  }

  // 3. Resolução de denúncia comunitária
  async function handleConfirmReport() {
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
      setReports((prev) => prev.filter((r) => r.id !== modalAction.id));
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-orange-400" />
            Moderação, Notificações & Evidências
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestão formal de notificações (takedown), preservação probatória (R9) e denúncias comunitárias.
          </p>
        </div>

        {/* Abas */}
        <div className="flex gap-2 bg-black/40 p-1 rounded-xl border border-white/10 w-fit">
          <button
            onClick={() => setActiveTab('takedowns')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'takedowns' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Notificações Formais ({takedowns.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'reports' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            Denúncias Rápidas ({reports.length})
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-500/15 border border-red-500/40 text-red-300 rounded-xl text-xs flex items-center gap-2">
          <XCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ABA 1: NOTIFICAÇÕES FORMAIS E EVIdÊNCIAS POLICIAIS */}
      {activeTab === 'takedowns' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-white/10 p-3.5 rounded-xl text-xs text-slate-300 flex items-center justify-between">
            <span>
              ℹ <strong>Pacote de Evidências Policial/Judicial:</strong> Cada notificação formal gera hash criptográfico SHA-256 e pacote em formato JSON compatível para instrução em inquéritos policiais ou ofícios judiciais.
            </span>
          </div>

          {takedowns.length === 0 ? (
            <div className="glass-panel p-12 rounded-2xl text-center text-slate-400">
              Nenhuma notificação formal de conteúdo registrada.
            </div>
          ) : (
            <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">Protocolo / Data</th>
                      <th className="p-3.5">Notificante</th>
                      <th className="p-3.5">Categoria / Alvo</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Custódia (Hash)</th>
                      <th className="p-3.5 text-right">Ações Oficiais</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {takedowns.map((row) => (
                      <tr key={row.id} className="hover:bg-white/5 transition">
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="font-mono font-bold text-orange-400 block">{row.protocol}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(row.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </td>
                        <td className="p-3.5 max-w-[180px]">
                          <span className="font-semibold text-white block truncate">{row.notifier_name}</span>
                          <span className="text-[10px] text-slate-400 truncate block">{row.notifier_email}</span>
                        </td>
                        <td className="p-3.5 max-w-[220px]">
                          <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-amber-300 font-bold mr-1">
                            {row.category}
                          </span>
                          <span className="text-slate-400 text-[11px] block mt-0.5 truncate">
                            {row.target_type}: {row.target_id || row.target_url || 'Link'}
                          </span>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700/60 text-slate-300 uppercase">
                            {row.status}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                          {row.evidence_hash ? (
                            <span className="text-emerald-400 font-bold" title={row.evidence_hash}>
                              ✓ SHA-256 ({row.evidence_hash.slice(0, 8)}...)
                            </span>
                          ) : (
                            <span className="text-slate-500">Sem snapshot</span>
                          )}
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-1.5">
                            {/* Botão Baixar Evidência Policial */}
                            <button
                              onClick={() => handleDownloadEvidence(row)}
                              disabled={loadingId === row.id}
                              title="Baixar pacote de evidências para Polícia ou Justiça (.json)"
                              className="px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 font-bold text-[11px] flex items-center gap-1 border border-blue-500/30"
                            >
                              <Download className="w-3 h-3" />
                              Baixar Evidência (.json)
                            </button>

                            {/* Botão Ocultar e Preservar (R9) */}
                            {row.target_id && (
                              <button
                                onClick={() => handleHideAndPreserve(row)}
                                disabled={loadingId === row.id}
                                title="Ocultar conteúdo imediatamente e congelar custódia probatória (R9)"
                                className="px-2.5 py-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 font-bold text-[11px] flex items-center gap-1 border border-red-500/30"
                              >
                                <Archive className="w-3 h-3" />
                                Ocultar & Preservar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA 2: DENÚNCIAS RÁPIDAS DA COMUNIDADE */}
      {activeTab === 'reports' && (
        <div>
          {reports.length === 0 ? (
            <div className="glass-panel p-12 rounded-2xl text-center text-slate-400">
              Nenhuma denúncia comunitária pendente de análise no momento.
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
                    {reports.map((rep) => (
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
        </div>
      )}

      {/* Modal Justificativa Denúncia Rápida */}
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
                onClick={handleConfirmReport}
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

