# LIMITES DE INFRAESTRUTURA — Conecta Móveis

## Supabase (Plano Gratuito)

| Recurso | Limite gratuito | Alerta interno | Status |
|---------|----------------|----------------|--------|
| Banco de dados | 500 MB | 350 MB | 🟢 OK |
| Storage | 1 GB | 700 MB | 🟢 OK |
| Transferência mensal | 5 GB | 3,5 GB | 🟢 OK |
| Requisições mensais | 50.000 (Auth) | — | 🟢 OK |
| **E-mails via Supabase Auth** | **~50-200/dia** | — | 🔴 **VER ABAIXO** |
| Edge Functions | 500K/mês | — | 🟢 OK |
| Realtime | 200 conexões simultâneas | — | 🟢 OK |
| Inatividade (pausa) | Pausa após ~7 dias sem atividade | — | 🟡 Monitorar |

## ⛔ PENDÊNCIA BLOQUEADORA DE LANÇAMENTO — SMTP Próprio

> **O Supabase Auth gratuito usa seu próprio servidor SMTP com limite extremamente baixo
> (estimativa: 50 a 200 e-mails por dia dependendo da região e do período).**
>
> Para uma plataforma com cadastro de usuários, confirmação de e-mail e recuperação de senha,
> esse limite é insuficiente mesmo com 100 usuários ativos.

### Ação obrigatória antes do lançamento em produção:

1. **Registrar um domínio** (ex: `conectamoveis.com.br`)
2. **Criar conta no Resend** (plano gratuito: 100 e-mails/dia, 3.000/mês)
   - URL: https://resend.com
3. **Configurar SMTP no Supabase:**
   - Dashboard > Settings > Auth > SMTP Settings
   - Host: `smtp.resend.com`
   - Porta: `587`
   - Usuário: `resend`
   - Senha: API Key do Resend
   - Remetente: `no-reply@seudominio.com.br`
4. **Configurar templates de e-mail** no Supabase em PT-BR
5. **Atualizar `NEXT_PUBLIC_APP_URL`** na Vercel para o domínio real

### Referência de variáveis a adicionar (não são segredos de código — são do painel Supabase):
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx  # Configurado diretamente no Supabase, NÃO no código
SUPABASE_SMTP_HOST=smtp.resend.com
SUPABASE_SMTP_PORT=587
```

---

## Vercel (Plano Hobby)

| Recurso | Limite | Status |
|---------|--------|--------|
| Deploy | Ilimitado (pessoal) | 🟢 OK |
| Largura de banda | 100 GB/mês | 🟢 OK |
| Funções serverless | 100 GB-hora/mês | 🟢 OK |
| **Uso comercial** | **Proibido no Hobby** | 🟡 **Monitorar** |

> **Regra:** enquanto `BILLING_MODE=off` e nenhuma cobrança real existe, o uso Hobby
> é defensável como projeto pessoal/educacional. Assim que houver receita, migrar para Pro (\$20/mês).

---

## 3. Estimativa de Armazenamento de Registros de Acesso (Marco Civil art. 15)

O plano gratuito do Supabase possui **limite total de 500 MB** de banco de dados.

| Métrica | Estimativa | Observações |
| :--- | :--- | :--- |
| **Tamanho por registro de log** | ~250 a 300 bytes | IP, Timestamp, User ID, Ação e User-Agent truncado |
| **Eventos diários (escrita e auth)** | ~200 a 500 eventos/dia | Apenas login, cadastro, edição de perfil, foto e contato |
| **Volume mensal gerado** | ~6.000 a 15.000 linhas | ~1,8 MB a 4,5 MB / mês |
| **Janela de 6 meses (Retenção Legal)** | ~36.000 a 90.000 linhas | **~11 MB a 27 MB no total** |
| **Impacto no limite de 500 MB** | **< 6% da cota** | Perfeitamente comportável no plano gratuito |

> **Decisão Operacional:** O purge diário aos 180 dias (`INTERVAL '180 days'`) garante que os logs nunca cresçam indefinidamente. A gravação de navegação anônima (visualização de páginas) foi deliberadamente descartada para poupar o banco e respeitar a minimização da LGPD.

---

## Gatilhos de Migração de Infra

Registrar em `/admin` e agir imediatamente quando qualquer condição for atingida:

- [ ] Banco > **350 MB** (70% do teto gratuito de 500 MB)
- [ ] Storage > **700 MB** (70% do teto gratuito de 1.000 MB)
- [ ] Transferência mensal > **70 GB** (70% da cota Vercel Hobby)
- [ ] Primeira cobrança real de qualquer usuário (gatilho mandatório para Vercel Pro)
- [ ] Mais de 300 anunciantes ativos com fotos de portfólio
- [ ] Necessidade de e-mail em volume (> 100/dia)

---

## 5. Peso das Imagens da Home — Medição Antes/Depois (Fase Ajuste)

### Contexto
A imagem de fundo da home estava sendo servida como um único JPEG pedido em 3840 px com qualidade 95, sem `srcset`.

### Resultado

| Variante | Formato | Dimensão | Tamanho em disco | Redução |
| :--- | :--- | :--- | :--- | :--- |
| **Original** | JPEG | 3840 px | **355,1 KB** | — |
| **Desktop WebP** | WebP | 1920 px | **140,8 KB** | −60,4% |
| **Mobile WebP** | WebP | 960 px | **50,6 KB** | −85,8% |

### Implementação

- Variantes geradas off-line com `sharp` (script `scripts/generate-webp.mjs`)  
- `src/app/layout.tsx` agora usa `<picture>` com `<source media="(max-width:960px)" srcset="/images/background-mobile.webp">` e fallback para `background-desktop.webp`  
- Nenhuma transformação sob demanda da Vercel Image Optimization para esta imagem  
- `alt` e overlay de contraste preservados

> **Meta atingida:** desktop ≤ 250 KB ✅ · mobile ≤ 120 KB ✅

---

## 4. Medição de Dimensionamento para 300 Profissionais (Fase 26)

Dimensionamento aferido para a arquitetura WebP com metas de compressão cliente da Fase 24:

| Recurso | Consumo Estimado para 300 Perfis | Cota do Plano Gratuito | Margem Livre | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Storage de Fotos** | 300 perfis × 3 fotos × ~220 KB = **~193 MB** | 1.000 MB (Supabase Free) | **~807 MB (80.7%)** | 🟢 Folga Ampla |
| **Banco PostgreSQL** | 300 contas + perfis + logs + erros = **~60 MB** | 500 MB (Supabase Free) | **~440 MB (88.0%)** | 🟢 Folga Ampla |
| **Transferência CDN** | 10.000 visitas/mês com cache agressivo = **~8 GB/mês** | 100 GB (Vercel Hobby) | **~92 GB (92.0%)** | 🟢 Folga Ampla |
| **First Load JS** | **103 kB** (medido no build do Next.js) | Meta <= 120 kB | **17 kB abaixo** | 🟢 Excelente |

> **Conclusão:** É perfeitamente seguro e viável operar a plataforma até atingir 300 profissionais cadastrados sem pagar nenhum centavo em infraestrutura, contando com o painel `/admin/capacidade` para alertar preventivamente aos 70% de consumo.

---

*Atualizado em: 15/11/2026 — Fase Ajuste (Correção de Textos, Dados Fictícios e Peso da Home)*

