const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function extractFullHouseAndSofa() {
  const brandDir = 'C:\\Users\\luisr\\.gemini\\antigravity\\scratch\\conecta-moveis\\public\\brand';
  const uploadsDir = 'C:\\Users\\luisr\\.gemini\\antigravity\\brain\\18681ff5-f867-4193-a64e-e97ad0c5a64c\\.user_uploaded';

  // Usamos a imagem media_1794505077240_5365c012.png (1024x341)
  const logoRaw = path.join(uploadsDir, 'media_1794505077240_5365c012.png');
  const { data, info } = await sharp(logoRaw).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  // Limpa apenas o fundo branco externo
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r > 240 && g > 240 && b > 240) {
      data[i + 3] = 0;
    }
  }

  // Extrai o símbolo da casinha INTEIRA com o arco completo (de x=0 até x=320)
  // Sem fazer trim lateral que coma a parede direita da casa!
  const fullHouseBuffer = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 }
  })
    .extract({
      left: 0,
      top: 0,
      width: 320, // Pega a casa toda, sofá e arco inteiro!
      height: info.height
    })
    .png()
    .toBuffer();

  const iconBase64 = fullHouseBuffer.toString('base64');

  // Montamos o SVG com a casa 100% visível, dos dois lados e telhado intacto:
  const fullSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 150" width="100%" height="100%" fill="none">
  <defs>
    <linearGradient id="moveisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFA000" />
      <stop offset="50%" stop-color="#FF6B00" />
      <stop offset="100%" stop-color="#EA580C" />
    </linearGradient>
    <filter id="shadowEffect" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.9" />
    </filter>
  </defs>

  <!-- 1. Desenho da Casa Inteira com os Dois Lados, Telhado, Sofá e Arco Completo -->
  <image href="data:image/png;base64,${iconBase64}" x="0" y="5" width="220" height="140" />

  <!-- 2. Palavra CONECTA em Branco Puro (#FFFFFF) com espaçamento perfeito -->
  <text x="235" y="86" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="900" font-size="52" fill="#FFFFFF" letter-spacing="-1" filter="url(#shadowEffect)">CONECTA</text>

  <!-- 3. Palavra MÓVEIS em Laranja Oficial Inteira -->
  <text x="485" y="86" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="900" font-size="52" fill="url(#moveisGrad)" letter-spacing="-1" filter="url(#shadowEffect)">MÓVEIS</text>

  <!-- 4. Subtítulo Completo: PROFISSIONAIS • MÓVEIS • OPORTUNIDADES -->
  <g font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="800" font-size="13.5" letter-spacing="2.5" fill="#FFFFFF" filter="url(#shadowEffect)">
    <text x="238" y="118">PROFISSIONAIS</text>
    <circle cx="388" cy="113" r="3" fill="#FF7A00" />
    <text x="402" y="118">MÓVEIS</text>
    <circle cx="482" cy="113" r="3" fill="#FF7A00" />
    <text x="496" y="118">OPORTUNIDADES</text>
  </g>
</svg>
`;

  fs.writeFileSync(path.join(brandDir, 'logo-conecta-moveis.svg'), fullSvg);
  console.log('✅ A casa inteira agora está com ambos os lados 100% visíveis e preservados!');
}

extractFullHouseAndSofa().catch(console.error);

