# ESQUEMA DE BANCO DE DADOS (DATABASE_SCHEMA) — CONECTA MÓVEIS

Banco de dados relacional baseado em **PostgreSQL** hospedado no **Supabase**.

## 1. Tabelas Centrais de Usuários e Segurança
- `profiles`: Vinculado a `auth.users(id)`. Armazena dados essenciais (`id`, `full_name`, `email`, `phone`, `avatar_url`).
- `user_roles`: Gerenciamento de privilégios (`user`, `moderator`, `admin`). Usuários comuns não têm permissão de escrita.
- `user_consents`: Registro de aceite dos Termos de Uso e Política de Privacidade para conformidade com a LGPD.

## 2. Tabelas de Atuação e Empresas
- `companies`: Cadastro de lojas, marcenarias e showrooms com `owner_id`, `name`, `cnpj` (opcional e informativo) e `slug`.
- `company_members`: Relacionamento muitos-para-muitos com papéis (`owner`, `manager`, `editor`, `viewer`).
- `professional_profiles`: Atuações individuais de profissionais moveleiros (`display_name`, `slug`, `city`, `state`, `whatsapp`, `phone`, flags de visibilidade e moderação).
- `service_regions`: Cidades, estados e bairros atendidos pelo prestador.

## 3. Catálogo e Especialidades
- `categories`: Categorias oficiais (Montador, Marceneiro, Projetista, Loja, etc.).
- `specialties`: Especialidades filhas vinculadas a cada categoria.
- `profile_specialties`: Ligação N:N entre perfis e especialidades atendidas.

## 4. Portfólio e Moderação de Mídia
- `portfolio_items`: Projetos criados pelo profissional (`title`, `description`, `category_id`).
- `portfolio_images`: Fotos individuais com status (`pending`, `approved`, `rejected`, `removed`), tamanho em bytes e flag `is_demo`.

## 5. Interações, Avaliações e Denúncias
- `contact_requests`: Solicitações curtas enviadas por clientes (até 500 caracteres, retenção de 90 dias com exclusão automática).
- `favorites`: Lista de profissionais favoritados por usuários logados.
- `reviews`: Avaliações baseadas em interação prévia comprovada (`contact_request_id`), com 5 notas de 1 a 5 e resposta do profissional.
- `reports`: Canal unificado de denúncias de perfis, fotos, comentários ou empresas.

## 6. Planos, Entitlements e Métricas
- `plans`: Catálogo de planos (`free`, `pro`, `enterprise`).
- `subscriptions` & `entitlements`: Definição centralizada de cotas (`max_photos`, `max_categories`, `can_feature`).
- `plan_interest`: Registro de intenção de upgrade enquanto cobrança real estiver desativada.
- `admin_logs`: Auditoria de ações administrativas obrigando preenchimento do campo `reason`.
- `daily_metrics`: Contadores agregados por dia para evitar tabelas infladas de eventos.

## 7. Como Promover o Primeiro Administrador
Para conceder o papel de `admin` ao proprietário do sistema, execute este comando SQL no editor SQL do Supabase:
```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('UUID-DO-SEU-USUARIO-AQUI', 'admin')
ON CONFLICT (user_id, role) DO UPDATE SET role = 'admin';
```
*(Substitua `UUID-DO-SEU-USUARIO-AQUI` pelo seu ID de usuário encontrado na aba Authentication do painel Supabase).*

