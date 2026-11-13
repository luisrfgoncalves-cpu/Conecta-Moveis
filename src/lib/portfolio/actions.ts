/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { PORTFOLIO_CONFIG, runAutoModerationExtension } from './config';
import { processPortfolioImage } from './processor';
import { getEntitlements } from '@/lib/plans/actions';

export interface PortfolioItemWithImages {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  created_at: string;
  images: {
    id: string;
    image_url: string;
    thumb_url: string | null;
    bytes_size: number;
    sort_order: number;
    status: 'pending' | 'approved' | 'rejected';
    is_demo: boolean;
    created_at: string;
  }[];
}

export interface PortfolioStorageSummary {
  totalPhotos: number;
  maxPhotos: number;
  totalBytes: number;
  storageFormatted: string;
  canUploadMore: boolean;
}

/**
 * Carrega todos os itens de portfólio e resumo de armazenamento do profissional logado.
 */
export async function getMyPortfolioData(): Promise<{
  profileId: string | null;
  items: PortfolioItemWithImages[];
  storage: PortfolioStorageSummary;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      profileId: null,
      items: [],
      storage: {
        totalPhotos: 0,
        maxPhotos: PORTFOLIO_CONFIG.MAX_PHOTOS_PER_PROFILE,
        totalBytes: 0,
        storageFormatted: '0 KB',
        canUploadMore: false,
      },
    };
  }

  // Buscar ID do perfil profissional do usuário
  const { data: profile } = await supabase
    .from('professional_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    return {
      profileId: null,
      items: [],
      storage: {
        totalPhotos: 0,
        maxPhotos: PORTFOLIO_CONFIG.MAX_PHOTOS_PER_PROFILE,
        totalBytes: 0,
        storageFormatted: '0 KB',
        canUploadMore: false,
      },
    };
  }

  // Buscar itens de portfólio com suas imagens
  const { data: itemsData, error } = await supabase
    .from('portfolio_items')
    .select(`
      id,
      title,
      description,
      category_id,
      created_at,
      portfolio_images (
        id,
        image_url,
        thumb_url,
        bytes_size,
        sort_order,
        status,
        is_demo,
        created_at
      )
    `)
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false });

  if (error || !itemsData) {
    return {
      profileId: profile.id,
      items: [],
      storage: {
        totalPhotos: 0,
        maxPhotos: PORTFOLIO_CONFIG.MAX_PHOTOS_PER_PROFILE,
        totalBytes: 0,
        storageFormatted: '0 KB',
        canUploadMore: true,
      },
    };
  }

  let totalPhotos = 0;
  let totalBytes = 0;

  const items: PortfolioItemWithImages[] = itemsData.map((item) => {
    const rawImages = (item.portfolio_images || []) as any[];
    rawImages.sort((a, b) => a.sort_order - b.sort_order);

    totalPhotos += rawImages.length;
    for (const img of rawImages) {
      totalBytes += img.bytes_size || 0;
    }

    return {
      id: item.id,
      title: item.title,
      description: item.description,
      category_id: item.category_id,
      created_at: item.created_at,
      images: rawImages.map((img) => ({
        id: img.id,
        image_url: img.image_url,
        thumb_url: img.thumb_url,
        bytes_size: img.bytes_size,
        sort_order: img.sort_order,
        status: img.status,
        is_demo: img.is_demo,
        created_at: img.created_at,
      })),
    };
  });

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const entitlements = await getEntitlements(user.id);
  const maxPhotos = entitlements.maxPhotos;

  return {
    profileId: profile.id,
    items,
    storage: {
      totalPhotos,
      maxPhotos,
      totalBytes,
      storageFormatted: formatBytes(totalBytes),
      canUploadMore: totalPhotos < maxPhotos,
    },
  };
}

/**
 * Criação de um novo Projeto de Portfólio.
 * Exige declaração formal de autoria ou autorização de uso.
 */
export async function createPortfolioProject(formData: FormData): Promise<{ success: boolean; itemId?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Usuário não autenticado.' };
  }

  const title = (formData.get('title') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || null;
  const category_id = (formData.get('category_id') as string)?.trim() || null;
  const authorshipAccepted = formData.get('authorship_declaration') === 'true';

  if (!title || title.length < 3) {
    return { success: false, error: 'O título do projeto deve ter no mínimo 3 caracteres.' };
  }

  if (!authorshipAccepted) {
    return {
      success: false,
      error: 'É obrigatório declarar autoria ou autorização de imagem para cadastrar projetos.',
    };
  }

  // Buscar perfil profissional
  const { data: profile } = await supabase
    .from('professional_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    return { success: false, error: 'Perfil profissional não encontrado. Crie seu perfil primeiro.' };
  }

  const { data, error } = await supabase
    .from('portfolio_items')
    .insert({
      profile_id: profile.id,
      title,
      description,
      category_id: category_id || null,
    })
    .select('id')
    .single();

  if (error || !data) {
    return { success: false, error: error?.message || 'Falha ao criar projeto de portfólio.' };
  }

  revalidatePath('/painel/portfolio');
  return { success: true, itemId: data.id };
}

