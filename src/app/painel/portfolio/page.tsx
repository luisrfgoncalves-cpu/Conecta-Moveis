import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { PortfolioManager } from '@/components/portfolio/PortfolioManager';
import { getMyPortfolioData } from '@/lib/portfolio/actions';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Meu Portfólio — Painel Conecta Móveis',
  description: 'Gerencie os projetos e fotos do seu portfólio profissional.',
};

export default async function PainelPortfolioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/entrar?next=/painel/portfolio');
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
          <h1 className="text-3xl font-black text-white">Meu Portfólio</h1>
          <p className="text-sm text-slate-400 mt-1">
            Cadastre projetos com fotos reais dos seus trabalhos. As imagens passam por moderação antes de aparecer publicamente.
          </p>
        </div>
      </div>

      {!profileId ? (
        <div className="glass-card rounded-2xl p-10 text-center border border-orange-500/30 space-y-4">
          <h3 className="text-lg font-bold text-white">
            Complete seu perfil profissional primeiro
          </h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Para adicionar projetos ao portfólio, você precisa criar seu perfil profissional com nome, especialidade e cidade.
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

