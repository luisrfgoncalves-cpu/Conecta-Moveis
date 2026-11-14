-- ==============================================================================
-- CONECTA MÓVEIS - MIGRATION 012: FOTOS DE APRESENTAÇÃO E UPLOAD AVANÇADO (FASE 24)
-- Metas: WebP 1280px/400px, dHash perceptual, declaração de autoria,
-- tipo de imagem (trabalho_realizado vs ilustrativa), link externo e limpeza de órfãos.
-- ==============================================================================

-- 1. Novas colunas em portfolio_images
ALTER TABLE public.portfolio_images
  ADD COLUMN IF NOT EXISTS image_type TEXT NOT NULL DEFAULT 'trabalho_realizado'
    CHECK (image_type IN ('trabalho_realizado', 'ilustrativa')),
  ADD COLUMN IF NOT EXISTS dhash TEXT,
  ADD COLUMN IF NOT EXISTS thumbhash_data TEXT,
  ADD COLUMN IF NOT EXISTS authorship_declared BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_portfolio_images_dhash ON public.portfolio_images(dhash);
CREATE INDEX IF NOT EXISTS idx_portfolio_images_type ON public.portfolio_images(image_type);

-- 2. Colunas de Link Externo Validado em professional_profiles
ALTER TABLE public.professional_profiles
  ADD COLUMN IF NOT EXISTS external_link TEXT,
  ADD COLUMN IF NOT EXISTS external_link_label TEXT;

-- 3. Função para detecção de dHash duplicado entre perfis distintos
-- Alerta para análise humana no painel admin, NUNCA remoção ou bloqueio automático
CREATE OR REPLACE FUNCTION check_duplicate_dhash(
  p_dhash TEXT,
  p_exclude_image_id UUID DEFAULT NULL
)
RETURNS TABLE (
  image_id UUID,
  portfolio_item_id UUID,
  profile_id UUID,
  professional_name TEXT,
  image_url TEXT,
  status TEXT
) AS $$
BEGIN
  IF p_dhash IS NULL OR length(p_dhash) < 16 THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    pi.id AS image_id,
    pi.portfolio_item_id,
    pp.id AS profile_id,
    pp.display_name AS professional_name,
    pi.image_url,
    pi.status
  FROM public.portfolio_images pi
  JOIN public.portfolio_items pit ON pit.id = pi.portfolio_item_id
  JOIN public.professional_profiles pp ON pp.id = pit.profile_id
  WHERE pi.dhash = p_dhash
    AND (p_exclude_image_id IS NULL OR pi.id != p_exclude_image_id)
    AND pi.status != 'rejected';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 4. Tabela de Log de Limpeza de Arquivos Órfãos do Storage
CREATE TABLE IF NOT EXISTS public.orphan_cleanup_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  files_scanned INT NOT NULL DEFAULT 0,
  orphans_removed INT NOT NULL DEFAULT 0,
  bytes_freed BIGINT NOT NULL DEFAULT 0,
  executed_by UUID REFERENCES auth.users(id),
  details JSONB
);

ALTER TABLE public.orphan_cleanup_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Apenas moderadores e admins veem log de orfaos" ON public.orphan_cleanup_log;
CREATE POLICY "Apenas moderadores e admins veem log de orfaos"
ON public.orphan_cleanup_log FOR ALL
TO authenticated
USING (public.is_moderator());
