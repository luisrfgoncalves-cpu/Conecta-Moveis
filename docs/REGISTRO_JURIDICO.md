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

