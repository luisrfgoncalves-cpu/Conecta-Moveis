# Inventário e Registro de Operações de Tratamento de Dados Pessoais (ROPA) — LGPD

**Controlador:** Conecta Móveis (Operador da Plataforma Digital)  
**Canal de Atendimento do Encarregado (DPO):** `privacidade@conectamoveis.com.br` / `/painel/seguranca`  
**Data da Última Atualização:** 2026-11-13 (Versão 2.0)  
**Status de Revisão:** Versão preliminar sujeita à validação por advogado habilitado (`LEGAL_REVIEWED=false`).

---

## 1. Mapeamento Completo do Ciclo de Vida dos Dados Pessoais

| Dado / Categoria | Finalidade do Tratamento | Base Legal (Art. 7 LGPD) | Onde é Armazenado | Quem Acessa | Prazo de Retenção | Compartilhamento / Terceiros |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Conta de Usuário** (Nome, e-mail, senha criptografada hash, data de criação, aceite de termos) | Autenticação, gestão da conta e cumprimento dos Termos de Uso | **Execução de Contrato** (Art. 7º, V) | `auth.users`, `public.profiles` | O próprio titular e equipe técnica via console seguro com credenciais | Enquanto a conta estiver ativa. Exclusão mediante solicitação no painel em até 30 dias | Supabase Auth (AWS sa-east-1 / us-east-1) |
| **Perfil Profissional / Empresa** (Nome comercial, cidade, bio, especialidades, regiões) | Divulgação da atividade na vitrine de anúncios regional | **Execução de Contrato** (Art. 7º, V) | `public.professional_profiles` | Público geral na internet | Enquanto o anúncio estiver publicado ou até exclusão pelo titular | Indexadores de busca públicos (SEO) |
| **Contatos do Profissional** (WhatsApp, telefone comercial) | Aproximação comercial e contato inicial de clientes | **Consentimento do Titular** (Art. 7º, I) (revogável a qualquer tempo) | `public.professional_profiles` | Usuários logados e identificados (com proteção anti-scraping) | Enquanto autorizado pelo anunciante no painel | Usuários autenticados no momento do clique seguro |
| **Fotos de Portfólio de Obras** (Imagens de móveis, metadados) | Apresentação e divulgação dos trabalhos executados | **Execução de Contrato** (Art. 7º, V) e Direitos Autorais | Supabase Storage (`portfolio` / `evidence`) | Público geral (imagens aprovadas) | Enquanto o perfil mantiver a foto ou até remoção/takedown | CDN da Supabase |
| **Solicitações de Contato / Leads** (Nome do solicitante, e-mail/telefone, mensagem, tipo de móvel) | Envio de mensagem privada do usuário para a caixa de entrada do profissional | **Consentimento / Diligências Pré-contratuais** (Art. 7º, I e V) | `public.contact_requests` | Apenas o solicitante e o profissional destinatário | **90 dias** (expurgo automático via rotina de limpeza) | Não compartilhado com terceiros |
| **Avaliações e Comentários** (Nota, texto de relato, resposta do profissional) | Registro público da experiência da comunidade no catálogo | **Legítimo Interesse / Execução de Contrato** (Art. 7º, IX e V) | `public.reviews` | Público geral na internet | Enquanto o perfil existir, ressalvada moderação por ofensa/fraude | Indexadores e visitantes da página |
| **Denúncias Rápidas e Notificações (Takedown)** (Nome, e-mail do notificante, protocolo, descrição, documentos) | Apuração de infrações, proteção de direitos e cumprimento legal | **Cumprimento de Obrigação Legal** (Art. 7º, II - Marco Civil art. 19 / STF) | `public.reports`, `public.takedown_notices` | Equipe de moderação, assessoria jurídica e autoridades públicas | **5 anos** (prazo prescricional civil para eventuais demandas judiciais) | Autoridades policiais e judiciais mediante ofício |
| **Registros de Acesso a Aplicações** (IP de origem, data/hora, ID do usuário, ação efetuada) | Cumprimento de dever de guarda de registros telemáticos | **Cumprimento de Obrigação Legal** (Art. 7º, II - Marco Civil art. 15) | `public.app_access_logs` | Ninguém por padrão; acesso estrito por motivo fundamentado e auditado | **6 meses exatos** (expurgo automático diário, salvo `legal_hold`) | Apenas mediante ordem judicial específica (Marco Civil art. 15, §1º) |
| **Métricas Agregadas de Acesso** (Total de cliques em WhatsApp, visualizações de perfil) | Estatísticas de audiência do anúncio para o próprio profissional | **Legítimo Interesse** (Art. 7º, IX) | `public.whatsapp_clicks`, `analytics_events` | O profissional titular do painel e administrador | Agregado e anonimizado (sem rastreamento de indivíduo) | Nenhum |

---

## 2. Teste de Balanceamento de Legítimo Interesse (LIA)

Para as atividades fundamentadas no **Artigo 7º, IX da LGPD**:
1. **Legitimidade do Interesse:** Proteção antifraude, moderação de conteúdos ilícitos e segurança cibernética dos usuários e servidores.
2. **Necessidade:** O registro de eventos de moderação e métricas agregadas é estritamente necessário para coibir estelionatos, contas falsas e violações do Marco Civil.
3. **Balanceamento e Direitos do Titular:** As salvaguardas incluem o mascaramento de logs, a ausência de cruzamento de perfis comerciais, RLS rigoroso impedindo acesso por terceiros e a garantia de cancelamento e oposição via `/painel/seguranca`.

---

## 3. Diretriz para Consentimento de Comunicações e Marketing
- **Proibição de Opt-in Forçado:** Checkboxes de comunicações informativas ou futuras novidades jamais serão pré-marcadas.
- **Revogação Facilitada:** Todo e-mail de serviço possui canal de descadastramento imediato em 1 clique ou via painel de preferências.

