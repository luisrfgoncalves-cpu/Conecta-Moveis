-- ==============================================================================
-- CONECTA MÓVEIS - MIGRATION 010: BUSCA INTELIGENTE (FASE 22)
-- Postgres nativo: unaccent + pg_trgm + tsvector + sinônimos
-- ==============================================================================

-- 1. Extensões nativas (disponíveis no Supabase Free Tier)
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Configuração de busca full-text em português com suporte a unaccent
-- Cria configuração "portuguese_unaccent" que remove acentos antes de indexar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_ts_config WHERE cfgname = 'portuguese_unaccent'
  ) THEN
    CREATE TEXT SEARCH CONFIGURATION portuguese_unaccent (COPY = portuguese);
    ALTER TEXT SEARCH CONFIGURATION portuguese_unaccent
      ALTER MAPPING FOR hword, hword_part, word
      WITH unaccent, portuguese_stem;
  END IF;
END;
$$;

-- 3. Tabela de sinônimos de busca (editável no admin pelo owner)
CREATE TABLE IF NOT EXISTS public.search_synonyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT NOT NULL UNIQUE,            -- ex: "montador"
  synonyms TEXT[] NOT NULL DEFAULT '{}', -- ex: ARRAY['instalador de móveis', 'instalador']
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sinônimos iniciais do setor moveleiro
INSERT INTO public.search_synonyms (term, synonyms) VALUES
  ('montador',       ARRAY['instalador de móveis', 'instalador', 'montagem de móveis']),
  ('marceneiro',     ARRAY['marcenaria', 'móveis sob medida', 'moveleiro', 'carpinteiro de móveis']),
  ('planejados',     ARRAY['móveis projetados', 'móveis planejados', 'sob medida', 'closet', 'armário planejado']),
  ('marcenaria',     ARRAY['móveis sob medida', 'marceneiro', 'carpintaria de móveis']),
  ('closet',         ARRAY['guarda-roupa', 'armário embutido', 'armário planejado', 'roupeiro']),
  ('cozinha',        ARRAY['armário de cozinha', 'cozinha planejada', 'móveis de cozinha']),
  ('rack',           ARRAY['painel de tv', 'estante de tv', 'home theater', 'painel suspenso']),
  ('estofado',       ARRAY['sofá', 'poltrona', 'reforma de sofá', 'restauração de estofado']),
  ('porta',          ARRAY['porta de madeira', 'porta de correr', 'porta de madeira maciça']),
  ('escritório',     ARRAY['mesa de escritório', 'mobiliário corporativo', 'home office'])
ON CONFLICT (term) DO NOTHING;

-- 4. Tabela de registro anônimo de termos sem resultado (por dia, sem usuário, sem IP)
CREATE TABLE IF NOT EXISTS public.search_no_results_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT NOT NULL,
  search_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 1,
  UNIQUE (term, search_date)
);

CREATE INDEX IF NOT EXISTS idx_search_no_results_date ON public.search_no_results_log(search_date DESC);

-- 5. Coluna tsvector em professional_profiles para FTS
ALTER TABLE public.professional_profiles
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 6. Função que reconstrói o tsvector de um perfil (combinando nome, bio, especialidades, cidades e categorias)
CREATE OR REPLACE FUNCTION build_profile_search_vector(p_profile_id UUID)
RETURNS tsvector AS $$
DECLARE
  v_display_name TEXT;
  v_bio TEXT;
  v_city TEXT;
  v_state TEXT;
  v_specialties TEXT;
  v_categories TEXT;
  v_service_cities TEXT;
