import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('next/font/google', () => ({
  Plus_Jakarta_Sans: () => ({
    variable: '--font-plus-jakarta',
  }),
}));

import { getBrandConfig } from '@/lib/config/brand';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import { generateMetadata } from '@/app/layout';

describe('BLOCO 0 — Configuração Central de Marca e Domínio', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('retorna os valores padrão da marca quando nenhuma variável está definida', () => {
    delete process.env.NEXT_PUBLIC_BRAND_NAME;
    delete process.env.NEXT_PUBLIC_BRAND_PROVISIONAL;

    const brand = getBrandConfig();
    expect(brand.name).toBe('Conecta Móveis');
    expect(brand.brandProvisional).toBe(true);
    expect(brand.focusCity).toBe('Jundiaí');
    expect(brand.focusState).toBe('SP');
  });

  it('alterar NEXT_PUBLIC_BRAND_NAME reflete imediatamente no nome da marca', () => {
    process.env.NEXT_PUBLIC_BRAND_NAME = 'Guia Moveleiro';
    process.env.NEXT_PUBLIC_BRAND_SHORT_NAME = 'Guia Moveleiro';

    const brand = getBrandConfig();
    expect(brand.name).toBe('Guia Moveleiro');
    expect(brand.shortName).toBe('Guia Moveleiro');
  });

  it('alterar NEXT_PUBLIC_BRAND_NAME reflete nos metadados de layout gerados dinamicamente', async () => {
    process.env.NEXT_PUBLIC_BRAND_NAME = 'Marcena';
    process.env.NEXT_PUBLIC_BRAND_SLOGAN = 'Catálogo de Móveis';

    const meta = await generateMetadata();
    expect(meta.title).toEqual({
      default: 'Marcena — Catálogo de Móveis',
      template: '%s | Marcena',
    });
    expect(meta.openGraph?.siteName).toBe('Marcena');
  });

  it('enquanto brand_provisional for verdadeiro, os metadados contêm noindex e nofollow', async () => {
    process.env.NEXT_PUBLIC_BRAND_PROVISIONAL = 'true';

    const meta = await generateMetadata();
    expect(meta.robots).toEqual({
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    });
  });

  it('enquanto brand_provisional for verdadeiro, robots.ts retorna disallow global', () => {
    process.env.NEXT_PUBLIC_BRAND_PROVISIONAL = 'true';

    const robotsResult = robots();
    expect(robotsResult.rules).toEqual({
      userAgent: '*',
      disallow: '/',
    });
    expect(robotsResult.sitemap).toBeUndefined();
  });

  it('enquanto brand_provisional for verdadeiro, sitemap.ts retorna lista vazia', async () => {
    process.env.NEXT_PUBLIC_BRAND_PROVISIONAL = 'true';

    const sitemapResult = await sitemap();
    expect(sitemapResult).toEqual([]);
  });

  it('sanitiza e-mails não configurados ou contendo @conectamoveis para "em implantação"', () => {
    delete process.env.SUPPORT_EMAIL;
    delete process.env.OPERATOR_EMAIL_ATENDIMENTO;

    const brand = getBrandConfig();
    expect(brand.emails.atendimento).toBe('em implantação');
    expect(brand.emails.titulares).toBe('em implantação');
    expect(brand.emails.autoridades).toBe('em implantação');
    expect(brand.emails.notificacoes).toBe('em implantação');
  });

  it('aceita e-mail real temporário quando configurado em SUPPORT_EMAIL', () => {
    process.env.SUPPORT_EMAIL = 'suporte.temporario@gmail.com';

    const brand = getBrandConfig();
    expect(brand.emails.atendimento).toBe('suporte.temporario@gmail.com');
  });

  it('bloqueia ativação de cobrança comercial se operador estiver incompleto', () => {
    delete process.env.OPERATOR_CNPJ;
    delete process.env.OPERATOR_RAZAO_SOCIAL;

    const brand = getBrandConfig();
    expect(brand.operator.isPending).toBe(true);
    expect(brand.operator.canEnableCommercialBilling).toBe(false);
  });
});
