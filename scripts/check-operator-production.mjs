import fs from 'fs';
import path from 'path';

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
const strictCheck = process.env.STRICT_OPERATOR_CHECK === 'true';
const billingMode = (process.env.BILLING_MODE || 'off').toLowerCase().trim();

const cnpj = (process.env.OPERATOR_CNPJ || process.env.NEXT_PUBLIC_OPERATOR_CNPJ || '').trim();
const razaoSocial = (process.env.OPERATOR_RAZAO_SOCIAL || process.env.NEXT_PUBLIC_OPERATOR_RAZAO_SOCIAL || '').trim();
const cleanCnpj = cnpj.replace(/\D/g, '');
const isPending = cleanCnpj.length !== 14 || cnpj.toLowerCase() === 'pendente' || razaoSocial.length === 0;

if (billingMode !== 'off' && isPending) {
  console.error('\n❌ BLOQUEADOR: Não é permitido ativar cobrança comercial (BILLING_MODE !== off) sem CNPJ formal válido do operador.');
  console.error('Conforme as regras R1, R13 e o Decreto 7.962/2013, regularize o CNPJ antes de ativar qualquer cobrança.\n');
  process.exit(1);
}

if (isProduction && strictCheck && isPending) {
  console.error('\n❌ BLOQUEADOR DE LANÇAMENTO: Operador sem CNPJ configurado no ambiente de produção.');
  console.error('Conforme a regra R13 e Decreto 7.962/2013, o deploy final exige OPERATOR_CNPJ e OPERATOR_RAZAO_SOCIAL.\n');
  process.exit(1);
} else {
  console.log(`✅ Verificação do operador: ${isPending ? 'Identificação em processo de formalização (permitido fora de produção)' : 'Operador identificado'}`);
  process.exit(0);
}

