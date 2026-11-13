/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { FileText } from 'lucide-react';

export const metadata = { title: 'Logs de Auditoria — Admin' };

export default async function AdminLogsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/entrar');

  const admin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: logs } = await admin
    .from('admin_logs')
    .select('id, admin_id, action, target_table, target_id, reason, old_value, new_value, created_at, profiles!admin_id ( full_name )')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-400" />
          Logs de Auditoria Administrativa
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Registro imutável de todas as ações executadas por moderadores e administradores.
        </p>
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
              {(logs || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Nenhuma ação administrativa registrada ainda.
                  </td>
                </tr>
              ) : (
                (logs || []).map((log: any) => (
                  <tr key={log.id} className="hover:bg-white/5 transition">
                    <td className="p-3.5 whitespace-nowrap text-slate-400">
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
