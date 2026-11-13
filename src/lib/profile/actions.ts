'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import {
  professionalProfileSchema,
  publishValidationSchema,
  companySchema,
  generateSlug,
} from './schemas';
import { processAvatarImage } from '@/lib/storage/upload';
import { getEntitlements } from '@/lib/plans/actions';

export type ProfileActionResult<T = unknown> =
  | { success: true; data?: T; message?: string }
  | { error: string };

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ─── Salvar / Atualizar Perfil Profissional ───────────────────────────────────

export async function saveProfessionalProfile(
  rawInput: unknown
): Promise<ProfileActionResult<{ id: string; slug: string }>> {
  const parsed = professionalProfileSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Sessão expirada. Faça login novamente.' };
  }

  const {
    id: profileId,
    displayName,
    bio,
    city,
    state,
    neighborhoods,
    specialtyIds,
    whatsapp,
    isWhatsappPublic,
    phone,
    isPhonePublic,
    avatarUrl,
    companyId,
  } = parsed.data;

  // Se informou ID existente, verificar se o perfil pertence ao usuário logado (Isolamento A x B)
  if (profileId) {
    const { data: existing } = await supabase
      .from('professional_profiles')
      .select('id, user_id, slug')
      .eq('id', profileId)
      .single();

    if (!existing || existing.user_id !== user.id) {
      return { error: 'Acesso não autorizado. Você só pode editar o seu próprio perfil.' };
    }
  }

  // Gerar ou manter slug único e seguro
  let slug = generateSlug(displayName, city);
  const admin = getAdminClient();

  // Checar colisão de slug com outros perfis
  const { data: slugConflict } = await admin
    .from('professional_profiles')
    .select('id')
    .eq('slug', slug)
    .neq('user_id', user.id);

  if (slugConflict && slugConflict.length > 0) {
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    slug = `${slug}-${randomSuffix}`;
  }

  // Sanitização estrita: dados protegidos (is_suspended, is_featured) nunca são aceitos do input
  const profilePayload: Record<string, unknown> = {
    user_id: user.id,
    display_name: displayName,
    slug,
    bio,
    city,
    state,
    whatsapp: whatsapp || null,
    phone: phone || null,
    is_whatsapp_public: isWhatsappPublic,
    is_phone_public: isPhonePublic,
    company_id: companyId || null,
    last_active_at: new Date().toISOString(),
    // is_published e is_suspended mantidos ou padrão false
  };

  if (avatarUrl) {
    profilePayload.avatar_url = avatarUrl;
  }

  let savedId = profileId;

  if (profileId) {
    const { error: updateErr } = await supabase
      .from('professional_profiles')
      .update(profilePayload)
      .eq('id', profileId)
      .eq('user_id', user.id);

    if (updateErr) {
      return { error: 'Não foi possível atualizar o perfil. Tente novamente.' };
    }
  } else {
    // Verificar se usuário já possui um perfil (MVP: 1 por conta)
    const { data: existingUserProf } = await supabase
      .from('professional_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingUserProf) {
      savedId = existingUserProf.id;
      await supabase
        .from('professional_profiles')
        .update(profilePayload)
        .eq('id', savedId);
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from('professional_profiles')
        .insert({ ...profilePayload, is_published: false, is_suspended: false, is_featured: false })
        .select('id')
        .single();

      if (insertErr || !inserted) {
        return { error: 'Erro ao criar perfil profissional.' };
      }
      savedId = inserted.id;
    }
  }

  // Sincronizar avatar na tabela profiles do usuário com upsert (garante criação mesmo se o registro não existia)
  if (avatarUrl) {
    await admin.from('profiles').upsert(
      {
        id: user.id,
        email: user.email ?? '',
        full_name: (user.user_metadata?.full_name as string) || displayName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
  }

  // Validar limites de categorias via Entitlements
  if (specialtyIds && specialtyIds.length > 0) {
    const { data: specs } = await admin
      .from('specialties')
      .select('category_id')
      .in('id', specialtyIds);
    const categorySet = new Set((specs || []).map((s: { category_id: string }) => s.category_id));
    const entitlements = await getEntitlements(user.id);
    if (categorySet.size > entitlements.maxCategories) {
      return {
        error: `Seu plano (${entitlements.planName}) permite atuar em no máximo ${entitlements.maxCategories} categorias simultâneas. Você selecionou especialidades pertencentes a ${categorySet.size} categorias.`,
      };
    }
  }

  // Sincronizar Especialidades (Tabela associativa profile_specialties)
  if (savedId && specialtyIds.length > 0) {
    await admin.from('profile_specialties').delete().eq('profile_id', savedId);
    const specialtyRows = specialtyIds.map((specId) => ({
      profile_id: savedId!,
      specialty_id: specId,
    }));
    await admin.from('profile_specialties').insert(specialtyRows);
  }

  // Sincronizar Regiões de Atendimento (service_regions - nunca endereço residencial)
  if (savedId) {
    await admin.from('service_regions').delete().eq('profile_id', savedId);
    await admin.from('service_regions').insert({
      profile_id: savedId,
      city,
      state,
      neighborhoods: neighborhoods || [],
    });
  }

  revalidatePath('/painel/perfil');
  revalidatePath('/painel');

  return {
    success: true,
    data: { id: savedId!, slug },
    message: 'Perfil salvo com sucesso!',
  };
}

// ─── Publicar / Despublicar Perfil ───────────────────────────────────────────

export async function togglePublishProfile(
  profileId: string,
  targetPublishState: boolean,
  clientAvatarUrl?: string
): Promise<ProfileActionResult<{ isPublished: boolean }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Sessão expirada. Faça login novamente.' };
  }

  // Buscar perfil para validar requisitos mínimos (usando admin para ler relações com segurança contra RLS)
  const admin = getAdminClient();
  const { data: profile } = await admin
    .from('professional_profiles')
    .select('*, profile_specialties(specialty_id), service_regions(neighborhoods)')
    .eq('id', profileId)
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    return { error: 'Perfil não encontrado ou não pertence a você.' };
  }

  if (targetPublishState) {
    // Validar critérios obrigatórios mínimos antes de permitir a publicação
    const typedProfile = profile as typeof profile & { service_regions?: { neighborhoods?: string[] }[] };
    const rawNeighborhoods = typedProfile.service_regions?.[0]?.neighborhoods || [];
    
    // Obter avatar: prioriza o enviado diretamente pelo formulário, depois profiles, depois profile
    let effectiveAvatar =
      clientAvatarUrl || ((profile as Record<string, unknown>).avatar_url as string | undefined);
    if (!effectiveAvatar) {
      const { data: userProfile } = await admin
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .maybeSingle();
      effectiveAvatar = userProfile?.avatar_url ?? '';
    }

    // Se temos avatar válido, garante persistência imediata em profiles (com upsert) e em professional_profiles
    if (effectiveAvatar) {
      await admin.from('profiles').upsert(
        {
          id: user.id,
          email: user.email ?? '',
          full_name: (user.user_metadata?.full_name as string) || (profile.display_name as string) || 'Profissional',
          avatar_url: effectiveAvatar,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

      try {
        await admin
          .from('professional_profiles')
          .update({ avatar_url: effectiveAvatar })
          .eq('id', profileId);
      } catch {
        // Ignorar caso coluna ainda não exista
      }
    }

    const validation = publishValidationSchema.safeParse({
      displayName: profile.display_name,
      bio: profile.bio ?? '',
      city: profile.city,
      state: profile.state,
      neighborhoods: rawNeighborhoods,
      specialtyIds: profile.profile_specialties?.map((s: { specialty_id: string }) => s.specialty_id) ?? [],
      whatsapp: profile.whatsapp ?? '',
      avatarUrl: effectiveAvatar ?? '',
      emailConfirmed: !!user.email_confirmed_at,
    });

    if (!validation.success) {
      return {
        error: `Não é possível publicar o perfil ainda: ${validation.error.errors[0].message}`,
      };
    }

    if (profile.is_suspended) {
      return { error: 'Este perfil está temporariamente suspenso pela moderação e não pode ser publicado.' };
    }
  }

  const { error } = await admin
    .from('professional_profiles')
    .update({ is_published: targetPublishState })
    .eq('id', profileId)
    .eq('user_id', user.id);

  if (error) {
    return { error: 'Não foi possível alterar o status de publicação.' };
  }

  revalidatePath('/painel/perfil');
  revalidatePath('/painel');
  revalidatePath('/encontrar-profissionais');
  revalidatePath('/');
  return {
    success: true,
    data: { isPublished: targetPublishState },
    message: targetPublishState
      ? 'Perfil publicado! Agora ele pode ser encontrado no catálogo.'
      : 'Perfil despublicado com sucesso.',
  };
}

// ─── Empresa Básica (/painel/empresas) ────────────────────────────────────────

export async function saveCompany(
  rawInput: unknown
): Promise<ProfileActionResult<{ id: string; slug: string }>> {
  const parsed = companySchema.safeParse(rawInput);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Sessão expirada. Faça login novamente.' };
  }

  const { id: companyId, name, tradeName, cnpj, description, logoUrl } = parsed.data;

  // Gerar slug seguro
  let slug = generateSlug(tradeName || name);
  const admin = getAdminClient();

  // Checar colisão de slug
  const { data: conflict } = await admin
    .from('companies')
    .select('id')
    .eq('slug', slug)
    .neq('owner_id', user.id);

  if (conflict && conflict.length > 0) {
    slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
  }

  if (companyId) {
    // Isolamento: verificar se o usuário é o dono real da empresa
    const { data: existing } = await supabase
      .from('companies')
      .select('owner_id')
      .eq('id', companyId)
      .single();

    if (!existing || existing.owner_id !== user.id) {
      return { error: 'Apenas o proprietário pode editar os dados desta empresa.' };
    }

    const { error: updateErr } = await supabase
      .from('companies')
      .update({
        name,
        trade_name: tradeName || null,
        cnpj: cnpj || null, // Opcional e informativo sem selo
        description: description || null,
        logo_url: logoUrl || null,
        slug,
      })
      .eq('id', companyId)
      .eq('owner_id', user.id);

    if (updateErr) {
      return { error: 'Erro ao atualizar dados da empresa.' };
    }

    revalidatePath('/painel/empresas');
    return { success: true, data: { id: companyId, slug }, message: 'Empresa atualizada!' };
  } else {
    // Criar nova empresa com owner_id vinculado
    const { data: created, error: createErr } = await supabase
      .from('companies')
      .insert({
        owner_id: user.id,
        name,
        trade_name: tradeName || null,
        cnpj: cnpj || null,
        description: description || null,
        logo_url: logoUrl || null,
        slug,
        is_published: true,
      })
      .select('id')
      .single();

    if (createErr || !created) {
      return { error: 'Erro ao cadastrar empresa.' };
    }

    // Registrar criador na tabela company_members como owner
    await admin.from('company_members').insert({
      company_id: created.id,
      user_id: user.id,
      role: 'owner',
    });

    revalidatePath('/painel/empresas');
    return { success: true, data: { id: created.id, slug }, message: 'Empresa cadastrada com sucesso!' };
  }
}

