# Registro de Decisões Jurídico-Técnicas — Conecta Móveis

Este documento registra todas as avaliações do Gate de Isenção ao longo das Fases 14 a 27 do projeto Conecta Móveis.

---

## Modelo de Entrada

- **ID**: J-001 (sequencial)
- **Data**: AAAA-MM-DD
- **Fase**: Fase X
- **Funcionalidade ou Texto**: Descrição
- **Regras e Normas Envolvidas**: R1 a R20 / Artigos legais
- **Risco**: Baixo | Médio | Alto
- **Decisão Tomada**: Descrição da decisão
- **Quem Decidiu**: Usuário / Equipe
- **Evidência**: Arquivo, teste, commit ou captura
- **Pendência para o Advogado**: O que deve ser validado na revisão jurídica

---

## Entradas Registradas

### J-001 — Criação da Base Jurídica e Gate de Isenção
- **Data**: 2026-11-13
- **Fase**: Passo 1 (Preparação para Fases 14 a 27)
- **Funcionalidade ou Texto**: Criação de `docs/JURIDICO_BASE.md`, `docs/REGISTRO_JURIDICO.md` e `docs/MATRIZ_CONFORMIDADE.md`.
- **Regras e Normas Envolvidas**: R1 a R20; Marco Civil (Lei 12.965/14, art. 19); CDC (Lei 8.078/90, arts. 3, 7, 14, 31, 36-38, 51); LGPD (Lei 13.709/18).
- **Risco**: Baixo (documentação e governança inicial; sem alteração de código de produção).
- **Decisão Tomada**: Formalização do Gate de Isenção no projeto como protocolo obrigatório prévio para qualquer nova tela, texto ou funcionalidade. Nenhuma linha de código de produto foi alterada.
- **Quem Decidiu**: Usuário (autorização explícita do Passo 1).
- **Evidência**: `docs/JURIDICO_BASE.md`, `docs/REGISTRO_JURIDICO.md`, `docs/MATRIZ_CONFORMIDADE.md`.
- **Pendência para o Advogado**: Validação das teses vigentes em 2026 dos Temas 987 e 533 do STF e das resoluções da ANPD sobre pequenos agentes de tratamento.

### J-002 — Auditoria Jurídico-Técnica e Mapeamento de Lacunas
- **Data**: 2026-11-13
- **Fase**: Fase 14 — Passo 2 de 15
- **Funcionalidade ou Texto**: Auditoria completa do código existente, varredura de vocabulário de risco (98 termos), inventário de 43 rotas e 24 tabelas, preenchimento de matriz e plano de ação.
- **Regras e Normas Envolvidas**: R1 a R20, Marco Civil (art. 15 e 19), CDC (arts. 3, 14, 31, 36-38, 51), LGPD (arts. 6, 7, 18, 19).
- **Risco**: Baixo (auditoria estritamente em modo somente leitura; sem alteração de código funcional ou dados).
- **Decisão Tomada**: Geração de `docs/AUDITORIA_JURIDICA_TECNICA.md` e primeira versão de `docs/MATRIZ_CONFORMIDADE.md` mapeando os pontos críticos (C-01 a C-04) para tratamento nas Fases 15 a 27.
- **Quem Decidiu**: Agente sob autorização do usuário no Passo 2.
- **Evidência**: `docs/AUDITORIA_JURIDICA_TECNICA.md`, `docs/MATRIZ_CONFORMIDADE.md`.
- **Pendência para o Advogado**: Avaliação dos prazos internos de moderação e confirmação do modelo societário/CNAE antes do lançamento comercial.

### J-003 — Gate de Isenção para Fase 15 (Linguagem, Avisos e Arquitetura de Isenção)
- **Data**: 2026-11-13
- **Fase**: Fase 15 — Passo 3 de 15
- **Funcionalidade ou Texto**: Implementação de `/funcao-da-plataforma`, modal de saída pré-WhatsApp, aviso unificado de vitrine no rodapé, busca e perfis, substituição de vocabulário de endosso/contratação, script `check:isencao`, página `/contrate-com-seguranca` e `/como-ordenamos-os-resultados`.
- **Regras e Normas Envolvidas**: R1 a R5, R13, R17, R18, R20; CDC arts. 3, 14, 31, 36-38; Marco Civil art. 19.
- **Risco**: Baixo (reforço de isenção, proteção ao usuário e desvinculação da cadeia de prestação de serviços).
- **Decisão Tomada**: Eliminar verbos de contratação no SEO e UI; aplicar modal de consentimento pré-WhatsApp informando que a negociação é externa; ordenar busca por rotatividade padrão; criar script de validação de vocabulário `check:isencao`.
- **Quem Decidiu**: Usuário (autorização da Fase 15).
- **Evidência**: `docs/REGISTRO_JURIDICO.md`, `src/components/layout/WhatsAppExitModal.tsx`, `src/app/funcao-da-plataforma/page.tsx`, `scripts/check-isencao.mjs`.
- **Pendência para o Advogado**: Definição da Razão Social e CNPJ definitivo para preenchimento em `app_settings` / variáveis de ambiente.

### J-004 — Gate de Isenção para Fase 16 (Termos, Políticas, Notificação/Retirada e Evidências)
- **Data**: 2026-11-13
- **Fase**: Fase 16 — Passo 4 de 15
- **Funcionalidade ou Texto**: Criação de `takedown_notices` com geração de protocolo, tela `/autoridades`, ação de ocultar e preservar evidências em caso gravíssimo, botão no admin para exportar dossiê policial com hash SHA-256, versionamento de termos com `legal_documents` e trava de maioridade (18+) no cadastro.
- **Regras e Normas Envolvidas**: R7, R8, R9, R12, R17; Marco Civil da Internet (art. 19); STF Temas 987 e 533; ECA / ECA Digital; CDC (art. 37, 51); Lei de Direitos Autorais (Lei 9.610/98).
- **Risco**: Médio (processos de remoção de conteúdo e custódia de evidências de ilícitos).
- **Decisão Tomada**: Instituir protocolo numérico sequencial para toda notificação, preservação imutável de snapshot JSON e hash SHA-256 para autoridades judiciais/policiais, garantia de contraditório (contestação) ao anunciante sem que terceiros acessem a notificação (RLS estrita), trava no formulário de cadastro impedindo menor de 18 anos.
- **Quem Decidiu**: Usuário (solicitação explícita do Passo 4 com botão de evidências no admin).
- **Evidência**: `supabase/migrations/20261113000002_takedown_notices_and_evidence.sql`, `src/app/autoridades/page.tsx`, `src/app/denunciar/page.tsx`, `src/app/admin/denuncias/page.tsx`.
- **Pendência para o Advogado**: Definição formal dos prazos de resposta (sugestão técnica: 24h para triagem, 3 dias para contestação).

---

### J-005 — LGPD Operacional, Registros de Acesso e Direitos do Titular
- **Data**: 2026-11-13
- **Fase**: Fase 17 — LGPD Operacional e Registros de Acesso
- **Funcionalidade ou Texto**: Inventário de dados (`docs/LGPD_INVENTARIO.md`), Política de Privacidade completa (`/privacidade`), Direitos do Titular em `/painel/seguranca`, retenção automática (`pg_cron` via função `purge_expired_records()`), tabela `app_access_logs` com purge semestral, proteção de contatos para usuários não logados (`/profissionais/[slug]`), Plano de Resposta a Incidentes (`docs/PLANO_INCIDENTES.md`), documentação de transferência internacional.
- **Regras e Normas Envolvidas**: R10, R11; LGPD (arts. 6, 7, 11, 18, 19, 46); Marco Civil (art. 15); ANPD Res. 15/2024 (notificação de incidentes); Decreto 7.962/2013 (comércio eletrônico).
- **Risco**: Alto (obrigação legal de guarda de logs por 6 meses, direitos do titular com prazo legal de 15 dias, transferência internacional de dados para servidores Supabase e Vercel fora do Brasil).
- **Decisão Tomada**:
  1. **Logs de acesso**: Apenas eventos de autenticação e escrita são gravados (minimização de dados); navegação anônima (page views) NÃO é registrada — decisão baseada no princípio de necessidade (LGPD art. 6, III). Registrar somente: login, cadastro, publicar/editar perfil, fotos, contatos, avaliações, notificações.
  2. **Contatos públicos**: WhatsApp e telefone visíveis somente para usuários autenticados (R11) — proteção anti-scraping e minimização de dados.
  3. **Transferência internacional**: Supabase utiliza AWS us-east-1 (Virginia, EUA) por padrão; Vercel usa CDN global. Ambos possuem DPA (Data Processing Agreement). Usuário deve avaliar migração do projeto Supabase para região `sa-east-1` (São Paulo) se assessor jurídico recomendar, para reduzir dependência de transferência internacional.
  4. **Retenção**: Solicitações de contato: 90 dias. Logs de acesso: 180 dias. Exceção: registros com `legal_hold = true` não são purgados automaticamente.
  5. **DSR (Data Subject Requests)**: Protocolo `DSR-YYYY-XXXXXX` com prazo de 15 dias (LGPD art. 19, II). Fila visível no admin.
