'use client';

import { useState } from 'react';
import { FileText, Download, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { exportAdminLogsToCsv } from '@/lib/admin/actions';

interface LogItem {
  id: string | number;
  admin_id: string;
  action: string;
  target_table: string;
  target_id: string;
  reason: string;
  created_at: string;
  profiles?: { full_name: string } | null;
}

interface AdminLogsClientProps {
  initialLogs: LogItem[];
}

export function AdminLogsClient({ initialLogs }: AdminLogsClientProps) {
  const [logs] = useState<LogItem[]>(initialLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [exporting, setExporting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const filteredLogs = logs.filter((l) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      l.action.toLowerCase().includes(term) ||
      l.target_table.toLowerCase().includes(term) ||
      (l.reason && l.reason.toLowerCase().includes(term)) ||
      (l.profiles?.full_name && l.profiles.full_name.toLowerCase().includes(term))
    );
  });

  async function handleExportCsv() {
    setExporting(true);
    setFeedback(null);

    const res = await exportAdminLogsToCsv();
    if (res.success && res.csvContent) {
      const blob = new Blob([res.csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `admin_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setFeedback({ type: 'ok', text: 'Exportação CSV gerada e log de auditoria registrado!' });
    } else {
      setFeedback({ type: 'err', text: res.error || 'Falha ao exportar registros.' });
    }
    setExporting(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-orange-400" />
            Logs de Auditoria Administrativa
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Registro imutável de todas as ações executadas por moderadores e administradores.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={exporting}
          className="btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{exporting ? 'Exportando...' : 'Exportar CSV'}</span>
        </button>
      </div>

      {feedback && (
        <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
          feedback.type === 'ok'
            ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
            : 'bg-red-500/15 border border-red-500/40 text-red-300'
        }`}>
          {feedback.type === 'ok' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Filtro */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filtrar por ação, motivo, tabela ou administrador..."
          className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        />
      </div>

      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Data/Hora</th>
                <th className="p-3.5">Administrador</th>
                <th className="p-3.5">Ação</th>
                <th className="p-3.5">Tabela Alvo</th>
                <th className="p-3.5">Justificativa / Motivo</th>
                <th className="p-3.5">ID Alvo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition">
                    <td className="p-3.5 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {new Date(log.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="p-3.5 font-bold text-white whitespace-nowrap">
                      {log.profiles?.full_name || 'Admin'}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono text-[10px] font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-400 whitespace-nowrap">{log.target_table}</td>
                    <td className="p-3.5 max-w-[320px] truncate font-medium text-slate-200" title={log.reason}>
                      {log.reason}
                    </td>
                    <td className="p-3.5 font-mono text-slate-500 text-[10px] truncate max-w-[120px]">
                      {log.target_id}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

