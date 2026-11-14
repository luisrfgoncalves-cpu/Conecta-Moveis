import fs from 'fs';
import path from 'path';

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
const strictCheck = process.env.STRICT_OPERATOR_CHECK === 'true';

const cnpj = (process.env.OPERATOR_CNPJ || process.env.NEXT_PUBLIC_OPERATOR_CNPJ || '').trim();
const isPending = !cnpj || cnpj.toLowerCase() === 'pendente';

if (isProduction && strictCheck && isPending) {
  console.error('\n❌ BLOQUEADOR DE LANÇAMENTO: Operador sem CNPJ configurado no ambiente de produção.');
  console.error('Conforme a regra R13 e Decreto 7.962/2013, o deploy final exige OPERATOR_CNPJ e OPERATOR_RAZAO_SOCIAL.\n');
  process.exit(1);
} else {
  console.log(`✅ Verificação do operador: ${isPending ? 'Identificação pendente de dados formais (permitido fora de produção)' : 'Operador identificado'}`);
  process.exit(0);
}
