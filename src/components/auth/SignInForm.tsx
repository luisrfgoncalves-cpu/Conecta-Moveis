'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn, resendConfirmationEmail } from '@/lib/auth/actions';
import { signInSchema, type SignInInput } from '@/lib/auth/schemas';
import { Eye, EyeOff, Loader2, MailCheck, AlertTriangle } from 'lucide-react';

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') ?? '/painel';
  const hasConfirmationError = searchParams.get('erro') === 'confirmacao';

  const [serverError, setServerError] = useState('');
  const [resendSuccess, setResendSuccess] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });

  const emailValue = watch('email');
  const isUnconfirmedEmailError = serverError.toLowerCase().includes('ainda não foi confirmado');

  async function handleResendEmail() {
    if (!emailValue || !emailValue.includes('@')) {
      setServerError('Preencha seu e-mail no formulário abaixo para receber um novo link.');
      return;
    }
    setIsResending(true);
    setResendSuccess('');
    try {
      const res = await resendConfirmationEmail(emailValue);
      if ('error' in res) {
        setServerError(res.error);
      } else {
        setResendSuccess(res.message || 'Link reenviado com sucesso! Confira sua caixa de entrada.');
      }
    } finally {
      setIsResending(false);
    }
  }

  function onSubmit(data: SignInInput) {
    setServerError('');
    setResendSuccess('');
    startTransition(async () => {
      const result = await signIn(data);
      if ('error' in result) {
        setServerError(result.error);
      } else if (result.redirectTo) {
        router.push(nextUrl);
      }
    });
  }

  return (
    <div className="glass-panel rounded-2xl p-8 w-full max-w-md mx-auto border border-white/10">
      <h1 className="text-2xl font-black text-white mb-2">Entrar na conta</h1>
      <p className="text-sm text-slate-400 mb-8">
        Acesse o painel para gerenciar seu perfil e contatos.
      </p>

      {hasConfirmationError && (
        <div role="alert" className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
          <span>Link de confirmação inválido ou expirado. Digite seu e-mail abaixo e clique em reenviar link.</span>
        </div>
      )}

      {resendSuccess && (
        <div role="status" className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-start gap-2.5">
          <MailCheck className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />
          <span>{resendSuccess}</span>
        </div>
      )}

      {serverError && (
        <div
          role="alert"
          className={`mb-4 p-3.5 rounded-xl border text-sm flex flex-col gap-2 ${
            isUnconfirmedEmailError
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isUnconfirmedEmailError ? 'text-amber-400' : 'text-red-400'}`} />
            <p className="flex-1 leading-relaxed">{serverError}</p>
          </div>

          {isUnconfirmedEmailError && (
            <div className="mt-2 pt-2 border-t border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className="text-xs text-amber-200/80">Não localizou a mensagem de ativação?</span>
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={isResending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-bold transition border border-amber-500/40 disabled:opacity-50"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Reenviando…
                  </>
                ) : (
                  <>
                    <MailCheck className="w-3.5 h-3.5" />
                    Reenviar e-mail de ativação
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-1.5">
            E-mail
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

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="password" className="block text-sm font-semibold text-slate-300">
              Senha
            </label>
            <Link href="/recuperar-senha" className="text-xs text-orange-400 hover:text-orange-300 transition">
              Esqueci minha senha
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition aria-[invalid=true]:border-red-500/50"
              placeholder="••••••••"
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

        <button
          type="submit"
          disabled={isPending}
          className="btn-neon w-full py-3.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Entrando…
            </>
          ) : (
            'Entrar'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Ainda não tem conta?{' '}
        <Link href="/criar-conta" className="text-orange-400 font-semibold hover:text-orange-300 transition">
          Criar conta grátis
        </Link>
      </p>
    </div>
  );
}

