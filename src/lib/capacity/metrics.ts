import { createClient } from '@supabase/supabase-js';
import { getActiveInfraProfile } from '@/lib/config/actions';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export interface CapacityMetrics {
  totalProfiles: number;
  totalImages: number;
  avgImagesPerProfile: number;
  estimatedStorageUsedMb: number;
  estimatedDbUsedMb: number;
  storageUsagePercent: number;
  dbUsagePercent: number;
  storageAlertLevel: 'ok' | 'warning_70' | 'critical_90';
  dbAlertLevel: 'ok' | 'warning_70' | 'critical_90';
  maxSustainableProfiles: number;
  infraProfileName: string;
  storageLimitMb: number;
  dbLimitMb: number;
}

/**
 * Coleta métricas reais de capacidade da infraestrutura e compara com os tetos do plano ativo.
 */
export async function getLiveCapacityMetrics(): Promise<CapacityMetrics> {
  const infra = await getActiveInfraProfile();
  const admin = getAdminClient();

  let totalProfiles = 0;
  let totalImages = 0;

  if (admin) {
    try {
      const [{ count: pCount }, { count: iCount }] = await Promise.all([
        admin.from('professional_profiles').select('*', { count: 'exact', head: true }),
        admin.from('portfolio_images').select('*', { count: 'exact', head: true }),
      ]);
      totalProfiles = pCount ?? 0;
      totalImages = iCount ?? 0;
    } catch {
      // Fallback em caso de indisponibilidade momentânea
    }
  }

  // Média de 220 KB por foto de apresentação (resolução alvo da Fase 24: max 250KB WebP)
  const estimatedStorageUsedMb = Number(((totalImages * 220) / 1024).toFixed(2));
  
  // Estimativa do Postgres: overhead base de 35 MB + ~0.08 MB por perfil completo com logs
  const estimatedDbUsedMb = Number((35 + totalProfiles * 0.08).toFixed(2));

  const storageUsagePercent = Number(((estimatedStorageUsedMb / infra.storage_mb) * 100).toFixed(1));
  const dbUsagePercent = Number(((estimatedDbUsedMb / infra.db_mb) * 100).toFixed(1));

  function getLevel(pct: number): 'ok' | 'warning_70' | 'critical_90' {
    if (pct >= 90) return 'critical_90';
    if (pct >= 70) return 'warning_70';
    return 'ok';
  }

  // Teto seguro de 90% no plano gratuito (1000 MB de Storage => 900 MB úteis)
  // Cada perfil no gratuito tem 3 fotos (1 capa + 2 perfil) = ~660 KB (0.645 MB)
  const mbPerProfile = 3 * 0.215;
  const maxSustainableProfiles = Math.floor((infra.storage_mb * 0.9) / mbPerProfile);

  return {
    totalProfiles,
    totalImages,
    avgImagesPerProfile: totalProfiles > 0 ? Number((totalImages / totalProfiles).toFixed(1)) : 0,
    estimatedStorageUsedMb,
    estimatedDbUsedMb,
    storageUsagePercent,
    dbUsagePercent,
    storageAlertLevel: getLevel(storageUsagePercent),
    dbAlertLevel: getLevel(dbUsagePercent),
    maxSustainableProfiles,
    infraProfileName: infra.name,
    storageLimitMb: infra.storage_mb,
    dbLimitMb: infra.db_mb,
  };
}

