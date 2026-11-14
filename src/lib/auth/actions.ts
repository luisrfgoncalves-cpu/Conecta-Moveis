'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import {
  signUpSchema,
  signInSchema,
  recoverPasswordSchema,
  newPasswordSchema,
  updateEmailSchema,
  updatePasswordSchema,
  deleteAccountSchema,
} from './schemas';
import { checkRateLimit } from './rate-limit';

export type ActionResult =
  | { success: true; redirectTo?: string; message?: string }
  | { error: string };

/** Client com service_role — NUNCA exportar, NUNCA usar no cliente */
function getAdminSupabase() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ─── Cadastro ─────────────────────────────────────────────────────────────────

export async function signUp(formData: unknown): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { email, password, fullName } = parsed.data;

  const rateCheck = await checkRateLimit('signup');
  if (!rateCheck.allowed) {
    return { error: 'Muitas tentativas. Aguarde e tente novamente.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        age_declaration: true,
        terms_version: '2.0',
        terms_accepted_at: new Date().toISOString(),
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    // Mensagem genérica — não revelar se e-mail já existe
    return { error: 'Não foi possível criar a conta. Verifique os dados e tente novamente.' };
  }

  // Registrar aceite dos termos (LGPD)
  if (data.user) {
    const admin = getAdminSupabase();
    await admin.from('user_consents').insert({
      user_id: data.user.id,
      terms_version: '1.0',
      privacy_version: '1.0',
    });
  }

  return {
    success: true,
    message:
      'Conta criada! Verifique seu e-mail e clique no link de confirmação para ativar seu acesso.',
  };
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function signIn(formData: unknown): Promise<ActionResult> {
  const parsed = signInSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { email, password } = parsed.data;

  const rateCheck = await checkRateLimit('login');
  if (!rateCheck.allowed) {
    return { error: 'Muitas tentativas. Aguarde e tente novamente.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const errorMsg = error.message?.toLowerCase() || '';
    if (errorMsg.includes('email not confirmed') || errorMsg.includes('email_not_confirmed')) {
      return {
        error:
          'Seu cadastro foi realizado, mas seu e-mail ainda não foi confirmado. Acesse sua caixa de entrada (e spam) e clique no link de ativação enviado para o seu e-mail.',
      };
    }
    // Genérico para proteger privacidade
    return { error: 'E-mail ou senha incorretos.' };
  }

  revalidatePath('/');
  return { success: true, redirectTo: '/painel' };
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function signOut(): Promise<ActionResult> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/');
  return { success: true, redirectTo: '/' };
}

// ─── Recuperação de senha ─────────────────────────────────────────────────────

export async function recoverPassword(formData: unknown): Promise<ActionResult> {
  const parsed = recoverPasswordSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { email } = parsed.data;

  const rateCheck = await checkRateLimit('password_recovery');
  if (!rateCheck.allowed) {
    return { error: 'Muitas tentativas. Aguarde e tente novamente.' };
  }

  const supabase = await createClient();
  // Sempre retorna sucesso para não revelar se o e-mail existe
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?type=recovery`,
  });

  return {
    success: true,
    message:
      'Se esse e-mail estiver cadastrado, você receberá um link para redefinir sua senha.',
  };
}

// ─── Reenvio de Confirmação de Cadastro ────────────────────────────────────────

export async function resendConfirmationEmail(email: string): Promise<ActionResult> {
  const trimmed = email?.trim().toLowerCase();
  if (!trimmed || !trimmed.includes('@')) {
    return { error: 'Informe um e-mail válido para reenviar a confirmação.' };
  }

  const rateCheck = await checkRateLimit('resend_confirmation');
  if (!rateCheck.allowed) {
    return { error: 'Muitas solicitações. Aguarde alguns instantes antes de reenviar.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: trimmed,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: 'Não foi possível reenviar o link no momento. Tente novamente em breve.' };
  }

  return {
    success: true,
    message: 'Novo link de confirmação enviado! Verifique sua caixa de entrada e spam.',
  };
}

// ─── Redefinir senha (após link de recuperação) ───────────────────────────────

export async function updatePassword(formData: unknown): Promise<ActionResult> {
  const parsed = newPasswordSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { error: 'Não foi possível atualizar a senha. Faça login novamente e tente outra vez.' };
  }

  return { success: true, redirectTo: '/painel', message: 'Senha atualizada com sucesso!' };
}

// ─── Alterar e-mail (painel/configuracoes) ────────────────────────────────────

export async function updateEmail(formData: unknown): Promise<ActionResult> {
  const parsed = updateEmailSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão expirada. Faça login novamente.' };

  const { error } = await supabase.auth.updateUser(
    { email: parsed.data.email },
    { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback` }
  );

  if (error) {
    return { error: 'Não foi possível alterar o e-mail.' };
  }

  return {
    success: true,
    message: 'Verifique seu novo e-mail e clique no link de confirmação.',
  };
}

