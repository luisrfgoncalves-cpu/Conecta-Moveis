# TODO e Pendências — Conecta Móveis

> Última atualização: 2026-11-13

---

## 🔴 Bloqueadores do Lançamento

Itens que **impedem** o lançamento público. Nenhum deploy para produção enquanto estes estiverem abertos.

- [ ] **Revisão jurídica** dos textos legais (`LEGAL_REVIEWED=false` → `true` após advogado aprovar)
- [ ] **Domínio** `conectamoveis.com.br` registrado, configurado na Vercel e SSL ativo
- [ ] **Migration** `20261113000001_fix_view_security_and_rls.sql` aplicada no Supabase de **produção**
- [ ] **Buckets de Storage** criados e policies configuradas em produção (`avatar-uploads`, `portfolio-pending`, `portfolio-public`)
- [ ] **Variáveis de ambiente de produção** configuradas na Vercel (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`, `BILLING_MODE`, `LEGAL_REVIEWED`)
- [ ] `NEXT_PUBLIC_APP_URL` apontando para o domínio de produção (não `localhost`)

---

## 🟡 Alta Prioridade (pós-lançamento v1)

Implementar nas primeiras semanas após o lançamento.

- [ ] **Testes E2E** completos com Playwright (fluxos: cadastro profissional, edição de perfil, busca, contato, avaliação, denúncia)
- [ ] **Auditoria de acessibilidade** (axe) com zero violações críticas em todas as rotas públicas
- [ ] **Integração real de pagamento** (Stripe ou Pagar.me) para planos de visibilidade
- [ ] **E-mails transacionais** (Resend ou SendGrid) para: boas-vindas, confirmação de e-mail, notificação de avaliação, moderação de foto
- [ ] **Sistema de moderação de fotos de portfólio automatizado** (Google Cloud Vision ou AWS Rekognition — atualmente stub `noop`)
- [ ] **Mapa de profissionais** (Google Maps ou Leaflet) na página de busca
- [ ] **Backups automáticos** do banco de dados (requer upgrade para Supabase Pro)
- [ ] Monitorar **limites de infra** (Storage, Bandwidth) conforme descrito em `LIMITES_INFRA.md`

---

## 🟢 Melhorias Futuras

Backlog de médio/longo prazo — sem data definida.

- [ ] **App mobile** (React Native / Expo) para clientes e profissionais
- [ ] **Chat em tempo real** entre cliente e profissional (Supabase Realtime ou WebSockets)
- [ ] **Sistema de orçamentos formais** com PDF e histórico
- [ ] **Agenda e disponibilidade** do profissional com integração de calendário
- [ ] **Programa de Bug Bounty** formal com recompensas
- [ ] **Entitlements dinâmicos por plano** (`MAX_PHOTOS_PER_PROFILE` variável por assinatura — Fase 11 do plano original)
- [ ] **Multi-região** Supabase para menor latência fora de São Paulo
- [ ] **Dashboard de analytics** para profissionais (visualizações de perfil, cliques de contato)
- [ ] **SEO avançado**: rich snippets de avaliações (schema.org `LocalBusiness`)
- [ ] **Internacionalização** (i18n) para outros estados/países