// ─── Upload de Avatar / Logotipo no Bucket avatars ────────────────────────────

export async function uploadAvatarAction(
  formData: FormData
): Promise<ProfileActionResult<{ publicUrl: string }>> {
  const file = formData.get('file') as File | null;
  if (!file) {
    return { error: 'Nenhum arquivo enviado.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Sessão expirada. Faça login para enviar imagens.' };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Validação real de magic bytes + conversão para WebP + redimensionamento para 512px + limite 150 KB
  const processed = await processAvatarImage(buffer);
  if (!processed.valid || !processed.buffer) {
    return { error: processed.error || 'Arquivo de imagem inválido.' };
  }

  const fileName = `${user.id}/avatar-${Date.now()}.webp`;
  const admin = getAdminClient();

  const { error: uploadError } = await admin.storage
    .from('avatars')
    .upload(fileName, processed.buffer, {
      contentType: 'image/webp',
      upsert: true,
    });

  if (uploadError) {
    return { error: 'Não foi possível salvar a imagem no servidor de armazenamento.' };
  }

  const { data: urlData } = admin.storage.from('avatars').getPublicUrl(fileName);
  const publicUrl = urlData.publicUrl;

  // Imediatamente sincroniza a foto na tabela profiles do usuário usando upsert
  await admin.from('profiles').upsert(
    {
      id: user.id,
      email: user.email ?? '',
      full_name: (user.user_metadata?.full_name as string) || 'Profissional',
      avatar_url: publicUrl,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  // Também tenta persistir diretamente em professional_profiles (caso a coluna exista)
  try {
    await admin
      .from('professional_profiles')
      .update({ avatar_url: publicUrl })
      .eq('user_id', user.id);
  } catch {
    // Ignorar caso coluna ainda não exista
  }

  return {
    success: true,
    data: { publicUrl },
    message: 'Imagem enviada e otimizada em WebP com sucesso!',
  };
}
