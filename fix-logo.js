const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function fixLogoLettersAndBg() {
  const uploadsDir = 'C:\\Users\\luisr\\.gemini\\antigravity\\brain\\18681ff5-f867-4193-a64e-e97ad0c5a64c\\.user_uploaded';
  const brandDir = 'C:\\Users\\luisr\\.gemini\\antigravity\\scratch\\conecta-moveis\\public\\brand';

  // Usar o arquivo media_1794505077240_5365c012.png
  const logoRaw = path.join(uploadsDir, 'media_1794505077240_5365c012.png');
  const { data, info } = await sharp(logoRaw).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  // Vamos percorrer os pixels:
  // Se for o fundo branco puro em volta: torna transparente.
  // Se for o preenchimento ou borda da palavra "CONECTA" e "PROFISSIONAIS", tornamos branco puro 100% opaco e sólido!
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Detectar cores laranjas (MÓVEIS e arco/casinha)
    const isOrange = r > 180 && g < 155 && b < 60;
    const isDarkOrange = r > 140 && g < 110 && b < 40;

    // Detectar o fundo branco puro (cantos e fora do logo)
    // As letras de CONECTA têm um leve sombreado cinza/preto no contorno
    const isFundoBranco = r > 248 && g > 248 && b > 248;

    if (isFundoBranco) {
      data[i + 3] = 0; // Transparente total
    } else if (!isOrange && !isDarkOrange) {
      // São as letras da palavra "CONECTA" e do slogan inferior ou sofá
      // Reforçamos o branco para ficar 100% sólido e radiante
      if (r > 160 && g > 160 && b > 160) {
        data[i] = 255;     // R sólido
        data[i + 1] = 255; // G sólido
        data[i + 2] = 255; // B sólido
        data[i + 3] = 255; // Alpha 100% opaco
      } else if (r < 90 && g < 90 && b < 90) {
        // Contorno escuro da letra para dar relevo e contraste contra o fundo
        data[i + 3] = 255;
      }
    }
  }

  const logoSolid = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 }
  }).trim().png().toBuffer();

  fs.writeFileSync(path.join(brandDir, 'logo-conecta-moveis.png'), logoSolid);
  fs.writeFileSync(path.join(brandDir, 'logo.png'), logoSolid);

  console.log('✅ Letras da palavra CONECTA revitalizadas em branco sólido radiante!');
}

fixLogoLettersAndBg().catch(console.error);
