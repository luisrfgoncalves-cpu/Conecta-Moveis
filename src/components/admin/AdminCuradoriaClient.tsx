'use client';

import { useState, useTransition } from 'react';
import {
  UnifiedQueueItem,
  PlanEqualityMetric,
  TransparencyReport,
  ComplianceReason,
} from '@/lib/curadoria/schemas';
import {
  approveComplianceItem,
  rejectComplianceItem,
  hideAndPreserveSeverity,
} from '@/lib/curadoria/actions';
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  BarChart2,
  AlertOctagon,
  Sparkles,
  Loader2,
  X,
} from 'lucide-react';

interface AdminCuradoriaClientProps {
  initialQueue: UnifiedQueueItem[];
  equalityMetrics: PlanEqualityMetric[];
  transparencyReport: TransparencyReport;
  reasons: ComplianceReason[];
}

export function AdminCuradoriaClient({
  initialQueue,
  equalityMetrics,
  transparencyReport,
  reasons,
}: AdminCuradoriaClientProps) {
  const [activeTab, setActiveTab] = useState<'fila' | 'igualdade' | 'transparencia'>('fila');
  const [queue, setQueue] = useState<UnifiedQueueItem[]>(initialQueue);
  const [isPending, startTransition] = useTransition();

  // Estados dos modais de ação
  const [selectedItem, setSelectedItem] = useState<UnifiedQueueItem | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedReasonCode, setSelectedReasonCode] = useState<string>(reasons[0]?.code || '');
  const [rejectNotes, setRejectNotes] = useState<string>('');

  const [preserveModalOpen, setPreserveModalOpen] = useState(false);
  const [preserveDetails, setPreserveDetails] = useState<string>('');
  const [preservedHashResult, setPreservedHashResult] = useState<string | null>(null);

  const [actionError, setActionError] = useState<string | null>(null);

  const selectedReason = reasons.find((r) => r.code === selectedReasonCode);

  const gravissimosCount = queue.filter((i) => i.severity === 'gravissimo').length;
  const atrasadosCount = queue.filter((i) => i.is_delayed).length;

  function handleApprove(item: UnifiedQueueItem) {
    if (!confirm(`Confirmar aprovação de conformidade para "${item.title}"?`)) return;
    setActionError(null);

    startTransition(async () => {
      const result = await approveComplianceItem({
        itemId: item.id,
        itemType: item.item_type,
        targetUserId: item.target_user_id,
        notes: 'Liberado em conformidade com as regras públicas da plataforma.',
      });

      if (result.success) {
        setQueue((prev) => prev.filter((i) => i.id !== item.id));
      } else {
        setActionError(result.error || 'Falha ao aprovar item.');
      }
    });
  }

  function handleRejectSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedItem) return;
    setActionError(null);

    startTransition(async () => {
      const result = await rejectComplianceItem({
        itemId: selectedItem.id,
        itemType: selectedItem.item_type,
        targetUserId: selectedItem.target_user_id,
        reasonCode: selectedReasonCode,
        notes: rejectNotes.trim() || undefined,
      });

      if (result.success) {
        setQueue((prev) => prev.filter((i) => i.id !== selectedItem.id));
        setRejectModalOpen(false);
        setSelectedItem(null);
        setRejectNotes('');
      } else {
        setActionError(result.error || 'Falha ao rejeitar item.');
      }
    });
  }

  function handlePreserveSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedItem) return;
    setActionError(null);

    startTransition(async () => {
      const result = await hideAndPreserveSeverity({
        itemId: selectedItem.id,
        itemType: selectedItem.item_type,
        targetUserId: selectedItem.target_user_id,
        details: preserveDetails.trim() || 'Ocultação imediata e preservação de evidência criminal.',
      });

      if (result.success && result.evidenceHash) {
        setPreservedHashResult(result.evidenceHash);
        setQueue((prev) => prev.filter((i) => i.id !== selectedItem.id));
      } else {
        setActionError(result.error || 'Falha ao executar ação gravíssima.');
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Cards de Métricas e SLA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Fila de Conformidade</span>
            <FileText className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{queue.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Itens aguardando checagem</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Casos Gravíssimos</span>
            <AlertOctagon className="w-4 h-4 text-red-400" />
          </div>
          <div className={`text-2xl font-black ${gravissimosCount > 0 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
            {gravissimosCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">SLA emergencial: 2 horas</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Alertas de Atraso</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className={`text-2xl font-black ${atrasadosCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {atrasadosCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {atrasadosCount > 0 ? 'Excederam o prazo de resposta' : 'Todas as filas dentro do prazo'}
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Revisão Prévia Paga (R6)</span>
            <Sparkles className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {queue.filter((i) => i.item_type === 'perfil_pago').length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Destaques pendentes de checagem</p>
        </div>
      </div>

      {/* Navegação entre Abas */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          onClick={() => setActiveTab('fila')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'fila'
              ? 'border-orange-500 text-orange-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Fila Unificada ({queue.length})
        </button>

        <button
          onClick={() => setActiveTab('igualdade')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'igualdade'
              ? 'border-orange-500 text-orange-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          Isonomia entre Planos (R14 e R20)
        </button>

        <button
          onClick={() => setActiveTab('transparencia')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'transparencia'
              ? 'border-orange-500 text-orange-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          Relatório de Transparência Anual
        </button>
      </div>

      {actionError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-red-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ABA 1: FILA UNIFICADA */}
      {activeTab === 'fila' && (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-bold text-white">Central de Moderação e Curadoria</h2>
              <p className="text-xs text-slate-400">
                A curadoria avalia estritamente conformidade legal e técnica (regras públicas), nunca mérito ou qualidade.
              </p>
            </div>
          </div>

          {queue.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="font-semibold text-white">Fila de curadoria zerada!</p>
              <p className="text-xs text-slate-500 mt-1">Todos os itens e destaques foram revisados.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {queue.map((item) => {
                const isGravissimo = item.severity === 'gravissimo';
                const isAlto = item.severity === 'alto';

                return (
                  <div
                    key={item.id}
                    className={`py-4 px-4 rounded-xl transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      isGravissimo
                        ? 'bg-red-500/10 border border-red-500/30 my-2'
                        : item.is_delayed
                        ? 'bg-amber-500/5 hover:bg-white/[0.02]'
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Badge de Gravidade */}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                            isGravissimo
                              ? 'bg-red-500/30 text-red-300 border border-red-500/50 animate-pulse'
                              : isAlto
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {item.severity}
                        </span>

                        {/* Tipo de Conteúdo */}
                        <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-slate-300 uppercase font-mono">
                          {item.item_type}
                        </span>

                        {/* Plano do Alvo */}
                        <span className="px-2 py-0.5 rounded text-[10px] bg-orange-500/20 text-orange-400 uppercase font-bold">
                          Plano: {item.target_plan_code}
                        </span>

                        {/* SLA / Atraso */}
                        {item.is_delayed ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Atrasado (+{item.hours_elapsed - item.sla_hours}h)
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Aberto há {item.hours_elapsed}h (SLA: {item.sla_hours}h)
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-white text-sm">{item.title}</h3>
                      <p className="text-xs text-slate-300 leading-relaxed">{item.summary}</p>
                      <p className="text-[11px] text-slate-400">
                        Anunciante: <strong className="text-slate-200">{item.target_user_name}</strong>
                      </p>
                    </div>

                    {/* Botões de Ação de Curadoria */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isGravissimo ? (
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setPreserveDetails('');
                            setPreservedHashResult(null);
                            setPreserveModalOpen(true);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-red-900/40 transition"
                        >
                          <AlertOctagon className="w-4 h-4" />
                          Ocultar e Preservar
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleApprove(item)}
                            disabled={isPending}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Aprovar
                          </button>

                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setRejectNotes('');
                              setRejectModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Rejeitar com Motivo
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ABA 2: ISONOMIA ENTRE PLANOS (R14 e R20) */}
      {activeTab === 'igualdade' && (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Auditoria Mensal de Isonomia de Tratamento</h2>
            <p className="text-xs text-slate-400">
              Demonstração técnica da aplicação uniforme das regras: planos comerciais não possuem privilégio,
              imunidade ou complacência em relação ao plano gratuito.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-white/5 uppercase text-[11px] tracking-wider text-slate-400 border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Plano Comercial</th>
                  <th className="py-3 px-4">Ações Auditadas</th>
                  <th className="py-3 px-4">Aprovações</th>
                  <th className="py-3 px-4">Remoções / Rejeições</th>
                  <th className="py-3 px-4">Taxa de Remoção</th>
                  <th className="py-3 px-4">Tempo Médio</th>
                  <th className="py-3 px-4">Conformidade Isonômica</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {equalityMetrics.map((metric) => (
                  <tr key={metric.plan_code} className="hover:bg-white/[0.02] transition">
                    <td className="py-3 px-4 font-bold text-white capitalize">{metric.plan_code}</td>
                    <td className="py-3 px-4 font-mono text-xs">{metric.total_actions}</td>
                    <td className="py-3 px-4 font-mono text-xs text-emerald-400">{metric.approvals_count}</td>
                    <td className="py-3 px-4 font-mono text-xs text-red-400">{metric.removals_count}</td>
                    <td className="py-3 px-4 font-mono text-xs font-semibold">{metric.removal_rate}%</td>
                    <td className="py-3 px-4 text-xs text-slate-400">{metric.avg_resolution_hours} horas</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                        Regra R14 Ativa
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 3: RELATÓRIO ANUAL DE TRANSPARÊNCIA */}
      {activeTab === 'transparencia' && (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Relatório Anual de Transparência ({transparencyReport.year})</h2>
              <p className="text-xs text-slate-400">
                Métricas agregadas sobre moderação de conteúdo e atendimento a notificações legais,
                sem exposição de dados pessoais (em conformidade com a LGPD e Marco Civil).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Notificações e Denúncias Recebidas</span>
              <div className="text-2xl font-black text-white mt-1">{transparencyReport.total_received}</div>
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Remoções / Adequações Atendidas</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">{transparencyReport.total_accepted}</div>
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Tempo Médio de Atendimento</span>
              <div className="text-2xl font-black text-white mt-1">{transparencyReport.avg_response_hours} horas</div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white mb-3">Distribuição por Categoria de Violação</h3>
            <div className="space-y-2">
              {Object.entries(transparencyReport.category_breakdown).map(([category, count]) => (
                <div
                  key={category}
                  className="bg-black/30 p-3 rounded-xl border border-white/10 flex items-center justify-between text-xs"
                >
                  <span className="font-mono text-slate-300">{category}</span>
                  <span className="font-bold text-white">{count} ocorrências</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Rejeitar com Motivo da Biblioteca Pública */}
      {rejectModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-white/20 bg-slate-900 max-w-lg w-full relative shadow-2xl">
            <button
              onClick={() => {
                setRejectModalOpen(false);
                setSelectedItem(null);
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Rejeição por Não Conformidade</h3>
            <p className="text-xs text-slate-400 mb-4">{selectedItem.title}</p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Motivo da Decisão (Biblioteca Pública de Políticas)
                </label>
                <select
                  value={selectedReasonCode}
                  onChange={(e) => setSelectedReasonCode(e.target.value)}
                  className="w-full bg-black/40 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {reasons.map((r) => (
                    <option key={r.code} value={r.code} className="bg-slate-900 text-white">
                      [{r.policy_source}] {r.title}
                    </option>
                  ))}
                </select>
              </div>

              {selectedReason && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-2">
                  <div className="text-xs text-slate-300">
                    <strong className="text-white">Descrição da regra:</strong> {selectedReason.description}
                  </div>
                  <div className="text-xs text-slate-400">
                    <strong className="text-orange-400">Mensagem que o anunciante receberá:</strong>
                    <p className="mt-1 italic bg-black/30 p-2.5 rounded-lg border border-white/5">
                      {selectedReason.advertiser_message_template}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Observações Internas Adicionais <span className="text-slate-500">(opcional)</span>
                </label>
                <textarea
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  placeholder="Detalhes específicos para registro no log de auditoria..."
                  rows={2}
                  className="w-full bg-black/40 border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectModalOpen(false);
                    setSelectedItem(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 text-xs hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Confirmar Rejeição
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Ocultar e Preservar (Gravíssimo) */}
      {preserveModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-red-500/40 bg-slate-900 max-w-lg w-full relative shadow-2xl">
            <button
              onClick={() => {
                setPreserveModalOpen(false);
                setSelectedItem(null);
                setPreservedHashResult(null);
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-red-400 mb-2">
              <AlertOctagon className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Ação Única: Ocultar e Preservar</h3>
            </div>

            {preservedHashResult ? (
              <div className="space-y-4 py-4 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-white">Conteúdo Ocultado e Evidência Preservada</h4>
                <div className="bg-black/50 p-3 rounded-xl border border-white/10 text-[11px] font-mono text-emerald-300 break-all select-all">
                  Hash SHA-256: {preservedHashResult}
                </div>
                <p className="text-xs text-slate-400">
                  O registro telemático foi gravado de forma imutável com cadeia de custódia pronta para requisição judicial.
                </p>
                <button
                  onClick={() => {
                    setPreserveModalOpen(false);
                    setSelectedItem(null);
                    setPreservedHashResult(null);
                  }}
                  className="btn-neon px-6 py-2.5 text-xs font-bold"
                >
                  Concluir
                </button>
              </div>
            ) : (
              <form onSubmit={handlePreserveSubmit} className="space-y-4">
                <p className="text-xs text-red-300 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                  Esta ação suspende imediatamente a exibição do conteúdo para o público, congelando o snapshot
                  integral dos dados com carimbo de tempo e hash para entrega às autoridades judiciais ou policiais.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Justificativa Formal / Motivo do Ilícito
                  </label>
                  <textarea
                    required
                    value={preserveDetails}
                    onChange={(e) => setPreserveDetails(e.target.value)}
                    placeholder="Descreva a evidência de fraude ou ilícito grave para o dossiê probatório..."
                    rows={3}
                    className="w-full bg-black/40 border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPreserveModalOpen(false);
                      setSelectedItem(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 text-xs hover:bg-white/5"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-red-900/50"
                  >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertOctagon className="w-4 h-4" />}
                    Congelar e Ocultar Imediatamente
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
