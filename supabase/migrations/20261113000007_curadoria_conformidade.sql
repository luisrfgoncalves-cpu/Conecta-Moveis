-- ==============================================================================
-- CONECTA MÓVEIS - MIGRATION 009: CURADORIA DE CONFORMIDADE E MODERAÇÃO REFORÇADA (FASE 21)
-- ==============================================================================

-- 1. Colunas de Revisão Prévia de Conteúdo Comercial em profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS pending_paid_review BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS paid_review_status TEXT NOT NULL DEFAULT 'approved' CHECK (paid_review_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS paid_reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS paid_reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS paid_review_notes TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_pending_paid_review ON public.profiles(pending_paid_review) WHERE pending_paid_review = true;

-- 2. Tabela de Biblioteca de Motivos de Decisão de Conformidade
CREATE TABLE IF NOT EXISTS public.compliance_reasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  policy_source TEXT NOT NULL CHECK (policy_source IN ('politica_anuncios', 'politica_portfolio', 'politica_avaliacoes', 'termos_uso', 'regras_denuncia')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  advertiser_message_template TEXT NOT NULL,
  notifier_message_template TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'normal' CHECK (severity IN ('gravissimo', 'alto', 'normal')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inserção de motivos padronizados vinculados às políticas publicadas
INSERT INTO public.compliance_reasons (code, policy_source, title, description, advertiser_message_template, notifier_message_template, severity)
VALUES
  (
    'contato_indevido_midia',
    'politica_portfolio',
    'Contato ou dados comerciais na imagem',
    'A imagem contém telefone, WhatsApp, redes sociais ou preços inseridos diretamente no arquivo visual.',
    'Identificamos dados de contato ou preços na sua imagem. Conforme nossa Política de Portfólio, os contatos devem constar exclusivamente nos campos dedicados do seu perfil para segurança de todos.',
    'A imagem indicada foi removida por conter informações de contato em desconformidade com a Política de Portfólio.',
    'normal'
  ),
  (
    'termo_endosso_proibido',
    'politica_anuncios',
    'Termo de endosso ou promessa de garantia',
    'O conteúdo veicula alegações de "oficial", "garantido pela plataforma" ou similar, violando o CDC e a neutralidade da plataforma.',
    'Seu anúncio contém termos que sugerem endosso oficial ou garantia por parte da Conecta Móveis. Por exigência legal (CDC art. 37) e neutralidade técnica, solicitamos a adequação do texto.',
    'O conteúdo foi suspenso para correção cadastral por conter termos de endosso vedados pelas regras da plataforma.',
    'alto'
  ),
  (
    'foto_terceiro_sem_autoria',
    'politica_portfolio',
    'Imagem sem comprovação de autoria',
    'Foto proveniente de catálogo de terceiros, banco de imagens ou outro marceneiro sem declaração de realização própria.',
    'Recebemos notificação referente à autoria da foto enviada. Nosso canal de portfólio aceita apenas fotos de serviços executados pelo próprio anunciante.',
    'A imagem foi ocultada cautelarmente com base na Política de Portfólio e Lei de Direitos Autorais.',
    'alto'
  ),
  (
    'avaliacao_ofensa_sem_relacao',
    'politica_avaliacoes',
    'Ofensa pessoal ou sem relação moveleira',
    'Comentário contendo ataques de cunho pessoal, calúnia ou sem pertinência com o atendimento moveleiro prestado.',
    'A avaliação recebida foi submetida a moderação por extrapolar os limites do relato factual de atendimento.',
    'Sua avaliação foi recusada por conter expressões de ofensa pessoal em desacordo com as diretrizes da Política de Avaliações.',
    'normal'
  ),
  (
    'crime_ou_fraude_grave',
    'termos_uso',
    'Ilícito grave ou fraude financeira',
    'Tentativa evidente de golpe, estelionato, falsidade ideológica ou ilícito penal.',
    'Sua conta e publicações foram suspensas cautelarmente nos termos da lei e das cláusulas de segurança dos Termos de Uso.',
    'O conteúdo foi imediatamente ocultado e os registros telemáticos foram preservados para encaminhamento às autoridades competentes.',
    'gravissimo'
  )
ON CONFLICT (code) DO NOTHING;

-- 3. Tabela de Logs de Auditoria de Ações de Curadoria
CREATE TABLE IF NOT EXISTS public.compliance_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type TEXT NOT NULL CHECK (item_type IN ('foto', 'denuncia', 'avaliacao', 'perfil_pago', 'destaque')),
  item_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('liberado', 'rejeitado', 'ocultado_preservado', 'solicitado_correcao')),
  reason_code TEXT REFERENCES public.compliance_reasons(code),
  notes TEXT,
  moderator_id UUID NOT NULL REFERENCES auth.users(id),
  target_user_id UUID REFERENCES auth.users(id),
  target_plan_code TEXT NOT NULL DEFAULT 'gratuito',
  evidence_snapshot JSONB,
  evidence_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_logs_created ON public.compliance_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_logs_target_plan ON public.compliance_audit_logs(target_plan_code);

-- 4. Função para Relatório de Igualdade de Tratamento entre Planos (R14 e R20)
CREATE OR REPLACE FUNCTION get_compliance_plan_equality_metrics(
  p_start_date TIMESTAMPTZ DEFAULT (NOW() - INTERVAL '30 days'),
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  plan_code TEXT,
  total_actions BIGINT,
  removals_count BIGINT,
  approvals_count BIGINT,
  removal_rate NUMERIC,
  avg_resolution_hours NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.target_plan_code AS plan_code,
    COUNT(*)::BIGINT AS total_actions,
    COUNT(*) FILTER (WHERE l.action IN ('rejeitado', 'ocultado_preservado'))::BIGINT AS removals_count,
    COUNT(*) FILTER (WHERE l.action = 'liberado')::BIGINT AS approvals_count,
    ROUND(
      (COUNT(*) FILTER (WHERE l.action IN ('rejeitado', 'ocultado_preservado'))::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
      2
    ) AS removal_rate,
    4.5::NUMERIC AS avg_resolution_hours -- Simulado/base para indicador de SLA
  FROM public.compliance_audit_logs l
  WHERE l.created_at BETWEEN p_start_date AND p_end_date
  GROUP BY l.target_plan_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RLS para compliance_reasons e compliance_audit_logs
ALTER TABLE public.compliance_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_audit_logs ENABLE ROW LEVEL SECURITY;

-- Leitura de compliance_reasons para usuários autenticados
DROP POLICY IF EXISTS "Usuários autenticados lêem motivos de conformidade" ON public.compliance_reasons;
CREATE POLICY "Usuários autenticados lêem motivos de conformidade"
ON public.compliance_reasons FOR SELECT
TO authenticated
USING (true);

-- Administradores e moderadores gerenciam compliance_audit_logs
DROP POLICY IF EXISTS "Moderadores registram logs de conformidade" ON public.compliance_audit_logs;
CREATE POLICY "Moderadores registram logs de conformidade"
ON public.compliance_audit_logs FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('owner', 'admin', 'moderator')
  )
);
