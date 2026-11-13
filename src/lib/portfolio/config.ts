/**
 * Configuração Provisória de Limites de Portfólio (Fase 7)
 * Será substituída pelo sistema dinâmico de entitlements na Fase 11.
 */

export const PORTFOLIO_CONFIG = {
  // Limite provisório máximo de fotos por perfil profissional
  MAX_PHOTOS_PER_PROFILE: 6,

  // Tamanho máximo do arquivo recebido pelo servidor pós-compressão (1.5 MB de segurança)
  MAX_FILE_SIZE_BYTES: 1.5 * 1024 * 1024,

  // Dimensão do lado maior para a versão completa
  MAX_IMAGE_DIMENSION: 1600,

  // Dimensão da miniatura (thumbnail) para listagens de alto desempenho
  THUMB_IMAGE_DIMENSION: 480,

  // Qualidade de compressão WebP
  WEBP_QUALITY: 82,
  THUMB_WEBP_QUALITY: 75,

  // Tipos MIME e Magic Bytes aceitos
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],

  // Buckets
  BUCKET_PENDING: 'portfolio-pending',
  BUCKET_PUBLIC: 'portfolio-public',
};

/**
 * Ponto de Extensão para Moderação Automática Futura
 * (Nudez, violência, armas, duplicidade por perceptual hashing).
 * Na Fase 7, atua como stub passando por padrão e registrando metadados.
 */
export interface AutoModerationResult {
  passed: boolean;
  score: number; // 0.0 a 1.0 (probabilidade de conteúdo seguro)
  flags: string[];
  provider: 'noop' | 'rekognition' | 'google-vision' | 'phash';
}

export async function runAutoModerationExtension(
  _imageBuffer: Buffer,
  _filename: string
): Promise<AutoModerationResult> {
  // PONTO DE EXTENSÃO: Integração futura com Google Cloud Vision / AWS Rekognition / BlockHash
  // Retorna aprovado provisoriamente para moderação humana na fila de moderação
  return {
    passed: true,
    score: 1.0,
    flags: [],
    provider: 'noop',
  };
}

