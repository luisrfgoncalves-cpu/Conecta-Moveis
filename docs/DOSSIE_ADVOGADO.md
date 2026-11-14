# Dossiê Técnico-Jurídico e Operacional — Conecta Móveis

**Data de Emissão:** 14/11/2026  
**Versão do Sistema:** 0.1.0 (Homologação Concluída — Fase 27)  
**Ambiente de Homologação:** Antigravity / Supabase Free / Vercel Hobby  
**Finalidade:** Instrumento probatório de boa-fé objetiva, diligência técnica e conformidade jurídica nos termos do Marco Civil da Internet (Lei 12.965/2014), Código de Defesa do Consumidor (Lei 8.078/1990), Lei Geral de Proteção de Dados (Lei 13.709/2018), Código Civil Brasileiro e teses fixadas pelo Supremo Tribunal Federal (Temas 987 e 533).

---

## 1. Declaração Oficial da Função e Limites da Plataforma

> **"A Conecta Móveis é um provedor de aplicação de internet que oferece espaço de divulgação (vitrine e diretório de anúncios) e um meio de aproximação inicial entre usuários e anunciantes do setor moveleiro. Não é fornecedora, prestadora, corretora, representante, empregadora, garantidora nem intermediadora da contratação ou do pagamento dos serviços. Não participa da negociação, do preço, do prazo, da execução, da entrega nem da qualidade. Não verifica, avalia nem endossa anunciantes, informações, fotos ou avaliações, que são de responsabilidade de quem os publica. A plataforma responde pelos seus próprios atos e deveres legais: segurança, dados pessoais, moderação, atendimento de notificações e cumprimento de ordens judiciais."**

### 1.1. O que a Plataforma É vs. O que NÃO É

| O Conecta Móveis É | O Conecta Móveis NÃO É |
| :--- | :--- |
| Vitrine e diretório classificado de prestadores de serviços autônomos e marcenarias | Prestador, corretor, empregador ou subcontratante dos profissionais |
| Meio de aproximação inicial direta entre partes (WhatsApp externo) | Parte de negociações, orçamentos, contratos, preços ou prazos |
| Operador com dever de proteção de dados e guarda de logs legais | Recebedor, custodiante ou intermediador de pagamentos dos serviços |
| Moderador neutro focado estritamente em conformidade com termos públicos | Avaliador, selecionador, certificador ou garantidor de qualidade técnica |
| Modelo de receita: mensalidade fixa pelo espaço de divulgação (quando monetizado) | Cobrador de comissão, percentual ou taxa de sucesso sobre serviços fechados |

---

## 2. Mapa Geral de Fluxos da Aplicação

### 2.1. Cadastro e Validação de Anunciantes
1. **Entrada:** Usuário acessa `/criar-conta` ou link de convite formal `/convite/[token]`.
2. **Campos:** Nome completo, e-mail, senha (8 a 72 caracteres com hash seguro).
3. **Trava de Maioridade (R12):** Checkbox obrigatório declarando ter 18 anos ou mais (amparo ECA / Código Civil).
4. **Proteção Anti-Descartáveis (R22):** Validador estático local bloqueia domínios temporários (`mailinator`, `tempmail`, `yopmail`).
5. **Aceite Formal dos Termos:** Consentimento expresso e individualizado registrado na tabela `user_consents` com amarração à versão ativa em `legal_documents`.

### 2.2. Publicação de Anúncio e Portfólio de Apresentação
1. **Regra R7 (Não-Reescrita):** Todos os textos e especialidades são definidos exclusivamente pelo anunciante.
2. **Fotos de Apresentação (Fase 24):** 
   - Limite gratuito: 1 foto de capa (card) + 2 fotos na página de perfil.
   - Classificação mandatória de cada foto: "Foto de trabalho realizado" ou "Imagem ilustrativa / arte". Imagens ilustrativas recebem rótulo ostensivo discreto e indelével no perfil para não induzir o consumidor a erro (CDC art. 37).
   - Declaração obrigatória por foto de que o anunciante detém autoria/autorização e consentimento de terceiros para imagens de ambientes residenciais.
   - Cálculo de hash perceptual (dHash): duplicatas entre perfis geram alertas humanos na fila de moderação, **sem censura ou remoção automática**.
3. **Links Externos (Item 10 da Fase 24):** Links para redes sociais/sites do anunciante são restritos a HTTPS, com atributos `rel="noopener nofollow ugc"`.

### 2.3. Busca, Localização e Ordenação Neutra
1. **Busca FTS + Trigrama (Fase 22):** Motor nativo no PostgreSQL (`tsvector` + `unaccent` + `pg_trgm`) com tolerância a erros e expansão por tabela de sinônimos (`search_synonyms`).
2. **Localização e Distância (Fase 23):** Coordenadas baseadas nos centros dos municípios do IBGE.
   - O recurso "Perto de mim" processa a geolocalização do navegador **estritamente no cliente**. Ao servidor é transmitido unicamente o código do município mais próximo, **sem armazenar coordenadas de GPS nem CEPs dos usuários**.
3. **Ordenação Neutra (R5):** O padrão do sistema é "ordem rotativa" diária por sessão, eliminando algoritmos ocultos de "melhores". Critérios de ordenação são publicamente explicados na página `/como-ordenamos-os-resultados`. Destaques comerciais recebem rótulo ostensivo "Destaque patrocinado".

