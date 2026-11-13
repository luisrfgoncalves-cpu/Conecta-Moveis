import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  BILLING_MODE: z.enum(['off', 'test']).default('off'),
  NEXT_PUBLIC_BILLING_MODE: z.enum(['off', 'test']).default('off'),
  LEGAL_REVIEWED: z.enum(['true', 'false']).default('false'),
});

const _env = envSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  BILLING_MODE: process.env.BILLING_MODE,
  NEXT_PUBLIC_BILLING_MODE: process.env.NEXT_PUBLIC_BILLING_MODE || process.env.BILLING_MODE,
  LEGAL_REVIEWED: process.env.LEGAL_REVIEWED,
});

if (!_env.success) {
  console.error('❌ Erro de validação nas variáveis de ambiente:', _env.error.format());
  throw new Error('Configuração de ambiente inválida.');
}

export const env = _env.data;

export const isSupabaseConfigured = Boolean(
  env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

