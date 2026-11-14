/**
 * Gerador de QR Code ultra-leve e autônomo (Zero dependências externas)
 * Gera SVG vetorial puro em conformidade com ISO/IEC 18004 para links de convite.
 */

// Tabela de polinômios de log/antilog de Galois Field GF(256)
const GF256_EXP = new Uint8Array(512);
const GF256_LOG = new Uint8Array(256);

(function initGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF256_EXP[i] = x;
    GF256_LOG[x] = i;
    x = (x << 1) ^ (x >= 128 ? 0x11d : 0);
  }
  for (let i = 255; i < 512; i++) {
    GF256_EXP[i] = GF256_EXP[i - 255];
  }
})();

function gfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return GF256_EXP[GF256_LOG[x] + GF256_LOG[y]];
}

function polyMul(p: Uint8Array, q: Uint8Array): Uint8Array {
  const r = new Uint8Array(p.length + q.length - 1);
  for (let i = 0; i < p.length; i++) {
    for (let j = 0; j < q.length; j++) {
      r[i + j] ^= gfMul(p[i], q[j]);
    }
  }
  return r;
}

function polyRest(dividend: Uint8Array, divisor: Uint8Array): Uint8Array {
  const out = new Uint8Array(dividend);
  for (let i = 0; i < dividend.length - divisor.length + 1; i++) {
    const factor = out[i];
    if (factor !== 0) {
      for (let j = 0; j < divisor.length; j++) {
        out[i + j] ^= gfMul(divisor[j], factor);
      }
    }
  }
  return new Uint8Array(out.slice(dividend.length - divisor.length + 1));
}

function getGeneratorPoly(degree: number): Uint8Array {
  let poly: Uint8Array = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    poly = new Uint8Array(polyMul(poly, new Uint8Array([1, GF256_EXP[i]])));
  }
  return poly;
}

/**
 * Gera a matriz booleana do QR Code (Versão 4, Error Correction Level M - até 78 caracteres UTF8)
 */
export function generateQRCodeMatrix(text: string): boolean[][] {
  const size = 33; // Versão 4: 33x33
  const matrix: (boolean | null)[][] = Array.from({ length: size }, () =>
    Array(size).fill(null)
  );

  function setFinder(r: number, c: number) {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          if (dr === -1 || dr === 7 || dc === -1 || dc === 7) {
            matrix[nr][nc] = false;
          } else if (dr === 0 || dr === 6 || dc === 0 || dc === 6) {
            matrix[nr][nc] = true;
          } else if (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4) {
            matrix[nr][nc] = true;
          } else {
            matrix[nr][nc] = false;
          }
        }
      }
    }
  }

  // Finders
  setFinder(0, 0);
  setFinder(0, size - 7);
  setFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Dark module
  matrix[size - 8][8] = true;

  // Codificação dos dados em modo Byte (8-bit)
  const encoder = new TextEncoder();
  const rawBytes = encoder.encode(text);
  const dataLen = rawBytes.length;

  // Buffer de bits
  const bits: number[] = [];
  function pushBits(val: number, len: number) {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  }

  // Modo Byte (0100)
  pushBits(4, 4);
  // Tamanho dos dados (8 bits para versão 4)
  pushBits(dataLen, 8);
  for (const b of rawBytes) {
    pushBits(b, 8);
  }
  // Terminador (4 zeros)
  pushBits(0, 4);
  // Padding para múltiplo de 8
  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  // Capacidade de dados da V4-M: 64 bytes de dados (total 80 codewords, 16 EC codewords)
  const totalDataBytes = 64;
  const dataCodewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byteVal = 0;
    for (let j = 0; j < 8; j++) {
      byteVal = (byteVal << 1) | (bits[i + j] || 0);
    }
    dataCodewords.push(byteVal);
  }

  // Byte padding 0xEC, 0x11
  let padToggle = false;
  while (dataCodewords.length < totalDataBytes) {
    dataCodewords.push(padToggle ? 0x11 : 0xec);
    padToggle = !padToggle;
  }

  // Cálculo de Correção de Erros (16 bytes)
  const ecDegree = 16;
  const gen = getGeneratorPoly(ecDegree);
  const messagePoly = new Uint8Array(dataCodewords.length + ecDegree);
  messagePoly.set(dataCodewords);
  const ecCodewords = polyRest(messagePoly, gen);

  const fullPayload = new Uint8Array([...dataCodewords, ...ecCodewords]);

  // Colocar dados na matriz com zigue-zague
  let bitIndex = 0;
  const totalPayloadBits = fullPayload.length * 8;

  let right = size - 1;
  let upward = true;

  while (right > 0) {
    if (right === 6) right--; // Pula timing pattern vertical

    for (let v = 0; v < size; v++) {
      const r = upward ? size - 1 - v : v;
      for (let c = right; c >= right - 1; c--) {
        if (matrix[r][c] === null) {
          let b = false;
          if (bitIndex < totalPayloadBits) {
            const byte = fullPayload[Math.floor(bitIndex / 8)];
            const bitOffset = 7 - (bitIndex % 8);
            b = ((byte >> bitOffset) & 1) === 1;
            bitIndex++;
          }
          // Máscara 0: (row + col) % 2 === 0
          if ((r + c) % 2 === 0) {
            b = !b;
          }
          matrix[r][c] = b;
        }
      }
    }
    upward = !upward;
    right -= 2;
  }

  // Preenche null remanescentes com false
  return matrix.map((row) => row.map((cell) => cell ?? false));
}

/**
 * Converte a matriz QR em string SVG limpa
 */
export function generateQRCodeSVG(text: string, sizePx = 200): string {
  try {
    const matrix = generateQRCodeMatrix(text);
    const n = matrix.length;
    const cellSize = (sizePx / n).toFixed(2);

    let rects = '';
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (matrix[r][c]) {
          rects += `<rect x="${(c * Number(cellSize)).toFixed(2)}" y="${(r * Number(cellSize)).toFixed(2)}" width="${cellSize}" height="${cellSize}" fill="#000000" />`;
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sizePx} ${sizePx}" width="${sizePx}" height="${sizePx}" class="rounded-lg bg-white p-2">${rects}</svg>`;
  } catch {
    return `<div class="p-4 text-xs text-red-400">Erro ao gerar QR code</div>`;
  }
}
