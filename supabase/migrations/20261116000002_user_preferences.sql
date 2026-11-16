-- Migration: Tabela user_preferences para registrar intenção de uso (Bloco 6)
-- Preferência declarada (não é concessão de permissão nem papel de segurança)

CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    intent VARCHAR(50) NOT NULL CHECK (intent IN ('procurar', 'divulgar', 'ambos')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_preference UNIQUE (user_id)
);

-- RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário pode visualizar sua preferência"
    ON public.user_preferences
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Usuário pode inserir/atualizar sua preferência"
    ON public.user_preferences
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
