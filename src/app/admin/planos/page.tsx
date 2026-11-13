import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { CreditCard } from 'lucide-react';
import { AdminPlanosClient } from '@/components/admin/AdminPlanosClient';
import { PlanItem } from '@/lib/plans/actions';

export const metadata = { title: 'Planos e Limites — Admin' };

export default async function AdminPlanosPage() {
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

  const { data: plans } = await admin
    .from('plans')
    .select('*')
    .order('max_photos', { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-sky-400" />
            Planos do Sistema
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gerenciamento e customização de cotas e entitlements por plano.
          </p>
        </div>
      </div>

      <AdminPlanosClient plans={(plans as PlanItem[]) || []} />
    </div>
  );
}
