/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { createClient } from '@/lib/supabase/server';

export interface FavoriteItem {
  id: string;
  created_at: string;
  profile: {
    id: string;
    display_name: string;
    slug: string;
    city: string;
    state: string;
    bio?: string;
    avatar_url?: string;
  };
}

// ===== Listar favoritos do usuário =====
export async function getMyFavorites(): Promise<{
  data: FavoriteItem[];
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: 'Não autenticado.' };

  const { data, error } = await supabase
    .from('favorites')
    .select(`
      id,
      created_at,
      professional_profiles!profile_id (
        id,
        display_name,
        slug,
        city,
        state,
        bio,
        profiles!user_id ( avatar_url )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return { data: [], error: 'Erro ao carregar favoritos.' };

  return {
    data: (data || []).map((fav: any) => ({
      id: fav.id,
      created_at: fav.created_at,
      profile: {
        id: fav.professional_profiles.id,
        display_name: fav.professional_profiles.display_name,
        slug: fav.professional_profiles.slug,
        city: fav.professional_profiles.city,
        state: fav.professional_profiles.state,
        bio: fav.professional_profiles.bio,
        avatar_url: fav.professional_profiles.profiles?.avatar_url,
      },
    })),
  };
}

// ===== Verificar se um perfil é favorito =====
export async function isFavorite(profileId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('profile_id', profileId)
    .maybeSingle();

  return !!data;
}

// ===== Adicionar favorito =====
export async function addFavorite(
  profileId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Faça login para favoritar profissionais.' };

  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: user.id, profile_id: profileId });

  if (error) {
    if (error.code === '23505') return { success: true }; // já favoritado — idempotente
    return { success: false, error: 'Erro ao favoritar.' };
  }

  return { success: true };
}

// ===== Remover favorito =====
export async function removeFavorite(
  profileId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Não autenticado.' };

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('profile_id', profileId);

  return error
    ? { success: false, error: 'Erro ao remover favorito.' }
    : { success: true };
}

// ===== Toggle favorito (retorna novo estado) =====
export async function toggleFavorite(
  profileId: string
): Promise<{ success: boolean; isFav: boolean; error?: string }> {
  const fav = await isFavorite(profileId);
  if (fav) {
    const res = await removeFavorite(profileId);
    return { ...res, isFav: false };
  } else {
    const res = await addFavorite(profileId);
    return { ...res, isFav: true };
  }
}