- **Quem Decidiu**: Usuário (solicitação explícita da Fase 17, confirmada nas execuções sucessivas).
- **Evidência**: `docs/LGPD_INVENTARIO.md`, `docs/PLANO_INCIDENTES.md`, `src/app/privacidade/page.tsx`, `src/lib/lgpd/actions.ts`, `src/components/auth/LGPDRequestSection.tsx`, `supabase/migrations/20261113000003_lgpd_access_logs_and_retention.sql`, `src/__tests__/lgpd.test.ts` (4 testes passando).
- **Pendência para o Advogado**:
  - Confirmar se a região atual do Supabase (us-east-1, AWS Virginia) exige migração para `sa-east-1` (São Paulo) ou se o DPA da AWS/Supabase é suficiente para conformidade com LGPD/transferência internacional.
  - Validar se o prazo de 90 dias para retenção de solicitações de contato é adequado ao modelo de negócios.
  - Confirmar se a decisão de não registrar navegação anônima está alinhada à estratégia de cookies e à necessidade legal de rastreabilidade.
  - Aprovar o Plano de Resposta a Incidentes e nomear o Encarregado (DPO) formalmente.

---

### J-006 — Arquitetura de Configurações, Limites e Encaixes de Upgrade (Fase 18)
- **Data**: 2026-11-13
- **Fase**: Fase 18 — Arquitetura de Configuração e de Upgrade
- **Funcionalidade ou Texto**: Sistema de duas camadas para tetos técnicos (`infra_profiles`) e limites comerciais (`entitlements`), registro tipado de configurações com Zod e histórico de rollback, feature flags com travas de infraestrutura e revisão jurídica obrigatória, simulador de capacidade no painel administrativo, adaptadores modulares para armazenamento, busca, e-mail e rate limit, e política de bloqueio brando (não destrutivo) em caso de redução de limites.
- **Regras e Normas Envolvidas**: R1, R2, R16; CDC arts. 30, 31, 35 e 51; LGPD arts. 6º, 33 (transferência internacional); Marco Civil art. 15.
- **Risco**: Médio (impacto em promessas contratuais comerciais para anunciantes, retenção de dados e segurança de infraestrutura).
- **Decisão Tomada**:
  1. **Região da Infraestrutura**: O projeto Supabase permanece provisionado na região padrão da AWS Virginia (`us-east-1`) e as funções da Vercel em Washington D.C. (`iad1`), amparados pelos DPAs de ambos os fornecedores e com zero dados reais de clientes no momento. A eventual migração para São Paulo (`sa-east-1` / `gru1`) fica documentada e planejada no `docs/UPGRADE_PLAYBOOK.md` para execução futura com autorização expressa do proprietário.
  2. **Duas Camadas de Limites**: O sistema impede que planos comerciais prometam capacidade de armazenamento ou fotos que excedam o teto do perfil técnico ativo (`infra_profile`), evitando propaganda enganosa ou descumprimento de oferta (CDC art. 30 e 35).
  3. **Política de Redução Não Destrutiva**: Em caso de redução administrativa de limites comerciais (ex: diminuir fotos do plano de 10 para 5), o conteúdo pré-existente do anunciante é integralmente preservado (bloqueio brando/grandfathering), nunca sofrendo exclusão sumária.
  4. **Travas em Feature Flags**: Funcionalidades reguladas que envolvam responsabilidade ou termos legais exigem vínculo com um ID formal de aprovação deste registro (ex: J-001 a J-006).
- **Quem Decidiu**: Usuário (Opção B formalizada no diálogo da Fase 18).
- **Evidência**: `supabase/migrations/20261113000004_config_architecture_and_upgrade.sql`, `src/lib/config/`, `src/lib/adapters/`, `src/app/admin/configuracoes/`, `docs/UPGRADE_PLAYBOOK.md`.
- **Pendência para o Advogado**:
  - Validar as cláusulas de bloqueio brando para assegurar respeito aos direitos adquiridos de anunciantes que assinaram planos com limites anteriores.
  - Avaliar se a documentação do DPA da AWS/Vercel atende integralmente às exigências de transferência internacional antes do início da cobrança comercial em produção.

---

### J-007 — Administração Completa do Núcleo, MFA e Governança de Papéis (Fase 19)
- **Data**: 2026-11-13
- **Fase**: Fase 19 — Administração Completa: Núcleo
- **Funcionalidade ou Texto**: Criação de hierarquia estrita de papéis (`owner`, `admin`, `moderator`, `support`), MFA obrigatório (TOTP AAL2) para rotas e ações administrativas, painel avançado de gestão de usuários em `/admin/usuarios` com ações de suspensão, bloqueio de e-mail e exclusão em duas etapas respeitando retenção legal, atribuição manual de planos com histórico e vigência, exportação auditada de logs imutáveis e garantia mandatória de não alteração de conteúdo alheio (Regra R7).
- **Regras e Normas Envolvidas**: R7, R10, R15, R16; Marco Civil da Internet (arts. 15 e 19); LGPD (arts. 6º, 16 e 46 — segurança e retenção); CDC art. 37.
- **Risco**: Médio (impacto em segurança de acesso de alto privilégio e conformidade com R7).
- **Decisão Tomada**:
  1. **Papéis Estritos**: O papel `owner` é exclusivo e único habilitado a alterar papéis de outros administradores e executar exclusões irreversíveis. `moderator` atua nas filas de aprovação/denúncia e `support` possui somente leitura.
  2. **Imutabilidade e Regra R7**: Moderadores e administradores **nunca** editam textos ou fotos de anunciantes. Apenas aprovam, rejeitam, ocultam ou solicitam correção formal (preservando a isenção de autoria do Marco Civil).
  3. **Segurança AAL2 (MFA)**: Acesso administrativo e ações críticas requerem autenticador TOTP verificado no servidor, com instruções de recuperação documentadas caso o dispositivo seja perdido.
  4. **Logs Imutáveis**: Bloqueio total de `UPDATE` e `DELETE` na tabela `admin_logs` via RLS; exportações para CSV geram registro telemático obrigatório.
- **Quem Decidiu**: Usuário (solicitação da Fase 19).
- **Evidência**: `docs/ADMIN_BOOTSTRAP.sql`, `src/lib/admin/`, `src/app/admin/usuarios/`, `src/app/admin/logs/`, `docs/RLS_MATRIX.md`.
- **Pendência para o Advogado**:
  - Validar se o procedimento de suspensão e bloqueio prevê notificação adequada do motivo ao usuário sem ferir direitos contratuais.

---

### J-008 — Gestão de Convites, Degustação, Campanhas e Slugs Restritos (Fase 20)
- **Data**: 2026-11-13
- **Fase**: Fase 20 — Convites, Testes, Campanhas e Configurações Globais
- **Funcionalidade ou Texto**: Sistema de convites com tokens protegidos por hash (`invite_links`), resgate único por usuário com concessão de período de teste parametrizável pelo proprietário, modo de cadastro controlado (`signup_mode`: aberto, somente convite, fechado), reversão diária automática ao plano gratuito após expiração do teste sem exclusão de mídias, criação de slugs personalizados de perfil com lista de bloqueio de termos de endosso ou oficiais, e agregação de campanhas (`ref`) sem rastreadores terceiros.
- **Regras e Normas Envolvidas**: R4, R5, R14, R16; CDC arts. 30, 36 e 37 (vedação de publicidade enganosa e endosso); Marco Civil art. 19; LGPD art. 6º (minimização e privacidade).
- **Risco**: Baixo a Médio (controle de acesso à plataforma, links promocionais e regras de nomenclatura pública de perfis).
- **Decisão Tomada**:
  1. **Controle Total do Proprietário**: A quantidade de dias de teste concedida por convite (ex: 7, 14, 30, 60 dias) é definida e editada livremente pelo proprietário no momento da criação ou edição do link.
  2. **Bloqueio de Slugs com Termos de Endosso (Regra R4)**: O sistema proíbe categoricamente o registro de endereços de perfil (`slug`) que contenham palavras de endosso governamental, garantia ou superioridade (ex: `oficial`, `melhor`, `certificado`, `garantido`, `prefeitura`, `procon`).
  3. **Neutralidade de Moderação e Avaliações (Regra R14)**: Usuários que entrarem por convites de campanha ou em períodos de teste **nunca** recebem selos de destaque editorial ou vantagens no algoritmo de ordenação de busca nem tratamento diferenciado em denúncias/avaliações.
  4. **Proteção de Tokens**: Nenhum token de convite é gravado em texto puro no banco de dados; apenas o hash criptográfico SHA-256 é persistido.
