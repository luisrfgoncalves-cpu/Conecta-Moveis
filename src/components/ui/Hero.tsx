import Link from 'next/link';
import { ArrowUpRight, Flame, Shield, MapPin, Zap } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative w-full pt-16 pb-24 md:pt-28 md:pb-36 overflow-hidden">
      
      {/* Luz ambiente de destaque para o Hero */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-orange-600/20 blur-[150px] pointer-events-none rounded-full" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
          
          {/* Badge LED Tecnológica com Alto Contraste */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/20 border border-orange-400/50 text-orange-200 shadow-2xl backdrop-blur-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-pulse" />
            <MapPin className="w-4 h-4 text-orange-300" />
            Polo Regional: Jundiaí e Cidades Vizinhas / SP
          </div>

          {/* Título de Alto Impacto */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] text-white drop-shadow-xl">
            A Rede Direta do Setor <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">Moveleiro</span>
          </h1>

          {/* Subtítulo com Branco Neve e Alto Contraste */}
          <p className="text-base sm:text-lg text-slate-100 leading-relaxed font-medium max-w-2xl drop-shadow-md">
            Catálogo aberto para você localizar montadores autônomos, marceneiros sob medida e marcenarias. Conexão direta, sem taxa de intermediação e sem promessas ilusórias.
          </p>

          {/* Botões com Relevo 3D e Borda Glass */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href="/encontrar-profissionais"
              className="w-full sm:w-auto px-8 py-4 btn-neon text-sm tracking-wide uppercase flex items-center justify-center gap-2 shadow-2xl font-black"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Ver Perfis Disponíveis</span>
            </Link>

            <Link
              href="/como-funciona"
              className="w-full sm:w-auto px-8 py-4 btn-glass text-sm font-bold text-white rounded-xl flex items-center justify-center gap-2 hover:text-orange-300 transition shadow-xl"
            >
              <span>Regras e Transparência</span>
              <ArrowUpRight className="w-4 h-4 text-orange-400" />
            </Link>
          </div>

          {/* Mini Highlights de Confiança Técnica com Textos Nítidos */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 text-left w-full max-w-2xl border-t border-white/10 mt-6">
            <div className="p-4 rounded-2xl bg-slate-900/85 border border-white/10 backdrop-blur-xl shadow-xl">
              <div className="flex items-center gap-2 text-orange-400 text-xs font-bold">
                <Flame className="w-4 h-4" />
                Negociação Livre
              </div>
              <p className="text-xs text-slate-200 mt-1.5 leading-snug">Valores e prazos tratados direto com quem executa.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/85 border border-white/10 backdrop-blur-xl shadow-xl">
              <div className="flex items-center gap-2 text-sky-400 text-xs font-bold">
                <Shield className="w-4 h-4" />
                Sem Intermediação
              </div>
              <p className="text-xs text-slate-200 mt-1.5 leading-snug">A plataforma não retém dinheiro nem cobra taxa de serviço.</p>
            </div>
            <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-slate-900/85 border border-white/10 backdrop-blur-xl shadow-xl">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <MapPin className="w-4 h-4" />
                Atuação Local
              </div>
              <p className="text-xs text-slate-200 mt-1.5 leading-snug">Foco inicial nos bairros e regiões de Jundiaí/SP.</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
