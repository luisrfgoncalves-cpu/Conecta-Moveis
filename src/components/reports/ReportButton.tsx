'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createReport } from '@/lib/reports/actions';
import { reportSchema, type ReportInput } from '@/lib/reports/schemas';

const REASONS = [
  'Conteúdo falso ou enganoso',
  'Spam ou publicidade indevida',
  'Foto inadequada ou ofensiva',
  'Perfil duplicado',
  'Dados de contato falsos',
  'Comportamento abusivo',
  'Outro',
];

interface ReportButtonProps {
  targetType: ReportInput['targetType'];
  targetId: string;
  isLoggedIn: boolean;
}

export function ReportButton({ targetType, targetId, isLoggedIn }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReportInput>({
    resolver: zodResolver(reportSchema),
    defaultValues: { targetType, targetId, reason: '', description: '', reporterEmail: '' },
  });

  async function onSubmit(data: ReportInput) {
    setServerError('');
    const res = await createReport(data);
    if (res.success) {
      setSubmitted(true);
    } else {
      setServerError(res.error ?? 'Erro ao enviar denúncia.');
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Denunciar"
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-lg px-2 py-1"
      >
        <Flag className="w-3.5 h-3.5" aria-hidden />
        Denunciar
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div className="glass-panel rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-start justify-between">
              <h2 id="report-dialog-title" className="text-base font-bold text-white flex items-center gap-2">
                <Flag className="w-4 h-4 text-red-400" aria-hidden />
                Enviar denúncia
              </h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="text-slate-400 hover:text-white transition-colors text-xl leading-none"
              >
                ×
              </button>
            </div>

            {submitted ? (
              <div className="text-center space-y-3 py-4">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                  <Flag className="w-5 h-5 text-green-400" aria-hidden />
                </div>
                <p className="text-sm font-semibold text-white">Denúncia registrada</p>
                <p className="text-xs text-slate-400">
                  Sua denúncia foi recebida e será analisada pela nossa equipe.<br />
                  Ela não ficará visível para outros usuários.
                </p>
                <button
                  onClick={() => setOpen(false)}
                  className="btn-primary text-sm px-4 py-2 rounded-xl"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
                <input type="hidden" {...register('targetType')} />
                <input type="hidden" {...register('targetId')} />

                {/* Aviso de privacidade */}
                <p className="text-xs text-slate-400 bg-white/5 rounded-xl p-3 border border-white/10">
                  🔒 Sua denúncia é confidencial e nunca ficará visível para outros usuários ou para o denunciado.
                </p>

                <div>
                  <label htmlFor="report-reason" className="block text-xs font-medium text-slate-300 mb-1">
                    Motivo <span aria-hidden>*</span>
                  </label>
                  <select
                    id="report-reason"
                    {...register('reason')}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    aria-describedby={errors.reason ? 'reason-error' : undefined}
                  >
                    <option value="">Selecione um motivo...</option>
                    {REASONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  {errors.reason && (
                    <p id="reason-error" role="alert" className="text-xs text-red-400 mt-1">
                      {errors.reason.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="report-description" className="block text-xs font-medium text-slate-300 mb-1">
                    Descrição <span aria-hidden>*</span>
                  </label>
                  <textarea
                    id="report-description"
                    {...register('description')}
                    rows={3}
                    maxLength={1000}
                    placeholder="Descreva o problema com mais detalhes..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    aria-describedby={errors.description ? 'desc-error' : undefined}
                  />
                  {errors.description && (
                    <p id="desc-error" role="alert" className="text-xs text-red-400 mt-1">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {!isLoggedIn && (
                  <div>
                    <label htmlFor="report-email" className="block text-xs font-medium text-slate-300 mb-1">
                      Seu e-mail para retorno (opcional)
                    </label>
                    <input
                      id="report-email"
                      type="email"
                      {...register('reporterEmail')}
                      placeholder="seu@email.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Usado apenas para eventual retorno sobre sua denúncia.
                    </p>
                  </div>
                )}

                {serverError && (
                  <p role="alert" className="text-xs text-red-400 bg-red-500/10 rounded-lg p-2 border border-red-500/20">
                    {serverError}
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-1 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 btn-primary rounded-xl py-2 text-sm font-medium disabled:opacity-50"
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar denúncia'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

