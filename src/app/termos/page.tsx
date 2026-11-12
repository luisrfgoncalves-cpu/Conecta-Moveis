import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function TermosPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      <div className="space-y-3">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400 hover:text-orange-300 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Início
        </Link>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Termos de Uso e Condições Gerais
        </h1>
        <p className="text-xs text-orange-400 font-semibold uppercase tracking-wider">
          Versão preliminar de desenvolvimento
        </p>
      </div>

      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 text-sm text-slate-200 leading-relaxed font-normal">
        <div>
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-orange-400" />
            1. Natureza dos Serviços da Plataforma
          </h2>
          <p>
            O Conecta Móveis é uma plataforma digital cujo único propósito é facilitar o encontro e a comunicação entre consumidores e prestadores autônomos ou empresas do setor moveleiro. A plataforma não participa, direta ou indiretamente, da prestação dos serviços contratados.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-orange-400" />
            2. Isenção de Responsabilidade
          </h2>
          <p>
            A plataforma não afere idoneidade prévia, não emite orçamentos e não retém valores. Toda negociação referente a preços, prazos, formas de pagamento e garantias contratuais é de exclusiva responsabilidade dos envolvidos.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-orange-400" />
            3. Veracidade dos Perfis e Portfólios
          </h2>
          <p>
            Cada anunciante responde legalmente pela veracidade das informações, qualificações e fotos que submeter ao catálogo. Conteúdos falsos, ofensivos ou que violem direitos autorais serão removidos imediatamente após notificação ou denúncia.
          </p>
        </div>
      </div>
    </div>
  );
}
