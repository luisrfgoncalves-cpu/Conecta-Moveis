import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminCuradoriaClient } from '@/components/admin/AdminCuradoriaClient';
import {
  getUnifiedComplianceQueue,
  getPlanEqualityReport,
  getTransparencyReport,
} from '@/lib/curadoria/actions';
import { STANDARD_COMPLIANCE_REASONS } from '@/lib/curadoria/reasons';
import { getAdminUserRole } from '@/lib/admin/actions';

export const metadata = { title: 'Curadoria de Conformidade & Moderação — Admin' };

export default async function AdminCuradoriaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/entrar');

  const { role } = await getAdminUserRole();
  if (!role || (role !== 'owner' && role !== 'admin' && role !== 'moderator')) {
    redirect('/admin');
  }

  const [queueRes, equalityRes, transRes] = await Promise.all([
    getUnifiedComplianceQueue(),
    getPlanEqualityReport(),
    getTransparencyReport(),
  ]);

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-5">
        <h1 className="text-2xl font-black text-white">Central de Curadoria e Conformidade</h1>
        <p className="text-sm text-slate-400">
          Moderação unificada com priorização por gravidade, prazos (SLA) e revisão prévia de conteúdos comerciais (Regra R6).
        </p>
      </div>

      <AdminCuradoriaClient
        initialQueue={queueRes.items || []}
        equalityMetrics={equalityRes.metrics || []}
        transparencyReport={
          transRes.report || {
            year: new Date().getFullYear(),
            total_received: 0,
            total_accepted: 0,
            total_rejected: 0,
            avg_response_hours: 0,
            category_breakdown: {},
            generated_at: new Date().toISOString(),
          }
        }
        reasons={STANDARD_COMPLIANCE_REASONS}
      />
    </div>
  );
}

