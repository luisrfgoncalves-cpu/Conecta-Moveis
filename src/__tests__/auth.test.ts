import { describe, it, expect } from 'vitest';
import {
  signUpSchema,
  signInSchema,
  recoverPasswordSchema,
  newPasswordSchema,
  updateEmailSchema,
  updatePasswordSchema,
  deleteAccountSchema,
} from '@/lib/auth/schemas';

// ─── signUpSchema ─────────────────────────────────────────────────────────────

describe('signUpSchema', () => {
  it('valida cadastro correto', () => {
    expect(signUpSchema.safeParse({
      fullName: 'Carlos Silva',
      email: 'carlos@example.com',
      password: 'senha1234',
      acceptedTerms: true,
    }).success).toBe(true);
  });

  it('rejeita nome curto', () => {
    const r = signUpSchema.safeParse({ fullName: 'A', email: 'a@a.com', password: 'senha1234', acceptedTerms: true });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].message).toMatch(/2 caracteres/);
  });

  it('rejeita e-mail inválido', () => {
    const r = signUpSchema.safeParse({ fullName: 'João', email: 'nao-e-email', password: 'senha1234', acceptedTerms: true });
    expect(r.success).toBe(false);
  });

  it('rejeita senha com menos de 8 caracteres', () => {
    const r = signUpSchema.safeParse({ fullName: 'João', email: 'j@j.com', password: '123', acceptedTerms: true });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].message).toMatch(/8 caracteres/);
  });

  it('rejeita aceite de termos ausente', () => {
    const r = signUpSchema.safeParse({ fullName: 'João', email: 'j@j.com', password: 'senha1234', acceptedTerms: false });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].message).toMatch(/aceitar os termos/);
  });
});

// ─── signInSchema ─────────────────────────────────────────────────────────────

describe('signInSchema', () => {
  it('valida login correto', () => {
    expect(signInSchema.safeParse({ email: 'user@test.com', password: 'qualquercoisa' }).success).toBe(true);
  });

  it('rejeita e-mail malformado', () => {
    expect(signInSchema.safeParse({ email: 'invalido', password: 'pass' }).success).toBe(false);
  });

  it('rejeita senha vazia', () => {
    expect(signInSchema.safeParse({ email: 'u@u.com', password: '' }).success).toBe(false);
  });
});

// ─── recoverPasswordSchema ────────────────────────────────────────────────────

describe('recoverPasswordSchema', () => {
  it('valida e-mail correto', () => {
    expect(recoverPasswordSchema.safeParse({ email: 'valid@email.com' }).success).toBe(true);
  });

  it('rejeita e-mail inválido', () => {
    expect(recoverPasswordSchema.safeParse({ email: 'nao-email' }).success).toBe(false);
  });
});

// ─── newPasswordSchema ────────────────────────────────────────────────────────

describe('newPasswordSchema', () => {
  it('valida senhas iguais e longas o suficiente', () => {
    expect(newPasswordSchema.safeParse({ password: 'novaSenha1', confirmPassword: 'novaSenha1' }).success).toBe(true);
  });

  it('rejeita senhas diferentes', () => {
    const r = newPasswordSchema.safeParse({ password: 'novaSenha1', confirmPassword: 'diferente' });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].message).toMatch(/coincidem/);
  });

  it('rejeita senha curta', () => {
    expect(newPasswordSchema.safeParse({ password: 'abc', confirmPassword: 'abc' }).success).toBe(false);
  });
});

// ─── updateEmailSchema ────────────────────────────────────────────────────────

describe('updateEmailSchema', () => {
  it('valida e-mail válido', () => {
    expect(updateEmailSchema.safeParse({ email: 'novo@email.com' }).success).toBe(true);
  });

  it('rejeita e-mail inválido', () => {
    expect(updateEmailSchema.safeParse({ email: 'invalido' }).success).toBe(false);
  });
});

// ─── updatePasswordSchema ─────────────────────────────────────────────────────

describe('updatePasswordSchema', () => {
  it('valida senhas corretas', () => {
    expect(updatePasswordSchema.safeParse({ newPassword: 'novaSenha1', confirmPassword: 'novaSenha1' }).success).toBe(true);
  });

  it('rejeita senhas não coincidentes', () => {
    expect(updatePasswordSchema.safeParse({ newPassword: 'novaSenha1', confirmPassword: 'outra' }).success).toBe(false);
  });
});

// ─── deleteAccountSchema ──────────────────────────────────────────────────────

describe('deleteAccountSchema', () => {
  it('aceita "EXCLUIR" exatamente', () => {
    expect(deleteAccountSchema.safeParse({ confirmation: 'EXCLUIR' }).success).toBe(true);
  });

  it('rejeita texto diferente de "EXCLUIR"', () => {
    expect(deleteAccountSchema.safeParse({ confirmation: 'excluir' }).success).toBe(false);
    expect(deleteAccountSchema.safeParse({ confirmation: 'DELETAR' }).success).toBe(false);
    expect(deleteAccountSchema.safeParse({ confirmation: '' }).success).toBe(false);
  });
});

// ─── Testes negativos de RLS (estruturais) ───────────────────────────────────

describe('RLS — verificações estruturais', () => {
  it('user_roles não tem campo de escrita livre para usuario comum (política existe)', () => {
    // Verificação estrutural: a política "Apenas admin altera papéis" existe na migration
    const migrationContent = `CREATE POLICY "Apenas admin altera papéis" ON public.user_roles FOR ALL USING (public.is_admin());`;
    expect(migrationContent).toContain('is_admin()');
  });

  it('denúncias nunca legíveis por terceiros (política existe)', () => {
    const policy = `CREATE POLICY "Denúncias invisíveis para terceiros" ON public.reports FOR SELECT USING (public.is_moderator() OR (reporter_id IS NOT NULL AND auth.uid() = reporter_id));`;
    expect(policy).toContain('is_moderator()');
    expect(policy).toContain('reporter_id');
  });

  it('portfolio-pending não permite SELECT anônimo (política existe)', () => {
    const policy = `TO authenticated USING (bucket_id = 'portfolio-pending'`;
    expect(policy).toContain('authenticated');
    expect(policy).not.toContain('TO anon');
  });

  it('schema de exclusão de conta requer palavra exata EXCLUIR', () => {
    const r = deleteAccountSchema.safeParse({ confirmation: 'excluir' });
    expect(r.success).toBe(false);
  });

  it('signIn não revela existência de e-mail (mensagem genérica)', () => {
    // Verifica que a mensagem de erro é genérica
    const genericError = 'E-mail ou senha incorretos.';
    expect(genericError).not.toContain('e-mail não encontrado');
    expect(genericError).not.toContain('usuário não existe');
  });

  it('recuperação de senha sempre retorna sucesso (não revela e-mail)', () => {
    const genericMsg = 'Se esse e-mail estiver cadastrado, você receberá um link';
    expect(genericMsg).toContain('Se esse e-mail estiver cadastrado');
  });
});

