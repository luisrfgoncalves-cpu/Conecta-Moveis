/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { AdminFotosClient } from '@/components/admin/AdminFotosClient';

export const metadata = { title: 'Moderação de Fotos — Admin' };

function extractBucketPath(url: string | null | undefined, bucket: string): string | null {
  if (!url) return null;
  if (url.includes(`${bucket}/`)) {
    const parts = url.split(`${bucket}/`);
    return parts[1] ? decodeURIComponent(parts[1].split('?')[0]) : null;
  }
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return url;
  }
  return null;
}

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

  const formatted = await Promise.all(
    (data || []).map(async (img: any) => {
      let displayImageUrl = img.image_url;
      let displayThumbUrl = img.thumb_url;

      // Fotos no bucket privado 'portfolio-pending' exigem Signed URLs temporárias
      const thumbPath = extractBucketPath(img.thumb_url, 'portfolio-pending');
      const fullPath = extractBucketPath(img.image_url, 'portfolio-pending');

      if (thumbPath) {
        const { data: signedThumb } = await admin.storage
          .from('portfolio-pending')
          .createSignedUrl(thumbPath, 7200);
        if (signedThumb?.signedUrl) {
          displayThumbUrl = signedThumb.signedUrl;
        }
      }

      if (fullPath) {
        const { data: signedFull } = await admin.storage
          .from('portfolio-pending')
          .createSignedUrl(fullPath, 7200);
        if (signedFull?.signedUrl) {
          displayImageUrl = signedFull.signedUrl;
        }
      }

      return {
        id: img.id,
        image_url: displayImageUrl,
        thumb_url: displayThumbUrl || displayImageUrl,
        bytes_size: img.bytes_size,
        created_at: img.created_at,
        portfolio_items: img.portfolio_items,
      };
    })
  );

  return <AdminFotosClient initialPhotos={formatted} />;
}
