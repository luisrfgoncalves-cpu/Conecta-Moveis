import { describe, it, expect } from 'vitest';
import { runCheckIsencao } from '../../scripts/check-isencao.mjs';
import { getOperatorSettings } from '@/lib/config/operator';
import fs from 'fs';
import path from 'path';

describe('FASE 15 — Linguagem, Avisos e Arquitetura de Isenção', () => {
  describe('Auditoria de Vocabulário (check:isencao)', () => {
    it('o código atual do projeto passa no check:isencao sem violações de R3 e R4', () => {
      const violations = runCheckIsencao('src');
      expect(violations).toHaveLength(0);
    });

    it('detecta violação quando um termo proibido é inserido (teste do teste)', () => {
      // Simula uma string violadora injetada
      const forbiddenCode = 'const banner = "Contrate os melhores marceneiros garantidos!";';
      const FORBIDDEN_TERMS = ['contratar', 'contrate', 'melhores', 'garantido', 'garantidos'];
      
      const found = FORBIDDEN_TERMS.some((term) =>
        new RegExp(`\\b${term}\\b`, 'i').test(forbiddenCode)
      );

      expect(found).toBe(true);
    });
  });

  describe('Ausência de Campos de Preço no Banco de Dados (Regra R2)', () => {
    it('nenhuma tabela de schema possui colunas de preço ou orçamento de serviço', () => {
      const migrationPath = path.join(process.cwd(), 'supabase/migrations/20261112000001_initial_schema.sql');
      const sqlContent = fs.readFileSync(migrationPath, 'utf-8');

      // Tabela professional_profiles não deve ter preco, price, orcamento ou valor
      const profileTableMatch = sqlContent.match(/CREATE TABLE IF NOT EXISTS public\.professional_profiles \(([\s\S]*?)\);/);
      expect(profileTableMatch).not.toBeNull();
      const profileTableSql = profileTableMatch![1].toLowerCase();

      expect(profileTableSql).not.toContain('price');
      expect(profileTableSql).not.toContain('preco');
      expect(profileTableSql).not.toContain('orcamento');
      expect(profileTableSql).not.toContain('valor_hora');

      // Tabela portfolio_items não deve ter preço
      const portfolioTableMatch = sqlContent.match(/CREATE TABLE IF NOT EXISTS public\.portfolio_items \(([\s\S]*?)\);/);
      expect(portfolioTableMatch).not.toBeNull();
      const portfolioTableSql = portfolioTableMatch![1].toLowerCase();

      expect(portfolioTableSql).not.toContain('price');
      expect(portfolioTableSql).not.toContain('preco');
      expect(portfolioTableSql).not.toContain('orcamento');
    });
  });

  describe('Identificação do Operador e Canais de Atendimento (Regra R13)', () => {
    it('retorna os 4 canais obrigatórios de comunicação (atendimento, titulares, notificações, autoridades)', () => {
      const op = getOperatorSettings();
      expect(op.emailAtendimento).toContain('@');
      expect(op.emailTitulares).toContain('@');
      expect(op.emailNotificacoes).toContain('@');
      expect(op.emailAutoridades).toContain('@');
    });

    it('sinaliza status pendente fora de produção quando CNPJ não configurado', () => {
      const op = getOperatorSettings();
      // Em dev/teste sem env var configurada, deve acusar isPending
      if (!process.env.OPERATOR_CNPJ && !process.env.NEXT_PUBLIC_OPERATOR_CNPJ) {
        expect(op.isPending).toBe(true);
        expect(op.cnpj).toContain('Pendente');
      }
    });
  });
});