- **Quem Decidiu**: Usuário (solicitação da Fase 20 com ênfase no controle exclusivo de prazos pelo dono).
- **Evidência**: `supabase/migrations/20261113000006_invite_links_and_campaigns.sql`, `src/lib/invites/`, `src/app/convite/`, `src/app/admin/convites/`.
- **Pendência para o Advogado**:
  - Validar a lista de termos bloqueados para slugs para proteção marcária contra eventuais disputas de concorrência desleal entre profissionais de Jundiaí.

---

### J-009 — Curadoria de Conformidade e Moderação Reforçada (Fase 21)
- **Data**: 2026-11-13
- **Fase**: Fase 21 — Curadoria de Conformidade e Moderação Reforçada
- **Funcionalidade ou Texto**: Fila unificada de curadoria de conformidade com níveis de gravidade e contagem de prazo (SLA); revisão prévia de conteúdo comercial e patrocínios (`pending_paid_review` — Regra R6 / STF Tema 987); biblioteca de motivos de recusa baseada nas políticas públicas publicadas; rotulagem obrigatória e neutra de "Destaque patrocinado" ou "Destaque de teste" (sem juízo de valor ou endosso); ação imediata "Ocultar e preservar" para ilícitos graves; relatório mensal automatizado de auditoria de igualdade entre planos (R14 e R20); relatório anual de transparência de moderação.
- **Regras e Normas Envolvidas**: R4, R6, R7, R8, R9, R14, R16, R20; STF Tema 987 (responsabilidade por anúncios patrocinados); Marco Civil da Internet (art. 19); Código de Defesa do Consumidor (arts. 36 e 37 — identificação clara de publicidade e proibição de endosso enganoso); LGPD (art. 6º — transparência e dados agregados).
- **Risco**: Médio (processos de remoção de publicações, custódia probatória de ilícitos e governança de anúncios pagos).
- **Decisão Tomada**:
  1. **Natureza da Curadoria**: A moderação é exclusivamente de conformidade com regras objetivas das políticas públicas (ausência de dados de contato na vitrine não logada, ausência de termos de endosso ou promessa de garantia, ausência de fotos de terceiros ou ilícitos). É expressamente vedada a avaliação de gosto, mérito artesanal, beleza ou qualidade (Regras R4 e R20).
  2. **Revisão Prévia de Conteúdo Comercial (Regra R6)**: Perfis com planos pagos ou destaques adquiridos entram em `pending_paid_review`. O benefício de visibilidade patrocinada só é ativado após aprovação de conformidade documentada (registrando quem aprovou, data/hora e versão). Edição relevante do perfil reverte o estado para nova conferência.
  3. **Rotulagem Estrita de Publicidade**: Todo destaque de busca ou vitrine recebe apenas o rótulo "Destaque patrocinado" ou "Destaque de teste". É terminantemente proibido o uso de expressões como "escolha da equipe", "marceneiro recomendado" ou "melhor da região".
  4. **Segregação de Funções**: Moderadores e administradores são impedidos pelo sistema de aprovar ou auditar seus próprios conteúdos ou perfis.
  5. **Auditoria de Isonomia (R14 e R20)**: Relatório administrativo mensal compara o tempo médio de atendimento e a taxa de remoção de denúncias entre anunciantes gratuitos e pagos para comprovar em juízo a ausência de privilégio ou complacência comercial.
  6. **Transparência e Minimização**: O relatório anual de transparência é gerado em dados estatísticos agregados por categoria de infração, sem conter dados pessoais ou identificadores de usuários.
- **Quem Decidiu**: Usuário (solicitação formal da Fase 21).
- **Evidência**: `supabase/migrations/20261113000007_curadoria_conformidade.sql`, `src/lib/curadoria/`, `src/app/admin/curadoria/`, `src/__tests__/curadoria_conformidade.test.ts`.
- **Pendência para o Advogado**:
  - Homologação do catálogo de motivos formais de decisão vinculados a cada política pública.
  - Validação dos modelos de notificação para anunciantes e notificantes.

---

### J-010 — Busca Inteligente Nativa, Sinônimos e Ordenação Neutra (Fase 22)
- **Data**: 2026-11-14
- **Fase**: Fase 22 — Busca Inteligente (dentro do Postgres, sem serviço externo)
- **Funcionalidade ou Texto**: Busca inteligente com Postgres FTS (`unaccent` + `pg_trgm` + `tsvector` com peso), sinônimos gerenciados no admin (`search_synonyms`), tolerância a erros de digitação (trigrama), sugestões "Você quis dizer...?", autocomplete de especialidades e cidades com rate limit e cache, registro anônimo de termos sem resultado por dia (sem usuário, sem IP), ordenação rotativa e neutra por padrão (sem critério de "qualidade" ou recomendação implícita — R4, R5, R14, R20).
- **Regras e Normas Envolvidas**: R4 (sem endosso ou recomendação), R5 (ordenação neutra e transparente, destaque pago rotulado), R11 (minimização de dados, sem IP ou usuário no log de buscas sem resultado), R14 (igualdade de tratamento entre planos), R16 (registro contínuo no gate), R20 (sem julgamento de qualidade/mérito no algoritmo de busca); Marco Civil da Internet (art. 19); LGPD (art. 6º, III e VI — minimização e transparência).
- **Risco**: Baixo (mecanismo técnico de indexação e recuperação textual sem dependências externas nem perfilamento de usuários).
- **Decisão Tomada**:
  1. **Nenhum Critério Oculto de "Qualidade" (Regras R4 e R20)**: A ordenação por relevância baseia-se unicamente em correspondência textual (`ts_rank_cd`), similaridade de trigramas e data de publicação ou completude do perfil (preenchimento objetivo de bio, avatar e dados de contato), vedando pontuações por mérito subjetivo ou avaliação editorial.
  2. **Destaque Pago e Destaque de Degustação Sempre Rotulados (Regra R5)**: Planos com benefício de visibilidade aparecem no topo apenas rotulados expressamente como "Destaque patrocinado" ou "Destaque de teste", rotacionando de forma justa com outros anunciantes da mesma categoria.
  3. **Privacidade e Minimização Total nas Buscas (Regra R11)**: A tabela `search_no_results_log` registra unicamente a data do calendário e o termo buscado com contagem agregada, sem registrar IP, identificador de sessão, cookies ou dados do usuário.
  4. **Exclusão Estrita de Perfis Suspensos ou Despublicados**: A função `search_profiles` e as queries de autocomplete impõem obrigatoriamente a condição `is_published = true AND is_suspended = false`, garantindo que conteúdos moderados ou com restrição nunca figurem em resultados nem autocompletes.
  5. **Sem Dependência Externa**: Todo o mecanismo opera nativamente no Postgres do Supabase via extensões aprovadas (`unaccent`, `pg_trgm`), mantendo a autonomia da infraestrutura e custos previsíveis dentro do plano gratuito.
- **Quem Decidiu**: Usuário (solicitação formal da Fase 22).
- **Evidência**: `supabase/migrations/20261114000001_busca_inteligente.sql`, `src/lib/search/actions.ts`, `src/lib/search/schemas.ts`, `src/components/search/SearchBar.tsx`, `src/app/admin/busca/`, `src/__tests__/busca_inteligente.test.ts`.
- **Pendência para o Advogado**:
  - Validar a lista padrão de sinônimos moveleiros cadastrados para evitar que termos concorrenciais ou denominações genéricas interfiram indevidamente na visibilidade dos anunciantes.

---

