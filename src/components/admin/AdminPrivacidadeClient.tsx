'use client';

import { useState } from 'react';
import { Shield, Clock, AlertCircle, CheckCircle2, Lock, Trash2, Search, FileText } from 'lucide-react';
import { readApplicationLogsWithAudit, executeRetentionPurge } from '@/lib/lgpd/actions';

interface DSRItem {
  id: string;
  protocol: string;
  request_type: string;
  applicant_name: string;
  applicant_email: string;
  details: string | null;
  status: string;
  deadline_at: string;
  created_at: string;
}

interface AccessLogItem {
  id: number;
  user_id: string | null;
  ip_address: string;
  action: string;
  created_at: string;
  legal_hold: boolean;
}

interface AdminPrivacidadeClientProps {
  initialRequests: DSRItem[];
}

const TYPE_LABELS: Record<string, string> = {
  confirm_treatment: 'Confirmação de Tratamento',
  access_data: 'Acesso e Cópia Completa',
  correction: 'Correção de Dados',
  portability: 'Portabilidade (JSON)',
  revocation_consent: 'Revogação de Consentimento',
  opposition: 'Oposição a Tratamento',
  elimination: 'Eliminação de Dados',
};

export function AdminPrivacidadeClient({ initialRequests }: AdminPrivacidadeClientProps) {
  const [activeTab, setActiveTab] = useState<'dsr' | 'logs' | 'purge'>('dsr');

  // Logs state
  const [justification, setJustification] = useState('');
  const [courtOrderRef, setCourtOrderRef] = useState('');
  const [logs, setLogs] = useState<AccessLogItem[] | null>(null);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logsError, setLogsError] = useState('');

  // Purge state
  const [purging, setPurging] = useState(false);
  const [purgeResult, setPurgeResult] = useState<Record<string, unknown> | null>(null);
  const [purgeError, setPurgeError] = useState('');

  async function handleLoadLogs(e: React.FormEvent) {
    e.preventDefault();
    setLogsError('');
    setLoadingLogs(true);

    const res = await readApplicationLogsWithAudit(justification, courtOrderRef);
    if (res.success && res.logs) {
      setLogs(res.logs);
    } else {
      setLogsError(res.error || 'Falha ao consultar logs.');
    }
    setLoadingLogs(false);
  }

  async function handleRunPurge() {
    if (!confirm('Deseja executar o expurgo de registros expirados (>90d contatos, >180d logs sem trava judicial)?')) {
      return;
    }
    setPurging(true);
    setPurgeError('');
    setPurgeResult(null);

    const res = await executeRetentionPurge();
    if (res.success && res.result) {
      setPurgeResult(res.result);
    } else {
      setPurgeError(res.error || 'Falha ao executar rotina de retenção.');
    }
    setPurging(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-orange-400" />
          LGPD Operacional e Registros de Acesso
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Gestão de direitos dos titulares (Art. 18 LGPD), guarda de registros telemáticos (Art. 15 Marco Civil) e expurgo periódico.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('dsr')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'dsr'
              ? 'bg-orange-500 text-white'
              : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Fila de Titulares ({initialRequests.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'bg-orange-500 text-white'
              : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Registros de Acesso (Restrito)</span>
        </button>
        <button
          onClick={() => setActiveTab('purge')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'purge'
              ? 'bg-orange-500 text-white'
              : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Retenção & Expurgo</span>
        </button>
      </div>

      {/* Tab 1: Fila DSR */}
      {activeTab === 'dsr' && (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Protocolo</th>
                  <th className="p-3.5">Data</th>
                  <th className="p-3.5">Solicitante</th>
                  <th className="p-3.5">Tipo de Pedido</th>
                  <th className="p-3.5">Prazo Legal (15d)</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {initialRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      Nenhum pedido de titular pendente na fila.
                    </td>
                  </tr>
                ) : (
                  initialRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-white/5 transition">
                      <td className="p-3.5 font-mono font-bold text-orange-400">
                        {req.protocol}
                      </td>
                      <td className="p-3.5 text-slate-400 whitespace-nowrap">
                        {new Date(req.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-white">{req.applicant_name}</div>
                        <div className="text-[11px] text-slate-400">{req.applicant_email}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] text-slate-200">
                          {TYPE_LABELS[req.request_type] || req.request_type}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-300 whitespace-nowrap">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Clock className="w-3 h-3 text-orange-400" />
                          {new Date(req.deadline_at).toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          req.status === 'aberto'
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                            : req.status === 'concluido'
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-500/10 text-slate-300 border border-slate-500/30'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Logs de Acesso com Auditoria Mandatória */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-200 text-xs flex items-start gap-3">
            <Lock className="w-4 h-4 shrink-0 mt-0.5 text-orange-400" />
            <div>
              <strong>Acesso Restrito e Auditado (Marco Civil Art. 15):</strong> Os registros de acesso à aplicação contêm endereços IP e identificadores telemáticos. Em respeito aos princípios da LGPD, a leitura exige justificativa fundamentada de no mínimo 15 caracteres, que fica permanentemente registrada em livro de auditoria.
            </div>
          </div>

          <form onSubmit={handleLoadLogs} className="glass-panel rounded-2xl p-5 border border-white/10 space-y-3">
            <div>
              <label htmlFor="justification" className="block text-xs font-semibold text-slate-300 mb-1">
                Justificativa Formal para a Consulta * (mínimo 15 caracteres)
              </label>
              <textarea
                id="justification"
                rows={2}
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Exemplo: Atendimento formal ao Ofício Policial nº 123/2026 da 1ª Delegacia de Jundiaí"
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                required
              />
            </div>

            <div>
              <label htmlFor="courtOrderRef" className="block text-xs font-semibold text-slate-300 mb-1">
                Referência do Ofício / Processo Judicial (opcional)
              </label>
              <input
                id="courtOrderRef"
                type="text"
                value={courtOrderRef}
                onChange={(e) => setCourtOrderRef(e.target.value)}
                placeholder="Exemplo: Processo nº 0001234-56.2026.8.26.0309"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {logsError && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{logsError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loadingLogs || justification.trim().length < 15}
              className="btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{loadingLogs ? 'Auditando e Consultando...' : 'Registrar Motivo e Acessar Logs'}</span>
            </button>
          </form>

          {logs && (
            <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-3 bg-white/5 border-b border-white/10 text-xs font-bold text-white flex items-center justify-between">
                <span>Registros Localizados ({logs.length})</span>
                <span className="text-[11px] text-slate-400">Guarda legal de 6 meses</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Data/Hora</th>
                      <th className="p-3">IP Telemático</th>
                      <th className="p-3">Ação</th>
                      <th className="p-3">ID do Usuário</th>
                      <th className="p-3">Trava Judicial</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-500">
                          Nenhum log gravado ainda.
                        </td>
                      </tr>
                    ) : (
                      logs.map((item) => (
                        <tr key={item.id} className="hover:bg-white/5">
                          <td className="p-3 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                            {new Date(item.created_at).toLocaleString('pt-BR')}
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-400">
                            {item.ip_address}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono text-[10px]">
                              {item.action}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[10px] text-slate-400">
                            {item.user_id || 'anônimo'}
                          </td>
                          <td className="p-3">
                            {item.legal_hold ? (
                              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold">
                                PRESERVADO (HOLD)
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[10px]">Normal (180d)</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Retenção e Expurgo */}
      {activeTab === 'purge' && (
        <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-orange-400" />
            Rotina de Retenção Legal e Expurgo
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            A LGPD e o Marco Civil determinam que dados não devem ser retidos indefinidamente. A função programada de expurgo aplica as seguintes diretrizes:
          </p>

          <ul className="list-disc pl-5 text-xs text-slate-400 space-y-1">
            <li><strong>Solicitações de contato:</strong> Purgadas após 90 dias de envio;</li>
            <li><strong>Logs de acesso à aplicação:</strong> Purgados após 180 dias (6 meses), <strong>exceto</strong> os registros marcados com trava de preservação judicial (<code className="text-orange-400 font-mono">legal_hold = true</code>);</li>
            <li><strong>Contas inativas:</strong> Não sofrem exclusão automática sem decisão expressa do administrador.</li>
          </ul>

          {purgeResult && (
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Expurgo Executado com Sucesso!</span>
              </div>
              <p>Contatos purgados (&gt;90d): <strong>{String(purgeResult.purged_contacts_90d ?? 0)}</strong></p>
              <p>Logs telemáticos purgados (&gt;180d sem hold): <strong>{String(purgeResult.purged_access_logs_180d ?? 0)}</strong></p>
            </div>
          )}

          {purgeError && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{purgeError}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleRunPurge}
              disabled={purging}
              className="btn-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{purging ? 'Executando...' : 'Disparar Rotina de Expurgo Agora'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

