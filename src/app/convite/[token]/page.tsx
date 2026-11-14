import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { validateInviteToken } from '@/lib/invites/actions';
import { InviteRedeemClient } from './InviteRedeemClient';
import { AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Resgate de Convite — Conecta Móveis',
  robots: {
    index: false,
    follow: false,
  },
};

interface InvitePageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const validation = await validateInviteToken(token);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <Link href="/" className="mb-8 block" aria-label="Voltar para a página inicial">
        <Image
          src="/brand/logo-conecta-moveis.png"
          alt="Conecta Móveis"
          width={180}
          height={48}
          className="h-10 w-auto"
          priority
        />
      </Link>

      {!validation.valid || !validation.invite ? (
        <div className="glass-panel max-w-md mx-auto p-8 rounded-2xl border border-red-500/30 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Convite Indisponível</h1>
          <p className="text-slate-300 text-sm mb-6 leading-relaxed">
            {validation.error || 'O código de convite informado não é válido, expirou ou já atingiu o limite de utilizações.'}
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-2.5 rounded-xl border border-white/20 text-slate-300 text-sm hover:bg-white/5 transition"
          >
            Voltar para o Início
          </Link>
        </div>
      ) : (
        <InviteRedeemClient
          token={token}
          isLoggedIn={!!user}
          userEmail={user?.email}
          invite={validation.invite}
        />
      )}
    </main>
  );
}

