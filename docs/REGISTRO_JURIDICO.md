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
