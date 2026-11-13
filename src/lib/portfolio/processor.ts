import sharp from 'sharp';
import { PORTFOLIO_CONFIG } from './config';

export interface ProcessedPortfolioImage {
  fullBuffer: Buffer;
  thumbBuffer: Buffer;
  fullBytes: number;
  thumbBytes: number;
  width: number;
  height: number;
  mimeType: 'image/webp';
}

/**
 * Validação rigorosa de magic bytes (assinatura real do arquivo).
 * Rejeita categoricamente executáveis (MZ/PE, ELF, scripts) mesmo que renomeados para .jpg/.png.
 */
export function validateImageMagicBytes(buffer: Buffer): { valid: boolean; detectedFormat?: string } {
  if (!buffer || buffer.length < 12) {
    return { valid: false };
  }

  // Assinatura executável Windows PE / DOS: "MZ" (0x4D, 0x5A)
  if (buffer[0] === 0x4d && buffer[1] === 0x5a) {
    return { valid: false, detectedFormat: 'application/x-msdownload (Executável Proibido)' };
  }

  // Assinatura executável Linux ELF: 0x7F, 'E', 'L', 'F'
  if (buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46) {
    return { valid: false, detectedFormat: 'application/x-elf (Executável Proibido)' };
  }

  // JPEG: 0xFF, 0xD8, 0xFF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, detectedFormat: 'image/jpeg' };
  }

  // PNG: 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, detectedFormat: 'image/png' };
  }

  // WebP: 'RIFF' ... 'WEBP'
  const riff = buffer.toString('ascii', 0, 4);
  const webp = buffer.toString('ascii', 8, 12);
  if (riff === 'RIFF' && webp === 'WEBP') {
    return { valid: true, detectedFormat: 'image/webp' };
  }

  return { valid: false, detectedFormat: 'unknown' };
}

/**
 * Pipeline de processamento de imagem no servidor:
 * 1. Remove EXIF e metadados de geolocalização.
 * 2. Normaliza orientação (auto-rotate).
 * 3. Redimensiona versão completa para até 1600 px (lado maior) em WebP otimizado.
 * 4. Redimensiona miniatura para até 480 px (lado maior) em WebP otimizado.
 */
export async function processPortfolioImage(inputBuffer: Buffer): Promise<ProcessedPortfolioImage> {
  const magic = validateImageMagicBytes(inputBuffer);
  if (!magic.valid) {
    throw new Error(`Arquivo inválido ou corrompido: formato detectado (${magic.detectedFormat || 'desconhecido'}) não permitido.`);
  }

  if (inputBuffer.length > PORTFOLIO_CONFIG.MAX_FILE_SIZE_BYTES) {
    throw new Error(`Arquivo excede o limite máximo permitido de ${PORTFOLIO_CONFIG.MAX_FILE_SIZE_BYTES / 1024} KB.`);
  }

  const image = sharp(inputBuffer);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Não foi possível ler as dimensões da imagem.');
  }

  // Dimensões mínimas razoáveis para fotos de projetos
  if (metadata.width < 100 || metadata.height < 100) {
    throw new Error('A imagem é muito pequena. Dimensões mínimas: 100x100 px.');
  }

  // 1. Versão Completa (Max 1600 px, sem EXIF, WebP Q82)
  const fullBuffer = await sharp(inputBuffer)
    .rotate() // Aplica orientação EXIF antes de remover
    .resize({
      width: PORTFOLIO_CONFIG.MAX_IMAGE_DIMENSION,
      height: PORTFOLIO_CONFIG.MAX_IMAGE_DIMENSION,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: PORTFOLIO_CONFIG.WEBP_QUALITY, effort: 4 })
    .toBuffer();

  const fullMeta = await sharp(fullBuffer).metadata();

  // 2. Miniatura (Max 480 px, sem EXIF, WebP Q75)
  const thumbBuffer = await sharp(inputBuffer)
    .rotate()
    .resize({
      width: PORTFOLIO_CONFIG.THUMB_IMAGE_DIMENSION,
      height: PORTFOLIO_CONFIG.THUMB_IMAGE_DIMENSION,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: PORTFOLIO_CONFIG.THUMB_WEBP_QUALITY, effort: 4 })
    .toBuffer();

  return {
    fullBuffer,
    thumbBuffer,
    fullBytes: fullBuffer.length,
    thumbBytes: thumbBuffer.length,
    width: fullMeta.width || metadata.width,
    height: fullMeta.height || metadata.height,
    mimeType: 'image/webp',
  };
}

