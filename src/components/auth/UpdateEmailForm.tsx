'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition } from 'react';
import { updateEmail } from '@/lib/auth/actions';
import { updateEmailSchema, type UpdateEmailInput } from '@/lib/auth/schemas';
import { Loader2, CheckCircle2 } from 'lucide-react';

export function UpdateEmailForm({ currentEmail }: { currentEmail: string }) {
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateEmailInput>({
    resolver: zodResolver(updateEmailSchema),
    defaultValues: { email: currentEmail },
  });

  function onSubmit(data: UpdateEmailInput) {
    setServerError('');
    setSuccessMessage('');
    startTransition(async () => {
      const result = await updateEmail(data);
      if ('error' in result) {
        setServerError(result.error);
      } else {
        setSuccessMessage(result.message ?? 'E-mail atualizado.');
        reset({ email: data.email });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {serverError && (
        <div role="alert" className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {serverError}
        </div>
      )}
      {successMessage && (
        <div role="status" className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {successMessage}
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-1.5">
          Novo e-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition aria-[invalid=true]:border-red-500/50"
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
        className="btn-neon px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando…</> : 'Salvar novo e-mail'}
      </button>
    </form>
  );
}
