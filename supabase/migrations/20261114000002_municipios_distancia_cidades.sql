-- ==============================================================================
-- CONECTA MÓVEIS - MIGRATION 011: LOCALIZAÇÃO, DISTÂNCIA E MUNICÍPIOS (FASE 23)
-- Dataset oficial IBGE (Dados Abertos Governamentais, Lei 12.527/2011)
-- Fórmula de Haversine pura no Postgres (sem PostGIS, sem serviços externos)
-- ==============================================================================

-- 1. Tabela de Municípios com Códigos Oficiais IBGE e Coordenadas do Centro
CREATE TABLE IF NOT EXISTS public.municipios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ibge_code VARCHAR(7) UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  uf VARCHAR(2) NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- ex: jundiai-sp
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_municipios_uf ON public.municipios(uf);
CREATE INDEX IF NOT EXISTS idx_municipios_slug ON public.municipios(slug);
CREATE INDEX IF NOT EXISTS idx_municipios_ibge ON public.municipios(ibge_code);

-- 2. Seed de Municípios — Polo Regional de Jundiaí e Macrometrópole Paulista
-- Fonte: IBGE - Malha Municipal e Coordenadas Geográficas de Sedes Municipais
-- Licença: Domínio Público / Dados Abertos Governamentais do Brasil (Decreto 8.777/2016)
INSERT INTO public.municipios (ibge_code, nome, uf, slug, latitude, longitude) VALUES
  ('3525904', 'Jundiaí',                  'SP', 'jundiai-sp',                  -23.1857000, -46.8978000),
  ('3556503', 'Várzea Paulista',          'SP', 'varzea-paulista-sp',          -23.2114000, -46.8286000),
  ('3509601', 'Campo Limpo Paulista',     'SP', 'campo-limpo-paulista-sp',     -23.2058000, -46.7869000),
  ('3527306', 'Louveira',                 'SP', 'louveira-sp',                 -23.0864000, -46.9536000),
  ('3556701', 'Vinhedo',                  'SP', 'vinhedo-sp',                  -23.0297000, -46.9747000),
  ('3524006', 'Itupeva',                  'SP', 'itupeva-sp',                  -23.1531000, -47.0578000),
  ('3508405', 'Cabreúva',                 'SP', 'cabreuva-sp',                 -23.3081000, -47.1333000),
  ('3556206', 'Valinhos',                 'SP', 'valinhos-sp',                 -22.9708000, -46.9961000),
  ('3509502', 'Campinas',                 'SP', 'campinas-sp',                 -22.9056000, -47.0608000),
  ('3523909', 'Itu',                      'SP', 'itu-sp',                      -23.2642000, -47.2992000),
  ('3545209', 'Salto',                    'SP', 'salto-sp',                    -23.2008000, -47.2872000),
  ('3520509', 'Indaiatuba',               'SP', 'indaiatuba-sp',               -23.0903000, -47.2181000),
  ('3525102', 'Jarinu',                   'SP', 'jarinu-sp',                   -23.1017000, -46.7289000),
  ('3523404', 'Itatiba',                  'SP', 'itatiba-sp',                  -23.0058000, -46.8406000),
  ('3532009', 'Morungaba',                'SP', 'morungaba-sp',                -22.8814000, -46.7933000),
  ('3509205', 'Cajamar',                  'SP', 'cajamar-sp',                  -23.3556000, -46.8778000),
  ('3516408', 'Franco da Rocha',          'SP', 'franco-da-rocha-sp',          -23.3283000, -46.7269000),
  ('3516309', 'Francisco Morato',         'SP', 'francisco-morato-sp',         -23.2817000, -46.7444000),
  ('3547304', 'Santana de Parnaíba',      'SP', 'santana-de-parnaiba-sp',      -23.4439000, -46.9178000),
  ('3505708', 'Barueri',                  'SP', 'barueri-sp',                  -23.5108000, -46.8761000),
  ('3534401', 'Osasco',                   'SP', 'osasco-sp',                   -23.5325000, -46.7917000),
  ('3550308', 'São Paulo',                'SP', 'sao-paulo-sp',                -23.5505000, -46.6333000),
  ('3552205', 'Sorocaba',                 'SP', 'sorocaba-sp',                 -23.5015000, -47.4526000),
  ('3538709', 'Piracicaba',               'SP', 'piracicaba-sp',               -22.7253000, -47.6492000),
  ('3501608', 'Americana',                'SP', 'americana-sp',                -22.7375000, -47.3331000),
  ('3552403', 'Sumaré',                   'SP', 'sumare-sp',                   -22.8219000, -47.2669000),
  ('3519071', 'Hortolândia',              'SP', 'hortolandia-sp',              -22.8583000, -47.2200000),
  ('3526902', 'Limeira',                  'SP', 'limeira-sp',                  -22.5647000, -47.4017000),
  ('3548500', 'Santos',                   'SP', 'santos-sp',                   -23.9608000, -46.3339000)
ON CONFLICT (ibge_code) DO NOTHING;

-- 3. Adicionar referência de município e raio de atendimento em professional_profiles
ALTER TABLE public.professional_profiles
  ADD COLUMN IF NOT EXISTS municipio_id UUID REFERENCES public.municipios(id),
  ADD COLUMN IF NOT EXISTS service_radius_km INT NOT NULL DEFAULT 30;

CREATE INDEX IF NOT EXISTS idx_prof_municipio ON public.professional_profiles(municipio_id);

-- Associação automática inicial de perfis existentes a partir do campo city
UPDATE public.professional_profiles pp
SET municipio_id = m.id
FROM public.municipios m
WHERE pp.municipio_id IS NULL
  AND unaccent(lower(pp.city)) = unaccent(lower(m.nome))
  AND upper(pp.state) = m.uf;