/**
 * Upload seguro de fotos para o bucket `portfolio-pending`.
 * Valida cota máxima (6 fotos), magic bytes, remove EXIF, gera miniatura e registra bytes.
 */
export async function uploadPortfolioPhotos(formData: FormData): Promise<{ success: boolean; uploadedCount?: number; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Usuário não autenticado.' };
  }

  const itemId = formData.get('itemId') as string;
  if (!itemId) {
    return { success: false, error: 'ID do projeto não informado.' };
  }

  const isDemo = formData.get('is_demo') === 'true';

  // Buscar perfil profissional e verificar se o item pertence a ele
  const { data: profile } = await supabase
    .from('professional_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    return { success: false, error: 'Perfil profissional não encontrado.' };
  }

  const { data: item } = await supabase
    .from('portfolio_items')
    .select('id, profile_id')
    .eq('id', itemId)
    .eq('profile_id', profile.id)
    .single();

  if (!item) {
    return { success: false, error: 'Projeto não encontrado ou você não tem permissão para editá-lo.' };
  }

  // Verificar cota atual de fotos do perfil
  const { count: currentTotalPhotos } = await supabase
    .from('portfolio_images')
    .select('id', { count: 'exact', head: true })
    .in(
      'portfolio_item_id',
      (
        await supabase
          .from('portfolio_items')
          .select('id')
          .eq('profile_id', profile.id)
      ).data?.map((i) => i.id) || []
    );

  const existingCount = currentTotalPhotos || 0;
  const files = formData.getAll('files') as File[];

  if (files.length === 0) {
    return { success: false, error: 'Nenhum arquivo de imagem foi enviado.' };
  }

  const entitlements = await getEntitlements(user.id);
  const maxAllowedPhotos = entitlements.maxPhotos;

  if (existingCount + files.length > maxAllowedPhotos) {
    return {
      success: false,
      error: `Limite de fotos atingido. Seu plano (${entitlements.planName}) permite até ${maxAllowedPhotos} fotos e seu perfil já possui ${existingCount} fotos.`,
    };
  }

  // Obter a última ordem de classificação deste projeto
  const { data: lastImages } = await supabase
    .from('portfolio_images')
    .select('sort_order')
    .eq('portfolio_item_id', itemId)
    .order('sort_order', { ascending: false })
    .limit(1);

  let nextSortOrder = (lastImages?.[0]?.sort_order ?? -1) + 1;
  let uploaded = 0;

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);

    // Validação e processamento via Sharp (Magic bytes, redimensionamento, remoção de EXIF)
    let processed;
    try {
      processed = await processPortfolioImage(rawBuffer);
    } catch (err: any) {
      return { success: false, error: `Erro no arquivo "${file.name}": ${err.message}` };
    }

    // Execução do ponto de extensão para moderação futura
    await runAutoModerationExtension(processed.fullBuffer, file.name);

    // Upload seguro para portfolio-pending com nome UUID aleatório
    const randomId = crypto.randomUUID();
    const fullPath = `${user.id}/${itemId}/${randomId}.webp`;
    const thumbPath = `${user.id}/${itemId}/${randomId}-thumb.webp`;

    const { error: fullUploadErr } = await supabase.storage
      .from(PORTFOLIO_CONFIG.BUCKET_PENDING)
      .upload(fullPath, processed.fullBuffer, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: false,
      });

    if (fullUploadErr) {
      return { success: false, error: `Falha ao salvar imagem: ${fullUploadErr.message}` };
    }

    const { error: thumbUploadErr } = await supabase.storage
      .from(PORTFOLIO_CONFIG.BUCKET_PENDING)
      .upload(thumbPath, processed.thumbBuffer, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: false,
      });

    if (thumbUploadErr) {
      return { success: false, error: `Falha ao salvar miniatura: ${thumbUploadErr.message}` };
    }

    // Gerar URLs assinadas ou de leitura pendente
    const { data: fullUrlData } = supabase.storage
      .from(PORTFOLIO_CONFIG.BUCKET_PENDING)
      .getPublicUrl(fullPath);

    const { data: thumbUrlData } = supabase.storage
      .from(PORTFOLIO_CONFIG.BUCKET_PENDING)
      .getPublicUrl(thumbPath);

    const totalBytes = processed.fullBytes + processed.thumbBytes;

    // Gravar registro na tabela portfolio_images
    const { error: dbErr } = await supabase.from('portfolio_images').insert({
      portfolio_item_id: itemId,
      image_url: fullUrlData.publicUrl,
      thumb_url: thumbUrlData.publicUrl,
      bytes_size: totalBytes,
      sort_order: nextSortOrder++,
      status: 'pending',
      is_demo: isDemo,
    });

    if (dbErr) {
      return { success: false, error: `Erro ao registrar imagem no banco: ${dbErr.message}` };
    }

    uploaded++;
  }

  revalidatePath('/painel/portfolio');
  return { success: true, uploadedCount: uploaded };
}

