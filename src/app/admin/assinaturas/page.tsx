/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { CreditCard, Sparkles, UserCheck } from 'lucide-react';

export const metadata = { title: 'Assinaturas e Interesses — Admin' };

export default async function AdminAssinaturasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/entrar');

  const admin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const [subsRes, interestsRes] = await Promise.all([
    admin
      .from('subscriptions')
      .select('id, plan_id, status, created_at, profiles!user_id ( full_name, email )')
      .order('created_at', { ascending: false }),
    admin
      .from('plan_interest')
      .select('id, plan_id, notes, created_at, profiles:user_id ( full_name, email )')
      .order('created_at', { ascending: false }),
  ]);

  const subs = subsRes.data || [];
  const interests = interestsRes.data || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-emerald-400" />
          Assinaturas e Manifestações de Interesse
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Acompanhamento de usuários ativos em planos e solicitações de interesse para a fase comercial.
        </p>
      </div>

      {/* Manifestações de Interesse (Leads de Monetização) */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Interesses Registrados ({interests.length})
          </h2>
          <span className="text-[10px] text-slate-400">Capturados via /planos e /painel/assinatura</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Usuário</th>
                <th className="p-3.5">E-mail</th>
                <th className="p-3.5">Plano Solicitado</th>
                <th className="p-3.5">Notas do Usuário</th>
                <th className="p-3.5">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {interests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500">
                    Nenhum interesse registrado até o momento.
                  </td>
                </tr>
              ) : (
                interests.map((item: any) => (
                  <tr key={item.id} className="hover:bg-white/5 transition">
                    <td className="p-3.5 font-bold text-white whitespace-nowrap">
                      {item.profiles?.full_name || 'Usuário'}
                    </td>
                    <td className="p-3.5 text-slate-300 whitespace-nowrap">
                      {item.profiles?.email || '—'}
                    </td>
                    <td className="p-3.5 font-mono text-orange-400 font-bold whitespace-nowrap">
                      {item.plan_id}
                    </td>
                    <td className="p-3.5 text-slate-400 max-w-xs truncate">
                      {item.notes || '—'}
                    </td>
                    <td className="p-3.5 text-slate-500 whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscrições Ativas */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-sky-400" />
          Subscrições Ativas ({subs.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Usuário</th>
                <th className="p-3.5">E-mail</th>
                <th className="p-3.5">Plano</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Data Início</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {subs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500">
                    Nenhuma assinatura registrada (usuários operando com entitlements padrão).
                  </td>
                </tr>
              ) : (
                subs.map((s: any) => (
                  <tr key={s.id} className="hover:bg-white/5 transition">
                    <td className="p-3.5 font-bold text-white whitespace-nowrap">
                      {s.profiles?.full_name || '—'}
                    </td>
                    <td className="p-3.5 text-slate-400 whitespace-nowrap">
                      {s.profiles?.email || '—'}
                    </td>
                    <td className="p-3.5 font-mono text-orange-400 whitespace-nowrap">{s.plan_id}</td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500 whitespace-nowrap">
                      {new Date(s.created_at).toLocaleDateString('pt-BR')}
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
