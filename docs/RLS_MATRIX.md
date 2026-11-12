# MATRIZ DE PERMISSÕES RLS (Row Level Security) — CONECTA MÓVEIS

Documento oficial de conformidade de segurança e controle de acesso por tabela no PostgreSQL.

| Tabela | Anônimo (Público) | Dono do Registro | Membro de Empresa | Moderador | Administrador |
|---|---|---|---|---|---|
| **profiles** | SELECT (apenas leitura) | UPDATE (apenas próprio) | - | SELECT | ALL |
| **user_roles** | NENHUM | SELECT (apenas próprio) | - | SELECT | ALL (Escrita exclusiva de admin) |
| **companies** | SELECT (se publicado) | ALL (se for owner) | SELECT / UPDATE (se manager/editor) | SELECT / UPDATE | ALL |
| **company_members** | NENHUM | ALL (se for owner da empresa) | SELECT (membros da mesma empresa) | SELECT | ALL |
| **categories** | SELECT | NENHUM | NENHUM | SELECT | ALL |
| **specialties** | SELECT | NENHUM | NENHUM | SELECT | ALL |
| **professional_profiles** | SELECT (se publicado e ativo) | ALL (apenas próprio perfil) | - | SELECT / UPDATE (status moderação) | ALL |
| **profile_specialties** | SELECT | ALL (dono do perfil) | - | SELECT | ALL |
| **service_regions** | SELECT | ALL (dono do perfil) | - | SELECT | ALL |
| **portfolio_items** | SELECT | ALL (dono do perfil) | - | SELECT | ALL |
| **portfolio_images** | SELECT (apenas `approved`) | ALL (próprias imagens) | - | ALL (aprovar/rejeitar/remover) | ALL |
| **contact_requests** | NENHUM | ALL (remetente cria; destinatário lê/marca lido) | - | NENHUM (sigilo total) | ALL (apenas auditoria) |
| **favorites** | NENHUM | ALL (apenas próprios favoritos) | - | NENHUM | ALL |
| **reviews** | SELECT (apenas `approved`) | INSERT (se elegível); UPDATE (apenas resposta do profissional) | - | ALL (moderar fila) | ALL |
| **reports** | INSERT (criar denúncia) | SELECT (apenas as que ele abriu) | - | ALL (gerenciar fila de denúncias) | ALL |
| **plans** | SELECT | NENHUM | NENHUM | SELECT | ALL |
| **subscriptions** | NENHUM | SELECT (apenas própria assinatura) | - | SELECT | ALL |
| **entitlements** | NENHUM | SELECT (apenas próprios limites) | - | SELECT | ALL |
| **plan_interest** | NENHUM | INSERT (registrar próprio interesse) | - | SELECT | ALL |
| **user_consents** | NENHUM | INSERT / SELECT (próprios consentimentos) | - | SELECT | ALL |
| **admin_logs** | NENHUM | NENHUM | NENHUM | NENHUM | ALL (Auditoria imutável) |
| **moderation_events** | NENHUM | NENHUM | NENHUM | ALL | ALL |
| **rate_limits** | NENHUM | NENHUM (gerenciado por função do Postgres) | - | NENHUM | ALL |
| **daily_metrics** | NENHUM | NENHUM | NENHUM | SELECT (agregados) | ALL |

---

### Políticas dos Buckets de Storage

1. **`avatars` (Público):**
   - Leitura: Aberta publicamente.
   - Escrita: Apenas usuário autenticado na sua pasta correspondente `auth.uid()/*`.
2. **`portfolio-pending` (100% Privado):**
   - Leitura: Proibida para anônimos. Permitida apenas ao dono e a moderadores.
   - Escrita: Usuário autenticado na pasta `auth.uid()/*`.
3. **`portfolio-public` (Público para leitura):**
   - Leitura: Aberta publicamente para imagens aprovadas.
   - Escrita: Exclusiva de moderadores ou funções do servidor após aprovação.

