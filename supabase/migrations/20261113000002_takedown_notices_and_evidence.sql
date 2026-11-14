-- ==============================================================================
-- CONECTA MÓVEIS - MIGRATION 004: NOTIFICAÇÃO E RETIRADA, EVIDÊNCIAS E TERMOS
-- ==============================================================================

-- 1. Tabela de Versionamento de Documentos Legais
CREATE TABLE IF NOT EXISTS public.legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type TEXT NOT NULL, -- 'terms_of_use', 'privacy_policy', 'ad_policy', etc.
  version TEXT NOT NULL,       -- '1.0', '1.1', '2.0'
  title TEXT NOT NULL,
  content_hash TEXT NOT NULL,  -- SHA-256 do texto
  effective_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (document_type, version)
);

ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública de documentos legais vigentes"
ON public.legal_documents FOR SELECT
TO public
USING (true);

-- 2. Tabela de Notificações de Conteúdo (Takedown Notices)
CREATE TABLE IF NOT EXISTS public.takedown_notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol TEXT UNIQUE NOT NULL, -- Ex: NOT-2026-000001
  category TEXT NOT NULL,        -- 'copyright_image', 'trademark', 'defamation', 'privacy', 'fraud', 'illegal_grave', 'other'
  target_url TEXT,
  target_type TEXT NOT NULL,     -- 'profile', 'portfolio_image', 'review', 'company'
  target_id UUID,
  description TEXT NOT NULL,
  notifier_name TEXT NOT NULL,
  notifier_email TEXT NOT NULL,
  good_faith_declaration BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'recebida' CHECK (status IN (
    'recebida',
    'em_analise',
    'atendida',
    'recusada_fundamentada',
    'aguardando_contestacao',
    'restabelecida',
    'encaminhada'
  )),
  decision_reason TEXT,
  decided_by UUID REFERENCES auth.users(id),
  decided_at TIMESTAMPTZ,
  advertiser_notified_at TIMESTAMPTZ,
  advertiser_contest_deadline TIMESTAMPTZ,
  advertiser_contest_text TEXT,
  advertiser_contested_at TIMESTAMPTZ,
  -- Evidência preservada para autoridades judiciais/policiais
  evidence_snapshot JSONB,
  evidence_hash TEXT,
  evidence_stored_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sequência para protocolos legíveis
CREATE SEQUENCE IF NOT EXISTS takedown_protocol_seq START 1;

CREATE OR REPLACE FUNCTION generate_takedown_protocol()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.protocol IS NULL OR NEW.protocol = '' THEN
    NEW.protocol := 'NOT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('takedown_protocol_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_takedown_protocol ON public.takedown_notices;
CREATE TRIGGER trg_generate_takedown_protocol
BEFORE INSERT ON public.takedown_notices
FOR EACH ROW
EXECUTE FUNCTION generate_takedown_protocol();

ALTER TABLE public.takedown_notices ENABLE ROW LEVEL SECURITY;

-- Notificante pode criar notificação (inclusive anônimo ou usuário logado)
CREATE POLICY "Permitir envio de notificação de conteúdo"
ON public.takedown_notices FOR INSERT
TO public
WITH CHECK (good_faith_declaration = true);

-- Apenas o administrador/moderador pode ler todas as notificações
CREATE POLICY "Moderadores leem todas as notificacoes"
ON public.takedown_notices FOR SELECT
TO authenticated
USING (public.is_moderator());

-- Anunciante envolvido pode ler a sua própria notificação quando status permitir contestação
CREATE POLICY "Anunciante pode ver notificacao contra seu conteudo"
ON public.takedown_notices FOR SELECT
TO authenticated
USING (
  target_id IN (
    SELECT id FROM public.professional_profiles WHERE user_id = auth.uid()
  )
);

-- Moderador atualiza status e decisões
CREATE POLICY "Moderador atualiza status de notificacao"
ON public.takedown_notices FOR UPDATE
TO authenticated
USING (public.is_moderator())
WITH CHECK (public.is_moderator());

-- Bucket de Evidências Reservado (100% Privado para Autoridades / Perícia)
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence', 'evidence', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Apenas moderadores e administradores acessam evidence"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'evidence' AND public.is_moderator())
WITH CHECK (bucket_id = 'evidence' AND public.is_moderator());

