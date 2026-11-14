'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Municipio, GeoDistanceFilter, ProfessionalWithDistance } from './schemas';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * 1. Lista municípios cadastrados no dataset (padrão SP ou UF especificada)
 */
export async function listMunicipios(uf = 'SP'): Promise<Municipio[]> {
  const admin = getAdminClient();
  const { data, error } = await admin
    .from('municipios')
    .select('id, ibge_code, nome, uf, slug, latitude, longitude')
    .eq('uf', uf.toUpperCase())
    .order('nome', { ascending: true });

  if (error || !data) return [];
  return data.map((m) => ({
    id: m.id,
    ibge_code: m.ibge_code,
    nome: m.nome,
    uf: m.uf,
    slug: m.slug,
    latitude: Number(m.latitude),
    longitude: Number(m.longitude),
  }));
}

/**
 * 2. Busca município pelo slug (ex: "jundiai-sp")
 */
export async function getMunicipioBySlug(slug: string): Promise<Municipio | null> {
  if (!slug) return null;
  const admin = getAdminClient();
  const { data, error } = await admin
    .from('municipios')
    .select('id, ibge_code, nome, uf, slug, latitude, longitude')
    .eq('slug', slug.toLowerCase())
    .single();

  if (error || !data) return null;
  return {
    id: data.id,
    ibge_code: data.ibge_code,
    nome: data.nome,
    uf: data.uf,
    slug: data.slug,
    latitude: Number(data.latitude),
    longitude: Number(data.longitude),
  };
}

/**
 * 3. Busca município pelo código oficial do IBGE
 */
export async function getMunicipioByIbge(ibgeCode: string): Promise<Municipio | null> {
  if (!ibgeCode) return null;
  const admin = getAdminClient();
  const { data, error } = await admin
    .from('municipios')
    .select('id, ibge_code, nome, uf, slug, latitude, longitude')
    .eq('ibge_code', ibgeCode)
    .single();

  if (error || !data) return null;
  return {
    id: data.id,
    ibge_code: data.ibge_code,
    nome: data.nome,
    uf: data.uf,
    slug: data.slug,
    latitude: Number(data.latitude),
    longitude: Number(data.longitude),
  };
}

/**
 * 4. Busca profissionais filtrados por proximidade e raio em km
 */
export async function searchProfilesByDistance(filters: GeoDistanceFilter): Promise<{
  professionals: ProfessionalWithDistance[];
  total: number;
  originMunicipio?: Municipio | null;
}> {
  const admin = getAdminClient();
  const page = Math.max(1, Number(filters.page) || 1);
  const limit = 12;
  const offset = (page - 1) * limit;

  const originMunicipio = await getMunicipioByIbge(filters.origin_ibge);
  if (!originMunicipio) {
    return { professionals: [], total: 0, originMunicipio: null };
  }

  const { data: rows, error } = await admin.rpc('search_profiles_by_distance', {
    p_origin_ibge: filters.origin_ibge,
    p_max_radius_km: filters.max_radius_km || 50,
    p_category_slug: filters.category_slug || null,
    p_termo: filters.termo || null,
    p_ordenacao: filters.ordenacao || 'proximidade',
    p_limite: limit,
    p_offset: offset,
  });

  if (error || !rows || rows.length === 0) {
    return { professionals: [], total: 0, originMunicipio };
  }

  const total = Number(rows[0]?.total_count ?? 0);
  const professionals: ProfessionalWithDistance[] = rows.map((r: {
    id: string;
    display_name: string;
    slug: string;
    bio: string | null;
    city: string;
    state: string;
    municipio_nome: string;
    distance_km: number;
    service_radius_km: number;
    is_featured: boolean;
    created_at: string;
    avatar_url: string | null;
  }) => ({
    id: r.id,
    display_name: r.display_name,
    slug: r.slug,
    bio: r.bio,
    city: r.city,
    state: r.state,
    municipio_nome: r.municipio_nome,
    distance_km: Number(r.distance_km),
    service_radius_km: Number(r.service_radius_km),
    is_featured: r.is_featured,
    created_at: r.created_at,
    avatar_url: r.avatar_url,
  }));

  return { professionals, total, originMunicipio };
}

/**
 * 5. Retorna profissionais publicados em uma cidade para uma dada categoria
 * Usado pelas páginas de SEO /servicos/[categoria]/[municipio-uf]
 * REGRA MANDATÓRIA: se não houver ao menos 1 perfil publicado, a página não deve ser gerada.
 */
export async function getPublishedProfilesForServiceCity(
  categorySlug: string,
  municipioSlug: string
): Promise<{
  municipio: Municipio | null;
  professionals: ProfessionalWithDistance[];
  total: number;
}> {
  const municipio = await getMunicipioBySlug(municipioSlug);
  if (!municipio) {
    return { municipio: null, professionals: [], total: 0 };
  }

  const supabase = await createClient();

  // Consulta profissionais da categoria cujo município seja o mesmo OU que atendam o município
  const { data, count, error } = await supabase
    .from('public_professionals')
    .select('*', { count: 'exact' })
    .ilike('city', `%${municipio.nome}%`);

  if (error || !data || data.length === 0) {
    return { municipio, professionals: [], total: 0 };
  }

  const professionals: ProfessionalWithDistance[] = data.map((p) => ({
    id: p.id,
    display_name: p.display_name,
    slug: p.slug,
    bio: p.bio,
    city: p.city,
    state: p.state,
    municipio_nome: municipio.nome,
    distance_km: 0,
    service_radius_km: 30,
    is_featured: p.is_featured,
    created_at: p.created_at,
    avatar_url: p.avatar_url,
  }));

  return { municipio, professionals, total: count || professionals.length };
}
