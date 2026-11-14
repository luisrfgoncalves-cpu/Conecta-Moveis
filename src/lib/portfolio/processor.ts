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
  dhash: string;
}

/**
 * Gera dHash (Difference Hash) perceptual de 64 bits a partir de um buffer de imagem.
 * Implementação própria pura sem dependências externas adicionais.
 * Redimensiona para 9x8 em tons de cinza, compara pixels adjacentes e gera string hex de 16 caracteres.
 */
export async function generateDHash(imageBuffer: Buffer): Promise<string> {
  try {
    const { data } = await sharp(imageBuffer)
      .resize(9, 8, { fit: 'fill' })
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    let bits = '';
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const left = data[row * 9 + col];
        const right = data[row * 9 + col + 1];
        bits += left < right ? '1' : '0';
      }
    }

    // Converte os 64 bits para 16 caracteres hexadecimais
    let hex = '';
    for (let i = 0; i < 64; i += 4) {
      hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
    }
    return hex;
  } catch {
    return '0000000000000000'; // fallback seguro em caso de imagem mono-pixel ou erro
  }
}

/**
 * Calcula a distância de Hamming entre dois dHashes (0 a 64).
 * Distância 0 = imagens idênticas.
 * Distância <= 10 = imagens visualmente muito similares (alerta de duplicata para análise humana).
 */
export function hammingDistance(hash1: string, hash2: string): number {
  if (!hash1 || !hash2 || hash1.length !== hash2.length) return 64;
  let dist = 0;
  for (let i = 0; i < hash1.length; i++) {
    const bits1 = parseInt(hash1[i], 16).toString(2).padStart(4, '0');
    const bits2 = parseInt(hash2[i], 16).toString(2).padStart(4, '0');
    for (let j = 0; j < 4; j++) {
      if (bits1[j] !== bits2[j]) dist++;
    }
  }
  return dist;
}

/**
 * Validação rigorosa de magic bytes (assinatura real dos primeiros bytes).
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

  // HEIC / HEIF (caixa 'ftyp' com brands 'heic', 'mif1', etc.)
  if (buffer.length >= 12) {
    const ftyp = buffer.toString('ascii', 4, 8);
    if (ftyp === 'ftyp') {
      const brand = buffer.toString('ascii', 8, 12).toLowerCase();
      if (['heic', 'heis', 'hevc', 'hevx', 'mif1', 'msf1'].includes(brand)) {
        return { valid: true, detectedFormat: 'image/heic' };
      }
    }
  }

  return { valid: false, detectedFormat: 'unknown' };
}

/**
 * Pipeline de processamento de imagem no servidor:
 * 1. Remove EXIF e metadados de geolocalização.
 * 2. Normaliza orientação (auto-rotate pelo EXIF original).
 * 3. Redimensiona versão completa para até 1280 px (lado maior) em WebP otimizado (alvo até 250 KB).
 * 4. Redimensiona miniatura para até 400 px (lado maior) em WebP otimizado (alvo cerca de 30 KB).
 * 5. Calcula dHash perceptual para detecção de duplicatas.
 */
export async function processPortfolioImage(inputBuffer: Buffer): Promise<ProcessedPortfolioImage> {
  const magic = validateImageMagicBytes(inputBuffer);
  if (!magic.valid) {
    throw new Error(
      `Arquivo inválido ou não autorizado: formato detectado (${magic.detectedFormat || 'desconhecido'}) não permitido.`
    );
  }

  if (inputBuffer.length > PORTFOLIO_CONFIG.MAX_FILE_SIZE_BYTES) {
    throw new Error(`Arquivo excede o limite máximo permitido de ${PORTFOLIO_CONFIG.MAX_FILE_SIZE_BYTES / 1024} KB.`);
  }

  const image = sharp(inputBuffer);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Não foi possível ler as dimensões da imagem.');
  }

  // Dimensões mínimas razoáveis para fotos de apresentação
  if (metadata.width < 50 || metadata.height < 50) {
    throw new Error('A imagem é muito pequena. Dimensões mínimas: 50x50 px.');
  }

  // 1. Versão Completa (Max 1280 px, sem EXIF, WebP Q80 — meta <= 250 KB)
  const fullBuffer = await sharp(inputBuffer)
    .rotate() // Aplica orientação EXIF antes de descartar metadados
    .resize({
      width: PORTFOLIO_CONFIG.MAX_IMAGE_DIMENSION,
      height: PORTFOLIO_CONFIG.MAX_IMAGE_DIMENSION,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: PORTFOLIO_CONFIG.WEBP_QUALITY, effort: 4 })
    .toBuffer();

  const fullMeta = await sharp(fullBuffer).metadata();

  // 2. Miniatura (Max 400 px, sem EXIF, WebP Q70 — meta cerca de 30 KB)
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

  // 3. dHash perceptual gerado a partir do thumbnail
  const dhash = await generateDHash(thumbBuffer);

  return {
    fullBuffer,
    thumbBuffer,
    fullBytes: fullBuffer.length,
    thumbBytes: thumbBuffer.length,
    width: fullMeta.width || metadata.width,
    height: fullMeta.height || metadata.height,
    mimeType: 'image/webp',
    dhash,
  };
}
