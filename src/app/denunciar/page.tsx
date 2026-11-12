import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function DenunciarPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      <div className="space-y-3">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400 hover:text-orange-300 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Início
        </Link>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Canal de Denúncias e Moderação
        </h1>
        <p className="text-sm text-slate-200">
          Comunique imediatamente infrações às regras da plataforma, perfis fraudulentos, fotos plagiadas ou condutas inadequadas.
        </p>
      </div>

      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center gap-3 text-orange-400">
          <ShieldAlert className="w-6 h-6 shrink-0" />
          <h2 className="text-lg font-bold text-white">Procedimento de Análise</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
          Toda denúncia é enviada diretamente para a fila de moderação administrativa, garantindo sigilo total ao denunciante e direito de resposta ao denunciado quando cabível.
        </p>
        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>O formulário interativo de envio será conectado ao banco de dados na Fase 8.</span>
        </div>
      </div>
    </div>
  );
}
