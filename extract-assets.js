const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function extractSpriteSheet() {
  const uploadsDir = 'C:\\Users\\luisr\\.gemini\\antigravity\\brain\\18681ff5-f867-4193-a64e-e97ad0c5a64c\\.user_uploaded';
  const brandDir = 'C:\\Users\\luisr\\.gemini\\antigravity\\scratch\\conecta-moveis\\public\\brand';
  const imgDir = 'C:\\Users\\luisr\\.gemini\\antigravity\\scratch\\conecta-moveis\\public\\images';

  // Arquivo do grid/painel completo: media_1794505426305_6e9e9ce5.jpg
  const spritePath = path.join(uploadsDir, 'media_1794505426305_6e9e9ce5.jpg');
  const metadata = await sharp(spritePath).metadata();
  console.log(`Dimensões do painel: ${metadata.width}x${metadata.height}`);

  // Função para remover fundo de quadriculado/moldura escura e deixar transparência pura
  async function cleanAndMakeTransparent(buffer) {
    const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Se for cinza de quadriculado ou preto/grafite de fundo de mock (fora das cores do logo)
      const maxVal = Math.max(r, g, b);
      const minVal = Math.min(r, g, b);
      const isGrayOrDark = (maxVal - minVal < 20) && (r < 180 || r > 240);
      
      // Preservar os laranjas vivos, brancos do sofá e bordas iluminadas
      const isOrange = r > 180 && g < 150 && b < 60;
      const isWhiteText = r > 210 && g > 210 && b > 210;

      if (!isOrange && !isWhiteText && isGrayOrDark) {
        data[i + 3] = 0; // Transparente total
      }
    }
    return sharp(data, {
      raw: { width: info.width, height: info.height, channels: 4 }
    }).trim().png().toBuffer();
  }

  // 1. Recortar Cabeçalho Desktop (topo esquerdo da imagem de guia)
  // [Cabeçalho Desktop] fica aprox entre 0% e 75% da largura, topo 5% a 32%
  const w = metadata.width;
  const h = metadata.height;

  const logoDesktopCrop = await sharp(spritePath)
    .extract({
      left: Math.round(w * 0.02),
      top: Math.round(h * 0.06),
      width: Math.round(w * 0.72),
      height: Math.round(h * 0.25)
    })
    .toBuffer();

  const logoClean = await cleanAndMakeTransparent(logoDesktopCrop);
  fs.writeFileSync(path.join(brandDir, 'logo-conecta-moveis.png'), logoClean);

  // 2. Recortar Favicon / Símbolo Isolado (canto superior direito ou centro esquerda)
  const iconCrop = await sharp(spritePath)
    .extract({
      left: Math.round(w * 0.78),
      top: Math.round(h * 0.06),
      width: Math.round(w * 0.19),
      height: Math.round(h * 0.25)
    })
    .toBuffer();

  const iconClean = await cleanAndMakeTransparent(iconCrop);
  fs.writeFileSync(path.join(brandDir, 'icon-conecta-moveis.png'), iconClean);
  fs.writeFileSync(path.join(brandDir, 'favicon.png'), await sharp(iconClean).resize(64, 64).png().toBuffer());
  fs.writeFileSync(path.join('C:\\Users\\luisr\\.gemini\\antigravity\\scratch\\conecta-moveis\\public', 'favicon.ico'), await sharp(iconClean).resize(32, 32).png().toBuffer());

  // 3. Recortar e salvar a Tela de Carregamento Splash Screen oficial
  // Fica à direita no meio (aproximadamente 62% da largura e 40% a 70% da altura)
  const splashCrop = await sharp(spritePath)
    .extract({
      left: Math.round(w * 0.62),
      top: Math.round(h * 0.40),
      width: Math.round(w * 0.36),
      height: Math.round(h * 0.32)
    })
    .jpeg({ quality: 90 })
    .toFile(path.join(imgDir, 'splash-conecta.jpg'));

  console.log('✅ Recorte preciso realizado de cada elemento da folha de ativos!');
}

extractSpriteSheet().catch(err => {
  console.error(err);
  process.exit(1);
});

