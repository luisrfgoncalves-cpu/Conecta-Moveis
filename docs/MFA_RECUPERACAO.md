# GUIA DE RECUPERAÇÃO DE AUTENTICAÇÃO EM DOIS FATORES (MFA / TOTP)

> **Destinatários:** Administradores, Moderadores e Proprietário (`owner`) da Conecta Móveis.  
> **Finalidade:** Procedimento seguro de recuperação em caso de perda, roubo, formatação ou troca do celular/aplicativo autenticador.

---

## 1. Como Funciona a Proteção MFA AAL2
O sistema exige nível **AAL2 (Authenticator Assurance Level 2)** para todas as rotas e ações críticas em `/admin`. Isso significa que mesmo que alguém descubra a sua senha, não conseguirá acessar o painel administrativo sem o código temporário de 6 dígitos do seu aplicativo autenticador (Google Authenticator, Microsoft Authenticator, 1Password, etc.).

---

## 2. Cenário: Perdi o Celular ou o Aplicativo Autenticador

Como você é o dono da infraestrutura e tem acesso direto ao console do **Supabase Dashboard**, você nunca ficará trancado para sempre. Existem dois métodos rápidos de restabelecimento:

### Método A — Pelo Supabase Dashboard (Sem Código)
1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard) e faça login com sua conta do Supabase.
2. Selecione o projeto Conecta Móveis.
3. No menu lateral esquerdo, clique em **Authentication** > **Users**.
4. Localize o seu e-mail (`luis.rf.goncalves@gmail.com`).
5. Clique no menu de três pontos (`...`) ao lado do seu usuário e selecione **"View Details"**.
6. Na seção **MFA Factors**, clique no botão **Delete Factor** (ou "Unenroll").
7. Pronto! Na próxima vez que você fizer login na Conecta Móveis, a exigência de AAL2 solicitará o pareamento de um novo aplicativo autenticador com QR Code limpo.

---

### Método B — Via Comando SQL no Supabase Editor (Instantâneo)
Se preferir resolver em 5 segundos via comando:
1. Acesse o **SQL Editor** no painel do Supabase.
2. Execute o comando abaixo (substituindo pelo seu e-mail se necessário):

```sql
-- Remove todos os fatores TOTP associados ao seu e-mail para permitir novo pareamento
DELETE FROM auth.mfa_factors
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'luis.rf.goncalves@gmail.com'
);
```

3. O fator TOTP antigo é imediatamente revogado, e você poderá parear seu novo dispositivo no próximo login.

---

## 3. Prevenção e Boas Práticas
- Ao escanear o QR Code inicial de pareamento, ative o backup em nuvem do seu aplicativo autenticador (ex: Conta Google no Google Authenticator ou Conta Microsoft no Authenticator).
- Mantenha sempre um segundo dispositivo autorizado ou anote a chave secreta alfanumérica de emergência em local físico seguro.

