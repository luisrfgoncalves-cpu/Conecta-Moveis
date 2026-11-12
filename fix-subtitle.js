const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function fixLettersAndSubtitle() {
  const uploadsDir = 'C:\\Users\\luisr\\.gemini\\antigravity\\brain\\18681ff5-f867-4193-a64e-e97ad0c5a64c\\.user_uploaded';
  const brandDir = 'C:\\Users\\luisr\\.gemini\\antigravity\\scratch\\conecta-moveis\\public\\brand';

  const logoRaw = path.join(uploadsDir, 'media_1794505077240_5365c012.png');
  const { data, info } = await sharp(logoRaw).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const isOrange = r > 180 && g < 155 && b < 60;
    const isDarkOrange = r > 130 && g < 100 && b < 40;
    const isFundoBranco = r > 246 && g > 246 && b > 246;

    if (isFundoBranco) {
      data[i + 3] = 0; // Transparente 100%
    } else if (!isOrange && !isDarkOrange) {
      // Tudo que for letras brancas, cinzas, contornos ou o subtítulo "PROFISSIONAIS • MÓVEIS • OPORTUNIDADES"
      if (r > 130 && g > 130 && b > 130) {
        data[i] = 255;     // Branco absoluto
        data[i + 1] = 255; // Branco absoluto
        data[i + 2] = 255; // Branco absoluto
        data[i + 3] = 255; // Opacidade máxima 100%
      } else if (r < 100 && g < 100 && b < 100) {
        // Contorno escuro nítido
        data[i + 3] = 255;
      }
    }
  }

  const logoSolid = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 }
  }).trim().png().toBuffer();

  fs.writeFileSync(path.join(brandDir, 'logo-conecta-moveis.png'), logoSolid);
  fs.writeFileSync(path.join(brandDir, 'logo.png'), logoSolid);

  console.log('✅ CONECTA e o subtítulo inferior agora estão 100% brancos e ultra nítidos!');
}

fixLettersAndSubtitle().catch(console.error);

