/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { AdminAvaliacoesClient } from '@/components/admin/AdminAvaliacoesClient';

export const metadata = { title: 'Moderação de Avaliações — Admin' };

export default async function AdminAvaliacoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/entrar');

  const admin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data } = await admin
    .from('reviews')
    .select(`
      id,
      rating_quality,
      rating_overall,
      comment,
      created_at,
      profiles!reviewer_id (
        full_name
      ),
      professional_profiles!profile_id (
        display_name
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  const formatted = (data || []).map((r: any) => ({
    id: r.id,
    rating_quality: r.rating_quality,
    rating_overall: r.rating_overall,
    comment: r.comment,
    created_at: r.created_at,
    profiles: r.profiles,
    professional_profiles: r.professional_profiles,
  }));

  return <AdminAvaliacoesClient initialReviews={formatted} />;
}