### J-011 — Localização, Distância por Município e Blindagem de Privacidade (Fase 23)
- **Data**: 2026-11-14
- **Fase**: Fase 23 — Localização, Distância e Páginas por Cidade
- **Funcionalidade ou Texto**: Criação da tabela de municípios com códigos IBGE e coordenadas centrais oficiais; cálculo nativo de distância via fórmula de Haversine sem PostGIS; recurso "Perto de mim" processado 100% no navegador (cliente) sem transmissão de coordenadas de GPS para o servidor; região atendida por raio em km a partir do município-base sem endereço residencial exato; páginas públicas de serviços por cidade (`/servicos/[categoria]/[municipio-uf]`) geradas sob demanda apenas com perfis publicados; decisão expressa de não coletar nem consultar CEP neste momento.
- **Regras e Normas Envolvidas**: R4 (sem endosso ou garantia implícita por proximidade), R5 (ordenação neutra por proximidade voluntária do usuário), R11 (minimização absoluta de dados — vedação de coleta de coordenadas pessoais ou endereço exato), R14 (igualdade de tratamento), R16 (registro contínuo no gate); LGPD (Lei 13.709/2018, art. 6º, III — princípio da necessidade e minimização de dados sensíveis de localização); Marco Civil da Internet (art. 7º, VIII e IX — consentimento e proteção à vida privada).
- **Risco**: Baixo a Médio (tratamento de dados de localização de usuários e endereço de anunciantes).
- **Decisão Tomada**:
  1. **Fonte e Licença dos Dados dos Municípios**: O dataset de municípios é derivado da base pública aberta do IBGE (Instituto Brasileiro de Geografia e Estatística), sob regime de dados abertos governamentais (Lei 12.527/2011 e Decreto 8.777/2016 - licença de livre uso e reprodução com citação da fonte).
  2. **Privacidade Absoluta no "Perto de Mim" (Regra R11 / LGPD)**: A localização do usuário pelo navegador (`navigator.geolocation`) ocorre exclusivamente no aparelho do visitante, após consentimento explícito do browser. O cálculo para encontrar o município mais próximo é efetuado localmente em memória no cliente; ao servidor da Conecta Móveis trafega exclusivamente o código identificador do município. **Nenhuma coordenada geográfica (latitude/longitude) do usuário é enviada, armazenada ou registrada em logs**.
  3. **Endereço do Profissional**: Mantém-se a proibição de exigência ou exibição de logradouro, número ou CEP residencial de marceneiros e montadores autônomos. A referência geográfica é restrita ao centro do município e ao raio de atendimento em km (ex: "Atende Jundiaí e região até 30 km").
  4. **Decisão sobre CEP**: O CEP (Código de Endereçamento Postal) **não é incluído** nesta fase. Registra-se formalmente que o CEP constitui dado quase-identificador próximo de residência e que consultas automatizadas a serviços externos (ex: ViaCEP) dependem de prévia avaliação técnica e jurídica de disponibilidade e privacidade.
  5. **Geração Condicionada de Páginas por Cidade**: Páginas programáticas `/servicos/[categoria]/[municipio-uf]` só são publicadas e indexadas no sitemap quando há ao menos um anunciante ativo e publicado no município/categoria, impedindo a proliferação de páginas vazias (thin content) e falsas promessas de atendimento.
  6. **JSON-LD Estruturado Neutro**: A marcação semântica Schema.org/ItemList não conterá notas fictícias ou avaliações agregadas inventadas para simular autoridade perante motores de busca.
- **Quem Decidiu**: Usuário (solicitação formal da Fase 23).
- **Evidência**: `supabase/migrations/20261114000002_municipios_distancia_cidades.sql`, `src/lib/geo/`, `src/components/geo/`, `src/app/servicos/`, `src/__tests__/localizacao_distancia.test.ts`.
- **Pendência para o Advogado**:
  - Avaliar impacto futuro de integração com APIs de CEP para cálculo de frete ou deslocamento comercial quando houver monetização por serviço orçado fora da plataforma.






---

### J-012 — Fotos de Apresentação, Upload Avançado e Blindagem de Direitos Autorais (Fase 24)
- **Data**: 2026-11-14
- **Fase**: Fase 24 — Fotos de Apresentação e Upload Avançado
- **Funcionalidade ou Texto**: Sistema completo de fotos de apresentação substituindo o conceito de galeria genérica; compressão e conversão cliente com suporte nativo a HEIC (iPhone) e WebP; metas de 1280px (<=250KB) e thumbnail 400px (~30KB); hash perceptual (dHash) para detecção de duplicatas entre perfis; declaração de autoria e consentimento de terceiros por foto; classificação obrigatória da imagem ("foto de trabalho realizado" vs "imagem ilustrativa" com rótulo ostensivo conforme CDC art. 37); link externo HTTPS com `rel="noopener nofollow ugc"`; rotina de limpeza de arquivos órfãos do Storage e alerta a 70% de capacidade; renomeação de `/painel/portfolio` para `/painel/fotos` com redirecionamento permanente.
- **Regras e Normas Envolvidas**: R6 (revisão prévia antes de veiculação pública), R7 (qualquer ajuste por ação do próprio anunciante mantendo original até salvar), R11 (minimização: descarte obrigatório de dados EXIF e geolocalização no servidor), R16 (registro no Gate de Isenção), R20 (moderação por conformidade: triagem automática apenas prioriza a fila humana, nunca aprova nem remove sozinha); CDC (Lei 8.078/1990, art. 37 — vedação de publicidade enganosa através do rótulo obrigatório em artes ilustrativas); Lei de Direitos Autorais (Lei 9.610/1998, arts. 7º e 79 — autoria e cessão de fotos); Código Civil (arts. 20 e 21 — direitos de imagem e privacidade de terceiros).
- **Risco**: Médio (risco de veiculação de fotos de terceiros sem autorização, fotos de clientes ou ambientes residenciais com dados identificáveis, ou fotos ilustrativas vendidas como trabalho real).
- **Decisão Tomada**:
  1. **Princípio do Anunciante Ativo (Regra R7)**: Todo processamento gráfico ou recorte respeita a autonomia do anunciante. A imagem original permanece intacta na interface até confirmação expressa do envio.
  2. **Classificação da Imagem e Rótulo Ostensivo (CDC art. 37)**: Toda foto passa a ter classificação obrigatória: ou "Trabalho realizado" ou "Imagem ilustrativa". As imagens conceituais ou 3D recebem rótulo visual discreto e permanente no perfil ("Imagem ilustrativa"), evitando induzir o consumidor a erro sobre o resultado real do serviço.
  3. **Declaração de Autoria e Termo de Imagem de Terceiros**: O anunciante é obrigado a assinalar, antes do upload, a declaração de que é o autor ou detém autorização legítima e que eventuais pessoas identificáveis consentiram com a veiculação, acompanhada de aviso de boas práticas (evitar expor placas, fachadas com números e rostos).
  4. **dHash Apenas como Alerta Humano**: O cálculo do dHash perceptual detecta similaridade entre fotos de anunciantes diferentes, mas **nunca remove nem bloqueia automaticamente**, gerando alerta para triagem por moderador humano para evitar censura indevida de móveis padronizados.
  5. **Triagem Automática Sem Decisão Sozinha**: Qualquer mecanismo algorítmico de triagem atua unicamente para priorizar a fila de análise humana; o status inicial de qualquer foto enviada é impreterivelmente `pending`.
  6. **Links Externos Seguros (Item 10)**: Links de sites ou redes sociais do anunciante são restritos a HTTPS, com rel `noopener nofollow ugc` e aviso expresso de responsabilidade exclusiva do titular pelo conteúdo externo.
  7. **Limpeza Periódica de Órfãos**: Rotina automatizada e auditável em `orphan_cleanup_log` para purgar arquivos residuais não referenciados em banco de dados após 2 horas de criação.
- **Quem Decidiu**: Usuário (solicitações e diretrizes formais da Fase 24 em 2026-11-14).
- **Evidência**: `supabase/migrations/20261114000003_fotos_apresentacao.sql`, `src/lib/images/clientProcessor.ts`, `src/lib/portfolio/processor.ts`, `src/lib/profile/externalLink.ts`, `src/lib/portfolio/orphans.ts`, `src/components/fotos/ImageUploader.tsx`, `src/app/painel/fotos/`, `src/__tests__/fotos_apresentacao.test.ts`.
- **Pendência para o Advogado**:
  - Validar os termos formais da declaração de autoria e a extensão da solidariedade caso um anunciante afirme falsamente a autoria de foto pertencente a terceiro.
  - Avaliar se o rótulo "Imagem ilustrativa" atende plenamente ao padrão de informação clara e ostensiva exigido pelo PROCON/CDC para móveis planejados e marcenaria sob medida.

---