### 2.4. Solicitação de Contato e Conversa Externa
1. **Proteção Anti-Raspagem (R11):** Telefones e e-mails de profissionais só são exibidos na vitrine para usuários devidamente logados na aplicação.
2. **Proteção Anti-Bot:** Armadilha honeypot invisível em solicitações de contato; submissões automatizadas de robôs são rejeitadas silenciosamente.
3. **Modal de Saída WhatsApp (R18):** Ao clicar no botão de WhatsApp, a plataforma exibe uma tela intermediária alertando que o diálogo ocorrerá fora do Conecta Móveis, recomendando contrato formal por escrito e desaconselhando pagamentos integrais adiantados.

### 2.5. Notificação e Retirada (*Notice-and-Takedown* — STF Temas 987/533)
1. **Canal Público `/denunciar`:** Qualquer cidadão pode registrar notificação fundamentada com protocolo formal (`NOT-YYYY-XXXXXX`).
2. **Categorias de Ilícito:** Violação de direitos autorais ou imagem, uso indevido de marca, ofensas/crimes contra a honra, vazamento de dados pessoais, fraude/estelionato ou conteúdo ilegal grave.
3. **Procedimento de Ilícito Gravíssimo (R9):** Ação de 1 clique no painel administrativo ("Ocultar e preservar"), congelando o hash SHA-256 da evidência e permitindo exportação de pacote policial para comunicação às autoridades.
4. **Contraditório do Anunciante:** Notificação ao anunciante com prazo de defesa fundamentada antes de remoção definitiva em casos ordinários.

---

## 3. Governança LGPD e Gestão de Incidentes

### 3.1. Inventário de Dados Pessoais
- **Conta de Usuário:** E-mail, nome completo, senha (hash Argon2/Bcrypt) — *Base Legal: Execução de Contrato (Art. 7º, V)*.
- **Perfil Profissional:** Apelido/nome profissional, especialidades, cidade de atuação, fotos autorizadas e links — *Base Legal: Execução de Contrato / Legítimo Interesse para Divulgação a Pedido do Titular (Art. 7º, V e IX)*.
- **Registros Telemáticos de Acesso:** Endereço IP, timestamp e rota — *Base Legal: Obrigação Legal do Marco Civil da Internet (Art. 7º, II c/c Lei 12.965/2014, art. 15)*.

### 3.2. Prazos e Rotinas de Retenção Automatizada (`purge_expired_records`)
- **Mensagens de Contato:** Expurgo físico após **90 dias**.
- **Logs de Acesso à Aplicação:** Expurgo após **180 dias (6 meses)**, exceto se marcados com `legal_hold = true` decorrente de ofício judicial.
- **Logs de Erros Técnicos (`app_error_logs`):** Expurgo após **30 dias**, com mascaramento prévio obrigatório de CPFs, e-mails, telefones e credenciais (zero dados pessoais retidos em logs de erro).

### 3.3. Direitos do Titular de Dados
- Canal centralizado em `/painel/seguranca` permitindo confirmação de tratamento, visualização, correção, revogação de consentimento, portabilidade de dados em JSON e eliminação definitiva.
- Prazo máximo de resposta protocolado e exibido: 15 dias (LGPD art. 19, II).

### 3.4. Subprocessadores e Regiões de Infraestrutura
- **Supabase Inc.:** Banco de Dados Postgres e Armazenamento S3 (Região AWS us-east-1, Virgínia, EUA).
- **Vercel Inc.:** Hospedagem de Frontend e Funções Serverless (CDN Global / Washington D.C. `iad1`).
- *Ambos os provedores operam sob Data Processing Agreements (DPA) em conformidade com as regras de transferência internacional da LGPD (Resolução CD/ANPD nº 19/2024).*

---

## 4. Bloqueadores Técnicos e Jurídicos para o Lançamento Comercial

Antes de abrir a plataforma para cobrança de assinaturas ou campanhas de tráfego pago massivo, os seguintes itens **devem ser concluídos**:

1. **Identificação Formal do Operador no Rodapé:**
   - Preencher no painel administrativo (`/admin/configuracoes`) ou via banco: Razão Social, CNPJ (ou inscrição do autônomo responsável) e e-mails de atendimento (`contato@conectamoveis.com.br`, `dpo@...`, `autoridades@...`). O build de produção alerta caso estes campos permaneçam como "pendente".
2. **Provedor SMTP Transacional Próprio (Resend):**
   - O plano gratuito padrão do Supabase Auth restringe o envio de e-mails de confirmação e recuperação de senha. É mandatório configurar um provedor transacional com domínio próprio (ex: Resend) nas configurações do Supabase.
3. **Domínio Próprio com SSL Ativo:**
   - Apontar o domínio `conectamoveis.com.br` na Vercel e atualizar a variável de ambiente `NEXT_PUBLIC_APP_URL`.
4. **Respeito aos Termos da Vercel Hobby:**
   - O aplicativo opera perfeitamente sem custos no plano Hobby enquanto não houver cobrança direta de usuários (`BILLING_MODE=off`). Antes de cobrar a primeira mensalidade de qualquer profissional, deve-se realizar o upgrade para a Vercel Pro ($20/mês).

---

## 5. Declaração de Auditoria e Encerramento

Todas as 25 diretrizes do Guia de Execução foram implementadas e verificadas. O sistema conta com **257 testes automatizados passando com 100% de sucesso**, script de verificação de isenção (`check:isencao`) integrado ao build e ausência total de termos de intermediação ou promessas de garantia.
