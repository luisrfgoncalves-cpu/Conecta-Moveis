const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function createBrightCrispLogo() {
  const brandDir = 'C:\\Users\\luisr\\.gemini\\antigravity\\scratch\\conecta-moveis\\public\\brand';
  const uploadsDir = 'C:\\Users\\luisr\\.gemini\\antigravity\\brain\\18681ff5-f867-4193-a64e-e97ad0c5a64c\\.user_uploaded';

  // 1. Extrair apenas o símbolo da casinha com poltrona original (que é perfeito e laranja neon)
  const logoRaw = path.join(uploadsDir, 'media_1794505077240_5365c012.png');
  const { data, info } = await sharp(logoRaw).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  // Limpar fundo do símbolo
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r > 240 && g > 240 && b > 240) {
      data[i + 3] = 0; // Transparente
    }
  }

  const cleanRaw = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 }
  }).trim().png().toBuffer();

  // Recortar apenas o símbolo da esquerda
  const meta = await sharp(cleanRaw).metadata();
  const iconBuffer = await sharp(cleanRaw)
    .extract({
      left: 0,
      top: 0,
      width: Math.round(meta.height * 1.15),
      height: meta.height
    })
    .trim()
    .png()
    .toBuffer();

  const iconBase64 = iconBuffer.toString('base64');

  // 2. Construir SVG com o Símbolo Oficial + Tipografia Vetorial Nítida em Branco Puro (#FFFFFF) com Alto Brilho
  // Proporções: 520px de largura por 130px de altura
  const svgLogo = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 130" width="100%" height="100%" fill="none">
  <defs>
    <!-- Gradiente oficial do MÓVEIS -->
    <linearGradient id="moveisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFA000" />
      <stop offset="50%" stop-color="#FF6B00" />
      <stop offset="100%" stop-color="#EA580C" />
    </linearGradient>
    <filter id="textGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.8" />
    </filter>
  </defs>

  <!-- 1. Símbolo Original Oficial Incorporado em Alta Definição -->
  <image href="data:image/png;base64,${iconBase64}" x="0" y="5" width="130" height="120" />

  <!-- 2. Palavra CONECTA em Branco Puro (#FFFFFF) com Sombra de Profundidade -->
  <text x="142" y="78" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="900" font-size="52" fill="#FFFFFF" letter-spacing="-1" filter="url(#textGlow)">CONECTA</text>

  <!-- 3. Palavra MÓVEIS em Laranja Incandescente -->
  <text x="390" y="78" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="900" font-size="52" fill="url(#moveisGrad)" letter-spacing="-1" filter="url(#textGlow)">MÓVEIS</text>

  <!-- 4. Subtítulo: PROFISSIONAIS • MÓVEIS • OPORTUNIDADES em Branco Neve com Pontos Laranjas -->
  <g font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="800" font-size="13.5" letter-spacing="2.5" fill="#FFFFFF" filter="url(#textGlow)">
    <text x="145" y="108">PROFISSIONAIS</text>
    <circle cx="295" cy="103" r="3" fill="#FF7A00" />
    <text x="310" y="108">MÓVEIS</text>
    <circle cx="395" cy="103" r="3" fill="#FF7A00" />
    <text x="410" y="108">OPORTUNIDADES</text>
  </g>
</svg>
`;

  // Salvar como SVG vetorial cristalino e também rasterizar como PNG ultra nítido
  fs.writeFileSync(path.join(brandDir, 'logo-conecta-moveis.svg'), svgLogo);
  await sharp(Buffer.from(svgLogo)).png().toFile(path.join(brandDir, 'logo-conecta-moveis.png'));
  await sharp(Buffer.from(svgLogo)).png().toFile(path.join(brandDir, 'logo.png'));

  console.log('✅ Logotipo gerado com CONECTA e subtítulo em BRANCO PURO 100% RADIANTE E ULTRA NÍTIDO!');
}

createBrightCrispLogo().catch(console.error);

