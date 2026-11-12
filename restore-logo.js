const fs = require('fs');
const path = require('path');

const brandDir = 'C:\\Users\\luisr\\.gemini\\antigravity\\scratch\\conecta-moveis\\public\\brand';

// Pegamos o ícone oficial em base64 já salvo em icon-conecta-moveis.png
const iconBuffer = fs.readFileSync(path.join(brandDir, 'icon-conecta-moveis.png'));
const iconBase64 = iconBuffer.toString('base64');

// Criamos o SVG exatamente igual ao que você tinha aprovado, mas agora com largura 900px
// para JAMAIS cortar nada: o "CONECTA MÓVEIS" e o "PROFISSIONAIS • MÓVEIS • OPORTUNIDADES"
// têm espaço de sobra absoluto!
const fullSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 140" width="100%" height="100%" fill="none">
  <defs>
    <linearGradient id="moveisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFA000" />
      <stop offset="50%" stop-color="#FF6B00" />
      <stop offset="100%" stop-color="#EA580C" />
    </linearGradient>
    <filter id="shadowEffect" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.8" />
    </filter>
  </defs>

  <!-- 1. Símbolo Oficial (Casinha com Poltrona) -->
  <image href="data:image/png;base64,${iconBase64}" x="0" y="8" width="130" height="120" />

  <!-- 2. Palavra CONECTA em Branco Puro (#FFFFFF) Sólido -->
  <text x="145" y="82" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="900" font-size="52" fill="#FFFFFF" letter-spacing="-1" filter="url(#shadowEffect)">CONECTA</text>

  <!-- 3. Palavra MÓVEIS Completa (SEM NENHUM CORTE) -->
  <text x="395" y="82" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="900" font-size="52" fill="url(#moveisGrad)" letter-spacing="-1" filter="url(#shadowEffect)">MÓVEIS</text>

  <!-- 4. Subtítulo: PROFISSIONAIS • MÓVEIS • OPORTUNIDADES Completo -->
  <g font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="800" font-size="13" letter-spacing="2" fill="#FFFFFF" filter="url(#shadowEffect)">
    <text x="148" y="114">PROFISSIONAIS</text>
    <circle cx="288" cy="109" r="3" fill="#FF7A00" />
    <text x="300" y="114">MÓVEIS</text>
    <circle cx="374" cy="109" r="3" fill="#FF7A00" />
    <text x="386" y="114">OPORTUNIDADES</text>
  </g>
</svg>
`;

fs.writeFileSync(path.join(brandDir, 'logo-conecta-moveis.svg'), fullSvg);
console.log('✅ Logo restaurado no exato mesmo estilo com viewBox amplo de 900px, 100% completo e sem cortes!');

