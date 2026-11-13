# Guia de Deploy — Conecta Móveis

## Fluxo de Deploy

```
git push origin main
       │
       ▼
  Vercel Build
  (npm run build)
       │
       ├─── Preview URL gerada automaticamente para PRs
       │
       └─── Branch main → Produção
                  │
                  ▼
         https://conectamoveis.com.br
```

Cada `push` para qualquer branch cria uma **Preview URL** na Vercel. Apenas merges para `main` promovem para produção.

---

## Variáveis de Ambiente na Vercel

Configure em **Vercel → Project → Settings → Environment Variables** para o ambiente **Production** (e opcionalmente Preview/Development):

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase (ex: `https://xxxx.supabase.co`) | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon pública do Supabase | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service_role (somente servidor — nunca expor) | ✅ |
| `NEXT_PUBLIC_APP_URL` | URL pública da aplicação (ex: `https://conectamoveis.com.br`) | ✅ |
| `BILLING_MODE` | `off` para mockar pagamentos, `stripe` ou `pagarme` quando integrado | ✅ |
| `LEGAL_REVIEWED` | `false` até revisão jurídica; `true` após aprovação de advogado | ✅ |

> 🔒 **`SUPABASE_SERVICE_ROLE_KEY`** nunca deve aparecer em variáveis com prefixo `NEXT_PUBLIC_`. Verifique duas vezes antes de salvar.

---

## Migrations Supabase

> ⚠️ **Execute SEMPRE as migrations antes do deploy** quando o código novo depender de mudanças no banco.

### Como aplicar migrations

1. Acesse o painel do Supabase → **SQL Editor**
2. Execute os arquivos em `supabase/migrations/` **na ordem**:

| Arquivo | Descrição | Aplicada em produção? |
|---------|-----------|----------------------|
| `20261112000001_initial_schema.sql` | Schema inicial | ☐ |
| `20261112000002_storage_buckets.sql` | Buckets e políticas de Storage | ☐ |
| `20261113000001_fix_view_security_and_rls.sql` | Correções de segurança em views e RLS | ☐ |

3. Marque cada item acima após aplicar em produção

---

## Storage Buckets

Os buckets abaixo devem existir em produção (criados pela migration `20261112000002`). Verifique em **Supabase → Storage → Buckets**:

| Bucket | Visibilidade | Finalidade |
|--------|-------------|-----------|
| `avatar-uploads` | Privado (acesso via signed URL ou RLS) | Avatares dos profissionais |
| `portfolio-pending` | Privado | Fotos aguardando moderação |
| `portfolio-public` | Público | Fotos aprovadas pela moderação |

---

## Backup & Recuperação de Dados

O plano gratuito do Supabase (Free Tier) não inclui backup automático gerenciado diariamente pelo console. Por isso, a plataforma conta com procedimentos dedicados:

1. **Backup Rápido no Painel Administrativo (`/admin/backup`):**
   - Acesse `/admin/backup` logado como administrador.
   - Clique em **"Baixar Backup (.json)"**.
   - O sistema gera instantaneamente um arquivo JSON contendo todas as tabelas: perfis, portfólios, fotos, avaliações, contatos, categorias e logs de auditoria.
   - Guarde esse arquivo em local seguro semanalmente.

2. **Backup Completo via pg_dump (PostgreSQL CLI):**
   - No painel do Supabase em **Project Settings → Database → Connection String → URI**, copie a string de conexão.
   - Execute no terminal:
     ```bash
     pg_dump -h <host> -U postgres -d postgres -F c -b -v -f conecta_moveis_backup.dump
     ```
   - Para restaurar em caso de emergência em outro projeto:
     ```bash
     pg_restore -h <novo_host> -U postgres -d postgres -v conecta_moveis_backup.dump
     ```

---

## Termos da Hospedagem Vercel (Hobby)

- O plano Hobby da Vercel destina-se a desenvolvimento pessoal e projetos iniciais não comerciais.
- **Antes de ativar assinaturas pagas de profissionais, publicidade ou destaque pago (`BILLING_MODE !== 'off'`)**, é mandatório realizar o upgrade para o plano **Vercel Pro ($20/mês)** para conformidade com os Termos de Serviço da Vercel.
- Monitore o consumo de banda (100 GB/mês) em: `https://vercel.com/dashboard/usage`.

---

## Domínio e DNS

> _Placeholder — atualizar quando o domínio estiver registrado._

1. Registre `conectamoveis.com.br` em um registrador (ex: Registro.br)
2. No painel da Vercel: **Project → Settings → Domains** → adicione `conectamoveis.com.br`
3. Configure os registros DNS conforme instrução da Vercel:
   - `A` ou `CNAME` apontando para os IPs/hostname da Vercel
4. Aguarde propagação DNS (geralmente até 48h)
5. SSL é provisionado automaticamente pela Vercel via Let's Encrypt

---

## Checklist Pré-Lançamento

Antes de considerar a aplicação pronta para o público:

- [ ] Todas as migrations aplicadas no Supabase de **produção**
- [ ] Buckets de Storage criados e policies verificadas em produção
- [ ] Variáveis de ambiente de produção configuradas na Vercel
- [ ] `NEXT_PUBLIC_APP_URL` apontando para o domínio de produção
- [ ] Domínio `conectamoveis.com.br` configurado e SSL ativo (HTTPS forçado)
- [ ] Revisão jurídica dos textos legais concluída (`LEGAL_REVIEWED=true`)
- [ ] Testes unitários passando (`npm test`)
- [ ] Build sem erros (`npm run build`)
- [ ] Typecheck limpo (`npm run typecheck`)
- [ ] Lint sem warnings (`npm run lint`)
- [ ] Teste manual dos fluxos críticos: cadastro, perfil, busca, contato, avaliação
- [ ] Auditoria de acessibilidade (axe) com zero violações críticas
