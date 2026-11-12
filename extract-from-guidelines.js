const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function extractFromGuidelines() {
  const uploadsDir = 'C:\\Users\\luisr\\.gemini\antigravity\\brain\\18681ff5-f867-4193-a64e-e97ad0c5a64c\\.user_uploaded';
  const brandDir = 'C:\\Users\\luisr\\.gemini\\antigravity\\scratch\\conecta-moveis\\public\\brand';

  // O painel oficial com fundo quadriculado é o media_1794505426305_6e9e9ce5.jpg (1024x576)
  const panelPath = path.join(uploadsDir, 'media_1794505426305_6e9e9ce5.jpg');
  
  // Recorte exato da caixa marcada "Cabeçalho Desktop" (topo esquerdo)
  // [Cabeçalho Desktop]: left ~15, top ~35, width ~755, height ~145
  const croppedHeader = await sharp(panelPath)
    .extract({
      left: 18,
      top: 36,
      width: 752,
      height: 144
    })
    .toBuffer();

  // Agora vamos remover apenas o padrão de quadriculado cinza de fundo
  // O logo tem as cores:
  // - Arco/Telhado/MÓVEIS: Laranja vivo (#EA580C / #FF7A00)
  // - CONECTA e Sofá: Branco e cinza prateado com contorno escuro
  // - Fundo quadriculado: quadrados alternados de cinza claro (rgb ~200) e cinza escuro (rgb ~170)
  const { data, info } = await sharp(croppedHeader).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const isOrange = r > 165 && g < 155 && b < 60;
    const diff = Math.max(r, g, b) - Math.min(r, g, b);

    // Se a saturação for quase zero (cinza neutro do quadriculado de fundo de Photoshop)
    if (diff < 12 && r > 150 && r < 215) {
      data[i + 3] = 0; // Transparente total no fundo quadriculado!
    } else if (diff < 12 && r >= 215) {
      // Branco puro das letras "CONECTA" e do sofá
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255; // 100% opaco
    } else {
      // Preserva 100% dos tons originais do logo
      data[i + 3] = 255;
    }
  }

  const cleanOfficialLogo = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 }
  }).trim().png().toBuffer();

  fs.writeFileSync(path.join(brandDir, 'logo-conecta-moveis.png'), cleanOfficialLogo);
  fs.writeFileSync(path.join(brandDir, 'logo.png'), cleanOfficialLogo);

  console.log('✅ Logo oficial da caixa "Cabeçalho Desktop" extraído e instalado com perfeição!');
}

extractFromGuidelines().catch(console.error);

