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


