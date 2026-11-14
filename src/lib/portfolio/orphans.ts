/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { PORTFOLIO_CONFIG } from './config';
import { getAdminUserRole } from '@/lib/admin/actions';

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export interface StorageStatus {
  totalBytes: number;
  maxBytes: number; // Ex: 1 GB (1024 * 1024 * 1024) no Supabase Free Tier
  usagePercent: number;
  isAlertThresholdExceeded: boolean;
  totalImages: number;
}

/**
 * Retorna o status de uso de armazenamento do Storage e alerta de cota (>70%).
 */
export async function getStorageUsageStatus(): Promise<StorageStatus> {
  const admin = getAdminClient();
  const MAX_STORAGE_BYTES = 1024 * 1024 * 1024; // 1 GB no Free Tier

  // Soma bytes_size de todas as imagens registradas
  const { data, count } = await admin
    .from('portfolio_images')
    .select('bytes_size', { count: 'exact' });

  const totalBytes = (data || []).reduce((acc, row) => acc + (row.bytes_size || 0), 0);
  const usagePercent = Math.min(100, Math.round((totalBytes / MAX_STORAGE_BYTES) * 100));
  const isAlertThresholdExceeded = totalBytes >= MAX_STORAGE_BYTES * PORTFOLIO_CONFIG.STORAGE_ALERT_THRESHOLD;

  return {
    totalBytes,
    maxBytes: MAX_STORAGE_BYTES,
    usagePercent,
    isAlertThresholdExceeded,
    totalImages: count || 0,
  };
}

/**
 * Rotina de remoção de arquivos órfãos (Fase 24, Item 7).
 * Identifica arquivos presentes no bucket mas sem linha correspondente em portfolio_images.
 */
export async function cleanupOrphanPortfolioFiles(): Promise<{
  success: boolean;
  orphansRemoved: number;
  bytesFreed: number;
  error?: string;
}> {
  const { role } = await getAdminUserRole();
  if (role !== 'admin' && role !== 'moderator') {
    return { success: false, orphansRemoved: 0, bytesFreed: 0, error: 'Acesso não autorizado.' };
  }

  const admin = getAdminClient();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  try {
    // 1. Obter todas as URLs válidas atualmente registradas no banco
    const { data: dbImages } = await admin
      .from('portfolio_images')
      .select('image_url, thumb_url');

    const validFilePaths = new Set<string>();
    for (const row of dbImages || []) {
      if (row.image_url) {
        const parts = row.image_url.split('/portfolio-');
        if (parts[1]) validFilePaths.add(decodeURIComponent(parts[1].split('?')[0].replace(/^public\//, '').replace(/^pending\//, '')));
      }
      if (row.thumb_url) {
        const parts = row.thumb_url.split('/portfolio-');
        if (parts[1]) validFilePaths.add(decodeURIComponent(parts[1].split('?')[0].replace(/^public\//, '').replace(/^pending\//, '')));
      }
    }

    let totalRemoved = 0;
    let bytesFreed = 0;

    // 2. Varrer os dois buckets (pending e public)
    for (const bucket of [PORTFOLIO_CONFIG.BUCKET_PENDING, PORTFOLIO_CONFIG.BUCKET_PUBLIC]) {
      const { data: files } = await admin.storage.from(bucket).list('', { limit: 500 });
      if (!files) continue;

      const orphansToDelete: string[] = [];
      for (const file of files) {
        // Se o arquivo não está em nenhuma referência do banco e foi criado há mais de 2 horas (para não pegar upload em andamento)
        const isReferenced = validFilePaths.has(file.name);
        const createdAt = file.created_at ? new Date(file.created_at).getTime() : 0;
        const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;

        if (!isReferenced && createdAt < twoHoursAgo && file.name !== '.emptyFolderPlaceholder') {
          orphansToDelete.push(file.name);
          bytesFreed += (file.metadata?.size || 0);
        }
      }

      if (orphansToDelete.length > 0) {
        await admin.storage.from(bucket).remove(orphansToDelete);
        totalRemoved += orphansToDelete.length;
      }
    }

    // 3. Registrar na tabela de auditoria orphan_cleanup_log
    await admin.from('orphan_cleanup_log').insert({
      files_scanned: validFilePaths.size,
      orphans_removed: totalRemoved,
      bytes_freed: bytesFreed,
      executed_by: user?.id || null,
      details: { timestamp: new Date().toISOString() },
    });

    return {
      success: true,
      orphansRemoved: totalRemoved,
      bytesFreed,
    };
  } catch (err: any) {
    return {
      success: false,
      orphansRemoved: 0,
      bytesFreed: 0,
      error: err.message || 'Falha ao executar limpeza de órfãos.',
    };
  }
}
