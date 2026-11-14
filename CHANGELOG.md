# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).
Versões seguem [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [Unreleased]

---

## [1.0.0-rc1] — 2026-11-14 (Volume 2 Completo — Fases 14 a 27)

### Added
- **Fase 14 a 16:** Auditoria jurídico-técnica completa, eliminação de vocabulário de endosso, criação da página `/funcao-da-plataforma`, modal de saída para WhatsApp (R18), canal público de notificação e retirada `/denunciar` com protocolo e trava de 18+ anos.
- **Fase 17:** LGPD operacional, tabela restrita de logs de acesso telemático do Marco Civil art. 15 (`app_access_logs`), direitos do titular em `/painel/seguranca` e rotina automatizada de expurgo.
- **Fase 18:** Arquitetura de configuração tipada com Zod, feature flags, adaptadores de serviço e simulador de capacidade de infraestrutura.
- **Fase 19:** Núcleo administrativo reforçado com MFA TOTP (AAL2) no Supabase Auth, governança de papéis (owner, admin, moderador, suporte) e logs de auditoria imutáveis.
- **Fase 20:** Sistema de convites com tokens criptográficos em hash, campanhas com degustação temporária, slugs personalizados e cadastro por convite (`signup_mode`).
- **Fase 21:** Fila unificada de curadoria de conformidade por gravidade, revisão prévia de destaques pagos (R6), ação "Ocultar e preservar" para ilícitos graves (R9) e relatórios de isonomia.
- **Fase 22:** Motor de busca inteligente nativo no Postgres (`tsvector`, `unaccent`, `pg_trgm`) com tolerância a erros e tabela de sinônimos administrável.
- **Fase 23:** Georreferenciamento por municípios do IBGE, cálculo de raio por Haversine e "Perto de mim" processado 100% no cliente sem gravar coordenadas de GPS do usuário.
- **Fase 24:** Sistema de fotos de apresentação com compressão WebP cliente, suporte nativo a HEIC, dHash perceptual para detecção de duplicatas e rótulo ostensivo de "Imagem ilustrativa" (CDC art. 37).
- **Fase 25:** Segurança cirúrgica com bloqueio local de e-mails descartáveis, honeypot invisível anti-bot, proteção anti-raspagem e tabela interna de erros com scrubbing de dados pessoais.
- **Fase 26:** Painel de capacidade em `/admin/capacidade`, dimensionamento medido para 300 anunciantes sob custo zero no Supabase Free, rotina semanal de backup via GitHub Actions e PWA mínimo nativo.
- **Fase 27:** Dossiê consolidado do operador (`docs/DOSSIE_ADVOGADO.md`), fechamento da Matriz de Conformidade com 25 regras e homologação final com 257 testes automatizados aprovados.

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
