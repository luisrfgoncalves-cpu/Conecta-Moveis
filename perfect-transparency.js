const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function perfectFloodFillTransparency() {
  const uploadsDir = 'C:\\Users\\luisr\\.gemini\\antigravity\\brain\\18681ff5-f867-4193-a64e-e97ad0c5a64c\\.user_uploaded';
  const brandDir = 'C:\\Users\\luisr\\.gemini\\antigravity\\scratch\\conecta-moveis\\public\\brand';

  // Usar a imagem exata que você enviou: media_1794507179736_f27f1e8d.png
  const inputPath = path.join(uploadsDir, 'media_1794507179736_f27f1e8d.png');
  const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;

  // Matriz de visitados para Flood Fill partindo dos 4 cantos e bordas externas
  const visited = new Uint8Array(width * height);
  const queue = [];

  function isWhiteBackground(x, y) {
    const idx = (y * width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    // Se for branco puro ou quase branco do fundo de fora
    return r > 230 && g > 230 && b > 230;
  }

  // Adiciona todas as bordas externas na fila (topo, fundo, esquerda, direita)
  for (let x = 0; x < width; x++) {
    if (isWhiteBackground(x, 0)) { queue.push(x, 0); visited[0 * width + x] = 1; }
    if (isWhiteBackground(x, height - 1)) { queue.push(x, height - 1); visited[(height - 1) * width + x] = 1; }
  }
  for (let y = 0; y < height; y++) {
    if (isWhiteBackground(0, y)) { queue.push(0, y); visited[y * width + 0] = 1; }
    if (isWhiteBackground(width - 1, y)) { queue.push(width - 1, y); visited[y * width + (width - 1)] = 1; }
  }

  // Flood fill / BFS para remover APENAS o fundo que toca as bordas externas
  let head = 0;
  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];

    // Torna esse pixel de fundo 100% transparente
    const pIdx = (cy * width + cx) * 4;
    data[pIdx + 3] = 0;

    // Vizinhos 4-conectados
    const neighbors = [
      [cx + 1, cy],
      [cx - 1, cy],
      [cx, cy + 1],
      [cx, cy - 1]
    ];

    for (let i = 0; i < neighbors.length; i++) {
      const nx = neighbors[i][0];
      const ny = neighbors[i][1];
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nPos = ny * width + nx;
        if (!visited[nPos] && isWhiteBackground(nx, ny)) {
          visited[nPos] = 1;
          queue.push(nx, ny);
        }
      }
    }
  }

  // Salvamos a imagem PNG original, preservando 100% da nitidez de cada pixel das letras e do símbolo
  const finalBuffer = await sharp(data, {
    raw: { width, height, channels: 4 }
  })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();

  fs.writeFileSync(path.join(brandDir, 'logo-conecta-moveis.png'), finalBuffer);
  fs.writeFileSync(path.join(brandDir, 'logo.png'), finalBuffer);

  console.log('✅ Flood fill concluído: fundo externo 100% transparente sem tocar ou alterar nenhum pixel das letras ou cores do logo!');
}

perfectFloodFillTransparency().catch(console.error);

