'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { recoverPassword, updatePassword } from '@/lib/auth/actions';
import {
  recoverPasswordSchema,
  newPasswordSchema,
  type RecoverPasswordInput,
  type NewPasswordInput,
} from '@/lib/auth/schemas';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';

/** Formulário de recuperação de senha (solicitar link) */
export function RecoverPasswordForm() {
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecoverPasswordInput>({
    resolver: zodResolver(recoverPasswordSchema),
  });

  function onSubmit(data: RecoverPasswordInput) {
    setServerError('');
    startTransition(async () => {
      const result = await recoverPassword(data);
      if ('error' in result) {
        setServerError(result.error);
      } else {
        setSuccessMessage(result.message ?? 'Verifique seu e-mail.');
      }
    });
  }

  if (successMessage) {
    return (
      <div className="glass-panel rounded-2xl p-8 w-full max-w-md mx-auto border border-white/10 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
        <h2 className="text-xl font-black text-white mb-3">Verifique seu e-mail</h2>
        <p className="text-slate-300 text-sm leading-relaxed">{successMessage}</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-8 w-full max-w-md mx-auto border border-white/10">
      <h1 className="text-2xl font-black text-white mb-2">Recuperar senha</h1>
      <p className="text-sm text-slate-400 mb-8">
        Informe seu e-mail e enviaremos um link para redefinir sua senha.
      </p>

      {serverError && (
        <div role="alert" className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-1.5">
            E-mail cadastrado
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition aria-[invalid=true]:border-red-500/50"
            placeholder="seu@email.com"
            {...register('email')}
          />
          {errors.email && (
            <p id="email-error" role="alert" className="mt-1 text-xs text-red-400">
              {errors.email.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="btn-neon w-full py-3.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enviando…
            </>
          ) : (
            'Enviar link de recuperação'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        <Link href="/entrar" className="text-orange-400 font-semibold hover:text-orange-300 transition">
          Voltar para o login
        </Link>
      </p>
    </div>
  );
}

/** Formulário para definir nova senha (após clicar no link de recuperação) */
export function NewPasswordForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPasswordInput>({
    resolver: zodResolver(newPasswordSchema),
  });

  function onSubmit(data: NewPasswordInput) {
    setServerError('');
    startTransition(async () => {
      const result = await updatePassword(data);
      if ('error' in result) {
        setServerError(result.error);
      } else if (result.redirectTo) {
        router.push(result.redirectTo);
      }
    });
  }

  return (
    <div className="glass-panel rounded-2xl p-8 w-full max-w-md mx-auto border border-white/10">
      <h1 className="text-2xl font-black text-white mb-2">Criar nova senha</h1>
      <p className="text-sm text-slate-400 mb-8">Escolha uma senha segura para sua conta.</p>

      {serverError && (
        <div role="alert" className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-slate-300 mb-1.5">
            Nova senha
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition aria-[invalid=true]:border-red-500/50"
              placeholder="Mínimo 8 caracteres"
              {...register('password')}
            />
            <button
              type="button"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" role="alert" className="mt-1 text-xs text-red-400">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-300 mb-1.5">
            Confirmar senha
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
            className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition aria-[invalid=true]:border-red-500/50"
            placeholder="Repita a senha"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p id="confirm-error" role="alert" className="mt-1 text-xs text-red-400">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="btn-neon w-full py-3.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Salvando…
            </>
          ) : (
            'Salvar nova senha'
          )}
        </button>
      </form>
    </div>
  );
}

