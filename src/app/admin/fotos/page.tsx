/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { AdminFotosClient } from '@/components/admin/AdminFotosClient';

export const metadata = { title: 'Moderação de Fotos — Admin' };

export default async function AdminFotosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/entrar');

  const admin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data } = await admin
    .from('portfolio_images')
    .select(`
      id,
      image_url,
      thumb_url,
      bytes_size,
      created_at,
      portfolio_items!portfolio_item_id (
        title,
        professional_profiles!profile_id (
          display_name
        )
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  const formatted = (data || []).map((img: any) => ({
    id: img.id,
    image_url: img.image_url,
    thumb_url: img.thumb_url,
    bytes_size: img.bytes_size,
    created_at: img.created_at,
    portfolio_items: img.portfolio_items,
  }));

  return <AdminFotosClient initialPhotos={formatted} />;
}
