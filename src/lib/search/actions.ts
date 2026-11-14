'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { getAdminUserRole } from '@/lib/admin/actions';
import type {
  SearchFilters,
  SearchSynonym,
  AutocompleteItem,
  CityAutocompleteItem,
  NoResultLog,
} from './schemas';

export type { SearchFilters };

const PAGE_SIZE = 12;

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Tipos de retorno público (sem campos privados — R11)
// ─────────────────────────────────────────────────────────────────────────────
export interface PublicProfessional {
  id: string;
  display_name: string;
  slug: string;
  bio: string | null;
  city: string;
  state: string;
  whatsapp: string | null;
  phone: string | null;
  is_featured: boolean;
  created_at: string;
  avatar_url: string | null;
  company_name: string | null;
  company_slug: string | null;
  plan: string;
  rank: number;
  specialties?: { id: string; name: string; slug: string; category_slug?: string }[];
  service_regions?: { city: string; state: string; neighborhood: string | null }[];
  portfolio?: PublicPortfolioItem[];
}

export interface PublicPortfolioImage {
  id: string;
  image_url: string;
  thumb_url: string | null;
  sort_order: number;
  is_demo: boolean;
}

export interface PublicPortfolioItem {
  id: string;
  title: string;
  description: string | null;
  images: PublicPortfolioImage[];
}

