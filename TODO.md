# TODO e Pendências — Conecta Móveis

> Última atualização: 14/11/2026 — Homologação da Fase 27

---

## 🔴 Bloqueadores do Lançamento Comercial em Produção

Itens operacionais obrigatórios antes de abrir o cadastro ao público e realizar campanhas de marketing:

- [ ] **Identificação formal do operador em `app_settings`:** Razão social, CNPJ (ou autônomo), e-mails de contato e DPO exibidos no rodapé e em `/contato`.
- [ ] **SMTP Transacional Próprio (Resend):** Configurar no painel do Supabase Auth para envio irrestrito de confirmação de cadastro e recuperação de senha.
- [ ] **Domínio próprio:** `conectamoveis.com.br` apontado na Vercel com certificado SSL ativo.
- [ ] **Atualização de `NEXT_PUBLIC_APP_URL`:** Atualizar para `https://conectamoveis.com.br` nas variáveis da Vercel.
- [ ] **Migração para Vercel Pro ($20/mês):** Apenas no momento em que for ativada cobrança de assinaturas (`BILLING_MODE !== 'off'`). Enquanto gratuito, o Vercel Hobby é 100% suficiente.

---

## 🟢 Concluído e Homologado (Fases 14 a 27)

- [x] **Arquitetura de Isenção Legal:** Eliminação de termos de intermediação e garantia (`check:isencao` aprovado).
- [x] **Canal de Notificação e Retirada:** Protocolos formais em `/denunciar` e fila de curadoria por gravidade no `/admin/curadoria`.
- [x] **LGPD e Governança:** Tabela de registros telemáticos (Marco Civil art. 15), direitos do titular em `/painel/seguranca` e scrubbing de dados pessoais em logs de erro.
- [x] **Fotos de Apresentação:** Compressão WebP, suporte a HEIC, dHash perceptual e rótulo de imagem ilustrativa (CDC art. 37).
- [x] **Busca Inteligente:** FTS nativo no PostgreSQL sem acento e sinônimos.
- [x] **Localização sem Rastreamento:** Municípios do IBGE e cálculo no cliente sem gravar GPS do usuário.
- [x] **Capacidade para 300 Perfis:** Painel `/admin/capacidade` com alertas preditivos a 70% e 90%.
- [x] **Rotina de Backup:** Script agendado no GitHub Actions com segredos no cofre e backup manual no admin.
- [x] **PWA Mínimo:** Instalável em celular via `/manifest.webmanifest`.
- [x] **Dossiê Consolidado:** Documento completo em `docs/DOSSIE_ADVOGADO.md`.

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
