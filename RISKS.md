# MATRIZ DE RISCOS — CONECTA MÓVEIS

| Risco | Impacto | Probabilidade | Mitigação |
|---|---|---|---|
| **Esgotamento da transferência gratuita do Supabase (5 GB/mês)** | Alto | Alta | Conversão obrigatória para WebP, miniatura de 480px em listagens, limite de até 400KB na imagem cheia, lazy loading e monitoramento em `/admin`. |
| **Esgotamento do Storage gratuito do Supabase (1 GB)** | Médio | Média | Limite inicial estrito de 6 fotos por perfil, remoção imediata de arquivos rejeitados ou excluídos. |
| **Inatividade do projeto Supabase Free (pausa após ~7 dias)** | Médio | Baixa | Utilizar projeto ativo em desenvolvimento; no ambiente de produção com tráfego real o risco diminui. |
| **Bloqueio de uso comercial na Vercel Hobby** | Alto | Baixa (no início) | Manter `BILLING_MODE=off` e preços "a definir" no MVP; migrar para Vercel Pro ou servidor próprio antes de cobrar usuários. |
| **Limite de e-mails do Supabase Auth para produção** | Alto | Alta | Utilizar SMTP dedicado (ex: Resend plano gratuito) antes do lançamento público. |
| **Upload de arquivos maliciosos ou conteúdo impróprio** | Alto | Média | Validação no servidor por assinatura real (magic bytes), expurgo de EXIF, bucket inicial 100% privado e aprovação manual prévia. |
| **Litígios cíveis sobre montagens ou serviços defeituosos** | Crítico | Média | Isenção explícita de responsabilidade nos Termos e aviso compulsório visível em todos os perfis públicos. |