BEGIN
  -- Dados básicos do perfil
  SELECT
    COALESCE(display_name, ''),
    COALESCE(bio, ''),
    COALESCE(city, ''),
    COALESCE(state, '')
  INTO v_display_name, v_bio, v_city, v_state
  FROM public.professional_profiles
  WHERE id = p_profile_id;

  -- Especialidades associadas
  SELECT COALESCE(string_agg(s.name, ' '), '')
  INTO v_specialties
  FROM public.profile_specialties ps
  JOIN public.specialties s ON s.id = ps.specialty_id
  WHERE ps.profile_id = p_profile_id;

  -- Categorias associadas
  SELECT COALESCE(string_agg(DISTINCT c.name, ' '), '')
  INTO v_categories
  FROM public.profile_specialties ps
  JOIN public.specialties s ON s.id = ps.specialty_id
  JOIN public.categories c ON c.id = s.category_id
  WHERE ps.profile_id = p_profile_id;

  -- Cidades de atendimento
  SELECT COALESCE(string_agg(DISTINCT sr.city, ' '), '')
  INTO v_service_cities
  FROM public.service_regions sr
  WHERE sr.profile_id = p_profile_id;

  RETURN (
    setweight(to_tsvector('portuguese_unaccent', unaccent(v_display_name)), 'A') ||
    setweight(to_tsvector('portuguese_unaccent', unaccent(v_specialties)), 'A') ||
    setweight(to_tsvector('portuguese_unaccent', unaccent(v_categories)), 'B') ||
    setweight(to_tsvector('portuguese_unaccent', unaccent(v_bio)), 'C') ||
    setweight(to_tsvector('portuguese_unaccent', unaccent(v_city || ' ' || v_state || ' ' || v_service_cities)), 'D')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger para manter o tsvector atualizado automaticamente
CREATE OR REPLACE FUNCTION trg_update_profile_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := build_profile_search_vector(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profile_search_vector ON public.professional_profiles;
CREATE TRIGGER trg_profile_search_vector
BEFORE INSERT OR UPDATE OF display_name, bio, city, state
ON public.professional_profiles
FOR EACH ROW EXECUTE FUNCTION trg_update_profile_search_vector();

-- 8. Reconstrução inicial do tsvector para todos os perfis existentes
UPDATE public.professional_profiles
SET search_vector = build_profile_search_vector(id);

-- 9. Índices GIN para FTS e trigrama (dentro dos limites do Supabase Free Tier)
CREATE INDEX IF NOT EXISTS idx_prof_search_vector ON public.professional_profiles USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_prof_display_name_trgm ON public.professional_profiles USING GIN(display_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_prof_bio_trgm ON public.professional_profiles USING GIN(bio gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_prof_city_trgm ON public.professional_profiles USING GIN(city gin_trgm_ops);

-- 10. Função principal de busca inteligente — sem serviço externo
-- Parâmetros: termo, uf, cidade, categoria, especialidade, ordenação, limite, deslocamento
CREATE OR REPLACE FUNCTION search_profiles(
  p_termo        TEXT DEFAULT NULL,
  p_uf           TEXT DEFAULT NULL,
  p_cidade       TEXT DEFAULT NULL,
  p_categoria    TEXT DEFAULT NULL,
  p_especialidade TEXT DEFAULT NULL,
  p_ordenacao    TEXT DEFAULT 'rotativa',  -- rotativa|recentes|completos|avaliacoes
  p_limite       INT  DEFAULT 12,
  p_offset       INT  DEFAULT 0
)
RETURNS TABLE (
  id              UUID,
  display_name    TEXT,
  slug            TEXT,
  bio             TEXT,
  city            TEXT,
  state           TEXT,
  is_featured     BOOLEAN,
  created_at      TIMESTAMPTZ,
  avatar_url      TEXT,
  plan            TEXT,
  rank            FLOAT4,
  total_count     BIGINT
) AS $$
DECLARE
  v_tsquery       tsquery;
  v_termo_norm    TEXT;
  v_synonym_terms TEXT[] := ARRAY[]::TEXT[];
  v_syn           TEXT;
  v_all_terms     TEXT;
BEGIN
  -- Normaliza o termo: remove acentos, lowercase
  IF p_termo IS NOT NULL AND trim(p_termo) <> '' THEN
    v_termo_norm := lower(unaccent(trim(p_termo)));

    -- Expande sinônimos ativos
    SELECT COALESCE(synonyms, ARRAY[]::TEXT[]) INTO v_synonym_terms
    FROM public.search_synonyms
    WHERE lower(unaccent(term)) = v_termo_norm AND is_active = true
    LIMIT 1;

    -- Monta query FTS combinando termo original + sinônimos com OR
    v_all_terms := v_termo_norm;
    FOREACH v_syn IN ARRAY v_synonym_terms LOOP
      v_all_terms := v_all_terms || ' | ' || lower(unaccent(v_syn));
    END LOOP;

    -- Converte para tsquery (tolerante: prefix matching)
    BEGIN
      v_tsquery := to_tsquery('portuguese_unaccent', replace(v_all_terms, ' | ', ':* | ') || ':*');
    EXCEPTION WHEN OTHERS THEN
      -- Fallback: busca simples por qualquer palavra
      v_tsquery := plainto_tsquery('portuguese_unaccent', unaccent(p_termo));
    END;
  END IF;

  RETURN QUERY
  WITH base AS (
    SELECT
      pp.id,
      pp.display_name,
      pp.slug,
      pp.bio,
      pp.city,
      pp.state,
      pp.is_featured,
      pp.created_at,
      pp.avatar_url,
      COALESCE(pr.plan, 'gratuito') AS plan,
      CASE
        WHEN v_tsquery IS NOT NULL THEN ts_rank_cd(pp.search_vector, v_tsquery)
        ELSE 0.0
      END AS rank,
      -- completude do perfil (para ordenação 'completos')
      (
        CASE WHEN pp.bio IS NOT NULL AND length(pp.bio) > 30 THEN 1 ELSE 0 END +
        CASE WHEN pp.avatar_url IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN pp.whatsapp IS NOT NULL THEN 1 ELSE 0 END
      ) AS completeness
    FROM public.professional_profiles pp
    LEFT JOIN public.profiles pr ON pr.id = pp.user_id
    -- Filtra perfis suspensos ou despublicados (R9 / R20)
    WHERE pp.is_published = true
      AND pp.is_suspended = false
      -- Filtro por UF
      AND (p_uf IS NULL OR pp.state = upper(trim(p_uf)))
      -- Filtro por cidade (tolerante a acento via unaccent)
      AND (
        p_cidade IS NULL
        OR unaccent(lower(pp.city)) ILIKE '%' || unaccent(lower(trim(p_cidade))) || '%'
        OR EXISTS (
          SELECT 1 FROM public.service_regions sr
          WHERE sr.profile_id = pp.id
            AND unaccent(lower(sr.city)) ILIKE '%' || unaccent(lower(trim(p_cidade))) || '%'
        )
      )
      -- Filtro por especialidade
      AND (
        p_especialidade IS NULL
        OR EXISTS (
          SELECT 1 FROM public.profile_specialties ps2
          JOIN public.specialties s2 ON s2.id = ps2.specialty_id
          WHERE ps2.profile_id = pp.id AND s2.slug = p_especialidade
        )
      )
      -- Filtro por categoria
      AND (
        p_categoria IS NULL
        OR EXISTS (
          SELECT 1 FROM public.profile_specialties ps3
          JOIN public.specialties s3 ON s3.id = ps3.specialty_id
          JOIN public.categories c3 ON c3.id = s3.category_id
          WHERE ps3.profile_id = pp.id AND c3.slug = p_categoria
        )
      )
      -- Filtro por termo: FTS (rank > 0) OU trigrama (nome/bio similar)
      AND (
        v_tsquery IS NULL
        OR pp.search_vector @@ v_tsquery
        OR similarity(unaccent(lower(pp.display_name)), v_termo_norm) > 0.2
        OR similarity(unaccent(lower(COALESCE(pp.bio, ''))), v_termo_norm) > 0.15
      )
  ),
  counted AS (
    SELECT *, COUNT(*) OVER () AS total_count FROM base
  )
  SELECT
    counted.id,
    counted.display_name,
    counted.slug,
    counted.bio,
    counted.city,
    counted.state,
    counted.is_featured,
    counted.created_at,
    counted.avatar_url,
    counted.plan,
    counted.rank::FLOAT4,
    counted.total_count
  FROM counted
  ORDER BY
    CASE p_ordenacao
      WHEN 'recentes'    THEN EXTRACT(EPOCH FROM counted.created_at)::FLOAT * -1
      WHEN 'completos'   THEN counted.completeness::FLOAT * -1
      WHEN 'avaliacoes'  THEN counted.rank::FLOAT * -1
      ELSE -- rotativa (padrão): destaque rotativo, depois relevância FTS, depois data
        (counted.is_featured::INT * -10.0) + (counted.rank::FLOAT * -5.0) + (EXTRACT(EPOCH FROM counted.created_at) / 1e10 * -1)
    END,
    counted.id  -- desempate estável por UUID (paginação consistente)
  LIMIT p_limite
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 11. Função de autocomplete de especialidades (rate-limit controlado no servidor; resposta leve)
CREATE OR REPLACE FUNCTION autocomplete_specialties(p_prefix TEXT, p_limit INT DEFAULT 8)
RETURNS TABLE (name TEXT, slug TEXT, category_name TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT s.name, s.slug, c.name AS category_name
  FROM public.specialties s
  JOIN public.categories c ON c.id = s.category_id
  WHERE unaccent(lower(s.name)) ILIKE unaccent(lower(trim(p_prefix))) || '%'
     OR similarity(unaccent(lower(s.name)), unaccent(lower(trim(p_prefix)))) > 0.25
  ORDER BY
    CASE WHEN unaccent(lower(s.name)) ILIKE unaccent(lower(trim(p_prefix))) || '%' THEN 0 ELSE 1 END,
    s.name
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 12. Função de autocomplete de cidades (apenas cidades onde há profissionais publicados)
CREATE OR REPLACE FUNCTION autocomplete_cities(p_prefix TEXT, p_uf TEXT DEFAULT NULL, p_limit INT DEFAULT 8)
RETURNS TABLE (city TEXT, state TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pp.city,
    pp.state,
    COUNT(*) AS count
  FROM public.professional_profiles pp
  WHERE pp.is_published = true
    AND pp.is_suspended = false
    AND (p_uf IS NULL OR pp.state = upper(trim(p_uf)))
    AND unaccent(lower(pp.city)) ILIKE unaccent(lower(trim(p_prefix))) || '%'
  GROUP BY pp.city, pp.state
  ORDER BY count DESC, pp.city
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 13. Função para sugestão "Você quis dizer...?" quando não há resultados
-- Usa trigrama para encontrar termos próximos ao digitado
CREATE OR REPLACE FUNCTION suggest_similar_term(p_termo TEXT)
RETURNS TEXT AS $$
DECLARE
  v_suggestion TEXT;
BEGIN
  -- Tenta encontrar um nome de especialidade parecido
  SELECT s.name INTO v_suggestion
  FROM public.specialties s
  ORDER BY similarity(unaccent(lower(s.name)), unaccent(lower(trim(p_termo)))) DESC
  LIMIT 1;

  -- Só retorna se a similaridade for razoável (> 0.25)
  IF v_suggestion IS NOT NULL AND similarity(unaccent(lower(v_suggestion)), unaccent(lower(trim(p_termo)))) > 0.25 THEN
    RETURN v_suggestion;
  END IF;

  -- Tenta um nome de profissional parecido
  SELECT pp.display_name INTO v_suggestion
  FROM public.professional_profiles pp
  WHERE pp.is_published = true AND pp.is_suspended = false
  ORDER BY similarity(unaccent(lower(pp.display_name)), unaccent(lower(trim(p_termo)))) DESC
  LIMIT 1;

  IF v_suggestion IS NOT NULL AND similarity(unaccent(lower(v_suggestion)), unaccent(lower(trim(p_termo)))) > 0.3 THEN
    RETURN v_suggestion;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 14. Função para registrar termos sem resultado (anônima — sem usuário, sem IP)
CREATE OR REPLACE FUNCTION log_no_result_term(p_termo TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.search_no_results_log (term, search_date, count)
  VALUES (lower(trim(p_termo)), CURRENT_DATE, 1)
  ON CONFLICT (term, search_date)
  DO UPDATE SET count = search_no_results_log.count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. RLS: search_synonyms — somente owner/admin edita; todos autenticados lêem
ALTER TABLE public.search_synonyms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos autenticados leem sinonimos" ON public.search_synonyms;
CREATE POLICY "Todos autenticados leem sinonimos"
ON public.search_synonyms FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Owner e admin gerenciam sinonimos" ON public.search_synonyms;
CREATE POLICY "Owner e admin gerenciam sinonimos"
ON public.search_synonyms FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('owner', 'admin')
  )
);

-- RLS: search_no_results_log — somente owner/admin lê; função SECURITY DEFINER insere
ALTER TABLE public.search_no_results_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner e admin leem log de termos sem resultado" ON public.search_no_results_log;
CREATE POLICY "Owner e admin leem log de termos sem resultado"
ON public.search_no_results_log FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('owner', 'admin')
  )
);

-- 16. Função de ciclo de limpeza / expurgo de logs antigos de busca sem resultado
CREATE OR REPLACE FUNCTION purge_search_no_results_logs(p_retention_days INT DEFAULT 365)
RETURNS INT AS $$
DECLARE
  v_deleted INT;
BEGIN
  DELETE FROM public.search_no_results_log
  WHERE search_date < (CURRENT_DATE - (p_retention_days || ' days')::INTERVAL);
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 17. EXPLAIN simulado com volume de 2.000 perfis
-- (executado no ambiente de dev; resultado registrado em ARCHITECTURE.md)
-- Para reproduzir:
--   EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
--   SELECT * FROM search_profiles('marceneiro', 'SP', 'Jundiaí', NULL, NULL, 'rotativa', 12, 0);

