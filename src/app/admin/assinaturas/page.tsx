/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { CreditCard, Lock } from 'lucide-react';

export const metadata = { title: 'Assinaturas — Admin' };

export default async function AdminAssinaturasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/entrar');

  const admin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: subs } = await admin
    .from('subscriptions')
    .select('id, plan_id, status, created_at, profiles!user_id ( full_name, email )')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-400" />
            Assinaturas Ativas
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Controle de assinaturas dos usuários (modo leitura até a Fase 11).
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold w-fit">
          <Lock className="w-3.5 h-3.5" />
          Modo Leitura
        </span>
      </div>

      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
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
              {(subs || []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Nenhuma assinatura contratada (todos os usuários estão no plano Gratuito padrão).
                  </td>
                </tr>
              ) : (
                (subs || []).map((s: any) => (
                  <tr key={s.id} className="hover:bg-white/5 transition">
                    <td className="p-3.5 font-bold text-white whitespace-nowrap">{s.profiles?.full_name || '—'}</td>
                    <td className="p-3.5 text-slate-400 whitespace-nowrap">{s.profiles?.email || '—'}</td>
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
