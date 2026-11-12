import Link from 'next/link';
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

export function ProCtaSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl overflow-hidden glass-card p-8 sm:p-14 border border-orange-500/30">
        
        {/* Glow Tridimensional de Fundo */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-gradient-to-bl from-orange-600/25 via-amber-500/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-orange-500/20 border border-orange-500/40 text-orange-200">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            Para Montadores, Marceneiros e Lojistas
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Você trabalha com móveis em Jundiaí e região?
          </h2>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
            Crie sua vitrine profissional digital e receba solicitações de novos clientes diretamente no seu WhatsApp. Não cobramos comissão, nem mensalidade oculta no lançamento.
          </p>

          {/* Vantagens Claras */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-semibold text-slate-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Portfólio com fotos em alta resolução</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Receba contatos no WhatsApp sem taxa</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Divulgação no polo regional de Jundiaí</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Selo de perfil ativo e avaliações reais</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link
              href="/criar-conta"
              className="px-8 py-4 btn-neon text-sm uppercase tracking-wider font-extrabold flex items-center justify-center gap-2 shadow-2xl"
            >
              <span>Cadastrar Meu Perfil Grátis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Sem fidelidade • Sem cartão de crédito</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

