# PROJECT PLAN — CONECTA MÓVEIS

## 1. Objetivo do Produto
Plataforma brasileira de descoberta, divulgação e conexão entre pessoas, montadores, marceneiros, lojas de planejados, marcenarias, projetistas e parceiros complementares do setor moveleiro.
No MVP, a plataforma NÃO recebe pagamento de serviços, NÃO define preço, NÃO emite orçamento, NÃO agenda execução, NÃO garante qualidade ou resultado e NÃO se apresenta como prestadora de serviços. A negociação e o pagamento ocorrem diretamente entre as partes.

## 2. Arquitetura e Stack
- **Framework Web**: Next.js (App Router), React, TypeScript.
- **Estilização & Tokens**: Tailwind CSS, design tokens estruturados com suporte a temas claro/escuro e prefers-reduced-motion.
- **Backend / BaaS**: Supabase (PostgreSQL, Supabase Auth, Supabase Storage, Row Level Security) via `@supabase/ssr`.
- **Validação e Formulários**: Zod (validação client/server), React Hook Form.
- **Testes**: Vitest (testes unitários e de integração), Playwright (testes E2E e acessibilidade).
- **Processamento de Mídia**: `sharp` no servidor para redimensionamento e conversão WebP; compressão inicial no navegador para economia de banda.

## 3. Rotas da Aplicação
- **Públicas**: `/`, `/como-funciona`, `/encontrar-profissionais`, `/categorias`, `/profissionais/[slug]`, `/empresas/[slug]`, `/para-profissionais`, `/para-lojas-e-marcenarias`, `/planos`, `/entrar`, `/criar-conta`, `/recuperar-senha`, `/termos`, `/privacidade`, `/contato`, `/denunciar`.
- **Autenticadas**: `/painel`, `/painel/perfil`, `/painel/portfolio`, `/painel/solicitacoes`, `/painel/favoritos`, `/painel/avaliacoes`, `/painel/assinatura`, `/painel/configuracoes`, `/painel/seguranca`, `/painel/empresas`.
- **Administrativas**: `/admin`, `/admin/usuarios`, `/admin/perfis`, `/admin/empresas`, `/admin/fotos`, `/admin/denuncias`, `/admin/avaliacoes`, `/admin/categorias`, `/admin/planos`, `/admin/assinaturas`, `/admin/logs`.

## 4. Papéis de Acesso e Permissões
- Papéis de Sistema: `user`, `moderator`, `admin` armazenados na tabela `user_roles` (sem permissão de escrita por usuários comuns).
- Entidades de Atuação: perfis de profissionais (`professional_profiles`) e membros de empresas (`company_members` com papéis `owner`, `manager`, `editor`, `viewer`).
- RLS em 100% das tabelas não públicas e funções `SECURITY DEFINER` com `search_path` fixo.

## 5. Modelo de Banco de Dados Mínimo
- Tabelas: `profiles`, `user_roles`, `professional_profiles`, `companies`, `company_members`, `categories`, `specialties`, `profile_specialties`, `service_regions`, `portfolio_items`, `portfolio_images`, `contact_requests`, `favorites`, `reviews`, `reports`, `plans`, `subscriptions`, `entitlements`, `plan_interest`, `user_consents`, `moderation_events`, `admin_logs`, `rate_limits`, `daily_metrics`.

## 6. Fases de Execução (Fases 2 a 13)

### Fase 2: Fundação técnica e casca visual
- **Entregáveis**: Configuração inicial de Next.js, TypeScript, Tailwind, ESLint, Prettier, Vitest e Playwright; `.env.example`; carregamento de tokens e motion; componentes estruturais (header, rodapé, hero com overlay, galeria, estados vazio/loading/erro); temas claro/escuro sem flash.
- **Critérios de aceite**: Lint, typecheck e build passam; teste Playwright confirma ausência de rolagem horizontal em 320, 390, 768 e 1280px; nenhum link quebrado; contraste AA verificado.

### Fase 3: Banco de dados, RLS e dados de teste
- **Entregáveis**: Migrations versionadas cobrindo todas as tabelas, triggers para `updated_at` e auto-criação de perfil no auth, funções `is_admin`, `is_moderator`, `is_company_member`, buckets do Storage, view pública de profissionais, seed de desenvolvimento.
- **Critérios de aceite**: Migrations rodam em banco limpo; todas as tabelas públicas possuem RLS ativada; testes automatizados de RLS passam (positivos e negativos obrigatórios).

### Fase 4: Autenticação e conta
- **Entregáveis**: Fluxos de login, cadastro, logout, confirmação de e-mail e recuperação via `@supabase/ssr`; proteção via middleware e server actions; rate limit no banco; exclusão e download de dados (LGPD).
- **Critérios de aceite**: Sessão protegida de ponta a ponta; mensagens sem revelar existência de e-mail; testes negativos de acesso não autorizado passando.

