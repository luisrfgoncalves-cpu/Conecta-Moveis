import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Users } from 'lucide-react';

export const metadata = { title: 'Gestão de Usuários — Admin' };

export default async function AdminUsuariosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/entrar');

  const admin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: profiles } = await admin
    .from('profiles')
    .select('id, full_name, email, phone, created_at')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-sky-400" />
          Usuários Cadastrados
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Lista de contas de autenticação do sistema ({profiles?.length || 0} contas).
        </p>
      </div>

      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Nome</th>
                <th className="p-3.5">E-mail</th>
                <th className="p-3.5">Telefone</th>
                <th className="p-3.5">Data de Cadastro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(profiles || []).map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition">
                  <td className="p-3.5 font-bold text-white whitespace-nowrap">{u.full_name}</td>
                  <td className="p-3.5 text-slate-400 whitespace-nowrap">{u.email}</td>
                  <td className="p-3.5 text-slate-400 whitespace-nowrap">{u.phone || '—'}</td>
                  <td className="p-3.5 text-slate-500 whitespace-nowrap">
                    {new Date(u.created_at).toLocaleDateString('pt-BR')}
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

