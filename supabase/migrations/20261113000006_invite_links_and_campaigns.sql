-- ==============================================================================
-- CONECTA MÓVEIS - MIGRATION 008: CONVITES, TESTES E CAMPANHAS (FASE 20)
-- ==============================================================================

-- 1. Tabela de Links de Convite e Campanhas Promocionais
CREATE TABLE IF NOT EXISTS public.invite_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash TEXT UNIQUE NOT NULL,
  token_preview TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('convite', 'teste', 'campanha')),
  plan_code TEXT NOT NULL DEFAULT 'pro',
  trial_days INTEGER NOT NULL DEFAULT 30, -- Totalmente configurável pelo proprietário
  max_uses INTEGER, -- NULL = ilimitado
  uses_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ, -- NULL = sem expiração de data
  campaign_label TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invite_links_hash ON public.invite_links(token_hash);
CREATE INDEX IF NOT EXISTS idx_invite_links_campaign ON public.invite_links(campaign_label);

-- 2. Tabela de Resgates de Convites por Usuário
CREATE TABLE IF NOT EXISTS public.invite_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_id UUID NOT NULL REFERENCES public.invite_links(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(invite_id, user_id) -- 1 resgate por usuário por link
);

-- 3. Registro de Novas Configurações Globais da Fase 20
INSERT INTO public.system_settings (key, value, value_type, default_value, min_value, max_value, scope, description, requires_infra_profile, requires_legal_review)
VALUES
  ('signup_mode', '"somente_convite"'::jsonb, 'string', '"somente_convite"'::jsonb, NULL, NULL, 'global', 'Modo de cadastro de novos usuários: aberto, somente_convite ou fechado', 'gratuito', false),
  ('default_trial_days', '30'::jsonb, 'number', '30'::jsonb, 1, 365, 'global', 'Número padrão de dias de teste concedido em novos convites', 'gratuito', false),
  ('maintenance_mode', 'false'::jsonb, 'boolean', 'false'::jsonb, NULL, NULL, 'global', 'Ativa tela de manutenção temporária do site', 'gratuito', false),
  ('notification_banner_text', '""'::jsonb, 'string', '""'::jsonb, NULL, NULL, 'global', 'Texto de aviso global no topo da plataforma', 'gratuito', false)
ON CONFLICT (key) DO NOTHING;

-- 4. Função para Expiração Diária de Períodos de Teste
CREATE OR REPLACE FUNCTION expire_trial_manual_plans()
RETURNS JSONB AS $$
DECLARE
  expired_count INTEGER := 0;
BEGIN
  -- Desativa planos manuais cujo prazo de validade expirou
  UPDATE public.manual_plan_grants
  SET is_active = false,
      updated_at = NOW(),
      revocation_reason = 'Período de teste / degustação expirado automaticamente.'
  WHERE is_active = true
    AND valid_until IS NOT NULL
    AND valid_until < NOW();

  GET DIAGNOSTICS expired_count = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'expired_plans_count', expired_count,
    'executed_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Função RPC para incremento atômico de usos do convite
CREATE OR REPLACE FUNCTION increment_invite_uses(p_invite_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.invite_links
  SET uses_count = uses_count + 1,
      updated_at = NOW()
  WHERE id = p_invite_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RLS para invite_links e invite_redemptions
ALTER TABLE public.invite_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_redemptions ENABLE ROW LEVEL SECURITY;

-- Administradores gerenciam invite_links
DROP POLICY IF EXISTS "Admins gerenciam invite_links" ON public.invite_links;
CREATE POLICY "Admins gerenciam invite_links"
ON public.invite_links FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('owner', 'admin')
  )
);

-- Usuários comuns não listam todos os convites (apenas funções ou administradores)
DROP POLICY IF EXISTS "Usuário visualiza seus próprios resgates" ON public.invite_redemptions;
CREATE POLICY "Usuário visualiza seus próprios resgates"
ON public.invite_redemptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
