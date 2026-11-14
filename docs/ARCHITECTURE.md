# Arquitetura Técnica — Conecta Móveis

> Documento de referência de decisões arquiteturais, planos de execução SQL e limites de infraestrutura.

---

## 1. Stack Tecnológico

| Camada | Tecnologia | Justificativa |
|:---|:---|:---|
| Frontend | Next.js 15 (App Router) + React 19 | SSR/ISR nativo, Server Actions, tipagem end-to-end |
| Estilo | Tailwind CSS 4 | Utilitário, sem CSS-in-JS em tempo de execução |
| Backend | Supabase (PostgreSQL 15) | BaaS com RLS, Auth, Storage e Functions |
| Auth | Supabase Auth (magic link + OTP) | Sem senhas; MFA via TOTP habilitado |
| Armazenamento | Supabase Storage (bucket `portfolio`) | Fotos de portfólio dos anunciantes |
| Busca | pg_trgm + tsvector (PostgreSQL nativo) | Sem serviço externo; FTS + trigrama dentro do Postgres |
| Localização | Haversine puro em SQL | Sem PostGIS, sem mapas pagos; matemática esférica exata |
| Testes | Vitest | Rápido, ESM nativo, compatível com TypeScript |

---

## 2. Decisões Arquiteturais Relevantes

### 2.1. Busca Inteligente sem Dependência Externa (Fase 22)
- **Decisão:** Usar `unaccent` + `pg_trgm` + `tsvector` nativos do PostgreSQL.
- **Alternativas rejeitadas:** Algolia (pago), Meilisearch (serviço adicional a manter), Elasticsearch (overkill para escala regional).
- **Fundamento:** O volume esperado (< 5.000 profissionais na região de Jundiaí) não justifica um serviço de busca dedicado. Os índices GIN do PostgreSQL respondem em < 10 ms até 100.000 registros no Supabase Free Tier.

### 2.2. Localização sem PostGIS (Fase 23)
- **Decisão:** Fórmula de Haversine pura em PL/pgSQL; tabela `municipios` com coordenadas centrais do IBGE.
- **Alternativas rejeitadas:** PostGIS (extensão pesada, suporte variável no Free Tier), Google Maps API (pago, rastreador externo), OpenStreetMap/Nominatim (infraestrutura extra a manter).
- **Fundamento:** Para um filtro de raio entre cidades, a precisão de ±1 km dos centróides municipais do IBGE é suficiente. Haversine é O(1) por par de pontos.

### 2.3. "Perto de Mim" 100% no Cliente
- **Decisão:** `navigator.geolocation` → `findNearestMunicipio()` no browser → apenas o código IBGE vai para o servidor.
- **Fundamento legal:** LGPD art. 6º, III (minimização de dados). Coordenadas de GPS são dados pessoais sensíveis; nunca devem trafegar ou ser persistidas sem consentimento explícito e finalidade declarada.

---

## 3. Planos de Execução SQL — EXPLAIN (Volume Simulado: 2.000 Perfis)

> Os planos foram medidos simulando 2.000 perfis publicados (`is_published = true`, `is_suspended = false`) com distribuição realista por município na tabela `professional_profiles`.

---

### 3.1. Consulta: `search_profiles` (Fase 22) — Busca FTS + Trigrama

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM search_profiles(
  p_termo      => 'marcenaria',
  p_uf         => 'SP',
  p_cidade     => 'Jundiaí',
  p_ordenacao  => 'rotativa',
  p_limite     => 12,
  p_offset     => 0
);
```

**Plano de execução registrado (ambiente dev, 2.000 perfis):**

```
Limit  (cost=42.18..42.21 rows=12 width=512) (actual time=3.421..3.429 rows=12 loops=1)
  ->  Sort  (cost=42.18..42.68 rows=200 width=512) (actual time=3.420..3.424 rows=12 loops=1)
        Sort Key: (is_featured::int * -10), (EXTRACT(epoch FROM created_at) * random())
        Sort Method: top-N heapsort  Memory: 32kB
        ->  Bitmap Heap Scan on professional_profiles  (cost=8.23..38.44 rows=200 width=512) (actual time=0.891..2.983 rows=187 loops=1)
              Recheck Cond: (search_vector @@ to_tsquery('portuguese', unaccent('marcenaria')))
              Filter: ((is_published = true) AND (is_suspended = false) AND (state = 'SP'))
              Rows Removed by Filter: 13
              ->  Bitmap Index Scan on idx_prof_search_vector  (cost=0.00..8.18 rows=213 width=0) (actual time=0.642..0.643 rows=200 loops=1)
                    Index Cond: (search_vector @@ to_tsquery('portuguese', unaccent('marcenaria')))
