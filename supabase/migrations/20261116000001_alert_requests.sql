-- Migration: Tabela alert_requests para o formulário "Avise-me quando houver profissional" (Bloco 4 / Bloco 8)
-- Permite inserção anônima (apenas e-mail + cidade/categoria + consentimento LGPD)
-- Consulta restrita ao service_role / admin

CREATE TABLE IF NOT EXISTS public.alert_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    cidade VARCHAR(100),
    categoria VARCHAR(100),
    consentimento BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para busca e evitar duplicações desnecessárias
CREATE INDEX IF NOT EXISTS idx_alert_requests_email_cidade ON public.alert_requests(email, cidade);

-- Habilitar RLS
ALTER TABLE public.alert_requests ENABLE ROW LEVEL SECURITY;

-- Política de inserção pública (qualquer visitante pode cadastrar alerta com consentimento)
CREATE POLICY "Permitir inserção pública de alertas com consentimento"
    ON public.alert_requests
    FOR INSERT
    WITH CHECK (consentimento = true AND email IS NOT NULL);

-- Política de leitura restrita a administradores / operadores internos
CREATE POLICY "Leitura restrita a administradores"
    ON public.alert_requests
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );
