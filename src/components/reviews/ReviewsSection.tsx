'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Star, MessageSquare, CornerDownRight, CheckCircle2 } from 'lucide-react';
import { type ReviewItem, type ReviewStats, replyToReview } from '@/lib/reviews/actions';
import { ReportButton } from '@/components/reports/ReportButton';
import { ReviewForm } from './ReviewForm';

interface ReviewsSectionProps {
  profileId: string;
  professionalName: string;
  initialReviews: ReviewItem[];
  initialStats: ReviewStats;
  isLoggedIn: boolean;
  eligible: boolean;
  contactRequestId?: string;
  eligibilityReason?: string;
  isOwner?: boolean;
}

export function ReviewsSection({
  profileId: _profileId,
  professionalName,
  initialReviews,
  initialStats,
  isLoggedIn,
  eligible,
  contactRequestId,
  eligibilityReason,
  isOwner,
}: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [stats] = useState<ReviewStats>(initialStats);
  const [showForm, setShowForm] = useState(false);
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState('');

  async function handleSendReply(reviewId: string) {
    if (!replyText.trim() || replyText.trim().length < 5) {
      setReplyError('A resposta deve ter ao menos 5 caracteres.');
      return;
    }

    setReplySubmitting(true);
    setReplyError('');

    const res = await replyToReview({
      reviewId,
      replyText: replyText.trim(),
    });

    if (res.success) {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, reply_text: replyText.trim(), reply_at: new Date().toISOString() }
            : r
        )
      );
      setReplyingReviewId(null);
      setReplyText('');
    } else {
      setReplyError(res.error || 'Erro ao enviar resposta.');
    }
    setReplySubmitting(false);
  }

  return (
    <div className="space-y-6 pt-2 border-t border-white/10">
      {/* Cabeçalho de Avaliações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            Avaliações e Reputação
          </h2>
          {stats.totalCount > 0 ? (
            <p className="text-xs text-slate-400 mt-1">
              Avaliações de usuários com interação registrada no Conecta Móveis.
            </p>
          ) : (
            <p className="text-xs text-slate-400 mt-1">Sem avaliações ainda.</p>
          )}
          <p className="text-[11px] text-slate-500 mt-1 italic">
            Opinião do usuário. A Conecta Móveis não verifica nem endossa avaliações; a publicação segue regras públicas.
          </p>
        </div>

        {/* Botão de avaliar se for elegível */}
        {!isOwner && (
          <div>
            {eligible && contactRequestId && !showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-2"
              >
                <Star className="w-3.5 h-3.5" />
                Avaliar Profissional
              </button>
            )}
            {!eligible && eligibilityReason && (
              <span className="text-[11px] text-slate-400 italic">
                {eligibilityReason}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Formulário de avaliação aberto */}
      {showForm && contactRequestId && (
        <div className="glass-panel rounded-2xl p-6 border border-orange-500/30">
          <ReviewForm
            contactRequestId={contactRequestId}
            professionalName={professionalName}
            onSuccess={() => {
              // Ocultar formulário após envio
              setTimeout(() => setShowForm(false), 3000);
            }}
          />
        </div>
      )}

      {/* Placar de Notas e Médias (Só aparece com ao menos uma avaliação publicada) */}
      {stats.totalCount > 0 ? (
        <div className="glass-panel rounded-2xl p-6 border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Média Geral */}
          <div className="text-center md:border-r border-white/10 md:pr-6">
            <div className="text-4xl font-black text-amber-400 tracking-tight">
              {stats.averageOverall.toFixed(1)}
            </div>
            <div className="flex justify-center gap-1 my-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= Math.round(stats.averageOverall)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-600'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-slate-400">
              {stats.totalCount} {stats.totalCount === 1 ? 'avaliação' : 'avaliações'}
            </p>
          </div>

          {/* Critérios Detalhados */}
          <div className="md:col-span-2 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>Qualidade do Trabalho</span>
              <span className="font-bold text-amber-400">{stats.criteriaAverages.quality.toFixed(1)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Pontualidade</span>
              <span className="font-bold text-amber-400">{stats.criteriaAverages.punctuality.toFixed(1)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Comunicação</span>
              <span className="font-bold text-amber-400">{stats.criteriaAverages.communication.toFixed(1)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Organização e Limpeza</span>
              <span className="font-bold text-amber-400">{stats.criteriaAverages.organization.toFixed(1)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Cumprimento do Combinado</span>
              <span className="font-bold text-amber-400">{stats.criteriaAverages.commitment.toFixed(1)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
          <p className="text-sm font-semibold text-slate-300">Sem avaliações ainda</p>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            As avaliações no Conecta Móveis exigem solicitação prévia de contato para garantir que refletem interações reais.
          </p>
        </div>
      )}

      {/* Lista de Avaliações */}
      {reviews.length > 0 && (
        <ul className="space-y-4">
          {reviews.map((rev) => (
            <li
              key={rev.id}
              className="glass-panel rounded-2xl p-5 border border-white/10 space-y-3"
            >
              {/* Cabeçalho da avaliação */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center font-bold text-xs text-slate-300">
                    {rev.reviewer.avatar_url ? (
                      <Image
                        src={rev.reviewer.avatar_url}
                        alt=""
                        width={36}
                        height={36}
                        className="object-cover"
                      />
                    ) : (
                      rev.reviewer.full_name?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-white">{rev.reviewer.full_name}</p>
                      {/* Rótulo Obrigatório: Interação registrada */}
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Interação registrada
                      </span>
                    </div>
                    <time dateTime={rev.created_at} className="text-[10px] text-slate-500">
                      {new Date(rev.created_at).toLocaleDateString('pt-BR')}
                    </time>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-black">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {rev.average_rating.toFixed(1)}
                  </div>
                  <ReportButton
                    targetType="review"
                    targetId={rev.id}
                    isLoggedIn={isLoggedIn}
                  />
                </div>
              </div>

              {/* Comentário */}
              {rev.comment && (
                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {rev.comment}
                </p>
              )}

              {/* Resposta do Profissional */}
              {rev.reply_text ? (
                <div className="mt-3 p-3.5 rounded-xl bg-orange-500/5 border border-orange-500/20 space-y-1">
                  <p className="text-[11px] font-bold text-orange-400 flex items-center gap-1.5">
                    <CornerDownRight className="w-3.5 h-3.5" />
                    Resposta do profissional
                    {rev.reply_at && (
                      <span className="text-slate-500 font-normal">
                        • {new Date(rev.reply_at).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {rev.reply_text}
                  </p>
                </div>
              ) : isOwner ? (
                /* Dono do perfil pode responder */
                <div className="pt-1">
                  {replyingReviewId === rev.id ? (
                    <div className="space-y-2 p-3 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs font-semibold text-slate-300">
                        Direito de resposta (única manifestação)
                      </p>
                      <textarea
                        rows={2}
                        maxLength={1000}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Escreva sua resposta para o cliente..."
                        className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                      />
                      {replyError && (
                        <p className="text-[11px] text-red-400">{replyError}</p>
                      )}
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingReviewId(null);
                            setReplyText('');
                          }}
                          className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          disabled={replySubmitting}
                          onClick={() => handleSendReply(rev.id)}
                          className="btn-primary px-3 py-1 text-xs rounded-lg font-bold disabled:opacity-50"
                        >
                          {replySubmitting ? 'Enviando...' : 'Responder'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyingReviewId(rev.id)}
                      className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Responder avaliação
                    </button>
                  )}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

