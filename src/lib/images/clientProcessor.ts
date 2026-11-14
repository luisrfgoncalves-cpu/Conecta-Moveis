/**
 * Processamento e Otimização de Imagens no Cliente (Navegador).
 *
 * Facilidade de uso e navegabilidade máxima:
 * - O profissional tira a foto do celular (seja Android ou iPhone HEIC) e envia direto.
 * - O navegador cuida da conversão de HEIC para JPEG/WebP.
 * - Comprime antes de enviar para poupar dados móveis do usuário e storage do servidor.
 * - Se qualquer biblioteca falhar no cliente, faz fallback suave enviando o original para o servidor processar.
 */

export interface ClientProcessedImage {
  file: File;
  previewUrl: string;
  originalName: string;
  originalSizeKB: number;
  processedSizeKB: number;
  wasConverted: boolean;
  format: string;
}

/**
 * Identifica se o arquivo é do formato HEIC / HEIF (comum em iPhones).
 */
export function isHeicFile(file: File): boolean {
  const name = (file.name || '').toLowerCase();
  const type = (file.type || '').toLowerCase();
  return (
    name.endsWith('.heic') ||
    name.endsWith('.heif') ||
    type === 'image/heic' ||
    type === 'image/heif'
  );
}

/**
 * Converte HEIC para JPEG usando heic2any no cliente.
 * Retorna o arquivo convertido ou o original em caso de fallback.
 */
export async function convertHeicIfNeeded(file: File): Promise<{ file: File; wasConverted: boolean }> {
  if (!isHeicFile(file)) {
    return { file, wasConverted: false };
  }

  try {
    const heic2any = (await import('heic2any')).default;
    const result = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9,
    });

    const blob = Array.isArray(result) ? result[0] : result;
    const convertedFile = new File(
      [blob],
      file.name.replace(/\.(heic|heif)$/i, '.jpg'),
      { type: 'image/jpeg', lastModified: Date.now() }
    );

    return { file: convertedFile, wasConverted: true };
  } catch {
    // Fallback: se falhar no cliente, envia o original para tentativa no servidor
    return { file, wasConverted: false };
  }
}

/**
 * Comprime a imagem no cliente antes de transmitir para o servidor.
 * Alvo: lado maior até 1280 px, tamanho < 1 MB.
 */
export async function compressImageClient(file: File): Promise<File> {
  // Arquivos já muito pequenos (< 150 KB) não precisam de compressão pesada
  if (file.size < 150 * 1024) {
    return file;
  }

  try {
    const imageCompression = (await import('browser-image-compression')).default;
    const options = {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
      fileType: 'image/webp',
      initialQuality: 0.82,
    };

    const compressedBlob = await imageCompression(file, options);
    const newName = file.name.replace(/\.[^.]+$/, '.webp');
    return new File([compressedBlob], newName, {
      type: 'image/webp',
      lastModified: Date.now(),
    });
  } catch {
    // Fallback gracioso: retorna o arquivo recebido sem quebrar a experiência do usuário
    return file;
  }
}

/**
 * Pipeline completo de ingestão no cliente.
 */
export async function processImagePipeline(file: File): Promise<ClientProcessedImage> {
  const originalSizeKB = Math.round(file.size / 1024);
  const originalName = file.name;

  // 1. Converte HEIC se for foto de iPhone
  const { file: afterHeic, wasConverted } = await convertHeicIfNeeded(file);

  // 2. Comprime no cliente
  const compressed = await compressImageClient(afterHeic);

  // 3. Preview local para feedback visual instantâneo
  const previewUrl = URL.createObjectURL(compressed);

  return {
    file: compressed,
    previewUrl,
    originalName,
    originalSizeKB,
    processedSizeKB: Math.round(compressed.size / 1024),
    wasConverted,
    format: compressed.type || 'image/jpeg',
  };
}

/**
 * Gera Thumbhash (placeholder desfocado) a partir de um elemento HTMLCanvasElement.
 */
export async function generateThumbhashFromCanvas(canvas: HTMLCanvasElement): Promise<string | null> {
  try {
    const { rgbaToThumbHash } = await import('thumbhash');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const hash = rgbaToThumbHash(canvas.width, canvas.height, imageData.data);
    return btoa(String.fromCharCode(...hash));
  } catch {
    return null;
  }
}
