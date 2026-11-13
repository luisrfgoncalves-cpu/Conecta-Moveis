'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { changePassword, downloadMyData, deleteAccount } from '@/lib/auth/actions';
import {
  updatePasswordSchema,
  deleteAccountSchema,
  type UpdatePasswordInput,
  type DeleteAccountInput,
} from '@/lib/auth/schemas';
import { Eye, EyeOff, Loader2, CheckCircle2, Download, Trash2, AlertTriangle } from 'lucide-react';

// ─── Formulário de alteração de senha ────────────────────────────────────────

export function ChangePasswordForm() {
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdatePasswordInput>({ resolver: zodResolver(updatePasswordSchema) });

  function onSubmit(data: UpdatePasswordInput) {
    setServerError('');
    setSuccessMessage('');
    startTransition(async () => {
      const result = await changePassword(data);
      if ('error' in result) {
        setServerError(result.error);
      } else {
        setSuccessMessage(result.message ?? 'Senha alterada!');
        reset();
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
          <CheckCircle2 className="w-4 h-4" /> {successMessage}
        </div>
      )}
      {(['newPassword', 'confirmPassword'] as const).map((field) => (
        <div key={field}>
          <label htmlFor={field} className="block text-sm font-semibold text-slate-300 mb-1.5">
            {field === 'newPassword' ? 'Nova senha' : 'Confirmar nova senha'}
          </label>
          <div className="relative">
            <input
              id={field}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              aria-invalid={!!errors[field]}
              aria-describedby={errors[field] ? `${field}-error` : undefined}
              className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition aria-[invalid=true]:border-red-500/50"
              placeholder="Mínimo 8 caracteres"
              {...register(field)}
            />
            {field === 'newPassword' && (
              <button
                type="button"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            )}
          </div>
          {errors[field] && (
            <p id={`${field}-error`} role="alert" className="mt-1 text-xs text-red-400">
              {errors[field]?.message}
            </p>
          )}
        </div>
      ))}
      <button
        type="submit"
        disabled={isPending}
        className="btn-neon px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando…</> : 'Alterar senha'}
      </button>
    </form>
  );
}

// ─── Botão de download de dados (LGPD) ───────────────────────────────────────

export function DownloadDataButton() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  function handleDownload() {
    setError('');
    startTransition(async () => {
      const result = await downloadMyData();
      if ('error' in result) {
        setError(result.error);
        return;
      }
      const json = JSON.stringify(result.data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conecta-moveis-meus-dados-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleDownload}
        disabled={isPending}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-sky-500/40 text-sky-400 text-sm font-semibold hover:bg-sky-500/10 transition disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        Baixar meus dados (JSON)
      </button>
      {error && <p role="alert" className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ─── Formulário de exclusão de conta ─────────────────────────────────────────

export function DeleteAccountForm() {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeleteAccountInput>({ resolver: zodResolver(deleteAccountSchema) });

  function onSubmit(data: DeleteAccountInput) {
    setServerError('');
    startTransition(async () => {
      const result = await deleteAccount(data);
      if ('error' in result) {
        setServerError(result.error);
      } else if (result.redirectTo) {
        router.push(result.redirectTo);
      }
    });
  }

  return (
    <div className="space-y-4">
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-500/40 text-red-400 text-sm font-semibold hover:bg-red-500/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          <Trash2 className="w-4 h-4" />
          Excluir minha conta
        </button>
      ) : (
        <div className="p-5 rounded-xl bg-red-500/8 border border-red-500/30 space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-300 space-y-1">
              <p className="font-black text-red-400">Esta ação é irreversível.</p>
              <p>Serão <strong className="text-white">excluídos permanentemente</strong>: seu perfil, fotos, solicitações, favoritos e assinaturas.</p>
              <p>Serão <strong className="text-white">anonimizadas</strong>: denúncias abertas por você (reporter_id → NULL) e eventos de moderação.</p>
            </div>
          </div>

          {serverError && (
            <div role="alert" className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
            <div>
              <label htmlFor="confirmation" className="block text-sm font-semibold text-slate-300 mb-1.5">
                Digite <span className="text-red-400 font-black">EXCLUIR</span> para confirmar
              </label>
              <input
                id="confirmation"
                type="text"
                autoComplete="off"
                aria-invalid={!!errors.confirmation}
                aria-describedby={errors.confirmation ? 'confirm-error' : undefined}
                className="w-full bg-black/30 border border-red-500/30 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition"
                placeholder="EXCLUIR"
                {...register('confirmation')}
              />
              {errors.confirmation && (
                <p id="confirm-error" role="alert" className="mt-1 text-xs text-red-400">
                  {errors.confirmation.message}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-5 py-2.5 rounded-xl border border-white/20 text-slate-300 text-sm font-semibold hover:bg-white/8 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-black transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Excluindo…</> : 'Confirmar exclusão'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
