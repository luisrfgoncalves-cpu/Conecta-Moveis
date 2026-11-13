# TODO — CONECTA MÓVEIS

## Fase 1 — Auditoria e Planejamento
- [x] Inspecionar repositório e ferramentas disponíveis
- [x] Criar `PROJECT_PLAN.md`
- [x] Criar `DECISIONS.md`
- [x] Criar `TODO.md`
- [x] Criar `ARCHITECTURE.md`
- [x] Criar `RISKS.md`
- [x] Garantir existência de `docs/REFERENCIA.md`
- [x] Formular as 12 perguntas de decisões para o proprietário

## Fase 2 — Fundação Técnica e Casca Visual
- [x] Inicializar projeto Next.js com App Router, TypeScript e Tailwind
- [x] Configurar ESLint, Prettier, Vitest e Playwright
- [x] Criar `.env.example` e validação com Zod
- [x] Importar ativos visuais da pasta `07-ativos-visuais`
- [x] Implementar design tokens e animações com suporte a prefers-reduced-motion
- [x] Criar componentes de layout e páginas base (Hero, Busca preliminar, 404, Erro)
- [x] Validar responsividade (320, 390, 768 e 1280px) e ausência de rolagem horizontal

## Fase 3 — Banco de Dados, RLS e Dados de Teste
- [x] Criar migrations com todas as tabelas e constraints
- [x] Configurar funções auxiliares de segurança com `SECURITY DEFINER`
- [x] Habilitar RLS em 100% das tabelas não públicas
- [x] Configurar buckets do Supabase Storage e políticas de acesso
- [x] Criar view pública para listagem de profissionais
- [x] Criar seed de desenvolvimento e documentar RLS em `docs/RLS_MATRIX.md`
- [x] Executar testes automatizados de permissão (positivos e negativos)

## Fase 4 — Autenticação e Conta
- [x] Implementar cadastro, login, logout e recuperação de senha
- [x] Proteger rotas via middleware e server actions
- [x] Implementar gestão de conta (alteração de credenciais, exclusão e exportação de dados)
- [x] Aplicar rate limit em autenticação e mascaramento de erros

## Fase 5 — Perfis Profissionais e Empresas
- [x] Implementar fluxo de preenchimento de perfil com barra de progresso
- [x] Implementar criação e edição de empresas
- [x] Implementar upload e processamento de avatar/logo (WebP até 150 KB)
- [x] Testes de isolamento de perfil e integridade de slug

## Fase 6 — Descoberta, Busca e Perfil Público
- [ ] Implementar catálogo de categorias e especialidades
- [ ] Criar `/encontrar-profissionais` e `/categorias` com filtros funcionais
- [ ] Implementar páginas públicas `/profissionais/[slug]` e `/empresas/[slug]`
- [ ] Inserir aviso legal obrigatório e selos permitidos

## Fase 7 — Portfólio e Upload Seguro
- [ ] Criar área de portfólio no painel
- [ ] Pipeline seguro de upload com validação por magic bytes e conversão WebP via Sharp
- [ ] Lógica de status de aprovação (`pending` -> `approved`)
- [ ] Validação de cota de armazenamento e imagens

## Fase 8 — Contato, Favoritos e Denúncias
- [ ] Botão de WhatsApp com contador agregado em `daily_metrics`
- [ ] Formulário de solicitação de contato com descarte após 90 dias
- [ ] Sistema de favoritos e canal de denúncias unificado

## Fase 9 — Avaliações e Moderação
- [ ] Regras de elegibilidade (contato prévio + carência de 3 dias)
- [ ] Avaliação por 5 critérios + filtro de moderação de termos ofensivos
- [ ] Direito de resposta do profissional

## Fase 10 — Administração
- [ ] Painel `/admin` com controle por papel (`moderator` vs `admin`)
- [ ] Filas de fotos pendentes, denúncias e moderação de avaliações
- [ ] Métricas de uso de banco/storage com alerta de 70% do plano gratuito
- [ ] Auditoria completa em `admin_logs`

## Fase 11 — Planos e Monetização sem Cobrança Real
- [ ] Catálogo de planos com controle via `BILLING_MODE` (`off`/`test`)
- [ ] Unificação de limites via `getEntitlements`
- [ ] Sistema de destaques patrocinados rotulados

## Fase 12 — Qualidade, Segurança, Textos Legais e Documentação
- [ ] Textos legais completos (Termos, Privacidade, Diretrizes) com constante `LEGAL_REVIEWED`
- [ ] Auditoria de acessibilidade via axe (zero violações críticas)
- [ ] Headers de segurança (CSP) e varredura contra segredos
- [ ] Cobertura de testes E2E dos fluxos principais

## Fase 13 — Implantação e Lançamento Controlado
- [ ] Configuração do Supabase de Produção
- [ ] Deploy na Vercel com domínio customizado e HTTPS
- [ ] Documentação de backup manual e checklist do Apêndice A

