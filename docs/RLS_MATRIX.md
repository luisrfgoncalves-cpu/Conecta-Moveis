# MATRIZ DE PERMISSÕES RLS (Row Level Security) — CONECTA MÓVEIS

Documento oficial de conformidade de segurança e controle de acesso por tabela no PostgreSQL.

### Hierarquia de Papéis Administrativos:
- **`owner` (Proprietário):** Acesso irrestrito a configurações globais, promoção de papéis, planos manuais e exclusão de contas.
- **`admin` (Administrador):** Gestão operacional, planos manuais, suspensões, categorias e leitura auditada.
- **`moderator` (Moderador):** Gestão de filas operacionais (aprovação de fotos, denúncias, avaliações).
- **`support` (Suporte):** Somente leitura de dados cadastrais e logs básicos para atendimento.

| Tabela | Anônimo (Público) | Dono do Registro | Suporte | Moderador | Administrador | Owner |
|---|---|---|---|---|---|---|
| **profiles** | SELECT (apenas leitura) | UPDATE (apenas próprio) | SELECT | SELECT | ALL | ALL |
| **user_roles** | NENHUM | SELECT (apenas próprio) | SELECT | SELECT | SELECT | ALL (Escrita exclusiva de Owner) |
| **companies** | SELECT (se publicado) | ALL (se for owner) | SELECT | SELECT / UPDATE | ALL | ALL |
| **company_members** | NENHUM | ALL (se for owner da empresa) | SELECT | SELECT | ALL | ALL |
| **categories** | SELECT | NENHUM | SELECT | SELECT | ALL | ALL |
| **specialties** | SELECT | NENHUM | SELECT | SELECT | ALL | ALL |
| **professional_profiles** | SELECT (se publicado e ativo) | ALL (apenas próprio perfil) | SELECT | SELECT / UPDATE (status) | ALL | ALL |
| **portfolio_images** | SELECT (apenas `approved`) | ALL (próprias imagens) | SELECT | ALL (aprovar/rejeitar/remover) | ALL | ALL |
| **contact_requests** | NENHUM | ALL (remetente cria; destinatário lê) | NENHUM | NENHUM | ALL (auditoria) | ALL |
| **reviews** | SELECT (apenas `approved`) | INSERT (se elegível); UPDATE (resposta) | SELECT | ALL (moderar fila) | ALL | ALL |
| **reports / takedowns**| INSERT | SELECT (as que abriu) | SELECT | ALL (gerenciar filas) | ALL | ALL |
| **manual_plan_grants** | NENHUM | SELECT (próprios planos) | SELECT | SELECT | ALL | ALL |
| **infra_profiles** | NENHUM | NENHUM | NENHUM | NENHUM | SELECT | ALL (Exclusivo Owner) |
| **system_settings** | SELECT | NENHUM | SELECT | SELECT | UPDATE | ALL |
| **admin_logs** | NENHUM | NENHUM | SELECT | SELECT | SELECT / INSERT (Imutável) | SELECT / INSERT (Imutável) |
| **app_access_logs** | NENHUM | NENHUM | NENHUM | NENHUM | Leitura com Justificativa | Leitura com Justificativa |

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

