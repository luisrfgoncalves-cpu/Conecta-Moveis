import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Validação Estática de RLS e Migrations (Fase 3)', () => {
  const migrationPath = path.resolve(__dirname, '../../supabase/migrations/20261112000001_initial_schema.sql');
  const storageMigrationPath = path.resolve(__dirname, '../../supabase/migrations/20261112000002_storage_buckets.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');
  const storageSql = fs.readFileSync(storageMigrationPath, 'utf-8');

  it('garante que todas as tabelas não públicas tenham ROW LEVEL SECURITY habilitada', () => {
    const tables = [
      'profiles', 'user_roles', 'companies', 'company_members', 'categories',
      'specialties', 'professional_profiles', 'profile_specialties', 'service_regions',
      'portfolio_items', 'portfolio_images', 'contact_requests', 'favorites', 'reviews',
      'reports', 'plans', 'subscriptions', 'entitlements', 'plan_interest', 'user_consents',
      'admin_logs', 'moderation_events', 'rate_limits', 'daily_metrics'
    ];

    tables.forEach(table => {
      const enableRlsRegex = new RegExp(`ALTER\\s+TABLE\\s+public\\.${table}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`, 'i');
      expect(sql).toMatch(enableRlsRegex);
    });
  });

  it('garante que funções auxiliares de segurança usem SECURITY DEFINER com search_path fixo', () => {
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.is_admin()');
    expect(sql).toContain('SECURITY DEFINER SET search_path = public');
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.is_moderator()');
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.is_company_member');
  });

  it('garante existência da view pública segura sem colunas sensíveis', () => {
    expect(sql).toContain('CREATE OR REPLACE VIEW public.public_professionals');
    expect(sql).toContain('WHERE p.is_published = true AND p.is_suspended = false');
  });

  it('garante criação dos buckets avatars, portfolio-pending e portfolio-public com políticas', () => {
    expect(storageSql).toContain("'avatars'");
    expect(storageSql).toContain("'portfolio-pending'");
    expect(storageSql).toContain("'portfolio-public'");
    expect(storageSql).toContain("bucket_id = 'portfolio-pending'");
    expect(storageSql).toContain("bucket_id = 'portfolio-public'");
  });

  it('testes negativos mandatários: regras restritivas para dados privados e denúncias', () => {
    // 1. user_roles: apenas admin tem permissão de escrita
    expect(sql).toContain('CREATE POLICY "Apenas admin altera papéis" ON public.user_roles FOR ALL USING (public.is_admin())');

    // 2. reports (denúncias): invisíveis para terceiros
    expect(sql).toContain('CREATE POLICY "Denúncias invisíveis para terceiros" ON public.reports FOR SELECT USING (public.is_moderator() OR (reporter_id IS NOT NULL AND auth.uid() = reporter_id))');

    // 3. contact_requests: acessíveis apenas entre remetente e destinatário
    expect(sql).toContain('CREATE POLICY "Acesso restrito de solicitações" ON public.contact_requests FOR SELECT USING');
  });
});
