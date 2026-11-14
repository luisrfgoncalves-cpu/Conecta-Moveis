# Auditoria Jurídico-Técnica da Aplicação Conecta Móveis

**Data de Realização:** 13/11/2026  
**Fase de Execução:** Fase 14 — Passo 2 de 15 (Volume 2)  
**Escopo:** Somente leitura do código existente e mapeamento de lacunas de conformidade e isenção.

---

## 1. Inventário Geral do Sistema

### 1.1. Rotas e Telas (43 rotas)
- **Rotas Públicas e Institucionais:** `/`, `/como-funciona`, `/categorias`, `/encontrar-profissionais`, `/profissionais/[slug]`, `/empresas/[slug]`, `/planos`, `/denunciar`.
- **Páginas Legais:** `/termos`, `/privacidade`, `/politica-anuncios`, `/politica-avaliacoes`, `/politica-portfolio`, `/politica-assinatura`, `/regras-denuncia`.
- **Autenticação:** `/entrar`, `/criar-conta`, `/recuperar-senha`, `/auth/callback`.
- **Painel do Usuário/Profissional (`/painel`):** `/painel`, `/painel/perfil`, `/painel/portfolio`, `/painel/avaliacoes`, `/painel/solicitacoes`, `/painel/favoritos`, `/painel/empresas`, `/painel/assinatura`, `/painel/seguranca`, `/painel/configuracoes`.
- **Painel Administrativo (`/admin`):** `/admin`, `/admin/usuarios`, `/admin/perfis`, `/admin/empresas`, `/admin/fotos`, `/admin/denuncias`, `/admin/avaliacoes`, `/admin/categorias`, `/admin/planos`, `/admin/assinaturas`, `/admin/logs`, `/admin/backup`.
- **SEO & Sistema:** `/robots.txt`, `/sitemap.xml`, `/_not-found`.

### 1.2. Tabelas no Banco PostgreSQL (24 tabelas)
`profiles`, `user_roles`, `companies`, `company_members`, `categories`, `specialties`, `professional_profiles`, `profile_specialties`, `service_regions`, `portfolio_items`, `portfolio_images`, `contact_requests`, `favorites`, `reviews`, `reports`, `plans`, `subscriptions`, `entitlements`, `plan_interest`, `user_consents`, `admin_logs`, `moderation_events`, `rate_limits`, `daily_metrics`.

### 1.3. Buckets de Storage
- `avatars` (Público para leitura; restrito para upload próprio)
- `portfolio-pending` (Privado; acessível apenas pelo dono e moderadores via Signed URLs)
- `portfolio-public` (Público; alimentado exclusivamente pela aprovação da moderação)

---

## 2. Varredura de Vocabulário de Risco e Isenção

Foram identificadas **98 ocorrências** de termos sensíveis no código de interface e metadados, categorizadas a seguir:

| Termo | Arquivo : Linha | Trecho Encontrado | Classificação | Fase de Correção |
| :--- | :--- | :--- | :--- | :--- |
| `contrate` | `src/app/layout.tsx:22,33,47` | `"Compare perfis, portfólios e contrate com segurança."` | **Violação (Alto)** | **Fase 15** |
| `garantido` | `src/app/denunciar/page.tsx:55` | `"O sigilo do denunciante é garantido."` | **Violação (Médio)** | **Fase 15 / 16** |
| `nossa equipe` | `src/app/denunciar/page.tsx:68, 112` | `"analisada pela nossa equipe de moderação."` | **Violação (Médio)** | **Fase 15** |
| `parceiro` | `src/components/ui/Card.tsx:17` | `professionalName = 'Profissional Parceiro'` | **Violação (Alto)** | **Fase 15** |
| `parceiras` | `src/app/page.tsx:61` | `"empresas parceiras"` | **Violação (Alto)** | **Fase 15** |
| `100%` | `src/app/page.tsx:61` | `"A negociação e a contratação são 100% livres"` | **Violação (Baixo)** | **Fase 15** |
| `100%` | `src/components/layout/Footer.tsx:80` | `"Negociação 100% autônoma."` | **Violação (Baixo)** | **Fase 15** |
| `verificado` | `src/components/admin/AdminAvaliacoesClient.tsx:124` | `placeholder="Ex: Termo verificado como contexto..."` | Falso positivo (admin interno) | Fase 21 |
| `preço` | `src/components/ui/FaqSection.tsx:9` | `"Toda negociação, preço e prazo são combinados diretamente..."` | Aceitável em negativa | Fase 15 |
| `garantia` | `src/app/como-funciona/page.tsx:64` | `"não oferece garantia sobre prazos ou qualidade..."` | Aceitável em negativa | Fase 15 |
| `garantia` | `src/app/profissionais/[slug]/page.tsx:204` | `"A presença na plataforma não representa garantia da qualidade..."` | Aceitável em negativa | Fase 15 |

---

## 3. Avaliação das Regras de Ouro (R1 a R20)

