import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { AdminLogsClient } from '@/components/admin/AdminLogsClient';

interface RawLogRecord {
  id: string | number;
  admin_id: string;
  action: string;
  target_table: string;
  target_id: string;
  reason: string;
  created_at: string;
  profiles: { full_name: string } | { full_name: string }[] | null;
}

export const metadata = { title: 'Logs de Auditoria — Admin' };

export default async function AdminLogsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/entrar');

  const admin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: logs } = await admin
    .from('admin_logs')
    .select('id, admin_id, action, target_table, target_id, reason, created_at, profiles!admin_id ( full_name )')
    .order('created_at', { ascending: false })
    .limit(100);

  const rawLogs = (logs || []) as unknown as RawLogRecord[];
  const mappedLogs = rawLogs.map((l) => ({
    id: l.id,
    admin_id: l.admin_id,
    action: l.action,
    target_table: l.target_table,
    target_id: l.target_id,
    reason: l.reason,
    created_at: l.created_at,
    profiles: Array.isArray(l.profiles) ? l.profiles[0] || null : l.profiles || null,
  }));

  return <AdminLogsClient initialLogs={mappedLogs} />;
}
