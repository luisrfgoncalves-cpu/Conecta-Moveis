'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, MessageSquare, CornerDownRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { type ReviewItem, replyToReview } from '@/lib/reviews/actions';
import { ReportButton } from '@/components/reports/ReportButton';

interface AvaliacoesManagerProps {
  received: ReviewItem[];
  given: ReviewItem[];
  isProfessional: boolean;
}

export function AvaliacoesManager({ received, given, isProfessional }: AvaliacoesManagerProps) {
  const [activeTab, setActiveTab] = useState<'received' | 'given'>(
    isProfessional ? 'received' : 'given'
  );
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState('');
  const [receivedReviews, setReceivedReviews] = useState<ReviewItem[]>(received);

  async function handleSendReply(reviewId: string) {
    if (!replyText.trim() || replyText.trim().length < 5) {
      setReplyError('A resposta deve ter pelo menos 5 caracteres.');
      return;
    }

    setReplySubmitting(true);
    setReplyError('');

    const res = await replyToReview({
      reviewId,
      replyText: replyText.trim(),
    });

    if (res.success) {
      setReceivedReviews((prev) =>
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

  const list = activeTab === 'received' ? receivedReviews : given;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-400" />
            Avaliações
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestão de feedback e direito de resposta sobre os serviços realizados.
          </p>
        </div>

        {/* Abas */}
        <div className="flex gap-2">
          {isProfessional && (
            <button
              onClick={() => setActiveTab('received')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'received'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              Recebidas ({receivedReviews.length})
            </button>
          )}
          <button
            onClick={() => setActiveTab('given')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'given'
                ? 'bg-orange-500 text-white'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Feitas por mim ({given.length})
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center space-y-3">
          <Star className="w-12 h-12 mx-auto text-slate-600" />
          <p className="text-slate-300 text-sm font-semibold">
            Nenhuma avaliação encontrada nesta categoria.
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === 'received'
              ? 'As avaliações recebidas de clientes após 3 dias da solicitação de contato aparecerão aqui.'
              : 'Você pode avaliar profissionais que contatou há mais de 3 dias visitando o perfil deles.'}
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {list.map((rev) => (
            <li
              key={rev.id}
              className="glass-panel rounded-2xl p-5 border border-white/10 space-y-4"
            >
              {/* Header do card */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      {activeTab === 'received'
                        ? rev.reviewer.full_name
                        : `Para: ${rev.professional?.display_name || 'Profissional'}`}
                    </span>
                    {activeTab === 'given' && rev.professional && (
                      <Link
                        href={`/profissionais/${rev.professional.slug}`}
                        className="text-[11px] text-orange-400 hover:underline"
                      >
                        Ver perfil
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Interação registrada
                    </span>
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
                  {/* Status da moderação */}
                  {rev.status === 'pending' && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1 font-semibold">
                      <Clock className="w-2.5 h-2.5" />
                      Em moderação
                    </span>
                  )}
                  {rev.status === 'rejected' && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-2.5 h-2.5" />
                      Rejeitada
                    </span>
                  )}
                  {activeTab === 'received' && (
                    <ReportButton
                      targetType="review"
                      targetId={rev.id}
                      isLoggedIn={true}
                    />
                  )}
                </div>
              </div>

              {/* Notas por critério */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <span className="text-slate-400 block">Qualidade:</span>
                  <span className="font-bold text-amber-400">{rev.rating_quality}.0</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Pontualidade:</span>
                  <span className="font-bold text-amber-400">{rev.rating_punctuality}.0</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Comunicação:</span>
                  <span className="font-bold text-amber-400">{rev.rating_communication}.0</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Organização:</span>
                  <span className="font-bold text-amber-400">{rev.rating_organization}.0</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Combinado:</span>
                  <span className="font-bold text-amber-400">{rev.rating_overall}.0</span>
                </div>
              </div>

              {/* Comentário */}
              {rev.comment && (
                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {rev.comment}
                </p>
              )}

              {/* Resposta do profissional */}
              {rev.reply_text ? (
                <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/20 space-y-1">
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
              ) : activeTab === 'received' ? (
                /* Direito de resposta na aba recebidas */
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
                          {replySubmitting ? 'Enviando...' : 'Publicar resposta'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyingReviewId(rev.id)}
                      className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1.5"
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

