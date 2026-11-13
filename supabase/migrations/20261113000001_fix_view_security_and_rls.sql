-- =============================================================================
-- MIGRATION: Correção da view public_professionals, avatar_url e política RLS
-- Data: 2026-11-13
-- Problema 1: view usa SECURITY INVOKER (padrão) e INNER JOIN profiles → queries anon
--             falham ou retornam vazio se faltar profile ou por causa de RLS base.
-- Problema 2: professional_profiles não tinha coluna avatar_url direta.
-- Problema 3: política RLS em professional_profiles sem parênteses corretos.
-- =============================================================================

-- 1. Adicionar avatar_url diretamente em professional_profiles para redundância e resiliência
ALTER TABLE public.professional_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Recriar a view com SECURITY DEFINER (security_invoker = false) e LEFT JOIN
DROP VIEW IF EXISTS public.public_professionals;

CREATE OR REPLACE VIEW public.public_professionals
WITH (security_invoker = false)
AS
SELECT
  p.id,
  p.display_name,
  p.slug,
  p.bio,
  p.city,
  p.state,
  CASE WHEN p.is_whatsapp_public THEN p.whatsapp ELSE NULL END AS whatsapp,
  CASE WHEN p.is_phone_public    THEN p.phone    ELSE NULL END AS phone,
  p.is_featured,
  p.created_at,
  COALESCE(p.avatar_url, u.avatar_url) AS avatar_url,
  c.name AS company_name,
  c.slug AS company_slug
FROM public.professional_profiles p
LEFT JOIN public.profiles u ON u.id = p.user_id
LEFT JOIN public.companies c ON c.id = p.company_id
WHERE p.is_published = true AND p.is_suspended = false;

-- Garantir que anon e authenticated podem fazer SELECT na view
GRANT SELECT ON public.public_professionals TO anon;
GRANT SELECT ON public.public_professionals TO authenticated;

-- 3. Corrigir política RLS com parênteses corretos em professional_profiles
DROP POLICY IF EXISTS "Leitura pública de perfis publicados" ON public.professional_profiles;

CREATE POLICY "Leitura pública de perfis publicados" ON public.professional_profiles
  FOR SELECT USING (
    (is_published = true AND is_suspended = false)
    OR auth.uid() = user_id
    OR public.is_moderator()
  );

-- 4. Garantir que anon pode ler service_regions e profile_specialties de perfis publicados
DROP POLICY IF EXISTS "Leitura pública de regiões de perfis publicados" ON public.service_regions;
CREATE POLICY "Leitura pública de regiões de perfis publicados" ON public.service_regions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.professional_profiles pp
      WHERE pp.id = profile_id
        AND pp.is_published = true
        AND pp.is_suspended = false
    )
    OR EXISTS (
      SELECT 1 FROM public.professional_profiles pp
      WHERE pp.id = profile_id AND pp.user_id = auth.uid()
    )
    OR public.is_moderator()
  );

DROP POLICY IF EXISTS "Leitura pública de especialidades de perfis publicados" ON public.profile_specialties;
CREATE POLICY "Leitura pública de especialidades de perfis publicados" ON public.profile_specialties
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.professional_profiles pp
      WHERE pp.id = profile_id
        AND pp.is_published = true
        AND pp.is_suspended = false
    )
    OR EXISTS (
      SELECT 1 FROM public.professional_profiles pp
      WHERE pp.id = profile_id AND pp.user_id = auth.uid()
    )
    OR public.is_moderator()
  );
