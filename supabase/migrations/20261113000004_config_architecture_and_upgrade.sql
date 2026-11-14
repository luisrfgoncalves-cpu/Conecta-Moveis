-- ==============================================================================
-- CONECTA MÓVEIS - MIGRATION 006: ARQUITETURA DE CONFIGURAÇÃO E UPGRADE (FASE 18)
-- ==============================================================================

-- 1. Camada A: Tetos da Infraestrutura (infra_profiles)
CREATE TABLE IF NOT EXISTS public.infra_profiles (
  id TEXT PRIMARY KEY, -- 'gratuito', 'pro', 'personalizado'
  name TEXT NOT NULL,
  storage_mb INTEGER NOT NULL,
  db_mb INTEGER NOT NULL,
  transfer_gb_month INTEGER NOT NULL,
  max_upload_size_mb INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Seed dos perfis de infraestrutura
INSERT INTO public.infra_profiles (id, name, storage_mb, db_mb, transfer_gb_month, max_upload_size_mb, is_active)
VALUES
  ('gratuito', 'Plano Gratuito (Supabase Free / Vercel Hobby)', 1024, 500, 5, 5, true),
  ('pro', 'Plano Profissional (Supabase Pro / Vercel Pro)', 102400, 8192, 250, 50, false),
  ('personalizado', 'Infraestrutura Dedicada / Enterprise', 512000, 32768, 1000, 100, false)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  storage_mb = EXCLUDED.storage_mb,
  db_mb = EXCLUDED.db_mb,
  transfer_gb_month = EXCLUDED.transfer_gb_month,
  max_upload_size_mb = EXCLUDED.max_upload_size_mb;

-- 2. Registro Tipado de Configurações do Sistema (system_settings)
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  value_type TEXT NOT NULL CHECK (value_type IN ('number', 'string', 'boolean', 'json')),
  default_value JSONB NOT NULL,
  min_value NUMERIC,
  max_value NUMERIC,
  scope TEXT NOT NULL DEFAULT 'global' CHECK (scope IN ('global', 'plano', 'usuario')),
  description TEXT NOT NULL,
  requires_infra_profile TEXT CHECK (requires_infra_profile IN ('gratuito', 'pro', 'personalizado')),
  requires_legal_review BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- 3. Histórico de Alterações de Configurações (Audit & Rollback)
CREATE TABLE IF NOT EXISTS public.system_setting_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL REFERENCES public.system_settings(key) ON DELETE CASCADE,
  old_value JSONB NOT NULL,
  new_value JSONB NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Interruptores de Funcionalidades (feature_flags)
CREATE TABLE IF NOT EXISTS public.feature_flags (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'desligado' CHECK (state IN ('desligado', 'teste', 'ligado')),
  scope TEXT NOT NULL DEFAULT 'global' CHECK (scope IN ('global', 'plano', 'usuario', 'campanha')),
  description TEXT NOT NULL,
  requires_infra_profile TEXT CHECK (requires_infra_profile IN ('gratuito', 'pro', 'personalizado')),
  requires_legal_review BOOLEAN NOT NULL DEFAULT false,
  legal_approval_id TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- 5. Camada B: Limites Comerciais por Plano (commercial_entitlements)
CREATE TABLE IF NOT EXISTS public.commercial_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_code TEXT NOT NULL, -- 'gratuito', 'pro', 'destaque', etc.
  feature_key TEXT NOT NULL, -- 'max_photos', 'can_have_banner', etc.
  limit_value JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(plan_code, feature_key)
);

-- 6. Sobrescritas Individuais de Limites Comerciais (user_entitlement_overrides)
CREATE TABLE IF NOT EXISTS public.user_entitlement_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  override_value JSONB NOT NULL,
  reason TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed inicial de Configurações
INSERT INTO public.system_settings (key, value, value_type, default_value, min_value, max_value, scope, description, requires_infra_profile, requires_legal_review)
VALUES
  ('max_photos_free_plan', '5'::jsonb, 'number', '5'::jsonb, 1, 20, 'plano', 'Número máximo de fotos para profissionais no plano gratuito', 'gratuito', false),
  ('max_photos_pro_plan', '20'::jsonb, 'number', '20'::jsonb, 5, 100, 'plano', 'Número máximo de fotos para profissionais no plano profissional', 'pro', false),
  ('max_upload_size_mb', '5'::jsonb, 'number', '5'::jsonb, 1, 50, 'global', 'Tamanho máximo permitido por foto de portfólio em MB', 'gratuito', false),
  ('contact_rate_limit_per_hour', '5'::jsonb, 'number', '5'::jsonb, 1, 50, 'usuario', 'Limite de solicitações de contato enviadas por usuário por hora', 'gratuito', false),
  ('review_min_comment_length', '20'::jsonb, 'number', '20'::jsonb, 10, 100, 'global', 'Número mínimo de caracteres para envio de avaliação', 'gratuito', false),
  ('data_retention_contact_days', '90'::jsonb, 'number', '90'::jsonb, 30, 365, 'global', 'Prazo de retenção de mensagens de contato antes do expurgo automático', 'gratuito', true),
  ('data_retention_logs_days', '180'::jsonb, 'number', '180'::jsonb, 180, 730, 'global', 'Prazo de retenção de logs telemáticos (mínimo 180 dias - Marco Civil)', 'gratuito', true)
ON CONFLICT (key) DO NOTHING;

-- Seed inicial de Feature Flags
INSERT INTO public.feature_flags (key, name, state, scope, description, requires_infra_profile, requires_legal_review, legal_approval_id)
VALUES
  ('advanced_ai_search', 'Busca Semântica por IA', 'desligado', 'global', 'Busca vetorial avançada com embeddings de inteligência artificial', 'pro', false, NULL),
  ('on_demand_image_transform', 'Otimização de Imagens sob Demanda', 'desligado', 'global', 'Transformação e redimensionamento em tempo real via edge CDN', 'pro', false, NULL),
  ('automated_review_sentiment', 'Análise Automática de Sentimento', 'desligado', 'global', 'Classificação de risco de avaliações via modelo de linguagem', 'gratuito', true, 'J-004'),
  ('instant_whatsapp_direct', 'Acesso Direto ao WhatsApp sem Login', 'desligado', 'global', 'Revelação de dados de contato sem autenticação prévia (R11)', 'gratuito', true, NULL)
ON CONFLICT (key) DO NOTHING;

-- Ativação de RLS
ALTER TABLE public.infra_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_setting_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commercial_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_entitlement_overrides ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura Pública/Geral
CREATE POLICY "Leitura pública de configurações ativas"
ON public.system_settings FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Leitura pública de flags do sistema"
ON public.feature_flags FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Leitura de infra profiles por usuários autenticados"
ON public.infra_profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Leitura de entitlements por usuários autenticados"
ON public.commercial_entitlements FOR SELECT
TO authenticated
USING (true);
