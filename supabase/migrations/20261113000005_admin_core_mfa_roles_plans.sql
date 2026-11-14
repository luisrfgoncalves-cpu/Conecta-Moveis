-- ==============================================================================
-- CONECTA MÓVEIS - MIGRATION 007: ADMINISTRAÇÃO COMPLETA: NÚCLEO (FASE 19)
-- ==============================================================================

-- 1. Expansão de Papéis Administrativos no Enum
ALTER TYPE public.system_role_type ADD VALUE IF NOT EXISTS 'owner';
ALTER TYPE public.system_role_type ADD VALUE IF NOT EXISTS 'support';

-- 2. Tabela de Concessão de Planos Manuais
CREATE TABLE IF NOT EXISTS public.manual_plan_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_code TEXT NOT NULL, -- 'gratuito', 'pro', 'destaque'
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ, -- NULL = vitalício enquanto não revogado
  reason TEXT NOT NULL,
  origin TEXT NOT NULL CHECK (origin IN ('manual', 'convite', 'teste', 'pago_futuro')),
  granted_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES auth.users(id),
  revocation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_manual_plans_user_active ON public.manual_plan_grants(user_id, is_active);

-- 3. Imutabilidade Absoluta de admin_logs (Bloqueio contra UPDATE e DELETE)
CREATE OR REPLACE FUNCTION prevent_admin_logs_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Os registros de auditoria administrativa (admin_logs) são estritamente imutáveis. Alterações e exclusões são proibidas por lei.';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_admin_logs_mutation ON public.admin_logs;
CREATE TRIGGER trg_prevent_admin_logs_mutation
BEFORE UPDATE OR DELETE ON public.admin_logs
FOR EACH ROW
EXECUTE FUNCTION prevent_admin_logs_mutation();

-- 4. RLS para manual_plan_grants
ALTER TABLE public.manual_plan_grants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuário visualiza seus próprios planos manuais" ON public.manual_plan_grants;
CREATE POLICY "Usuário visualiza seus próprios planos manuais"
ON public.manual_plan_grants FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

