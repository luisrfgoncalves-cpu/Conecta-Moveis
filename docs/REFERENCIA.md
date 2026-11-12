# REFERÊNCIA TÉCNICA — CONECTA MÓVEIS (fonte de verdade)

NÃO implemente nada agora. Ele é a fonte de verdade para as próximas fases. Se algo aqui conflitar com um pedido futuro, avise-me antes de agir.

## 1. IDENTIDADE E PAPÉIS
- `auth.users`: autenticação.
- `profiles`: dados pessoais mínimos.
- `professional_profiles`: uma atuação profissional (um usuário pode ter várias).
- `companies` e `company_members` (owner, manager, editor, viewer).
- Papéis de sistema (`user`, `moderator`, `admin`) ficam em tabela separada `user_roles`, sem política de escrita para usuários comuns. O primeiro admin é promovido por SQL manual, nunca pelo cadastro.
- Um usuário pode ser pessoa comum, montador, marceneiro e membro de empresa ao mesmo tempo.

## 2. ROTAS (padrão de nomes: sem acento, em português, com hífen)
- **Públicas**: `/`, `/como-funciona`, `/encontrar-profissionais`, `/categorias`, `/profissionais/[slug]`, `/empresas/[slug]`, `/para-profissionais`, `/para-lojas-e-marcenarias`, `/planos`, `/entrar`, `/criar-conta`, `/recuperar-senha`, `/termos`, `/privacidade`, `/contato`, `/denunciar`, e páginas legais complementares (anúncios, avaliações, portfólio, assinatura).
- **Autenticadas**: `/painel`, `/painel/perfil`, `/painel/portfolio`, `/painel/solicitacoes`, `/painel/favoritos`, `/painel/avaliacoes`, `/painel/assinatura`, `/painel/configuracoes`, `/painel/seguranca`, `/painel/empresas`.
- **Administrativas**: `/admin`, `/admin/usuarios`, `/admin/perfis`, `/admin/empresas`, `/admin/fotos`, `/admin/denuncias`, `/admin/avaliacoes`, `/admin/categorias`, `/admin/planos`, `/admin/assinaturas`, `/admin/logs`.
- Rota cujo recurso ainda não existe não aparece em menu nem link. Erro de digitação a evitar: o correto é `/painel/portfolio`.

## 3. MODELO DE DADOS MÍNIMO
- UUID, `created_at` e `updated_at` com timezone, constraints, índices, migrations.
- Tabelas: `profiles`, `user_roles`, `professional_profiles`, `companies`, `company_members`, `categories`, `specialties`, `profile_specialties`, `service_regions` (cidade, UF, regiões; nunca endereço residencial), `portfolio_items`, `portfolio_images` (status `pending`, `approved`, `rejected`, `removed`; ordem; bytes; `is_demo`), `contact_requests` (com `expires_at`), `favorites`, `reviews` (cinco critérios, comentário, status, resposta do profissional, vínculo com a solicitação), `reports` (uma única tabela com `target_type`: `profile`, `image`, `review`, `company`), `plans`, `subscriptions`, `entitlements`, `plan_interest`, `user_consents` (versão e data), `moderation_events`, `admin_logs` (admin, data, ação, motivo, registro, valor anterior e posterior), `rate_limits`, `daily_metrics` (contadores agregados por dia, não por evento).
- **Adiado para a versão 2**: `notifications`, chat interno, convites de equipe, oportunidades para empresas.
- Sem CPF, CNPJ obrigatório ou endereço residencial no cadastro. CNPJ, se existir, é campo opcional e informativo, sem selo.
- Exclusão em cascata só após análise de impacto documentada.

## 4. RLS (obrigatória em toda tabela com dado não público)
- Pessoa pública lê apenas conteúdo publicado.
- Usuário edita só o que é seu.
- Membro de empresa acessa conforme função.
- Moderador acessa filas necessárias.
- Admin tem escopo documentado em `docs/RLS_MATRIX.md` (tabela x anônimo x dono x membro x moderador x admin).
- Denúncias nunca são legíveis por terceiros.
- Funções auxiliares `SECURITY DEFINER` com `search_path` fixo.
- Toda rota sensível verifica sessão no servidor e RLS no banco.

