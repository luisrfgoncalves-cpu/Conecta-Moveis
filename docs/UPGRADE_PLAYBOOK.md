# PLAYBOOK DE UPGRADE DE INFRAESTRUTURA — Conecta Móveis

> **Status:** Versão 1.0 — Guia Oficial para Transição de Infraestrutura Gratuita para Comercial  
> **Aviso Importante:** Preços, limites e termos de serviço das plataformas de nuvem mudam periodicamente. **Sempre confirme os valores vigentes diretamente nas páginas oficiais antes de contratar** ([supabase.com/pricing](https://supabase.com/pricing) e [vercel.com/pricing](https://vercel.com/pricing)).

---

## 1. Visão Geral da Arquitetura Atual (Plano Gratuito)

| Componente | Provedor | Plano Atual | Região | Cota Gratuita |
| :--- | :--- | :--- | :--- | :--- |
| **Banco de Dados & Auth** | Supabase | Free Tier | US East (Virginia - `us-east-1`) | 500 MB BD / 1 GB Storage / 5 GB Transfer |
| **Hospedagem & Frontend** | Vercel | Hobby Tier | US East (Washington - `iad1`) | 100 GB Bandwidth / Não comercial |
| **Disparo de E-mails** | Supabase Auth | Nativo | US East | ~50-200 e-mails/dia |

---

## 2. Upgrade do Supabase (Free para Pro)

### Quando Fazer o Upgrade?
- O banco atingir **350 MB** (70% do limite gratuito de 500 MB);
- O storage de fotos atingir **700 MB** (70% de 1 GB);
- Necessidade de backups diários automáticos garantidos;
- Necessidade de utilizar transformações de imagem sob demanda na CDN (redimensionamento automático de fotos dos marceneiros).

### Passo a Passo de Contratação:
1. Acesse o **Supabase Dashboard** > Selecione a organização do projeto.
2. Navegue até **Settings** > **Billing** > **Subscription Plans**.
3. Selecione o plano **Pro** (custo de referência: ~$25/mês por organização).
4. **IMPORTANTE — Configurar Spend Cap (Teto de Gastos):**
   - Na aba de Billing, certifique-se de que a opção **"Spend Cap: Enabled"** esteja ligada.
   - Isso impede cobranças surpresa em cartão de crédito caso haja pico de tráfego, pausando recursos além da cota em vez de cobrar excedente sem aviso.
5. **Backups Diários:**
   - Com o plano Pro, os backups diários de 7 dias são ativados automaticamente em **Database** > **Backups**.
6. **Ativação no Painel Conecta Móveis:**
   - Acesse `/admin/configuracoes` com sua conta de administrador.
   - Na aba **Infraestrutura**, selecione o perfil **"Plano Profissional"** e confirme a mudança.
   - As feature flags dependentes de plano pago (como otimização de imagens sob demanda) serão desbloqueadas.

### Plano de Reversão (Rollback):
- Se desejar retornar ao plano gratuito:
  1. No painel Conecta Móveis, verifique no Simulador se o armazenamento total está abaixo de 500 MB e 1 GB.
  2. Alterne o perfil de infraestrutura para **"Plano Gratuito"** no `/admin/configuracoes`.
  3. No Supabase Dashboard, altere a assinatura para Free no fechamento do ciclo de faturamento.

---

## 3. Upgrade da Vercel (Hobby para Pro)

### Quando Fazer o Upgrade?
- **Imediatamente antes da primeira cobrança comercial de qualquer anunciante.**  
  *(Os termos de uso da Vercel proíbem uso comercial lucrativo no plano Hobby).*
- Quando o tráfego mensal de visitantes atingir 70 GB de largura de banda.

### Passo a Passo de Contratação:
1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard).
2. Vá em **Team Settings** > **Billing** > **Upgrade to Pro** (custo de referência: ~$20/mês por assento).
3. Conecte o método de pagamento corporativo.
4. O deploy de produção continuará sem qualquer interrupção de serviço.

---

## 4. Planejamento de Migração de Região (EUA para Brasil — São Paulo)

Caso a assessoria jurídica ou a estratégia de negócios exija no futuro que 100% dos dados residam fisicamente no território brasileiro (`sa-east-1` e `gru1`), siga o procedimento seguro de migração:

### Pré-requisitos:
- Autorização expressa do proprietário da plataforma.
- Janela de manutenção programada (estimativa: 30 a 45 minutos) com aviso aos anunciantes.

### Procedimento Passo a Passo:
1. **Entrar em Modo de Manutenção Temporário:**
   - Ativar aviso de manutenção para evitar novas gravações simultâneas.
2. **Exportar Dump do Banco Atual:**
   ```bash
   # Gerar backup consistente dos dados e schemas
   supabase db dump -f conecta_moveis_backup.sql
   ```
3. **Criar Novo Projeto Supabase:**
   - No Dashboard Supabase, crie um novo projeto escolhendo a região **South America (São Paulo - `sa-east-1`)**.
4. **Restaurar Dados no Novo Projeto:**
   ```bash
   # Aplicar o dump no novo banco de dados
   psql -h db.NOVO_HOST.supabase.co -U postgres -d postgres -f conecta_moveis_backup.sql
   ```
5. **Migrar Buckets de Storage:**
   - Copiar as fotos existentes do bucket antigo para o novo bucket via script de sincronização ou CLI.
6. **Atualizar Variáveis de Ambiente:**
   - Na Vercel, atualizar `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`.
   - Adicionar `vercel.json` com `"regions": ["gru1"]` para aproximar as funções serverless de São Paulo.
7. **Testar e Liberar Produção:**
   - Executar os testes automatizados com o novo endpoint.
   - Retirar o modo de manutenção.

### Plano de Reversão da Migração:
- Se a nova região apresentar qualquer instabilidade durante a janela, reverta imediatamente as variáveis na Vercel para as credenciais do projeto antigo nos EUA, que permanecerá intacto como réplica fria de segurança por 15 dias.

---

## 5. Resumo das Chaves e Recursos Liberados no Upgrade

| Recurso | No Plano Gratuito | No Plano Pro |
| :--- | :--- | :--- |
| **Armazenamento de Fotos** | Até 1 GB | Até 100 GB |
| **Limite por Foto** | 5 MB | Até 50 MB |
| **Redimensionamento CDN** | Desligado | Ativo em tempo real |
| **Backups** | Manuais via script | Diários automáticos + PITR |
| **Cobrança Comercial** | Modo Simulação / Risco de TOS | 100% Regularizado na Vercel Pro |
| **E-mails Transacionais** | ~50-200/dia | Ilimitado via Resend/SMTP dedicado |
