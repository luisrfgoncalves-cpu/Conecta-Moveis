import sharp from 'sharp';

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  buffer?: Buffer;
  format?: string;
}

/**
 * Validação de assinatura real de arquivo (magic bytes) no nível dos bytes.
 * Impede que scripts, binários executáveis ou arquivos corrompidos
 * passem apenas mudando a extensão (.jpg, .webp, .png).
 */
export function validateImageMagicBytes(buffer: Buffer): { valid: boolean; detectedFormat?: string } {
  if (buffer.length < 12) {
    return { valid: false };
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, detectedFormat: 'jpeg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
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
    return { valid: true, detectedFormat: 'png' };
  }

  // WebP: RIFF (bytes 0-3) + WEBP (bytes 8-11)
  const isRiff = buffer.toString('ascii', 0, 4) === 'RIFF';
  const isWebp = buffer.toString('ascii', 8, 12) === 'WEBP';
  if (isRiff && isWebp) {
    return { valid: true, detectedFormat: 'webp' };
  }

  return { valid: false };
}

/**
 * Processamento seguro de imagem de perfil/logotipo:
 * - Valida magic bytes
 * - Redimensiona para no máximo 512x512 (fit: inside)
 * - Converte obrigatoriamente para WebP
 * - Remove metadados EXIF/geolocalização privada
 * - Garante limite estrito de até 150 KB
 */
export async function processAvatarImage(rawBuffer: Buffer): Promise<ImageValidationResult> {
  const magic = validateImageMagicBytes(rawBuffer);
  if (!magic.valid) {
    return {
      valid: false,
      error: 'Arquivo inválido. O formato real deve ser uma imagem válida (JPEG, PNG ou WebP).',
    };
  }

  try {
    const processedBuffer = await sharp(rawBuffer)
      .rotate() // auto-rotaciona conforme orientação EXIF antes de remover
      .resize(512, 512, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();

    const MAX_SIZE_BYTES = 150 * 1024; // 150 KB
    if (processedBuffer.length > MAX_SIZE_BYTES) {
      // Segunda tentativa com compressão ligeiramente mais agressiva
      const compressedBuffer = await sharp(rawBuffer)
        .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 72, effort: 6 })
        .toBuffer();

      if (compressedBuffer.length > MAX_SIZE_BYTES) {
        return {
          valid: false,
          error: `A imagem processada excede o limite de 150 KB (${Math.round(compressedBuffer.length / 1024)} KB). Escolha uma imagem menor.`,
        };
      }

      return { valid: true, buffer: compressedBuffer, format: 'webp' };
    }

    return { valid: true, buffer: processedBuffer, format: 'webp' };
  } catch {
    return {
      valid: false,
      error: 'Falha no processamento da imagem. O arquivo pode estar corrompido.',
    };
  }
}
