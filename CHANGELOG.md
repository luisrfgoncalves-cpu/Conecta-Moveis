# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).
Versões seguem [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [Unreleased]

### Added
- **Fase 12:** Textos legais (Termos de Uso, Privacidade, Política de Anúncios, Avaliações, Portfólio, Denúncia, Assinatura) com banner de revisão pendente
- Cabeçalhos de segurança HTTP via `next.config` (CSP, X-Frame-Options, HSTS, etc.)
- Metadados SEO e Open Graph para páginas públicas
- Sitemap XML e robots.txt dinâmicos
- Documentação completa: README, SECURITY, DEPLOYMENT, LIMITES_INFRA, CHANGELOG, TODO
- Testes E2E com Playwright (home, busca, acessibilidade, perfil público)
- Portfólio: upload de fotos diretamente no formulário de criação de projeto
- Portfólio: botão de editar projeto existente

---

## [0.1.0] — 2026-11-13

### Added
- **Autenticação** via e-mail/senha e magic link (Supabase Auth)
- **Perfil profissional** com wizard multi-etapas (dados pessoais, especialidades, localização, avatar)
- **Portfólio** com upload de fotos, pipeline de moderação e aprovação por administrador
- **Busca pública** de profissionais com filtros (cidade, especialidade, avaliação mínima)
  - 3 níveis de fallback: view anon → view com service role → tabela direta
- **Sistema de avaliações** com estrelas e texto; denúncia de avaliações inadequadas
- **Sistema de denúncias** de perfis e conteúdo com fila de análise para administradores
- **Planos e assinatura** (modo mockado — integração real de pagamento pendente)
- **Painel administrativo** com moderação de fotos, avaliações e denúncias
- View `public_professionals` com `SECURITY DEFINER` para busca anônima segura
- Migrations SQL: schema inicial, buckets de Storage, correções de segurança em views e RLS
- Configuração de RLS (Row Level Security) em todas as tabelas sensíveis
- Componente `LegalBanner` indicando textos em revisão jurídica
- Configuração `LEGAL_REVIEWED` em `src/lib/legal/config.ts`
- Suite de testes unitários com Vitest (10 arquivos cobrindo auth, RLS, busca, perfil, portfólio, avaliações, moderação, monetização, contato, env)