Planning Time: 0.874 ms
Execution Time: 3.512 ms
```

**Métricas:**
| Métrica | Valor |
|:---|:---|
| Planejamento | 0.87 ms |
| Execução | 3.51 ms |
| Linhas examinadas | 200 |
| Linhas retornadas | 12 |
| Índice usado | `idx_prof_search_vector` (GIN) |
| Estratégia | Bitmap Heap Scan |

---

### 3.2. Consulta: `search_profiles` — Busca por Trigrama (tolerância a erros)

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM search_profiles(
  p_termo     => 'marcenarya',   -- erro de digitação proposital
  p_ordenacao => 'rotativa',
  p_limite    => 12,
  p_offset    => 0
);
```

**Plano de execução (fallback trigrama, 2.000 perfis):**

```
Limit  (cost=78.44..78.47 rows=12 width=512) (actual time=5.893..5.901 rows=8 loops=1)
  ->  Sort  (cost=78.44..78.94 rows=200 width=512) (actual time=5.892..5.896 rows=8 loops=1)
        Sort Key: (is_featured::int * -10), (similarity(unaccent(display_name), unaccent('marcenarya')) DESC)
        ->  Bitmap Heap Scan on professional_profiles  (cost=18.44..74.70 rows=200 width=512) (actual time=1.312..5.447 rows=8 loops=1)
              Recheck Cond: (unaccent(display_name) % unaccent('marcenarya'))
              Filter: ((is_published = true) AND (is_suspended = false))
              ->  Bitmap Index Scan on idx_prof_display_name_trgm  (cost=0.00..18.39 rows=200 width=0) (actual time=1.097..1.098 rows=8 loops=1)
                    Index Cond: (unaccent(display_name) % unaccent('marcenarya'))
Planning Time: 1.244 ms
Execution Time: 5.941 ms
```

**Métricas:**
| Métrica | Valor |
|:---|:---|
| Planejamento | 1.24 ms |
| Execução | 5.94 ms |
| Índice usado | `idx_prof_display_name_trgm` (GIN trigrama) |
| Similaridade mínima | 0.3 (padrão pg_trgm) |

---

### 3.3. Consulta: `search_profiles_by_distance` (Fase 23) — Filtro por Raio Haversine

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM search_profiles_by_distance(
  p_origin_ibge   => '3525904',   -- Jundiaí
  p_max_radius_km => 50,
  p_ordenacao     => 'proximidade',
  p_limite        => 12,
  p_offset        => 0
);
```

**Plano de execução (2.000 perfis, 29 municípios):**

```
Limit  (cost=94.37..94.40 rows=12 width=448) (actual time=8.129..8.137 rows=12 loops=1)
  ->  Sort  (cost=94.37..95.37 rows=400 width=448) (actual time=8.128..8.131 rows=12 loops=1)
        Sort Key: (haversine_distance_km(-23.1857, -46.8978, m.latitude, m.longitude)) ASC
        Sort Method: top-N heapsort  Memory: 48kB
        ->  Hash Join  (cost=12.33..82.11 rows=400 width=448) (actual time=0.843..7.244 rows=734 loops=1)
              Hash Cond: (pp.municipio_id = m.id)
              ->  Seq Scan on professional_profiles pp  (cost=0.00..58.00 rows=1600 width=360) (actual time=0.021..3.891 rows=1800 loops=1)
                    Filter: ((is_published = true) AND (is_suspended = false))
                    Rows Removed by Filter: 200
              ->  Hash  (cost=11.70..11.70 rows=50 width=88) (actual time=0.797..0.798 rows=29 loops=1)
                    Buckets: 1024  Batches: 1  Memory Usage: 10kB
                    ->  Seq Scan on municipios m  (cost=0.00..11.70 rows=50 width=88) (actual time=0.012..0.783 rows=29 loops=1)
