# Política de Segurança — Conecta Móveis

## Divulgação Responsável

Levamos a segurança da nossa plataforma a sério. Se você descobriu uma vulnerabilidade, agradecemos que nos informe de forma privada antes de qualquer divulgação pública, para que possamos corrigi-la e proteger nossos usuários.

---

## Como Reportar uma Vulnerabilidade

Envie um e-mail para **segurança@conectamoveis.com.br** _(placeholder — substituir antes do lançamento)_ com:

- **Descrição clara** da vulnerabilidade
- **Passos para reproduzir** (quanto mais detalhados, melhor)
- **Impacto potencial** (o que um atacante poderia fazer)
- **Versão/ambiente** onde foi identificada
- Capturas de tela ou logs relevantes (se aplicável)

> Por favor, **não** abra issues públicas no GitHub para relatar vulnerabilidades de segurança.

---

## O que Consideramos Vulnerabilidade

### ✅ Exemplos de vulnerabilidades válidas

- Acesso não autorizado a dados de outros usuários (IDOR, broken access control)
- Injeção de SQL ou NoSQL
- Cross-Site Scripting (XSS) com impacto real
- Bypass de autenticação ou autorização
- Exposição de chaves de API ou credenciais
- Falhas em RLS (Row Level Security) do Supabase que permitam leitura/escrita indevida
- Server-Side Request Forgery (SSRF)
- Vulnerabilidades de upload de arquivo com execução remota

### ❌ Fora do escopo (comportamento esperado ou limitação aceita)

- Enumeração de e-mails via mensagens de erro de autenticação (limitação do Supabase Auth)
- Rate limiting ausente em endpoints de baixo risco
- Ausência de CAPTCHA em formulários públicos
- Vulnerabilidades em dependências sem prova de exploração no contexto desta aplicação
- Problemas de segurança em ambientes de desenvolvimento/preview que não afetam produção
- Self-XSS (requer que o próprio usuário se ataque)
- Ataques de força bruta a senhas (mitigado pelo Supabase Auth)

---

## Tempo de Resposta Esperado

| Etapa | Prazo |
|-------|-------|
| Confirmação de recebimento | 72 horas |
| Triagem e avaliação inicial | 7 dias úteis |
| Comunicação de resolução | 30 dias (para vulnerabilidades críticas, priorizamos) |

---

## Recompensas (Bug Bounty)

No momento **não oferecemos recompensas financeiras**. Estamos em fase inicial e ainda não temos programa formal de bug bounty.

Futuramente pretendemos implementar um programa de bug bounty. Pesquisadores que reportarem vulnerabilidades válidas serão creditados (com permissão) no nosso Hall of Fame.

---

## Regras para Pesquisadores

- **Nunca** teste em ambiente de produção sem autorização prévia por escrito
- Não acesse, modifique ou exclua dados de outros usuários durante seus testes
- Use apenas contas e dados criados por você para fins de teste
- Não realize ataques de negação de serviço (DoS/DDoS)
- Não explore vulnerabilidades além do necessário para demonstrar o impacto
- Não divulgue publicamente detalhes da vulnerabilidade antes de 90 dias após a correção (coordinated disclosure)

O não cumprimento destas regras pode resultar em ação legal.
