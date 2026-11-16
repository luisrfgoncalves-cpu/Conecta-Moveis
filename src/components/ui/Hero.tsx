import Link from 'next/link';
import { ArrowUpRight, Flame, Shield, MapPin, Zap } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative w-full pt-12 pb-20 sm:pt-16 sm:pb-24 md:pt-28 md:pb-36 overflow-hidden">
      
      {/* Luz ambiente de destaque para o Hero */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-orange-600/20 blur-[150px] pointer-events-none rounded-full" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-3 duration-700 ease-out">
          
          {/* Badge LED Tecnológica com Alto Contraste e Tipografia Nítida */}
          <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider bg-orange-500/20 border border-orange-400/60 text-orange-200 shadow-2xl backdrop-blur-xl max-w-full">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-orange-400 animate-pulse shrink-0" />
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-300 shrink-0" />
            <span className="truncate">Jundiaí e Região / SP</span>
          </div>

          {/* Título de Alto Impacto Otimizado para Mobile */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.18] sm:leading-[1.15] text-white drop-shadow-xl break-words">
            Encontre montadores e marceneiros em <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">Jundiaí e região</span>
          </h1>

          {/* Subtítulo persuasivo com escala ampliada para leitura confortável no mobile e sol */}
          <p className="text-base sm:text-xl md:text-2xl text-slate-100 leading-relaxed sm:leading-relaxed font-normal max-w-2xl sm:max-w-3xl drop-shadow-md">
            Catálogo aberto para encontrar <span className="text-white font-bold">montadores autônomos</span> e <span className="text-white font-bold">marceneiros perto de você</span>. Veja fotos de serviços, confira especialidades e fale direto pelo <span className="text-amber-300 font-bold">WhatsApp, sem intermediação nem comissões</span>.
          </p>

          {/* Dois caminhos claros: Procurar e Divulgar meu trabalho (Escala ampliada e toque fácil) */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <Link
              href="/encontrar-profissionais"
              className="w-full sm:w-auto px-7 sm:px-9 py-4 sm:py-4.5 btn-neon text-sm sm:text-base tracking-wide uppercase flex items-center justify-center gap-2.5 shadow-2xl font-black min-h-[48px]"
            >
              <Zap className="w-4 h-4 fill-white shrink-0" />
              <span>Procurar Profissionais</span>
            </Link>

            <Link
              href="/para-profissionais"
              className="w-full sm:w-auto px-7 sm:px-9 py-4 sm:py-4.5 btn-glass text-sm sm:text-base font-bold text-white rounded-xl flex items-center justify-center gap-2.5 hover:text-orange-300 transition shadow-xl min-h-[48px]"
            >
              <span>Divulgar meu trabalho</span>
              <ArrowUpRight className="w-4 h-4 text-orange-400 shrink-0" />
            </Link>
          </div>

          {/* Mini Highlights de Confiança Técnica Otimizados para Alto Contraste */}
          <div className="pt-6 sm:pt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-left w-full max-w-2xl border-t border-white/10 mt-4 sm:mt-6">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-white/15 backdrop-blur-xl shadow-xl">
              <div className="flex items-center gap-2 text-orange-400 text-xs sm:text-sm font-bold">
                <Flame className="w-4 h-4 shrink-0" />
                Negociação Livre
              </div>
              <p className="text-xs sm:text-sm text-slate-100 mt-1.5 leading-snug font-medium">Valores e prazos tratados direto com quem executa.</p>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-white/15 backdrop-blur-xl shadow-xl">
              <div className="flex items-center gap-2 text-sky-400 text-xs sm:text-sm font-bold">
                <Shield className="w-4 h-4 shrink-0" />
                Sem Intermediação
              </div>
              <p className="text-xs sm:text-sm text-slate-100 mt-1.5 leading-snug font-medium">A plataforma não recebe pagamento pelos serviços e não cobra comissão sobre eles.</p>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-white/15 backdrop-blur-xl shadow-xl">
              <div className="flex items-center gap-2 text-emerald-400 text-xs sm:text-sm font-bold">
                <MapPin className="w-4 h-4 shrink-0" />
                Atuação Local
              </div>
              <p className="text-xs sm:text-sm text-slate-100 mt-1.5 leading-snug font-medium">Foco inicial nos bairros e regiões de Jundiaí/SP.</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
