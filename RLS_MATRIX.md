# Matriz de Row Level Security (RLS) — Conecta Móveis
*Última atualização: Fase 10 — Administração e Moderação*

Esta matriz documenta o isolamento de dados, papéis e permissões de acesso em 100% das tabelas do Supabase.

---

## 1. Visão Geral de Papéis (Roles)

| Papel | Descrição | Nível de Acesso |
|---|---|---|
| **Anon (Público)** | Visitante sem login | Leitura exclusiva de dados marcados como públicos |
| **User (Autenticado)** | Cliente / Prestador logado | Leitura e escrita apenas nos próprios registros |
| **Moderator** | Moderador da plataforma | Acesso a filas de moderação (`portfolio_images`, `reports`, `reviews`) |
| **Admin** | Administrador do sistema | Acesso total a todas as tabelas e logs de auditoria |

---

## 2. Matriz Tabela x Operação x Papel

| Tabela | SELECT | INSERT | UPDATE | DELETE | Regra RLS / Detalhe de Segurança |
|---|---|---|---|---|---|
| `profiles` | Público | Trigger | Próprio usuário | Bloqueado | Senhas e credenciais nunca ficam nesta tabela. |
| `user_roles` | Admin / Próprio | Bloqueado | Bloqueado | Bloqueado | Nenhum usuário comum pode promover seu próprio papel. |
| `companies` | Público (publicadas) | Dono | Dono / Admin | Bloqueado | `is_published = true` para visitantes. |
| `company_members` | Membros da empresa | Dono / Manager | Dono / Manager | Dono / Manager | Isolamento por `company_id`. |
| `categories` | Público | Admin | Admin | Admin | Catálogo oficial imutável por usuários comuns. |
| `specialties` | Público | Admin | Admin | Admin | Catálogo oficial indexado por categoria. |
| `professional_profiles` | Público (publicados e não suspensos) | Próprio | Próprio / Admin | Admin | Perfis suspensos (`is_suspended = true`) somem da busca pública. |
| `profile_specialties` | Público | Dono do perfil | Dono do perfil | Dono do perfil | Associação N:N. |
| `service_regions` | Público | Dono do perfil | Dono do perfil | Dono do perfil | Cidade e UF atendidas (nunca endereço residencial). |
| `portfolio_items` | Público | Dono do perfil | Dono do perfil | Dono do perfil | Título e descrição do projeto. |
| `portfolio_images` | Público (apenas `approved`) / Dono / Moderador | Dono do perfil | Moderador / Dono | Dono / Moderador | Fotos pendentes (`pending`) nunca abrem para público anônimo. |
| `contact_requests` | Remetente e Destinatário | Usuário logado | Destinatário | Admin (pg_cron) | Retenção máxima de 90 dias com purga automática. |
| `favorites` | Próprio usuário | Próprio usuário | Bloqueado | Próprio usuário | Acesso estrito por `auth.uid() = user_id`. |
| `reviews` | Público (apenas `approved`) / Dono / Moderador | Cliente elegível | Profissional (resposta) | Moderador | Termos de risco ficam retidos como `pending`. |
| `reports` | Moderador / Próprio relator | Qualquer pessoa | Moderador | Bloqueado | **Denúncias nunca ficam visíveis para terceiros.** |
| `plans` | Público | Admin | Admin | Admin | Modo leitura no painel administrativo até Fase 11. |
| `subscriptions` | Próprio usuário / Admin | Sistema | Sistema | Bloqueado | Assinaturas e status de cobrança. |
| `entitlements` | Próprio usuário / Admin | Sistema | Admin | Bloqueado | Cotas provisionadas por usuário. |
| `admin_logs` | Admin | Admin | Bloqueado | Bloqueado | **Log imutável**: toda ação administrativa exige justificativa. |
| `moderation_events` | Moderador / Admin | Moderador / Sistema | Bloqueado | Bloqueado | Auditoria de termos de risco e respostas. |
| `daily_metrics` | Admin | Sistema (RPC) | Sistema (RPC) | Bloqueado | Métricas agregadas (ex: cliques de WhatsApp). |

---

## 3. Garantias de Proteção e Testes Negativos

1. **Tentativa de Elevação de Privilégio:** `user_roles` tem política de escrita bloqueada (`is_admin()` requerido). Requisições manipuladas falham no banco de dados.
2. **Isolamento de Denúncias:** Usuários comuns não conseguem listar a tabela `reports`.
3. **Suspensão de Perfis:** Perfis suspensos têm a flag `is_suspended = true` e a view pública `public_professionals` filtra `WHERE is_suspended = false`.
4. **Armazenamento de Senhas e Tokens:** Administradores nunca têm acesso a hashes de senha ou tokens (gerenciados pelo Supabase Auth `auth.users`).

