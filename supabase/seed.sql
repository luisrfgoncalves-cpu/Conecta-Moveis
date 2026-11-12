-- ==============================================================================
-- CONECTA MÓVEIS - SEED DE DESENVOLVIMENTO
-- Usuários de demonstração e dados iniciais para testes locais de RLS
-- ==============================================================================

-- 1. Inserir Categorias e Especialidades Oficiais do MVP
INSERT INTO public.categories (id, name, slug, description, icon) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Montador de Móveis', 'montador-de-moveis', 'Profissionais especializados em montagem e desmontagem de móveis modulados e convencionais.', 'Wrench'),
  ('c2222222-2222-2222-2222-222222222222', 'Marceneiro', 'marceneiro', 'Marcenaria fina, fabricação sob medida e restauração.', 'Sparkles'),
  ('c3333333-3333-3333-3333-333333333333', 'Loja de Planejados', 'loja-de-planejados', 'Lojas e showrooms de mobiliário planejado completo.', 'Box'),
  ('c4444444-4444-4444-4444-444444444444', 'Marcenaria', 'marcenaria', 'Oficinas e fábricas de marcenaria de médio e grande porte.', 'Hammer'),
  ('c5555555-5555-5555-5555-555555555555', 'Projetista', 'projetista', 'Desenvolvimento de projetos 3D, paginação de ambientes e renderização.', 'Ruler'),
  ('c6666666-6666-6666-6666-666666666666', 'Parceiros Complementares', 'parceiros-complementares', 'Instaladores de fitas LED, serralheiros, vidraceiros, medidores e reparadores.', 'Lightbulb')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.specialties (id, category_id, name, slug) VALUES
  ('s1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Móveis Modulados', 'moveis-modulados'),
  ('s2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'Montagem de Guarda-Roupas', 'montagem-guarda-roupas'),
  ('s3333333-3333-3333-3333-333333333333', 'c2222222-2222-2222-2222-222222222222', 'Cozinhas Sob Medida', 'cozinhas-sob-medida'),
  ('s4444444-4444-4444-4444-444444444444', 'c2222222-2222-2222-2222-222222222222', 'Painéis Ripados', 'paineis-ripados'),
  ('s5555555-5555-5555-5555-555555555555', 'c6666666-6666-6666-6666-666666666666', 'LED em Móveis', 'led-em-moveis')
ON CONFLICT (slug) DO NOTHING;

-- 2. Inserir Planos Oficiais do Sistema
INSERT INTO public.plans (id, name, description, max_photos, max_categories, allow_featured, price_cents, is_active) VALUES
  ('free', 'Gratuito', 'Plano de entrada para profissionais autônomos.', 6, 2, false, 0, true),
  ('pro', 'Profissional', 'Para profissionais com portfólio completo.', 15, 5, true, 0, true),
  ('enterprise', 'Loja ou Marcenaria', 'Para empresas, lojas e fábricas moveleiras.', 30, 10, true, 0, true)
ON CONFLICT (id) DO NOTHING;

-- 3. Instrução para o primeiro Admin via SQL Manual:
-- Exemplo:
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('SEU-UUID-DE-USUARIO-AQUI', 'admin')
-- ON CONFLICT (user_id, role) DO UPDATE SET role = 'admin';

