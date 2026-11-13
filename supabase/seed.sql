-- ==============================================================================
-- CONECTA MÓVEIS - SEED DE DESENVOLVIMENTO
-- Categorias, Especialidades oficiais de Jundiaí e Planos do Sistema
-- Reexecutável do zero
-- ==============================================================================

-- 1. Inserir Categorias Oficiais
INSERT INTO public.categories (id, name, slug, description, icon) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Montador de Móveis', 'montador-de-moveis', 'Profissionais especializados em montagem e desmontagem de móveis modulados e convencionais.', 'Wrench'),
  ('c2222222-2222-2222-2222-222222222222', 'Marceneiro', 'marceneiro', 'Marcenaria fina, fabricação sob medida e restauração.', 'Sparkles'),
  ('c3333333-3333-3333-3333-333333333333', 'Loja de Planejados', 'loja-de-planejados', 'Lojas e showrooms de mobiliário planejado completo.', 'Box'),
  ('c4444444-4444-4444-4444-444444444444', 'Marcenaria', 'marcenaria', 'Oficinas e fábricas de marcenaria de médio e grande porte.', 'Hammer'),
  ('c5555555-5555-5555-5555-555555555555', 'Projetista', 'projetista', 'Desenvolvimento de projetos 3D, paginação de ambientes e renderização.', 'Ruler'),
  ('c6666666-6666-6666-6666-666666666666', 'Parceiros Complementares', 'parceiros-complementares', 'Instaladores de fitas LED, serralheiros, vidraceiros, medidores e reparadores.', 'Lightbulb')
ON CONFLICT (slug) DO NOTHING;

-- 2. Inserir Especialidades Oficiais com UUIDs válidos
INSERT INTO public.specialties (id, category_id, name, slug) VALUES
  -- Montador de Móveis
  ('s1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Móveis Modulados', 'moveis-modulados'),
  ('s2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'Montagem de Guarda-Roupas', 'montagem-guarda-roupas'),
  ('f9daf344-c2f8-42b5-b1b0-a57b20aa2261', 'c1111111-1111-1111-1111-111111111111', 'Cozinhas Planejadas', 'cozinhas-planejadas'),
  ('e348fa49-f521-4007-af18-04508e7a8849', 'c1111111-1111-1111-1111-111111111111', 'Desmontagem e Mudança', 'desmontagem-mudanca'),
  ('269834ba-9fb5-48d5-aed0-ffaa12fff7c3', 'c1111111-1111-1111-1111-111111111111', 'Regulagem de Portas e Gavetas', 'regulagem-portas'),

  -- Marceneiro
  ('s3333333-3333-3333-3333-333333333333', 'c2222222-2222-2222-2222-222222222222', 'Cozinhas Sob Medida', 'cozinhas-sob-medida'),
  ('s4444444-4444-4444-4444-444444444444', 'c2222222-2222-2222-2222-222222222222', 'Painéis Ripados', 'paineis-ripados'),
  ('e360794a-1a41-44d2-8e42-7dcc96423741', 'c2222222-2222-2222-2222-222222222222', 'Closets e Dormitórios', 'closets-dormitorios'),
  ('b041fb35-79ff-4aaa-ae15-3508ea39279e', 'c2222222-2222-2222-2222-222222222222', 'Móveis para Banheiro', 'moveis-banheiro'),
  ('8fb1a1b6-9dd9-4820-9b0b-ab124126791e', 'c2222222-2222-2222-2222-222222222222', 'Restauração de Madeira', 'restauracao-madeira'),

  -- Loja de Planejados
  ('ed119f4d-7c08-471b-b1b5-f77e90423e9a', 'c3333333-3333-3333-3333-333333333333', 'Ambientes Completos', 'ambientes-completos'),
  ('a5b952c7-4c4c-4e25-bfc4-f13a69368655', 'c3333333-3333-3333-3333-333333333333', 'Planejados Residenciais', 'planejados-residenciais'),
  ('5dffa58e-0891-4498-8592-211a3e86e377', 'c3333333-3333-3333-3333-333333333333', 'Planejados Corporativos', 'planejados-corporativos'),

  -- Marcenaria
  ('74021b3d-9d59-4b2f-ac21-aada62e80f88', 'c4444444-4444-4444-4444-444444444444', 'Usinagem CNC', 'usinagem-cnc'),
  ('a93b5a0b-a381-453d-9e92-a9baaa223efe', 'c4444444-4444-4444-4444-444444444444', 'Grandes Lotes e Franquias', 'grandes-lotes'),
  ('1a2c0740-94c5-4811-9dd8-9cf43dd47319', 'c4444444-4444-4444-4444-444444444444', 'Corte e Fita de Borda', 'corte-borda'),

  -- Projetista
  ('0884a175-9ee5-4e01-b72a-dd58a01bb172', 'c5555555-5555-5555-5555-555555555555', 'Projeto 3D / Promob', 'projeto-promob'),
  ('a2b3599b-c9b1-437d-946d-0444d145dd61', 'c5555555-5555-5555-5555-555555555555', 'Renderização Fotorrealista', 'render-fotorrealista'),
  ('f842745b-46c9-4f0a-aebf-60c612e16e6f', 'c5555555-5555-5555-5555-555555555555', 'Planta Técnica de Fabricação', 'planta-tecnica'),

  -- Parceiros Complementares
  ('s5555555-5555-5555-5555-555555555555', 'c6666666-6666-6666-6666-666666666666', 'LED em Móveis', 'led-em-moveis'),
  ('bafcfa28-e3ae-491b-9da0-b6cb373860d0', 'c6666666-6666-6666-6666-666666666666', 'Vidraçaria / Portas de Alumínio', 'vidracaria-portas'),
  ('e8208d57-470e-45e9-9eb2-37bd726315ab', 'c6666666-6666-6666-6666-666666666666', 'Serralheria para Móveis', 'serralheria-moveis'),
  ('72ef8580-097b-411f-874a-b3312c3f2bbc', 'c6666666-6666-6666-6666-666666666666', 'Transporte e Frete Dedicado', 'transporte-moveis')
ON CONFLICT (slug) DO NOTHING;

-- 3. Inserir Planos Oficiais do Sistema
INSERT INTO public.plans (id, name, description, max_photos, max_categories, allow_featured, price_cents, is_active) VALUES
  ('free', 'Gratuito', 'Plano de entrada para profissionais autônomos.', 6, 2, false, 0, true),
  ('pro', 'Profissional', 'Para profissionais com portfólio completo.', 15, 5, true, 0, true),
  ('enterprise', 'Loja ou Marcenaria', 'Para empresas, lojas e fábricas moveleiras.', 30, 10, true, 0, true)
ON CONFLICT (id) DO NOTHING;
