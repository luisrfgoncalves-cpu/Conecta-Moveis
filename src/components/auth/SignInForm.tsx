'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from '@/lib/auth/actions';
import { signInSchema, type SignInInput } from '@/lib/auth/schemas';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') ?? '/painel';
  const hasConfirmationError = searchParams.get('erro') === 'confirmacao';

  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });

  function onSubmit(data: SignInInput) {
    setServerError('');
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
        <div role="alert" className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          Link de confirmação inválido ou expirado. Solicite um novo link de acesso.
        </div>
      )}

      {serverError && (
        <div role="alert" className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {serverError}
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

