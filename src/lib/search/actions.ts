import { createClient } from '@/lib/supabase/server';

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
    query = query.ilike('city', `%${filters.cidade.trim()}%`);
  }

  // 4. Filtro por Categoria ou Especialidade
  // Se houver filtro de especialidade ou categoria, buscamos os IDs dos perfis correspondentes
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
      const { data: profSpecs } = await supabase
        .from('profile_specialties')
        .select('profile_id')
        .in('specialty_id', specialtyIds);

      if (profSpecs && profSpecs.length > 0) {
        const profileIds = Array.from(new Set(profSpecs.map((ps) => ps.profile_id)));
        query = query.in('id', profileIds);
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

  const { data, count, error } = await query;

  if (error) {
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
  const { data, error } = await supabase
    .from('public_professionals')
    .select('*')
    .eq('slug', slug)
    .single();

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
