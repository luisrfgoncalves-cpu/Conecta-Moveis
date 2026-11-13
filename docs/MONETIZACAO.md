# DOCUMENTO DE MONETIZAÇÃO E TRANSIÇÃO COMERCIAL (MONETIZACAO.md) — CONECTA MÓVEIS

Este documento registra a estratégia e os pontos de integração futura para monetização da plataforma Conecta Móveis, sem que nenhuma cobrança ou integração prematura seja antecipada antes das validações de negócio, requisitos jurídicos e limites de infraestrutura.

---

## 1. Princípio Fundamental de Operação (MVP)
1. **Nenhuma intermediação financeira de serviços**: A plataforma **NÃO** cobra comissões sobre orçamentos, contratos ou serviços fechados entre contratantes e prestadores (montadores, marceneiros, projetistas, lojas). A negociação, agendamento e pagamento de serviços ocorrem 100% diretamente entre as partes.
2. **Monetização Exclusiva de Software (SaaS / Assinatura de Visibilidade)**: A receita futura virá unicamente da cobrança de assinaturas mensais ou anuais para planos profissionais de visibilidade na plataforma (mais fotos no portfólio, mais categorias e destaque patrocinado).
3. **Modo `BILLING_MODE`**:
   - `off` (Produção padrão do MVP): Ninguém é cobrado, ninguém altera plano sozinho no banco e os usuários registram intenção em `public.plan_interest`. Preços são apresentados como "A definir / Sob consulta".
   - `test` (Modo Homologação/Demonstração): Exibe selo visível `"Modo de teste: nenhuma cobrança"` e permite simulação de troca de plano e teste de limites.

---

## 2. Catálogo Oficial de Planos e Entitlements

| Plano | ID | Fotos no Portfólio | Categorias | Destaque Patrocinado | Estatísticas de Perfil | Preço Inicial Previsto |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Gratuito** | `free` | 6 fotos | 2 categorias | Não | Não | R$ 0,00 |
| **Profissional** | `pro` | 15 fotos | 5 categorias | Sim (rotulado) | Sim (visitas e WhatsApp) | A definir |
| **Loja ou Marcenaria** | `enterprise` | 30 fotos | 10 categorias | Sim (rotulado) | Sim (avançadas) | A definir |

---

## 3. Gatilhos Obrigatórios para Ativação de Cobrança Real

Antes de alterar `BILLING_MODE=on` ou aceitar o primeiro centavo de qualquer usuário, os seguintes pré-requisitos são **bloqueadores**:

1. **Hospedagem Comercial (Vercel)**:
   - A conta Vercel Hobby é estritamente para uso pessoal/não-comercial. Antes de vender assinaturas, migrar o projeto para um plano compatível com exploração comercial (Vercel Pro ou VPS própria).
2. **Revisão Jurídica dos Textos (`LEGAL_REVIEWED=true`)**:
   - Política de Assinatura, Cancelamento e Reembolso em conformidade com o Código de Defesa do Consumidor (art. 49 - direito de arrependimento de 7 dias para compras digitais).
   - Termos de Uso com emissão de nota fiscal de serviços (NFS-e de software).
3. **Provedor de E-mail Transacional Dedicado (SMTP Próprio)**:
   - Supabase Auth com SMTP próprio configurado (ex: Resend) para envio de comprovantes e alertas de renovação.
4. **Backup Gerenciado**:
   - Rotina automatizada de dump do PostgreSQL e espelhamento de dados.

---

## 4. Arquitetura de Integração com Gateway Futuro

Recomendação técnica: Gateway com forte presença no mercado nacional (ex: **Asaas**, **Stripe Brasil** ou **Mercado Pago**).

### 4.1 Entidades de Dados Mapeadas
* `plans`: Catálogo de planos com `external_price_id` (ID do produto no gateway).
* `subscriptions`: Armazenará `gateway_subscription_id`, `current_period_end`, `cancel_at_period_end` e status (`active`, `past_due`, `canceled`).
* `entitlements`: Atualizado automaticamente por webhook do gateway.

### 4.2 Webhooks a Implementar no Route Handler `/api/webhooks/billing`
* `invoice.payment_succeeded`: Atualiza `subscriptions.status = 'active'` e renova os `entitlements`.
* `invoice.payment_failed`: Atualiza `subscriptions.status = 'past_due'`, envia notificação e concede período de carência (ex: 3 dias) antes de rebaixar entitlements.
* `customer.subscription.deleted`: Rebaixa o usuário para o plano `free`, ajustando `entitlements` e desativando `is_featured`.

### 4.3 Política de Downgrade Seguro de Portfólio
* Se um usuário com 15 fotos cancela o plano e volta para o Gratuito (limite 6 fotos):
  - **Nenhuma foto é excluída automaticamente pelo sistema sem aviso**;
  - O perfil passa a exibir as 6 fotos de menor `sort_order`;
  - O usuário fica impedido de realizar novos uploads até que exclua voluntariamente as fotos excedentes ou reative o plano.

---

## 5. Destaque Patrocinado e Compliance Publicitário (Conar / CDC)
* O selo de destaque patrocinado é rotulado textualmente como **"Destaque patrocinado"**.
* É proibido usar termos como "Melhor avaliado", "Recomendado pela plataforma" ou "Garantido" para perfis pagos.
* A ordenação na busca posiciona os perfis patrocinados com peso moderado sem monopolizar o resultado da busca orgânica.