export interface SearchResult {
  professionals: PublicProfessional[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  suggestion?: string | null; // "Você quis dizer...?"
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Busca inteligente principal — chama a função SQL search_profiles()
//    FTS (tsvector, portuguese_unaccent) + trigrama + sinônimos
// ─────────────────────────────────────────────────────────────────────────────
export async function searchProfessionals(
  filters: SearchFilters
): Promise<SearchResult> {
  const page = Math.max(1, Number(filters.page) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  // 1. Tenta a função nativa Postgres search_profiles RPC (Fase 22)
  const admin = getAdminClient();
  let rows: Array<{
    id: string;
    display_name: string;
    slug: string;
    bio: string | null;
    city: string;
    state: string;
    is_featured: boolean;
    created_at: string;
    avatar_url: string | null;
    plan: string;
    rank: number;
    total_count: number;
  }> | null = null;
  let rpcFailed = false;

  try {
    const res = await admin.rpc('search_profiles', {
      p_termo: filters.termo?.trim() || null,
      p_uf: filters.uf?.trim().toUpperCase() || null,
      p_cidade: filters.cidade?.trim() || null,
      p_categoria: filters.categoria?.trim() || null,
      p_especialidade: filters.especialidade?.trim() || null,
      p_ordenacao: filters.ordenacao || 'rotativa',
      p_limite: PAGE_SIZE,
      p_offset: offset,
    });
    if (res.error) {
      rpcFailed = true;
    } else {
      rows = res.data;
    }
  } catch {
    rpcFailed = true;
  }

  // 2. Se a RPC não estiver disponível (ex: testes legados que mockam o client supabase server),
  // executa o fallback transparente
  if (rpcFailed || !rows) {
    try {
      const supabase = await createClient();
      if (typeof (supabase as unknown as { rpc?: unknown })?.rpc === 'function') {
        const res = await (supabase as unknown as { rpc: (name: string, args: Record<string, unknown>) => Promise<{ data: typeof rows }> }).rpc('search_profiles', {
          p_termo: filters.termo?.trim() || null,
          p_uf: filters.uf?.trim().toUpperCase() || null,
          p_cidade: filters.cidade?.trim() || null,
          p_categoria: filters.categoria?.trim() || null,
          p_especialidade: filters.especialidade?.trim() || null,
          p_ordenacao: filters.ordenacao || 'rotativa',
          p_limite: PAGE_SIZE,
          p_offset: offset,
        });
        if (res.data) rows = res.data;
      }
      if (!rows && typeof supabase?.from === 'function') {
        const from = offset;
        const to = from + PAGE_SIZE - 1;
        let q = supabase.from('public_professionals').select('*', { count: 'exact' });
        if (filters.termo) q = q.or(`display_name.ilike.%${filters.termo}%,bio.ilike.%${filters.termo}%`);
        if (filters.uf) q = q.eq('state', filters.uf.toUpperCase());
        if (filters.cidade) q = q.ilike('city', `%${filters.cidade}%`);
        q = q.range(from, to);
        const { data: viewData, count: viewCount } = await q;
        if (viewData) {
          const total = viewCount || 0;
          return {
            professionals: (viewData as Array<{
              id: string;
              display_name: string;
              slug: string;
              bio: string | null;
              city: string;
              state: string;
              is_featured: boolean;
              created_at: string;
              avatar_url: string | null;
            }>).map((p) => ({
              id: p.id,
              display_name: p.display_name,
              slug: p.slug,
              bio: p.bio,
              city: p.city,
              state: p.state,
              whatsapp: null,
              phone: null,
              is_featured: p.is_featured,
              created_at: p.created_at,
              avatar_url: p.avatar_url,
              company_name: null,
              company_slug: null,
              plan: 'gratuito',
              rank: 0,
            })),
            total,
            page,
            limit: PAGE_SIZE,
            totalPages: Math.ceil(total / PAGE_SIZE),
          };
        }
      }
    } catch {
      // Ignora erro do fallback
    }
  }

  if (!rows || rows.length === 0) {
    // Registra o termo sem resultado (anônimo, sem usuário nem IP — R11)
    if (filters.termo?.trim()) {
      try {
        await admin.rpc('log_no_result_term', { p_termo: filters.termo.trim() });
      } catch {
        // Ignora
      }
    }

    // "Você quis dizer...?"
    let suggestion: string | null = null;
    if (filters.termo?.trim()) {
      try {
        const { data: sug } = await admin.rpc('suggest_similar_term', {
          p_termo: filters.termo.trim(),
        });
        suggestion = sug ?? null;
      } catch {
        // Ignora
      }
    }

    return {
      professionals: [],
      total: 0,
      page,
      limit: PAGE_SIZE,
      totalPages: 0,
      suggestion,
    };
  }

  const total = Number(rows[0]?.total_count ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Busca especialidades dos profissionais retornados (N+1 evitado com IN)
  const pIds = rows.map((r: { id: string }) => r.id);
  const { data: specs } = await admin
    .from('profile_specialties')
    .select('profile_id, specialties(id, name, slug, category_id)')
    .in('profile_id', pIds);

  const specMap = new Map<string, { id: string; name: string; slug: string }[]>();
  for (const item of specs || []) {
    if (!item.specialties) continue;
    const spec = Array.isArray(item.specialties) ? item.specialties[0] : item.specialties;
    if (!spec) continue;
    const current = specMap.get(item.profile_id) || [];
    current.push({ id: spec.id, name: spec.name, slug: spec.slug });
    specMap.set(item.profile_id, current);
  }

  const professionals: PublicProfessional[] = rows.map(
    (r: {
      id: string;
      display_name: string;
      slug: string;
      bio: string | null;
      city: string;
      state: string;
      is_featured: boolean;
      created_at: string;
      avatar_url: string | null;
      plan: string;
      rank: number;
    }) => ({
      id: r.id,
      display_name: r.display_name,
      slug: r.slug,
      bio: r.bio,
      city: r.city,
      state: r.state,
      whatsapp: null, // protegido da listagem pública — R11
      phone: null,
      is_featured: r.is_featured,
      created_at: r.created_at,
      avatar_url: r.avatar_url,
      company_name: null,
      company_slug: null,
      plan: r.plan,
      rank: r.rank,
      specialties: specMap.get(r.id) || [],
    })
  );

  return { professionals, total, page, limit: PAGE_SIZE, totalPages };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Perfil público completo por slug (sem campos privados — R11)
// ─────────────────────────────────────────────────────────────────────────────
export async function getPublicProfessionalBySlug(
  slug: string
): Promise<PublicProfessional | null> {
  if (!slug) return null;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('public_professionals')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return null;
    }
    // Fallback admin para evitar RLS blocking na view
    let adminData: unknown = null;
    try {
      const admin = getAdminClient();
      const res = await admin
        .from('professional_profiles')
        .select(
          'id, display_name, slug, bio, city, state, whatsapp, phone, is_whatsapp_public, is_phone_public, is_featured, created_at, avatar_url, user_id, companies(name, slug)'
        )
        .eq('slug', slug)
        .eq('is_published', true)
        .eq('is_suspended', false)
        .single();
      adminData = res.data;
    } catch {
      return null;
    }

    if (!adminData) return null;

    const p = adminData as {
      id: string;
      display_name: string;
      slug: string;
      bio: string | null;
      city: string;
      state: string;
      whatsapp: string | null;
      phone: string | null;
      is_whatsapp_public: boolean;
      is_phone_public: boolean;
      is_featured: boolean;
      created_at: string;
      avatar_url: string | null;
      user_id: string;
      companies: { name: string; slug: string } | { name: string; slug: string }[] | null;
    };

    const comp = Array.isArray(p.companies) ? p.companies[0] : p.companies;
    return buildFullProfile(slug, {
      id: p.id,
      display_name: p.display_name,
      slug: p.slug,
      bio: p.bio,
      city: p.city,
      state: p.state,
      whatsapp: p.is_whatsapp_public ? p.whatsapp : null,
      phone: p.is_phone_public ? p.phone : null,
      is_featured: p.is_featured,
      created_at: p.created_at,
      avatar_url: p.avatar_url,
      company_name: comp?.name ?? null,
      company_slug: comp?.slug ?? null,
    });
  }

  return buildFullProfile(slug, {
    id: data.id,
    display_name: data.display_name,
    slug: data.slug,
    bio: data.bio,
    city: data.city,
    state: data.state,
    whatsapp: data.whatsapp,
    phone: data.phone,
    is_featured: data.is_featured,
    created_at: data.created_at,
    avatar_url: data.avatar_url,
    company_name: data.company_name ?? null,
    company_slug: data.company_slug ?? null,
  });
}

async function buildFullProfile(
  slug: string,
  base: Omit<PublicProfessional, 'plan' | 'rank' | 'specialties' | 'service_regions' | 'portfolio'>
): Promise<PublicProfessional> {
  const supabase = await createClient();

  const [specsRes, regionsRes, portfolioRes] = await Promise.all([
    supabase
      .from('profile_specialties')
      .select('specialties(id, name, slug)')
      .eq('profile_id', base.id),
    supabase
      .from('service_regions')
      .select('city, state, neighborhood')
      .eq('profile_id', base.id),
    supabase
      .from('portfolio_items')
      .select(
        'id, title, description, portfolio_images!inner(id, image_url, thumb_url, sort_order, is_demo, status)'
      )
      .eq('profile_id', base.id),
  ]);

  const specialties = (specsRes.data || [])
    .map((s) => (Array.isArray(s.specialties) ? s.specialties[0] : s.specialties))
    .filter(Boolean) as { id: string; name: string; slug: string }[];

  const portfolio: PublicPortfolioItem[] = (portfolioRes.data || [])
    .map((item) => {
      const rawImages = Array.isArray(item.portfolio_images) ? item.portfolio_images : [];
      const approvedImages = (rawImages as Array<{
        id: string;
        image_url: string;
        thumb_url: string | null;
        sort_order: number;
        is_demo: boolean;
        status: string;
      }>)
        .filter((img) => img.status === 'approved')
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((img) => ({
          id: img.id,
          image_url: img.image_url,
          thumb_url: img.thumb_url,
          sort_order: img.sort_order,
          is_demo: img.is_demo,
        }));
      return { id: item.id, title: item.title, description: item.description, images: approvedImages };
    })
    .filter((item) => item.images.length > 0);

  return {
    ...base,
    plan: 'gratuito',
    rank: 0,
    specialties,
    service_regions: regionsRes.data || [],
    portfolio,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Autocomplete de especialidades (rate-limit no middleware; cache de 60 s)
// ─────────────────────────────────────────────────────────────────────────────
export async function autocompleteSpecialties(
  prefix: string
): Promise<AutocompleteItem[]> {
  if (!prefix || prefix.trim().length < 2) return [];
  const admin = getAdminClient();
  const { data } = await admin.rpc('autocomplete_specialties', {
    p_prefix: prefix.trim(),
    p_limit: 8,
  });
  return (data || []) as AutocompleteItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Autocomplete de cidades
// ─────────────────────────────────────────────────────────────────────────────
export async function autocompleteCities(
  prefix: string,
  uf?: string
): Promise<CityAutocompleteItem[]> {
  if (!prefix || prefix.trim().length < 2) return [];
  const admin = getAdminClient();
  const { data } = await admin.rpc('autocomplete_cities', {
    p_prefix: prefix.trim(),
    p_uf: uf?.trim().toUpperCase() || null,
    p_limit: 8,
  });
  return (data || []) as CityAutocompleteItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Admin: listar termos sem resultado (agregado anônimo — sem usuário, sem IP)
// ─────────────────────────────────────────────────────────────────────────────
export async function getNoResultTerms(limitDays = 30): Promise<{
  success: boolean;
  terms?: NoResultLog[];
  error?: string;
}> {
  const { user, role } = await getAdminUserRole();
  if (!user || !role) return { success: false, error: 'Acesso negado.' };

  const admin = getAdminClient();
  const since = new Date();
  since.setDate(since.getDate() - limitDays);

  const { data, error } = await admin
    .from('search_no_results_log')
    .select('term, search_date, count')
    .gte('search_date', since.toISOString().split('T')[0])
    .order('count', { ascending: false })
    .limit(100);

  if (error) return { success: false, error: error.message };
  return { success: true, terms: (data || []) as NoResultLog[] };
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Admin: listar sinônimos
// ─────────────────────────────────────────────────────────────────────────────
export async function listSearchSynonyms(): Promise<{
  success: boolean;
  synonyms?: SearchSynonym[];
  error?: string;
}> {
  const { user, role } = await getAdminUserRole();
  if (!user || !role) return { success: false, error: 'Acesso negado.' };

  const admin = getAdminClient();
  const { data, error } = await admin
    .from('search_synonyms')
    .select('id, term, synonyms, is_active, created_at, updated_at')
    .order('term');

  if (error) return { success: false, error: error.message };
  return { success: true, synonyms: (data || []) as SearchSynonym[] };
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Admin: criar/atualizar sinônimo
// ─────────────────────────────────────────────────────────────────────────────
export async function upsertSearchSynonym(params: {
  id?: string;
  term: string;
  synonyms: string[];
  is_active: boolean;
}): Promise<{ success: boolean; error?: string }> {
  const { user, role } = await getAdminUserRole();
  if (!user || !role) return { success: false, error: 'Acesso negado.' };
  if (role !== 'owner' && role !== 'admin') {
    return { success: false, error: 'Apenas owner e admin podem gerenciar sinônimos.' };
  }

  const admin = getAdminClient();
  const payload = {
    term: params.term.trim().toLowerCase(),
    synonyms: params.synonyms.map((s) => s.trim()).filter(Boolean),
    is_active: params.is_active,
    created_by: user.id,
    updated_at: new Date().toISOString(),
  };

  if (params.id) {
    const { error } = await admin
      .from('search_synonyms')
      .update(payload)
      .eq('id', params.id);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await admin.from('search_synonyms').insert(payload);
    if (error) return { success: false, error: error.message };
  }

  revalidatePath('/admin/busca');
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Admin: excluir sinônimo
// ─────────────────────────────────────────────────────────────────────────────
export async function deleteSearchSynonym(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const { user, role } = await getAdminUserRole();
  if (!user || !role) return { success: false, error: 'Acesso negado.' };
  if (role !== 'owner' && role !== 'admin') {
    return { success: false, error: 'Apenas owner e admin podem excluir sinônimos.' };
  }

  const admin = getAdminClient();
  const { error } = await admin.from('search_synonyms').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/busca');
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy: empresa por slug (mantida para compatibilidade com fases anteriores)
// ─────────────────────────────────────────────────────────────────────────────
export interface PublicCompany {
  id: string;
  name: string;
  trade_name: string | null;
  slug: string;
  cnpj: string | null;
  description: string | null;
  logo_url: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
  professionals?: PublicProfessional[];
}

export async function getPublicCompanyBySlug(
  slug: string
): Promise<PublicCompany | null> {
  if (!slug) return null;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('companies')
    .select('id, name, trade_name, slug, cnpj, description, logo_url, city, state, created_at, is_published')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !data) return null;

  const { data: profs } = await supabase
    .from('public_professionals')
    .select('*')
    .eq('company_slug', slug);

  return {
    id: data.id,
    name: data.name,
    trade_name: data.trade_name,
    slug: data.slug,
    cnpj: data.cnpj,
    description: data.description,
    logo_url: data.logo_url,
    city: data.city,
    state: data.state,
    created_at: data.created_at,
    professionals: (profs || []).map((p) => ({
      id: p.id,
      display_name: p.display_name,
      slug: p.slug,
      bio: p.bio,
      city: p.city,
      state: p.state,
      whatsapp: p.whatsapp,
      phone: p.phone,
      is_featured: p.is_featured,
      created_at: p.created_at,
      avatar_url: p.avatar_url,
      company_name: p.company_name ?? null,
      company_slug: p.company_slug ?? null,
      plan: 'gratuito',
      rank: 0,
    })),
  };
}