### Fase 5: Perfis profissionais e empresas
- **Entregáveis**: Fluxo "completar perfil" em etapas com barra de progresso; gestão de slug único; empresa básica com único owner; upload e recorte de foto/logo de avatar.
- **Critérios de aceite**: Validação client/server com Zod; fotos salvas em WebP até 150 KB; isolamento de edição entre usuários coberto por testes.

### Fase 6: Descoberta, busca e perfil público
- **Entregáveis**: Páginas de listagem e busca `/encontrar-profissionais` e `/categorias` consumindo apenas a view pública; filtros por termo, UF, cidade, categoria e especialidade; páginas `/profissionais/[slug]` e `/empresas/[slug]` com metadados SEO e aviso legal obrigatório.
- **Critérios de aceite**: Perfil não publicado retorna 404; testes de busca e paginação cobrindo ausência de dados privados; layout responsivo verificado.

### Fase 7: Portfólio e upload seguro
- **Entregáveis**: Gestão de portfólio no painel; pipeline de upload seguro (compressão WebP, remoção de EXIF, validação por magic bytes, cota de fotos); salvamento em bucket privado `portfolio-pending`; funções de aprovação/rejeição.
- **Critérios de aceite**: Uploads maliciosos ou acima do limite rejeitados; imagens pendentes inacessíveis publicamente; arquivos removidos do Storage ao deletar.

### Fase 8: Contato, favoritos e denúncias
- **Entregáveis**: Botão de WhatsApp gerando métrica agregada; formulário de solicitação curta (até 500 caracteres, retenção de 90 dias com exclusão automática); sistema de favoritos e compartilhamento; canal unificado de denúncias (`reports`).
- **Critérios de aceite**: Rate limit ativo; isolamento estrito de mensagens entre emissor e receptor; confirmação ao denunciante sem exposição a terceiros.

### Fase 9: Avaliações e moderação de conteúdo
- **Entregáveis**: Avaliações com base em solicitação prévia (regra de 3 dias de intervalo); 5 critérios de nota (1 a 5) + comentário; filtro automático de termos ofensivos jogando para fila de moderação; direito de resposta do profissional.
- **Critérios de aceite**: Autoavaliação e duplicidade bloqueadas no banco; avaliações sem interação prévia rejeitadas; cálculo de média fidedigno.

### Fase 10: Administração
- **Entregáveis**: Painel `/admin` restrito a administradores e moderadores; fila de fotos pendentes, denúncias e avaliações; monitoramento do consumo de banco e storage frente aos limites gratuitos (alerta em 70%); auditoria completa de ações em `admin_logs`.
- **Critérios de aceite**: Testes negativos impedindo escalada de privilégios; ações administrativas exigem motivo obrigatório; layout responsivo e utilizável em mobile.

### Fase 11: Planos e monetização sem cobrança real
- **Entregáveis**: Catálogo `plans`, assinaturas e motor unificado `getEntitlements`; controle por variável `BILLING_MODE` (`off`/`test`); sistema de destaque patrocinado devidamente rotulado; métricas de performance agregadas.
- **Critérios de aceite**: Nenhuma cobrança real simulada; bloqueio de alteração arbitrária de plano pelo cliente; limites de cota aplicados pelo servidor.

### Fase 12: Qualidade, segurança, textos legais e documentação
- **Entregáveis**: Páginas de termos de uso, privacidade, anúncios e política de avaliações em português claro; constante `LEGAL_REVIEWED`; auditoria de acessibilidade via axe; auditoria de segurança (headers CSP, npm audit, ausência de segredos); testes E2E completos dos fluxos.
- **Critérios de aceite**: Zero falhas críticas de acessibilidade no axe; suíte completa verde; documentação de riscos e pendências alinhada.

### Fase 13: Implantação e lançamento controlado
- **Entregáveis**: Separação dos ambientes dev/produção no Supabase; rotina e documentação de backup manual; configuração das variáveis na Vercel com HTTPS e domínio personalizado; checklist de lançamento do Apêndice A.
- **Critérios de aceite**: Aplicação respondendo em produção; RLS confirmada em produção; ausência total de credenciais expostas.

## 7. Riscos e Dependências Externas
- **Dependências Externas**: Provedor de hospedagem (Vercel), BaaS (Supabase), Registro de Domínio (`.com.br`), Provedor SMTP transacional (ex: Resend) para envio de e-mails em escala.
- **Gargalos Conhecidos**: Transferência de dados no Supabase Free (5 GB/mês) e storage (1 GB) - mitigados por otimização WebP e caching agressivo.

