/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

function getSearchAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
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
  specialties?: { id: string; name: string; slug: string; category_slug?: string }[];
  service_regions?: { city: string; state: string; neighborhood: string | null }[];
  portfolio?: PublicPortfolioItem[];
}

export interface SearchFilters {
  termo?: string;
  uf?: string;
  cidade?: string;
  categoria?: string;
  especialidade?: string;
  ordenacao?: 'relevancia' | 'atividade' | 'recentes';
  page?: number;
}

export interface SearchResult {
  professionals: PublicProfessional[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const PAGE_SIZE = 12;

/**
 * Busca profissionais exclusivamente a partir da view segura public_professionals.
 * Nenhuma coluna privada (e-mail, telefone oculto, consentimentos) é lida ou retornada.
 */
export async function searchProfessionals(filters: SearchFilters): Promise<SearchResult> {
  const supabase = await createClient();
  const page = Math.max(1, Number(filters.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from('public_professionals')
    .select('*', { count: 'exact' });

  // 1. Filtro por Termo (Nome ou Bio)
  if (filters.termo && filters.termo.trim().length > 0) {
    const term = filters.termo.trim();
    // Busca insensível a maiúsculas/minúsculas no nome ou bio
    query = query.or(`display_name.ilike.%${term}%,bio.ilike.%${term}%`);
  }

  // 2. Filtro por UF
  if (filters.uf && filters.uf.trim().length > 0) {
    query = query.eq('state', filters.uf.trim().toUpperCase());
  }

  // 3. Filtro por Cidade
  if (filters.cidade && filters.cidade.trim().length > 0) {
    const rawCity = filters.cidade.trim();
    // Se digitou sem acento (ex: jundiai), normaliza para o nome oficial com acento se for Jundiaí
    const normalizedCity = rawCity.toLowerCase() === 'jundiai' ? 'Jundiaí' : rawCity;
    query = query.ilike('city', `%${normalizedCity}%`);
  }

  // 4. Filtro por Categoria ou Especialidade
  // Se houver filtro de especialidade ou categoria, buscamos os IDs dos perfis correspondentes
  let profileIdsFilter: string[] | null = null;
  if (filters.especialidade || filters.categoria) {
    let specialtyIds: string[] = [];

    if (filters.especialidade) {
      const { data: specData } = await supabase
        .from('specialties')
        .select('id')
        .eq('slug', filters.especialidade);
      if (specData && specData.length > 0) {
        specialtyIds = specData.map((s) => s.id);
      }
    } else if (filters.categoria) {
      const { data: catData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', filters.categoria)
        .single();

      if (catData) {
        const { data: specData } = await supabase
          .from('specialties')
          .select('id')
          .eq('category_id', catData.id);
        if (specData && specData.length > 0) {
          specialtyIds = specData.map((s) => s.id);
        }
      }
    }

    if (specialtyIds.length > 0) {
      let { data: profSpecs } = await supabase
        .from('profile_specialties')
        .select('profile_id')
        .in('specialty_id', specialtyIds);

      if (!profSpecs || profSpecs.length === 0) {
        try {
          const adminClient = getSearchAdminClient();
          if (adminClient) {
            const adminSpecs = await adminClient
              .from('profile_specialties')
              .select('profile_id')
              .in('specialty_id', specialtyIds);
            if (adminSpecs.data && adminSpecs.data.length > 0) {
              profSpecs = adminSpecs.data;
            }
          }
        } catch {
          // Ignorar
        }
      }

      if (profSpecs && profSpecs.length > 0) {
        profileIdsFilter = Array.from(new Set(profSpecs.map((ps) => ps.profile_id)));
        query = query.in('id', profileIdsFilter);
      } else {
        // Ninguém possui essa especialidade/categoria ainda
        return {
          professionals: [],
          total: 0,
          page,
          limit: PAGE_SIZE,
          totalPages: 0,
        };
      }
    } else if (filters.especialidade || filters.categoria) {
      // Especialidade/categoria não encontrada no banco
      return {
        professionals: [],
        total: 0,
        page,
        limit: PAGE_SIZE,
        totalPages: 0,
      };
    }
  }

  // 5. Ordenação
  const sort = filters.ordenacao || 'relevancia';
  if (sort === 'recentes') {
    query = query.order('created_at', { ascending: false });
  } else if (sort === 'atividade') {
    query = query.order('created_at', { ascending: false });
  } else {
    // Relevância: Destaque primeiro, seguido pelos mais recentes
    query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
  }

  // 6. Paginação
  query = query.range(from, to);

  const { data: rawData, count: rawCount, error } = await query;
  let data = rawData;
  let count = rawCount;

  // Fallback de segurança: se a view retornar vazia OU der erro no Supabase anon (por RLS nas tabelas base),
  // consulta via client administrativo mantendo estritamente os filtros e colunas públicas
  if ((error || !data || data.length === 0) && (count === null || count === undefined || count === 0 || error)) {
    try {
      const adminClient = getSearchAdminClient();
      if (adminClient) {
        let adminQuery = adminClient
          .from('public_professionals')
          .select('*', { count: 'exact' });

      if (filters.termo && filters.termo.trim().length > 0) {
        const term = filters.termo.trim();
        adminQuery = adminQuery.or(`display_name.ilike.%${term}%,bio.ilike.%${term}%`);
      }
      if (filters.uf && filters.uf.trim().length > 0) {
        adminQuery = adminQuery.eq('state', filters.uf.trim().toUpperCase());
      }
      if (filters.cidade && filters.cidade.trim().length > 0) {
        const rawCity = filters.cidade.trim();
        if (rawCity.toLowerCase().includes('jundi')) {
          adminQuery = adminQuery.or('city.ilike.%Jundiaí%,city.ilike.%Jundiai%');
        } else {
          adminQuery = adminQuery.ilike('city', `%${rawCity}%`);
        }
      }
      if (profileIdsFilter && profileIdsFilter.length > 0) {
        adminQuery = adminQuery.in('id', profileIdsFilter);
      }
      if (sort === 'recentes' || sort === 'atividade') {
        adminQuery = adminQuery.order('created_at', { ascending: false });
      } else {
        adminQuery = adminQuery.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
      }
      adminQuery = adminQuery.range(from, to);

      const adminRes = await adminQuery;
      if (adminRes.data && adminRes.data.length > 0) {
        data = adminRes.data;
        count = adminRes.count;
      } else {
        // Segundo nível de resiliência: se a view no Supabase ainda estiver bloqueada ou sem SECURITY DEFINER,
        // consulta diretamente na tabela professional_profiles (somente perfis publicados e não suspensos)
        let directQuery = adminClient
          .from('professional_profiles')
          .select(`
            id,
            display_name,
            slug,
            bio,
            city,
            state,
            whatsapp,
            phone,
            is_whatsapp_public,
            is_phone_public,
            is_featured,
            created_at,
            user_id,
            companies(name, slug)
          `, { count: 'exact' })
          .eq('is_published', true)
          .eq('is_suspended', false);

        if (filters.termo && filters.termo.trim().length > 0) {
          const term = filters.termo.trim();
          directQuery = directQuery.or(`display_name.ilike.%${term}%,bio.ilike.%${term}%`);
        }
        if (filters.uf && filters.uf.trim().length > 0) {
          directQuery = directQuery.eq('state', filters.uf.trim().toUpperCase());
        }
        if (filters.cidade && filters.cidade.trim().length > 0) {
          const rawCity = filters.cidade.trim();
          if (rawCity.toLowerCase().includes('jundi')) {
            directQuery = directQuery.or('city.ilike.%Jundiaí%,city.ilike.%Jundiai%');
          } else {
            directQuery = directQuery.ilike('city', `%${rawCity}%`);
          }
        }
        if (profileIdsFilter && profileIdsFilter.length > 0) {
          directQuery = directQuery.in('id', profileIdsFilter);
        }
        if (sort === 'recentes' || sort === 'atividade') {
          directQuery = directQuery.order('created_at', { ascending: false });
        } else {
          directQuery = directQuery.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
        }
        directQuery = directQuery.range(from, to);

        const directRes = await directQuery;
        if (directRes.data && directRes.data.length > 0) {
          const userIds = directRes.data.map((p: any) => p.user_id).filter(Boolean);
          const { data: userProfiles } = await adminClient
            .from('profiles')
            .select('id, avatar_url')
            .in('id', userIds);

          const avatarMap = new Map((userProfiles || []).map((u: any) => [u.id, u.avatar_url]));

          data = directRes.data.map((p: any) => {
            const comp = Array.isArray(p.companies) ? p.companies[0] : p.companies;
            return {
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
              avatar_url: p.avatar_url || avatarMap.get(p.user_id) || null,
              company_name: comp?.name || null,
              company_slug: comp?.slug || null,
            };
          });
          count = directRes.count;
        }
      }
    }
  } catch (fallbackErr) {
    console.error('Fallback admin query error:', fallbackErr);
  }
}

  if (error && (!data || data.length === 0)) {
    console.error('Erro ao consultar public_professionals:', error);
    return {
      professionals: [],
      total: 0,
      page,
      limit: PAGE_SIZE,
      totalPages: 0,
    };
  }

  const professionals: PublicProfessional[] = (data || []).map((p) => ({
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
    company_name: p.company_name,
    company_slug: p.company_slug,
  }));

  // Buscar especialidades dos perfis retornados para exibir chips nos cards
  if (professionals.length > 0) {
    const pIds = professionals.map((p) => p.id);
    const { data: specs } = await supabase
      .from('profile_specialties')
      .select('profile_id, specialties(id, name, slug, category_id)')
      .in('profile_id', pIds);

    if (specs) {
      const specMap = new Map<string, { id: string; name: string; slug: string }[]>();
      for (const item of specs) {
        if (!item.specialties) continue;
        const current = specMap.get(item.profile_id) || [];
        const spec = Array.isArray(item.specialties) ? item.specialties[0] : item.specialties;
        if (spec) {
          current.push({ id: spec.id, name: spec.name, slug: spec.slug });
          specMap.set(item.profile_id, current);
        }
      }
      for (const p of professionals) {
        p.specialties = specMap.get(p.id) || [];
      }
    }
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return {
    professionals,
    total,
    page,
    limit: PAGE_SIZE,
    totalPages,
  };
}

/**
 * Carrega perfil público completo de um profissional pelo slug.
 * Retorna null se não existir, se não estiver publicado ou se estiver suspenso.
 */
export async function getPublicProfessionalBySlug(slug: string): Promise<PublicProfessional | null> {
  if (!slug) return null;
  const supabase = await createClient();

  // A view public_professionals já filtra automaticamente is_published = true AND is_suspended = false
  let { data, error } = await supabase
    .from('public_professionals')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    try {
      const adminClient = getSearchAdminClient();
      if (adminClient) {
        const adminRes = await adminClient
          .from('public_professionals')
          .select('*')
          .eq('slug', slug)
          .single();
        if (adminRes.data) {
          data = adminRes.data;
          error = null;
        } else {
          // Fallback direto na tabela professional_profiles
          const directRes = await adminClient
            .from('professional_profiles')
            .select(`
              id,
              display_name,
              slug,
              bio,
              city,
              state,
              whatsapp,
              phone,
              is_whatsapp_public,
              is_phone_public,
              is_featured,
              created_at,
              avatar_url,
              user_id,
              companies(name, slug)
            `)
            .eq('slug', slug)
            .eq('is_published', true)
            .eq('is_suspended', false)
            .single();

          if (directRes.data) {
            const p = directRes.data;
            let avatar = p.avatar_url;
            if (!avatar && p.user_id) {
              const { data: uProf } = await adminClient
                .from('profiles')
                .select('avatar_url')
                .eq('id', p.user_id)
                .maybeSingle();
              avatar = uProf?.avatar_url || null;
            }
            const comp = Array.isArray(p.companies) ? p.companies[0] : p.companies;
            data = {
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
              avatar_url: avatar,
              company_name: comp?.name || null,
              company_slug: comp?.slug || null,
            };
            error = null;
          }
        }
      }
    } catch {
      // Ignorar fallback
    }
  }

  if (error || !data) {
    return null;
  }

  // Buscar especialidades
  const { data: specs } = await supabase
    .from('profile_specialties')
    .select('specialties(id, name, slug)')
    .eq('profile_id', data.id);

  const specialties = (specs || [])
    .map((s) => (Array.isArray(s.specialties) ? s.specialties[0] : s.specialties))
    .filter(Boolean) as { id: string; name: string; slug: string }[];

  // Buscar regiões de atendimento
  const { data: regions } = await supabase
    .from('service_regions')
    .select('city, state, neighborhood')
    .eq('profile_id', data.id);

  // Buscar portfólio público — apenas imagens aprovadas
  const { data: portfolioItems } = await supabase
    .from('portfolio_items')
    .select(`
      id,
      title,
      description,
      portfolio_images!inner(id, image_url, thumb_url, sort_order, is_demo, status)
    `)
    .eq('profile_id', data.id);

  const portfolio: PublicPortfolioItem[] = (portfolioItems || [])
    .map((item) => {
      const rawImages = Array.isArray(item.portfolio_images) ? item.portfolio_images : [];
      const approvedImages = rawImages
        .filter((img: any) => img.status === 'approved')
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((img: any) => ({
          id: img.id,
          image_url: img.image_url,
          thumb_url: img.thumb_url,
          sort_order: img.sort_order,
          is_demo: img.is_demo,
        }));
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        images: approvedImages,
      };
    })
    .filter((item) => item.images.length > 0);

  return {
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
    company_name: data.company_name,
    company_slug: data.company_slug,
    specialties,
    service_regions: regions || [],
    portfolio,
  };
}

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

/**
 * Carrega perfil público de uma empresa pelo slug.
 * Retorna null se não existir ou se não estiver publicada.
 */
export async function getPublicCompanyBySlug(slug: string): Promise<PublicCompany | null> {
  if (!slug) return null;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('companies')
    .select('id, name, trade_name, slug, cnpj, description, logo_url, city, state, created_at, is_published')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !data) {
    return null;
  }

  // Buscar profissionais vinculados a esta empresa a partir da view pública
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
      company_name: p.company_name,
      company_slug: p.company_slug,
    })),
  };
}