### J-013 — Segurança Cirúrgica e Resguardo LGPD (Fase 25)
- **Data**: 2026-11-14
- **Fase**: Fase 25 — Segurança Reforçada (Execução Cirúrgica de Baixo Risco)
- **Funcionalidade ou Texto**: Bloqueio local estático de e-mails descartáveis no cadastro; armadilha honeypot invisível para bots em solicitações de contato; rate limit local por IP/usuário para contatos; tabela interna de logs de erro (`app_error_logs`) no Postgres com sanitização prévia (scrubbing de dados pessoais/LGPD) e retenção curta (30 dias); políticas de senhas mínimas no servidor e verificação de integridade RLS das tabelas criadas.
- **Regras e Normas Envolvidas**: R10 (registros restritos), R11 (minimização de dados pessoais e proteção contra raspagem), R16 (Gate de Isenção); LGPD (Lei 13.709/2018, art. 6º, III e VII - minimização e segurança; art. 46 - medidas de segurança); Marco Civil da Internet (Lei 12.965/2014, art. 15).
- **Risco**: Baixo (implementações estritamente locais, aditivas e defensivas; descartados itens de risco médio/alto como CSP restritiva em tempo de execução, Turnstile externo e Sentry terceiro que gerariam dependências, custos ou quebras de tela).
- **Decisão Tomada**:
  1. **Exclusão de Riscos Médios e Altos**: Deliberada abstenção de adicionar Cloudflare Turnstile (dispensando subprocessador adicional e chamadas remotas de captcha) e Sentry externo (evitando transferência internacional e custos de plano). Mantida a estabilidade do Next.js sem CSP excessivamente restritiva que bloqueie assets dinâmicos.
  2. **Bloqueio Local de Provedores Temporários**: Lista estática local de e-mails descartáveis para impedir perfis e cadastros fraudulentos/fantasmas, sem consultas externas de rede.
  3. **Anti-raspagem com Honeypot**: Inclusão de campo armadilha transparente a usuários humanos no envio de contatos; preenchimento automático descarta o envio silenciosamente.
  4. **Scrubbing de Erros no Postgres**: Nova tabela restrita `app_error_logs` acessível somente por service_role/admin, com função de mascaramento para que emails, CPFs e telefones nunca sejam persistidos na pilha de erro.
  5. **Verificação de RLS**: Auditoria de ausência de bypass em tabelas de aplicação.
- **Quem Decidiu**: Usuário (orientação expressa de evitar itens de risco alto/médio e executar exclusivamente itens de baixo risco sem conflito).
- **Evidência**: `src/lib/auth/disposableEmails.ts`, `src/lib/security/honeypot.ts`, `src/lib/errors/logger.ts`, `supabase/migrations/20261114000004_seguranca_reforcada_cirurgica.sql`, `src/__tests__/seguranca_cirurgica.test.ts`.
- **Pendência para o Advogado**:
  - Homologar a lista de dados coletados em incidentes e confirmar se a retenção de 30 dias de erros anônimos cumpre os parâmetros de governança da ANPD.

---

### J-014 — Capacidade no Gratuito, Monitoramento de Cotas, Backup Seguro e PWA Mínimo (Fase 26)
- **Data**: 2026-11-14
- **Fase**: Fase 26 — Capacidade para 300 Usuários no Gratuito, Backup e PWA
- **Funcionalidade ou Texto**: Estratégia de dimensionamento e controle de consumo para operar estritamente dentro dos tetos gratuitos (Supabase Free: 500 MB DB / 1 GB Storage; Vercel Hobby: 100 GB banda); painel de capacidade administrativa em `/admin/capacidade` com alertas preditivos em 70% e 90%; PWA mínimo nativo do Next.js (`manifest.ts`) sem service worker intrusivo e sem persistência offline de dados privados de titulares; workflow automatizado de backup via GitHub Actions (com segredos no cofre e pg_dump) sem expor credenciais no repositório; rotina de expurgo automatizada com verificação periódica de limites.
- **Regras e Normas Envolvidas**: R1 (isenção de cobrança prematura), R10 (expurgo periódico de retenções legais), R11 (PWA sem armazenamento local de dados de terceiros), R16 (Gate de Isenção); LGPD (arts. 46 e 48 — continuidade e segurança da informação através de rotinas de backup isoladas); Marco Civil da Internet (art. 15).
- **Risco**: Baixo (otimizações de cache, arquivos descritivos de manifesto PWA sem risco de regressão funcional, scripts de backup assíncronos e painel administrativo meramente consultivo).
- **Decisão Tomada**:
  1. **Teto Gratuito Garantido**: A plataforma é configurada e monitorada para suportar até 300 anunciantes com 3 fotos (1 capa + 2 perfil) dentro do limite de 1 GB do Supabase Free. Alertas visuais no painel administrativo a 70% e 90% informam o proprietário com antecedência sobre a necessidade futura de upgrade.
  2. **PWA Mínimo e Seguro (Item 5)**: O manifesto PWA é gerado via rota nativa do Next.js (`src/app/manifest.ts`), permitindo atalho na tela inicial do celular sem registrar Service Workers complexos que pudessem cachear dados pessoais ou prender versões antigas em navegadores de usuários.
  3. **Rotina de Backup Isolada e Segura (Item 4)**: Documentação e workflow do GitHub Actions (`.github/workflows/db-backup.yml`) usando segredos externos (`DB_CONNECTION_STRING`), nunca com credenciais comitadas.
  4. **Atualização de LIMITES_INFRA.md**: Documentadas as métricas reais medidas para 300 anunciantes e gatilhos objetivos para contratação do plano pago quando houver monetização.
- **Quem Decidiu**: Usuário (orientação para manter o projeto 100% no plano gratuito com segurança até início de lucros consistentes).
- **Evidência**: `src/app/manifest.ts`, `src/app/admin/capacidade/page.tsx`, `src/components/admin/AdminCapacidadeClient.tsx`, `.github/workflows/db-backup.yml`, `docs/LIMITES_INFRA.md`, `src/__tests__/capacidade_pwa.test.ts`.
- **Pendência para o Advogado**:
  - Verificar se a política de contingência e backup documentada atende ao padrão esperado de conformidade de segurança e mitigação de risco de incidentes da LGPD.

---

### J-015 — Homologação Jurídico-Técnica e Dossiê Consolidado (Fase 27)
- **Data**: 2026-11-14
- **Fase**: Fase 27 — Homologação Jurídico-Técnica e Dossiê Final
- **Funcionalidade ou Texto**: Auditoria final de entrega do projeto, consolidação da Matriz de Conformidade com 25 regras técnicas de isenção, elaboração do `DOSSIE_ADVOGADO.md` contendo todos os fluxos operacionais, governança LGPD, política de retenção, arquitetura de moderação por gravidade e mapeamento honesto de bloqueadores do lançamento comercial (CNPJ formal do operador, domínio próprio e provedor SMTP transacional).
- **Regras e Normas Envolvidas**: Todas as Regras de Ouro R1 a R25; Marco Civil da Internet (Lei 12.965/2014, arts. 15 e 19); STF Temas 987 e 533; CDC (Lei 8.078/1990, arts. 3º, 14, 30, 31, 36-38 e 51); LGPD (Lei 13.709/2018, arts. 6º, 7º, 18, 19, 46 e 48); Código Civil (arts. 186, 187, 593 e 722); Decreto 7.962/2013 (Comércio Eletrônico).
- **Risco**: Baixo (fase estritamente documental, analítica e de homologação, sem alteração de código operacional).
- **Decisão Tomada**:
  1. **Encerramento da Suíte Técnico-Jurídica**: Homologação de 257 testes automatizados sem nenhuma falha, validação de ausência de vocabulário de endosso pelo script `check:isencao` e integridade das políticas de acesso RLS.
  2. **Dossiê Pré-constituído**: Geração do documento probatório de boa-fé objetiva (`docs/DOSSIE_ADVOGADO.md`) para resguardar a plataforma perante PROCON, ANPD, autoridade policial e juizados especiais.
  3. **Identificação Clara de Bloqueadores Reais**: Ficam expressamente mapeados como pré-requisitos para operação pública: preenchimento de CNPJ/razão social em `app_settings`, contratação de SMTP próprio (Resend) e ativação do domínio definitivo `conectamoveis.com.br`.
- **Quem Decidiu**: Usuário (orientação para consolidação final e operação amparada estritamente na legislação brasileira vigente).
- **Evidência**: `docs/DOSSIE_ADVOGADO.md`, `docs/MATRIZ_CONFORMIDADE.md`, `docs/REGISTRO_JURIDICO.md`, `README.md`, `CHANGELOG.md`, `TODO.md`.
- **Pendência para o Advogado**:
  - Nenhuma pendência impeditiva técnica; os documentos gerados constituem o dossiê probatório integral para eventual apresentação a órgãos fiscalizadores.

---

