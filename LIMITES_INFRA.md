# Limites de Infraestrutura — Conecta Móveis

> Documento de referência para monitorar quando escalar planos de Supabase e Vercel.

---

## Supabase — Free Tier

| Recurso | Limite Free | Observação |
|---------|------------|-----------|
| Banco de dados (PostgreSQL) | 500 MB | Inclui tabelas, índices e storage de linha |
| Storage total | 1 GB | Buckets: `avatar-uploads`, `portfolio-pending`, `portfolio-public` |
| Bandwidth | 2 GB / mês | Egress de dados (API + Storage downloads) |
| Requisições de API | 500.000 / mês | Chamadas REST e Realtime |
| Conexões simultâneas ao banco | 60 (via pgBouncer) | Pooler em modo Transaction |
| Usuários Auth | Ilimitado | — |
| Projetos simultâneos | 2 | — |
| Backups | Nenhum automático | Fazer backup manual via SQL dump |

---

## Limites de Portfólio (Configuração da Aplicação)

Definidos em `src/lib/portfolio/config.ts`:

| Constante | Valor Atual | Descrição |
|-----------|------------|-----------|
| `MAX_PHOTOS_PER_PROFILE` | **6** | Máximo de fotos por perfil profissional |
| `MAX_FILE_SIZE_BYTES` | 1.5 MB | Tamanho máximo por foto (pós-compressão) |
| `MAX_IMAGE_DIMENSION` | 1600 px | Lado maior da imagem completa |
| `THUMB_IMAGE_DIMENSION` | 480 px | Lado maior da thumbnail |
| `WEBP_QUALITY` | 82% | Qualidade de compressão WebP (imagem completa) |
| `THUMB_WEBP_QUALITY` | 75% | Qualidade de compressão WebP (thumbnail) |

> _Estes limites são provisórios (Fase 7). Serão substituídos por entitlements dinâmicos por plano na Fase 11._

**Estimativa de Storage por profissional:**
- Foto completa ≈ ≤ 1.5 MB × 6 fotos = **≤ 9 MB/perfil**
- Thumbnail ≈ ~100 KB × 6 = **≤ 0.6 MB/perfil**
- Avatar ≈ ≤ 500 KB/perfil
- **Total máximo ≈ ~10 MB por profissional ativo com portfólio completo**

Com 100 profissionais ativos: ~1 GB → próximo ao limite Free do Storage.

---

## Rate Limits do Supabase Auth

O Supabase Auth aplica rate limits por padrão (não configuráveis no Free tier):

| Ação | Limite padrão |
|------|--------------|
| Sign-up | 30 req/hora por IP |
| Sign-in (email/senha) | 30 req/hora por IP |
| Magic Link | 30 req/hora por e-mail |
| Password Reset | 30 req/hora por IP |
| OTP / Verificação | 30 req/hora por IP |

> Em caso de abuso ou scraping de e-mails via erros de auth, monitorar os logs do Supabase Auth.

---

## Vercel — Free (Hobby) Tier

| Recurso | Limite |
|---------|--------|
| Bandwidth | 100 GB / mês |
| Serverless Function Execution | 100 GB-h / mês |
| Edge Function Invocations | 1.000.000 / mês |
| Build Minutes | 6.000 min / mês |
| Deployments | 100 / dia |
| Projetos | Ilimitado |
| Domínios customizados | Ilimitado |
| Equipe | 1 membro (Hobby) |

---

## Sinais de Que é Hora de Escalar

Monitore os seguintes indicadores no painel do Supabase e Vercel:

### Escalar Supabase → Pro (US$ 25/mês)

- Storage atingindo **80% de 1 GB** (≈ 100 profissionais com portfólio completo)
- Banco de dados atingindo **400 MB** dos 500 MB
- Bandwidth mensal acima de **1.5 GB** (margem de segurança)
- Latência P95 das queries acima de **500ms** (indica sobrecarga)
- Logs mostrando **erros de conexão** frequentes (limite de 60 conexões)
- Necessidade de **backups automáticos** diários

### Escalar Vercel → Pro (US$ 20/mês)

- Bandwidth mensal acima de **80 GB**
- Necessidade de **equipe** (mais de 1 membro com acesso ao painel)
- Necessidade de **Analytics avançados** (Core Web Vitals por rota)
- Build times ultrapassando 45 minutos frequentemente

---

## Próximos Planos Pagos

| Plataforma | Plano | Preço | Principais Benefícios |
|-----------|-------|-------|----------------------|
| Supabase | **Pro** | US$ 25/mês | 8 GB Storage, 50 GB bandwidth, backups diários, suporte por e-mail |
| Supabase | **Team** | US$ 599/mês | SOC 2, SLA 99.9%, logs avançados |
| Vercel | **Pro** | US$ 20/mês + uso | Equipes, analytics, proteção por senha, preview comments |
| Vercel | **Enterprise** | Sob consulta | SLA, suporte dedicado, segurança avançada |