-- 4. Função SQL de Cálculo de Distância (Fórmula de Haversine em km)
-- R = 6371 km (raio médio esférico terrestre)
-- Sem PostGIS, sem mapas externos, matemática pura em ponto flutuante
CREATE OR REPLACE FUNCTION haversine_distance_km(
  p_lat1 NUMERIC,
  p_lon1 NUMERIC,
  p_lat2 NUMERIC,
  p_lon2 NUMERIC
)
RETURNS NUMERIC AS $$
DECLARE
  v_r NUMERIC := 6371.0;
  v_dlat NUMERIC;
  v_dlon NUMERIC;
  v_a NUMERIC;
  v_c NUMERIC;
BEGIN
  IF p_lat1 IS NULL OR p_lon1 IS NULL OR p_lat2 IS NULL OR p_lon2 IS NULL THEN
    RETURN NULL;
  END IF;

  v_dlat := RADIANS(p_lat2 - p_lat1);
  v_dlon := RADIANS(p_lon2 - p_lon1);
  v_a := POWER(SIN(v_dlat / 2.0), 2) +
         COS(RADIANS(p_lat1)) * COS(RADIANS(p_lat2)) *
         POWER(SIN(v_dlon / 2.0), 2);
  v_c := 2.0 * ASIN(SQRT(v_a));

  RETURN ROUND(v_r * v_c, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 5. Função SQL de Busca por Município e Raio em KM
-- Permite ao visitante filtrar "profissionais até X km de [Município]"
CREATE OR REPLACE FUNCTION search_profiles_by_distance(
  p_origin_ibge   VARCHAR(7),
  p_max_radius_km NUMERIC DEFAULT 50,
  p_category_slug TEXT    DEFAULT NULL,
  p_termo         TEXT    DEFAULT NULL,
  p_ordenacao     TEXT    DEFAULT 'proximidade', -- proximidade|rotativa|recentes
  p_limite        INT     DEFAULT 12,
  p_offset        INT     DEFAULT 0
)
RETURNS TABLE (
  id                  UUID,
  display_name        TEXT,
  slug                TEXT,
  bio                 TEXT,
  city                TEXT,
  state               TEXT,
  municipio_nome      TEXT,
  distance_km         NUMERIC,
  service_radius_km   INT,
  is_featured         BOOLEAN,
  created_at          TIMESTAMPTZ,
  avatar_url          TEXT,
  total_count         BIGINT
) AS $$
DECLARE
  v_orig_lat NUMERIC;
  v_orig_lon NUMERIC;
BEGIN
  -- Obtém as coordenadas centrais do município de origem
  SELECT latitude, longitude INTO v_orig_lat, v_orig_lon
  FROM public.municipios
  WHERE ibge_code = p_origin_ibge;

  IF v_orig_lat IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH calculated AS (
    SELECT
      pp.id,
      pp.display_name,
      pp.slug,
      pp.bio,
      pp.city,
      pp.state,
      m.nome AS municipio_nome,
      haversine_distance_km(v_orig_lat, v_orig_lon, m.latitude, m.longitude) AS distance_km,
      pp.service_radius_km,
      pp.is_featured,
      pp.created_at,
      pp.avatar_url
    FROM public.professional_profiles pp
    JOIN public.municipios m ON m.id = pp.municipio_id
    WHERE pp.is_published = true
      AND pp.is_suspended = false
      -- Filtro de categoria opcional
      AND (
        p_category_slug IS NULL
        OR EXISTS (
          SELECT 1 FROM public.profile_specialties ps
          JOIN public.specialties s ON s.id = ps.specialty_id
          JOIN public.categories c ON c.id = s.category_id
          WHERE ps.profile_id = pp.id AND c.slug = p_category_slug
        )
      )
      -- Filtro de termo opcional
      AND (
        p_termo IS NULL
        OR unaccent(lower(pp.display_name)) ILIKE '%' || unaccent(lower(trim(p_termo))) || '%'
        OR unaccent(lower(COALESCE(pp.bio, ''))) ILIKE '%' || unaccent(lower(trim(p_termo))) || '%'
      )
  ),
  filtered AS (
    SELECT *
    FROM calculated c
    -- Está dentro do raio máximo pedido pelo usuário E dentro do raio que o profissional declara atender
    WHERE c.distance_km <= p_max_radius_km
      AND c.distance_km <= c.service_radius_km
  ),
  counted AS (
    SELECT *, COUNT(*) OVER () AS total_count FROM filtered
  )
  SELECT
    counted.id,
    counted.display_name,
    counted.slug,
    counted.bio,
    counted.city,
    counted.state,
    counted.municipio_nome,
    counted.distance_km,
    counted.service_radius_km,
    counted.is_featured,
    counted.created_at,
    counted.avatar_url,
    counted.total_count
  FROM counted
  ORDER BY
    CASE p_ordenacao
      WHEN 'proximidade' THEN counted.distance_km
      ELSE NULL
    END ASC,
    CASE p_ordenacao
      WHEN 'recentes' THEN EXTRACT(EPOCH FROM counted.created_at)::FLOAT * -1
      ELSE (counted.is_featured::INT * -10.0) + (counted.distance_km * 0.1)
    END ASC,
    counted.id
  LIMIT p_limite
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 6. RLS: leitura de municípios é pública para todos
ALTER TABLE public.municipios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Municipios sao publicos para leitura" ON public.municipios;
CREATE POLICY "Municipios sao publicos para leitura"
ON public.municipios FOR SELECT
TO anon, authenticated
USING (true);
