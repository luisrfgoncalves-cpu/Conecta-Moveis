'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { redeemInviteLink } from '@/lib/invites/actions';
import { Ticket, Sparkles, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

interface InviteRedeemClientProps {
  token: string;
  isLoggedIn: boolean;
  userEmail?: string;
  invite: {
    id: string;
    type: string;
    plan_code: string;
    trial_days: number;
    campaign_label: string | null;
  };
}

export function InviteRedeemClient({
  token,
  isLoggedIn,
  userEmail,
  invite,
}: InviteRedeemClientProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [redeemed, setRedeemed] = useState(false);

  const planName =
    invite.plan_code === 'pro'
      ? 'Plano Profissional'
      : invite.plan_code === 'premium'
      ? 'Plano Premium'
      : 'Plano Gratuito';

  function handleRedeem() {
    setError(null);
    startTransition(async () => {
      const result = await redeemInviteLink(token);
      if (result.success) {
        setRedeemed(true);
      } else {
        setError(result.error || 'Não foi possível resgatar este convite.');
      }
    });
  }

  if (redeemed) {
    return (
      <div className="glass-panel max-w-lg mx-auto p-8 rounded-2xl border border-emerald-500/30 text-center">
        <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Convite Resgatado com Sucesso!</h2>
        <p className="text-slate-300 text-sm mb-6 leading-relaxed">
          O benefício do <strong>{planName}</strong> com{' '}
          <strong>{invite.trial_days > 0 ? `${invite.trial_days} dias de degustação` : 'acesso contínuo'}</strong> foi
          aplicado à sua conta.
        </p>
        <Link
          href="/painel"
          className="btn-neon inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold"
        >
          Acessar Meu Painel
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-panel max-w-lg mx-auto p-8 rounded-2xl border border-white/10 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
          <Ticket className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-orange-400 font-semibold">
            Convite Especial
          </span>
          <h1 className="text-xl font-bold text-white">Ativação de Convite</h1>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Plano Concedido:</span>
          <span className="font-semibold text-white">{planName}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Período de Degustação:</span>
          <span className="font-semibold text-orange-400">
            {invite.trial_days > 0 ? `${invite.trial_days} dias sem custo` : 'Padrão'}
          </span>
        </div>
        {invite.campaign_label && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Campanha:</span>
            <span className="font-medium text-slate-300">{invite.campaign_label}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {isLoggedIn ? (
        <div className="space-y-4">
          <p className="text-xs text-slate-400 text-center">
            Conectado como <strong className="text-white">{userEmail}</strong>
          </p>
          <button
            onClick={handleRedeem}
            disabled={isPending}
            className="btn-neon w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Resgatando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Ativar Meu Plano de Degustação
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-slate-400 text-center mb-4">
            Para ativar este convite, crie sua conta ou faça login.
          </p>
          <Link
            href={`/criar-conta?convite=${token}`}
            className="btn-neon w-full py-3 text-sm font-semibold text-center block"
          >
            Criar Conta e Ativar Convite
          </Link>
          <Link
            href={`/entrar?redirectTo=/convite/${token}`}
            className="w-full py-3 text-sm font-medium text-center block rounded-xl border border-white/20 text-slate-300 hover:bg-white/5 transition"
          >
            Já tenho conta (Fazer Login)
          </Link>
        </div>
      )}

      <p className="mt-6 text-center text-xs text-slate-500 leading-relaxed">
        Regra de transparência: convites e degustações concedem limites técnicos de publicação e não
        influenciam avaliações de clientes nem critérios de moderação editorial.
      </p>
    </div>
  );
}
