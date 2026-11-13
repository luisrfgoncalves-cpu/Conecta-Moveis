/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Building2 } from 'lucide-react';

export const metadata = { title: 'Gestão de Empresas — Admin' };

export default async function AdminEmpresasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/entrar');

  const admin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: companies } = await admin
    .from('companies')
    .select('id, name, cnpj, is_published, created_at, profiles!owner_id ( full_name )')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Building2 className="w-6 h-6 text-orange-400" />
          Empresas Cadastradas
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Lojas de planejados e marcenarias registradas ({companies?.length || 0} empresas).
        </p>
      </div>

      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Razão Social</th>
                <th className="p-3.5">CNPJ</th>
                <th className="p-3.5">Proprietário</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Data de Criação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(companies || []).map((c: any) => (
                <tr key={c.id} className="hover:bg-white/5 transition">
                  <td className="p-3.5 font-bold text-white whitespace-nowrap">{c.name}</td>
                  <td className="p-3.5 font-mono text-slate-400 whitespace-nowrap">{c.cnpj || 'Informativo ausente'}</td>
                  <td className="p-3.5 text-slate-400 whitespace-nowrap">{c.profiles?.full_name || '—'}</td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.is_published ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-700/50 text-slate-400'
                    }`}>
                      {c.is_published ? 'Ativa' : 'Oculta'}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-500 whitespace-nowrap">
                    {new Date(c.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
