import { z } from 'zod';

export const signUpSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),
  email: z.string().email('Informe um e-mail válido'),
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(72, 'Senha muito longa'),
  acceptedTerms: z.literal(true, {
    errorMap: () => ({ message: 'Você precisa aceitar os termos para continuar' }),
  }),
  ageDeclaration: z.literal(true, {
    errorMap: () => ({ message: 'Você precisa declarar ter 18 anos ou mais para se cadastrar' }),
  }),
});

export const signInSchema = z.object({
  email: z.string().email('Informe um e-mail válido'),
  password: z.string().min(1, 'Informe sua senha'),
});

export const recoverPasswordSchema = z.object({
  email: z.string().email('Informe um e-mail válido'),
});

export const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Senha deve ter pelo menos 8 caracteres')
      .max(72, 'Senha muito longa'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export const updateEmailSchema = z.object({
  email: z.string().email('Informe um e-mail válido'),
});

export const updatePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Nova senha deve ter pelo menos 8 caracteres')
      .max(72, 'Senha muito longa'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export const deleteAccountSchema = z.object({
  confirmation: z.literal('EXCLUIR', {
    errorMap: () => ({ message: 'Digite EXCLUIR para confirmar' }),
  }),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type RecoverPasswordInput = z.infer<typeof recoverPasswordSchema>;
export type NewPasswordInput = z.infer<typeof newPasswordSchema>;
export type UpdateEmailInput = z.infer<typeof updateEmailSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;

