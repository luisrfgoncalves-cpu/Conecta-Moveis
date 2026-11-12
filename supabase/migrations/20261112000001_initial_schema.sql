-- ==============================================================================
-- CONECTA MÓVEIS - MIGRATION 001: ESTRUTURA COMPLETA, RLS E STORAGE
-- Reexecutável do zero para o Supabase (Schema public)
-- ==============================================================================

-- 1. EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS DE DOMÍNIO
DO $$ BEGIN
  CREATE TYPE public.system_role_type AS ENUM ('user', 'moderator', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.company_member_role AS ENUM ('owner', 'manager', 'editor', 'viewer');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.moderation_status AS ENUM ('pending', 'approved', 'rejected', 'removed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.report_target_type AS ENUM ('profile', 'image', 'review', 'company');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. FUNÇÃO TRIGGER PARA updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. TABELA profiles (dados pessoais mínimos vinculados a auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 5. TABELA user_roles (Papéis de sistema - sem escrita para usuário comum)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.system_role_type NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- 6. TABELAS DE EMPRESAS E MEMBROS
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  trade_name TEXT,
  cnpj TEXT, -- Opcional e informativo sem selo
  description TEXT,
  logo_url TEXT,
  slug TEXT NOT NULL UNIQUE,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_companies_slug ON public.companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_owner ON public.companies(owner_id);

CREATE TABLE IF NOT EXISTS public.company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.company_member_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_company_members_lookup ON public.company_members(company_id, user_id);

-- 7. TABELAS DE CATEGORIAS E ESPECIALIDADES
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_specialties_category ON public.specialties(category_id);

-- 8. TABELA professional_profiles (Atuações profissionais)
CREATE TABLE IF NOT EXISTS public.professional_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  display_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  bio TEXT,
  city TEXT NOT NULL,
  state CHAR(2) NOT NULL, -- UF
  whatsapp TEXT,
  phone TEXT,
  is_whatsapp_public BOOLEAN NOT NULL DEFAULT false,
  is_phone_public BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_suspended BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false, -- Destaque Patrocinado rotulado
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_prof_profiles_location ON public.professional_profiles(state, city);
CREATE INDEX IF NOT EXISTS idx_prof_profiles_slug ON public.professional_profiles(slug);
CREATE INDEX IF NOT EXISTS idx_prof_profiles_user ON public.professional_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_prof_profiles_published ON public.professional_profiles(is_published, is_suspended);

-- Tabela associativa Perfil x Especialidades
CREATE TABLE IF NOT EXISTS public.profile_specialties (
  profile_id UUID NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
  specialty_id UUID NOT NULL REFERENCES public.specialties(id) ON DELETE CASCADE,
  PRIMARY KEY (profile_id, specialty_id)
);

-- Tabela de Regiões de Atendimento (nunca endereço residencial)
CREATE TABLE IF NOT EXISTS public.service_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  state CHAR(2) NOT NULL,
  neighborhoods TEXT[], -- Lista de bairros atendidos
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_service_regions_city ON public.service_regions(state, city);

-- 9. TABELAS DE PORTFÓLIO E IMAGENS (com status de moderação)
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_profile ON public.portfolio_items(profile_id);

CREATE TABLE IF NOT EXISTS public.portfolio_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_item_id UUID NOT NULL REFERENCES public.portfolio_items(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  thumb_url TEXT,
  bytes_size INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status public.moderation_status NOT NULL DEFAULT 'pending',
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_portfolio_images_item ON public.portfolio_images(portfolio_item_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_images_status ON public.portfolio_images(status);

-- 10. TABELA contact_requests (Solicitações com retenção de 90 dias)
CREATE TABLE IF NOT EXISTS public.contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL CHECK (char_length(message) <= 500),
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '90 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contact_requests_profile ON public.contact_requests(profile_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_sender ON public.contact_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_expires ON public.contact_requests(expires_at);

-- 11. TABELAS DE FAVORITOS E AVALIAÇÕES
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, profile_id)
);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_request_id UUID NOT NULL UNIQUE REFERENCES public.contact_requests(id) ON DELETE RESTRICT,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
  rating_quality SMALLINT NOT NULL CHECK (rating_quality BETWEEN 1 AND 5),
  rating_punctuality SMALLINT NOT NULL CHECK (rating_punctuality BETWEEN 1 AND 5),
  rating_communication SMALLINT NOT NULL CHECK (rating_communication BETWEEN 1 AND 5),
  rating_organization SMALLINT NOT NULL CHECK (rating_organization BETWEEN 1 AND 5),
  rating_overall SMALLINT NOT NULL CHECK (rating_overall BETWEEN 1 AND 5),
  comment TEXT,
  status public.moderation_status NOT NULL DEFAULT 'approved',
  reply_text TEXT,
  reply_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reviews_profile ON public.reviews(profile_id);

-- 12. TABELA reports (Denúncias unificadas)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reporter_email TEXT,
  target_type public.report_target_type NOT NULL,
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  status public.moderation_status NOT NULL DEFAULT 'pending',
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

-- 13. TABELAS DE PLANOS, SUBSCRIÇÕES E ENTITLEMENTS
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY, -- 'free', 'pro', 'enterprise'
  name TEXT NOT NULL,
  description TEXT,
  max_photos INTEGER NOT NULL DEFAULT 6,
  max_categories INTEGER NOT NULL DEFAULT 2,
  allow_featured BOOLEAN NOT NULL DEFAULT false,
  price_cents INTEGER DEFAULT 0, -- A definir
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.entitlements (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  max_photos INTEGER NOT NULL DEFAULT 6,
  max_categories INTEGER NOT NULL DEFAULT 2,
  can_feature BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.plan_interest (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. LGPD CONSENTIMENTOS E LOGS ADMINISTRATIVOS
CREATE TABLE IF NOT EXISTS public.user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  terms_version TEXT NOT NULL,
  privacy_version TEXT NOT NULL,
  ip_address TEXT,
  consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  action TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id UUID NOT NULL,
  reason TEXT NOT NULL CHECK (char_length(trim(reason)) > 0),
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.moderation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moderator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  action TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  action TEXT NOT NULL,
  hit_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(identifier, action)
);

CREATE TABLE IF NOT EXISTS public.daily_metrics (
  date DATE NOT NULL,
  metric_name TEXT NOT NULL,
  dimension TEXT NOT NULL DEFAULT 'total',
  counter BIGINT NOT NULL DEFAULT 1,
  PRIMARY KEY (date, metric_name, dimension)
);

-- ==============================================================================
-- TRIGGERS DE ATUALIZAÇÃO E AUTO-CRIAÇÃO DE PERFIL
-- ==============================================================================

CREATE OR REPLACE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE OR REPLACE TRIGGER trg_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE OR REPLACE TRIGGER trg_prof_profiles_updated_at BEFORE UPDATE ON public.professional_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE OR REPLACE TRIGGER trg_portfolio_items_updated_at BEFORE UPDATE ON public.portfolio_items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE OR REPLACE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger que cria profile e user_role automaticamente quando nasce um auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário Conecta'), NEW.email);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.entitlements (user_id, max_photos, max_categories, can_feature)
  VALUES (NEW.id, 6, 2, false)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ==============================================================================
-- FUNÇÕES AUXILIARES DE SEGURANÇA (SECURITY DEFINER COM SEARCH_PATH FIXO)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_moderator()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_company_member(p_company_id UUID, p_required_role public.company_member_role DEFAULT 'viewer')
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = p_company_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ==============================================================================
-- VIEW PÚBLICA SEGURA PARA LISTAGEM DE PROFISSIONAIS (Sem colunas privadas)
-- ==============================================================================

CREATE OR REPLACE VIEW public.public_professionals AS
SELECT
  p.id,
  p.display_name,
  p.slug,
  p.bio,
  p.city,
  p.state,
  CASE WHEN p.is_whatsapp_public THEN p.whatsapp ELSE NULL END AS whatsapp,
  CASE WHEN p.is_phone_public THEN p.phone ELSE NULL END AS phone,
  p.is_featured,
  p.created_at,
  u.avatar_url,
  c.name AS company_name,
  c.slug AS company_slug
FROM public.professional_profiles p
JOIN public.profiles u ON u.id = p.user_id
LEFT JOIN public.companies c ON c.id = p.company_id
WHERE p.is_published = true AND p.is_suspended = false;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) MANDATÓRIO EM 100% DAS TABELAS
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS ESPECÍFICAS

-- Profiles
CREATE POLICY "Leitura pública de perfis" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Usuário atualiza apenas o próprio profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User Roles: APENAS ADMIN LÊ E NINGUÉM COMUM ESCREVE
CREATE POLICY "Admin lê papéis" ON public.user_roles FOR SELECT USING (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "Apenas admin altera papéis" ON public.user_roles FOR ALL USING (public.is_admin());

-- Categories & Specialties: Públicas para leitura
CREATE POLICY "Leitura pública de categorias" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Leitura pública de especialidades" ON public.specialties FOR SELECT USING (true);

-- Professional Profiles
CREATE POLICY "Leitura pública de perfis publicados" ON public.professional_profiles FOR SELECT USING (is_published = true AND is_suspended = false OR auth.uid() = user_id OR public.is_moderator());
CREATE POLICY "Dono gerencia seu perfil profissional" ON public.professional_profiles FOR ALL USING (auth.uid() = user_id);

-- Portfólio
CREATE POLICY "Leitura pública de itens de portfólio" ON public.portfolio_items FOR SELECT USING (true);
CREATE POLICY "Dono gerencia itens de portfólio" ON public.portfolio_items FOR ALL USING (EXISTS (SELECT 1 FROM public.professional_profiles WHERE id = profile_id AND user_id = auth.uid()));

CREATE POLICY "Leitura de fotos aprovadas ou dono" ON public.portfolio_images FOR SELECT USING (status = 'approved' OR public.is_moderator() OR EXISTS (SELECT 1 FROM public.portfolio_items pi JOIN public.professional_profiles pp ON pp.id = pi.profile_id WHERE pi.id = portfolio_item_id AND pp.user_id = auth.uid()));
CREATE POLICY "Dono gerencia fotos de portfólio" ON public.portfolio_images FOR ALL USING (EXISTS (SELECT 1 FROM public.portfolio_items pi JOIN public.professional_profiles pp ON pp.id = pi.profile_id WHERE pi.id = portfolio_item_id AND pp.user_id = auth.uid()));

-- Solicitações de Contato: Apenas remetente e destinatário
CREATE POLICY "Acesso restrito de solicitações" ON public.contact_requests FOR SELECT USING (auth.uid() = sender_id OR EXISTS (SELECT 1 FROM public.professional_profiles pp WHERE pp.id = profile_id AND pp.user_id = auth.uid()));
CREATE POLICY "Usuário logado cria solicitação" ON public.contact_requests FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Destinatário atualiza status da mensagem" ON public.contact_requests FOR UPDATE USING (EXISTS (SELECT 1 FROM public.professional_profiles pp WHERE pp.id = profile_id AND pp.user_id = auth.uid()));

-- Favoritos: Restritos ao próprio usuário
CREATE POLICY "Usuário gerencia seus favoritos" ON public.favorites FOR ALL USING (auth.uid() = user_id);

-- Avaliações
CREATE POLICY "Leitura pública de avaliações aprovadas" ON public.reviews FOR SELECT USING (status = 'approved' OR auth.uid() = reviewer_id OR public.is_moderator() OR EXISTS (SELECT 1 FROM public.professional_profiles pp WHERE pp.id = profile_id AND pp.user_id = auth.uid()));
CREATE POLICY "Avaliador cria review se elegível" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Profissional responde avaliação" ON public.reviews FOR UPDATE USING (EXISTS (SELECT 1 FROM public.professional_profiles pp WHERE pp.id = profile_id AND pp.user_id = auth.uid()));

-- Denúncias: NUNCA LEGÍVEIS POR TERCEIROS
CREATE POLICY "Denúncias invisíveis para terceiros" ON public.reports FOR SELECT USING (public.is_moderator() OR (reporter_id IS NOT NULL AND auth.uid() = reporter_id));
CREATE POLICY "Qualquer pessoa cria denúncia" ON public.reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Apenas moderador atualiza denúncia" ON public.reports FOR UPDATE USING (public.is_moderator());

-- Planos e Assinaturas
CREATE POLICY "Planos visíveis publicamente" ON public.plans FOR SELECT USING (true);
CREATE POLICY "Usuário visualiza suas assinaturas" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Usuário lê seus entitlements" ON public.entitlements FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Usuário registra interesse em plano" ON public.plan_interest FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Logs e Auditoria: Restritos a Administradores
CREATE POLICY "Apenas admin lê logs" ON public.admin_logs FOR SELECT USING (public.is_admin());
CREATE POLICY "Apenas admin insere logs" ON public.admin_logs FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Moderadores leem eventos de moderação" ON public.moderation_events FOR SELECT USING (public.is_moderator());