| Regra | Descrição Sumária | Situação no App | Evidência / Arquivo | Ação Futura |
| :--- | :--- | :--- | :--- | :--- |
| **R1** | Nunca intermediar pagamento de serviço nem comissão | **Atende** | `src/lib/monetization/actions.ts` (sem split ou retenção) | Manter |
| **R2** | Nunca exibir, calcular ou armazenar preço de serviço | **Atende** | `src/lib/contact/schemas.ts` (bloqueio regex de valores) | Manter |
| **R3** | Sem botão/texto de "contratar", "agendar", "garantir" | **Não atende** | `src/app/layout.tsx:22` ("contrate com segurança") | **Fase 15** |
| **R4** | Sem linguagem de endosso ("melhor", "top", "parceiro") | **Atende parcialmente** | `src/components/ui/Card.tsx:17` usa "Profissional Parceiro" | **Fase 15** |
| **R5** | Sem ranking de qualidade; ordem publicada; pago rotulado | **Atende parcialmente** | Busca tem ordenação por estrelas, sem rotativa padrão | **Fase 15 / 22** |
| **R6** | Revisão prévia registrada para conteúdo de plano pago | **Não atende** | Não há fila de moderação prévia específica para pagos | **Fase 21** |
| **R7** | Conteúdo é do anunciante; plataforma só oculta/remove | **Atende** | `src/lib/admin/actions.ts` não reescreve texto de usuários | Manter |
| **R8** | Notificação e retirada com protocolo e contestação | **Atende parcialmente** | `/denunciar` existe mas sem protocolo nem contestação | **Fase 16** |
| **R9** | Conteúdo gravíssimo: ocultar de imediato e comunicar | **Não atende** | Não há botão "Ocultar e preservar" com checklist policial | **Fase 16 / 21** |
| **R10** | Guarda de logs de acesso por 6 meses (Marco Civil) | **Não atende** | Tabela `app_access_logs` não implementada | **Fase 17** |
| **R11** | Minimização de dados; contatos protegidos de raspagem | **Atende parcialmente** | Sem CPF/endereço, mas link do WhatsApp é 100% público | **Fase 17 / 25** |
| **R12** | Uso restrito a maiores de 18 anos | **Atende parcialmente** | Textos citam 18 anos, mas falta checkbox no cadastro | **Fase 16** |
| **R13** | Identificação do operador (razão social, CNPJ, e-mail) | **Não atende** | Rodapé e `/contato` pendentes de preenchimento formal | **Fase 15** |
| **R14** | Avaliações uniformes; plano pago não interfere na nota | **Atende** | `src/lib/reviews/actions.ts` tem regras cegas a plano | Manter |
| **R15** | Sem subordinação nem fiscalização de profissionais | **Atende** | Sem horários, sem uniforme, sem metas | Manter |
| **R16** | Toda nova funcionalidade passa pelo Gate de Isenção | **Atende** | Documentado e iniciado no Passo 1 | Manter |
| **R17** | Textos limitam responsabilidade "nos termos da lei" | **Atende** | Textos de `src/app/(legal)` estruturados | Manter |
| **R18** | WhatsApp fora da plataforma com aviso prévio de saída | **Atende parcialmente** | Redirecionamento ocorre direto, sem tela intermediária | **Fase 15** |
| **R19** | Sem parcerias comerciais com seguradoras/garantias | **Atende** | Nenhuma parceria ativa | Manter |
| **R20** | Moderação de conformidade, nunca de mérito/qualidade | **Atende** | Fila modera fotos ilegais, não gosto estético | Manter |

---

## 4. Levantamento de Dados Pessoais e Subprocessadores

### 4.1. Dados Pessoais Coletados
- **Conta de Acesso:** E-mail, hash de senha criptografada (Supabase Auth).
- **Perfil Profissional / Anunciante:** Nome comercial, biografia, cidade, bairro, telefone/WhatsApp, fotos de trabalhos, categorias atendidas, dados de empresa (opcional: razão social e CNPJ).
- **Mensagens de Contato:** Nome do cliente, telefone, tipo de serviço e mensagem.
- **Avaliações:** Nome do avaliador, nota (1 a 5) e comentário.
- **Denúncias:** Nome do denunciante, e-mail, motivo e evidências.

### 4.2. Subprocessadores e Regiões
1. **Supabase Inc. / AWS:**
   - Serviços: PostgreSQL, Auth, Storage.
   - Região: `sa-east-1` (São Paulo, Brasil) para o banco e buckets.
   - Transferência Internacional: Instrumentos contratuais padrão (SCC) da AWS/Supabase.
2. **Vercel Inc.:**
   - Serviços: Edge Network, CDN, Serverless Functions do Next.js.
   - Região padrão de execução de funções: `iad1` (Washington DC, EUA).
3. **Cookies & Rastreamento:**
   - Apenas cookies de sessão essenciais do Supabase Auth.
   - **Zero** pixels de rastreamento de terceiros (Meta, Google, TikTok).

---

