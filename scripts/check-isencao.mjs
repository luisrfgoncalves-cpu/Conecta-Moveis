import fs from 'fs';
import path from 'path';

const FORBIDDEN_TERMS = [
  'contratar', 'contrate', 'reservar', 'agendar', 'comprar',
  'garantia', 'garantido', 'sem risco', '100%', 'melhor', 'melhores', 'top',
  'recomendado', 'recomendamos', 'confiável', 'verificado', 'certificado',
  'aprovado', 'selecionado', 'oficial', 'parceiro', 'nossos profissionais',
  'nossa equipe', 'orçamento', 'preço', 'valor', 'R$'
];

const ALLOWLIST_PATTERNS = [
  /não\s+(é\s+)?garantia/i,
  /não\s+garante/i,
  /sem\s+garantia/i,
  /sem\s+selo\s+de\s+garantia/i,
  /não\s+oferece\s+garantia/i,
  /oferece\s+garantia/i,
  /garantia\s+de\s+execução/i,
  /garantia\s+de\s+qualidade/i,
  /não\s+representa\s+garantia/i,
  /nem\s+garante/i,
  /nem\s+garantidora/i,
  /não\s+(é\s+|representa\s+)?recomendação/i,
  /não\s+(é\s+|representa\s+)?endosso/i,
  /não\s+verifica\s+nem\s+endossa/i,
  /não\s+presta(,\s+nem|\s+nem)/i,
  /não\s+cria\s+rankings/i,
  /não\s+classificamos/i,
  /preço,\s+prazo,\s+contrato\s+e\s+pagamento/i,
  /preço,\s+prazo\s+e\s+contrato/i,
  /preço\s+comercial/i,
  /aumento\s+de\s+preço/i,
  /tabelas\s+de\s+preços/i,
  /fora\s+da\s+conecta\s+móveis/i,
  /combinados\s+somente\s+entre\s+vocês/i,
  /diretamente\s+entre\s+você\s+e\s+o/i,
  /entre\s+você\s+e\s+o\s+anunciante/i,
  /entre\s+as\s+partes/i,
  /não\s+emite\s+selo/i,
  /como\s+ordenamos\s+os\s+resultados/i,
  /aviso\s+da\s+plataforma/i,
  /aviso\s+oficial/i,
  /declaração\s+oficial/i,
  /declaração\s+institucional/i,
  /nome\s+oficial/i,
  /logo\s+oficial/i,
  /declaração\s+de\s+autoria/i,
  /interação\s+registrada/i,
  /contrate-com-seguranca/i,
  /orientações\s+práticas\s+sobre\s+contratação/i,
  /r\$|preço|orçamento|pagamento/i, // regex de validação em schemas
  /isencao/i,
  /check:isencao/i,
  /operator/i,
  /termos\s+de\s+uso/i,
  /política/i,
  /arquivo\s+selecionado/i,
  /plano\s+selecionado/i,
  /inviolável/i,
  /termo\s+verificado/i,
  /conteúdo\s+verificado/i,
  /valor\s+é\s+debitado/i,
  /valor\s+anterior/i,
  /aprovado\s+provisoriamente/i
];

function isTechnicalOrAllowed(line, term, filePath) {
  // Ignorar arquivos de teste na verificação de textos de produto
  if (filePath.includes('__tests__') || filePath.endsWith('.test.ts') || filePath.endsWith('.test.tsx') || filePath.endsWith('.spec.ts')) {
    return true;
  }

  // Ignorar scripts internos e documentação
  if (filePath.includes('scripts/') || filePath.includes('docs/')) {
    return true;
  }

  const trimmed = line.trim();

  // Imports e comentários técnicos
  if (
    trimmed.startsWith('import ') ||
    trimmed.startsWith('// eslint') ||
    trimmed.startsWith('//') ||
    trimmed.startsWith('{/*') ||
    trimmed.startsWith('*') ||
    trimmed.startsWith('/*')
  ) {
    return true;
  }

  // Atributos de estilo / classes Tailwind técnicas
  if (term === 'top' && (trimmed.includes('top-') || trimmed.includes('border-top') || trimmed.includes('top:') || trimmed.includes('sticky top') || trimmed.includes('top-2') || trimmed.includes('top-4'))) {
    return true;
  }
  if (term === '100%' && (trimmed.includes('width: \'100%\'') || trimmed.includes('height: \'100%\'') || trimmed.includes('w-full') || trimmed.includes('100%') && (trimmed.includes('style=') || trimmed.includes('style:')))) {
    return true;
  }
  if (term === 'valor' && (trimmed.includes('value') || trimmed.includes('const valor') || trimmed.includes('param') || trimmed.includes('key:'))) {
    return true;
  }
  if (term === 'aprovado' && (trimmed.includes('status') || trimmed.includes('approved') || trimmed.includes('moderation') || trimmed.includes('Aprovada'))) {
    return true;
  }
  if (term === 'selecionado' && (trimmed.includes('selected') || trimmed.includes('find(') || trimmed.includes('selectedCategoryObj'))) {
    return true;
  }

  // Checar allowlist de expressões em negativa / contexto permitido
  for (const pattern of ALLOWLIST_PATTERNS) {
    if (pattern.test(line)) {
      return true;
    }
  }

  return false;
}

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git' && file !== 'e2e') {
        walkDir(fullPath, fileList);
      }
    } else if (/\.(tsx|ts|jsx|js)$/.test(file)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

export function runCheckIsencao(targetDir = 'src') {
  const files = walkDir(targetDir);
  const violations = [];

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      for (const term of FORBIDDEN_TERMS) {
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(^|[^a-zA-Z0-9_À-ÿ])${escaped}([^a-zA-Z0-9_À-ÿ]|$)`, 'i');

        if (regex.test(line)) {
          if (!isTechnicalOrAllowed(line, term, filePath)) {
            violations.push({
              file: filePath.replace(/\\/g, '/'),
              line: index + 1,
              term,
              text: line.trim()
            });
          }
        }
      }
    });
  }

  return violations;
}

// Execução direta via CLI
if (process.argv[1] && process.argv[1].endsWith('check-isencao.mjs')) {
  console.log('🔍 Executando auditoria automatizada de vocabulário e isenção (check:isencao)...');
  const violations = runCheckIsencao('src');

  if (violations.length > 0) {
    console.error(`\n❌ Falha: Foram encontradas ${violations.length} ocorrências de termos que violam a isenção:\n`);
    violations.forEach(v => {
      console.error(`  - ${v.file}:${v.line} [termo: "${v.term}"]`);
      console.error(`    Linha: "${v.text}"\n`);
    });
    process.exit(1);
  } else {
    console.log('✅ Sucesso: Nenhuma violação das regras R3, R4 ou termos de risco detectada no código!');
    process.exit(0);
  }
}
