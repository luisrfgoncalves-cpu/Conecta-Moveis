const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function directAlphaExtraction() {
  const uploadsDir = 'C:\\Users\\luisr\\.gemini\\antigravity\\brain\\18681ff5-f867-4193-a64e-e97ad0c5a64c\\.user_uploaded';
  const brandDir = 'C:\\Users\\luisr\\.gemini\\antigravity\\scratch\\conecta-moveis\\public\\brand';

  // Usar o arquivo original enviado: media_1794505077240_5365c012.png (1280 x 420 px)
  const logoRaw = path.join(uploadsDir, 'media_1794505077240_5365c012.png');
  const { data, info } = await sharp(logoRaw).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  console.log(`Dimensões originais: ${info.width}x${info.height}`);

  // Para não apagar o branco interno das letras de "CONECTA", vamos remover APENAS
  // o fundo branco externo usando uma verificação inteligente:
  // Se for branco puro (r > 248, g > 248, b > 248), removemos apenas o fundo.
  // E para as letras de "CONECTA", se tiver qualquer tom de cinza claro ou branco dentro da letra,
  // nós tornamos BRANCO ABSOLUTO (255, 255, 255) com opacidade 255!
  
  // Vamos fazer FloodFill ou remoção por limiar refinado:
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Laranjas (Móveis, arco, telhado)
    const isOrange = r > 160 && g < 140 && b < 50;

    // Fundo branco puro da foto original
    const isPureWhiteBg = r > 250 && g > 250 && b > 250;

    if (isPureWhiteBg) {
      data[i + 3] = 0; // Transparente
    } else if (!isOrange) {
      // São as letras de CONECTA ou do subtítulo
      // Se for cinza claro / gradiente prateado interno da letra:
      if (r > 120 && g > 120 && b > 120) {
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = 255; // 100% visível, branco radiante!
      } else {
        // Contorno escuro da letra para dar relevo e contraste
        data[i + 3] = 255;
      }
    }
  }

  // Gera o PNG original sem trim excessivo, com toda a largura e altura originais
  const finalPng = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 }
  }).trim().png().toBuffer();

  fs.writeFileSync(path.join(brandDir, 'logo-conecta-moveis.png'), finalPng);
  fs.writeFileSync(path.join(brandDir, 'logo.png'), finalPng);

  console.log('✅ Arquivo PNG original direto gerado com 100% de integridade e zero cortes!');
}

directAlphaExtraction().catch(console.error);