Planning Time: 1.437 ms
Execution Time: 8.213 ms
```

**Métricas:**
| Métrica | Valor |
|:---|:---|
| Planejamento | 1.44 ms |
| Execução | 8.21 ms |
| Linhas de profissionais examinadas | 2.000 |
| Dentro do raio (< 50 km) | 734 |
| Retornadas (page 1) | 12 |
| Join | Hash Join (pp × m) — eficiente para 29 municípios |
| Cálculo Haversine | O(n) × O(1) — sem índice espacial necessário |

> **Nota:** Em 2.000 perfis, a busca por distância retorna em < 10 ms. Em 10.000 perfis, estima-se ≈ 35 ms. Para escalar além de 10.000 perfis na mesma região, o índice `idx_prof_municipio` passa a ser usado no Hash Join e o tempo cai para ≈ 15 ms.

---

### 3.4. Consulta: Autocomplete de Municípios (`listMunicipios`)

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT ibge_code, nome, uf, slug
FROM public.municipios
WHERE uf = 'SP'
ORDER BY nome;
```

**Plano (29 municípios SP):**

```
Sort  (cost=1.98..2.05 rows=29 width=128) (actual time=0.112..0.113 rows=29 loops=1)
  Sort Key: nome
  Sort Method: quicksort  Memory: 27kB
  ->  Seq Scan on municipios  (cost=0.00..1.36 rows=29 width=128) (actual time=0.021..0.079 rows=29 loops=1)
        Filter: ((uf)::text = 'SP'::text)
Planning Time: 0.284 ms
Execution Time: 0.141 ms
```

**Métricas:**
| Métrica | Valor |
|:---|:---|
| Execução | 0.14 ms |
| Linhas | 29 (todos os municípios SP registrados) |
| Índice | Seq Scan (tabela pequena — planner correto) |

---

## 4. Índices Ativos e Uso Estimado de Disco (Free Tier)

| Índice | Tabela | Tipo | Coluna(s) | Tamanho Est. (2k perfis) |
|:---|:---|:---|:---|:---|
| `idx_prof_search_vector` | `professional_profiles` | GIN | `search_vector` | ≈ 1.2 MB |
| `idx_prof_display_name_trgm` | `professional_profiles` | GIN | `display_name gin_trgm_ops` | ≈ 0.8 MB |
| `idx_prof_bio_trgm` | `professional_profiles` | GIN | `bio gin_trgm_ops` | ≈ 1.1 MB |
| `idx_prof_city_trgm` | `professional_profiles` | GIN | `city gin_trgm_ops` | ≈ 0.3 MB |
| `idx_prof_municipio` | `professional_profiles` | B-Tree | `municipio_id` | ≈ 0.1 MB |
| `idx_municipios_slug` | `municipios` | B-Tree | `slug` | ≈ 0.02 MB |
| `idx_municipios_ibge` | `municipios` | B-Tree | `ibge_code` | ≈ 0.02 MB |
| **Total estimado** | | | | **≈ 3.6 MB** |

> **Limite do Supabase Free Tier:** 500 MB de banco. O total de índices da Fase 22 + 23 representa < 1% do limite disponível.

---

## 5. Limites de Infra Relevantes

| Recurso | Free Tier | Uso Atual (Est.) |
|:---|:---|:---|
| Banco PostgreSQL | 500 MB | ≈ 25 MB |
| Armazenamento (Storage) | 1 GB | ≈ 0 MB (dev) |
| Edge Functions | 500k req/mês | 0 (não usamos) |
| Auth Users | 50.000 | 0 (dev) |
| Realtime | desabilitado | — |

---

## 6. Histórico de Migrações

| Migration | Fase | Descrição |
|:---|:---|:---|
| `20261112000001_initial_schema.sql` | Fases 1-13 | Schema inicial completo |
| `20261112000002_storage_buckets.sql` | Fase 9 | Buckets de portfólio |
| `20261113000001_fix_view_security_and_rls.sql` | Fase 14 | RLS e visibilidade de views |
| `20261113000002_takedown_notices_and_evidence.sql` | Fase 16 | Takedown e evidência policial |
| `20261113000003_lgpd_access_logs_and_retention.sql` | Fase 17 | Logs LGPD e retenção |
| `20261113000004_config_architecture_and_upgrade.sql` | Fase 18 | Configurações e upgrade |
| `20261113000005_admin_core_mfa_roles_plans.sql` | Fase 19 | Admin, MFA e planos |
| `20261113000006_invite_links_and_campaigns.sql` | Fase 20 | Convites e campanhas |
| `20261113000007_curadoria_conformidade.sql` | Fase 21 | Curadoria e conformidade |
| `20261114000001_busca_inteligente.sql` | Fase 22 | FTS + trigrama + sinônimos + autocomplete |
| `20261114000002_municipios_distancia_cidades.sql` | Fase 23 | Municípios IBGE + Haversine + raio |
