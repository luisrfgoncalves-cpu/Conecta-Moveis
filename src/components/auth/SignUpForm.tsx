'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { signUp } from '@/lib/auth/actions';
import { signUpSchema, type SignUpInput } from '@/lib/auth/schemas';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';

export function SignUpForm() {
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  });

  function onSubmit(data: SignUpInput) {
    setServerError('');
    startTransition(async () => {
      const result = await signUp(data);
      if ('error' in result) {
        setServerError(result.error);
      } else {
        setSuccessMessage(result.message ?? 'Conta criada! Verifique seu e-mail.');
      }
    });
  }

  if (successMessage) {
    return (
      <div className="glass-panel rounded-2xl p-8 w-full max-w-md mx-auto border border-white/10 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
        <h2 className="text-xl font-black text-white mb-3">Verifique seu e-mail</h2>
        <p className="text-slate-300 text-sm leading-relaxed mb-6">{successMessage}</p>
        <Link href="/entrar" className="btn-neon inline-block px-8 py-3 text-sm">
          Ir para o login
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-8 w-full max-w-md mx-auto border border-white/10">
      <h1 className="text-2xl font-black text-white mb-2">Criar conta grátis</h1>
      <p className="text-sm text-slate-400 mb-8">
        Encontre profissionais ou divulgue seus serviços de móveis em Jundiaí e região.
      </p>

      {serverError && (
        <div role="alert" className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div>
          <label htmlFor="fullName" className="block text-sm font-semibold text-slate-300 mb-1.5">
            Nome completo
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            aria-invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? 'fullName-error' : undefined}
            className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition aria-[invalid=true]:border-red-500/50"
            placeholder="Seu nome"
            {...register('fullName')}
          />
          {errors.fullName && (
            <p id="fullName-error" role="alert" className="mt-1 text-xs text-red-400">
              {errors.fullName.message}
            </p>
          )}
        </div>

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
          <label htmlFor="password" className="block text-sm font-semibold text-slate-300 mb-1.5">
            Senha
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : 'password-hint'}
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
          {errors.password ? (
            <p id="password-error" role="alert" className="mt-1 text-xs text-red-400">
              {errors.password.message}
            </p>
          ) : (
            <p id="password-hint" className="mt-1 text-xs text-slate-500">
              Mínimo de 8 caracteres
            </p>
          )}
        </div>

        <div>
          <div className="flex items-start gap-3">
            <input
              id="acceptedTerms"
              type="checkbox"
              aria-invalid={!!errors.acceptedTerms}
              aria-describedby={errors.acceptedTerms ? 'terms-error' : undefined}
              className="mt-0.5 w-4 h-4 accent-orange-500 cursor-pointer"
              {...register('acceptedTerms')}
            />
            <label htmlFor="acceptedTerms" className="text-xs text-slate-400 leading-relaxed cursor-pointer">
              Li e aceito os{' '}
              <Link href="/termos" target="_blank" className="text-orange-400 underline hover:text-orange-300">
                Termos de Uso
              </Link>{' '}
              e a{' '}
              <Link href="/privacidade" target="_blank" className="text-orange-400 underline hover:text-orange-300">
                Política de Privacidade
              </Link>
              . A plataforma não garante qualidade ou resultado de serviços.
            </label>
          </div>
          {errors.acceptedTerms && (
            <p id="terms-error" role="alert" className="mt-1 text-xs text-red-400">
              {errors.acceptedTerms.message}
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
              Criando conta…
            </>
          ) : (
            'Criar conta grátis'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Já tem conta?{' '}
        <Link href="/entrar" className="text-orange-400 font-semibold hover:text-orange-300 transition">
          Entrar
        </Link>
      </p>
    </div>
  );
}