// ─── Alterar senha (painel/seguranca) ────────────────────────────────────────

export async function changePassword(formData: unknown): Promise<ActionResult> {
  const parsed = updatePasswordSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão expirada. Faça login novamente.' };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.newPassword });

  if (error) {
    return { error: 'Não foi possível alterar a senha.' };
  }

  return { success: true, message: 'Senha alterada com sucesso!' };
}

// ─── Baixar meus dados (LGPD) ────────────────────────────────────────────────

export async function downloadMyData(): Promise<
  ActionResult & { data?: Record<string, unknown> }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão expirada.' };

  const [
    profileRes,
    rolesRes,
    profProfilesRes,
    favoritesRes,
    contactsRes,
    reviewsRes,
    consentsRes,
    subscriptionsRes,
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('user_roles').select('role, created_at').eq('user_id', user.id),
    supabase.from('professional_profiles').select('id, display_name, slug, city, state, bio, is_published, created_at').eq('user_id', user.id),
    supabase.from('favorites').select('profile_id, created_at').eq('user_id', user.id),
    supabase.from('contact_requests').select('id, message, created_at, expires_at').eq('sender_id', user.id),
    supabase.from('reviews').select('rating_overall, comment, created_at').eq('reviewer_id', user.id),
    supabase.from('user_consents').select('terms_version, privacy_version, consented_at').eq('user_id', user.id),
    supabase.from('subscriptions').select('plan_id, status, created_at').eq('user_id', user.id),
  ]);

  return {
    success: true,
    data: {
      exportedAt: new Date().toISOString(),
      userId: user.id,
      email: user.email,
      profile: profileRes.data,
      roles: rolesRes.data,
      professionalProfiles: profProfilesRes.data,
      favorites: favoritesRes.data,
      contactRequests: contactsRes.data,
      reviews: reviewsRes.data,
      consents: consentsRes.data,
      subscriptions: subscriptionsRes.data,
    },
  };
}

// ─── Excluir conta (LGPD) ────────────────────────────────────────────────────

/**
 * O que é EXCLUÍDO em cascata (via FK):
 * - profiles, user_roles, entitlements, subscriptions, plan_interest,
 *   professional_profiles, company_members (como membro), favorites,
 *   contact_requests (como remetente), user_consents
 *
 * O que é ANONIMIZADO (SET NULL):
 * - reports.reporter_id → NULL (denúncia mantida para moderação)
 * - moderation_events.moderator_id → NULL
 *
 * O que PODE BLOQUEAR:
 * - admin_logs.admin_id → RESTRICT (admin com logs não pode se auto-excluir)
 */
export async function deleteAccount(formData: unknown): Promise<ActionResult> {
  const parsed = deleteAccountSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão expirada. Faça login novamente.' };

  const admin = getAdminSupabase();
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    if (error.message?.includes('violates foreign key')) {
      return {
        error:
          'Esta conta possui registros administrativos e não pode ser excluída automaticamente. Entre em contato.',
      };
    }
    return { error: 'Não foi possível excluir a conta. Tente novamente ou entre em contato.' };
  }

  await supabase.auth.signOut();
  return { success: true, redirectTo: '/' };
}

