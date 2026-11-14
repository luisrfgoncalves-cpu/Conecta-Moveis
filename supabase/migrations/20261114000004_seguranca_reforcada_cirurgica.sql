-- ==============================================================================
-- CONECTA MÓVEIS - MIGRATION: FASE 25 (SEGURANÇA REFORÇADA CIRÚRGICA)
-- Monitoramento interno de erros sem subprocessador externo + retenção de 30 dias
-- ==============================================================================

-- 1. Tabela Interna de Logs de Erros de Aplicação (com dados pessoais anonimizados)
CREATE TABLE IF NOT EXISTS public.app_error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_message TEXT NOT NULL,
  error_stack TEXT,
  path VARCHAR(255),
  context TEXT,
  severity VARCHAR(20) NOT NULL DEFAULT 'error',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ativar RLS
ALTER TABLE public.app_error_logs ENABLE ROW LEVEL SECURITY;

-- Política de RLS: Apenas service_role e Administradores autenticados podem visualizar
CREATE POLICY "Admins e Service Role podem visualizar logs de erros"
  ON public.app_error_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('owner', 'admin')
    )
  );

-- Service role pode inserir via backend
CREATE POLICY "Service Role pode inserir logs de erros"
  ON public.app_error_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 2. Atualizar rotina de expurgo para incluir retenção de 30 dias para erros técnicos
CREATE OR REPLACE FUNCTION purge_expired_records()
RETURNS JSONB AS $$
DECLARE
  purged_contacts INTEGER := 0;
  purged_logs INTEGER := 0;
  purged_errors INTEGER := 0;
BEGIN
  -- 1. Expurgo de solicitações de contato (> 90 dias)
  DELETE FROM public.contact_requests
  WHERE created_at < NOW() - INTERVAL '90 days';
  GET DIAGNOSTICS purged_contacts = ROW_COUNT;

  -- 2. Expurgo de registros de acesso telemático (> 180 dias / 6 meses)
  -- Respeita rigorosamente a trava legal_hold
  DELETE FROM public.app_access_logs
  WHERE created_at < NOW() - INTERVAL '180 days'
    AND legal_hold = false;
  GET DIAGNOSTICS purged_logs = ROW_COUNT;

  -- 3. Expurgo de logs de erro do sistema (> 30 dias)
  DELETE FROM public.app_error_logs
  WHERE created_at < NOW() - INTERVAL '30 days';
  GET DIAGNOSTICS purged_errors = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'purged_contacts_90d', purged_contacts,
    'purged_access_logs_180d', purged_logs,
    'purged_error_logs_30d', purged_errors,
    'executed_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

