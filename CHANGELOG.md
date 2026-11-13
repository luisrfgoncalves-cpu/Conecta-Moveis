# CHANGELOG — CONECTA MÓVEIS

## [Fase 4] - Autenticação e Conta
- Implementação de fluxos completos de autenticação com Supabase Auth e `@supabase/ssr`: cadastro com consentimento LGPD, login, logout, recuperação e redefinição de senha.
- Criação das páginas públicas de auth: `/criar-conta`, `/entrar`, `/recuperar-senha` (com modo de definição de nova senha) e route handler `/auth/callback`.
- Proteção robusta em duas camadas para `/painel` e `/admin`: via `src/middleware.ts` com validação de token JWT no servidor e guardas de sessão nos layouts de cada rota.
- Layout administrativo em `/admin` com barreira de permissão: usuários comuns recebem 404 estrito (não revela existência da rota).
- Implementação de `/painel/configuracoes` (alteração de e-mail de acesso) e `/painel/seguranca` (alteração de senha, exportação integral dos dados em JSON conforme LGPD e exclusão definitiva de conta com desvinculação em cascata).
- Mascaramento e sanitização de mensagens de erro para impedir vazamento/enumeração de e-mails cadastrados.
- Sistema de proteção contra abuso e força bruta com rate limiting estruturado na tabela `rate_limits` do Postgres sem dependência de serviços externos pagos.
- Formulários implementados com React Hook Form e validação estrita com Zod, acessibilidade WCAG (labels, descrições via `aria-describedby`, alertas semânticos e estados visuais de loading).
- Criação e atualização de `docs/LIMITES_INFRA.md` documentando limites do plano gratuito e marcando a configuração de SMTP dedicado (ex: Resend) como pendência bloqueadora para o lançamento.
- Cobertura com 32 testes unitários no Vitest e suíte E2E Playwright em `e2e/auth.spec.ts`.

## [Fase 3] - Banco de Dados, RLS e Dados de Teste
- Criação da Migration 001 (`20261112000001_initial_schema.sql`) contendo todas as 24 tabelas, enums, constraints, foreign keys explícitas com política de deleção e triggers (`updated_at` e auto-criação de `profile` + `user_roles`).
- Implementação de funções de segurança com `SECURITY DEFINER` e `SET search_path = public`: `is_admin()`, `is_moderator()`, `is_company_member()`.
- Habilitação obrigatória de RLS em 100% das tabelas do schema public.
- Criação da Migration 002 (`20261112000002_storage_buckets.sql`) configurando os buckets `avatars`, `portfolio-pending` (100% privado) e `portfolio-public` (leitura pública, escrita moderada).
- Criação da View pública segura `public_professionals` blindando campos privados (apenas profissionais ativos e publicados).
- Criação do `supabase/seed.sql` com categorias e especialidades oficiais do polo de Jundiaí e planos do catálogo.
- Elaboração completa da documentação técnica: `docs/RLS_MATRIX.md` e `DATABASE_SCHEMA.md` com instrução manual de promoção do primeiro admin.
- Testes automatizados com Vitest (`src/__tests__/rls.test.ts`) cobrindo todas as políticas de segurança e testes negativos obrigatórios.

## [Fase 2] - Fundação Técnica e Casca Visual
- Setup do projeto Next.js 15 (App Router, React 19, TypeScript, Tailwind CSS).
- Configuração de ferramentas de qualidade: ESLint (com FlatConfig), Vitest e Playwright.
- Implementação de validação de variáveis de ambiente com Zod (`src/lib/env.ts`) e cliente Supabase desacoplado (`src/lib/supabase/client.ts`).
- Estruturação dos ativos visuais em `07-ativos-visuais/` (tokens de cores, motion CSS, diretrizes de copy institucional e banner spec).
- Criação dos logos da marca e ícone em SVG vetorial leve em `public/brand/`.
- Criação de imagens SVG otimizadas para hero desktop e mobile, e placeholder explícito para modo de demonstração em `public/images/`.
- Implementação do gerenciador de efeitos sonoros opcionais via Web Audio API (`src/lib/sound.ts`) com 0 KB de rede.
- Construção dos componentes de casca: Header com tema claro/escuro sem flash, gaveta mobile, controle de som, Footer informativo, Hero com overlay escuro à esquerda, SearchBox preliminar desabilitada com aviso, Card de profissional com selo "Exemplo demonstrativo", Alert com aviso legal obrigatório, Skeleton e EmptyState.
- Criação das páginas públicas da casca: `/` (Home com foco em Jundiaí/SP), `/como-funciona`, `/encontrar-profissionais`, `/termos`, `/privacidade`, `/denunciar`, `/not-found` e `/error`.
- Testes E2E com Playwright cobrindo ausência de rolagem horizontal em 320px, 390px, 768px e 1280px, integridade de rotas e carregamento de imagens/logos (zero 404).

## [Fase 1] - Auditoria e Planejamento
- Auditoria do repositório e checagem de ferramentas de ambiente.
- Documentação inicial: `PROJECT_PLAN.md`, `DECISIONS.md`, `TODO.md`, `ARCHITECTURE.md`, `RISKS.md` e `docs/REFERENCIA.md`.
- Registro formal das decisões do proprietário em `DECISIONS.md`.

