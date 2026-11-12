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

