const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function extractOriginalWithoutAnyCut() {
  const uploadsDir = 'C:\\Users\\luisr\\.gemini\\antigravity\\brain\\18681ff5-f867-4193-a64e-e97ad0c5a64c\\.user_uploaded';
  const brandDir = 'C:\\Users\\luisr\\.gemini\\antigravity\\scratch\\conecta-moveis\\public\\brand';

  // Usar o arquivo original enviado: media_1794505077240_5365c012.png (1024x341)
  const logoRaw = path.join(uploadsDir, 'media_1794505077240_5365c012.png');
  const { data, info } = await sharp(logoRaw).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  console.log(`Dimensões originais: ${info.width}x${info.height}`);

  // REMOVE APENAS O FUNDO BRANCO EXTERNO
  // SEM CORTAR NENHUMA LETRA, SEM RECORTAR A CASA, SEM SVG FALSO.
  // Mantém os 1024x341 pixels originais do arquivo que você enviou!
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Se o pixel for fundo branco
    if (r > 245 && g > 245 && b > 245) {
      data[i + 3] = 0; // Torna transparente o fundo branco!
    } else {
      // É o logotipo original:
      // Se for a palavra CONECTA ou o subtítulo que é prateado/branco claro, aumentamos o brilho para ficar bem visível no fundo escuro
      if (r > 130 && g > 130 && b > 130 && (Math.abs(r - g) < 20) && (Math.abs(g - b) < 20)) {
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = 255;
      }
    }
  }

  // Gera o arquivo PNG 100% completo, usando trim com folga (padding de 10px) para NUNCA cortar as pontas
  const finalClean = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 }
  })
    .trim({ threshold: 10 })
    .extend({ top: 10, bottom: 10, left: 10, right: 10, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(brandDir, 'logo-conecta-moveis.png'), finalClean);
  fs.writeFileSync(path.join(brandDir, 'logo.png'), finalClean);

  console.log('✅ Arquivo PNG original completo, sem cortes e com fundo transparente gerado!');
}

extractOriginalWithoutAnyCut().catch(console.error);

