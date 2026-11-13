/**
 * Utilitário cliente para validação, recorte (crop central quadrado 1:1 para avatar)
 * e compressão/conversão de imagens antes do upload.
 *
 * Funciona 100% no navegador via HTMLCanvasElement (zero dependência de node/sharp no cliente).
 * Compatível com iOS (Safari / WebKit), Android (Chrome / Firefox) e Desktop.
 */

export interface ProcessClientImageOptions {
  /** Se true, recorta o centro para aspect-ratio 1:1 (quadrado perfeito) */
  squareCrop?: boolean;
  /** Dimensão máxima do lado (ex: 512 para avatares, 1600 para fotos de portfólio) */
  maxDimension?: number;
  /** Qualidade de compressão (0.1 a 1.0) */
  quality?: number;
  /** Tipo MIME alvo: 'image/webp' ou 'image/jpeg' */
  outputType?: 'image/webp' | 'image/jpeg';
}

/** Formatos de arquivo aceitos para imagens */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

/**
 * Valida o arquivo básico selecionado pelo usuário.
 */
export function validateClientImageFile(file: File, maxSizeBytes = 12 * 1024 * 1024): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'Nenhum arquivo selecionado.' };
  }

  const isTypeAllowed =
    ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase()) ||
    ALLOWED_IMAGE_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));

  if (!isTypeAllowed) {
    return {
      valid: false,
      error: 'Formato inválido. Por favor, envie uma foto em JPG, PNG ou WebP.',
    };
  }

  if (file.size > maxSizeBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const limitMb = Math.round(maxSizeBytes / (1024 * 1024));
    return {
      valid: false,
      error: `O arquivo selecionado (${sizeMb} MB) é muito grande. O limite máximo é de ${limitMb} MB.`,
    };
  }

  return { valid: true };
}

/**
 * Processa uma imagem no navegador antes do upload:
 * - Carrega a imagem respeitando orientação natural
 * - Opcionalmente faz o enquadramento/recorte central 1:1 (ideal para fotos de perfil)
 * - Redimensiona suavemente para no máximo maxDimension
 * - Converte para WebP (com fallback transparente para JPEG em navegadores antigos)
 * - Retorna um novo objeto `File` pronto para envio em FormData (<100 KB para avatares)
 */
export async function processClientImage(
  file: File,
  options: ProcessClientImageOptions = {}
): Promise<File> {
  const {
    squareCrop = false,
    maxDimension = 512,
    quality = 0.82,
    outputType = 'image/webp',
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo de imagem no seu dispositivo.'));

    reader.onload = (event) => {
      const src = event.target?.result as string;
      if (!src) {
        reject(new Error('Falha ao decodificar arquivo.'));
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error('O arquivo selecionado não é uma imagem válida ou está corrompido.'));

      img.onload = () => {
        try {
          let sourceX = 0;
          let sourceY = 0;
          let sourceWidth = img.naturalWidth || img.width;
          let sourceHeight = img.naturalHeight || img.height;

          // Validação de dimensões mínimas
          if (sourceWidth < 40 || sourceHeight < 40) {
            reject(new Error('A imagem é muito pequena. Selecione uma imagem com maior resolução.'));
            return;
          }

          // Se for solicitado enquadramento quadrado 1:1 (crop central)
          if (squareCrop) {
            const side = Math.min(sourceWidth, sourceHeight);
            sourceX = Math.round((sourceWidth - side) / 2);
            sourceY = Math.round((sourceHeight - side) / 2);
            sourceWidth = side;
            sourceHeight = side;
          }

          // Calcular dimensões finais respeitando proporção e limite
          let targetWidth = sourceWidth;
          let targetHeight = sourceHeight;

          if (targetWidth > maxDimension || targetHeight > maxDimension) {
            if (targetWidth > targetHeight) {
              targetHeight = Math.round((targetHeight * maxDimension) / targetWidth);
              targetWidth = maxDimension;
            } else {
              targetWidth = Math.round((targetWidth * maxDimension) / targetHeight);
              targetHeight = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Seu navegador não suporta processamento gráfico HTML5.'));
            return;
          }

          // Suavização de alta qualidade
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Desenha a imagem cortando o centro se aplicável e redimensionando
          ctx.drawImage(
            img,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            targetWidth,
            targetHeight
          );

          // Tentar exportar no formato solicitado
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const baseName = file.name.replace(/\.[^.]+$/, '');
                const ext = outputType === 'image/webp' ? '.webp' : '.jpg';
                const processedFile = new File([blob], `${baseName}${ext}`, {
                  type: blob.type || outputType,
                  lastModified: Date.now(),
                });
                resolve(processedFile);
              } else {
                // Fallback de segurança se toBlob falhar
                resolve(file);
              }
            },
            outputType,
            quality
          );
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Erro ao processar imagem.';
          reject(new Error(msg));
        }
      };

      img.src = src;
    };

    reader.readAsDataURL(file);
  });
}

