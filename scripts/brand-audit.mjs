import fs from 'fs';
import path from 'path';

const SEARCH_DIRS = ['src', 'public', 'scripts', 'docs'];
const IGNORED_FILES = new Set([
  'scripts/brand-audit.mjs',
  'src/lib/config/brand.ts',
]);

// Pastas a ignorar
const IGNORED_DIRS = new Set([
  'node_modules',
  '.next',
  '.git',
  'test-results',
  'playwright-report',
]);

const PATTERNS = [
  { name: 'Domínio antigo (conectamoveis.com.br)', regex: /conectamoveis\.com\.br/gi },
  { name: 'E-mail antigo (@conectamoveis)', regex: /@conectamoveis/gi },
  { name: 'Texto literal "Conecta Móveis"', regex: /Conecta\s+Móveis/gi },
];

function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    if (IGNORED_DIRS.has(file)) continue;
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  }

  return arrayOfFiles;
}

console.log('🔍 Executando auditoria de marca e domínio (brand:audit)...\n');

let totalOccurrences = 0;
const resultsByFile = new Map();

for (const dir of SEARCH_DIRS) {
  const files = getAllFiles(dir);

  for (const file of files) {
    const normalizedFile = file.replace(/\\/g, '/');
    if (IGNORED_FILES.has(normalizedFile)) continue;

    // Apenas arquivos de texto
    const ext = path.extname(file).toLowerCase();
    const textExts = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json', '.md', '.txt', '.html', '.css', '.svg'];
    if (!textExts.includes(ext)) continue;

    try {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, idx) => {
        for (const pattern of PATTERNS) {
          if (pattern.regex.test(line)) {
            // Reseta a regex para reaproveitamento
            pattern.regex.lastIndex = 0;
            totalOccurrences++;
            const list = resultsByFile.get(normalizedFile) || [];
            list.push({
              line: idx + 1,
              pattern: pattern.name,
              text: line.trim(),
            });
            resultsByFile.set(normalizedFile, list);
          }
        }
      });
    } catch {
      // Ignora erro de leitura
    }
  }
}

if (totalOccurrences === 0) {
  console.log('✅ Nenhuma ocorrência indevida de marca ou domínio antigo encontrada no código!\n');
} else {
  console.log(`⚠️ Encontradas ${totalOccurrences} ocorrência(s) em ${resultsByFile.size} arquivo(s):\n`);

  for (const [file, items] of resultsByFile.entries()) {
    console.log(`📁 ${file} (${items.length} ocorrência(s)):`);
    for (const item of items) {
      console.log(`   L${item.line} [${item.pattern}]: ${item.text.slice(0, 100)}`);
    }
    console.log('');
  }
}

console.log(`Resumo do relatório brand:audit: ${totalOccurrences} ocorrência(s) detectada(s).`);
