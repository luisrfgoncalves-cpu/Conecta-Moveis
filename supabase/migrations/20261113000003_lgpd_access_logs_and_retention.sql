-- ==============================================================================
-- CONECTA MÓVEIS - MIGRATION 005: LGPD OPERACIONAL, LOGS DE ACESSO E RETENÇÃO
-- ==============================================================================

-- 1. Tabela de Solicitações de Titulares de Dados (LGPD Art. 18 / 19)
CREATE TABLE IF NOT EXISTS public.data_subject_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol TEXT UNIQUE NOT NULL, -- DSR-2026-000001
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  request_type TEXT NOT NULL CHECK (request_type IN (
    'confirm_treatment',
    'access_data',
    'correction',
    'portability',
    'revocation_consent',
    'opposition',
    'elimination'
  )),
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'aberto' CHECK (status IN (
    'aberto',
    'em_atendimento',
    'concluido',
    'recusado_justificado'
  )),
  deadline_at TIMESTAMPTZ NOT NULL, -- Prazo legal de 15 dias (LGPD art. 19, II)
  resolution_notes TEXT,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sequência de Protocolo DSR
CREATE SEQUENCE IF NOT EXISTS dsr_protocol_seq START 1;

CREATE OR REPLACE FUNCTION generate_dsr_protocol()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.protocol IS NULL OR NEW.protocol = '' THEN
    NEW.protocol := 'DSR-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('dsr_protocol_seq')::TEXT, 6, '0');
  END IF;
  IF NEW.deadline_at IS NULL THEN
    NEW.deadline_at := NOW() + INTERVAL '15 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_dsr_protocol ON public.data_subject_requests;
CREATE TRIGGER trg_generate_dsr_protocol
BEFORE INSERT ON public.data_subject_requests
FOR EACH ROW
EXECUTE FUNCTION generate_dsr_protocol();

ALTER TABLE public.data_subject_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Titular pode criar solicitacao de dados"
ON public.data_subject_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Titular pode visualizar suas proprias solicitacoes"
ON public.data_subject_requests FOR SELECT
TO authenticated
USING (auth.uid() = user_id);


-- 2. Tabela de Registros de Acesso a Aplicações (Marco Civil da Internet, Art. 15)
-- Guarda estrita de 6 meses; bloqueada contra leitura geral
CREATE TABLE IF NOT EXISTS public.app_access_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT NOT NULL,
  action TEXT NOT NULL, -- 'auth.login', 'auth.signup', 'profile.edit', 'portfolio.upload', 'contact.send', 'review.submit', 'takedown.submit'
  resource_type TEXT,
  resource_id TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  legal_hold BOOLEAN NOT NULL DEFAULT false, -- Trava de preservação judicial (não pode ser expurgado)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON public.app_access_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON public.app_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_legal_hold ON public.app_access_logs(legal_hold) WHERE legal_hold = true;

ALTER TABLE public.app_access_logs ENABLE ROW LEVEL SECURITY;

-- Nenhum SELECT permitido por padrão (nem por anônimo, nem por usuário logado normal)
-- Apenas service_role ou funções administrativas com auditoria acessam essa tabela.


-- 3. Tabela de Auditoria de Acesso aos Logs (Marco Civil / LGPD)
CREATE TABLE IF NOT EXISTS public.app_access_log_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES auth.users(id),
  justification TEXT NOT NULL, -- Motivo formal obrigatório (ex: "Cumprimento de Ofício Judicial nº X / Inquérito nº Y")
  court_order_ref TEXT,
  queried_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rows_examined INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.app_access_log_reads ENABLE ROW LEVEL SECURITY;


-- 4. Função de Expurgo Automático de Retenção Legal
-- - Mensagens de contato: > 90 dias
-- - Logs de acesso à aplicação: > 180 dias (6 meses), exceto legal_hold = true
CREATE OR REPLACE FUNCTION purge_expired_records()
RETURNS JSONB AS $$
DECLARE
  purged_contacts INTEGER := 0;
  purged_logs INTEGER := 0;
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

  RETURN jsonb_build_object(
    'success', true,
    'purged_contacts_90d', purged_contacts,
    'purged_access_logs_180d', purged_logs,
    'executed_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

