const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function processImages() {
  const uploadsDir = 'C:\\Users\\luisr\\.gemini\\antigravity\\brain\\18681ff5-f867-4193-a64e-e97ad0c5a64c\\.user_uploaded';
  const brandDir = 'C:\\Users\\luisr\\.gemini\\antigravity\\scratch\\conecta-moveis\\public\\brand';
  const imgDir = 'C:\\Users\\luisr\\.gemini\\antigravity\\scratch\\conecta-moveis\\public\\images';

  if (!fs.existsSync(brandDir)) fs.mkdirSync(brandDir, { recursive: true });
  if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

  // 1. Processar Logo Horizontal: remover fundo branco (tornar 100% transparente)
  // media_1794505077240_5365c012.png é o logo com fundo branco puro
  const logoRaw = path.join(uploadsDir, 'media_1794505077240_5365c012.png');
  const { data, info } = await sharp(logoRaw).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  
  // Converte pixels brancos / próximos ao branco em alfa 0 (transparência real)
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Se for branco ou cinza muito claro do fundo
    if (r > 240 && g > 240 && b > 240) {
      data[i + 3] = 0; // Transparente
    } else if (r > 220 && g > 220 && b > 220) {
      // Suavização anti-aliasing nas bordas
      const avg = (r + g + b) / 3;
      data[i + 3] = Math.round((255 - avg) * 255 / 35);
    }
  }

  const logoTranspBuffer = await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  }).trim().png().toBuffer();

  // Salvar logo horizontal transparente
  fs.writeFileSync(path.join(brandDir, 'logo-conecta-moveis.png'), logoTranspBuffer);
  fs.writeFileSync(path.join(brandDir, 'logo.png'), logoTranspBuffer);

  // 2. Extrair o Símbolo Isolado (casinha com sofá) com fundo transparente
  // O símbolo fica no lado esquerdo do logo
  const logoMeta = await sharp(logoTranspBuffer).metadata();
  const iconCropWidth = Math.round(logoMeta.height * 1.1); // Proporção do símbolo
  const iconBuffer = await sharp(logoTranspBuffer)
    .extract({
      left: 0,
      top: 0,
      width: Math.min(iconCropWidth, logoMeta.width),
      height: logoMeta.height
    })
    .trim()
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(brandDir, 'icon-conecta-moveis.png'), iconBuffer);
  fs.writeFileSync(path.join(brandDir, 'favicon.png'), await sharp(iconBuffer).resize(48, 48).png().toBuffer());
  fs.writeFileSync(path.join('C:\\Users\\luisr\\.gemini\\antigravity\\scratch\\conecta-moveis\\public', 'favicon.ico'), await sharp(iconBuffer).resize(32, 32).png().toBuffer());

  // 3. Fundo Principal (Living Room Moderno com Iluminação Laranja)
  // media_1794505236100_b52c12cc.jpg
  const bgRaw = path.join(uploadsDir, 'media_1794505236100_b52c12cc.jpg');
  await sharp(bgRaw)
    .resize(1920, 1080, { fit: 'cover' })
    .jpeg({ quality: 85 })
    .toFile(path.join(imgDir, 'background-home.jpg'));

  // 4. Showroom Conecta (Sala ampla com quadros geométricos laranja)
  // media_1794505483112_8a821373.jpg
  const showroomRaw = path.join(uploadsDir, 'media_1794505483112_8a821373.jpg');
  await sharp(showroomRaw)
    .resize(1600, 900, { fit: 'cover' })
    .jpeg({ quality: 85 })
    .toFile(path.join(imgDir, 'showroom-conecta.jpg'));

  console.log('✅ Todas as imagens foram processadas com transparência pura e salvas com sucesso!');
}

processImages().catch(err => {
  console.error(err);
  process.exit(1);
});

