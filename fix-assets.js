const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function fixAssetsDirectly() {
  const uploadsDir = 'C:\\Users\\luisr\\.gemini\\antigravity\\brain\\18681ff5-f867-4193-a64e-e97ad0c5a64c\\.user_uploaded';
  const brandDir = 'C:\\Users\\luisr\\.gemini\\antigravity\\scratch\\conecta-moveis\\public\\brand';
  const imgDir = 'C:\\Users\\luisr\\.gemini\\antigravity\\scratch\\conecta-moveis\\public\\images';

  // 1. Usar a imagem enviada media_1794505077240_5365c012.png para o Logo,
  // mas agora fazendo um recorte e tratamento perfeito sem artefatos ou recortes tortos.
  const logoRaw = path.join(uploadsDir, 'media_1794505077240_5365c012.png');
  const { data, info } = await sharp(logoRaw).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  
  // Como o fundo enviado é branco puro (255,255,255) do logo em alta definição:
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Distância euclidiana do branco (255, 255, 255)
    const diff = Math.sqrt((255 - r) ** 2 + (255 - g) ** 2 + (255 - b) ** 2);
    if (diff < 15) {
      data[i + 3] = 0; // Transparência cristalina
    } else if (diff < 35) {
      data[i + 3] = Math.round((diff - 15) / 20 * 255); // Suavização de borda perfeita
    }
  }

  const cleanLogo = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 }
  }).trim().png().toBuffer();

  fs.writeFileSync(path.join(brandDir, 'logo-conecta-moveis.png'), cleanLogo);
  fs.writeFileSync(path.join(brandDir, 'logo.png'), cleanLogo);

  // 2. Usar a imagem espetacular da sala com iluminação LED laranja (media_1794505483112_8a821373.jpg)
  // que você enviou como fundo de tela cheia real (FULL SCREEN BACKGROUND)
  const fullBg = path.join(uploadsDir, 'media_1794505483112_8a821373.jpg');
  await sharp(fullBg)
    .resize(1920, 1080, { fit: 'cover' })
    .jpeg({ quality: 90 })
    .toFile(path.join(imgDir, 'background-full.jpg'));

  console.log('✅ Logo com transparência cristalina e Fundo Full Screen gerados!');
}

fixAssetsDirectly().catch(console.error);