### J-016 — Correção de Textos, Eliminação de Dados Fictícios e Peso da Home
- **Data**: 2026-11-14
- **Fase**: Ajuste Especial — Correção de Textos, Dados Fictícios e Peso da Home
- **Funcionalidade ou Texto**: Remoção de métricas fictícias estáticas (+120 profissionais, anos de atuação, tempos de resposta inventados); condicionamento do contador público a dados reais do banco com flag e teto mínimo; estado vazio honesto na vitrine quando sem perfis reais; eliminação de cards de demonstração em produção; substituição de termos de endosso/qualidade pela tabela oficial neutra; cláusula de resguardo sobre gratuidade de lançamento e comunicação prévia de alterações de planos/preços; identificação do operador no rodapé como "em processo de formalização" com bloqueio estrito de faturamento enquanto não houver CNPJ; geração de variantes WebP pré-otimizadas da imagem de fundo da Home (desktop e mobile); FAQ 100% legível e acessível; atualização da trava `check:isencao`.
- **Regras e Normas Envolvidas**: R3 e R4 (ausência de endosso e contratação direta), R5 (ordenação neutra), R13 (identificação do operador), R16 (Gate de Isenção); CDC (Lei 8.078/1990, art. 30 e 37 — publicidade enganosa por dados fictícios); Marco Civil da Internet (art. 19).
- **Risco**: Baixo (refinamento de textos e otimização de ativos, sem quebra de regras de negócio).
- **Decisão Tomada**:
  1. **Veracidade Estrita (CDC art. 37)**: Proibição de números fictícios no frontend. Se não houver perfis reais suficientes cadastrados, exibe-se convite honesto para pioneiros.
  2. **Gratuidade Condicional e Futura Cobrança**: Ajuste dos textos de gratuidade para vincular ao período de lançamento com aviso prévio de alterações, viabilizando transição comercial futura sem quebra de expectativa do consumidor.
  3. **Identificação Operacional Segura**: Rodapé exibe "Operador: em processo de formalização" e e-mail real, mantendo bloqueio automático de monetização no backend até formalização fiscal.
  4. **Performance e Acessibilidade**: Otimização estática de imagens sem sobrecarga de CDN e garantia de acessibilidade no FAQ.
- **Quem Decidiu**: Usuário (orientação para transparência absoluta e resguardo comercial/jurídico).
- **Evidência**: `src/app/page.tsx`, `src/components/layout/Footer.tsx`, `src/components/ui/FaqSection.tsx`, `scripts/check-isencao.mjs`, `public/images/`.
- **Pendência para o Advogado**:
  - Homologar o prazo exato (ex: 30 dias) para notificação prévia de alteração de planos aos anunciantes cadastrados na fase de lançamento.

---

### J-017 — Configuração Central de Marca, Domínio e Isolamento Provisório (Bloco 0)
- **Data**: 2026-11-15
- **Fase**: Ajuste Final Pré-Divulgação — Bloco 0 (Marca, Domínio e Configuração Central)
- **Funcionalidade ou Texto**: Criação de centralizador tipado de marca (`src/lib/config/brand.ts` e registro de configurações) cobrindo: nome, nome curto, slogan, região de foco, URL base, e-mails de atendimento/titulares/notificações/autoridades, razão social, CNPJ e a flag `brand_provisional`; script `npm run brand:audit` para auditoria estrita de referências fixas no código; substituição de imagens de logo por SVG paramétrico/tipográfico dinâmico; bloqueio de indexação pública (noindex global e sitemap vazio) enquanto `brand_provisional` estiver ativo; canais de contato não configurados exibem "em implantação"; bloqueio rigoroso de ativação de cobranças comerciais enquanto o operador estiver em formalização.
- **Regras e Normas Envolvidas**: R13 (identificação do operador), R16 (Gate de Isenção), R17 (responsabilidade nos termos da lei); CDC (arts. 30, 31, 37); Decreto 7.962/2013 (Comércio Eletrônico); Marco Civil da Internet (art. 19).
- **Risco**: Baixo (reestruturação arquitetural de constantes e governança de metadados, sem risco de regressão de negócio).
- **Decisão Tomada**:
  1. **Centralização e Desacoplamento de Marca**: Todo o frontend, layouts, e-mails, metadados e termos de uso passam a ler de um único objeto de configuração tipado, permitindo alteração de nome fantasia ou domínio sem refatoração de código.
  2. **Proteção de Indexação Precoce**: Manter `brand_provisional = true`, ativando meta tag `noindex, nofollow` e sitemap restrito para impedir indexação pública com domínio ou marca não definitivos.
  3. **Identificação Honesta**: Canais de atendimento ausentes exibem "em implantação", impedindo falsas expectativas do usuário ou promessas fictícias.
- **Quem Decidiu**: Usuário (orientação para proteção antes de compras de domínio ou divulgação externa).
- **Evidência**: `src/lib/config/brand.ts`, `scripts/brand-audit.mjs`, `src/app/robots.ts`, `src/app/sitemap.ts`, `src/components/layout/Header.tsx`, `src/components/layout/Footer.tsx`.
- **Pendência para o Advogado**:
  - Definição final da denominação social, marca definitiva a ser submetida ao INPI e e-mail formal do encarregado de dados (DPO/LGPD).


---

### J-018 — Integridade de Dados, Afirmações e Conformidade LGPD (Bloco 1)
- **Data**: 15/11/2026
- **Fase**: Ajuste Final Pré-Divulgação — Bloco 1 (Integridade de Dados e Afirmações)
- **Funcionalidade ou Texto**:
  1. **(1.2)** Redução do limite máximo de bio de 800 para 600 caracteres em professionalProfileSchema; adição de reak-words (Tailwind) nos elementos de exibição de bio em cards e página de perfil, prevenindo overflow por palavras longas.
  2. **(1.3)** Remoção do selo "Perfil completo" incondicional dos cards de busca (ausência de dados de portfólio na query de listagem torna o critério objetivo impossível de verificar nessa camada). Na página de perfil completo, o selo foi renomeado para "Perfil com fotos" e agora é exibido apenas se io.length >= 80 E portfolio.length > 0.
  3. **(1.6)** Remoção do endereço e telefone específicos do Procon Jundiaí da página /contrate-com-seguranca; substituição por "Procon da sua cidade (consulte o site da prefeitura)". Referência ao Juizado Especial Cível mantida em texto genérico sem endereço — pendente confirmação do usuário para inclusão.
  4. **(1.7)** Remoção de afirmações de conformidade não verificadas: "Em conformidade com a LGPD" (subtítulo de Privacidade); "Cumpre a LGPD e o Marco Civil da Internet com seriedade" (Função da Plataforma); "para impedir fotos impróprias, ofensas e fraudes" substituído por "analisa denúncias e conteúdos conforme regras públicas e uniformes da plataforma". Substituição de "DPO" por "Encarregado" / "Responsável pela proteção de dados (encarregado)" em toda Política de Privacidade; "logs de conexão e acesso a aplicações" → "registros de acesso a aplicações"; campo de coleta corrigido para refletir o formulário real (sem nome completo no cadastro inicial); subprocessadores e rotinas de retenção marcados como "(em implantação)" onde não estão operacionais.
  5. **(1.8)** Faixa "Versão Preliminar" substituída em produção por "Documento em revisão. Última atualização: dd/mm/aaaa"; data agora lida de LEGAL_DATE (config centralizada, formato dd/mm/aaaa).
  6. **(1.9)** Flag eviews_enabled já existia em src/lib/config/registry.ts. Padrão: desligada. Critério "Por Avaliação dos Usuários" em SearchFilters agora é condicional à prop eviewsEnabled. Página /encontrar-profissionais busca o valor real da flag em paralelo com os resultados de busca. A ReviewsSection completa (incluindo textos "Sem avaliações ainda" e "interações reais") já é ocultada quando eviewsEnabled = false pela lógica condicional existente na página de perfil.
- **Regras e Normas Envolvidas**: R3, R4 (ausência de endosso); R16 (Gate de Isenção); R17; R27 (avaliações por flag); LGPD arts. 6º, 46 e 50 (minimização, honestidade sobre implementação); CDC arts. 30, 31 e 37 (publicidade enganosa, informação verdadeira).
- **Risco**: Baixo (correções de texto e validação de dados; sem mudança de regras de negócio ou schema de banco).
- **Decisão Tomada**:
  1. **Bio 600 chars**: Redução do limite máximo para evitar apresentações desnecessariamente longas e manter consistência com a spec.
  2. **Selo no card removido**: Sem has_photos na query de listagem, qualquer selo baseado em portfólio seria inverídico; opção mais segura é remover do card e manter só no perfil completo.
  3. **Procon genérico**: Referência a endereço específico de Procon Jundiaí removida; informação genérica preserva utilidade sem criar obrigação de manutenção de dados de terceiros.
  4. **JEC**: Mantido em texto genérico sem endereço — aguarda confirmação do usuário para incluir referência ao Juizado Especial Cível.
  5. **Encarregado vs DPO**: LGPD usa "encarregado" (art. 41); "DPO" é termo GDPR. Substituição alinha a terminologia à lei nacional.
  6. **Retenção "em implantação"**: Rotinas automáticas de expurgo (90 dias e 6 meses) listadas como planejadas/em implantação enquanto não houver confirmação de que os jobs estão efetivamente rodando em produção.
