# Matriz de Conformidade Jurídico-Técnica — Conecta Móveis

**Status permitidos:** `implementado`, `testado`, `pendente de revisão jurídica`, `pendente técnico`.  
*(Aviso: É estritamente proibido marcar "em conformidade" ou "isento").*

| Requisito | Norma | Implementação | Teste | Status | Evidência |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **R1 — Sem Intermediação de Pagamento** | CDC art. 3 / CC art. 593 | Planos de assinatura fixa sem split de serviço | `monetization.test.ts` | `testado` | `src/lib/monetization/actions.ts` |
| **R2 — Sem Preço de Serviços no Banco** | CDC art. 31 / CC art. 722 | Bloqueio regex de valores em formulário de contato | `contact.test.ts`, `isencao.test.ts` | `testado` | `src/lib/contact/schemas.ts` |
| **R3 — Sem Verbos de Contratação** | CDC art. 30 e 36 | Remoção de "contratar" e "garantir"; uso de "solicitar contato" | `isencao.test.ts`, `check:isencao` | `testado` | `src/app/layout.tsx`, `scripts/check-isencao.mjs` |
| **R4 — Sem Endosso ou Parceiros Oficiais** | CDC art. 37 / R4 | Substituição de "parceiro" por "anunciante cadastrado"; selos automáticos com aviso | `isencao.test.ts`, `check:isencao` | `testado` | `src/components/ui/Card.tsx`, `ProfessionalCard.tsx` |
| **R5 — Ordenação Neutra / Destaque Rotulado** | Marco Civil / STF 987 | Ordem rotativa padrão, opções de usuário e rotulagem "Destaque patrocinado" | `isencao.spec.ts` | `testado` | `src/components/search/SearchFilters.tsx`, `/como-ordenamos-os-resultados` |
| **R6 — Revisão Prévia de Conteúdo Pago** | STF Tema 987 | Fila `pending_paid_review` no painel administrativo | Teste de moderação paga | `pendente técnico` | Mapeado para Fase 21 |
| **R7 — Não Reescrita de Conteúdo Alheio** | Marco Civil art. 19 | Moderação apenas oculta, suspende ou rejeita fotos | `admin.test.ts` | `testado` | `src/lib/admin/actions.ts` |
| **R8 — Notificação e Retirada com Protocolo** | Marco Civil art. 19 / STF | Canal formal `/denunciar` com categorias, geração de protocolo NOT-YYYY-XXXXXX e tabela `takedown_notices` | `takedown.test.ts` | `testado` | `src/lib/takedown/actions.ts`, `NotificarConteudoClient.tsx` |
| **R9 — Ocultação Imediata de Ilícito Grave** | ECA art. 241 / CP | Ação "Ocultar e preservar", geração de hash SHA-256 e exportação de pacote de evidência policial em 1 clique | `takedown.test.ts` | `testado` | `src/lib/takedown/actions.ts`, `AdminDenunciasClient.tsx` |
| **R10 — Guarda de Logs de Acesso (6 meses)** | Marco Civil art. 15 | Tabela `app_access_logs` com purge semestral via `purge_expired_records()`, leitura restrita com justificativa auditada em `app_access_log_reads` | `lgpd.test.ts` | `testado` | `src/lib/lgpd/actions.ts`, `supabase/migrations/20261113000003_lgpd_access_logs_and_retention.sql` |
| **R11 — Proteção contra Raspagem de Contato** | LGPD art. 6 e 7 | Contatos (WhatsApp/tel) ocultos para usuários anônimos em `/profissionais/[slug]`; visíveis apenas para autenticados | `lgpd.test.ts`, `profile.test.ts` | `testado` | `src/app/profissionais/[slug]/page.tsx` |
| **R12 — Trava de Maioridade (18+)** | ECA Digital / CC | Checkbox mandatório de 18+ anos no formulário de cadastro e schema Zod | `takedown.test.ts`, `auth.test.ts` | `testado` | `src/lib/auth/schemas.ts`, `SignUpForm.tsx` |
| **R13 — Identificação do Operador (CNPJ)** | Decreto 7.962/2013 | Rodapé, canais de contato e trava de build em produção | `isencao.test.ts`, `check:operator` | `testado` | `src/components/layout/Footer.tsx`, `/contato`, `operator.ts` |
| **R14 — Avaliações Uniformes sem Privilégio** | CDC art. 37 / R14 | Regras idênticas para todos os perfis + disclaimer de opinião do usuário | `reviews.test.ts` | `testado` | `src/components/reviews/ReviewsSection.tsx` |
| **R15 — Ausência de Subordinação** | CLT art. 3º e 442-B | Sem fixação de preço, horário, uniforme ou exclusividade | Análise contratual | `pendente de revisão jurídica` | `docs/JURIDICO_BASE.md` |
| **R16 — Gate de Isenção Permanente** | Governança Técnica | Registro de impacto obrigatório a cada nova funcionalidade | Auditoria manual | `implementado` | `docs/REGISTRO_JURIDICO.md` (J-001 a J-006) |
| **R17 — Responsabilidade "Nos Termos da Lei"** | CDC art. 51, I | Declaração oficial institucional e termos sem promessa de imunidade | Leitura de termos | `pendente de revisão jurídica` | `src/app/funcao-da-plataforma/page.tsx`, `src/app/(legal)/*` |
| **R18 — Aviso Prévio de Redirecionamento WhatsApp** | CDC art. 31 / R18 | Modal de saída com cautelas contratuais antes do `wa.me` por sessão/anunciante | `isencao.spec.ts` | `testado` | `src/components/contact/WhatsAppTracker.tsx` |
| **R19 — Sem Parcerias de Garantia Externa** | CDC art. 7 / R19 | Sem vinculação de seguros, crédito ou garantias terceiras | Verificação de integrações | `implementado` | `src/lib/*` |
| **R20 — Moderação Cega a Mérito ou Gosto** | Marco Civil art. 19 | Moderação estritamente baseada em conformidade objetiva | `admin.test.ts` | `testado` | `src/lib/admin/actions.ts` |
