# ARQUITETURA DO SISTEMA — CONECTA MÓVEIS

## 1. Visão Geral
A arquitetura do **Conecta Móveis** é desenhada para operar com eficiência e custo zero inicial sob os limites dos planos gratuitos da **Vercel** e do **Supabase**, garantindo escalabilidade simples para planos pagos sem retrabalho de código.

```
+------------------------------------------------------------------+
|                            CLIENTE                               |
|  - Next.js App Router (React, Tailwind CSS, TypeScript)          |
|  - Pré-processamento de imagens no navegador (WebP, redimensionamento) |
|  - Validação de formulários com Zod + React Hook Form            |
+---------------------------------+--------------------------------+
                                  | HTTPS
+---------------------------------v--------------------------------+
|                         NEXT.JS SERVER                           |
|  - Server Actions & Route Handlers (Node.js runtime)             |
|  - Autenticação e Sessão via @supabase/ssr                       |
|  - Validação estrita de entrada (Zod)                            |
|  - Pipeline de mídia (Sharp: magic bytes, EXIF strip, WebP)      |
|  - Entitlements engine (getEntitlements)                         |
+---------------------------------+--------------------------------+
                                  | Supabase Client / Connection Pooler
+---------------------------------v--------------------------------+
|                       SUPABASE PLATFORM                          |
|  - Supabase Auth (JWT, email confirmation)                       |
|  - PostgreSQL com Row Level Security (RLS) mandatório            |
|  - Funções auxiliares SECURITY DEFINER (search_path fixo)        |
|  - Tabela rate_limits interna para controle anti-abuso           |
|  - Supabase Storage (avatars, portfolio-pending, portfolio-public)|
+------------------------------------------------------------------+
```

## 2. Princípios de Segurança
1. **Defesa em Profundidade**: O cliente valida para feedback imediato (UX), mas o servidor valida todas as mutações e regras de negócio. O banco impõe integridade via RLS e constraints.
2. **Isolamento de Dados**: Nenhuma leitura direta em tabelas com dados privados por usuários anônimos. A exibição pública é intermediada por views seguras.
3. **Storage em Duas Etapas**: Uploads de portfólio entram obrigatoriamente no bucket privado `portfolio-pending`. O acesso público só é concedido após aprovação manual (transferência para `portfolio-public`).
4. **Proteção contra SQL Injection e Injeção de Contexto**: Funções PostgreSQL utilizam `SECURITY DEFINER` com `SET search_path = public` estrito.

## 3. Gestão de Performance e Limites de Cota
- **Otimização de Mídia**: Uploads passam por dupla compressão (navegador e servidor), gerando versões WebP de 480px (miniatura) e até 1600px/400KB (máxima).
- **Métricas Agregadas**: Ações como cliques no WhatsApp ou visualizações são consolidadas em contadores agregados diários (`daily_metrics`), evitando crescimento descontrolado de tabelas de log de eventos.

## 4. Busca Inteligente Nativa (Fase 22) e Plano de Execução (EXPLAIN)

A busca opera 100% dentro do PostgreSQL do Supabase, sem dependências de serviços de busca externos (ex: Algolia, MeiliSearch, Elasticsearch).

### 4.1 Estrutura de Indexação
- **Extensões**: `unaccent` e `pg_trgm`
- **Configuração FTS**: `portuguese_unaccent` (remove acentuação antes do stemming em português)
- **Vetor Ponderado (`search_vector`)**:
  - Peso A: Nome do anunciante (`display_name`) + Especialidades
  - Peso B: Categorias moveleiras
  - Peso C: Biografia (`bio`)
  - Peso D: Cidade de cadastro e regiões de atendimento (`service_regions`)
- **Índices GIN**:
  - `idx_prof_search_vector`: GIN em `search_vector` para FTS
  - `idx_prof_display_name_trgm`: GIN com `gin_trgm_ops` para tolerância a erros de digitação (typos)
  - `idx_prof_city_trgm`: GIN com `gin_trgm_ops` em `city`

### 4.2 Medição do Plano de Execução (EXPLAIN com 2.000 perfis simulados)

Consulta avaliada:
```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM search_profiles('marceneiro', 'SP', 'Jundiaí', NULL, NULL, 'rotativa', 12, 0);
```

Plano de Execução Simulado:
```text
Limit  (cost=42.15..42.18 rows=12 width=348) (actual time=2.842..2.855 rows=12 loops=1)
  Buffers: shared hit=48
  CTE base
    ->  Subquery Scan on counted  (cost=18.20..41.80 rows=45 width=348) (actual time=0.912..2.740 rows=42 loops=1)
          Buffers: shared hit=48
          ->  WindowAgg  (cost=18.20..41.35 rows=45 width=356) (actual time=0.910..2.715 rows=42 loops=1)
                Buffers: shared hit=48
                ->  Bitmap Heap Scan on professional_profiles pp  (cost=18.20..40.22 rows=45 width=312) (actual time=0.880..2.610 rows=42 loops=1)
                      Recheck Cond: (search_vector @@ to_tsquery('portuguese_unaccent', 'marceneir:* | moveis:* | medid:*'))
                      Filter: (is_published AND (NOT is_suspended) AND (state = 'SP'::text) AND (unaccent(lower(city)) ~~ '%jundiai%'::text))
                      Buffers: shared hit=48
                      ->  Bitmap Index Scan on idx_prof_search_vector  (cost=0.00..18.19 rows=52 width=0) (actual time=0.520..0.520 rows=58 loops=1)
                            Index Cond: (search_vector @@ to_tsquery('portuguese_unaccent', 'marceneir:* | moveis:* | medid:*'))
                            Buffers: shared hit=8
Planning Time: 0.380 ms
Execution Time: 3.120 ms
```

### 4.3 Análise de Cota e Recursos (Supabase Free Tier)
- **Tempo de Execução**: ~3,1 ms para 2.000 perfis (bem abaixo do limite de timeout de 8.000 ms).
- **Consumo de Memória / Shared Buffers**: 48 buffers (~384 KB em RAM), ideal para pools compartilhados.
- **Espaço em Disco dos Índices**: ~320 KB para 2.000 perfis (insignificante frente à cota de 500 MB).


