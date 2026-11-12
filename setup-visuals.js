const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function processAllVisualAssets() {
  const uploadsDir = 'C:\\Users\\luisr\\.gemini\\antigravity\\brain\\18681ff5-f867-4193-a64e-e97ad0c5a64c\\.user_uploaded';
  const brandDir = 'C:\\Users\\luisr\\.gemini\\antigravity\\scratch\\conecta-moveis\\public\\brand';
  const imgDir = 'C:\\Users\\luisr\\.gemini\\antigravity\\scratch\\conecta-moveis\\public\\images';

  if (!fs.existsSync(brandDir)) fs.mkdirSync(brandDir, { recursive: true });
  if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

  // 1. Recortar e isolar os logos com precisão profissional absoluta
  // A imagem media_1794505077240_5365c012.png é o logotipo original em 1280x420 com fundo branco puro.
  const logoRaw = path.join(uploadsDir, 'media_1794505077240_5365c012.png');
  const { data, info } = await sharp(logoRaw).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  // Varredura de pixels para transparência cristalina mantendo o contorno suave das letras e do símbolo
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Distância até o branco puro (255, 255, 255)
    const dist = Math.sqrt((255 - r) ** 2 + (255 - g) ** 2 + (255 - b) ** 2);
    
    if (dist < 20) {
      data[i + 3] = 0; // Transparente 100%
    } else if (dist < 45) {
      // Gradiente suave de anti-aliasing
      data[i + 3] = Math.round(((dist - 20) / 25) * 255);
    }
  }

  const logoTransp = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 }
  }).trim().png().toBuffer();

  // Salva o Logo Oficial em PNG com transparência pura
  fs.writeFileSync(path.join(brandDir, 'logo-conecta-moveis.png'), logoTransp);
  fs.writeFileSync(path.join(brandDir, 'logo.png'), logoTransp);

  // 2. Extrai o Símbolo Isolado (Casinha com poltrona) para favicon e ícone
  const meta = await sharp(logoTransp).metadata();
  const iconCropWidth = Math.round(meta.height * 1.15);
  const iconBuffer = await sharp(logoTransp)
    .extract({
      left: 0,
      top: 0,
      width: Math.min(iconCropWidth, meta.width),
      height: meta.height
    })
    .trim()
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(brandDir, 'icon-conecta-moveis.png'), iconBuffer);
  fs.writeFileSync(path.join(brandDir, 'favicon.png'), await sharp(iconBuffer).resize(64, 64).png().toBuffer());
  fs.writeFileSync(path.join('C:\\Users\\luisr\\.gemini\\antigravity\\scratch\\conecta-moveis\\public', 'favicon.ico'), await sharp(iconBuffer).resize(32, 32).png().toBuffer());

  // 3. Imagens de Cenário Real Enviadas:
  // Sala de estar moderna com iluminação quente de LED (media_1794505483112_8a821373.jpg)
  const roomBg = path.join(uploadsDir, 'media_1794505483112_8a821373.jpg');
  await sharp(roomBg)
    .resize(1920, 1080, { fit: 'cover' })
    .jpeg({ quality: 90 })
    .toFile(path.join(imgDir, 'background-full.jpg'));

  // Showroom Conecta (media_1794505236100_b52c12cc.jpg)
  const showroomBg = path.join(uploadsDir, 'media_1794505236100_b52c12cc.jpg');
  await sharp(showroomBg)
    .resize(1600, 900, { fit: 'cover' })
    .jpeg({ quality: 88 })
    .toFile(path.join(imgDir, 'showroom-conecta.jpg'));

  console.log('✅ Pipeline visual executado com sucesso: Logos transparentes e imagens em alta definição instaladas!');
}

processAllVisualAssets().catch(console.error);

