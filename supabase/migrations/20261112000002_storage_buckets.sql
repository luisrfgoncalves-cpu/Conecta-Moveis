-- ==============================================================================
-- CONECTA MÓVEIS - MIGRATION 002: BUCKETS DO STORAGE E POLÍTICAS DE ACESSO
-- ==============================================================================

-- Criar os 3 buckets mandatários
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('portfolio-pending', 'portfolio-pending', false),
  ('portfolio-public', 'portfolio-public', true)
ON CONFLICT (id) DO NOTHING;

-- Habilitar RLS em storage.objects se ainda não estiver
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 1. Políticas para o Bucket avatars (público para leitura, upload apenas do próprio dono)
CREATE POLICY "Leitura pública de avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Usuário autenticado envia avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 2. Políticas para portfolio-pending (100% PRIVADO: anônimo não lê, apenas dono e moderador)
CREATE POLICY "Acesso a portfolio-pending restrito"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'portfolio-pending' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_moderator()));

CREATE POLICY "Upload para portfolio-pending"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'portfolio-pending' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 3. Políticas para portfolio-public (Leitura pública, escrita apenas via moderação/função de aprovação)
CREATE POLICY "Leitura pública de portfolio aprovado"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-public');

CREATE POLICY "Apenas moderador move para portfolio-public"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'portfolio-public' AND public.is_moderator());