- **Quem Decidiu**: Usuário (bloco de correções aprovado para execução com supervisão técnica).
- **Evidência**: src/lib/profile/schemas.ts, src/components/search/ProfessionalCard.tsx, src/app/profissionais/[slug]/page.tsx, src/app/contrate-com-seguranca/page.tsx, src/app/funcao-da-plataforma/page.tsx, src/app/privacidade/page.tsx, src/app/termos/page.tsx, src/components/legal/LegalBanner.tsx, src/lib/legal/config.ts, src/components/search/SearchFilters.tsx, src/app/encontrar-profissionais/page.tsx.
- **Pendência para o Advogado**:
  - Confirmar prazo e forma da rotina de expurgo automático de registros de acesso (6 meses — Marco Civil art. 15).
  - Revisar se "Responsável pela proteção de dados (encarregado)" satisfaz plenamente o art. 41 da LGPD quanto à identificação pública.
  - Confirmar se a referência ao JEC deve ser mantida com indicação de localização genérica ou removida.


---

### J-019 — Correção de Bugs de Fluxo, Redirecionamento Seguro e Governança de Formulários (Bloco 2)
- **Data**: 15/11/2026
- **Fase**: Ajuste Final Pré-Divulgação — Bloco 2 (Bugs de Fluxo e Links)
- **Funcionalidade ou Texto**:
  1. **(2.1)** Resolução de visibilidade de perfis: Mapeamento de user_id em PublicProfessional (searchProfessionals) para identificação segura do dono na vitrine. Todos os perfis publicados são visíveis para anônimos, usuários comuns, donos e administradores. O anunciante autenticado visualiza no seu próprio card o rótulo "Seu anúncio". No Painel do Profissional (/painel/perfil e sidebar do /painel), inclusão de botão "Ver como visitante" apontando diretamente para /profissionais/[slug].
  2. **(2.2)** Padronização de retorno pós-login: Unificação de todos os pontos de retorno sob o parâmetro único edirect; eliminação do parâmetro vazio ?next= no botão "Entrar para contatar" do ContactForm (agora dinâmico com usePathname()); implementação de validação rigorosa anti open-redirect em SignInForm (bloqueio de URLs externas, esquemas javascript e barras duplas //, aceitando apenas caminhos internos relativos iniciados com /).
  3. **(2.3)** Governança e textos de /planos: Eliminação de "Plano Atual" duplicado para visitantes anônimos (condicionado estritamente a usuário autenticado); substituição de "Fase MVP" por "Período de lançamento", "Investimento" por "Preço", e "portfólio" por "fotos de apresentação"; criação do botão "Tenho interesse" conectado à ação egisterPlanInterest na tabela plan_interest; integração dos limites de fotos e categorias com o registro de configurações (SYSTEM_SETTINGS_REGISTRY), adotando o padrão gratuito de 1 imagem no card + 2 no perfil (total de 3 fotos e 1 categoria).
  4. **(2.4)** Formulários sem tela vazia e moderação de denúncias: Criação de esqueletos estruturados no servidor (SignInFormSkeleton, SignUpFormSkeleton, NotificarConteudoSkeleton) substituindo a mensagem crua "Carregando formulário…"; no fluxo de denúncias (/denunciar), a declaração formal de titularidade de direitos passa a ser exigida apenas para categorias autorais (copyright_image, 	rademark), sendo os dados de contato (nome e e-mail) obrigatórios nesses casos; para suspeita de golpe/fraude, ofensa, conteúdo grave ou termos, adota-se declaração estrita de boa-fé, com nome e e-mail opcionais para preservar canais anônimos de denúncia pública.
  5. **(2.5)** Rastreamento e confirmação de rotas: Confirmação e validação de funcionamento das rotas /autoridades, /recuperar-senha, /como-ordenamos-os-resultados e /painel/seguranca; reformulação de 
ot-found.tsx (404) e error.tsx com interface amigável, ícones, atalho para busca e retorno seguro à página inicial.
- **Regras e Normas Envolvidas**: R3, R4 (ausência de endosso), R5 (neutralidade na busca), R8 (notificação e retirada com protocolo), R9 (ocultação de ilícito grave), R11 (minimização de dados), R16 (Gate de Isenção), R17 (responsabilidade nos termos da lei); Marco Civil da Internet (art. 19); CDC (arts. 30, 31 e 37).
- **Risco**: Baixo (correções arquiteturais de fluxo e segurança de roteamento, sem quebra de integridade de banco de dados).
- **Decisão Tomada**:
  1. **Anti Open-Redirect**: Proteção estrita contra ataques de phishing impedindo qualquer redirecionamento após autenticação para domínios externos.
  2. **Denúncias e Canal Cidadão**: Respeito à possibilidade de denúncias anônimas de boa-fé para infrações graves e golpes, mantendo a qualificação formal obrigatória apenas quando requerida pela Lei de Direitos Autorais (Lei 9.610/98) e Propriedade Industrial (Lei 9.279/96).
  3. **Identificação Transparente do Próprio Anúncio**: Usuários e administradores autenticados veem o rótulo "Seu anúncio" no card da busca, evitando confusão sobre como o perfil é exibido ao público.
- **Quem Decidiu**: Usuário (orientação para execução cirúrgica do Bloco 2).
- **Evidência**: src/lib/search/actions.ts, src/components/search/ProfessionalCard.tsx, src/app/encontrar-profissionais/page.tsx, src/components/auth/SignInForm.tsx, src/components/contact/ContactForm.tsx, src/components/plans/PlansClient.tsx, src/lib/plans/actions.ts, src/components/takedown/NotificarConteudoClient.tsx, src/lib/takedown/actions.ts, src/app/not-found.tsx, src/app/error.tsx, src/__tests__/bloco2_fluxo_links.test.ts.
- **Pendência para o Advogado**:
  - Validar se o canal anônimo de denúncias para crimes graves atende aos requisitos operacionais e de guarda de logs do Marco Civil da Internet (art. 15).

---

### J-020 — Padronização de Linguagem, Glossário Anticomissões e SEO Neutro (Bloco 3)
- **Data**: 16/11/2026
- **Fase**: Ajuste Final Pré-Divulgação — Bloco 3 (Textos, Glossário e SEO)
- **Funcionalidade ou Texto**:
  1. **(3.1)** Padronização de papéis e vocabulário: Adotado "profissional" para anunciantes e "você" / "quem procura" para os usuários em busca de serviços, eliminando "contratante", "contratado" e "prestador". A expressão "fotos de apresentação" substituiu "portfólio" em todas as áreas públicas do site e na documentação legal. "Cadastre-se" foi padronizado para "Criar conta". O termo "catálogo" foi consolidado para designar o diretório de anúncios.
  2. **(3.2)** Aplicação da tabela De/Para:
     - "A Rede Direta do Setor Moveleiro" → "Encontre montadores e marceneiros em Jundiaí e região".
     - "localizar" → "encontrar"; termos "sem promessas ilusórias" e "sem barreiras" removidos.
     - "Nenhum percentual ou porcentagem" / "Zero Taxa" → "Sem comissão sobre serviços" e "A plataforma não recebe pagamento pelos serviços e não cobra comissão sobre eles".
     - "Aviso aos Contratantes" → "Aviso"; "Avaliações e Reputação" → "Avaliações".
     - "Contatos Autorizados" → "Contato"; "Proteção de Contato (Anti-Spam / LGPD)" → "Entre na sua conta gratuita para ver o WhatsApp. Isso protege os profissionais de mensagens indesejadas.".
     - "Transparência e Responsabilidade Civil" → "O que a plataforma faz e não faz"; "Aviso de Isenção" → "Aviso importante".
     - "Polo Regional" → "Cidade ou bairro"; "Orientações de Segurança para Contratação" → "Dicas para combinar o serviço com segurança" (link do rodapé: "Dicas de segurança").
     - Concordância gramatical de busca: "Exibindo X a Y de Z profissionais" com singular "profissional" quando Z = 1.
     - Jargão do setor traduzido para leigos em `CATEGORIES_CATALOG`: "Renderização Fotorrealista" → "Imagens 3D realistas"; "Planta Técnica de Fabricação" → "Projeto técnico para fábrica"; "Usinagem CNC" → "Corte e furação por CNC"; "Grandes Lotes e Franquias" → "Produção em grande volume" (mantendo slugs inalterados).
     - Categorias atualizadas: "Marceneiro (autônomo)" e "Marcenaria e fábrica".
     - Resumos executivos amigáveis ("Em resumo:") adicionados no topo de `/termos`, `/privacidade` e `/funcao-da-plataforma`.
  3. **(3.3)** SEO e Metadados Neutros: Verificação e padronização dos títulos para evitar duplicações de marca e expressões promocionais; remoção de "com segurança" das descrições de páginas públicas.
- **Regras e Normas Envolvidas**: R3, R4 (ausência de endosso e imparcialidade); R5 (neutralidade na busca); R16 (Gate de Isenção); R17 (responsabilidade legal clara); CDC arts. 30, 31, 36 e 37 (informação clara, proibição de promessas de resultado); Marco Civil da Internet art. 19.
- **Risco**: Baixo (harmonização e padronização textual cirúrgica; sem alterações em bancos de dados ou rotas).
- **Decisão Tomada**:
  1. **Eliminação de vocabulário de intermediação**: A eliminação de "prestador", "contratante" e "contratado" reforça jurídica e semanticamente que a plataforma não participa do contrato ou prestação do serviço.
  2. **Tradução de jargão para linguagem leiga**: Aproximação do consumidor final mantendo integridade técnica dos slugs no banco de dados e APIs.
  3. **Resumos executivos**: Apresentação de pontos essenciais em linguagem simples antes do texto normativo integral melhora a transparência exigida pelo CDC e pela LGPD.
- **Quem Decidiu**: Usuário (aprovação do escopo de execução do Bloco 3).
- **Evidência**: `src/lib/profile/schemas.ts`, `src/components/ui/Hero.tsx`, `src/components/ui/SearchBox.tsx`, `src/components/ui/ProCtaSection.tsx`, `src/components/ui/FaqSection.tsx`, `src/components/reviews/ReviewsSection.tsx`, `src/components/layout/Footer.tsx`, `src/components/layout/UserNavDropdown.tsx`, `src/components/profile/ProfileWizard.tsx`, `src/app/page.tsx`, `src/app/como-funciona/page.tsx`, `src/app/encontrar-profissionais/page.tsx`, `src/app/profissionais/[slug]/page.tsx`, `src/app/empresas/[slug]/page.tsx`, `src/app/contrate-com-seguranca/page.tsx`, `src/app/como-ordenamos-os-resultados/page.tsx`, `src/app/planos/page.tsx`, `src/app/termos/page.tsx`, `src/app/privacidade/page.tsx`, `src/app/funcao-da-plataforma/page.tsx`, `src/app/painel/page.tsx`, `src/app/painel/assinatura/page.tsx`, `src/app/servicos/[categoria]/[municipio-uf]/page.tsx`, `src/app/(legal)/politica-portfolio/page.tsx`, `src/app/(legal)/politica-assinatura/page.tsx`.
- **Pendência para o Advogado**:
  - Homologar as caixas de resumo executivo ("Em resumo:") nas páginas jurídicas para assegurar conformidade plena com o dever de informação clara do CDC (art. 6º, III).

---

### J-021 — Busca, Filtros, Cards e Captação de Demanda sem Spam (Bloco 4)
- **Data**: 16/11/2026
- **Fase**: Ajuste Final Pré-Divulgação — Bloco 4 (Busca, Filtros e Cards)
- **Funcionalidade ou Texto**:
  1. **(4.1) Filtros Pré-selecionados e Responsividade**: UF padrão 'SP', campo de cidade alimentado dinamicamente com `<select>` via base de municípios geográficos; especialidades vinculadas e atualizadas dinamicamente conforme categoria escolhida; no mobile gaveta com botão claro "Ver resultados".
  2. **(4.2) Cards de Anunciantes**: Texto de bio truncado, foto ou iniciais com atributo descritivo de acessibilidade (`title`), cidade/estado em destaque, exibição de até 3 especialidades com contador residual, rótulo inferior padronizado para "Publicado pelo anunciante" (eliminando jargão ou ambiguidade de endosso).
  3. **(4.3) Estado Vazio com Sugestões e Formulário "Avise-me"**: Exibição de chips de sugestão para ampliar a busca quando 0 resultados forem encontrados; formulário "Avise-me quando houver profissional" com consentimento explícito LGPD (checkbox obrigatório e link para Política de Privacidade), armazenamento anônimo e idempotente na tabela `alert_requests` com RLS restrito.
- **Regras e Normas Envolvidas**: R3, R4 (ausência de endosso e imparcialidade); R5 (neutralidade e transparência da busca); R16 (Gate de Isenção); LGPD arts. 7º, I (consentimento) e 6º (transparência e finalidade).
- **Risco**: Baixo (aprimoramento de UX de busca e captação de lead passivo sem tracking nem cookies).
- **Decisão Tomada**: Implementação com RLS estrito onde apenas service_role e admins leem requisições de alerta, e proteção silenciosa contra spam e enumeração de e-mails em duplicatas.
- **Quem Decidiu**: Usuário (orientação para execução cuidadosa do Bloco 4).
- **Evidência**: `src/components/search/SearchFilters.tsx`, `src/components/search/ProfessionalCard.tsx`, `src/app/encontrar-profissionais/page.tsx`, `src/components/search/AviseMeForm.tsx`, `src/lib/alerts/actions.ts`, `supabase/migrations/20261116000001_alert_requests.sql`, `src/__tests__/bloco4_busca_cards.test.ts`.
- **Pendência para o Advogado**:
  - Homologar o texto de consentimento da captura de e-mails para aviso de disponibilidade regional.

---

### J-022 — Home Reestruturada, Navegação em Duas Trilhas e Página Dedicada aos Profissionais (Bloco 5)
- **Data**: 16/11/2026
- **Fase**: Ajuste Final Pré-Divulgação — Bloco 5 (Home, Navegação e Página para Profissionais)
- **Funcionalidade ou Texto**:
  1. **(5.1) Home Transparente e Sem Promessas**:
     - H1 padronizado: *"Encontre montadores e marceneiros em Jundiaí e região"*.
     - Subtítulo simples e objetivo, destacando catálogo aberto e contato direto via WhatsApp.
     - Busca com rótulos amigáveis: *"O que você procura"*, *"Cidade ou bairro"* e botão *"Buscar"*.
     - Dois caminhos claros e contrastantes: *"Procurar Profissionais"* e *"Divulgar meu trabalho"*.
     - Aviso legal discreto e informativo reposicionado no topo da página (acima da dobra), alertando sobre a não-intermediação e ausência de garantia da plataforma.
  2. **(5.2) Página Dedicada `/para-profissionais`**:
     - Criada rota institucional `/para-profissionais` detalhando apenas benefícios reais e já operacionais (contato direto no WhatsApp, sem cobrança de comissões sobre serviços, fotos de apresentação).
     - Passo a passo transparente de cadastro em 3 etapas sem promessas ilusórias de clientes ou ganhos financeiros.
     - Aviso legal de função e limites da plataforma.
     - Link para planos comerciais `/planos` incorporado dentro da página.
     - Menu de navegação principal (Desktop e Mobile) e rodapé atualizados para apontar *"Para Profissionais"* para a nova rota `/para-profissionais`.
  3. **(5.3) Página "Como Funciona" com Duas Trilhas**:
     - Reestruturação completa de `/como-funciona` dividida em:
       - **Trilha 1 (Quem procura):** Busca no catálogo, exigência de login em conta gratuita para visualização do WhatsApp (proteção dos profissionais contra spam/LGPD) e negociação direta.
       - **Trilha 2 (Quem anuncia):** Criação de conta gratuita no lançamento, publicação de anúncio com fotos de apresentação e recebimento de contatos diretos no WhatsApp.
     - Caixa de transparência legal com links para dicas de segurança e função da plataforma.
- **Regras e Normas Envolvidas**: R1, R2 (ausência de intermediação financeira e comissões); R3, R4 (ausência de promessas de resultado ou garantia); R16 (Gate de Isenção); R17 (responsabilidade limitada à divulgação); CDC arts. 30, 31, 36 e 37.
- **Risco**: Baixo (aprimoramento arquitetural de navegação e transparência informativa; conformidade integral com regras de isenção).
- **Decisão Tomada**: Todas as chamadas para anunciantes descrevem estritamente a divulgação de vitrine sem prometer captação de clientes ou faturamento, mitigando risco de responsabilização civil por expectativa frustrada.
- **Quem Decidiu**: Usuário (orientação para execução cuidadosa e cirúrgica do Bloco 5).
- **Evidência**: `src/components/ui/Hero.tsx`, `src/components/ui/SearchBox.tsx`, `src/app/page.tsx`, `src/app/para-profissionais/page.tsx`, `src/app/como-funciona/page.tsx`, `src/components/layout/HeaderClient.tsx`, `src/components/layout/Footer.tsx`.
- **Pendência para o Advogado**:
  - Validar os textos explicativos das trilhas em `/como-funciona` e da proposta de valor em `/para-profissionais`.


