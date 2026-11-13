import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Users, Database, HardDrive, Flag } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin — Conecta Móveis',
};

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/entrar');

  const admin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const [usersRes, pendingPhotosRes, pendingReportsRes, profProfilesRes] = await Promise.all([
    admin.from('profiles').select('id', { count: 'exact', head: true }),
    admin.from('portfolio_images').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('professional_profiles').select('id', { count: 'exact', head: true }).eq('is_published', true),
  ]);

  const stats = [
    { label: 'Usuários cadastrados', value: usersRes.count ?? 0, icon: Users, color: 'sky' },
    { label: 'Perfis publicados', value: profProfilesRes.count ?? 0, icon: Database, color: 'emerald' },
    { label: 'Fotos aguardando aprovação', value: pendingPhotosRes.count ?? 0, icon: HardDrive, color: 'amber' },
    { label: 'Denúncias pendentes', value: pendingReportsRes.count ?? 0, icon: Flag, color: 'red' },
  ];

  const colorMap: Record<string, string> = {
    sky: 'bg-sky-500/15 border-sky-500/25 text-sky-400',
    emerald: 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400',
    amber: 'bg-amber-500/15 border-amber-500/25 text-amber-400',
    red: 'bg-red-500/15 border-red-500/25 text-red-400',
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">Painel Administrativo</h1>
        <p className="text-slate-400 text-sm mt-1">Visão geral da plataforma em tempo real.</p>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-panel rounded-2xl p-5 border border-white/10">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-3 ${colorMap[color]}`}>
              <Icon className="w-4 h-4" aria-hidden />
            </div>
            <p className="text-2xl font-black text-white">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5 leading-snug">{label}</p>
          </div>
        ))}
      </div>

      {/* Aviso de limites de infra */}
      <div className="glass-panel rounded-2xl p-5 border border-amber-500/20">
        <p className="text-xs font-black uppercase tracking-wider text-amber-400 mb-2">Monitoramento de Infra</p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Banco: monitorar em{' '}
          <span className="text-white font-medium">Supabase › Settings › Usage</span>.
          Acione plano de migração ao atingir 350 MB de banco, 700 MB de storage ou 3,5 GB/mês de transferência.
          SMTP próprio (Resend) é bloqueador de lançamento. Ver{' '}
          <span className="text-orange-400 font-medium">docs/LIMITES_INFRA.md</span>.
        </p>
      </div>
    </div>
  );
}

