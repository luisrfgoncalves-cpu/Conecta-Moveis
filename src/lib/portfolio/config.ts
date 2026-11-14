/**
 * Configuração de Limites de Fotos de Apresentação (Fase 24)
 * Metas de peso e resolução para máxima performance móvel e baixo consumo de Storage.
 */

export const PORTFOLIO_CONFIG = {
  // Padrão do plano gratuito: 1 foto no card + 2 na página do perfil (total 3 fotos)
  // Planos pagos: lido dinamicamente das configurações/entitlements
  MAX_PHOTOS_PER_PROFILE: 3,

  // Limite máximo do payload no servidor pós-compressão (1.5 MB de segurança)
  MAX_FILE_SIZE_BYTES: 1.5 * 1024 * 1024,

  // Metas da Fase 24:
  // Versão completa: lado maior de 1280 px com alvo de até 250 KB em WebP
  MAX_IMAGE_DIMENSION: 1280,
  TARGET_FULL_BYTES: 250 * 1024, // 250 KB

  // Miniatura: lado maior de 400 px com cerca de 30 KB em WebP
  THUMB_IMAGE_DIMENSION: 400,
  TARGET_THUMB_BYTES: 30 * 1024, // 30 KB

  // Fatores de qualidade WebP
  WEBP_QUALITY: 80,
  THUMB_WEBP_QUALITY: 70,

  // Cache-Control de longa duração com nomes de arquivos únicos baseados em UUID
  CACHE_CONTROL_HEADER: 'public, max-age=31536000, immutable',

  // Tipos aceitos pelo servidor (o cliente já converte HEIC para WebP/JPEG antes de enviar)
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],

  // Buckets
  BUCKET_PENDING: 'portfolio-pending',
  BUCKET_PUBLIC: 'portfolio-public',

  // Alerta no admin quando o uso do Storage atingir 70% da cota contratada
  STORAGE_ALERT_THRESHOLD: 0.70,
};

export type ImageType = 'trabalho_realizado' | 'ilustrativa';

export interface AutoModerationResult {
  passed: boolean;
  score: number; // 0.0 a 1.0 (probabilidade de conteúdo seguro)
  flags: string[];
  provider: 'noop' | 'dhash';
}

/**
 * Triagem de conteúdo: nunca aprova nem remove sozinha, apenas prioriza a fila de moderação.
 * Status inicial sempre permanece 'pending' para análise humana.
 */
export async function runAutoModerationExtension(
  _imageBuffer: Buffer,
  _filename: string
): Promise<AutoModerationResult> {
  return {
    passed: true,
    score: 1.0,
    flags: [],
    provider: 'noop',
  };
}