## 5. Lacunas nos Textos Legais vs. Comportamento Real

1. **Promessa de Contestação de Denúncias:** Os termos descrevem direito de defesa do anunciante, mas hoje a denúncia em `/admin/denuncias` é julgada de forma unilateral sem envio de formulário de contestação ao profissional.
2. **Direito do Titular (LGPD):** A política de privacidade estipula resposta em 15 dias para revogação e eliminação, mas o admin ainda não possui fila com contagem de prazos da LGPD.
3. **Revisão Prévia de Planos Pagos:** O sistema atual está com `BILLING_MODE=off`, portanto não há fluxo ativo de revisão de patrocinados antes da exibição.

---

## 6. Verificação de Canais Obrigatórios

| Canal / Recurso | Status Atual | Arquivo / Tela | Requisito Legal |
| :--- | :--- | :--- | :--- |
| **Identificação do Operador** | Pendente | `src/components/layout/Footer.tsx` | Decreto 7.962/2013 |
| **Canal de Notificação e Retirada** | Parcial | `src/app/denunciar/page.tsx` | Marco Civil art. 19 / STF 987 |
| **Canal de Titulares (DPO/LGPD)** | Parcial | `src/app/painel/seguranca/page.tsx` | LGPD art. 18 e 41 |
| **Canal de Autoridades Judiciais** | Inexistente | Falta `/autoridades` | Marco Civil art. 15 |
| **Guarda de Logs de Acesso** | Inexistente | Falta `app_access_logs` | Marco Civil art. 15 |
| **Aceite Versionado** | Parcial | `public.user_consents` (sem hash do texto) | Marco Civil / CDC |
| **Trava de Maioridade (18+)** | Inexistente | Falta trava em `/criar-conta` | ECA / ECA Digital |

---

## 7. Classificação dos Achados por Gravidade e Plano de Ação

### Gravidade Crítica (Bloqueadores para Lançamento Público)
- **C-01:** Palavra *"contrate com segurança"* nos metadados SEO do `layout.tsx` (induz ideia de intermediação da contratação). *(Mapeado para Fase 15)*.
- **C-02:** Ausência de tela de saída (disclaimer obrigatório) antes de abrir a conversa no WhatsApp do marceneiro. *(Mapeado para Fase 15)*.
- **C-03:** Ausência de dados cadastrais do operador (CNPJ, Razão Social) no rodapé. *(Mapeado para Fase 15)*.
- **C-04:** Falta de registro de logs de acesso de autenticação com retenção de 6 meses (Marco Civil art. 15). *(Mapeado para Fase 17)*.

### Gravidade Alta
- **A-01:** Uso do termo *"Profissional Parceiro"* e *"empresas parceiras"* em cards e home. *(Mapeado para Fase 15)*.
- **A-02:** Link de WhatsApp público na vitrine para qualquer robô/raspador sem login ou proteção anti-bot. *(Mapeado para Fase 17 e 25)*.
- **A-03:** Falta de protocolo formal e fluxo de contestação no canal de denúncias. *(Mapeado para Fase 16)*.
- **A-04:** Ausência de trava de maioridade (18 anos) no formulário de criação de conta. *(Mapeado para Fase 16)*.

### Gravidade Média
- **M-01:** Busca sem modo rotativo diário padronizado (para neutralidade de ordenação). *(Mapeado para Fase 15 e 22)*.
- **M-02:** Termo *"garantido"* no texto de denúncias e *"100% autônoma"* no rodapé. *(Mapeado para Fase 15)*.
- **M-03:** Falta de procedimento documentado para conteúdo gravíssimo (CSAM/Violência). *(Mapeado para Fase 16 e 21)*.

### Gravidade Baixa
- **B-01:** Falta de página explicativa `/funcao-da-plataforma` e `/como-ordenamos-os-resultados`. *(Mapeado para Fase 15)*.
- **B-02:** Falta de hash SHA-256 atrelado às versões dos termos em `legal_documents`. *(Mapeado para Fase 16)*.

---

## 8. Impacto Jurídico

### O que mudou na isenção da plataforma com esta auditoria:
- Foi mapeado com precisão cirúrgica cada termo em código e interface que gerava vulnerabilidade perante o Código de Defesa do Consumidor (CDC) e o Marco Civil da Internet.
- Ficou comprovado que o backend da Conecta Móveis **já não cobra comissões nem gerencia pagamentos de serviços**, o que reforça fortemente a posição jurídica de mera vitrine de anúncios.
- O roteiro de correções foi desenhado para eliminar 100% das palavras de endosso e implementar as barreiras formais de contato externo.

### O que permanece pendente para o advogado:
1. Validação da razão social, CNAE adequado e regime societário para operar a plataforma em Jundiaí/SP.
2. Análise do enquadramento dos Temas 987 e 533 do STF (presunção de conhecimento em impulsionamentos pagos).
3. Homologação final dos prazos internos de notificação e retirada (ex: 24h para triagem, 3 dias para contestação).

