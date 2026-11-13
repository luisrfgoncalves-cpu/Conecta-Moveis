/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Tag } from 'lucide-react';

export const metadata = { title: 'Categorias Oficiais — Admin' };

export default async function AdminCategoriasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/entrar');

  const admin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: categories } = await admin
    .from('categories')
    .select('id, name, slug, description, specialties ( id, name, slug )')
    .order('name');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Tag className="w-6 h-6 text-orange-400" />
          Categorias e Especialidades Oficiais
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Catálogo fixo do setor moveleiro e parceiros complementares de Jundiaí e região.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(categories || []).map((cat: any) => (
          <div key={cat.id} className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
            <div>
              <h3 className="text-base font-bold text-white">{cat.name}</h3>
              <p className="text-xs text-slate-400 font-mono">slug: {cat.slug}</p>
              <p className="text-xs text-slate-300 mt-1">{cat.description}</p>
            </div>

            <div className="pt-2 border-t border-white/5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Especialidades ({cat.specialties?.length || 0}):
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(cat.specialties || []).map((spec: any) => (
                  <span
                    key={spec.id}
                    className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[11px] text-slate-300"
                  >
                    {spec.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
