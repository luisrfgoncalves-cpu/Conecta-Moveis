# Conecta Móveis

> Marketplace de profissionais de móveis planejados em Jundiaí/SP.

Conecta clientes que buscam móveis planejados com profissionais e marceneiros da região de Jundiaí/SP. A plataforma permite que profissionais criem perfis detalhados, publiquem portfólio de projetos e sejam encontrados por clientes via busca filtrada. **A Conecta Móveis é uma plataforma de divulgação — não executa serviços, não media pagamentos e não garante qualidade ou pontualidade.**

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript 5 |
| Estilo | Tailwind CSS 3 |
| Backend / Auth | Supabase (PostgreSQL + Auth + Storage) |
| Formulários | React Hook Form + Zod |
| Testes unitários | Vitest |
| Testes E2E | Playwright |
| Deploy | Vercel |

---

## Pré-requisitos

- **Node.js 20+** (`node -v`)
- **npm** (incluído no Node) ou **pnpm**
- Conta no [Supabase](https://supabase.com) (Free tier suficiente para desenvolvimento)
- Conta na [Vercel](https://vercel.com) (para deploy)

---

## Instalação Local

```bash
# 1. Clone o repositório
git clone https://github.com/<seu-usuario>/conecta-moveis.git
cd conecta-moveis

# 2. Instale as dependências
npm install

# 3. Copie o arquivo de variáveis de ambiente
cp .env.example .env.local

# 4. Preencha as variáveis em .env.local (veja seção abaixo)

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Configuração do Supabase

### 1. Criar projeto

1. Acesse [supabase.com](https://supabase.com) → **New Project**
2. Anote a **URL do projeto** e as chaves **anon** e **service_role**

### 2. Aplicar migrations

Execute os arquivos em `supabase/migrations/` **na ordem** via SQL Editor do Supabase:

| Ordem | Arquivo | Descrição |
|-------|---------|-----------|
| 1 | `20261112000001_initial_schema.sql` | Schema inicial completo |
| 2 | `20261112000002_storage_buckets.sql` | Buckets de Storage e políticas |
| 3 | `20261113000001_fix_view_security_and_rls.sql` | Correções de segurança na view e RLS |

> ⚠️ **Sempre rode as migrations ANTES de fazer deploy de qualquer código que dependa delas.**

### 3. Configurar Storage buckets

Os seguintes buckets devem existir (criados pela migration `20261112000002`):

- `avatar-uploads` — Avatares dos profissionais
- `portfolio-pending` — Fotos de portfólio aguardando moderação
- `portfolio-public` — Fotos de portfólio aprovadas (público)

Verifique em **Storage → Buckets** no painel do Supabase.

---

## Variáveis de Ambiente

Preencha `.env.local` com os valores do seu projeto Supabase:

```env
# Supabase (obrigatórias)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role

# URL da aplicação
NEXT_PUBLIC_APP_URL=http://localhost:3000   # produção: https://conectamoveis.com.br

# Cobrança (off = mockado)
BILLING_MODE=off

# Revisão legal (false até advogado aprovar)
LEGAL_REVIEWED=false
```

> 🔒 **Nunca** commite `.env.local`. Ele já está no `.gitignore`.

---

## Rodando Testes

### Unitários (Vitest)

```bash
npm test
```

Arquivos de teste em `src/__tests__/`:
`admin`, `auth`, `contact`, `env`, `monetization`, `portfolio`, `profile`, `reviews`, `rls`, `search`

### E2E (Playwright)

```bash
# Inicie o servidor em outro terminal
npm run dev

# Em outro terminal
npm run test:e2e
```

> Os testes E2E estão em `e2e/`. Requerem servidor rodando em `localhost:3000`.

---

## Deploy na Vercel

1. **Conecte o repositório**: [vercel.com/new](https://vercel.com/new) → importe o repo GitHub
2. **Framework preset**: Next.js (detectado automaticamente)
3. **Configure as variáveis de ambiente** no painel da Vercel (veja `DEPLOYMENT.md` para lista completa)
4. **Branch `main` = produção**; PRs geram previews automáticos

> Consulte [`DEPLOYMENT.md`](./DEPLOYMENT.md) para o checklist completo de pré-lançamento.

---

## Estrutura de Pastas

```
conecta-moveis/
├── e2e/                    # Testes Playwright E2E
├── public/                 # Assets estáticos
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (auth)/         # Rotas de autenticação
│   │   ├── (dashboard)/    # Painel do profissional
│   │   ├── (legal)/        # Páginas legais
│   │   ├── admin/          # Painel administrativo
│   │   ├── api/            # Route Handlers
│   │   └── busca/          # Busca pública
│   ├── components/         # Componentes React
│   ├── lib/                # Lógica de negócio e utilitários
│   │   ├── legal/          # config legal (LEGAL_REVIEWED)
│   │   ├── portfolio/      # Configuração e upload de portfólio
│   │   └── supabase/       # Clientes Supabase (server/client)
│   └── __tests__/          # Testes unitários Vitest
├── supabase/
│   └── migrations/         # SQL migrations (rodar em ordem)
├── .env.example            # Template de variáveis de ambiente
├── CHANGELOG.md
├── DEPLOYMENT.md
├── LIMITES_INFRA.md
├── SECURITY.md
└── TODO.md
```

---

## Contribuindo

1. Crie uma branch a partir de `main`: `git checkout -b feat/minha-feature`
2. Faça suas alterações com commits semânticos (`feat:`, `fix:`, `docs:`, etc.)
3. Abra um Pull Request descrevendo o que foi feito e por quê
4. Aguarde revisão antes do merge

---

## Licença

MIT (provisório) — verificar adequação com advogado antes do lançamento público.