/**
 * Reordenação de fotos no projeto (Drag-and-drop / Ordenação).
 */
export async function reorderPortfolioPhotos(
  itemId: string,
  orderedImageIds: string[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Não autenticado.' };

  for (let i = 0; i < orderedImageIds.length; i++) {
    await supabase
      .from('portfolio_images')
      .update({ sort_order: i })
      .eq('id', orderedImageIds[i]);
  }

  revalidatePath('/painel/portfolio');
  return { success: true };
}

/**
 * Exclui uma imagem do portfólio e remove seus arquivos físicos do Storage.
 */
export async function deletePortfolioImage(imageId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Não autenticado.' };

  // Buscar imagem e verificar propriedade
  const { data: img } = await supabase
    .from('portfolio_images')
    .select(`
      id,
      image_url,
      thumb_url,
      status,
      portfolio_items!inner(id, profile_id, professional_profiles!inner(user_id))
    `)
    .eq('id', imageId)
    .single();

  if (!img) {
    return { success: false, error: 'Imagem não encontrada.' };
  }

  const ownerUserId = (img.portfolio_items as any)?.professional_profiles?.user_id;
  if (ownerUserId !== user.id) {
    return { success: false, error: 'Permissão negada para excluir esta imagem.' };
  }

  // Extrair caminhos dos arquivos do storage a partir das URLs
  const bucketName = img.status === 'approved' ? PORTFOLIO_CONFIG.BUCKET_PUBLIC : PORTFOLIO_CONFIG.BUCKET_PENDING;

  const extractPath = (url: string) => {
    try {
      const parts = url.split(`${bucketName}/`);
      return parts[1] ? decodeURIComponent(parts[1].split('?')[0]) : null;
    } catch {
      return null;
    }
  };

  const filesToDelete = [extractPath(img.image_url), img.thumb_url ? extractPath(img.thumb_url) : null].filter(Boolean) as string[];

  if (filesToDelete.length > 0) {
    await supabase.storage.from(bucketName).remove(filesToDelete);
  }

  // Excluir linha do banco
  const { error: delErr } = await supabase.from('portfolio_images').delete().eq('id', imageId);
  if (delErr) {
    return { success: false, error: delErr.message };
  }

  revalidatePath('/painel/portfolio');
  return { success: true };
}

/**
 * Exclui um projeto completo de portfólio e todas as suas fotos no Storage.
 */
export async function deletePortfolioProject(itemId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Não autenticado.' };

  // Buscar todas as imagens deste projeto
  const { data: images } = await supabase
    .from('portfolio_images')
    .select('id, image_url, thumb_url, status')
    .eq('portfolio_item_id', itemId);

  if (images && images.length > 0) {
    for (const img of images) {
      const bucketName = img.status === 'approved' ? PORTFOLIO_CONFIG.BUCKET_PUBLIC : PORTFOLIO_CONFIG.BUCKET_PENDING;
      const parts = img.image_url.split(`${bucketName}/`);
      if (parts[1]) {
        const fullPath = decodeURIComponent(parts[1].split('?')[0]);
        const thumbParts = img.thumb_url?.split(`${bucketName}/`);
        const thumbPath = thumbParts?.[1] ? decodeURIComponent(thumbParts[1].split('?')[0]) : null;
        await supabase.storage.from(bucketName).remove([fullPath, thumbPath].filter(Boolean) as string[]);
      }
    }
  }

  const { error } = await supabase.from('portfolio_items').delete().eq('id', itemId);
  if (error) return { success: false, error: error.message };

  revalidatePath('/painel/portfolio');
  return { success: true };
}

// ==============================================================================
// FUNÇÕES DE MODERAÇÃO DE SERVIDOR (Aprovar / Recusar)
// Serão utilizadas pela tela administrativa na Fase 10 e testadas via script.
// ==============================================================================

/**
 * Aprova uma imagem do portfólio:
 * Move os arquivos de `portfolio-pending` para `portfolio-public`,
 * atualiza as URLs e muda o status para `approved`.
 */
export async function approvePortfolioImage(
  imageId: string,
  serviceClient?: any
): Promise<{ success: boolean; error?: string }> {
  const supabase = serviceClient || (await createClient());

  const { data: img, error: imgErr } = await supabase
    .from('portfolio_images')
    .select('id, image_url, thumb_url, status')
    .eq('id', imageId)
    .single();

  if (imgErr || !img) {
    return { success: false, error: 'Imagem não encontrada.' };
  }

  // Extrair caminhos relativos no bucket pending
  const getPendingPath = (url: string) => {
    const parts = url.split(`${PORTFOLIO_CONFIG.BUCKET_PENDING}/`);
    return parts[1] ? decodeURIComponent(parts[1].split('?')[0]) : null;
  };

  const fullPath = getPendingPath(img.image_url);
  const thumbPath = img.thumb_url ? getPendingPath(img.thumb_url) : null;

  if (!fullPath) {
    return { success: false, error: 'Caminho do arquivo não localizado no bucket pending.' };
  }

  // Baixar arquivos de portfolio-pending
  const { data: fullFile, error: downloadErr } = await supabase.storage
    .from(PORTFOLIO_CONFIG.BUCKET_PENDING)
    .download(fullPath);

  if (downloadErr || !fullFile) {
    return { success: false, error: `Falha ao obter arquivo pendente: ${downloadErr?.message}` };
  }

  let thumbFile = null;
  if (thumbPath) {
    const { data: thumbBlob } = await supabase.storage
      .from(PORTFOLIO_CONFIG.BUCKET_PENDING)
      .download(thumbPath);
    thumbFile = thumbBlob;
  }

  // Enviar para portfolio-public
  const { error: pubFullErr } = await supabase.storage
    .from(PORTFOLIO_CONFIG.BUCKET_PUBLIC)
    .upload(fullPath, fullFile, { contentType: 'image/webp', upsert: true });

  if (pubFullErr) {
    return { success: false, error: `Falha ao copiar para bucket público: ${pubFullErr.message}` };
  }

  if (thumbPath && thumbFile) {
    await supabase.storage
      .from(PORTFOLIO_CONFIG.BUCKET_PUBLIC)
      .upload(thumbPath, thumbFile, { contentType: 'image/webp', upsert: true });
  }

  // Remover de portfolio-pending
  await supabase.storage
    .from(PORTFOLIO_CONFIG.BUCKET_PENDING)
    .remove([fullPath, thumbPath].filter(Boolean) as string[]);

  // Obter novas URLs públicas
  const { data: newFullUrl } = supabase.storage
    .from(PORTFOLIO_CONFIG.BUCKET_PUBLIC)
    .getPublicUrl(fullPath);

  const { data: newThumbUrl } = thumbPath
    ? supabase.storage.from(PORTFOLIO_CONFIG.BUCKET_PUBLIC).getPublicUrl(thumbPath)
    : { data: { publicUrl: null } };

  // Atualizar banco
  const { error: updErr } = await supabase
    .from('portfolio_images')
    .update({
      status: 'approved',
      image_url: newFullUrl.publicUrl,
      thumb_url: newThumbUrl.publicUrl,
    })
    .eq('id', imageId);

  if (updErr) {
    return { success: false, error: updErr.message };
  }

  return { success: true };
}

/**
 * Recusa uma imagem do portfólio:
 * Deleta os arquivos de `portfolio-pending` e atualiza status para `rejected`.
 */
export async function rejectPortfolioImage(
  imageId: string,
  serviceClient?: any
): Promise<{ success: boolean; error?: string }> {
  const supabase = serviceClient || (await createClient());

  const { data: img } = await supabase
    .from('portfolio_images')
    .select('id, image_url, thumb_url')
    .eq('id', imageId)
    .single();

  if (img) {
    const getPendingPath = (url: string) => {
      const parts = url.split(`${PORTFOLIO_CONFIG.BUCKET_PENDING}/`);
      return parts[1] ? decodeURIComponent(parts[1].split('?')[0]) : null;
    };

    const fullPath = getPendingPath(img.image_url);
    const thumbPath = img.thumb_url ? getPendingPath(img.thumb_url) : null;

    if (fullPath) {
      await supabase.storage
        .from(PORTFOLIO_CONFIG.BUCKET_PENDING)
        .remove([fullPath, thumbPath].filter(Boolean) as string[]);
    }

    await supabase
      .from('portfolio_images')
      .update({ status: 'rejected' })
      .eq('id', imageId);
  }

  return { success: true };
}

