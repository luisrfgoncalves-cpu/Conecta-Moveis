import Link from 'next/link';
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { getSystemSettingValue } from '@/lib/config/actions';

export async function ProCtaSection() {
  const launchFreeText =
    (await getSystemSettingValue<string>('launch_free_text')) ||
    'Cadastro gratuito no período de lançamento. Mudanças de planos e preços serão comunicadas com antecedência.';

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl overflow-hidden glass-card p-6 sm:p-14 border border-orange-500/30">
        
        {/* Glow Tridimensional de Fundo */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-gradient-to-bl from-orange-600/25 via-amber-500/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5 sm:space-y-6">
          
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-orange-500/20 border border-orange-500/40 text-orange-200">
            <Sparkles className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span>Para Montadores, Marceneiros e Lojistas</span>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Você trabalha com móveis em Jundiaí e região?
          </h2>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
            Crie sua vitrine profissional digital e receba solicitações de novos clientes diretamente no seu WhatsApp. {launchFreeText}
          </p>

          {/* Vantagens Claras */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-semibold text-slate-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Fotos de apresentação do seu trabalho</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Receba contatos no WhatsApp, sem comissão sobre os serviços</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Divulgação no polo regional de Jundiaí</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Perfil com indicadores automáticos de preenchimento</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link
              href="/criar-conta"
              className="px-8 py-4 btn-neon text-sm uppercase tracking-wider font-extrabold flex items-center justify-center gap-2 shadow-2xl"
            >
              <span>Cadastrar Perfil</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Sem cobrança inicial • Período de lançamento</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

