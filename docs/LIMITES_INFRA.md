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

## Gatilhos de Migração de Infra

Registrar em `/admin` e agir imediatamente quando qualquer condição for atingida:

- [ ] Banco > **350 MB**
- [ ] Storage > **700 MB**
- [ ] Transferência mensal > **3,5 GB**
- [ ] Primeira cobrança real de qualquer usuário
- [ ] Dados reais de usuários sem backup gerenciado
- [ ] Necessidade de e-mail em volume (> 200/dia)
- [ ] Primeira notificação de pausa do Supabase

---

*Atualizado em: 12/11/2026 — Fase 4*

