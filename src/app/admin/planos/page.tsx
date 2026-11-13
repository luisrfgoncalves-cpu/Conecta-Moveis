import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { CreditCard, Lock } from 'lucide-react';

export const metadata = { title: 'Planos do Sistema — Admin' };

export default async function AdminPlanosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/entrar');

  const admin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: plans } = await admin
    .from('plans')
    .select('*')
    .order('price_cents', { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-sky-400" />
            Planos do Sistema
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configurações de planos e cotas (modo leitura até a Fase 11 — Monetização).
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold w-fit">
          <Lock className="w-3.5 h-3.5" />
          Modo Leitura
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(plans || []).map((p) => (
          <div key={p.id} className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-white">{p.name}</h3>
                <span className="font-mono text-xs text-slate-400">{p.id}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{p.description}</p>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-white/5">
              <div className="flex justify-between">
                <span>Fotos no portfólio:</span>
                <span className="font-bold text-white">{p.max_photos} fotos</span>
              </div>
              <div className="flex justify-between">
                <span>Categorias simultâneas:</span>
                <span className="font-bold text-white">{p.max_categories}</span>
              </div>
              <div className="flex justify-between">
                <span>Selo Destaque Patrocinado:</span>
                <span className="font-bold text-white">{p.allow_featured ? 'Permitido' : 'Não'}</span>
              </div>
              <div className="flex justify-between">
                <span>Valor mensal:</span>
                <span className="font-bold text-emerald-400">
                  {p.price_cents === 0 ? 'Gratuito (R$ 0,00)' : `R$ ${(p.price_cents / 100).toFixed(2)}`}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