## 5. STORAGE
- `avatars`: público (fotos e logos já redimensionados).
- `portfolio-pending`: privado. Todo upload entra aqui, com nome aleatório.
- `portfolio-public`: leitura pública. Só recebe arquivo após aprovação (o servidor copia de `pending` para `public`). Rejeitado ou removido é apagado.
- Duas versões por imagem: miniatura (480 px) e completa (1600 px), ambas WebP, completa com alvo de até 400 KB.
- Validação no servidor por assinatura real do arquivo (magic bytes), extensão, tamanho, dimensões e quantidade.
- Remover metadados EXIF.
- Limite de fotos vem de `entitlements` (padrão provisório no plano gratuito: 6 por perfil).

## 6. RATE LIMIT E ANTI-ABUSO (sem serviço externo)
- Tabela `rate_limits` no Postgres com função de checagem, aplicada em cadastro, login, recuperação de senha, solicitação de contato, denúncia e upload.
- Mensagens de autenticação não revelam se o e-mail existe.
- Captcha só com aprovação (opção gratuita futura: Cloudflare Turnstile).

## 7. CONTATO
- Link de WhatsApp a partir de número que o profissional escolheu tornar público, mais solicitação curta (até 500 caracteres) feita por usuário logado.
- Sem preço, orçamento, agenda, pagamento ou contrato.
- A tela informa quem verá a mensagem e por quanto tempo será guardada.
- Clique em WhatsApp é métrica agregada, nunca prova de contratação.

## 8. AVALIAÇÕES
- Sem média inicial; perfil sem avaliação mostra "Sem avaliações ainda".
- Elegibilidade = interação registrada (solicitação de contato), nunca chamada de "contratação verificada".
- Uma avaliação por solicitação, sem autoavaliação nem avaliação entre contas da mesma empresa.
- Comentários com termos de risco (acusação criminal, ameaça, dados pessoais, discriminação) vão para fila de moderação, não são publicados automaticamente.
- Há direito de resposta, denúncia, contestação e log.

## 9. SELOS PERMITIDOS NO MVP
- E-mail confirmado, perfil completo, portfólio publicado pelo anunciante, perfil novo.
- Não usar "confiável", "aprovado", "certificado", "telefone confirmado" ou "CNPJ consultado" sem verificação real implementada.

## 10. AVISO OBRIGATÓRIO NO PERFIL PÚBLICO
- *"Este perfil é publicado pelo anunciante. A presença na plataforma não representa garantia da qualidade, prazo ou resultado do serviço."*

## 11. PLANOS
- Catálogo (`plans`), assinatura (`subscriptions`) e recursos liberados (`entitlements`) separados.
- Limites aplicados no servidor. Sem gateway no MVP.
- Destaque pago sempre rotulado "Destaque patrocinado" e nunca apresentado como qualidade. Preços: "a definir".

## 12. INFRAESTRUTURA GRATUITA E GATILHOS DE MIGRAÇÃO
- Registre em `docs/LIMITES_INFRA.md` e exiba no `/admin` o uso atual de banco e storage.
- Gatilhos: banco acima de 350 MB; storage acima de 700 MB; transferência acima de 3,5 GB/mês; primeira cobrança de qualquer usuário (Vercel Hobby é para uso não comercial); dados reais de usuários sem backup gerenciado; necessidade de e-mail em volume.

## 13. FILTROS DO MVP
- Termo, UF, cidade, categoria e especialidade.
- Demais filtros (tipo de móvel, disponibilidade, experiência, distância, avaliação, plano) ficam para a versão 2. Sem mapas, PostGIS ou geolocalização.

## 14. UI
- Mobile-first, temas claro e escuro, foco de teclado visível, labels em todos os campos, estados de loading, erro e vazio, sem emojis, sem carrossel automático, sem depoimento fictício, texto sempre em HTML/CSS (nunca dentro de imagem), respeito a `prefers-reduced-motion`.

