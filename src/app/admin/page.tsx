import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Users, Database, HardDrive, Flag, AlertTriangle, ShieldAlert, Star } from 'lucide-react';
import { getStorageAndDatabaseUsage } from '@/lib/admin/actions';

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

  const [
    usersRes,
    pendingPhotosRes,
    pendingReportsRes,
    pendingReviewsRes,
    profProfilesRes,
    usageData,
  ] = await Promise.all([
    admin.from('profiles').select('id', { count: 'exact', head: true }),
    admin.from('portfolio_images').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('reviews').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('professional_profiles').select('id', { count: 'exact', head: true }).eq('is_published', true),
    getStorageAndDatabaseUsage(),
  ]);

  const stats = [
    { label: 'Usuários cadastrados', value: usersRes.count ?? 0, icon: Users, color: 'sky' },
    { label: 'Perfis publicados', value: profProfilesRes.count ?? 0, icon: Database, color: 'emerald' },
    { label: 'Fotos em análise', value: pendingPhotosRes.count ?? 0, icon: HardDrive, color: 'amber' },
    { label: 'Denúncias pendentes', value: pendingReportsRes.count ?? 0, icon: Flag, color: 'red' },
    { label: 'Avaliações em moderação', value: pendingReviewsRes.count ?? 0, icon: Star, color: 'purple' },
  ];

  const colorMap: Record<string, string> = {
    sky: 'bg-sky-500/15 border-sky-500/25 text-sky-400',
    emerald: 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400',
    amber: 'bg-amber-500/15 border-amber-500/25 text-amber-400',
    red: 'bg-red-500/15 border-red-500/25 text-red-400',
    purple: 'bg-purple-500/15 border-purple-500/25 text-purple-400',
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">Painel Administrativo</h1>
        <p className="text-slate-400 text-sm mt-1">Visão geral da plataforma e moderação em tempo real.</p>
      </div>

      {/* Alerta de Cota do Plano Gratuito (quando > 70%) */}
      {(usageData.isStorageAlert || usageData.isDatabaseAlert) && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200">
            <strong className="block font-bold text-amber-300 text-sm mb-1">
              Atenção: Uso de Recursos Acima de 70% do Limite Gratuito
            </strong>
            {usageData.isStorageAlert && (
              <p>O Storage atingiu {usageData.storageUsagePercent}% do limite de 1 GB do plano gratuito.</p>
            )}
            {usageData.isDatabaseAlert && (
              <p>O Banco de Dados atingiu {usageData.databaseUsagePercent}% da cota estimada de 500 MB.</p>
            )}
          </div>
        </div>
      )}

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">{label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${colorMap[color]}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white tracking-tight">{value}</div>
          </div>
        ))}
      </div>

      {/* Painel de Uso de Recursos (Banco e Storage em relação ao Free Tier) */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-orange-400" />
            Consumo em Relação ao Limite Gratuito do Supabase
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
            Free Tier Ativo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Storage (1 GB) */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-white">Armazenamento de Imagens (Storage)</span>
              <span className="text-slate-400">
                {(usageData.storageBytes / (1024 * 1024)).toFixed(1)} MB / 1.000 MB ({usageData.storageUsagePercent}%)
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all rounded-full ${
                  usageData.isStorageAlert ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.max(2, usageData.storageUsagePercent)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Limite gratuito do Supabase Storage: 1 GB. Alerta automático a 70% (700 MB).
            </p>
          </div>

          {/* Database (500 MB) */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-white">Banco de Dados PostgreSQL</span>
              <span className="text-slate-400">
                {usageData.databaseUsageEstMB} MB / 500 MB ({usageData.databaseUsagePercent}%)
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all rounded-full ${
                  usageData.isDatabaseAlert ? 'bg-amber-500' : 'bg-sky-500'
                }`}
                style={{ width: `${Math.max(2, usageData.databaseUsagePercent)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Limite gratuito do Supabase Database: 500 MB. Alerta automático a 70% (350 MB).
            </p>
          </div>
        </div>
      </div>

      {/* Avisos de Segurança e Auditoria */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          <span>Senhas e tokens criptografados nunca são acessíveis aos administradores.</span>
        </div>
        <span>Todas as ações exigem justificativa registrada em log auditável.</span>
      </div>
    </div>
  );
}
