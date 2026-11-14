import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { PortfolioManager } from '@/components/portfolio/PortfolioManager';
import { getMyPortfolioData } from '@/lib/portfolio/actions';
import Link from 'next/link';
import { ArrowLeft, Camera, ShieldCheck } from 'lucide-react';
import { Alert } from '@/components/ui/Feedback';

export const metadata: Metadata = {
  title: 'Fotos de Apresentação — Painel Conecta Móveis',
  description: 'Gerencie as fotos de apresentação do seu perfil profissional.',
};

export default async function PainelFotosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/entrar?next=/painel/fotos');
  }

  const { profileId, items, storage } = await getMyPortfolioData();

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Link
            href="/painel"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400 hover:text-orange-300 transition mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Painel
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
              <Camera className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Fotos de Apresentação</h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Fotos reais de trabalhos realizados para o seu perfil e vitrine.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Alert type="info">
        <div className="flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-white block font-semibold mb-0.5">Orientações de Privacidade e Direitos Autorais:</strong>
            Envie fotos de trabalhos realizados por você ou imagens ilustrativas declaradas.
            Para proteger a privacidade de terceiros, evite fotografar placas de veículos, números de residências e rostos de clientes sem autorização prévia.
          </div>
        </div>
      </Alert>

      {!profileId ? (
        <div className="glass-card rounded-2xl p-10 text-center border border-orange-500/30 space-y-4">
          <h3 className="text-lg font-bold text-white">
            Complete seu perfil profissional primeiro
          </h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Para adicionar fotos de apresentação, você precisa criar seu perfil profissional com nome, especialidade e cidade.
          </p>
          <Link
            href="/painel/perfil"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition"
          >
            Criar Meu Perfil Profissional
          </Link>
        </div>
      ) : (
        <PortfolioManager initialItems={items} storage={storage} />
      )}
    </div>
  );
}
