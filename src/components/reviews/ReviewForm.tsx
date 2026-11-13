/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { Star, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reviewSchema, type ReviewInput } from '@/lib/reviews/schemas';
import { createReview } from '@/lib/reviews/actions';

interface ReviewFormProps {
  contactRequestId: string;
  professionalName: string;
  onSuccess?: () => void;
}

const CRITERIA = [
  { key: 'ratingQuality', label: 'Qualidade do Trabalho', desc: 'Acabamento, alinhamento e precisão' },
  { key: 'ratingPunctuality', label: 'Pontualidade', desc: 'Cumprimento de prazos e horários acertados' },
  { key: 'ratingCommunication', label: 'Comunicação', desc: 'Clareza, presteza e transparência no atendimento' },
  { key: 'ratingOrganization', label: 'Organização e Limpeza', desc: 'Cuidado com o ambiente e ferramentas' },
  { key: 'ratingCommitment', label: 'Cumprimento do Combinado', desc: 'Conformidade com o que foi acordado inicialmente' },
] as const;

export function ReviewForm({ contactRequestId, professionalName, onSuccess }: ReviewFormProps) {
  const [submittedStatus, setSubmittedStatus] = useState<string | null>(null);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      contactRequestId,
      ratingQuality: 5,
      ratingPunctuality: 5,
      ratingCommunication: 5,
      ratingOrganization: 5,
      ratingCommitment: 5,
      comment: '',
    },
  });

  const commentVal = watch('comment') || '';

  async function onSubmit(data: ReviewInput) {
    setServerError('');
    const res = await createReview(data);
    if (res.success) {
      setSubmittedStatus(res.status || 'approved');
      if (onSuccess) onSuccess();
    } else {
      setServerError(res.error || 'Erro ao enviar avaliação.');
    }
  }

  if (submittedStatus === 'pending') {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center space-y-3 border border-amber-500/30 bg-amber-500/5">
        <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-white">Avaliação em Análise</h4>
        <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
          Sua avaliação contém termos que exigem revisão da moderação antes da publicação.
          Ela será processada pela equipe e, se estiver de acordo com as regras, será publicada em breve.
        </p>
      </div>
    );
  }

  if (submittedStatus === 'approved') {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center space-y-3 border border-emerald-500/30 bg-emerald-500/5">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-white">Avaliação Publicada!</h4>
        <p className="text-xs text-slate-300">
          Obrigado por contribuir com a comunidade do Conecta Móveis.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h4 className="text-base font-bold text-white">Avaliar {professionalName}</h4>
        <p className="text-xs text-slate-400 mt-1">
          Atribua notas de 1 a 5 para cada um dos 5 critérios técnicos.
        </p>
      </div>

      <div className="space-y-4">
        {CRITERIA.map((criterion) => {
          const currentVal = watch(criterion.key as any) || 5;
          return (
            <div key={criterion.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-white/5 border border-white/5">
              <div>
                <p className="text-xs font-bold text-slate-200">{criterion.label}</p>
                <p className="text-[11px] text-slate-400">{criterion.desc}</p>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setValue(criterion.key as any, star)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                    aria-label={`${star} estrelas para ${criterion.label}`}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= currentVal ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-amber-400 w-6 text-right ml-1">
                  {currentVal}.0
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <label htmlFor="review-comment" className="block text-xs font-semibold text-slate-300 mb-1">
          Comentário (opcional)
        </label>
        <textarea
          id="review-comment"
          {...register('comment')}
          rows={3}
          maxLength={1000}
          placeholder="Compartilhe como foi a experiência com o serviço..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
        />
        <div className="flex justify-between text-[11px] text-slate-500 mt-1">
          <span>Evite acusações infundadas ou termos ofensivos.</span>
          <span>{commentVal.length}/1000</span>
        </div>
        {errors.comment && (
          <p className="text-xs text-red-400 mt-1">{errors.comment.message}</p>
        )}
      </div>

      {serverError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full btn-primary py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
      >
        {isSubmitting ? 'Enviando avaliação...' : 'Publicar Avaliação'}
      </button>
    </form>
  );
}

